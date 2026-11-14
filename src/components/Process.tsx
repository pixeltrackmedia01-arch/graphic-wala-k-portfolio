"use client";
import { useRef, useState } from "react";
import { motion, useMotionValueEvent, useScroll, useSpring } from "motion/react";
import { PROCESS } from "@/lib/content";
import { Reveal, SplitHeading } from "./Reveal";

export function Process() {
  const ref = useRef<HTMLOListElement>(null);
  const [active, setActive] = useState(-1);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start 75%", "end 70%"] });
  const prog = useSpring(scrollYProgress, { stiffness: 110, damping: 28, mass: 0.4 });
  useMotionValueEvent(scrollYProgress, "change", (p) => setActive(Math.min(PROCESS.length - 1, Math.floor(p * PROCESS.length * 1.02) - (p < 0.02 ? 1 : 0))));

  return (
    <section id="process" className="bg-sand/60 py-24 md:py-36" aria-labelledby="process-title">
      <div className="wrap">
        <Reveal><p className="eyebrow mb-5">My working process</p></Reveal>
        <SplitHeading text="From Strategy to Scalable Growth." className="font-display max-w-3xl text-[clamp(2rem,5vw,4.2rem)] font-medium leading-[1.05] tracking-tight" />
        <span id="process-title" className="sr-only">From Strategy to Scalable Growth.</span>

        <ol ref={ref} className="relative mt-16 grid gap-x-6 gap-y-10 sm:grid-cols-2 lg:mt-24 lg:grid-cols-6 lg:gap-y-0">
          {/* desktop horizontal line */}
          <span aria-hidden className="absolute left-[8.33%] right-[8.33%] top-6 hidden h-px bg-clay lg:block" />
          <motion.span aria-hidden style={{ scaleX: prog, transformOrigin: "left" }} className="absolute left-[8.33%] right-[8.33%] top-[1.45rem] hidden h-0.5 bg-terra lg:block" />
          {PROCESS.map((s, i) => {
            const on = i <= active;
            return (
              <li key={s.title} className="relative flex gap-5 lg:block lg:text-center">
                <span aria-hidden className={`relative z-10 grid h-12 w-12 shrink-0 place-items-center rounded-full border-2 font-display text-sm font-semibold transition-all duration-500 lg:mx-auto ${i === active ? "scale-110 border-terra bg-terra text-paper shadow-lg shadow-terra/30" : on ? "border-terra bg-cream text-terra" : "border-clay bg-paper text-ink-soft"}`}>0{i + 1}</span>
                <div className={`transition-opacity duration-500 lg:mt-6 ${on ? "opacity-100" : "opacity-45"}`}>
                  <h3 className="font-display text-2xl font-medium">{s.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-ink-soft lg:px-1">{s.text}</p>
                </div>
              </li>
            );
          })}
        </ol>
      </div>
    </section>
  );
}
