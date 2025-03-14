'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { ListIcon, Menu } from 'lucide-react';
import { useMediaQuery } from '@/hooks/use-media-query';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';

interface Heading {
  id: string;
  text: string;
  level: number;
}

export function TableOfContents() {
  const [headings, setHeadings] = useState<Heading[]>([]);
  const [activeId, setActiveId] = useState<string>('');
  const [isHovered, setIsHovered] = useState(false);
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const isMobile = useMediaQuery('(max-width: 768px)');

  useEffect(() => {
    // Find all headings in the article
    const articleHeadings = Array.from(
      document.querySelectorAll('article h1, article h2, article h3')
    )
      .map((element) => {
        const id =
          element.id ||
          element.textContent
            ?.toLowerCase()
            .replace(/[^\w\s]/g, '')
            .replace(/\s+/g, '-') ||
          '';

        // If element doesn't have an ID, set one
        if (!element.id) {
          element.id = id;
        }

        return {
          id,
          text: element.textContent || '',
          level: Number(element.tagName.charAt(1)),
        };
      })
      .filter((heading) => heading.text);

    setHeadings(articleHeadings);

    // Setup intersection observer to highlight active section
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id);
          }
        });
      },
      { rootMargin: '0px 0px -80% 0px' }
    );

    // Observe all heading elements
    articleHeadings.forEach((heading) => {
      const element = document.getElementById(heading.id);
      if (element) {
        observer.observe(element);
      }
    });

    return () => {
      articleHeadings.forEach((heading) => {
        const element = document.getElementById(heading.id);
        if (element) {
          observer.unobserve(element);
        }
      });
    };
  }, []);

  if (headings.length === 0) {
    return null;
  }

  // Helper function for scrolling to a heading
  const scrollToHeading = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      window.scrollTo({
        top: element.offsetTop - 100,
        behavior: 'smooth',
      });

      // For mobile, close the sheet after clicking
      if (isMobile) {
        setIsSheetOpen(false);
      }
    }
  };

  // Table of contents content component to reuse in both views
  const TableOfContentsContent = () => (
    <nav className="max-h-[calc(100vh-200px)] overflow-y-auto pr-2">
      {headings.map((heading) => (
        <a
          key={heading.id}
          href={`#${heading.id}`}
          onClick={(e) => {
            e.preventDefault();
            scrollToHeading(heading.id);
          }}
          className={cn(
            'block text-sm py-1.5 border-l-2 pl-3 mb-1 transition-colors',
            activeId === heading.id
              ? 'border-primary text-primary font-medium'
              : 'border-transparent text-muted-foreground hover:text-foreground hover:border-gray-200',
            heading.level === 1 ? 'mt-1' : '',
            heading.level === 3 ? 'text-xs' : ''
          )}
          style={{
            paddingLeft: `${heading.level * 12}px`,
            marginLeft: '2px',
          }}
        >
          {heading.text}
        </a>
      ))}
    </nav>
  );

  // Mobile view uses Sheet
  if (isMobile) {
    return (
      <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
        <SheetTrigger asChild>
          <button
            className="fixed bottom-6 right-6 z-50 flex items-center justify-center w-10 h-10 bg-primary text-primary-foreground rounded-full shadow-lg"
            aria-label="Table of Contents"
          >
            <ListIcon size={20} />
          </button>
        </SheetTrigger>
        <SheetContent side="right" className="w-[300px] sm:w-[400px]">
          <SheetHeader>
            <SheetTitle className="flex items-center">
              <ListIcon size={16} className="mr-2 text-primary" />
              On This Page
            </SheetTitle>
          </SheetHeader>
          <div className="mt-6">
            <TableOfContentsContent />
          </div>
        </SheetContent>
      </Sheet>
    );
  }

  // Desktop view uses hover element
  return (
    <div
      className="fixed top-1/2 right-4 -translate-y-1/2 z-50"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <motion.div
        className="bg-background shadow-md rounded-md transition-all overflow-hidden"
        animate={{
          width: isHovered ? 240 : 36,
          padding: isHovered ? 16 : 8,
          opacity: 1,
        }}
        initial={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
      >
        {!isHovered ? (
          <div className="flex justify-center items-center">
            <ListIcon size={20} className="text-muted-foreground" />
          </div>
        ) : (
          <>
            <div className="flex items-center mb-4">
              <ListIcon size={16} className="mr-2 text-primary" />
              <p className="text-sm font-medium">On This Page</p>
            </div>

            <TableOfContentsContent />
          </>
        )}
      </motion.div>
    </div>
  );
}
