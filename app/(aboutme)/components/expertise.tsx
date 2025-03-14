import { motion } from 'framer-motion';
import { Award, Book, Briefcase, Cpu } from 'lucide-react';
import Image from 'next/image';
import { ScrollArrow } from './scroll-arrow';
import { CTAButton } from './cta-button';

const achievements = [
  {
    title: 'Patent Expertise',
    description:
      'Over 5 years experience as a UK and European Patent Attorney, specializing in high-tech patents.',
    icon: Briefcase,
    stat: '100+ Patents Filed',
    image: '/library.png',
  },
  {
    title: 'Research Impact',
    description:
      'Published 10+ research papers with over 3000 cumulative citations in the field of plastic electronics.',
    icon: Book,
    stat: '3000+ Citations',
    image: '/eureka-ai.png',
  },
  {
    title: 'Innovative Problem Solving',
    description:
      'Worked on cutting-edge inventions from transistors to autonomous vehicle safety systems and now AI.',
    icon: Cpu,
    stat: '30+ bespoke AI tools',
    image: '/bike.png',
  },
  {
    title: 'Effective Communication',
    description:
      'Worked with multinational companies and solo entrepreneurs spanning diverse industries and nationalities.',
    icon: Award,
    stat: 'Numerous collaborative projects, industries and clients',
    image: '/ai-communication.png',
  },
];

const cardVariants = {
  hidden: { opacity: 0, y: 50 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: {
      delay: i * 0.1,
      duration: 0.5,
      ease: 'easeOut',
    },
  }),
};

const contentVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      delay: 0.2,
      duration: 0.5,
    },
  },
};

export function ExpertiseAndAchievements() {
  return (
    <div className="text-center">
      <motion.div
        className="absolute top-16 right-6 text-blue-500"
        initial={{ opacity: 0, y: -20 }}
        animate={{
          opacity: [0.5, 1, 0.5],
          y: [-20, 0, -20],
        }}
        transition={{
          duration: 4,
          repeat: Infinity,
          repeatType: 'reverse',
        }}
      >
        <Award className="w-12 h-12 sm:w-16 sm:h-16 md:w-24 md:h-24" />
      </motion.div>
      <motion.h2
        className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold mb-8 font-mono tracking-tighter bg-clip-text text-transparent bg-gradient-to-b from-blue-400 to-blue-600"
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        Achievements
      </motion.h2>
      <motion.p
        className="text-lg mb-12 max-w-3xl mx-auto text-muted-foreground leading-relaxed"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        From synthesizing plastic electronics to protecting intellectual property, and now driving
        AI innovation, my journey has been a continuous evolution of turning complex ideas into
        practical solutions.
      </motion.p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
        {achievements.map((achievement, index) => (
          <motion.div
            key={index}
            custom={index}
            variants={cardVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
            className="rounded-lg p-6 text-left relative overflow-hidden"
          >
            <motion.div variants={contentVariants} className="flex items-center mb-4">
              <achievement.icon className="w-8 h-8 text-blue-500 mr-4" />
              <h3 className="text-xl font-bold text-foreground font-mono tracking-tighter">
                {achievement.title}
              </h3>
            </motion.div>
            <motion.p variants={contentVariants} className="text-muted-foreground text-sm mb-4">
              {achievement.description}
            </motion.p>
            <motion.div variants={contentVariants}>
              <Image
                src={achievement.image}
                alt={achievement.title}
                width={500}
                height={300}
                className="rounded-lg mb-4 object-cover w-full h-48"
              />
            </motion.div>
            <motion.div variants={contentVariants} className="flex items-center justify-between">
              <span className="text-blue-400 font-semibold">{achievement.stat}</span>
            </motion.div>
          </motion.div>
        ))}
      </div>
      <div className="flex justify-center mt-12">
        <CTAButton />
      </div>
      <motion.div className="mt-12">
        <ScrollArrow />
      </motion.div>
    </div>
  );
}
