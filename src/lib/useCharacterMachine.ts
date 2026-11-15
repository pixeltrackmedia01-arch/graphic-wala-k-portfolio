"use client";
import { useSyncExternalStore } from "react";

export type CharState = "greeting" | "active" | "idle" | "sleeping" | "waking" | "welcome-back";

/*
 * ONE shared lifecycle for every character on the page (the big hero figure and the small floating assistant),
 * so they always sleep / wake together:
 *   greeting (wave, 10 s) -> active
 *   active --(no activity ~65 s: 62 s + 3.5 s drowsy)--> sleeping (Zzz, no message)
 *   sleeping --(ANY meaningful activity: mouse, scroll, click, key, touch)--> waking -> welcome-back (wave, ~5 s) -> active
 * Single set of named timers; listeners are attached only while something is subscribed and removed afterwards.
 */
const GREETING_MS = 10_000;
const GREETING_BUBBLE_MS = 6_000;
const IDLE_MS = 62_000;          // inactivity before she gets drowsy
const DROWSY_MS = 3_500;         // drowsy -> asleep (62 + 3.5 = ~65 s of inactivity)
const WAKE_MS = 900;             // eyes open while she turns to wave
const WELCOME_BACK_MS = 5_000;   // wave pose + "Welcome back! 👋"
const WELCOME_BUBBLE_MS = 4_500;
const SALUTE_COOLDOWN_MS = 1_200;

export const GREETING_TEXT = "Hey! Glad you're here. Let's explore!";
const SALUTE_TEXT = "Hi there!";

export type CharSnapshot = { state: CharState; greetBubble: boolean; greetText: string; welcomeBubble: boolean };
const INITIAL: CharSnapshot = { state: "greeting", greetBubble: true, greetText: GREETING_TEXT, welcomeBubble: false };

let snap: CharSnapshot = INITIAL;
let stateNow: CharState = "greeting";
let lastActivity = 0, activeSince = 0;
const subs = new Set<() => void>();
const timers: Record<string, ReturnType<typeof setTimeout> | undefined> = {};
let detach: (() => void) | null = null;

const emit = () => subs.forEach((f) => f());
const set = (p: Partial<CharSnapshot>) => { snap = { ...snap, ...p }; stateNow = snap.state; emit(); };
const clear = (k: string) => { const t = timers[k]; if (t) clearTimeout(t); timers[k] = undefined; };
const later = (k: string, fn: () => void, ms: number) => { clear(k); timers[k] = setTimeout(() => { timers[k] = undefined; fn(); }, ms); };

/** Single lazily re-armed inactivity watcher: it re-reads the last-activity time when it fires. */
function armIdle() {
  if (timers.idle) return;
  const check = () => {
    timers.idle = undefined;
    if (stateNow !== "active") return;                       // never fall asleep mid-animation; re-armed when she is active again
    const rest = IDLE_MS - (Date.now() - lastActivity);
    if (rest > 250) { timers.idle = setTimeout(check, rest); return; }
    set({ state: "idle" });
    later("sleep", () => { if (stateNow === "idle") set({ state: "sleeping" }); }, DROWSY_MS);
  };
  timers.idle = setTimeout(check, IDLE_MS);
}

function becomeActive() {
  set({ state: "active", greetBubble: false, welcomeBubble: false });
  lastActivity = Date.now();        // a full inactivity period starts now, so she can't fall straight back asleep
  activeSince = Date.now();
  armIdle();
}

function wakeUp() {
  if (stateNow !== "sleeping") return;
  set({ state: "waking" });
  later("wake", () => {
    set({ state: "welcome-back", welcomeBubble: true });
    later("wbBubble", () => set({ welcomeBubble: false }), WELCOME_BUBBLE_MS);
    later("wb", becomeActive, WELCOME_BACK_MS);
  }, WAKE_MS);
}

/** Meaningful visitor activity anywhere on the page. */
function poke() {
  lastActivity = Date.now();
  if (stateNow === "sleeping") wakeUp();                      // one transition only; further movement during waking is just activity
  else if (stateNow === "idle") { clear("sleep"); becomeActive(); }   // drowsy: perk up silently
}

/** Cursor enters the hero figure while she is simply standing: she waves again. */
export function salute() {
  if (stateNow !== "active" || Date.now() - activeSince < SALUTE_COOLDOWN_MS) return;
  lastActivity = Date.now();
  set({ state: "greeting", greetBubble: true, greetText: SALUTE_TEXT });
  later("greetBubble", () => set({ greetBubble: false }), GREETING_BUBBLE_MS);
  later("greet", becomeActive, GREETING_MS);
}

function start() {
  snap = INITIAL; stateNow = "greeting"; lastActivity = Date.now(); activeSince = Date.now();
  later("greetBubble", () => set({ greetBubble: false }), GREETING_BUBBLE_MS);
  later("greet", becomeActive, GREETING_MS);
  const opts: AddEventListenerOptions = { passive: true };
  const evs = ["pointermove", "pointerdown", "keydown", "scroll", "wheel", "touchstart", "touchmove"] as const;
  let lastCall = 0;                                           // ~4 checks a second is plenty
  const onAct = () => { const n = performance.now(); if (n - lastCall < 250) return; lastCall = n; poke(); };
  evs.forEach((e) => window.addEventListener(e, onAct, opts));
  detach = () => {
    evs.forEach((e) => window.removeEventListener(e, onAct));
    Object.keys(timers).forEach(clear);
  };
}

function subscribe(cb: () => void) {
  subs.add(cb);
  if (subs.size === 1) start();
  return () => { subs.delete(cb); if (subs.size === 0 && detach) { detach(); detach = null; } };
}
const getSnapshot = () => snap;
const getServerSnapshot = () => INITIAL;

export function useCharacterMachine() {
  const s = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  return { ...s, salute, wake: wakeUp };
}
