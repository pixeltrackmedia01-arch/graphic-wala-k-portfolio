"use client";
import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { KNOWLEDGE } from "@/lib/knowledge";
import { useCharacterMachine } from "@/lib/useCharacterMachine";

/*
 * Small floating guide (bottom-right). Shares ONE lifecycle with the hero figure (useCharacterMachine):
 * she sleeps after ~65 s of inactivity (Zzz, no message) and wakes on any activity with a wave + "Welcome back! 👋".
 *
 * Message priority:  1 sleeping  >  2 welcome-back  >  3 section message (once per section)  >  4 "Need anything? Tap me."
 * One bubble, one timer. Sections are detected with IntersectionObserver on a thin band across the middle of the viewport.
 */
const PHONE = KNOWLEDGE.profile.phone;
const TEL = `tel:${PHONE.replace(/[^\d+]/g, "")}`;
const CTX_MS = 4500;
const GENERAL = "Need anything? Tap me.";
const CTX: Record<string, string> = {
  about: "A little about me and how I think.",
  work: "Want to see real results? Tap a campaign to explore!",
  experience: "Here's the journey behind the performance.",
  skills: "Explore the tools behind my marketing strategies!",
  process: "This is how I turn strategy into growth.",
  contact: "Have a project in mind? Let's talk!",
};
const SECTION_IDS = Object.keys(CTX);
type Msg = { k: "ctx" | "general" | "call"; text: string };

export function FloatingAssistant() {
  const reduce = !!useReducedMotion();
  const { state } = useCharacterMachine();
  const [shown, setShown] = useState(false);
  const [current, setCurrent] = useState<string | null>(null);
  const [msg, setMsg] = useState<Msg>({ k: "general", text: GENERAL });
  const [pulse, setPulse] = useState(0);
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const seen = useRef(new Set<string>());
  const needResume = useRef(false);

  const asleep = state === "sleeping";
  const away = state === "sleeping" || state === "waking" || state === "welcome-back";   // contextual messages are on hold
  const waving = state === "waking" || state === "welcome-back";

  /* appear once the Hero has been scrolled past (latched: scrolling back up never hides her again) */
  useEffect(() => {
    const hero = document.getElementById("home");
    let raf = 0, done = false;
    const check = () => {
      raf = 0;
      if (done || !hero) return;
      if (hero.getBoundingClientRect().bottom <= innerHeight * 0.5) { done = true; setShown(true); cleanup(); }
    };
    const onScroll = () => { if (!raf) raf = requestAnimationFrame(check); };
    const cleanup = () => { removeEventListener("scroll", onScroll); removeEventListener("resize", onScroll); if (raf) cancelAnimationFrame(raf); };
    addEventListener("scroll", onScroll, { passive: true });
    addEventListener("resize", onScroll, { passive: true });
    check();
    return cleanup;
  }, []);

  /* which section is under the middle of the viewport (viewport-intersection based, not pixel offsets) */
  useEffect(() => {
    const els = SECTION_IDS.map((id) => document.getElementById(id)).filter(Boolean) as HTMLElement[];
    const inBand = new Set<string>();
    const pick = () => { const order = SECTION_IDS.filter((id) => inBand.has(id)); setCurrent(order.length ? order[order.length - 1] : null); };
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => (e.isIntersecting ? inBand.add(e.target.id) : inBand.delete(e.target.id)));
      pick();
    }, { rootMargin: "-42% 0px -52% 0px", threshold: 0 });
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);

  /* remember that a wake-up happened, so the current section's sequence can resume afterwards */
  useEffect(() => { if (away) needResume.current = true; }, [away]);

  /* the single message driver: a section message once, then the general line. Never runs while asleep / waking. */
  useEffect(() => {
    clearTimeout(timer.current);
    if (!shown || away) return;
    if (needResume.current) { needResume.current = false; if (current) seen.current.delete(current); }
    const text = current ? CTX[current] : undefined;
    if (current && text && !seen.current.has(current)) {
      seen.current.add(current);
      setMsg({ k: "ctx", text });
      timer.current = setTimeout(() => setMsg({ k: "general", text: GENERAL }), CTX_MS);
    } else setMsg({ k: "general", text: GENERAL });
    return () => clearTimeout(timer.current);
  }, [current, shown, away]);

  const tapped = () => {
    if (away) return;                                   // waking: the page-wide activity already handles it
    clearTimeout(timer.current);
    setPulse((n) => n + 1);
    setMsg((m) => (m.k === "call" ? { k: "general", text: GENERAL } : { k: "call", text: "" }));
  };

  const bubble: Msg | null = asleep ? null : waving ? { k: "general", text: "Welcome back! 👋" } : msg;
  const dur = reduce ? 0 : 0.35;
  const fade = { duration: reduce ? 0 : 0.9, ease: "easeInOut" as const };
  const imgCls = "absolute inset-0 h-full w-full select-none";
  const mask = { WebkitMaskImage: "linear-gradient(to bottom,#000 80%,transparent)", maskImage: "linear-gradient(to bottom,#000 80%,transparent)" };

  return (
    <AnimatePresence>
      {shown && (
        <motion.div key="float-assistant" className="pointer-events-none fixed bottom-3 right-3 z-30 flex items-end gap-1 sm:bottom-5 sm:right-5 sm:gap-1.5"
          style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
          initial={reduce ? { opacity: 0 } : { opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: reduce ? 0.2 : 0.6, ease: [0.22, 1, 0.36, 1] }}>
          {/* speech bubble: one message at a time, left of her (she sits at the right edge); none while asleep */}
          <div data-float-bubble className="relative mb-[2.2rem] sm:mb-[2.8rem]" aria-live="polite">
            <AnimatePresence mode="wait" initial={false}>
              {bubble && (
                <motion.div key={bubble.k === "call" ? "call" : bubble.text} initial={{ opacity: 0, x: reduce ? 0 : 8, scale: reduce ? 1 : 0.97 }} animate={{ opacity: 1, x: 0, scale: 1 }} exit={{ opacity: 0, x: reduce ? 0 : -4 }} transition={{ duration: dur, ease: [0.22, 1, 0.36, 1] }}
                  className="pointer-events-auto relative max-w-[min(13rem,calc(100vw-8.5rem))] rounded-2xl rounded-br-sm border border-clay bg-paper px-3.5 py-2 text-[0.78rem] font-medium leading-snug text-ink shadow-lg shadow-brown/15 sm:max-w-[16rem] sm:px-4 sm:py-2.5 sm:text-[0.84rem]">
                  {bubble.k === "call" ? (
                    <a href={TEL} className="inline-flex min-h-[2rem] items-center gap-1.5 underline-offset-4 hover:underline focus-visible:outline-offset-4" aria-label={`Call Mital at ${PHONE}`}>
                      Call me: <span className="font-semibold text-terra-deep">{PHONE}</span>
                    </a>
                  ) : bubble.text}
                  <span aria-hidden className="absolute -right-[5px] bottom-3 h-2.5 w-2.5 rotate-45 border-b border-r border-clay bg-paper" />
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* avatar: crossed arms (rest) / waving (just woke) / asleep — same crop box, so they cross-fade without any jump */}
          <motion.button type="button" onClick={tapped} aria-label="Mital — tap to see how to call her" whileTap={reduce ? undefined : { scale: 0.93 }}
            className="pointer-events-auto relative shrink-0 cursor-pointer rounded-2xl focus-visible:outline-offset-4">
            <motion.span key={pulse} aria-hidden className="absolute inset-x-3 bottom-0 top-3 rounded-full bg-terra/25"
              initial={{ opacity: pulse ? 0.7 : 0, scale: 0.7 }} animate={{ opacity: 0, scale: reduce ? 0.7 : 1.4 }} transition={{ duration: 0.7, ease: "easeOut" }} />
            <span aria-hidden className="absolute inset-x-3 bottom-0 h-3 rounded-[50%] bg-brown/25 blur-md" />
            <span className="relative block h-[4.1rem] sm:h-[5.4rem]" style={{ aspectRatio: "231 / 300" }}>
              {(["cross", "wave", "sleep"] as const).map((k) => {
                const on = k === "sleep" ? asleep : k === "wave" ? waving : !asleep && !waving;
                // eslint-disable-next-line @next/next/no-img-element
                return <motion.img key={k} src={`/images/character/mital-avatar-${k}.webp`} alt="" width={231} height={300} draggable={false} decoding="async" className={imgCls}
                  initial={false} animate={{ opacity: on ? 1 : 0 }} transition={fade}
                  style={{ ...mask, transformOrigin: "50% 100%" }} />;
              })}
            </span>
            <AnimatePresence>
              {asleep && (
                <motion.span aria-hidden initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.6 }}
                  className="pointer-events-none absolute left-[38%] top-0 font-display font-semibold text-terra-deep">
                  {["Z", "z", "z"].map((z, i) => (
                    <span key={i} className={`absolute ${reduce ? "" : "zzz"}`} style={{ animationDelay: `${i * 0.9}s`, fontSize: `${0.95 - i * 0.15}rem`, left: i * 7, top: -i * 9, opacity: reduce ? 0.8 - i * 0.2 : undefined }}>{z}</span>
                  ))}
                </motion.span>
              )}
            </AnimatePresence>
          </motion.button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
