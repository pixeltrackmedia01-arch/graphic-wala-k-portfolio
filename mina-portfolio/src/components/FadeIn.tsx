import { motion } from 'framer-motion';
import type { CSSProperties, ElementType, ReactNode } from 'react';

interface FadeInProps {
  children?: ReactNode;
  as?: ElementType;
  className?: string;
  style?: CSSProperties;
  delay?: number;
  duration?: number;
  x?: number;
  y?: number;
  id?: string;
}

const cache = new Map<ElementType, ElementType>();
const getMotion = (el: ElementType): ElementType => {
  if (!cache.has(el)) cache.set(el, motion.create(el as 'div'));
  return cache.get(el)!;
};

export default function FadeIn({ children, as = 'div', delay = 0, duration = 0.7, x = 0, y = 30, ...rest }: FadeInProps) {
  const Comp = getMotion(as);
  return (
    <Comp
      initial={{ opacity: 0, x, y }}
      whileInView={{ opacity: 1, x: 0, y: 0 }}
      viewport={{ once: true, margin: '50px', amount: 0 }}
      transition={{ duration, delay, ease: [0.25, 0.1, 0.25, 1] }}
      {...rest}
    >
      {children}
    </Comp>
  );
}
