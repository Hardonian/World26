import { SimulationRunResult } from '@world26/schemas';

export interface IamcExportOptions {
  modelName?: string;
  scenarioName?: string;
  region?: string;
  years?: number[];
}

export interface IamcRow {
  model: string;
  scenario: string;
  region: string;
  variable: string;
  unit: string;
  values: Record<number, number>;
}

export const DEFAULT_IAMC_YEARS = [
  2020, 2025, 2030, 2035, 2040, 2045, 2050,
  2055, 2060, 2065, 2070, 2075, 2080, 2085, 2090, 2095, 2100
];

/**
 * Converts a WORLD//26 simulation run into standard IPCC / IIASA IAMC format.
 * Specification: Integrated Assessment Modeling Consortium Time Series Format.
 */
export function exportToIamcRows(
  runResult: SimulationRunResult,
  options: IamcExportOptions = {}
): IamcRow[] {
  const model = options.modelName || 'WORLD//26 v1.0';
  const scenario = options.scenarioName || runResult.manifest?.scenarioName || runResult.manifest?.scenarioId || 'Baseline';
  const region = options.region || 'World';
  const targetYears = options.years || DEFAULT_IAMC_YEARS;

  const times = runResult.time || [];
  const series = runResult.series || {};

  // Helper to interpolate or lookup metric at specific year
  const getValAtYear = (metricKey: string, year: number, multiplier = 1.0): number => {
    let closestIdx = 0;
    let minDiff = Infinity;
    for (let i = 0; i < times.length; i++) {
      const diff = Math.abs(times[i] - year);
      if (diff < minDiff) {
        minDiff = diff;
        closestIdx = i;
      }
    }
    const val = series[metricKey]?.[closestIdx] ?? 0;
    return Math.round(val * multiplier * 1000) / 1000;
  };

  const variableMappings = [
    { variable: 'Population', unit: 'million', key: 'population', mult: 1e-6 },
    { variable: 'Emissions|CO2', unit: 'Mt CO2/yr', key: 'co2_emissions_gt', mult: 1000.0 },
    { variable: 'Atmospheric Concentration|CO2', unit: 'ppm', key: 'atmospheric_co2_ppm', mult: 1.0 },
    { variable: 'Temperature|Global Mean', unit: '°C above pre-industrial', key: 'temperature_anomaly', mult: 1.0 },
    { variable: 'Primary Energy', unit: 'EJ/yr', key: 'total_energy_demand_ej', mult: 1.0 },
    { variable: 'Secondary Energy|Electricity|Clean Share', unit: '%', key: 'clean_electricity_share', mult: 100.0 },
    { variable: 'Capacity|Computing|AI', unit: 'EFLOP/s', key: 'installed_compute_eflops', mult: 1.0 },
    { variable: 'Final Energy|Electricity|AI', unit: 'TWh/yr', key: 'ai_electricity_demand_twh', mult: 1.0 },
    { variable: 'Earth System|AMOC Stability', unit: 'index (1=stable)', key: 'amoc_stability_index', mult: 1.0 },
    { variable: 'Earth System|Permafrost Thaw Flux', unit: 'Gt CO2/yr', key: 'permafrost_thaw_co2_gt', mult: 1.0 },
    { variable: 'Earth System|Sea Level Rise Commitment', unit: 'm', key: 'sea_level_rise_m', mult: 1.0 },
    { variable: 'Human Wellbeing|Index', unit: 'index (0-1)', key: 'human_wellbeing_index', mult: 1.0 },
    { variable: 'Inequality|Gini', unit: 'index (0-1)', key: 'gini_coefficient', mult: 1.0 },
  ];

  return variableMappings.map(({ variable, unit, key, mult }) => {
    const values: Record<number, number> = {};
    for (const yr of targetYears) {
      values[yr] = getValAtYear(key, yr, mult);
    }
    return {
      model,
      scenario,
      region,
      variable,
      unit,
      values
    };
  });
}

/**
 * Serializes IAMC rows into standard RFC 4180 CSV string.
 */
export function exportToIamcCsv(
  runResult: SimulationRunResult,
  options: IamcExportOptions = {}
): string {
  const targetYears = options.years || DEFAULT_IAMC_YEARS;
  const rows = exportToIamcRows(runResult, options);

  const header = ['Model', 'Scenario', 'Region', 'Variable', 'Unit', ...targetYears.map(String)].join(',');
  const csvLines = [header];

  for (const row of rows) {
    const values = targetYears.map(y => row.values[y] ?? '');
    csvLines.push(
      [
        `"${row.model}"`,
        `"${row.scenario}"`,
        `"${row.region}"`,
        `"${row.variable}"`,
        `"${row.unit}"`,
        ...values
      ].join(',')
    );
  }

  return csvLines.join('\n');
}
