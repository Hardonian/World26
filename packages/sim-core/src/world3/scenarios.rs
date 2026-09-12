use super::{World3Model, World3Parameters, World3State};

#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub enum World3ScenarioType {
    Bau,
    Bau2,
    ComprehensiveTechnology,
    StabilizedWorld,
}

pub fn create_world3_scenario(scenario_type: World3ScenarioType) -> World3Model {
    let mut params = World3Parameters::default();

    match scenario_type {
        World3ScenarioType::Bau => {
            // Default parameters represent standard Business-as-Usual
        }
        World3ScenarioType::Bau2 => {
            // High resources: double initial resource endowment
            params.initial_resources = 2.0e12;
        }
        World3ScenarioType::ComprehensiveTechnology => {
            // Tech fix: high resources + pollution control tech + ag tech + recycling
            params.initial_resources = 2.0e12;
            params.pollution_generation_factor = 0.25;
            params.resource_technology_factor = 2.0;
            params.agricultural_technology_factor = 1.6;
        }
        World3ScenarioType::StabilizedWorld => {
            // Stabilized: perfect family planning + industrial equilibrium
            params.desired_completed_family_size = 2.0;
            params.birth_control_effectiveness = 1.0;
            params.industrial_investment_fraction = 0.14; // Matches depreciation
            params.pollution_generation_factor = 0.30;
            params.resource_technology_factor = 2.0;
        }
    }

    World3Model::new(params)
}

pub fn run_world3_simulation(
    scenario_type: World3ScenarioType,
    start_year: f64,
    end_year: f64,
    dt: f64,
) -> Vec<World3State> {
    let mut model = create_world3_scenario(scenario_type);
    let mut results = Vec::new();
    results.push(model.state.clone());

    let mut current_time = start_year;
    while current_time < end_year {
        model.step(dt);
        results.push(model.state.clone());
        current_time += dt;
    }

    results
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_world3_bau_overshoot_and_decline() {
        let results = run_world3_simulation(World3ScenarioType::Bau, 1900.0, 2100.0, 0.5);
        assert_eq!(results.first().unwrap().time, 1900.0);
        assert_eq!(results.last().unwrap().time, 2100.0);

        // Find population peak
        let mut max_pop = 0.0;
        let mut peak_year = 1900.0;
        for r in &results {
            if r.population > max_pop {
                max_pop = r.population;
                peak_year = r.time;
            }
        }

        // In standard World3 BAU, population peaks in the 21st century (between 2025 and 2075)
        for r in &results {
            if (r.time - 1980.0).abs() < 0.3
                || (r.time - 1992.0).abs() < 0.3
                || (r.time - 2005.0).abs() < 0.3
            {
                println!(
                    "Year {:.1}: Pop={:.2}B, LE={:.1}, FoodPC={:.1}, NR_frac={:.2}, Pol={:.2e}",
                    r.time,
                    r.population / 1e9,
                    r.life_expectancy,
                    r.food_per_capita,
                    r.non_renewable_resources / 1e12,
                    r.persistent_pollution
                );
            }
        }
        println!(
            "BAU Peak Population: {:.2} billion in year {:.1}",
            max_pop / 1.0e9,
            peak_year
        );
        assert!((2025.0..=2075.0).contains(&peak_year));
        assert!(max_pop > 7.0e9 && max_pop < 1.4e10);
    }
}
