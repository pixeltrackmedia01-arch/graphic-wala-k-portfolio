"use client";
import { ArrowUp, Mail, MapPin, Phone } from "lucide-react";
import { PROFILE } from "@/lib/content";
import { Reveal, SplitHeading } from "./Reveal";
import { scrollToY } from "@/lib/scroll";

function Linkedin({ size = 18 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M20.45 20.45h-3.56v-5.57c0-1.33-.03-3.04-1.85-3.04-1.85 0-2.14 1.45-2.14 2.94v5.67H9.35V9h3.41v1.56h.05c.48-.9 1.64-1.85 3.37-1.85 3.6 0 4.27 2.37 4.27 5.46v6.28zM5.34 7.43a2.06 2.06 0 1 1 0-4.12 2.06 2.06 0 0 1 0 4.12zM7.12 20.45H3.56V9h3.56v11.45zM22.22 0H1.77C.79 0 0 .77 0 1.73v20.54C0 23.23.79 24 1.77 24h20.45c.98 0 1.78-.77 1.78-1.73V1.73C24 .77 23.2 0 22.22 0z" />
    </svg>
  );
}

export function Contact() {
  const top = () => scrollToY(0);
  const rows = [
    { Icon: Mail, label: "Email", value: PROFILE.email, href: `mailto:${PROFILE.email}` },
    { Icon: Phone, label: "Phone", value: PROFILE.phone, href: PROFILE.phoneHref },
    { Icon: Linkedin, label: "LinkedIn", value: "Connect on LinkedIn", href: PROFILE.linkedin, external: true },
    { Icon: MapPin, label: "Location", value: PROFILE.location },
  ];
  return (
    <section id="contact" className="grain relative isolate overflow-hidden bg-ink text-cream" aria-labelledby="contact-title">
      <div aria-hidden className="absolute -left-24 bottom-0 -z-10 h-96 w-96 rounded-full bg-terra/25 blur-3xl" />
      <div className="wrap py-24 md:py-36">
        <Reveal><p className="eyebrow mb-6 !text-terra">Contact</p></Reveal>
        <SplitHeading text="Let's Create Something That Grows." className="font-display max-w-4xl text-[clamp(2.4rem,7vw,6rem)] font-medium leading-[1] tracking-tight" />
        <span id="contact-title" className="sr-only">Let&apos;s Create Something That Grows.</span>
        <Reveal delay={0.1}><p className="mt-7 max-w-xl text-lg leading-relaxed text-cream/70">Have a growth challenge or an exciting opportunity? Let&apos;s connect and explore what&apos;s possible.</p></Reveal>

        <p className="font-display mt-14 text-2xl text-cream/90">{PROFILE.name}</p>
        <ul className="mt-6 grid border-t border-cream/15 sm:grid-cols-2">
          {rows.map(({ Icon, label, value, href, external }, i) => {
            const inner = (
              <>
                <span className="grid h-12 w-12 shrink-0 place-items-center rounded-full border border-cream/20 transition-all duration-300 group-hover:border-terra group-hover:bg-terra"><Icon size={18} /></span>
                <span className="min-w-0"><span className="block text-xs uppercase tracking-[0.2em] text-cream/50">{label}</span><span className="mt-1 block break-words text-lg sm:text-xl">{value}</span></span>
              </>
            );
            const cls = `group flex min-h-24 items-center gap-5 border-b border-cream/15 py-5 sm:pr-6 ${i % 2 === 0 ? "sm:border-r sm:border-cream/15" : "sm:pl-8"}`;
            return (
              <li key={label}>
                {href ? <a href={href} className={`${cls} transition-colors hover:text-terra`} {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}>{inner}</a> : <div className={cls}>{inner}</div>}
              </li>
            );
          })}
        </ul>

        <div className="mt-14 flex flex-wrap items-center justify-between gap-6">
          <a href={`mailto:${PROFILE.email}`} className="group inline-flex min-h-14 items-center gap-3 rounded-full bg-terra px-8 font-medium text-paper transition-all duration-300 hover:-translate-y-0.5 hover:bg-cream hover:text-ink">
            <Mail size={18} /> Start a conversation
          </a>
          <button type="button" onClick={top} className="group inline-flex min-h-12 items-center gap-3 text-sm text-cream/70 transition-colors hover:text-cream">
            Back to top <span className="grid h-12 w-12 place-items-center rounded-full border border-cream/25 transition-all duration-300 group-hover:-translate-y-1 group-hover:border-terra group-hover:bg-terra"><ArrowUp size={18} /></span>
          </button>
        </div>
      </div>
      <footer className="border-t border-cream/10">
        <div className="wrap flex flex-col justify-between gap-2 py-6 text-xs text-cream/45 sm:flex-row">
          <p>© {new Date().getFullYear()} {PROFILE.name}. All rights reserved.</p>
          <p>Performance Marketing · {PROFILE.location}</p>
        </div>
      </footer>
    </section>
  );
}
