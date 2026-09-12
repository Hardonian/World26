# WORLD//26 10-Region Disaggregation Architecture

## 1. 10-Region Spatial Abstraction

WORLD//26 supports both an aggregate global mode and an interactive 10-region disaggregated mode accessible via the `/regions` workstation. The regions align with standard Integrated Assessment Model (IAM) and Earth4All macro-regions:

1. **North America (`north_america`):** USA, Canada
2. **Latin America & Caribbean (`latin_america`):** Brazil, Mexico, Andean states, Southern Cone, Caribbean
3. **Western Europe (`western_europe`):** EU-27, UK, Norway, Switzerland
4. **Eastern Europe & Central Asia (`eastern_europe_central_asia`):** Russia, Ukraine, Kazakhstan, Central Asian republics
5. **Middle East & North Africa (`middle_east_north_africa`):** GCC states, Levant, North Africa
6. **Sub-Saharan Africa (`sub_saharan_africa`):** West, East, Central, and Southern Africa
7. **South Asia (`south_asia`):** India, Pakistan, Bangladesh, Sri Lanka, Nepal
8. **China Region (`china_region`):** Mainland China, Hong Kong, Macau, Taiwan
9. **Southeast & Rest of Asia (`southeast_rest_asia`):** ASEAN member states, rest of non-OECD Asia
10. **Pacific OECD (`pacific_oecd`):** Japan, South Korea, Australia, New Zealand

---

## 2. Model Implementation (`RegionalWorld26SimulatorTs`)

The multi-instance engine in `packages/model/src/regional.ts` models 10 distinct regional system dynamics instances coupled through physical trade and shared global biophysical sinks:

```ts
export class RegionalWorld26SimulatorTs {
  globalSim: World26SimulatorTs;
  regions: RegionalProfile[];
  regionalStates: Record<string, RegionalStepState>;
  
  step(dt: number): RegionalCoupledSimulationStep;
}
```

Each region models:
- Population and labor force dynamics
- Industrial output, capital accumulation, and GDP (constant PPP)
- Electricity and primary energy demand
- Clean electricity expansion trajectories
- AI accelerator cluster capacity (EFLOP/s) and datacenter power draw
- Food production, caloric balances, and grain trade flows
- Water withdrawals and localized water stress
- Critical mineral production (Copper, Lithium, Rare Earths)
- Regionally differentiated climate damages
- Human Wellbeing Index and inequality (Gini)

---

## 3. Bilateral Physical Trade & Conservation Closure

Physical trade between regions enforces strict conservation of mass and energy:

$$\sum_{i=1}^{10} \text{NetFoodTrade}_i = 0 \quad (\text{tolerance} < 10^{-6}\text{ Mt})$$

$$\sum_{i=1}^{10} \text{NetCopperTrade}_i = 0 \quad (\text{tolerance} < 10^{-6}\text{ Mt})$$

1. **Agricultural Caloric Trade:** Surplus agricultural exporting regions (North America, Latin America, Eastern Europe) export grain to deficit regions (MENA, South Asia, Sub-Saharan Africa), buffering local food crises.
2. **Critical Minerals Supply Chains:** Unrefined copper, lithium, and rare earths from Latin America, China, Sub-Saharan Africa, and Australia flow to high-demand manufacturing and datacenter hubs in Western Europe, Pacific OECD, and North America.
3. **Compute Hardware & AI Technology Diffusion:** Semiconductor technologies originate in primary manufacturing hubs and diffuse globally with an empirical adoption delay $\tau \approx 4\text{--}7\text{ years}$.
4. **Latitude-Dependent Climate Vulnerability:** Climate damage fractions are differentiated by baseline temperature and geographic vulnerability (e.g., $1.70\times$ for MENA, $1.80\times$ for Sub-Saharan Africa, versus $0.85\times$ for North America and $0.90\times$ for Western Europe).

---

## 4. Scientific Honesty & Provenance

All regional baseline allocations are grounded in official empirical datasets from:
- **UN DESA World Population Prospects (2024 Revision)**
- **World Bank World Development Indicators (2024)**
- **IEA World Energy Outlook & Energy and AI Report (2024)**
- **FAOSTAT Agricultural Production & Land Balance (2024)**
- **USGS Mineral Commodity Summaries (2024-2026)**
- **WRI Aqueduct 4.0 Water Risk Atlas (2023-2025)**
