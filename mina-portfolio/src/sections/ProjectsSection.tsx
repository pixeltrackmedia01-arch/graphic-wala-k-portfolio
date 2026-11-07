import { useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import FadeIn from '../components/FadeIn';
import LiveProjectButton from '../components/LiveProjectButton';
import { EMAIL } from '../components/ContactButton';
import { PROJECTS } from '../data/projects';
import type { Project } from '../data/projects';

const RADIUS = 'rounded-[40px] sm:rounded-[50px] md:rounded-[60px]';

function ProjectCard({ project, index, total }: { project: Project; index: number; total: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'start start'] });
  const targetScale = 1 - (total - 1 - index) * 0.03;
  const scale = useTransform(scrollYProgress, [0, 1], [1, targetScale]);

  return (
    <div ref={ref} className="h-[85vh]">
      <div className="sticky top-24 md:top-32">
        <motion.div
          className={`relative border-2 border-[#D7E2EA] p-4 sm:p-6 md:p-8 ${RADIUS}`}
          style={{ background: '#0C0C0C', scale, top: `${index * 28}px`, transformOrigin: 'top center' }}
        >
          <div className="flex items-center justify-between gap-4 mb-4 sm:mb-6 md:mb-8 px-2">
            <div className="flex items-center gap-4 sm:gap-6 md:gap-8 min-w-0">
              <span className="font-black leading-none text-[#D7E2EA]" style={{ fontSize: 'clamp(3rem, 10vw, 140px)' }}>
                {String(index + 1).padStart(2, '0')}
              </span>
              <div className="flex flex-col min-w-0">
                <span className="font-light uppercase tracking-widest text-[#D7E2EA] opacity-60" style={{ fontSize: 'clamp(0.7rem, 1.2vw, 1rem)' }}>
                  {project.category}
                </span>
                <h3 className="font-medium uppercase text-[#D7E2EA]" style={{ fontSize: 'clamp(1rem, 2.2vw, 2.1rem)' }}>
                  {project.name}
                </h3>
                <p className="hidden md:block font-light text-[#D7E2EA] opacity-70 max-w-xl mt-1" style={{ fontSize: 'clamp(0.75rem, 1.1vw, 1rem)' }}>
                  {project.role}
                </p>
              </div>
            </div>
            <div className="hidden sm:block shrink-0">
              <LiveProjectButton label="Get in touch" href={`mailto:${EMAIL}`} />
            </div>
          </div>

          <div className="flex gap-3 sm:gap-4">
            <div className="flex flex-col gap-3 sm:gap-4 w-[40%]">
              <img src={project.col1[0]} alt="" loading="lazy" className={`w-full object-cover ${RADIUS}`} style={{ height: 'clamp(130px, 16vw, 230px)' }} />
              <img src={project.col1[1]} alt="" loading="lazy" className={`w-full object-cover ${RADIUS}`} style={{ height: 'clamp(160px, 22vw, 340px)' }} />
            </div>
            <div className="w-[60%]">
              <img src={project.col2} alt="" loading="lazy" className={`w-full h-full object-cover ${RADIUS}`} />
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

export default function ProjectsSection() {
  return (
    <section
      id="projects"
      className="relative z-10 -mt-10 sm:-mt-12 md:-mt-14 rounded-t-[40px] sm:rounded-t-[50px] md:rounded-t-[60px] px-5 sm:px-8 md:px-10 py-20 sm:py-24 md:py-32"
      style={{ background: '#0C0C0C' }}
    >
      <FadeIn>
        <h2
          className="hero-heading font-black uppercase leading-none tracking-tight text-center mb-16 sm:mb-20 md:mb-28"
          style={{ fontSize: 'clamp(3rem, 12vw, 160px)' }}
        >
          Experience
        </h2>
      </FadeIn>
      <div className="max-w-6xl mx-auto">
        {PROJECTS.map((p, i) => (
          <ProjectCard key={p.name} project={p} index={i} total={PROJECTS.length} />
        ))}
      </div>
    </section>
  );
}
