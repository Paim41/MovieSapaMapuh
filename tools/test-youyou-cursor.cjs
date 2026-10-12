const {chromium}=require('playwright');
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const repo=path.resolve(__dirname,'..');
(async()=>{
 const browser=await chromium.launch({headless:true,...(process.env.CHROMIUM_PATH?{executablePath:process.env.CHROMIUM_PATH}:{})});
 try{for(const folder of ['public','android/pencarimovie-server/app/src/main/assets/web']){
  for(const touch of [false,true]){
   const context=await browser.newContext({viewport:{width:390,height:844},hasTouch:touch,isMobile:touch});
   const errors=[],page=await context.newPage();page.on('pageerror',e=>errors.push(e.message));
   await context.route('**/*',route=>{
    const u=new URL(route.request().url());if(u.origin!=='http://fixture.test')return route.abort();
    if(u.pathname==='/')return route.fulfill({contentType:'text/html',body:`<!doctype html><meta name="viewport" content="width=device-width,initial-scale=1"><link rel="stylesheet" href="youyou-cursor.css"><script defer src="youyou-cursor.js"></script><link rel="stylesheet" href="youyou-loader.css"><script defer src="youyou-loader.js"></script><style>body{margin:0;padding:24px}button,a,input,textarea,select,[contenteditable]{display:block;margin:16px 0}button{cursor:pointer}.resize{cursor:ew-resize}.grab{cursor:grab}</style><button id="tiny" style="width:16px;height:16px;padding:0">x</button><a id="link" href="#next">Navigate</a><div id="card" tabindex="0" data-action="openDetail">Movie card</div><input id="text" type="text"><textarea></textarea><select><option>Original option</option></select><div id="edit" contenteditable="true">Editable text</div><button id="resize" data-action="resize" class="resize">Resize</button><button id="grab" class="grab">Drag</button><button id="disabled" disabled>Disabled</button><video id="video" controls></video><script>window.clicks=[];document.getElementById('tiny').onclick=e=>clicks.push([e.clientX,e.clientY]);</script>`});
    const file=path.resolve(repo,folder,'.'+u.pathname);if(!file.startsWith(path.resolve(repo,folder)+path.sep)||!fs.existsSync(file))return route.abort();
    return route.fulfill({body:fs.readFileSync(file),contentType:({'.css':'text/css','.js':'text/javascript','.png':'image/png'})[path.extname(file)]||'application/json'});
   });
   await page.goto('http://fixture.test/');
   if(touch){
    await page.locator('#tiny').tap();assert.equal(await page.locator('html').evaluate(e=>e.classList.contains('youyou-cursor')),false);
    assert.equal(await page.locator('img,#siYouyou,.youyou-settings').count(),0);console.log('PASS',folder,'touch native cursor/no fake overlay');await context.close();continue;
   }
   await page.waitForFunction(()=>document.documentElement.classList.contains('youyou-cursor'));
   const box=await page.locator('#tiny').boundingBox(),x=box.x+1,y=box.y+1;
   await page.mouse.move(x,y);
   assert.match(await page.locator('#tiny').evaluate(e=>getComputedStyle(e).cursor),/normal\.png.*10 33/);
   await page.mouse.down();assert.match(await page.locator('#tiny').evaluate(e=>getComputedStyle(e).cursor),/click\.png.*11 40/);
   await page.mouse.up();assert.deepEqual(await page.evaluate(()=>clicks),[[x,y]]);
   assert.match(await page.locator('#tiny').evaluate(e=>getComputedStyle(e).cursor),/normal\.png.*10 33/);
   for(const event of ['pointercancel','lostpointercapture','blur','hashchange','popstate']){
    await page.mouse.down();await page.evaluate(event=>window.dispatchEvent(new Event(event)),event);
    assert.equal(await page.locator('html').evaluate(e=>e.classList.contains('youyou-cursor-down')),false);await page.mouse.up();
   }
   await page.mouse.down();await page.evaluate(()=>document.getElementById('tiny').remove());await page.waitForFunction(()=>!document.documentElement.classList.contains('youyou-cursor-down'));await page.mouse.up();
   for(const [selector,cursor] of [['#text','text'],['textarea','text'],['#edit','text'],['#resize','ew-resize'],['#grab','grab']]){
    await page.locator(selector).hover();assert.equal(await page.locator(selector).evaluate(e=>getComputedStyle(e).cursor),cursor);
   }
   await page.locator('#text').fill('abc');assert.equal(await page.locator('#text').inputValue(),'abc');
   await page.locator('#card').hover();assert.match(await page.locator('#card').evaluate(e=>getComputedStyle(e).cursor),/normal\.png/);
   await page.evaluate(()=>{const host=document.createElement('section');host.id='loader';host.setAttribute('data-youyou-loading','');host.setAttribute('aria-label','Loading');document.body.appendChild(host);});
   await page.waitForSelector('.youyou-ready');
   assert.equal(await page.locator('.youyou-walk img').count(),4);
   await page.locator('#card').hover();await page.mouse.down();
   assert.match(await page.locator('#card').evaluate(e=>getComputedStyle(e).cursor),/click\.png/);
   assert.equal(await page.locator('.youyou-walk img').first().evaluate(e=>getComputedStyle(e).animationDuration),'0.5s');
   await page.mouse.up();await page.evaluate(()=>document.getElementById('loader').remove());
   await page.locator('#link').click();assert.equal(new URL(page.url()).hash,'#next');assert.equal(await page.locator('html').evaluate(e=>e.classList.contains('youyou-cursor-down')),false);
   // Mixed input: a real touch event suppresses custom cursors even on a fine-pointer browser.
   await page.evaluate(()=>document.getElementById('card').dispatchEvent(new PointerEvent('pointerdown',{pointerType:'touch',bubbles:true})));
   assert.equal(await page.locator('html').evaluate(e=>e.classList.contains('youyou-cursor')),false);
   await page.mouse.move(1,1);await page.locator('#card').hover();await page.waitForFunction(()=>document.documentElement.classList.contains('youyou-cursor'));
   await page.evaluate(()=>document.documentElement.requestFullscreen());await page.waitForFunction(()=>!document.documentElement.classList.contains('youyou-cursor'));await page.evaluate(()=>document.exitFullscreen());
   await page.route('**/assets/si-youyou-cursor/*.png',route=>route.abort());await page.reload();await page.waitForTimeout(150);
   assert.equal(await page.locator('html').evaluate(e=>e.classList.contains('youyou-cursor')),false);
   assert.equal(await page.locator('img,#siYouyou,.youyou-settings').count(),0);assert.deepEqual(errors,[]);
   console.log('PASS',folder,'fine-pointer CSS/hotspots, tiny target coordinates, pressed reset, navigation, native editing/resize/drag, mixed touch, fullscreen and asset failure');await context.close();
  }
 }}finally{await browser.close();}
})().catch(e=>{console.error(e);process.exit(1)});
