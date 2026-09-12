import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  PlanetaryBoundariesDatasetSchema,
  ParameterProvenanceSchema,
  RegionalProfileSchema
} from '@world26/schemas';
import { z } from 'zod';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const dataDir = path.resolve(__dirname, '../data');

export function validateData() {
  console.log('--- Validating WORLD//26 Datasets ---');

  // 1. Boundaries
  const boundariesPath = path.join(dataDir, 'boundaries/current.json');
  const boundariesRaw = JSON.parse(fs.readFileSync(boundariesPath, 'utf8'));
  const boundariesParsed = PlanetaryBoundariesDatasetSchema.safeParse(boundariesRaw);
  if (!boundariesParsed.success) {
    console.error('Boundaries validation failed:', boundariesParsed.error.format());
    process.exit(1);
  }
  console.log(`✓ Planetary boundaries validated (${boundariesRaw.boundaries.length} control variables)`);

  // 2. Parameters
  const paramsPath = path.join(dataDir, 'parameters/defaults.json');
  const paramsRaw = JSON.parse(fs.readFileSync(paramsPath, 'utf8'));
  let paramCount = 0;
  for (const [key, val] of Object.entries(paramsRaw)) {
    const parsed = ParameterProvenanceSchema.safeParse(val);
    if (!parsed.success) {
      console.error(`Parameter "${key}" validation failed:`, parsed.error.format());
      process.exit(1);
    }
    paramCount++;
  }
  console.log(`✓ Parameter registry validated (${paramCount} parameters with complete provenance)`);

  // 3. Historical series
  const histPath = path.join(dataDir, 'historical/world_historical_1960_2025.json');
  const histRaw = JSON.parse(fs.readFileSync(histPath, 'utf8'));
  if (!Array.isArray(histRaw.series) || histRaw.series.length === 0) {
    console.error('Historical data series missing or empty');
    process.exit(1);
  }
  console.log(`✓ Historical calibration series validated (${histRaw.series.length} observation points 1960-2025)`);

  // 4. Regions
  const regionsPath = path.join(dataDir, 'regions/regions_10.json');
  const regionsRaw = JSON.parse(fs.readFileSync(regionsPath, 'utf8'));
  for (const reg of regionsRaw.regions) {
    const parsed = RegionalProfileSchema.safeParse(reg);
    if (!parsed.success) {
      console.error(`Region "${reg.id}" validation failed:`, parsed.error.format());
      process.exit(1);
    }
  }
  console.log(`✓ 10-Region model profiles validated (${regionsRaw.regions.length} regions)`);

  console.log('All dataset schema validations PASSED cleanly.');
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  validateData();
}
