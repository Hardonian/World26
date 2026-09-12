'use client';
import React, { useState } from 'react';

export interface BoundaryItem {
  id: string;
  name: string;
  controlVariable: string;
  unit: string;
  safeMax: number;
  uncertaintyMax: number;
  currentValue: number;
  status: 'safe' | 'uncertainty_zone' | 'transgressed';
  description?: string;
  source?: string;
}

interface Props {
  boundaries?: BoundaryItem[];
  simulatedValues?: Record<string, number>;
  selectedYear?: number;
  interactive?: boolean;
}

const DEFAULT_BOUNDARIES: BoundaryItem[] = [
  {
    id: 'climate_change_co2',
    name: 'Climate Change',
    controlVariable: 'Atmospheric CO2 (ppm)',
    unit: 'ppm',
    safeMax: 350,
    uncertaintyMax: 450,
    currentValue: 426.5,
    status: 'transgressed',
    source: 'NOAA / Mauna Loa',
    description: 'Safe limit is 350 ppm. Currently well inside high-risk zone.',
  },
  {
    id: 'biosphere_genetic',
    name: 'Biosphere Integrity',
    controlVariable: 'Extinction Rate (E/MSY)',
    unit: 'E/MSY',
    safeMax: 10,
    uncertaintyMax: 100,
    currentValue: 130,
    status: 'transgressed',
    source: 'IUCN Red List',
    description: 'Extinction rates exceed background baseline by over 100x.',
  },
  {
    id: 'land_system_change',
    name: 'Land-System Change',
    controlVariable: 'Global Forest Cover (% original)',
    unit: '%',
    safeMax: 75,
    uncertaintyMax: 85,
    currentValue: 60,
    status: 'transgressed',
    source: 'FAO FRA / Hansen et al.',
    description: 'Deforestation has reduced tropical and temperate biomes below safe ecological thresholds.',
  },
  {
    id: 'freshwater_blue',
    name: 'Freshwater Change',
    controlVariable: 'Blue Water Consumption (km³/yr)',
    unit: 'km³/yr',
    safeMax: 4000,
    uncertaintyMax: 6000,
    currentValue: 4200,
    status: 'uncertainty_zone',
    source: 'Gleick / FAO AQUASTAT',
    description: 'Global consumptive use is encroaching into high-risk hydrological stress.',
  },
  {
    id: 'biogeochemical_nitrogen',
    name: 'Biogeochemical Flows',
    controlVariable: 'Fixed N Applied (Tg N/yr)',
    unit: 'Tg N/yr',
    safeMax: 62,
    uncertaintyMax: 82,
    currentValue: 190,
    status: 'transgressed',
    source: 'FAOSTAT / de Vries et al.',
    description: 'Industrial fertilizer runoff causing severe marine and freshwater eutrophication.',
  },
  {
    id: 'ocean_acidification',
    name: 'Ocean Acidification',
    controlVariable: 'Aragonite Saturation (Ωarag)',
    unit: 'ratio',
    safeMax: 2.80,
    uncertaintyMax: 3.50,
    currentValue: 2.79,
    status: 'transgressed',
    source: 'Potsdam Institute / Copernicus (2025/2026)',
    description: 'Transgressed boundary: ocean acidification now exceeds safe thresholds, impacting coral and calcifying marine life globally.',
  },
  {
    id: 'atmospheric_aerosols',
    name: 'Atmospheric Aerosols',
    controlVariable: 'AOD Difference (Interhemispheric)',
    unit: 'AOD',
    safeMax: 0.10,
    uncertaintyMax: 0.25,
    currentValue: 0.075,
    status: 'safe',
    source: 'NASA AERONET / MODIS',
    description: 'Global mean remains within safe boundary, though severe regional air pollution persists in Asia.',
  },
  {
    id: 'stratospheric_ozone',
    name: 'Stratospheric Ozone',
    controlVariable: 'Ozone Column (Dobson Units)',
    unit: 'DU',
    safeMax: 276,
    uncertaintyMax: 350,
    currentValue: 284,
    status: 'safe',
    source: 'WMO / UNEP Scientific Assessment',
    description: 'Montreal Protocol success story; ozone layer is actively recovering toward safe pre-industrial baseline.',
  },
  {
    id: 'novel_entities',
    name: 'Novel Entities',
    controlVariable: 'Synthetic Chemicals & E-Waste',
    unit: 'Index',
    safeMax: 1.0,
    uncertaintyMax: 1.5,
    currentValue: 2.8,
    status: 'transgressed',
    source: 'Persson et al. / UN Global E-Waste Monitor',
    description: 'Release rate of unquantified novel chemicals, PFAS, plastics, and electronics scrap vastly exceeds global assessment capacity.',
  },
];

export function PlanetaryBoundaryWheel({
  boundaries = DEFAULT_BOUNDARIES,
  simulatedValues,
  selectedYear = 2026,
  interactive = true,
}: Props) {
  const [activeId, setActiveId] = useState<string | null>(null);

  const cx = 200;
  const cy = 200;
  const safeRadius = 75;
  const uncertaintyRadius = 115;
  const maxRadius = 175;

  const numSectors = boundaries.length;
  const angleStep = (2 * Math.PI) / numSectors;

  // Active boundary inspection item
  const activeItem = boundaries.find((b) => b.id === activeId) || boundaries[0];

  return (
    <div className="flex flex-col items-center select-none">
      <div className="relative w-[340px] h-[340px] sm:w-[400px] sm:h-[400px]">
        <svg viewBox="0 0 400 400" className="w-full h-full transform -rotate-90">
          <defs>
            <radialGradient id="safeGlow" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#10b981" stopOpacity="0.08" />
              <stop offset="100%" stopColor="#10b981" stopOpacity="0.25" />
            </radialGradient>
            <radialGradient id="transgressedGlow" cx="50%" cy="50%" r="50%">
              <stop offset="70%" stopColor="#ef4444" stopOpacity="0.1" />
              <stop offset="100%" stopColor="#ef4444" stopOpacity="0.4" />
            </radialGradient>
          </defs>

          {/* Background concentric reference circles */}
          {/* Safe operating space */}
          <circle
            cx={cx}
            cy={cy}
            r={safeRadius}
            fill="url(#safeGlow)"
            stroke="#10b981"
            strokeWidth="1.5"
            strokeDasharray="3 3"
          />
          {/* Zone of uncertainty outer boundary */}
          <circle
            cx={cx}
            cy={cy}
            r={uncertaintyRadius}
            fill="none"
            stroke="#f59e0b"
            strokeWidth="1.5"
            strokeDasharray="4 4"
          />
          {/* High risk outer perimeter */}
          <circle
            cx={cx}
            cy={cy}
            r={maxRadius}
            fill="none"
            stroke="#ef4444"
            strokeWidth="1"
            strokeOpacity="0.4"
          />

          {/* 9 Boundary Wedges / Spokes */}
          {boundaries.map((b, i) => {
            const startAngle = i * angleStep;
            const endAngle = (i + 1) * angleStep;
            const midAngle = (startAngle + endAngle) / 2;

            // Value calculation
            let val = b.currentValue;
            if (simulatedValues && simulatedValues[b.id] !== undefined) {
              val = simulatedValues[b.id];
            }

            // Normalization ratio to safe radius
            let normRatio = 1.0;
            if (b.id === 'ocean_acidification') {
              // Inverse: safe is >= 2.80. Lower is worse.
              normRatio = b.safeMax / Math.max(val, 1.8);
            } else if (b.id === 'land_system_change') {
              // Inverse: safe is >= 75% forest. Lower is worse.
              normRatio = b.safeMax / Math.max(val, 20);
            } else {
              normRatio = val / Math.max(b.safeMax, 0.001);
            }

            // Spoke extent radius
            const rVal = Math.min(Math.max(safeRadius * normRatio, 25), maxRadius + 15);

            // Polar coordinates for arc segment
            const x1 = cx + rVal * Math.cos(startAngle);
            const y1 = cy + rVal * Math.sin(startAngle);
            const x2 = cx + rVal * Math.cos(endAngle);
            const y2 = cy + rVal * Math.sin(endAngle);

            const isTransgressed = normRatio > (uncertaintyRadius / safeRadius);
            const isUncertain = normRatio > 1.0 && !isTransgressed;

            let fillColor = 'rgba(16, 185, 129, 0.45)'; // Green
            let strokeColor = '#10b981';
            if (isTransgressed) {
              fillColor = 'rgba(239, 68, 68, 0.55)'; // Red
              strokeColor = '#f43f5e';
            } else if (isUncertain) {
              fillColor = 'rgba(245, 158, 11, 0.5)'; // Amber
              strokeColor = '#f59e0b';
            }

            const isHovered = activeId === b.id;

            return (
              <g
                key={b.id}
                className="cursor-pointer transition-all duration-300"
                onClick={() => interactive && setActiveId(b.id)}
                onMouseEnter={() => interactive && setActiveId(b.id)}
              >
                {/* Wedge slice */}
                <path
                  d={`M ${cx} ${cy} L ${x1} ${y1} A ${rVal} ${rVal} 0 0 1 ${x2} ${y2} Z`}
                  fill={fillColor}
                  stroke={isHovered ? '#00f0ff' : strokeColor}
                  strokeWidth={isHovered ? 2.5 : 1}
                  className="transition-all duration-200 hover:opacity-90"
                />

                {/* Spoke divider lines */}
                <line
                  x1={cx}
                  y1={cy}
                  x2={cx + maxRadius * Math.cos(startAngle)}
                  y2={cy + maxRadius * Math.sin(startAngle)}
                  stroke="#334155"
                  strokeWidth="1"
                  strokeOpacity="0.6"
                />
              </g>
            );
          })}

          {/* Central Earth Core */}
          <circle cx={cx} cy={cy} r={24} fill="#0b1329" stroke="#00f0ff" strokeWidth="1.5" />
          <text
            x={cx}
            y={cy + 4}
            textAnchor="middle"
            fill="#e2e8f0"
            fontSize="10"
            fontWeight="bold"
            fontFamily="monospace"
            className="transform rotate-90"
            style={{ transformOrigin: `${cx}px ${cy}px` }}
          >
            {selectedYear}
          </text>
        </svg>

        {/* Legend overlays */}
        <div className="absolute top-2 left-2 text-[10px] font-mono text-slate-400 bg-slate-950/80 p-1.5 rounded border border-slate-800 pointer-events-none">
          <div className="flex items-center space-x-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400 inline-block" />
            <span>Safe Space (&lt; 1.0)</span>
          </div>
          <div className="flex items-center space-x-1.5">
            <span className="w-2 h-2 rounded-full bg-amber-400 inline-block" />
            <span>Uncertainty (1.0–1.5)</span>
          </div>
          <div className="flex items-center space-x-1.5">
            <span className="w-2 h-2 rounded-full bg-rose-500 inline-block" />
            <span>Transgressed (&gt; 1.5)</span>
          </div>
        </div>
      </div>

      {/* Selected Boundary Details Card */}
      {activeItem && (
        <div className="w-full max-w-md mt-3 p-3 rounded-lg border border-slate-800 bg-slate-900/90 text-xs font-mono">
          <div className="flex items-center justify-between border-b border-slate-800 pb-1.5 mb-2">
            <span className="font-bold text-slate-100 text-sm flex items-center space-x-2">
              <span>{activeItem.name}</span>
              {activeItem.id === 'ocean_acidification' && (
                <span className="text-[10px] px-1.5 py-0.2 bg-rose-950 text-rose-400 border border-rose-800 rounded">
                  2025/2026 Transgressed
                </span>
              )}
            </span>
            <span
              className={`px-2 py-0.5 rounded text-[10px] uppercase font-bold tracking-wider ${
                activeItem.status === 'transgressed'
                  ? 'bg-rose-950/80 text-rose-300 border border-rose-800'
                  : activeItem.status === 'uncertainty_zone'
                  ? 'bg-amber-950/80 text-amber-300 border border-amber-800'
                  : 'bg-emerald-950/80 text-emerald-300 border border-emerald-800'
              }`}
            >
              {activeItem.status.replace('_', ' ')}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2 text-slate-300 text-[11px] mb-2">
            <div>
              <span className="text-slate-500 block">Control Variable:</span>
              <span className="font-semibold text-slate-200">{activeItem.controlVariable}</span>
            </div>
            <div>
              <span className="text-slate-500 block">Current Estimate ({selectedYear}):</span>
              <span className="font-bold text-cyan-300">
                {simulatedValues && simulatedValues[activeItem.id] !== undefined
                  ? simulatedValues[activeItem.id].toFixed(2)
                  : activeItem.currentValue.toFixed(2)}{' '}
                {activeItem.unit}
              </span>
            </div>
            <div>
              <span className="text-slate-500 block">Safe Threshold:</span>
              <span>&le; {activeItem.safeMax} {activeItem.unit}</span>
            </div>
            <div>
              <span className="text-slate-500 block">Source / Assessment:</span>
              <span className="text-slate-400 truncate block">{activeItem.source}</span>
            </div>
          </div>

          {activeItem.description && (
            <p className="text-[11px] text-slate-400 border-t border-slate-800/80 pt-1.5 leading-normal">
              {activeItem.description}
            </p>
          )}
        </div>
      )}
    </div>
  );
}
