"use client";
import { useEffect, useId, useRef, useState, useSyncExternalStore } from "react";
import { preload } from "react-dom";
import { AnimatePresence, animate, motion, useAnimationFrame, useMotionValue, useReducedMotion, useSpring, useTransform } from "motion/react";
import { RIG } from "@/lib/characterRig";
import { useCharacterMachine, type CharState } from "@/lib/useCharacterMachine";

const clamp = (x: number, a = -1, b = 1) => Math.min(b, Math.max(a, x));
const { w: W, h: H } = RIG;
const [faceX, faceY] = RIG.face;
export type PoseName = "hello" | "think" | "cross" | "sleep";
type PoseRig = { src: string; fadeBottom: boolean; bottom: number; head?: HeadRig };
type EyeRig = { iris: { cx: number; cy: number; r: number }; open: { cx: number; cy: number; rx: number; ry: number; rot: number }; lidTop: string; lidBottom: string; lash: string; scleraTop: string; scleraBottom: string };
type HeadRig = { cutTop: number; cutBottom: number; pivot: readonly number[]; face: readonly number[]; eyes: { a: EyeRig; b: EyeRig } };
const POSE_RIGS = RIG.poses as unknown as Record<string, PoseRig>;
const POSES = Object.keys(POSE_RIGS);
const HAS_SLEEP = "sleep" in POSE_RIGS;   // optional dedicated sleeping render; otherwise sleep = crossed-arm pose + closed lids + head tilt (rig)
const maskTop = (cutTop: number, cutBottom: number) => [
  `linear-gradient(to bottom, #000 ${(cutTop / H) * 100}%, transparent ${(cutBottom / H) * 100}%)`,   // head: above the neck
  `linear-gradient(to bottom, transparent ${(cutTop / H) * 100 - 0.15}%, #000 ${(cutTop / H) * 100}%)`, // body: below it
] as const;

/* Phones only (tablets keep the desktop experience): narrow screens, or a short landscape touch screen. */
const PHONE_QUERY = "(max-width: 639px), (pointer: coarse) and (max-height: 500px)";
const subscribePhone = (cb: () => void) => { const m = matchMedia(PHONE_QUERY); m.addEventListener("change", cb); return () => m.removeEventListener("change", cb); };
const usePhone = () => useSyncExternalStore(subscribePhone, () => matchMedia(PHONE_QUERY).matches, () => false);
const HINT_KEY = "mc_desktop_hint_seen";
const HINT_TEXT = "For the Full Experience, Go Desktop!";
const [HEAD_MASK, BODY_MASK] = maskTop(RIG.cutTop, RIG.cutBottom);

const MSG = { greeting: "Hi there!", welcomeBack: "Welcome back! 👋", sleeping: "Taking a tiny break… 😴" } as const;

type EyeKey = "a" | "b";

function Eye({ k, id, e, src, gx, gy, lid }: { k: EyeKey; id: string; e: EyeRig; src: string; gx: ReturnType<typeof useSpring>; gy: ReturnType<typeof useSpring>; lid: ReturnType<typeof useMotionValue<number>> }) {
  const o = e.open;
  const irisX = useTransform(gx, (v) => v * 3.2);
  const irisY = useTransform(gy, (v) => v * 2.1);
  const lashOpacity = useTransform(lid, (v) => clamp(v * 1.4 - 0.3, 0, 1));
  const lashY = o.cy + o.ry * 0.28;
  return (
    <g>
      <defs>
        <clipPath id={`${id}-o${k}`}><ellipse cx={o.cx} cy={o.cy} rx={o.rx} ry={o.ry} transform={`rotate(${o.rot} ${o.cx} ${o.cy})`} /></clipPath>
        <clipPath id={`${id}-i${k}`}><circle cx={e.iris.cx} cy={e.iris.cy} r={e.iris.r} /></clipPath>
        <linearGradient id={`${id}-s${k}`} x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor={e.scleraTop} /><stop offset="1" stopColor={e.scleraBottom} /></linearGradient>
        <linearGradient id={`${id}-l${k}`} x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor={e.lidTop} /><stop offset="1" stopColor={e.lidBottom} /></linearGradient>
        <filter id={`${id}-b${k}`} x="-20%" y="-30%" width="140%" height="160%"><feGaussianBlur stdDeviation="1.6" /></filter>
      </defs>
      {/* iris + pupil: the original pixels, cropped to the iris and moved inside the eye opening */}
      <g clipPath={`url(#${id}-o${k})`}>
        <circle cx={e.iris.cx} cy={e.iris.cy} r={e.iris.r - 0.8} fill={`url(#${id}-s${k})`} />
        <motion.g style={{ x: irisX, y: irisY }}>
          <g clipPath={`url(#${id}-i${k})`}><image href={src} width={W} height={H} /></g>
        </motion.g>
      </g>
      {/* eyelid: scales down from the top to blink / close */}
      <motion.ellipse cx={o.cx} cy={o.cy} rx={o.rx + 0.15} ry={o.ry + 0.1} fill={`url(#${id}-l${k})`} filter={`url(#${id}-b${k})`}
        transform={`rotate(${o.rot} ${o.cx} ${o.cy})`} style={{ scaleY: lid, originX: 0.5, originY: 0 }} />
      <motion.path d={`M ${o.cx - o.rx * 0.8} ${lashY - 0.4} Q ${o.cx} ${lashY + o.ry * 0.7} ${o.cx + o.rx * 0.8} ${lashY - 0.4}`}
        fill="none" stroke={e.lash} strokeWidth={1.6} strokeLinecap="round" style={{ opacity: lashOpacity }} />
    </g>
  );
}

export function Character() {
  const reduce = !!useReducedMotion();
  const { state, sleepBubble, welcomeBubble, wake, salute } = useCharacterMachine();
  const id = useId().replace(/:/g, "");
  const root = useRef<HTMLDivElement>(null);
  const [hover, setHover] = useState<PoseName | null>(null);
  const phone = usePhone();
  const phoneRef = useRef(phone); phoneRef.current = phone;
  // The state machine decides the base pose: wave while greeting / waking / welcoming back, otherwise crossed arms
  // (or the optional sleep render while asleep). Nav hover can swap in the thinking pose on non-phones, only while she is active.
  const base: PoseName = state === "greeting" || state === "waking" || state === "welcome-back" ? "hello" : state === "sleeping" && HAS_SLEEP ? "sleep" : "cross";
  const pose: PoseName = !phone && state === "active" && hover ? hover : base;
  const [hint, setHint] = useState(false);
  preload(RIG.body, { as: "image", fetchPriority: "high" });

  /* motion values: updated outside React, so tracking never re-renders */
  const gxT = useMotionValue(0), gyT = useMotionValue(0);
  const gx = useSpring(gxT, { stiffness: 260, damping: 26, mass: 0.5 });    // eyes: quick
  const gy = useSpring(gyT, { stiffness: 260, damping: 26, mass: 0.5 });
  const hx = useSpring(gxT, { stiffness: 70, damping: 18, mass: 0.9 });     // head: slower, so it trails the eyes
  const hy = useSpring(gyT, { stiffness: 70, damping: 18, mass: 0.9 });
  const blink = useMotionValue(0), sleepy = useMotionValue(0), tilt = useMotionValue(0);
  const elbowRot = useMotionValue(0), wristRot = useMotionValue(0), fingerRot = useMotionValue(0);
  const wave = useRef({ amp: 0.1, freq: 0.32, target: 0.1, targetFreq: 0.32, phase: 0, until: 0 });
  const baseOpacity = useMotionValue(1);
  const lid = useTransform([blink, sleepy], ([b, s]: number[]) => Math.max(b, s));
  const headRotate = useTransform([hx, tilt], ([g, t]: number[]) => g * 2.4 + t);
  const headX = useTransform(hx, (v) => `${v * 0.55}%`);
  const headY = useTransform([hy, tilt], ([g, t]: number[]) => `${g * 0.35 + t * 0.15}%`);

  const stateRef = useRef<CharState>(state); stateRef.current = state;
  const poseRef = useRef<PoseName>(pose); poseRef.current = pose;
  const hasMouse = useRef(false);
  const waving = useRef(false);
  const canTrack = () => !reduce && !phoneRef.current && (poseRef.current === "hello" || poseRef.current === "cross") && (stateRef.current === "greeting" || stateRef.current === "active" || stateRef.current === "welcome-back");

  /* pose changes come from the navigation (hover) via a window event */
  useEffect(() => {
    const onPose = (e: Event) => !phoneRef.current && setHover(((e as CustomEvent<PoseName | null>).detail ?? null));
    window.addEventListener("character-pose", onPose);
    return () => window.removeEventListener("character-pose", onPose);
  }, []);

  /* warm the other poses so a crossfade never waits on the network */
  useEffect(() => {
    const warm = (u: string) => { const i = new Image(); i.src = u; i.decode?.().catch(() => {}); };
    POSES.forEach((n) => warm(POSE_RIGS[n].src));
  }, []);

  /* phones: after the first wave, one friendly suggestion per session; fades after 7 s, tap to dismiss */
  useEffect(() => {
    if (state !== "active" || !phone) return;
    let seen = false; try { seen = sessionStorage.getItem(HINT_KEY) === "1"; } catch {}
    if (seen) return;
    let t2: ReturnType<typeof setTimeout>;
    const t1 = setTimeout(() => {                       // let the "Hi there!" bubble finish fading first: never two messages at once
      setHint(true); try { sessionStorage.setItem(HINT_KEY, "1"); } catch {}
      t2 = setTimeout(() => setHint(false), 7000);
    }, 900);
    return () => { clearTimeout(t1); clearTimeout(t2); setHint(false); };
  }, [state, phone]);
  useEffect(() => {
    const a = animate(baseOpacity, pose === "hello" ? 1 : 0, { duration: reduce ? 0 : 0.7, ease: "easeInOut" });
    if (pose !== "hello" && pose !== "cross") { gxT.set(0); gyT.set(0); }
    return () => a.stop();
  }, [pose, reduce, baseOpacity, gxT, gyT]);

  /* cursor tracking: mouse / pen only. Leaving the window re-centres the gaze. */
  useEffect(() => {
    if (reduce) return;
    const onMove = (e: PointerEvent) => {
      if (e.pointerType === "touch") return;
      hasMouse.current = true;
      if (!canTrack() || !root.current) return;
      const r = root.current.getBoundingClientRect();
      const face = poseRef.current === "cross" && POSE_RIGS.cross.head ? POSE_RIGS.cross.head.face : [faceX, faceY];
      const fx = r.left + (face[0] / W) * r.width, fy = r.top + (face[1] / H) * r.height;
      gxT.set(Math.tanh((e.clientX - fx) / (window.innerWidth * 0.32)));
      gyT.set(Math.tanh((e.clientY - fy) / (window.innerHeight * 0.32)) * 0.9);
    };
    const recentre = () => { gxT.set(0); gyT.set(0); };
    window.addEventListener("pointermove", onMove, { passive: true });
    document.documentElement.addEventListener("mouseleave", recentre);
    return () => { window.removeEventListener("pointermove", onMove); document.documentElement.removeEventListener("mouseleave", recentre); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reduce, gxT, gyT]);
  useEffect(() => { if (!canTrack()) { gxT.set(0); gyT.set(0); } }, [state, pose]); // eslint-disable-line react-hooks/exhaustive-deps

  /* natural blinking; touch devices also get a small idle gaze drift */
  useEffect(() => {
    if (reduce) return;
    let alive = true; let t: ReturnType<typeof setTimeout>;
    const doBlink = async () => { await animate(blink, 1, { duration: 0.07, ease: "easeOut" }); await animate(blink, 0, { duration: 0.14, ease: "easeIn" }); };
    const loop = async () => {
      if (!alive) return;
      if (!document.hidden && (poseRef.current === "hello" || poseRef.current === "cross") && ["active", "greeting", "welcome-back"].includes(stateRef.current)) {
        await doBlink();
        if (Math.random() < 0.18 && alive) { await new Promise((r) => setTimeout(r, 120)); await doBlink(); }
        if (!hasMouse.current && alive) { gxT.set((Math.random() - 0.5) * 0.9); gyT.set((Math.random() - 0.5) * 0.4); setTimeout(() => { if (!hasMouse.current) { gxT.set(0); gyT.set(0); } }, 1300); }
      }
      t = setTimeout(loop, 2600 + Math.random() * 3600);
    };
    t = setTimeout(loop, 1800);
    return () => { alive = false; clearTimeout(t); blink.set(0); };
  }, [reduce, blink, gxT, gyT]);

  /* arm: one oscillator drives elbow -> wrist -> fingers with growing phase lag (follow-through),
     so the hand trails the forearm like a real wave. amp/freq ease toward their targets. */
  const playWave = (seconds: number) => {
    if (reduce || poseRef.current !== "hello") return;
    const w = wave.current; w.target = 1; w.targetFreq = 1.45; w.until = performance.now() + seconds * 1000;
  };
  useAnimationFrame((_, delta) => {
    if (reduce) return;
    const w = wave.current, dt = Math.min(delta, 50) / 1000, now = performance.now();
    const calm = poseRef.current !== "hello" || stateRef.current === "sleeping" || stateRef.current === "idle";
    if (w.until && now > w.until) { w.until = 0; w.target = 0.1; w.targetFreq = 0.32; }
    const tAmp = calm ? 0 : w.target, tFreq = w.targetFreq;
    w.amp += (tAmp - w.amp) * (1 - Math.pow(0.02, dt)); w.freq += (tFreq - w.freq) * (1 - Math.pow(0.05, dt));
    if (w.amp < 0.002 && tAmp === 0) { elbowRot.set(0); wristRot.set(0); fingerRot.set(0); return; }
    w.phase += dt * w.freq * Math.PI * 2;
    const sw = (lag: number) => Math.sin(w.phase - lag) + 0.18 * Math.sin(2 * (w.phase - lag) + 0.7); // slightly asymmetric, less mechanical
    elbowRot.set(w.amp * 1.8 * sw(0));
    wristRot.set(w.amp * 9 * sw(0.85));
    fingerRot.set(w.amp * 4 * sw(1.7));
  });
  useEffect(() => {
    // two friendly waves per wave phase (greeting / welcome back), spread across the ~10 s
    const plan = state === "greeting" ? [[700, 2.8], [5400, 2.8]] : state === "welcome-back" ? [[150, 2.4], [5200, 2.4]] : [];
    const ts = plan.map(([at, dur]) => setTimeout(() => playWave(dur), at));
    return () => ts.forEach(clearTimeout);
  }, [state]); // eslint-disable-line react-hooks/exhaustive-deps

  /* sleepiness + head tilt follow the state machine */
  useEffect(() => {
    const target = state === "sleeping" ? { s: 1, t: HAS_SLEEP ? 0 : 4.2, d: 2.2 } : state === "idle" ? { s: 0.72, t: HAS_SLEEP ? 0 : 1.8, d: 3 } : { s: 0, t: 0, d: 0.7 };
    if (reduce) { sleepy.set(target.s); tilt.set(target.t); return; }
    const a = animate(sleepy, target.s, { duration: target.d, ease: "easeInOut" });
    const b = animate(tilt, target.t, { duration: target.d + 0.4, ease: "easeInOut" });
    return () => { a.stop(); b.stop(); };
  }, [state, reduce, sleepy, tilt]);

  // one message at a time, tied to the state that owns it
  const bubble = state === "greeting" ? MSG.greeting : state === "welcome-back" && welcomeBubble ? MSG.welcomeBack : state === "sleeping" && sleepBubble ? MSG.sleeping : undefined;
  const hop = reduce ? undefined : state === "waking" ? { y: [0, -9, 0], transition: { duration: 0.8, ease: "easeOut" as const } } : { y: 0 };
  const bx = ((faceX + 120) / W) * 100, by = ((faceY - 190) / H) * 100;

  return (
    <div className="relative mx-auto w-full" ref={root} style={{ aspectRatio: `${W} / ${H}` }} onPointerEnter={(e) => { if (e.pointerType !== "touch") { wake(); salute(); } }} onPointerMove={(e) => { if (e.pointerType !== "touch") wake(); }} onPointerDown={() => wake()}>
      <motion.div className="absolute inset-0" animate={hop} initial={reduce ? false : { y: 20 }}>
        <motion.div className="absolute inset-0" initial={reduce ? false : { opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 1, ease: "easeOut" }}>
          {/* base pose (rigged): body without hand, hand at the wrist pivot, head with eyes */}
          <motion.div className="absolute inset-0" style={{ opacity: baseOpacity }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={RIG.body} width={W} height={H} alt="Illustrated 3D character of Mital Chikhaliya, waving hello" fetchPriority="high" decoding="async" draggable={false}
              className="absolute inset-0 h-full w-full select-none" style={{ WebkitMaskImage: BODY_MASK, maskImage: BODY_MASK }} />
            {/* segmented arm: forearm swings at the elbow; palm trails at the wrist; fingers trail at the knuckles */}
            <motion.div className="pointer-events-none absolute inset-0" style={{ rotate: elbowRot, originX: `${RIG.arm.elbow[0]}%`, originY: `${RIG.arm.elbow[1]}%` }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={RIG.arm.forearm} width={W} height={H} alt="" aria-hidden decoding="async" draggable={false} className="absolute inset-0 h-full w-full select-none" />
              <motion.div className="absolute inset-0" style={{ rotate: wristRot, originX: `${RIG.arm.wrist[0]}%`, originY: `${RIG.arm.wrist[1]}%` }}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={RIG.arm.palm} width={W} height={H} alt="" aria-hidden decoding="async" draggable={false} className="absolute inset-0 h-full w-full select-none" />
                <motion.div className="absolute inset-0" style={{ rotate: fingerRot, originX: `${RIG.arm.knuckle[0]}%`, originY: `${RIG.arm.knuckle[1]}%` }}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={RIG.arm.fingers} width={W} height={H} alt="" aria-hidden decoding="async" draggable={false} className="absolute inset-0 h-full w-full select-none" />
                </motion.div>
              </motion.div>
            </motion.div>
            <motion.div className="absolute inset-0" style={{ x: headX, y: headY, rotate: headRotate, originX: RIG.pivot[0] / W, originY: RIG.pivot[1] / H, WebkitMaskImage: HEAD_MASK, maskImage: HEAD_MASK }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={RIG.body} width={W} height={H} alt="" aria-hidden decoding="async" draggable={false} className="absolute inset-0 h-full w-full select-none" />
              <svg viewBox={`0 0 ${W} ${H}`} className="pointer-events-none absolute inset-0 h-full w-full" aria-hidden>
                <Eye k="a" id={`${id}h`} e={RIG.eyes.a as EyeRig} src={RIG.body} gx={gx} gy={gy} lid={lid} />
                <Eye k="b" id={`${id}h`} e={RIG.eyes.b as EyeRig} src={RIG.body} gx={gx} gy={gy} lid={lid} />
              </svg>
            </motion.div>
          </motion.div>

          {/* other poses: whole-figure layers aligned to the base; cross-faded. Poses with a head rig also track the cursor. */}
          {POSES.map((n) => {
            const p = POSE_RIGS[n];
            const fade = p.fadeBottom ? `linear-gradient(to bottom, #000 ${((p.bottom - 60) / H) * 100}%, transparent ${(p.bottom / H) * 100}%)` : undefined;
            const t = { duration: reduce ? 0 : n === "sleep" && pose === "sleep" ? 1.6 : 0.8, ease: "easeInOut" as const };
            if (p.head) {
              const [hm, bm] = maskTop(p.head.cutTop, p.head.cutBottom);
              return (
                <motion.div key={n} className="pointer-events-none absolute inset-0" initial={{ opacity: 0 }} animate={{ opacity: pose === n ? 1 : 0 }} transition={t}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={p.src} width={W} height={H} alt="" aria-hidden loading="eager" fetchPriority="low" decoding="async" draggable={false} className="absolute inset-0 h-full w-full select-none" style={{ WebkitMaskImage: bm, maskImage: bm }} />
                  <motion.div className="absolute inset-0" style={{ x: headX, y: headY, rotate: headRotate, originX: p.head.pivot[0] / W, originY: p.head.pivot[1] / H, WebkitMaskImage: hm, maskImage: hm }}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={p.src} width={W} height={H} alt="" aria-hidden decoding="async" draggable={false} className="absolute inset-0 h-full w-full select-none" />
                    <svg viewBox={`0 0 ${W} ${H}`} className="absolute inset-0 h-full w-full" aria-hidden>
                      <Eye k="a" id={`${id}${n}`} e={p.head.eyes.a} src={p.src} gx={gx} gy={gy} lid={lid} />
                      <Eye k="b" id={`${id}${n}`} e={p.head.eyes.b} src={p.src} gx={gx} gy={gy} lid={lid} />
                    </svg>
                  </motion.div>
                </motion.div>
              );
            }
            return (
              // eslint-disable-next-line @next/next/no-img-element
              <motion.img key={n} src={p.src} width={W} height={H} alt="" aria-hidden loading="eager" fetchPriority="low" decoding="async" draggable={false}
                className="pointer-events-none absolute inset-0 h-full w-full select-none" initial={{ opacity: 0 }} animate={{ opacity: pose === n ? 1 : 0 }}
                transition={t} style={fade ? { WebkitMaskImage: fade, maskImage: fade } : undefined} />
            );
          })}
        </motion.div>
      </motion.div>

      <AnimatePresence>
        {bubble && (
          <motion.div key={bubble} role="status" aria-live="polite"
            initial={{ opacity: 0, scale: 0.85, y: 8 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.92, y: -4 }} transition={{ duration: reduce ? 0 : 0.4, ease: [0.22, 1, 0.36, 1] }}
            className="pointer-events-none absolute z-10 w-max max-w-[9rem] origin-bottom-left rounded-2xl rounded-bl-md border border-clay bg-paper px-3.5 py-2 text-[0.78rem] font-medium leading-snug shadow-lg shadow-brown/15 sm:max-w-[11.5rem] sm:px-4 sm:py-2.5 sm:text-[0.82rem]"
            style={{ left: `${bx}%`, top: `${Math.max(by, -2)}%` }}>
            {bubble}
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {hint && (
          <motion.button type="button" key="desktop-hint" onClick={() => setHint(false)} aria-label={`${HINT_TEXT} (tap to dismiss)`}
            initial={{ opacity: 0, scale: 0.85, y: 8 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: -4 }} transition={{ duration: reduce ? 0 : 0.45, ease: [0.22, 1, 0.36, 1] }}
            className="absolute z-10 w-max max-w-[8.4rem] origin-bottom-left rounded-2xl rounded-bl-md border border-clay bg-paper px-3.5 py-2 text-left text-[0.78rem] font-medium leading-snug shadow-lg shadow-brown/15"
            style={{ left: `${bx}%`, top: `${Math.max(by, -2)}%` }}>
            {HINT_TEXT}
          </motion.button>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {state === "sleeping" && (
          <motion.div aria-hidden initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.6 }}
            className="pointer-events-none absolute z-10 font-display font-semibold text-terra-deep" style={{ left: `${((faceX - 150) / W) * 100}%`, top: `${Math.max(by + 4, 2)}%` }}>
            {["Z", "z", "z"].map((z, i) => (
              <span key={i} className={`absolute ${reduce ? "" : "zzz"}`} style={{ animationDelay: `${i * 0.9}s`, fontSize: `${1.25 - i * 0.2}rem`, left: i * 10, top: -i * 12, opacity: reduce ? 0.8 - i * 0.2 : undefined }}>{z}</span>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
