import { World26SimulatorTs, World26ModelParameters, DEFAULT_WORLD26_PARAMETERS } from '@world26/model';

export interface TornadoItem {
  parameter: string;
  name: string;
  lowValue: number;
  highValue: number;
  targetDeltaLow: number;
  targetDeltaHigh: number;
  swingMagnitude: number;
}

export interface SensitivityAnalysisResult {
  targetMetric: string;
  evaluationYear: number;
  baselineValue: number;
  tornadoItems: TornadoItem[];
}

export function runOatSensitivityAnalysis(
  baseParams: World26ModelParameters = DEFAULT_WORLD26_PARAMETERS,
  targetMetric: 'temperature_anomaly' | 'human_wellbeing_index' | 'atmospheric_co2_ppm' = 'temperature_anomaly',
  evaluationYear = 2100
): SensitivityAnalysisResult {
  // Baseline simulation
  const simBase = new World26SimulatorTs(baseParams);
  for (let t = 1900; t <= evaluationYear; t += 0.5) {
    simBase.step(0.5);
  }
  const baselineValue = simBase.state[targetMetric];

  const parametersToTest: Array<{ key: keyof World26ModelParameters; name: string; low: number; high: number }> = [
    { key: 'climate_sensitivity_ecs', name: 'Equilibrium Climate Sensitivity', low: 2.0, high: 4.5 },
    { key: 'clean_energy_target_2050', name: '2050 Clean Electricity Target', low: 0.60, high: 0.98 },
    { key: 'compute_demand_growth_rate', name: 'AI Compute Growth Rate', low: 0.15, high: 0.45 },
    { key: 'hardware_lifetime_years', name: 'Hardware Lifetime', low: 2.5, high: 6.0 },
    { key: 'ai_productivity_elasticity', name: 'AI Productivity Dividend', low: 0.02, high: 0.16 },
    { key: 'carbon_tax_usd_per_ton', name: 'Global Carbon Fee ($/t)', low: 0.0, high: 200.0 },
    { key: 'food_waste_reduction_pct', name: 'Food Waste Reduction', low: 0.0, high: 0.50 },
    { key: 'universal_basic_services_strength', name: 'Universal Basic Services', low: 0.0, high: 0.85 },
  ];

  const tornadoItems: TornadoItem[] = [];

  for (const p of parametersToTest) {
    // Low run
    const paramsLow = { ...baseParams, [p.key]: p.low };
    const simLow = new World26SimulatorTs(paramsLow);
    for (let t = 1900; t <= evaluationYear; t += 0.5) {
      simLow.step(0.5);
    }
    const valLow = simLow.state[targetMetric];

    // High run
    const paramsHigh = { ...baseParams, [p.key]: p.high };
    const simHigh = new World26SimulatorTs(paramsHigh);
    for (let t = 1900; t <= evaluationYear; t += 0.5) {
      simHigh.step(0.5);
    }
    const valHigh = simHigh.state[targetMetric];

    const deltaLow = valLow - baselineValue;
    const deltaHigh = valHigh - baselineValue;
    const swingMagnitude = Math.abs(valHigh - valLow);

    tornadoItems.push({
      parameter: p.key as string,
      name: p.name,
      lowValue: p.low,
      highValue: p.high,
      targetDeltaLow: deltaLow,
      targetDeltaHigh: deltaHigh,
      swingMagnitude,
    });
  }

  // Sort by swing magnitude descending (Tornado chart shape)
  tornadoItems.sort((a, b) => b.swingMagnitude - a.swingMagnitude);

  return {
    targetMetric,
    evaluationYear,
    baselineValue,
    tornadoItems,
  };
}
