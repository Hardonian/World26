import { World26ModelParameters, SimulationStepState } from './types.js';
import { DEFAULT_LIMITS25_CONFIG, computeLimits25AiTerms } from './limits25.js';

export const DEFAULT_WORLD26_PARAMETERS: World26ModelParameters = {
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
  compute_demand_growth_rate: 0.35,
  hardware_lifetime_years: 3.5,
  datacenter_pue: 1.25,
  datacenter_pue_target: 1.12,
  water_cooling_liters_per_kwh: 1.8,
  recycling_target_share: 0.40,
  ai_productivity_elasticity: 0.08,
  jevons_rebound_factor: 1.2,
  ai_training_compute_share: 0.35,
  post_silicon_transition_year: 2038.0,
  photonic_efficiency_multiplier: 4.0,
  carbon_tax_usd_per_ton: 0.0,
  food_waste_reduction_pct: 0.0,
  circular_economy_mandate: 0.0,
  universal_basic_services_strength: 0.0,
};

export class World26SimulatorTs {
  state: SimulationStepState;
  params: World26ModelParameters;

  constructor(params: Partial<World26ModelParameters> = {}) {
    this.params = { ...DEFAULT_WORLD26_PARAMETERS, ...params } as World26ModelParameters;
    this.state = {
      time: 1900.0,
      population: 1.6e9,
      industrial_capital: 8.0e10,
      industrial_output: 2.6e10,
      industrial_output_per_capita: 16.25,
      service_capital: 4.0e10,
      service_output: 2.6e10,
      service_output_per_capita: 16.25,
      education_index: 0.20,
      arable_land: 0.9e9,
      agricultural_capital: 1.0e10,
      food_production: 1.35e9,
      food_per_capita: 840.0,
      cereal_yield: 1.5,
      fertilizer_consumption: 2.0,
      soil_fertility_index: 1.0,
      fossil_reserves: 50000.0,
      copper_inventory: 1000.0,
      lithium_inventory: 30.0,
      mineral_stress_index: 0.05,
      total_energy_demand_ej: 30.0,
      electricity_demand_twh: 50.0,
      clean_electricity_share: 0.05,
      fossil_energy_ej: 28.5,
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
      ozone_dobson_units: 300.0,
      installed_compute_eflops: 0.0,
      ai_training_compute_eflops: 0.0,
      ai_inference_compute_eflops: 0.0,
      ai_effective_pue: 1.25,
      optical_compute_share: 0.0,
      accelerator_fleet_millions: 0.0,
      datacenter_capital_billion: 0.0,
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
    };
  }

  step(dt: number) {
    const s = this.state;
    const p = Math.max(1.0, s.population);
    const t = s.time;
    const ai_active = t >= 2015.0;
    const t_ai = Math.max(0, t - 2020.0);

    // Dynamic PUE trajectory: modern liquid & immersion cooling phase-in
    const pue_progress = Math.min(1.0, Math.max(0, (t - 2020.0) / 25.0));
    s.ai_effective_pue = this.params.datacenter_pue - pue_progress * (this.params.datacenter_pue - this.params.datacenter_pue_target);

    // Post-silicon optical / photonic / neuromorphic computing transition
    const t_post = Math.max(0, t - this.params.post_silicon_transition_year);
    s.optical_compute_share = t >= this.params.post_silicon_transition_year
      ? Math.min(0.85, 1.0 - Math.exp(-t_post / 8.0))
      : 0.0;
    const optical_eff_boost = 1.0 + s.optical_compute_share * (this.params.photonic_efficiency_multiplier - 1.0);

    // AI efficiency & compute growth
    const eff_growth = Math.max(0.02, 0.22 * (1.0 - 0.03 * t_ai));
    s.ai_hardware_efficiency_petaflops_per_kw = 0.05 * Math.pow(1.0 + eff_growth, t_ai) * optical_eff_boost;

    const base_demand_growth = ai_active
      ? this.params.compute_demand_growth_rate * (1.0 + (this.params.jevons_rebound_factor - 1.0) * 0.2)
      : 0.05;

    const current_compute = Math.max(0.001, s.installed_compute_eflops);
    const d_compute = ai_active
      ? current_compute * base_demand_growth - current_compute / this.params.hardware_lifetime_years
      : 0;

    s.installed_compute_eflops = Math.max(0, s.installed_compute_eflops + d_compute * dt);

    // Training vs inference compute split
    const inf_shift = Math.min(0.25, Math.max(0, (t - 2020.0) / 20.0) * 0.25);
    const dynamic_training_share = Math.max(0.10, this.params.ai_training_compute_share - inf_shift);
    s.ai_training_compute_eflops = s.installed_compute_eflops * dynamic_training_share;
    s.ai_inference_compute_eflops = s.installed_compute_eflops * (1.0 - dynamic_training_share);

    s.accelerator_fleet_millions = Math.max(0, (s.installed_compute_eflops * 1000.0) / 2.0);
    s.datacenter_capital_billion = s.accelerator_fleet_millions * 35.0;

    // AI Electricity & Water
    const ai_power_gw =
      (s.installed_compute_eflops * 1000.0 / Math.max(0.01, s.ai_hardware_efficiency_petaflops_per_kw)) * 1e-3;
    s.ai_electricity_demand_twh = ai_power_gw * 8.76 * s.ai_effective_pue;
    const ai_water_liters = s.ai_electricity_demand_twh * 1.0e9 * this.params.water_cooling_liters_per_kwh;
    s.datacenter_water_consumption_km3 = ai_water_liters / 1.0e12;
    s.ai_water_withdrawal_million_m3 = s.datacenter_water_consumption_km3 * 1000.0;

    // AI E-waste
    s.ai_hardware_turnover_rate = s.accelerator_fleet_millions / this.params.hardware_lifetime_years;
    s.ai_hardware_recycling_share = Math.min(
      0.85,
      Math.max(0.15, 0.20 + 0.015 * t_ai + this.params.circular_economy_mandate * 0.4)
    );
    const gross_ewaste_mt = (s.ai_hardware_turnover_rate * 1.0e6 * 25.0) / 1.0e9;
    s.ai_ewaste_annual_mt = gross_ewaste_mt * (1.0 - s.ai_hardware_recycling_share);
    s.accumulated_ewaste_mt += s.ai_ewaste_annual_mt * dt;

    // AI TFP Dividend
    s.ai_productivity_index =
      1.0 + this.params.ai_productivity_elasticity * Math.pow(Math.max(0, s.installed_compute_eflops / 10.0), 0.35);

    // Energy
    const per_capita_energy_gj = 18.0 + 60.0 * Math.min(1.2, Math.max(0, s.industrial_output_per_capita / 800.0));
    s.total_energy_demand_ej = (p * per_capita_energy_gj) / 1.0e9;

    const transition_years = Math.max(0, t - this.params.clean_energy_phase_in_start);
    const target_share =
      t >= this.params.clean_energy_phase_in_start
        ? 0.38 + Math.min(1.0, transition_years / 24.0) * (this.params.clean_energy_target_2050 - 0.38)
        : Math.min(0.38, Math.max(0.05, 0.05 + 0.0028 * (t - 1900.0)));
    s.clean_electricity_share = Math.min(0.98, Math.max(0.05, target_share));
    s.electricity_demand_twh = s.total_energy_demand_ej * 277.78 * 0.22 + s.ai_electricity_demand_twh;
    s.ai_electricity_share_pct = (s.ai_electricity_demand_twh / Math.max(1.0, s.electricity_demand_twh)) * 100.0;
    s.fossil_energy_ej = s.total_energy_demand_ej * (1.0 - s.clean_electricity_share * 0.5);

    // Critical minerals
    const solar_wind_gw = Math.max(10.0, (s.clean_electricity_share * s.electricity_demand_twh) / 1500.0);
    const copper_demand_mt = solar_wind_gw * 0.0045 + s.accelerator_fleet_millions * 0.001;
    const lithium_demand_mt = solar_wind_gw * 0.0008;
    s.copper_inventory = Math.max(0, s.copper_inventory - copper_demand_mt * dt);
    s.lithium_inventory = Math.max(0, s.lithium_inventory - lithium_demand_mt * dt);
    s.mineral_stress_index =
      (1.0 - Math.min(1.0, Math.max(0, s.copper_inventory / 1000.0))) * 0.6 +
      (1.0 - Math.min(1.0, Math.max(0, s.lithium_inventory / 30.0))) * 0.4;

    // Climate & Carbon
    const grid_carbon = 0.45 * (1.0 - s.clean_electricity_share);
    s.ai_operational_co2_gt = (s.ai_electricity_demand_twh * 1.0e6 * grid_carbon) / 1.0e9;
    s.ai_embodied_co2_gt = (s.ai_hardware_turnover_rate * 1.0e6 * 1.2) / 1.0e9;
    const fossil_co2 = s.fossil_energy_ej * 0.068;
    const land_co2 = Math.max(0.5, 3.5 * (1.0 - Math.max(0, t - 1960.0) / 100.0));
    s.co2_emissions_gt = fossil_co2 + land_co2 + s.ai_operational_co2_gt + s.ai_embodied_co2_gt;

    const d_co2 = (s.co2_emissions_gt * 0.48) / 3.8;
    s.atmospheric_co2_ppm = Math.max(200.0, s.atmospheric_co2_ppm + d_co2 * dt);
    s.radiative_forcing = 5.35 * Math.log(s.atmospheric_co2_ppm / 280.0);

    const lambda_fb = 3.71 / this.params.climate_sensitivity_ecs;
    const gamma_ocean = 0.73;
    const d_temp = (s.radiative_forcing - lambda_fb * s.temperature_anomaly - gamma_ocean * (s.temperature_anomaly - s.ocean_temperature_anomaly)) / 5.0;
    const d_ocean_temp = (gamma_ocean * (s.temperature_anomaly - s.ocean_temperature_anomaly)) / 100.0;
    s.temperature_anomaly += d_temp * dt;
    s.ocean_temperature_anomaly += d_ocean_temp * dt;
    s.climate_damage_fraction = 0.0028 * Math.pow(s.temperature_anomaly, 2) + 0.0005 * Math.pow(s.temperature_anomaly, 3);

    // Ocean Acidification
    s.aragonite_saturation_state = Math.min(3.8, Math.max(1.0, 3.44 * Math.pow(280.0 / s.atmospheric_co2_ppm, 0.75)));
    s.ocean_ph = 8.18 - 0.35 * Math.log10(s.atmospheric_co2_ppm / 280.0);

    // Food & Agriculture
    const ag_tech = 1.0 + 0.01 * Math.max(0, t - 1960.0);
    const crop_stress = Math.min(1.0, Math.max(0.5, 1.0 - 0.05 * Math.max(0, s.temperature_anomaly)));
    s.cereal_yield = Math.min(6.0, Math.max(1.0, 1.5 * ag_tech * crop_stress));
    s.fertilizer_consumption = Math.min(
      240.0,
      Math.max(30.0, p * 25.0 * (1.0 - this.params.food_waste_reduction_pct * 0.5))
    );
    s.food_production = s.arable_land * s.cereal_yield * 1000.0;
    s.food_per_capita = (s.food_production * 1.0e6) / p;

    // Water & Land
    s.blue_water_consumption_km3 = s.food_production * 0.0012 + s.datacenter_water_consumption_km3 + 300.0;
    s.water_stress_index = Math.min(1.8, Math.max(0.2, s.blue_water_consumption_km3 / 4000.0));
    s.forest_fraction_remaining = Math.min(1.0, Math.max(0.40, 1.0 - 0.40 * Math.min(1.0, Math.max(0, (t - 1900.0) / 150.0))));
    s.extinction_rate = Math.min(350.0, Math.max(1.0, 1.0 + 80.0 * Math.max(0, s.temperature_anomaly / 1.5)));
    s.biodiversity_intactness_index = Math.min(100.0, Math.max(50.0, 100.0 - 15.0 * (1.0 - s.forest_fraction_remaining) - 10.0 * s.temperature_anomaly));
    s.nitrogen_fixation_tg = s.fertilizer_consumption * 0.65 + 30.0;
    s.phosphorus_flow_tg = s.fertilizer_consumption * 0.12 + 4.0;
    s.novel_entities_index = 1.0 + (s.industrial_output / 1.0e12) + s.accumulated_ewaste_mt / 50.0;

    // Economy & Capital
    const net_mult = (1.0 - s.climate_damage_fraction) * (1.0 - s.mineral_stress_index * 0.15);
    s.industrial_output = (s.industrial_capital / this.params.capital_output_ratio) * s.ai_productivity_index * net_mult;
    s.industrial_output_per_capita = s.industrial_output / p;
    const d_ic = s.industrial_output * this.params.baseline_investment_share - s.industrial_capital * this.params.industrial_depreciation_rate;
    s.industrial_capital = Math.max(0, s.industrial_capital + d_ic * dt);

    const d_sc = s.industrial_output * 0.15 - s.service_capital * 0.05;
    s.service_capital = Math.max(0, s.service_capital + d_sc * dt);
    s.service_output = (s.service_capital / 1.5) * s.ai_productivity_index;
    s.service_output_per_capita = s.service_output / p;
    s.education_index = Math.min(0.95, Math.max(0.20, s.service_output_per_capita / 500.0));

    // Demography
    const nutrition_health = Math.min(1.2, Math.max(0.4, s.food_per_capita / 350.0));
    const medical_health = Math.min(1.3, Math.max(0.5, s.service_output_per_capita / 400.0));
    s.life_expectancy = Math.min(92.0, Math.max(25.0, 30.0 + 35.0 * nutrition_health * medical_health));
    s.total_fertility_rate = Math.min(5.5, Math.max(1.7, 4.5 - 2.5 * s.education_index));

    const death_rate = p / s.life_expectancy;
    const birth_rate = p * (s.total_fertility_rate * 0.0081);
    s.population = Math.max(1.0, s.population + (birth_rate - death_rate) * dt);

    // Social & Wellbeing
    const automation_skew = (s.ai_productivity_index - 1.0) * 0.15;
    s.gini_coefficient = Math.min(
      0.65,
      Math.max(0.25, 0.42 + automation_skew - this.params.universal_basic_services_strength * 0.10)
    );
    s.human_wellbeing_index = Math.min(
      1.0,
      Math.max(
        0.0,
        ((s.life_expectancy - 25.0) / 60.0) * 0.25 +
          Math.min(1.0, s.food_per_capita / 400.0) * 0.20 +
          s.education_index * 0.20 +
          (s.aragonite_saturation_state / 3.44) * 0.10 +
          (s.biodiversity_intactness_index / 100.0) * 0.10 +
          (1.0 - s.gini_coefficient) * 0.15
      )
    );

    s.time += dt;
    return this.state;
  }
}
