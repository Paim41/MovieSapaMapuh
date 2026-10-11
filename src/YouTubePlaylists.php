<?php
declare(strict_types=1);

/** Local configuration only. Never contacts YouTube or fetches media. */
function msp_playlist_normalize(array $items): array {
    if (count($items) > 100 || !array_is_list($items)) throw new InvalidArgumentException('Use at most 100 playlists.');
    $result = []; $seen = [];
    foreach ($items as $item) {
        if (!is_array($item)) throw new InvalidArgumentException('Invalid playlist.');
        $url = $item['url'] ?? '';
        if (!is_string($url) || strlen($url) > 2048 || preg_match('/[\x00-\x20\\\\]/', $url)) throw new InvalidArgumentException('Invalid YouTube URL.');
        $u = parse_url($url);
        if (!$u || !in_array(strtolower($u['scheme'] ?? ''), ['https','http'], true) ||
            !in_array(strtolower($u['host'] ?? ''), ['youtube.com','www.youtube.com','m.youtube.com','music.youtube.com','youtu.be'], true) ||
            isset($u['user']) || isset($u['pass']) || isset($u['port']) ||
            !preg_match(strtolower($u['host'] ?? '') === 'youtu.be' ? '~^/[A-Za-z0-9_-]{11}/?$~' : '~^/(?:playlist|watch)/?$~', $u['path'] ?? '')) throw new InvalidArgumentException('Use a standard YouTube playlist or watch URL.');
        $ids = [];
        foreach (explode('&', $u['query'] ?? '') as $pair) {
            $parts = explode('=', $pair, 2);
            if (urldecode($parts[0]) === 'list') $ids[] = urldecode($parts[1] ?? '');
        }
        if (count($ids) !== 1 || !preg_match('/^[A-Za-z0-9_-]{10,100}$/D', $ids[0])) throw new InvalidArgumentException('Invalid playlist ID.');
        $id = $ids[0];
        if (isset($seen[$id])) throw new InvalidArgumentException('This playlist is already saved.');
        $seen[$id] = true;
        $text = function ($value, int $max, bool $required): string {
            if (!is_string($value) || !preg_match('//u', $value)) throw new InvalidArgumentException('Invalid text.');
            $value = trim($value);
            if (($required && $value === '') || strlen($value) > $max || preg_match('/[\x00-\x1f\x7f<>]/', $value)) throw new InvalidArgumentException('Use plain text within the field limits.');
            return $value;
        };
        $category = $item['category'] ?? '';
        if (!in_array($category, ['Anime','Donghua'], true) || !is_bool($item['enabled'] ?? null)) throw new InvalidArgumentException('Invalid category or enabled state.');
        $result[] = ['id'=>$id, 'url'=>'https://www.youtube.com/playlist?list='.$id,
            'title'=>$text($item['title'] ?? '', 240, true), 'category'=>$category,
            'source'=>$text($item['source'] ?? '', 240, false), 'enabled'=>$item['enabled']];
    }
    return $result;
}

function msp_playlist_api(string $file, string $method, array $headers, string $body): array {
    if (!in_array($method, ['GET','POST'], true)) return [405, ['error'=>'Method not allowed.']];
    // A custom header + JSON prevent cross-site form writes even on LAN auth bypass.
    if ($method === 'POST' && (($headers['x-msp-playlists'] ?? '') !== '1' || !str_starts_with(strtolower($headers['content-type'] ?? ''), 'application/json'))) return [403, ['error'=>'Same-origin JSON request required.']];
    if ($method === 'POST' && isset($headers['origin']) && (!in_array(parse_url($headers['origin'], PHP_URL_SCHEME), ['http','https'], true) || strtolower(preg_replace('~^https?://~', '', $headers['origin'])) !== strtolower($headers['host'] ?? ''))) return [403, ['error'=>'Cross-origin writes are not allowed.']];
    if (strlen($body) > 131072) return [413, ['error'=>'Configuration too large.']];
    $lock = fopen($file.'.lock', 'c');
    if (!$lock || !flock($lock, LOCK_EX)) throw new RuntimeException('Playlist storage unavailable.');
    try {
        $current = is_file($file) ? json_decode(file_get_contents($file), true, 512, JSON_THROW_ON_ERROR) : ['revision'=>0,'playlists'=>[]];
        if ($method === 'POST') {
            try {
                $input = json_decode($body, true, 512, JSON_THROW_ON_ERROR);
                if (!is_array($input) || !isset($input['playlists']) || !is_array($input['playlists'])) throw new InvalidArgumentException('Invalid configuration.');
                if (($input['revision'] ?? null) !== $current['revision']) return [409,['error'=>'Playlists changed elsewhere. Reload before saving.']];
                $next = ['revision'=>$current['revision']+1,'playlists'=>msp_playlist_normalize($input['playlists'])];
            } catch (JsonException | InvalidArgumentException $e) { return [400,['error'=>$e->getMessage()]]; }
            $tmp = tempnam(dirname($file), 'playlists-');
            try {
                if (file_put_contents($tmp, json_encode($next, JSON_THROW_ON_ERROR), LOCK_EX) === false || !rename($tmp, $file)) throw new RuntimeException('Unable to save playlists.');
            } finally { if (is_file($tmp)) unlink($tmp); }
            $current = $next;
        }
        return [200, $current];
    } finally { flock($lock, LOCK_UN); fclose($lock); }
}
