/* Motion + interaction layer: funnel playbook, scroll-depth meter, cursor halo, tilt, magnetic buttons, count-up. */
(() => {
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const fine = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];

  /* ================= Funnel playbook ================= */
  const stages = {
    aware: {
      tier: 'Top of funnel · TOFU', title: 'Awareness',
      goal: 'Reach the right people and get noticed, without wasting spend on the wrong audience.',
      think: 'I start with who the product is for and what would make them stop scrolling. I test creative angles and audiences side by side (broad, interest and lookalike) and judge them on attention signals, not last-click sales.',
      q: 'Who is the buyer, and which creative angle earns their attention?',
      channels: ['Meta Ads prospecting', 'YouTube', 'Demand Gen', 'Google Display', 'Lookalike audiences', 'Creative testing'],
      metrics: ['CTR', 'CPC', 'LPV', 'Engagement'],
      link: ['metrics', 'Work out CTR, CPC and CPA →']
    },
    engage: {
      tier: 'Middle of funnel · MOFU', title: 'Engagement',
      goal: 'Turn attention into interest, so people click through, interact and come back.',
      think: 'I look at what people do after the first click. Retargeting engagers and video viewers, and sending them to the right landing page, shows which message actually moves people deeper into the funnel.',
      q: 'What do people do after the first click, and where do they leave?',
      channels: ['Meta retargeting', 'Landing pages', 'SEO and organic content', 'Email, WhatsApp and SMS (team-led)', 'A/B tests'],
      metrics: ['Engagement', 'CTR', 'LPV', 'CPL'],
      link: ['metrics', 'Work out CTR, CPC and CPA →']
    },
    consider: {
      tier: 'Middle of funnel · MOFU', title: 'Consideration',
      goal: 'Help interested people compare, trust the brand and decide.',
      think: 'High-intent search and shopping ads catch people who are actively comparing. On the site I tighten product pages, offers and proof, and use retargeting to remind people who looked but did not buy.',
      q: 'What stops a warm visitor from buying?',
      channels: ['Google Search', 'Google Shopping', 'Retargeting', 'Shopify product and landing pages', 'CRO'],
      metrics: ['CPC', 'CPA', 'Conversion rate'],
      link: ['roas', 'Check your break-even ROAS →']
    },
    buy: {
      tier: 'Bottom of funnel · BOFU', title: 'Purchase',
      goal: 'Convert profitably, and keep those buyers coming back.',
      think: 'I know the break-even ROAS before I scale anything. I optimize the checkout funnel, make sure purchases are tracked properly (GA4, GTM, Meta Pixel, CAPI) and only raise budgets where ROAS, CAC and AOV hold up. Then lifecycle journeys bring buyers back for repeat purchases.',
      q: 'What ROAS do I need for this to be profitable?',
      channels: ['Retargeting', 'Shopping and Search', 'Checkout funnel', 'Accurate tracking and attribution', 'Lifecycle journeys'],
      metrics: ['ROAS', 'CAC', 'CPA', 'AOV', 'Conversion rate', 'LTV'],
      link: ['margin', 'Calculate break-even ROAS and CAC →']
    }
  };
  const tabs = $$('.layer');
  const panel = $('#panel-funnel');
  if (tabs.length && panel) {
    const f = { tier: $('#fp-tier'), title: $('#fp-title'), goal: $('#fp-goal'), think: $('#fp-think'), q: $('#fp-q'), ch: $('#fp-channels'), me: $('#fp-metrics'), link: $('#fp-link') };
    const fill = (ul, items) => { ul.textContent = ''; items.forEach(t => { const li = document.createElement('li'); li.textContent = t; ul.appendChild(li); }); };
    const pick = (key, focus) => {
      const s = stages[key];
      tabs.forEach(b => { const on = b.dataset.stage === key; b.setAttribute('aria-selected', on); b.tabIndex = on ? 0 : -1; if (on && focus) b.focus(); });
      panel.setAttribute('aria-labelledby', 'tab-' + key);
      f.tier.textContent = s.tier; f.title.textContent = s.title; f.goal.textContent = s.goal; f.think.textContent = s.think; f.q.textContent = s.q;
      fill(f.ch, s.channels); fill(f.me, s.metrics);
      f.link.textContent = s.link[1]; f.link.dataset.calc = s.link[0];
      panel.dataset.stage = key;
      panel.classList.remove('swap'); void panel.offsetWidth; panel.classList.add('swap');
    };
    tabs.forEach((b, i) => {
      b.addEventListener('click', () => pick(b.dataset.stage, false));
      b.addEventListener('keydown', (e) => {
        let n = i;
        if (e.key === 'ArrowDown' || e.key === 'ArrowRight') n = (i + 1) % tabs.length;
        else if (e.key === 'ArrowUp' || e.key === 'ArrowLeft') n = (i - 1 + tabs.length) % tabs.length;
        else if (e.key === 'Home') n = 0; else if (e.key === 'End') n = tabs.length - 1; else return;
        e.preventDefault(); pick(tabs[n].dataset.stage, true);
      });
    });
    f.link.addEventListener('click', () => { if (window.openCalc) window.openCalc(f.link.dataset.calc); });
    pick('aware', false);
  }

  /* ================= Scroll depth meter ================= */
  const depth = $('#depth'), bar = $('#depth-bar'), num = $('#depth-num'), ticks = $$('#depth .d-ticks i');
  if (depth) {
    let ticking = false, lastMilestone = 0, shown = 0;
    const milestones = [25, 50, 75, 100];
    const update = () => {
      ticking = false;
      const max = document.documentElement.scrollHeight - window.innerHeight;
      const pct = max > 0 ? Math.min(100, Math.max(0, Math.round(window.scrollY / max * 100))) : 0;
      bar.style.strokeDashoffset = String(100 - pct);
      num.textContent = pct + '%';
      depth.classList.toggle('on', pct > 1);
      ticks.forEach(t => t.classList.toggle('hit', pct >= +t.dataset.t));
      const m = milestones.filter(x => pct >= x).pop() || 0;
      if (m !== lastMilestone) {
        lastMilestone = m;
        depth.setAttribute('aria-label', `Scroll depth ${m || pct} percent reached. Back to top`);
        if (m) { depth.classList.remove('ping'); void depth.offsetWidth; depth.classList.add('ping'); }
      }
      depth.classList.toggle('done', pct >= 99);
    };
    window.addEventListener('scroll', () => { if (!ticking) { ticking = true; requestAnimationFrame(update); } }, { passive: true });
    window.addEventListener('resize', update);
    depth.addEventListener('click', () => window.scrollTo({ top: 0, behavior: reduce ? 'auto' : 'smooth' }));
    update();
  }

  /* ================= Count-up on metrics ================= */
  const nums = $$('.metric-num');
  if (nums.length && !reduce && 'IntersectionObserver' in window) {
    const io = new IntersectionObserver((es) => es.forEach(en => {
      if (!en.isIntersecting) return;
      io.unobserve(en.target);
      const node = en.target, finalText = node.textContent;
      const parts = finalText.split(/(\d+(?:\.\d+)?)/);
      const t0 = performance.now(), D = 1100;
      const step = (t) => {
        const p = Math.min(1, (t - t0) / D), e = 1 - Math.pow(1 - p, 4);
        node.textContent = parts.map(s => /^\d/.test(s) ? (parseFloat(s) * e).toFixed((s.split('.')[1] || '').length) : s).join('');
        if (p < 1) requestAnimationFrame(step); else node.textContent = finalText;
      };
      requestAnimationFrame(step);
    }), { threshold: 0.8 });
    nums.forEach(n => io.observe(n));
  }

  /* ================= Pointer effects (fine pointers, motion allowed) ================= */
  if (reduce || !fine) return;

  // cursor halo
  const halo = $('#halo');
  if (halo) {
    let hx = -100, hy = -100, tx = -100, ty = -100, run = false;
    const loop = () => {
      hx += (tx - hx) * 0.18; hy += (ty - hy) * 0.18;
      halo.style.transform = `translate(${hx - 18}px, ${hy - 18}px)`;
      if (Math.abs(tx - hx) + Math.abs(ty - hy) > 0.3) requestAnimationFrame(loop); else run = false;
    };
    window.addEventListener('pointermove', (e) => {
      tx = e.clientX; ty = e.clientY; halo.classList.add('on');
      const hot = e.target.closest && e.target.closest('a, button, input, [role="tab"], [data-tilt]');
      halo.classList.toggle('hot', !!hot);
      if (!run) { run = true; requestAnimationFrame(loop); }
    }, { passive: true });
    document.addEventListener('pointerleave', () => halo.classList.remove('on'));
  }

  // 3D tilt
  $$('[data-tilt], .metric, .card').forEach(el => {
    let raf = 0;
    el.addEventListener('pointermove', (e) => {
      const r = el.getBoundingClientRect();
      const px = (e.clientX - r.left) / r.width - 0.5, py = (e.clientY - r.top) / r.height - 0.5;
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        el.style.transition = 'transform .12s ease-out, border-color .3s, background-color .3s, opacity .6s';
        el.style.transform = `perspective(800px) rotateX(${(-py * 6).toFixed(2)}deg) rotateY(${(px * 7).toFixed(2)}deg) translateY(-4px)`;
      });
    });
    el.addEventListener('pointerleave', () => {
      cancelAnimationFrame(raf);
      el.style.transform = ''; el.style.transition = '';
    });
  });

  // magnetic buttons
  $$('.btn-primary, .btn-accent, .btn-ghost').forEach(b => {
    b.addEventListener('pointermove', (e) => {
      const r = b.getBoundingClientRect();
      const dx = (e.clientX - (r.left + r.width / 2)) * 0.22, dy = (e.clientY - (r.top + r.height / 2)) * 0.3;
      b.style.transform = `translate(${dx.toFixed(1)}px, ${dy.toFixed(1)}px)`;
    });
    b.addEventListener('pointerleave', () => { b.style.transform = ''; });
  });
})();
