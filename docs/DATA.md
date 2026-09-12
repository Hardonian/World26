# WORLD//26 Data Pipeline & Ingestion Architecture

## 1. Data Ingestion Architecture

WORLD//26 adheres to strict scientific reproducibility standards. The simulation runtime never executes arbitrary external HTTP requests. All empirical inputs trace through an immutable pipeline:

```
[Primary Public Source] (UN, IEA, NOAA, IPCC, World Bank)
          │
          ▼
[Immutable Raw Snapshot] (Stored under data/raw/ or data/releases/)
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

## 2. Directory Layout

- `data/boundaries/`: Control variables, safe thresholds, and uncertainty zones for all nine planetary boundaries.
  - `current.json`: Current 2026 release incorporating the 2025/2026 ocean acidification assessment.
- `data/parameters/`: Default parameter registry (`defaults.json`). Every entry includes source, sourceYear, lowerBound, upperBound, confidence, and mathematical transformation notes.
- `data/historical/`: Empirical calibration time-series (`world_historical_1960_2025.json`) spanning 1960–2025.
- `data/regions/`: 10-region macroeconomic, demographic, and trade matrix profiles (`regions_10.json`).
- `data/sources.yaml` & `data/sources.json`: Central source registry indexing all empirical citations.

---

## 3. Data Integrity & Provenance Commands

```bash
# Validate all datasets against typed Zod schemas
pnpm data:validate

# Inspect complete parameter provenance audit trail
pnpm data:provenance

# Verify SHA-256 cryptographic hashes of all data files
pnpm data:checksum
```
