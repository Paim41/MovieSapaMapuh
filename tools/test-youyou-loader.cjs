/* Existing request state is supplied as fixture DOM; no service or playback simulation. */
const {chromium}=require('playwright');
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const repo=path.resolve(__dirname,'..');
const patches=JSON.parse(fs.readFileSync(path.join(__dirname,'fixtures/loader-markup-patch.json')));
const home=Function(patches[0].after+';return U$();')();
const sources=Function('return ({'+patches[2].after.slice(0,-1)+'});')();
const detail=Function('return '+patches[1].after)();
const nav='<aside class="home-sidebar root-sidebar-legacy"><div class="home-nav-list">'+['Home','Search','Library','Addons','Settings'].map((x,i)=>`<button class="home-nav-item${i===1?' selected':''}" data-action="goto${x}"><span class="home-nav-icon-wrap"><svg class="home-nav-icon" viewBox="0 0 24 24"><circle cx="12" cy="12" r="7" fill="currentColor"/></svg></span><span class="home-nav-label">${x}</span></button>`).join('')+'</div></aside>';
const searchEmpty='<div class="search-empty-state"><span class="search-empty-icon material-icons" aria-hidden="true">search</span><h2>Start Searching</h2><p>Enter at least 2 characters</p></div>';
const searchShell=content=>`<div class="home-shell search-screen-shell">${nav}<main class="home-main search-content"><section class="search-header no-discover no-voice"><input id="searchInput" class="search-input-field focusable" type="text" data-action="searchInput" placeholder="Search movies &amp; series" /></section>${content}</main></div>`;
(async()=>{
 const browser=await chromium.launch({headless:true,...(process.env.CHROMIUM_PATH?{executablePath:process.env.CHROMIUM_PATH}:{})});
 try {for(const folder of ['public','android/pencarimovie-server/app/src/main/assets/web']){
  const context=await browser.newContext({viewport:{width:390,height:844}}),page=await context.newPage(),errors=[];
  page.on('pageerror',e=>errors.push(e.message));
  await context.addInitScript(()=>{localStorage.setItem('moviesapamapuh.pet.v1','{"x":20}');localStorage.setItem('unrelated.setting','preserve');});
  await context.route('**/*',route=>{
   const u=new URL(route.request().url());if(u.origin!=='http://fixture.test')return route.abort();
   if(u.pathname==='/')return route.fulfill({contentType:'text/html',body:'<!doctype html><meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover"><link rel="stylesheet" href="stream-theme.css"><link rel="stylesheet" href="styles.css"><link rel="stylesheet" href="css/bundle.css"><link rel="stylesheet" href="noir.css"><link rel="stylesheet" href="noir-dock-library.css"><link rel="stylesheet" href="youyou-loader.css"><script defer src="noir.js"></script><script defer src="youyou-loader.js"></script><link rel="stylesheet" href="youyou-cursor.css"><script defer src="youyou-cursor.js"></script><div id="app"></div>'});
   const file=path.resolve(repo,folder,'.'+u.pathname);if(!file.startsWith(path.resolve(repo,folder)+path.sep)||!fs.existsSync(file))return route.abort();
   return route.fulfill({body:fs.readFileSync(file),contentType:({'.css':'text/css','.js':'text/javascript','.png':'image/png'})[path.extname(file)]||'application/json'});
  });
  await page.goto('http://fixture.test/');
  assert.equal(await page.evaluate(()=>localStorage.getItem('moviesapamapuh.pet.v1')),null);
  assert.equal(await page.evaluate(()=>localStorage.getItem('unrelated.setting')),'preserve');
  const mount=html=>page.evaluate(html=>document.getElementById('app').innerHTML=html,html);
  const statusContainers=[home,detail,sources.renderLoadingCards(),'<div class="search-loading"><span class="nuvio-loading-indicator"></span><span>Loading...</span></div>','<section class="library-loading-state"><span class="nuvio-loading-indicator"></span><div class="library-loading-label">Loading library</div></section>','<section class="settings-account-loading"><span class="nuvio-loading-indicator"></span><span>Loading account</span></section>','<div class="stream-loading"><div class="stream-loading__spinner"></div></div>'];
  for(const html of statusContainers){
   await mount(html);await page.waitForSelector('.youyou-ready .youyou-walk');assert.equal(await page.locator('.youyou-walk').count(),1);
   assert.equal(await page.locator('.youyou-walk img').count(),4);
   await page.evaluate(()=>document.querySelector('.youyou-loading').appendChild(document.createElement('span')));
   assert.equal(await page.locator('.youyou-walk').count(),1);
   await mount('<div class="error">Network error <button id="retry">Retry</button></div>');
   assert.equal(await page.locator('.youyou-walk').count(),0);assert.equal(await page.locator('#retry').textContent(),'Retry');
  }
  await mount(home);await page.waitForSelector('.youyou-ready');
  for(let i=0;i<4;i++){
   const frames=await page.locator('.youyou-walk img').evaluateAll((images,i)=>images.map(img=>{
    img.getAnimations().forEach(a=>{a.pause();a.currentTime=62.5+i*125;});const r=img.getBoundingClientRect();return {src:img.getAttribute('src'),opacity:getComputedStyle(img).opacity,w:r.width,h:r.height,x:r.x,y:r.y,loaded:img.complete&&img.naturalWidth===740};
   }),i);
   assert.equal(frames.filter(f=>f.opacity==='1').length,1);assert.equal(frames[i].opacity,'1');
   assert.ok(frames.every(f=>f.loaded&&f.w===148&&Math.abs(f.h-117.2)<.1&&f.x===frames[0].x&&f.y===frames[0].y));
  }
  await page.emulateMedia({reducedMotion:'reduce'});
  assert.equal(await page.locator('.youyou-walk img').evaluateAll(imgs=>imgs.filter(img=>getComputedStyle(img).opacity==='1').length),1);
  await page.emulateMedia({reducedMotion:'no-preference'});
  await mount(sources.renderStableStreamLoadingRow());assert.equal(await page.locator('.youyou-walk').isVisible(),false);
  await page.evaluate(()=>{const row=document.querySelector('[data-stream-loading-row]');row.hidden=false;row.style.display='';});
  await page.waitForSelector('.youyou-walk');
  await page.evaluate(()=>{const row=document.querySelector('[data-stream-loading-row]');row.hidden=true;row.style.display='none';});assert.equal(await page.locator('.youyou-walk').isVisible(),false);
  // Same-tick cache hit: no persistent loader or mandatory minimum display duration.
  await page.evaluate(html=>{const app=document.getElementById('app');app.innerHTML=html;app.innerHTML='<p id="cached">Cached result</p>';},home);
  assert.equal(await page.locator('.youyou-walk').count(),0);assert.equal(await page.locator('#cached').textContent(),'Cached result');
  for(const [width,height] of [[320,568],[360,640],[390,844],[412,915],[740,480],[320,240]]){
   await page.setViewportSize({width,height});await mount(searchShell(searchEmpty));await page.waitForTimeout(50);
   assert.equal(await page.locator('.search-empty-state h2').textContent(),'Start Searching');
   assert.equal(await page.locator('.search-empty-state p').textContent(),'Enter at least 2 characters');
   const bounds=await page.evaluate(()=>{const c=document.querySelector('.search-screen-shell'),h=document.querySelector('h2'),p=document.querySelector('.search-empty-state p'),icon=document.querySelector('.search-empty-icon');return {scroll:c.scrollHeight,height:c.clientHeight,h:getComputedStyle(h).fontSize,p:getComputedStyle(p).fontSize,icon:icon.getBoundingClientRect().width,overflow:document.documentElement.scrollWidth>innerWidth};});
   assert.equal(bounds.h,'22px');assert.equal(bounds.p,'14px');assert.equal(bounds.icon,48);assert.equal(bounds.overflow,false);
   if(height>=480)assert.ok(bounds.scroll<=bounds.height+1,`${width}x${height} ${JSON.stringify(bounds)}`);
   await page.locator('.search-screen-shell').evaluate(el=>el.scrollTop=el.scrollHeight);
   assert.ok(await page.locator('.search-empty-state p').evaluate(e=>e.getBoundingClientRect().bottom<document.querySelector('.home-sidebar').getBoundingClientRect().top));
   assert.equal(await page.locator('.youyou-walk,#siYouyou,.youyou-settings').count(),0);
   await page.locator('#searchInput').fill('ab');assert.equal(await page.locator('#searchInput').inputValue(),'ab');
  }
  await page.setViewportSize({width:390,height:844});await mount(searchShell(searchEmpty));
  fs.mkdirSync(path.join(repo,'dist/loader-screenshots'),{recursive:true});
  await page.screenshot({path:path.join(repo,'dist/loader-screenshots',`${folder==='public'?'web':'android'}-search.png`)});
  await mount(searchShell('<div class="search-loading"><span class="nuvio-loading-indicator"></span><span>Loading...</span></div>'));await page.waitForSelector('.youyou-ready');
  await page.screenshot({path:path.join(repo,'dist/loader-screenshots',`${folder==='public'?'web':'android'}-loading.png`)});
  await page.locator('[data-action="gotoHome"]').click(); // Loader does not capture navigation input.
  await page.route('**/assets/si-youyou-loader/*.png',route=>route.abort());await page.reload();await mount(home);
  await page.waitForSelector('.youyou-unavailable');assert.equal(await page.locator('.youyou-loading-label').textContent(),'Loading');assert.equal(await page.locator('.youyou-walk').isVisible(),false);
  assert.deepEqual(errors,[]);console.log('PASS',folder,'four supplied frames/order/baseline, loading lifecycle, error/cache/fallback, retired state removal, Search sizes and scrolling');await context.close();
 }}finally{await browser.close();}
})().catch(e=>{console.error(e);process.exit(1)});
