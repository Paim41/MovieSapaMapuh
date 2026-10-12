/* Presentation adapter only: existing request/render lifecycles own loading/error/success. */
(function () {
  'use strict';
  // Retire only companion state; never clear unrelated local storage.
  try { localStorage.removeItem('moviesapamapuh.pet.v1'); } catch (_) {}
  var selector = '[data-youyou-loading],.search-loading,.library-loading-state,.series-stream-loading,' +
    '.settings-account-loading,.settings-account-sync-loading,.settings-debrid-auth-loading,' +
    '.catalog-order-loading,.cast-detail-loading,.seeall-loading,.tmdb-entity-rail-loading,' +
    '.stream-loading,.file-detail__resolving,.loading-screen,.category-page__loading';
  var frames = [1,2,3,4].map(function(i){return 'assets/si-youyou-loader/si_youyou_walk_left_0'+i+'.png';});
  var ready = false, failed = false, pending = false, hosts = new Set();
  var observer = window.IntersectionObserver ? new IntersectionObserver(function(entries){
    entries.forEach(function(e){e.target.classList.toggle('youyou-visible',e.isIntersecting);});
  }) : null;
  function preload() {
    if (pending) return;
    pending = true;
    Promise.all(frames.map(function(src){return new Promise(function(resolve,reject){
      var img=new Image(); img.onload=function(){resolve();};img.onerror=reject;img.src=src;
    });})).then(function(){ready=true;hosts.forEach(function(host){host.classList.add('youyou-ready');});},function(){
      failed=true;
      // Keep original loading messages and a static accessible fallback on image failure.
      hosts.forEach(function(host){host.classList.add('youyou-unavailable');});
    });
  }
  function mount(host) {
    if(host.querySelector('.youyou-walk')) return;
    // Avoid nested/duplicated indicators in the same loading region.
    if(host.parentElement && host.parentElement.closest(selector)) return;
    var art=document.createElement('span');art.className='youyou-walk';art.setAttribute('aria-hidden','true');
    frames.forEach(function(src){var img=document.createElement('img');img.src=src;img.alt='';img.draggable=false;art.appendChild(img);});
    host.insertBefore(art,host.firstChild);host.classList.add('youyou-loading');
    if(ready)host.classList.add('youyou-ready');
    if(failed)host.classList.add('youyou-unavailable');
    // Skeleton roots had only an accessible label; retain it as the visible status too.
    if(host.hasAttribute('data-youyou-loading') || !host.textContent.trim()) {
      var label=document.createElement('span');label.className='youyou-loading-label';
      label.textContent=host.getAttribute('aria-label') || 'Loading...';host.appendChild(label);
      host.setAttribute('role','status');
    }
    hosts.add(host);if(observer)observer.observe(host);else host.classList.add('youyou-visible');
    preload();
  }
  function scan(root) {
    if(!root.querySelectorAll || (root.nodeType===1 && !root.isConnected))return;
    if(root.matches && root.matches(selector))mount(root);
    Array.prototype.forEach.call(root.querySelectorAll(selector),mount);
  }
  function start() {
    scan(document);
    new MutationObserver(function(records){
      records.forEach(function(record){
        if(record.type==='attributes') {
          // Only status containers need scanning, never arbitrary focused cards or player nodes.
          if(record.target.matches(selector))scan(record.target);
        } else Array.prototype.forEach.call(record.addedNodes,scan);
      });
      hosts.forEach(function(host){if(!host.isConnected){if(observer)observer.unobserve(host);hosts.delete(host);}});
    }).observe(document.body,{childList:true,subtree:true,attributes:true,attributeFilter:['class']});
    function visibility(){document.documentElement.classList.toggle('youyou-page-hidden',document.hidden);}
    document.addEventListener('visibilitychange',visibility);visibility();
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start);else start();
}());
