(() => {
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];

  $('#year').textContent = new Date().getFullYear();

  /* ---- Mobile menu ---- */
  const btn = $('.menu-btn');
  const nav = $('.nav');
  const setMenu = (open) => {
    nav.classList.toggle('open', open);
    btn.setAttribute('aria-expanded', open);
    btn.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
  };
  btn.addEventListener('click', () => setMenu(!nav.classList.contains('open')));
  $$('a', nav).forEach(a => a.addEventListener('click', () => setMenu(false)));
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && nav.classList.contains('open')) { setMenu(false); btn.focus(); }
  });
  window.matchMedia('(min-width: 901px)').addEventListener('change', () => setMenu(false));

  /* ---- Reveal on scroll, staggered inside .stagger groups ---- */
  $$('.stagger').forEach(g => $$('.reveal', g).forEach((el, i) => el.style.setProperty('--d', `${i * 70}ms`)));
  const items = $$('.reveal');
  if (reduce || !('IntersectionObserver' in window)) {
    items.forEach(el => el.classList.add('in'));
  } else {
    const io = new IntersectionObserver((entries) => {
      entries.forEach(en => { if (en.isIntersecting) { en.target.classList.add('in'); io.unobserve(en.target); } });
    }, { threshold: 0.12, rootMargin: '0px 0px -6% 0px' });
    items.forEach(el => io.observe(el));
  }

  /* ---- Active nav link ---- */
  const links = $$('.nav a[href^="#"]');
  const map = new Map(links.map(a => [a.getAttribute('href').slice(1), a]));
  const spy = new IntersectionObserver((entries) => {
    entries.forEach(en => {
      if (!en.isIntersecting) return;
      links.forEach(a => { a.classList.remove('active'); a.removeAttribute('aria-current'); });
      const a = map.get(en.target.id);
      if (a) { a.classList.add('active'); a.setAttribute('aria-current', 'true'); }
    });
  }, { rootMargin: '-45% 0px -50% 0px' });
  $$('main section[id]').forEach(s => spy.observe(s));

  /* ---- Timeline progress ---- */
  const tl = $('#timeline');
  if (tl && !reduce) {
    const upd = () => {
      const r = tl.getBoundingClientRect();
      const p = (window.innerHeight * 0.6 - r.top) / r.height;
      tl.style.setProperty('--progress', Math.min(1, Math.max(0, p)).toFixed(3));
    };
    upd();
    window.addEventListener('scroll', () => requestAnimationFrame(upd), { passive: true });
    window.addEventListener('resize', upd);
  } else if (tl) {
    tl.style.setProperty('--progress', 1);
  }

  /* ---- Project dialogs (native <dialog>: focus trap, Esc, focus return) ---- */
  $$('[data-dialog]').forEach(opener => {
    const dlg = document.getElementById(opener.dataset.dialog);
    opener.addEventListener('click', () => {
      dlg.showModal();
      document.body.classList.add('dialog-open');
    });
    $('.dialog-close', dlg).addEventListener('click', () => dlg.close());
    dlg.addEventListener('click', (e) => { if (e.target === dlg) dlg.close(); });
    dlg.addEventListener('close', () => document.body.classList.remove('dialog-open'));
  });
})();
