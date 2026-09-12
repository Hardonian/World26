import { z } from 'zod';
import { PolicyInterventionSchema } from './policy.js';

export const ScenarioFamilySchema = z.enum([
  'world3',
  'earth4all',
  'ai_computing',
  'energy',
  'social',
  'food_land',
  'compound',
  'custom'
]);

export type ScenarioFamily = z.infer<typeof ScenarioFamilySchema>;

export const BenchmarkDataPointSchema = z.object({
  year: z.number(),
  variable: z.string(),
  value: z.number(),
  tolerancePct: z.number().default(5.0),
  source: z.string()
});

export type BenchmarkDataPoint = z.infer<typeof BenchmarkDataPointSchema>;

export const ScenarioDefinitionSchema = z.object({
  id: z.string(),
  name: z.string(),
  family: ScenarioFamilySchema,
  description: z.string(),
  baselineScenarioId: z.string().optional(),
  parameterOverrides: z.record(z.string(), z.number()).default({}),
  policies: z.array(PolicyInterventionSchema).default([]),
  tags: z.array(z.string()).default([]),
  modelVersion: z.string().default('2026.1'),
  dataVersion: z.string().default('2026.1'),
  startYear: z.number().default(1900),
  endYear: z.number().default(2100),
  timeStep: z.number().default(0.25),
  integrator: z.enum(['euler', 'heun', 'rk4']).default('rk4'),
  benchmarks: z.array(BenchmarkDataPointSchema).optional()
});

export type ScenarioDefinition = z.infer<typeof ScenarioDefinitionSchema>;
