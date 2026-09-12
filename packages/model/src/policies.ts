import { PolicyIntervention } from '@world26/schemas';
import { World26ModelParameters } from './types.js';

export const BUILTIN_POLICIES: PolicyIntervention[] = [
  {
    id: 'clean_energy_mandate_85_2045',
    name: '85% Clean Electricity by 2045',
    description: 'Aggressive procurement and grid mandate requiring 85% of generation from renewables, storage, and advanced nuclear by 2045.',
    sector: 'energy',
    startYear: 2026,
    phaseInDuration: 19,
    implementationStrength: 1.0,
    capitalCostBillion: 8500,
    operatingCostBillionPerYear: 120,
    impacts: [
      { parameter: 'clean_energy_target_2050', mode: 'ramp_target', value: 0.90 },
      { parameter: 'clean_energy_phase_in_start', mode: 'set', value: 2026.0 },
    ],
    sideEffects: [
      'Increases immediate copper and lithium mining throughput',
      'Accelerates grid decarbonization and lowers industrial pollution',
    ],
  },
  {
    id: 'carbon_tax_150',
    name: 'Global Carbon Fee & Dividend ($150/t)',
    description: 'Direct levy of $150 per metric ton on fossil fuel extraction and industrial GHG releases, rebated equally to citizens.',
    sector: 'climate',
    startYear: 2027,
    phaseInDuration: 8,
    implementationStrength: 1.0,
    capitalCostBillion: 50,
    operatingCostBillionPerYear: 10,
    impacts: [
      { parameter: 'carbon_tax_usd_per_ton', mode: 'set', value: 150.0 },
      { parameter: 'universal_basic_services_strength', mode: 'additive_rate', value: 0.25 },
    ],
    sideEffects: [
      'Discourages high-carbon compute hosting',
      'Reduces income inequality through citizen dividends',
    ],
  },
  {
    id: 'ai_circularity_mandate',
    name: 'AI Hardware Lifetime & 80% Closed-Loop Recycling',
    description: 'Bans planned hardware obsolescence, mandates minimum 5-year server service lifetimes, and requires 80% rare mineral recovery.',
    sector: 'ai_computing',
    startYear: 2026,
    phaseInDuration: 6,
    implementationStrength: 1.0,
    capitalCostBillion: 450,
    operatingCostBillionPerYear: 35,
    impacts: [
      { parameter: 'hardware_lifetime_years', mode: 'set', value: 5.5 },
      { parameter: 'circular_economy_mandate', mode: 'set', value: 0.80 },
      { parameter: 'water_cooling_liters_per_kwh', mode: 'multiply', value: 0.5 },
    ],
    sideEffects: [
      'Cuts annual electronic toxic waste by 65%',
      'Lowers primary copper and rare earth extraction pressure',
    ],
  },
  {
    id: 'food_waste_halving',
    name: 'Halve Global Food Supply Waste by 2035',
    description: 'Cold-chain storage infrastructure, retail redistribution, and post-harvest preservation investments.',
    sector: 'food_land',
    startYear: 2026,
    phaseInDuration: 9,
    implementationStrength: 1.0,
    capitalCostBillion: 650,
    operatingCostBillionPerYear: 40,
    impacts: [
      { parameter: 'food_waste_reduction_pct', mode: 'set', value: 0.50 },
    ],
    sideEffects: [
      'Relieves agricultural land expansion pressure',
      'Reduces chemical fertilizer run-off into freshwater basins',
    ],
  },
  {
    id: 'universal_basic_services',
    name: 'Universal Basic Services & Healthcare',
    description: 'Guaranteed access to high-quality public healthcare, clean water, secondary education, and essential digital infrastructure.',
    sector: 'social',
    startYear: 2026,
    phaseInDuration: 10,
    implementationStrength: 1.0,
    capitalCostBillion: 3200,
    operatingCostBillionPerYear: 450,
    impacts: [
      { parameter: 'universal_basic_services_strength', mode: 'set', value: 0.85 },
    ],
    sideEffects: [
      'Lowers Gini inequality coefficient',
      'Improves life expectancy and accelerates voluntary demographic stabilization',
    ],
  },
];

export function applyPoliciesToParameters(
  baseParams: World26ModelParameters,
  policies: PolicyIntervention[]
): World26ModelParameters {
  const result = { ...baseParams };

  for (const pol of policies) {
    for (const impact of pol.impacts) {
      const current = result[impact.parameter] ?? 0;
      switch (impact.mode) {
        case 'set':
        case 'ramp_target':
          result[impact.parameter] = impact.value;
          break;
        case 'multiply':
          result[impact.parameter] = current * impact.value;
          break;
        case 'additive_rate':
          result[impact.parameter] = current + impact.value;
          break;
      }
    }
  }

  return result;
}
