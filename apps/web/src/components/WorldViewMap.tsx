'use client';
import React, { useState } from 'react';
import { Globe as GlobeIcon, MapPin, Activity } from 'lucide-react';

export interface RegionalMetric {
  id: string;
  name: string;
  coords: [number, number]; // [x, y] in svg 0-100 scale
  populationPct: number;
  outputPerCapita: number;
  energyDemandEj: number;
  aiComputeEflops: number;
  wellbeingIndex: number;
}

const REGIONS: RegionalMetric[] = [
  { id: 'north_america', name: 'North America', coords: [20, 32], populationPct: 4.8, outputPerCapita: 68000, energyDemandEj: 110, aiComputeEflops: 42, wellbeingIndex: 0.86 },
  { id: 'latin_america', name: 'Latin America', coords: [28, 65], populationPct: 8.2, outputPerCapita: 14000, energyDemandEj: 35, aiComputeEflops: 2.1, wellbeingIndex: 0.68 },
  { id: 'western_europe', name: 'Western Europe', coords: [48, 28], populationPct: 5.3, outputPerCapita: 48000, energyDemandEj: 75, aiComputeEflops: 18, wellbeingIndex: 0.88 },
  { id: 'eastern_europe_ca', name: 'Eastern Europe / Central Asia', coords: [62, 26], populationPct: 3.6, outputPerCapita: 21000, energyDemandEj: 50, aiComputeEflops: 4.5, wellbeingIndex: 0.72 },
  { id: 'middle_east_na', name: 'Middle East & North Africa', coords: [54, 44], populationPct: 6.2, outputPerCapita: 18500, energyDemandEj: 42, aiComputeEflops: 3.8, wellbeingIndex: 0.65 },
  { id: 'sub_saharan_africa', name: 'Sub-Saharan Africa', coords: [52, 64], populationPct: 15.1, outputPerCapita: 3800, energyDemandEj: 22, aiComputeEflops: 0.4, wellbeingIndex: 0.46 },
  { id: 'south_asia', name: 'South Asia', coords: [68, 46], populationPct: 24.5, outputPerCapita: 6500, energyDemandEj: 55, aiComputeEflops: 3.2, wellbeingIndex: 0.58 },
  { id: 'china_region', name: 'China Region', coords: [78, 38], populationPct: 17.5, outputPerCapita: 22000, energyDemandEj: 165, aiComputeEflops: 38, wellbeingIndex: 0.76 },
  { id: 'rest_of_asia', name: 'Southeast & Rest of Asia', coords: [82, 55], populationPct: 8.9, outputPerCapita: 11000, energyDemandEj: 38, aiComputeEflops: 4.1, wellbeingIndex: 0.67 },
  { id: 'pacific_oecd', name: 'Pacific OECD (JP/KR/AU/NZ)', coords: [88, 68], populationPct: 2.4, outputPerCapita: 44000, energyDemandEj: 32, aiComputeEflops: 11.5, wellbeingIndex: 0.87 },
];

interface Props {
  selectedYear?: number;
}

export function WorldViewMap({ selectedYear = 2026 }: Props) {
  const [selectedRegion, setSelectedRegion] = useState<RegionalMetric>(REGIONS[0]);

  return (
    <div className="bg-slate-950/80 border border-slate-800 rounded-lg p-4 font-mono text-xs select-none">
      <div className="flex items-center justify-between border-b border-slate-800 pb-2 mb-3">
        <div className="flex items-center space-x-2">
          <GlobeIcon className="w-4 h-4 text-cyan-400" />
          <span className="font-bold text-slate-100 text-sm tracking-wide">
            10-Region Planetary Distribution
          </span>
        </div>
        <span className="text-[10px] text-slate-400 bg-slate-900 border border-slate-800 px-2 py-0.5 rounded">
          Year {selectedYear}
        </span>
      </div>

      {/* SVG Stylized World Map Grid */}
      <div className="relative w-full aspect-[2/1] bg-[#070d18] rounded-lg border border-slate-800/80 overflow-hidden flex items-center justify-center">
        <svg viewBox="0 0 100 50" className="w-full h-full">
          {/* Latitude & Longitude grid */}
          {[10, 20, 30, 40].map((y) => (
            <line key={`lat-${y}`} x1="0" y1={y} x2="100" y2={y} stroke="#172238" strokeWidth="0.3" strokeDasharray="1 2" />
          ))}
          {[20, 40, 60, 80].map((x) => (
            <line key={`lon-${x}`} x1={x} y1="0" x2={x} y2="50" stroke="#172238" strokeWidth="0.3" strokeDasharray="1 2" />
          ))}

          {/* Trade / Flow Connection Arcs */}
          <path d="M 20 16 Q 34 8 48 14" fill="none" stroke="#00f0ff" strokeWidth="0.4" strokeDasharray="1 1" opacity="0.6" />
          <path d="M 20 16 Q 49 12 78 19" fill="none" stroke="#a855f7" strokeWidth="0.4" strokeDasharray="1 1" opacity="0.6" />
          <path d="M 48 14 Q 63 15 78 19" fill="none" stroke="#10b981" strokeWidth="0.4" strokeDasharray="1 1" opacity="0.6" />
          <path d="M 68 23 Q 73 21 78 19" fill="none" stroke="#f59e0b" strokeWidth="0.4" strokeDasharray="1 1" opacity="0.6" />

          {/* Region Anchor Nodes */}
          {REGIONS.map((reg) => {
            const isSelected = selectedRegion.id === reg.id;
            const radius = Math.max(Math.sqrt(reg.populationPct) * 0.9, 1.8);
            const x = reg.coords[0];
            const y = reg.coords[1] * 0.5; // Scale to 0-50 height

            return (
              <g
                key={reg.id}
                className="cursor-pointer transition-transform"
                onClick={() => setSelectedRegion(reg)}
              >
                <circle
                  cx={x}
                  cy={y}
                  r={radius * (isSelected ? 1.4 : 1.0)}
                  fill={isSelected ? '#00f0ff' : 'rgba(14, 165, 233, 0.35)'}
                  stroke={isSelected ? '#ffffff' : '#38bdf8'}
                  strokeWidth={isSelected ? 0.8 : 0.4}
                  className="hover:fill-cyan-400 transition-colors"
                />
                <text
                  x={x}
                  y={y - radius - 0.8}
                  textAnchor="middle"
                  fill={isSelected ? '#00f0ff' : '#94a3b8'}
                  fontSize="2"
                  fontWeight={isSelected ? 'bold' : 'normal'}
                >
                  {reg.name.split(' ')[0]}
                </text>
              </g>
            );
          })}
        </svg>

        {/* Legend in corner */}
        <div className="absolute bottom-2 left-2 text-[9px] text-slate-400 bg-slate-950/80 p-1 rounded border border-slate-800">
          Node radius = Regional Population share • Arcs = Technology & Mineral trade
        </div>
      </div>

      {/* Selected Region Detailed Card */}
      {selectedRegion && (
        <div className="mt-3 p-3 bg-slate-900/60 rounded border border-slate-800">
          <div className="flex items-center justify-between mb-2">
            <span className="font-bold text-slate-100 flex items-center space-x-1.5">
              <MapPin className="w-3.5 h-3.5 text-cyan-400" />
              <span>{selectedRegion.name}</span>
            </span>
            <span className="text-cyan-300 font-bold">
              {selectedRegion.populationPct}% Global Population
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px]">
            <div className="bg-slate-950/60 p-1.5 rounded border border-slate-800/80">
              <span className="text-slate-500 block text-[10px]">Output per Capita:</span>
              <span className="font-bold text-slate-200">${selectedRegion.outputPerCapita.toLocaleString()}</span>
            </div>
            <div className="bg-slate-950/60 p-1.5 rounded border border-slate-800/80">
              <span className="text-slate-500 block text-[10px]">Energy Demand:</span>
              <span className="font-bold text-amber-300">{selectedRegion.energyDemandEj} EJ</span>
            </div>
            <div className="bg-slate-950/60 p-1.5 rounded border border-slate-800/80">
              <span className="text-slate-500 block text-[10px]">AI Compute Fleet:</span>
              <span className="font-bold text-purple-300">{selectedRegion.aiComputeEflops} EFLOP/s</span>
            </div>
            <div className="bg-slate-950/60 p-1.5 rounded border border-slate-800/80">
              <span className="text-slate-500 block text-[10px]">Human Wellbeing:</span>
              <span className="font-bold text-emerald-300">{selectedRegion.wellbeingIndex.toFixed(2)} / 1.0</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
