# WORLD//26 Modular AI & Computing Sector

## 1. Beyond Legacy Pollution Injections

Unlike prior exploratory works that simply injected AI energy estimates into a monolithic persistent pollution stock (such as the initial formulation in Guliyeva et al., LIMITS '25), **WORLD//26 implements AI and computing as a fully modular sector with independent physical state stocks, hardware lifecycle flows, and non-linear causal feedbacks.**

---

## 2. Sector Stocks & Physical Flows

```text
[Capital Investment]
        │
        ▼
[Semiconductor Capacity] ──► [Accelerator Deployments]
                                      │
                                      ▼
                           [Active Compute Fleet (EFLOP/s)]
                                      │
                                      ├──► [Training vs Inference Split]
                                      ├──► [Electricity Demand (TWh)] ──► Grid Stress
                                      ├──► [Water Cooling (km³)] ───────► Hydrological Stress
                                      ├──► [Copper / Mineral Draw] ─────► Supply Bottleneck
                                      └──► [Hardware Retirements]
                                                   │
                                                   ▼
                                       [E-Waste Accumulation]
                                                   │
                                                   ├──► [Landfill / Novel Entities]
                                                   └──► [Refurbishment & Recycling]
```

### State Stocks

1. **Installed Compute Capacity ($EFLOP/s$):** Active peak FP16/BF16 tensor accelerator clusters.
2. **Active Accelerator Fleet:** Physical count of deployed specialized accelerators (e.g., modern GPUs and TPUs).
3. **Semiconductor Manufacturing Capital:** Specialized fab and lithography asset inventory.
4. **Critical Mineral Inventory (Copper, Cobalt, Rare Earths):** High-grade ore stock available for hardware fabrication and grid interconnects.
5. **Accumulated Electronic Waste Stock ($Mt$):** Toxic heavy metals, plastics, and flame retardants from retired computing hardware.

### Flow Dynamics

- **Deployments & Retirements:** Hardware turnover based on useful lifespan (calibrated default: 3.5 years; adjustable between 1.5 and 8.0 years).
- **Operational Electricity Demand:** Computed dynamically from compute density ($kW/EFLOP$), effective Power Usage Effectiveness ($PUE$), and cluster utilization.
- **Evaporative Cooling Water:** Consumptive blue water loss per kWh of compute energy.
- **Secondary Material Recovery:** Closed-loop recycling recovering copper and precious metals, reducing primary mining stress.

---

## 3. Advanced Sector Levers & Architectural Dynamics

WORLD//26 models second-generation computing sector features:

### A. Training vs. Inference Compute Split

- **Training Allocation:** Frontier foundational model pre-training and recursive self-improvement clusters (~35% of compute in 2020-2025, shifting towards ~10-15% long-term).
- **Inference Allocation:** Real-time query execution, autonomous agent runtimes, and enterprise integration (scaling to 85-90% of aggregate compute load).

### B. Dynamic PUE Trajectory (Immersion & Direct-to-Chip Cooling)

- As thermal design power (TDP) per accelerator socket exceeds 1,000W, facilities transition from legacy air-cooling ($PUE \approx 1.35\text{--}1.40$) to direct-to-chip water and two-phase dielectric immersion cooling.
- The model smoothly transitions effective PUE towards a user-defined target ($PUE_{\text{target}} \approx 1.05\text{--}1.12$).

### C. Post-Silicon & Photonic Computing Paradigm Shift

- Lever: `post_silicon_transition_year` (default 2038; policy lever range 2030–2050).
- Models deployment of optical matrix processors, neuromorphic architectures, and cryogenic interconnects.
- Yields a multi-fold boost in FLOP/Watt energy efficiency ($\text{photonic\_efficiency\_multiplier} \approx 4\times\text{--}10\times$), dampening electrical grid bottlenecks.

---

## 4. Coupled Causal Feedback Loops

1. **AI Reinvestment Loop (Reinforcing +):**  
   $\text{Compute Capacity} \rightarrow \text{AI Productivity Dividend} \rightarrow \text{Economic Output} \rightarrow \text{Increased AI CapEx Allocation} \rightarrow \text{Further Compute Growth}$.
2. **Energy & Grid Constraint Loop (Balancing -):**  
   $\text{Compute Scaling} \rightarrow \text{Data Center Power Demand} \rightarrow \text{Grid Interconnect Delays \& Clean Energy Competition} \rightarrow \text{Deployment Constraints}$.
3. **Critical Minerals Constraint Loop (Balancing -):**  
   $\text{Hardware Turnover} \rightarrow \text{High-Grade Copper/Cobalt Depletion} \rightarrow \text{Rising Extraction Costs} \rightarrow \text{Hardware Capex Escalation}$.
4. **Jevons Rebound Loop (Ambiguous +/-):**  
   $\text{Compute Energy Efficiency Gains} \rightarrow \text{Cheaper Per-FLOP Inference} \rightarrow \text{Rebound Demand Surge} \rightarrow \text{Higher Aggregate Energy Consumption}$.
