use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct World26State {
    pub time: f64,

    // 1. Demography
    pub population: f64,
    pub births: f64,
    pub deaths: f64,
    pub life_expectancy: f64,
    pub total_fertility_rate: f64,

    // 2. Industrial Economy
    pub industrial_capital: f64,
    pub industrial_output: f64,
    pub industrial_output_per_capita: f64,
    pub industrial_investment: f64,
    pub capital_depreciation: f64,

    // 3. Services / Human Development
    pub service_capital: f64,
    pub service_output: f64,
    pub service_output_per_capita: f64,
    pub education_index: f64,

    // 4. Food / Agriculture
    pub arable_land: f64,
    pub agricultural_capital: f64,
    pub food_production: f64,
    pub food_per_capita: f64,
    pub cereal_yield: f64,
    pub fertilizer_consumption: f64,
    pub soil_fertility_index: f64,

    // 5. Non-Renewable Resources & Minerals
    pub aggregate_resources: f64,
    pub fossil_reserves: f64,
    pub copper_inventory: f64,
    pub lithium_inventory: f64,
    pub rare_earths_inventory: f64,
    pub mineral_stress_index: f64,

    // 6. Energy
    pub total_energy_demand_ej: f64,
    pub electricity_demand_twh: f64,
    pub clean_electricity_share: f64,
    pub solar_wind_capacity_gw: f64,
    pub nuclear_hydro_capacity_gw: f64,
    pub fossil_energy_ej: f64,
    pub storage_capacity_gwh: f64,

    // 7. Climate / Carbon
    pub co2_emissions_gt: f64,
    pub atmospheric_co2_ppm: f64,
    pub radiative_forcing: f64,
    pub temperature_anomaly: f64,
    pub ocean_temperature_anomaly: f64,
    pub climate_damage_fraction: f64,

    // 8. Persistent Pollution / Novel Entities
    pub persistent_pollution_stock: f64,
    pub novel_entities_index: f64,
    pub accumulated_ewaste_mt: f64,

    // 9. Water
    pub blue_water_consumption_km3: f64,
    pub green_water_anomaly_pct: f64,
    pub datacenter_water_consumption_km3: f64,
    pub water_stress_index: f64,

    // 10. Land
    pub forest_fraction_remaining: f64,
    pub urban_industrial_land_mha: f64,
    pub datacenter_land_mha: f64,

    // 11. Biosphere
    pub extinction_rate: f64,
    pub biodiversity_intactness_index: f64,

    // 12. Biogeochemical Flows
    pub nitrogen_fixation_tg: f64,
    pub phosphorus_flow_tg: f64,

    // 13. Ocean Acidification
    pub ocean_ph: f64,
    pub aragonite_saturation_state: f64,

    // 14. Atmospheric Aerosols
    pub aod_difference: f64,
    pub aerosol_cooling_effect: f64,

    // 15. Stratospheric Ozone
    pub ozone_dobson_units: f64,

    // 16. AI / Computing (Full Modular Sector)
    pub installed_compute_eflops: f64,
    pub accelerator_fleet_millions: f64,
    pub datacenter_capital_billion: f64,
    pub semiconductor_fab_capacity: f64,
    pub ai_electricity_demand_twh: f64,
    pub ai_electricity_share_pct: f64,
    pub ai_water_withdrawal_million_m3: f64,
    pub ai_operational_co2_gt: f64,
    pub ai_embodied_co2_gt: f64,
    pub ai_ewaste_annual_mt: f64,
    pub ai_productivity_index: f64,
    pub ai_hardware_efficiency_petaflops_per_kw: f64,
    pub ai_hardware_turnover_rate: f64,
    pub ai_hardware_recycling_share: f64,

    // 17. Inequality
    pub gini_coefficient: f64,
    pub labor_income_share: f64,
    pub poverty_headcount_pct: f64,

    // 18. Human Wellbeing
    pub human_wellbeing_index: f64,

    // 19. Social Tension / Governance Capacity
    pub social_tension_index: f64,
    pub governance_capacity_index: f64,

    // 20. Trade / Regional Metrics
    pub global_trade_openness: f64,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct World26Parameters {
    // Demography
    pub initial_population: f64,
    pub target_fertility_replacement: f64,

    // Economy
    pub capital_output_ratio: f64,
    pub industrial_depreciation_rate: f64,
    pub baseline_investment_share: f64,

    // Energy & Transition
    pub renewable_cost_learning_rate: f64,
    pub clean_energy_target_2050: f64,
    pub clean_energy_phase_in_start: f64,

    // Climate
    pub climate_sensitivity_ecs: f64,
    pub carbon_ocean_sink_rate: f64,
    pub carbon_land_sink_rate: f64,

    // Computing / AI Sector
    pub compute_demand_growth_rate: f64,
    pub hardware_lifetime_years: f64,
    pub datacenter_pue: f64,
    pub water_cooling_liters_per_kwh: f64,
    pub recycling_target_share: f64,
    pub ai_productivity_elasticity: f64,
    pub jevons_rebound_factor: f64,

    // Policy levers
    pub carbon_tax_usd_per_ton: f64,
    pub food_waste_reduction_pct: f64,
    pub circular_economy_mandate: f64,
    pub universal_basic_services_strength: f64,
}

impl Default for World26Parameters {
    fn default() -> Self {
        Self {
            initial_population: 1.6e9,
            target_fertility_replacement: 2.1,
            capital_output_ratio: 3.0,
            industrial_depreciation_rate: 0.05,
            baseline_investment_share: 0.22,
            renewable_cost_learning_rate: 0.22,
            clean_energy_target_2050: 0.85,
            clean_energy_phase_in_start: 2026.0,
            climate_sensitivity_ecs: 3.0,
            carbon_ocean_sink_rate: 0.018,
            carbon_land_sink_rate: 0.015,
            compute_demand_growth_rate: 0.35, // 35% annual compute expansion
            hardware_lifetime_years: 3.5,
            datacenter_pue: 1.25,
            water_cooling_liters_per_kwh: 1.8,
            recycling_target_share: 0.40,
            ai_productivity_elasticity: 0.08,
            jevons_rebound_factor: 1.2,
            carbon_tax_usd_per_ton: 0.0,
            food_waste_reduction_pct: 0.0,
            circular_economy_mandate: 0.0,
            universal_basic_services_strength: 0.0,
        }
    }
}
