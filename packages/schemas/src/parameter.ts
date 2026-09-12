import { z } from 'zod';

export const ConfidenceGradeSchema = z.enum(['high', 'medium', 'low', 'experimental']);
export type ConfidenceGrade = z.infer<typeof ConfidenceGradeSchema>;

export const ParameterProvenanceSchema = z.object({
  value: z.number(),
  unit: z.string(),
  source: z.string(),
  sourceYear: z.number(),
  lowerBound: z.number(),
  upperBound: z.number(),
  confidence: ConfidenceGradeSchema,
  transformation: z.string().default('direct'),
  notes: z.string().default(''),
  modelVersion: z.string().default('2026.1'),
  distribution: z.enum(['uniform', 'normal', 'lognormal', 'triangular']).optional(),
  stdDev: z.number().optional()
});

export type ParameterProvenance = z.infer<typeof ParameterProvenanceSchema>;

export const ParameterRegistrySchema = z.record(z.string(), ParameterProvenanceSchema);
export type ParameterRegistry = z.infer<typeof ParameterRegistrySchema>;
