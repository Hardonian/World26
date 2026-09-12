# Third-Party Dependencies and Model Lineage Review

WORLD//26 is an independent, clean-room quantitative system dynamics platform.
This document details third-party intellectual lineages, scientific publications, datasets, and code licenses.

## Scientific Publication References (Clean-Room Mathematical Models)

| Research / Model | Citation / Reference | License / Access | Treatment in WORLD//26 |
| :--- | :--- | :--- | :--- |
| **LIMITS '25 AI Impact Paper** | Guliyeva, Bhardwaj, Becker (LIMITS '25 / arXiv:2510.07634) | CC BY-NC-SA 4.0 | Clean-room mathematical implementation of published differential equations and parameters. Validated against Table 8 benchmarks. No source code copied. |
| **World3-03 / Limits to Growth** | Meadows et al. (1972, 1974, 2004) *Dynamics of Growth in a Finite World*, *Limits to Growth: The 30-Year Update* | Published scientific book/papers | Clean-room mathematical formulation of stock-flow-delay differential equations. Independent Rust and TypeScript implementations. |
| **Earth4All** | Dixie et al., Randers et al. (2022) *Earth for All: A Survival Guide for Humanity* | Published scientific book/papers | Clean-room structural adaptation of 10-region feedback concepts and social tension proxies. |
| **Planetary Boundaries** | Rockström et al. (2009), Steffen et al. (2015), Richardson et al. (2023) | Published scientific papers (Open Access) | Control variables, safe zones, and 2026 current status indicators encoded in versioned JSON schema. |

## Data Sources & Provenance

1. **UN World Population Prospects (UN DESA)**:
   - Population cohorts, fertility, mortality rates.
   - License: Open Data (CC BY 3.0 IGO).
2. **Global Carbon Project (GCP) & IPCC AR6**:
   - Historical CO2 emissions, atmospheric concentrations, radiative forcing.
   - License: Open Data / CC BY 4.0.
3. **Ember / IEA Global Energy Statistics**:
   - Electricity generation by source, energy intensity, grid emission factors.
   - License: Creative Commons Attribution 4.0 International.
4. **Stockholm Resilience Centre / Potsdam Institute**:
   - Planetary boundaries safe operating spaces and control variables.
   - License: Open Academic Access.
5. **Our World in Data (OWID)**:
   - Aggregated public domain statistical series for historical calibration.
   - License: CC BY 4.0.

## Software Dependencies

All software dependencies used in WORLD//26 are strictly verified for license compatibility with our Apache-2.0 license:
- **Rust Crates**: `serde`, `serde_json`, `wasm-bindgen`, `rand`, `rand_pcg`, `criterion` (Apache-2.0 / MIT).
- **TypeScript / Node**: `typescript`, `zod`, `vitest`, `turbo` (MIT / Apache-2.0).
- **Web App**: `next`, `react`, `react-dom`, `lucide-react`, `tailwindcss`, `zustand` (MIT).

No copyleft or GPL-tainted proprietary components are imported into the codebase.
