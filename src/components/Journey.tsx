"use client";
import { useRef, useState } from "react";
import { AnimatePresence, motion, useScroll, useSpring } from "motion/react";
import { ChevronDown } from "lucide-react";
import { JOBS } from "@/lib/content";
import { Reveal, SplitHeading } from "./Reveal";

export function Journey() {
  const ref = useRef<HTMLOListElement>(null);
  const [open, setOpen] = useState<number>(0);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start 70%", "end 60%"] });
  const prog = useSpring(scrollYProgress, { stiffness: 110, damping: 28, mass: 0.4 });

  return (
    <section id="experience" className="bg-paper py-24 md:py-36" aria-labelledby="exp-title">
      <div className="wrap">
        <Reveal><p className="eyebrow mb-5">Career journey</p></Reveal>
        <SplitHeading text="The Journey Behind the Performance." className="font-display max-w-3xl text-[clamp(2rem,5vw,4.2rem)] font-medium leading-[1.05] tracking-tight" />
        <span id="exp-title" className="sr-only">The Journey Behind the Performance.</span>

        <ol ref={ref} className="relative mt-16 space-y-8 pl-9 sm:pl-16 lg:mt-24">
          <span aria-hidden className="absolute bottom-2 left-[0.7rem] top-2 w-px bg-clay sm:left-[1.4rem]" />
          <motion.span aria-hidden style={{ scaleY: prog, transformOrigin: "top" }} className="absolute bottom-2 left-[0.7rem] top-2 w-0.5 -translate-x-[0.5px] bg-terra sm:left-[1.4rem]" />
          {JOBS.map((j, i) => {
            const isOpen = open === i;
            const years = j.period.match(/\d{4}/g)!;
            return (
              <Reveal as="li" key={j.company} className="relative">
                <span aria-hidden className={`absolute -left-9 top-8 h-4 w-4 rounded-full border-2 transition-colors duration-500 sm:-left-16 sm:top-9 sm:h-5 sm:w-5 ${isOpen ? "border-terra bg-terra" : "border-terra bg-paper"}`}>
                  {j.current && <span className="absolute inset-0 animate-ping rounded-full bg-terra/50 motion-reduce:hidden" />}
                </span>
                <div className="grid gap-x-10 lg:grid-cols-12">
                  <p className="font-display hidden pt-6 text-5xl font-medium leading-none text-clay lg:col-span-2 lg:block">{j.current ? "Now" : years[0]}</p>
                  <div className={`overflow-hidden rounded-3xl border transition-all duration-500 lg:col-span-10 ${isOpen ? "border-terra/40 bg-cream shadow-xl shadow-brown/10" : "border-clay/70 bg-paper hover:border-clay hover:bg-cream/60"}`}>
                    <h3>
                      <button type="button" aria-expanded={isOpen} aria-controls={`job-${i}`} onClick={() => setOpen(isOpen ? -1 : i)} className="flex w-full items-start justify-between gap-4 p-6 text-left sm:p-8">
                        <span>
                          <span className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs font-semibold uppercase tracking-[0.18em] text-terra-deep">
                            {j.period}{j.current && <span className="rounded-full bg-terra px-2.5 py-0.5 text-[0.62rem] text-paper">Current</span>}
                          </span>
                          <span className="font-display mt-3 block text-2xl font-medium leading-tight sm:text-3xl">{j.company}</span>
                          <span className="mt-1.5 block text-ink-soft">{j.role} · {j.place}</span>
                        </span>
                        <span className="mt-1 grid h-10 w-10 shrink-0 place-items-center rounded-full border border-clay"><ChevronDown size={18} className={`transition-transform duration-500 ${isOpen ? "rotate-180" : ""}`} /></span>
                      </button>
                    </h3>
                    <AnimatePresence initial={false}>
                      {isOpen && (
                        <motion.div id={`job-${i}`} initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}>
                          <ul className="space-y-3 border-t border-clay/60 px-6 pb-8 pt-6 sm:px-8">
                            {j.points.map((p, n) => (
                              <motion.li key={p} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.05 + n * 0.04 }} className="flex gap-3 leading-relaxed text-ink-soft">
                                <span aria-hidden className="mt-2.5 h-1 w-3 shrink-0 rounded bg-terra" />{p}
                              </motion.li>
                            ))}
                          </ul>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </div>
              </Reveal>
            );
          })}
        </ol>
      </div>
    </section>
  );
}
