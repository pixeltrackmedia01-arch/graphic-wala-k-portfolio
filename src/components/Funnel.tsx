"use client";
import { useEffect, useRef, useState } from "react";
import { useMotionValueEvent, useReducedMotion, useScroll } from "motion/react";
import { FUNNEL } from "@/lib/content";
import { Reveal, SplitHeading } from "./Reveal";

/* ------------------------------------------------------------------
   Illustrative lead-filtering journey.
   100 audience "avatars" enter at the top; how many survive each stage
   is ANIMATION DATA ONLY (not client results).
------------------------------------------------------------------- */
const N = 100;
const SURVIVE = [100, 70, 32, 14, 6]; // illustrative survivors per stage
const WIDTH_RATIO = [1, 0.8, 0.6, 0.43, 0.3];
const BAND_Y = [0.07, 0.24, 0.41, 0.58, 0.75];

type Dot = { u: number; v: number; reach: number; side: number; ph: number };

function makeDots(): Dot[] {
  let seed = 11;
  const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
  const order = Array.from({ length: N }, (_, i) => i);
  for (let i = N - 1; i > 0; i--) {
    const j = Math.floor(rnd() * (i + 1));
    [order[i], order[j]] = [order[j], order[i]];
  }
  const rank = new Array<number>(N);
  order.forEach((dotIdx, r) => (rank[dotIdx] = r));
  return Array.from({ length: N }, (_, i) => {
    const r = rank[i];
    const reach = r < SURVIVE[4] ? 4 : r < SURVIVE[3] ? 3 : r < SURVIVE[2] ? 2 : r < SURVIVE[1] ? 1 : 0;
    return { u: ((i * 0.61803) % 1) * 2 - 1, v: rnd(), reach, side: rnd() < 0.5 ? -1 : 1, ph: rnd() * 6.28 };
  });
}

const clamp = (x: number, a = 0, b = 1) => Math.min(b, Math.max(a, x));
const smooth = (a: number, b: number, x: number) => { const t = clamp((x - a) / (b - a)); return t * t * (3 - 2 * t); };
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const TERRA = [194, 96, 58];
const BROWN = [122, 92, 71];
const mix = (c1: number[], c2: number[], t: number, a: number) =>
  `rgba(${Math.round(lerp(c1[0], c2[0], t))},${Math.round(lerp(c1[1], c2[1], t))},${Math.round(lerp(c1[2], c2[2], t))},${a.toFixed(3)})`;

type Geo = { W: number; H: number; L: number; cx: number; hw0: number; narrow: boolean };

function hw(g: Geo, q: number) {
  const i = clamp(q, 0, 4), k = Math.min(3, Math.floor(i));
  return g.hw0 * lerp(WIDTH_RATIO[k], WIDTH_RATIO[k + 1], i - k);
}
function yAt(g: Geo, q: number) {
  const i = clamp(q, 0, 4), k = Math.min(3, Math.floor(i));
  return g.H * lerp(BAND_Y[k], BAND_Y[k + 1], i - k);
}

function draw(ctx: CanvasRenderingContext2D, g: Geo, dots: Dot[], s: number, intro: number, time: number, font: string, wobble: boolean) {
  const { W, H } = g;
  ctx.clearRect(0, 0, W, H);

  /* funnel body */
  ctx.beginPath();
  for (let k = 0; k <= 40; k++) { const q = (k / 40) * 4.35; ctx.lineTo(g.cx - hw(g, q) - 8, yAt(g, q)); }
  for (let k = 40; k >= 0; k--) { const q = (k / 40) * 4.35; ctx.lineTo(g.cx + hw(g, q) + 8, yAt(g, q)); }
  ctx.closePath();
  ctx.fillStyle = "rgba(232,220,203,0.35)";
  ctx.fill();
  ctx.strokeStyle = "rgba(216,199,176,0.9)";
  ctx.lineWidth = 1.2;
  ctx.stroke();

  /* stage bands + labels */
  const activeStage = Math.min(4, Math.round(s));
  ctx.textBaseline = "middle";
  FUNNEL.forEach((f, i) => {
    const y = H * BAND_Y[i];
    const on = i === activeStage;
    ctx.strokeStyle = on ? "rgba(194,96,58,0.55)" : "rgba(216,199,176,0.6)";
    ctx.setLineDash([3, 5]);
    ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(g.narrow ? 0 : 4, y + H * 0.055); ctx.lineTo(W, y + H * 0.055); ctx.stroke();
    ctx.setLineDash([]);
    ctx.fillStyle = on ? "#a64d2b" : "rgba(91,82,74,0.6)";
    ctx.font = `700 ${g.narrow ? 11 : 11}px ${font}`;
    ctx.textAlign = "left";
    const label = g.narrow ? `0${i + 1}` : `0${i + 1}  ${f.key.toUpperCase()}`;
    ctx.fillText(label, 4, y - H * 0.03);
  });

  /* lead collection area (stage 3) */
  const leadA = smooth(1.5, 2.1, s);
  if (leadA > 0) {
    const y = yAt(g, 2), w = hw(g, 2) * 1.05, h = H * 0.07;
    ctx.save();
    ctx.globalAlpha = leadA;
    ctx.strokeStyle = "rgba(194,96,58,0.8)";
    ctx.fillStyle = "rgba(194,96,58,0.06)";
    ctx.setLineDash([5, 4]);
    ctx.lineWidth = 1.4;
    ctx.beginPath(); ctx.roundRect(g.cx - w, y + h * 0.15, w * 2, h, 12); ctx.fill(); ctx.stroke();
    ctx.setLineDash([]);
    ctx.fillStyle = "#a64d2b";
    ctx.font = `600 10px ${font}`;
    ctx.textAlign = "center";
    if (!g.narrow || W > 380) ctx.fillText("LEAD COLLECTION", g.cx, y + h * 0.15 + h + 11);
    ctx.restore();
  }

  /* dots */
  const baseR = clamp(W / 70, 4.6, 7);
  for (let i = 0; i < N; i++) {
    const d = dots[i];
    const ap = clamp((intro * 1.7 - (i / N) * 0.7) / 0.3);
    if (ap <= 0) continue;
    const q = Math.min(s, d.reach + 0.6);
    const ex = d.reach < 4 ? smooth(d.reach + 0.15, d.reach + 0.9, s) : 0;
    const spread = H * 0.045 * (1 - q / 6);
    let x = g.cx + d.u * hw(g, q) * 0.92 + (wobble ? Math.sin(time * 0.0012 + d.ph) * 1.6 : 0);
    let y = yAt(g, q) + (d.v - 0.5) * spread * 2 + (1 - ap) * -14;
    x += d.side * ex * W * 0.36;
    y += ex * H * 0.05;
    let alpha = ap * (1 - ex);
    if (d.reach === 4) { // converge to the revenue destination
      const c = smooth(3.55, 4, s);
      x = lerp(x, g.cx + d.u * hw(g, 4) * 0.55, c);
      y = lerp(y, yAt(g, 4) + (d.v - 0.5) * H * 0.02, c);
    }
    if (alpha <= 0.01) continue;

    const qual = smooth(1.2, 2.0, s);        // turns terra as qualified
    const colT = d.reach >= 2 ? qual : 0;
    const cardM = d.reach >= 3 ? smooth(2.55, 3.1, s) : 0;
    const checkM = d.reach >= 4 ? smooth(3.4, 3.85, s) : 0;
    const r = baseR * (1 + colT * 0.12);

    ctx.globalAlpha = alpha;
    if (checkM > 0.01) {
      ctx.beginPath(); ctx.arc(x, y, lerp(8, 9, checkM), 0, Math.PI * 2);
      ctx.fillStyle = `rgba(194,96,58,${checkM})`; ctx.fill();
      ctx.strokeStyle = `rgba(251,248,242,${checkM})`; ctx.lineWidth = 1.8; ctx.lineCap = "round"; ctx.lineJoin = "round";
      ctx.beginPath(); ctx.moveTo(x - 3.6, y + 0.2); ctx.lineTo(x - 1, y + 3); ctx.lineTo(x + 3.8, y - 2.8); ctx.stroke();
    }
    if (checkM < 0.99) {
      ctx.globalAlpha = alpha * (1 - checkM);
      if (cardM > 0.02) {
        const w = lerp(r * 1.9, 20, cardM), h = lerp(r * 2.3, 14, cardM);
        ctx.beginPath(); ctx.roundRect(x - w / 2, y - h / 2, w, h, lerp(r, 3.5, cardM));
        ctx.fillStyle = "#fbf8f2"; ctx.fill();
        ctx.strokeStyle = mix(BROWN, TERRA, 1, 0.95); ctx.lineWidth = 1.3; ctx.stroke();
        if (cardM > 0.55) {
          ctx.globalAlpha = alpha * (1 - checkM) * ((cardM - 0.55) / 0.45);
          ctx.fillStyle = "rgba(194,96,58,.85)"; ctx.fillRect(x - w / 2 + 3, y - h / 2 + 3.5, w * 0.5, 2);
          ctx.fillStyle = "rgba(122,92,71,.55)"; ctx.fillRect(x - w / 2 + 3, y - h / 2 + 7.5, w * 0.7, 1.6);
        }
      } else {
        // audience avatar: head + shoulders
        ctx.fillStyle = mix(BROWN, TERRA, colT, 1);
        ctx.beginPath(); ctx.arc(x, y - r * 0.75, r * 0.52, 0, Math.PI * 2); ctx.fill();
        ctx.beginPath(); ctx.ellipse(x, y + r * 0.78, r * 0.95, r * 0.78, 0, Math.PI, 0); ctx.fill();
      }
    }
    ctx.globalAlpha = 1;
  }

  /* revenue growth line (stage 5) */
  const rv = smooth(3.45, 4, s);
  if (rv > 0.01) {
    const x0 = g.cx - Math.min(hw(g, 4) * 1.5, W * 0.3), x1 = g.cx + Math.min(hw(g, 4) * 1.5, W * 0.3);
    const yB = H * 0.97, yT = H * 0.84;
    const pts = [0, 0.18, 0.12, 0.34, 0.3, 0.52, 0.5, 0.74, 1].map((v, k, a) => [lerp(x0, x1, k / (a.length - 1)), lerp(yB, yT, v)]);
    const upto = rv * (pts.length - 1);
    ctx.beginPath(); ctx.moveTo(pts[0][0], pts[0][1]);
    let last = pts[0];
    for (let k = 1; k < pts.length; k++) {
      if (k <= upto) { ctx.lineTo(pts[k][0], pts[k][1]); last = pts[k]; }
      else { const t = upto - (k - 1); if (t > 0) { last = [lerp(pts[k - 1][0], pts[k][0], t), lerp(pts[k - 1][1], pts[k][1], t)]; ctx.lineTo(last[0], last[1]); } break; }
    }
    ctx.strokeStyle = "#c2603a"; ctx.lineWidth = 2.6; ctx.lineCap = "round"; ctx.lineJoin = "round"; ctx.stroke();
    ctx.lineTo(last[0], yB); ctx.lineTo(pts[0][0], yB); ctx.closePath();
    const grad = ctx.createLinearGradient(0, yT, 0, yB);
    grad.addColorStop(0, "rgba(194,96,58,0.22)"); grad.addColorStop(1, "rgba(194,96,58,0)");
    ctx.fillStyle = grad; ctx.fill();
    ctx.beginPath(); ctx.arc(last[0], last[1], 4.2, 0, Math.PI * 2); ctx.fillStyle = "#c2603a"; ctx.fill();
    const chip = smooth(0.88, 1, rv);
    if (chip > 0) {
      ctx.save(); ctx.globalAlpha = chip;
      const label = "Purchase confirmed ✓";
      ctx.font = `600 11px ${font}`;
      const tw = ctx.measureText(label).width + 20, cxp = clamp(last[0] - tw / 2, 4, W - tw - 4), cyp = last[1] - 34 + (1 - chip) * 8;
      ctx.beginPath(); ctx.roundRect(cxp, cyp, tw, 24, 12); ctx.fillStyle = "#26221f"; ctx.fill();
      ctx.fillStyle = "#f4ecdf"; ctx.textAlign = "left"; ctx.fillText(label, cxp + 10, cyp + 12.5);
      ctx.restore();
    }
  }
}

export function Funnel() {
  const trackRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const target = useRef(0);
  const reduce = useReducedMotion();
  const [active, setActive] = useState(0);
  const { scrollYProgress } = useScroll({ target: trackRef, offset: ["start start", "end end"] });

  useMotionValueEvent(scrollYProgress, "change", (p) => {
    target.current = clamp(p / 0.92) * 4; // leave a short "rest" at the end
    const st = Math.min(4, Math.round(target.current));
    setActive((a) => (a === st ? a : st));
  });

  useEffect(() => {
    const canvas = canvasRef.current;
    const host = canvas?.parentElement;
    if (!canvas || !host) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const dots = makeDots();
    const font = getComputedStyle(document.body).fontFamily || "sans-serif";
    let geo: Geo = { W: 0, H: 0, L: 0, cx: 0, hw0: 0, narrow: false };
    let dpr = 1, raf = 0, visible = false, last = performance.now(), sCur = target.current, intro = reduce ? 1 : 0;

    const resize = () => {
      const r = host.getBoundingClientRect();
      dpr = Math.min(2, window.devicePixelRatio || 1);
      canvas.width = Math.round(r.width * dpr); canvas.height = Math.round(r.height * dpr);
      canvas.style.width = `${r.width}px`; canvas.style.height = `${r.height}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      const narrow = r.width < 460;
      const L = narrow ? 30 : Math.min(150, r.width * 0.2);
      geo = { W: r.width, H: r.height, L, cx: L + (r.width - L) / 2, hw0: ((r.width - L) / 2) * 0.94, narrow };
    };
    const ro = new ResizeObserver(() => { resize(); }); ro.observe(host); resize();

    const frame = (now: number) => {
      raf = 0;
      if (!visible) return;
      const dt = Math.min(0.05, (now - last) / 1000); last = now;
      if (!reduce) {
        intro = Math.min(1, intro + dt / 1.5);
        sCur += (target.current - sCur) * (1 - Math.pow(0.0005, dt));
      } else { intro = 1; sCur = target.current; }
      draw(ctx, geo, dots, sCur, intro, now, font, !reduce);
      const settled = reduce || (Math.abs(target.current - sCur) < 0.0008 && intro >= 1);
      // keep a very light idle wobble only while visible and motion is allowed
      raf = requestAnimationFrame(frame);
      if (settled && reduce) { cancelAnimationFrame(raf); raf = 0; }
    };
    const start = () => { if (!raf) { last = performance.now(); raf = requestAnimationFrame(frame); } };

    const io = new IntersectionObserver(([e]) => {
      visible = e.isIntersecting;
      if (visible) start(); else if (raf) { cancelAnimationFrame(raf); raf = 0; }
    }, { rootMargin: "100px" });
    io.observe(host);

    if (reduce) { // static redraw on scroll changes
      const unsub = scrollYProgress.on("change", () => { sCur = target.current; draw(ctx, geo, dots, sCur, 1, 0, font, false); });
      draw(ctx, geo, dots, sCur, 1, 0, font, false);
      return () => { unsub(); ro.disconnect(); io.disconnect(); };
    }
    return () => { if (raf) cancelAnimationFrame(raf); ro.disconnect(); io.disconnect(); };
  }, [reduce, scrollYProgress]);

  return (
    <section id="growth" className="relative bg-paper pt-24 md:pt-36" aria-labelledby="growth-title">
      <div className="wrap">
        <Reveal><p className="eyebrow mb-5">The marketing growth system</p></Reveal>
        <SplitHeading text="Growth Doesn't Happen by Accident. It's Built Step by Step." className="font-display max-w-4xl text-[clamp(2rem,5vw,4.2rem)] font-medium leading-[1.05] tracking-tight" />
        <span id="growth-title" className="sr-only">Growth Doesn&apos;t Happen by Accident. It&apos;s Built Step by Step.</span>
        <Reveal delay={0.1}><p className="mt-6 max-w-xl leading-relaxed text-ink-soft">Scroll to follow a large audience as it is filtered into qualified leads, then into customers and revenue.</p></Reveal>
      </div>

      <div ref={trackRef} className="relative mt-8 h-[380vh] lg:h-[440vh]">
        <div className="sticky top-16 h-[calc(100svh-4rem)] overflow-hidden">
          <div className="wrap grid h-full grid-rows-[minmax(0,1fr)_auto] gap-3 pb-[4.5rem] pt-3 lg:grid-cols-12 lg:grid-rows-1 lg:pb-6 lg:items-center lg:gap-10 lg:pt-6">
            {/* visual */}
            <div className="flex min-h-0 flex-col lg:col-span-7 lg:order-2 lg:h-full">
              <div className="relative min-h-0 flex-1">
                <canvas ref={canvasRef} role="img" className="absolute inset-0"
                  aria-label="Illustrative animation: about one hundred audience icons enter a funnel and are filtered through click, lead, conversion and revenue stages, ending in a rising revenue line." />
              </div>
              <p className="mt-2 text-center text-[0.7rem] italic leading-snug text-ink-soft">
                Illustrative marketing journey — audience numbers and filtering ratios are for animation only and are not actual client results.
              </p>
            </div>

            {/* stage copy */}
            <div className="lg:col-span-5 lg:order-1">
              <ol className="hidden space-y-3 lg:block">
                {FUNNEL.map((f, i) => (
                  <li key={f.key} aria-current={i === active ? "step" : undefined}
                    className={`rounded-2xl border p-5 transition-all duration-500 ${i === active ? "border-terra/50 bg-cream shadow-lg shadow-brown/10" : "border-transparent opacity-45"}`}>
                    <div className="flex items-baseline gap-4">
                      <span className={`font-display text-lg ${i === active ? "text-terra" : "text-ink-soft"}`}>0{i + 1}</span>
                      <div>
                        <h3 className="font-display text-2xl font-medium">{f.key}</h3>
                        <p className={`overflow-hidden leading-relaxed text-ink-soft transition-all duration-500 ${i === active ? "mt-2 max-h-28 opacity-100" : "max-h-0 opacity-0"}`}>{f.text}</p>
                      </div>
                    </div>
                  </li>
                ))}
              </ol>
              <div className="rounded-2xl border border-terra/40 bg-cream p-5 lg:hidden" aria-live="polite">
                <div className="flex items-center justify-between">
                  <h3 className="font-display text-2xl font-medium"><span className="mr-2 text-terra">0{active + 1}</span>{FUNNEL[active].key}</h3>
                  <span className="flex gap-1.5" aria-hidden>{FUNNEL.map((_, i) => <span key={i} className={`h-1.5 rounded-full transition-all ${i === active ? "w-6 bg-terra" : "w-1.5 bg-clay"}`} />)}</span>
                </div>
                <p className="mt-2 text-sm leading-relaxed text-ink-soft">{FUNNEL[active].text}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
