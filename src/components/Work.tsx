import { ArrowUpRight, BadgeCheck, FileText, ShoppingBag, Tag, Target } from "lucide-react";
import { PDFS } from "@/lib/content";
import { Reveal, SplitHeading } from "./Reveal";

const CARDS = [
  {
    id: "d2c", tag: "01 · eCommerce", title: "D2C Sales",
    subtitle: "Explore my D2C and eCommerce advertising campaign portfolio.",
    cta: "View D2C Campaign", href: PDFS.d2c, label: "D2C Campaign report",
    Icon: ShoppingBag, Icon2: Tag, dark: false,
  },
  {
    id: "lead", tag: "02 · Acquisition", title: "Lead Generation",
    subtitle: "Explore my lead generation campaign portfolio across different business industries.",
    cta: "View Lead Generation Campaign", href: PDFS.lead, label: "Lead Generation Campaign report",
    Icon: Target, Icon2: BadgeCheck, dark: true,
  },
];

export function Work() {
  return (
    <section id="work" className="py-24 md:py-36" aria-labelledby="work-title">
      <div className="wrap">
        <div className="grid gap-8 lg:grid-cols-12 lg:items-end">
          <div className="lg:col-span-8">
            <Reveal><p className="eyebrow mb-5">Campaign portfolio</p></Reveal>
            <SplitHeading text="Real Campaigns. Real Data. Measurable Performance." className="font-display text-[clamp(2.2rem,6vw,5rem)] font-medium leading-[1.02] tracking-tight" />
            <span id="work-title" className="sr-only">Real Campaigns. Real Data. Measurable Performance.</span>
          </div>
          <Reveal delay={0.15} className="lg:col-span-4">
            <p className="leading-relaxed text-ink-soft">Explore selected performance marketing campaigns across D2C eCommerce and lead generation. Each report contains screenshots from actual advertising dashboards.</p>
          </Reveal>
        </div>

        <ul className="mt-14 grid gap-5 lg:grid-cols-2 lg:gap-6">
          {CARDS.map((c, i) => (
            <Reveal as="li" key={c.id} delay={i * 0.12}>
              <a href={c.href} target="_blank" rel="noopener noreferrer" aria-label={`${c.cta} (opens the original PDF in a new tab)`}
                className={`group relative flex h-full min-h-[26rem] w-full flex-col overflow-hidden rounded-[2rem] border p-7 text-left transition-all duration-500 hover:-translate-y-1.5 hover:shadow-2xl focus-visible:-translate-y-1.5 sm:p-10 ${c.dark ? "border-ink bg-ink text-cream hover:shadow-ink/30" : "border-clay bg-paper hover:shadow-brown/20"}`}>
                <span aria-hidden className={`absolute -right-16 -top-16 h-72 w-72 rounded-full transition-transform duration-700 group-hover:scale-110 ${c.dark ? "bg-cream/5" : "bg-sand"}`} />
                <c.Icon aria-hidden strokeWidth={0.8} className="absolute -right-4 top-6 h-48 w-48 text-terra transition-transform duration-700 group-hover:-rotate-6 group-hover:scale-105 sm:right-4" />
                <c.Icon2 aria-hidden strokeWidth={1.2} className="absolute right-44 top-40 hidden h-8 w-8 text-brown transition-transform duration-700 group-hover:-translate-y-2 sm:block" />
                <p className="eyebrow relative">{c.tag}</p>
                <h3 className="font-display relative mt-auto max-w-sm pt-32 text-4xl font-medium leading-tight sm:text-5xl">{c.title}</h3>
                <p className={`relative mt-3 max-w-md leading-relaxed ${c.dark ? "text-cream/70" : "text-ink-soft"}`}>{c.subtitle}</p>
                <span className="relative mt-8 flex flex-wrap items-center gap-x-5 gap-y-3">
                  <span className="inline-flex min-h-12 items-center gap-2 rounded-full bg-terra px-6 text-sm font-medium text-paper transition-colors duration-300 group-hover:bg-terra-deep">
                    {c.cta}
                    <ArrowUpRight size={18} className="transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
                  </span>
                  <span className={`inline-flex items-center gap-1.5 text-xs ${c.dark ? "text-cream/55" : "text-ink-soft"}`}><FileText size={14} />Original PDF · opens in a new tab</span>
                </span>
              </a>
            </Reveal>
          ))}
        </ul>
      </div>
    </section>
  );
}
