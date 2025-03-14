import React, { createContext, useState, useContext, ReactNode, useRef, useEffect } from 'react';

type SectionContextType = {
  scrollToSection: (section: string) => void;
  sectionRefs: React.MutableRefObject<{ [key: string]: HTMLElement | null }>;
  currentSection: string;
};

export const SectionContext = createContext<SectionContextType | undefined>(undefined);

export function SectionProvider({ children }: { children: ReactNode }) {
  const sectionRefs = useRef<{ [key: string]: HTMLElement | null }>({});
  const [currentSection, setCurrentSection] = useState('hero');

  const scrollToSection = (section: string) => {
    const element = sectionRefs.current[section];
    if (element) {
      const navbarHeight = 100; // Increased offset to prevent cutting off headings
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - navbarHeight;

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth',
      });
    }
  };

  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY + window.innerHeight / 2;

      Object.entries(sectionRefs.current).forEach(([id, element]) => {
        if (element) {
          const { offsetTop, offsetHeight } = element;
          if (scrollPosition >= offsetTop && scrollPosition < offsetTop + offsetHeight) {
            setCurrentSection(id);
          }
        }
      });
    };

    window.addEventListener('scroll', handleScroll);
    handleScroll(); // Call once to set initial state
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <SectionContext.Provider value={{ scrollToSection, sectionRefs, currentSection }}>
      {children}
    </SectionContext.Provider>
  );
}

export function useSection() {
  const context = useContext(SectionContext);
  if (context === undefined) {
    throw new Error('useSection must be used within a SectionProvider');
  }
  return context;
}
