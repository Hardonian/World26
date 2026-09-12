# WORLD//26 Scenario System

## 1. Typed Scenario Architecture

In WORLD//26, scenarios are typed data definitions rather than procedural branching or hardcoded conditional statements. Every scenario adheres to `ScenarioDefinitionSchema` (`packages/schemas/src/scenario.ts`):

```ts
export interface ScenarioDefinition {
  id: string;
  name: string;
  family: 'world3' | 'earth4all' | 'ai_computing' | 'energy' | 'social' | 'food_land' | 'compound' | 'custom';
  description: string;
  startYear: number;
  parameterOverrides: Record<string, number>;
  policyInterventions?: PolicyIntervention[];
  benchmarks?: Array<{ year: number; metric: string; expectedValue: number }>;
}
```

---

## 2. Built-in Scenario Families (16 Scenarios)

### 1. World3 Lineage
- `world3_bau`: Business as Usual reference run. Capital accumulation until non-renewable resource depletion increases extraction costs.
- `world3_ct`: Comprehensive Technology. Pollution abatement and resource recycling technologies deployed.
- `world3_sw`: Stabilized World. Family size stabilization and capital throughput limits.

### 2. Modern Planetary Baseline
- `baseline_2026`: Calibrated 1900–2026 empirical trajectory continuing current policy trends.

### 3. AI & Computing Futures
- `ai_rapid_scaling`: Unconstrained frontier AI cluster expansion (50%/yr scaling).
- `ai_frontier_boom`: Hyper-scaling AI with large productivity gains and heavy copper/power demands.
- `ai_sustainable_regulated`: Circular electronics economy, 6-year accelerator lifespan, and 80% recycling.
- `ai_efficiency_breakthrough`: 25%/yr compute energy efficiency improvements.
- `ai_jevons_rebound`: Efficiency improvements trigger rebound, accelerating net energy consumption.
- `ai_mineral_constraint`: Copper and critical mineral bottlenecks constrain hardware deployment.

### 4. Energy Transitions
- `energy_rapid_transition`: Clean electricity reaches 85% of total generation by 2045.
- `energy_fossil_persistence`: Slow renewable adoption with continued hydrocarbon reliance.

### 5. Social & Human Development
- `social_redistribution_ubs`: Universal basic services and progressive income redistribution.

### 6. Food & Land Use
- `food_regenerative_shift`: 50% food waste reduction and soil regenerative practices.

### 7. Compound / Polycrisis
- `compound_stable_prosperity`: Integrated renewable transition, circular electronics, and universal basic services.
- `compound_boundaries_return`: Coordinated policy bundle designed to return within all 9 planetary boundaries by 2100.
