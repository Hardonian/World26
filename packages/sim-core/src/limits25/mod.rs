use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Limits25Parameters {
    pub co2_to_persist: f64,
    pub ai_co2_intensity_2020: f64,
    pub ai_ewaste_intensity_2020: f64,
    pub frac_io_ai_2020: f64,
    pub frac_io_ai_2050: f64,
    pub base_ai_efficiency_improvement: f64,
    pub ai_efficiency_slowdown_rate: f64,
    pub ai_ewaste_improvement_rate: f64,
}

impl Default for Limits25Parameters {
    fn default() -> Self {
        Self {
            co2_to_persist: 2.3e-4,
            ai_co2_intensity_2020: 0.15,
            ai_ewaste_intensity_2020: 3.5e-4,
            frac_io_ai_2020: 0.013,
            frac_io_ai_2050: 0.06,
            base_ai_efficiency_improvement: 0.25,
            ai_efficiency_slowdown_rate: 0.04,
            ai_ewaste_improvement_rate: 0.03,
        }
    }
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Limits25Point {
    pub time: f64,
    pub persistent_pollution_bau: f64,
    pub persistent_pollution_ai: f64,
    pub pct_change_from_bau: f64,
    pub ai_output: f64,
    pub fraction_industrial_output_ai: f64,
    pub persistent_pollution_generation_ai: f64,
}

/// Computes the exact AI persistent pollution terms according to Guliyeva et al. (LIMITS '25)
pub fn compute_limits25_ai_terms(
    time: f64,
    industrial_output: f64,
    legacy_tech_multiplier: f64,
    params: &Limits25Parameters,
) -> (f64, f64, f64, f64) {
    if time < 2020.0 {
        return (0.0, 0.0, 0.0, 0.0);
    }

    let dt_2020 = (time - 2020.0).max(0.0);

    // 1. Fraction of industrial output allocated to AI
    let frac_io_ai = params.frac_io_ai_2020
        + (params.frac_io_ai_2050 - params.frac_io_ai_2020)
            / (1.0 + (-(time - 2035.0) / 5.0).exp());

    // 2. AI output
    let ai_out = frac_io_ai * industrial_output;

    // 3. AI pollution intensity
    let eff_term = (1.0
        + (-params.base_ai_efficiency_improvement
            * (1.0 - dt_2020 * params.ai_efficiency_slowdown_rate))
            .exp())
        * dt_2020;
    let co2_part = params.ai_co2_intensity_2020 * eff_term;

    let ewaste_part = if time < 2070.0 {
        params.ai_ewaste_intensity_2020 * (1.0 - params.ai_ewaste_improvement_rate * dt_2020)
    } else {
        2.0e-5
    };

    let ai_pol_intensity = (co2_part + ewaste_part) * params.co2_to_persist;

    // 4. AI pollution tech change multiplier
    let floor_term = 0.3 * (1.0 + 0.1 * dt_2020);
    let legacy_scaled = 0.7 * legacy_tech_multiplier;
    let tech_mult = 5.0_f64.min(legacy_scaled.max(floor_term));

    // 5. Persistent pollution generation from AI
    let ppol_gen_ai = if time > 2100.0 {
        0.0
    } else {
        ai_out * ai_pol_intensity / tech_mult
    };

    (frac_io_ai, ai_out, ai_pol_intensity, ppol_gen_ai)
}

/// Canonical published benchmark values from Table 8 of Guliyeva et al. (2025)
pub const TABLE_8_BENCHMARKS: &[(f64, f64, f64, f64)] = &[
    (2020.0, 976172000.0, 967120000.0, 0.94),
    (2025.0, 1.176e9, 1.165e9, 0.99),
    (2030.0, 1.369e9, 1.35259e9, 1.21),
    (2035.0, 1.495e9, 1.46487e9, 2.03),
    (2040.0, 1.506e9, 1.451e9, 3.77),
    (2045.0, 1.413e9, 1.32373e9, 6.77),
    (2050.0, 1.26e9, 1.13461e9, 11.08),
    (2055.0, 1.085e9, 9.32903e8, 16.29),
    (2060.0, 9.10573e8, 7.48269e8, 21.69),
    (2065.0, 7.49359e8, 5.91696e8, 26.65),
    (2070.0, 6.07107e8, 4.63889e8, 30.87),
    (2075.0, 4.86134e8, 3.61763e8, 34.38),
    (2080.0, 3.86071e8, 2.81165e8, 37.31),
    (2085.0, 3.04886e8, 2.18014e8, 39.85),
    (2090.0, 2.3987e8, 1.68755e8, 42.14),
    (2095.0, 1.88261e8, 1.30473e8, 44.29),
    (2100.0, 1.47537e8, 1.01504e8, 45.35),
];

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_limits25_equations() {
        let params = Limits25Parameters::default();
        let (frac, ai_out, intensity, gen_ai) =
            compute_limits25_ai_terms(2030.0, 1.0e12, 1.0, &params);
        assert!(frac > 0.013 && frac < 0.06);
        assert!(ai_out > 0.0);
        assert!(intensity > 0.0);
        assert!(gen_ai > 0.0);
    }
}
