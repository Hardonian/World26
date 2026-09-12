import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

const dataDir = path.join(rootDir, 'packages/data/data');
const targetFile = path.join(rootDir, 'packages/data/src/static-data.ts');

const boundaries = JSON.parse(fs.readFileSync(path.join(dataDir, 'boundaries/current.json'), 'utf8'));
const params = JSON.parse(fs.readFileSync(path.join(dataDir, 'parameters/defaults.json'), 'utf8'));
const historical = JSON.parse(fs.readFileSync(path.join(dataDir, 'historical/world_historical_1960_2025.json'), 'utf8'));
const regions = JSON.parse(fs.readFileSync(path.join(dataDir, 'regions/regions_10.json'), 'utf8'));
const sources = JSON.parse(fs.readFileSync(path.join(dataDir, 'sources.json'), 'utf8'));

const fileContent = `import type {
  PlanetaryBoundariesDataset,
  ParameterRegistry,
  RegionalProfile
} from '@world26/schemas';

export const BOUNDARIES_DATA: PlanetaryBoundariesDataset = ${JSON.stringify(boundaries, null, 2)} as any;

export const PARAMETERS_DATA: ParameterRegistry = ${JSON.stringify(params, null, 2)} as any;

export const HISTORICAL_SERIES_DATA = ${JSON.stringify(historical, null, 2)} as any;

export const REGIONS_DATA: { version: string; regions: RegionalProfile[] } = ${JSON.stringify(regions, null, 2)} as any;

export const SOURCES_DATA: { version: string; lastUpdated?: string; sources: any[] } = ${JSON.stringify(sources, null, 2)} as any;
`;

fs.writeFileSync(targetFile, fileContent, 'utf8');
console.log('Successfully generated packages/data/src/static-data.ts');
