import { useEffect, useRef, useState } from 'react';

const GIFS = [
  'hero-space-voyage-preview-eECLH3Yc',
  'hero-codenest-preview-Cgppc2qV',
  'hero-vex-ventures-preview-BczMFIiw',
  'hero-stellar-ai-v2-preview-DjvxjG3C',
  'hero-asme-preview-B_nGDnTP',
  'hero-transform-data-preview-Cx5OU29N',
  'hero-vitara-preview-Cjz2QYyU',
  'hero-terra-preview-BFjrCr7T',
  'hero-skyelite-preview-DHaZIgUv',
  'hero-aethera-preview-DknSlcTa',
  'hero-designpro-preview-D8c5_een',
  'hero-stellar-ai-preview-D3HL6bw1',
  'hero-xportfolio-preview-D4A8maiC',
  'hero-orbit-web3-preview-BXt4OttD',
  'hero-nexora-preview-cx5HmUgo',
  'hero-evr-ventures-preview-DZxeVFEX',
  'hero-planet-orbit-preview-DWAP8Z1P',
  'hero-new-era-preview-CocuDUm9',
  'hero-wealth-preview-B70idl_u',
  'hero-luminex-preview-CxOP7ce6',
  'hero-celestia-preview-0yO3jXO8',
].map((n) => `https://motionsites.ai/assets/${n}.gif`);

const row1 = GIFS.slice(0, 11);
const row2 = GIFS.slice(11);
const tripled = (a: string[]) => [...a, ...a, ...a];

function Row({ images, transform }: { images: string[]; transform: string }) {
  return (
    <div className="flex gap-3 w-max" style={{ transform, willChange: 'transform' }}>
      {tripled(images).map((src, i) => (
        <img
          key={i}
          src={src}
          alt=""
          loading="lazy"
          className="shrink-0 rounded-2xl object-cover"
          style={{ width: 420, height: 270 }}
        />
      ))}
    </div>
  );
}

export default function MarqueeSection() {
  const ref = useRef<HTMLElement>(null);
  const [offset, setOffset] = useState(0);

  useEffect(() => {
    const update = () => {
      const el = ref.current;
      if (!el) return;
      const top = el.getBoundingClientRect().top + window.scrollY;
      setOffset((window.scrollY - top + window.innerHeight) * 0.3);
    };
    update();
    window.addEventListener('scroll', update, { passive: true });
    window.addEventListener('resize', update);
    return () => {
      window.removeEventListener('scroll', update);
      window.removeEventListener('resize', update);
    };
  }, []);

  // each strip is three copies wide; start on the middle copy so there are never gaps at either edge
  return (
    <section ref={ref} className="pt-24 sm:pt-32 md:pt-40 pb-10 flex flex-col gap-3" style={{ background: '#0C0C0C', overflow: 'hidden' }}>
      <Row images={row1} transform={`translateX(calc(-33.3333% + ${offset - 200}px))`} />
      <Row images={row2} transform={`translateX(calc(-33.3333% + ${-(offset - 200)}px))`} />
    </section>
  );
}
