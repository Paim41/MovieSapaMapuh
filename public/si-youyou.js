/* Si Youyou: optional local companion; no network API or server-state simulation. */
(function () {
  'use strict';
  var KEY='moviesapamapuh.pet.v1', settings={enabled:true,animations:true,flame:false,reduced:false,x:null,y:null};
  try { var saved=JSON.parse(localStorage.getItem(KEY)||'{}'); Object.keys(settings).forEach(function(k){if(saved[k]!==undefined) settings[k]=saved[k];}); } catch(e) {}
  var map={idle:['idle/si_youyou_idle_front.png'],blink:['blink/si_youyou_blink_front.png'],walk:[1,2,3,4].map(function(n){return 'walk/si_youyou_walk_left_0'+n+'.png';}),sit:['sit/si_youyou_sit_front.png'],sleep:['sleep/si_youyou_sleep_front.png'],jump:['jump/si_youyou_jump_crouch.png','jump/si_youyou_jump_airborne.png','jump/si_youyou_jump_landing.png'],happy:['reactions/si_youyou_happy.png'],wave:['reactions/si_youyou_wave.png'],dragged:['idle/si_youyou_idle_front.png'],hidden:[]};
  var state='idle',since=Date.now(),frame=0,timer=null,root,img,flame,panel,drag=null,hold=null,heldMenu=false,direction=-1,nextBlink=4000+Math.random()*4000,cache={},order=[],lastFrame='',obstacles=null,refreshQueued=false,motion=window.matchMedia('(prefers-reduced-motion: reduce)');
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
      var controls=document.querySelectorAll('button,a,input,select,textarea,video,audio,[role="button"],nav,[role="navigation"],.bottom-nav,.sidebar');
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
    var x=settings.x,y=settings.y;
    if(typeof x==='number'&&typeof y==='number'&&safe(x,y))return [x,y];
    for(var row=innerHeight-220;row>=16;row-=140){
      for(var col=12;col+112<innerWidth;col+=124)if(safe(col,row))return [col,row];
    }
    return null;
  }
  function render(){
    clearTimeout(timer);timer=null;obstacles=null;
    if(!settings.enabled){state='hidden';root.hidden=true;return;}
    if(excluded()){root.hidden=true;if(!document.hidden)timer=setTimeout(render,1000);return;}
    var p=position();if(!p){root.hidden=true;timer=setTimeout(render,1000);return;}
    root.hidden=false;root.style.left=p[0]+'px';root.style.top=p[1]+'px';
    if(!animate())enter('idle');
    var elapsed=Date.now()-since;
    if(!drag&&animate()){
      if(state==='hidden')enter('idle');
      if(state==='idle'&&elapsed>nextBlink)enter('blink');
      else if(state==='blink'&&elapsed>180)enter(Math.random()<.5?'walk':'sit');
      else if(state==='walk'){
        var next=p[0]+direction*2;
        if(safe(next,p[1])){settings.x=next;settings.y=p[1];}else direction*=-1;
        if(elapsed>6000)enter('sit');
      } else if(state==='sit'&&elapsed>10000)enter('sleep');
      else if(state==='sleep'&&elapsed>30000)enter('idle');
      else if((state==='happy'||state==='wave'||state==='jump')&&elapsed>1200)enter('idle');
    }
    var group=map[state]||map.idle;
    if(group.length){
      var index=state==='jump'?Math.min(2,Math.floor(elapsed/400)):frame%group.length;
      var name=group[index],loaded=preload(name);preload(group[(index+1)%group.length]);
      if(loaded.complete&&loaded.naturalWidth&&lastFrame!==name){img.src=loaded.src;lastFrame=name;}
      img.style.transform=state==='jump'&&index===1?'translateY(-10px)':'none';
    }
    flame.hidden=!(settings.flame&&animate()&&state!=='sleep');
    if(!flame.hidden){flame.src=asset('effects/flame/si_youyou_flame_0'+(frame%3+1)+'.png');}
    frame++;
    if(!document.hidden)timer=setTimeout(render,animate()?110:1000);
  }
  function react(event){if(!settings.enabled)return;enter(animate()?(event==='play'?'happy':event==='download'?'jump':'wave'):'idle');render();}
  function options(){
    if(!panel)return;
    // Use the original settings entry point so the companion adds no competing navigation.
    if(window.showSettingsGate)window.showSettingsGate({});
    panel.scrollIntoView({block:'nearest'});panel.querySelector('input').focus();
  }
  function point(e){return e.touches&&e.touches.length?e.touches[0]:e;}
  function down(e){
    if(e.type==='mousedown'&&e.button!==0)return;
    var p=point(e);drag={x:p.clientX,y:p.clientY,left:parseFloat(root.style.left),top:parseFloat(root.style.top),moved:false};heldMenu=false;
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
    img=document.createElement('img');img.alt='';img.draggable=false;img.src=asset(map.idle[0]);root.appendChild(img);
    flame=document.createElement('img');flame.alt='';flame.className='youyou-flame';flame.hidden=true;flame.draggable=false;root.appendChild(flame);document.body.appendChild(root);
    panel=document.createElement('section');panel.className='youyou-settings';panel.setAttribute('aria-label','Si Youyou pet settings');
    var heading=document.createElement('h3');heading.textContent='Si Youyou';panel.appendChild(heading);
    [['enabled','Enable Pet'],['animations','Enable Animations'],['flame','Flame Effects'],['reduced','Reduced Motion / Performance Mode']].forEach(function(pair){
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
      if(state==='sleep')enter('idle');
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
