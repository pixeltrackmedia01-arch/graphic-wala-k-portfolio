"use client";
import { useId, useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { GraduationCap, Languages, Sparkles } from "lucide-react";
import { FOCUS_AREAS, PERSONAL_EDITABLE } from "@/lib/content";
import { Reveal, SplitHeading } from "./Reveal";

const TABS = [{ id: "pro", label: "The Professional" }, { id: "person", label: "The Person" }] as const;

export function About() {
  const [tab, setTab] = useState<(typeof TABS)[number]["id"]>("pro");
  const base = useId();
  const refs = useRef<(HTMLButtonElement | null)[]>([]);

  const onKey = (e: React.KeyboardEvent, i: number) => {
    if (e.key !== "ArrowRight" && e.key !== "ArrowLeft") return;
    const n = (i + (e.key === "ArrowRight" ? 1 : -1) + TABS.length) % TABS.length;
    setTab(TABS[n].id);
    refs.current[n]?.focus();
  };

  const extras = Object.values(PERSONAL_EDITABLE).filter(Boolean);

  return (
    <section id="about" className="py-24 md:py-36" aria-labelledby="about-title">
      <div className="wrap">
        <Reveal><p className="eyebrow mb-5">About me</p></Reveal>
        <SplitHeading text="Behind Every Campaign, There's a Strategy." className="font-display max-w-3xl text-[clamp(2rem,5vw,4.2rem)] font-medium leading-[1.05] tracking-tight" />
        <span id="about-title" className="sr-only">Behind Every Campaign, There&apos;s a Strategy.</span>

        <div role="tablist" aria-label="About Mital" className="mt-12 inline-flex rounded-full border border-clay bg-paper p-1">
          {TABS.map((t, i) => (
            <button key={t.id} ref={(el) => { refs.current[i] = el; }} role="tab" id={`${base}-t-${t.id}`} aria-selected={tab === t.id} aria-controls={`${base}-p-${t.id}`} tabIndex={tab === t.id ? 0 : -1}
              onClick={() => setTab(t.id)} onKeyDown={(e) => onKey(e, i)}
              className={`relative min-h-11 rounded-full px-5 text-sm font-medium transition-colors sm:px-7 ${tab === t.id ? "text-cream" : "text-ink-soft hover:text-ink"}`}>
              {tab === t.id && <motion.span layoutId="about-pill" className="absolute inset-0 rounded-full bg-ink" transition={{ type: "spring", stiffness: 380, damping: 32 }} />}
              <span className="relative">{t.label}</span>
            </button>
          ))}
        </div>

        <div className="mt-10">
          <AnimatePresence mode="wait">
            {tab === "pro" ? (
              <motion.div key="pro" role="tabpanel" id={`${base}-p-pro`} aria-labelledby={`${base}-t-pro`} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.4 }} className="grid gap-10 lg:grid-cols-12 lg:gap-16">
                <div className="lg:col-span-7">
                  <p className="font-display text-2xl leading-snug md:text-[1.9rem]">
                    Performance Marketing Lead with <span className="italic text-terra">5+ years</span> in D2C fashion and retail, managing Meta and Google Ads budgets of up to ₹50L a month.
                  </p>
                  <p className="mt-6 max-w-2xl leading-relaxed text-ink-soft">
                    I turn advertising data into meaningful business growth through performance marketing, strategic campaign optimization and data-driven decision-making. My work spans full-funnel strategy, creative testing, CRO and retargeting, with reliable tracking in GA4, GTM, Meta Pixel and CAPI — always aimed at profitable, scalable revenue across online sales and offline store visits.
                  </p>
                  <p className="mt-4 max-w-2xl leading-relaxed text-ink-soft">
                    I combine paid media with SEO and AI-assisted workflows, and guide a team member who runs email, WhatsApp and SMS marketing and reporting.
                  </p>
                  <dl className="mt-8 grid gap-4 sm:grid-cols-2">
                    <div className="flex gap-3 rounded-xl border border-clay/70 bg-paper p-4"><GraduationCap className="mt-0.5 shrink-0 text-terra" size={20} /><div><dt className="text-xs font-semibold uppercase tracking-wider text-ink-soft">Education</dt><dd className="mt-1 text-sm">B.B.A, Veer Narmad South Gujarat University (VNSGU), 2019</dd></div></div>
                    <div className="flex gap-3 rounded-xl border border-clay/70 bg-paper p-4"><Languages className="mt-0.5 shrink-0 text-terra" size={20} /><div><dt className="text-xs font-semibold uppercase tracking-wider text-ink-soft">Languages</dt><dd className="mt-1 text-sm">English, Hindi, Gujarati</dd></div></div>
                  </dl>
                </div>
                <div className="lg:col-span-5">
                  <h3 className="eyebrow mb-4">Focus areas</h3>
                  <ul className="flex flex-wrap gap-2">
                    {FOCUS_AREAS.map((f, i) => (
                      <motion.li key={f} initial={{ opacity: 0, scale: 0.92 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: i * 0.025 }} className="rounded-full border border-clay bg-paper px-3.5 py-1.5 text-sm transition-colors hover:border-terra hover:text-terra-deep">{f}</motion.li>
                    ))}
                  </ul>
                </div>
              </motion.div>
            ) : (
              <motion.div key="person" role="tabpanel" id={`${base}-p-person`} aria-labelledby={`${base}-t-person`} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.4 }} className="max-w-3xl">
                <div>
                  <p className="font-display text-2xl leading-snug md:text-[1.9rem]">
                    Hi, I&apos;m Mital — a marketer who likes <span className="italic text-terra">understanding why</span> numbers move, not just reporting that they did.
                  </p>
                  <p className="mt-6 max-w-2xl leading-relaxed text-ink-soft">
                    I enjoy the mix of analysis and creativity in performance marketing, and I&apos;m always learning — from new ad formats and tracking methods to AI tools that make testing faster and work smarter. Based in Ahmedabad, I work in English, Hindi and Gujarati.
                  </p>
                  <ul className="mt-8 grid gap-3 sm:grid-cols-2">
                    {["Curious about marketing innovation", "A steady learning mindset", "Keen to explore new tools and technology", "Collaborative with creative, content and web teams"].map((t) => (
                      <li key={t} className="flex items-center gap-3 rounded-xl border border-clay/70 bg-paper px-4 py-3 text-sm"><Sparkles size={16} className="shrink-0 text-terra" />{t}</li>
                    ))}
                  </ul>
                  {extras.map((e) => <p key={e} className="mt-4 max-w-2xl leading-relaxed text-ink-soft">{e}</p>)}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
}
