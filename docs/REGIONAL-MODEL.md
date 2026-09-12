# WORLD//26 10-Region Disaggregation Architecture

## 1. 10-Region Spatial Abstraction

WORLD//26 supports both an aggregate global mode and a 10-region mode aligned with standard Integrated Assessment Model (IAM) and Earth4All conventions:

1. **North America (USA, CAN)**
2. **Latin America & Caribbean**
3. **Western Europe**
4. **Eastern Europe & Central Asia**
5. **Middle East & North Africa (MENA)**
6. **Sub-Saharan Africa**
7. **South Asia (India, PAK, BGD, LKA)**
8. **China Region**
9. **Southeast & Rest of Asia**
10. **Pacific OECD (Japan, South Korea, Australia, New Zealand)**

---

## 2. ModelInstance Pattern

Each region is instantiated as a `ModelInstance` sharing the common 20-sector equation engine, initialized with regional empirical parameters from `data/regions/regions_10.json`:

```ts
export interface RegionalProfile {
  id: string;
  name: string;
  populationShare2025: number;
  gdpPppShare2025: number;
  energyDemandEj2025: number;
  aiComputeShare2025: number;
  fossilReserveShare: number;
  copperReserveShare: number;
  arableLandShare: number;
  wellbeingBaseline: number;
}
```

---

## 3. Bilateral Trade & Dependency Matrix

The regional architecture models physical transfers and interdependencies:
- **Critical Minerals:** Transfer of unrefined copper, lithium, and rare earths from Latin America, Africa, and China to North America, East Asia, and Western Europe.
- **Compute Hardware & Technology Diffusion:** Flow of specialized semiconductor accelerators from manufacturing centers to global enterprise hubs.
- **Agricultural Food Trade:** Caloric transfers from major grain-exporting regions (North America, Latin America, Eastern Europe) to food-deficit regions.
- **Climate Damages:** Regionally differentiated damage functions reflecting higher vulnerability in low-latitude, high-temperature zones.

---

## 4. Scientific Honesty & Fallback Rules

Where reliable regional empirical time-series are unavailable:
- Regional coefficients fall back to global averages.
- The UI prominently flags the subsystem as `EXPERIMENTAL`.
- Uncertainty bands are widened automatically.
- No fabricated precision: uncalibrated regional coefficients are never presented as certain data.
