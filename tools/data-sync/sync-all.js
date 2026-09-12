/**
 * WORLD//26 Automated Open Data Sync CLI Orchestrator
 * Usage:
 *   node tools/data-sync/sync-all.js [--mock] [--force]
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { execSync } from 'node:child_process';
import { fetchNoaaCo2 } from './sync-noaa.js';
import { fetchOwidEnergy } from './sync-owid.js';
import { fetchGistempAnomalies } from './sync-gistemp.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '../..');

const isMock = process.argv.includes('--mock') || process.env.WORLD26_OFFLINE_DATA === '1';

async function main() {
  console.log('=== WORLD//26 Open Science Data Sync Pipeline ===');
  console.log(`Execution Mode: ${isMock ? 'OFFLINE SNAPSHOT (MOCK)' : 'LIVE REMOTE HARVEST'}`);

  const historicalPath = path.join(rootDir, 'packages/data/data/historical/world_historical_1960_2025.json');
  const rawHistorical = JSON.parse(fs.readFileSync(historicalPath, 'utf8'));
  const series = rawHistorical.series;

  console.log(`\n[1/3] Fetching NOAA GML Mauna Loa CO2...`);
  const noaaData = await fetchNoaaCo2({ mock: isMock });
  console.log(`  ✓ Received ${noaaData.length} annual CO2 records from NOAA GML.`);

  console.log(`\n[2/3] Fetching Our World in Data Energy & Emissions...`);
  const owidData = await fetchOwidEnergy({ mock: isMock });
  console.log(`  ✓ Received ${owidData.length} annual energy records from OWID.`);

  console.log(`\n[3/3] Fetching NASA GISS GISTEMP v4 Surface Temperature Anomalies...`);
  const gistempData = await fetchGistempAnomalies({ mock: isMock });
  console.log(`  ✓ Received ${gistempData.length} annual temperature records from NASA GISS.`);

  // Merge into series
  let updatedCount = 0;
  for (const row of series) {
    const noaaMatch = noaaData.find(d => d.year === row.year);
    if (noaaMatch && noaaMatch.co2_ppm !== undefined) {
      row.co2_ppm = noaaMatch.co2_ppm;
      updatedCount++;
    }

    const owidMatch = owidData.find(d => d.year === row.year);
    if (owidMatch) {
      if (owidMatch.energy_ej !== undefined) row.energy_ej = owidMatch.energy_ej;
      if (owidMatch.co2_emissions_gt !== undefined) row.co2_emissions_gt = owidMatch.co2_emissions_gt;
    }

    const gistempMatch = gistempData.find(d => d.year === row.year);
    if (gistempMatch && gistempMatch.temp_anomaly !== undefined) {
      row.temp_anomaly = gistempMatch.temp_anomaly;
    }
  }

  rawHistorical.lastSynced = new Date().toISOString();
  fs.writeFileSync(historicalPath, JSON.stringify(rawHistorical, null, 2), 'utf8');
  console.log(`\n✓ Successfully synced and verified ${updatedCount} historical observation points in ${path.relative(rootDir, historicalPath)}.`);

  // Regenerate static data bundle
  console.log('\nRegenerating packages/data/src/static-data.ts...');
  execSync('node tools/gen-static-data.js', { cwd: rootDir, stdio: 'inherit' });

  console.log('\n=== All Open Science Datasets Synchronized Successfully ===\n');
}

main().catch(err => {
  console.error('Data sync failed:', err);
  process.exit(1);
});
