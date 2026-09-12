'use client';
import React, { useState } from 'react';
import { Award, CheckCircle, Target, ArrowRight, ShieldCheck, Sparkles, AlertCircle } from 'lucide-react';
import Link from 'next/link';
import { ScientificBadge } from '@/components/ScientificBadge';

interface Challenge {
  id: string;
  title: string;
  subtitle: string;
  difficulty: 'Standard' | 'Demanding' | 'Extreme';
  objectives: string[];
  metrics: { name: string; target: string }[];
  recommendedScenario: string;
  paretoTradeoff: string;
}

const CHALLENGES: Challenge[] = [
  {
    id: 'warming_wellbeing',
    title: 'Keep Warming Below 1.8°C While Improving Wellbeing',
    subtitle: 'Decouple human development from greenhouse emissions without causing service austerity.',
    difficulty: 'Demanding',
    objectives: [
      'Peak global warming remains strictly < +1.80°C above pre-industrial.',
      'Human Wellbeing Index in 2100 exceeds 0.80 (baseline is 0.72).',
      'Food per capita stays above 500 kg/person-year throughout the century.',
    ],
    metrics: [
      { name: 'Max Warming', target: '< 1.80°C' },
      { name: '2100 Wellbeing', target: '> 0.80' },
      { name: 'Min Food Security', target: '> 500 kg/cap' },
    ],
    recommendedScenario: 'energy_rapid_transition',
    paretoTradeoff: 'Trade-off between rapid fossil phase-out capital costs and near-term industrial consumption.',
  },
  {
    id: 'boundaries_return',
    title: 'Return Inside All Modelled Planetary Boundaries',
    subtitle: 'Steer civilization from 7 transgressed boundaries back into the safe operating space by 2100.',
    difficulty: 'Extreme',
    objectives: [
      'Atmospheric CO2 brought below 350 ppm before 2100.',
      'Ocean aragonite saturation recovers above 2.80.',
      'Blue water consumption kept below 4,000 km³/year.',
      'Novel entities / e-waste generation reduced via 80%+ circular mandate.',
    ],
    metrics: [
      { name: '2100 CO2', target: '< 350 ppm' },
      { name: 'Ocean Ωarag', target: '≥ 2.80' },
      { name: 'Transgressed Count', target: '0 of 9' },
    ],
    recommendedScenario: 'compound_boundaries_return',
    paretoTradeoff: 'Deep structural transformations in agricultural nitrogen fixation and global material throughput.',
  },
  {
    id: 'scale_ai_sustainably',
    title: 'Scale AI 100x Without Raising Aggregate Ecological Pressure',
    subtitle: 'Expand active compute fleet to over 10,000 EFLOP/s while containing power and mineral footprint.',
    difficulty: 'Demanding',
    objectives: [
      'Installed compute capacity expands by at least 100-fold (> 12,500 EFLOP/s).',
      'AI electrical power draw does not exceed 10% of global generation capacity.',
      'Hardware refurbishment and recycling recovers > 75% of critical copper and cobalt.',
      'Accelerated scientific productivity yields negative emissions technologies.',
    ],
    metrics: [
      { name: 'Compute Fleet', target: '> 12,500 EFLOP/s' },
      { name: 'Power Share', target: '< 10%' },
      { name: 'Recycling Share', target: '≥ 75%' },
    ],
    recommendedScenario: 'ai_sustainable_regulated',
    paretoTradeoff: 'Hardware lifespan extension and efficiency slowdown vs raw unconstrained frontier compute scaling.',
  },
  {
    id: 'avoid_collapse',
    title: 'Reach 2100 Without Major Population or Welfare Collapse',
    subtitle: 'Navigate the resource and pollution headwinds that triggered overshoot in original World3 scenarios.',
    difficulty: 'Standard',
    objectives: [
      'Global population does not experience a sharp mid-century contraction (> 25% drop).',
      'Industrial output per capita remains stable or grows gradually.',
      'Life expectancy and health investments remain funded above depreciation.',
    ],
    metrics: [
      { name: 'Pop Contraction', target: '< 15%' },
      { name: 'Capital Stock', target: 'Non-collapsing' },
      { name: 'Min Welfare', target: '> 0.65' },
    ],
    recommendedScenario: 'world3_sw',
    paretoTradeoff: 'Balancing demographic stabilization with economic capital preservation.',
  },
];

export default function ChallengesPage() {
  const [activeChallengeId, setActiveChallengeId] = useState<string>(CHALLENGES[0].id);
  const activeChallenge = CHALLENGES.find((c) => c.id === activeChallengeId) || CHALLENGES[0];

  return (
    <div className="max-w-[1540px] mx-auto p-4 sm:p-8 font-mono text-xs select-none space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between border-b border-slate-800 pb-4 gap-4">
        <div>
          <div className="inline-flex items-center space-x-2 text-cyan-400 text-xs font-bold uppercase tracking-wider mb-1">
            <Award className="w-4 h-4" />
            <span>Planetary Governance Sandbox</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-100">
            Civilization-Scale Challenges
          </h1>
          <p className="text-slate-400 text-xs mt-1 max-w-2xl leading-relaxed">
            Test policy combinations against concrete multidimensional objectives.
            No single optimal solution exists: each pathway defines a position along 
            the global Pareto frontier.
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <ScientificBadge type="SIMULATED" />
          <span className="text-slate-400 text-[11px] bg-slate-900 border border-slate-800 px-2 py-1 rounded">
            Pareto Objective Evaluation
          </span>
        </div>
      </div>

      {/* Challenge Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {CHALLENGES.map((ch) => {
          const isSelected = ch.id === activeChallengeId;
          return (
            <div
              key={ch.id}
              onClick={() => setActiveChallengeId(ch.id)}
              className={`p-4 rounded-xl border transition-all cursor-pointer flex flex-col justify-between ${
                isSelected
                  ? 'bg-cyan-950/40 border-cyan-500/60 shadow-[0_0_15px_rgba(0,240,255,0.15)]'
                  : 'bg-slate-950/60 border-slate-800 hover:border-slate-700'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span
                    className={`px-2 py-0.5 rounded text-[9px] uppercase font-bold tracking-wider ${
                      ch.difficulty === 'Extreme'
                        ? 'bg-rose-950 text-rose-300 border border-rose-800'
                        : ch.difficulty === 'Demanding'
                        ? 'bg-amber-950 text-amber-300 border border-amber-800'
                        : 'bg-blue-950 text-blue-300 border border-blue-800'
                    }`}
                  >
                    {ch.difficulty}
                  </span>
                  <Target className="w-3.5 h-3.5 text-slate-500" />
                </div>
                <h3 className="font-bold text-slate-100 text-sm mb-1 leading-snug">{ch.title}</h3>
                <p className="text-[11px] text-slate-400 leading-normal mb-3">{ch.subtitle}</p>
              </div>

              <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-[10px]">
                <span className="text-slate-500">{ch.metrics.length} Target Metrics</span>
                <span className="text-cyan-400 font-bold flex items-center space-x-1">
                  <span>View Details</span>
                  <ArrowRight className="w-3 h-3" />
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Active Challenge Detailed Inspector */}
      {activeChallenge && (
        <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-6 space-y-6">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between border-b border-slate-800 pb-4 gap-3">
            <div>
              <span className="text-xs text-cyan-400 font-bold uppercase tracking-wider block">
                Selected Challenge Protocol
              </span>
              <h2 className="text-xl font-bold text-slate-100 mt-0.5">{activeChallenge.title}</h2>
              <p className="text-slate-400 text-xs mt-1">{activeChallenge.subtitle}</p>
            </div>

            <Link
              href={`/simulator?scenario=${activeChallenge.recommendedScenario}`}
              className="flex items-center space-x-2 px-5 py-2.5 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold transition-all shadow-[0_0_15px_rgba(0,240,255,0.3)] hover:scale-105 active:scale-95"
            >
              <Sparkles className="w-4 h-4" />
              <span>Launch Challenge in Simulator</span>
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Target Metrics */}
            <div className="space-y-2">
              <span className="text-xs font-bold text-slate-300 uppercase tracking-wider block">
                Quantitative Success Thresholds:
              </span>
              <div className="space-y-2">
                {activeChallenge.metrics.map((m, idx) => (
                  <div key={idx} className="p-3 bg-slate-900/60 rounded-lg border border-slate-800 flex justify-between items-center">
                    <span className="text-slate-400 text-xs">{m.name}</span>
                    <span className="text-cyan-300 font-bold text-sm">{m.target}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Checklist Objectives */}
            <div className="space-y-2 md:col-span-2">
              <span className="text-xs font-bold text-slate-300 uppercase tracking-wider block">
                Key Physical Constraints &amp; Levers:
              </span>
              <div className="space-y-2">
                {activeChallenge.objectives.map((obj, idx) => (
                  <div key={idx} className="p-2.5 bg-slate-900/40 rounded-lg border border-slate-800/80 flex items-start space-x-2.5 text-xs text-slate-300">
                    <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                    <span>{obj}</span>
                  </div>
                ))}
              </div>

              {/* Pareto Trade-off Insight */}
              <div className="mt-3 p-3 bg-slate-900/80 rounded-lg border border-slate-800/80 flex items-start space-x-2 text-xs">
                <AlertCircle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold text-slate-200 block">Pareto Frontier Trade-Off:</span>
                  <span className="text-slate-400 leading-normal">{activeChallenge.paretoTradeoff}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
