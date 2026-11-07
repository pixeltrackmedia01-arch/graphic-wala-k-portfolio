import FadeIn from '../components/FadeIn';
import AnimatedText from '../components/AnimatedText';
import ContactButton from '../components/ContactButton';
import Magnet from '../components/Magnet';

const B = 'https://shrug-person-78902957.figma.site/_components/v2/ebb2b8f25d8e24d5f0a5ca8af4c950de81aa2fd7/';

const decor = [
  { src: B + 'moon_icon.11395d36.png', cls: 'w-[120px] sm:w-[160px] md:w-[210px] top-[4%] left-[1%] sm:left-[2%] md:left-[4%]', delay: 0.1, x: -80 },
  { src: B + 'p59_1.4659672e.png', cls: 'w-[100px] sm:w-[140px] md:w-[180px] bottom-[8%] left-[3%] sm:left-[6%] md:left-[10%]', delay: 0.25, x: -80 },
  { src: B + 'lego_icon-1.703bb594.png', cls: 'w-[120px] sm:w-[160px] md:w-[210px] top-[4%] right-[1%] sm:right-[2%] md:right-[4%]', delay: 0.15, x: 80 },
  { src: B + 'Group_134-1.2e04f3ce.png', cls: 'w-[130px] sm:w-[170px] md:w-[220px] bottom-[8%] right-[3%] sm:right-[6%] md:right-[10%]', delay: 0.3, x: 80 },
];

const TEXT =
  "Performance Marketing Lead with 5+ years in D2C fashion and retail, managing Meta and Google Ads budgets of up to ₹50L a month. I deliver up to 10X ROAS and cut CAC and CPL by 20–30% through full-funnel strategy, creative testing, CRO and retargeting, with clean GA4, GTM, Meta Pixel and CAPI tracking behind every decision.";

export default function AboutSection() {
  return (
    <section
      id="about"
      className="relative min-h-screen flex flex-col items-center justify-center px-5 sm:px-8 md:px-10 py-20"
      style={{ background: '#0C0C0C' }}
    >
      {decor.map((d) => (
        <FadeIn key={d.src} className={`absolute ${d.cls}`} delay={d.delay} x={d.x} y={0} duration={0.9}>
          <img src={d.src} alt="" className="w-full h-auto" draggable={false} />
        </FadeIn>
      ))}

      <div className="relative z-10 flex flex-col items-center gap-16 sm:gap-20 md:gap-24">
        <div className="flex flex-col items-center gap-10 sm:gap-14 md:gap-16">
          <FadeIn delay={0} y={40}>
            <h2
              className="hero-heading font-black uppercase leading-none tracking-tight text-center"
              style={{ fontSize: 'clamp(3rem, 12vw, 160px)' }}
            >
              About me
            </h2>
          </FadeIn>
          <AnimatedText
            text={TEXT}
            className="text-[#D7E2EA] font-medium text-center leading-relaxed max-w-[560px]"
            style={{ fontSize: 'clamp(1rem, 2vw, 1.35rem)' }}
          />
        </div>
        <Magnet padding={60} strength={3}>
          <ContactButton />
        </Magnet>
      </div>
    </section>
  );
}
