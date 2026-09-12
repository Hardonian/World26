import { z } from 'zod';
import {
  ScenarioDefinition,
  PolicyIntervention,
  SimulationRunResult,
  BoundaryStatus,
  MilestoneEvent
} from '@world26/schemas';

export interface World26ModelParameters {
  initial_population: number;
  target_fertility_replacement: number;
  capital_output_ratio: number;
  industrial_depreciation_rate: number;
  baseline_investment_share: number;
  renewable_cost_learning_rate: number;
  clean_energy_target_2050: number;
  clean_energy_phase_in_start: number;
  climate_sensitivity_ecs: number;
  carbon_ocean_sink_rate: number;
  carbon_land_sink_rate: number;
  compute_demand_growth_rate: number;
  hardware_lifetime_years: number;
  datacenter_pue: number;
  datacenter_pue_target: number;
  water_cooling_liters_per_kwh: number;
  recycling_target_share: number;
  ai_productivity_elasticity: number;
  jevons_rebound_factor: number;
  ai_training_compute_share: number;
  post_silicon_transition_year: number;
  photonic_efficiency_multiplier: number;
  carbon_tax_usd_per_ton: number;
  food_waste_reduction_pct: number;
  circular_economy_mandate: number;
  universal_basic_services_strength: number;
  [key: string]: number;
}

export interface SimulationStepState {
  time: number;
  population: number;
  industrial_output_per_capita: number;
  atmospheric_co2_ppm: number;
  temperature_anomaly: number;
  installed_compute_eflops: number;
  ai_training_compute_eflops: number;
  ai_inference_compute_eflops: number;
  ai_effective_pue: number;
  optical_compute_share: number;
  ai_electricity_demand_twh: number;
  ai_electricity_share_pct: number;
  ai_ewaste_annual_mt: number;
  clean_electricity_share: number;
  food_per_capita: number;
  blue_water_consumption_km3: number;
  aragonite_saturation_state: number;
  human_wellbeing_index: number;
  gini_coefficient: number;
  [key: string]: number;
}

