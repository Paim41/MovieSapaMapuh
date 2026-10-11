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
  function decorate(root) {
    if (!root.querySelectorAll) return;
    var images = root.querySelectorAll('img');
    for (var i=0;i<images.length;i++) {
      var image=images[i], src=image.getAttribute('src') || '';
      if (src.indexOf('/brand/app_logo_')!==-1 || src.indexOf('assets/brand/app_logo_')===0) {
        image.src='assets/moviesapamapuh/'+(src.indexOf('mark.png')!==-1 && src.indexOf('wordmark')===-1?'logo.png':'longlogowithtext.png');
        image.style.objectFit='contain';
      }
    }
    var labels=root.querySelectorAll('.settings-gate__title,.settings-gate__label,.addon-stremio-sync__title,button');
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
      records.forEach(function (record) { for(var i=0;i<record.addedNodes.length;i++) decorate(record.addedNodes[i]); });
    }).observe(document.body,{childList:true,subtree:true});
  }
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',start); else start();
}());
