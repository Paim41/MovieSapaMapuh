/* Native CSS cursor only. No overlay, coordinate tracking, frame loop or settings. */
(function () {
  'use strict';
  var root=document.documentElement;
  var primary=matchMedia('(hover: hover) and (pointer: fine)');
  var capable=matchMedia('(any-hover: hover) and (any-pointer: fine)');
  var ready=false, pending=false, mouse=primary.matches, functional=false, downTarget=null;
  function reset(){root.classList.remove('youyou-cursor-down');downTarget=null;}
  function apply(){
    var enabled=ready && capable.matches && mouse && !functional && !document.hidden && !document.fullscreenElement && !document.webkitFullscreenElement;
    root.classList.toggle('youyou-cursor',enabled);if(!enabled)reset();
  }
  function preload(){
    if(pending || !capable.matches)return;
    pending=true;
    Promise.all(['normal','click'].map(function(name){return new Promise(function(resolve,reject){
      var image=new Image();image.onload=resolve;image.onerror=reject;image.src='assets/si-youyou-cursor/'+name+'.png';
    });})).then(function(){ready=true;apply();},function(){ready=false;apply();});
  }
  function capabilityChanged(){mouse=primary.matches;reset();preload();apply();}
  [primary,capable].forEach(function(media){if(media.addEventListener)media.addEventListener('change',capabilityChanged);else media.addListener(capabilityChanged);});
  function input(event){
    // Inspect the native cursor only on target entry/press, never on pointer movement.
    root.classList.remove('youyou-cursor');
    var cursor=event.target instanceof Element ? getComputedStyle(event.target).cursor : 'auto';
    functional=['auto','default','pointer'].indexOf(cursor)===-1;
    mouse=event.pointerType==='mouse' || (!window.PointerEvent && event.type.indexOf('mouse')===0);preload();apply();}
  var over=window.PointerEvent?'pointerover':'mouseover',down=window.PointerEvent?'pointerdown':'mousedown',up=window.PointerEvent?'pointerup':'mouseup';
  document.addEventListener(over,input,{passive:true,capture:true});
  document.addEventListener(down,function(event){input(event);if(root.classList.contains('youyou-cursor') && event.button===0){downTarget=event.target;root.classList.add('youyou-cursor-down');}},{passive:true,capture:true});
  window.addEventListener(up,reset,true);
  ['pointercancel','lostpointercapture','pagehide','hashchange','popstate','dragstart'].forEach(function(name){window.addEventListener(name,reset,true);});
  window.addEventListener('blur',reset);
  document.addEventListener('visibilitychange',function(){reset();apply();});
  document.addEventListener('fullscreenchange',function(){reset();apply();});
  document.addEventListener('webkitfullscreenchange',function(){reset();apply();});
  // Routes can replace/hide their DOM without changing the hash. Release pressed state then.
  new MutationObserver(function(){
    if(downTarget && (!downTarget.isConnected || !downTarget.getClientRects().length))reset();
  }).observe(document.documentElement,{childList:true,subtree:true,attributes:true,attributeFilter:['hidden','style','class']});
  preload();apply();
}());
