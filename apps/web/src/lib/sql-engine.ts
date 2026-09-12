/**
 * In-Browser Client-Side SQL Engine for WORLD//26
 * Enables arbitrary ad-hoc SQL queries over simulation outputs, historical series,
 * 10-region datasets, and planetary boundaries.
 */

import { World26SimulatorTs } from '@world26/model';
import { REGIONS_DATA, BOUNDARIES_DATA, HISTORICAL_SERIES_DATA } from '@world26/data';

export interface SqlQueryResult {
  columns: string[];
  rows: (string | number | boolean | null)[][];
  rowCount: number;
  executionTimeMs: number;
  error?: string;
}

export interface SqlPreset {
  id: string;
  name: string;
  description: string;
  sql: string;
}

export const SQL_PRESETS: SqlPreset[] = [
  {
    id: 'decadal-climate-ai',
    name: 'Decadal Climate & AI Compute Dynamics',
    description: 'Decadal trajectory of Population, CO2, Global Warming, and AI Energy demand.',
    sql: `SELECT time, population, atmospheric_co2_ppm, temperature_anomaly, installed_compute_eflops, ai_electricity_demand_twh, amoc_stability_index
FROM runs 
WHERE time >= 2020 
ORDER BY time ASC`
  },
  {
    id: 'tipping-cascades',
    name: 'Earth System Tipping Points (>1.5°C)',
    description: 'Years where warming exceeds 1.5°C, tracking AMOC breakdown and permafrost pulses.',
    sql: `SELECT time, temperature_anomaly, amoc_stability_index, permafrost_thaw_co2_gt, permafrost_cumulative_gt, amazon_forest_fraction, sea_level_rise_m 
FROM runs 
WHERE temperature_anomaly >= 1.5 
ORDER BY time ASC`
  },
  {
    id: 'boundaries-status',
    name: 'Planetary Boundaries Risk Audit',
    description: 'Current status and control variables across all 9 planetary boundaries.',
    sql: `SELECT id, name, subsystem, current_value, safe_limit, status, unit 
FROM boundaries 
ORDER BY status DESC`
  },
  {
    id: 'regional-summary',
    name: '10-Macro-Region Population & Energy Summary',
    description: 'Demographic shares, economic GDP shares, and AI compute capacity across 10 regions.',
    sql: `SELECT id, name, population_share, gdp_share, energy_share, compute_share 
FROM regions 
ORDER BY gdp_share DESC`
  },
  {
    id: 'historical-calib',
    name: 'Historical Observational Series (1960-2025)',
    description: 'Empirical observed records for population, energy, atmospheric CO2, and temperature.',
    sql: `SELECT year, population, energy_ej, co2_ppm, temp_anomaly, compute_eflops 
FROM historical 
WHERE year >= 1990 
ORDER BY year ASC`
  },
];

// Lazy-generate database tables in memory
let cachedTables: Record<string, Record<string, any>[]> | null = null;

export function getDatabaseTables(): Record<string, Record<string, any>[]> {
  if (cachedTables) return cachedTables;

  // 1. Simulate standard baseline run (1900 to 2100, dt=1.0)
  const sim = new World26SimulatorTs();
  const runs: Record<string, any>[] = [];
  while (sim.state.time <= 2100.0) {
    runs.push({
      time: Math.round(sim.state.time * 10) / 10,
      population: Math.round((sim.state.population / 1e9) * 100) / 100, // Billion
      industrial_output_per_capita: Math.round(sim.state.industrial_output_per_capita * 10) / 10,
      atmospheric_co2_ppm: Math.round(sim.state.atmospheric_co2_ppm * 10) / 10,
      temperature_anomaly: Math.round(sim.state.temperature_anomaly * 100) / 100,
      clean_electricity_share: Math.round(sim.state.clean_electricity_share * 1000) / 10, // %
      installed_compute_eflops: Math.round(sim.state.installed_compute_eflops * 10) / 10,
      ai_electricity_demand_twh: Math.round(sim.state.ai_electricity_demand_twh * 10) / 10,
      food_per_capita: Math.round(sim.state.food_per_capita * 10) / 10,
      human_wellbeing_index: Math.round(sim.state.human_wellbeing_index * 1000) / 1000,
      amoc_stability_index: Math.round(sim.state.amoc_stability_index * 1000) / 1000,
      permafrost_thaw_co2_gt: Math.round(sim.state.permafrost_thaw_co2_gt * 100) / 100,
      permafrost_cumulative_gt: Math.round(sim.state.permafrost_cumulative_gt * 10) / 10,
      amazon_forest_fraction: Math.round(sim.state.amazon_forest_fraction * 1000) / 1000,
      sea_level_rise_m: Math.round(sim.state.sea_level_rise_m * 1000) / 1000,
    });
    sim.step(1.0);
  }

  // 2. Format regions table
  const regions = (REGIONS_DATA.regions || []).map(r => ({
    id: r.id,
    name: r.name,
    population_share: Math.round(r.populationShare2020 * 1000) / 10, // %
    gdp_share: Math.round(r.gdpShare2020 * 1000) / 10, // %
    energy_share: Math.round(r.energyDemandShare2020 * 1000) / 10, // %
    co2_share: Math.round(r.co2Share2020 * 1000) / 10, // %
    compute_share: Math.round(r.computeCapacityShare2020 * 1000) / 10, // %
    water_stress: r.waterStressIndex,
  }));

  // 3. Format historical series table
  const historical = (HISTORICAL_SERIES_DATA.series || []).map((h: any) => ({
    year: h.year,
    population: h.population,
    energy_ej: h.energy_ej,
    co2_emissions_gt: h.co2_emissions_gt,
    co2_ppm: h.co2_ppm,
    temp_anomaly: h.temp_anomaly,
    compute_eflops: h.compute_eflops ?? 0,
  }));

  // 4. Format boundaries table
  const boundaries = (BOUNDARIES_DATA.boundaries || []).map(b => ({
    id: b.id,
    name: b.name,
    subsystem: b.subsystem || 'Global',
    control_variable: b.controlVariable,
    current_value: b.currentEstimate,
    safe_limit: b.safeZoneMax,
    status: b.status,
    unit: b.unit,
  }));

  cachedTables = { runs, regions, historical, boundaries };
  return cachedTables;
}

/**
 * Executes a SQL query against the in-memory planetary relational tables.
 */
export function executeSqlQuery(sql: string): SqlQueryResult {
  const startTime = performance.now();
  const tables = getDatabaseTables();

  try {
    const cleanSql = sql.trim().replace(/;$/, '');
    const selectMatch = cleanSql.match(/SELECT\s+(.*?)\s+FROM\s+([a-zA-Z0-9_]+)(?:\s+WHERE\s+(.*?))?(?:\s+ORDER\s+BY\s+(.*?))?(?:\s+LIMIT\s+(\d+))?$/i);

    if (!selectMatch) {
      throw new Error("Syntax error. Supported format: SELECT [cols|*] FROM [runs|regions|historical|boundaries] [WHERE condition] [ORDER BY col [ASC|DESC]] [LIMIT n]");
    }

    const [, rawCols, tableName, rawWhere, rawOrderBy, rawLimit] = selectMatch;
    const lowerTable = tableName.toLowerCase();

    if (!tables[lowerTable]) {
      throw new Error(`Table '${tableName}' not found. Available tables: runs, regions, historical, boundaries.`);
    }

    let records = [...tables[lowerTable]];

    // 1. Evaluate WHERE
    if (rawWhere && rawWhere.trim()) {
      const conditions = rawWhere.split(/\s+AND\s+/i);
      records = records.filter(row => {
        return conditions.every(cond => {
          const match = cond.trim().match(/^([a-zA-Z0-9_]+)\s*(=|!=|>=|<=|>|<|LIKE)\s*(.*)$/i);
          if (!match) return true;
          const [, col, op, rawVal] = match;
          const actualVal = row[col];
          const cleanVal = rawVal.replace(/^['"]|['"]$/g, '');
          const numVal = parseFloat(cleanVal);
          const compareVal = isNaN(numVal) ? cleanVal : numVal;

          if (op === '=') return actualVal == compareVal;
          if (op === '!=') return actualVal != compareVal;
          if (op === '>') return Number(actualVal) > Number(compareVal);
          if (op === '>=') return Number(actualVal) >= Number(compareVal);
          if (op === '<') return Number(actualVal) < Number(compareVal);
          if (op === '<=') return Number(actualVal) <= Number(compareVal);
          if (op.toUpperCase() === 'LIKE') return String(actualVal).toLowerCase().includes(cleanVal.toLowerCase());
          return true;
        });
      });
    }

    // 2. Evaluate ORDER BY
    if (rawOrderBy && rawOrderBy.trim()) {
      const parts = rawOrderBy.trim().split(/\s+/);
      const orderCol = parts[0];
      const isDesc = parts[1] && parts[1].toUpperCase() === 'DESC';

      records.sort((a, b) => {
        const valA = a[orderCol];
        const valB = b[orderCol];
        if (valA === valB) return 0;
        if (valA === undefined || valA === null) return 1;
        if (valB === undefined || valB === null) return -1;
        return isDesc ? (valA < valB ? 1 : -1) : (valA > valB ? 1 : -1);
      });
    }

    // 3. Evaluate LIMIT
    if (rawLimit) {
      const limit = parseInt(rawLimit, 10);
      if (!isNaN(limit)) {
        records = records.slice(0, limit);
      }
    }

    // 4. Evaluate SELECT projections
    let columns: string[] = [];
    if (rawCols.trim() === '*') {
      columns = records.length > 0 ? Object.keys(records[0]) : [];
    } else {
      columns = rawCols.split(',').map(c => c.trim()).filter(Boolean);
    }

    const rows = records.map(rec => columns.map(c => rec[c] ?? null));
    const executionTimeMs = Math.round((performance.now() - startTime) * 100) / 100;

    return {
      columns,
      rows,
      rowCount: rows.length,
      executionTimeMs,
    };
  } catch (err: any) {
    const executionTimeMs = Math.round((performance.now() - startTime) * 100) / 100;
    return {
      columns: [],
      rows: [],
      rowCount: 0,
      executionTimeMs,
      error: err.message || 'Error executing query',
    };
  }
}
