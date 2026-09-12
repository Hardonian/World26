import { World26SimulatorTs, BUILTIN_SCENARIOS, World26ModelParameters } from '@world26/model';

export interface WorkerRunRequest {
  type: 'RUN_SIMULATION';
  requestId: string;
  scenarioId: string;
  policyOverrides?: Record<string, number>;
}

export interface WorkerBatchRequest {
  type: 'RUN_BATCH_MONTE_CARLO';
  requestId: string;
  scenarioId: string;
  sampleCount: number;
  policyOverrides?: Record<string, number>;
}

export interface WorkerProgressMessage {
  type: 'PROGRESS';
  requestId: string;
  completed: number;
  total: number;
  percent: number;
}

export interface QuantilePoint {
  time: number;
  p10: number;
  p50: number;
  p90: number;
  mean: number;
  min: number;
  max: number;
}

export interface MonteCarloQuantiles {
  population: QuantilePoint[];
  temperature: QuantilePoint[];
  co2: QuantilePoint[];
  output: QuantilePoint[];
  compute: QuantilePoint[];
  wellbeing: QuantilePoint[];
}

export interface WorkerBatchResponseMessage {
  type: 'BATCH_COMPLETE';
  requestId: string;
  sampleCount: number;
  durationMs: number;
  quantiles: MonteCarloQuantiles;
  summary: {
    peakPopMedian: number;
    warming2100Median: number;
    co22100Median: number;
    wellbeing2100Median: number;
  };
}

// Pseudo-random normal distribution (Box-Muller transform)
function randomNormal(mean: number, stdDev: number): number {
  let u = 0;
  let v = 0;
  while (u === 0) u = Math.random();
  while (v === 0) v = Math.random();
  const z = Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);
  return mean + z * stdDev;
}

function quantile(sorted: number[], q: number): number {
  const pos = (sorted.length - 1) * q;
  const base = Math.floor(pos);
  const rest = pos - base;
  if (sorted[base + 1] !== undefined) {
    return sorted[base] + rest * (sorted[base + 1] - sorted[base]);
  }
  return sorted[base];
}

self.onmessage = (event: MessageEvent) => {
  const data = event.data as WorkerRunRequest | WorkerBatchRequest;
  if (!data || !data.type) return;

  if (data.type === 'RUN_BATCH_MONTE_CARLO') {
    const startTime = performance.now();
    const sampleCount = Math.max(10, Math.min(2000, data.sampleCount || 500));
    const scenario = BUILTIN_SCENARIOS.find((s) => s.id === data.scenarioId);
    const baseParams = scenario ? { ...scenario.parameterOverrides } : {};
    const effectiveBase = { ...baseParams, ...(data.policyOverrides || {}) };

    const timePoints = [1960, 1980, 2000, 2020, 2026, 2035, 2050, 2065, 2080, 2100];
    const seriesByTime: Record<number, {
      pop: number[];
      temp: number[];
      co2: number[];
      output: number[];
      compute: number[];
      wellbeing: number[];
    }> = {};

    for (const tp of timePoints) {
      seriesByTime[tp] = { pop: [], temp: [], co2: [], output: [], compute: [], wellbeing: [] };
    }

    const peakPops: number[] = [];
    const warmings2100: number[] = [];
    const co2s2100: number[] = [];
    const wellbeings2100: number[] = [];

    for (let sample = 0; sample < sampleCount; sample++) {
      // Stochastic parameter perturbation
      const perturbedParams: Partial<World26ModelParameters> = {
        ...effectiveBase,
        climate_sensitivity_ecs: Math.max(2.0, Math.min(5.0, randomNormal(effectiveBase.climate_sensitivity_ecs ?? 3.0, 0.45))),
        renewable_cost_learning_rate: Math.max(0.12, Math.min(0.35, randomNormal(effectiveBase.renewable_cost_learning_rate ?? 0.22, 0.03))),
        compute_demand_growth_rate: Math.max(0.15, Math.min(0.55, randomNormal(effectiveBase.compute_demand_growth_rate ?? 0.35, 0.06))),
        ai_productivity_elasticity: Math.max(0.02, Math.min(0.18, randomNormal(effectiveBase.ai_productivity_elasticity ?? 0.08, 0.02))),
        hardware_lifetime_years: Math.max(1.8, Math.min(6.0, randomNormal(effectiveBase.hardware_lifetime_years ?? 3.5, 0.5))),
      };

      const sim = new World26SimulatorTs(perturbedParams);
      let localPeakPop = 0;
      let finalState = sim.state;

      for (let t = 1900; t <= 2100; t += 0.5) {
        const st = sim.step(0.5);
        if (st.population > localPeakPop) {
          localPeakPop = st.population;
        }

        const roundT = Math.round(t);
        if (timePoints.includes(roundT) && Math.abs(t - roundT) < 0.1) {
          seriesByTime[roundT].pop.push(st.population / 1e9);
          seriesByTime[roundT].temp.push(st.temperature_anomaly);
          seriesByTime[roundT].co2.push(st.atmospheric_co2_ppm);
          seriesByTime[roundT].output.push(st.industrial_output_per_capita);
          seriesByTime[roundT].compute.push(st.installed_compute_eflops);
          seriesByTime[roundT].wellbeing.push(st.human_wellbeing_index * 100);
        }

        if (t >= 2099.5) {
          finalState = st;
        }
      }

      peakPops.push(localPeakPop / 1e9);
      warmings2100.push(finalState.temperature_anomaly);
      co2s2100.push(finalState.atmospheric_co2_ppm);
      wellbeings2100.push(finalState.human_wellbeing_index * 100);

      // Report progress every 50 samples
      if ((sample + 1) % 50 === 0 || sample === sampleCount - 1) {
        self.postMessage({
          type: 'PROGRESS',
          requestId: data.requestId,
          completed: sample + 1,
          total: sampleCount,
          percent: Math.round(((sample + 1) / sampleCount) * 100),
        } as WorkerProgressMessage);
      }
    }

    // Compute quantile points for each series
    function computeQuantileSeries(key: 'pop' | 'temp' | 'co2' | 'output' | 'compute' | 'wellbeing'): QuantilePoint[] {
      return timePoints.map((tp) => {
        const arr = [...seriesByTime[tp][key]].sort((a, b) => a - b);
        const sum = arr.reduce((acc, v) => acc + v, 0);
        return {
          time: tp,
          p10: quantile(arr, 0.10),
          p50: quantile(arr, 0.50),
          p90: quantile(arr, 0.90),
          mean: sum / arr.length,
          min: arr[0],
          max: arr[arr.length - 1],
        };
      });
    }

    const quantiles: MonteCarloQuantiles = {
      population: computeQuantileSeries('pop'),
      temperature: computeQuantileSeries('temp'),
      co2: computeQuantileSeries('co2'),
      output: computeQuantileSeries('output'),
      compute: computeQuantileSeries('compute'),
      wellbeing: computeQuantileSeries('wellbeing'),
    };

    peakPops.sort((a, b) => a - b);
    warmings2100.sort((a, b) => a - b);
    co2s2100.sort((a, b) => a - b);
    wellbeings2100.sort((a, b) => a - b);

    const durationMs = Math.round(performance.now() - startTime);

    const response: WorkerBatchResponseMessage = {
      type: 'BATCH_COMPLETE',
      requestId: data.requestId,
      sampleCount,
      durationMs,
      quantiles,
      summary: {
        peakPopMedian: quantile(peakPops, 0.50),
        warming2100Median: quantile(warmings2100, 0.50),
        co22100Median: quantile(co2s2100, 0.50),
        wellbeing2100Median: quantile(wellbeings2100, 0.50),
      },
    };

    self.postMessage(response);
  }
};
