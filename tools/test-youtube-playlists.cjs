/* Integration fixture: real PHP configuration storage, real UI modules, stubbed YouTube only. */
const {chromium}=require('playwright');
const fs=require('fs'),path=require('path'),os=require('os'),assert=require('assert/strict'),{spawn}=require('child_process');
const repo=path.resolve(__dirname,'..'),tmp=fs.mkdtempSync(path.join(os.tmpdir(),'msp-youtube-'));
const php=process.env.PHP_BIN||'php',port=18897,origin='http://127.0.0.1:'+port;
const quote=s=>"'"+s.replace(/'/g,"\\'")+"'";
fs.writeFileSync(path.join(tmp,'router.php'),`<?php
require ${quote(path.join(repo,'src/YouTubePlaylists.php'))};
if(parse_url($_SERVER['REQUEST_URI'],PHP_URL_PATH)==='/api/youtube-playlists') {
 [$status,$body]=msp_playlist_api(${quote(path.join(tmp,'playlists.json'))},$_SERVER['REQUEST_METHOD'],array_filter(['origin'=>$_SERVER['HTTP_ORIGIN']??null,'host'=>$_SERVER['HTTP_HOST'],'content-type'=>$_SERVER['CONTENT_TYPE']??'','x-msp-playlists'=>$_SERVER['HTTP_X_MSP_PLAYLISTS']??''],fn($v)=>$v!==null),file_get_contents('php://input'));
 http_response_code($status);header('Content-Type: application/json');echo json_encode($body);exit;
}
echo 'fixture';`);
let server,browser;
async function start(){server=spawn(php,['-S','127.0.0.1:'+port,path.join(tmp,'router.php')],{stdio:'ignore'});for(let i=0;i<100;i++){try{await fetch(origin);return;}catch{}await new Promise(r=>setTimeout(r,30));}throw Error('PHP fixture did not start');}
async function stop(){if(server){await new Promise(r=>{server.once('exit',r);server.kill();});server=null;}}
(async()=>{try{
 await start(); browser=await chromium.launch({headless:true,executablePath:process.env.CHROMIUM_PATH||undefined});
 for(const folder of ['public','android/pencarimovie-server/app/src/main/assets/web']){
  fs.rmSync(path.join(tmp,'playlists.json'),{force:true});
  const context=await browser.newContext(),page=await context.newPage();page.setDefaultTimeout(10000);let youtubeRequests=0,apiReads=0;
  await context.route('**/*',async route=>{
   const u=new URL(route.request().url());
   if(u.host.includes('youtube.com')){youtubeRequests++;if(u.pathname==='/iframe_api')return route.fulfill({contentType:'text/javascript',body:'window.YT={Player:function(frame,options){window.youtubeOptions=options;this.destroy=function(){frame.remove();window.youtubeDestroyed=true;}}};window.onYouTubeIframeAPIReady();'});return route.fulfill({contentType:'text/html',body:'Official embed destination fixture'});}
   if(u.origin!==origin)return route.abort();
   if(u.pathname==='/api/youtube-playlists'){apiReads++;return route.continue();}
   if(u.pathname==='/'){
    let html=fs.readFileSync(path.join(repo,folder,'index.html'),'utf8').replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi,'');
    html=html.replace('</body>','<script src="youtube-playlists.js"></script></body>');return route.fulfill({contentType:'text/html',body:html});
   }
   const f=path.resolve(repo,folder,'.'+u.pathname);if(!f.startsWith(path.resolve(repo,folder)+'/')||!fs.existsSync(f))return route.abort();
   return route.fulfill({body:fs.readFileSync(f),contentType:({'.css':'text/css','.js':'text/javascript','.png':'image/png','.svg':'image/svg+xml'})[path.extname(f)]||'text/plain'});
  });
  await page.goto(origin);await page.waitForTimeout(100);assert.equal(apiReads,0,'closed settings makes no requests');assert.equal(youtubeRequests,0);
  async function mountHome(){await page.evaluate(()=>{document.querySelector('#loadingScreen').classList.add('hidden');document.querySelector('#settingsGate').classList.add('hidden');let app=document.querySelector('#app');if(!app){app=document.createElement('div');app.id='app';document.body.append(app);}app.innerHTML='<div class="home-shell"><main class="home-main home-screen-main"><div class="home-route-content"><h1>Existing catalog fixture</h1></div></main></div>';window.showSettingsGate=()=>{document.querySelector('#settingsGate').classList.remove('hidden');document.querySelector('#settingsGate').setAttribute('aria-hidden','false');};});}
  await mountHome();await page.getByText('Add your first Anime or Donghua playlist.').waitFor();
  await page.getByRole('button',{name:'Open playlist settings',exact:true}).click();await page.locator('#yt-playlist-manager[open]').waitFor();
  const form=page.locator('#yt-playlist-form');await form.locator('[name=title]').fill('Official playlist fixture');await form.locator('[name=url]').fill('https://www.youtube.com/watch?v=M7lc1UVf-VE&list=PLBCF2DAC6FFB574DE');await form.locator('[name=source]').fill('Documentation sample');await form.getByRole('button',{name:'Save playlist',exact:true}).click();await page.getByText('Playlists saved.',{exact:true}).waitFor();
  assert.equal(await page.locator('#yt-saved h3').textContent(),'Official playlist fixture');assert.equal(await page.locator('#yt-home h3').textContent(),'Official playlist fixture');assert.equal(youtubeRequests,0);
  // Restart PHP with the same disk config; the module must reload the saved playlist.
  await stop();await start();await page.locator('#yt-reload').click();await page.waitForTimeout(100);assert.equal(await page.locator('#yt-saved h3').textContent(),'Official playlist fixture');
  await page.locator('#yt-saved').getByRole('button',{name:'Edit',exact:true}).click();await form.locator('[name=title]').fill('Edited Donghua');await form.locator('[name=category]').selectOption('Donghua');await form.getByRole('button',{name:'Save changes',exact:true}).click();await page.locator('#yt-home h3').filter({hasText:'Edited Donghua'}).waitFor();
  await page.locator('#yt-saved input[type=checkbox]').uncheck();await page.getByText('No enabled playlists in this category.',{exact:true}).waitFor();await page.locator('#yt-saved input[type=checkbox]').check();await page.locator('#yt-home h3').waitFor();
  await page.evaluate(()=>document.querySelector('#settingsGate').classList.add('hidden'));
  await page.locator('#yt-home').getByRole('button',{name:'Anime',exact:true}).click();await page.getByText('No enabled playlists in this category.',{exact:true}).waitFor();await page.locator('#yt-home').getByRole('button',{name:'Donghua',exact:true}).click();await page.locator('#yt-home h3').waitFor();
  for(const [width,height] of [[320,568],[360,640],[393,873],[412,915],[768,600],[1440,900]]){
   await page.setViewportSize({width,height});const home=page.locator('#yt-home');await home.scrollIntoViewIfNeeded();assert.ok(await home.evaluate(e=>e.scrollWidth<=e.clientWidth+1));
   await home.getByRole('button',{name:'Watch',exact:true}).click();await page.locator('.yt-dialog iframe').waitFor();await page.waitForFunction(()=>!!window.youtubeOptions);
   const frame=await page.locator('.yt-dialog iframe').evaluate(e=>({w:e.getBoundingClientRect().width,h:e.getBoundingClientRect().height,src:e.src,ref:e.referrerPolicy}));assert.ok(frame.w>=200&&frame.h>=200);assert.equal(new URL(frame.src).searchParams.get('autoplay'),'0');assert.equal(new URL(frame.src).searchParams.get('origin'),origin);assert.equal(frame.ref,'strict-origin-when-cross-origin');
   for(const code of [100,101,150,153]){await page.evaluate(code=>youtubeOptions.events.onError({data:code}),code);assert.match(await page.locator('.yt-dialog [role=status]').textContent(),new RegExp('error '+code));}
   assert.equal(await page.getByRole('link',{name:'Open on YouTube'}).getAttribute('href'),'https://www.youtube.com/playlist?list=PLBCF2DAC6FFB574DE');
   assert.ok(await page.locator('.yt-dialog').evaluate(e=>e.scrollWidth<=e.clientWidth+1));await page.getByRole('button',{name:'Close player'}).click();assert.equal(await page.locator('.yt-dialog iframe').count(),0);assert.equal(await page.evaluate(()=>youtubeDestroyed),true);
  }
  await page.locator('#yt-home').getByRole('button',{name:'Watch',exact:true}).click();await page.keyboard.press('Escape');assert.equal(await page.locator('.yt-dialog').count(),0);
  await page.locator('#yt-home').getByRole('button',{name:'Watch',exact:true}).click();await page.evaluate(()=>location.hash='#library');await page.waitForFunction(()=>!document.querySelector('.yt-dialog'));
  // Android WebView path must make no YouTube requests and offer the real external URL.
  await page.evaluate(()=>{Object.defineProperty(navigator,'userAgent',{value:'Mozilla/5.0 (Linux; Android 13; POCO F3 Build/TKQ1; wv) AppleWebKit/537.36 Version/4.0 Chrome/120.0 Mobile Safari/537.36',configurable:true});location.hash='';});await page.waitForTimeout(30);const before=youtubeRequests;
  await page.locator('#yt-home').getByRole('button',{name:'Watch',exact:true}).click();await page.getByText('For reliable playback in this Android WebView',{exact:false}).waitFor();assert.equal(await page.locator('.yt-dialog iframe').count(),0);assert.equal(youtubeRequests,before);await page.getByRole('button',{name:'Close player'}).click();
  await page.evaluate(()=>document.querySelector('#settingsGate').classList.remove('hidden'));await page.locator('#yt-saved').getByRole('button',{name:'Edit',exact:true}).click();await form.locator('[name=url]').fill('https://youtube.com.evil.test/playlist?list=PLBCF2DAC6FFB574DE');await form.getByRole('button',{name:'Save changes',exact:true}).click();assert.match(await page.locator('#yt-playlist-status').textContent(),/valid list/);
  await form.locator('[name=url]').fill('https://www.youtube.com/playlist?list=PLBCF2DAC6FFB574DE');await form.locator('[name=title]').fill('<img src=x onerror=alert(1)>');await form.getByRole('button',{name:'Save changes',exact:true}).click();await page.getByText('Use plain text within the field limits.',{exact:true}).waitFor();assert.equal(await page.locator('#yt-saved img').count(),0);
  await page.locator('#yt-cancel').click();await page.locator('#yt-reload').click();await page.waitForTimeout(100);await page.setViewportSize({width:393,height:873});fs.mkdirSync(path.join(repo,'dist/youtube-screenshots'),{recursive:true});await page.locator('#yt-playlist-manager').screenshot({path:path.join(repo,'dist/youtube-screenshots',folder==='public'?'settings-web.png':'settings-android.png')});
  page.on('dialog',d=>d.accept());await page.locator('#yt-saved').getByRole('button',{name:'Remove',exact:true}).click();await page.getByText('No playlists saved yet.',{exact:true}).waitFor();
  console.log('PASS',folder,'CRUD, PHP restart persistence, filters, invalid URL/XSS, lazy embeds, errors 100/101/150/153, teardown, six viewports and simulated WebView fallback');await context.close();
 }
}finally{if(browser)await browser.close();await stop();fs.rmSync(tmp,{recursive:true,force:true});}})().catch(e=>{console.error(e);process.exitCode=1;});
