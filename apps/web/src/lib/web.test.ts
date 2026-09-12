import { describe, it, expect } from 'vitest';
import { runWorld26Simulation } from './simulator';
import { extractParametersFromPrompt } from './copilot';
import { defaultStorageAdapter } from './storage-adapter';

import { RegionalWorld26SimulatorTs } from '@world26/model';

describe('@world26/web Integration Suite', () => {
  it('runs interactive simulation and produces valid trajectory bundles', () => {
    const res = runWorld26Simulation('baseline_2026', {
      clean_energy_target_2050: 0.90,
      carbon_tax_usd_per_ton: 50.0,
    });

    expect(res).toBeDefined();
    expect(res.series.length).toBeGreaterThan(100);
    expect(res.milestones.length).toBeGreaterThan(0);
    expect(res.boundaryValues.climate_change_co2).toBeGreaterThan(350);
    expect(res.peakPopulation.value / 1e9).toBeGreaterThan(7.0);
    expect(res.peakPopulation.value / 1e9).toBeLessThan(25.0);
  });


  it('parses natural language prompts deterministically in ScenarioCopilot', () => {
    const res1 = extractParametersFromPrompt('Accelerate solar to 95% by 2045 with circular hardware mandate');
    expect(res1.diffs.some(d => d.paramKey === 'clean_energy_target_2050' && d.proposedValue === 0.95)).toBe(true);
    expect(res1.diffs.some(d => d.paramKey === 'circular_economy_mandate')).toBe(true);

    const res2 = extractParametersFromPrompt('Post-silicon optical computing breakthrough in 2032 with 8x efficiency');
    expect(res2.diffs.some(d => d.paramKey === 'post_silicon_transition_year' && d.proposedValue === 2032)).toBe(true);
    expect(res2.diffs.some(d => d.paramKey === 'photonic_efficiency_multiplier' && d.proposedValue === 8.0)).toBe(true);

    const res3 = extractParametersFromPrompt('Enact $120/ton carbon tax and cut food waste by 50%');
    expect(res3.diffs.some(d => d.paramKey === 'carbon_tax_usd_per_ton' && d.proposedValue === 120.0)).toBe(true);
    expect(res3.diffs.some(d => d.paramKey === 'food_waste_reduction_pct' && d.proposedValue === 0.50)).toBe(true);
  });

  it('supports client-first scenario persistence and cryptographic share tokens', async () => {
    const saved = await defaultStorageAdapter.saveScenario({
      name: 'Test Future 2026',
      family: 'custom',
      description: 'Automated test custom scenario',
      parameterOverrides: { clean_energy_target_2050: 0.95 },
    });

    expect(saved.id).toBeDefined();
    expect(saved.name).toBe('Test Future 2026');

    const list = await defaultStorageAdapter.getScenarios();
    expect(list.some(s => s.id === saved.id)).toBe(true);

    const shareToken = await defaultStorageAdapter.createShareLink('scenario', saved.id);
    expect(shareToken).toBeDefined();
    expect(shareToken.startsWith('w26_')).toBe(true);

    const resolved = await defaultStorageAdapter.getSharedTarget(shareToken);
    expect(resolved).toBeDefined();
    expect(resolved?.targetId).toBe(saved.id);
  });

  it('runs regional 10-macro-region simulator coupled engine', () => {
    const regSim = new RegionalWorld26SimulatorTs();
    const step = regSim.step(0.5);
    expect(step.regions.north_america).toBeDefined();
    expect(step.regions.china_region).toBeDefined();
    expect(step.conservationMetrics.netFoodTradeBalanceMt).toBeLessThanOrEqual(0.001);
  });
});
