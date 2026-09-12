import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import YAML from 'yaml';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const dataDir = path.resolve(__dirname, '../data');

export function checkProvenance() {
  console.log('--- Checking Provenance Registry ---');
  const sourcesPath = path.join(dataDir, 'sources.yaml');
  const sourcesContent = fs.readFileSync(sourcesPath, 'utf8');
  const sourcesData = YAML.parse(sourcesContent);

  console.log(`Registered Primary Sources: ${sourcesData.sources.length}`);
  for (const src of sourcesData.sources) {
    console.log(`  [${src.id}] ${src.name} (${src.license}) - ${src.organization}`);
  }

  const paramsPath = path.join(dataDir, 'parameters/defaults.json');
  const paramsRaw = JSON.parse(fs.readFileSync(paramsPath, 'utf8'));

  const missingSources: string[] = [];
  for (const [key, param] of Object.entries(paramsRaw as Record<string, any>)) {
    if (!param.source || param.source.trim().length === 0) {
      missingSources.push(key);
    }
  }

  if (missingSources.length > 0) {
    console.error(`Parameters missing source provenance: ${missingSources.join(', ')}`);
    process.exit(1);
  }

  console.log('✓ 100% of parameters have explicit source citations and metadata.');
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  checkProvenance();
}
