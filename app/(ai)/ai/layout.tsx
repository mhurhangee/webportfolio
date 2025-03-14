'use client';

import { cn } from '@/lib/utils';
import { Sidebar } from '@/app/(ai)/components/sidebar';

export default function AILayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-col min-h-[calc(100vh-9rem)]">
      <div className="container flex-1 items-start md:grid md:grid-cols-[220px_minmax(0,1fr)] md:gap-6 lg:grid-cols-[240px_minmax(0,1fr)] lg:gap-10 pt-12">
        <Sidebar className="hidden md:block" />
        <main className="relative py-6 px-4 lg:px-8">{children}</main>
      </div>
    </div>
  );
}
