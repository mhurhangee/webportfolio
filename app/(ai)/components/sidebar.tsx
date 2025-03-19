'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { LayoutDashboard, Sparkles } from 'lucide-react';
import { aiCategories, getAppByHref } from '@/app/(ai)/lib/playground-config';
import React from 'react';

interface SidebarProps extends React.HTMLAttributes<HTMLDivElement> {}

export function Sidebar({ className, ...props }: SidebarProps) {
  const pathname = usePathname();

  return (
    <div className={cn('pb-12', className)} {...props}>
      <div className="space-y-6 py-4">
        <div className="px-3 py-2">
          <div className="flex items-center px-2 mb-2">
            <h2 className="text-xl font-semibold tracking-tight">AI Playground</h2>
          </div>
          <div className="space-y-1">
            <Button
              variant={pathname === '/ai' ? 'secondary' : 'ghost'}
              className="w-full justify-start transition-all hover:pl-5 duration-200"
              asChild
            >
              <Link href="/ai">
                <LayoutDashboard className="h-4 w-4 mr-2" />
                <span>Overview</span>
              </Link>
            </Button>
          </div>
        </div>

        <ScrollArea className="min-h-[calc(100vh-10rem)]">
          {aiCategories.map((category) => (
            <div key={category.name} className="px-3 py-2">
              <h2 className="mb-2 px-2 text-lg font-semibold tracking-tight border-b pb-2">
                {category.name}
                <span className="text-xs text-muted-foreground ml-2 font-normal">
                  {category.apps.length}
                </span>
              </h2>
              <div className="space-y-1 pt-2">
                {category.apps.map((app) => (
                  <Button
                    key={app.href}
                    variant={pathname === app.href ? 'secondary' : 'ghost'}
                    className={cn(
                      'w-full justify-start transition-all duration-200 hover:pl-5',
                      pathname === app.href ? 'bg-primary/10 text-primary font-medium' : ''
                    )}
                    asChild
                  >
                    <Link href={app.href} className="relative">
                      {React.cloneElement(app.icon as React.ReactElement, {
                        className: 'h-4 w-4 mr-2',
                      })}
                      <span>{app.name}</span>
                      {app.isNew && (
                        <Badge className="ml-2 h-5 text-[10px] px-1 bg-primary/20 text-primary hover:bg-primary/30 font-mono">
                          new
                        </Badge>
                      )}
                    </Link>
                  </Button>
                ))}
              </div>
            </div>
          ))}
        </ScrollArea>
      </div>
    </div>
  );
}
