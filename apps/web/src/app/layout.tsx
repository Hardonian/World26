import type { Metadata } from 'next';
import './globals.css';
import { HeaderNav } from '@/components/HeaderNav';
import { FooterDisclaimer } from '@/components/FooterDisclaimer';

export const metadata: Metadata = {
  title: 'WORLD//26 | An Open Planetary Systems Simulator',
  description: 'Interactive quantitative system-dynamics simulator exploring coupled global systems from 1900 through 2100. Planetary boundaries, climate, demography, economy, and AI computing sector.',
  keywords: ['system dynamics', 'world3', 'earth4all', 'planetary boundaries', 'climate model', 'ai energy consumption', 'limits to growth'],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="min-h-screen flex flex-col bg-[#070a0f] text-slate-100 selection:bg-cyan-500/30 selection:text-cyan-200">
        <HeaderNav />
        <main className="flex-1 flex flex-col">
          {children}
        </main>
        <FooterDisclaimer />
      </body>
    </html>
  );
}
