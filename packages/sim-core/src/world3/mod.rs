pub mod scenarios;

use crate::engine::table::LookupTable;
use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct World3State {
    pub time: f64,
    pub population: f64,
    pub industrial_capital: f64,
    pub service_capital: f64,
    pub agricultural_capital: f64,
    pub arable_land: f64,
    pub land_fertility: f64,
    pub non_renewable_resources: f64,
    pub persistent_pollution: f64,

    // Auxiliary outputs
    pub industrial_output: f64,
    pub industrial_output_per_capita: f64,
    pub food_per_capita: f64,
    pub service_output_per_capita: f64,
    pub life_expectancy: f64,
    pub persistent_pollution_generation_rate: f64,
    pub human_ecological_footprint: f64,
    pub fraction_capital_resource_extraction: f64,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct World3Parameters {
    pub initial_resources: f64,
    pub industrial_capital_output_ratio: f64,
    pub service_capital_output_ratio: f64,
    pub industrial_capital_depreciation_rate: f64,
    pub service_capital_depreciation_rate: f64,
    pub industrial_investment_fraction: f64,
    pub pollution_generation_factor: f64,
    pub pollution_absorption_time: f64,
    pub resource_technology_factor: f64,
    pub agricultural_technology_factor: f64,
    pub desired_completed_family_size: f64,
    pub birth_control_effectiveness: f64,
}

impl Default for World3Parameters {
    fn default() -> Self {
        Self {
            initial_resources: 1.0e12,
            industrial_capital_output_ratio: 3.0,
            service_capital_output_ratio: 1.2,
            industrial_capital_depreciation_rate: 0.04,
            service_capital_depreciation_rate: 0.04,
            industrial_investment_fraction: 0.26,
            pollution_generation_factor: 1.0,
            pollution_absorption_time: 1.5, // years
            resource_technology_factor: 1.0,
            agricultural_technology_factor: 1.0,
            desired_completed_family_size: 4.0,
            birth_control_effectiveness: 0.75,
        }
    }
}

pub struct World3Tables {
    pub fcaor_table: LookupTable,
    pub life_expectancy_food: LookupTable,
    pub life_expectancy_pollution: LookupTable,
    pub fertility_table: LookupTable,
}

impl Default for World3Tables {
    fn default() -> Self {
        Self {
            fcaor_table: LookupTable::new(
                "fcaor",
                vec![0.0, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1.0],
                vec![1.0, 0.9, 0.7, 0.5, 0.3, 0.15, 0.05, 0.05, 0.05, 0.05, 0.05],
            ),
            life_expectancy_food: LookupTable::new(
                "le_food",
                vec![0.0, 200.0, 400.0, 600.0, 800.0, 1000.0],
                vec![20.0, 35.0, 55.0, 68.0, 75.0, 80.0],
            ),
            life_expectancy_pollution: LookupTable::new(
                "le_pollution",
                vec![0.0, 10.0, 20.0, 30.0, 40.0, 50.0],
                vec![1.0, 0.95, 0.85, 0.70, 0.50, 0.30],
            ),
            fertility_table: LookupTable::new(
                "cbr_fertility",
                vec![0.0, 200.0, 400.0, 600.0, 800.0, 1000.0],
                vec![0.045, 0.040, 0.032, 0.024, 0.016, 0.012],
            ),
        }
    }
}

pub struct World3Model {
    pub state: World3State,
    pub params: World3Parameters,
    pub tables: World3Tables,
}

impl World3Model {
    pub fn new(params: World3Parameters) -> Self {
        let p0 = 1.6e9; // 1900 global population
        let ic0 = 8.0e10;
        let sc0 = 5.0e10;
        let ac0 = 1.0e10;
        let al0 = 0.9e9; // billion hectares
        let nr0 = params.initial_resources;
        let ppol0 = 2.5e7;

        let mut model = Self {
            state: World3State {
                time: 1900.0,
                population: p0,
                industrial_capital: ic0,
                service_capital: sc0,
                agricultural_capital: ac0,
                arable_land: al0,
                land_fertility: 600.0,
                non_renewable_resources: nr0,
                persistent_pollution: ppol0,
                industrial_output: 0.0,
                industrial_output_per_capita: 0.0,
                food_per_capita: 0.0,
                service_output_per_capita: 0.0,
                life_expectancy: 35.0,
                persistent_pollution_generation_rate: 0.0,
                human_ecological_footprint: 0.4,
                fraction_capital_resource_extraction: 0.05,
            },
            params,
            tables: World3Tables::default(),
        };
        model.compute_auxiliaries();
        model
    }

    pub fn compute_auxiliaries(&mut self) {
        let p = self.state.population.max(1.0);
        let nr_fraction_remaining =
            (self.state.non_renewable_resources / self.params.initial_resources).clamp(0.0, 1.0);
        let fcaor = self.tables.fcaor_table.lookup(nr_fraction_remaining)
            / self.params.resource_technology_factor;
        self.state.fraction_capital_resource_extraction = fcaor.clamp(0.05, 1.0);

        let ic_effective =
            self.state.industrial_capital * (1.0 - self.state.fraction_capital_resource_extraction);
        self.state.industrial_output =
            (ic_effective / self.params.industrial_capital_output_ratio).max(0.0);
        self.state.industrial_output_per_capita = self.state.industrial_output / p;

        let service_output =
            (self.state.service_capital / self.params.service_capital_output_ratio).max(0.0);
        self.state.service_output_per_capita = service_output / p;

        let ag_input_factor =
            ((self.state.industrial_output_per_capita / 100.0).sqrt()).clamp(0.2, 4.0);
        let total_food = self.state.arable_land
            * (self.state.land_fertility / 1000.0)
            * ag_input_factor
            * self.params.agricultural_technology_factor
            * 1600.0;
        self.state.food_per_capita = total_food / p;

        let le_base = self
            .tables
            .life_expectancy_food
            .lookup(self.state.food_per_capita);
        let ppol_norm = (self.state.persistent_pollution / 1.5e9).max(0.0);
        let le_pollution_mult = self.tables.life_expectancy_pollution.lookup(ppol_norm);
        self.state.life_expectancy = (le_base * le_pollution_mult).clamp(15.0, 90.0);

        // Persistent pollution generation from industry and agriculture (normalized to 1970 scale)
        let ppol_gen_ind = (self.state.industrial_output / 1.0e11)
            * 0.4e7
            * self.params.pollution_generation_factor;
        let ppol_gen_ag = (self.state.agricultural_capital / 1.0e11) * 0.1e7;
        self.state.persistent_pollution_generation_rate = ppol_gen_ind + ppol_gen_ag;

        // Human ecological footprint: land + absorption area
        let land_footprint = self.state.arable_land;
        let absorption_land = self.state.persistent_pollution_generation_rate / 1.0e7 * 0.1e9;
        self.state.human_ecological_footprint = (land_footprint + absorption_land) / 1.5e9;
    }

    /// Advances the World3 state by dt (years) using Euler or RK4
    pub fn step(&mut self, dt: f64) {
        self.compute_auxiliaries();

        let p = self.state.population.max(1.0);
        let death_rate = p / self.state.life_expectancy;
        let cbr = self
            .tables
            .fertility_table
            .lookup(self.state.industrial_output_per_capita);
        let birth_rate = p * cbr;

        let d_pop = birth_rate - death_rate;

        // Capital flows
        let ic_investment =
            self.state.industrial_output * self.params.industrial_investment_fraction;
        let ic_depreciation =
            self.state.industrial_capital * self.params.industrial_capital_depreciation_rate;
        let d_ic = ic_investment - ic_depreciation;

        let sc_investment = self.state.industrial_output * 0.12;
        let sc_depreciation =
            self.state.service_capital * self.params.service_capital_depreciation_rate;
        let d_sc = sc_investment - sc_depreciation;

        let ac_investment = self.state.industrial_output * 0.08;
        let ac_depreciation = self.state.agricultural_capital * 0.06;
        let d_ac = ac_investment - ac_depreciation;

        // Resource depletion
        let per_capita_resource_use =
            (self.state.industrial_output_per_capita / 200.0).powf(0.7) * 1.75;
        let resource_usage_rate = p * per_capita_resource_use.max(0.05);
        let d_nr = -resource_usage_rate;

        // Pollution accumulation & assimilation
        let ppol_assimilation =
            self.state.persistent_pollution / (self.params.pollution_absorption_time * 20.0);
        let d_ppol = self.state.persistent_pollution_generation_rate - ppol_assimilation;

        // Update state
        self.state.time += dt;
        self.state.population = (self.state.population + d_pop * dt).max(1.0);
        self.state.industrial_capital = (self.state.industrial_capital + d_ic * dt).max(0.0);
        self.state.service_capital = (self.state.service_capital + d_sc * dt).max(0.0);
        self.state.agricultural_capital = (self.state.agricultural_capital + d_ac * dt).max(0.0);
        self.state.non_renewable_resources =
            (self.state.non_renewable_resources + d_nr * dt).max(0.0);
        self.state.persistent_pollution = (self.state.persistent_pollution + d_ppol * dt).max(0.0);

        self.compute_auxiliaries();
    }
}
