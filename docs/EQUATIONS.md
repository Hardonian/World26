# WORLD//26 Mathematical Formulation & Equations

This document details the differential equations and algebraic relationships governing the WORLD//26 system dynamics model.

---

## 1. Demography Sector

$$\frac{d(\text{Pop})}{dt} = \text{Births} - \text{Deaths}$$

Where:
$$\text{Births} = \text{Pop} \times \text{CBR}$$
$$\text{Deaths} = \frac{\text{Pop}}{\text{LifeExpectancy}}$$
$$\text{CBR} = \text{TFR} \times 0.0081$$
$$\text{LifeExpectancy} = 32.0 + 48.0 \times \left(1.0 - e^{-\frac{\text{SOPC} + \text{FOPC} \times 0.5}{400.0}}\right) \times (1.0 - \text{PollutionStress})$$

---

## 2. Industrial Economy Sector

$$\frac{d(\text{IC})}{dt} = I_{\text{industrial}} - D_{\text{industrial}}$$

Where:
$$\text{Output}_{\text{effective}} = \frac{\text{IC}}{\text{ICOR}} \times (1.0 - \text{ClimateDamage}) \times \text{AI}_{\text{productivity}}$$
$$I_{\text{industrial}} = \text{Output}_{\text{effective}} \times \left(\text{InvestmentShare} \times (1.0 - \text{FCAOR})\right)$$
$$D_{\text{industrial}} = \text{IC} \times (\delta_{\text{base}} + \delta_{\text{climate\_damage}})$$
$$\text{ICOR} = 3.0$$

---

## 3. Climate & Atmospheric Carbon Sector

$$\frac{d(\text{CO}_2)}{dt} = \frac{E_{\text{fossil}} + E_{\text{land}}}{3.8} - (\text{Sink}_{\text{ocean}} + \text{Sink}_{\text{land}})$$

### Two-Box Thermal Response Model
$$\frac{d(T_{\text{upper}})}{dt} = \frac{F_{\text{rad}} - \lambda T_{\text{upper}} - \gamma (T_{\text{upper}} - T_{\text{deep}})}{C_{\text{upper}}}$$
$$\frac{d(T_{\text{deep}})}{dt} = \frac{\gamma (T_{\text{upper}} - T_{\text{deep}})}{C_{\text{deep}}}$$

Where:
$$F_{\text{rad}} = 5.35 \times \ln\left(\frac{\text{CO}_2}{280.0}\right)$$
$$\lambda = \frac{5.35 \times \ln(2.0)}{\text{ECS}}$$

---

## 4. AI & Computing Sector

$$\frac{d(\text{Compute})}{dt} = \text{DeploymentRate} - \text{RetirementRate}$$
$$\text{RetirementRate} = \frac{\text{Compute}}{\text{Lifetime}_{\text{hardware}}}$$
$$\text{DeploymentRate} = \text{Compute} \times (\text{GrowthRate} \times \text{SemiconductorFactor})$$

### Electricity & Resource Demands
$$\text{Demand}_{\text{electricity}} = \text{Compute} \times \text{PowerDensity} \times \text{PUE} \times 8760 \times 10^{-6} \text{ [TWh]}$$
$$\text{Consumption}_{\text{water}} = \text{Demand}_{\text{electricity}} \times \text{WaterIntensity} \times 10^{-3} \text{ [km}^3\text{]}$$
$$\text{E-Waste}_{\text{generation}} = \frac{\text{Compute}}{\text{Lifetime}_{\text{hardware}}} \times \text{MassPerCompute} \times (1.0 - \text{RecyclingShare})$$

### Automated Productivity Multiplier
$$\text{AI}_{\text{productivity}} = 1.0 + \left(\frac{\text{Compute}}{C_{\text{ref}}}\right)^{\alpha} \times (1.0 - \text{JevonsRebound})$$

---

## 5. Non-Renewable Resources & Extraction Cost (FCAOR)

$$\frac{d(\text{Res})}{dt} = -\text{Pop} \times \left(\frac{\text{IOPC}}{200.0}\right)^{0.7} \times 1.75$$
$$\text{NRFR} = \frac{\text{Res}}{\text{Res}_0}$$
$$\text{FCAOR} = \begin{cases} 
0.05 & \text{if } \text{NRFR} \ge 0.50 \\
0.05 + 0.90 \times (1.0 - 2.0 \times \text{NRFR})^2 & \text{if } \text{NRFR} < 0.50 
\end{cases}$$

---

## 6. Ocean Acidification Sector

$$\Omega_{\text{arag}} = 3.44 - 0.0045 \times (\text{CO}_2 - 280.0)$$

Safe threshold: $\Omega_{\text{arag}} \ge 2.80$. Current value transgressed at $\approx 2.79$.

---

## 7. Composite Human Wellbeing Index

$$\text{HWI} = 0.25 \times \left(\frac{\text{LE} - 25.0}{60.0}\right) + 0.20 \times \min\left(1.0, \frac{\text{FOPC}}{400.0}\right) + 0.20 \times \text{Edu} + 0.10 \times \left(\frac{\Omega_{\text{arag}}}{3.44}\right) + 0.10 \times \left(\frac{\text{BII}}{100.0}\right) + 0.15 \times (1.0 - \text{Gini})$$
