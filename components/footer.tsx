// apps/web/components/footer.tsx
'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Github, Linkedin, Mail, Heart, Calendar, Coffee } from 'lucide-react';
import { motion } from 'framer-motion';

const socialLinks = [
  {
    href: 'https://github.com/mhurhangee',
    icon: <Github className="h-4 w-4" />,
    label: 'GitHub',
  },
  {
    href: 'https://www.linkedin.com/in/michael-hurhangee-ab83b8134/',
    icon: <Linkedin className="h-4 w-4" />,
    label: 'LinkedIn',
  },
  {
    href: 'mailto:michael@aiconsult.uk',
    icon: <Mail className="h-4 w-4" />,
    label: 'Email',
  },
  {
    href: 'https://calendar.app.google/3tqFGYuhNTHnHwxS6',
    icon: <Calendar className="h-4 w-4" />,
    label: 'Book a consultation',
  },
];

const footerLinks = [
  {
    href: '/',
    label: 'Home',
  },
  {
    href: '/aboutme',
    label: 'About Me',
  },
  {
    href: '/blog',
    label: 'Blog',
  },
  {
    href: '/ai',
    label: 'AI Demos',
  },
];

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <motion.footer
      className="border-t backdrop-blur supports-[backdrop-filter]:bg-background/60 py-4 w-full"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <div className="max-w-screen-xl mx-auto px-4 md:px-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Logo & description */}
          <div className="space-y-2">
            <h3 className="text-base font-semibold">aiconsult.uk</h3>
            <p className="text-xs text-muted-foreground max-w-xs">
              A portfolio site for Michael Hurhangee, an AI consultant and engineer based in the UK.
            </p>
          </div>

          {/* Quick links */}
          <div className="space-y-2">
            <h3 className="text-base font-semibold">Quick Links</h3>
            <nav className="grid grid-cols-2 gap-1">
              {footerLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="text-xs text-muted-foreground hover:text-foreground transition-colors"
                >
                  {link.label}
                </Link>
              ))}
            </nav>
          </div>

          {/* Social links */}
          <div className="space-y-2">
            <h3 className="text-base font-semibold">Connect</h3>
            <div className="flex space-x-2">
              {socialLinks.map((item) => (
                <Button
                  key={item.label}
                  variant="ghost"
                  size="icon"
                  asChild
                  className="w-7 h-7 rounded-full"
                >
                  <Link
                    href={item.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={item.label}
                  >
                    {item.icon}
                  </Link>
                </Button>
              ))}
            </div>
          </div>
        </div>

        <Separator className="my-3" />

        <div className="flex flex-col md:flex-row justify-between items-center">
          <p className="text-xs text-muted-foreground">
            © {currentYear} aiconsult.uk. All rights reserved.
          </p>
          <p className="text-xs text-muted-foreground mt-1 md:mt-0 flex items-center font-mono">
            Made with <Heart className="h-3 w-3 mx-1 text-red-500" /> &{' '}
            <Coffee className="h-3 w-3 mx-1 text-yellow-500" />
          </p>
        </div>
      </div>
    </motion.footer>
  );
}
