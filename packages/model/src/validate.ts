import { ScenarioDefinitionSchema, PolicyInterventionSchema } from '@world26/schemas';
import { BUILTIN_SCENARIOS } from './scenarios.js';
import { BUILTIN_POLICIES } from './policies.js';
import { World26SimulatorTs } from './world26.js';
import { World3ModelTs } from './world3.js';
import { fileURLToPath } from 'node:url';

export function validateModel() {
  console.log('--- Validating WORLD//26 Model Lineage & Scenarios ---');

  // 1. Validate Scenarios
  console.log(`Checking ${BUILTIN_SCENARIOS.length} built-in scenarios...`);
  for (const sc of BUILTIN_SCENARIOS) {
    const parsed = ScenarioDefinitionSchema.safeParse(sc);
    if (!parsed.success) {
      console.error(`Scenario "${sc.id}" validation failed:`, parsed.error.format());
      process.exit(1);
    }
  }
  console.log(`✓ All ${BUILTIN_SCENARIOS.length} scenarios validated against ScenarioDefinitionSchema`);

  // 2. Validate Policies
  console.log(`Checking ${BUILTIN_POLICIES.length} built-in policies...`);
  for (const pol of BUILTIN_POLICIES) {
    const parsed = PolicyInterventionSchema.safeParse(pol);
    if (!parsed.success) {
      console.error(`Policy "${pol.id}" validation failed:`, parsed.error.format());
      process.exit(1);
    }
  }
  console.log(`✓ All ${BUILTIN_POLICIES.length} policies validated against PolicyInterventionSchema`);

  // 3. Test Simulation Run (World3)
  const w3 = new World3ModelTs();
  for (let t = 1900; t <= 2000; t += 0.5) {
    w3.step(0.5);
  }
  if (w3.state.population < 1e9 || isNaN(w3.state.population)) {
    console.error('World3 simulation run invariant failed');
    process.exit(1);
  }
  console.log(`✓ World3 clean-room engine run validated (1900-2000 step test passed)`);

  // 4. Test Simulation Run (World26 20-sector)
  const w26 = new World26SimulatorTs();
  for (let t = 1900; t <= 2026; t += 0.25) {
    w26.step(0.25);
  }
  if (w26.state.population < 7.0e9 || isNaN(w26.state.population)) {
    console.error('World26 simulation run invariant failed:', w26.state.population);
    process.exit(1);
  }
  console.log(`✓ WORLD//26 20-sector engine run validated (2026 Pop: ${(w26.state.population / 1e9).toFixed(2)}B, CO2: ${w26.state.atmospheric_co2_ppm.toFixed(1)} ppm)`);

  console.log('All model lineage and scenario validations PASSED cleanly.');
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  validateModel();
}
