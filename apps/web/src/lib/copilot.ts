export interface CopilotParamDiff {
  paramKey: string;
  paramLabel: string;
  currentValue: number;
  proposedValue: number;
  unit: string;
  rationale: string;
}

export interface CopilotResponse {
  summary: string;
  diffs: CopilotParamDiff[];
  source: 'RULE_BASED_DETERMINISTIC' | 'LLM_PROVIDER';
}

// Deterministic rule-based extractor
export function extractParametersFromPrompt(prompt: string, currentParams: Record<string, number> = {}): CopilotResponse {
  const p = prompt.toLowerCase();
  const diffs: CopilotParamDiff[] = [];
  const explanations: string[] = [];

  // 1. Clean Energy & Decarbonization
  if (p.includes('clean') || p.includes('solar') || p.includes('wind') || p.includes('renewable') || p.includes('decarboniz')) {
    let target = 0.90;
    const matchPct = p.match(/(\d{2})%/);
    if (matchPct && parseInt(matchPct[1], 10) > 50) {
      target = parseInt(matchPct[1], 10) / 100;
    }
    diffs.push({
      paramKey: 'clean_energy_target_2050',
      paramLabel: '2050 Clean Energy Generation Share',
      currentValue: currentParams.clean_energy_target_2050 ?? 0.85,
      proposedValue: Math.min(0.98, Math.max(0.60, target)),
      unit: '% share',
      rationale: 'Accelerate clean power grid expansion based on aggressive renewable deployment policy.',
    });
    explanations.push(`Target ${Math.round(target * 100)}% clean electricity by 2050`);
  }

  // 2. AI Compute Growth & Jevons
  if (p.includes('ai') || p.includes('compute') || p.includes('accelerator') || p.includes('datacenter')) {
    if (p.includes('slow') || p.includes('cap') || p.includes('moratorium')) {
      diffs.push({
        paramKey: 'compute_demand_growth_rate',
        paramLabel: 'AI Compute Demand Growth Rate',
        currentValue: currentParams.compute_demand_growth_rate ?? 0.35,
        proposedValue: 0.15,
        unit: '1/year',
        rationale: 'Cap annual compute cluster expansion to mitigate energy and water grid bottlenecks.',
      });
      explanations.push('Restrain AI compute expansion rate to 15%/yr');
    } else {
      let rate = 0.45;
      if (p.includes('extreme') || p.includes('exponential') || p.includes('50%')) rate = 0.50;
      diffs.push({
        paramKey: 'compute_demand_growth_rate',
        paramLabel: 'AI Compute Demand Growth Rate',
        currentValue: currentParams.compute_demand_growth_rate ?? 0.35,
        proposedValue: rate,
        unit: '1/year',
        rationale: 'Aggressive compute capacity build-out driven by next-generation frontier training runs.',
      });
      explanations.push(`Scale AI compute growth to ${Math.round(rate * 100)}%/yr`);
    }
  }

  // 3. Post-Silicon & Photonic Computing
  if (p.includes('optical') || p.includes('photonic') || p.includes('post-silicon') || p.includes('neuromorphic')) {
    diffs.push({
      paramKey: 'post_silicon_transition_year',
      paramLabel: 'Post-Silicon Architecture Transition Year',
      currentValue: currentParams.post_silicon_transition_year ?? 2038,
      proposedValue: 2032,
      unit: 'calendar year',
      rationale: 'Accelerate commercialization of optical interconnects and photonic matrix engines to 2032.',
    });
    diffs.push({
      paramKey: 'photonic_efficiency_multiplier',
      paramLabel: 'Optical Compute Efficiency Multiplier',
      currentValue: currentParams.photonic_efficiency_multiplier ?? 4.0,
      proposedValue: 8.0,
      unit: 'x boost',
      rationale: 'Optical/photonic chips yield 8x FLOP/Watt boost over conventional copper/silicon nodes.',
    });
    explanations.push('Advance optical compute deployment to 2032 with 8x energy efficiency');
  }

  // 4. Data Center PUE & Cooling
  if (p.includes('pue') || p.includes('immersion') || p.includes('cooling') || p.includes('water')) {
    diffs.push({
      paramKey: 'datacenter_pue_target',
      paramLabel: 'Advanced Data Center Target PUE',
      currentValue: currentParams.datacenter_pue_target ?? 1.12,
      proposedValue: 1.06,
      unit: 'ratio',
      rationale: 'Mandate direct-to-chip closed-loop liquid and immersion cooling for hyperscale facilities.',
    });
    diffs.push({
      paramKey: 'water_cooling_liters_per_kwh',
      paramLabel: 'Consumptive Water Cooling Intensity',
      currentValue: currentParams.water_cooling_liters_per_kwh ?? 1.8,
      proposedValue: 0.4,
      unit: 'liters/kWh',
      rationale: 'Phase out evaporative cooling towers in water-stressed hydrological basins.',
    });
    explanations.push('Mandate ultra-low 1.06 PUE and closed-loop non-evaporative cooling');
  }

  // 5. Circular Economy & E-Waste
  if (p.includes('circular') || p.includes('recycle') || p.includes('e-waste') || p.includes('hardware life')) {
    diffs.push({
      paramKey: 'circular_economy_mandate',
      paramLabel: 'Circular Economy Regulatory Mandate',
      currentValue: currentParams.circular_economy_mandate ?? 0.0,
      proposedValue: 0.85,
      unit: 'strength (0-1)',
      rationale: 'Mandatory secondary material recovery standards for cobalt, lithium, copper, and rare earths.',
    });
    diffs.push({
      paramKey: 'hardware_lifetime_years',
      paramLabel: 'Accelerator Useful Hardware Lifespan',
      currentValue: currentParams.hardware_lifetime_years ?? 3.5,
      proposedValue: 6.0,
      unit: 'years',
      rationale: 'Extend hardware turnover lifespan through secondary server refurbishment cycles.',
    });
    explanations.push('Enforce 85% circular recycling mandate and extend hardware lifespan to 6 years');
  }

  // 6. Carbon Price / Tax
  if (p.includes('carbon tax') || p.includes('carbon price') || p.includes('emissions fee')) {
    let tax = 100.0;
    const matchTax = p.match(/\$(\d+)/);
    if (matchTax) tax = parseFloat(matchTax[1]);
    diffs.push({
      paramKey: 'carbon_tax_usd_per_ton',
      paramLabel: 'Global Uniform Carbon Price',
      currentValue: currentParams.carbon_tax_usd_per_ton ?? 0.0,
      proposedValue: Math.min(300.0, Math.max(20.0, tax)),
      unit: '$/ton CO2',
      rationale: 'Enact international carbon pricing border-adjusted across all fossil fuels and grid power.',
    });
    explanations.push(`Implement $${tax}/ton carbon price`);
  }

  // 7. Food Waste & Universal Basic Services
  if (p.includes('food waste') || p.includes('agriculture') || p.includes('diet')) {
    diffs.push({
      paramKey: 'food_waste_reduction_pct',
      paramLabel: 'Food Waste Reduction Policy',
      currentValue: currentParams.food_waste_reduction_pct ?? 0.0,
      proposedValue: 0.50,
      unit: '% reduction',
      rationale: 'Cut post-harvest and consumer supply chain food losses by 50% by 2040.',
    });
    explanations.push('Reduce global food waste by 50%');
  }

  if (p.includes('universal basic services') || p.includes('ubs') || p.includes('equity') || p.includes('inequality')) {
    diffs.push({
      paramKey: 'universal_basic_services_strength',
      paramLabel: 'Universal Basic Services Strength',
      currentValue: currentParams.universal_basic_services_strength ?? 0.0,
      proposedValue: 0.80,
      unit: 'strength (0-1)',
      rationale: 'Guarantee baseline healthcare, education, clean water, and clean energy unconditionally.',
    });
    explanations.push('Implement Universal Basic Services (0.80 strength)');
  }

  // Default fallback if no specific keywords triggered
  if (diffs.length === 0) {
    diffs.push({
      paramKey: 'clean_energy_target_2050',
      paramLabel: '2050 Clean Energy Generation Share',
      currentValue: currentParams.clean_energy_target_2050 ?? 0.85,
      proposedValue: 0.95,
      unit: '% share',
      rationale: 'General sustainability transition package: accelerated clean grid deployment.',
    });
    diffs.push({
      paramKey: 'circular_economy_mandate',
      paramLabel: 'Circular Economy Regulatory Mandate',
      currentValue: currentParams.circular_economy_mandate ?? 0.0,
      proposedValue: 0.60,
      unit: 'strength (0-1)',
      rationale: 'General sustainability transition package: secondary material loops.',
    });
    explanations.push('Proposed general green transition scenario (95% clean power + circular economy)');
  }

  return {
    summary: explanations.join(' • '),
    diffs,
    source: 'RULE_BASED_DETERMINISTIC',
  };
}
