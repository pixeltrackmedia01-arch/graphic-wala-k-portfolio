"use client";
import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { KNOWLEDGE } from "@/lib/knowledge";

/*
 * Small floating avatar (bottom-right; the resume chat launcher lives bottom-left).
 *  - hidden on the Hero; appears once the visitor has scrolled past it, and then stays (never toggles on scroll)
 *  - message 1 "Scroll down and explore my work!"  ->  after 3.5 s  ->  "Need anything? Tap me."
 *  - tap / click on her  ->  "Call me: <number>" (tel: link). Tapping again keeps it working.
 */
const PHONE = KNOWLEDGE.profile.phone;                       // published number, e.g. "+91 8141482284"
const TEL = `tel:${PHONE.replace(/[^\d+]/g, "")}`;
const FIRST_MS = 3500;
type Msg = "scroll" | "tap" | "call";
const TEXT: Record<Exclude<Msg, "call">, string> = { scroll: "Scroll down and explore my work!", tap: "Need anything? Tap me." };

export function FloatingAssistant() {
  const reduce = !!useReducedMotion();
  const [shown, setShown] = useState(false);
  const [msg, setMsg] = useState<Msg>("scroll");
  const [pulse, setPulse] = useState(0);
  const msgRef = useRef<Msg>("scroll"); msgRef.current = msg;

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

  /* one timer, started when she first appears; never restarted by scrolling */
  useEffect(() => {
    if (!shown) return;
    const t = setTimeout(() => setMsg((m) => (m === "scroll" ? "tap" : m)), FIRST_MS);
    return () => clearTimeout(t);
  }, [shown]);

  const tapped = () => { setMsg("call"); setPulse((n) => n + 1); };
  const dur = reduce ? 0 : 0.35;

  return (
    <AnimatePresence>
      {shown && (
        <motion.div key="float-assistant" className="pointer-events-none fixed bottom-3 right-3 z-30 flex items-end gap-1.5 sm:bottom-5 sm:right-5 sm:gap-2"
          style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
          initial={reduce ? { opacity: 0 } : { opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: reduce ? 0.2 : 0.6, ease: [0.22, 1, 0.36, 1] }}>
          {/* speech bubble: one message at a time, to the left of her (she sits at the right edge) */}
          <div data-float-bubble className="relative mb-[2.2rem] sm:mb-[2.8rem]" aria-live="polite">
            <AnimatePresence mode="wait" initial={false}>
              <motion.div key={msg} initial={{ opacity: 0, x: reduce ? 0 : 8, scale: reduce ? 1 : 0.97 }} animate={{ opacity: 1, x: 0, scale: 1 }} exit={{ opacity: 0, x: reduce ? 0 : -4 }} transition={{ duration: dur, ease: [0.22, 1, 0.36, 1] }}
                className="pointer-events-auto relative max-w-[min(13rem,calc(100vw-7.5rem))] rounded-2xl rounded-br-sm border border-clay bg-paper px-3.5 py-2 text-[0.78rem] font-medium leading-snug text-ink shadow-lg shadow-brown/15 sm:max-w-[16rem] sm:px-4 sm:py-2.5 sm:text-[0.84rem]">
                {msg === "call" ? (
                  <a href={TEL} className="inline-flex min-h-[2rem] items-center gap-1.5 underline-offset-4 hover:underline focus-visible:outline-offset-4" aria-label={`Call Mital at ${PHONE}`}>
                    Call me: <span className="font-semibold text-terra-deep">{PHONE}</span>
                  </a>
                ) : TEXT[msg]}
                {/* pointer towards the character */}
                <span aria-hidden className="absolute -right-[5px] bottom-3 h-2.5 w-2.5 rotate-45 border-b border-r border-clay bg-paper" />
              </motion.div>
            </AnimatePresence>
          </div>

          {/* avatar: face + upper body, crossed arms */}
          <motion.button type="button" onClick={tapped} aria-label="Mital — tap to see how to call her" whileTap={reduce ? undefined : { scale: 0.93 }}
            className="pointer-events-auto relative shrink-0 cursor-pointer rounded-2xl focus-visible:outline-offset-4">
            <motion.span key={pulse} aria-hidden className="absolute inset-x-0 bottom-0 top-3 rounded-full bg-terra/25"
              initial={{ opacity: pulse ? 0.7 : 0, scale: 0.7 }} animate={{ opacity: 0, scale: reduce ? 0.7 : 1.5 }} transition={{ duration: 0.7, ease: "easeOut" }} />
            <span aria-hidden className="absolute inset-x-1 bottom-0 -z-0 h-3 rounded-[50%] bg-brown/25 blur-md" />
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/images/character/mital-avatar.webp" alt="" width={164} height={300} draggable={false} decoding="async"
              className="relative block h-[4.1rem] w-auto select-none sm:h-[5.4rem]"
              style={{ WebkitMaskImage: "linear-gradient(to bottom,#000 80%,transparent)", maskImage: "linear-gradient(to bottom,#000 80%,transparent)" }} />
          </motion.button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
