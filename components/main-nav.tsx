'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Home, User2, BookText, Menu, Bot } from 'lucide-react';
import { ModeToggle } from './mode-toggle';
import { useSection } from '../app/(aboutme)/components/sectioncontext';
import { motion } from 'framer-motion';

const aboutSections = [
  {
    name: 'About',
    section: 'hero',
    activeClass: 'bg-foreground text-background',
  },
  {
    name: 'Services',
    section: 'services',
    activeClass: 'bg-gradient-to-r from-red-500 to-red-600 text-foreground',
  },
  {
    name: 'Expertise',
    section: 'expertise',
    activeClass: 'bg-gradient-to-r from-blue-500 to-blue-600 text-foreground',
  },
  {
    name: 'Story',
    section: 'story',
    activeClass: 'bg-gradient-to-r from-yellow-300 to-yellow-400 text-foreground',
  },
  {
    name: 'Contact',
    section: 'contact',
    activeClass: 'bg-gradient-to-r from-green-500 to-green-600 text-foreground',
  },
];

const navItems = [
  {
    href: '/',
    icon: <Home className="h-4 w-4" />,
    label: 'Home',
  },
  {
    href: '/aboutme',
    icon: <User2 className="h-4 w-4" />,
    label: 'About Me',
  },
  {
    href: '/blog',
    icon: <BookText className="h-4 w-4" />,
    label: 'Blog',
  },
  {
    href: '/ai',
    icon: <Bot className="h-4 w-4" />,
    label: 'AI Demos',
  },
];

export function MainNav() {
  const pathname = usePathname();
  const isAboutPage = pathname === '/aboutme';
  const isBlogPage = pathname === '/blog' || pathname.startsWith('/blog/');
  // Always call the hook, but only use its values when on the about page
  const { currentSection: sectionValue, scrollToSection: sectionScroll } = useSection();
  // Use values conditionally based on page
  const currentSection = isAboutPage ? sectionValue : null;
  const scrollToSection = isAboutPage ? sectionScroll : null;

  const isActive = (href: string) => {
    if (href === '/') {
      return pathname === '/';
    }
    if (href === '/blog') {
      return pathname === '/blog' || pathname.startsWith('/blog/');
    }
    return pathname.startsWith(href);
  };

  return (
    <motion.header
      className="fixed top-0 left-0 right-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60"
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 1.0 }}
    >
      <div className="flex h-14 items-center justify-between">
        <nav className="flex items-center">
          {isAboutPage && (
            <div className="hidden md:flex items-center ml-6 space-x-1">
              {aboutSections.map((item) => (
                <Button
                  key={item.name}
                  variant="ghost"
                  size="sm"
                  className={cn(
                    'font-mono transition-all duration-300',
                    currentSection === item.section && item.activeClass
                  )}
                  onClick={() => scrollToSection?.(item.section)}
                >
                  {item.name}
                </Button>
              ))}
            </div>
          )}
          {isBlogPage && (
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" asChild className="flex-shrink-0 ml-4">
                  <Link href="/blog">
                    <BookText className="h-4 w-4" />
                    Blog
                  </Link>
                </Button>
              </TooltipTrigger>
              <TooltipContent side="top">
                <span className="text-sm">All posts</span>
              </TooltipContent>
            </Tooltip>
          )}
        </nav>

        <div className="flex items-center space-x-2 pr-2">
          <div className="hidden md:flex items-center space-x-2">
            {navItems.map((item) => (
              <Tooltip key={item.label}>
                <TooltipTrigger asChild>
                  <Link href={item.href}>
                    <Button
                      variant="ghost"
                      size="icon"
                      className={cn('w-9 h-9', isActive(item.href) && 'bg-muted')}
                    >
                      {item.icon}
                      <span className="sr-only">{item.label}</span>
                    </Button>
                  </Link>
                </TooltipTrigger>
                <TooltipContent>{item.label}</TooltipContent>
              </Tooltip>
            ))}
          </div>

          <Sheet>
            <SheetTrigger asChild className="md:hidden">
              <Button variant="ghost" size="icon" className="w-9 h-9">
                <Menu className="h-4 w-4" />
                <span className="sr-only">Toggle menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[240px] sm:w-[280px]">
              <SheetHeader>
                <SheetTitle>Navigation</SheetTitle>
              </SheetHeader>
              <nav className="flex flex-col space-y-4 mt-4">
                {navItems.map((item) => (
                  <div key={item.href}>
                    <Link href={item.href}>
                      <Button
                        variant="ghost"
                        size="sm"
                        className={cn('w-full justify-start', isActive(item.href) && 'bg-muted')}
                      >
                        {item.icon}
                        <span className="ml-2">{item.label}</span>
                      </Button>
                    </Link>
                  </div>
                ))}
                {isAboutPage && (
                  <div className="pt-4 border-t">
                    {aboutSections.map((item) => (
                      <Button
                        key={item.name}
                        variant="ghost"
                        size="sm"
                        className={cn(
                          'w-full justify-start font-mono transition-all duration-300',
                          currentSection === item.section && item.activeClass
                        )}
                        onClick={() => {
                          scrollToSection?.(item.section);
                        }}
                      >
                        {item.name}
                      </Button>
                    ))}
                  </div>
                )}
              </nav>
            </SheetContent>
          </Sheet>

          <Tooltip>
            <TooltipTrigger asChild>
              <div>
                <ModeToggle />
              </div>
            </TooltipTrigger>
            <TooltipContent>Toggle theme</TooltipContent>
          </Tooltip>
        </div>
      </div>
    </motion.header>
  );
}
