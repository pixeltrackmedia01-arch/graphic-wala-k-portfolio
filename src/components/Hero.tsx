"use client";
import { useRef } from "react";
import { motion, useScroll, useTransform } from "motion/react";
import { ArrowDownRight, MapPin } from "lucide-react";
import { PROFILE } from "@/lib/content";
import { RIG } from "@/lib/characterRig";
import { scrollToId as scrollTo, NAV_OFFSET } from "@/lib/scroll";
import { Character } from "./Character";

const go = (id: string) => (e: React.MouseEvent) => { e.preventDefault(); scrollTo(id, NAV_OFFSET); };
const ease = [0.22, 1, 0.36, 1] as const;

const INFO = [
  { k: "Name", v: PROFILE.name },
  { k: "Role", v: PROFILE.title },
  { k: "Experience", v: PROFILE.experience },
  { k: "Based in", v: PROFILE.location, pin: true },
];

export function Hero() {
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const imgY = useTransform(scrollYProgress, [0, 1], [0, 50]);
  const bgY = useTransform(scrollYProgress, [0, 1], [0, 120]);
  const line = "Turning Marketing Data Into Measurable Growth.".split(" ");
  const ar = RIG.w / RIG.h;

  return (
    <section id="home" ref={ref} className="grain relative isolate overflow-hidden pt-20 md:pt-24" aria-labelledby="hero-title">
      {/* quiet background motion */}
      <motion.div aria-hidden style={{ y: bgY }} className="pointer-events-none absolute inset-0 -z-10">
        <div className="drift-a absolute -left-32 top-32 h-[26rem] w-[26rem] rounded-full bg-sand blur-3xl" />
        <div className="drift-b absolute right-[-8rem] top-[-5rem] h-[30rem] w-[30rem] rounded-full bg-terra/15 blur-3xl" />
        <div className="absolute inset-x-0 bottom-0 h-px bg-clay/70" />
      </motion.div>

      <div className="wrap grid min-h-[calc(100svh-5rem)] items-center gap-6 pb-10 lg:grid-cols-[1.02fr_0.98fr] lg:gap-10 lg:pb-24 xl:gap-16">
        {/* left: introduction */}
        <div className="order-2 lg:order-1">
          <motion.p initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, ease }} className="eyebrow mb-5 flex items-center gap-3">
            <span className="h-px w-8 bg-terra" /> {PROFILE.title}
          </motion.p>

          <h1 id="hero-title" aria-label="Turning Marketing Data Into Measurable Growth."
            className="font-display max-w-[15ch] text-[clamp(2.15rem,4.3vw,4.1rem)] font-medium leading-[1.05] tracking-[-0.015em] sm:max-w-[17ch] lg:max-w-[14ch] xl:max-w-[16ch]">
            {line.map((w, i) => (
              <span key={i} aria-hidden className="inline-block overflow-hidden pb-[0.1em] align-bottom">
                <motion.span className={`inline-block ${w.startsWith("Measurable") || w.startsWith("Growth") ? "italic text-terra" : ""}`}
                  initial={{ y: "105%" }} animate={{ y: 0 }} transition={{ duration: 0.9, delay: 0.12 + i * 0.06, ease }}>
                  {w}&nbsp;
                </motion.span>
              </span>
            ))}
          </h1>

          <motion.p initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.6, ease }}
            className="mt-6 max-w-[34rem] text-[0.98rem] leading-[1.7] text-ink-soft md:text-[1.05rem]">
            I&apos;m {PROFILE.name}, a Performance Marketing professional focused on building scalable advertising strategies, improving campaign performance and driving profitable business growth.
          </motion.p>

          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.75, ease }} className="mt-8 flex flex-wrap gap-3">
            <a href="#work" onClick={go("work")}
              className="group inline-flex h-12 items-center gap-2 rounded-full bg-ink px-6 text-sm font-medium text-cream transition-all duration-300 hover:-translate-y-0.5 hover:bg-terra hover:shadow-lg hover:shadow-terra/25 focus-visible:outline-offset-4 active:translate-y-0">
              Explore My Work
              <ArrowDownRight size={17} className="transition-transform duration-300 group-hover:translate-x-0.5 group-hover:translate-y-0.5" />
            </a>
            <a href="#contact" onClick={go("contact")}
              className="inline-flex h-12 items-center rounded-full border border-ink/25 px-6 text-sm font-medium transition-all duration-300 hover:-translate-y-0.5 hover:border-ink hover:bg-paper focus-visible:outline-offset-4 active:translate-y-0">
              Let&apos;s Connect
            </a>
          </motion.div>

          {/* compact information strip */}
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.9, delay: 1 }} className="mt-9 max-w-[34rem] border-t border-clay pt-5">
            <dl className="grid grid-cols-2 gap-x-6 gap-y-4 sm:grid-cols-4 sm:gap-x-5">
              {INFO.map((i) => (
                <div key={i.k} className="min-w-0">
                  <dt className="text-[0.62rem] font-semibold uppercase tracking-[0.2em] text-ink-soft/80">{i.k}</dt>
                  <dd className="mt-1 flex items-start gap-1 text-[0.82rem] font-medium leading-snug">
                    {i.pin && <MapPin size={13} className="mt-[0.2rem] shrink-0 text-terra" />}
                    <span>{i.v}</span>
                  </dd>
                </div>
              ))}
            </dl>
            <p className="mt-4 text-[0.78rem] tracking-wide text-ink-soft">{PROFILE.positioning.join("  ·  ")}</p>
          </motion.div>
        </div>

        {/* right: interactive character */}
        <div className="order-1 flex items-end justify-center lg:order-2 lg:h-full lg:items-center">
          <motion.div style={{ y: imgY, ["--ar" as string]: ar }}
            className="relative flex w-full items-end justify-center [--ch:min(46svh,25rem)] sm:[--ch:min(54svh,30rem)] lg:[--ch:min(calc(100svh-8.5rem),50rem)]">
            {/* soft stage: a large circle + fine ring give the figure presence without clutter */}
            <div aria-hidden className="absolute bottom-[6%] left-1/2 -z-10 aspect-square w-[min(100%,calc(var(--ch)*0.95))] -translate-x-1/2 rounded-full bg-gradient-to-b from-sand/90 to-sand/30" />
            <div aria-hidden className="absolute bottom-[6%] left-1/2 -z-10 aspect-square w-[min(100%,calc(var(--ch)*0.95))] -translate-x-[46%] translate-y-[2%] rounded-full border border-terra/25" />
            <div aria-hidden className="absolute -bottom-1 left-1/2 -z-10 h-5 w-[min(60%,calc(var(--ch)*0.34))] -translate-x-1/2 rounded-[50%] bg-brown/25 blur-md" />
            <div className="relative" style={{ width: "calc(var(--ch) * var(--ar))" }}>
              <Character />
            </div>
          </motion.div>
        </div>
      </div>

      <a href="#growth" onClick={go("growth")} aria-label="Scroll to next section"
        className="absolute bottom-3 left-1/2 hidden -translate-x-1/2 flex-col items-center gap-1.5 text-[0.6rem] uppercase tracking-[0.25em] text-ink-soft xl:flex">
        Scroll
        <span className="relative h-8 w-px overflow-hidden bg-clay"><span className="cue-dot absolute inset-x-0 top-0 h-full bg-terra" /></span>
      </a>
    </section>
  );
}
