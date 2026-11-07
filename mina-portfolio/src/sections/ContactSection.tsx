import FadeIn from '../components/FadeIn';
import ContactButton, { EMAIL } from '../components/ContactButton';
import Magnet from '../components/Magnet';
import { PROJECTS } from '../data/projects';

const STATS = [
  ['10X', 'ROAS delivered'],
  ['₹50L', 'monthly ad budgets'],
  ['20–30%', 'lower CAC & CPL'],
  ['1–1.5X', 'CTR & engagement'],
];

const TOOLS = [
  'Meta Ads', 'Google Ads', 'GA4', 'GTM', 'Meta Pixel', 'CAPI', 'Looker Studio', 'Search Console', 'Shopify',
  'Canva', 'Photoshop', 'Premiere Pro', 'After Effects', 'Pabbly Connect', 'ChatGPT', 'Claude', 'Gemini',
];

export default function ContactSection() {
  return (
    <section id="contact" className="px-5 sm:px-8 md:px-10 py-20 sm:py-24 md:py-32" style={{ background: '#0C0C0C' }}>
      <div className="max-w-6xl mx-auto flex flex-col gap-20 md:gap-28">
        <FadeIn className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {STATS.map(([v, l]) => (
            <div key={l} className="flex flex-col gap-2">
              <span className="hero-heading font-black uppercase leading-none" style={{ fontSize: 'clamp(2.5rem, 7vw, 100px)' }}>{v}</span>
              <span className="font-light uppercase tracking-wide text-[#D7E2EA]" style={{ fontSize: 'clamp(0.75rem, 1.3vw, 1.1rem)' }}>{l}</span>
            </div>
          ))}
        </FadeIn>

        <FadeIn className="flex flex-wrap gap-2 sm:gap-3">
          {TOOLS.map((t) => (
            <span key={t} className="rounded-full border border-[#D7E2EA]/40 px-4 py-1.5 text-sm md:text-base font-light uppercase tracking-wide text-[#D7E2EA]">
              {t}
            </span>
          ))}
        </FadeIn>

        <FadeIn className="grid md:grid-cols-2 gap-10 text-[#D7E2EA]">
          <div className="flex flex-col gap-2">
            <h3 className="font-medium uppercase tracking-wider" style={{ fontSize: 'clamp(1rem, 2.2vw, 2.1rem)' }}>Education & Languages</h3>
            <p className="font-light leading-relaxed" style={{ fontSize: 'clamp(0.9rem, 1.6vw, 1.25rem)' }}>
              B.B.A., Veer Narmad South Gujarat University (VNSGU), 2019
              <br />
              English · Hindi · Gujarati
            </p>
          </div>
          <div className="flex flex-col gap-2">
            <h3 className="font-medium uppercase tracking-wider" style={{ fontSize: 'clamp(1rem, 2.2vw, 2.1rem)' }}>Currently</h3>
            <p className="font-light leading-relaxed" style={{ fontSize: 'clamp(0.9rem, 1.6vw, 1.25rem)' }}>
              {PROJECTS[0].role.split(' · ')[0]} at {PROJECTS[0].name}, Ahmedabad
            </p>
          </div>
        </FadeIn>

        <FadeIn className="flex flex-col items-center gap-10 text-center">
          <h2 className="hero-heading font-black uppercase leading-none tracking-tight" style={{ fontSize: 'clamp(3rem, 12vw, 160px)' }}>
            Contact
          </h2>
          <p className="font-light text-[#D7E2EA] leading-relaxed" style={{ fontSize: 'clamp(1rem, 2vw, 1.35rem)' }}>
            Ahmedabad ·{' '}
            <a className="hover:opacity-70 transition-opacity" href="tel:+918141482284">+91 8141482284</a> ·{' '}
            <a className="hover:opacity-70 transition-opacity" href={`mailto:${EMAIL}`}>{EMAIL}</a>
          </p>
          <Magnet padding={60} strength={3}>
            <ContactButton />
          </Magnet>
        </FadeIn>
      </div>
    </section>
  );
}
