<?php
require __DIR__.'/../src/YouTubePlaylists.php';
function check($condition, $label) { if (!$condition) throw new RuntimeException($label); }
$dir = sys_get_temp_dir().'/msp-playlists-'.bin2hex(random_bytes(6)); mkdir($dir); $file=$dir.'/playlists.json';
$headers=['x-msp-playlists'=>'1','content-type'=>'application/json','origin'=>'http://localhost:8088','host'=>'localhost:8088'];
$item=['url'=>'https://www.youtube.com/watch?v=M7lc1UVf-VE&list=PLBCF2DAC6FFB574DE','title'=>'YouTube documentation fixture','source'=>'Test fixture, not a catalog seed','category'=>'Anime','enabled'=>true];
try {
    check(msp_playlist_api($file,'GET',[], '')[1]===['revision'=>0,'playlists'=>[]], 'empty');
    [$code,$data]=msp_playlist_api($file,'POST',$headers,json_encode(['revision'=>0,'playlists'=>[$item]]));
    check($code===200 && $data['playlists'][0]['url']==='https://www.youtube.com/playlist?list=PLBCF2DAC6FFB574DE', 'normalization');
    check(json_decode(file_get_contents($file),true)===$data, 'disk persistence');
    check(msp_playlist_api($file,'POST',$headers,json_encode(['revision'=>0,'playlists'=>[]]))[0]===409,'stale write');
    check(msp_playlist_api($file,'POST',array_merge($headers,['origin'=>'https://attacker.example']), '{}')[0]===403,'cross origin');
    check(msp_playlist_api($file,'POST',[], '{}')[0]===403,'form write');
    foreach (['https://youtube.com.evil.test/playlist?list=PLBCF2DAC6FFB574DE','javascript:alert(1)','https://user@youtube.com/playlist?list=PLBCF2DAC6FFB574DE','https://www.youtube.com:8443/playlist?list=PLBCF2DAC6FFB574DE','https://youtube.com/playlist?list=short','https://youtube.com/playlist?list=PLBCF2DAC6FFB574DE&list=PLBCF2DAC6FFB574DE','https://youtube.com/playlist?list=%3Cscript%3E1234567','https://youtube.com/embed/videoseries?list=PLBCF2DAC6FFB574DE'] as $bad) {
        $invalid=$item; $invalid['url']=$bad;
        check(msp_playlist_api($file,'POST',$headers,json_encode(['revision'=>1,'playlists'=>[$invalid]]))[0]===400,'invalid URL '.$bad);
    }
    $invalid=$item;$invalid['title']='<img src=x onerror=alert(1)>';
    check(msp_playlist_api($file,'POST',$headers,json_encode(['revision'=>1,'playlists'=>[$invalid]]))[0]===400,'XSS text');
    check(msp_playlist_api($file,'POST',$headers,json_encode(['revision'=>1,'playlists'=>[$item,$item]]))[0]===400,'duplicates');
    $item['enabled']=false;$item['category']='Donghua';$item['title']='Edited';
    check(msp_playlist_api($file,'POST',$headers,json_encode(['revision'=>1,'playlists'=>[$item]]))[0]===200,'edit disable');
    check(msp_playlist_api($file,'GET',[], '')[1]['playlists'][0]['enabled']===false,'disabled persisted');
    check(msp_playlist_api($file,'POST',$headers,json_encode(['revision'=>2,'playlists'=>[]]))[1]['playlists']===[],'remove');
    check(msp_playlist_api($file,'DELETE',[], '')[0]===405,'method');
    check(msp_playlist_api($file,'POST',$headers,str_repeat('x',131073))[0]===413,'size');
    echo "PASS playlist normalization, URL/XSS validation, CRUD, disk storage, revision conflicts and cross-origin protection\n";
} finally { foreach (glob($dir.'/*') as $f) unlink($f); rmdir($dir); }
