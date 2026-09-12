import { World26SimulatorTs, World3ModelTs, BUILTIN_SCENARIOS } from '@world26/model';
import { TrajectoryPoint } from '@/components/TrajectoryCharts';
import { PolicyState } from '@/components/PolicyComposer';

export interface SimulationResultBundle {
  series: TrajectoryPoint[];
  milestones: Array<{ year: number; title: string; category: string }>;
  boundaryValues: Record<string, number>;
  peakPopulation: { year: number; value: number };
  peakOutput: { year: number; value: number };
  peakTemp: { year: number; value: number };
}

export function runWorld26Simulation(
  scenarioId: string = 'baseline_2026',
  policyOverrides: Partial<PolicyState> = {}
): SimulationResultBundle {
  const scenario = BUILTIN_SCENARIOS.find((s) => s.id === scenarioId);
  const baseParams = scenario ? { ...scenario.parameterOverrides } : {};

  // Merge with user-composed policy levers
  const effectiveParams = {
    ...baseParams,
    ...policyOverrides,
  };

  const sim = new World26SimulatorTs(effectiveParams as any);
  const series: TrajectoryPoint[] = [];

  let peakPop = { year: 1900, value: 0 };
  let peakOut = { year: 1900, value: 0 };
  let peakT = { year: 1900, value: 0 };

  const startYear = 1900;
  const endYear = 2100;
  const dt = 0.25;

  let currentYear = startYear;

  while (currentYear <= endYear) {
    const st = sim.step(dt);

    if (st.population > peakPop.value) {
      peakPop = { year: currentYear, value: st.population };
    }
    if (st.industrial_output_per_capita > peakOut.value) {
      peakOut = { year: currentYear, value: st.industrial_output_per_capita };
    }
    if (st.temperature_anomaly > peakT.value) {
      peakT = { year: currentYear, value: st.temperature_anomaly };
    }

    // Capture trajectory sample every 1 year or 0.5 year
    if (Math.abs(Math.round(currentYear * 2) / 2 - currentYear) < 1e-4) {
      series.push({
        time: Math.round(currentYear * 100) / 100,
        population: st.population,
        industrial_output_per_capita: st.industrial_output_per_capita,
        atmospheric_co2_ppm: st.atmospheric_co2_ppm,
        temperature_anomaly: st.temperature_anomaly,
        installed_compute_eflops: st.installed_compute_eflops,
        ai_electricity_demand_twh: st.ai_electricity_demand_twh,
        clean_electricity_share: st.clean_electricity_share,
        food_per_capita: st.food_per_capita,
        human_wellbeing_index: st.human_wellbeing_index,
        gini_coefficient: st.gini_coefficient,
        climate_change_co2: st.atmospheric_co2_ppm,
        ocean_acidification: st.aragonite_saturation_state,
        freshwater_blue: st.blue_water_consumption_km3,
        biogeochemical_nitrogen: 190.0 * (st.population / 8.0e9),
        biosphere_genetic: 130.0 * (st.temperature_anomaly / 1.2),
        novel_entities: 2.8 * (st.ai_ewaste_annual_mt / 5.0e7),
      });
    }

    currentYear += dt;
  }

  // Derive milestones deterministically
  const milestones: Array<{ year: number; title: string; category: string }> = [
    { year: 2026, title: 'Historical Calibration Transition (Present Day)', category: 'calibration' },
  ];

  if (peakOut.year > 2026 && peakOut.year < 2095) {
    milestones.push({
      year: Math.round(peakOut.year),
      title: `Industrial Output Peaks ($${peakOut.value.toFixed(0)}/cap)`,
      category: 'economy',
    });
  }

  if (peakPop.year > 2026 && peakPop.year < 2095) {
    milestones.push({
      year: Math.round(peakPop.year),
      title: `Global Population Peaks (${(peakPop.value / 1e9).toFixed(2)}B)`,
      category: 'demography',
    });
  }

  // Check 1.5°C and 2.0°C warming crossings
  const cross15 = series.find((s) => s.temperature_anomaly !== undefined && s.temperature_anomaly >= 1.5);
  if (cross15 && cross15.time > 2020) {
    milestones.push({
      year: Math.round(cross15.time),
      title: '+1.5°C Warming Threshold Transgressed',
      category: 'climate',
    });
  }

  const finalState = series[series.length - 1] || series[0];
  const boundaryValues = {
    climate_change_co2: finalState.atmospheric_co2_ppm ?? 426,
    ocean_acidification: finalState.ocean_acidification ?? 2.79,
    freshwater_blue: finalState.freshwater_blue ?? 4200,
    biogeochemical_nitrogen: finalState.biogeochemical_nitrogen ?? 190,
    biosphere_genetic: finalState.biosphere_genetic ?? 130,
    land_system_change: 60.0,
    atmospheric_aerosols: 0.075,
    stratospheric_ozone: 284.0,
    novel_entities: finalState.novel_entities ?? 2.8,
  };

  return {
    series,
    milestones,
    boundaryValues,
    peakPopulation: peakPop,
    peakOutput: peakOut,
    peakTemp: peakT,
  };
}
