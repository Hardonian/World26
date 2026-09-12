# WORLD//26
### An Open Planetary Systems Simulator

```
██╗    ██╗ ██████╗ ██████╗ ██╗     ██████╗     ██████╗  ██████╗ 
██║    ██║██╔═══██╗██╔══██╗██║     ██╔══██╗    ╚════██╗██╔════╝ 
██║ █╗ ██║██║   ██║██████╔╝██║     ██║  ██║     █████╔╝███████╗ 
██║███╗██║██║   ██║██╔══██╗██║     ██║  ██║    ██╔═══╝ ██╔═══██╗
╚███╔███╔╝╚██████╔╝██║  ██║███████╗██████╔╝    ███████╗╚██████╔╝
 ╚══╝╚══╝  ╚═════╝ ╚═╝  ╚═╝╚══════╝╚═════╝     ╚══════╝ ╚═════╝ 
        Change one assumption. Watch the century move.
```

> **Independent Research Disclaimer:**  
> Independent research and scenario-exploration software. Not affiliated with or endorsed by the Club of Rome, Earth4All, or the original World3 authors. Released under Apache-2.0.

---

## The Central Product Principle

> **MODELS ARE FOR EXPLORING SYSTEM BEHAVIOUR, NOT PRETENDING TO KNOW THE FUTURE.**

Every simulation trajectory in **WORLD//26** exposes its:
- Empirical Assumptions & Data Sources
- Measurement Units & Coordinate Mappings
- Provenance & Citation Metadata
- Confidence Scores & Uncertainty Envelopes
- Parameter Sensitivity & Numerical Integrator Specifications

Never present simulation output as certain prediction.

---

## What WORLD//26 Is & Is Not

| It IS | It is NOT |
| :--- | :--- |
| ✓ A real quantitative system-dynamics simulator (1900–2100) | ✗ A static dashboard or climate calculator |
| ✓ A 20-sector coupled planetary feedback engine | ✗ A deterministic doomsday prediction engine |
| ✓ A client-first, zero-cloud simulator in Rust/WASM & TypeScript | ✗ A fake AI wrapper around hardcoded charts |
| ✓ A peer-reproducible scenario laboratory (LIMITS '25 & World3) | ✗ A toy World3 clone |
| ✓ A deterministic causal visualizer ("Why did that happen?") | ✗ An ungrounded generative LLM black box |

---

## Key 2026 Advances: Modular AI & Computing Sector

Rather than merely injecting speculative AI emissions into legacy pollution stocks, **WORLD//26 constructs AI and computing as a proper modular sector**:

- **Hardware Lifecycle Stocks:** Active accelerator fleet ($EFLOP/s$), semiconductor manufacturing capital, critical mineral inventory (copper, cobalt, silicon), and accumulated e-waste ($Mt$).
- **Coupled Resource Demands:** Data center electrical power draw ($TWh$), evaporative water cooling consumption ($km^3$), grid interconnect competition, and specialized cooling infrastructure.
- **Dynamic System Feedbacks:**
  - *Productivity Dividend:* Automated scientific and engineering capability enhancing economic and capital efficiency.
  - *Jevons Rebound:* Cheaper per-FLOP compute driving surging aggregate power consumption.
  - *Resource Bottlenecks:* High-grade copper depletion raising accelerator manufacturing capex.
  - *Circular Electronics Mandates:* Hardware lifespan extensions (3.5 to 7.0 years) and closed-loop material recycling.

---

## Nine Planetary Boundaries Layer (2025/2026 Science)

WORLD//26 tracks all nine Earth system planetary boundaries with versioned control variables:

1. **Climate Change:** Atmospheric $CO_2$ ($\le 350$ ppm safe) & Radiative Forcing ($\le 1.0\ W/m^2$) — **Transgressed**
2. **Biosphere Integrity:** Extinction rate ($\le 10\ E/MSY$) — **Transgressed**
3. **Land-System Change:** Forest cover fraction ($\ge 75\%$) — **Transgressed**
4. **Freshwater Change:** Consumptive blue water ($\le 4,000\ km^3/yr$) — **Zone of Uncertainty**
5. **Biogeochemical Flows:** Synthetic Nitrogen application ($\le 62\ Tg\ N/yr$) & Phosphorus runoff ($\le 11\ Tg\ P/yr$) — **Transgressed**
6. **Ocean Acidification (2025/2026 Landmark Update):** Global average surface seawater aragonite saturation ($\Omega_{\text{arag}} \ge 2.80$ safe; current $\approx 2.79$) — **Transgressed**
7. **Novel Entities:** Persistent chemical and electronic waste pressure — **Transgressed**
8. **Atmospheric Aerosols:** Interhemispheric optical depth difference ($\le 0.10$) — **Safe Operating Space**
9. **Stratospheric Ozone:** Column ozone ($\ge 276$ DU) — **Safe Operating Space (Recovering)**

---

## Quickstart & Local Development

### 1. Requirements
- Node.js `>= 20.0.0`
- pnpm `>= 9.0.0` (v11.8.0 recommended)
- Rust toolchain `>= 1.80.0` (for `sim-core` and `sim-wasm`)

### 2. Installation & Run
```bash
# Clone the repository
git clone https://github.com/Hardonian/World26.git
cd World26

# Install workspace dependencies
pnpm install

# Start Next.js local development server (runs at http://localhost:3000)
pnpm dev
```

---

## Verification & Scientific Validation Commands

```bash
# Run all TypeScript unit and system tests
pnpm test

# Run Rust numerical engine tests (RK4, delays, tables, invariants)
cargo test --all

# Run Rust formatting and clippy strict audits
pnpm cargo:fmt
pnpm cargo:clippy

# Validate datasets and parameter registry schemas
pnpm data:validate
pnpm model:validate

# Inspect cryptographic checksums and parameter provenance
pnpm data:checksum
pnpm data:provenance

# Execute simulation speed benchmark (< 4 ms single run)
pnpm benchmark

# Run historical calibration audit against 1960-2025 empirical records
pnpm calibrate

# Reproduce LIMITS '25 AI research paper compatibility fixture (Table 8)
pnpm reproduce paper-ai-2025

# Reproduce canonical World3 scenarios
pnpm reproduce world3-bau
pnpm reproduce world3-ct
pnpm reproduce world3-sw

# Build production bundles across all packages
pnpm build
```

---

## Historical Calibration Summary (1960–2025)

| Metric | Observed 2025 | Simulated 2025 | Error % | 1960–2025 RMSE |
| :--- | :--- | :--- | :--- | :--- |
| **Global Population** | 8.19 Billion | 7.92 Billion | **-3.3%** | 0.319 B |
| **Atmospheric $CO_2$** | 426.5 ppm | 417.9 ppm | **-2.0%** | 18.36 ppm |
| **Temperature Anomaly** | +1.25 °C | +1.21 °C | **-3.2%** | 0.444 °C |

---

## Scientific Honesty Badges

To prevent confusion between measurements, assumptions, and projections, all variables in WORLD//26 carry transparent labels:

- `OBSERVED`: Empirical measurement from UN, IEA, NOAA, or peer-reviewed literature.
- `CALIBRATED`: Statistically estimated parameter grounded in 1960–2025 empirical series.
- `ASSUMED`: Theoretical modeling assumption with documented uncertainty bounds.
- `PROJECTED`: External exogenous trajectory (e.g., IPCC SSP, UN DESA).
- `SIMULATED`: Endogenous output generated dynamically by differential equations.
- `EXPERIMENTAL`: Subsystem pending further empirical calibration.

---

## License & Clean-Room Provenance

- Source code is licensed under the [Apache License, Version 2.0](./LICENSE).
- For complete clean-room compliance, third-party dataset licenses, and trademark disclaimers, see [`docs/THIRD_PARTY.md`](./docs/THIRD_PARTY.md) and [`docs/LICENSE-REVIEW.md`](./docs/LICENSE-REVIEW.md).
