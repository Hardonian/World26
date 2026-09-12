import { z } from 'zod';
import { BoundaryStatusSchema } from './boundary.js';

export const RunManifestSchema = z.object({
  id: z.string(),
  scenarioId: z.string(),
  scenarioName: z.string(),
  modelVersion: z.string(),
  dataVersion: z.string(),
  integrator: z.string(),
  timeStep: z.number(),
  startYear: z.number(),
  endYear: z.number(),
  seed: z.number(),
  timestamp: z.string(),
  executionTimeMs: z.number(),
  parameterOverrides: z.record(z.string(), z.number()).default({}),
  policiesApplied: z.array(z.string()).default([]),
  engine: z.enum(['rust_wasm', 'rust_native', 'typescript_reference'])
});

export type RunManifest = z.infer<typeof RunManifestSchema>;

export const MilestoneEventSchema = z.object({
  year: z.number(),
  variable: z.string(),
  type: z.enum([
    'peak',
    'trough',
    'inflection',
    'boundary_cross_danger',
    'boundary_recover_safe',
    'resource_depletion_alert',
    'rebound_trigger'
  ]),
  title: z.string(),
  description: z.string(),
  sector: z.string(),
  severity: z.enum(['info', 'warning', 'critical'])
});

export type MilestoneEvent = z.infer<typeof MilestoneEventSchema>;

export const BoundaryStateAtYearSchema = z.object({
  year: z.number(),
  boundaries: z.record(
    z.string(),
    z.object({
      id: z.string(),
      name: z.string(),
      value: z.number(),
      unit: z.string(),
      safeLimit: z.number().nullable(),
      ratioToSafe: z.number(),
      status: BoundaryStatusSchema
    })
  )
});

export type BoundaryStateAtYear = z.infer<typeof BoundaryStateAtYearSchema>;

export const SimulationSeriesSchema = z.record(z.string(), z.array(z.number()));
export type SimulationSeries = z.infer<typeof SimulationSeriesSchema>;

export const UncertaintyBandSchema = z.object({
  p10: z.array(z.number()),
  p25: z.array(z.number()).optional(),
  p50: z.array(z.number()),
  p75: z.array(z.number()).optional(),
  p90: z.array(z.number()),
  min: z.array(z.number()),
  max: z.array(z.number())
});

export type UncertaintyBand = z.infer<typeof UncertaintyBandSchema>;

export const SimulationRunResultSchema = z.object({
  manifest: RunManifestSchema,
  time: z.array(z.number()),
  series: SimulationSeriesSchema,
  milestones: z.array(MilestoneEventSchema).default([]),
  boundaryStates: z.array(BoundaryStateAtYearSchema).default([]),
  uncertainty: z.record(z.string(), UncertaintyBandSchema).optional()
});

export type SimulationRunResult = z.infer<typeof SimulationRunResultSchema>;
