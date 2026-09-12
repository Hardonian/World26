'use client';
import React, { useState } from 'react';
import { Database, ExternalLink, ShieldCheck, Search, BookOpen } from 'lucide-react';
import { ScientificBadge } from '@/components/ScientificBadge';
import { loadSources } from '@world26/data';

export default function SourcesPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const sourcesData = loadSources();

  const filtered = sourcesData.sources.filter((s) => {
    const q = searchQuery.toLowerCase();
    return (
      (s.name && s.name.toLowerCase().includes(q)) ||
      (s.organization && s.organization.toLowerCase().includes(q)) ||
      (s.description && s.description.toLowerCase().includes(q)) ||
      (s.coverage && s.coverage.toLowerCase().includes(q))
    );
  });

  return (
    <div className="max-w-[1540px] mx-auto p-4 sm:p-8 font-mono text-xs select-none space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between border-b border-slate-800 pb-4 gap-4">
        <div>
          <div className="inline-flex items-center space-x-2 text-cyan-400 text-xs font-bold uppercase tracking-wider mb-1">
            <Database className="w-4 h-4" />
            <span>Empirical Grounding &amp; Provenance</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-100">
            Public Research Source Registry
          </h1>
          <p className="text-slate-400 text-xs mt-1 max-w-2xl leading-relaxed">
            All historical calibrations and model assumptions trace back to immutable, versioned datasets
            from international scientific bodies, UN agencies, and peer-reviewed literature.
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <ScientificBadge type="OBSERVED" />
          <span className="text-slate-400 text-[11px] bg-slate-900 border border-slate-800 px-2 py-1 rounded">
            Version: {sourcesData.version}
          </span>
        </div>
      </div>

      {/* Search & Statistics */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-slate-950/80 p-4 rounded-xl border border-slate-800">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-500" />
          <input
            type="text"
            placeholder="Search UN DESA, World Bank, IEA, NOAA, IPCC..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-900 border border-slate-700/80 rounded-lg pl-9 pr-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-cyan-400"
          />
        </div>

        <div className="flex items-center space-x-3 text-slate-400 text-[11px]">
          <span>{filtered.length} Indexed Sources</span>
          <span>•</span>
          <span>Zero Runtime HTTP Dependencies</span>
        </div>
      </div>

      {/* Source Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((s) => (
          <div
            key={s.id}
            className="bg-slate-950/70 border border-slate-800 hover:border-slate-700 rounded-xl p-5 flex flex-col justify-between transition-colors space-y-3"
          >
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="px-2 py-0.5 rounded text-[9px] uppercase font-bold tracking-wider bg-slate-900 text-cyan-400 border border-slate-800">
                  {s.id.split('_')[0].toUpperCase()}
                </span>
                <span className="text-[10px] text-slate-500">{s.coverage || 'Historical / Modern'}</span>
              </div>
              <h2 className="font-bold text-slate-100 text-sm mb-1">{s.name}</h2>
              <span className="text-slate-400 text-[11px] block mb-2 font-semibold">
                {s.organization}
              </span>
              <p className="text-slate-400 text-[11px] leading-relaxed">
                {s.description}
              </p>
            </div>

            <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between text-[10px] text-slate-500">
              <span>License: <strong className="text-slate-400">{s.license}</strong></span>
              {s.url && (
                <a
                  href={s.url}
                  target="_blank"
                  rel="noreferrer"
                  className="text-cyan-400 hover:text-cyan-300 flex items-center space-x-1"
                >
                  <span>Citation</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
