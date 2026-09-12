pub mod boundaries;
pub mod sectors;
pub mod state;

pub use boundaries::{evaluate_planetary_boundaries, BoundaryEvaluation};
pub use sectors::{evaluate_derivatives, World26Derivatives};
pub use state::{World26Parameters, World26State};

use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct SimulationOutput {
    pub time: Vec<f64>,
    pub population: Vec<f64>,
    pub industrial_output_per_capita: Vec<f64>,
    pub atmospheric_co2_ppm: Vec<f64>,
    pub temperature_anomaly: Vec<f64>,
    pub installed_compute_eflops: Vec<f64>,
    pub ai_electricity_demand_twh: Vec<f64>,
    pub ai_electricity_share_pct: Vec<f64>,
    pub ai_ewaste_annual_mt: Vec<f64>,
    pub clean_electricity_share: Vec<f64>,
    pub food_per_capita: Vec<f64>,
    pub blue_water_consumption_km3: Vec<f64>,
    pub aragonite_saturation_state: Vec<f64>,
    pub human_wellbeing_index: Vec<f64>,
    pub gini_coefficient: Vec<f64>,
    pub boundary_evaluations: Vec<Vec<BoundaryEvaluation>>,
}

pub struct World26Model {
    pub state: World26State,
    pub params: World26Parameters,
}

impl World26Model {
    pub fn new(params: World26Parameters) -> Self {
        let state = World26State {
            time: 1900.0,
            population: 1.6e9,
            births: 6.0e7,
            deaths: 4.8e7,
            life_expectancy: 33.0,
            total_fertility_rate: 4.8,

            industrial_capital: 8.0e10,
            industrial_output: 2.6e10,
            industrial_output_per_capita: 16.2,
            industrial_investment: 5.7e9,
            capital_depreciation: 4.0e9,

            service_capital: 4.0e10,
            service_output: 2.6e10,
            service_output_per_capita: 16.2,
            education_index: 0.20,

            arable_land: 0.9e9,
            agricultural_capital: 1.0e10,
            food_production: 1.35e9,
            food_per_capita: 840.0,
            cereal_yield: 1.5,
            fertilizer_consumption: 2.0,
            soil_fertility_index: 1.0,

            aggregate_resources: 1.0e12,
            fossil_reserves: 50000.0,
            copper_inventory: 1000.0,     // Mt
            lithium_inventory: 30.0,      // Mt
            rare_earths_inventory: 120.0, // Mt
            mineral_stress_index: 0.05,

            total_energy_demand_ej: 30.0,
            electricity_demand_twh: 50.0,
            clean_electricity_share: 0.05,
            solar_wind_capacity_gw: 0.0,
            nuclear_hydro_capacity_gw: 5.0,
            fossil_energy_ej: 28.5,
            storage_capacity_gwh: 0.0,

            co2_emissions_gt: 2.0,
            atmospheric_co2_ppm: 295.0,
            radiative_forcing: 0.28,
            temperature_anomaly: -0.10,
            ocean_temperature_anomaly: -0.05,
            climate_damage_fraction: 0.0,

            persistent_pollution_stock: 2.5e7,
            novel_entities_index: 0.05,
            accumulated_ewaste_mt: 0.0,

            blue_water_consumption_km3: 450.0,
            green_water_anomaly_pct: 2.0,
            datacenter_water_consumption_km3: 0.0,
            water_stress_index: 0.12,

            forest_fraction_remaining: 0.95,
            urban_industrial_land_mha: 56.0,
            datacenter_land_mha: 0.0,

            extinction_rate: 2.0,
            biodiversity_intactness_index: 96.0,

            nitrogen_fixation_tg: 15.0,
            phosphorus_flow_tg: 2.0,

            ocean_ph: 8.16,
            aragonite_saturation_state: 3.35,

            aod_difference: 0.015,
            aerosol_cooling_effect: -0.05,

            ozone_dobson_units: 300.0,

            installed_compute_eflops: 0.0,
            accelerator_fleet_millions: 0.0,
            datacenter_capital_billion: 0.0,
            semiconductor_fab_capacity: 0.0,
            ai_electricity_demand_twh: 0.0,
            ai_electricity_share_pct: 0.0,
            ai_water_withdrawal_million_m3: 0.0,
            ai_operational_co2_gt: 0.0,
            ai_embodied_co2_gt: 0.0,
            ai_ewaste_annual_mt: 0.0,
            ai_productivity_index: 1.0,
            ai_hardware_efficiency_petaflops_per_kw: 0.01,
            ai_hardware_turnover_rate: 0.0,
            ai_hardware_recycling_share: 0.20,

            gini_coefficient: 0.42,
            labor_income_share: 0.60,
            poverty_headcount_pct: 55.0,

            human_wellbeing_index: 0.25,

            social_tension_index: 0.35,
            governance_capacity_index: 0.40,

            global_trade_openness: 0.10,
        };

        Self { state, params }
    }

    /// Step using Runge-Kutta 4th order (RK4)
    pub fn step(&mut self, dt: f64) {
        let (k1, _s1) = evaluate_derivatives(&self.state, &self.params);

        // Step 2
        let mut s_half = self.state.clone();
        s_half.time += 0.5 * dt;
        s_half.population += 0.5 * dt * k1.d_population;
        s_half.industrial_capital += 0.5 * dt * k1.d_industrial_capital;
        s_half.service_capital += 0.5 * dt * k1.d_service_capital;
        s_half.agricultural_capital += 0.5 * dt * k1.d_agricultural_capital;
        s_half.arable_land += 0.5 * dt * k1.d_arable_land;
        s_half.atmospheric_co2_ppm += 0.5 * dt * k1.d_atmospheric_co2;
        s_half.temperature_anomaly += 0.5 * dt * k1.d_temperature_anomaly;
        s_half.ocean_temperature_anomaly += 0.5 * dt * k1.d_ocean_temperature_anomaly;
        s_half.persistent_pollution_stock += 0.5 * dt * k1.d_persistent_pollution;
        s_half.accumulated_ewaste_mt += 0.5 * dt * k1.d_accumulated_ewaste;
        s_half.installed_compute_eflops += 0.5 * dt * k1.d_installed_compute;
        s_half.datacenter_capital_billion += 0.5 * dt * k1.d_datacenter_capital;
        s_half.fossil_reserves += 0.5 * dt * k1.d_fossil_reserves;
        s_half.copper_inventory += 0.5 * dt * k1.d_copper_inventory;
        s_half.lithium_inventory += 0.5 * dt * k1.d_lithium_inventory;

        let (k2, _) = evaluate_derivatives(&s_half, &self.params);

        // Step 3
        let mut s_half2 = self.state.clone();
        s_half2.time += 0.5 * dt;
        s_half2.population += 0.5 * dt * k2.d_population;
        s_half2.industrial_capital += 0.5 * dt * k2.d_industrial_capital;
        s_half2.service_capital += 0.5 * dt * k2.d_service_capital;
        s_half2.agricultural_capital += 0.5 * dt * k2.d_agricultural_capital;
        s_half2.arable_land += 0.5 * dt * k2.d_arable_land;
        s_half2.atmospheric_co2_ppm += 0.5 * dt * k2.d_atmospheric_co2;
        s_half2.temperature_anomaly += 0.5 * dt * k2.d_temperature_anomaly;
        s_half2.ocean_temperature_anomaly += 0.5 * dt * k2.d_ocean_temperature_anomaly;
        s_half2.persistent_pollution_stock += 0.5 * dt * k2.d_persistent_pollution;
        s_half2.accumulated_ewaste_mt += 0.5 * dt * k2.d_accumulated_ewaste;
        s_half2.installed_compute_eflops += 0.5 * dt * k2.d_installed_compute;
        s_half2.datacenter_capital_billion += 0.5 * dt * k2.d_datacenter_capital;
        s_half2.fossil_reserves += 0.5 * dt * k2.d_fossil_reserves;
        s_half2.copper_inventory += 0.5 * dt * k2.d_copper_inventory;
        s_half2.lithium_inventory += 0.5 * dt * k2.d_lithium_inventory;

        let (k3, _) = evaluate_derivatives(&s_half2, &self.params);

        // Step 4
        let mut s_full = self.state.clone();
        s_full.time += dt;
        s_full.population += dt * k3.d_population;
        s_full.industrial_capital += dt * k3.d_industrial_capital;
        s_full.service_capital += dt * k3.d_service_capital;
        s_full.agricultural_capital += dt * k3.d_agricultural_capital;
        s_full.arable_land += dt * k3.d_arable_land;
        s_full.atmospheric_co2_ppm += dt * k3.d_atmospheric_co2;
        s_full.temperature_anomaly += dt * k3.d_temperature_anomaly;
        s_full.ocean_temperature_anomaly += dt * k3.d_ocean_temperature_anomaly;
        s_full.persistent_pollution_stock += dt * k3.d_persistent_pollution;
        s_full.accumulated_ewaste_mt += dt * k3.d_accumulated_ewaste;
        s_full.installed_compute_eflops += dt * k3.d_installed_compute;
        s_full.datacenter_capital_billion += dt * k3.d_datacenter_capital;
        s_full.fossil_reserves += dt * k3.d_fossil_reserves;
        s_full.copper_inventory += dt * k3.d_copper_inventory;
        s_full.lithium_inventory += dt * k3.d_lithium_inventory;

        let (k4, _) = evaluate_derivatives(&s_full, &self.params);

        // Combine RK4 increments
        self.state.time += dt;
        self.state.population = (self.state.population
            + (dt / 6.0)
                * (k1.d_population
                    + 2.0 * k2.d_population
                    + 2.0 * k3.d_population
                    + k4.d_population))
            .max(1.0);
        self.state.industrial_capital = (self.state.industrial_capital
            + (dt / 6.0)
                * (k1.d_industrial_capital
                    + 2.0 * k2.d_industrial_capital
                    + 2.0 * k3.d_industrial_capital
                    + k4.d_industrial_capital))
            .max(0.0);
        self.state.service_capital = (self.state.service_capital
            + (dt / 6.0)
                * (k1.d_service_capital
                    + 2.0 * k2.d_service_capital
                    + 2.0 * k3.d_service_capital
                    + k4.d_service_capital))
            .max(0.0);
        self.state.agricultural_capital = (self.state.agricultural_capital
            + (dt / 6.0)
                * (k1.d_agricultural_capital
                    + 2.0 * k2.d_agricultural_capital
                    + 2.0 * k3.d_agricultural_capital
                    + k4.d_agricultural_capital))
            .max(0.0);
        self.state.arable_land = (self.state.arable_land
            + (dt / 6.0)
                * (k1.d_arable_land
                    + 2.0 * k2.d_arable_land
                    + 2.0 * k3.d_arable_land
                    + k4.d_arable_land))
            .max(0.0);
        self.state.atmospheric_co2_ppm = (self.state.atmospheric_co2_ppm
            + (dt / 6.0)
                * (k1.d_atmospheric_co2
                    + 2.0 * k2.d_atmospheric_co2
                    + 2.0 * k3.d_atmospheric_co2
                    + k4.d_atmospheric_co2))
            .max(200.0);
        self.state.temperature_anomaly += (dt / 6.0)
            * (k1.d_temperature_anomaly
                + 2.0 * k2.d_temperature_anomaly
                + 2.0 * k3.d_temperature_anomaly
                + k4.d_temperature_anomaly);
        self.state.ocean_temperature_anomaly += (dt / 6.0)
            * (k1.d_ocean_temperature_anomaly
                + 2.0 * k2.d_ocean_temperature_anomaly
                + 2.0 * k3.d_ocean_temperature_anomaly
                + k4.d_ocean_temperature_anomaly);
        self.state.persistent_pollution_stock = (self.state.persistent_pollution_stock
            + (dt / 6.0)
                * (k1.d_persistent_pollution
                    + 2.0 * k2.d_persistent_pollution
                    + 2.0 * k3.d_persistent_pollution
                    + k4.d_persistent_pollution))
            .max(0.0);
        self.state.accumulated_ewaste_mt = (self.state.accumulated_ewaste_mt
            + (dt / 6.0)
                * (k1.d_accumulated_ewaste
                    + 2.0 * k2.d_accumulated_ewaste
                    + 2.0 * k3.d_accumulated_ewaste
                    + k4.d_accumulated_ewaste))
            .max(0.0);
        self.state.installed_compute_eflops = (self.state.installed_compute_eflops
            + (dt / 6.0)
                * (k1.d_installed_compute
                    + 2.0 * k2.d_installed_compute
                    + 2.0 * k3.d_installed_compute
                    + k4.d_installed_compute))
            .max(0.0);
        self.state.datacenter_capital_billion = (self.state.datacenter_capital_billion
            + (dt / 6.0)
                * (k1.d_datacenter_capital
                    + 2.0 * k2.d_datacenter_capital
                    + 2.0 * k3.d_datacenter_capital
                    + k4.d_datacenter_capital))
            .max(0.0);
        self.state.fossil_reserves = (self.state.fossil_reserves
            + (dt / 6.0)
                * (k1.d_fossil_reserves
                    + 2.0 * k2.d_fossil_reserves
                    + 2.0 * k3.d_fossil_reserves
                    + k4.d_fossil_reserves))
            .max(0.0);
        self.state.copper_inventory = (self.state.copper_inventory
            + (dt / 6.0)
                * (k1.d_copper_inventory
                    + 2.0 * k2.d_copper_inventory
                    + 2.0 * k3.d_copper_inventory
                    + k4.d_copper_inventory))
            .max(0.0);
        self.state.lithium_inventory = (self.state.lithium_inventory
            + (dt / 6.0)
                * (k1.d_lithium_inventory
                    + 2.0 * k2.d_lithium_inventory
                    + 2.0 * k3.d_lithium_inventory
                    + k4.d_lithium_inventory))
            .max(0.0);

        // Update auxiliaries for the new state
        let (_, updated_aux) = evaluate_derivatives(&self.state, &self.params);
        self.state = updated_aux;
    }
}

pub fn run_world26_simulation(
    params: World26Parameters,
    start_year: f64,
    end_year: f64,
    dt: f64,
) -> SimulationOutput {
    let mut model = World26Model::new(params);
    let mut output = SimulationOutput {
        time: Vec::new(),
        population: Vec::new(),
        industrial_output_per_capita: Vec::new(),
        atmospheric_co2_ppm: Vec::new(),
        temperature_anomaly: Vec::new(),
        installed_compute_eflops: Vec::new(),
        ai_electricity_demand_twh: Vec::new(),
        ai_electricity_share_pct: Vec::new(),
        ai_ewaste_annual_mt: Vec::new(),
        clean_electricity_share: Vec::new(),
        food_per_capita: Vec::new(),
        blue_water_consumption_km3: Vec::new(),
        aragonite_saturation_state: Vec::new(),
        human_wellbeing_index: Vec::new(),
        gini_coefficient: Vec::new(),
        boundary_evaluations: Vec::new(),
    };

    let mut current_time = start_year;
    while current_time <= end_year {
        output.time.push(model.state.time);
        output.population.push(model.state.population);
        output
            .industrial_output_per_capita
            .push(model.state.industrial_output_per_capita);
        output
            .atmospheric_co2_ppm
            .push(model.state.atmospheric_co2_ppm);
        output
            .temperature_anomaly
            .push(model.state.temperature_anomaly);
        output
            .installed_compute_eflops
            .push(model.state.installed_compute_eflops);
        output
            .ai_electricity_demand_twh
            .push(model.state.ai_electricity_demand_twh);
        output
            .ai_electricity_share_pct
            .push(model.state.ai_electricity_share_pct);
        output
            .ai_ewaste_annual_mt
            .push(model.state.ai_ewaste_annual_mt);
        output
            .clean_electricity_share
            .push(model.state.clean_electricity_share);
        output.food_per_capita.push(model.state.food_per_capita);
        output
            .blue_water_consumption_km3
            .push(model.state.blue_water_consumption_km3);
        output
            .aragonite_saturation_state
            .push(model.state.aragonite_saturation_state);
        output
            .human_wellbeing_index
            .push(model.state.human_wellbeing_index);
        output.gini_coefficient.push(model.state.gini_coefficient);
        output
            .boundary_evaluations
            .push(evaluate_planetary_boundaries(&model.state));

        model.step(dt);
        current_time += dt;
    }

    output
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_world26_baseline_run() {
        let params = World26Parameters::default();
        let out = run_world26_simulation(params, 1900.0, 2100.0, 0.25);
        assert_eq!(*out.time.first().unwrap(), 1900.0);
        assert!(*out.time.last().unwrap() >= 2100.0);

        // Check 2026 calibration consistency
        let idx_2026 = out
            .time
            .iter()
            .position(|&t| (t - 2026.0).abs() < 0.3)
            .unwrap();
        let pop_2026 = out.population[idx_2026] / 1.0e9;
        let co2_2026 = out.atmospheric_co2_ppm[idx_2026];
        let temp_2026 = out.temperature_anomaly[idx_2026];

        println!(
            "Simulated 2026 Population: {:.2}B, CO2: {:.1} ppm, Temp: +{:.2}°C",
            pop_2026, co2_2026, temp_2026
        );
        assert!(
            pop_2026 > 7.5 && pop_2026 < 8.5,
            "Population in 2026 should be ~8B"
        );
        assert!(
            co2_2026 > 410.0 && co2_2026 < 440.0,
            "CO2 in 2026 should be ~426 ppm"
        );
        assert!(
            temp_2026 > 0.9 && temp_2026 < 1.6,
            "Temp in 2026 should be ~1.2-1.3°C"
        );
    }
}
