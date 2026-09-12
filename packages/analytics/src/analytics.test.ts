import { describe, it, expect } from 'vitest';
import { detectInflections, attributeInflection } from './causal.js';
import { detectMilestones } from './milestones.js';
import { runOatSensitivityAnalysis } from './sensitivity.js';
import { compareScenarios } from './compare.js';
import { exportToIamcCsv, exportToIamcRows } from './iamc.js';

describe('@world26/analytics', () => {
  it('detects peaks and troughs in time series', () => {
    const times = [2000, 2010, 2020, 2030, 2040, 2050, 2060];
    const values = [10, 25, 50, 80, 70, 60, 40]; // peak at 2030 (value 80)
    const inflections = detectInflections('test_var', times, values);
    expect(inflections.length).toBe(1);
    expect(inflections[0].type).toBe('peak');
    expect(inflections[0].year).toBe(2030);
    expect(inflections[0].value).toBe(80);
  });

  it('attributes causal drivers deterministically', () => {
    const times = [2020, 2025, 2030, 2035, 2040];
    const seriesMap = {
      climate_damage_fraction: [0.01, 0.02, 0.04, 0.07, 0.10],
      mineral_stress_index: [0.1, 0.2, 0.35, 0.6, 0.8],
      ai_electricity_share_pct: [1.0, 3.0, 8.0, 15.0, 22.0],
      ai_productivity_index: [1.0, 1.05, 1.10, 1.15, 1.20],
    };
    const expl = attributeInflection('industrial_output_per_capita', 2035, times, seriesMap);
    expect(expl.drivers.length).toBeGreaterThanOrEqual(3);
    expect(expl.drivers[0].contributionPct).toBeGreaterThan(0);
    expect(expl.summary).toContain('industrial_output_per_capita');
  });

  it('detects boundary crossing milestones', () => {
    const times = [1980, 1990, 2000, 2010];
    const series = {
      atmospheric_co2_ppm: [338, 354, 370, 390], // crosses 350 between 1980 and 1990
    };
    const milestones = detectMilestones(times, series);
    expect(milestones.some((m) => m.variable === 'atmospheric_co2_ppm')).toBe(true);
  });

  it('runs OAT sensitivity analysis and generates tornado chart data', () => {
    const sens = runOatSensitivityAnalysis(undefined, 'temperature_anomaly', 2050);
    expect(sens.tornadoItems.length).toBeGreaterThan(3);
    // Tornado items must be sorted descending by swing magnitude
    for (let i = 0; i < sens.tornadoItems.length - 1; i++) {
      expect(sens.tornadoItems[i].swingMagnitude).toBeGreaterThanOrEqual(
        sens.tornadoItems[i + 1].swingMagnitude
      );
    }
  });

  it('computes scenario comparison metrics and NRMSE', () => {
    const seriesA = {
      population: [1.6e9, 4e9, 8e9],
      temperature_anomaly: [0.0, 0.5, 1.2],
    };
    const seriesB = {
      population: [1.6e9, 4e9, 8.5e9],
      temperature_anomaly: [0.0, 0.6, 1.8],
    };
    const comps = compareScenarios(seriesA, seriesB);
    expect(comps.length).toBe(2);
    expect(comps.find((c) => c.variable === 'temperature_anomaly')?.delta_2100).toBeCloseTo(0.6);
  });

  it('formats simulation run results into standard IPCC/IIASA IAMC format', () => {
    const mockRun: any = {
      manifest: {
        scenarioId: 'test_scenario',
        scenarioName: 'Test Scenario'
      },
      time: [2020, 2050, 2100],
      series: {
        population: [7.8e9, 9.5e9, 8.8e9],
        co2_emissions_gt: [35.0, 20.0, 5.0],
        temperature_anomaly: [1.1, 1.6, 1.9]
      }
    };

    const csv = exportToIamcCsv(mockRun, { years: [2020, 2050, 2100] });
    expect(csv).toContain('Model,Scenario,Region,Variable,Unit,2020,2050,2100');
    expect(csv).toContain('"Population","million",7800,9500,8800');
    expect(csv).toContain('"Temperature|Global Mean"');
  });
});
