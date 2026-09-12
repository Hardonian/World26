import { describe, it, expect } from 'vitest';
import {
  ParameterProvenanceSchema,
  PlanetaryBoundaryDefinitionSchema,
  PolicyInterventionSchema,
  ScenarioDefinitionSchema,
  SimulationRunResultSchema
} from './index.js';

describe('@world26/schemas', () => {
  it('validates a parameter provenance object', () => {
    const param = {
      value: 0.15,
      unit: 'Dmnl',
      source: 'IEA / Ember 2020',
      sourceYear: 2020,
      lowerBound: 0.05,
      upperBound: 0.30,
      confidence: 'medium',
      transformation: 'direct',
      notes: 'Direct operational CO2 emitted per 2020-$ of AI output',
      modelVersion: '2026.1'
    };
    const parsed = ParameterProvenanceSchema.safeParse(param);
    expect(parsed.success).toBe(true);
  });

  it('validates a planetary boundary definition', () => {
    const boundary = {
      id: 'climate_co2',
      name: 'Climate Change (Atmospheric CO2)',
      controlVariable: 'Atmospheric CO2 concentration',
      unit: 'ppm',
      preIndustrialValue: 280,
      safeZoneMin: 0,
      safeZoneMax: 350,
      uncertaintyMin: 350,
      uncertaintyMax: 450,
      currentEstimate: 426.9,
      status: 'transgressed',
      confidenceGrade: 'high',
      source: 'NOAA GML / Mauna Loa 2026',
      sourceDate: '2026-01',
      normalizationMethod: 'ratio_to_safe_threshold',
      simulationMapping: 'climate.atmospheric_co2_ppm',
      description: 'Radiative forcing and climate destabilization driven by GHG accumulation.'
    };
    const parsed = PlanetaryBoundaryDefinitionSchema.safeParse(boundary);
    expect(parsed.success).toBe(true);
  });

  it('validates policy intervention', () => {
    const policy = {
      id: 'renewables_80_2045',
      name: 'Accelerated Clean Energy Mandate',
      description: 'Transition global electric grid to 80% renewables by 2045',
      sector: 'energy',
      startYear: 2026,
      phaseInDuration: 19,
      implementationStrength: 1.0,
      capitalCostBillion: 12000,
      operatingCostBillionPerYear: 250,
      impacts: [
        {
          parameter: 'renewable_capital_share_target',
          mode: 'ramp_target',
          value: 0.80
        }
      ],
      sideEffects: ['Increased mineral demand for copper, lithium, and rare earths']
    };
    const parsed = PolicyInterventionSchema.safeParse(policy);
    expect(parsed.success).toBe(true);
  });
});
