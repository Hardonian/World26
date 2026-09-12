# WORLD//26 Uncertainty & Sensitivity Engine

## 1. Uncertainty as a First-Class Feature

Simulation models explore dynamic system behaviors under varying structural assumptions; they are not deterministic crystal balls. WORLD//26 treats uncertainty as a fundamental scientific component.

Every uncertain input in the parameter registry (`data/parameters/defaults.json`) defines:
- **Point Estimate (`value`)**
- **Lower Bound (`lowerBound`)**
- **Upper Bound (`upperBound`)**
- **Confidence Score (`confidence`: 'high' | 'medium' | 'low')**
- **Derivation Notes (`notes`)**

---

## 2. Seeded Deterministic Reproducibility

All stochastic and Monte Carlo routines use seeded pseudo-random number generators (PCG64 / XorShift128+). 

> **Exact Reproducibility Invariant:** Any simulation run initialized with the same Model Version, Data Version, Seed, and Scenario Parameters reproduces **bitwise identical numerical trajectories**.

---

## 3. Uncertainty Analysis Capabilities

1. **Deterministic Run:** Single baseline integration using calibrated point estimates.
2. **One-At-A-Time (OAT) Sensitivity Analysis:** Evaluates output elasticity ($\epsilon = \frac{\% \Delta Y}{\% \Delta X}$) by perturbing parameters individually by $\pm 20\%$. Generates sensitivity tornado rankings.
3. **Monte Carlo Batch Simulation:** Executes $N = 100$ to $10,000$ runs across joint parameter distributions.
4. **Quantile Fan Charts:** Computes statistical distributions across time:
   - $P_{10}$ (10th percentile conservative band)
   - $P_{50}$ (median expectation)
   - $P_{90}$ (90th percentile upper tail)
   - Minimum and Maximum envelopes.
5. **Threshold-Crossing Probability:** Calculates empirical odds that an environmental threshold (e.g., $+1.5^\circ\text{C}$, $+2.0^\circ\text{C}$, or critical copper reserve depletion) is exceeded by a specific calendar year.
