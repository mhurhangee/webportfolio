'use client';

import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { FlipWords } from '@/components/ui/flipwords';
import { User2, Bot, BookText } from 'lucide-react';
import { container, item } from '@/lib/animation';

export default function Home() {
  return (
    <>
      <div className="flex min-h-[100dvh] flex-col items-center justify-center p-4 sm:p-6">
        <motion.div
          variants={container}
          initial="hidden"
          animate="visible"
          className="container max-w-4xl space-y-12 sm:space-y-24 text-center"
        >
          <motion.div className="space-y-4 sm:space-y-8">
            <motion.h1
              variants={item}
              className="text-3xl sm:text-4xl md:text-6xl lg:text-7xl font-bold tracking-tighter"
            >
              Welcome to <span className="text-red-500">ai</span>
              <span className="text-blue-500">con</span>
              <span className="text-yellow-500">sult</span>
              <span className="text-green-500">.uk</span>
            </motion.h1>

            <motion.h2
              variants={item}
              className="text-xl sm:text-2xl md:text-3xl tracking-tighter font-light font-mono text-muted-foreground"
            >
              a portfolio by michael hurhangee
            </motion.h2>
          </motion.div>

          <motion.div
            variants={item}
            className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 md:gap-6"
          >
            <Link href="/aboutme" className="w-[200px] sm:w-auto">
              <Button
                size="lg"
                className="w-full text-base sm:text-lg px-4 sm:px-8 py-5 sm:py-6 space-x-2"
              >
                <User2 className="h-4 w-4 sm:h-5 sm:w-5" />
                <span>About Me</span>
              </Button>
            </Link>

            <Link href="/ai" className="w-[200px] sm:w-auto">
              <Button
                size="lg"
                variant="outline"
                className="w-full text-base sm:text-lg px-4 sm:px-8 py-5 sm:py-6 space-x-2"
              >
                <Bot className="h-4 w-4 sm:h-5 sm:w-5" />
                <span>AI Playground</span>
              </Button>
            </Link>

            <Link href="/blog" className="w-[200px] sm:w-auto">
              <Button
                size="lg"
                variant="secondary"
                className="w-full text-base sm:text-lg px-4 sm:px-8 py-5 sm:py-6 space-x-2"
              >
                <BookText className="h-4 w-4 sm:h-5 sm:w-5" />
                <span>Blog</span>
              </Button>
            </Link>
          </motion.div>

          <motion.div variants={item} className="text-sm text-muted-foreground pt-4 sm:pt-8 hidden md:block">
            <FlipWords
              words={[
                'Building a better future for all with AI.',
                'Exploring the intersection of AI and creative development',
                'Building innovative solutions',
                'Crafting digital experiences',
              ]}
            />
          </motion.div>
        </motion.div>
      </div>
    </>
  );
}
