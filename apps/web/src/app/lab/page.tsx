'use client';
import React, { useState } from 'react';
import { FlaskConical, Search, Sliders, ArrowUpDown, TrendingUp, TrendingDown, ShieldCheck, Play } from 'lucide-react';
import { ScientificBadge } from '@/components/ScientificBadge';
import { loadParameters } from '@world26/data';
import { runOatSensitivityAnalysis } from '@world26/analytics';
import { World26SimulatorTs } from '@world26/model';

export default function ExperimentLabPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeParamKey, setActiveParamKey] = useState<string>('compute_demand_growth_rate');
  const [sensitivityResult, setSensitivityResult] = useState<any | null>(null);
  const [isRunningSensitivity, setIsRunningSensitivity] = useState(false);

  const paramRegistry = loadParameters();

  const filteredParams = Object.entries(paramRegistry).filter(([key, val]) => {
    const q = searchQuery.toLowerCase();
    return key.toLowerCase().includes(q) || val.source.toLowerCase().includes(q) || val.notes.toLowerCase().includes(q);
  });

  const activeParam = paramRegistry[activeParamKey] || Object.values(paramRegistry)[0];

  const handleRunSensitivity = () => {
    setIsRunningSensitivity(true);
    setTimeout(() => {
      const res = runOatSensitivityAnalysis(undefined, 'temperature_anomaly', 2100);
      setSensitivityResult(res);
      setIsRunningSensitivity(false);
    }, 50);
  };

  return (
    <div className="max-w-[1600px] mx-auto p-4 sm:p-8 font-mono text-xs select-none space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between border-b border-slate-800 pb-4 gap-4">
        <div>
          <div className="inline-flex items-center space-x-2 text-cyan-400 text-xs font-bold uppercase tracking-wider mb-1">
            <FlaskConical className="w-4 h-4" />
            <span>Advanced Quantitative Laboratory</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-100">
            Parameter Registry &amp; Sensitivity Lab
          </h1>
          <p className="text-slate-400 text-xs mt-1 max-w-2xl leading-relaxed">
            Examine the complete model parameter registry. Inspect empirical sources, uncertainty bounds,
            confidence scores, and execute One-At-A-Time (OAT) parameter elasticity evaluations.
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <ScientificBadge type="ASSUMED" />
          <span className="text-slate-400 text-[11px] bg-slate-900 border border-slate-800 px-2 py-1 rounded">
            Full Parameter Provenance
          </span>
        </div>
      </div>

      {/* 2-Column Parameter Explorer */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Parameter List (5 cols) */}
        <div className="lg:col-span-5 bg-slate-950/80 border border-slate-800 rounded-xl p-4 space-y-3">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-500" />
            <input
              type="text"
              placeholder="Search parameters, sources, units..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700/80 rounded-lg pl-9 pr-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-cyan-400"
            />
          </div>

          <div className="text-[11px] text-slate-400 font-bold uppercase tracking-wider flex justify-between">
            <span>Model Parameters ({filteredParams.length})</span>
            <span>Confidence</span>
          </div>

          <div className="space-y-1.5 overflow-y-auto max-h-[640px] pr-1">
            {filteredParams.map(([key, p]) => {
              const isSelected = key === activeParamKey;
              return (
                <button
                  key={key}
                  onClick={() => {
                    setActiveParamKey(key);
                    setSensitivityResult(null);
                  }}
                  className={`w-full text-left p-2.5 rounded-lg border transition-all flex items-center justify-between ${
                    isSelected
                      ? 'bg-cyan-950/70 border-cyan-500/60 text-cyan-200 shadow-[0_0_10px_rgba(0,240,255,0.15)]'
                      : 'bg-slate-900/40 border-slate-800 text-slate-300 hover:bg-slate-900'
                  }`}
                >
                  <div className="pr-2 truncate">
                    <span className="font-bold text-xs block truncate">{key}</span>
                    <span className="text-[10px] text-slate-500 truncate block">
                      {p.value} {p.unit} • {p.source}
                    </span>
                  </div>
                  <span
                    className={`text-[9px] uppercase px-1.5 py-0.5 rounded font-bold shrink-0 ${
                      p.confidence === 'high'
                        ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                        : p.confidence === 'medium'
                        ? 'bg-amber-950 text-amber-300 border border-amber-800'
                        : 'bg-rose-950 text-rose-300 border border-rose-800'
                    }`}
                  >
                    {p.confidence}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Right Column: Parameter Metadata & Sensitivity Runner (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          {/* Active Parameter Card */}
          <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-6 space-y-4">
            <div className="flex items-start justify-between border-b border-slate-800 pb-3">
              <div>
                <h2 className="text-xl font-bold text-slate-100">{activeParamKey}</h2>
                <span className="text-cyan-400 text-xs mt-0.5 block font-semibold">
                  Unit: {activeParam.unit}
                </span>
              </div>
              <div className="text-right">
                <span className="text-[10px] text-slate-500 uppercase block">Calibrated Value</span>
                <span className="text-xl font-bold text-cyan-300">{activeParam.value}</span>
              </div>
            </div>

            {/* Uncertainty Bounds */}
            <div className="grid grid-cols-3 gap-3 bg-slate-900/60 p-3 rounded-lg border border-slate-800 text-center">
              <div>
                <span className="text-slate-500 text-[10px] uppercase block">Lower Bound</span>
                <span className="text-sm font-bold text-slate-200">{activeParam.lowerBound}</span>
              </div>
              <div className="border-x border-slate-800">
                <span className="text-slate-500 text-[10px] uppercase block">Point Value</span>
                <span className="text-sm font-bold text-cyan-400">{activeParam.value}</span>
              </div>
              <div>
                <span className="text-slate-500 text-[10px] uppercase block">Upper Bound</span>
                <span className="text-sm font-bold text-slate-200">{activeParam.upperBound}</span>
              </div>
            </div>

            {/* Provenance and Citation */}
            <div className="space-y-2">
              <span className="text-[10px] text-slate-500 uppercase font-bold tracking-wider block">
                Provenance &amp; Scientific Source:
              </span>
              <p className="text-xs text-slate-300 bg-slate-900/40 p-3 rounded border border-slate-800/80 leading-relaxed">
                {activeParam.notes}
              </p>
              <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1">
                <span>Source: <strong className="text-slate-200">{activeParam.source}</strong> ({activeParam.sourceYear})</span>
                <span>Transformation: <code className="text-cyan-300">{activeParam.transformation}</code></span>
              </div>
            </div>

            {/* Run Sensitivity Button */}
            <div className="pt-3 border-t border-slate-800 flex items-center justify-between">
              <div className="text-[11px] text-slate-400">
                Evaluate ±20% perturbation impact on 2100 state
              </div>
              <button
                onClick={handleRunSensitivity}
                disabled={isRunningSensitivity}
                className="flex items-center space-x-1.5 px-4 py-2 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold transition-all hover:scale-105 active:scale-95 disabled:opacity-50"
              >
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>{isRunningSensitivity ? 'Running...' : 'Run OAT Sensitivity'}</span>
              </button>
            </div>
          </div>

          {/* Sensitivity Tornado Results */}
          {sensitivityResult && (
            <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-6 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                <span className="font-bold text-slate-200 uppercase tracking-wider text-xs">
                  One-At-A-Time (OAT) Sensitivity Tornado (Target: {sensitivityResult.targetMetric})
                </span>
                <span className="text-[10px] text-emerald-400 font-bold bg-emerald-950 px-2 py-0.5 rounded border border-emerald-800">
                  Year {sensitivityResult.evaluationYear} Baseline: {sensitivityResult.baselineValue?.toFixed(2)}°C
                </span>
              </div>

              <div className="space-y-3">
                {sensitivityResult.tornadoItems?.map((item: any, idx: number) => {
                  return (
                    <div key={idx} className="p-3 rounded-lg border border-slate-800 bg-slate-900/50 space-y-1.5">
                      <div className="flex justify-between items-center text-xs">
                        <span className="font-bold text-slate-200">{item.name}</span>
                        <span className="font-bold text-cyan-300">
                          Swing: ±{item.swingMagnitude?.toFixed(3)}°C
                        </span>
                      </div>
                      <div className="w-full bg-slate-950 h-2 rounded-full overflow-hidden flex">
                        <div
                          className="h-full rounded-full bg-cyan-400"
                          style={{ width: `${Math.min(item.swingMagnitude * 100, 100)}%` }}
                        />
                      </div>
                      <div className="flex justify-between text-[10px] text-slate-500">
                        <span>Low ({item.lowValue}): Δ {item.targetDeltaLow?.toFixed(3)}°C</span>
                        <span>High ({item.highValue}): Δ {item.targetDeltaHigh?.toFixed(3)}°C</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
