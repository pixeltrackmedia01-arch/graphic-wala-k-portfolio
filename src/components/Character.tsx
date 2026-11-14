"use client";
import { useEffect, useId, useRef, useState } from "react";
import { preload } from "react-dom";
import { AnimatePresence, animate, motion, useMotionValue, useReducedMotion, useSpring, useTransform } from "motion/react";
import { RIG } from "@/lib/characterRig";
import { useCharacterMachine, type CharState } from "@/lib/useCharacterMachine";

const clamp = (x: number, a = -1, b = 1) => Math.min(b, Math.max(a, x));
const { w: W, h: H } = RIG;
const [faceX, faceY] = RIG.face;
export type PoseName = "hello" | "think" | "point";
const POSES = Object.keys(RIG.poses) as (keyof typeof RIG.poses)[];
const cutTopPct = (RIG.cutTop / H) * 100;
const cutBottomPct = (RIG.cutBottom / H) * 100;
const HEAD_MASK = `linear-gradient(to bottom, #000 ${cutTopPct}%, transparent ${cutBottomPct}%)`;
const BODY_MASK = `linear-gradient(to bottom, transparent ${cutTopPct - 0.15}%, #000 ${cutTopPct}%)`;

const BUBBLES: Partial<Record<CharState, { a: string; b?: string; wave?: boolean }>> = {
  greeting: { a: "Hi there!", b: "Welcome to my portfolio.", wave: true },
  "welcome-back": { a: "Welcome back! 😊" },
};

type EyeKey = "a" | "b";

function Eye({ k, id, gx, gy, lid }: { k: EyeKey; id: string; gx: ReturnType<typeof useSpring>; gy: ReturnType<typeof useSpring>; lid: ReturnType<typeof useMotionValue<number>> }) {
  const e = RIG.eyes[k];
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
          <g clipPath={`url(#${id}-i${k})`}><image href={RIG.src} width={W} height={H} /></g>
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
  const { state, sleepBubble } = useCharacterMachine();
  const id = useId().replace(/:/g, "");
  const root = useRef<HTMLDivElement>(null);
  const [pose, setPose] = useState<PoseName>("hello");
  preload(RIG.src, { as: "image", fetchPriority: "high" });

  /* motion values: updated outside React, so tracking never re-renders */
  const gxT = useMotionValue(0), gyT = useMotionValue(0);
  const gx = useSpring(gxT, { stiffness: 120, damping: 22, mass: 0.6 });
  const gy = useSpring(gyT, { stiffness: 120, damping: 22, mass: 0.6 });
  const blink = useMotionValue(0), sleepy = useMotionValue(0), tilt = useMotionValue(0);
  const handRot = useMotionValue(0);
  const baseOpacity = useMotionValue(1);
  const lid = useTransform([blink, sleepy], ([b, s]: number[]) => Math.max(b, s));
  const headRotate = useTransform([gx, tilt], ([g, t]: number[]) => g * 2.4 + t);
  const headX = useTransform(gx, (v) => `${v * 0.55}%`);
  const headY = useTransform([gy, tilt], ([g, t]: number[]) => `${g * 0.35 + t * 0.15}%`);

  const stateRef = useRef<CharState>(state); stateRef.current = state;
  const poseRef = useRef<PoseName>(pose); poseRef.current = pose;
  const hasMouse = useRef(false);
  const waving = useRef(false);
  const canTrack = () => !reduce && poseRef.current === "hello" && (stateRef.current === "greeting" || stateRef.current === "active");

  /* pose changes come from the navigation (hover) via a window event */
  useEffect(() => {
    const onPose = (e: Event) => setPose(((e as CustomEvent<PoseName | null>).detail ?? "hello"));
    window.addEventListener("character-pose", onPose);
    return () => window.removeEventListener("character-pose", onPose);
  }, []);
  useEffect(() => {
    const a = animate(baseOpacity, pose === "hello" ? 1 : 0, { duration: reduce ? 0 : 0.55, ease: "easeInOut" });
    if (pose !== "hello") { gxT.set(0); gyT.set(0); }
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
      const fx = r.left + (faceX / W) * r.width, fy = r.top + (faceY / H) * r.height;
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
      if (!document.hidden && poseRef.current === "hello" && ["active", "greeting", "welcome-back"].includes(stateRef.current)) {
        await doBlink();
        if (Math.random() < 0.18 && alive) { await new Promise((r) => setTimeout(r, 120)); await doBlink(); }
        if (!hasMouse.current && alive) { gxT.set((Math.random() - 0.5) * 0.9); gyT.set((Math.random() - 0.5) * 0.4); setTimeout(() => { if (!hasMouse.current) { gxT.set(0); gyT.set(0); } }, 1300); }
      }
      t = setTimeout(loop, 2600 + Math.random() * 3600);
    };
    t = setTimeout(loop, 1800);
    return () => { alive = false; clearTimeout(t); blink.set(0); };
  }, [reduce, blink, gxT, gyT]);

  /* hand: big wave on greeting / welcome-back / click, otherwise a very small idle sway */
  const wave = async (dur: number) => {
    if (reduce || waving.current || poseRef.current !== "hello") return;
    waving.current = true;
    await animate(handRot, [0, -15, 11, -14, 10, -11, 7, 0], { duration: dur, ease: "easeInOut" });
    waving.current = false;
  };
  useEffect(() => {
    if (state === "greeting") { const t = setTimeout(() => wave(2.6), 700); return () => clearTimeout(t); }
    if (state === "welcome-back") { wave(1.7); }
  }, [state]); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => {
    if (reduce || pose !== "hello" || state === "sleeping" || state === "idle") { handRot.set(0); return; }
    const a = animate(handRot, [0, 2.2, 0, -1.6, 0], { duration: 7, repeat: Infinity, ease: "easeInOut", delay: 4 });
    return () => a.stop();
  }, [reduce, pose, state, handRot]);

  /* sleepiness + head tilt follow the state machine */
  useEffect(() => {
    const target = state === "sleeping" ? { s: 1, t: 4.2, d: 2.2 } : state === "idle" ? { s: 0.72, t: 1.8, d: 3 } : { s: 0, t: 0, d: 0.7 };
    if (reduce) { sleepy.set(target.s); tilt.set(target.t); return; }
    const a = animate(sleepy, target.s, { duration: target.d, ease: "easeInOut" });
    const b = animate(tilt, target.t, { duration: target.d + 0.4, ease: "easeInOut" });
    return () => { a.stop(); b.stop(); };
  }, [state, reduce, sleepy, tilt]);

  const bubble = pose !== "hello" ? undefined : state === "greeting" || state === "welcome-back" ? BUBBLES[state] : sleepBubble ? { a: "Taking a little break... 😴" } : undefined;
  const hop = reduce ? undefined : state === "waking" ? { y: [0, -9, 0], transition: { duration: 0.8, ease: "easeOut" as const } } : { y: 0 };
  const bx = ((faceX + 120) / W) * 100, by = ((faceY - 190) / H) * 100;

  return (
    <div className="relative mx-auto w-full" ref={root} style={{ aspectRatio: `${W} / ${H}` }} onClick={() => wave(1.7)}>
      <motion.div className="absolute inset-0" animate={hop} initial={reduce ? false : { y: 20 }}>
        <motion.div className="absolute inset-0" initial={reduce ? false : { opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 1, ease: "easeOut" }}>
          {/* base pose (rigged): body without hand, hand at the wrist pivot, head with eyes */}
          <motion.div className="absolute inset-0" style={{ opacity: baseOpacity }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={RIG.body} width={W} height={H} alt="Illustrated 3D character of Mital Chikhaliya, waving hello" fetchPriority="high" decoding="async" draggable={false}
              className="absolute inset-0 h-full w-full select-none" style={{ WebkitMaskImage: BODY_MASK, maskImage: BODY_MASK }} />
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <motion.img src={RIG.hand.src} alt="" aria-hidden decoding="async" draggable={false} className="pointer-events-none absolute select-none"
              style={{ rotate: handRot, left: `${(RIG.hand.x / W) * 100}%`, top: `${(RIG.hand.y / H) * 100}%`, width: `${(RIG.hand.w / W) * 100}%`, height: `${(RIG.hand.h / H) * 100}%`,
                originX: (RIG.hand.pivot[0] - RIG.hand.x) / RIG.hand.w, originY: (RIG.hand.pivot[1] - RIG.hand.y) / RIG.hand.h }} />
            <motion.div className="absolute inset-0" style={{ x: headX, y: headY, rotate: headRotate, originX: RIG.pivot[0] / W, originY: RIG.pivot[1] / H, WebkitMaskImage: HEAD_MASK, maskImage: HEAD_MASK }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={RIG.src} width={W} height={H} alt="" aria-hidden decoding="async" draggable={false} className="absolute inset-0 h-full w-full select-none" />
              <svg viewBox={`0 0 ${W} ${H}`} className="pointer-events-none absolute inset-0 h-full w-full" aria-hidden>
                <Eye k="a" id={id} gx={gx} gy={gy} lid={lid} />
                <Eye k="b" id={id} gx={gx} gy={gy} lid={lid} />
              </svg>
            </motion.div>
          </motion.div>

          {/* other poses: whole-figure layers aligned to the base by the eyes; cross-faded */}
          {POSES.map((n) => {
            const p = RIG.poses[n];
            const fade = p.fadeBottom ? `linear-gradient(to bottom, #000 ${((p.bottom - 60) / H) * 100}%, transparent ${(p.bottom / H) * 100}%)` : undefined;
            return (
              // eslint-disable-next-line @next/next/no-img-element
              <motion.img key={n} src={p.src} width={W} height={H} alt="" aria-hidden loading="lazy" decoding="async" draggable={false}
                className="pointer-events-none absolute inset-0 h-full w-full select-none" initial={{ opacity: 0 }} animate={{ opacity: pose === n ? 1 : 0 }}
                transition={{ duration: reduce ? 0 : 0.55, ease: "easeInOut" }} style={fade ? { WebkitMaskImage: fade, maskImage: fade } : undefined} />
            );
          })}
        </motion.div>
      </motion.div>

      <AnimatePresence>
        {bubble && (
          <motion.div key={bubble.a} role="status" aria-live="polite"
            initial={{ opacity: 0, scale: 0.8, y: 8 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9, y: -4 }} transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
            className="pointer-events-none absolute z-10 w-max max-w-[9rem] origin-bottom-left rounded-2xl rounded-bl-md border border-clay bg-paper px-3.5 py-2 text-[0.78rem] leading-snug shadow-lg shadow-brown/15 sm:max-w-[11.5rem] sm:px-4 sm:py-2.5 sm:text-[0.82rem]"
            style={{ left: `${bx}%`, top: `${Math.max(by, -2)}%` }}>
            <p className="font-medium">{bubble.a}{bubble.wave && <span aria-hidden className={`ml-1 inline-block origin-[70%_80%] ${reduce ? "" : "wave-hand"}`}>👋</span>}</p>
            {bubble.b && <p className="text-ink-soft">{bubble.b}</p>}
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {state === "sleeping" && pose === "hello" && (
          <motion.div aria-hidden initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.6 }}
            className="pointer-events-none absolute z-10 font-display font-semibold text-terra-deep" style={{ left: `${bx}%`, top: `${Math.max(by + 3, 1)}%` }}>
            {["Z", "z", "z"].map((z, i) => (
              <span key={i} className={`absolute ${reduce ? "" : "zzz"}`} style={{ animationDelay: `${i * 0.9}s`, fontSize: `${1.25 - i * 0.2}rem`, left: i * 10, top: -i * 12, opacity: reduce ? 0.8 - i * 0.2 : undefined }}>{z}</span>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
