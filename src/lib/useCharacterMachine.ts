"use client";
import { useCallback, useEffect, useRef, useState } from "react";

export type CharState = "greeting" | "active" | "idle" | "sleeping" | "waking" | "welcome-back";

/*
 * Lifecycle (repeats for the whole visit):
 *   greeting (wave, 10 s) -> active (crossed arms)
 *   active --(no activity ~65 s: 62 s + 3.5 s drowsy)--> sleeping
 *   sleeping --(visitor hovers / taps HER)--> waking -> welcome-back (wave, 10 s) -> active -> ...
 * Only one timer of each kind can exist; every timer and listener is cleared on unmount.
 */
const GREETING_MS = 10_000;
const IDLE_MS = 62_000;         // inactivity before she gets drowsy (eyes start closing)
const DROWSY_MS = 3_500;        // drowsy -> asleep   (62 + 3.5 = ~65 s of inactivity)
const WAKE_MS = 900;            // eyes open while she turns to wave
const WELCOME_BACK_MS = 10_000; // wave pose, then back to crossed arms
const WELCOME_BUBBLE_MS = 4_500;
const SLEEP_BUBBLE_MS = 9_000;

export function useCharacterMachine() {
  const [state, setState] = useState<CharState>("greeting");
  const [sleepBubble, setSleepBubble] = useState(false);
  const [welcomeBubble, setWelcomeBubble] = useState(false);
  const stateRef = useRef<CharState>("greeting");
  const last = useRef(0);
  const timers = useRef<Record<string, ReturnType<typeof setTimeout> | undefined>>({});

  const clear = (k: string) => { const t = timers.current[k]; if (t) clearTimeout(t); timers.current[k] = undefined; };
  const later = (k: string, fn: () => void, ms: number) => { clear(k); timers.current[k] = setTimeout(() => { timers.current[k] = undefined; fn(); }, ms); };
  const go = useCallback((s: CharState) => { stateRef.current = s; setState(s); }, []);

  /** Starts (or keeps) the single inactivity watcher. It re-checks the last-activity time when it fires. */
  const armIdle = useCallback(() => {
    if (timers.current.idle) return;
    const check = () => {
      timers.current.idle = undefined;
      if (stateRef.current !== "active") return;            // never fall asleep mid-animation; re-armed when she is active again
      const rest = IDLE_MS - (Date.now() - last.current);
      if (rest > 250) { timers.current.idle = setTimeout(check, rest); return; }
      go("idle");
      later("sleep", () => {
        if (stateRef.current !== "idle") return;
        go("sleeping");
        setSleepBubble(true);
        later("sleepBubble", () => setSleepBubble(false), SLEEP_BUBBLE_MS);
      }, DROWSY_MS);
    };
    timers.current.idle = setTimeout(check, IDLE_MS);
  }, [go]);

  const becomeActive = useCallback(() => {
    go("active");
    last.current = Date.now();   // a full inactivity period starts now, so she can't fall straight back asleep
    armIdle();
  }, [armIdle, go]);

  /** Meaningful visitor activity anywhere on the page. Resets inactivity; does NOT wake a sleeping character. */
  const poke = useCallback(() => {
    last.current = Date.now();
    if (stateRef.current === "idle") { clear("sleep"); becomeActive(); }   // only drowsy: perk up silently
  }, [becomeActive]);

  /** The visitor hovers or taps the character. Wakes her only if she is asleep (or drowsy). */
  const wake = useCallback(() => {
    const s = stateRef.current;
    if (s === "idle") { clear("sleep"); becomeActive(); return; }
    if (s !== "sleeping") return;
    clear("sleepBubble"); setSleepBubble(false);
    go("waking");
    later("wake", () => {
      go("welcome-back");
      setWelcomeBubble(true);
      later("wbBubble", () => setWelcomeBubble(false), WELCOME_BUBBLE_MS);
      later("wb", () => { setWelcomeBubble(false); becomeActive(); }, WELCOME_BACK_MS);
    }, WAKE_MS);
  }, [becomeActive, go]);

  useEffect(() => {
    last.current = Date.now();
    later("greet", () => becomeActive(), GREETING_MS);
    const opts: AddEventListenerOptions = { passive: true };
    const evs = ["pointermove", "pointerdown", "keydown", "scroll", "wheel", "touchstart", "touchmove"] as const;
    let lastCall = 0;                                   // ~4 checks a second is plenty
    const onAct = () => { const n = performance.now(); if (n - lastCall < 250) return; lastCall = n; poke(); };
    evs.forEach((e) => window.addEventListener(e, onAct, opts));
    const snap = timers.current;
    return () => {
      evs.forEach((e) => window.removeEventListener(e, onAct));
      Object.keys(snap).forEach((k) => { const t = snap[k]; if (t) clearTimeout(t); snap[k] = undefined; });
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return { state, sleepBubble, welcomeBubble, wake };
}
