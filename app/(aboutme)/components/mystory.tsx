import { useSection } from './sectioncontext';
import { motion } from 'framer-motion';
import { Timeline } from './timeline';
import Image from 'next/image';
import { Book } from 'lucide-react';

export function MyStory() {
  const timelineData = [
    {
      title: '2023 - Now',
      content: (
        <div>
          <p className="text-muted-foreground text-sm font-normal mb-4">
            Transitioned into AI Engineering and Consultancy, focusing on delivering AI, automation,
            and innovation directly to clients.
          </p>
          <p className="text-muted-foreground text-sm font-normal mb-4">
            Leveraging my unique background in patent law and technology to help businesses harness
            the power of AI while navigating complex legal and ethical landscapes.
          </p>
          <div className="grid grid-cols-2 gap-4">
            <Image
              src="/eureka.png"
              alt="AI Engineering"
              width={500}
              height={500}
              className="rounded-lg object-cover h-auto aspect-square w-full shadow-md hover:shadow-lg transition-shadow duration-300"
            />
            <Image
              src="/arms.png"
              alt="AI Consultancy"
              width={500}
              height={500}
              className="rounded-lg object-cover h-auto aspect-square w-full shadow-md hover:shadow-lg transition-shadow duration-300"
            />
          </div>
        </div>
      ),
    },
    {
      title: '2017 - 2023',
      content: (
        <div>
          <p className="text-muted-foreground text-sm font-normal mb-4">
            Worked as a UK and European Patent Attorney, specializing in high-tech and novel
            patents.
          </p>
          <p className="text-muted-foreground text-sm font-normal mb-4">
            Represented clients at the European Patent Office in litigious proceedings and helped
            develop IP protection strategies.
          </p>
          <p className="text-muted-foreground text-sm font-normal mb-4">
            Worked on cutting-edge inventions ranging from transistors and computer memory to safety
            devices for electric and autonomous vehicles.
          </p>
          <div className="grid grid-cols-2 gap-4">
            <Image
              src="/lawyer.png"
              alt="Patent Attorney"
              width={500}
              height={500}
              className="rounded-lg object-cover h-auto aspect-square w-full shadow-md hover:shadow-lg transition-shadow duration-300"
            />
            <Image
              src="/draw.png"
              alt="IP Strategy"
              width={500}
              height={500}
              className="rounded-lg object-cover h-auto aspect-square w-full shadow-md hover:shadow-lg transition-shadow duration-300"
            />
          </div>
        </div>
      ),
    },
    {
      title: '2012 - 2017',
      content: (
        <div>
          <p className="text-muted-foreground text-smfont-normal mb-4">
            Completed a PhD in Chemistry at Imperial College London, focusing on plastic electronics
            for photovoltaics and organic transistors. Published over 10 research papers,
            accumulating more than 3000 citations, contributing significantly to the field of
            materials science and electronics.
          </p>
          <div className="grid grid-cols-2 gap-4">
            <Image
              src="/phd.jpg"
              alt="PhD Research"
              width={500}
              height={500}
              className="rounded-lg object-cover h-auto aspect-square w-full shadow-md hover:shadow-lg transition-shadow duration-300"
            />
            <Image
              src="/uni.png"
              alt="Publications"
              width={500}
              height={500}
              className="rounded-lg object-cover h-auto aspect-square w-full shadow-md hover:shadow-lg transition-shadow duration-300"
            />
          </div>
        </div>
      ),
    },
    {
      title: '2008 - 2012',
      content: (
        <div>
          <p className="text-muted-foreground text-sm font-normal mb-4">
            Completed an undergraduate chemistry degree and worked on website development, laying
            the foundation for my future career in technology and science.
          </p>
          <div className="grid grid-cols-2 gap-4">
            <Image
              src="/lab.png"
              alt="Chemistry Degree"
              width={500}
              height={500}
              className="rounded-lg object-cover h-auto aspect-square w-full shadow-md hover:shadow-lg transition-shadow duration-300"
            />
            <Image
              src="https://images.unsplash.com/photo-1461749280684-dccba630e2f6?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1469&q=80"
              alt="Web Development"
              width={500}
              height={500}
              className="rounded-lg object-cover h-auto aspect-square w-full shadow-md hover:shadow-lg transition-shadow duration-300"
            />
          </div>
        </div>
      ),
    },
    {
      title: 'About Me',
      content: (
        <div>
          <p className="text-muted-foreground font-normal mb-4">
            Beyond my professional journey, I&apos;m a long-suffering Southampton fan and a proud
            whippet owner. I&apos;m passionate about technology and love attending live music
            events.
          </p>
          <div className="grid grid-cols-3 gap-4">
            <Image
              src="/football.png"
              alt="Southampton FC"
              width={500}
              height={500}
              className="rounded-lg object-cover h-auto aspect-square w-full shadow-md hover:shadow-lg transition-shadow duration-300"
            />
            <Image
              src="/whippet.png"
              alt="My Whippet"
              width={500}
              height={500}
              className="rounded-lg object-cover h-auto aspect-square w-full shadow-md hover:shadow-lg transition-shadow duration-300"
            />
            <Image
              src="/gig.png"
              alt="Live Music"
              width={500}
              height={500}
              className="rounded-lg object-cover h-auto aspect-square w-full shadow-md hover:shadow-lg transition-shadow duration-300"
            />
          </div>
        </div>
      ),
    },
  ];

  return (
    <motion.div
      className="text-center min-h-screen flex flex-col justify-center items-center"
      animate="visible"
    >
      <motion.div
        className="absolute top-12 right-12 text-yellow-500/20"
        initial={{ opacity: 0, rotate: 0 }}
        animate={{
          opacity: [0.5, 1, 0.5],
          rotate: [0, 10, 0, -10, 0],
        }}
        transition={{
          duration: 6,
          repeat: Infinity,
          repeatType: 'reverse',
        }}
      >
        <Book className="w-12 h-12 sm:w-16 sm:h-16 md:w-24 md:h-24" />
      </motion.div>
      <motion.h2 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold mb-8 font-mono tracking-tighter bg-clip-text text-transparent bg-gradient-to-b from-yellow-400 to-yellow-500">
        My story
      </motion.h2>
      <motion.p
        className="text-lg mb-12 max-w-3xl mx-auto text-muted-foreground leading-relaxed"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        From synthesizing plastic electronics to protecting intellectual property, and now driving
        AI innovation, my journey has been a continuous evolution of turning complex ideas into
        practical solutions.
      </motion.p>
      <motion.div className="w-full" animate="visible">
        <Timeline data={timelineData} />
      </motion.div>
    </motion.div>
  );
}
