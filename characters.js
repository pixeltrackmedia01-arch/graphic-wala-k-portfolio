/* Interactive characters
 *  - Rig: reusable "head turns toward the cursor, body leans, breathes, reacts to hover" for any layered character.
 *  - Hero: seated character follows the cursor; after IDLE_MS of no activity she falls asleep (Zzz).
 *          Any activity makes the waving character pop in with a greeting, then the seated one is awake again.
 *  - Guide: the phone character lives bottom-left, follows the cursor and comments on the section you're reading.
 * prefers-reduced-motion: no tracking/motion; states and messages still change.
 */
(() => {
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
  const damp = (k, dt) => 1 - Math.exp(-k * dt);
  const store = {
    get(k) { try { return localStorage.getItem(k); } catch (e) { return null; } },
    set(k, v) { try { localStorage.setItem(k, v); } catch (e) { /* ignore */ } }
  };

  const IDLE_MS = 8000;       // no activity -> hero falls asleep
  const HI_MS = 4600;         // how long the waving greeter stays
  const SPEECH_MS = 3800;

  /* ================= Rig ================= */
  class Rig {
    constructor(el) {
      this.el = el;
      this.stage = $('.stage', el);
      this.head = $('.ch-head', el);
      const cs = getComputedStyle(el);
      const f = (n) => parseFloat(cs.getPropertyValue(n)) / 100;
      this.hx = f('--hx'); this.hy = f('--hy');
      this.amp = parseFloat(el.dataset.amp) || 1;
      this.reach = parseFloat(el.dataset.reach) || 420;
      this.base = parseFloat(el.dataset.scale) || 1.06;
      this.nx = this.ny = this.bx = this.by = 0;
      this.sleep = 0; this.sleepT = 0;
      this.hover = 0; this.hoverT = 0;
      this.pop = 0;
      this.phase = Math.random() * 6;
      this.on = true;             // on screen and enabled
    }
    update(dt, t, pointer) {
      const r = this.stage.getBoundingClientRect();
      let tx = 0, ty = 0;
      if (this.sleepT < 0.5 && r.width) {
        if (pointer) {
          const cx = r.left + r.width * this.hx, cy = r.top + r.height * this.hy;
          tx = Math.tanh((pointer.x - cx) / this.reach);
          ty = Math.tanh((pointer.y - cy) / this.reach);
        } else {                                   // idle glance around
          tx = Math.sin(t / 1000 * 0.45 + this.phase) * 0.18;
          ty = Math.sin(t / 1000 * 0.31 + this.phase) * 0.08;
        }
      }
      const a = this.amp;
      this.nx += (tx - this.nx) * damp(this.sleepT ? 3 : 9, dt);
      this.ny += (ty - this.ny) * damp(this.sleepT ? 3 : 9, dt);
      this.bx += (tx - this.bx) * damp(4.5, dt);
      this.by += (ty - this.by) * damp(4.5, dt);
      this.sleep += (this.sleepT - this.sleep) * damp(2.4, dt);
      this.hover += (this.hoverT - this.hover) * damp(7, dt);
      this.pop *= Math.exp(-dt * 4.2);

      const s = t / 1000;
      const breathe = Math.sin(s * (this.sleepT ? 1.3 : 2.0) + this.phase) * (this.sleepT ? 0.45 : 0.12);
      const bounce = Math.sin(s * 16) * this.pop;

      this.stage.style.transform =
        `scale(${(this.base + this.hover * 0.035).toFixed(4)}) translate(${(this.bx * 1.1 * a).toFixed(3)}%, ${(this.by * 0.5 * a + breathe * 0.5 - this.pop * 0.6).toFixed(3)}%) rotate(${(this.bx * 0.8 * a).toFixed(3)}deg)`;
      this.head.style.transform =
        `perspective(900px) translate(${(this.nx * 0.8 * a - this.sleep * 0.4).toFixed(3)}%, ${(this.ny * 0.4 * a + this.sleep * 0.9 + breathe * 0.7 - this.pop * 1.0 + bounce * 0.25).toFixed(3)}%) ` +
        `rotate(${(this.nx * 3 * a - this.sleep * 2.5 + bounce * 0.8).toFixed(3)}deg) ` +
        `rotateY(${(this.nx * 13 * a).toFixed(3)}deg) rotateX(${(-this.ny * 7 * a - this.sleep * 5 - this.hover * 3 + bounce).toFixed(3)}deg)`;
    }
  }

  /* ================= shared loop ================= */
  const rigs = $$('[data-rig]').map(el => new Rig(el));
  const byEl = new Map(rigs.map(r => [r.el, r]));
  let pointer = null, pageVisible = !document.hidden, rafId = 0, lastT = 0;

  function frame(t) {
    rafId = 0;
    if (!pageVisible) return;
    const dt = Math.min(0.05, (t - lastT) / 1000 || 0.016);
    lastT = t;
    for (const r of rigs) if (r.on) r.update(dt, t, pointer);
    rafId = requestAnimationFrame(frame);
  }
  function ensureLoop() {
    if (reduce || rafId || !pageVisible) return;
    lastT = performance.now();
    rafId = requestAnimationFrame(frame);
  }
  document.addEventListener('visibilitychange', () => { pageVisible = !document.hidden; ensureLoop(); });

  // pause rigs that are off screen
  const vis = new IntersectionObserver(es => es.forEach(e => { const r = byEl.get(e.target); if (r) r.on = e.isIntersecting; }), { rootMargin: '80px' });
  rigs.forEach(r => vis.observe(r.el));

  /* ================= Hero controller ================= */
  const portrait = $('#portrait');
  const speech = $('#speech');
  const frameEl = $('#portrait-frame');
  const rigA = byEl.get($('.rig-a'));
  const rigB = byEl.get($('.rig-b'));
  let heroVisible = true;
  let mode = 'awake';                 // 'asleep' | 'hi' | 'awake'
  let lastActive = performance.now();
  let bootAt = Infinity, lastY = window.scrollY;
  let returning = store.get('mc_seen') === '1';
  let speechTimer = 0, hiTimer = 0, blinkTimer = 0;

  function say(text, ms = SPEECH_MS) {
    clearTimeout(speechTimer);
    speech.textContent = text;
    speech.classList.remove('show'); void speech.offsetWidth; speech.classList.add('show');
    speechTimer = setTimeout(() => speech.classList.remove('show'), ms);
  }
  function setMode(m) {
    mode = m;
    portrait.classList.toggle('is-asleep', m === 'asleep');
    portrait.classList.toggle('is-hi', m === 'hi');
    if (rigA) rigA.sleepT = m === 'asleep' ? 1 : 0;
  }
  function sleepNow() {
    if (mode !== 'awake') return;
    speech.classList.remove('show');
    setMode('asleep');
  }
  function greet(message) {
    setMode('hi');
    if (rigB) rigB.pop = 1;
    if (rigA) rigA.pop = 0.6;
    say(message, HI_MS);
    store.set('mc_seen', '1');
    clearTimeout(hiTimer);
    hiTimer = setTimeout(() => { if (mode === 'hi') { setMode('awake'); lastActive = performance.now(); } }, HI_MS);
    ensureLoop();
  }
  function scheduleBlink() {
    clearTimeout(blinkTimer);
    blinkTimer = setTimeout(() => {
      if (mode === 'awake' && !reduce) {
        portrait.classList.add('is-blink');
        setTimeout(() => portrait.classList.remove('is-blink'), 150);
      }
      scheduleBlink();
    }, 2600 + Math.random() * 3200);
  }

  function onActivity(e) {
    const now = performance.now();
    if (now - bootAt < 600) return;                              // ignore load-time noise
    if (e && e.type === 'scroll') {
      if (Math.abs(window.scrollY - lastY) < 2) return;
      lastY = window.scrollY;
    }
    if (e && e.clientX !== undefined) pointer = { x: e.clientX, y: e.clientY };
    lastActive = now;
    if (mode === 'asleep' && heroVisible) greet(returning ? 'Welcome back! 👋 Good to see you again.' : 'Hi again! 👋 Welcome back.');
    ensureLoop();
  }
  ['pointermove', 'pointerdown', 'keydown', 'touchstart', 'wheel', 'scroll'].forEach(t =>
    window.addEventListener(t, onActivity, { passive: true }));

  new IntersectionObserver(([en]) => {
    heroVisible = en.isIntersecting;
    if (heroVisible && mode === 'asleep' && lastActive - bootAt > 600 && performance.now() - lastActive < 1200)
      greet('Hi again! 👋 Welcome back.');
  }, { threshold: 0.3 }).observe(portrait);

  // hover reaction
  frameEl.addEventListener('pointerenter', () => {
    const r = mode === 'hi' ? rigB : rigA;
    if (r) r.hoverT = 1;
    if (mode === 'awake') say('Hey there! 👀', 2200);
  });
  frameEl.addEventListener('pointerleave', () => { if (rigA) rigA.hoverT = 0; if (rigB) rigB.hoverT = 0; });
  frameEl.addEventListener('pointerdown', () => { const r = mode === 'hi' ? rigB : rigA; if (r) r.pop = 0.8; });

  // idle watcher
  setInterval(() => {
    if (!pageVisible) return;
    if (mode === 'awake' && performance.now() - lastActive > IDLE_MS) sleepNow();
  }, 500);

  /* ================= Guide ================= */
  const guide = $('#guide'), gBubble = $('#guide-bubble'), gText = $('#guide-text'), gLink = $('#guide-link');
  const gToggle = $('#guide-toggle'), gShow = $('#guide-show'), gRig = byEl.get($('#guide-rig'));
  const tips = {
    top: ['Hi, I’m your guide 👋 Scroll and I’ll point out the good stuff.', '#results', 'Start with the results'],
    results: ['These are the numbers from Mital’s resume, each with its context.', '#about', 'See the skills'],
    about: ['Skills are grouped by what Mital actually uses.', '#experience', 'See the experience'],
    experience: ['Three roles, newest first.', '#playbook', 'How Mital approaches a project'],
    playbook: ['Awareness → engagement → consideration → purchase. Click each stage!', '#toolkit', 'Try the calculators'],
    toolkit: ['ROAS, ROI, blended ROAS, margin and more. Play with the numbers!', '#work', 'See campaign highlights'],
    work: ['Campaign highlights. Tap “View details” on any card.', '#contact', 'Get in touch'],
    education: ['Education and languages.', '#contact', 'Say hello'],
    contact: ['Ready to talk? Email, call or message on LinkedIn.', 'mailto:mitalchikhaliya01@gmail.com', 'Email Mital']
  };
  let tipKey = 'top', tipTimer = 0, guideOn = store.get('mc_guide') !== 'off';

  function showTip(key, auto = true) {
    if (!guideOn) return;
    const t = tips[key]; if (!t) return;
    tipKey = key;
    gText.textContent = t[0];
    gLink.href = t[1]; gLink.textContent = t[2] + ' →';
    gBubble.classList.remove('show'); void gBubble.offsetWidth; gBubble.classList.add('show');
    guide.classList.remove('nod'); void guide.offsetWidth; guide.classList.add('nod');
    if (gRig) gRig.pop = 0.7;
    clearTimeout(tipTimer);
    if (auto) tipTimer = setTimeout(() => gBubble.classList.remove('show'), 6500);
  }
  function setGuide(on) {
    guideOn = on;
    store.set('mc_guide', on ? 'on' : 'off');
    guide.hidden = !on; gShow.hidden = on;
    gToggle.setAttribute('aria-pressed', String(on));
    if (gRig) gRig.on = on;
    if (on) showTip(tipKey);
  }
  gToggle.addEventListener('click', () => setGuide(false));
  gShow.addEventListener('click', () => setGuide(true));
  guide.addEventListener('pointerenter', () => { if (gRig) gRig.hoverT = 1; });
  guide.addEventListener('pointerleave', () => { if (gRig) gRig.hoverT = 0; });
  $('#guide-rig').addEventListener('click', () => showTip(tipKey, false));
  // keep the tip visible while the pointer is on the guide
  guide.addEventListener('pointerenter', () => { clearTimeout(tipTimer); gBubble.classList.add('show'); });
  guide.addEventListener('pointerleave', () => { clearTimeout(tipTimer); tipTimer = setTimeout(() => gBubble.classList.remove('show'), 4000); });

  const secIds = ['results', 'about', 'experience', 'playbook', 'toolkit', 'work', 'education', 'contact'];
  const secObs = new IntersectionObserver(es => es.forEach(e => {
    if (e.isIntersecting && e.target.id !== tipKey) showTip(e.target.id);
  }), { rootMargin: '-45% 0px -50% 0px' });
  secIds.forEach(id => { const el = document.getElementById(id); if (el) secObs.observe(el); });
  const topObs = new IntersectionObserver(([e]) => { if (e.isIntersecting) { tipKey = 'top'; gBubble.classList.remove('show'); } }, { threshold: 0.6 });
  topObs.observe($('.hero'));

  // pointer for rigs (also feeds hero activity via window listener above)
  window.addEventListener('pointermove', e => { pointer = { x: e.clientX, y: e.clientY }; }, { passive: true });

  /* ================= boot ================= */
  function boot() {
    bootAt = performance.now(); lastActive = bootAt;
    if (returning) {
      setMode('asleep');                                         // napping when you come back
      if (rigA) { rigA.sleep = 1; rigA.sleepT = 1; }
    } else {
      scheduleBlink();
      setTimeout(() => greet('Hi, I’m Mital! 👋 Welcome to my portfolio.'), 900);
    }
    scheduleBlink();
    setGuide(guideOn);
    ensureLoop();
  }
  const img = $('.ch-body', $('.rig-a'));
  if (img.complete) boot(); else { img.addEventListener('load', boot, { once: true }); img.addEventListener('error', boot, { once: true }); }
})();
