use crate::world26::{run_world26_simulation, World26Parameters};
use rand::{Rng, SeedableRng};
use rand_pcg::Pcg64;
use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct QuantileBands {
    pub p10: Vec<f64>,
    pub p50: Vec<f64>,
    pub p90: Vec<f64>,
    pub min: Vec<f64>,
    pub max: Vec<f64>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct MonteCarloResult {
    pub iterations: usize,
    pub seed: u64,
    pub time: Vec<f64>,
    pub population_bands: QuantileBands,
    pub temperature_bands: QuantileBands,
    pub compute_bands: QuantileBands,
    pub wellbeing_bands: QuantileBands,
}

pub fn run_monte_carlo(
    base_params: &World26Parameters,
    iterations: usize,
    seed: u64,
    start_year: f64,
    end_year: f64,
    dt: f64,
) -> MonteCarloResult {
    let mut rng = Pcg64::seed_from_u64(seed);

    let mut pop_matrix: Vec<Vec<f64>> = Vec::new();
    let mut temp_matrix: Vec<Vec<f64>> = Vec::new();
    let mut compute_matrix: Vec<Vec<f64>> = Vec::new();
    let mut wellbeing_matrix: Vec<Vec<f64>> = Vec::new();
    let mut time_series: Vec<f64> = Vec::new();

    for i in 0..iterations {
        let mut sample_params = base_params.clone();

        // Sample climate sensitivity ECS: uniform [2.0, 4.5]
        sample_params.climate_sensitivity_ecs = rng.gen_range(2.0..4.5);

        // Sample AI compute demand growth: uniform [0.20, 0.45]
        sample_params.compute_demand_growth_rate = rng.gen_range(0.20..0.45);

        // Sample clean energy target: uniform [0.70, 0.95]
        sample_params.clean_energy_target_2050 = rng.gen_range(0.70..0.95);

        // Sample AI productivity elasticity: uniform [0.03, 0.15]
        sample_params.ai_productivity_elasticity = rng.gen_range(0.03..0.15);

        let sim = run_world26_simulation(sample_params, start_year, end_year, dt);

        if i == 0 {
            time_series = sim.time.clone();
        }

        pop_matrix.push(sim.population);
        temp_matrix.push(sim.temperature_anomaly);
        compute_matrix.push(sim.installed_compute_eflops);
        wellbeing_matrix.push(sim.human_wellbeing_index);
    }

    MonteCarloResult {
        iterations,
        seed,
        time: time_series,
        population_bands: compute_quantiles(&pop_matrix),
        temperature_bands: compute_quantiles(&temp_matrix),
        compute_bands: compute_quantiles(&compute_matrix),
        wellbeing_bands: compute_quantiles(&wellbeing_matrix),
    }
}

fn compute_quantiles(matrix: &[Vec<f64>]) -> QuantileBands {
    let num_steps = matrix[0].len();
    let mut p10 = Vec::with_capacity(num_steps);
    let mut p50 = Vec::with_capacity(num_steps);
    let mut p90 = Vec::with_capacity(num_steps);
    let mut min = Vec::with_capacity(num_steps);
    let mut max = Vec::with_capacity(num_steps);

    for step in 0..num_steps {
        let mut col: Vec<f64> = matrix.iter().map(|row| row[step]).collect();
        col.sort_by(|a, b| a.partial_cmp(b).unwrap_or(std::cmp::Ordering::Equal));

        let n = col.len();
        let idx_10 = ((n as f64) * 0.10).floor() as usize;
        let idx_50 = ((n as f64) * 0.50).floor() as usize;
        let idx_90 = ((n as f64) * 0.90).min((n - 1) as f64).floor() as usize;

        min.push(col[0]);
        p10.push(col[idx_10]);
        p50.push(col[idx_50]);
        p90.push(col[idx_90]);
        max.push(col[n - 1]);
    }

    QuantileBands {
        p10,
        p50,
        p90,
        min,
        max,
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_monte_carlo_reproducibility() {
        let params = World26Parameters::default();
        let run1 = run_monte_carlo(&params, 5, 42, 1990.0, 2030.0, 0.5);
        let run2 = run_monte_carlo(&params, 5, 42, 1990.0, 2030.0, 0.5);

        assert_eq!(run1.temperature_bands.p50, run2.temperature_bands.p50);
        assert_eq!(run1.population_bands.p10, run2.population_bands.p10);
    }
}
