'use client';
import React, { useState, useEffect } from 'react';
import { Columns, ArrowRight, ArrowDownRight, ArrowUpRight, Minus, Layers, Activity } from 'lucide-react';
import { TrajectoryCharts } from '@/components/TrajectoryCharts';
import { ScientificBadge } from '@/components/ScientificBadge';
import { BUILTIN_SCENARIOS } from '@world26/model';
import { runWorld26Simulation, SimulationResultBundle } from '@/lib/simulator';

export default function ComparePage() {
  const [scenarioAId, setScenarioAId] = useState<string>('world3_bau');
  const [scenarioBId, setScenarioBId] = useState<string>('ai_sustainable_regulated');

  const [resA, setResA] = useState<SimulationResultBundle | null>(null);
  const [resB, setResB] = useState<SimulationResultBundle | null>(null);

  useEffect(() => {
    setResA(runWorld26Simulation(scenarioAId));
  }, [scenarioAId]);

  useEffect(() => {
    setResB(runWorld26Simulation(scenarioBId));
  }, [scenarioBId]);

  const scA = BUILTIN_SCENARIOS.find((s) => s.id === scenarioAId) || BUILTIN_SCENARIOS[0];
  const scB = BUILTIN_SCENARIOS.find((s) => s.id === scenarioBId) || BUILTIN_SCENARIOS[1];

  const finalA = resA?.series[resA.series.length - 1];
  const finalB = resB?.series[resB.series.length - 1];

  return (
    <div className="max-w-[1600px] mx-auto p-4 sm:p-8 font-mono text-xs select-none space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between border-b border-slate-800 pb-4 gap-4">
        <div>
          <div className="inline-flex items-center space-x-2 text-cyan-400 text-xs font-bold uppercase tracking-wider mb-1">
            <Columns className="w-4 h-4" />
            <span>Scenario Comparison Laboratory</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-100">
            Comparative Scenario Dynamics (A vs B)
          </h1>
          <p className="text-slate-400 text-xs mt-1 max-w-2xl leading-relaxed">
            Direct side-by-side evaluation of policy bundles and structural futures 1900–2100.
            Examine divergence in climate warming, demographic inflection, and boundary transgressions.
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <ScientificBadge type="SIMULATED" />
          <span className="text-slate-400 text-[11px] bg-slate-900 border border-slate-800 px-2 py-1 rounded">
            Paired Differential Run
          </span>
        </div>
      </div>

      {/* Scenario Selectors */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Scenario A Picker */}
        <div className="p-4 rounded-xl border border-sky-900/60 bg-sky-950/20 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sky-400 font-bold uppercase tracking-wider text-xs">
              Scenario A (Reference Baseline)
            </span>
            <span className="text-[10px] text-slate-500">{scA.family}</span>
          </div>
          <select
            value={scenarioAId}
            onChange={(e) => setScenarioAId(e.target.value)}
            className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-xs text-slate-200 focus:outline-none focus:border-sky-400 cursor-pointer"
          >
            {BUILTIN_SCENARIOS.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </select>
          <p className="text-[11px] text-slate-400 leading-normal">{scA.description}</p>
        </div>

        {/* Scenario B Picker */}
        <div className="p-4 rounded-xl border border-purple-900/60 bg-purple-950/20 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-purple-400 font-bold uppercase tracking-wider text-xs">
              Scenario B (Intervention Future)
            </span>
            <span className="text-[10px] text-slate-500">{scB.family}</span>
          </div>
          <select
            value={scenarioBId}
            onChange={(e) => setScenarioBId(e.target.value)}
            className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-xs text-slate-200 focus:outline-none focus:border-purple-400 cursor-pointer"
          >
            {BUILTIN_SCENARIOS.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </select>
          <p className="text-[11px] text-slate-400 leading-normal">{scB.description}</p>
        </div>
      </div>

      {/* 2100 Metric Delta Comparison Table */}
      {finalA && finalB && (
        <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-4 sm:p-6 space-y-4">
          <h2 className="text-sm font-bold text-slate-200 uppercase tracking-wider">
            Key 2100 Outcome Deltas
          </h2>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            {[
              {
                label: 'Population (2100)',
                valA: `${((finalA.population || 0) / 1e9).toFixed(2)}B`,
                valB: `${((finalB.population || 0) / 1e9).toFixed(2)}B`,
                delta: `${(((finalB.population || 0) - (finalA.population || 0)) / 1e9).toFixed(2)}B`,
                positiveIsGood: true,
              },
              {
                label: 'Warming (2100)',
                valA: `+${(finalA.temperature_anomaly || 0).toFixed(2)}°C`,
                valB: `+${(finalB.temperature_anomaly || 0).toFixed(2)}°C`,
                delta: `${((finalB.temperature_anomaly || 0) - (finalA.temperature_anomaly || 0)).toFixed(2)}°C`,
                positiveIsGood: false,
              },
              {
                label: 'Atmospheric CO2',
                valA: `${(finalA.atmospheric_co2_ppm || 0).toFixed(0)} ppm`,
                valB: `${(finalB.atmospheric_co2_ppm || 0).toFixed(0)} ppm`,
                delta: `${((finalB.atmospheric_co2_ppm || 0) - (finalA.atmospheric_co2_ppm || 0)).toFixed(0)} ppm`,
                positiveIsGood: false,
              },
              {
                label: 'Human Wellbeing',
                valA: (finalA.human_wellbeing_index || 0).toFixed(2),
                valB: (finalB.human_wellbeing_index || 0).toFixed(2),
                delta: ((finalB.human_wellbeing_index || 0) - (finalA.human_wellbeing_index || 0)).toFixed(2),
                positiveIsGood: true,
              },
              {
                label: 'AI Electricity',
                valA: `${(finalA.ai_electricity_demand_twh || 0).toFixed(0)} TWh`,
                valB: `${(finalB.ai_electricity_demand_twh || 0).toFixed(0)} TWh`,
                delta: `${((finalB.ai_electricity_demand_twh || 0) - (finalA.ai_electricity_demand_twh || 0)).toFixed(0)} TWh`,
                positiveIsGood: false,
              },
              {
                label: 'Clean Power Share',
                valA: `${((finalA.clean_electricity_share || 0) * 100).toFixed(0)}%`,
                valB: `${((finalB.clean_electricity_share || 0) * 100).toFixed(0)}%`,
                delta: `${(((finalB.clean_electricity_share || 0) - (finalA.clean_electricity_share || 0)) * 100).toFixed(0)}%`,
                positiveIsGood: true,
              },
            ].map((m, idx) => {
              const numDelta = parseFloat(m.delta);
              const isFavorable = m.positiveIsGood ? numDelta > 0 : numDelta < 0;
              const isZero = Math.abs(numDelta) < 1e-4;

              return (
                <div key={idx} className="p-3 bg-slate-900/60 rounded-lg border border-slate-800 space-y-1">
                  <span className="text-slate-500 text-[10px] uppercase block">{m.label}</span>
                  <div className="flex justify-between text-xs font-bold pt-1">
                    <span className="text-sky-300">{m.valA}</span>
                    <span className="text-purple-300">{m.valB}</span>
                  </div>
                  <div
                    className={`text-[11px] font-bold pt-1 border-t border-slate-800/80 flex items-center justify-between ${
                      isZero
                        ? 'text-slate-500'
                        : isFavorable
                        ? 'text-emerald-400'
                        : 'text-rose-400'
                    }`}
                  >
                    <span>Delta (B - A):</span>
                    <span>{numDelta > 0 ? `+${m.delta}` : m.delta}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Comparative Trajectory Plots */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-2">
          <span className="font-bold text-sky-400 uppercase tracking-wider text-xs">
            Scenario A Trajectory ({scA.name})
          </span>
          {resA && <TrajectoryCharts data={resA.series} />}
        </div>

        <div className="space-y-2">
          <span className="font-bold text-purple-400 uppercase tracking-wider text-xs">
            Scenario B Trajectory ({scB.name})
          </span>
          {resB && <TrajectoryCharts data={resB.series} />}
        </div>
      </div>
    </div>
  );
}
