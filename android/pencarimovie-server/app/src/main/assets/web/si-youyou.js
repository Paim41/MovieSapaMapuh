/* Si Youyou: optional local companion; no network API or server-state simulation. */
(function () {
  'use strict';
  var KEY='moviesapamapuh.pet.v1', settings={enabled:true,animations:true,reduced:false,x:null,y:null};
  try { var saved=JSON.parse(localStorage.getItem(KEY)||'{}'); Object.keys(settings).forEach(function(k){if(saved[k]!==undefined) settings[k]=saved[k];}); } catch(e) {}
  var map={idle:['idle/si_youyou_idle_front.png'],blink:['blink/si_youyou_blink_front.png'],walk:[1,2,3,4].map(function(n){return 'walk/si_youyou_walk_left_0'+n+'.png';}),sit:['sit/si_youyou_sit_front.png'],sleep:['sleep/si_youyou_sleep_front.png'],jump:['jump/si_youyou_jump_crouch.png','jump/si_youyou_jump_airborne.png','jump/si_youyou_jump_landing.png'],happy:['reactions/si_youyou_happy.png'],wave:['reactions/si_youyou_wave.png'],dragged:['idle/si_youyou_idle_front.png'],hidden:[]};
  var state='idle',since=Date.now(),frame=0,timer=null,root,img,panel,drag=null,hold=null,heldMenu=false,nextBlink=4000+Math.random()*4000,cache={},order=[],lastFrame='',obstacles=null,refreshQueued=false,motion=window.matchMedia('(prefers-reduced-motion: reduce)');
  var anchors={"idle/si_youyou_idle_front.png":{"size":[1186,1336],"bounds":[10,10,1176,1326]},"blink/si_youyou_blink_front.png":{"size":[859,942],"bounds":[10,10,849,932]},"blink/si_youyou_blink_side_left.png":{"size":[823,897],"bounds":[10,10,813,887]},"idle/si_youyou_idle_side_left.png":{"size":[862,951],"bounds":[10,10,852,941]},"idle/si_youyou_idle_back.png":{"size":[858,951],"bounds":[10,10,848,941]},"sleep/si_youyou_sleep_front.png":{"size":[962,815],"bounds":[10,10,952,805]},"sleep/si_youyou_sleep_side_left.png":{"size":[971,800],"bounds":[10,10,961,790]},"reactions/si_youyou_happy.png":{"size":[992,829],"bounds":[10,10,982,819]},"reactions/si_youyou_wave.png":{"size":[974,829],"bounds":[10,10,964,819]},"jump/si_youyou_jump_crouch.png":{"size":[721,736],"bounds":[10,10,711,726]},"jump/si_youyou_jump_airborne.png":{"size":[740,702],"bounds":[10,10,730,692]},"jump/si_youyou_jump_landing.png":{"size":[708,719],"bounds":[10,10,698,709]},"sit/si_youyou_sit_front.png":{"size":[1013,824],"bounds":[10,10,1003,814]},"sit/si_youyou_sit_side_left.png":{"size":[955,793],"bounds":[10,10,945,783]},"walk/si_youyou_walk_left_01.png":{"size":[740,586],"bounds":[10,10,730,576]},"walk/si_youyou_walk_left_02.png":{"size":[740,586],"bounds":[10,10,730,576]},"walk/si_youyou_walk_left_03.png":{"size":[740,586],"bounds":[10,10,730,576]},"walk/si_youyou_walk_left_04.png":{"size":[740,586],"bounds":[10,10,730,576]}};
  var lastActivity=Date.now();
  function persist(){try{localStorage.setItem(KEY,JSON.stringify(settings));}catch(e){}}
  function animate(){return settings.animations&&!settings.reduced&&!motion.matches;}
  function enter(next){state=next;since=Date.now();frame=0;if(next==='idle')nextBlink=4000+Math.random()*4000;}
  function asset(name){return 'assets/si-youyou/sprites/'+name;}
  function preload(name){
    if(!cache[name]){var image=new Image();image.src=asset(name);cache[name]=image;order.push(name);if(order.length>8){delete cache[order.shift()];}}
    return cache[name];
  }
  function visible(el){var r=el.getBoundingClientRect();return r.width>0&&r.height>0&&getComputedStyle(el).visibility!=='hidden';}
  function excluded(){
    if(document.hidden||document.fullscreenElement||document.webkitFullscreenElement)return true;
    var active=document.activeElement;if(active&&/INPUT|TEXTAREA|SELECT/.test(active.tagName))return true;
    var gates=document.querySelectorAll('#settingsGate,#addonModal,#authGate,[role="dialog"],.modal.open,.stream-modal.active,.stream-modal.open,#streamSearchOverlay.open');
    for(var i=0;i<gates.length;i++)if(visible(gates[i]))return true;
    return false;
  }
  function safe(x,y){
    if(x<8||y<8||x+112>innerWidth-8||y+128>innerHeight-8)return false;
    if(!obstacles){
      obstacles=[];
      var controls=document.querySelectorAll('button,a,input,select,textarea,video,audio,[data-action],.focusable,p,h1,h2,h3,.movie-cast-track,.detail-meta-row,[role="button"],nav,[role="navigation"],.bottom-nav,.sidebar,.home-sidebar,.modern-sidebar-shell,.library-empty-state');
      for(var i=0;i<controls.length;i++){
        if(!root.contains(controls[i])&&visible(controls[i]))obstacles.push(controls[i].getBoundingClientRect());
      }
    }
    for(var i=0;i<obstacles.length;i++){
      var r=obstacles[i];
      if(x<r.right+6&&x+112>r.left-6&&y<r.bottom+6&&y+128>r.top-6)return false;
    }
    return true;
  }
  function position(){
    // Resolve the initial position once. Never hunt for a new slot during scrolling.
    if(typeof settings.x!=='number'||typeof settings.y!=='number'){
      settings.x=12;settings.y=Math.max(8,innerHeight-220);persist();
    }
    settings.x=Math.max(8,Math.min(innerWidth-120,settings.x));
    settings.y=Math.max(8,Math.min(innerHeight-136,settings.y));
    return safe(settings.x,settings.y)?[settings.x,settings.y]:null;
  }
  function showFrame(name){
    var a=anchors[name],b=a.bounds,scale=84/(b[3]-b[1]);
    img.style.width=(a.size[0]*scale)+'px';img.style.height=(a.size[1]*scale)+'px';
    img.style.left=((112-(b[2]-b[0])*scale)/2-b[0]*scale)+'px';
    img.style.bottom=(8-(a.size[1]-b[3])*scale)+'px';
    img.src=asset(name);lastFrame=name;
  }
  function render(){
    clearTimeout(timer);timer=null;obstacles=null;
    if(!settings.enabled){state='hidden';root.hidden=true;return;}
    if(excluded()){root.hidden=true;if(!document.hidden)timer=setTimeout(render,1000);return;}
    var p=position();if(!p){root.hidden=true;timer=setTimeout(render,1000);return;}
    root.hidden=false;root.style.left=p[0]+'px';root.style.top=p[1]+'px';
    if(!animate())enter('idle');
    var now=Date.now(),elapsed=now-since;
    if(!drag&&animate()){
      if(state==='hidden')enter('idle');
      if(state==='idle'&&now-lastActivity>25000)enter('sit');
      else if(state==='idle'&&elapsed>nextBlink)enter('blink');
      else if(state==='blink'&&elapsed>180)enter(Math.random()<.2?'walk':'idle');
      else if(state==='sit'&&elapsed>20000)enter('sleep');
      else if(state==='sleep'&&elapsed>30000){lastActivity=now;enter('idle');}
      else if((state==='happy'||state==='wave'||state==='jump'||state==='walk')&&elapsed>1200)enter('idle');
    }
    // Frames depend on elapsed time, never on scroll/mutation redraw frequency.
    elapsed=Date.now()-since;frame=Math.floor(elapsed/125);
    if(state==='walk'&&animate()&&!drag){
      var drift=Math.sin(Math.min(1,elapsed/1200)*Math.PI)*12*(p[0]<innerWidth/2?1:-1);
      if(safe(p[0]+drift,p[1]))root.style.left=(p[0]+drift)+'px';
    }
    var group=map[state]||map.idle;
    if(group.length){
      var index=state==='jump'?Math.min(2,Math.floor(elapsed/400)):frame%group.length;
      var name=group[index],loaded=preload(name);preload(group[(index+1)%group.length]);
      if(loaded.complete&&loaded.naturalWidth&&lastFrame!==name)showFrame(name);
      // Pose changes share one ground anchor; the supplied airborne pose supplies the jump.
      img.style.transform='none';
    }
    if(!document.hidden)timer=setTimeout(render,animate()?110:1000);
  }
  function react(event){lastActivity=Date.now();if(!settings.enabled)return;enter(animate()?(event==='play'?'happy':event==='download'?'jump':'wave'):'idle');render();}
  function options(){
    if(!panel)return;
    // Use the original settings entry point so the companion adds no competing navigation.
    if(window.showSettingsGate)window.showSettingsGate({});
    panel.scrollIntoView({block:'nearest'});panel.querySelector('input').focus();
  }
  function point(e){return e.touches&&e.touches.length?e.touches[0]:e;}
  function down(e){
    if(e.type==='mousedown'&&e.button!==0)return;
    var p=point(e);drag={x:p.clientX,y:p.clientY,left:parseFloat(root.style.left),top:parseFloat(root.style.top),moved:false};heldMenu=false;lastActivity=Date.now();
    hold=setTimeout(function(){heldMenu=true;drag=null;options();},550);
    e.preventDefault();e.stopPropagation();
  }
  function move(e){
    if(!drag)return;obstacles=null;var p=point(e),dx=p.clientX-drag.x,dy=p.clientY-drag.y;
    if(Math.abs(dx)+Math.abs(dy)>8){drag.moved=true;clearTimeout(hold);enter('dragged');}
    var x=Math.max(8,Math.min(innerWidth-120,drag.left+dx)),y=Math.max(8,Math.min(innerHeight-136,drag.top+dy));
    // Never drag over active controls; a blocked drop retains the last safe position.
    if(safe(x,y)){settings.x=x;settings.y=y;root.style.left=x+'px';root.style.top=y+'px';}
    e.preventDefault();e.stopPropagation();
  }
  function up(e){
    clearTimeout(hold);if(!drag)return;var moved=drag.moved;drag=null;persist();
    if(!heldMenu)enter(moved?'idle':'wave');render();e.preventDefault();e.stopPropagation();
  }
  function start(){
    root=document.createElement('button');root.id='siYouyou';root.type='button';root.className='youyou-pet';root.setAttribute('aria-label','Si Youyou: tap to wave, long press for pet settings');root.hidden=true;
    img=document.createElement('img');img.alt='';img.draggable=false;root.appendChild(img);showFrame(map.idle[0]);
    document.body.appendChild(root);
    panel=document.createElement('section');panel.className='youyou-settings';panel.setAttribute('aria-label','Si Youyou pet settings');
    var heading=document.createElement('h3');heading.textContent='Si Youyou';panel.appendChild(heading);
    [['enabled','Enable Pet'],['animations','Enable Animations'],['reduced','Reduced Motion / Performance Mode']].forEach(function(pair){
      var label=document.createElement('label'),input=document.createElement('input');input.type='checkbox';input.checked=!!settings[pair[0]];input.addEventListener('change',function(){settings[pair[0]]=input.checked;persist();enter('idle');render();});label.appendChild(input);label.appendChild(document.createTextNode(pair[1]));panel.appendChild(label);
    });
    var reset=document.createElement('button');reset.type='button';reset.textContent='Reset Pet Position';reset.addEventListener('click',function(){settings.x=null;settings.y=null;persist();render();});panel.appendChild(reset);
    var card=document.querySelector('#settingsGate .settings-gate__card');if(card)card.appendChild(panel);
    root.addEventListener('mousedown',down);root.addEventListener('touchstart',down,{passive:false});
    document.addEventListener('mousemove',move);document.addEventListener('touchmove',move,{passive:false});
    document.addEventListener('mouseup',up);document.addEventListener('touchend',up,{passive:false});
    document.addEventListener('touchcancel',function(){drag=null;clearTimeout(hold);enter('idle');render();});
    root.addEventListener('contextmenu',function(e){e.preventDefault();options();});
    root.addEventListener('click',function(e){e.preventDefault();e.stopPropagation();if(e.detail===0)react('tap');});
    root.addEventListener('keydown',function(e){if(e.key==='Escape')options();});
    document.addEventListener('play',function(e){if(/VIDEO|AUDIO/.test(e.target.tagName))react('play');},true);
    document.addEventListener('input',function(e){if(e.target.id==='searchInput')react('search');},true);
    document.addEventListener('click',function(e){
      var target=e.target;
      while(target&&target!==document){if(target.id==='fileDetailDownloadBtn'){react('download');return;}target=target.parentNode;}
      lastActivity=Date.now();if(state==='sleep'||state==='sit')enter('idle');
    });
    // Existing app.js creates media controls dynamically; yield immediately to new dialogs/controls.
    new MutationObserver(function(records){
      if(document.hidden||refreshQueued)return;
      for(var i=0;i<records.length;i++)if(!root.contains(records[i].target)){
        refreshQueued=true;setTimeout(function(){refreshQueued=false;render();},0);break;
      }
    }).observe(document.body,{childList:true,subtree:true,attributes:true,attributeFilter:['class','style','hidden']});
    document.addEventListener('visibilitychange',function(){clearTimeout(timer);if(document.hidden){root.hidden=true;return;}enter('idle');render();});
    document.addEventListener('focusin',render);document.addEventListener('focusout',function(){setTimeout(render,0);});document.addEventListener('scroll',render,true);
    document.addEventListener('fullscreenchange',render);document.addEventListener('webkitfullscreenchange',render);window.addEventListener('resize',render);
    if(motion.addListener)motion.addListener(render);
    window.SiYouyou={react:react,state:function(){return state;}};
    render();
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start);else start();
}());
