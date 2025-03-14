import { ReactNode, useEffect, useRef } from 'react';
import { motion, useInView, useAnimation, useScroll, useTransform } from 'framer-motion';
import { useSection } from './sectioncontext';

interface SectionProps {
  children: ReactNode;
  className?: string;
  id: string;
}

export function Section({ children, className = '', id }: SectionProps) {
  const { sectionRefs } = useSection();
  const sectionRef = useRef<HTMLElement>(null);
  const isInView = useInView(sectionRef, { once: false, amount: 0.1 }); // Updated useInView hook
  const controls = useAnimation();

  useEffect(() => {
    if (sectionRef.current) {
      sectionRefs.current[id] = sectionRef.current;
    }
  }, [id, sectionRefs]);

  useEffect(() => {
    if (isInView) {
      controls.start('visible');
    } else {
      controls.start('hidden');
    }
  }, [isInView, controls]);

  const variants = {
    hidden: { opacity: 0, y: 20 }, // Updated variants object
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        ease: [0.6, -0.05, 0.01, 0.99],
      },
    },
  };

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start end', 'end start'],
  });

  const y = useTransform(scrollYProgress, [0, 1], ['0%', '-5%']);

  return (
    <motion.section
      ref={sectionRef}
      id={id}
      className={`relative min-h-screen w-full flex items-center justify-center ${className}`}
      initial="hidden"
      animate={controls}
      variants={variants}
    >
      <motion.div
        className="relative w-full max-w-4xl mx-auto px-6 py-16" // Reduced vertical padding
        style={{ y }}
      >
        {children}
      </motion.div>
    </motion.section>
  );
}
