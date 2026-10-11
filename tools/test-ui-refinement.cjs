const {chromium}=require('playwright');
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const repo=path.resolve(__dirname,'..');
(async()=>{
 const browser=await chromium.launch({headless:true,...(process.env.CHROMIUM_PATH?{executablePath:process.env.CHROMIUM_PATH}:{})});
 try{for(const folder of ['public','android/pencarimovie-server/app/src/main/assets/web']){
  const context=await browser.newContext({viewport:{width:390,height:844}});const page=await context.newPage();const errors=[];page.on('pageerror',e=>errors.push(e.message));
  await context.route('**/*',async route=>{
   const u=new URL(route.request().url());if(u.origin!=='http://fixture.test')return route.abort();
   if(u.pathname==='/')return route.fulfill({contentType:'text/html',body:fs.readFileSync(path.join(__dirname,'fixtures/noir-refinement.html'))});
   const f=path.resolve(repo,folder,'.'+u.pathname);if(!f.startsWith(path.resolve(repo,folder)+path.sep)||!fs.existsSync(f))return route.abort();
   return route.fulfill({body:fs.readFileSync(f),contentType:({'.css':'text/css','.js':'text/javascript','.png':'image/png'})[path.extname(f)]||'application/json'});
  });
  await page.goto('http://fixture.test/');
  const filename='PencariMovie.Original.File.Name.2026.1080p.WEB-DL.Multi.Audio.'+'Long.Unchanged.Source.Information.'.repeat(5)+'mkv';
  await page.evaluate(name=>{
   for(let i=0;i<15;i++){
    const row=document.createElement('div');row.className='stream-route-card-row';row.innerHTML='<article class="stream-route-card focusable" data-action="playStream"><div class="stream-route-card-copy"><div class="stream-route-card-heading">Original Provider</div><div class="stream-route-card-quality">1080p WEB-DL</div><div class="stream-route-card-line"></div><div class="stream-route-card-meta"><span class="stream-route-meta-item">2.8 GB</span><span class="stream-route-meta-item">H.264 • AAC • Multi Audio</span></div></div></article>';
    row.querySelector('.stream-route-card-line').textContent=name;document.querySelector('.stream-route-list').append(row);
   }
  },filename);
  for(const width of [360,390,768,1024,1440]){
   await page.setViewportSize({width,height:900});
   for(const screen of ['detail','source']){
    await page.evaluate(screen=>{document.getElementById('detailFixture').hidden=screen!=='detail';document.getElementById('sourceFixture').hidden=screen!=='source';},screen);
    const report=await page.evaluate(screen=>{
     function rgb(s){return (s.match(/[\d.]+/g)||[]).slice(0,3).map(Number);}
     function lum(a){return a.map(v=>{v/=255;return v<=.04045?v/12.92:Math.pow((v+.055)/1.055,2.4)}).reduce((s,v,i)=>s+v*[.2126,.7152,.0722][i],0);}
     const selectors=screen==='detail'?'.series-detail-title,.series-detail-description,.detail-rating-item,.series-primary-btn,.series-secondary-btn,.series-insight-tab,.movie-cast-name,.movie-cast-role,.movie-cast-heading':'.stream-route-title,.stream-route-chip,.stream-route-card-heading,.stream-route-card-line,.stream-route-meta-item,.stream-route-card-quality';
     return Array.from(document.querySelectorAll(selectors)).filter(el=>el.getBoundingClientRect().width).map(el=>{
      const style=getComputedStyle(el);let parent=el,bg='rgb(12,12,15)';
      while(parent){const c=getComputedStyle(parent).backgroundColor;if(c.startsWith('rgb(')){bg=c;break;}parent=parent.parentElement;}
      const a=lum(rgb(style.color)),b=lum(rgb(bg));const r=el.getBoundingClientRect();
      return {name:el.className,contrast:(Math.max(a,b)+.05)/(Math.min(a,b)+.05),font:parseFloat(style.fontSize),width:el.clientWidth,scroll:el.scrollWidth,left:r.left,right:r.right};
     });
    },screen);
    for(const item of report){assert.ok(item.contrast>=4.5,`${folder} ${width} ${item.name}: contrast ${item.contrast}`);assert.ok(item.scroll<=item.width+1,`${width} ${item.name} overflow`);assert.ok(item.left>=-1&&item.right<=width+1,`${width} ${item.name} outside viewport`);}
    if(screen==='detail')assert.ok(report.find(x=>x.name==='movie-cast-heading').font<=24);
    if(screen==='source'){
     assert.ok(await page.locator('.stream-route-list').evaluate(el=>el.clientHeight>200),'Source list collapsed');
     assert.equal(await page.locator('.stream-route-card-line').first().textContent(),filename);
     await page.locator('.stream-route-list').evaluate(el=>el.scrollTop=el.scrollHeight);
     assert.ok(await page.locator('.stream-route-list').evaluate(el=>el.scrollTop+el.clientHeight>=el.scrollHeight-2));
    }
    if(width===390){await page.locator('.stream-route-list').evaluate(el=>el.scrollTop=0);fs.mkdirSync(path.join(repo,'dist/refinement-screenshots'),{recursive:true});await page.screenshot({path:path.join(repo,'dist/refinement-screenshots',`${folder==='public'?'web':'android'}-${screen}.png`)});}
   }
  }
  // No UI beneath this area: isolate position and render timing from service behavior.
  await page.setViewportSize({width:390,height:844});
  await page.evaluate(()=>{document.getElementById('app').remove();document.body.style.height='3000px';document.body.style.overflow='auto';document.documentElement.style.overflow='auto';window.dispatchEvent(new Event('resize'));});
  await page.waitForFunction(()=>!document.getElementById('siYouyou').hidden);
  const position=await page.locator('#siYouyou').evaluate(el=>[el.style.left,el.style.top]);
  await page.evaluate(()=>{window.scrollTo(0,700);document.dispatchEvent(new Event('scroll'));});
  assert.deepEqual(await page.locator('#siYouyou').evaluate(el=>[el.style.left,el.style.top]),position,'Scroll moved the viewport anchor');
  await page.evaluate(()=>{const pet=document.getElementById('siYouyou'),block=document.createElement('button');block.id='obstacle';block.textContent='Play';Object.assign(block.style,{position:'fixed',left:pet.style.left,top:pet.style.top,width:'112px',height:'128px'});document.body.appendChild(block);});
  await page.waitForFunction(()=>document.getElementById('siYouyou').hidden);
  await page.evaluate(()=>document.getElementById('obstacle').remove());
  await page.waitForFunction(()=>!document.getElementById('siYouyou').hidden);
  assert.deepEqual(await page.locator('#siYouyou').evaluate(el=>[el.style.left,el.style.top]),position,'Collision relocated pet');
  for(const event of ['tap','play','download']){
   await page.evaluate(event=>SiYouyou.react(event),event);
   await page.waitForFunction(()=>document.querySelector('#siYouyou img').complete);
   const size=await page.locator('#siYouyou').evaluate(el=>({w:el.getBoundingClientRect().width,h:el.getBoundingClientRect().height,count:el.querySelectorAll('img').length}));
   assert.deepEqual(size,{w:112,h:128,count:1});
  }
  assert.equal(await page.locator('.youyou-flame').count(),0);
  await page.evaluate(()=>document.documentElement.requestFullscreen());await page.waitForFunction(()=>document.getElementById('siYouyou').hidden);await page.evaluate(()=>document.exitFullscreen());
  assert.deepEqual(errors,[]);console.log('PASS',folder,'detail/source widths, text contrast, unchanged filename, scrolling, fixed pet anchor, collision hiding and fullscreen');await context.close();
 }}finally{await browser.close();}
})().catch(e=>{console.error(e);process.exit(1)});
