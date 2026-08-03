// Framework-agnostic helpers. Call these from your option-click,
// next/back handlers, and timer tick. That's the whole contract.

// (a) ripple origin so the CSS ripple starts under the finger/cursor
export function tapOrigin(e, el) {
  if (!el) return;
  const r = el.getBoundingClientRect();
  const x = (e.touches?.[0]?.clientX ?? e.clientX) - r.left;
  const y = (e.touches?.[0]?.clientY ?? e.clientY) - r.top;
  el.style.setProperty('--rx', x + 'px');
  el.style.setProperty('--ry', y + 'px');
}

// (b) animate the projected score; dir = +1 / -1 for the tick direction
export function setScore(el, value, prev) {
  if (!el) return;
  const from = prev ?? value, to = value, dur = 380, t0 = performance.now();
  el.dataset.up = to > from ? 'true' : 'false';
  el.dataset.down = to < from ? 'true' : 'false';
  (function step(t) {
    const k = Math.min(1, (t - t0) / dur);
    el.textContent = (from + (to - from) * (1 - Math.pow(1 - k, 3))).toFixed(2);
    if (k < 1) requestAnimationFrame(step);
  })(t0);
  setTimeout(() => { delete el.dataset.up; delete el.dataset.down; }, 420);
}

// (c) mark a navigator pill changed so it pops once
export function pillChanged(el) {
  if (!el) return;
  el.dataset.justChanged = 'true';
  setTimeout(() => delete el.dataset.justChanged, 320);
}

// (d) timer urgency — call each second with remaining seconds
export function timerTick(el, secsLeft, totalSecs) {
  if (!el) return;
  el.dataset.urgent = (secsLeft / totalSecs) <= 0.15 ? 'true' : 'false';
}

// (e) simple dom refresh
export function refresh(el) {
  if(!el) return;
  el.style.display = "none";
  void el.offsetHeight; /* trigger reflow */
  el.style.display = "";
}

// (f) Quiz Console logic
export function initQuiz(root) {
 if(!root) return;
 const opts = root.querySelectorAll(".opt");
 let answered = false;
 opts.forEach(opt => {
 opt.addEventListener("click", (e) => {
 if(answered) return;
 tapOrigin(e, opt);
 opts.forEach(o => o.dataset.selected = "false");
 opt.dataset.selected = "true";
 });
 });
}

// (g) Results screen initial animation
export function initResults(root) {
 if(!root) return;
 // Just a simple pop in for now
 const statCells = root.querySelectorAll(".res-stats .v");
 statCells.forEach((cell, i) => {
 cell.animate([
 { opacity: 0, transform: "translateY(10px)" },
 { opacity: 1, transform: "none" }
 ], { duration: 400, delay: i * 100, easing: "cubic-bezier(.22, 1, .36, 1)", fill: "both" });
 });
}
