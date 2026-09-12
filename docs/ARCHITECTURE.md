# WORLD//26 System Architecture

## 1. Overview & Intellectual Lineage

**WORLD//26** is an open-source, client-first planetary systems dynamics simulator designed to model coupled global physical, demographic, macroeconomic, and computational subsystems from 1900 through 2100/2150.

> **Disclaimer:** Independent research and scenario-exploration software. Not affiliated with or endorsed by the Club of Rome, Earth4All, or the original World3 authors.

### Core Architecture Principles
1. **Models are for exploring system behaviour, not pretending to know the future.**
2. **Client-First Execution:** 100% of numerical integration runs locally in the browser or worker. Zero cloud compute or remote APIs required for simulation.
3. **Dual Engine Verification:** Dual implementation in high-performance Rust (`packages/sim-core`, compiled to WASM via `packages/sim-wasm`) and isomorphic strict TypeScript (`packages/model`), ensuring 100% cross-platform reproducibility.
4. **Deterministic Causal Attribution:** Inflection points ("Why did that happen?") are computed from exact differential rate derivatives and causal graph deltas—never hallucinated by generative models.

---

## 2. Monorepo Structure

The project is structured as a pnpm workspace orchestrated with Turborepo and Cargo:

```
World26/
├── apps/
│   └── web/                   # Next.js 15+ App Router interactive workstation
├── packages/
│   ├── schemas/               # Zod typed schemas for parameters, scenarios, policies, boundaries
│   ├── data/                  # Normalized datasets, provenance registry, and static data exports
│   ├── sim-core/              # Rust numerical engine (RK4, Euler, delays, tables, 20 sectors)
│   ├── sim-wasm/              # wasm-bindgen WebAssembly bridge
│   ├── model/                 # Isomorphic TypeScript reference implementation & scenario library
│   └── analytics/             # Causal explainer, sensitivity analyzer, milestone detector
├── data/                      # Canonical source data snapshots
│   ├── boundaries/            # 9 planetary boundary control variables (including 2025/2026 ocean updates)
│   ├── parameters/            # Default parameter registry with full empirical provenance
│   ├── historical/            # 1960-2025 historical calibration observation series
│   ├── regions/               # 10-region macroeconomic and demographic distributions
│   └── sources.yaml           # Primary source registry (UN DESA, World Bank, IEA, NOAA, etc.)
├── tools/
│   ├── benchmarks/            # Performance benchmarking suite
│   ├── calibration/           # Historical error audit script (RMSE calculation)
│   └── reproduce.js           # CLI one-command reproduction runner
└── docs/                      # Comprehensive scientific documentation suite
```

---

## 3. Simulation Execution Model

```
┌─────────────────────────────────────────────────────────────┐
│                       Browser / Next.js 15                  │
│                                                             │
│   ┌──────────────────────┐         ┌────────────────────┐   │
│   │   Policy Composer    │         │  Trajectory View   │   │
│   │  (Scenario & Levers) │         │ (Multi-Series SVG) │   │
│   └──────────┬───────────┘         └─────────▲──────────┘   │
│              │                               │              │
│              ▼                               │              │
│   ┌──────────────────────────────────────────┴──────────┐   │
│   │              Simulation Controller                  │   │
│   │            (apps/web/src/lib/simulator.ts)          │   │
│   └──────────────────────┬──────────────────────────────┘   │
│                          │                                  │
│                          ▼                                  │
│   ┌─────────────────────────────────────────────────────┐   │
│   │         Numerical Integration Engine                │   │
│   │   • Rust / WASM (world26_sim_core / sim-wasm)       │   │
│   │   • Isomorphic TypeScript (World26SimulatorTs)      │   │
│   │   • RK4 / Euler Integrator (dt = 0.25 / 0.50y)      │   │
│   │   • Delay1, Delay3, Smooth operators                │   │
│   └──────────────────────┬──────────────────────────────┘   │
│                          │                                  │
│                          ▼                                  │
│   ┌─────────────────────────────────────────────────────┐   │
│   │         Deterministic Analytics Layer               │   │
│   │   • Causal Attribution Engine (Inflection Extrema)  │   │
│   │   • Planetary Boundaries Wheel Normalization        │   │
│   │   • One-At-A-Time (OAT) Sensitivity Engine          │   │
│   └─────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

---

## 4. Performance Targets vs Achieved

| Metric | Target | Achieved (Benchmark) | Status |
| :--- | :--- | :--- | :--- |
| Single Deterministic Global Run (1900–2100) | < 100 ms | **3.22 ms** | ✓ 31x faster than budget |
| World3 Clean-Room Run (400 steps) | < 50 ms | **0.60 ms** | ✓ 83x faster than budget |
| Scenario Update Interaction Latency | < 200 ms | **< 10 ms** | ✓ Instant interactive response |
| 100-Run Stochastic Batch | < 2,000 ms | **15.69 ms** | ✓ Real-time sensitivity |
| 1,000-Run Monte Carlo Batch | < 30 s | **~0.16 s** | ✓ Scalable in browser worker |

---

## 5. Local-First Persistence & Supabase Fallback

The simulator operates fully locally by default:
- **Zero Login Required:** Anonymous sessions run completely in-browser.
- **Local Storage:** Scenarios and parameters are saved via `localStorage` / `IndexedDB`.
- **Graceful Supabase Integration:** When `NEXT_PUBLIC_SUPABASE_URL` and keys are provided, cloud synchronization, multi-tenant workspaces, and public permalinks are activated with Row-Level Security (RLS) enforcement on all user-owned tables.
- **No Secret Leakage:** Client bundles contain zero private keys or credentials.
