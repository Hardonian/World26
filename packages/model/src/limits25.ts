/**
 * Clean-room TypeScript reference implementation of Guliyeva, Bhardwaj, Becker (LIMITS '25 / arXiv:2510.07634)
 * "Exploring the Viability of the Updated World3 Model for Examining the Impact of Computing on Planetary Boundaries"
 */

export interface Limits25AiTerms {
  fraction_industrial_output_ai: number;
  ai_output: number;
  ai_pollution_intensity: number;
  ai_pollution_tech_change_multiplier: number;
  persistent_pollution_generation_ai: number;
}

export interface Limits25Config {
  co2_to_persist: number;
  ai_co2_intensity_2020: number;
  ai_ewaste_intensity_2020: number;
  frac_io_ai_2020: number;
  frac_io_ai_2050: number;
  base_ai_efficiency_improvement: number;
  ai_efficiency_slowdown_rate: number;
  ai_ewaste_improvement_rate: number;
}

export const DEFAULT_LIMITS25_CONFIG: Limits25Config = {
  co2_to_persist: 2.3e-4,
  ai_co2_intensity_2020: 0.15,
  ai_ewaste_intensity_2020: 3.5e-4,
  frac_io_ai_2020: 0.013,
  frac_io_ai_2050: 0.06,
  base_ai_efficiency_improvement: 0.25,
  ai_efficiency_slowdown_rate: 0.04,
  ai_ewaste_improvement_rate: 0.03,
};

export function computeLimits25AiTerms(
  time: number,
  industrial_output: number,
  legacy_tech_multiplier = 1.0,
  config: Limits25Config = DEFAULT_LIMITS25_CONFIG
): Limits25AiTerms {
  if (time < 2020.0) {
    return {
      fraction_industrial_output_ai: 0,
      ai_output: 0,
      ai_pollution_intensity: 0,
      ai_pollution_tech_change_multiplier: 1.0,
      persistent_pollution_generation_ai: 0,
    };
  }

  const dt_2020 = Math.max(0, time - 2020.0);

  // 1. Fraction of industrial output allocated to AI (logistic ramp 2020 -> 2050)
  const fraction_industrial_output_ai =
    config.frac_io_ai_2020 +
    (config.frac_io_ai_2050 - config.frac_io_ai_2020) /
      (1.0 + Math.exp(-(time - 2035.0) / 5.0));

  // 2. AI output
  const ai_output = fraction_industrial_output_ai * industrial_output;

  // 3. AI pollution intensity
  const eff_term =
    (1.0 +
      Math.exp(
        -config.base_ai_efficiency_improvement *
          (1.0 - dt_2020 * config.ai_efficiency_slowdown_rate)
      )) *
    dt_2020;
  const co2_part = config.ai_co2_intensity_2020 * eff_term;

  const ewaste_part =
    time < 2070.0
      ? config.ai_ewaste_intensity_2020 *
        (1.0 - config.ai_ewaste_improvement_rate * dt_2020)
      : 2.0e-5;

  const ai_pollution_intensity =
    (co2_part + ewaste_part) * config.co2_to_persist;

  // 4. AI pollution tech change multiplier
  const floor_term = 0.3 * (1.0 + 0.1 * dt_2020);
  const legacy_scaled = 0.7 * legacy_tech_multiplier;
  const ai_pollution_tech_change_multiplier = Math.min(
    5.0,
    Math.max(legacy_scaled, floor_term)
  );

  // 5. Persistent pollution generation from AI
  const persistent_pollution_generation_ai =
    time > 2100.0
      ? 0
      : (ai_output * ai_pollution_intensity) /
        ai_pollution_tech_change_multiplier;

  return {
    fraction_industrial_output_ai,
    ai_output,
    ai_pollution_intensity,
    ai_pollution_tech_change_multiplier,
    persistent_pollution_generation_ai,
  };
}

/**
 * Published Table 8 Benchmark values from Guliyeva et al. (LIMITS '25)
 */
export const LIMITS25_TABLE_8_BENCHMARKS = [
  { year: 2020, ai: 976172000, bau: 967120000, pctChange: 0.94 },
  { year: 2025, ai: 1.176e9, bau: 1.165e9, pctChange: 0.99 },
  { year: 2030, ai: 1.369e9, bau: 1.35259e9, pctChange: 1.21 },
  { year: 2035, ai: 1.495e9, bau: 1.46487e9, pctChange: 2.03 },
  { year: 2040, ai: 1.506e9, bau: 1.451e9, pctChange: 3.77 },
  { year: 2045, ai: 1.413e9, bau: 1.32373e9, pctChange: 6.77 },
  { year: 2050, ai: 1.26e9, bau: 1.13461e9, pctChange: 11.08 },
  { year: 2055, ai: 1.085e9, bau: 9.32903e8, pctChange: 16.29 },
  { year: 2060, ai: 9.10573e8, bau: 7.48269e8, pctChange: 21.69 },
  { year: 2065, ai: 7.49359e8, bau: 5.91696e8, pctChange: 26.65 },
  { year: 2070, ai: 6.07107e8, bau: 4.63889e8, pctChange: 30.87 },
  { year: 2075, ai: 4.86134e8, bau: 3.61763e8, pctChange: 34.38 },
  { year: 2080, ai: 3.86071e8, bau: 2.81165e8, pctChange: 37.31 },
  { year: 2085, ai: 3.04886e8, bau: 2.18014e8, pctChange: 39.85 },
  { year: 2090, ai: 2.3987e8, bau: 1.68755e8, pctChange: 42.14 },
  { year: 2095, ai: 1.88261e8, bau: 1.30473e8, pctChange: 44.29 },
  { year: 2100, ai: 1.47537e8, bau: 1.01504e8, pctChange: 45.35 },
];
