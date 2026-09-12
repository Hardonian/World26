'use client';
import React, { useState, useMemo } from 'react';
import { RegionalWorld26SimulatorTs, RegionalStepState } from '@world26/model';
import { REGIONS_DATA } from '@world26/data';
import { 
  Globe2, 
  TrendingUp, 
  Cpu, 
  Droplets, 
  Wheat, 
  Zap, 
  Scale, 
  ShieldAlert, 
  ArrowRightLeft,
  CheckCircle2
} from 'lucide-react';

export default function RegionsPage() {

  const [selectedRegionId, setSelectedRegionId] = useState<string>('north_america');
  const [targetYear, setTargetYear] = useState<number>(2050);

  // Run the 10-region simulator across 1900-2100
  const { timeline, finalStep } = useMemo(() => {
    const sim = new RegionalWorld26SimulatorTs();
    const steps: Array<{ year: number; regions: Record<string, RegionalStepState>; global: any; metrics: any }> = [];
    
    for (let t = 1900; t <= 2100; t += 0.5) {
      const res = sim.step(0.5);
      if (Math.abs(Math.round(t) - t) < 1e-4) {
        steps.push({
          year: Math.round(t),
          regions: res.regions,
          global: res.global,
          metrics: res.conservationMetrics,
        });
      }
    }
    return {
      timeline: steps,
      finalStep: steps[steps.length - 1],
    };
  }, []);

  const currentStep = useMemo(() => {
    return timeline.find((s) => s.year === targetYear) || timeline[timeline.length - 1];
  }, [timeline, targetYear]);

  const activeRegion = currentStep.regions[selectedRegionId] || Object.values(currentStep.regions)[0];
  const global = currentStep.global;
  const metrics = currentStep.metrics;

  const regionsList = REGIONS_DATA.regions;

  return (
    <div className="min-h-screen bg-[#070a0f] text-slate-100 flex flex-col">
      <HeaderNav />

      <main className="flex-1 max-w-[1720px] mx-auto w-full p-4 lg:p-6 space-y-6">
        {/* Top Header & Conservation Banner */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 rounded-lg border border-slate-800/80 bg-slate-900/40 backdrop-blur-sm">
          <div>
            <div className="flex items-center space-x-2 text-cyan-400 font-mono text-xs uppercase tracking-wider mb-1">
              <Globe2 className="w-4 h-4" />
              <span>Coupled Earth-System Model</span>
              <span className="text-slate-600">|</span>
              <span className="text-emerald-400 flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" />
                Physical Trade Conserved Globally
              </span>
            </div>
            <h1 className="text-2xl font-bold font-mono tracking-tight text-slate-100">
              10-Region Disaggregated Planetary Architecture
            </h1>
            <p className="text-xs text-slate-400 font-mono mt-1 max-w-2xl">
              Disaggregated simulation across 10 macro-regions aligned with IAM and Earth4All conventions.
              Bilateral trade clears critical minerals and agricultural calories with exact zero-sum global conservation.
            </p>
          </div>

          {/* Conservation Metrics Counter */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-950/80 p-3 rounded border border-slate-800 font-mono text-xs">
            <div>
              <div className="text-[10px] text-slate-400 uppercase">Global Pop</div>
              <div className="text-sm font-bold text-cyan-400">{(metrics.totalPopulation / 1e9).toFixed(2)}B</div>
            </div>
            <div>
              <div className="text-[10px] text-slate-400 uppercase">Global CO₂</div>
              <div className="text-sm font-bold text-amber-400">{metrics.totalCo2Gt.toFixed(1)} Gt</div>
            </div>
            <div>
              <div className="text-[10px] text-slate-400 uppercase">Net Food Trade</div>
              <div className="text-sm font-bold text-emerald-400">{metrics.netFoodTradeBalanceMt.toFixed(2)} Mt</div>
            </div>
            <div>
              <div className="text-[10px] text-slate-400 uppercase">Net Copper Trade</div>
              <div className="text-sm font-bold text-emerald-400">{metrics.netCopperTradeBalanceMt.toFixed(2)} Mt</div>
            </div>
          </div>
        </div>

        {/* Year Scrubber & Controls */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-lg border border-slate-800 bg-slate-900/30">
          <div className="flex items-center space-x-3 w-full sm:w-auto">
            <span className="text-xs font-mono text-slate-400 uppercase whitespace-nowrap">Simulation Year:</span>
            <input
              type="range"
              min="1960"
              max="2100"
              step="5"
              value={targetYear}
              onChange={(e) => setTargetYear(Number(e.target.value))}
              className="w-full sm:w-64 accent-cyan-500 cursor-pointer"
            />
            <span className="text-base font-mono font-bold text-cyan-400 bg-cyan-950/50 border border-cyan-500/30 px-2 py-0.5 rounded">
              {targetYear}
            </span>
          </div>

          <div className="flex items-center space-x-2 text-xs font-mono text-slate-400">
            <span>Global Warming:</span>
            <span className={`font-bold ${global.temperature_anomaly >= 2.0 ? 'text-rose-400' : 'text-amber-400'}`}>
              +{global.temperature_anomaly.toFixed(2)}°C
            </span>
            <span className="text-slate-700">|</span>
            <span>CO₂:</span>
            <span className="font-bold text-slate-200">{global.atmospheric_co2_ppm.toFixed(0)} ppm</span>
          </div>
        </div>

        {/* Region Selector Tabs */}
        <div className="flex items-center space-x-2 overflow-x-auto pb-2 border-b border-slate-800/80">
          {regionsList.map((r) => {
            const isSelected = r.id === selectedRegionId;
            return (
              <button
                key={r.id}
                onClick={() => setSelectedRegionId(r.id)}
                className={`px-3 py-2 rounded text-xs font-mono font-semibold transition-all whitespace-nowrap flex items-center space-x-1.5 ${
                  isSelected
                    ? 'bg-cyan-500 text-slate-950 shadow-[0_0_12px_rgba(0,240,255,0.3)]'
                    : 'bg-slate-900/60 text-slate-300 hover:text-slate-100 hover:bg-slate-800/80 border border-slate-800'
                }`}
              >
                <span>{r.name}</span>
              </button>
            );
          })}
        </div>

        {/* Selected Region Detailed Dashboard */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Card 1: Demography & Economy */}
          <div className="p-4 rounded-lg border border-slate-800 bg-slate-900/40 space-y-3">
            <div className="flex items-center justify-between text-xs font-mono text-slate-400 border-b border-slate-800 pb-2">
              <span className="flex items-center gap-1.5 text-cyan-400 font-semibold">
                <TrendingUp className="w-4 h-4" />
                Demography & Output
              </span>
              <span>{activeRegion.name}</span>
            </div>
            <div className="space-y-2 font-mono text-xs">
              <div className="flex justify-between">
                <span className="text-slate-400">Population:</span>
                <span className="font-bold text-slate-100">{(activeRegion.population / 1e6).toFixed(1)} Million</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Share of Global Pop:</span>
                <span className="text-cyan-300">{((activeRegion.population / global.population) * 100).toFixed(1)}%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">GDP PPP:</span>
                <span className="font-bold text-emerald-400">${activeRegion.gdp_ppp_trillion.toFixed(1)} Trillion</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Output Per Capita:</span>
                <span className="text-slate-200">${activeRegion.industrial_output_per_capita.toFixed(0)}/cap</span>
              </div>
            </div>
          </div>

          {/* Card 2: Energy & Clean Transition */}
          <div className="p-4 rounded-lg border border-slate-800 bg-slate-900/40 space-y-3">
            <div className="flex items-center justify-between text-xs font-mono text-slate-400 border-b border-slate-800 pb-2">
              <span className="flex items-center gap-1.5 text-amber-400 font-semibold">
                <Zap className="w-4 h-4" />
                Energy & Decarbonization
              </span>
              <span>{targetYear}</span>
            </div>
            <div className="space-y-2 font-mono text-xs">
              <div className="flex justify-between">
                <span className="text-slate-400">Total Energy:</span>
                <span className="font-bold text-slate-100">{activeRegion.total_energy_demand_ej.toFixed(1)} EJ/yr</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Electricity Demand:</span>
                <span className="text-slate-200">{activeRegion.electricity_demand_twh.toFixed(0)} TWh</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Clean Power Share:</span>
                <span className="font-bold text-emerald-400">{(activeRegion.clean_electricity_share * 100).toFixed(1)}%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">CO₂ Emissions:</span>
                <span className="font-bold text-rose-400">{activeRegion.co2_emissions_gt.toFixed(2)} Gt/yr</span>
              </div>
            </div>
          </div>

          {/* Card 3: Compute & AI Sector */}
          <div className="p-4 rounded-lg border border-slate-800 bg-slate-900/40 space-y-3">
            <div className="flex items-center justify-between text-xs font-mono text-slate-400 border-b border-slate-800 pb-2">
              <span className="flex items-center gap-1.5 text-purple-400 font-semibold">
                <Cpu className="w-4 h-4" />
                AI & Digital Infrastructure
              </span>
              <span>EFLOPS</span>
            </div>
            <div className="space-y-2 font-mono text-xs">
              <div className="flex justify-between">
                <span className="text-slate-400">Active Compute:</span>
                <span className="font-bold text-purple-300">{activeRegion.installed_compute_eflops.toFixed(1)} EFLOPS</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">AI Power Demand:</span>
                <span className="text-slate-200">{activeRegion.ai_electricity_demand_twh.toFixed(1)} TWh/yr</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Copper Production:</span>
                <span className="text-amber-300">{activeRegion.copper_production_mt.toFixed(2)} Mt/yr</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Net Copper Trade:</span>
                <span className={`font-bold ${activeRegion.net_copper_trade_mt >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                  {activeRegion.net_copper_trade_mt >= 0 ? '+' : ''}{activeRegion.net_copper_trade_mt.toFixed(2)} Mt
                </span>
              </div>
            </div>
          </div>

          {/* Card 4: Ecological Stress & Wellbeing */}
          <div className="p-4 rounded-lg border border-slate-800 bg-slate-900/40 space-y-3">
            <div className="flex items-center justify-between text-xs font-mono text-slate-400 border-b border-slate-800 pb-2">
              <span className="flex items-center gap-1.5 text-emerald-400 font-semibold">
                <Wheat className="w-4 h-4" />
                Food, Water & Wellbeing
              </span>
              <span>Impact</span>
            </div>
            <div className="space-y-2 font-mono text-xs">
              <div className="flex justify-between">
                <span className="text-slate-400">Food Production:</span>
                <span className="text-slate-100">{activeRegion.food_production_mt.toFixed(0)} Mt</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Net Food Trade:</span>
                <span className={`font-bold ${activeRegion.net_food_trade_mt >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                  {activeRegion.net_food_trade_mt >= 0 ? '+' : ''}{activeRegion.net_food_trade_mt.toFixed(1)} Mt
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Water Stress Index:</span>
                <span className={`font-bold ${activeRegion.water_stress_index > 0.8 ? 'text-rose-400' : 'text-slate-200'}`}>
                  {activeRegion.water_stress_index.toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Wellbeing Index:</span>
                <span className="font-bold text-cyan-400">{(activeRegion.human_wellbeing_index * 100).toFixed(0)} / 100</span>
              </div>
            </div>
          </div>
        </div>

        {/* 10-Region Disparity Matrix Table */}
        <div className="p-4 rounded-lg border border-slate-800 bg-slate-900/40 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <ArrowRightLeft className="w-4 h-4 text-cyan-400" />
              <h2 className="text-sm font-bold font-mono text-slate-200">
                10-Region Comparative Disparity & Trade Matrix ({targetYear})
              </h2>
            </div>
            <span className="text-[10px] font-mono text-slate-500">
              Data grounded in UN WPP, IEA WEO, FAOSTAT & USGS Mineral Summaries
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left font-mono text-xs">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 uppercase text-[10px] bg-slate-950/60">
                  <th className="py-2.5 px-3">Region</th>
                  <th className="py-2.5 px-3">Population</th>
                  <th className="py-2.5 px-3">GDP PPP ($T)</th>
                  <th className="py-2.5 px-3">Clean Power</th>
                  <th className="py-2.5 px-3">Compute (EFLOPS)</th>
                  <th className="py-2.5 px-3">Net Food (Mt)</th>
                  <th className="py-2.5 px-3">Water Stress</th>
                  <th className="py-2.5 px-3">Climate Damage</th>
                  <th className="py-2.5 px-3">Wellbeing</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/50">
                {regionsList.map((r) => {
                  const reg = currentStep.regions[r.id];
                  const isSelected = r.id === selectedRegionId;
                  if (!reg) return null;

                  return (
                    <tr
                      key={r.id}
                      onClick={() => setSelectedRegionId(r.id)}
                      className={`cursor-pointer transition-colors ${
                        isSelected ? 'bg-cyan-950/40 text-cyan-200' : 'hover:bg-slate-800/40 text-slate-300'
                      }`}
                    >
                      <td className="py-2.5 px-3 font-semibold flex items-center space-x-2">
                        <span className={`w-2 h-2 rounded-full ${isSelected ? 'bg-cyan-400' : 'bg-slate-600'}`} />
                        <span>{r.name}</span>
                      </td>
                      <td className="py-2.5 px-3">{(reg.population / 1e6).toFixed(0)}M</td>
                      <td className="py-2.5 px-3 text-emerald-400">${reg.gdp_ppp_trillion.toFixed(1)}</td>
                      <td className="py-2.5 px-3">{(reg.clean_electricity_share * 100).toFixed(0)}%</td>
                      <td className="py-2.5 px-3 text-purple-300">{reg.installed_compute_eflops.toFixed(1)}</td>
                      <td className={`py-2.5 px-3 font-semibold ${reg.net_food_trade_mt >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                        {reg.net_food_trade_mt >= 0 ? '+' : ''}{reg.net_food_trade_mt.toFixed(1)}
                      </td>
                      <td className={`py-2.5 px-3 ${reg.water_stress_index > 0.8 ? 'text-rose-400 font-semibold' : 'text-slate-300'}`}>
                        {reg.water_stress_index.toFixed(2)}
                      </td>
                      <td className="py-2.5 px-3 text-amber-400">
                        {(reg.climate_damage_fraction * 100).toFixed(1)}%
                      </td>
                      <td className="py-2.5 px-3 text-cyan-400 font-semibold">
                        {(reg.human_wellbeing_index * 100).toFixed(0)}/100
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
}

