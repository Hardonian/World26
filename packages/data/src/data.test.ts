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

  it('loads source registry', () => {
    const src = loadSources();
    expect(src.sources.length).toBeGreaterThan(5);
  });

  it('runs validation function without throwing', () => {
    expect(() => validateData()).not.toThrow();
  });
});
