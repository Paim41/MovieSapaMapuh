/* Optional presentation adapter for prebuilt shell images and decorative UI icons. */
(function () {
  'use strict';
  var svgNS = 'http://www.w3.org/2000/svg';
  var paths = {
    '⚙️': 'M12 8a4 4 0 1 0 0 8 4 4 0 0 0 0-8M12 2v3m0 14v3M2 12h3m14 0h3M5 5l2 2m10 10 2 2M5 19l2-2M17 7l2-2',
    '🤖': 'M8 8h8a4 4 0 0 1 4 4v7H4v-7a4 4 0 0 1 4-4M12 8V3m-4 9v2m8-2v2M8 17h8',
    '🔒': 'M6 10h12v11H6zM8 10V6a4 4 0 0 1 8 0v4',
    '🔑': 'M14 3a5 5 0 1 0 0 10 5 5 0 0 0 0-10M10 12l-7 7v3h3v-3h3v-3',
    '☁️': 'M6 18a4 4 0 0 1-1-8 7 7 0 0 1 13-1 4.5 4.5 0 0 1 0 9z',
    '🧩': 'M3 3h6v3a3 3 0 0 0 6 0V3h6v6h-3a3 3 0 0 0 0 6h3v6H3z',
    '📦': 'M3 7l9-5 9 5v10l-9 5-9-5zM3 7l9 5 9-5M12 12v10',
    '📡': 'M4 3a17 17 0 0 1 17 17M4 9a11 11 0 0 1 11 11M4 15a5 5 0 0 1 5 5M4 20h.01'
  };
  // Hand-authored SVG equivalents for the original settings' decorative glyphs.
  var folder='M3 5h7l2 3h9v12H3z', screen='M3 4h18v13H3zM8 21h8M12 17v4', film='M3 3h18v18H3zM7 3v18M17 3v18M3 8h4m10 0h4M3 16h4m10 0h4', globe='M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0M3 12h18M12 3c-5 5-5 13 0 18 5-5 5-13 0-18';
  ['🗂️','📁'].forEach(function(k){paths[k]=folder;});
  ['📺','💻'].forEach(function(k){paths[k]=screen;});
  ['🎬','🎥','🎞️','💿','🧿'].forEach(function(k){paths[k]=film;});
  ['🌍','🌐'].forEach(function(k){paths[k]=globe;});
  paths['📋']='M8 4h8v4H8zM8 6H4v16h16V6h-4';
  paths['🔄']='M20 8a8 8 0 0 0-14-3L3 8m0-5v5h5M4 16a8 8 0 0 0 14 3l3-3m0 5v-5h-5';
  paths['⚡']='M13 2L4 14h7l-1 8 10-13h-8z';
  paths['✨']='M12 2l3 7 7 3-7 3-3 7-3-7-7-3 7-3z';
  paths['🔗']='M9 15l6-6M7 17l-1 1a4 4 0 0 1-6-6l5-5a4 4 0 0 1 6 0M17 7l1-1a4 4 0 0 1 6 6l-5 5a4 4 0 0 1-6 0';
  paths['❓']='M9 8a3 3 0 1 1 5 2c-2 1-2 2-2 4M12 18h.01';
  paths['🏆']='M7 3h10v7a5 5 0 0 1-10 0zM7 5H3v3a4 4 0 0 0 4 4m10-7h4v3a4 4 0 0 1-4 4M12 15v6m-5 0h10';
  paths['🚫']='M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0M6 6l12 12';
  paths['🌈']='M3 20v-8a9 9 0 0 1 18 0v8M7 20v-8a5 5 0 0 1 10 0v8M11 20v-8a1 1 0 0 1 2 0v8';
  paths['👓']='M2 12h8v7H2zM14 12h8v7h-8zM10 14h4M2 12l2-7m18 7-2-7';
  paths['💾']='M3 3h15l3 3v15H3zM7 3v6h10V3M7 21v-8h10v8';
  paths['🎵']='M9 17V4l12-2v13M9 7l12-2M9 17a3 3 0 1 1-3-3h3M21 15a3 3 0 1 1-3-3h3';
  paths['🚀']='M8 16l-4-1 3-6 4-1M8 16l1 4 6-3 1-4M8 16C10 7 15 3 21 3c0 6-4 11-13 13zM4 20l-1 1';
  function decorate(root) {
    if (!root.querySelectorAll) return;
    var images = Array.prototype.slice.call(root.querySelectorAll('img'));
    if(root.matches && root.matches('img')) images.unshift(root);
    for (var i=0;i<images.length;i++) {
      var image=images[i], src=image.getAttribute('src') || '';
      if (src.indexOf('/brand/app_logo_')!==-1 || src.indexOf('assets/brand/app_logo_')===0) {
        image.src='assets/moviesapamapuh/'+(src.indexOf('mark.png')!==-1 && src.indexOf('wordmark')===-1?'logo.png':'longlogowithtext.png');
        image.style.objectFit='contain';
      }
    }
    var selector='.settings-gate__title,.settings-gate__label,.addon-stremio-sync__title,button,#settingsGate span,#settingsGate label,#addonModal span,#addonModal label,#addonModal strong';
    var labels=Array.prototype.slice.call(root.querySelectorAll(selector));
    if(root.matches && root.matches(selector)) labels.unshift(root);
    for (var j=0;j<labels.length;j++) {
      var label=labels[j];
      for (var k=0;k<label.childNodes.length;k++) {
        var node=label.childNodes[k]; if(node.nodeType!==3) continue;
        var text=node.nodeValue, key=null;
        Object.keys(paths).some(function (p) { if(text.trim().indexOf(p)===0){key=p;return true;} return false; });
        if(!key) continue;
        var svg=document.createElementNS(svgNS,'svg'), path=document.createElementNS(svgNS,'path');
        svg.setAttribute('viewBox','0 0 24 24');svg.setAttribute('class','noir-icon');svg.setAttribute('aria-hidden','true');
        path.setAttribute('d',paths[key]);path.setAttribute('fill','none');path.setAttribute('stroke','currentColor');path.setAttribute('stroke-width','1.7');
        svg.appendChild(path);label.insertBefore(svg,node);node.nodeValue=text.replace(key,'');
      }
    }
  }
  function start() {
    decorate(document);
    // Observe additions, not animation/style changes; process each added subtree only.
    new MutationObserver(function (records) {
      records.forEach(function (record) { for(var i=0;i<record.addedNodes.length;i++) decorate(record.addedNodes[i].nodeType===3 ? record.addedNodes[i].parentNode : record.addedNodes[i]); });
    }).observe(document.body,{childList:true,subtree:true});
  }
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',start); else start();
}());
