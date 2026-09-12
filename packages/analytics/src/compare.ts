export interface ComparisonMetric {
  variable: string;
  name: string;
  unit: string;
  valA_2100: number;
  valB_2100: number;
  delta_2100: number;
  pctChange_2100: number;
  nrmse: number;
}

export function compareScenarios(
  seriesA: Record<string, number[]>,
  seriesB: Record<string, number[]>
): ComparisonMetric[] {
  const variablesToCompare = [
    { key: 'population', name: 'Population', unit: 'billions', scale: 1e9 },
    { key: 'temperature_anomaly', name: 'Temperature Anomaly', unit: '°C', scale: 1.0 },
    { key: 'atmospheric_co2_ppm', name: 'Atmospheric CO2', unit: 'ppm', scale: 1.0 },
    { key: 'installed_compute_eflops', name: 'Installed Compute', unit: 'EFLOPS', scale: 1.0 },
    { key: 'ai_electricity_demand_twh', name: 'AI Power Consumption', unit: 'TWh/yr', scale: 1.0 },
    { key: 'human_wellbeing_index', name: 'Human Wellbeing Index', unit: '0-1 index', scale: 1.0 },
    { key: 'gini_coefficient', name: 'Inequality (Gini)', unit: 'ratio', scale: 1.0 },
  ];

  const results: ComparisonMetric[] = [];

  for (const v of variablesToCompare) {
    const arrA = seriesA[v.key];
    const arrB = seriesB[v.key];
    if (!arrA || !arrB || arrA.length === 0 || arrB.length === 0) continue;

    const lastA = (arrA[arrA.length - 1] ?? 0) / v.scale;
    const lastB = (arrB[arrB.length - 1] ?? 0) / v.scale;
    const delta = lastB - lastA;
    const pctChange = lastA !== 0 ? (delta / lastA) * 100 : 0;

    // Normalized RMSE
    let sumSq = 0;
    const n = Math.min(arrA.length, arrB.length);
    let minA = Infinity;
    let maxA = -Infinity;
    for (let i = 0; i < n; i++) {
      const diff = (arrB[i] - arrA[i]) / v.scale;
      sumSq += diff * diff;
      const val = arrA[i] / v.scale;
      if (val < minA) minA = val;
      if (val > maxA) maxA = val;
    }
    const rmse = Math.sqrt(sumSq / n);
    const range = Math.max(1e-6, maxA - minA);
    const nrmse = (rmse / range) * 100;

    results.push({
      variable: v.key,
      name: v.name,
      unit: v.unit,
      valA_2100: lastA,
      valB_2100: lastB,
      delta_2100: delta,
      pctChange_2100: pctChange,
      nrmse,
    });
  }

  return results;
}
