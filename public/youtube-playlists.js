/* Independent local playlist configuration and official YouTube embeds. No media extraction. */
(function () {
  'use strict';
  let config = null, loading = false, category = 'All', editing = null, saving = false;
  let player = null, dialog = null, generation = 0, apiPromise = null, returnFocus = null;
  const $ = s => document.querySelector(s);
  const icon = '<svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="4" width="20" height="16" rx="4"/><path d="m10 8 6 4-6 4Z"/></svg>';
  function el(tag, text, cls) { const n = document.createElement(tag); if (text) n.textContent = text; if (cls) n.className = cls; return n; }
  function button(text, action) { const b = el('button', text); b.type = 'button'; b.onclick = action; return b; }
  function normalize(raw) {
    if (raw.length > 2048 || /[\x00-\x20\\]/.test(raw)) throw Error('Enter a standard YouTube playlist URL.');
    const u = new URL(raw), ids = u.searchParams.getAll('list');
    if (!['http:', 'https:'].includes(u.protocol) || !['youtube.com','www.youtube.com','m.youtube.com','music.youtube.com','youtu.be'].includes(u.hostname) || u.username || u.password || u.port || !(u.hostname === 'youtu.be' ? /^\/[A-Za-z0-9_-]{11}\/?$/ : /^\/(?:playlist|watch)\/?$/).test(u.pathname) || ids.length !== 1 || !/^[A-Za-z0-9_-]{10,100}$/.test(ids[0])) throw Error('Use a YouTube playlist or watch URL with one valid list parameter.');
    return 'https://www.youtube.com/playlist?list=' + ids[0];
  }
  async function request(body) {
    const headers = { 'X-MSP-Playlists': '1' };
    try { const token = localStorage.getItem('pm.auth'); if (token) headers['X-Auth-Token'] = token; } catch (_) {}
    if (body) headers['Content-Type'] = 'application/json';
    const r = await fetch('/api/youtube-playlists', {method:body ? 'POST' : 'GET', headers, credentials:'same-origin', cache:'no-store', ...(body ? {body:JSON.stringify(body)} : {})});
    const data = await r.json(); if (!r.ok) throw Error(data.error || 'Unable to load playlists. Sign in and retry.');
    return data;
  }
  function status(text) { const n = $('#yt-playlist-status'); if (n) n.textContent = text; }
  async function load() {
    if (loading) return; loading = true;
    try { config = await request(); render(); status(''); }
    catch (e) { status(e.message); const n = $('#yt-home-list'); if (n) { n.replaceChildren(el('p', e.message)); n.append(button('Retry', load)); } }
    finally { loading = false; }
  }
  async function save(items) {
    if (saving || !config) return false; saving = true;
    try { config = await request({revision:config.revision, playlists:items}); render(); status('Playlists saved.'); return true; }
    catch (e) { status(e.message); return false; }
    finally { saving = false; }
  }
  function openSettings() { if (window.showSettingsGate) window.showSettingsGate(); else location.hash = '#settings'; const d = $('#yt-playlist-manager'); d.open = true; d.scrollIntoView({block:'start'}); }
  function render() {
    const list = $('#yt-home-list');
    if (list && config) {
      list.replaceChildren(); const enabled = config.playlists.filter(p => p.enabled && (category === 'All' || p.category === category));
      enabled.forEach(p => {
        const card = el('article', '', 'yt-card');
        const label = el('span', '', 'yt-indicator'); label.innerHTML = icon; label.append(document.createTextNode('YouTube'));
        card.append(label, el('h3', p.title), el('p', p.category + (p.source ? ' • ' + p.source : '')), button('Watch', () => watch(p))); list.append(card);
      });
      if (!enabled.length) { const empty = el('div', '', 'yt-empty'); empty.append(el('p', config.playlists.length ? 'No enabled playlists in this category.' : 'Add your first Anime or Donghua playlist.'), button('Open playlist settings', openSettings)); list.append(empty); }
    }
    const saved = $('#yt-saved');
    if (saved && config) {
      saved.replaceChildren();
      config.playlists.forEach((p, index) => {
        const row = el('article', '', 'yt-card'); row.append(el('h3', p.title), el('p', p.category + (p.source ? ' • ' + p.source : '')));
        const label = el('label'), check = document.createElement('input'); check.type = 'checkbox'; check.checked = p.enabled; check.setAttribute('aria-label', 'Enable ' + p.title);
        check.onchange = async () => { check.disabled = true; const next = config.playlists.map((x,i) => i === index ? {...x,enabled:check.checked} : x); if (!await save(next)) {check.checked = p.enabled; check.disabled = false;} };
        label.append(check, document.createTextNode('Enabled'));
        row.append(label, button('Edit', () => { editing = p.id; const f = $('#yt-playlist-form'); f.elements.url.value = p.url; f.elements.title.value = p.title; f.elements.category.value = p.category; f.elements.source.value = p.source; $('#yt-save').textContent = 'Save changes'; f.elements.title.focus(); }), button('Remove', async () => { if (confirm('Remove “' + p.title + '” from your saved playlists?')) { if(await save(config.playlists.filter(x => x.id !== p.id))) reset(); } })); saved.append(row);
      });
      if (!config.playlists.length) saved.append(el('p','No playlists saved yet.'));
    }
  }
  function reset() { editing = null; $('#yt-playlist-form').reset(); $('#yt-save').textContent = 'Save playlist'; }
  function manager() {
    const parent = $('#settingsGate > .settings-gate__card'); if (!parent || $('#yt-playlist-manager')) return;
    const d = el('details', '', 'yt-playlists'); d.id = 'yt-playlist-manager';
    d.innerHTML = '<summary>Anime &amp; Donghua Playlists</summary><p>Save playlist links from official sources you trust. YouTube controls availability and playback; titles and channels are entered by you.</p><form id="yt-playlist-form"><label>Playlist title<input name="title" maxlength="80" required autocomplete="off"></label><label>YouTube playlist URL<input name="url" type="url" maxlength="2048" required placeholder="https://www.youtube.com/playlist?list=…"></label><label>Category<select name="category"><option>Anime</option><option>Donghua</option></select></label><label>Source / channel (optional)<input name="source" maxlength="80"></label><div class="yt-actions"><button id="yt-save" type="submit">Save playlist</button><button id="yt-cancel" type="button">Cancel edit</button><button id="yt-reload" type="button">Reload playlists</button></div></form><p id="yt-playlist-status" role="status" aria-live="polite"></p><div id="yt-saved" class="yt-grid"></div>';
    parent.insertBefore(d, parent.querySelector('.developer-credits')); d.addEventListener('toggle', () => { if (d.open) load(); });
    $('#yt-cancel').onclick = reset; $('#yt-reload').onclick = load;
    $('#yt-playlist-form').onsubmit = async e => {
      e.preventDefault(); if (!config) { status('Load playlists before saving.'); return; }
      try {
        const f = e.target.elements, url = normalize(f.url.value.trim()), id = new URL(url).searchParams.get('list');
        const previous = config.playlists.find(p => p.id === editing);
        const item = {url, title:f.title.value.trim(), category:f.category.value, source:f.source.value.trim(), enabled:previous ? previous.enabled : true};
        if (config.playlists.some(p => p.id === id && p.id !== editing)) throw Error('This playlist is already saved.');
        const next = config.playlists.slice(); if (previous) next[next.indexOf(previous)] = item; else next.push(item);
        $('#yt-save').disabled = true; if(await save(next)) reset();
      } catch (err) { status(err.message); } finally { $('#yt-save').disabled = false; }
    };
  }
  function home() {
    const parent = $('.home-screen-main .home-route-content') || $('.home-screen-main'); if (!parent || $('#yt-home')) return;
    const section = el('section', '', 'yt-playlists'); section.id = 'yt-home'; section.setAttribute('aria-label','Anime & Donghua');
    section.append(el('h2','Anime & Donghua')); const filters = el('div','','yt-actions'); filters.setAttribute('role','group'); filters.setAttribute('aria-label','Playlist category');
    ['All','Anime','Donghua'].forEach(c => { const b = button(c, () => { category = c; filters.querySelectorAll('button').forEach(x => x.setAttribute('aria-pressed', String(x.textContent === c))); render(); }); b.setAttribute('aria-pressed', String(c === category)); filters.append(b); });
    const list = el('div','','yt-grid'); list.id = 'yt-home-list'; list.append(el('p','Loading playlists…')); section.append(filters,list); parent.append(section);
    if (config) render(); else load();
  }
  function api() {
    if (window.YT && window.YT.Player) return Promise.resolve();
    if (apiPromise) return apiPromise;
    apiPromise = new Promise((resolve,reject) => {
      const previous = window.onYouTubeIframeAPIReady;
      window.onYouTubeIframeAPIReady = () => { if (previous) previous(); resolve(); };
      const script = document.createElement('script'); script.src = 'https://www.youtube.com/iframe_api'; script.onerror = () => reject(Error('YouTube could not load.')); document.head.append(script);
      setTimeout(() => { if (!window.YT || !window.YT.Player) reject(Error('YouTube did not respond.')); }, 15000);
    });
    apiPromise.catch(() => {apiPromise = null;}); return apiPromise;
  }
  function close() {
    generation++; if (player) { try {player.destroy();} catch (_) {} player = null; }
    if (dialog) {dialog.remove(); dialog = null;} if (returnFocus && returnFocus.isConnected) returnFocus.focus();
  }
  async function watch(p) {
    close(); returnFocus = document.activeElement; const gen = generation;
    dialog = el('dialog','','yt-playlists yt-dialog');
    const title = el('h2',p.title); title.id = 'yt-player-title'; dialog.setAttribute('aria-labelledby', title.id);
    const closeButton = button('Close player', close), note = el('p','YouTube controls availability. If playback is unavailable, open the playlist on YouTube.'); note.setAttribute('role','status');
    const link = el('a','Open on YouTube'); link.href = normalize(p.url); link.rel = 'noopener noreferrer'; // Same-window link allows Android ACTION_VIEW.
    const frameBox = el('div','','yt-frame'); dialog.append(closeButton,title,frameBox,note,link); document.body.append(dialog);
    dialog.addEventListener('cancel', e => {e.preventDefault();close();});
    if (typeof dialog.showModal !== 'function') { close(); location.assign(link.href); return; }
    dialog.showModal();
    // Current app WebView intercepts external iframe navigations and has no custom-view fullscreen host.
    // Use the supported external app/browser path instead of altering the working streaming WebView.
    if (/; wv\)/.test(navigator.userAgent) || !/^https?:$/.test(location.protocol)) { frameBox.remove(); note.textContent = 'For reliable playback in this Android WebView, open the playlist in the official YouTube app or browser.'; return; }
    const frame = document.createElement('iframe'); frame.title = p.title + ' — YouTube playlist';
    frame.referrerPolicy = 'strict-origin-when-cross-origin'; frame.allow = 'encrypted-media; picture-in-picture; fullscreen'; frame.allowFullscreen = true;
    frame.src = 'https://www.youtube.com/embed/videoseries?' + new URLSearchParams({list:new URL(normalize(p.url)).searchParams.get('list'), autoplay:'0', playsinline:'1', enablejsapi:'1', origin:location.origin}); frameBox.append(frame);
    try { await api(); if (gen !== generation || !dialog) return; player = new YT.Player(frame, {events:{onError:e => {note.textContent = 'YouTube cannot play this playlist here (error ' + e.data + '). It may be private, removed, restricted, or require client identification. Use Open on YouTube.';}}}); }
    catch (e) { if (gen === generation && dialog) note.textContent = e.message + ' Use Open on YouTube if playback is unavailable.'; }
  }
  window.addEventListener('hashchange', close);
  window.addEventListener('pagehide', close);
  document.addEventListener('visibilitychange', () => { if (document.hidden) close(); });
  let queued = false;
  new MutationObserver(() => { if (queued) return; queued = true; requestAnimationFrame(() => { queued = false; manager(); home(); if (dialog && (!$('#yt-home') || !$('.home-screen-main'))) close(); }); }).observe(document.body,{childList:true,subtree:true});
  manager(); home();
})();
