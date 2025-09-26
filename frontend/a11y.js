
(function(){
  var lsKey='a11y:prefs';
  function read(){try{return JSON.parse(localStorage.getItem(lsKey)||'{}')}catch(e){return{}}}
  function save(p){localStorage.setItem(lsKey,JSON.stringify(p))}
  function setRootFont(px){document.documentElement.style.fontSize=px+'px'}
  function currentFont(){var s=getComputedStyle(document.documentElement).fontSize;return parseFloat(s)||16}
  function apply(p){
    var html=document.documentElement;
    html.classList.toggle('dark',!!p.dark);
    html.classList.toggle('hc',!!p.hc);
    html.classList.toggle('dys',!!p.dys);
    if(p.fontSize){setRootFont(p.fontSize)}
  }
  function init(){
    var p=read();
    if(p.dark==null){p.dark=window.matchMedia&&window.matchMedia('(prefers-color-scheme: dark)').matches}
    if(!p.fontSize){p.fontSize=16}
    apply(p);
    var el=document.querySelector('[data-a11y-root]');
    if(!el) return;
    el.addEventListener('click',function(ev){
      var t=ev.target.closest('[data-a]'); if(!t) return;
      ev.preventDefault();
      var a=t.getAttribute('data-a');
      if(a==='dark'){p.dark=!p.dark}
      if(a==='hc'){p.hc=!p.hc}
      if(a==='dys'){p.dys=!p.dys}
      if(a==='inc'){p.fontSize=Math.min((p.fontSize||16)+2,26)}
      if(a==='dec'){p.fontSize=Math.max((p.fontSize||16)-2,12)}
      if(a==='reset'){p.fontSize=16; p.hc=false; p.dys=false; p.dark=false}
      save(p); apply(p);
    });
  }
  document.addEventListener('DOMContentLoaded',init);
})();
