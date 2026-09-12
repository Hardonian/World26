'use client';
import React, { useState } from 'react';

export interface TrajectoryPoint {
  time: number;
  population?: number;
  industrial_output_per_capita?: number;
  atmospheric_co2_ppm?: number;
  temperature_anomaly?: number;
  installed_compute_eflops?: number;
  ai_electricity_demand_twh?: number;
  clean_electricity_share?: number;
  food_per_capita?: number;
  human_wellbeing_index?: number;
  gini_coefficient?: number;
  [key: string]: number | undefined;
}

export interface ChartSeriesConfig {
  key: string;
  name: string;
  color: string;
  unit: string;
  min?: number;
  max?: number;
  formatter?: (val: number) => string;
}

interface Props {
  data: TrajectoryPoint[];
  selectedYear?: number;
  onSelectYear?: (year: number) => void;
  milestones?: Array<{ year: number; title: string; category: string }>;
  compareData?: TrajectoryPoint[];
  compareLabel?: string;
}

const AVAILABLE_SERIES: ChartSeriesConfig[] = [
  {
    key: 'population',
    name: 'Population',
    color: '#38bdf8', // Sky blue
    unit: 'B',
    formatter: (v) => `${(v / 1e9).toFixed(2)}B`,
  },
  {
    key: 'temperature_anomaly',
    name: 'Temperature Anomaly',
    color: '#f43f5e', // Rose
    unit: '°C',
    formatter: (v) => `+${v.toFixed(2)}°C`,
  },
  {
    key: 'atmospheric_co2_ppm',
    name: 'Atmospheric CO2',
    color: '#fbbf24', // Amber
    unit: 'ppm',
    formatter: (v) => `${v.toFixed(1)} ppm`,
  },
  {
    key: 'installed_compute_eflops',
    name: 'AI Compute Fleet',
    color: '#c084fc', // Violet
    unit: 'EFLOP/s',
    formatter: (v) => `${v.toFixed(1)} EFLOP/s`,
  },
  {
    key: 'ai_electricity_demand_twh',
    name: 'AI Electricity',
    color: '#ec4899', // Pink
    unit: 'TWh',
    formatter: (v) => `${v.toFixed(0)} TWh`,
  },
  {
    key: 'industrial_output_per_capita',
    name: 'Industrial Output/cap',
    color: '#34d399', // Emerald
    unit: '$/cap',
    formatter: (v) => `$${v.toFixed(0)}`,
  },
  {
    key: 'clean_electricity_share',
    name: 'Clean Electricity Share',
    color: '#06b6d4', // Cyan
    unit: '%',
    formatter: (v) => `${(v * 100).toFixed(1)}%`,
  },
  {
    key: 'human_wellbeing_index',
    name: 'Human Wellbeing Index',
    color: '#a3e635', // Lime
    unit: 'Index (0-1)',
    formatter: (v) => v.toFixed(3),
  },
];

export function TrajectoryCharts({
  data,
  selectedYear = 2026,
  onSelectYear,
  milestones = [],
  compareData,
  compareLabel = 'Comparison',
}: Props) {
  const [activeSeriesKeys, setActiveSeriesKeys] = useState<string[]>([
    'population',
    'temperature_anomaly',
    'atmospheric_co2_ppm',
    'installed_compute_eflops',
  ]);
  const [hoverYear, setHoverYear] = useState<number | null>(null);

  if (!data || data.length === 0) {
    return (
      <div className="p-8 text-center text-slate-500 font-mono border border-slate-800 rounded bg-slate-900/30">
        No simulation trajectory data loaded.
      </div>
    );
  }

  // Chart dimensions
  const width = 860;
  const height = 360;
  const padding = { top: 20, right: 30, bottom: 40, left: 60 };

  const minYear = data[0].time;
  const maxYear = data[data.length - 1].time;

  const currentYear = hoverYear ?? selectedYear;

  // Find closest point to hovered/selected year
  const closestPoint =
    data.reduce((prev, curr) =>
      Math.abs(curr.time - currentYear) < Math.abs(prev.time - currentYear) ? curr : prev
    ) || data[0];

  const toggleSeries = (key: string) => {
    if (activeSeriesKeys.includes(key)) {
      if (activeSeriesKeys.length > 1) {
        setActiveSeriesKeys(activeSeriesKeys.filter((k) => k !== key));
      }
    } else {
      setActiveSeriesKeys([...activeSeriesKeys, key]);
    }
  };

  // Convert time to SVG X coordinate
  const getX = (time: number) => {
    return padding.left + ((time - minYear) / (maxYear - minYear)) * (width - padding.left - padding.right);
  };

  // Build normalized path for each active series
  const activeConfigs = AVAILABLE_SERIES.filter((s) => activeSeriesKeys.includes(s.key));

  return (
    <div className="flex flex-col bg-slate-950/70 border border-slate-800 rounded-lg p-4 font-mono select-none">
      {/* Series selection buttons */}
      <div className="flex flex-wrap items-center gap-1.5 mb-3 border-b border-slate-800/80 pb-3">
        <span className="text-[11px] text-slate-500 uppercase tracking-wider mr-2">Indicators:</span>
        {AVAILABLE_SERIES.map((s) => {
          const isActive = activeSeriesKeys.includes(s.key);
          return (
            <button
              key={s.key}
              onClick={() => toggleSeries(s.key)}
              className={`flex items-center space-x-1 px-2 py-1 rounded text-xs transition-all border ${
                isActive
                  ? 'bg-slate-900 text-slate-100 border-slate-700 shadow-sm'
                  : 'bg-transparent text-slate-500 border-slate-900 hover:border-slate-800'
              }`}
            >
              <span
                className="w-2.5 h-2.5 rounded-full inline-block"
                style={{ backgroundColor: s.color, opacity: isActive ? 1 : 0.4 }}
              />
              <span>{s.name}</span>
            </button>
          );
        })}
      </div>

      {/* Trajectory SVG Canvas */}
      <div className="relative w-full overflow-x-auto">
        <svg
          viewBox={`0 0 ${width} ${height}`}
          className="w-full h-auto cursor-crosshair"
          onMouseMove={(e) => {
            const rect = e.currentTarget.getBoundingClientRect();
            const relX = (e.clientX - rect.left) / rect.width;
            const approxX = relX * width;
            if (approxX >= padding.left && approxX <= width - padding.right) {
              const fraction = (approxX - padding.left) / (width - padding.left - padding.right);
              const year = Math.round((minYear + fraction * (maxYear - minYear)) * 4) / 4;
              setHoverYear(year);
            }
          }}
          onMouseLeave={() => setHoverYear(null)}
          onClick={() => {
            if (hoverYear !== null && onSelectYear) {
              onSelectYear(hoverYear);
            }
          }}
        >
          {/* Historical vs Simulated background shading */}
          {minYear < 2026 && (
            <rect
              x={padding.left}
              y={padding.top}
              width={Math.max(getX(2026) - padding.left, 0)}
              height={height - padding.top - padding.bottom}
              fill="rgba(255, 255, 255, 0.015)"
            />
          )}

          {/* Grid lines: Years */}
          {[1900, 1950, 2000, 2026, 2050, 2100].map((y) => {
            if (y < minYear || y > maxYear) return null;
            const x = getX(y);
            const is2026 = y === 2026;
            return (
              <g key={y}>
                <line
                  x1={x}
                  y1={padding.top}
                  x2={x}
                  y2={height - padding.bottom}
                  stroke={is2026 ? '#00f0ff' : '#1e293b'}
                  strokeWidth={is2026 ? 1.5 : 1}
                  strokeDasharray={is2026 ? '4 2' : '2 4'}
                />
                <text
                  x={x}
                  y={height - padding.bottom + 18}
                  textAnchor="middle"
                  fill={is2026 ? '#00f0ff' : '#64748b'}
                  fontSize="11"
                >
                  {y}
                </text>
              </g>
            );
          })}

          {/* Horizontal percentage grid lines (0%, 25%, 50%, 75%, 100%) */}
          {[0, 0.25, 0.5, 0.75, 1.0].map((frac, idx) => {
            const y = height - padding.bottom - frac * (height - padding.top - padding.bottom);
            return (
              <line
                key={idx}
                x1={padding.left}
                y1={y}
                x2={width - padding.right}
                y2={y}
                stroke="#1e293b"
                strokeWidth="1"
                strokeDasharray="2 4"
              />
            );
          })}

          {/* Active Series Lines */}
          {activeConfigs.map((cfg) => {
            // Find min/max for this series
            let sMin = Number.POSITIVE_INFINITY;
            let sMax = Number.NEGATIVE_INFINITY;

            for (const pt of data) {
              const v = pt[cfg.key];
              if (v !== undefined) {
                if (v < sMin) sMin = v;
                if (v > sMax) sMax = v;
              }
            }

            if (sMin === Number.POSITIVE_INFINITY) return null;
            if (sMax === sMin) sMax += 1;

            // Generate Path d string
            const pathPoints = data
              .filter((pt) => pt[cfg.key] !== undefined)
              .map((pt) => {
                const x = getX(pt.time);
                const normVal = (pt[cfg.key]! - sMin) / (sMax - sMin);
                const y = height - padding.bottom - normVal * (height - padding.top - padding.bottom);
                return `${x.toFixed(1)},${y.toFixed(1)}`;
              });

            if (pathPoints.length < 2) return null;

            const pathD = `M ${pathPoints.join(' L ')}`;

            return (
              <g key={cfg.key}>
                {/* Primary curve */}
                <path
                  d={pathD}
                  fill="none"
                  stroke={cfg.color}
                  strokeWidth="2.2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="transition-all duration-150 opacity-90 hover:opacity-100"
                />

                {/* Milestone circles if any match this metric */}
                {milestones.map((m, mIdx) => {
                  const pt = data.find((d) => Math.abs(d.time - m.year) < 0.5);
                  if (!pt || pt[cfg.key] === undefined) return null;
                  const x = getX(pt.time);
                  const normVal = (pt[cfg.key]! - sMin) / (sMax - sMin);
                  const y = height - padding.bottom - normVal * (height - padding.top - padding.bottom);
                  return (
                    <circle
                      key={mIdx}
                      cx={x}
                      cy={y}
                      r="4"
                      fill="#070a0f"
                      stroke={cfg.color}
                      strokeWidth="2"
                    />
                  );
                })}
              </g>
            );
          })}

          {/* Current / Hover Time Scrubber Cursor */}
          {currentYear && (
            <g>
              <line
                x1={getX(currentYear)}
                y1={padding.top}
                x2={getX(currentYear)}
                y2={height - padding.bottom}
                stroke="#00f0ff"
                strokeWidth="1.5"
              />
              <circle
                cx={getX(currentYear)}
                cy={height - padding.bottom}
                r="4"
                fill="#00f0ff"
              />
            </g>
          )}
        </svg>
      </div>

      {/* Trajectory Inspector Panel for selected year */}
      <div className="mt-3 pt-3 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center space-x-2">
          <span className="text-slate-400">Year:</span>
          <span className="text-cyan-400 font-bold text-sm bg-cyan-950/60 border border-cyan-800/60 px-2 py-0.5 rounded">
            {currentYear.toFixed(1)}
          </span>
          {currentYear <= 2025 ? (
            <span className="text-[10px] text-emerald-400 font-semibold uppercase tracking-wider bg-emerald-950/40 border border-emerald-900 px-1.5 py-0.5 rounded">
              Calibrated History
            </span>
          ) : (
            <span className="text-[10px] text-purple-400 font-semibold uppercase tracking-wider bg-purple-950/40 border border-purple-900 px-1.5 py-0.5 rounded">
              Simulated Future
            </span>
          )}
        </div>

        {/* Metric readouts for active series */}
        <div className="flex flex-wrap items-center gap-3">
          {activeConfigs.map((cfg) => {
            const val = closestPoint[cfg.key];
            if (val === undefined) return null;
            const formatted = cfg.formatter ? cfg.formatter(val) : `${val.toFixed(2)} ${cfg.unit}`;
            return (
              <div key={cfg.key} className="flex items-center space-x-1.5 bg-slate-900/80 border border-slate-800 px-2 py-1 rounded">
                <span className="w-2 h-2 rounded-full inline-block" style={{ backgroundColor: cfg.color }} />
                <span className="text-slate-400 text-[11px]">{cfg.name}:</span>
                <span className="text-slate-100 font-bold">{formatted}</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
