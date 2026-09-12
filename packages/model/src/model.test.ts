import { describe, it, expect } from 'vitest';
import { World3ModelTs } from './world3.js';
import { World26SimulatorTs } from './world26.js';
import { computeLimits25AiTerms, LIMITS25_TABLE_8_BENCHMARKS } from './limits25.js';
import { BUILTIN_SCENARIOS } from './scenarios.js';
import { BUILTIN_POLICIES } from './policies.js';

describe('@world26/model', () => {
  it('runs World3 baseline simulation', () => {
    const w3 = new World3ModelTs();
    for (let t = 1900; t < 2050; t += 0.5) {
      w3.step(0.5);
    }
    expect(w3.state.population).toBeGreaterThan(1.6e9);
    expect(w3.state.industrial_capital).toBeGreaterThan(0);
    expect(w3.state.persistent_pollution).toBeGreaterThan(0);
  });

  it('runs WORLD//26 20-sector model to 2026', () => {
    const w26 = new World26SimulatorTs();
    for (let t = 1900; t <= 2026; t += 0.25) {
      w26.step(0.25);
    }
    const pop = w26.state.population / 1e9;
    expect(pop).toBeGreaterThan(7.0);
    expect(pop).toBeLessThan(9.0);
    expect(w26.state.atmospheric_co2_ppm).toBeGreaterThan(400);
    expect(w26.state.temperature_anomaly).toBeGreaterThan(0.8);
  });

  it('computes LIMITS 25 AI terms accurately', () => {
    const terms = computeLimits25AiTerms(2035, 1.0e12);
    expect(terms.fraction_industrial_output_ai).toBeGreaterThan(0.013);
    expect(terms.ai_output).toBeGreaterThan(0);
    expect(terms.persistent_pollution_generation_ai).toBeGreaterThan(0);
  });

  it('contains expected scenarios and policies', () => {
    expect(BUILTIN_SCENARIOS.length).toBeGreaterThanOrEqual(10);
    expect(BUILTIN_POLICIES.length).toBeGreaterThanOrEqual(4);
  });
});
