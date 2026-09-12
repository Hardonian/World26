# WORLD//26 Data Pipeline & Ingestion Architecture

## 1. Data Ingestion Architecture

WORLD//26 adheres to strict scientific reproducibility standards. All empirical inputs trace through an immutable, version-controlled pipeline:

```text
[Primary Open Sources (16 International Providers)]
  (UN DESA, GCP, NOAA, NASA, ECMWF, OWID, IEA, Ember, SRC, World Bank, FAO, WRI, USGS, Epoch AI, IIASA)
          │
          ▼
[GlobalOpenDataHub Connectors] (@world26/data/connectors)
          │
          ▼
[Normalized Dataset] (Typed JSON adhering to packages/schemas)
          │
          ▼
[Schema Validation] (pnpm data:validate via Zod)
          │
          ▼
[Cryptographic Checksum] (SHA-256 manifest via pnpm data:checksum)
          │
          ▼
[Zero-Cost Static Code Export] (Bundled into @world26/data/static-data.ts)
```

---

## 2. Connected Open Source Global Data Providers

The platform indexes and connects to 16 major open science data providers:

| Provider | Organization | Key Metric / Domain | License |
| :--- | :--- | :--- | :--- |
| **UN DESA WPP** | United Nations Population Division | Population (1950-2100), fertility, life expectancy | CC BY 3.0 IGO |
| **Global Carbon Project** | Future Earth / GCP | Global fossil & land-use CO2 emissions, sinks | CC BY 4.0 |
| **NOAA GML** | NOAA Earth System Research Laboratories | Mauna Loa atmospheric CO2 in-situ observations | U.S. Public Domain |
| **NASA GISTEMP** | NASA Goddard Institute for Space Studies | Global surface temperature anomalies (1880-present) | Open NASA Science Data |
| **Copernicus ERA5** | ECMWF / European Commission | Global climate reanalysis, ocean heat, sea ice | Copernicus License |
| **Our World in Data** | Global Change Data Lab / Oxford | Harmonized energy, emissions, and food series | CC BY 4.0 |
| **IEA WEO** | International Energy Agency | Global primary energy, grid mix, data center power | Non-commercial Academic |
| **Ember Electricity** | Ember Climate Analytics | Clean electricity generation, wind/solar shares | CC BY 4.0 |
| **Stockholm Resilience** | SRC / Potsdam Institute (PIK) | 9 Planetary Boundaries control variables | Open Academic |
| **World Bank WDI** | The World Bank Group | GDP (PPP), capital formation, inequality | CC BY 4.0 |
| **FAOSTAT** | UN Food & Agriculture Organization | Cereal yield, arable land, N/P fertilizer | CC BY-NC-SA 3.0 IGO |
| **WRI Aqueduct** | World Resources Institute | Baseline water stress, basin risk | CC BY 4.0 |
| **USGS Mineral Summaries** | U.S. Geological Survey | Copper, lithium, cobalt, rare earth reserves | U.S. Public Domain |
| **Epoch AI Compute** | Epoch AI / SemiAnalysis | Frontier AI compute capacity (EFLOPS), hardware fleet | CC BY 4.0 |
| **LIMITS '25 Paper** | University of Toronto (arXiv:2510.07634) | AI data center pollution & World3 integration | CC BY-NC-SA 4.0 |
| **IIASA SSP Database** | IIASA | Shared Socioeconomic Pathways (SSP1-5) | Open Research License |

---

## 3. GlobalOpenDataHub & Offline-First Resilience

The programmatic connector hub (`packages/data/src/connectors/index.ts`) allows live querying of open endpoints while maintaining complete offline resilience:

```ts
import { defaultOpenDataHub } from '@world26/data';

// Fetches latest observation (queries open API if online, falls back to immutable snapshot if offline)
const co2 = await defaultOpenDataHub.getLatestObservation('atmospheric_co2_ppm', { allowNetwork: true });
console.log(co2.value, co2.unit, co2.provenance);
// Output: 426.5 ppm "Live Open API Query" (or "Immutable Verified Offline Mirror")
```

---

## 4. Directory Layout

- `data/boundaries/`: Control variables, safe thresholds, and uncertainty zones for all nine planetary boundaries (`current.json`).
- `data/parameters/`: Default parameter registry (`defaults.json`). Every entry includes source, sourceYear, bounds, confidence, and mathematical derivation notes.
- `data/historical/`: Empirical calibration time-series (`world_historical_1960_2025.json`) spanning 1960–2025.
- `data/regions/`: 10-region macroeconomic, demographic, and trade matrix profiles (`regions_10.json`).
- `data/sources.yaml` & `data/sources.json`: Central source registry indexing all 16 empirical citations.

---

## 5. Data Integrity & Validation Commands

```bash
# Validate all datasets against typed Zod schemas
pnpm data:validate

# Inspect complete parameter provenance audit trail
pnpm data:provenance

# Verify SHA-256 cryptographic hashes of all data files
pnpm data:checksum
```
