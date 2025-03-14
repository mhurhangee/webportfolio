'use client';

import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import { useEffect } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';
import { container, item } from '@/lib/animation';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

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
            <AlertTriangle className="h-16 w-16 text-primary" />
          </motion.div>
          <motion.h1
            variants={item}
            className="text-4xl sm:text-6xl lg:text-7xl font-bold tracking-tighter bg-clip-text text-transparent bg-gradient-to-b from-primary/70 to-primary"
          >
            Oops! Something went wrong
          </motion.h1>
          <motion.p variants={item} className="mx-auto max-w-[600px] text-xl text-muted-foreground">
            Don&apos;t worry, it&apos;s not your fault. Let&apos;s try that again.
          </motion.p>
        </motion.div>

        <motion.div variants={item}>
          <Button onClick={reset} size="lg" className="text-lg px-8 py-6 space-x-2">
            <RefreshCw className="h-5 w-5 group-hover:animate-icon-bounce" />
            <span>Try Again</span>
          </Button>
        </motion.div>
      </motion.div>
    </div>
  );
}
