# WORLD//26 Parameter Provenance & Scientific Grounding

Every parameter in WORLD//26 is accompanied by an immutable provenance record adhering to the schema:

```json
{
  "value": 0.15,
  "unit": "Dmnl",
  "source": "Guliyeva et al. (2025) / Ember / IDC",
  "sourceYear": 2025,
  "lowerBound": 0.05,
  "upperBound": 0.35,
  "confidence": "medium",
  "transformation": "direct",
  "notes": "Direct operational CO2 emitted per 2020-$ of AI output (kg CO2/$ scaled).",
  "modelVersion": "2026.1"
}
```

---

## Primary Empirical Source Index

| Source ID | Organization | Coverage Years | License | Primary Variables Grounded |
| :--- | :--- | :--- | :--- | :--- |
| `un_desa_wpp_2024` | UN DESA Population Division | 1950–2100 | CC BY 3.0 IGO | Global & regional population, CBR, CDR, life expectancy |
| `global_carbon_project_2024` | Global Carbon Project | 1750–2024 | CC BY 4.0 | Fossil & land emissions, atmospheric CO2 ppm, sinks |
| `iea_weo_2024` | International Energy Agency | 1970–2024 | Non-commercial Academic | Energy demand (EJ), clean power share, DC electricity (TWh) |
| `stockholm_resilience_centre_2025` | Stockholm Resilience Centre & PIK | Pre-industrial–2026 | Open Academic | 9 Planetary boundaries, thresholds, ocean acidification |
| `limits_25_ai_world3` | Univ. of Toronto (LIMITS '25) | 1900–2100 | CC BY-NC-SA 4.0 | AI compute share of IO, efficiency slowdown, e-waste intensity |
| `world_bank_wdi_2024` | World Bank Group | 1960–2024 | CC BY 4.0 | GDP PPP, industrial value-add, Gini inequality index |
| `faostat_2024` | UN FAO | 1961–2024 | CC BY-NC-SA 3.0 IGO | Arable land, cereal yields, nitrogen/phosphorus fertilizer flows |
| `noaa_gml_2026` | NOAA Global Monitoring Lab | 1958–2026 | Public Domain | Mauna Loa atmospheric CO2 concentration |
| `berkeley_earth_2025` | Berkeley Earth Surface Temp | 1850–2025 | CC BY 4.0 | Global surface temperature anomaly series |
| `usgs_minerals_2024` | U.S. Geological Survey | 1990–2024 | Public Domain | Recoverable copper, lithium, nickel reserves and extraction rates |
