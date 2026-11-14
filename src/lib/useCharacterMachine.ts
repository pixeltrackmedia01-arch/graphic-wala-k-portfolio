"use client";
import { useCallback, useEffect, useRef, useState } from "react";

export type CharState = "greeting" | "active" | "idle" | "sleeping" | "waking" | "welcome-back";

const IDLE_MS = 27_000;      // inactivity before the character gets drowsy
const DROWSY_MS = 3_500;     // idle (eyes closing) -> sleeping
const GREETING_MS = 5_200;
const WAKE_MS = 900;
const WELCOME_BACK_MS = 3_800;
const SLEEP_BUBBLE_MS = 4_500;

/**
 * Small, leak-free state machine for the hero character.
 * - one lazily re-armed inactivity timer (no timer churn on every mouse move)
 * - "welcome back" only after a genuine sleep (idle -> active is silent)
 * - every timer and listener is cleared on unmount
 */
export function useCharacterMachine() {
  const [state, setState] = useState<CharState>("greeting");
  const [sleepBubble, setSleepBubble] = useState(false);
  const stateRef = useRef<CharState>("greeting");
  const last = useRef(0);
  const timers = useRef<Record<string, ReturnType<typeof setTimeout> | undefined>>({});

  const clear = (k: string) => { const t = timers.current[k]; if (t) clearTimeout(t); timers.current[k] = undefined; };
  const later = (k: string, fn: () => void, ms: number) => { clear(k); timers.current[k] = setTimeout(() => { timers.current[k] = undefined; fn(); }, ms); };
  const go = useCallback((s: CharState) => { stateRef.current = s; setState(s); }, []);

  const armIdle = useCallback(() => {
    if (timers.current.idle) return; // already armed; it re-checks lastActivity when it fires
    const check = () => {
      timers.current.idle = undefined;
      const rest = IDLE_MS - (Date.now() - last.current);
      if (rest > 250) { timers.current.idle = setTimeout(check, rest); return; }
      if (stateRef.current === "active") {
        go("idle");
        later("sleep", () => {
          if (stateRef.current !== "idle") return;
          go("sleeping");
          setSleepBubble(true);
          later("sleepBubble", () => setSleepBubble(false), SLEEP_BUBBLE_MS);
        }, DROWSY_MS);
      } else armIdle();
    };
    timers.current.idle = setTimeout(check, IDLE_MS);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [go]);

  const poke = useCallback(() => {
    last.current = Date.now();
    const s = stateRef.current;
    if (s === "sleeping") {
      clear("sleepBubble"); setSleepBubble(false);
      go("waking");
      later("wake", () => {
        go("welcome-back");
        later("wb", () => { go("active"); last.current = Date.now(); armIdle(); }, WELCOME_BACK_MS);
      }, WAKE_MS);
    } else if (s === "idle") {
      clear("sleep");
      go("active"); // only drowsy: wake silently, no "welcome back"
    }
    armIdle();
  }, [armIdle, go]);

  useEffect(() => {
    last.current = Date.now();
    armIdle(); // inactivity is measured from page load / last interaction
    later("greet", () => { if (stateRef.current === "greeting") go("active"); }, GREETING_MS);
    const opts: AddEventListenerOptions = { passive: true };
    const evs = ["pointermove", "pointerdown", "keydown", "scroll", "wheel", "touchstart", "touchmove"] as const;
    // throttle: genuine activity only needs ~4 checks a second
    let lastCall = 0;
    const onAct = () => { const n = performance.now(); if (n - lastCall < 250) return; lastCall = n; poke(); };
    evs.forEach((e) => window.addEventListener(e, onAct, opts));
    const timersSnapshot = timers.current;
    return () => {
      evs.forEach((e) => window.removeEventListener(e, onAct));
      Object.keys(timersSnapshot).forEach((k) => { const t = timersSnapshot[k]; if (t) clearTimeout(t); timersSnapshot[k] = undefined; });
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return { state, sleepBubble };
}
