import FadeIn from '../components/FadeIn';

const SERVICES = [
  ['Paid Media', 'Meta Ads and Google Ads (Search, Display, YouTube, Demand Gen, Shopping), with retargeting and lookalike scaling guided by ROAS, CAC, CPL, CTR, CPC and CPA.'],
  ['Conversion & CRO', 'Shopify store optimization, landing page and checkout funnel strategy, and continuous A/B tests on creatives, messaging, audiences and funnel stages.'],
  ['Tracking & Analytics', 'Accurate attribution across GA4, GTM, Meta Pixel, Events Manager, CAPI and Shopify Analytics, with reporting in Looker Studio and Search Console.'],
  ['SEO', 'Keyword research, on-page SEO and organic traffic analysis, aligned with paid campaigns and landing pages.'],
  ['Lifecycle & AI', 'Email, WhatsApp and SMS journeys run with a team member, plus AI-assisted ad copy, creative ideation, research and reporting for faster testing cycles.'],
];

export default function ServicesSection() {
  return (
    <section
      id="services"
      className="relative rounded-t-[40px] sm:rounded-t-[50px] md:rounded-t-[60px] px-5 sm:px-8 md:px-10 py-20 sm:py-24 md:py-32"
      style={{ background: '#FFFFFF' }}
    >
      <FadeIn>
        <h2
          className="font-black uppercase text-center mb-16 sm:mb-20 md:mb-28 leading-none"
          style={{ color: '#0C0C0C', fontSize: 'clamp(3rem, 12vw, 160px)' }}
        >
          Services
        </h2>
      </FadeIn>
      <div className="max-w-5xl mx-auto">
        {SERVICES.map(([name, desc], i) => (
          <FadeIn
            key={name}
            delay={i * 0.1}
            className="flex items-start gap-4 sm:gap-8 md:gap-12 py-8 sm:py-10 md:py-12"
            style={{ borderTop: i === 0 ? undefined : '1px solid rgba(12, 12, 12, 0.15)' }}
          >
            <span
              className="font-black leading-none shrink-0"
              style={{ color: '#0C0C0C', fontSize: 'clamp(3rem, 10vw, 140px)' }}
            >
              {String(i + 1).padStart(2, '0')}
            </span>
            <div className="flex flex-col gap-3 pt-1" style={{ color: '#0C0C0C' }}>
              <h3 className="font-medium uppercase" style={{ fontSize: 'clamp(1rem, 2.2vw, 2.1rem)' }}>
                {name}
              </h3>
              <p className="font-light leading-relaxed max-w-2xl" style={{ fontSize: 'clamp(0.85rem, 1.6vw, 1.25rem)', opacity: 0.6 }}>
                {desc}
              </p>
            </div>
          </FadeIn>
        ))}
      </div>
    </section>
  );
}
