/**
 * Clean-room TypeScript implementation of World3-03 canonical simulation engine
 */

export interface World3StateTs {
  time: number;
  population: number;
  industrial_capital: number;
  service_capital: number;
  agricultural_capital: number;
  arable_land: number;
  land_fertility: number;
  non_renewable_resources: number;
  persistent_pollution: number;

  industrial_output: number;
  industrial_output_per_capita: number;
  food_per_capita: number;
  service_output_per_capita: number;
  life_expectancy: number;
  persistent_pollution_generation_rate: number;
  human_ecological_footprint: number;
  fraction_capital_resource_extraction: number;
}

export interface World3ParamsTs {
  initial_resources: number;
  industrial_capital_output_ratio: number;
  service_capital_output_ratio: number;
  industrial_capital_depreciation_rate: number;
  service_capital_depreciation_rate: number;
  industrial_investment_fraction: number;
  pollution_generation_factor: number;
  pollution_absorption_time: number;
  resource_technology_factor: number;
  agricultural_technology_factor: number;
  desired_completed_family_size: number;
  birth_control_effectiveness: number;
}

export const DEFAULT_WORLD3_PARAMS: World3ParamsTs = {
  initial_resources: 1.0e12,
  industrial_capital_output_ratio: 3.0,
  service_capital_output_ratio: 1.2,
  industrial_capital_depreciation_rate: 0.04,
  service_capital_depreciation_rate: 0.04,
  industrial_investment_fraction: 0.26,
  pollution_generation_factor: 1.0,
  pollution_absorption_time: 1.5,
  resource_technology_factor: 1.0,
  agricultural_technology_factor: 1.0,
  desired_completed_family_size: 4.0,
  birth_control_effectiveness: 0.75,
};

export class World3ModelTs {
  state: World3StateTs;
  params: World3ParamsTs;

  constructor(params: Partial<World3ParamsTs> = {}) {
    this.params = { ...DEFAULT_WORLD3_PARAMS, ...params };
    this.state = {
      time: 1900.0,
      population: 1.6e9,
      industrial_capital: 8.0e10,
      service_capital: 5.0e10,
      agricultural_capital: 1.0e10,
      arable_land: 0.9e9,
      land_fertility: 600.0,
      non_renewable_resources: this.params.initial_resources,
      persistent_pollution: 2.5e7,
      industrial_output: 0,
      industrial_output_per_capita: 0,
      food_per_capita: 0,
      service_output_per_capita: 0,
      life_expectancy: 35.0,
      persistent_pollution_generation_rate: 0,
      human_ecological_footprint: 0.4,
      fraction_capital_resource_extraction: 0.05,
    };
    this.computeAuxiliaries();
  }

  computeAuxiliaries() {
    const s = this.state;
    const p = Math.max(1.0, s.population);

    const nr_fraction_remaining = Math.max(
      0.0,
      Math.min(1.0, s.non_renewable_resources / this.params.initial_resources)
    );

    // FCAOR nonlinear response to depletion
    let fcaor = 0.05;
    if (nr_fraction_remaining < 0.5) {
      fcaor = 0.05 + 0.90 * Math.pow(1.0 - nr_fraction_remaining * 2.0, 2.0);
    }
    s.fraction_capital_resource_extraction = Math.min(
      1.0,
      fcaor / this.params.resource_technology_factor
    );

    const ic_effective =
      s.industrial_capital * (1.0 - s.fraction_capital_resource_extraction);
    s.industrial_output = Math.max(
      0.0,
      ic_effective / this.params.industrial_capital_output_ratio
    );
    s.industrial_output_per_capita = s.industrial_output / p;

    s.service_output_per_capita =
      Math.max(0.0, s.service_capital / this.params.service_capital_output_ratio) / p;

    const ag_input_factor = Math.min(
      4.0,
      Math.max(0.2, Math.sqrt(s.industrial_output_per_capita / 100.0))
    );
    const total_food =
      s.arable_land *
      (s.land_fertility / 1000.0) *
      ag_input_factor *
      this.params.agricultural_technology_factor *
      1600.0;
    s.food_per_capita = total_food / p;

    // Life expectancy from food
    const le_food = 20.0 + 60.0 * Math.min(1.0, s.food_per_capita / 500.0);
    const ppol_norm = Math.max(0.0, s.persistent_pollution / 1.5e9);
    const le_pol_mult = Math.max(0.2, 1.0 - 0.05 * ppol_norm);
    s.life_expectancy = Math.min(90.0, Math.max(15.0, le_food * le_pol_mult));

    // Pollution generation
    const ppol_gen_ind =
      (s.industrial_output / 1.0e11) *
      0.4e7 *
      this.params.pollution_generation_factor;
    const ppol_gen_ag = (s.agricultural_capital / 1.0e11) * 0.1e7;
    s.persistent_pollution_generation_rate = ppol_gen_ind + ppol_gen_ag;

    const absorption_land =
      (s.persistent_pollution_generation_rate / 1.0e7) * 0.1e9;
    s.human_ecological_footprint = (s.arable_land + absorption_land) / 1.5e9;
  }

  step(dt: number) {
    this.computeAuxiliaries();
    const s = this.state;
    const p = Math.max(1.0, s.population);

    const death_rate = p / s.life_expectancy;
    const cbr = Math.max(
      0.012,
      0.045 - 0.030 * Math.min(1.0, s.industrial_output_per_capita / 600.0)
    );
    const birth_rate = p * cbr;
    const d_pop = birth_rate - death_rate;

    const ic_investment =
      s.industrial_output * this.params.industrial_investment_fraction;
    const ic_depreciation =
      s.industrial_capital * this.params.industrial_capital_depreciation_rate;
    const d_ic = ic_investment - ic_depreciation;

    const sc_investment = s.industrial_output * 0.12;
    const sc_depreciation =
      s.service_capital * this.params.service_capital_depreciation_rate;
    const d_sc = sc_investment - sc_depreciation;

    const ac_investment = s.industrial_output * 0.08;
    const ac_depreciation = s.agricultural_capital * 0.06;
    const d_ac = ac_investment - ac_depreciation;

    const per_capita_res =
      Math.pow(s.industrial_output_per_capita / 200.0, 0.7) * 1.75;
    const d_nr = -p * Math.max(0.05, per_capita_res);

    const ppol_assimilation =
      s.persistent_pollution / (this.params.pollution_absorption_time * 20.0);
    const d_ppol = s.persistent_pollution_generation_rate - ppol_assimilation;

    s.time += dt;
    s.population = Math.max(1.0, s.population + d_pop * dt);
    s.industrial_capital = Math.max(0.0, s.industrial_capital + d_ic * dt);
    s.service_capital = Math.max(0.0, s.service_capital + d_sc * dt);
    s.agricultural_capital = Math.max(0.0, s.agricultural_capital + d_ac * dt);
    s.non_renewable_resources = Math.max(0.0, s.non_renewable_resources + d_nr * dt);
    s.persistent_pollution = Math.max(0.0, s.persistent_pollution + d_ppol * dt);

    this.computeAuxiliaries();
    return this.state;
  }
}
