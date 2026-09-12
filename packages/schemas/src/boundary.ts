import { z } from 'zod';
import { ConfidenceGradeSchema } from './parameter.js';

export const BoundaryStatusSchema = z.enum([
  'safe',
  'increasing_risk',
  'high_risk',
  'transgressed'
]);
export type BoundaryStatus = z.infer<typeof BoundaryStatusSchema>;

export const PlanetaryBoundaryDefinitionSchema = z.object({
  id: z.string(),
  name: z.string(),
  subsystem: z.string().optional(),
  controlVariable: z.string(),
  unit: z.string(),
  preIndustrialValue: z.number().optional(),
  safeZoneMin: z.number().nullable(),
  safeZoneMax: z.number().nullable(),
  uncertaintyMin: z.number().nullable(),
  uncertaintyMax: z.number().nullable(),
  currentEstimate: z.number(),
  status: BoundaryStatusSchema,
  confidenceGrade: ConfidenceGradeSchema,
  source: z.string(),
  sourceDate: z.string(),
  normalizationMethod: z.string(),
  simulationMapping: z.string(),
  description: z.string()
});

export type PlanetaryBoundaryDefinition = z.infer<typeof PlanetaryBoundaryDefinitionSchema>;

export const PlanetaryBoundariesDatasetSchema = z.object({
  version: z.string(),
  releaseDate: z.string(),
  assessmentNotes: z.string(),
  boundaries: z.array(PlanetaryBoundaryDefinitionSchema)
});

export type PlanetaryBoundariesDataset = z.infer<typeof PlanetaryBoundariesDatasetSchema>;
