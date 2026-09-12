import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const dataDir = path.resolve(__dirname, '../data');

export function computeChecksums() {
  console.log('--- Generating Dataset Checksums (SHA-256) ---');
  const files = [
    'VERSION',
    'sources.yaml',
    'boundaries/current.json',
    'parameters/defaults.json',
    'historical/world_historical_1960_2025.json',
    'regions/regions_10.json'
  ];

  const checksums: Record<string, string> = {};

  for (const rel of files) {
    const filePath = path.join(dataDir, rel);
    if (fs.existsSync(filePath)) {
      const buffer = fs.readFileSync(filePath);
      const hash = crypto.createHash('sha256').update(buffer).digest('hex');
      checksums[rel] = hash;
      console.log(`  ${rel}: ${hash.slice(0, 16)}...`);
    } else {
      console.warn(`  Missing file: ${rel}`);
    }
  }

  const outPath = path.join(dataDir, 'checksums.json');
  fs.writeFileSync(outPath, JSON.stringify(checksums, null, 2), 'utf8');
  console.log(`✓ Wrote checksums to ${outPath}`);
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  computeChecksums();
}
