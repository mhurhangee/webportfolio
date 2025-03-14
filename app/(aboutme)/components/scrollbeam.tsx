import { motion, useScroll, useSpring } from 'framer-motion';
import { useSection } from './sectioncontext';

export function ScrollBeam() {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001,
  });

  const { currentSection } = useSection() as { currentSection: keyof typeof gradients };

  // Define gradient colors for each section
  const gradients = {
    hero: 'from-white to-gray-200',
    services: 'from-red-500 to-red-700',
    expertise: 'from-blue-500 to-blue-700',
    story: 'from-yellow-500 to-yellow-600',
    contact: 'from-green-500 to-green-700',
  };

  return (
    <motion.div
      className={`fixed bottom-0 z-100 left-0 right-0 h-1 bg-gradient-to-r ${gradients[currentSection] || gradients.hero}`}
      style={{ scaleX, transformOrigin: '0%' }}
    />
  );
}
