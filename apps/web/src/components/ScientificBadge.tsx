'use client';
import React from 'react';

export type BadgeType = 'OBSERVED' | 'CALIBRATED' | 'ASSUMED' | 'PROJECTED' | 'SIMULATED' | 'EXPERIMENTAL';

interface Props {
  type: BadgeType;
  tooltip?: string;
}

const BADGE_STYLES: Record<BadgeType, { bg: string; text: string; border: string; desc: string }> = {
  OBSERVED: {
    bg: 'bg-emerald-950/60',
    text: 'text-emerald-400',
    border: 'border-emerald-800/80',
    desc: 'Empirical historical observation from public peer-reviewed or UN/IEA/NOAA records.',
  },
  CALIBRATED: {
    bg: 'bg-cyan-950/60',
    text: 'text-cyan-400',
    border: 'border-cyan-800/80',
    desc: 'Parameter statistically estimated to fit empirical historical data 1960–2025.',
  },
  ASSUMED: {
    bg: 'bg-amber-950/60',
    text: 'text-amber-400',
    border: 'border-amber-800/80',
    desc: 'Explicit theoretical assumption with documented uncertainty bounds.',
  },
  PROJECTED: {
    bg: 'bg-blue-950/60',
    text: 'text-blue-400',
    border: 'border-blue-800/80',
    desc: 'External exogenous trajectory (e.g. IPCC SSP, UN DESA population projection).',
  },
  SIMULATED: {
    bg: 'bg-purple-950/60',
    text: 'text-purple-400',
    border: 'border-purple-800/80',
    desc: 'Endogenous output variable generated dynamically by differential equations.',
  },
  EXPERIMENTAL: {
    bg: 'bg-rose-950/60',
    text: 'text-rose-400',
    border: 'border-rose-800/80',
    desc: 'Preliminary subsystem pending further empirical calibration. Interpret with caution.',
  },
};

export function ScientificBadge({ type, tooltip }: Props) {
  const style = BADGE_STYLES[type] || BADGE_STYLES.ASSUMED;

  return (
    <span
      className={`inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-mono tracking-wider font-semibold border ${style.bg} ${style.text} ${style.border} cursor-help transition-all hover:scale-105`}
      title={tooltip || style.desc}
    >
      {type}
    </span>
  );
}
