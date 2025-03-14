'use client';
import { useScroll, useTransform, motion, useInView } from 'framer-motion';
import React, { useEffect, useRef, useState } from 'react';

interface TimelineEntry {
  title: string;
  content: React.ReactNode;
}

export const Timeline = ({ data }: { data: TimelineEntry[] }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [containerHeight, setContainerHeight] = useState(0);

  useEffect(() => {
    if (containerRef.current) {
      setContainerHeight(containerRef.current.scrollHeight);
    }
  }, []);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start center', 'end center'],
  });

  const lineHeight = useTransform(
    scrollYProgress,
    [0, 0.05, 0.95, 1],
    [0, containerHeight * 0.1, containerHeight * 0.9, containerHeight]
  );

  return (
    <div ref={containerRef} className="w-full font-sans md:px-10 relative">
      <div className="max-w-7xl mx-auto pb-20">
        {data.map((item, index) => (
          <TimelineItem key={index} item={item} />
        ))}
      </div>
      <div className="absolute left-4 md:left-1/2 top-0 bottom-0 w-0.5 bg-yellow-500/20">
        <motion.div
          className="absolute top-0 left-0 w-full bg-yellow-500"
          style={{ height: lineHeight }}
        />
      </div>
    </div>
  );
};

const TimelineItem = ({ item }: { item: TimelineEntry }) => {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: false, margin: '-40% 0px -40% 0px' });

  return (
    <div ref={ref} className="flex flex-col md:flex-row justify-between py-10 md:py-20 relative">
      <motion.div
        className="sticky top-20 flex flex-col md:flex-row items-start md:w-1/2 pb-10 md:pb-0 z-10"
        initial={{ opacity: 0, y: 50 }}
        animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
        transition={{ duration: 0.5 }}
      >
        <div className="flex items-center">
          <div className="h-8 w-8 rounded-full bg-yellow-500 flex items-center justify-center">
            <div className="h-3 w-3 rounded-full bg-yellow-700" />
          </div>
          <h3 className="ml-4 text-2xl md:text-4xl font-bold text-yellow-500">{item.title}</h3>
        </div>
      </motion.div>
      <motion.div
        className="md:w-1/2 pl-8 md:pl-20 relative"
        initial={{ opacity: 0, y: 20 }}
        animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <div className="absolute top-0 left-0 w-0.5 h-full bg-yellow-500/20 md:hidden" />
        <div className="relative z-20 text-left">{item.content}</div>
      </motion.div>
    </div>
  );
};
