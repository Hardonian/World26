use super::state::{World26Parameters, World26State};

pub struct World26Derivatives {
    pub d_population: f64,
    pub d_industrial_capital: f64,
    pub d_service_capital: f64,
    pub d_agricultural_capital: f64,
    pub d_arable_land: f64,
    pub d_atmospheric_co2: f64,
    pub d_temperature_anomaly: f64,
    pub d_ocean_temperature_anomaly: f64,
    pub d_persistent_pollution: f64,
    pub d_accumulated_ewaste: f64,
    pub d_installed_compute: f64,
    pub d_datacenter_capital: f64,
    pub d_fossil_reserves: f64,
    pub d_copper_inventory: f64,
    pub d_lithium_inventory: f64,
}

pub fn evaluate_derivatives(
    state: &World26State,
    params: &World26Parameters,
) -> (World26Derivatives, World26State) {
    let mut s = state.clone();
    let p = s.population.max(1.0);
    let t = s.time;

    // --- 16. AI / Computing Sector Dynamics ---
    let ai_active = t >= 2015.0;
    let t_ai = (t - 2020.0).max(0.0);

    // Compute efficiency improvement (PFLOPS per kW)
    let eff_growth = (0.22 * (1.0 - 0.03 * t_ai)).max(0.02);
    s.ai_hardware_efficiency_petaflops_per_kw = 0.05 * (1.0 + eff_growth).powf(t_ai);

    // Compute demand expansion with Jevons rebound
    let base_demand_growth = if ai_active {
        params.compute_demand_growth_rate * (1.0 + (params.jevons_rebound_factor - 1.0) * 0.2)
    } else {
        0.05
    };

    // Installed compute growth ODE
    let current_compute = s.installed_compute_eflops.max(0.001);
    let d_installed_compute = if ai_active {
        current_compute * base_demand_growth - (current_compute / params.hardware_lifetime_years)
    } else {
        0.0
    };

    s.accelerator_fleet_millions = (s.installed_compute_eflops * 1000.0 / 2.0).max(0.0); // ~2 PFLOPS per accelerator
    s.datacenter_capital_billion = s.accelerator_fleet_millions * 35.0; // $35k per accelerator node with infrastructure

    // AI Electricity Consumption (TWh/yr)
    // 1 EFLOPS = 10^18 FLOPS. Power = Compute / Efficiency
    let ai_power_gw = (s.installed_compute_eflops * 1000.0
        / s.ai_hardware_efficiency_petaflops_per_kw.max(0.01))
        * 1e-3;
    s.ai_electricity_demand_twh = ai_power_gw * 8.76 * params.datacenter_pue;

    // AI Water Cooling Consumption (km3/yr)
    // liters per kWh -> km3: 1 km3 = 10^12 liters. 1 TWh = 10^9 kWh.
    let ai_water_liters = s.ai_electricity_demand_twh * 1.0e9 * params.water_cooling_liters_per_kwh;
    s.datacenter_water_consumption_km3 = ai_water_liters / 1.0e12;
    s.ai_water_withdrawal_million_m3 = s.datacenter_water_consumption_km3 * 1000.0;

    // AI Hardware turnover & E-waste (Mt/yr)
    let accelerator_retirements = s.accelerator_fleet_millions / params.hardware_lifetime_years;
    s.ai_hardware_turnover_rate = accelerator_retirements;
    s.ai_hardware_recycling_share =
        (0.20 + 0.015 * t_ai + params.circular_economy_mandate * 0.4).clamp(0.15, 0.85);

    // Each accelerator server node contains ~25 kg materials
    let gross_ewaste_mt = (accelerator_retirements * 1.0e6 * 25.0) / 1.0e9;
    s.ai_ewaste_annual_mt = gross_ewaste_mt * (1.0 - s.ai_hardware_recycling_share);
    let d_accumulated_ewaste = s.ai_ewaste_annual_mt;

    // AI Productivity Dividend on TFP
    s.ai_productivity_index = 1.0
        + params.ai_productivity_elasticity
            * (s.installed_compute_eflops / 10.0).max(0.0).powf(0.35);

    // --- 6. Energy Sector ---
    let per_capita_energy_gj =
        18.0 + 60.0 * (s.industrial_output_per_capita / 800.0).clamp(0.0, 1.2);
    s.total_energy_demand_ej = (p * per_capita_energy_gj) / 1.0e9;

    // Clean electricity transition ramp
    let transition_years = (t - params.clean_energy_phase_in_start).max(0.0);
    let target_share = if t >= params.clean_energy_phase_in_start {
        let ramp = (transition_years / 24.0).clamp(0.0, 1.0);
        0.38 + ramp * (params.clean_energy_target_2050 - 0.38)
    } else {
        (0.05 + 0.0028 * (t - 1900.0)).clamp(0.05, 0.38)
    };
    s.clean_electricity_share = target_share.clamp(0.05, 0.98);

    s.electricity_demand_twh =
        s.total_energy_demand_ej * 277.78 * 0.22 + s.ai_electricity_demand_twh;
    s.ai_electricity_share_pct =
        (s.ai_electricity_demand_twh / s.electricity_demand_twh.max(1.0)) * 100.0;

    s.fossil_energy_ej = s.total_energy_demand_ej * (1.0 - s.clean_electricity_share * 0.5);

    // Critical minerals demand (renewables + AI compute)
    let solar_wind_additions_gw =
        (s.clean_electricity_share * s.electricity_demand_twh / 1500.0).max(10.0);
    let copper_demand_mt =
        solar_wind_additions_gw * 0.0045 + (s.accelerator_fleet_millions * 0.001);
    let lithium_demand_mt = solar_wind_additions_gw * 0.0008;

    let d_fossil_reserves = -(s.fossil_energy_ej * 0.02);
    let d_copper_inventory = -copper_demand_mt;
    let d_lithium_inventory = -lithium_demand_mt;
    s.mineral_stress_index = (1.0 - (s.copper_inventory / 1000.0).clamp(0.0, 1.0)) * 0.6
        + (1.0 - (s.lithium_inventory / 30.0).clamp(0.0, 1.0)) * 0.4;

    // --- 7. Climate / Carbon Sector ---
    let grid_carbon_intensity = 0.45 * (1.0 - s.clean_electricity_share); // tCO2 / MWh
    let operational_ai_co2 = (s.ai_electricity_demand_twh * 1.0e6 * grid_carbon_intensity) / 1.0e9; // Gt CO2
    s.ai_operational_co2_gt = operational_ai_co2;

    let embodied_ai_co2 = (s.ai_hardware_turnover_rate * 1.0e6 * 1.2) / 1.0e9; // 1.2 tCO2 embodied per server node
    s.ai_embodied_co2_gt = embodied_ai_co2;

    let fossil_co2 = s.fossil_energy_ej * 0.068; // ~68 Mt CO2 per EJ fossil
    let land_use_co2 = (3.5 * (1.0 - (t - 1960.0).max(0.0) / 100.0)).max(0.5);
    s.co2_emissions_gt = fossil_co2 + land_use_co2 + s.ai_operational_co2_gt + s.ai_embodied_co2_gt;

    // Carbon cycle: airborne fraction is ~48% of total emissions, 1 ppm = 7.82 Gt CO2
    let d_atmospheric_co2 = (s.co2_emissions_gt * 0.48) / 3.8;

    // Radiative forcing: Delta F = 5.35 * ln(C / C0)
    s.radiative_forcing = 5.35 * (s.atmospheric_co2_ppm / 280.0).ln();

    // 2-box ocean heat thermal response
    let climate_feedback_lambda = 3.71 / params.climate_sensitivity_ecs; // W/m2/°C
    let ocean_heat_exchange_gamma = 0.73; // W/m2/°C
    let c_surface = 5.0; // W yr / m2 / °C
    let c_ocean = 100.0; // deep ocean heat capacity

    let d_temperature_anomaly = (s.radiative_forcing
        - climate_feedback_lambda * s.temperature_anomaly
        - ocean_heat_exchange_gamma * (s.temperature_anomaly - s.ocean_temperature_anomaly))
        / c_surface;

    let d_ocean_temperature_anomaly = (ocean_heat_exchange_gamma
        * (s.temperature_anomaly - s.ocean_temperature_anomaly))
        / c_ocean;

    // Climate damage to economic capital (Nordhaus / Burke quadratic damage function)
    s.climate_damage_fraction =
        0.0028 * s.temperature_anomaly.powi(2) + 0.0005 * s.temperature_anomaly.powi(3);

    // --- 13. Ocean Acidification ---
    // Aragonite saturation state Omega_arag falls as atmospheric CO2 rises
    s.aragonite_saturation_state =
        (3.44 * (280.0 / s.atmospheric_co2_ppm).powf(0.75)).clamp(1.0, 3.8);
    s.ocean_ph = 8.18 - 0.35 * (s.atmospheric_co2_ppm / 280.0).log10();

    // --- 14. Aerosols & 15. Ozone ---
    s.aod_difference = (0.05 + (fossil_co2 / 40.0) * 0.035).clamp(0.01, 0.15);
    s.aerosol_cooling_effect = -0.4 * (s.aod_difference / 0.10);
    let ozone_recovery_progress = ((t - 1990.0) / 60.0).clamp(0.0, 1.0);
    s.ozone_dobson_units = 270.0 + 20.0 * ozone_recovery_progress;

    // --- 4. Food & Agriculture ---
    let ag_tech_factor = 1.0 + 0.01 * (t - 1960.0).max(0.0);
    let climate_crop_stress = (1.0 - 0.05 * s.temperature_anomaly.max(0.0)).clamp(0.5, 1.0);
    s.cereal_yield = (1.5 * ag_tech_factor * climate_crop_stress).clamp(1.0, 6.0); // tonnes / ha
    s.fertilizer_consumption =
        (p * 25.0 * (1.0 - params.food_waste_reduction_pct * 0.5)).clamp(30.0, 240.0); // Mt
    s.food_production = s.arable_land * s.cereal_yield * 1000.0; // million tonnes
    s.food_per_capita = (s.food_production * 1.0e6) / p; // kg per capita per year

    let d_arable_land = if s.arable_land > 0.8e9 {
        -0.001 * s.arable_land * s.temperature_anomaly.max(0.0)
    } else {
        0.0
    };

    // --- 12. Biogeochemical Flows ---
    s.nitrogen_fixation_tg = s.fertilizer_consumption * 0.65 + 30.0; // industrial Haber-Bosch + combustion
    s.phosphorus_flow_tg = s.fertilizer_consumption * 0.12 + 4.0;

    // --- 9. Water Sector ---
    let ag_water_km3 = s.food_production * 0.0012; // 1200 m3 per tonne of grain
    let ind_water_km3 = s.industrial_capital * 1e-12 * 400.0;
    s.blue_water_consumption_km3 =
        ag_water_km3 + ind_water_km3 + s.datacenter_water_consumption_km3;
    s.green_water_anomaly_pct = (10.0 + s.temperature_anomaly * 6.5).clamp(5.0, 35.0);
    s.water_stress_index = (s.blue_water_consumption_km3 / 4000.0).clamp(0.2, 1.8);

    // --- 10. Land Sector ---
    let forest_loss_fraction = 0.40 * ((t - 1900.0) / 150.0).clamp(0.0, 1.0);
    s.forest_fraction_remaining = (1.0 - forest_loss_fraction).clamp(0.40, 1.0);
    s.urban_industrial_land_mha = p * 0.035; // 350 m2 per capita
    s.datacenter_land_mha = (s.datacenter_capital_billion * 0.0001).clamp(0.001, 0.5);

    // --- 11. Biosphere Integrity ---
    s.extinction_rate = (1.0
        + 80.0 * (s.temperature_anomaly / 1.5).max(0.0)
        + 40.0 * (1.0 - s.forest_fraction_remaining) / 0.4)
        .clamp(1.0, 350.0);
    s.biodiversity_intactness_index =
        (100.0 - 15.0 * (1.0 - s.forest_fraction_remaining) - 10.0 * s.temperature_anomaly)
            .clamp(50.0, 100.0);

    // --- 8. Pollution & Novel Entities ---
    let chemical_pollution_gen = s.industrial_output * 0.02;
    let d_persistent_pollution = chemical_pollution_gen - (s.persistent_pollution_stock / 30.0);
    s.novel_entities_index =
        1.0 + (chemical_pollution_gen / 1.0e10) + (s.accumulated_ewaste_mt / 50.0);

    // --- 2. Economy & 3. Services ---
    let net_output_mult = (1.0 - s.climate_damage_fraction) * (1.0 - s.mineral_stress_index * 0.15);
    s.industrial_output = (s.industrial_capital / params.capital_output_ratio)
        * s.ai_productivity_index
        * net_output_mult;
    s.industrial_output_per_capita = s.industrial_output / p;

    s.industrial_investment = s.industrial_output * params.baseline_investment_share;
    s.capital_depreciation = s.industrial_capital * params.industrial_depreciation_rate;
    let d_industrial_capital = s.industrial_investment - s.capital_depreciation;

    let d_datacenter_capital = if ai_active {
        s.industrial_output * 0.04 - (s.datacenter_capital_billion * 0.20)
    } else {
        0.0
    };

    let service_investment = s.industrial_output * 0.15;
    let service_depreciation = s.service_capital * 0.05;
    let d_service_capital = service_investment - service_depreciation;
    s.service_output = (s.service_capital / 1.5) * s.ai_productivity_index;
    s.service_output_per_capita = s.service_output / p;
    s.education_index = (s.service_output_per_capita / 500.0).clamp(0.2, 0.95);

    let ag_investment = s.industrial_output * 0.08;
    let ag_depreciation = s.agricultural_capital * 0.06;
    let d_agricultural_capital = ag_investment - ag_depreciation;

    // --- 1. Demography ---
    let nutrition_health_factor = (s.food_per_capita / 350.0).clamp(0.4, 1.2);
    let medical_services_factor = (s.service_output_per_capita / 400.0).clamp(0.5, 1.3);
    let pollution_health_penalty = (1.0 - 0.05 * (s.novel_entities_index / 3.0)).clamp(0.7, 1.0);
    s.life_expectancy = (30.0
        + 35.0 * nutrition_health_factor * medical_services_factor * pollution_health_penalty)
        .clamp(25.0, 92.0);

    let demographic_fertility_transition = (4.5 - 2.5 * s.education_index).clamp(1.7, 5.5);
    s.total_fertility_rate = demographic_fertility_transition;

    s.deaths = p / s.life_expectancy;
    s.births = p * (s.total_fertility_rate * 0.0081); // demographic crude birth rate from TFR
    let d_population = s.births - s.deaths;

    // --- 17. Inequality, 18. Wellbeing, 19. Social Tension ---
    let automation_capital_skew = (s.ai_productivity_index - 1.0) * 0.15;
    s.gini_coefficient = (0.36 + automation_capital_skew
        - params.universal_basic_services_strength * 0.10)
        .clamp(0.25, 0.65);
    s.labor_income_share = (0.65 - automation_capital_skew
        + params.universal_basic_services_strength * 0.08)
        .clamp(0.40, 0.75);
    s.poverty_headcount_pct = (25.0
        * (1.0 - (s.industrial_output_per_capita / 2000.0).clamp(0.0, 0.8))
        * (s.gini_coefficient / 0.38))
        .clamp(1.0, 60.0);

    // Human Wellbeing Index composite
    let health_component = (s.life_expectancy - 25.0) / 60.0;
    let nutrition_component = (s.food_per_capita / 400.0).clamp(0.0, 1.0);
    let education_component = s.education_index;
    let environment_component = (s.aragonite_saturation_state / 3.44).clamp(0.0, 1.0) * 0.5
        + (s.biodiversity_intactness_index / 100.0) * 0.5;
    let equality_component = 1.0 - s.gini_coefficient;

    s.human_wellbeing_index = (health_component * 0.25
        + nutrition_component * 0.20
        + education_component * 0.20
        + environment_component * 0.20
        + equality_component * 0.15)
        .clamp(0.0, 1.0);

    s.social_tension_index =
        (s.gini_coefficient * 1.2 + s.climate_damage_fraction * 3.0 + s.mineral_stress_index * 0.8
            - s.human_wellbeing_index * 0.5)
            .clamp(0.0, 2.0);

    s.governance_capacity_index = (s.education_index * 0.6
        + (s.service_output_per_capita / 800.0).clamp(0.0, 0.4)
        - s.social_tension_index * 0.2)
        .clamp(0.1, 1.0);

    s.global_trade_openness = (0.28 * s.governance_capacity_index).clamp(0.05, 0.45);

    let derivatives = World26Derivatives {
        d_population,
        d_industrial_capital,
        d_service_capital,
        d_agricultural_capital,
        d_arable_land,
        d_atmospheric_co2,
        d_temperature_anomaly,
        d_ocean_temperature_anomaly,
        d_persistent_pollution,
        d_accumulated_ewaste,
        d_installed_compute,
        d_datacenter_capital,
        d_fossil_reserves,
        d_copper_inventory,
        d_lithium_inventory,
    };

    (derivatives, s)
}
