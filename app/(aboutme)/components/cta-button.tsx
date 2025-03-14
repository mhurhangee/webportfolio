'use client';

import { cn } from '@/lib/utils';
import { motion, useAnimate } from 'framer-motion';
import { useEffect, useState } from 'react';
import {
  Mail,
  HandshakeIcon,
  Users,
  Send,
  LucideIcon,
  Footprints,
  Brush,
  ChartNoAxesCombined,
} from 'lucide-react';

interface CTAPhrase {
  text: string;
  icon: LucideIcon;
}

const ctaPhrases: CTAPhrase[] = [
  { text: "Let's Connect", icon: HandshakeIcon },
  { text: 'Book your free consultation today', icon: Mail },
  { text: "Let's Create Something Amazing", icon: Brush },
  { text: 'Want to Work Together?', icon: Users },
  { text: 'Transform Your Business Today', icon: Send },
  { text: 'Take The First Step', icon: Footprints },
  { text: 'Ready to elevate your business? ', icon: ChartNoAxesCombined },
];

export const CTAButton = ({ className }: { className?: string }) => {
  const [currentPhrase, setCurrentPhrase] = useState('');
  const [phraseIndex, setPhraseIndex] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);
  const [scope, animate] = useAnimate();

  useEffect(() => {
    let timeout: NodeJS.Timeout;

    const typeText = () => {
      const phrase = ctaPhrases[phraseIndex];
      if (!phrase) return;

      const fullPhrase = phrase.text;

      if (!isDeleting) {
        if (currentPhrase.length < fullPhrase.length) {
          setCurrentPhrase(fullPhrase.slice(0, currentPhrase.length + 1));
          timeout = setTimeout(typeText, 100);
        } else {
          timeout = setTimeout(() => setIsDeleting(true), 2000);
        }
      } else {
        if (currentPhrase.length > 0) {
          setCurrentPhrase(currentPhrase.slice(0, -1));
          timeout = setTimeout(typeText, 50);
        } else {
          setIsDeleting(false);
          setPhraseIndex((prev) => (prev + 1) % ctaPhrases.length);
        }
      }
    };

    timeout = setTimeout(typeText, 100);
    return () => clearTimeout(timeout);
  }, [currentPhrase, phraseIndex, isDeleting]);

  const scrollToContact = () => {
    const contactSection = document.getElementById('contact');
    if (contactSection) {
      contactSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const phrase = ctaPhrases[phraseIndex];
  if (!phrase) return null;

  const Icon = phrase.icon;

  return (
    <motion.button
      ref={scope}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      className={cn(
        'px-4 sm:px-6 py-2 sm:py-3 bg-gradient-to-b from-green-500 to-green-600 text-white rounded-lg',
        'font-semibold shadow-lg transition-colors duration-200',
        'flex items-center justify-center gap-2 sm:gap-3',
        'text-sm sm:text-base md:text-lg',
        'h-[36px] sm:h-[44px] md:h-[52px]',
        'w-[240px] sm:w-[320px] md:w-[400px]',
        className
      )}
      onClick={scrollToContact}
    >
      <Icon className="w-4 h-4 sm:w-4 sm:h-4 md:w-5 md:h-5" />
      <div className="relative flex items-center">
        <span className="inline-block whitespace-pre text-sm sm:text-base md:text-lg">
          {currentPhrase}
        </span>
        <motion.span
          initial={{ opacity: 0 }}
          animate={{
            opacity: 1,
          }}
          transition={{
            duration: 0.5,
            repeat: Infinity,
            repeatType: 'reverse',
          }}
          className="absolute left-[calc(100%+2px)] top-1/2 -translate-y-1/2 inline-block rounded-sm w-[4px] h-6 bg-white/80"
        />
      </div>
    </motion.button>
  );
};
