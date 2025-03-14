'use client';

import * as React from 'react';

export default function BlogLayout({ children }: { children: React.ReactNode }) {
  return (
    <div>
      <div className="max-w-4xl mx-auto">{children}</div>
    </div>
  );
}
