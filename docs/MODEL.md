# WORLD//26 Model Architecture

## 1. 20 Coupled Model Sectors

WORLD//26 models global planetary dynamics across twenty interacting sectors:

```
                  ┌───────────────────────────────┐
                  │       16. AI & COMPUTING      │
                  │  (Compute, Power, E-Waste,    │
                  │   Productivity Multipliers)   │
                  └──────────────┬────────────────┘
                                 │
     ┌───────────────────────────┼───────────────────────────┐
     ▼                           ▼                           ▼
┌───────────────┐        ┌───────────────┐        ┌────────────────┐
│  2. ECONOMY   │◄──────►│   6. ENERGY   │◄──────►│ 7. CLIMATE/CO2 │
│  (Capital,    │        │ (Clean vs     │        │ (Emissions,    │
│   Output)     │        │  Fossil, Grid)│        │  2-Box Temp)   │
└───────┬───────┘        └───────┬───────┘        └────────┬───────┘
        │                        │                         │
        ▼                        ▼                         ▼
┌───────────────┐        ┌───────────────┐        ┌────────────────┐
│ 1. DEMOGRAPHY │        │ 5. RESOURCES  │        │ 13. OCEAN ACID │
│ (Births,      │        │ (Fossil, Cu,  │        │ (Aragonite Ω,  │
│  Deaths, Life)│        │  Lithium, Min)│        │  Coral Stress) │
└───────┬───────┘        └───────┬───────┘        └────────┬───────┘
        │                        │                         │
        ▼                        ▼                         ▼
┌───────────────┐        ┌───────────────┐        ┌────────────────┐
│ 4. AGRICULTURE│        │   9. WATER    │        │ 11. BIOSPHERE  │
│ (Food/cap,    │        │ (Blue/Green,  │        │ (Extinction,   │
│  Fertilizer)  │        │  Cooling)     │        │  Intactness)   │
└───────────────┘        └───────────────┘        └────────────────┘
```

### Complete Sector Inventory

1. **Demography**: Aggregate population, crude birth rate ($CBR$), crude death rate ($CDR$), total fertility rate ($TFR$), life expectancy at birth ($LE$).
2. **Industrial Economy**: Industrial capital stock ($IC$), industrial output ($IO$), gross domestic product ($GDP$), reinvestment, and capital-output ratio ($ICOR$).
3. **Services & Human Development**: Service capital ($SC$), service output per capita ($SOPC$), education index, healthcare infrastructure.
4. **Food & Agriculture**: Arable land ($AL$), cereal yields, food per capita, synthetic nitrogen/phosphorus application, soil degradation dynamics.
5. **Non-Renewable Resources**: Fossil fuel reserves, high-grade recoverable copper ($Cu$), lithium inventory ($Li$), and critical mineral extraction cost feedback ($FCAOR$).
6. **Energy Systems**: Total primary energy demand, clean electricity share, fossil burn, grid expansion capex, and learning curves.
7. **Climate & Carbon Cycle**: Industrial emissions, land-use emissions, atmospheric $CO_2$ stock (ppm), airborne fraction, upper ocean mixed-layer heat uptake, deep ocean thermal response, equilibrium climate sensitivity ($ECS$).
8. **Persistent Pollution & Novel Entities**: World3-compatible persistent pollution stock ($PPOL$), synthetic chemical load index, electronic waste accumulation ($EWASTE$).
9. **Hydrology & Water**: Blue water withdrawal and consumptive use, agricultural irrigation stress, data center evaporative cooling consumption.
10. **Land-System Change**: Forest cover fraction, agricultural land expansion, urban/infrastructure footprint, biome intactness.
11. **Biosphere Integrity**: Extinction rate ($E/MSY$), Biodiversity Intactness Index ($BII$), habitat fragmentation pressure.
12. **Biogeochemical Flows**: Fixed reactive nitrogen application ($Tg\ N/yr$), freshwater phosphorus runoff ($Tg\ P/yr$).
13. **Ocean Acidification**: Seawater carbonate ion concentration, surface aragonite saturation ($\Omega_{arag}$), polar undersaturation risk.
14. **Atmospheric Aerosols**: Interhemispheric aerosol optical depth ($AOD$) difference, particulate public health mortality.
15. **Stratospheric Ozone**: Dobson Unit ($DU$) column recovery trajectory following Montreal Protocol phase-out.
16. **AI & Computing**: Active accelerator fleet ($EFLOP/s$), semiconductor manufacturing capacity, data center electricity demand, water cooling consumption, server turnover, e-waste generation, automated productivity multipliers, and Jevons rebound effects.
17. **Inequality**: Gini coefficient proxy, capital share versus labor share, redistributive policy impacts.
18. **Human Wellbeing**: Non-GDP composite welfare index synthesizing life expectancy, food security, education, environmental health, and equity.
19. **Social Governance**: Societal strain index driven by resource scarcity, food unaffordability, environmental displacement, and public service capacity.
20. **Regional Trade**: 10-region bilateral technology transfer and critical mineral import/export dependencies.
