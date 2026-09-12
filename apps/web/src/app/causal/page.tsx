'use client';
import React, { useState } from 'react';
import { GitFork, Search, ArrowRight, ArrowLeft, Layers, ShieldCheck, Cpu, Play, Sparkles, Filter } from 'lucide-react';
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

export interface FeedbackLoopDef {
  id: string;
  name: string;
  polarity: 'reinforcing' | 'balancing';
  description: string;
  color: string;
  pathId: string;
  nodes: string[];
}

const FEEDBACK_LOOPS: FeedbackLoopDef[] = [
  {
    id: 'all',
    name: 'All Coupled Loops',
    polarity: 'reinforcing',
    description: 'Complete systemic feedback network with coupled cybernetic loops.',
    color: '#00f0ff',
    pathId: 'all',
    nodes: [],
  },
  {
    id: 'R1',
    name: 'R1: AI Capital Reinvestment (+)',
    polarity: 'reinforcing',
    description: 'Compute capacity boosts engineering productivity, expanding industrial output and datacenter reinvestment.',
    color: '#00f0ff',
    pathId: 'loop-r1',
    nodes: ['installed_compute_eflops', 'ai_productivity_multiplier', 'industrial_capital'],
  },
  {
    id: 'B1',
    name: 'B1: Energy Grid Competition (-)',
    polarity: 'balancing',
    description: 'Hyperscale datacenter electricity demand strains grid headroom, raising marginal energy costs and curtailing compute deployment.',
    color: '#34d399',
    pathId: 'loop-b1',
    nodes: ['installed_compute_eflops', 'ai_electricity_demand', 'atmospheric_co2_ppm'],
  },
  {
    id: 'B2',
    name: 'B2: Climate Damage Feedback (-)',
    polarity: 'balancing',
    description: 'Rising fossil and grid emissions drive atmospheric warming, triggering extreme weather damages that destroy industrial capital.',
    color: '#f43f5e',
    pathId: 'loop-b2',
    nodes: ['atmospheric_co2_ppm', 'temperature_anomaly', 'industrial_capital'],
  },
  {
    id: 'B3',
    name: 'B3: Mineral Scarcity Trap (-)',
    polarity: 'balancing',
    description: 'Exponential renewable grid & AI accelerator deployment draws down recoverable copper and lithium inventories.',
    color: '#fbbf24',
    pathId: 'loop-b3',
    nodes: ['installed_compute_eflops', 'copper_inventory', 'industrial_capital'],
  },
  {
    id: 'B5',
    name: 'B5: Earth System Tipping Cascades (-)',
    polarity: 'balancing',
    description: 'Atmospheric warming above +1.5°C triggers non-linear permafrost thawing and weakens AMOC ocean circulation.',
    color: '#c084fc',
    pathId: 'loop-b5',
    nodes: ['temperature_anomaly', 'amoc_stability_index', 'permafrost_thaw_co2_gt', 'atmospheric_co2_ppm'],
  },
];

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
    feedbackLoops: ['R1: AI Capital Reinvestment (+)', 'B1: Energy Grid Competition (-)', 'B3: Mineral Scarcity Trap (-)'],
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
    feedbackLoops: ['B1: Energy Grid Competition (-)'],
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
    feedbackLoops: ['R1: AI Capital Reinvestment (+)'],
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
    upstreamIds: ['industrial_output', 'climate_damage_fraction', 'mineral_stress_index'],
    downstreamIds: ['industrial_output', 'resource_extraction_rate', 'pollution_generation'],
    feedbackLoops: ['R1: AI Capital Reinvestment (+)', 'B2: Climate Damage Feedback (-)'],
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
    equation: 'd(CO2)/dt = (emissions_fossil + emissions_land + permafrost_thaw) * airborne_frac - ocean_sink(AMOC)',
    description: 'Carbon dioxide concentration in the troposphere with AMOC ocean drawdown modulation.',
    currentValue: 426.5,
    upstreamIds: ['fossil_energy_burn', 'land_use_emissions', 'permafrost_thaw_co2_gt', 'amoc_stability_index'],
    downstreamIds: ['radiative_forcing', 'temperature_anomaly', 'ocean_aragonite_saturation'],
    feedbackLoops: ['B2: Climate Damage Feedback (-)', 'B5: Earth System Tipping Cascades (-)'],
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
    downstreamIds: ['climate_damage_fraction', 'crop_yield_heat_stress', 'amoc_stability_index', 'permafrost_thaw_co2_gt'],
    feedbackLoops: ['B2: Climate Damage Feedback (-)', 'B5: Earth System Tipping Cascades (-)'],
  },
  {
    id: 'amoc_stability_index',
    name: 'AMOC Ocean Stability Index',
    sector: 'Earth System Tipping',
    type: 'stock',
    units: 'index (0=collapse, 1=stable)',
    equation: '1.0 / (1.0 + exp(7.0 * (T / T_crit - 0.85)))',
    description: 'Atlantic Meridional Overturning Circulation stability index. Degrades ocean carbon uptake when weakened.',
    currentValue: 0.94,
    upstreamIds: ['temperature_anomaly'],
    downstreamIds: ['atmospheric_co2_ppm', 'ocean_carbon_sink'],
    feedbackLoops: ['B5: Earth System Tipping Cascades (-)'],
  },
  {
    id: 'permafrost_thaw_co2_gt',
    name: 'Permafrost Carbon Thawing Pulse',
    sector: 'Earth System Tipping',
    type: 'flow',
    units: 'Gt CO2-eq / year',
    equation: 'max(0, T - 1.5)^2 * k_release * 6.0',
    description: 'Non-linear greenhouse emissions release from circumpolar permafrost soils above +1.5°C.',
    currentValue: 0.0,
    upstreamIds: ['temperature_anomaly'],
    downstreamIds: ['atmospheric_co2_ppm'],
    feedbackLoops: ['B5: Earth System Tipping Cascades (-)'],
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
    feedbackLoops: ['B3: Mineral Scarcity Trap (-)'],
  },
];

export default function CausalGraphPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedNodeId, setSelectedNodeId] = useState<string>('installed_compute_eflops');
  const [activeLoopId, setActiveLoopId] = useState<string>('all');

  const filteredNodes = CAUSAL_NODES.filter((n) => {
    const q = searchQuery.toLowerCase();
    return n.name.toLowerCase().includes(q) || n.sector.toLowerCase().includes(q) || n.id.toLowerCase().includes(q);
  });

  const selectedNode = CAUSAL_NODES.find((n) => n.id === selectedNodeId) || CAUSAL_NODES[0];

  const upstreamNodes = CAUSAL_NODES.filter((n) => selectedNode.upstreamIds.includes(n.id));
  const downstreamNodes = CAUSAL_NODES.filter((n) => selectedNode.downstreamIds.includes(n.id));

  const activeLoop = FEEDBACK_LOOPS.find(l => l.id === activeLoopId) || FEEDBACK_LOOPS[0];

  return (
    <div className="max-w-[1720px] mx-auto p-4 sm:p-8 font-mono text-xs select-none space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between border-b border-slate-800 pb-4 gap-4">
        <div>
          <div className="inline-flex items-center space-x-2 text-cyan-400 text-xs font-bold uppercase tracking-wider mb-1">
            <GitFork className="w-4 h-4" />
            <span>Causal Network Architecture</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-100">
            System Dynamics Graph &amp; Feedback Loop Explorer
          </h1>
          <p className="text-slate-400 text-xs mt-1 max-w-2xl leading-relaxed">
            Inspect the underlying stock-flow topology, non-linear feedback loops, and 
            differential equations coupling the 20 sectors and Earth system tipping elements.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <ScientificBadge type="SIMULATED" tooltip="Coupled system dynamics ODEs integrated with RK4" />
          <ScientificBadge type="CALIBRATED" tooltip="Sector equations calibrated to empirical data" />
        </div>
      </div>

      {/* Interactive Causal Loop Animated Particle Visualizer */}
      <div className="bg-[#060910] border border-slate-800 rounded-xl p-5 space-y-4 shadow-2xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800/80 pb-3">
          <div className="flex items-center space-x-2">
            <Sparkles className="w-4 h-4 text-cyan-400" />
            <span className="font-bold text-slate-200 text-sm">Dynamic Causal Loop Network Visualizer</span>
            <span className="text-[10px] px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-800">
              Live Particle Flow
            </span>
          </div>

          {/* Feedback loop selector filter chips */}
          <div className="flex flex-wrap items-center gap-1.5">
            {FEEDBACK_LOOPS.map((loop) => {
              const isSelected = loop.id === activeLoopId;
              return (
                <button
                  key={loop.id}
                  onClick={() => setActiveLoopId(loop.id)}
                  className={`px-2.5 py-1 rounded text-[11px] font-bold transition-all ${
                    isSelected
                      ? 'bg-cyan-500 text-slate-950 shadow-[0_0_12px_rgba(0,240,255,0.4)]'
                      : 'bg-slate-900 text-slate-400 border border-slate-800 hover:text-slate-200 hover:bg-slate-850'
                  }`}
                >
                  {loop.name.split(':')[0]}
                </button>
              );
            })}
          </div>
        </div>

        <div className="text-[11px] text-slate-400 bg-slate-900/40 p-2.5 rounded-lg border border-slate-800/80 flex items-center justify-between">
          <span>{activeLoop.description}</span>
          <span className="text-cyan-300 font-bold uppercase tracking-wider shrink-0 ml-2">
            Polarity: {activeLoop.polarity}
          </span>
        </div>

        {/* SVG Dynamic Network Canvas */}
        <div className="w-full overflow-hidden bg-[#030509] rounded-lg border border-slate-900 relative">
          <svg viewBox="0 0 1000 420" className="w-full h-auto select-none font-mono">
            <defs>
              <linearGradient id="grad-r1" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#00f0ff" stopOpacity="0.8" />
                <stop offset="100%" stopColor="#38bdf8" stopOpacity="0.2" />
              </linearGradient>
              <linearGradient id="grad-b2" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#f43f5e" stopOpacity="0.8" />
                <stop offset="100%" stopColor="#fda4af" stopOpacity="0.2" />
              </linearGradient>
              <linearGradient id="grad-b5" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#c084fc" stopOpacity="0.8" />
                <stop offset="100%" stopColor="#818cf8" stopOpacity="0.2" />
              </linearGradient>

              {/* Arrow Markers */}
              <marker id="arrow-cyan" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto">
                <path d="M 0 1 L 10 5 L 0 9 z" fill="#00f0ff" />
              </marker>
              <marker id="arrow-rose" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto">
                <path d="M 0 1 L 10 5 L 0 9 z" fill="#f43f5e" />
              </marker>
              <marker id="arrow-amber" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto">
                <path d="M 0 1 L 10 5 L 0 9 z" fill="#fbbf24" />
              </marker>
              <marker id="arrow-purple" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto">
                <path d="M 0 1 L 10 5 L 0 9 z" fill="#c084fc" />
              </marker>
            </defs>

            {/* Background Grid Lines */}
            <g stroke="#0f172a" strokeWidth="1" strokeDasharray="4 4">
              <line x1="100" y1="0" x2="100" y2="420" />
              <line x1="300" y1="0" x2="300" y2="420" />
              <line x1="500" y1="0" x2="500" y2="420" />
              <line x1="700" y1="0" x2="700" y2="420" />
              <line x1="900" y1="0" x2="900" y2="420" />
            </g>

            {/* Directed Causal Edges (Paths) */}
            {/* Edge 1: Compute -> AI Productivity */}
            <path
              id="path-compute-prod"
              d="M 230 110 C 300 110, 320 110, 390 110"
              stroke="#00f0ff"
              strokeWidth="2.5"
              fill="none"
              markerEnd="url(#arrow-cyan)"
              opacity={activeLoopId === 'all' || activeLoopId === 'R1' ? 1.0 : 0.15}
            />

            {/* Edge 2: AI Productivity -> Industrial Capital */}
            <path
              id="path-prod-capital"
              d="M 450 140 C 450 200, 320 220, 230 250"
              stroke="#00f0ff"
              strokeWidth="2"
              fill="none"
              markerEnd="url(#arrow-cyan)"
              opacity={activeLoopId === 'all' || activeLoopId === 'R1' ? 1.0 : 0.15}
            />

            {/* Edge 3: Industrial Capital -> Compute (Reinvestment Loop R1) */}
            <path
              id="path-capital-compute"
              d="M 170 230 C 130 180, 130 140, 170 125"
              stroke="#00f0ff"
              strokeWidth="2"
              strokeDasharray="4 2"
              fill="none"
              markerEnd="url(#arrow-cyan)"
              opacity={activeLoopId === 'all' || activeLoopId === 'R1' ? 1.0 : 0.15}
            />

            {/* Edge 4: Compute -> AI Electricity */}
            <path
              id="path-compute-elec"
              d="M 200 135 C 200 170, 280 180, 320 190"
              stroke="#34d399"
              strokeWidth="2"
              fill="none"
              markerEnd="url(#arrow-cyan)"
              opacity={activeLoopId === 'all' || activeLoopId === 'B1' ? 1.0 : 0.15}
            />

            {/* Edge 5: Industrial Capital -> Atmospheric CO2 */}
            <path
              id="path-capital-co2"
              d="M 230 270 C 400 300, 520 280, 600 240"
              stroke="#f43f5e"
              strokeWidth="2.5"
              fill="none"
              markerEnd="url(#arrow-rose)"
              opacity={activeLoopId === 'all' || activeLoopId === 'B2' ? 1.0 : 0.15}
            />

            {/* Edge 6: Atmospheric CO2 -> Global Temperature */}
            <path
              id="path-co2-temp"
              d="M 680 220 C 720 200, 750 170, 780 130"
              stroke="#f43f5e"
              strokeWidth="3"
              fill="none"
              markerEnd="url(#arrow-rose)"
              opacity={activeLoopId === 'all' || activeLoopId === 'B2' || activeLoopId === 'B5' ? 1.0 : 0.15}
            />

            {/* Edge 7: Temperature -> Climate Damage -> Industrial Capital (B2 Balancing) */}
            <path
              id="path-temp-damage-capital"
              d="M 780 110 C 650 40, 300 40, 190 230"
              stroke="#f43f5e"
              strokeWidth="2"
              strokeDasharray="5 3"
              fill="none"
              markerEnd="url(#arrow-rose)"
              opacity={activeLoopId === 'all' || activeLoopId === 'B2' ? 1.0 : 0.15}
            />

            {/* Edge 8: Temperature -> AMOC Collapse (Tipping B5) */}
            <path
              id="path-temp-amoc"
              d="M 830 130 C 880 160, 880 240, 830 280"
              stroke="#c084fc"
              strokeWidth="2.5"
              fill="none"
              markerEnd="url(#arrow-purple)"
              opacity={activeLoopId === 'all' || activeLoopId === 'B5' ? 1.0 : 0.15}
            />

            {/* Edge 9: AMOC Collapse -> Decreased Ocean Sink -> Atmospheric CO2 (B5 Reinforcing) */}
            <path
              id="path-amoc-co2"
              d="M 770 290 C 720 310, 680 270, 660 250"
              stroke="#c084fc"
              strokeWidth="2"
              fill="none"
              markerEnd="url(#arrow-purple)"
              opacity={activeLoopId === 'all' || activeLoopId === 'B5' ? 1.0 : 0.15}
            />

            {/* Edge 10: Compute -> Copper Extraction (B3 Mineral Scarcity) */}
            <path
              id="path-compute-copper"
              d="M 180 85 C 240 40, 420 40, 500 55"
              stroke="#fbbf24"
              strokeWidth="2"
              fill="none"
              markerEnd="url(#arrow-amber)"
              opacity={activeLoopId === 'all' || activeLoopId === 'B3' ? 1.0 : 0.15}
            />

            {/* Animated Particles flowing along paths */}
            {(activeLoopId === 'all' || activeLoopId === 'R1') && (
              <>
                <circle r="4" fill="#00f0ff">
                  <animateMotion dur="2.2s" repeatCount="indefinite" path="M 230 110 C 300 110, 320 110, 390 110" />
                </circle>
                <circle r="4" fill="#00f0ff">
                  <animateMotion dur="2.8s" repeatCount="indefinite" path="M 450 140 C 450 200, 320 220, 230 250" />
                </circle>
                <circle r="4" fill="#00f0ff">
                  <animateMotion dur="2.5s" repeatCount="indefinite" path="M 170 230 C 130 180, 130 140, 170 125" />
                </circle>
              </>
            )}

            {(activeLoopId === 'all' || activeLoopId === 'B2') && (
              <>
                <circle r="4.5" fill="#f43f5e">
                  <animateMotion dur="3.0s" repeatCount="indefinite" path="M 230 270 C 400 300, 520 280, 600 240" />
                </circle>
                <circle r="4.5" fill="#f43f5e">
                  <animateMotion dur="2.4s" repeatCount="indefinite" path="M 680 220 C 720 200, 750 170, 780 130" />
                </circle>
                <circle r="4.5" fill="#f43f5e">
                  <animateMotion dur="4.2s" repeatCount="indefinite" path="M 780 110 C 650 40, 300 40, 190 230" />
                </circle>
              </>
            )}

            {(activeLoopId === 'all' || activeLoopId === 'B5') && (
              <>
                <circle r="4.5" fill="#c084fc">
                  <animateMotion dur="2.6s" repeatCount="indefinite" path="M 830 130 C 880 160, 880 240, 830 280" />
                </circle>
                <circle r="4.5" fill="#c084fc">
                  <animateMotion dur="2.4s" repeatCount="indefinite" path="M 770 290 C 720 310, 680 270, 660 250" />
                </circle>
              </>
            )}

            {/* Visual Node Elements (Clickable) */}
            {/* 1. Installed Compute Capacity */}
            <g
              onClick={() => setSelectedNodeId('installed_compute_eflops')}
              className="cursor-pointer hover:opacity-80 transition-opacity"
              transform="translate(140, 90)"
            >
              <rect width="100" height="40" rx="8" fill="#0f172a" stroke="#00f0ff" strokeWidth="1.5" />
              <text x="50" y="20" fill="#00f0ff" fontSize="10" fontWeight="bold" textAnchor="middle">Installed Compute</text>
              <text x="50" y="32" fill="#94a3b8" fontSize="8" textAnchor="middle">125 EFLOP/s</text>
            </g>

            {/* 2. AI Productivity Multiplier */}
            <g
              onClick={() => setSelectedNodeId('ai_productivity_multiplier')}
              className="cursor-pointer hover:opacity-80 transition-opacity"
              transform="translate(400, 95)"
            >
              <rect width="100" height="40" rx="8" fill="#0f172a" stroke="#38bdf8" strokeWidth="1.5" />
              <text x="50" y="20" fill="#38bdf8" fontSize="10" fontWeight="bold" textAnchor="middle">AI Productivity</text>
              <text x="50" y="32" fill="#94a3b8" fontSize="8" textAnchor="middle">&times;1.08 mult</text>
            </g>

            {/* 3. Industrial Capital */}
            <g
              onClick={() => setSelectedNodeId('industrial_capital')}
              className="cursor-pointer hover:opacity-80 transition-opacity"
              transform="translate(130, 240)"
            >
              <rect width="110" height="44" rx="8" fill="#0f172a" stroke="#3b82f6" strokeWidth="1.5" />
              <text x="55" y="22" fill="#3b82f6" fontSize="10" fontWeight="bold" textAnchor="middle">Industrial Capital</text>
              <text x="55" y="34" fill="#94a3b8" fontSize="8" textAnchor="middle">$85.0 Trillion</text>
            </g>

            {/* 4. Atmospheric CO2 */}
            <g
              onClick={() => setSelectedNodeId('atmospheric_co2_ppm')}
              className="cursor-pointer hover:opacity-80 transition-opacity"
              transform="translate(600, 210)"
            >
              <rect width="100" height="40" rx="8" fill="#0f172a" stroke="#f43f5e" strokeWidth="1.5" />
              <text x="50" y="20" fill="#f43f5e" fontSize="10" fontWeight="bold" textAnchor="middle">Atmospheric CO2</text>
              <text x="50" y="32" fill="#94a3b8" fontSize="8" textAnchor="middle">426.5 ppm</text>
            </g>

            {/* 5. Global Warming Anomaly */}
            <g
              onClick={() => setSelectedNodeId('temperature_anomaly')}
              className="cursor-pointer hover:opacity-80 transition-opacity"
              transform="translate(760, 95)"
            >
              <rect width="110" height="44" rx="8" fill="#0f172a" stroke="#fb7185" strokeWidth="2" />
              <text x="55" y="22" fill="#fb7185" fontSize="10" fontWeight="bold" textAnchor="middle">Global Warming</text>
              <text x="55" y="34" fill="#f43f5e" fontSize="8" textAnchor="middle">+1.24°C Anomaly</text>
            </g>

            {/* 6. AMOC Stability Index */}
            <g
              onClick={() => setSelectedNodeId('amoc_stability_index')}
              className="cursor-pointer hover:opacity-80 transition-opacity"
              transform="translate(760, 270)"
            >
              <rect width="110" height="44" rx="8" fill="#0f172a" stroke="#c084fc" strokeWidth="1.5" />
              <text x="55" y="22" fill="#c084fc" fontSize="10" fontWeight="bold" textAnchor="middle">AMOC Stability</text>
              <text x="55" y="34" fill="#94a3b8" fontSize="8" textAnchor="middle">0.94 (Degrading)</text>
            </g>

            {/* 7. Recoverable Copper Stock */}
            <g
              onClick={() => setSelectedNodeId('copper_inventory')}
              className="cursor-pointer hover:opacity-80 transition-opacity"
              transform="translate(500, 45)"
            >
              <rect width="100" height="40" rx="8" fill="#0f172a" stroke="#fbbf24" strokeWidth="1.5" />
              <text x="50" y="20" fill="#fbbf24" fontSize="10" fontWeight="bold" textAnchor="middle">Copper Stock</text>
              <text x="50" y="32" fill="#94a3b8" fontSize="8" textAnchor="middle">870 Mt Left</text>
            </g>
          </svg>
        </div>
      </div>

      {/* Two Column Layout: Node Selector (4 cols) & Inspector (8 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Node Selector (4 cols) */}
        <div className="lg:col-span-4 bg-slate-950/80 border border-slate-800 rounded-xl p-4 space-y-4">
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-3" />
            <input
              type="text"
              placeholder="Search variables or sectors..."
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
                <span className="text-[10px] text-slate-500 uppercase block">2026 Calibrated State</span>
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
                Differential Equation / Formal Mathematical Coupling:
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
                      className="px-2.5 py-1 rounded bg-slate-900 border border-slate-800 text-slate-300 text-[11px] flex items-center space-x-1.5"
                    >
                      <span className="text-cyan-400">🔄</span>
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
