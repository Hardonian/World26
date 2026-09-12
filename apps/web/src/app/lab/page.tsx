'use client';
import React, { useState } from 'react';
import { 
  FlaskConical, 
  Search, 
  Play, 
  TrendingUp, 
  Dna, 
  Cpu, 
  Layers, 
  Sparkles, 
  CheckCircle2, 
  RefreshCw,
  Gauge
} from 'lucide-react';
import { ScientificBadge } from '@/components/ScientificBadge';
import { loadParameters } from '@world26/data';
import { runOatSensitivityAnalysis } from '@world26/analytics';
import { defaultWorkerClient } from '@/lib/worker-client';
import { BUILTIN_SCENARIOS } from '@world26/model';
import { QuantilePoint, WorkerBatchResponseMessage } from '@/workers/simulation.worker';

// Helper component to render an interactive SVG fan chart
function StochasticFanChart({
  title,
  unit,
  points,
  yMin,
  yMax,
  color,
  threshold,
  thresholdLabel,
}: {
  title: string;
  unit: string;
  points: QuantilePoint[];
  yMin: number;
  yMax: number;
  color: string;
  threshold?: number;
  thresholdLabel?: string;
}) {
  if (!points || points.length === 0) return null;

  const width = 520;
  const height = 180;
  const padding = { top: 20, right: 20, bottom: 25, left: 45 };

  const plotW = width - padding.left - padding.right;
  const plotH = height - padding.top - padding.bottom;

  const tMin = 1960;
  const tMax = 2100;

  const getX = (t: number) => padding.left + ((t - tMin) / (tMax - tMin)) * plotW;
  const getY = (val: number) => padding.top + plotH - ((Math.max(yMin, Math.min(yMax, val)) - yMin) / (yMax - yMin)) * plotH;

  // Build confidence envelope path (P90 forward, then P10 backward)
  const forwardP90 = points.map((p) => `${getX(p.time)},${getY(p.p90)}`).join(' L ');
  const backwardP10 = [...points].reverse().map((p) => `${getX(p.time)},${getY(p.p10)}`).join(' L ');
  const envelopePath = `M ${forwardP90} L ${backwardP10} Z`;

  // Median line path (P50)
  const medianPath = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${getX(p.time)},${getY(p.p50)}`).join(' ');

  const lastPoint = points[points.length - 1];

  return (
    <div className="p-4 rounded-xl border border-slate-800 bg-slate-950/80 space-y-2">
      <div className="flex items-center justify-between">
        <div>
          <span className="font-bold text-slate-200 text-xs block">{title}</span>
          <span className="text-[10px] text-slate-400 font-mono">
            P10: {lastPoint.p10.toFixed(2)} | P50: <strong className="text-cyan-300">{lastPoint.p50.toFixed(2)}</strong> | P90: {lastPoint.p90.toFixed(2)} {unit}
          </span>
        </div>
        <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-900 border border-slate-800 text-slate-400">
          2100 Fan
        </span>
      </div>

      <div className="w-full overflow-hidden">
        <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-auto select-none">
          {/* Grid lines */}
          <line x1={padding.left} y1={padding.top} x2={width - padding.right} y2={padding.top} stroke="#1e293b" strokeDasharray="3 3" />
          <line x1={padding.left} y1={padding.top + plotH / 2} x2={width - padding.right} y2={padding.top + plotH / 2} stroke="#1e293b" strokeDasharray="3 3" />
          <line x1={padding.left} y1={height - padding.bottom} x2={width - padding.right} y2={height - padding.bottom} stroke="#334155" />

          {/* Threshold reference line */}
          {threshold !== undefined && threshold >= yMin && threshold <= yMax && (
            <>
              <line
                x1={padding.left}
                y1={getY(threshold)}
                x2={width - padding.right}
                y2={getY(threshold)}
                stroke="#f43f5e"
                strokeDasharray="4 4"
                strokeWidth={1.5}
              />
              <text x={width - padding.right - 4} y={getY(threshold) - 4} textAnchor="end" fill="#f43f5e" fontSize="9" fontFamily="monospace">
                {thresholdLabel || `${threshold}${unit}`}
              </text>
            </>
          )}

          {/* Shaded P10-P90 Confidence Envelope */}
          <path d={envelopePath} fill={color} fillOpacity={0.18} />

          {/* P50 Median Line */}
          <path d={medianPath} fill="none" stroke={color} strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round" />

          {/* Y Axis Labels */}
          <text x={padding.left - 6} y={padding.top + 8} textAnchor="end" fill="#64748b" fontSize="9" fontFamily="monospace">
            {yMax.toFixed(0)}
          </text>
          <text x={padding.left - 6} y={height - padding.bottom} textAnchor="end" fill="#64748b" fontSize="9" fontFamily="monospace">
            {yMin.toFixed(0)}
          </text>

          {/* X Axis Time Labels */}
          <text x={getX(1960)} y={height - 8} textAnchor="middle" fill="#64748b" fontSize="9" fontFamily="monospace">1960</text>
          <text x={getX(2026)} y={height - 8} textAnchor="middle" fill="#00f0ff" fontSize="9" fontFamily="monospace">2026</text>
          <text x={getX(2060)} y={height - 8} textAnchor="middle" fill="#64748b" fontSize="9" fontFamily="monospace">2060</text>
          <text x={getX(2100)} y={height - 8} textAnchor="middle" fill="#64748b" fontSize="9" fontFamily="monospace">2100</text>
        </svg>
      </div>
    </div>
  );
}

export default function ExperimentLabPage() {
  const [activeTab, setActiveTab] = useState<'monte_carlo' | 'parameters'>('monte_carlo');

  // Parameter explorer state
  const [searchQuery, setSearchQuery] = useState('');
  const [activeParamKey, setActiveParamKey] = useState<string>('compute_demand_growth_rate');
  const [sensitivityResult, setSensitivityResult] = useState<any | null>(null);
  const [isRunningSensitivity, setIsRunningSensitivity] = useState(false);

  // Monte Carlo Worker state
  const [selectedScenarioId, setSelectedScenarioId] = useState<string>('baseline_2026');
  const [sampleCount, setSampleCount] = useState<number>(500);
  const [isWorkerRunning, setIsWorkerRunning] = useState(false);
  const [workerProgress, setWorkerProgress] = useState<{ percent: number; completed: number; total: number } | null>(null);
  const [batchResult, setBatchResult] = useState<WorkerBatchResponseMessage | null>(null);

  const paramRegistry = loadParameters();

  const filteredParams = Object.entries(paramRegistry).filter(([key, val]) => {
    const q = searchQuery.toLowerCase();
    return key.toLowerCase().includes(q) || val.source.toLowerCase().includes(q) || val.notes.toLowerCase().includes(q);
  });

  const activeParam = paramRegistry[activeParamKey] || Object.values(paramRegistry)[0];

  const handleRunSensitivity = () => {
    setIsRunningSensitivity(true);
    setTimeout(() => {
      const res = runOatSensitivityAnalysis(undefined, 'temperature_anomaly', 2100);
      setSensitivityResult(res);
      setIsRunningSensitivity(false);
    }, 50);
  };

  const handleRunMonteCarlo = async () => {
    setIsWorkerRunning(true);
    setWorkerProgress({ percent: 0, completed: 0, total: sampleCount });
    try {
      const result = await defaultWorkerClient.runBatchMonteCarlo(
        selectedScenarioId,
        {},
        sampleCount,
        (p) => {
          setWorkerProgress({ percent: p.percent, completed: p.completed, total: p.total });
        }
      );
      setBatchResult(result);
    } catch (err) {
      console.error('Batch runner error:', err);
    } finally {
      setIsWorkerRunning(false);
    }
  };

  return (
    <div className="max-w-[1720px] mx-auto p-4 sm:p-8 font-mono text-xs select-none space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between border-b border-slate-800 pb-4 gap-4">
        <div>
          <div className="inline-flex items-center space-x-2 text-cyan-400 text-xs font-bold uppercase tracking-wider mb-1">
            <FlaskConical className="w-4 h-4" />
            <span>Advanced Quantitative Laboratory</span>
            <span className="text-slate-600">•</span>
            <span className="text-emerald-400 flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3" />
              Web Worker Batch Runner Active
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-100">
            Uncertainty Quantification &amp; Parameter Lab
          </h1>
          <p className="text-slate-400 text-xs mt-1 max-w-2xl leading-relaxed">
            Execute 1,000-run stochastic Monte Carlo ensembles in dedicated background workers without main-thread UI lag.
            Inspect empirical parameter provenance and one-at-a-time (OAT) sensitivity sweeps.
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <ScientificBadge type="ASSUMED" />
          <span className="text-slate-400 text-[11px] bg-slate-900 border border-slate-800 px-2 py-1 rounded">
            Seeded PRNG &bull; Zero Lag
          </span>
        </div>
      </div>

      {/* Main Tabs */}
      <div className="flex items-center space-x-2 border-b border-slate-800">
        <button
          onClick={() => setActiveTab('monte_carlo')}
          className={`px-4 py-2.5 rounded-t-lg font-bold text-xs transition-colors flex items-center space-x-2 border-t border-x ${
            activeTab === 'monte_carlo'
              ? 'bg-slate-900 text-cyan-400 border-slate-800 border-b-2 border-b-cyan-500'
              : 'bg-transparent text-slate-400 border-transparent hover:text-slate-200'
          }`}
        >
          <Gauge className="w-4 h-4" />
          <span>Monte Carlo Ensemble (Worker Powered)</span>
        </button>

        <button
          onClick={() => setActiveTab('parameters')}
          className={`px-4 py-2.5 rounded-t-lg font-bold text-xs transition-colors flex items-center space-x-2 border-t border-x ${
            activeTab === 'parameters'
              ? 'bg-slate-900 text-cyan-400 border-slate-800 border-b-2 border-b-cyan-500'
              : 'bg-transparent text-slate-400 border-transparent hover:text-slate-200'
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>Parameter Registry &amp; OAT Sensitivity</span>
        </button>
      </div>

      {/* TAB 1: MONTE CARLO STOCHASTIC ENSEMBLE */}
      {activeTab === 'monte_carlo' && (
        <div className="space-y-6">
          {/* Controls Bar */}
          <div className="p-4 rounded-xl border border-slate-800 bg-slate-950/80 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
            <div className="flex flex-wrap items-center gap-3">
              <div>
                <span className="text-[10px] text-slate-500 uppercase block mb-1">Scenario Baseline:</span>
                <select
                  value={selectedScenarioId}
                  onChange={(e) => setSelectedScenarioId(e.target.value)}
                  className="bg-slate-900 border border-slate-700 rounded px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-cyan-400"
                >
                  {BUILTIN_SCENARIOS.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <span className="text-[10px] text-slate-500 uppercase block mb-1">Ensemble Size:</span>
                <div className="flex items-center space-x-1">
                  {[100, 500, 1000].map((count) => (
                    <button
                      key={count}
                      onClick={() => setSampleCount(count)}
                      className={`px-2.5 py-1.5 rounded text-xs transition-colors ${
                        sampleCount === count
                          ? 'bg-cyan-500 text-slate-950 font-bold'
                          : 'bg-slate-900 text-slate-300 border border-slate-800 hover:bg-slate-850'
                      }`}
                    >
                      {count} Runs
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              {isWorkerRunning && workerProgress && (
                <div className="text-right">
                  <div className="text-[10px] text-cyan-400 font-bold animate-pulse">
                    Computing {workerProgress.completed} / {workerProgress.total} ({workerProgress.percent}%)
                  </div>
                  <div className="w-36 bg-slate-900 h-1.5 rounded-full overflow-hidden mt-1 border border-slate-800">
                    <div className="bg-cyan-400 h-full transition-all" style={{ width: `${workerProgress.percent}%` }} />
                  </div>
                </div>
              )}

              <button
                onClick={handleRunMonteCarlo}
                disabled={isWorkerRunning}
                className="flex items-center space-x-2 px-5 py-2.5 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold transition-all hover:scale-105 active:scale-95 disabled:opacity-50 shadow-[0_0_15px_rgba(0,240,255,0.3)]"
              >
                {isWorkerRunning ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Executing Worker...</span>
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4 fill-current" />
                    <span>Run {sampleCount}-Run Ensemble</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Results Area */}
          {batchResult ? (
            <div className="space-y-6">
              {/* Summary Metrics Cards */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 font-mono text-xs">
                <div className="p-3.5 rounded-xl border border-slate-800 bg-slate-950/70">
                  <div className="text-[10px] text-slate-400 uppercase">Median Peak Population</div>
                  <div className="text-lg font-bold text-cyan-400 mt-0.5">
                    {batchResult.summary.peakPopMedian.toFixed(2)} Billion
                  </div>
                  <div className="text-[10px] text-slate-500 mt-1">Stochastic Demography</div>
                </div>

                <div className="p-3.5 rounded-xl border border-slate-800 bg-slate-950/70">
                  <div className="text-[10px] text-slate-400 uppercase">Median 2100 Warming</div>
                  <div className="text-lg font-bold text-amber-400 mt-0.5">
                    +{batchResult.summary.warming2100Median.toFixed(2)}°C
                  </div>
                  <div className="text-[10px] text-slate-500 mt-1">Climate Sensitivity ECS Fan</div>
                </div>

                <div className="p-3.5 rounded-xl border border-slate-800 bg-slate-950/70">
                  <div className="text-[10px] text-slate-400 uppercase">Median 2100 CO₂</div>
                  <div className="text-lg font-bold text-slate-200 mt-0.5">
                    {batchResult.summary.co22100Median.toFixed(0)} ppm
                  </div>
                  <div className="text-[10px] text-slate-500 mt-1">Carbon Cycle Dispersion</div>
                </div>

                <div className="p-3.5 rounded-xl border border-slate-800 bg-slate-950/70">
                  <div className="text-[10px] text-slate-400 uppercase">Median 2100 Wellbeing</div>
                  <div className="text-lg font-bold text-emerald-400 mt-0.5">
                    {batchResult.summary.wellbeing2100Median.toFixed(0)} / 100
                  </div>
                  <div className="text-[10px] text-slate-500 mt-1">Human Welfare Composite</div>
                </div>
              </div>

              {/* 4 Stochastic Fan Charts (2x2 grid) */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <StochasticFanChart
                  title="Global Population Trajectory (P10, P50, P90)"
                  unit="B"
                  points={batchResult.quantiles.population}
                  yMin={1.5}
                  yMax={12.0}
                  color="#00f0ff"
                />

                <StochasticFanChart
                  title="Global Surface Warming Anomaly (P10, P50, P90)"
                  unit="°C"
                  points={batchResult.quantiles.temperature}
                  yMin={0.0}
                  yMax={4.5}
                  color="#f59e0b"
                  threshold={1.5}
                  thresholdLabel="+1.5°C Paris Limit"
                />

                <StochasticFanChart
                  title="Installed AI Compute Capacity (P10, P50, P90)"
                  unit="EFLOPS"
                  points={batchResult.quantiles.compute}
                  yMin={0.0}
                  yMax={Math.max(500, batchResult.quantiles.compute[batchResult.quantiles.compute.length - 1]?.p90 * 1.15 || 500)}
                  color="#c084fc"
                />

                <StochasticFanChart
                  title="Human Wellbeing Index (P10, P50, P90)"
                  unit="/100"
                  points={batchResult.quantiles.wellbeing}
                  yMin={0}
                  yMax={100}
                  color="#10b981"
                />
              </div>

              <div className="text-right text-[10px] text-slate-500">
                Completed {batchResult.sampleCount} runs in {batchResult.durationMs}ms ({((batchResult.durationMs / batchResult.sampleCount)).toFixed(2)} ms/run)
              </div>
            </div>
          ) : (
            <div className="p-12 rounded-xl border border-dashed border-slate-800 text-center space-y-3 bg-slate-950/40">
              <Sparkles className="w-8 h-8 text-cyan-400 mx-auto opacity-75" />
              <div className="font-bold text-slate-200 text-sm">No Stochastic Ensemble Run Yet</div>
              <p className="text-slate-400 text-xs max-w-md mx-auto">
                Click &quot;Run {sampleCount}-Run Ensemble&quot; above to initiate stochastic parameter sampling in a background Web Worker.
              </p>
            </div>
          )}
        </div>
      )}

      {/* TAB 2: PARAMETER REGISTRY & OAT SENSITIVITY */}
      {activeTab === 'parameters' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column: Parameter List (5 cols) */}
          <div className="lg:col-span-5 bg-slate-950/80 border border-slate-800 rounded-xl p-4 space-y-3">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-500" />
              <input
                type="text"
                placeholder="Search parameters, sources, units..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700/80 rounded-lg pl-9 pr-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-cyan-400"
              />
            </div>

            <div className="text-[11px] text-slate-400 font-bold uppercase tracking-wider flex justify-between">
              <span>Model Parameters ({filteredParams.length})</span>
              <span>Confidence</span>
            </div>

            <div className="space-y-1.5 overflow-y-auto max-h-[640px] pr-1">
              {filteredParams.map(([key, p]) => {
                const isSelected = key === activeParamKey;
                return (
                  <button
                    key={key}
                    onClick={() => {
                      setActiveParamKey(key);
                      setSensitivityResult(null);
                    }}
                    className={`w-full text-left p-2.5 rounded-lg border transition-all flex items-center justify-between ${
                      isSelected
                        ? 'bg-cyan-950/70 border-cyan-500/60 text-cyan-200 shadow-[0_0_10px_rgba(0,240,255,0.15)]'
                        : 'bg-slate-900/40 border-slate-800 text-slate-300 hover:bg-slate-900'
                    }`}
                  >
                    <div className="pr-2 truncate">
                      <span className="font-bold text-xs block truncate">{key}</span>
                      <span className="text-[10px] text-slate-500 truncate block">
                        {p.value} {p.unit} &bull; {p.source}
                      </span>
                    </div>

                    <span
                      className={`text-[9px] uppercase px-1.5 py-0.5 rounded font-bold shrink-0 ${
                        p.confidence === 'high'
                          ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                          : p.confidence === 'medium'
                          ? 'bg-amber-950 text-amber-300 border border-amber-800'
                          : 'bg-rose-950 text-rose-300 border border-rose-800'
                      }`}
                    >
                      {p.confidence}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Right Column: Parameter Metadata & Sensitivity Runner (7 cols) */}
          <div className="lg:col-span-7 space-y-4">
            {/* Active Parameter Card */}
            <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-6 space-y-4">
              <div className="flex items-start justify-between border-b border-slate-800 pb-3">
                <div>
                  <h2 className="text-xl font-bold text-slate-100">{activeParamKey}</h2>
                  <span className="text-cyan-400 text-xs mt-0.5 block font-semibold">
                    Unit: {activeParam.unit}
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-[10px] text-slate-500 uppercase block">Calibrated Value</span>
                  <span className="text-xl font-bold text-cyan-300">{activeParam.value}</span>
                </div>
              </div>

              {/* Uncertainty Bounds */}
              <div className="grid grid-cols-3 gap-3 bg-slate-900/60 p-3 rounded-lg border border-slate-800 text-center">
                <div>
                  <span className="text-slate-500 text-[10px] uppercase block">Lower Bound</span>
                  <span className="text-sm font-bold text-slate-200">{activeParam.lowerBound}</span>
                </div>
                <div className="border-x border-slate-800">
                  <span className="text-slate-500 text-[10px] uppercase block">Point Value</span>
                  <span className="text-sm font-bold text-cyan-400">{activeParam.value}</span>
                </div>
                <div>
                  <span className="text-slate-500 text-[10px] uppercase block">Upper Bound</span>
                  <span className="text-sm font-bold text-slate-200">{activeParam.upperBound}</span>
                </div>
              </div>

              {/* Provenance and Citation */}
              <div className="space-y-2">
                <span className="text-[10px] text-slate-500 uppercase font-bold tracking-wider block">
                  Provenance &amp; Scientific Source:
                </span>
                <p className="text-xs text-slate-300 bg-slate-900/40 p-3 rounded border border-slate-800/80 leading-relaxed">
                  {activeParam.notes}
                </p>
                <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1">
                  <span>Source: <strong className="text-slate-200">{activeParam.source}</strong> ({activeParam.sourceYear})</span>
                  <span>Transformation: <code className="text-cyan-300">{activeParam.transformation}</code></span>
                </div>
              </div>

              {/* Run Sensitivity Button */}
              <div className="pt-3 border-t border-slate-800 flex items-center justify-between">
                <div className="text-[11px] text-slate-400">
                  Evaluate &plusmn;20% perturbation impact on 2100 state
                </div>
                <button
                  onClick={handleRunSensitivity}
                  disabled={isRunningSensitivity}
                  className="flex items-center space-x-1.5 px-4 py-2 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold transition-all hover:scale-105 active:scale-95 disabled:opacity-50"
                >
                  <Play className="w-3.5 h-3.5 fill-current" />
                  <span>{isRunningSensitivity ? 'Running...' : 'Run OAT Sensitivity'}</span>
                </button>
              </div>
            </div>

            {/* Sensitivity Tornado Results */}
            {sensitivityResult && (
              <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-6 space-y-4">
                <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                  <span className="font-bold text-slate-200 uppercase tracking-wider text-xs">
                    One-At-A-Time (OAT) Sensitivity Tornado (Target: {sensitivityResult.targetMetric})
                  </span>
                  <span className="text-[10px] text-emerald-400 font-bold bg-emerald-950 px-2 py-0.5 rounded border border-emerald-800">
                    Year {sensitivityResult.evaluationYear} Baseline: {sensitivityResult.baselineValue?.toFixed(2)}°C
                  </span>
                </div>

                <div className="space-y-3">
                  {sensitivityResult.tornadoItems?.map((item: any, idx: number) => {
                    return (
                      <div key={idx} className="p-3 rounded-lg border border-slate-800 bg-slate-900/50 space-y-1.5">
                        <div className="flex justify-between items-center text-xs">
                          <span className="font-bold text-slate-200">{item.name}</span>
                          <span className="font-bold text-cyan-300">
                            Swing: &plusmn;{item.swingMagnitude?.toFixed(3)}°C
                          </span>
                        </div>
                        <div className="w-full bg-slate-950 h-2 rounded-full overflow-hidden flex">
                          <div
                            className="h-full rounded-full bg-cyan-400"
                            style={{ width: `${Math.min(item.swingMagnitude * 100, 100)}%` }}
                          />
                        </div>
                        <div className="flex justify-between text-[10px] text-slate-500">
                          <span>Low ({item.lowValue}): &Delta; {item.targetDeltaLow?.toFixed(3)}°C</span>
                          <span>High ({item.highValue}): &Delta; {item.targetDeltaHigh?.toFixed(3)}°C</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
