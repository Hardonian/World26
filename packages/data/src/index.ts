import type {
  PlanetaryBoundariesDataset,
  ParameterRegistry,
  RegionalProfile
} from '@world26/schemas';
import {
  BOUNDARIES_DATA,
  PARAMETERS_DATA,
  HISTORICAL_SERIES_DATA,
  REGIONS_DATA,
  SOURCES_DATA
} from './static-data.js';

export function loadBoundaries(): PlanetaryBoundariesDataset {
  return BOUNDARIES_DATA;
}

export function loadParameters(): ParameterRegistry {
  return PARAMETERS_DATA;
}

export function loadHistoricalSeries(): { source: string; dataVersion: string; series: any[] } {
  return HISTORICAL_SERIES_DATA;
}

export function loadRegions(): { version: string; regions: RegionalProfile[] } {
  return REGIONS_DATA;
}

export function loadSources(): { version: string; lastUpdated?: string; sources: any[] } {
  return SOURCES_DATA;
}

export * from './static-data.js';
