import { z } from 'zod';

export const RegionIdSchema = z.enum([
  'global',
  'north_america',
  'latin_america',
  'western_europe',
  'eastern_europe_central_asia',
  'middle_east_north_africa',
  'sub_saharan_africa',
  'south_asia',
  'china_region',
  'southeast_rest_asia',
  'pacific_oecd'
]);

export type RegionId = z.infer<typeof RegionIdSchema>;

export const RegionalProfileSchema = z.object({
  id: RegionIdSchema,
  name: z.string(),
  populationShare2020: z.number(),
  gdpShare2020: z.number(),
  energyDemandShare2020: z.number(),
  co2Share2020: z.number(),
  computeCapacityShare2020: z.number(),
  arableLandShare2020: z.number(),
  waterStressIndex: z.number(),
  mineralProductionShares: z.record(z.string(), z.number()).default({}),
  tradeDependencyIndex: z.number().default(0.2)
});

export type RegionalProfile = z.infer<typeof RegionalProfileSchema>;
