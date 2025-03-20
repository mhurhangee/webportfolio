import { motion } from 'framer-motion';
import { FlipWords } from '@/components/ui/flipwords';
import { Highlight } from './highlight';
import { useRef } from 'react';
import Image from 'next/image';
import { container, item } from '@/lib/animation';
import { ScrollArrow } from './scroll-arrow';
import { CTAButton } from './cta-button';

export function Hero() {
  const ref = useRef(null);

  const roles = [
    'AI Engineer',
    'Patent Expert',
    'Consultant',
    'Python Dev',
    'TypeScript Dev',
    'Innovator',
  ];

  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="visible"
      className="max-w-6xl mx-auto flex flex-col items-center text-center"
    >
      <div ref={ref} className="text-center relative pt-6 md:pt-12">
        <div className="flex flex-col md:flex-row items-center justify-center mb-8">
          <motion.div className="mb-4 md:mb-0 md:mr-8 relative z-10" variants={item}>
            <Image
              src="/bilbo.jpg"
              alt="Michael Hurhangee"
              width={100}
              height={100}
              className="rounded-full"
            />
          </motion.div>
          <motion.div className="flex flex-col items-start text-left mb-6" variants={item}>
            <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-bold mb-2 font-mono tracking-tighter text-foreground">
              michael hurhangee
            </h1>
            <div className="h-8 sm:h-10 relative w-full overflow-hidden">
              <h2 className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-mono text-muted-foreground">
                <FlipWords
                  words={roles}
                  duration={2000}
                  className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-mono text-muted-foreground"
                />
              </h2>
            </div>
          </motion.div>
        </div>
        <motion.p
          className="mb-8 max-w-3xl mx-auto text-foreground/80 leading-relaxed text-base sm:text-lg md:text-xl lg:text-2xl"
          variants={item}
        >
          I{' '}
          <Highlight
            delay={0.5}
            linkTo="services"
            color="from-red-400 to-red-500 dark:from-red-500 dark:to-red-600"
          >
            transform businesses
          </Highlight>{' '}
          with innovative solutions, and use my expertise in{' '}
          <Highlight
            delay={1.0}
            linkTo="expertise"
            color="from-blue-400 to-blue-500 dark:from-blue-500 dark:to-blue-600"
          >
            technology and law
          </Highlight>{' '}
          to develop robust AI solutions. From{' '}
          <Highlight
            delay={2.0}
            linkTo="story"
            color="from-yellow-300 to-yellow-400 dark:from-yellow-500 dark:to-yellow-600"
          >
            my journey
          </Highlight>{' '}
          in research to patent law, I&apos;ve consistently turned complex ideas into practical
          solutions.{' '}
          {/*<Highlight delay={2.5} linkTo="contact" color="from-green-400 to-green-500 dark:from-green-500 dark:to-green-600">Let's connect.</Highlight>*/}
        </motion.p>
        <motion.div variants={item} className="flex justify-center mt-8">
          <CTAButton />
        </motion.div>
      </div>
      <motion.div variants={item} className="mt-12">
        <ScrollArrow />
      </motion.div>
    </motion.div>
  );
}
