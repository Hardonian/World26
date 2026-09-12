import React from 'react';
import { ScientificBadge } from './ScientificBadge';
import { ShieldCheck, Info, BookOpen } from 'lucide-react';
import Link from 'next/link';

export function FooterDisclaimer() {
  return (
    <footer className="border-t border-slate-800/80 bg-[#070a0f] text-slate-400 text-xs py-8 px-4 font-mono">
      <div className="max-w-[1720px] mx-auto space-y-6">
        {/* Core Principle Banner */}
        <div className="p-3.5 rounded-lg border border-slate-800 bg-slate-900/40 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-center space-x-2.5">
            <Info className="w-4 h-4 text-cyan-400 shrink-0" />
            <span className="text-slate-200 font-semibold tracking-wide">
              PRINCIPLE: &ldquo;Models are for exploring system behaviour, not pretending to know the future.&rdquo;
            </span>
          </div>
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-[11px] text-slate-400 mr-1">Data Provenance Grades:</span>
            <ScientificBadge type="OBSERVED" />
            <ScientificBadge type="CALIBRATED" />
            <ScientificBadge type="ASSUMED" />
            <ScientificBadge type="PROJECTED" />
            <ScientificBadge type="SIMULATED" />
            <ScientificBadge type="EXPERIMENTAL" />
          </div>
        </div>

        {/* Mandatory Legal & Scientific Lineage Disclaimer */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2 text-[11px] leading-relaxed border-t border-slate-800/50">
          <div>
            <div className="text-slate-200 font-bold mb-1.5 flex items-center space-x-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-cyan-400" />
              <span>Independent Project Disclaimer</span>
            </div>
            <p className="text-slate-400">
              Independent research and scenario-exploration software. Not affiliated with or endorsed by the Club of Rome or the original World3/Earth4All authors.
            </p>
            <p className="text-slate-500 mt-1">
              WORLD//26 is a clean-room educational and quantitative research simulator released under Apache-2.0.
            </p>
          </div>

          <div>
            <div className="text-slate-200 font-bold mb-1.5 flex items-center space-x-1.5">
              <BookOpen className="w-3.5 h-3.5 text-cyan-400" />
              <span>Scientific Lineage & Citations</span>
            </div>
            <p className="text-slate-400">
              Inspired by the mathematical lineage of World Dynamics (Forrester 1971), World3-03 (Meadows et al.), Earth4All (Dixson-Declève et al. 2022), Planetary Boundaries (Rockström et al., Richardson et al. 2023, 2025/2026 ocean updates), and LIMITS &apos;25 computing impact research (Guliyeva et al., arXiv:2510.07634).
            </p>
          </div>

          <div>
            <div className="text-slate-200 font-bold mb-1.5">Execution & Verification</div>
            <p className="text-slate-400">
              Engine: Deterministic Runge-Kutta 4th-order (RK4) & Euler integrators. Zero cloud telemetry required. Local-first WebAssembly & Web Worker execution.
            </p>
            <div className="mt-2 flex space-x-4 text-cyan-400">
              <Link href="/sources" className="hover:underline">Sources & Provenance</Link>
              <Link href="/reproduce" className="hover:underline">Reproducibility Suite</Link>
              <Link href="/simulator" className="hover:underline">Interactive Sandbox</Link>
            </div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-between pt-4 border-t border-slate-800/40 text-[10px] text-slate-500">
          <div>WORLD//26: Open Planetary Systems Simulator • Software v1.0.0 • Model 2026.1 • Data 2026.1</div>
          <div className="mt-1 sm:mt-0">All parameter estimates include uncertainty bounds, confidence scores, and historical references.</div>
        </div>
      </div>
    </footer>
  );
}
