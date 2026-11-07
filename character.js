/* Interactive hero character
 * - Head and body lean toward the cursor (head turns in 3D, body follows more gently).
 * - After IDLE_MS of no activity she falls asleep: eyes close, mouth relaxes, Zzz float.
 * - Any movement/tap/key wakes her with a small startle and a greeting bubble.
 * - Returning visitors (localStorage flag) start asleep and get "Welcome back".
 * - prefers-reduced-motion: no tracking or motion; sleep/wake still change state (static Zzz, bubble).
 */
(() => {
  const portrait = document.getElementById('portrait');
  const frame = document.getElementById('portrait-frame');
  const stage = document.getElementById('stage');
  const head = document.getElementById('ch-head');
  const speech = document.getElementById('speech');
  if (!portrait || !frame || !stage || !head || !speech) return;

  const IDLE_MS = 8000;
  const SPEECH_MS = 3600;
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- state ---------- */
  let asleep = false;
  let lastActive = performance.now();
  let pointer = null;               // last pointer position in viewport coords
  let visible = true;               // hero portrait on screen
  let pageVisible = !document.hidden;
  let nx = 0, ny = 0;               // smoothed head target (-1..1)
  let bx = 0, by = 0;               // smoothed body target (-1..1)
  let sleepAmt = 0;                 // 0 awake .. 1 asleep (eased)
  let pop = 0;                      // startle impulse on wake
  let speechTimer = 0, blinkTimer = 0, rafId = 0, lastT = 0;

  /* ---------- helpers ---------- */
  const store = {
    get() { try { return localStorage.getItem('mc_seen'); } catch (e) { return null; } },
    set() { try { localStorage.setItem('mc_seen', '1'); } catch (e) { /* ignore */ } }
  };
  const hasPhoto = () => portrait.classList.contains('has-photo');

  function say(text) {
    clearTimeout(speechTimer);
    speech.textContent = text;
    // restart transition even if already visible
    speech.classList.remove('show');
    void speech.offsetWidth;
    speech.classList.add('show');
    speechTimer = setTimeout(() => speech.classList.remove('show'), SPEECH_MS);
  }

  function sleep() {
    if (asleep) return;
    asleep = true;
    speech.classList.remove('show');
    portrait.classList.add('is-asleep');
    ensureLoop();
  }

  function wake(message) {
    if (!asleep) return;
    asleep = false;
    portrait.classList.remove('is-asleep');
    pop = 1;
    say(message);
    store.set();
    scheduleBlink();
    ensureLoop();
  }

  /* ---------- activity ---------- */
  let bootAt = Infinity, lastY = window.scrollY;
  function onActivity(e) {
    const now = performance.now();
    if (now - bootAt < 600) return;                              // ignore load-time noise
    if (e && e.type === 'scroll') {                              // only real scrolling counts
      if (Math.abs(window.scrollY - lastY) < 2) return;
      lastY = window.scrollY;
    }
    lastActive = now;
    if (e && e.clientX !== undefined) pointer = { x: e.clientX, y: e.clientY };
    if (asleep && visible && hasPhoto()) wake(returning ? 'Welcome back! 👋 Good to see you again.' : 'Hi again! 👋 Welcome back.');
    ensureLoop();
  }
  let returning = store.get() === '1';
  ['pointermove', 'pointerdown', 'keydown', 'touchstart', 'wheel', 'scroll'].forEach(t =>
    window.addEventListener(t, onActivity, { passive: true }));

  new IntersectionObserver(([en]) => {
    visible = en.isIntersecting;
    if (visible && asleep && lastActive - bootAt > 600 && performance.now() - lastActive < 1200 && hasPhoto()) wake('Hi again! 👋 Welcome back.');
    ensureLoop();
  }, { threshold: 0.3 }).observe(portrait);

  document.addEventListener('visibilitychange', () => { pageVisible = !document.hidden; if (pageVisible) lastActive = performance.now(); ensureLoop(); });

  /* ---------- blinking ---------- */
  function scheduleBlink() {
    clearTimeout(blinkTimer);
    blinkTimer = setTimeout(() => {
      if (!asleep && !reduce) {
        portrait.classList.add('is-blink');
        setTimeout(() => portrait.classList.remove('is-blink'), 150);
      }
      scheduleBlink();
    }, 2600 + Math.random() * 3200);
  }

  /* ---------- animation loop ---------- */
  const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
  const damp = (k, dt) => 1 - Math.exp(-k * dt);

  function ensureLoop() {
    if (reduce || rafId || !visible || !pageVisible) return;
    lastT = performance.now();
    rafId = requestAnimationFrame(tick);
  }

  function tick(t) {
    rafId = 0;
    if (!visible || !pageVisible) return;
    const dt = Math.min(0.05, (t - lastT) / 1000 || 0.016);
    lastT = t;

    // idle -> sleep
    if (!asleep && t - lastActive > IDLE_MS && hasPhoto()) sleep();

    // gaze target from pointer relative to the head
    let tx = 0, ty = 0;
    if (!asleep && pointer) {
      const r = frame.getBoundingClientRect();
      const cx = r.left + r.width * 0.37;
      const cy = r.top + r.height * 0.30;
      tx = Math.tanh((pointer.x - cx) / 420);
      ty = Math.tanh((pointer.y - cy) / 420);
    }

    nx += (tx - nx) * damp(asleep ? 3 : 9, dt);
    ny += (ty - ny) * damp(asleep ? 3 : 9, dt);
    bx += (tx - bx) * damp(4.5, dt);
    by += (ty - by) * damp(4.5, dt);
    sleepAmt += ((asleep ? 1 : 0) - sleepAmt) * damp(2.4, dt);
    pop *= Math.exp(-dt * 4.2);

    const s = t / 1000;
    const breathe = Math.sin(s * (asleep ? 1.3 : 2.0)) * (asleep ? 0.45 : 0.12);       // % of stage
    const bounce = Math.sin(s * 16) * pop;                                           // startle wobble

    // body: gentle lean + breathing
    stage.style.transform =
      `scale(1.06) translate(${(bx * 1.3).toFixed(3)}%, ${(by * 0.5 + breathe * 0.5 - pop * 0.6).toFixed(3)}%) rotate(${(bx * 0.9).toFixed(3)}deg)`;

    // head: turn toward cursor; droop when asleep
    const droopY = sleepAmt * 1.0;                  // % down
    const droopRot = sleepAmt * -2.5;                // deg, tilts toward her hand
    const droopX = sleepAmt * -0.5;
    head.style.transform =
      `perspective(900px) translate(${(nx * 1.0 + droopX).toFixed(3)}%, ${(ny * 0.45 + droopY + breathe * 0.7 - pop * 1.1 + bounce * 0.25).toFixed(3)}%) ` +
      `rotate(${(nx * 3.2 + droopRot + bounce * 0.8).toFixed(3)}deg) ` +
      `rotateY(${(nx * 13).toFixed(3)}deg) rotateX(${(-ny * 7 - sleepAmt * 6 + bounce).toFixed(3)}deg)`;

    rafId = requestAnimationFrame(tick);
  }

  /* ---------- boot ---------- */
  function boot() {
    if (!hasPhoto()) return;
    bootAt = performance.now(); lastActive = bootAt;                       // placeholder mode: nothing to animate
    if (returning) {
      asleep = true;                               // she's napping when you come back
      sleepAmt = 1;
      portrait.classList.add('is-asleep');
    } else {
      setTimeout(() => { if (!asleep) say('Hi, I’m Mital! 👋 Welcome.'); store.set(); }, 1100);
      scheduleBlink();
    }
    if (reduce) {
      // no tracking/motion; still allow sleep/wake state changes
      setInterval(() => { if (!asleep && performance.now() - lastActive > IDLE_MS) sleep(); }, 1000);
    } else {
      ensureLoop();
    }
  }

  // script.js sets .has-photo once the image has loaded
  if (hasPhoto()) boot();
  else {
    const mo = new MutationObserver(() => { if (hasPhoto()) { mo.disconnect(); boot(); } });
    mo.observe(portrait, { attributes: true, attributeFilter: ['class'] });
  }
})();
