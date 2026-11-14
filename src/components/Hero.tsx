"use client";
import { useRef } from "react";
import { motion, useScroll, useTransform } from "motion/react";
import { ArrowDownRight, MapPin } from "lucide-react";
import { PROFILE } from "@/lib/content";
import { Character } from "./Character";
import { scrollToId as scrollTo, NAV_OFFSET } from "@/lib/scroll";

const scrollToId = (id: string) => (e: React.MouseEvent) => { e.preventDefault(); scrollTo(id, id === "growth" ? NAV_OFFSET : NAV_OFFSET); };

const ease = [0.22, 1, 0.36, 1] as const;


export function Hero() {
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const imgY = useTransform(scrollYProgress, [0, 1], [0, 70]);
  const bgY = useTransform(scrollYProgress, [0, 1], [0, 140]);
  const line = "Turning Marketing Data Into Measurable Growth.".split(" ");

  return (
    <section id="home" ref={ref} className="grain relative isolate overflow-hidden pt-24 md:pt-28" aria-labelledby="hero-title">
      {/* background motion */}
      <motion.div aria-hidden style={{ y: bgY }} className="pointer-events-none absolute inset-0 -z-10">
        <div className="drift-a absolute -left-24 top-24 h-[28rem] w-[28rem] rounded-full bg-sand blur-3xl" />
        <div className="drift-b absolute right-[-6rem] top-[-4rem] h-[30rem] w-[30rem] rounded-full bg-terra/15 blur-3xl" />
        <div className="absolute inset-x-0 bottom-0 h-px bg-clay/70" />
        <div className="absolute inset-y-0 left-[8%] hidden w-px bg-clay/40 lg:block" />
        <div className="absolute inset-y-0 right-[8%] hidden w-px bg-clay/40 lg:block" />
      </motion.div>

      <div className="wrap grid min-h-[calc(100svh-6rem)] items-center gap-10 pb-16 lg:grid-cols-12 lg:gap-6">
        <div className="order-2 lg:order-1 lg:col-span-7">
          <motion.p initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, ease }} className="eyebrow mb-6 flex items-center gap-3">
            <span className="h-px w-8 bg-terra" /> {PROFILE.title}
          </motion.p>

          <h1 id="hero-title" aria-label="Turning Marketing Data Into Measurable Growth." className="font-display text-[clamp(2.6rem,6.2vw,5.6rem)] font-medium leading-[0.98] tracking-tight">
            {line.map((w, i) => (
              <span key={i} aria-hidden className="inline-block overflow-hidden pb-[0.1em] align-bottom">
                <motion.span
                  className={`inline-block ${w.startsWith("Measurable") || w.startsWith("Growth") ? "italic text-terra" : ""}`}
                  initial={{ y: "105%" }} animate={{ y: 0 }} transition={{ duration: 0.9, delay: 0.15 + i * 0.07, ease }}>
                  {w}&nbsp;
                </motion.span>
              </span>
            ))}
          </h1>

          <motion.p initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.7, ease }} className="mt-7 max-w-xl text-base leading-relaxed text-ink-soft md:text-lg">
            I&apos;m {PROFILE.name}, a Performance Marketing professional focused on building scalable advertising strategies, improving campaign performance and driving profitable business growth.
          </motion.p>

          <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.85, ease }} className="mt-9 flex flex-wrap gap-3">
            <a href="#work" onClick={scrollToId("work")} className="group inline-flex min-h-12 items-center gap-2 rounded-full bg-ink px-7 text-sm font-medium text-cream transition-all duration-300 hover:-translate-y-0.5 hover:bg-terra hover:shadow-lg hover:shadow-terra/25">
              Explore My Work
              <ArrowDownRight size={18} className="transition-transform duration-300 group-hover:translate-x-0.5 group-hover:translate-y-0.5" />
            </a>
            <a href="#contact" onClick={scrollToId("contact")} className="group inline-flex min-h-12 items-center gap-2 rounded-full border border-ink/25 px-7 text-sm font-medium transition-all duration-300 hover:-translate-y-0.5 hover:border-ink hover:bg-paper">
              Let&apos;s Connect
            </a>
          </motion.div>

          <motion.dl initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.9, delay: 1.05 }} className="mt-12 grid max-w-xl grid-cols-2 gap-x-8 gap-y-5 border-t border-clay pt-6 text-sm">
            <div><dt className="eyebrow !text-ink-soft">Name</dt><dd className="mt-1 font-medium">{PROFILE.name}</dd></div>
            <div><dt className="eyebrow !text-ink-soft">Role</dt><dd className="mt-1 font-medium">{PROFILE.title}</dd></div>
            <div><dt className="eyebrow !text-ink-soft">Experience</dt><dd className="mt-1 font-medium">{PROFILE.experience}</dd></div>
            <div><dt className="eyebrow !text-ink-soft">Based in</dt><dd className="mt-1 flex items-center gap-1 font-medium"><MapPin size={14} className="text-terra" />{PROFILE.location}</dd></div>
            <div className="col-span-2"><dt className="eyebrow !text-ink-soft">Focus</dt><dd className="mt-1 font-medium">{PROFILE.positioning.join("  |  ")}</dd></div>
          </motion.dl>
        </div>

        <div className="order-1 mx-auto flex w-full justify-center lg:order-2 lg:col-span-5">
          <motion.div style={{ y: imgY }} className="relative [--ch:min(50svh,24rem)] w-[calc(var(--ch)*0.2985)] sm:[--ch:min(58svh,30rem)] lg:[--ch:min(76svh,44rem)]">
            {/* soft backdrop + ground shadow keep the cut-out feeling anchored without a floor */}
            <div aria-hidden className="absolute left-1/2 top-[34%] -z-10 aspect-square w-[150%] -translate-x-1/2 -translate-y-1/2 rounded-full bg-sand/70 blur-2xl" />
            <div aria-hidden className="absolute -bottom-2 left-1/2 -z-10 h-5 w-[78%] -translate-x-1/2 rounded-[50%] bg-brown/20 blur-md" />
            <Character />
          </motion.div>
        </div>
      </div>

      <a href="#growth" onClick={scrollToId("growth")} aria-label="Scroll to next section" className="absolute bottom-5 left-1/2 hidden -translate-x-1/2 flex-col items-center gap-2 text-[0.65rem] uppercase tracking-[0.25em] text-ink-soft md:flex">
        Scroll
        <span className="relative h-10 w-px overflow-hidden bg-clay"><span className="cue-dot absolute inset-x-0 top-0 h-full bg-terra" /></span>
      </a>
    </section>
  );
}
