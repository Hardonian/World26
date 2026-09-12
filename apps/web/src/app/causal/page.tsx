'use client';
import React, { useState } from 'react';
import { GitFork, Search, ArrowRight, ArrowLeft, Layers, ShieldCheck, Cpu } from 'lucide-react';
import { ScientificBadge } from '@/components/ScientificBadge';

export interface CausalNode {
  id: string;
  name: string;
  sector: string;
  type: 'stock' | 'flow' | 'auxiliary' | 'parameter';
  units: string;
  equation: string;
  description: string;
  currentValue: number;
  upstreamIds: string[];
  downstreamIds: string[];
  feedbackLoops?: string[];
}

const CAUSAL_NODES: CausalNode[] = [
  {
    id: 'installed_compute_eflops',
    name: 'Installed Compute Capacity',
    sector: 'AI / Computing',
    type: 'stock',
    units: 'EFLOP/s',
    equation: 'd(Compute)/dt = accelerator_deployments - accelerator_retirements',
    description: 'Active fleet of high-performance computing accelerators deployed in enterprise and hyperscale data centers.',
    currentValue: 125.0,
    upstreamIds: ['accelerator_deployments', 'accelerator_retirements', 'semiconductor_capacity'],
    downstreamIds: ['ai_electricity_demand', 'ai_water_consumption', 'ai_productivity_multiplier', 'ai_ewaste_annual'],
    feedbackLoops: ['AI Reinvestment Loop (+)', 'Energy Constraint Loop (-)', 'Mineral Bottleneck Loop (-)'],
  },
  {
    id: 'ai_electricity_demand',
    name: 'AI Electricity Consumption',
    sector: 'AI / Computing',
    type: 'auxiliary',
    units: 'TWh/year',
    equation: 'Compute * (hours_per_year * avg_power_per_eflop) * PUE',
    description: 'Annual electrical energy consumed by active AI accelerator clusters and facility cooling infrastructure.',
    currentValue: 480.0,
    upstreamIds: ['installed_compute_eflops', 'datacenter_pue'],
    downstreamIds: ['total_electricity_demand', 'fossil_energy_burn', 'clean_electricity_share'],
    feedbackLoops: ['Power Grid Competition Loop (-)'],
  },
  {
    id: 'ai_productivity_multiplier',
    name: 'AI Productivity Capability',
    sector: 'AI / Computing',
    type: 'auxiliary',
    units: 'dimensionless multiplier',
    equation: '1.0 + (Compute / C_ref)^elasticity * (1.0 - jevons_rebound)',
    description: 'Output productivity enhancement across engineering, materials science, and service capital formation.',
    currentValue: 1.08,
    upstreamIds: ['installed_compute_eflops'],
    downstreamIds: ['industrial_output', 'service_output', 'renewable_cost_learning_rate'],
    feedbackLoops: ['Capital Surplus Loop (+)'],
  },
  {
    id: 'industrial_capital',
    name: 'Industrial Capital Stock',
    sector: 'Industrial Economy',
    type: 'stock',
    units: '2020-$ USD',
    equation: 'd(IC)/dt = industrial_investment - industrial_depreciation',
    description: 'Total durable equipment, manufacturing plants, and productive machinery of the global industrial economy.',
    currentValue: 8.5e13,
    upstreamIds: ['industrial_output', 'fcaor_resource_cost', 'climate_damage_fraction'],
    downstreamIds: ['industrial_output', 'resource_extraction_rate', 'pollution_generation'],
    feedbackLoops: ['Industrial Growth Loop (+)', 'Depreciation Drain (-)'],
  },
  {
    id: 'industrial_output',
    name: 'Industrial Output per Capita',
    sector: 'Industrial Economy',
    type: 'auxiliary',
    units: '2020-$ / person-year',
    equation: '(IC / ICOR) * (1 - climate_damage) * AI_prod_mult / Population',
    description: 'Annual finished physical manufacturing goods produced per capita.',
    currentValue: 2450.0,
    upstreamIds: ['industrial_capital', 'population', 'ai_productivity_multiplier'],
    downstreamIds: ['industrial_investment', 'service_capital', 'food_production', 'emissions_rate'],
  },
  {
    id: 'population',
    name: 'Global Population',
    sector: 'Demography',
    type: 'stock',
    units: 'persons',
    equation: 'd(Pop)/dt = births - deaths',
    description: 'Aggregate global human population across age cohorts.',
    currentValue: 8.02e9,
    upstreamIds: ['births', 'deaths', 'fertility_rate', 'life_expectancy'],
    downstreamIds: ['food_demand', 'labor_force', 'total_energy_demand', 'industrial_output'],
  },
  {
    id: 'atmospheric_co2_ppm',
    name: 'Atmospheric CO2 Concentration',
    sector: 'Climate / Carbon',
    type: 'stock',
    units: 'ppm',
    equation: 'd(CO2)/dt = (emissions_fossil + emissions_land) * airborne_frac - sink_rate',
    description: 'Carbon dioxide concentration in the well-mixed troposphere.',
    currentValue: 426.5,
    upstreamIds: ['fossil_energy_burn', 'land_use_emissions', 'ocean_carbon_sink', 'land_carbon_sink'],
    downstreamIds: ['radiative_forcing', 'temperature_anomaly', 'ocean_aragonite_saturation'],
    feedbackLoops: ['Carbon Climate Feedback (+)', 'Ocean Acidification Transgression (-)'],
  },
  {
    id: 'temperature_anomaly',
    name: 'Global Mean Temperature Anomaly',
    sector: 'Climate / Carbon',
    type: 'stock',
    units: '°C above pre-industrial',
    equation: 'd(T)/dt = (F_rad - λ * T - heat_uptake) / ocean_mixed_heat_capacity',
    description: 'Global mean surface temperature warming relative to 1850-1900 baseline.',
    currentValue: 1.24,
    upstreamIds: ['atmospheric_co2_ppm', 'ocean_mixed_layer_heat'],
    downstreamIds: ['climate_damage_fraction', 'crop_yield_heat_stress', 'extinction_rate'],
    feedbackLoops: ['Thermal Inertia Delay Loop'],
  },
  {
    id: 'ocean_aragonite_saturation',
    name: 'Aragonite Saturation State (Ωarag)',
    sector: 'Ocean Acidification',
    type: 'auxiliary',
    units: 'ratio',
    equation: '3.44 - 0.0045 * (Atmospheric_CO2 - 280.0)',
    description: 'Surface seawater carbonate ion availability for marine shell and calcifying ecosystem building.',
    currentValue: 2.79,
    upstreamIds: ['atmospheric_co2_ppm'],
    downstreamIds: ['marine_biosphere_integrity', 'fisheries_yield'],
  },
  {
    id: 'copper_inventory',
    name: 'Recoverable Copper Stock',
    sector: 'Non-Renewable Resources',
    type: 'stock',
    units: 'Million Metric Tons (Mt)',
    equation: 'd(Cu)/dt = recycled_copper_recovery - primary_copper_extraction',
    description: 'High-grade economic mineral deposits required for electrical motors, grid conductors, and AI data centers.',
    currentValue: 870.0,
    upstreamIds: ['primary_copper_extraction', 'recycling_recovery_rate'],
    downstreamIds: ['mineral_scarcity_index', 'accelerator_manufacturing_cost', 'grid_capex'],
  },
];

export default function CausalGraphPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedNodeId, setSelectedNodeId] = useState<string>('installed_compute_eflops');

  const filteredNodes = CAUSAL_NODES.filter((n) => {
    const q = searchQuery.toLowerCase();
    return n.name.toLowerCase().includes(q) || n.sector.toLowerCase().includes(q) || n.id.toLowerCase().includes(q);
  });

  const selectedNode = CAUSAL_NODES.find((n) => n.id === selectedNodeId) || CAUSAL_NODES[0];

  const upstreamNodes = CAUSAL_NODES.filter((n) => selectedNode.upstreamIds.includes(n.id));
  const downstreamNodes = CAUSAL_NODES.filter((n) => selectedNode.downstreamIds.includes(n.id));

  return (
    <div className="max-w-[1600px] mx-auto p-4 sm:p-8 font-mono text-xs select-none space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between border-b border-slate-800 pb-4 gap-4">
        <div>
          <div className="inline-flex items-center space-x-2 text-cyan-400 text-xs font-bold uppercase tracking-wider mb-1">
            <GitFork className="w-4 h-4" />
            <span>Causal Network Architecture</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-100">
            System Dynamics Graph &amp; Feedback Explorer
          </h1>
          <p className="text-slate-400 text-xs mt-1 max-w-2xl leading-relaxed">
            Inspect the underlying stock-flow topology, non-linear feedback loops, and 
            differential equations coupling the 20 sectors.
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <ScientificBadge type="SIMULATED" />
          <span className="text-slate-400 text-[11px] bg-slate-900 border border-slate-800 px-2 py-1 rounded">
            Clean-Room Differential Graph
          </span>
        </div>
      </div>

      {/* Main 2-Column Explorer */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Node Index & Search (4 cols) */}
        <div className="lg:col-span-4 bg-slate-950/80 border border-slate-800 rounded-xl p-4 space-y-3">
          {/* Search bar */}
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-500" />
            <input
              type="text"
              placeholder="Search AI, fertility, food, copper, co2..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700/80 rounded-lg pl-9 pr-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-cyan-400"
            />
          </div>

          <div className="text-[11px] text-slate-400 font-bold uppercase tracking-wider flex justify-between">
            <span>Model Variables ({filteredNodes.length})</span>
            <span>Type</span>
          </div>

          <div className="space-y-1.5 overflow-y-auto max-h-[600px] pr-1">
            {filteredNodes.map((n) => {
              const isSelected = n.id === selectedNodeId;
              return (
                <button
                  key={n.id}
                  onClick={() => setSelectedNodeId(n.id)}
                  className={`w-full text-left p-2.5 rounded-lg border transition-all flex items-center justify-between ${
                    isSelected
                      ? 'bg-cyan-950/70 border-cyan-500/60 text-cyan-200 shadow-[0_0_10px_rgba(0,240,255,0.15)]'
                      : 'bg-slate-900/40 border-slate-800 text-slate-300 hover:bg-slate-900'
                  }`}
                >
                  <div>
                    <span className="font-bold text-xs block">{n.name}</span>
                    <span className="text-[10px] text-slate-500">{n.sector}</span>
                  </div>
                  <span
                    className={`text-[9px] uppercase px-1.5 py-0.5 rounded font-bold ${
                      n.type === 'stock'
                        ? 'bg-blue-950 text-blue-300 border border-blue-800'
                        : n.type === 'flow'
                        ? 'bg-amber-950 text-amber-300 border border-amber-800'
                        : 'bg-purple-950 text-purple-300 border border-purple-800'
                    }`}
                  >
                    {n.type}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Right Column: Node Details, Equations, Upstream/Downstream (8 cols) */}
        <div className="lg:col-span-8 space-y-4">
          {/* Active Node Card */}
          <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-6 space-y-4">
            <div className="flex items-start justify-between border-b border-slate-800 pb-3">
              <div>
                <div className="flex items-center space-x-2">
                  <h2 className="text-xl font-bold text-slate-100">{selectedNode.name}</h2>
                  <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-slate-900 text-cyan-400 border border-slate-700">
                    {selectedNode.type}
                  </span>
                </div>
                <span className="text-slate-500 text-xs mt-0.5 block">{selectedNode.sector}</span>
              </div>
              <div className="text-right">
                <span className="text-[10px] text-slate-500 uppercase block">2026 Value</span>
                <span className="text-lg font-bold text-cyan-300">
                  {selectedNode.currentValue.toLocaleString()} {selectedNode.units}
                </span>
              </div>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              {selectedNode.description}
            </p>

            {/* Differential Equation Block */}
            <div className="bg-slate-900/80 p-3.5 rounded-lg border border-slate-800">
              <span className="text-[10px] text-slate-500 uppercase font-bold tracking-wider block mb-1">
                Differential Equation / Mathematical Expression:
              </span>
              <code className="text-cyan-300 font-mono text-xs block overflow-x-auto py-1">
                {selectedNode.equation}
              </code>
            </div>

            {/* Feedback Loops if applicable */}
            {selectedNode.feedbackLoops && selectedNode.feedbackLoops.length > 0 && (
              <div>
                <span className="text-[10px] text-slate-500 uppercase font-bold tracking-wider block mb-1.5">
                  Participating Feedback Loops:
                </span>
                <div className="flex flex-wrap gap-2">
                  {selectedNode.feedbackLoops.map((loop, idx) => (
                    <span
                      key={idx}
                      className="px-2 py-1 rounded bg-slate-900 border border-slate-800 text-slate-300 text-[11px] flex items-center space-x-1"
                    >
                      <span>🔄</span>
                      <span>{loop}</span>
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Upstream & Downstream Linkages */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Upstream (Drivers) */}
            <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-4 space-y-2">
              <div className="flex items-center space-x-2 text-cyan-400 font-bold uppercase tracking-wider text-xs border-b border-slate-800 pb-2">
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Upstream Causal Drivers ({upstreamNodes.length})</span>
              </div>
              <div className="space-y-1.5">
                {upstreamNodes.map((u) => (
                  <button
                    key={u.id}
                    onClick={() => setSelectedNodeId(u.id)}
                    className="w-full text-left p-2 rounded border border-slate-800/80 bg-slate-900/40 hover:bg-slate-900 text-xs text-slate-200 transition-colors flex justify-between items-center"
                  >
                    <span>{u.name}</span>
                    <span className="text-[10px] text-slate-500">{u.units}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Downstream (Effects) */}
            <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-4 space-y-2">
              <div className="flex items-center space-x-2 text-emerald-400 font-bold uppercase tracking-wider text-xs border-b border-slate-800 pb-2">
                <span>Downstream Coupled Effects ({downstreamNodes.length})</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </div>
              <div className="space-y-1.5">
                {downstreamNodes.map((d) => (
                  <button
                    key={d.id}
                    onClick={() => setSelectedNodeId(d.id)}
                    className="w-full text-left p-2 rounded border border-slate-800/80 bg-slate-900/40 hover:bg-slate-900 text-xs text-slate-200 transition-colors flex justify-between items-center"
                  >
                    <span>{d.name}</span>
                    <span className="text-[10px] text-slate-500">{d.units}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
