// src/boot.js  — import './alive.js'; import this after it. One line in your entry: import './boot.js';
import './alive.js';

const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const $  = (s, r=document) => r.querySelector(s);
const $$ = (s, r=document) => [...r.querySelectorAll(s)];

// record render errors so a thrown route (Pillar B) is visible, not a mystery blank
window.__bootErrors = [];
window.addEventListener('error', e => window.__bootErrors.push({ route: window.location.pathname, msg: e.message }));
window.addEventListener('unhandledrejection', e => window.__bootErrors.push({ route: window.location.pathname, msg: String(e.reason) }));

// reveal anything already on screen that the observer hasn't caught (Pillar A safety net)
function revealInView() {
  const fn = window.AliveKit?.countUp;
  $$('.reveal:not(.in)').forEach(e => {
    const r = e.getBoundingClientRect();
    if (r.top < window.innerHeight && r.bottom > 0) {
      e.classList.add('in');
      $$('[data-count]', e).forEach(n => fn && fn(n));
    }
  });
}
function hardReveal() { $$('.reveal:not(.in)').forEach(e => e.classList.add('in')); } // reduced motion / last resort

let t;
function onRender() {
  clearTimeout(t);
  t = setTimeout(() => {
    window.AliveKit?.refresh?.();   // re-bind rings/sparks/ripples/tabs for the new route
    reduce ? hardReveal() : revealInView();
  }, 60);
}

// framework-agnostic route detection: watch the root's subtree + history + hash
function root() { return $('#route') || $('main') || $('[data-route-root]') || document.body; }
new MutationObserver(onRender).observe(root(), { childList: true, subtree: true });
['pushState','replaceState'].forEach(m => { const o = window.history[m]; window.history[m] = function(){ const r=o.apply(this,arguments); window.dispatchEvent(new Event('cg:route')); return r; }; });
window.addEventListener('popstate', onRender); window.addEventListener('cg:route', onRender); window.addEventListener('hashchange', onRender);
window.addEventListener('load', onRender);
if (document.readyState !== 'loading') onRender();

// ongoing diagnostic, with the error log folded in
window.CGDBG = () => {
  const cs = window.getComputedStyle(document.documentElement);
  const vh = window.innerHeight, tab = $('.tabbar');
  const main = $('#route') || $('main') || $('[data-route-root]') || document.body;
  const last = [...main.querySelectorAll('*')].filter(e=>e.offsetHeight).pop();
  console.table({
    'tokens(--blue)':        !!cs.getPropertyValue('--blue').trim(),
    'AliveKit.refresh':      typeof window.AliveKit?.refresh === 'function',
    'reveal_dead_in_view':   $$('.reveal:not(.in)').filter(e=>{const r=e.getBoundingClientRect();return r.top<vh&&r.bottom>0;}).length,
    'literal_{{_in_DOM':     (document.body.innerText.match(/\{\{/g)||[]).length,
    'horizontal_overflow':   document.documentElement.scrollWidth > window.innerWidth + 1,
    'tab_overlapping':       !!(tab && last && last.getBoundingClientRect().bottom > tab.getBoundingClientRect().top + 4),
    'render_errors_logged':  window.__bootErrors.length
  });
  if (window.__bootErrors.length) console.warn('Route render errors →', window.__bootErrors);
};
