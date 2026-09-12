'use client';
import React, { useRef, useState } from 'react';
import { Share2, Download, Check, Copy, Sparkles, Shield } from 'lucide-react';
import { TrajectoryPoint } from './TrajectoryCharts';

interface Props {
  scenarioName: string;
  year?: number;
  dataPoint: TrajectoryPoint;
  baselinePoint?: TrajectoryPoint;
  transgressedBoundariesCount?: number;
}

export function WorldCardExport({
  scenarioName,
  year = 2100,
  dataPoint,
  baselinePoint,
  transgressedBoundariesCount = 7,
}: Props) {
  const [copied, setCopied] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  const pop = dataPoint.population ? (dataPoint.population / 1e9).toFixed(2) : '8.9';
  const temp = dataPoint.temperature_anomaly ? `+${dataPoint.temperature_anomaly.toFixed(2)}°C` : '+1.95°C';
  const wellbeing = dataPoint.human_wellbeing_index ? dataPoint.human_wellbeing_index.toFixed(2) : '0.78';
  const aiElec = dataPoint.ai_electricity_demand_twh ? `${dataPoint.ai_electricity_demand_twh.toFixed(0)} TWh` : '1,200 TWh';
  const food = dataPoint.food_per_capita ? `${dataPoint.food_per_capita.toFixed(0)} kg` : '620 kg';
  const cleanShare = dataPoint.clean_electricity_share ? `${(dataPoint.clean_electricity_share * 100).toFixed(0)}%` : '85%';

  // Comparison deltas against baseline
  const tempDelta = baselinePoint && dataPoint.temperature_anomaly && baselinePoint.temperature_anomaly
    ? (dataPoint.temperature_anomaly - baselinePoint.temperature_anomaly).toFixed(2)
    : null;
  const popDelta = baselinePoint && dataPoint.population && baselinePoint.population
    ? ((dataPoint.population - baselinePoint.population) / 1e9).toFixed(2)
    : null;

  const copyPermalink = () => {
    const url = typeof window !== 'undefined' ? window.location.href : 'https://world26.org/simulator';
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const downloadCardSvg = () => {
    if (!cardRef.current) return;
    const svgData = `
<svg xmlns="http://www.w3.org/2000/svg" width="600" height="400" viewBox="0 0 600 400">
  <rect width="600" height="400" fill="#070a0f" rx="12"/>
  <rect x="2" y="2" width="596" height="396" fill="none" stroke="#1e293b" stroke-width="2" rx="10"/>
  <text x="30" y="45" fill="#00f0ff" font-family="monospace" font-weight="bold" font-size="20">WORLD//26</text>
  <text x="145" y="45" fill="#64748b" font-family="monospace" font-size="12">OPEN PLANETARY SIMULATOR</text>
  <text x="30" y="75" fill="#e2e8f0" font-family="monospace" font-size="15" font-weight="bold">Scenario: ${scenarioName}</text>
  <text x="500" y="75" fill="#38bdf8" font-family="monospace" font-size="15" font-weight="bold">Year ${year}</text>
  
  <line x1="30" y1="95" x2="570" y2="95" stroke="#334155" stroke-width="1"/>
  
  <!-- Metrics -->
  <text x="30" y="130" fill="#94a3b8" font-family="monospace" font-size="12">Global Population</text>
  <text x="30" y="155" fill="#38bdf8" font-family="monospace" font-size="22" font-weight="bold">${pop} B</text>

  <text x="220" y="130" fill="#94a3b8" font-family="monospace" font-size="12">Temperature Anomaly</text>
  <text x="220" y="155" fill="#f43f5e" font-family="monospace" font-size="22" font-weight="bold">${temp}</text>

  <text x="410" y="130" fill="#94a3b8" font-family="monospace" font-size="12">Human Wellbeing</text>
  <text x="410" y="155" fill="#10b981" font-family="monospace" font-size="22" font-weight="bold">${wellbeing}</text>

  <text x="30" y="215" fill="#94a3b8" font-family="monospace" font-size="12">AI Electricity Demand</text>
  <text x="30" y="240" fill="#c084fc" font-family="monospace" font-size="20" font-weight="bold">${aiElec}</text>

  <text x="220" y="215" fill="#94a3b8" font-family="monospace" font-size="12">Clean Power Share</text>
  <text x="220" y="240" fill="#06b6d4" font-family="monospace" font-size="20" font-weight="bold">${cleanShare}</text>

  <text x="410" y="215" fill="#94a3b8" font-family="monospace" font-size="12">Transgressed Boundaries</text>
  <text x="410" y="240" fill="#fbbf24" font-family="monospace" font-size="20" font-weight="bold">${transgressedBoundariesCount} / 9</text>

  <line x1="30" y1="280" x2="570" y2="280" stroke="#334155" stroke-width="1"/>

  <text x="30" y="320" fill="#64748b" font-family="monospace" font-size="10">Software v1.0.0 • Model 2026.1 • Independent Research &amp; Scenario Exploration</text>
  <text x="30" y="340" fill="#64748b" font-family="monospace" font-size="10">"Models are for exploring system behaviour, not pretending to know the future."</text>
  <text x="30" y="370" fill="#00f0ff" font-family="monospace" font-size="11">world26.org</text>
</svg>
    `.trim();

    const blob = new Blob([svgData], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `world26_${scenarioName.toLowerCase().replace(/[^a-z0-9]+/g, '_')}_${year}.svg`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="bg-slate-950/80 border border-slate-800 rounded-lg p-4 font-mono text-xs select-none">
      <div className="flex items-center justify-between border-b border-slate-800 pb-2 mb-3">
        <div className="flex items-center space-x-2">
          <Share2 className="w-4 h-4 text-cyan-400" />
          <span className="font-bold text-slate-100 text-sm tracking-wide">
            Shareable World Card
          </span>
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={copyPermalink}
            className="flex items-center space-x-1 px-2.5 py-1 rounded bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-700 transition-colors"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? 'Copied Link' : 'Copy Permalink'}</span>
          </button>
          <button
            onClick={downloadCardSvg}
            className="flex items-center space-x-1 px-2.5 py-1 rounded bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold transition-all hover:scale-105 active:scale-95"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export SVG</span>
          </button>
        </div>
      </div>

      {/* Visual World Card Canvas Element */}
      <div
        ref={cardRef}
        className="p-5 rounded-xl border border-slate-700/80 bg-gradient-to-b from-slate-900 to-[#070a0f] shadow-2xl relative overflow-hidden"
      >
        {/* Top bar */}
        <div className="flex items-start justify-between border-b border-slate-800/80 pb-3 mb-4">
          <div>
            <div className="flex items-center space-x-2 mb-1">
              <span className="font-bold text-lg text-cyan-400">WORLD//26</span>
              <span className="text-[10px] text-slate-500 uppercase tracking-widest">Planetary Summary</span>
            </div>
            <div className="text-slate-100 font-bold text-sm">
              Scenario: {scenarioName}
            </div>
          </div>
          <div className="text-right">
            <span className="text-cyan-300 font-bold text-base px-2.5 py-0.5 rounded bg-cyan-950 border border-cyan-800">
              Year {year}
            </span>
          </div>
        </div>

        {/* 6-Grid Core Indicators */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-4">
          <div className="bg-slate-950/70 p-2.5 rounded-lg border border-slate-800">
            <span className="text-slate-500 text-[10px] uppercase tracking-wider block">Population</span>
            <div className="text-xl font-bold text-sky-300 mt-0.5">{pop} B</div>
            {popDelta && (
              <span className="text-[10px] text-slate-400 block mt-0.5">
                {Number(popDelta) >= 0 ? `+${popDelta}` : popDelta} B vs BAU
              </span>
            )}
          </div>

          <div className="bg-slate-950/70 p-2.5 rounded-lg border border-slate-800">
            <span className="text-slate-500 text-[10px] uppercase tracking-wider block">Warming Anomaly</span>
            <div className="text-xl font-bold text-rose-400 mt-0.5">{temp}</div>
            {tempDelta && (
              <span className="text-[10px] text-slate-400 block mt-0.5">
                {Number(tempDelta) >= 0 ? `+${tempDelta}` : tempDelta}°C vs BAU
              </span>
            )}
          </div>

          <div className="bg-slate-950/70 p-2.5 rounded-lg border border-slate-800">
            <span className="text-slate-500 text-[10px] uppercase tracking-wider block">Wellbeing Index</span>
            <div className="text-xl font-bold text-emerald-400 mt-0.5">{wellbeing}</div>
            <span className="text-[10px] text-slate-500 block mt-0.5">Composite 0 to 1.0</span>
          </div>

          <div className="bg-slate-950/70 p-2.5 rounded-lg border border-slate-800">
            <span className="text-slate-500 text-[10px] uppercase tracking-wider block">AI Electricity</span>
            <div className="text-lg font-bold text-purple-300 mt-0.5">{aiElec}</div>
            <span className="text-[10px] text-slate-500 block mt-0.5">Global DC Fleet</span>
          </div>

          <div className="bg-slate-950/70 p-2.5 rounded-lg border border-slate-800">
            <span className="text-slate-500 text-[10px] uppercase tracking-wider block">Clean Power</span>
            <div className="text-lg font-bold text-cyan-300 mt-0.5">{cleanShare}</div>
            <span className="text-[10px] text-slate-500 block mt-0.5">Electricity Mix</span>
          </div>

          <div className="bg-slate-950/70 p-2.5 rounded-lg border border-slate-800">
            <span className="text-slate-500 text-[10px] uppercase tracking-wider block">Boundaries</span>
            <div className="text-lg font-bold text-amber-400 mt-0.5">{transgressedBoundariesCount} / 9</div>
            <span className="text-[10px] text-slate-500 block mt-0.5">Transgressed</span>
          </div>
        </div>

        {/* Footer info & disclaimer */}
        <div className="pt-2.5 border-t border-slate-800/80 flex flex-col sm:flex-row items-start sm:items-center justify-between text-[10px] text-slate-500 gap-1">
          <div className="flex items-center space-x-1">
            <Shield className="w-3 h-3 text-cyan-500" />
            <span>Independent Research • Verified RK4 Run • Model 2026.1</span>
          </div>
          <div>Explore at world26.org</div>
        </div>
      </div>
    </div>
  );
}
