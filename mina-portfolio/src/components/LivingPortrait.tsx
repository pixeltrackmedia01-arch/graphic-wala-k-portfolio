import { useEffect } from 'react';
import FadeIn from './FadeIn';
import { initLivingPortrait } from '../engine/livingPortrait';

const FALLBACK = '/mital-face.png';

export default function LivingPortrait() {
  useEffect(() => initLivingPortrait(), []);
  return (
    <div
      className="hero-portrait-wrap sm:w-[500px] md:w-[600px] lg:w-[clamp(640px,78vh,46vw)]"
      id="magnetWrap"
    >
      <FadeIn className="hero-portrait-inner" delay={0.6} y={30}>
        <div id="magnetInner" className="relative">
          <img id="faceFallback" src={FALLBACK} alt="Portrait" />
          <canvas id="faceGl" aria-hidden="true" />
          <div id="faceProps" aria-hidden="true">
            <svg id="faceFly" viewBox="0 0 32 32">
              <path className="wing" d="M15 15C12 9.500 4.500 8.500 2 13c2.500 4.500 10 4.500 13 2z" />
              <path className="wing r" d="M17 15c3-5.500 10.500-6.500 13-2-2.500 4.500-10 4.500-13 2z" />
              <ellipse cx="16" cy="19.500" rx="4" ry="6.500" />
              <circle cx="16" cy="11.500" r="3.300" />
            </svg>
            <svg id="faceHand" viewBox="0 0 32 32">
              <path className="open" d="M10.500 16.500V8.200a1.800 1.800 0 0 1 3.600 0V14v-8a1.800 1.800 0 0 1 3.600 0V14 7a1.800 1.800 0 0 1 3.600 0v8-5a1.800 1.800 0 0 1 3.600 0v10.500c0 5-3.400 8.500-8.400 8.500-3.600 0-5.700-1.600-7.600-4.600l-3.500-5.600c-.6-1 .1-2.200 1.200-2.400 1-.2 1.900.2 2.600 1z" />
              <path className="grab" d="M10.500 17v-3.300a1.800 1.800 0 0 1 3.600 0V14v-1.800a1.800 1.800 0 0 1 3.600 0V14v-1.300a1.800 1.800 0 0 1 3.600 0V14v-.3a1.800 1.800 0 0 1 3.600 0v6.800c0 5-3.400 8.500-8.400 8.500-3.600 0-5.700-1.600-7.600-4.600l-2.300-3.700c-.6-1 .1-2.200 1.200-2.400 1-.2 1.900.2 2.700 1z" />
            </svg>
          </div>
        </div>
      </FadeIn>
    </div>
  );
}
