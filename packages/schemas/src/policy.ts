import { z } from 'zod';

export const PolicyParameterImpactSchema = z.object({
  parameter: z.string(),
  mode: z.enum(['set', 'multiply', 'additive_rate', 'ramp_target']),
  value: z.number()
});

export type PolicyParameterImpact = z.infer<typeof PolicyParameterImpactSchema>;

export const PolicyInterventionSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string(),
  sector: z.string(),
  startYear: z.number(),
  phaseInDuration: z.number().default(5),
  implementationStrength: z.number().min(0).max(1).default(1.0),
  capitalCostBillion: z.number().default(0),
  operatingCostBillionPerYear: z.number().default(0),
  impacts: z.array(PolicyParameterImpactSchema),
  sideEffects: z.array(z.string()).default([])
});

export type PolicyIntervention = z.infer<typeof PolicyInterventionSchema>;
