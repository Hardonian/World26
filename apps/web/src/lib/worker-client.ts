import { 
  WorkerBatchRequest, 
  WorkerProgressMessage, 
  WorkerBatchResponseMessage, 
  MonteCarloQuantiles 
} from '../workers/simulation.worker';
import { World26SimulatorTs, BUILTIN_SCENARIOS, World26ModelParameters } from '@world26/model';

export type ProgressCallback = (progress: WorkerProgressMessage) => void;

export class SimulationWorkerClient {
  private worker: Worker | null = null;
  private pendingRequests: Map<string, {
    resolve: (res: WorkerBatchResponseMessage) => void;
    reject: (err: Error) => void;
    onProgress?: ProgressCallback;
  }> = new Map();

  constructor() {
    this.initWorker();
  }

  private initWorker() {
    if (typeof window !== 'undefined' && typeof window.Worker !== 'undefined') {
      try {
        this.worker = new Worker(
          new URL('../workers/simulation.worker.ts', import.meta.url),
          { type: 'module' }
        );

        this.worker.onmessage = (e: MessageEvent) => {
          const data = e.data;
          if (!data || !data.requestId) return;

          const req = this.pendingRequests.get(data.requestId);
          if (!req) return;

          if (data.type === 'PROGRESS') {
            if (req.onProgress) {
              req.onProgress(data as WorkerProgressMessage);
            }
          } else if (data.type === 'BATCH_COMPLETE') {
            req.resolve(data as WorkerBatchResponseMessage);
            this.pendingRequests.delete(data.requestId);
          }
        };

        this.worker.onerror = (err) => {
          console.error('[SimulationWorker] Error:', err);
        };
      } catch (err) {
        console.warn('[SimulationWorker] Web Worker initialization failed, will use fallback:', err);
        this.worker = null;
      }
    }
  }

  async runBatchMonteCarlo(
    scenarioId: string = 'baseline_2026',
    policyOverrides: Record<string, number> = {},
    sampleCount: number = 500,
    onProgress?: ProgressCallback
  ): Promise<WorkerBatchResponseMessage> {
    const requestId = `batch_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;

    if (this.worker) {
      return new Promise((resolve, reject) => {
        this.pendingRequests.set(requestId, { resolve, reject, onProgress });
        const msg: WorkerBatchRequest = {
          type: 'RUN_BATCH_MONTE_CARLO',
          requestId,
          scenarioId,
          sampleCount,
          policyOverrides,
        };
        this.worker!.postMessage(msg);
      });
    }

    // Fallback: execute directly on main thread if worker unavailable
    return this.runBatchFallback(requestId, scenarioId, policyOverrides, sampleCount, onProgress);
  }

  private async runBatchFallback(
    requestId: string,
    scenarioId: string,
    policyOverrides: Record<string, number>,
    sampleCount: number,
    onProgress?: ProgressCallback
  ): Promise<WorkerBatchResponseMessage> {
    const startTime = performance.now();
    const count = Math.min(200, sampleCount); // Smaller count for main thread safety
    const scenario = BUILTIN_SCENARIOS.find((s) => s.id === scenarioId);
    const baseParams = scenario ? { ...scenario.parameterOverrides } : {};
    const effectiveBase = { ...baseParams, ...policyOverrides };

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

    for (let sample = 0; sample < count; sample++) {
      const ecs = Math.max(2.0, Math.min(5.0, (effectiveBase.climate_sensitivity_ecs ?? 3.0) + (Math.random() - 0.5) * 0.8));
      const sim = new World26SimulatorTs({ ...effectiveBase, climate_sensitivity_ecs: ecs });
      let localPeakPop = 0;
      let finalState = sim.state;

      for (let t = 1900; t <= 2100; t += 0.5) {
        const st = sim.step(0.5);
        if (st.population > localPeakPop) localPeakPop = st.population;

        const roundT = Math.round(t);
        if (timePoints.includes(roundT) && Math.abs(t - roundT) < 0.1) {
          seriesByTime[roundT].pop.push(st.population / 1e9);
          seriesByTime[roundT].temp.push(st.temperature_anomaly);
          seriesByTime[roundT].co2.push(st.atmospheric_co2_ppm);
          seriesByTime[roundT].output.push(st.industrial_output_per_capita);
          seriesByTime[roundT].compute.push(st.installed_compute_eflops);
          seriesByTime[roundT].wellbeing.push(st.human_wellbeing_index * 100);
        }
        if (t >= 2099.5) finalState = st;
      }

      peakPops.push(localPeakPop / 1e9);
      warmings2100.push(finalState.temperature_anomaly);
      co2s2100.push(finalState.atmospheric_co2_ppm);
      wellbeings2100.push(finalState.human_wellbeing_index * 100);

      if (onProgress && (sample % 20 === 0 || sample === count - 1)) {
        onProgress({
          type: 'PROGRESS',
          requestId,
          completed: sample + 1,
          total: count,
          percent: Math.round(((sample + 1) / count) * 100),
        });
      }
    }

    function computeQuantiles(key: 'pop' | 'temp' | 'co2' | 'output' | 'compute' | 'wellbeing') {
      return timePoints.map((tp) => {
        const arr = [...seriesByTime[tp][key]].sort((a, b) => a - b);
        const p10Index = Math.floor(arr.length * 0.1);
        const p50Index = Math.floor(arr.length * 0.5);
        const p90Index = Math.floor(arr.length * 0.9);
        const sum = arr.reduce((acc, v) => acc + v, 0);
        return {
          time: tp,
          p10: arr[p10Index] ?? arr[0],
          p50: arr[p50Index] ?? arr[0],
          p90: arr[p90Index] ?? arr[arr.length - 1],
          mean: sum / arr.length,
          min: arr[0],
          max: arr[arr.length - 1],
        };
      });
    }

    const quantiles: MonteCarloQuantiles = {
      population: computeQuantiles('pop'),
      temperature: computeQuantiles('temp'),
      co2: computeQuantiles('co2'),
      output: computeQuantiles('output'),
      compute: computeQuantiles('compute'),
      wellbeing: computeQuantiles('wellbeing'),
    };

    peakPops.sort((a, b) => a - b);
    warmings2100.sort((a, b) => a - b);
    co2s2100.sort((a, b) => a - b);
    wellbeings2100.sort((a, b) => a - b);

    return {
      type: 'BATCH_COMPLETE',
      requestId,
      sampleCount: count,
      durationMs: Math.round(performance.now() - startTime),
      quantiles,
      summary: {
        peakPopMedian: peakPops[Math.floor(peakPops.length * 0.5)],
        warming2100Median: warmings2100[Math.floor(warmings2100.length * 0.5)],
        co22100Median: co2s2100[Math.floor(co2s2100.length * 0.5)],
        wellbeing2100Median: wellbeings2100[Math.floor(wellbeings2100.length * 0.5)],
      },
    };
  }

  terminate() {
    if (this.worker) {
      this.worker.terminate();
      this.worker = null;
    }
    this.pendingRequests.clear();
  }
}

// Global singleton instance for easy client use
export const defaultWorkerClient = new SimulationWorkerClient();
