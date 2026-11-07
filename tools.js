/* Marketer's calculators (config-driven). Inputs stay in the browser. */
(() => {
  const tabs = document.getElementById('tk-tabs');
  const body = document.getElementById('tk-body');
  if (!tabs || !body) return;
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const inr = new Intl.NumberFormat('en-IN', { maximumFractionDigits: 0 });
  const dec = (n, d = 2) => Number(n).toLocaleString('en-IN', { minimumFractionDigits: 0, maximumFractionDigits: d });
  const money = (n) => (n < 0 ? '−₹' : '₹') + inr.format(Math.abs(n));
  const fmt = {
    money, x: (n) => dec(n, 2) + 'x', pct: (n) => dec(n, 1) + '%', num: (n) => inr.format(n),
    money2: (n) => (n < 0 ? '−₹' : '₹') + dec(Math.abs(n), 2)
  };
  const ok = (n) => Number.isFinite(n);
  const div = (a, b) => (b > 0 || b < 0 ? a / b : NaN);

  /* field: [key, label, unit, default, hint?]   out: [label, value, fmtKey, tone?] */
  const tools = [
    {
      id: 'roas', name: 'ROAS', title: 'ROAS & break-even',
      blurb: 'Revenue per rupee of ad spend, checked against the ROAS you need to break even.',
      fields: [['rev', 'Revenue from ads', '₹', 500000], ['spend', 'Ad spend', '₹', 100000], ['margin', 'Gross margin on products', '%', 40, 'Break-even ROAS = 1 ÷ margin']],
      calc(v) {
        const roas = div(v.rev, v.spend), be = div(100, v.margin), profit = v.rev * v.margin / 100 - v.spend;
        return {
          out: [['ROAS', roas, 'x'], ['Break-even ROAS', be, 'x'], ['Profit after ad spend', profit, 'money', profit < 0 ? 'bad' : 'good']],
          verdict: ok(roas) && ok(be) ? (roas >= be ? `ROAS is ${dec(roas - be)}x above break-even, so ads are paying for themselves.` : `ROAS is ${dec(be - roas)}x below break-even, so each order loses money before other costs.`) : 'Enter ad spend and margin above zero.',
          good: ok(roas) && ok(be) && roas >= be
        };
      }
    },
    {
      id: 'roi', name: 'ROI', title: 'ROI',
      blurb: 'Return on everything you put in, not just ad spend.',
      fields: [['rev', 'Revenue', '₹', 800000], ['spend', 'Ad spend', '₹', 150000], ['other', 'Other costs (product, shipping, tools)', '₹', 400000]],
      calc(v) {
        const cost = v.spend + v.other, profit = v.rev - cost, roi = div(profit * 100, cost);
        return {
          out: [['ROI', roi, 'pct', profit < 0 ? 'bad' : 'good'], ['Net profit', profit, 'money', profit < 0 ? 'bad' : 'good'], ['Total cost', cost, 'money']],
          verdict: ok(roi) ? (profit >= 0 ? `Every ₹1 invested returned ₹${dec(1 + roi / 100)}.` : `The campaign lost ₹${dec(-profit / cost)} for every ₹1 invested.`) : 'Enter a total cost above zero.',
          good: ok(roi) && profit >= 0
        };
      }
    },
    {
      id: 'blended', name: 'Blended ROAS', title: 'Blended ROAS (MER)',
      blurb: 'Total revenue ÷ total marketing spend. A cross-check on what each platform claims.',
      fields: [['mSpend', 'Meta ad spend', '₹', 200000], ['mRev', 'Revenue Meta reports', '₹', 800000], ['gSpend', 'Google ad spend', '₹', 150000], ['gRev', 'Revenue Google reports', '₹', 520000], ['oSpend', 'Other marketing spend', '₹', 50000], ['tRev', 'Total revenue, all sources', '₹', 1100000, 'Include organic, email and offline']],
      calc(v) {
        const spend = v.mSpend + v.gSpend + v.oSpend, blended = div(v.tRev, spend), claimed = v.mRev + v.gRev;
        const mR = div(v.mRev, v.mSpend), gR = div(v.gRev, v.gSpend), gap = v.tRev - claimed;
        return {
          out: [['Blended ROAS', blended, 'x'], ['Meta ROAS (reported)', mR, 'x'], ['Google ROAS (reported)', gR, 'x'], ['Total spend', spend, 'money'], ['Revenue unclaimed by ads', gap, 'money', gap < 0 ? 'bad' : '']],
          verdict: gap < 0 ? `Platforms claim ${money(-gap)} more than total revenue, so conversions are likely counted twice. Trust the blended number.` : 'Blended ROAS is usually lower than platform ROAS because it counts all spend against all revenue.',
          good: gap >= 0
        };
      }
    },
    {
      id: 'margin', name: 'Margin', title: 'Margin & break-even CAC',
      blurb: 'What each order really earns, and the highest ROAS and CAC you can afford.',
      fields: [['price', 'Selling price (per order)', '₹', 1999], ['cogs', 'Product cost (COGS)', '₹', 800], ['ship', 'Shipping & packaging', '₹', 120], ['fee', 'Payment / platform fee', '%', 2.5], ['target', 'Target profit per order after ads (optional)', '₹', 200]],
      calc(v) {
        const contrib = v.price - v.cogs - v.ship - v.price * v.fee / 100, m = div(contrib * 100, v.price);
        const be = div(v.price, contrib), tgt = div(v.price, contrib - v.target);
        return {
          out: [['Contribution per order', contrib, 'money', contrib < 0 ? 'bad' : 'good'], ['Contribution margin', m, 'pct'], ['Break-even ROAS', be, 'x'], ['Max CAC to break even', contrib, 'money'], ['ROAS for target profit', contrib - v.target > 0 ? tgt : NaN, 'x']],
          verdict: contrib <= 0 ? 'Costs are higher than the price, so no amount of ROAS fixes this order.' : `You can spend up to ${money(contrib)} to win an order before losing money; to also keep ${money(v.target)} profit, aim for ${ok(tgt) && contrib - v.target > 0 ? dec(tgt) + 'x ROAS' : 'a lower target'}.`,
          good: contrib > 0
        };
      }
    },
    {
      id: 'metrics', name: 'CTR · CPC · CPA', title: 'Ad metrics converter',
      blurb: 'CTR, CPC, CPM, conversion rate and CPA from the raw numbers in your ads manager.',
      fields: [['spend', 'Spend', '₹', 50000], ['impr', 'Impressions', '', 400000], ['clicks', 'Link clicks', '', 6000], ['conv', 'Conversions (purchases or leads)', '', 180], ['rev', 'Revenue (optional)', '₹', 360000]],
      calc(v) {
        const ctr = div(v.clicks * 100, v.impr), cpc = div(v.spend, v.clicks), cpm = div(v.spend * 1000, v.impr);
        const cvr = div(v.conv * 100, v.clicks), cpa = div(v.spend, v.conv), aov = div(v.rev, v.conv), roas = v.rev > 0 ? div(v.rev, v.spend) : NaN;
        return {
          out: [['CTR', ctr, 'pct'], ['CPC', cpc, 'money2'], ['CPM', cpm, 'money2'], ['Conversion rate', cvr, 'pct'], ['CPA / CPL', cpa, 'money2'], ['AOV', aov, 'money2'], ['ROAS', roas, 'x']],
          verdict: 'Read them together: CPM × CTR drives CPC, and CPC ÷ conversion rate gives CPA.',
          good: true
        };
      }
    },
    {
      id: 'ltv', name: 'LTV : CAC', title: 'LTV : CAC',
      blurb: 'Is a new customer worth what it costs to win them?',
      fields: [['aov', 'Average order value', '₹', 1800], ['orders', 'Orders per customer (lifetime)', '', 2.2], ['gm', 'Gross margin', '%', 45], ['cac', 'Customer acquisition cost', '₹', 450]],
      calc(v) {
        const ltv = v.aov * v.orders * v.gm / 100, ratio = div(ltv, v.cac), payback = div(v.cac, v.aov * v.gm / 100);
        return {
          out: [['Lifetime value (gross profit)', ltv, 'money'], ['LTV : CAC', ratio, 'x', ratio >= 3 ? 'good' : ratio < 1 ? 'bad' : ''], ['Orders to pay back CAC', payback, 'num2']],
          verdict: ok(ratio) ? (ratio >= 3 ? 'At or above 3:1, a commonly cited rule of thumb for healthy growth.' : ratio >= 1 ? 'Customers pay back, but below the common 3:1 rule of thumb, so growth is capital-hungry.' : 'Customers cost more than they return over their lifetime.') : 'Enter a CAC above zero.',
          good: ok(ratio) && ratio >= 1
        };
      }
    }
  ];
  fmt.num2 = (n) => dec(n, 1);

  /* ---------- render ---------- */
  const state = {};   // remembered values per tool
  let active = 0;
  const el = (tag, cls, txt) => { const e = document.createElement(tag); if (cls) e.className = cls; if (txt !== undefined) e.textContent = txt; return e; };

  tools.forEach((t, i) => {
    const b = el('button', 'tk-tab', t.name);
    b.type = 'button'; b.setAttribute('role', 'tab'); b.id = 'tk-tab-' + t.id;
    b.setAttribute('aria-controls', 'tk-body'); b.setAttribute('aria-selected', i === 0);
    b.tabIndex = i === 0 ? 0 : -1;
    b.addEventListener('click', () => select(i, true));
    b.addEventListener('keydown', (e) => {
      const k = e.key; let n = i;
      if (k === 'ArrowRight' || k === 'ArrowDown') n = (i + 1) % tools.length;
      else if (k === 'ArrowLeft' || k === 'ArrowUp') n = (i - 1 + tools.length) % tools.length;
      else if (k === 'Home') n = 0; else if (k === 'End') n = tools.length - 1; else return;
      e.preventDefault(); select(n, true);
    });
    tabs.appendChild(b);
  });

  const countUp = (node, to, f) => {
    if (reduce || !ok(to)) { node.textContent = ok(to) ? fmt[f](to) : '—'; return; }
    const from = parseFloat(node.dataset.v) || 0, t0 = performance.now(), D = 380;
    node.dataset.v = to;
    const step = (t) => {
      const p = Math.min(1, (t - t0) / D), e = 1 - Math.pow(1 - p, 3);
      node.textContent = fmt[f](from + (to - from) * e);
      if (p < 1) requestAnimationFrame(step); else node.textContent = fmt[f](to);
    };
    requestAnimationFrame(step);
  };

  function select(i, focus) {
    active = i;
    $$tabs().forEach((b, j) => { b.setAttribute('aria-selected', j === i); b.tabIndex = j === i ? 0 : -1; });
    if (focus) tabs.children[i].focus();
    body.setAttribute('aria-labelledby', 'tk-tab-' + tools[i].id);
    render();
  }
  const $$tabs = () => [...tabs.children];

  function render() {
    const t = tools[active];
    const vals = state[t.id] || (state[t.id] = Object.fromEntries(t.fields.map(f => [f[0], f[3]])));
    body.textContent = '';
    const left = el('div', 'tk-form'), right = el('div', 'tk-out');
    left.appendChild(el('h3', '', t.title));
    left.appendChild(el('p', 'tk-blurb', t.blurb));
    const inputs = {};
    t.fields.forEach(([k, label, unit, , hint]) => {
      const row = el('label', 'tk-field');
      row.appendChild(el('span', 'tk-label', label));
      const wrap = el('span', 'tk-input');
      if (unit === '₹') wrap.appendChild(el('i', '', '₹'));
      const inp = el('input'); inp.type = 'number'; inp.inputMode = 'decimal'; inp.min = '0'; inp.step = 'any'; inp.value = vals[k];
      inp.addEventListener('input', () => { vals[k] = inp.value === '' ? 0 : parseFloat(inp.value); update(); });
      inputs[k] = inp; wrap.appendChild(inp);
      if (unit === '%') wrap.appendChild(el('i', '', '%'));
      row.appendChild(wrap);
      if (hint) row.appendChild(el('span', 'tk-hint', hint));
      left.appendChild(row);
    });
    const actions = el('div', 'tk-actions');
    const reset = el('button', 'tk-btn', 'Reset'); reset.type = 'button';
    reset.addEventListener('click', () => { delete state[t.id]; render(); });
    const copy = el('button', 'tk-btn', 'Copy result'); copy.type = 'button';
    actions.append(reset, copy); left.appendChild(actions);

    const grid = el('dl', 'tk-results');
    const nodes = t.fields && [];
    right.appendChild(grid);
    const verdict = el('p', 'tk-verdict'); right.appendChild(verdict);
    right.appendChild(el('p', 'tk-note', 'Sample numbers for illustration, not results from my work.'));
    body.append(left, right);

    let lastText = '';
    function update() {
      const r = t.calc(vals);
      if (!grid.children.length) {
        r.out.forEach(o => { const w = el('div', 'tk-res'); w.appendChild(el('dt', '', o[0])); const dd = el('dd'); w.appendChild(dd); grid.appendChild(w); });
      }
      r.out.forEach((o, n) => {
        const w = grid.children[n]; w.dataset.tone = o[3] || '';
        countUp(w.lastChild, o[1], o[2]);
      });
      verdict.textContent = r.verdict; verdict.dataset.good = r.good ? '1' : '0';
      lastText = `${t.title}: ` + r.out.map(o => `${o[0]} ${ok(o[1]) ? fmt[o[2]](o[1]) : '—'}`).join('; ') + '. ' + r.verdict;
    }
    copy.addEventListener('click', async () => {
      try { await navigator.clipboard.writeText(lastText); copy.textContent = 'Copied ✓'; } catch (e) { copy.textContent = 'Copy failed'; }
      setTimeout(() => { copy.textContent = 'Copy result'; }, 1600);
    });
    update();
  }

  // let other sections deep-link into a tool: #toolkit?tool=margin via data attribute
  window.openCalc = (id) => { const i = tools.findIndex(t => t.id === id); if (i >= 0) select(i, false); };
  render();
})();
