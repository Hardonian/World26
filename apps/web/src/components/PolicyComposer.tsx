'use client';
import React from 'react';
import { Sliders, RotateCcw, Zap, Cpu, Leaf, DollarSign, RefreshCw, Layers } from 'lucide-react';
import { BUILTIN_SCENARIOS } from '@world26/model';

export interface PolicyState {
  clean_energy_target_2050: number; // 0 to 1
  compute_demand_growth_rate: number; // e.g. 0.35 (35%/yr)
  hardware_lifetime_years: number; // e.g. 3.5 years
  carbon_tax_usd_per_ton: number; // e.g. 0 to 250
  food_waste_reduction_pct: number; // e.g. 0 to 50
  recycling_target_share: number; // e.g. 0.40
  universal_basic_services_strength: number; // 0 to 1
}

export const DEFAULT_POLICIES: PolicyState = {
  clean_energy_target_2050: 0.50,
  compute_demand_growth_rate: 0.35,
  hardware_lifetime_years: 3.5,
  carbon_tax_usd_per_ton: 0,
  food_waste_reduction_pct: 0,
  recycling_target_share: 0.40,
  universal_basic_services_strength: 0,
};

interface Props {
  selectedScenarioId: string;
  onSelectScenario: (id: string) => void;
  policies: PolicyState;
  onChangePolicy: (key: keyof PolicyState, value: number) => void;
  onResetPolicies: () => void;
}

export function PolicyComposer({
  selectedScenarioId,
  onSelectScenario,
  policies,
  onChangePolicy,
  onResetPolicies,
}: Props) {
  return (
    <div className="bg-slate-950/80 border border-slate-800 rounded-lg p-4 font-mono text-xs select-none space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-2">
        <div className="flex items-center space-x-2">
          <Sliders className="w-4 h-4 text-cyan-400" />
          <span className="font-bold text-slate-100 text-sm tracking-wide">
            Policy & Scenario Lab
          </span>
        </div>
        <button
          onClick={onResetPolicies}
          className="text-slate-400 hover:text-slate-200 flex items-center space-x-1 text-[11px] hover:bg-slate-900 px-2 py-1 rounded transition-colors"
          title="Reset all policies to baseline"
        >
          <RotateCcw className="w-3 h-3" />
          <span>Reset</span>
        </button>
      </div>

      {/* Scenario Presets Selector */}
      <div>
        <label className="text-[11px] text-slate-400 font-bold uppercase tracking-wider block mb-1.5 flex items-center space-x-1.5">
          <Layers className="w-3.5 h-3.5 text-cyan-400" />
          <span>Scenario Presets ({BUILTIN_SCENARIOS.length})</span>
        </label>
        <select
          value={selectedScenarioId}
          onChange={(e) => onSelectScenario(e.target.value)}
          className="w-full bg-slate-900 border border-slate-700/80 rounded px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-cyan-400 cursor-pointer"
        >
          {BUILTIN_SCENARIOS.map((sc) => (
            <option key={sc.id} value={sc.id}>
              {sc.name} ({sc.family})
            </option>
          ))}
        </select>
        {(() => {
          const currentSc = BUILTIN_SCENARIOS.find((s) => s.id === selectedScenarioId);
          return currentSc ? (
            <p className="text-[11px] text-slate-400 mt-1.5 bg-slate-900/50 p-2 rounded border border-slate-800/80 leading-normal">
              {currentSc.description}
            </p>
          ) : null;
        })()}
      </div>

      {/* Policy Levers */}
      <div className="space-y-3 pt-2 border-t border-slate-800">
        <div className="text-[11px] text-slate-400 font-bold uppercase tracking-wider">
          Active Policy Interventions
        </div>

        {/* Clean Energy Target 2050 */}
        <div className="bg-slate-900/60 p-2.5 rounded border border-slate-800">
          <div className="flex justify-between items-center mb-1">
            <span className="flex items-center space-x-1 text-slate-200 font-medium text-[11px]">
              <Zap className="w-3.5 h-3.5 text-cyan-400" />
              <span>Clean Electricity Target 2050</span>
            </span>
            <span className="text-cyan-300 font-bold">
              {(policies.clean_energy_target_2050 * 100).toFixed(0)}%
            </span>
          </div>
          <input
            type="range"
            min="0.10"
            max="1.0"
            step="0.05"
            value={policies.clean_energy_target_2050}
            onChange={(e) => onChangePolicy('clean_energy_target_2050', parseFloat(e.target.value))}
            className="w-full accent-cyan-400 cursor-pointer"
          />
          <div className="flex justify-between text-[10px] text-slate-500 mt-0.5">
            <span>10% (Fossil Dominance)</span>
            <span>100% (Full Zero-Carbon)</span>
          </div>
        </div>

        {/* AI Compute Growth Rate */}
        <div className="bg-slate-900/60 p-2.5 rounded border border-slate-800">
          <div className="flex justify-between items-center mb-1">
            <span className="flex items-center space-x-1 text-slate-200 font-medium text-[11px]">
              <Cpu className="w-3.5 h-3.5 text-purple-400" />
              <span>AI Compute Demand Growth</span>
            </span>
            <span className="text-purple-300 font-bold">
              {(policies.compute_demand_growth_rate * 100).toFixed(0)}%/yr
            </span>
          </div>
          <input
            type="range"
            min="0.05"
            max="0.80"
            step="0.05"
            value={policies.compute_demand_growth_rate}
            onChange={(e) => onChangePolicy('compute_demand_growth_rate', parseFloat(e.target.value))}
            className="w-full accent-purple-400 cursor-pointer"
          />
          <div className="flex justify-between text-[10px] text-slate-500 mt-0.5">
            <span>5%/yr (Slowing)</span>
            <span>80%/yr (Hyper-Scaling)</span>
          </div>
        </div>

        {/* Hardware Useful Lifetime (Years) */}
        <div className="bg-slate-900/60 p-2.5 rounded border border-slate-800">
          <div className="flex justify-between items-center mb-1">
            <span className="flex items-center space-x-1 text-slate-200 font-medium text-[11px]">
              <RefreshCw className="w-3.5 h-3.5 text-blue-400" />
              <span>Server & Accelerator Lifetime</span>
            </span>
            <span className="text-blue-300 font-bold">
              {policies.hardware_lifetime_years.toFixed(1)} yrs
            </span>
          </div>
          <input
            type="range"
            min="1.5"
            max="8.0"
            step="0.5"
            value={policies.hardware_lifetime_years}
            onChange={(e) => onChangePolicy('hardware_lifetime_years', parseFloat(e.target.value))}
            className="w-full accent-blue-400 cursor-pointer"
          />
          <div className="flex justify-between text-[10px] text-slate-500 mt-0.5">
            <span>1.5 yrs (Rapid Obsolescence)</span>
            <span>8.0 yrs (Circular Economy)</span>
          </div>
        </div>

        {/* Carbon Tax ($/ton CO2) */}
        <div className="bg-slate-900/60 p-2.5 rounded border border-slate-800">
          <div className="flex justify-between items-center mb-1">
            <span className="flex items-center space-x-1 text-slate-200 font-medium text-[11px]">
              <DollarSign className="w-3.5 h-3.5 text-emerald-400" />
              <span>Global Carbon Price</span>
            </span>
            <span className="text-emerald-300 font-bold">
              ${policies.carbon_tax_usd_per_ton}/t
            </span>
          </div>
          <input
            type="range"
            min="0"
            max="250"
            step="10"
            value={policies.carbon_tax_usd_per_ton}
            onChange={(e) => onChangePolicy('carbon_tax_usd_per_ton', parseFloat(e.target.value))}
            className="w-full accent-emerald-400 cursor-pointer"
          />
          <div className="flex justify-between text-[10px] text-slate-500 mt-0.5">
            <span>$0/t (None)</span>
            <span>$250/t (High Incentive)</span>
          </div>
        </div>

        {/* Food Waste Reduction */}
        <div className="bg-slate-900/60 p-2.5 rounded border border-slate-800">
          <div className="flex justify-between items-center mb-1">
            <span className="flex items-center space-x-1 text-slate-200 font-medium text-[11px]">
              <Leaf className="w-3.5 h-3.5 text-amber-400" />
              <span>Food Waste Reduction</span>
            </span>
            <span className="text-amber-300 font-bold">
              {policies.food_waste_reduction_pct.toFixed(0)}%
            </span>
          </div>
          <input
            type="range"
            min="0"
            max="60"
            step="5"
            value={policies.food_waste_reduction_pct}
            onChange={(e) => onChangePolicy('food_waste_reduction_pct', parseFloat(e.target.value))}
            className="w-full accent-amber-400 cursor-pointer"
          />
          <div className="flex justify-between text-[10px] text-slate-500 mt-0.5">
            <span>0% (Current 30% Loss)</span>
            <span>60% (Halving Waste)</span>
          </div>
        </div>
      </div>
    </div>
  );
}
