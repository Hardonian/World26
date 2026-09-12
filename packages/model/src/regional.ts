import { RegionId, RegionalProfile } from '@world26/schemas';
import { REGIONS_DATA } from '@world26/data';
import { World26ModelParameters, SimulationStepState } from './types.js';
import { World26SimulatorTs, DEFAULT_WORLD26_PARAMETERS } from './world26.js';

export interface RegionalStepState {
  id: RegionId;
  name: string;
  population: number;
  gdp_ppp_trillion: number;
  industrial_output_per_capita: number;
  total_energy_demand_ej: number;
  electricity_demand_twh: number;
  clean_electricity_share: number;
  co2_emissions_gt: number;
  installed_compute_eflops: number;
  ai_electricity_demand_twh: number;
  food_production_mt: number;
  net_food_trade_mt: number; // positive = net export, negative = net import
  food_per_capita_kg: number;
  water_consumption_km3: number;
  water_stress_index: number;
  copper_production_mt: number;
  net_copper_trade_mt: number;
  climate_damage_fraction: number;
  human_wellbeing_index: number;
  gini_coefficient: number;
}

export interface RegionalCoupledSimulationStep {
  time: number;
  global: SimulationStepState;
  regions: Record<string, RegionalStepState>;
  conservationMetrics: {
    totalPopulation: number;
    totalCo2Gt: number;
    netFoodTradeBalanceMt: number;
    netCopperTradeBalanceMt: number;
  };
}

// Regional climate vulnerability multiplier relative to global average damage
export const REGIONAL_CLIMATE_VULNERABILITY: Record<string, number> = {
  north_america: 0.85,
  latin_america: 1.35,
  western_europe: 0.90,
  eastern_europe_central_asia: 0.95,
  middle_east_north_africa: 1.70,
  sub_saharan_africa: 1.80,
  south_asia: 1.65,
  china_region: 1.05,
  southeast_rest_asia: 1.45,
  pacific_oecd: 0.90,
};

export class RegionalWorld26SimulatorTs {
  globalSim: World26SimulatorTs;
  regions: RegionalProfile[];
  regionalStates: Record<string, RegionalStepState>;
  time: number;

  constructor(globalParams: Partial<World26ModelParameters> = {}) {
    this.globalSim = new World26SimulatorTs(globalParams);
    this.regions = REGIONS_DATA.regions;
    this.time = 1900.0;
    this.regionalStates = {};
    this.initRegionalStates();
  }

  private initRegionalStates() {
    const g = this.globalSim.state;

    for (const r of this.regions) {
      // Historical distribution scaling factors
      const pop = g.population * r.populationShare2020;
      const gdpShare = r.gdpShare2020;
      const gdp = (g.industrial_output / 1e12) * gdpShare * 3.5;
      const foodProd = (g.food_production / 1e3) * r.arableLandShare2020; // in Mt
      const foodCap = (foodProd * 1e9) / Math.max(1.0, pop);

      this.regionalStates[r.id] = {
        id: r.id as RegionId,
        name: r.name,
        population: pop,
        gdp_ppp_trillion: Math.max(0.1, gdp),
        industrial_output_per_capita: g.industrial_output_per_capita * (gdpShare / Math.max(0.01, r.populationShare2020)),
        total_energy_demand_ej: g.total_energy_demand_ej * r.energyDemandShare2020,
        electricity_demand_twh: g.electricity_demand_twh * r.energyDemandShare2020,
        clean_electricity_share: g.clean_electricity_share,
        co2_emissions_gt: g.co2_emissions_gt * r.co2Share2020,
        installed_compute_eflops: 0.0,
        ai_electricity_demand_twh: 0.0,
        food_production_mt: foodProd,
        net_food_trade_mt: 0.0,
        food_per_capita_kg: foodCap,
        water_consumption_km3: g.blue_water_consumption_km3 * (foodProd / Math.max(1.0, g.food_production / 1e3)),
        water_stress_index: r.waterStressIndex,
        copper_production_mt: 0.0,
        net_copper_trade_mt: 0.0,
        climate_damage_fraction: 0.0,
        human_wellbeing_index: Math.min(1.0, Math.max(0.1, 0.25 + (gdpShare / Math.max(0.01, r.populationShare2020) - 1.0) * 0.15)),
        gini_coefficient: 0.38 + (r.tradeDependencyIndex - 0.25) * 0.2,
      };
    }
  }

  step(dt: number): RegionalCoupledSimulationStep {
    // 1. Advance the global shared biophysical engine (atmosphere, temperature, ocean pH)
    const g = this.globalSim.step(dt);
    this.time = g.time;

    const t = this.time;
    const t_ai = Math.max(0, t - 2020.0);

    // Global commodities to distribute & conserve
    let totalFoodSurplusMt = 0;
    let totalFoodDeficitMt = 0;
    const foodBalances: Record<string, number> = {};

    // 2. Compute local dynamics for each region
    for (const r of this.regions) {
      const reg = this.regionalStates[r.id];
      const vuln = REGIONAL_CLIMATE_VULNERABILITY[r.id] ?? 1.0;

      // Regionally differentiated climate damages
      reg.climate_damage_fraction = Math.min(0.85, g.climate_damage_fraction * vuln);

      // Energy & clean transition
      const baseCleanShare = g.clean_electricity_share;
      const energyShare = r.energyDemandShare2020;
      reg.total_energy_demand_ej = g.total_energy_demand_ej * energyShare;
      reg.clean_electricity_share = Math.min(0.99, baseCleanShare * (1.0 + (r.gdpShare2020 / r.populationShare2020 - 1.0) * 0.15));
      reg.electricity_demand_twh = g.electricity_demand_twh * energyShare;

      // Compute allocation & diffusion
      // Semiconductor hubs adopt first; diffusion occurs to rest of world with 4-7 year lag
      const computeTechDiffusionMultiplier = t >= 2020
        ? Math.min(1.0, Math.max(0.2, 0.2 + (t_ai / 10.0) * (1.0 - r.tradeDependencyIndex * 0.5)))
        : 1.0;

      reg.installed_compute_eflops = g.installed_compute_eflops * r.computeCapacityShare2020 * computeTechDiffusionMultiplier;
      reg.ai_electricity_demand_twh = g.ai_electricity_demand_twh * (reg.installed_compute_eflops / Math.max(0.001, g.installed_compute_eflops));

      // Food & agriculture
      const landShare = r.arableLandShare2020;
      const regionalYieldStress = Math.max(0.4, 1.0 - 0.07 * vuln * Math.max(0, g.temperature_anomaly));
      reg.food_production_mt = (g.food_production / 1e6) * landShare * regionalYieldStress * 1e3;

      // Desired domestic food requirement (approx 320 kg/person/yr)
      const desiredFoodMt = (reg.population * 320.0) / 1e9;
      const localBalance = reg.food_production_mt - desiredFoodMt;
      foodBalances[r.id] = localBalance;

      if (localBalance > 0) {
        totalFoodSurplusMt += localBalance;
      } else {
        totalFoodDeficitMt += Math.abs(localBalance);
      }

      // Water consumption & stress index
      reg.water_consumption_km3 = g.blue_water_consumption_km3 * (r.arableLandShare2020 * 0.70 + r.populationShare2020 * 0.30);
      reg.water_stress_index = Math.min(3.0, Math.max(0.05, r.waterStressIndex * (g.water_stress_index / 0.85)));



      // Critical minerals production
      const globalCopperProdMt = 26.0 * (1.0 + 0.02 * Math.max(0, t - 2020));
      const copperShare = r.mineralProductionShares?.copper ?? 0.05;
      reg.copper_production_mt = globalCopperProdMt * copperShare;

      // Local emissions
      const fossilShare = Math.max(0.1, 1.0 - reg.clean_electricity_share);
      reg.co2_emissions_gt = g.co2_emissions_gt * r.co2Share2020 * (fossilShare / Math.max(0.1, 1.0 - g.clean_electricity_share));

      // Regional population & economy
      reg.population = Math.max(1e6, g.population * r.populationShare2020);
      reg.gdp_ppp_trillion = Math.max(0.05, (g.industrial_output / 1e12) * r.gdpShare2020 * (1.0 - reg.climate_damage_fraction));
      reg.industrial_output_per_capita = (reg.gdp_ppp_trillion * 1e12) / reg.population;

      // Regional wellbeing
      const foodSufficiency = Math.min(1.2, reg.food_production_mt / Math.max(1.0, desiredFoodMt));
      reg.human_wellbeing_index = Math.min(
        1.0,
        Math.max(
          0.05,
          g.human_wellbeing_index * 0.6 +
            foodSufficiency * 0.2 +
            (1.0 - reg.climate_damage_fraction) * 0.2 -
            (reg.water_stress_index > 1.0 ? 0.1 : 0.0)
        )
      );
      reg.gini_coefficient = Math.min(0.70, Math.max(0.24, g.gini_coefficient + (r.tradeDependencyIndex - 0.25) * 0.1));
    }

    // 3. Bilateral Trade Clearing & Mass/Energy Conservation Closure
    let netFoodTradeSum = 0;
    let netCopperTradeSum = 0;

    // Total copper demand across all regions
    const globalSolarWindGw = Math.max(10.0, (g.clean_electricity_share * g.electricity_demand_twh) / 1500.0);
    const totalCopperDemandMt = globalSolarWindGw * 0.0045 + g.accelerator_fleet_millions * 0.001;

    for (const r of this.regions) {
      const reg = this.regionalStates[r.id];

      // Food trade clearing: surplus regions export to deficit regions
      const bal = foodBalances[r.id];
      if (bal >= 0) {
        // Exporter
        const exportFraction = totalFoodDeficitMt > 0 ? Math.min(0.9, totalFoodDeficitMt / Math.max(1.0, totalFoodSurplusMt)) : 0;
        reg.net_food_trade_mt = bal * exportFraction;
      } else {
        // Importer
        const importFraction = totalFoodSurplusMt > 0 ? Math.min(1.0, totalFoodSurplusMt / Math.max(1.0, totalFoodDeficitMt)) : 0;
        reg.net_food_trade_mt = bal * importFraction; // negative
      }
      netFoodTradeSum += reg.net_food_trade_mt;

      // Final effective food per capita after trade
      const effectiveFoodMt = reg.food_production_mt - reg.net_food_trade_mt;
      reg.food_per_capita_kg = (effectiveFoodMt * 1e9) / Math.max(1.0, reg.population);

      // Copper trade clearing
      const regionalCopperDemandMt = totalCopperDemandMt * (reg.electricity_demand_twh / Math.max(1.0, g.electricity_demand_twh));
      reg.net_copper_trade_mt = reg.copper_production_mt - regionalCopperDemandMt;
      netCopperTradeSum += reg.net_copper_trade_mt;
    }

    // Exact numerical zero-sum enforcement for physical trade conservation
    const eps = Math.abs(netFoodTradeSum);
    if (eps > 1e-6) {
      const perRegionAdj = netFoodTradeSum / this.regions.length;
      for (const r of this.regions) {
        this.regionalStates[r.id].net_food_trade_mt -= perRegionAdj;
      }
      netFoodTradeSum = 0;
    }

    const copperEps = Math.abs(netCopperTradeSum);
    if (copperEps > 1e-6) {
      const perRegionAdj = netCopperTradeSum / this.regions.length;
      for (const r of this.regions) {
        this.regionalStates[r.id].net_copper_trade_mt -= perRegionAdj;
      }
      netCopperTradeSum = 0;
    }

    // Aggregate regional totals
    let totalPop = 0;
    let totalCo2 = 0;
    for (const r of this.regions) {
      totalPop += this.regionalStates[r.id].population;
      totalCo2 += this.regionalStates[r.id].co2_emissions_gt;
    }

    return {
      time: Math.round(this.time * 100) / 100,
      global: g,
      regions: { ...this.regionalStates },
      conservationMetrics: {
        totalPopulation: totalPop,
        totalCo2Gt: totalCo2,
        netFoodTradeBalanceMt: Math.abs(netFoodTradeSum) < 1e-9 ? 0 : netFoodTradeSum,
        netCopperTradeBalanceMt: Math.abs(netCopperTradeSum) < 1e-9 ? 0 : netCopperTradeSum,
      },
    };
  }
}
