'use client';
import React, { useState } from 'react';
import { Globe, AlertTriangle, CheckCircle2, AlertCircle, ShieldCheck, Database, Info } from 'lucide-react';
import { PlanetaryBoundaryWheel } from '@/components/PlanetaryBoundaryWheel';
import { ScientificBadge } from '@/components/ScientificBadge';
import { loadBoundaries } from '@world26/data';

export default function BoundariesPage() {
  const [filter, setFilter] = useState<'all' | 'transgressed' | 'uncertainty' | 'safe'>('all');
  const boundaryData = loadBoundaries();

  const filtered = boundaryData.boundaries.filter((b) => {
    if (filter === 'all') return true;
    if (filter === 'uncertainty') return b.status === 'increasing_risk' || b.status === 'high_risk';
    return b.status === filter;
  });

  const transgressedCount = boundaryData.boundaries.filter((b) => b.status === 'transgressed').length;

  return (
    <div className="max-w-[1540px] mx-auto p-4 sm:p-8 font-mono text-xs select-none space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between border-b border-slate-800 pb-4 gap-4">
        <div>
          <div className="inline-flex items-center space-x-2 text-cyan-400 text-xs font-bold uppercase tracking-wider mb-1">
            <Globe className="w-4 h-4" />
            <span>Planetary Boundary Interpretation Layer</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-100">
            Earth System Operating Space (2026 Status)
          </h1>
          <p className="text-slate-400 text-xs mt-1 max-w-2xl leading-relaxed">
            Nine planetary boundaries delimiting the safe operating space for human civilization.
            Includes the landmark 2025/2026 ocean acidification assessment marking surface ocean
            saturation as the seventh transgressed boundary.
          </p>
        </div>

        <div className="flex items-center space-x-3 bg-slate-950 p-3 rounded-lg border border-slate-800">
          <div className="text-center px-2">
            <span className="text-slate-500 text-[10px] uppercase block">Transgressed</span>
            <span className="text-xl font-bold text-rose-400">{transgressedCount} / 9</span>
          </div>
          <div className="w-px h-8 bg-slate-800" />
          <div className="text-center px-2">
            <span className="text-slate-500 text-[10px] uppercase block">Release</span>
            <span className="text-sm font-bold text-cyan-300">v{boundaryData.version}</span>
          </div>
        </div>
      </div>

      {/* 2025/2026 Ocean Acidification Update Alert */}
      <div className="p-4 rounded-lg border border-rose-900/60 bg-rose-950/20 text-rose-200 text-xs flex items-start space-x-3">
        <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <span className="font-bold text-rose-300 block text-sm">
            2025/2026 Earth System Assessment: Ocean Acidification Transgressed
          </span>
          <p className="text-rose-200/80 leading-relaxed text-[11px]">
            {boundaryData.assessmentNotes} Global surface seawater aragonite saturation (Ωarag) has declined
            from 3.44 pre-industrial to below the 2.80 planetary threshold, triggering widespread seasonal
            corrosiveness in polar seas and tropical coral bleaching synergy.
          </p>
        </div>
      </div>

      {/* Interactive Visual + Detailed Breakdown Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Interactive Boundary Wheel */}
        <div className="lg:col-span-5 bg-slate-950/70 border border-slate-800 rounded-xl p-6 flex flex-col items-center justify-center">
          <span className="text-slate-400 font-bold uppercase tracking-wider text-xs mb-4">
            Interactive Nine-Boundary Wheel
          </span>
          <PlanetaryBoundaryWheel interactive={true} />
        </div>

        {/* Right: Detailed Control Variables Table */}
        <div className="lg:col-span-7 bg-slate-950/70 border border-slate-800 rounded-xl p-6 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 pb-3">
            <span className="font-bold text-slate-200 uppercase tracking-wider text-xs">
              Boundary Control Variables ({filtered.length})
            </span>

            {/* Filter buttons */}
            <div className="flex space-x-1 bg-slate-900 p-1 rounded border border-slate-800 text-[11px]">
              {(['all', 'transgressed', 'uncertainty', 'safe'] as const).map((mode) => (
                <button
                  key={mode}
                  onClick={() => setFilter(mode)}
                  className={`px-2.5 py-1 rounded capitalize transition-all ${
                    filter === mode
                      ? 'bg-cyan-950 text-cyan-300 font-bold border border-cyan-800'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {mode === 'uncertainty' ? 'Uncertainty Zone' : mode}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-3 overflow-y-auto max-h-[560px] pr-1">
            {filtered.map((b) => {
              const isTransgressed = b.status === 'transgressed';
              const isUncertain = b.status === 'increasing_risk' || b.status === 'high_risk';

              return (
                <div
                  key={b.id}
                  className="p-3.5 rounded-lg border border-slate-800 bg-slate-900/40 hover:bg-slate-900/80 transition-colors space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-100 text-sm flex items-center space-x-2">
                      <span>{b.name}</span>
                      {b.id === 'ocean_acidification' && (
                        <span className="text-[10px] px-1.5 py-0.2 bg-rose-950 text-rose-300 border border-rose-800 rounded">
                          2025/2026 Update
                        </span>
                      )}
                    </span>
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] uppercase font-bold tracking-wider ${
                        isTransgressed
                          ? 'bg-rose-950/90 text-rose-300 border border-rose-800'
                          : isUncertain
                          ? 'bg-amber-950/90 text-amber-300 border border-amber-800'
                          : 'bg-emerald-950/90 text-emerald-300 border border-emerald-800'
                      }`}
                    >
                      {b.status.replace('_', ' ')}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px] bg-slate-950/60 p-2 rounded border border-slate-800/80">
                    <div>
                      <span className="text-slate-500 block text-[10px]">Control Variable:</span>
                      <span className="text-slate-200 font-semibold">{b.controlVariable}</span>
                    </div>
                    <div>
                      <span className="text-slate-500 block text-[10px]">Current Estimate:</span>
                      <span className="text-cyan-300 font-bold">{b.currentEstimate} {b.unit}</span>
                    </div>
                    <div>
                      <span className="text-slate-500 block text-[10px]">Safe Threshold:</span>
                      <span className="text-slate-300">&le; {b.safeZoneMax} {b.unit}</span>
                    </div>
                    <div>
                      <span className="text-slate-500 block text-[10px]">Uncertainty Zone:</span>
                      <span className="text-amber-400">{b.uncertaintyMin} – {b.uncertaintyMax} {b.unit}</span>
                    </div>
                  </div>

                  <p className="text-[11px] text-slate-400 leading-normal">
                    {b.description}
                  </p>

                  <div className="flex items-center justify-between text-[10px] text-slate-500 pt-1 border-t border-slate-800/60">
                    <span>Source: {b.source} ({b.sourceDate})</span>
                    <span className="capitalize">Confidence: {b.confidenceGrade}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
