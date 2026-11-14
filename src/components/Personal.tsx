import { BookOpen, Lightbulb, Wrench } from "lucide-react";
import { PERSONAL_EDITABLE } from "@/lib/content";
import { Reveal, SplitHeading } from "./Reveal";

const ITEMS = [
  { Icon: Lightbulb, title: "Marketing innovation", text: "I enjoy exploring how new ad formats, tracking methods and ideas can make campaigns smarter." },
  { Icon: BookOpen, title: "A learning mindset", text: "Platforms change quickly. I keep learning so my strategy stays current and practical." },
  { Icon: Wrench, title: "New tools & technology", text: "From automation to AI-assisted workflows, I like testing tools that save time and sharpen decisions." },
];

export function Personal() {
  const extras = Object.values(PERSONAL_EDITABLE).filter(Boolean);

  return (
    <section id="personal" className="py-24 md:py-36" aria-labelledby="personal-title">
      <div className="wrap">
        <div className="grid gap-10 lg:grid-cols-12 lg:items-end lg:gap-16">
          <div className="lg:col-span-7">
            <Reveal><p className="eyebrow mb-5">Beyond the dashboard</p></Reveal>
            <SplitHeading text="Beyond Campaigns and Conversion Metrics." className="font-display text-[clamp(2rem,5vw,4rem)] font-medium leading-[1.05] tracking-tight" />
            <span id="personal-title" className="sr-only">Beyond Campaigns and Conversion Metrics.</span>
          </div>
          <Reveal delay={0.1} className="lg:col-span-5">
            <p className="text-lg leading-relaxed text-ink-soft">Behind the dashboards is someone who genuinely enjoys the craft — the research, the testing, and the small improvements that add up. I like working with people, learning in public and finding better ways to do the work.</p>
          </Reveal>
        </div>

        <ul className="mt-14 grid gap-5 border-t border-clay pt-10 md:grid-cols-3 md:gap-8">
          {ITEMS.map(({ Icon, title, text }, i) => (
            <Reveal as="li" key={title} delay={i * 0.08} className="flex gap-4">
              <span className="grid h-12 w-12 shrink-0 place-items-center rounded-full bg-sand text-terra-deep"><Icon size={20} /></span>
              <div><h3 className="font-display text-xl font-medium">{title}</h3><p className="mt-2 text-sm leading-relaxed text-ink-soft">{text}</p></div>
            </Reveal>
          ))}
        </ul>
        {extras.map((e) => <p key={e} className="mt-8 max-w-2xl leading-relaxed text-ink-soft">{e}</p>)}
      </div>
    </section>
  );
}
