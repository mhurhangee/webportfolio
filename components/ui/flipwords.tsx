'use client';

import { forwardRef } from 'react';
import { useCallback, useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { cn } from '@/lib/utils';

export const FlipWords = forwardRef<
  HTMLDivElement,
  {
    words: string[];
    duration?: number;
    className?: string;
  }
>(function FlipWords({ words, duration = 4000, className }, ref) {
  const [currentWord, setCurrentWord] = useState(words[0]);
  const [isAnimating, setIsAnimating] = useState<boolean>(false);

  const startAnimation = useCallback(() => {
    setCurrentWord((prevWord) => {
      if (prevWord === undefined) {
        return words[0];
      }
      const nextIndex = (words.indexOf(prevWord) + 1) % words.length;
      return words[nextIndex];
    });
    setIsAnimating(true);
  }, [words]);

  useEffect(() => {
    const timer = setInterval(() => {
      startAnimation();
    }, duration);

    return () => clearInterval(timer);
  }, [duration, startAnimation]);

  return (
    <div ref={ref} className={cn('relative', className)}>
      <AnimatePresence mode="popLayout">
        <motion.div
          key={currentWord}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.3 }}
          className="absolute inset-0 whitespace-nowrap"
        >
          {currentWord}
        </motion.div>
      </AnimatePresence>
    </div>
  );
});
