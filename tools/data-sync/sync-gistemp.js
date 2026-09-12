/**
 * NASA GISS Surface Temperature Analysis (GISTEMP v4) Ingestion Module
 * Source: NASA Goddard Institute for Space Studies
 * Endpoint: https://data.giss.nasa.gov/gistemp/graphs/graph_data/Global_Mean_Estimates_based_on_Land_and_Ocean_Data/graph.txt
 */

export async function fetchGistempAnomalies({ mock = false, timeoutMs = 3000 } = {}) {
  if (mock) {
    return getVerifiedGistempSnapshot();
  }

  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);
    const res = await fetch('https://data.giss.nasa.gov/gistemp/graphs/graph_data/Global_Mean_Estimates_based_on_Land_and_Ocean_Data/graph.txt', {
      signal: controller.signal,
      headers: { 'User-Agent': 'World26-Open-Planetary-Systems-Simulator/1.0' }
    });
    clearTimeout(timer);

    if (!res.ok) {
      console.warn(`NASA GISS endpoint returned ${res.status}. Using verified snapshot.`);
      return getVerifiedGistempSnapshot();
    }

    const text = await res.text();
    const lines = text.split('\n');
    const records = [];

    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('Year') || trimmed.startsWith('---')) continue;
      const parts = trimmed.split(/\s+/);
      if (parts.length >= 2) {
        const year = parseInt(parts[0], 10);
        const anomaly = parseFloat(parts[1]);
        if (!isNaN(year) && !isNaN(anomaly) && year >= 1960) {
          records.push({ year, temp_anomaly: Math.round(anomaly * 100) / 100 });
        }
      }
    }

    return records.length > 0 ? records : getVerifiedGistempSnapshot();
  } catch (err) {
    console.warn(`Network unavailable or timed out fetching NASA GISTEMP (${err.message}). Using local snapshot.`);
    return getVerifiedGistempSnapshot();
  }
}

export function getVerifiedGistempSnapshot() {
  return [
    { year: 1960, temp_anomaly: 0.03 },
    { year: 1965, temp_anomaly: -0.06 },
    { year: 1970, temp_anomaly: 0.04 },
    { year: 1975, temp_anomaly: -0.01 },
    { year: 1980, temp_anomaly: 0.26 },
    { year: 1985, temp_anomaly: 0.12 },
    { year: 1990, temp_anomaly: 0.45 },
    { year: 1995, temp_anomaly: 0.46 },
    { year: 2000, temp_anomaly: 0.40 },
    { year: 2005, temp_anomaly: 0.65 },
    { year: 2010, temp_anomaly: 0.72 },
    { year: 2015, temp_anomaly: 0.90 },
    { year: 2020, temp_anomaly: 1.02 },
    { year: 2021, temp_anomaly: 0.85 },
    { year: 2022, temp_anomaly: 0.89 },
    { year: 2023, temp_anomaly: 1.18 },
    { year: 2024, temp_anomaly: 1.30 },
    { year: 2025, temp_anomaly: 1.25 },
  ];
}
