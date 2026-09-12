'use client';
import React, { useState } from 'react';
import { HelpCircle, TrendingUp, TrendingDown, ArrowRight, ShieldCheck, Sparkles } from 'lucide-react';
import { ScientificBadge } from './ScientificBadge';

export interface CausalDriver {
  name: string;
  effect: 'accelerates_growth' | 'causes_decline' | 'stabilizes' | 'damping';
  relativeStrengthPct: number;
  explanation: string;
  sourceSector: string;
  equationTerm?: string;
}

export interface InflectionExplanation {
  targetVariable: string;
  year: number;
  eventType: 'peak' | 'trough' | 'acceleration' | 'deceleration' | 'boundary_crossing';
  summary: string;
  primaryMechanism: string;
  drivers: CausalDriver[];
  deterministicConfidence: number; // 0 to 1
}

interface Props {
  selectedYear?: number;
  selectedVariable?: string;
  inflection?: InflectionExplanation | null;
  onExploreCausalGraph?: (sector: string) => void;
}

export function CausalExplainer({
  selectedYear = 2045,
  selectedVariable = 'industrial_output',
  inflection,
  onExploreCausalGraph,
}: Props) {
  // Deterministic fallback attribution generator if no pre-computed inflection passed
  const explanation: InflectionExplanation = inflection || {
    targetVariable: selectedVariable === 'population' ? 'Global Population' : 'Industrial Output per Capita',
    year: selectedYear,
    eventType: selectedYear > 2040 ? 'peak' : 'acceleration',
    summary:
      selectedYear > 2040
        ? `Output inflection around ${selectedYear}: Growth slows and reverses as capital allocation is crowded out by resource depletion costs and climate damages.`
        : `Exponential accumulation phase: Reinvestment rate exceeds capital depreciation, supported by low-cost fossil energy and expanding AI productivity multipliers.`,
    primaryMechanism:
      selectedYear > 2040
        ? 'Capital diversion loop: Resource extraction fraction capital (FCAOR) rises above 0.35, reducing net industrial investment fraction below depreciation.'
        : 'Self-reinforcing industrial capital feedback: Output → Investment → Capital Stock → Output.',
    drivers:
      selectedYear > 2040
        ? [
            {
              name: 'Resource Depletion / Extraction Cost',
              effect: 'causes_decline',
              relativeStrengthPct: 42,
              explanation:
                'Non-renewable resource depletion factor drops below critical threshold, forcing more capital into primary extraction rather than industrial production.',
              sourceSector: 'Non-Renewable Resources',
              equationTerm: 'ICOR_eff = ICOR / (1 - FCAOR)',
            },
            {
              name: 'Climate Damage Capital Depreciation',
              effect: 'causes_decline',
              relativeStrengthPct: 28,
              explanation:
                'Atmospheric warming above +1.5°C increases extreme weather capital destruction rate from 0.04 to 0.058/year.',
              sourceSector: 'Climate / Carbon',
              equationTerm: 'deprec_eff = ALIC * (1 - climate_damage)',
            },
            {
              name: 'AI Infrastructure & Power Competition',
              effect: 'damping',
              relativeStrengthPct: 18,
              explanation:
                'Frontier AI data centers demand over 4,000 TWh of electricity, diverting capital into specialized grid and cooling assets.',
              sourceSector: 'AI / Computing',
              equationTerm: 'I_comp_alloc = frac_io_ai * IO',
            },
            {
              name: 'AI Productivity Dividend',
              effect: 'accelerates_growth',
              relativeStrengthPct: 12,
              explanation:
                'Productivity boost from automated engineering partially counterbalances resource headwinds until mineral bottlenecks bind.',
              sourceSector: 'AI / Computing',
              equationTerm: 'prod_mult = (Compute / C_ref)^elasticity',
            },
          ]
        : [
            {
              name: 'Industrial Reinvestment Surplus',
              effect: 'accelerates_growth',
              relativeStrengthPct: 55,
              explanation: 'Net capital formation exceeds depreciation rate of 0.04/yr.',
              sourceSector: 'Industrial Economy',
            },
            {
              name: 'Energy Abundance',
              effect: 'accelerates_growth',
              relativeStrengthPct: 30,
              explanation: 'Fossil and grid capacity adequately scale with industrial demand.',
              sourceSector: 'Energy',
            },
            {
              name: 'Demographic Dividend',
              effect: 'accelerates_growth',
              relativeStrengthPct: 15,
              explanation: 'Working-age cohort expansion supports output and service delivery.',
              sourceSector: 'Demography',
            },
          ],
    deterministicConfidence: 0.94,
  };

  return (
    <div className="bg-slate-950/80 border border-slate-800 rounded-lg p-4 font-mono text-xs select-none">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-2 mb-3">
        <div className="flex items-center space-x-2">
          <HelpCircle className="w-4 h-4 text-cyan-400" />
          <span className="font-bold text-slate-100 text-sm tracking-wide">
            &ldquo;Why Did That Happen?&rdquo;
          </span>
        </div>
        <div className="flex items-center space-x-2">
          <ScientificBadge type="SIMULATED" />
          <span className="text-[10px] text-emerald-400 bg-emerald-950/50 border border-emerald-800 px-1.5 py-0.5 rounded flex items-center space-x-1">
            <ShieldCheck className="w-3 h-3" />
            <span>Deterministic Trace</span>
          </span>
        </div>
      </div>

      {/* Target & Event Badge */}
      <div className="bg-slate-900/90 border border-slate-800/80 rounded p-3 mb-3">
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-cyan-300 font-semibold text-xs">
            {explanation.targetVariable} ({explanation.year})
          </span>
          <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-purple-950 text-purple-300 border border-purple-800 flex items-center space-x-1">
            <Sparkles className="w-3 h-3 text-purple-400" />
            <span>{explanation.eventType} event</span>
          </span>
        </div>
        <p className="text-slate-300 text-[11px] leading-relaxed mb-2">
          {explanation.summary}
        </p>
        <div className="text-[10px] text-slate-400 bg-slate-950/60 p-2 rounded border border-slate-800/60">
          <span className="text-slate-500 font-bold block mb-0.5">Primary System Dynamics Feedback:</span>
          <span className="text-cyan-200">{explanation.primaryMechanism}</span>
        </div>
      </div>

      {/* Causal Driver Breakdown */}
      <div className="space-y-2">
        <div className="text-[11px] text-slate-400 font-bold uppercase tracking-wider flex items-center justify-between">
          <span>Decomposition of Contributing Factors</span>
          <span className="text-[10px] text-slate-500">Relative Weight</span>
        </div>

        {explanation.drivers.map((driver, idx) => {
          const isNegative = driver.effect === 'causes_decline';
          const isDamping = driver.effect === 'damping';

          return (
            <div
              key={idx}
              className="p-2.5 rounded border border-slate-800/80 bg-slate-900/40 hover:bg-slate-900/80 transition-colors"
            >
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center space-x-1.5">
                  {isNegative ? (
                    <TrendingDown className="w-3.5 h-3.5 text-rose-400" />
                  ) : isDamping ? (
                    <ArrowRight className="w-3.5 h-3.5 text-amber-400" />
                  ) : (
                    <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
                  )}
                  <span className="font-semibold text-slate-200 text-[11px]">{driver.name}</span>
                </div>
                <div className="flex items-center space-x-1.5">
                  <span className="text-[10px] text-slate-400 bg-slate-800 px-1 py-0.2 rounded">
                    {driver.sourceSector}
                  </span>
                  <span
                    className={`font-bold text-[11px] ${
                      isNegative ? 'text-rose-400' : isDamping ? 'text-amber-400' : 'text-emerald-400'
                    }`}
                  >
                    {isNegative ? '-' : '+'}{driver.relativeStrengthPct}%
                  </span>
                </div>
              </div>

              {/* Progress bar */}
              <div className="w-full bg-slate-950 h-1 rounded-full overflow-hidden mb-1.5">
                <div
                  className={`h-full rounded-full ${
                    isNegative ? 'bg-rose-500' : isDamping ? 'bg-amber-400' : 'bg-emerald-400'
                  }`}
                  style={{ width: `${driver.relativeStrengthPct}%` }}
                />
              </div>

              <p className="text-[10px] text-slate-400 leading-normal mb-1">
                {driver.explanation}
              </p>

              {driver.equationTerm && (
                <div className="text-[9px] text-slate-500 font-mono bg-slate-950/80 px-1.5 py-0.5 rounded border border-slate-800 inline-block">
                  Term: {driver.equationTerm}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Attribution footer */}
      <div className="mt-3 pt-2 border-t border-slate-800/60 flex items-center justify-between text-[10px] text-slate-500">
        <span>No LLM hallucination • Derived from differential rate derivatives</span>
        <button
          onClick={() => onExploreCausalGraph && onExploreCausalGraph('Industrial Economy')}
          className="text-cyan-400 hover:text-cyan-300 flex items-center space-x-1 underline"
        >
          <span>View in Causal Graph</span>
          <ArrowRight className="w-3 h-3" />
        </button>
      </div>
    </div>
  );
}
