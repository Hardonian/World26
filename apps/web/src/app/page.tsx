'use client';
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  Cpu, 
  Globe, 
  ArrowRight, 
  Play, 
  Activity, 
  Layers, 
  ShieldCheck, 
  BarChart3, 
  CheckCircle2, 
  Sparkles,
  Zap,
  TrendingDown,
  Info
} from 'lucide-react';
import { PlanetaryBoundaryWheel } from '@/components/PlanetaryBoundaryWheel';
import { ScientificBadge } from '@/components/ScientificBadge';
import { runWorld26Simulation, SimulationResultBundle } from '@/lib/simulator';

export default function LandingPage() {
  const [simResult, setSimResult] = useState<SimulationResultBundle | null>(null);

  useEffect(() => {
    // Run default 2026 baseline simulation
    const res = runWorld26Simulation('baseline_2026');
    setSimResult(res);
  }, []);

  return (
    <div className="flex flex-col min-h-screen bg-grid-pattern relative">
      {/* Top subtle radial glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[450px] bg-radial-gradient pointer-events-none" />

      {/* Hero Section */}
      <section className="relative pt-16 pb-14 px-4 max-w-[1440px] mx-auto text-center">
        <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full border border-cyan-500/30 bg-cyan-950/40 text-cyan-300 text-xs font-mono mb-6 backdrop-blur-sm">
          <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
          <span>Independent System-Dynamics Scenario Laboratory</span>
          <span className="text-slate-500">|</span>
          <span className="text-slate-400">Model 2026.1</span>
        </div>

        <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-slate-100 font-mono mb-6 max-w-4xl mx-auto leading-tight">
          Change one assumption. <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-sky-300 to-indigo-400">
            Watch the century move.
          </span>
        </h1>

        <p className="text-base sm:text-lg text-slate-400 max-w-2xl mx-auto mb-8 font-mono leading-relaxed">
          An open, quantitative planetary systems simulator spanning 1900 through 2100.
          Explore the coupled dynamics of demography, industrial capital, energy, climate, 
          planetary boundaries, and frontier AI computing.
        </p>

        {/* Primary Call to Action buttons */}
        <div className="flex flex-wrap items-center justify-center gap-3 mb-12">
          <Link
            href="/simulator"
            className="flex items-center space-x-2 px-6 py-3 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-mono font-bold text-sm shadow-[0_0_25px_rgba(0,240,255,0.4)] transition-all hover:scale-105 active:scale-95"
          >
            <Play className="w-4 h-4 fill-current" />
            <span>Run the World</span>
          </Link>
          <Link
            href="/boundaries"
            className="flex items-center space-x-2 px-5 py-3 rounded-lg bg-slate-900/90 hover:bg-slate-800 text-slate-200 border border-slate-700 font-mono font-semibold text-sm transition-all hover:border-slate-500"
          >
            <Globe className="w-4 h-4 text-emerald-400" />
            <span>Explore 9 Boundaries</span>
          </Link>
          <Link
            href="/compare"
            className="flex items-center space-x-2 px-5 py-3 rounded-lg bg-slate-900/90 hover:bg-slate-800 text-slate-200 border border-slate-700 font-mono font-semibold text-sm transition-all hover:border-slate-500"
          >
            <Layers className="w-4 h-4 text-purple-400" />
            <span>Compare Futures</span>
          </Link>
        </div>

        {/* Core honesty principle callout */}
        <div className="max-w-xl mx-auto p-2.5 rounded border border-slate-800/80 bg-slate-950/70 text-slate-400 text-xs font-mono flex items-center justify-center space-x-2">
          <Info className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
          <span>
            Models are for exploring system behaviour, not pretending to know the future.
          </span>
        </div>
      </section>

      {/* Real-time 2026 World Status & Boundary Ring */}
      <section className="py-10 px-4 max-w-[1440px] mx-auto w-full">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center bg-slate-950/60 border border-slate-800/80 rounded-2xl p-6 sm:p-8 backdrop-blur-sm">
          {/* Left: 9 Planetary Boundary Wheel */}
          <div className="lg:col-span-5 flex flex-col items-center justify-center">
            <div className="text-center mb-2 font-mono">
              <span className="text-xs text-slate-500 uppercase tracking-widest block">
                Earth System State
              </span>
              <span className="text-sm font-bold text-slate-200">
                Nine Planetary Boundaries (2026 Status)
              </span>
            </div>
            <PlanetaryBoundaryWheel
              simulatedValues={simResult?.boundaryValues}
              selectedYear={2026}
              interactive={true}
            />
            <div className="text-center text-[10px] text-slate-500 font-mono mt-2">
              7 of 9 boundaries transgressed (including 2025/2026 Ocean Acidification update)
            </div>
          </div>

          {/* Right: Key Civilization State Indicators */}
          <div className="lg:col-span-7 space-y-4 font-mono">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <span className="text-xs text-slate-500 uppercase tracking-widest block">
                  Simulated 2026 Calibration Baseline
                </span>
                <span className="text-lg font-bold text-slate-100">
                  Global System Indicators
                </span>
              </div>
              <div className="flex space-x-1.5">
                <ScientificBadge type="CALIBRATED" />
                <ScientificBadge type="OBSERVED" />
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
              <div className="p-3 rounded-lg border border-slate-800 bg-slate-900/60">
                <span className="text-slate-500 text-[10px] uppercase block">Global Population</span>
                <span className="text-xl font-bold text-sky-400 block mt-1">8.02 Billion</span>
                <span className="text-[10px] text-slate-400">UN DESA Historical Fit</span>
              </div>

              <div className="p-3 rounded-lg border border-slate-800 bg-slate-900/60">
                <span className="text-slate-500 text-[10px] uppercase block">Atmospheric CO2</span>
                <span className="text-xl font-bold text-amber-400 block mt-1">426.5 ppm</span>
                <span className="text-[10px] text-slate-400">Safe Limit: 350 ppm</span>
              </div>

              <div className="p-3 rounded-lg border border-slate-800 bg-slate-900/60">
                <span className="text-slate-500 text-[10px] uppercase block">Temperature Anomaly</span>
                <span className="text-xl font-bold text-rose-400 block mt-1">+1.24°C</span>
                <span className="text-[10px] text-slate-400">Above Pre-Industrial</span>
              </div>

              <div className="p-3 rounded-lg border border-slate-800 bg-slate-900/60">
                <span className="text-slate-500 text-[10px] uppercase block">AI Compute Fleet</span>
                <span className="text-xl font-bold text-purple-400 block mt-1">125 EFLOP/s</span>
                <span className="text-[10px] text-slate-400">Active FP16 Accelerators</span>
              </div>

              <div className="p-3 rounded-lg border border-slate-800 bg-slate-900/60">
                <span className="text-slate-500 text-[10px] uppercase block">AI Electricity Demand</span>
                <span className="text-xl font-bold text-purple-300 block mt-1">480 TWh</span>
                <span className="text-[10px] text-slate-400">1.6% of Global Power</span>
              </div>

              <div className="p-3 rounded-lg border border-slate-800 bg-slate-900/60">
                <span className="text-slate-500 text-[10px] uppercase block">Human Wellbeing</span>
                <span className="text-xl font-bold text-emerald-400 block mt-1">0.72 / 1.0</span>
                <span className="text-[10px] text-slate-400">Composite Health & Welfare</span>
              </div>
            </div>

            {/* Quick Scenario Triggers */}
            <div className="pt-3 border-t border-slate-800">
              <span className="text-xs text-slate-400 block mb-2 font-bold uppercase tracking-wider">
                Explore Archetypal Scenarios:
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                <Link
                  href="/simulator?scenario=ai_frontier_boom"
                  className="p-2.5 rounded border border-purple-800/60 bg-purple-950/30 hover:bg-purple-950/60 transition-colors flex items-center justify-between group"
                >
                  <div>
                    <span className="text-purple-300 font-bold block">Frontier AI Compute Boom</span>
                    <span className="text-[10px] text-slate-400">50%/yr scaling • Power & copper stress</span>
                  </div>
                  <ArrowRight className="w-4 h-4 text-purple-400 group-hover:translate-x-1 transition-transform" />
                </Link>

                <Link
                  href="/simulator?scenario=world3_bau"
                  className="p-2.5 rounded border border-slate-800 bg-slate-900/40 hover:bg-slate-900/80 transition-colors flex items-center justify-between group"
                >
                  <div>
                    <span className="text-slate-200 font-bold block">World3 Business as Usual</span>
                    <span className="text-[10px] text-slate-400">Resource depletion overshoot dynamics</span>
                  </div>
                  <ArrowRight className="w-4 h-4 text-slate-400 group-hover:translate-x-1 transition-transform" />
                </Link>

                <Link
                  href="/simulator?scenario=energy_rapid_transition"
                  className="p-2.5 rounded border border-cyan-800/60 bg-cyan-950/30 hover:bg-cyan-950/60 transition-colors flex items-center justify-between group"
                >
                  <div>
                    <span className="text-cyan-300 font-bold block">Rapid Renewable Transition</span>
                    <span className="text-[10px] text-slate-400">85% clean power by 2045 • Electrification</span>
                  </div>
                  <ArrowRight className="w-4 h-4 text-cyan-400 group-hover:translate-x-1 transition-transform" />
                </Link>

                <Link
                  href="/simulator?scenario=compound_stable_prosperity"
                  className="p-2.5 rounded border border-emerald-800/60 bg-emerald-950/30 hover:bg-emerald-950/60 transition-colors flex items-center justify-between group"
                >
                  <div>
                    <span className="text-emerald-300 font-bold block">Stabilized Prosperity</span>
                    <span className="text-[10px] text-slate-400">Circular economy • Universal basic services</span>
                  </div>
                  <ArrowRight className="w-4 h-4 text-emerald-400 group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Modular 20-Sector Architecture Overview */}
      <section className="py-12 px-4 max-w-[1440px] mx-auto w-full font-mono">
        <div className="text-center mb-8">
          <span className="text-xs text-cyan-400 uppercase tracking-widest block font-bold">
            Scientific System Dynamics Engine
          </span>
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-100 mt-1">
            20 Coupled Sectors • Clean-Room Differential Equations
          </h2>
          <p className="text-xs text-slate-400 max-w-xl mx-auto mt-2">
            Every sector couples state stocks and physical flows with non-linear feedback loops,
            delays, and historical empirical calibrations.
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-5 gap-3 text-xs">
          {[
            { name: '1. Demography', desc: 'Cohorts, fertility, life expectancy' },
            { name: '2. Industrial Economy', desc: 'Capital, output, reinvestment' },
            { name: '3. Human Development', desc: 'Services, education, health' },
            { name: '4. Food & Agriculture', desc: 'Arable land, fertilizer, yields' },
            { name: '5. Non-Renewable Resources', desc: 'Fossil, copper, lithium' },
            { name: '6. Energy Systems', desc: 'Renewables, nuclear, grid' },
            { name: '7. Climate / Carbon', desc: 'CO2, sinks, 2-box thermal response' },
            { name: '8. Novel Entities', desc: 'Persistent pollutants, e-waste' },
            { name: '9. Hydrology & Water', desc: 'Blue/green water consumption' },
            { name: '10. Land-System Change', desc: 'Forest cover, urban, biome health' },
            { name: '11. Biosphere Integrity', desc: 'Extinction rates, genetic loss' },
            { name: '12. Biogeochemical', desc: 'Nitrogen & phosphorus runoff' },
            { name: '13. Ocean Acidification', desc: 'Aragonite saturation state' },
            { name: '14. Atmospheric Aerosols', desc: 'Interhemispheric AOD' },
            { name: '15. Stratospheric Ozone', desc: 'Montreal Protocol recovery' },
            { name: '16. AI & Computing', desc: 'Accelerators, DC power, water' },
            { name: '17. Inequality', desc: 'Gini index, capital/labor share' },
            { name: '18. Human Wellbeing', desc: 'Composite welfare index' },
            { name: '19. Social Governance', desc: 'Stress index, institutional capacity' },
            { name: '20. Regional Trade', desc: '10-region bilateral transfer flows' },
          ].map((sec, i) => (
            <div
              key={i}
              className="p-3 rounded-lg border border-slate-800/80 bg-slate-900/40 hover:border-cyan-500/40 transition-colors"
            >
              <span className="font-bold text-slate-200 block">{sec.name}</span>
              <span className="text-[11px] text-slate-400 mt-1 block">{sec.desc}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Reproducibility & Research Lineage */}
      <section className="py-12 px-4 max-w-[1440px] mx-auto w-full font-mono border-t border-slate-800/80">
        <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-6 sm:p-8 flex flex-col md:flex-row items-center justify-between gap-6">
          <div>
            <div className="flex items-center space-x-2 text-cyan-400 text-xs font-bold uppercase tracking-wider mb-1">
              <CheckCircle2 className="w-4 h-4" />
              <span>100% Reproducible Research</span>
            </div>
            <h3 className="text-xl font-bold text-slate-100 mb-2">
              Reproduce LIMITS &apos;25 AI Research and World3 Benchmarks
            </h3>
            <p className="text-xs text-slate-400 max-w-2xl leading-relaxed">
              Verify the Guliyeva et al. (LIMITS &apos;25 / arXiv:2510.07634) computing impact 
              compatibility fixtures with one click in the browser or via CLI (<code>pnpm reproduce paper-ai-2025</code>).
              Zero black-box models.
            </p>
          </div>
          <Link
            href="/reproduce"
            className="shrink-0 px-5 py-2.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-200 text-xs font-bold transition-all hover:border-cyan-500/60"
          >
            Open Reproducibility Center
          </Link>
        </div>
      </section>
    </div>
  );
}
