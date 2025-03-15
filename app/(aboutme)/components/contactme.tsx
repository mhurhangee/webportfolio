import { useSection } from './sectioncontext';
import { motion } from 'framer-motion';
import { Mail, MapPin, Github, Linkedin, Calendar } from 'lucide-react';
import { ScrollToTop } from './scroll-to-top';
import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export function ContactMe() {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
  };

  return (
    <motion.div
      className="text-center"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <motion.div
        className="absolute top-12 left-16 text-green-500"
        initial={{ opacity: 0, x: -20 }}
        animate={{
          opacity: [0.5, 1, 0.5],
          x: [-20, 0, -20],
        }}
        transition={{
          duration: 4,
          repeat: Infinity,
          repeatType: 'reverse',
        }}
      >
        <Mail className="w-12 h-12 sm:w-16 sm:h-16 md:w-24 md:h-24" />
      </motion.div>
      <motion.h2
        className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold mb-8 font-mono tracking-tighter bg-clip-text text-transparent bg-gradient-to-b from-green-400 to-green-600"
        variants={itemVariants}
      >
        Contact me
      </motion.h2>

      <motion.div
        className="flex flex-col items-center space-y-6 mb-8"
        variants={containerVariants}
      >
        <Image
          src="/mh.jpg"
          alt="Michael Hurhangee"
          width={100}
          height={100}
          className="rounded-full"
        />

        <motion.div className="space-y-4" variants={itemVariants}>
          <Link href="mailto:michael@aiconsult.uk">
            <Button
              variant="ghost"
              className="flex items-center space-x-2 hover:bg-green-500/10 text-lg"
            >
              <Mail className="h-6 w-6 text-green-400" />
              <span>michael@aiconsult.uk</span>
            </Button>
          </Link>

          <Link href="https://github.com/mhurhangee" target="_blank" rel="noopener noreferrer">
            <Button
              variant="ghost"
              className="flex items-center space-x-2 hover:bg-green-900 text-lg"
            >
              <Github className="h-6 w-6 text-green-400" />
              <span>GitHub</span>
            </Button>
          </Link>

          <Link
            href="https://www.linkedin.com/in/michael-hurhangee-ab83b8134/"
            target="_blank"
            rel="noopener noreferrer"
          >
            <Button
              variant="ghost"
              className="flex items-center space-x-2 hover:bg-green-500/10 text-lg"
            >
              <Linkedin className="h-6 w-6 text-green-400" />
              <span>LinkedIn</span>
            </Button>
          </Link>

          <Link
            href="https://calendar.app.google/3tqFGYuhNTHnHwxS6"
            target="_blank"
            rel="noopener noreferrer"
          >
            <Button
              variant="ghost"
              className="flex items-center space-x-2 hover:bg-green-500/10 text-lg"
            >
              <Calendar className="h-6 w-6 text-green-400" />
              <span>Book a consultation</span>
            </Button>
          </Link>
          <Link href="/" target="_blank" rel="noopener noreferrer">
            <Button
              variant="ghost"
              className="flex items-center space-x-2 hover:bg-green-500/10 text-lg"
            >
              <MapPin className="h-6 w-6 text-green-400" />
              <span>Southampton, UK</span>
            </Button>
          </Link>
        </motion.div>
      </motion.div>

      <motion.div variants={itemVariants} className="mt-8">
        <ScrollToTop />
      </motion.div>
    </motion.div>
  );
}
