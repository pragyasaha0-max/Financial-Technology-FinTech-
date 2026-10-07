/*
  Fintech Night: behaviour for fintech-night.css

  Load it from <head>, without defer, so the "hidden until scrolled" states apply before first paint:
    a script tag with src="fintech-night.js"

  What it does
    1. adds class "fn-js" to <html>        (the CSS only hides things when this is set)
    2. <body data-fn-bg>                   inserts the animated background + moving lines
    3. [data-fn-words]                     splits text into words that fade in on scroll
    4. .fn-reveal .fn-stagger .fn-bar      get class "is-in" when scrolled into view
    5. [data-fn-count="40"]                counts up to 40 when scrolled into view
                                           optional: data-fn-suffix="+"
    6. [data-fn-relay]                     lights the .fn-glow children one after another
    7. .fn-glow boxes                      get a cursor-following spotlight on hover

  If you add elements after page load (a framework, fetch, etc.) call FN.refresh().
*/
(function(){
  'use strict';
  var root = document.documentElement;
  root.classList.add('fn-js');

  var REVEAL = '.fn-reveal, .fn-stagger, .fn-bar, .fn-draw, [data-fn-words], [data-fn-count]';
  var reduce = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
  var io = null;

  /* ---- background with moving lines ---- */
  function addBackground(){
    if(document.querySelector('.fn-bg')) return;
    var bg = document.createElement('div');
    bg.className = 'fn-bg';
    bg.setAttribute('aria-hidden', 'true');
    bg.innerHTML =
      '<svg viewBox="0 0 1440 900" preserveAspectRatio="none">' +
      '<path d="M-50,180 C300,70 540,320 900,200 S1300,100 1500,210"/>' +
      '<path d="M-50,540 C260,440 640,660 980,520 S1340,430 1500,560"/>' +
      '<path d="M-50,820 C330,740 680,900 1040,800 S1370,720 1500,830"/>' +
      '</svg>';
    document.body.insertBefore(bg, document.body.firstChild);
  }

  /* ---- wrap each word in a span; keeps inline tags like <em> ---- */
  function splitWords(el){
    if(el.dataset.fnSplit === 'done') return;
    var i = 0;
    (function walk(node){
      Array.prototype.slice.call(node.childNodes).forEach(function(n){
        if(n.nodeType === 3){
          var frag = document.createDocumentFragment();
          n.textContent.split(/(\s+)/).forEach(function(part){
            if(!part) return;
            if(/^\s+$/.test(part)){ frag.appendChild(document.createTextNode(' ')); return; }
            var s = document.createElement('span');
            s.className = 'fn-w';
            s.style.setProperty('--i', i++);
            s.textContent = part;
            frag.appendChild(s);
          });
          node.replaceChild(frag, n);
        } else if(n.nodeType === 1){ walk(n); }
      });
    })(el);
    el.dataset.fnSplit = 'done';
  }

  /* ---- number count-up (ease-out) ---- */
  function countUp(el){
    if(el.dataset.fnDone === '1') return;
    el.dataset.fnDone = '1';
    var target = parseFloat(el.getAttribute('data-fn-count'));
    var suffix = el.getAttribute('data-fn-suffix') || '';
    if(isNaN(target)) return;
    if(reduce){ el.textContent = target + suffix; return; }
    var start = null, dur = 1100;
    function tick(now){
      if(start === null) start = now;
      var p = Math.min((now - start) / dur, 1);
      var v = target * (1 - Math.pow(1 - p, 3));
      el.textContent = (target % 1 ? v.toFixed(1) : Math.round(v)) + suffix;
      if(p < 1) requestAnimationFrame(tick); else el.textContent = target + suffix;
    }
    requestAnimationFrame(tick);
  }

  function reveal(el){
    el.classList.add('is-in');
    if(el.hasAttribute('data-fn-count')) countUp(el);
    Array.prototype.forEach.call(el.querySelectorAll('[data-fn-count]'), countUp);
  }

  function scan(){
    Array.prototype.forEach.call(document.querySelectorAll('[data-fn-words]'), splitWords);
    var els = document.querySelectorAll(REVEAL);
    Array.prototype.forEach.call(els, function(el){
      if(el.classList.contains('is-in') || el.dataset.fnWatch) return;
      el.dataset.fnWatch = '1';
      if(io) io.observe(el); else reveal(el);
    });
  }

  /* ---- one box at a time lights up: <div data-fn-relay> ... children with class fn-glow ---- */
  function startRelay(box){
    if(box.dataset.fnRelay === 'on') return;
    box.dataset.fnRelay = 'on';
    var step = parseInt(box.getAttribute('data-fn-relay'), 10) || 2600;
    var n = 0;
    function next(){
      var kids = box.querySelectorAll(':scope > .fn-glow');
      if(!kids.length || box.matches(':hover')) return;
      Array.prototype.forEach.call(kids, function(k){ k.classList.remove('is-lit'); });
      kids[n % kids.length].classList.add('is-lit');
      n++;
    }
    next();
    if(!reduce) setInterval(next, step);
  }

  /* ---- spotlight follows the cursor inside .fn-glow boxes ---- */
  document.addEventListener('pointermove', function(e){
    var t = e.target.closest && e.target.closest('.fn-glow');
    if(!t) return;
    var r = t.getBoundingClientRect();
    t.style.setProperty('--fn-mx', (e.clientX - r.left) + 'px');
    t.style.setProperty('--fn-my', (e.clientY - r.top) + 'px');
  }, {passive: true});

  function init(){
    if(document.body.hasAttribute('data-fn-bg')) addBackground();
    if('IntersectionObserver' in window){
      io = new IntersectionObserver(function(entries){
        entries.forEach(function(en){
          if(!en.isIntersecting) return;
          reveal(en.target);
          io.unobserve(en.target);
        });
      }, {threshold: 0.15});
    }
    scan();
    Array.prototype.forEach.call(document.querySelectorAll('[data-fn-relay]'), startRelay);
  }

  /* set a counter to a new value and play it again (used after content changes) */
  function count(el, target, suffix){
    el.setAttribute('data-fn-count', target);
    if(suffix !== undefined) el.setAttribute('data-fn-suffix', suffix);
    el.dataset.fnDone = '';
    if(el.closest('.is-in') || el.classList.contains('is-in')) countUp(el);
  }

  window.FN = {
    refresh: function(){ if(!io) return; scan(); Array.prototype.forEach.call(document.querySelectorAll('[data-fn-relay]'), startRelay); },
    count: count,
    theme: function(name){ root.setAttribute('data-fn-theme', name); }
  };

  if(document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
