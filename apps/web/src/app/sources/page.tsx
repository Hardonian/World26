'use client';
import React, { useState, useMemo } from 'react';
import { 
  Database, 
  ExternalLink, 
  Search, 
  Activity, 
  CheckCircle2, 
  Download, 
  RefreshCw, 
  Layers, 
  Sparkles,
  Server
} from 'lucide-react';
import { ScientificBadge } from '@/components/ScientificBadge';
import { loadSources, defaultOpenDataHub, OPEN_DATA_METRIC_MAPPINGS } from '@world26/data';

export default function SourcesPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [testedMetrics, setTestedMetrics] = useState<Record<string, any>>({});
  const [testingKey, setTestingKey] = useState<string | null>(null);

  const sourcesData = useMemo(() => loadSources(), []);

  const categories = useMemo(() => {
    const set = new Set<string>();
    sourcesData.sources.forEach((s: any) => {
      if (s.category) set.add(s.category);
    });
    return ['All', ...Array.from(set)];
  }, [sourcesData]);

  const filtered = useMemo(() => {
    return sourcesData.sources.filter((s: any) => {
      const q = searchQuery.toLowerCase();
      const matchesSearch = (
        (s.name && s.name.toLowerCase().includes(q)) ||
        (s.organization && s.organization.toLowerCase().includes(q)) ||
        (s.description && s.description.toLowerCase().includes(q)) ||
        (s.coverage && s.coverage.toLowerCase().includes(q)) ||
        (s.category && s.category.toLowerCase().includes(q))
      );
      const matchesCategory = selectedCategory === 'All' || s.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });
  }, [sourcesData, searchQuery, selectedCategory]);

  const handleTestConnector = async (metricKey: string) => {
    setTestingKey(metricKey);
    try {
      const obs = await defaultOpenDataHub.getLatestObservation(metricKey, { allowNetwork: true, timeoutMs: 3000 });
      setTestedMetrics((prev) => ({ ...prev, [metricKey]: obs }));
    } catch (err) {
      console.warn('Connector test fallback:', err);
    } finally {
      setTestingKey(null);
    }
  };

  const handleExportJson = () => {
    const blob = new Blob([JSON.stringify(sourcesData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `world26-open-sources-${sourcesData.version}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="max-w-[1720px] mx-auto p-4 sm:p-8 font-mono text-xs select-none space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between border-b border-slate-800 pb-4 gap-4">
        <div>
          <div className="inline-flex items-center space-x-2 text-cyan-400 text-xs font-bold uppercase tracking-wider mb-1">
            <Database className="w-4 h-4" />
            <span>Open Planetary Science Catalog</span>
            <span className="text-slate-600">•</span>
            <span className="text-emerald-400 flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3" />
              16 Open Sources Connected
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-100 tracking-tight">
            Global Open Data Hub &amp; Source Registry
          </h1>
          <p className="text-slate-400 text-xs mt-1 max-w-3xl leading-relaxed">
            Every boundary threshold, model parameter, and historical series connects directly to public research
            data repositories from international scientific bodies (UN DESA, GCP, NOAA, NASA, ECMWF, IEA, Ember, FAOSTAT, USGS, WRI, and Epoch AI).
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <ScientificBadge type="OBSERVED" />
          <button
            onClick={handleExportJson}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded bg-slate-900 hover:bg-slate-800 border border-slate-700 text-cyan-300 transition-colors font-bold"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export Registry (JSON)</span>
          </button>
        </div>
      </div>

      {/* Live Data Connector Test Bench */}
      <div className="p-4 rounded-xl border border-slate-800 bg-slate-950/90 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2 text-slate-200 font-bold">
            <Server className="w-4 h-4 text-cyan-400" />
            <span>Live Open Source Query Test Bench (Client &amp; Offline Resilient)</span>
          </div>
          <span className="text-[10px] text-slate-500">
            Click any metric to verify live endpoint or validated immutable mirror
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2.5">
          {Object.entries(OPEN_DATA_METRIC_MAPPINGS).slice(0, 5).map(([key, map]) => {
            const tested = testedMetrics[key];
            const isTesting = testingKey === key;
            return (
              <button
                key={key}
                onClick={() => handleTestConnector(key)}
                disabled={isTesting}
                className="text-left p-2.5 rounded-lg border border-slate-800/80 bg-slate-900/50 hover:bg-slate-900 hover:border-cyan-500/40 transition-all group"
              >
                <div className="flex items-center justify-between text-[10px] text-slate-400 mb-1">
                  <span className="truncate">{map.metricName.split(' ')[0]}</span>
                  {isTesting ? (
                    <RefreshCw className="w-3 h-3 text-cyan-400 animate-spin" />
                  ) : tested ? (
                    <span className="text-[9px] text-emerald-400 font-bold">OK</span>
                  ) : (
                    <span className="text-[9px] text-slate-500 group-hover:text-cyan-400">Test</span>
                  )}
                </div>
                <div className="font-bold text-slate-200 text-xs truncate">{map.metricName}</div>
                <div className="text-[10px] text-cyan-400 font-mono mt-0.5">
                  {tested ? `${tested.value} ${tested.unit}` : map.unit}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Search & Category Filter */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 bg-slate-950/80 p-4 rounded-xl border border-slate-800">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-500" />
          <input
            type="text"
            placeholder="Search NOAA, NASA, Ember, WRI, USGS, FAO..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-900 border border-slate-700/80 rounded-lg pl-9 pr-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-cyan-400"
          />
        </div>

        {/* Category Pills */}
        <div className="flex items-center space-x-1.5 overflow-x-auto pb-1">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-2.5 py-1 rounded text-[11px] font-mono whitespace-nowrap transition-colors ${
                selectedCategory === cat
                  ? 'bg-cyan-950 text-cyan-300 border border-cyan-500/50'
                  : 'bg-slate-900/60 text-slate-400 hover:text-slate-200 border border-slate-800'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Source Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((s: any) => (
          <div
            key={s.id}
            className="bg-slate-950/70 border border-slate-800 hover:border-slate-700 rounded-xl p-5 flex flex-col justify-between transition-colors space-y-3"
          >
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="px-2 py-0.5 rounded text-[9px] uppercase font-bold tracking-wider bg-slate-900 text-cyan-400 border border-slate-800">
                  {s.category || s.id.split('_')[0].toUpperCase()}
                </span>
                <span className="text-[10px] text-slate-500">{s.coverage || 'Global'}</span>
              </div>
              <h2 className="font-bold text-slate-100 text-sm mb-1">{s.name}</h2>
              <span className="text-slate-400 text-[11px] block mb-2 font-semibold">
                {s.organization}
              </span>
              <p className="text-slate-400 text-[11px] leading-relaxed">
                {s.description}
              </p>
              {s.endpoint && (
                <div className="mt-2.5 p-2 rounded bg-slate-900/50 border border-slate-800 text-[10px] text-slate-400 font-mono truncate">
                  <span className="text-cyan-400 font-bold mr-1">Endpoint:</span>
                  <span className="text-slate-300 select-all">{s.endpoint}</span>
                </div>
              )}
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
                  <span>Portal / DOI</span>
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
