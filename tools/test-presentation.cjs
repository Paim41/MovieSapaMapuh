/* Isolated presentation fixture: original HTML/CSS, new adapters, no API/auth/media simulation. */
const { chromium } = require('playwright');
const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');
const repo = path.resolve(__dirname, '..');
(async () => {
  const browser = await chromium.launch({headless: true, ...(process.env.CHROMIUM_PATH ? {executablePath: process.env.CHROMIUM_PATH} : {})});
  try {
    for (const source of ['public', 'android/pencarimovie-server/app/src/main/assets/web']) {
      const context = await browser.newContext({viewport:{width:390,height:844}});
      await context.route('**/*', async route => {
        const url = new URL(route.request().url());
        if (url.origin !== 'http://fixture.test') return route.abort();
        let filename = path.resolve(repo,source,'.'+url.pathname);
        if (!filename.startsWith(path.resolve(repo,source)+path.sep)) return route.abort();
        if (url.pathname === '/index.html') {
          let html=fs.readFileSync(filename,'utf8').replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi,'');
          html=html.replace('</head>','<script defer src="noir.js"></script><script defer src="si-youyou.js"></script></head>');
          return route.fulfill({contentType:'text/html',body:html});
        }
        if (!fs.existsSync(filename)||!fs.statSync(filename).isFile()) return route.abort();
        const ext=path.extname(filename), types={'.css':'text/css','.js':'text/javascript','.png':'image/png','.svg':'image/svg+xml'};
        return route.fulfill({contentType:types[ext]||'application/octet-stream',body:fs.readFileSync(filename)});
      });
      const page=await context.newPage(), errors=[];
      page.on('pageerror',e=>errors.push(e.message));
      await page.goto('http://fixture.test/index.html');
      await page.evaluate(()=>{
        document.getElementById('loadingScreen').classList.add('hidden');
        window.showSettingsGate=()=>document.getElementById('settingsGate').classList.remove('hidden');
        window.dispatchEvent(new Event('resize'));
      });
      await page.waitForFunction(()=>!document.getElementById('siYouyou').hidden);
      await page.waitForFunction(()=>document.querySelector('#siYouyou img').naturalWidth>0);
      await page.locator('#siYouyou').click();
      assert.equal(await page.evaluate(()=>SiYouyou.state()),'wave');
      // Genuine media DOM signal, without claiming media playback or a server response.
      await page.evaluate(()=>{const v=document.createElement('video');document.body.appendChild(v);v.dispatchEvent(new Event('play'));v.remove();});
      assert.equal(await page.evaluate(()=>SiYouyou.state()),'happy');
      await page.evaluate(()=>{const b=document.createElement('button');b.id='fileDetailDownloadBtn';document.body.appendChild(b);b.click();b.remove();});
      assert.equal(await page.evaluate(()=>SiYouyou.state()),'jump');
      await page.emulateMedia({reducedMotion:'reduce'});
      await page.waitForFunction(()=>SiYouyou.state()==='idle');
      await page.emulateMedia({reducedMotion:'no-preference'});
      // Fullscreen exclusion uses the actual DOM API.
      await page.evaluate(()=>document.documentElement.requestFullscreen());
      await page.waitForFunction(()=>document.getElementById('siYouyou').hidden);
      await page.evaluate(()=>document.exitFullscreen());
      await page.waitForFunction(()=>!document.getElementById('siYouyou').hidden);
      // Drag owns its events and persists a bounded position.
      const box=await page.locator('#siYouyou').boundingBox();
      await page.mouse.move(box.x+56,box.y+64);await page.mouse.down();
      await page.mouse.move(box.x+180,box.y+64,{steps:5});await page.mouse.up();
      const saved=await page.evaluate(()=>JSON.parse(localStorage.getItem('moviesapamapuh.pet.v1')));
      assert.ok(saved.x>=8&&saved.x<=270&&saved.y>=8&&saved.y<=708);
      await page.evaluate(()=>showSettingsGate());
      await page.waitForFunction(()=>document.getElementById('siYouyou').hidden);
      const toggles=page.locator('.youyou-settings input');
      await toggles.nth(0).uncheck();
      await page.reload();
      assert.equal(await page.evaluate(()=>SiYouyou.state()),'hidden');
      await page.evaluate(()=>{document.getElementById('loadingScreen').classList.add('hidden');document.getElementById('settingsGate').classList.remove('hidden');});
      assert.equal(await toggles.nth(0).isChecked(),false);
      await toggles.nth(0).check();await toggles.nth(1).uncheck();
      await page.evaluate(()=>{document.activeElement.blur();document.getElementById('settingsGate').classList.add('hidden');window.dispatchEvent(new Event('resize'));});
      await page.waitForFunction(()=>!document.getElementById('siYouyou').hidden);
      assert.equal(await page.evaluate(()=>SiYouyou.state()),'idle');
      for(const width of [360,390,768,1440]) {
        await page.setViewportSize({width,height:900});
        await page.evaluate(()=>document.getElementById('settingsGate').classList.remove('hidden'));
        const sizes=await page.locator('#settingsGate .settings-gate__card').evaluate(el=>({client:el.clientWidth,scroll:el.scrollWidth,height:el.clientHeight,scrollHeight:el.scrollHeight}));
        assert.ok(sizes.scroll<=sizes.client+1,`Settings overflow ${source} ${width}: ${JSON.stringify(sizes)}`);
        await page.locator('.youyou-settings button').scrollIntoViewIfNeeded();
        assert.ok(await page.locator('.youyou-settings button').isVisible());
      }
      // Reveal original conditional sections only in the fixture to inspect below-fold layout.
      for (const gate of ['settingsGate','addonModal']) {
        for (const width of [360,390,768,1440]) {
          await page.setViewportSize({width,height:900});
          await page.evaluate(id=>{
            ['settingsGate','addonModal','authGate'].forEach(x=>document.getElementById(x).classList.toggle('hidden',x!==id));
            document.querySelectorAll('#'+id+' .hidden').forEach(el=>el.classList.remove('hidden'));
          },gate);
          const box=page.locator('#'+gate+' .settings-gate__card');
          const sizes=await box.evaluate(el=>({client:el.clientWidth,scroll:el.scrollWidth}));
          assert.ok(sizes.scroll<=sizes.client+1,`Full ${gate} overflow ${source} ${width}: ${JSON.stringify(sizes)}`);
          await box.evaluate(el=>{el.scrollTop=el.scrollHeight;});
          const bottom=await box.evaluate(el=>el.scrollTop+el.clientHeight>=el.scrollHeight-1);
          assert.ok(bottom,`Cannot reach bottom of ${gate}`);
        }
      }
      await page.evaluate(()=>{document.getElementById('addonModal').classList.add('hidden');document.getElementById('settingsGate').classList.remove('hidden');});
      await page.setViewportSize({width:390,height:844});
      await page.evaluate(()=>{document.querySelector('#settingsGate .settings-gate__card').scrollTop=0;});
      fs.mkdirSync(path.join(repo,'dist','screenshots'),{recursive:true});
      await page.screenshot({path:path.join(repo,'dist','screenshots',source==='public'?'settings-web.png':'settings-android-bundle.png')});
      assert.deepEqual(errors,[]);
      console.log(`PASS ${source}: gestures, persistence, reduced motion, fullscreen, settings scrolling at four widths; isolated fixture only`);
      await context.close();
    }
  } finally {await browser.close();}
})().catch(e=>{console.error(e);process.exit(1);});
