'use client';

import { motion } from 'framer-motion';
import { ArrowUp } from 'lucide-react';

export function ScrollToTop() {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <motion.div
      className="flex flex-col items-center cursor-pointer"
      onClick={scrollToTop}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.1 }}
    >
      <motion.div
        className="p-2 rounded-full bg-gradient-to-t from-green-500 to-green-600"
        animate={{
          y: [-4, 4, -4],
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      >
        <ArrowUp className="w-6 h-6 text-white" />
      </motion.div>
    </motion.div>
  );
}
