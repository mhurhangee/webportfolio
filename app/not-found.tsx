'use client';

import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { FlipWords } from '@/components/ui/flipwords';
import { House, Ghost } from 'lucide-react';
import { container, item } from '@/lib/animation';

export default function NotFound() {
  return (
    <div className="flex min-h-[100dvh] flex-col items-center justify-center px-4">
      <motion.div
        variants={container}
        initial="hidden"
        animate="visible"
        className="container space-y-24 text-center"
      >
        <motion.div className="space-y-8">
          <motion.div variants={item} className="flex justify-center">
            <Ghost className="h-16 w-16 text-primary animate-float" />
          </motion.div>
          <motion.h1
            variants={item}
            className="text-4xl sm:text-6xl lg:text-7xl font-bold tracking-tighter bg-clip-text text-transparent bg-gradient-to-b from-primary/70 to-primary"
          >
            404
          </motion.h1>
          <motion.div variants={item}>
            <FlipWords
              words={[
                'Page not found',
                'Got lost in the void',
                'Took a wrong turn',
                'Wandered too far',
              ]}
              className="text-2xl sm:text-3xl tracking-tighter font-light font-mono text-muted-foreground"
            />
          </motion.div>
        </motion.div>

        <motion.div variants={item}>
          <Link href="/">
            <Button size="lg" className="text-lg px-8 py-6 space-x-2">
              <House className="h-5 w-5 group-hover:animate-icon-bounce" />
              <span>Home</span>
            </Button>
          </Link>
        </motion.div>
      </motion.div>
    </div>
  );
}
