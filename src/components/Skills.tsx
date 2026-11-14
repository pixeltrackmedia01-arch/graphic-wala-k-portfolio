"use client";
import { useState } from "react";
import { motion } from "motion/react";
import { SKILL_GROUPS } from "@/lib/content";
import { Reveal, SplitHeading } from "./Reveal";

/* each group gets its own interaction metaphor */
function Chip({ name, desc, kind, i, hover, setHover }: { name: string; desc: string; kind: number; i: number; hover: number | null; setHover: (n: number | null) => void }) {
  const on = hover === i;
  const base = "relative text-left transition-all duration-300 focus-visible:z-10";
  const styles = [
    `${base} rounded-2xl border p-4 ${on ? "-translate-y-1 border-terra bg-cream shadow-lg" : "border-clay/70 bg-paper"}`, // cards lift
    `${base} flex items-center gap-3 border-b py-3.5 ${on ? "border-terra pl-3" : "border-clay/70"}`, // ruled list slide
    `${base} rounded-full border px-5 py-3 ${on ? "scale-105 border-ink bg-ink text-cream" : "border-clay bg-paper"}`, // pills invert
    `${base} rounded-xl border p-4 ${on ? "border-terra bg-terra text-paper" : "border-dashed border-brown/50 bg-transparent"}`, // dashed → solid
    `${base} rounded-2xl p-5 ${on ? "bg-ink text-cream" : "bg-sand"}`, // tiles invert
  ][kind];
  return (
    <button type="button" className={styles} onMouseEnter={() => setHover(i)} onMouseLeave={() => setHover(null)} onFocus={() => setHover(i)} onBlur={() => setHover(null)} onClick={() => setHover(on ? null : i)} aria-pressed={on}>
      <span className="flex items-center gap-2.5 text-sm font-medium">
        <motion.span aria-hidden animate={{ rotate: on ? 90 : 0, scale: on ? 1.3 : 1 }} className={`inline-block h-2 w-2 shrink-0 rotate-45 ${kind === 3 && on ? "bg-paper" : "bg-terra"} ${kind === 2 && on ? "!bg-terra" : ""}`} />
        {name}
      </span>
      <motion.span initial={false} animate={{ height: on ? "auto" : 0, opacity: on ? 1 : 0 }} className={`block overflow-hidden text-xs leading-relaxed ${kind === 2 ? "hidden" : ""} ${on && (kind === 3 || kind === 4) ? "opacity-90" : "text-ink-soft"} ${kind === 1 ? "!hidden" : ""}`}>
        <span className="mt-2 block">{desc}</span>
      </motion.span>
    </button>
  );
}

export function Skills() {
  const [active, setActive] = useState(0);
  const [hover, setHover] = useState<number | null>(null);
  const g = SKILL_GROUPS[active];
  const kind = active;
  const wrapper = [
    "grid gap-3 sm:grid-cols-2", "flex flex-col", "flex flex-wrap gap-3", "grid gap-3 sm:grid-cols-2", "grid gap-3 sm:grid-cols-2",
  ][kind];

  return (
    <section id="skills" className="py-24 md:py-36" aria-labelledby="skills-title">
      <div className="wrap">
        <Reveal><p className="eyebrow mb-5">Skills & marketing toolkit</p></Reveal>
        <SplitHeading text="The Tools Behind My Marketing Strategy." className="font-display max-w-3xl text-[clamp(2rem,5vw,4.2rem)] font-medium leading-[1.05] tracking-tight" />
        <span id="skills-title" className="sr-only">The Tools Behind My Marketing Strategy.</span>

        <div className="mt-14 grid gap-10 lg:mt-20 lg:grid-cols-12 lg:gap-14">
          <div role="tablist" aria-label="Skill groups" aria-orientation="vertical" className="flex gap-2 overflow-x-auto pb-2 lg:col-span-4 lg:flex-col lg:overflow-visible lg:pb-0">
            {SKILL_GROUPS.map((s, i) => (
              <button key={s.no} role="tab" id={`sk-t-${i}`} aria-selected={active === i} aria-controls="sk-panel" onClick={() => { setActive(i); setHover(null); }}
                className={`group flex shrink-0 items-center gap-4 rounded-2xl border px-5 py-4 text-left transition-all duration-300 lg:w-full ${active === i ? "border-ink bg-ink text-cream lg:translate-x-3" : "border-clay/70 bg-paper hover:border-terra"}`}>
                <span className={`font-display text-lg ${active === i ? "text-terra" : "text-ink-soft"}`}>{s.no}</span>
                <span className="whitespace-nowrap font-medium lg:whitespace-normal">{s.title}</span>
                <span className={`ml-auto hidden text-xs lg:block ${active === i ? "text-cream/60" : "text-ink-soft"}`}>{s.items.length}</span>
              </button>
            ))}
          </div>

          <div className="lg:col-span-8" id="sk-panel" role="tabpanel" aria-labelledby={`sk-t-${active}`}>
            <motion.div key={g.no} initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
              <p className="font-display text-3xl font-medium sm:text-4xl"><span className="text-terra">{g.no}</span> {g.title}</p>
              <p className="mt-2 text-ink-soft">{g.hint}</p>
              <div className={`mt-8 ${wrapper}`}>
                {g.items.map((it, i) => (
                  <Chip key={it.name + i} name={it.name} desc={it.desc} kind={kind} i={i} hover={hover} setHover={setHover} />
                ))}
              </div>
              {/* description line for list / pill styles */}
              {(kind === 1 || kind === 2) && (
                <p className="mt-6 min-h-12 border-l-2 border-terra pl-4 text-sm leading-relaxed text-ink-soft" aria-live="polite">
                  {hover !== null ? <><strong className="text-ink">{g.items[hover].name}</strong> — {g.items[hover].desc}</> : "Hover or tap a tool to see how I use it."}
                </p>
              )}
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}
