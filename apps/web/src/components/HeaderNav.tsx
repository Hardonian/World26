'use client';
import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  Activity, 
  Globe, 
  GitFork, 
  Columns, 
  Award, 
  FlaskConical, 
  RotateCcw, 
  Database,
  Cpu
} from 'lucide-react';

const NAV_ITEMS = [
  { href: '/simulator', label: 'Simulator', icon: Activity },
  { href: '/boundaries', label: 'Boundaries', icon: Globe },
  { href: '/causal', label: 'Causal Graph', icon: GitFork },
  { href: '/compare', label: 'Compare', icon: Columns },
  { href: '/challenges', label: 'Challenges', icon: Award },
  { href: '/lab', label: 'Experiment Lab', icon: FlaskConical },
  { href: '/reproduce', label: 'Reproduce', icon: RotateCcw },
  { href: '/sources', label: 'Sources', icon: Database },
];

export function HeaderNav() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-50 border-b border-slate-800/80 bg-[#070a0f]/90 backdrop-blur-md">
      <div className="max-w-[1720px] mx-auto px-4 h-14 flex items-center justify-between">
        {/* Brand & Subtitle */}
        <div className="flex items-center space-x-3">
          <Link href="/" className="flex items-center space-x-2 group">
            <div className="w-7 h-7 rounded border border-cyan-500/50 bg-cyan-950/40 flex items-center justify-center text-cyan-400 font-mono font-bold text-xs group-hover:border-cyan-400 group-hover:shadow-[0_0_12px_rgba(0,240,255,0.4)] transition-all">
              W26
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-bold tracking-wider text-slate-100 font-mono group-hover:text-cyan-300 transition-colors">
                WORLD<span className="text-cyan-400">//</span>26
              </span>
              <span className="text-[9px] text-slate-400 uppercase tracking-widest -mt-1 font-mono">
                Open Planetary Simulator
              </span>
            </div>
          </Link>
          
          <div className="hidden lg:flex items-center pl-3 border-l border-slate-800 space-x-2">
            <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-900 border border-slate-800 text-slate-400">
              v2026.1
            </span>
            <span className="flex items-center text-[10px] font-mono text-emerald-400 space-x-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span>Local Engine Ready</span>
            </span>
          </div>
        </div>

        {/* Navigation links */}
        <nav className="flex items-center space-x-1 overflow-x-auto py-1">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href));
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center space-x-1.5 px-2.5 py-1.5 rounded text-xs font-mono transition-all whitespace-nowrap ${
                  isActive
                    ? 'bg-cyan-950/60 text-cyan-300 border border-cyan-500/40 shadow-[0_0_8px_rgba(0,240,255,0.15)]'
                    : 'text-slate-300 hover:text-slate-100 hover:bg-slate-900/80 border border-transparent'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Action / Mode button */}
        <div className="flex items-center space-x-2">
          <Link
            href="/simulator"
            className="flex items-center space-x-1.5 px-3 py-1 rounded bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-mono font-bold text-xs shadow-[0_0_15px_rgba(0,240,255,0.3)] transition-all hover:scale-105 active:scale-95"
          >
            <Cpu className="w-3.5 h-3.5" />
            <span>Run Model</span>
          </Link>
        </div>
      </div>
    </header>
  );
}
