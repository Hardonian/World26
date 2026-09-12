import { describe, it, expect } from 'vitest';
import {
  loadBoundaries,
  loadParameters,
  loadHistoricalSeries,
  loadRegions,
  loadSources
} from './index.js';
import { validateData } from './validate.js';

describe('Data Package & Registry Validation', () => {
  it('loads planetary boundaries with 9 boundaries including transgressed ocean acidification', () => {
    const boundaries = loadBoundaries();
    expect(boundaries.boundaries.length).toBeGreaterThanOrEqual(9);
    const ocean = boundaries.boundaries.find(b => b.id === 'ocean_acidification');
    expect(ocean).toBeDefined();
    expect(ocean?.status).toBe('transgressed');
  });

  it('loads parameters with full provenance records', () => {
    const params = loadParameters();
    const keys = Object.keys(params);
    expect(keys.length).toBeGreaterThan(10);
    const aiCo2 = params['ai_co2_intensity_2020'];
    expect(aiCo2).toBeDefined();
    expect(aiCo2.unit).toBe('Dmnl');
    expect(aiCo2.source).toContain('Guliyeva');
  });

  it('loads historical observations 1960-2025', () => {
    const hist = loadHistoricalSeries();
    expect(hist.series.length).toBeGreaterThanOrEqual(10);
    const latest = hist.series[hist.series.length - 1];
    expect(latest.year).toBeGreaterThanOrEqual(2020);
  });

  it('loads 10 regions', () => {
    const reg = loadRegions();
    expect(reg.regions.length).toBe(10);
  });

  it('loads source registry with all 16 open source international providers', () => {
    const src = loadSources();
    expect(src.sources.length).toBe(16);
    const sourceIds = src.sources.map((s: any) => s.id);
    expect(sourceIds).toContain('noaa_gml_mauna_loa');
    expect(sourceIds).toContain('nasa_gistemp');
    expect(sourceIds).toContain('our_world_in_data');
    expect(sourceIds).toContain('ember_electricity_review');
    expect(sourceIds).toContain('usgs_mineral_commodity');
    expect(sourceIds).toContain('wri_aqueduct');
    expect(sourceIds).toContain('epoch_ai_compute');
  });

  it('queries GlobalOpenDataHub for latest planetary observations with fallback', async () => {
    const { defaultOpenDataHub } = await import('./connectors/index.js');
    const co2Obs = await defaultOpenDataHub.getLatestObservation('atmospheric_co2_ppm');
    expect(co2Obs.value).toBeGreaterThan(400);
    expect(co2Obs.unit).toBe('ppm');
    expect(co2Obs.sourceId).toBe('noaa_gml_mauna_loa');

    const tempObs = await defaultOpenDataHub.getLatestObservation('temperature_anomaly');
    expect(tempObs.value).toBeGreaterThan(1.0);
    expect(tempObs.unit).toBe('°C');

    const connectors = await defaultOpenDataHub.checkAllConnectors();
    expect(connectors.length).toBe(16);
    expect(connectors.every(c => c.status === 'ONLINE' || c.status === 'FALLBACK_CACHED')).toBe(true);
  });

  it('runs validation function without throwing', () => {
    expect(() => validateData()).not.toThrow();
  });
});

