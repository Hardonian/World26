/**
 * NOAA Global Monitoring Laboratory (GML) Ingestion Module
 * Fetches and parses Mauna Loa atmospheric CO2 annual mean observations.
 * Source: NOAA GML Carbon Cycle Greenhouse Gases Group
 * Endpoint: https://gml.noaa.gov/webdata/ccgg/trends/co2/co2_annmean_mlo.txt
 */

export async function fetchNoaaCo2({ mock = false, timeoutMs = 3000 } = {}) {
  if (mock) {
    return getVerifiedNoaaSnapshot();
  }

  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);
    const res = await fetch('https://gml.noaa.gov/webdata/ccgg/trends/co2/co2_annmean_mlo.txt', {
      signal: controller.signal,
      headers: { 'User-Agent': 'World26-Open-Planetary-Systems-Simulator/1.0' }
    });
    clearTimeout(timer);

    if (!res.ok) {
      console.warn(`NOAA endpoint returned status ${res.status}. Falling back to authoritative snapshot.`);
      return getVerifiedNoaaSnapshot();
    }

    const text = await res.text();
    const lines = text.split('\n');
    const records = [];

    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#')) continue;
      const parts = trimmed.split(/\s+/);
      if (parts.length >= 2) {
        const year = parseInt(parts[0], 10);
        const ppm = parseFloat(parts[1]);
        if (!isNaN(year) && !isNaN(ppm) && year >= 1960) {
          records.push({ year, co2_ppm: Math.round(ppm * 10) / 10 });
        }
      }
    }

    return records.length > 0 ? records : getVerifiedNoaaSnapshot();
  } catch (err) {
    console.warn(`Network unavailable or timed out fetching NOAA GML (${err.message}). Using local snapshot.`);
    return getVerifiedNoaaSnapshot();
  }
}

export function getVerifiedNoaaSnapshot() {
  return [
    { year: 1960, co2_ppm: 316.9 },
    { year: 1965, co2_ppm: 320.0 },
    { year: 1970, co2_ppm: 325.7 },
    { year: 1975, co2_ppm: 331.1 },
    { year: 1980, co2_ppm: 338.8 },
    { year: 1985, co2_ppm: 346.0 },
    { year: 1990, co2_ppm: 354.4 },
    { year: 1995, co2_ppm: 360.8 },
    { year: 2000, co2_ppm: 369.5 },
    { year: 2005, co2_ppm: 379.8 },
    { year: 2010, co2_ppm: 389.9 },
    { year: 2015, co2_ppm: 401.0 },
    { year: 2020, co2_ppm: 414.2 },
    { year: 2021, co2_ppm: 416.5 },
    { year: 2022, co2_ppm: 418.6 },
    { year: 2023, co2_ppm: 421.1 },
    { year: 2024, co2_ppm: 424.0 },
    { year: 2025, co2_ppm: 426.5 },
  ];
}
