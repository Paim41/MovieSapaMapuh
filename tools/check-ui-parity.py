#!/usr/bin/env python3
"""Static preservation gate. It intentionally makes no runtime parity claims."""
import collections
import json
import re
from html.parser import HTMLParser
from pathlib import Path
import subprocess
import xml.etree.ElementTree as ET

repo = Path(__file__).resolve().parents[1]
BASE = '6e278427e3e4f5e2f5868df7c4f6211905298ca5'
NATIVE = 'a1f5091ceef836d801c8f8efac2392b4431da6ac'
def original(ref, path):
    return subprocess.check_output(['git', 'show', f'{ref}:{path}'], cwd=repo, text=True)
def branded(text):
    for a,b in [('PencariMovie Server','MovieSapaMapuh'),('PencariMovie —','MovieSapaMapuh —'),('PencariMovie Catalogs','MovieSapaMapuh Catalogs'),('PencariMovie Addon Configuration','MovieSapaMapuh Addon Configuration'),('PencariMovie Downloader.','MovieSapaMapuh.'),('PencariMovie catalogs are off.','MovieSapaMapuh catalogs are off.'),('Enable PencariMovie catalogs in Addon Settings','Enable MovieSapaMapuh catalogs in Addon Settings')]:
        text=text.replace(a,b)
    return text
def auth_style(text):
    style=(repo/'tools/fixtures/noir-auth.css').read_text()
    return re.sub(r'(<title>MovieSapaMapuh</title>\s*<style>).*?(</style>)',lambda m:m[1]+'\n'+style+m[2],text,flags=re.S)
class Page(HTMLParser):
    def __init__(self, text):
        super().__init__(convert_charrefs=True); self.texts=collections.Counter(); self.ids=set(); self.skip=0; self.feed(text)
    def handle_starttag(self,tag,attrs):
        if tag in ('script','style'): self.skip+=1
        d=dict(attrs)
        if 'id' in d: self.ids.add(d['id'])
        for k in ('placeholder','title','aria-label'):
            if d.get(k): self.texts[branded(' '.join(d[k].split()))]+=1
    def handle_endtag(self,tag):
        if tag in ('script','style'): self.skip=max(0,self.skip-1)
    def handle_data(self,text):
        if not self.skip and text.strip(): self.texts[branded(' '.join(text.split()))]+=1
for ref,path in [(BASE,'public/index.html'),(NATIVE,'android/pencarimovie-server/app/src/main/assets/web/index.html')]:
    before=Page(original(ref,path));after=Page((repo/path).read_text())
    assert not before.ids-after.ids, ('Missing IDs',before.ids-after.ids)
    assert not before.texts-after.texts, ('Missing text',before.texts-after.texts)
    print('PASS original HTML text/attributes and IDs:',path)
path='android/pencarimovie-server/app/src/main/res/values/strings.xml'
before={x.attrib['name']:branded(x.text or '') for x in ET.fromstring(original(NATIVE,path))}
after={x.attrib['name']:x.text or '' for x in ET.fromstring((repo/path).read_text())}
assert all(after.get(k)==v for k,v in before.items()),'Native string changed outside branding allowlist'
for filename in ['activity_main.xml','activity_web.xml']:
    path='android/pencarimovie-server/app/src/main/res/layout/'+filename
    old=ET.fromstring(original(NATIVE,path));new=ET.fromstring((repo/path).read_text());ns='{http://schemas.android.com/apk/res/android}'
    oldids={x.get(ns+'id') for x in old.iter() if x.get(ns+'id')};newids={x.get(ns+'id') for x in new.iter() if x.get(ns+'id')}
    assert oldids <= newids,('Missing native controls',oldids-newids)
    texts=collections.Counter(branded(x.get(ns+'text')) for x in old.iter() if x.get(ns+'text'))
    now=collections.Counter(x.get(ns+'text') for x in new.iter() if x.get(ns+'text'))
    assert not texts-now,('Missing native layout text',texts-now)
for path in ['backend.php','composer.json','composer.lock','Caddyfile','router.php','index.php']:
    before=original(BASE,path)
    if path=='backend.php':
        before=auth_style(before.replace('PencariMovie Server','MovieSapaMapuh').replace('Open PencariMovie and re-install','Open MovieSapaMapuh and re-install'))
        marker='    // ── GET /api/sub-proxy'
        before=before.replace(marker,(repo/'tools/fixtures/youtube-php-route.txt').read_text()+marker)
    assert (repo/path).read_text()==before, ('Non-branding PHP engine/dependency change',path)
# Preserve every dynamic label and event handler in the two distinct frontend baselines.
for ref,folder in [(BASE,'public'),(NATIVE,'android/pencarimovie-server/app/src/main/assets/web')]:
    path=folder+'/app.js'
    expected=branded(original(ref,path)).replace("this.siteName = 'PencariMovie';", "this.siteName = 'MovieSapaMapuh';")
    assert (repo/path).read_text()==expected, ('Unexpected frontend behavior/text change',path)
    paths=subprocess.check_output(['git','ls-tree','-r','--name-only',ref,folder],cwd=repo,text=True).splitlines()
    for path in paths:
        if path.endswith(('.js','.json')) and path != folder+'/app.js':
            expected=subprocess.check_output(['git','show',f'{ref}:{path}'],cwd=repo)
            if path == folder+'/app.bundle.js':
                # Explicit Library copy and loading-markup hooks only. Controllers, routes, filters and player stay byte-identical.
                for patch in json.loads((repo/'tools/fixtures/library-copy-patch.json').read_text()) + json.loads((repo/'tools/fixtures/loader-markup-patch.json').read_text()):
                    if patch.get('folder',folder) != folder: continue
                    before=patch['before'].encode(); after=patch['after'].encode()
                    assert expected.count(before)==1
                    expected=expected.replace(before,after)
            assert (repo/path).read_bytes()==expected, ('Runtime/translation changed',path)
path='android/pencarimovie-server/app/src/main/java/com/pencarimovie/server/NativeHttpServer.kt'
expected=auth_style(original('0f1c851',path).replace('PencariMovie Server','MovieSapaMapuh').replace('Open PencariMovie and re-install','Open MovieSapaMapuh and re-install'))
expected=expected.replace('    private val auth by lazy', '    private val youtubePlaylists by lazy { YouTubePlaylists(context) }\n\n    private val auth by lazy').replace('                uri == \"/api/version\"', '                uri == \"/api/youtube-playlists\" -> youtubePlaylists.serve(session)\n                uri == \"/api/version\"')
assert (repo/path).read_text()==expected, 'Native server changed beyond UI branding and isolated playlist route'
for name in ['TdLibManager.kt','WebActivity.kt','ServerService.kt']:
    path='android/pencarimovie-server/app/src/main/java/com/pencarimovie/server/'+name
    expected=original('0f1c851',path)
    if name=='WebActivity.kt':
        marker='        // Handle custom protocols like Stremio, Telegram, Magnet, Intents'
        expected=expected.replace(marker,(repo/'tools/fixtures/developer-email-intent.kt').read_text()+marker)
    assert (repo/path).read_text()==expected, ('Working native engine/playback changed',path)
print('PASS native resource text/IDs, PHP/native engine except exact branding/auth CSS and isolated playlist route, frontend handlers, translations and bundles except explicit Library copy and loading-markup hooks')
print('Dynamic text, visual reachability, event wiring and device behavior still require runtime tests.')

# The retired native pet was added after recovery: permit only its UI/lifecycle removal.
path='android/pencarimovie-server/app/src/main/java/com/pencarimovie/server/MainActivity.kt'
expected=original('6874276',path)
expected=expected.replace('        findViewById<View>(R.id.petSettings).setOnClickListener { findViewById<SiYouyouView>(R.id.siYouyou).showSettings() }', '        // Retire only the old companion preferences; server/account settings stay intact.\n        getSharedPreferences("moviesapamapuh.pet", MODE_PRIVATE).edit().clear().apply()')
for active in ['true','false']:
    expected=expected.replace('        findViewById<SiYouyouView>(R.id.siYouyou).setActive('+active+')\n','')
expected=re.sub(r'        findViewById<SiYouyouView>\(R.id.siYouyou\).serverState\(when\(state\) \{.*?        \}\)\n','',expected,flags=re.S)
assert (repo/path).read_text()==expected, 'Native activity changed beyond explicit pet removal'
for folder in ['public','android/pencarimovie-server/app/src/main/assets/web']:
    assert not (repo/folder/'si-youyou.js').exists()
    assert not (repo/folder/'si-youyou.css').exists()
    assert not (repo/folder/'assets/si-youyou').exists()
assert not (repo/'android/pencarimovie-server/app/src/main/java/com/pencarimovie/server/SiYouyouView.kt').exists()
print('PASS retired native/web pet components absent; original native activity behavior preserved')
