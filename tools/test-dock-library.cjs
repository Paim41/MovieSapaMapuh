/* Exercise actual bundled render functions with isolated Library data; no service calls. */
const {chromium}=require('playwright');
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),assert=require('node:assert/strict');
const repo=path.resolve(__dirname,'..');
const bundle=fs.readFileSync(path.join(repo,'public/app.bundle.js'),'utf8');
function between(a,b){const start=bundle.indexOf(a);assert.ok(start>=0,a);return bundle.slice(start,bundle.indexOf(b,start+a.length));}
const navContext={xt:()=>({isPerformanceConstrained:false}),vo:key=>({'sidebar.home':'Home','sidebar.search':'Search','sidebar.library':'Library','sidebar.addons':'Addons','sidebar.settings':'Settings'}[key]||key),T_:()=>'',w1:()=>({keepPillExpanded:false})};
vm.createContext(navContext);
vm.runInContext(between('var Td=','var gg=')+between('function y_(','function vo(')+between('function Lh(','function Es(')+between('function Gk(','function w1(')+between('function x1(','function __('),navContext);
const navs={};for(const variant of ['legacy','modern'])for(const route of ['home','search','library','addon','settings'])navs[variant+route]=vm.runInContext(`${variant==='legacy'?'x1':'N1'}({selectedRoute:'${route}'})`,navContext);
const emptyMethod=between('renderEmptyState(){','},applyOpenPickerOptionFocus()')+'}';
const icon=between('function nme(){','function ame(');
const originalTitle=between('getEmptyStateTitle(){','getPickerOptions(');
(async()=>{
 const browser=await chromium.launch({headless:true,...(process.env.CHROMIUM_PATH?{executablePath:process.env.CHROMIUM_PATH}:{})});
 try{for(const folder of ['public','android/pencarimovie-server/app/src/main/assets/web']){
  const context=await browser.newContext(); const page=await context.newPage(); const errors=[];page.on('pageerror',e=>errors.push(e.message));
  await context.route('**/*',route=>{
   const u=new URL(route.request().url());if(u.origin!=='http://fixture.test')return route.abort();
   if(u.pathname==='/')return route.fulfill({contentType:'text/html',body:`<!doctype html><meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover"><link rel="stylesheet" href="css/bundle.css"><link rel="stylesheet" href="styles.css"><link rel="stylesheet" href="noir.css"><link rel="stylesheet" href="noir-dock-library.css"><link rel="stylesheet" href="si-youyou.css"><script defer src="noir.js"></script><script defer src="si-youyou.js"></script><div id="app"></div>`});
   const f=path.resolve(repo,folder,'.'+u.pathname);if(!f.startsWith(path.resolve(repo,folder)+path.sep)||!fs.existsSync(f))return route.abort();
   return route.fulfill({body:fs.readFileSync(f),contentType:({'.css':'text/css','.js':'text/javascript','.png':'image/png'})[path.extname(f)]||'application/json'});
  });
  await page.goto('http://fixture.test/');
  const setup=()=>page.evaluate(({emptyMethod,icon,originalTitle})=>{
   const n=x=>String(x).replace(/&/g,'&amp;').replace(/</g,'&lt;'),l=eval('('+icon.replace('function nme','function')+')');
   const ar=(key,args,fallback)=>fallback,Xhe=x=>!x||x==='__all__'?'all':x, Xe={LOCAL:'local',TRAKT:'trakt',SIMKL:'simkl'};
   const methods=eval('({'+originalTitle.replace('}getEmptyStateSubtitle','},getEmptyStateSubtitle').replace(/}$/, '}')+'})');
   window.renderEmpty=function(state){const controller={state,getState:()=>state,...methods};return eval('({'+emptyMethod+'})').renderEmptyState.call({controller});};
   window.baseState={sourceMode:'local',selectedTypeKey:'__all__',selectedWatchedFilter:'all',allItems:[],visibleItems:[]};
  },{emptyMethod,icon,originalTitle});
  await setup();
  async function render(nav,state={},count=0){await page.evaluate(({nav,state,count})=>{
   const pickers=['Type','Sort','Watched'].map((label,i)=>`<div class="library-picker"><button class="library-picker-anchor focusable" data-picker="${label.toLowerCase()}" data-action="togglePicker"><span class="library-picker-copy"><span class="library-picker-title">${label}</span><span class="library-picker-value">${i===1?'Added ↓':'All'}</span></span><svg class="library-picker-chevron" viewBox="0 0 24 24"><path d="m5 9 7 7 7-7"/></svg></button></div>`).join('');
   const cards=Array.from({length:count},(_,i)=>`<article class="library-grid-card focusable" data-action="openDetail" tabindex="0"><div class="library-grid-poster" style="aspect-ratio:2/3;background:#222228"></div><div class="library-grid-title">Original title ${i+1}</div></article>`).join('');
   document.getElementById('app').innerHTML=`<div class="home-shell library-shell">${nav}<main class="home-main library-main"><section class="library-page"><header class="library-page-header"><h1 class="library-page-title">Library</h1></header><section class="library-picker-groups">${pickers}</section><div id="libraryContentAreaMount">${count?`<section class="library-grid-wrap"><div class="library-grid">${cards}</div></section>`:renderEmpty({...baseState,...state})}</div></section></main></div>`;
   window.actions=[];document.getElementById('app').onclick=e=>{const b=e.target.closest('[data-action]');if(b)actions.push(b.dataset.action);};
  },{nav,state,count});await page.waitForTimeout(30);}
  for(const [width,height] of [[320,568],[360,640],[390,844],[412,915],[740,480],[740,360]]){
   await page.setViewportSize({width,height});
   for(const variant of ['legacy','modern']){
    for(const route of ['home','search','library','addon','settings']){
     await render(navs[variant+route]);
     const report=await page.evaluate(()=>{
      const dock=document.querySelector('.home-sidebar,.modern-sidebar-shell'),r=dock.getBoundingClientRect();
      const items=Array.from(dock.querySelectorAll('.home-nav-item,.modern-sidebar-nav-item')).map(b=>{const l=b.querySelector('.home-nav-label,.modern-sidebar-nav-label'),s=getComputedStyle(l),r=l.getBoundingClientRect();return {text:l.textContent.trim(),w:b.getBoundingClientRect().width,h:b.getBoundingClientRect().height,visible:s.opacity==='1'&&s.visibility==='visible'&&r.width>0,clipped:l.scrollWidth>l.clientWidth+1||l.scrollHeight>l.clientHeight+1,svg:!!b.querySelector('svg'),action:b.dataset.action};});
      return {items,top:r.top,bottom:r.bottom,gap:innerHeight-r.bottom,scroll:document.querySelector('.library-shell').scrollHeight,height:document.querySelector('.library-shell').clientHeight,body:document.documentElement.scrollHeight,viewport:innerHeight,title:getComputedStyle(document.querySelector('.library-empty-title')).fontSize,mainBottom:document.querySelector('.library-empty-state').getBoundingClientRect().bottom};
     });
     assert.equal(report.items.length,5);for(const i of report.items){assert.ok(i.visible&&!i.clipped&&i.svg,JSON.stringify(i));assert.ok(i.h>=44);assert.ok(Math.abs(i.w-report.items[0].w)<1);}
     assert.ok(report.gap>=12&&report.gap<=16,JSON.stringify(report));assert.equal(report.title,'22px');
     if(height>=420)assert.ok(report.scroll<=report.height+1,`Empty overflow ${width}x${height} ${variant}: ${JSON.stringify(report)}`);
     else {await page.locator('.library-shell').evaluate(e=>e.scrollTop=e.scrollHeight);assert.ok(await page.locator('.library-empty-subtitle').evaluate(e=>e.getBoundingClientRect().bottom<document.querySelector('.home-sidebar,.modern-sidebar-shell').getBoundingClientRect().top));}
     assert.ok(report.body<=height+1);if(height>=420)assert.ok(report.mainBottom<report.top);
     if(variant==='modern')assert.equal(await page.locator('.modern-sidebar-panel').getAttribute('aria-hidden'),'false');
     for(const i of report.items)await page.locator(`[data-action="${i.action}"]`).click();
     assert.deepEqual(await page.evaluate(()=>actions),report.items.map(i=>i.action));
    }
    await render(navs[variant+'library'],{allItems:[{type:'movie'}],selectedWatchedFilter:'watched'});
    assert.equal(await page.locator('.library-empty-title').textContent(),'No matching titles');
    assert.match(await page.locator('.library-empty-subtitle').textContent(),/Try changing.*Start saving/);
    await render(navs[variant+'library'],{},40);
    assert.ok(await page.locator('.library-shell').evaluate(e=>e.scrollHeight>e.clientHeight));
    const dockTop=await page.locator('.home-sidebar,.modern-sidebar-shell').evaluate(e=>e.getBoundingClientRect().top);
    await page.locator('.library-shell').evaluate(e=>e.scrollTop=e.scrollHeight);
    assert.equal(await page.locator('.home-sidebar,.modern-sidebar-shell').evaluate(e=>e.getBoundingClientRect().top),dockTop);
    await page.waitForTimeout(100);
    await page.locator('.library-shell').evaluate(e=>e.scrollTop=e.scrollHeight);
    const end=await page.locator('.library-grid-card').last().evaluate(e=>({bottom:e.getBoundingClientRect().bottom,dock:document.querySelector('.home-sidebar,.modern-sidebar-shell').getBoundingClientRect().top,scroll:document.querySelector('.library-shell').scrollHeight,top:document.querySelector('.library-shell').scrollTop}));
    assert.ok(end.bottom<end.dock,`${width}x${height}: ${JSON.stringify(end)}`);
    await page.locator('.library-grid-card').last().click();assert.deepEqual(await page.evaluate(()=>actions),['openDetail']);
   }
  }
  // State-specific messages use actual original methods and the presentation hook.
  for(const [state,title] of [[{},'Your library is empty'],[{sourceMode:'trakt',isTraktAuthenticated:false},'Trakt not connected'],[{sourceMode:'trakt',isTraktAuthenticated:true},'This list is empty'],[{sourceMode:'simkl'},'This Simkl status is empty'],[{selectedTypeKey:'movies'},'No movies yet'],[{sourceMode:'trakt',isTraktAuthenticated:true,selectedListKey:'empty',allItems:[{listKeys:['other']}],selectedWatchedFilter:'watched'},'This list is empty']]){
   await render(navs.legacylibrary,state);assert.equal(await page.locator('.library-empty-title').textContent(),title);
  }
  await page.setViewportSize({width:390,height:844});await render(navs.legacylibrary);
  // Simulated safe inset exercises the same calculation used for Android env().
  await page.evaluate(()=>document.documentElement.style.setProperty('--noir-safe-bottom','24px'));
  assert.equal(await page.locator('.home-sidebar').evaluate(e=>innerHeight-e.getBoundingClientRect().bottom),38);
  fs.mkdirSync(path.join(repo,'dist/dock-library-screenshots'),{recursive:true});
  await page.screenshot({path:path.join(repo,'dist/dock-library-screenshots',`${folder==='public'?'web':'android'}-empty.png`)});
  // Enlarged labels grow the dock and its reserved space; no fixed-height clipping.
  await page.addStyleTag({content:'.home-sidebar .home-nav-label{font-size:24px !important}.library-empty-title{font-size:44px !important}.library-empty-subtitle{font-size:28px !important}'});
  await page.waitForTimeout(100);
  assert.ok(await page.locator('.home-nav-label').evaluateAll(labels=>labels.every(e=>e.scrollHeight<=e.clientHeight+1)));
  await page.locator('.library-shell').evaluate(e=>e.scrollTop=e.scrollHeight);
  assert.ok(await page.locator('.library-empty-subtitle').evaluate(e=>e.getBoundingClientRect().bottom<document.querySelector('.home-sidebar').getBoundingClientRect().top));
  await page.evaluate(()=>document.head.lastElementChild.remove());
  // Very short window must scroll to reach content; no global overflow suppression.
  await page.setViewportSize({width:320,height:240});await render(navs.legacylibrary);
  assert.ok(await page.locator('.library-shell').evaluate(e=>e.scrollHeight>e.clientHeight));
  await page.locator('.library-shell').evaluate(e=>e.scrollTop=e.scrollHeight);
  assert.ok(await page.locator('.library-empty-subtitle').evaluate(e=>e.getBoundingClientRect().bottom<document.querySelector('.home-sidebar').getBoundingClientRect().top));
  // Pet saved position intersects dock or empty-state text: suppress instead of relocating.
  await page.setViewportSize({width:390,height:844});await render(navs.legacylibrary);
  for(const target of ['.home-sidebar','.library-empty-title']){
   await page.evaluate(target=>{const r=document.querySelector(target).getBoundingClientRect();localStorage.setItem('moviesapamapuh.pet.v1',JSON.stringify({enabled:true,animations:false,x:20,y:Math.min(innerHeight-136,r.top-30)}));},target);
   await page.reload();await setup();await render(navs.legacylibrary);
   await page.waitForFunction(()=>document.getElementById('siYouyou').hidden);
  }
  assert.deepEqual(errors,[]);console.log('PASS',folder,'dock labels/actions/SVG, variants, state copy, empty/populated scrolling and safe area');await context.close();
 }}finally{await browser.close();}
})().catch(e=>{console.error(e);process.exit(1)});
