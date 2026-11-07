import { useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import type { MotionValue } from 'framer-motion';

function Char({ ch, i, total, progress }: { ch: string; i: number; total: number; progress: MotionValue<number> }) {
  const opacity = useTransform(progress, [i / total, (i + 1) / total], [0.2, 1]);
  return (
    <span className="relative inline-block">
      <span className="invisible">{ch}</span>
      <motion.span className="absolute left-0 top-0" style={{ opacity }}>
        {ch}
      </motion.span>
    </span>
  );
}

export default function AnimatedText({ text, className = '', style }: { text: string; className?: string; style?: React.CSSProperties }) {
  const ref = useRef<HTMLParagraphElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start 0.8', 'end 0.2'] });
  const words = text.split(' ');
  const total = text.length;
  let n = 0;
  return (
    <p ref={ref} className={className} style={style}>
      {words.map((w, wi) => {
        const start = n;
        n += w.length + 1;
        return (
          <span key={wi}>
            <span className="inline-block whitespace-nowrap">
              {w.split('').map((c, ci) => (
                <Char key={ci} ch={c} i={start + ci} total={total} progress={scrollYProgress} />
              ))}
            </span>
            {wi < words.length - 1 && ' '}
          </span>
        );
      })}
    </p>
  );
}
