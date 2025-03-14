import { Geist, Geist_Mono } from 'next/font/google';
import type { Metadata } from 'next';
import '@/styles/globals.css';
import { Providers } from '@/components/providers';
import { Footer } from '@/components/footer';
import { MainNav } from '@/components/main-nav';

const fontSans = Geist({
  subsets: ['latin'],
  variable: '--font-sans',
});

const fontMono = Geist_Mono({
  subsets: ['latin'],
  variable: '--font-mono',
});

const isDevelopment = process.env.NODE_ENV === 'development';
const title = isDevelopment ? "(dev) aiconsult.uk: by michael hurhangee" : "aiconsult.uk: by michael hurhangee";

export const metadata: Metadata = {
  title: title,
  description: 'A portfolio by michael hurhangee',
  icons: {
    icon: [
      {
        url: "data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text y='.9em' font-size='90'>🦸</text></svg>",
        type: 'image/svg+xml',
      },
    ],
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${fontSans.variable} ${fontMono.variable} font-sans min-h-screen bg-background text-foreground antialiased`}
      >
        <div className="relative min-h-screen bg-background">
          <div className="absolute inset-0 w-full h-full z-0 bg-grid-pattern" />
          <main className="relative">
            <Providers>
              <MainNav />
              {children}
            </Providers>
            <Footer />
          </main>
        </div>
      </body>
    </html>
  );
}
