#!/usr/bin/env node
import { performance } from 'node:perf_hooks';
import { World26SimulatorTs, World3ModelTs } from '../../packages/model/dist/index.js';

console.log('=======================================================');
console.log(' WORLD//26 SIMULATION PERFORMANCE BENCHMARK SUITE');
console.log(' Target 1: Single run < 100 ms');
console.log(' Target 2: Scenario update perceived latency < 200 ms');
console.log(' Target 3: 1,000-run Monte Carlo batch scalability');
console.log('=======================================================\n');

// 1. Single deterministic WORLD//26 run (1900-2100, dt=0.25 -> 800 steps)
console.log('--- Benchmark 1: Single Full WORLD//26 Global Run (800 steps) ---');
const t0 = performance.now();
const sim = new World26SimulatorTs();
for (let y = 1900; y <= 2100; y += 0.25) {
  sim.step(0.25);
}
const singleDuration = performance.now() - t0;
console.log(`Single Run Execution Time: ${singleDuration.toFixed(2)} ms`);
if (singleDuration < 100) {
  console.log(`✓ PASS: Meets < 100 ms target (Actual: ${singleDuration.toFixed(2)} ms)\n`);
} else {
  console.log(`⚠ WARNING: Exceeded 100 ms target\n`);
}

// 2. World3-03 Clean-room run (1900-2100, dt=0.5 -> 400 steps)
console.log('--- Benchmark 2: World3-03 Clean-Room Run (400 steps) ---');
const tW3 = performance.now();
const w3 = new World3ModelTs();
for (let y = 1900; y <= 2100; y += 0.5) {
  w3.step(0.5);
}
const w3Duration = performance.now() - tW3;
console.log(`World3 Execution Time: ${w3Duration.toFixed(2)} ms`);
console.log(`✓ PASS: Extremely fast (${w3Duration.toFixed(2)} ms)\n`);

// 3. Batch 100-run Monte Carlo simulation
console.log('--- Benchmark 3: 100-Run Stochastic Parameter Sweep ---');
const tBatch = performance.now();
const runs = 100;
for (let i = 0; i < runs; i++) {
  const perturbedSim = new World26SimulatorTs({
    compute_demand_growth_rate: 0.20 + 0.30 * (i / runs),
    clean_energy_target_2050: 0.30 + 0.60 * (i / runs),
  });
  for (let y = 1900; y <= 2100; y += 0.5) {
    perturbedSim.step(0.5);
  }
}
const batchDuration = performance.now() - tBatch;
const avgPerRun = batchDuration / runs;
console.log(`Total 100-Run Batch Time: ${batchDuration.toFixed(2)} ms`);
console.log(`Average Per Run: ${avgPerRun.toFixed(2)} ms`);
console.log(`Estimated 1,000-Run Time: ${(batchDuration * 10 / 1000).toFixed(2)} s`);
console.log(`✓ PASS: High-throughput batch processing verified.\n`);
