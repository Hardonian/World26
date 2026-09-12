# WORLD//26 Modular AI & Computing Sector

## 1. Beyond Legacy Pollution Injections

Unlike prior exploratory works that simply injected AI energy estimates into a monolithic persistent pollution stock (such as the initial formulation in Guliyeva et al., LIMITS '25), **WORLD//26 implements AI and computing as a fully modular sector with independent physical state stocks, hardware lifecycle flows, and non-linear causal feedbacks.**

---

## 2. Sector Stocks & Physical Flows

```
[Capital Investment]
        │
        ▼
[Semiconductor Capacity] ──► [Accelerator Deployments]
                                      │
                                      ▼
                           [Active Compute Fleet (EFLOP/s)]
                                      │
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
- **Operational Electricity Demand:** Computed dynamically from compute density ($kW/EFLOP$), data center Power Usage Effectiveness ($PUE$, default 1.25), and cluster utilization.
- **Evaporative Cooling Water:** Consumptive blue water loss per kWh of compute energy.
- **Secondary Material Recovery:** Closed-loop recycling recovering copper and precious metals, reducing primary mining stress.

---

## 3. Coupled Causal Feedback Loops

1. **AI Reinvestment Loop (Reinforcing +):**  
   $\text{Compute Capacity} \rightarrow \text{AI Productivity Dividend} \rightarrow \text{Economic Output} \rightarrow \text{Increased AI CapEx Allocation} \rightarrow \text{Further Compute Growth}$.
2. **Energy & Grid Constraint Loop (Balancing -):**  
   $\text{Compute Scaling} \rightarrow \text{Data Center Power Demand} \rightarrow \text{Grid Interconnect Delays \& Clean Energy Competition} \rightarrow \text{Deployment Constraints}$.
3. **Critical Minerals Constraint Loop (Balancing -):**  
   $\text{Hardware Turnover} \rightarrow \text{High-Grade Copper/Cobalt Depletion} \rightarrow \text{Rising Extraction Costs} \rightarrow \text{Hardware Capex Escalation}$.
4. **Jevons Rebound Loop (Ambiguous +/-):**  
   $\text{Compute Energy Efficiency Gains} \rightarrow \text{Cheaper Per-FLOP Inference} \rightarrow \text{Rebound Demand Surge} \rightarrow \text{Higher Aggregate Energy Consumption}$.

Technology can either alleviate or exacerbate planetary boundary pressures depending on policy decisions, grid decarbonization rates, and circular economy mandates.
