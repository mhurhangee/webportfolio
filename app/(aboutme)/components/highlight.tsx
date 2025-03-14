'use client';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';
import React from 'react';
import { useSection } from './sectioncontext';

interface HighlightProps {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  linkTo?: string;
  color: string;
}

export const Highlight: React.FC<HighlightProps> = ({
  children,
  className,
  delay = 0,
  linkTo,
  color,
}) => {
  const { scrollToSection } = useSection();

  const handleClick = () => {
    if (linkTo) {
      scrollToSection(linkTo);
    }
  };

  return (
    <motion.span
      initial={{
        backgroundSize: '0% 100%',
        backgroundPosition: '0% 100%',
      }}
      animate={{
        backgroundSize: '100% 100%',
      }}
      transition={{
        duration: 1,
        ease: 'easeInOut',
        delay: delay,
      }}
      className={cn(
        'relative px-1 py-0.5 my-1 rounded-md cursor-pointer transition-all duration-700 text-foreground font-semibold',
        `bg-gradient-to-b ${color} bg-[length:0%_100%] bg-no-repeat hover:bg-[length:100%_100%]`,
        'hover:text-transparent hover:bg-clip-text whitespace-nowrap ',

        className
      )}
      onClick={handleClick}
      whileHover={{ scale: 1.05, y: -2 }}
      whileTap={{ scale: 0.95 }}
    >
      {children}
    </motion.span>
  );
};
