#!/usr/bin/env python3
"""Static preservation gate. It intentionally makes no runtime parity claims."""
import collections
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
    for a,b in [('PencariMovie Server','MovieSapaMapuh'),('PencariMovie —','MovieSapaMapuh —'),('PencariMovie Catalogs','MovieSapaMapuh Catalogs')]:
        text=text.replace(a,b)
    return text
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
    assert (repo/path).read_bytes()==subprocess.check_output(['git','show',f'{BASE}:{path}'],cwd=repo),path
print('PASS native resource text, control IDs, and unchanged PHP engine/dependencies')
print('Dynamic text, visual reachability, event wiring and device behavior still require runtime tests.')
