# WORLD//26 Planetary Boundaries Interpretation Layer

## 1. Overview & 2025/2026 Earth System Update

WORLD//26 implements a dedicated interpretation layer translating raw sector states into the **Nine Planetary Boundaries** framework developed by the Stockholm Resilience Centre (Rockström et al. 2009; Steffen et al. 2015; Richardson et al. 2023).

> **Important 2025/2026 Scientific Update:** The baseline data snapshot (`data/boundaries/current.json`) incorporates recent Earth system assessments identifying **Ocean Acidification** as an additional transgressed planetary boundary, bringing the total number of transgressed boundaries to **seven out of nine**.

---

## 2. The Nine Modelled Boundaries

| Boundary | Control Variable | Safe Zone | Zone of Uncertainty | Current Status (2026) | Primary Source |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **1. Climate Change (CO2)** | Atmospheric $CO_2$ Concentration | $\le 350$ ppm | 350 – 450 ppm | **Transgressed** (426.5 ppm) | NOAA / Mauna Loa |
| **2. Climate Change (Forcing)** | Radiative Forcing | $\le 1.0$ $W/m^2$ | 1.0 – 1.5 $W/m^2$ | **Transgressed** (2.91 $W/m^2$) | IPCC AR6 / Hansen et al. |
| **3. Biosphere Integrity** | Extinction Rate ($E/MSY$) | $\le 10$ $E/MSY$ | 10 – 100 $E/MSY$ | **Transgressed** (130 $E/MSY$) | IUCN Red List |
| **4. Land-System Change** | Global Forest Cover Fraction | $\ge 75\%$ | 54% – 75% | **Transgressed** (~60%) | FAO FRA / Hansen et al. |
| **5. Freshwater Change** | Blue Water Consumption | $\le 4,000$ $km^3/yr$ | 4,000 – 6,000 $km^3/yr$ | **Uncertainty Zone** (4,200 $km^3/yr$) | Gleick / FAO AQUASTAT |
| **6. Biogeochemical (Nitrogen)** | Anthropogenic Fixed N Applied | $\le 62$ $Tg\ N/yr$ | 62 – 82 $Tg\ N/yr$ | **Transgressed** (190 $Tg\ N/yr$) | FAOSTAT / de Vries et al. |
| **7. Biogeochemical (Phosphorus)**| Phosphorus Flow to Oceans | $\le 11$ $Tg\ P/yr$ | 11 – 16 $Tg\ P/yr$ | **Transgressed** (28 $Tg\ P/yr$) | Carpenter et al. |
| **8. Ocean Acidification** | Surface Aragonite Saturation ($\Omega_{arag}$) | $\ge 2.80$ | 2.70 – 2.80 | **Transgressed** (2.79) | Copernicus / Feely et al. |
| **9. Novel Entities** | Persistent Chemicals & E-Waste | $\le 1.0$ (Index) | 1.0 – 1.5 | **Transgressed** (~2.8) | Persson et al. / UN E-Waste |
| **10. Atmospheric Aerosols** | Interhemispheric AOD Difference | $\le 0.10$ | 0.10 – 0.25 | **Safe** (0.075) | NASA MODIS / AERONET |
| **11. Stratospheric Ozone** | Stratospheric Ozone Column | $\ge 276$ DU | 260 – 276 DU | **Safe** (284 DU) | WMO / UNEP Assessment |

---

## 3. Boundary Normalization & Wheel Visualization

The interactive **Planetary Boundary Wheel** calculates radial spoke extent $R$ relative to the safe boundary threshold $S$:

$$R_{\text{normalized}} = \begin{cases}
\frac{V}{S} & \text{for standard boundaries (higher is worse)} \\
\frac{S}{\max(V, \epsilon)} & \text{for inverse boundaries (Ocean }\Omega_{\text{arag}}\text{, Forest cover)}
\end{cases}$$

- $R \le 1.0$: Green wedge inside safe operating space.
- $1.0 < R \le 1.5$: Amber wedge within the zone of uncertainty.
- $R > 1.5$: Crimson wedge indicating high-risk boundary transgression.
