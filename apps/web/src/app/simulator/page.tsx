'use client';
import React, { useState, useEffect, useRef } from 'react';
import { 
  Play, 
  Pause, 
  RotateCcw, 
  Sliders, 
  Activity, 
  Globe, 
  HelpCircle, 
  Share2, 
  Map as MapIcon, 
  TrendingUp, 
  Sparkles,
  FastForward,
  Cpu
} from 'lucide-react';
import { TrajectoryCharts } from '@/components/TrajectoryCharts';
import { PlanetaryBoundaryWheel } from '@/components/PlanetaryBoundaryWheel';
import { CausalExplainer } from '@/components/CausalExplainer';
import { PolicyComposer, DEFAULT_POLICIES, PolicyState } from '@/components/PolicyComposer';
import { WorldViewMap } from '@/components/WorldViewMap';
import { WorldCardExport } from '@/components/WorldCardExport';
import { ScientificBadge } from '@/components/ScientificBadge';
import { ScenarioCopilot } from '@/components/ScenarioCopilot';
import { runWorld26Simulation, SimulationResultBundle } from '@/lib/simulator';
import { BUILTIN_SCENARIOS } from '@world26/model';

type CenterViewMode = 'trajectory' | 'boundaries' | 'map' | 'export';

export default function SimulatorPage() {

  const [selectedScenarioId, setSelectedScenarioId] = useState<string>('baseline_2026');
  const [policies, setPolicies] = useState<PolicyState>(DEFAULT_POLICIES);
  const [simResult, setSimResult] = useState<SimulationResultBundle | null>(null);

  // Time scrubber state
  const [currentYear, setCurrentYear] = useState<number>(2026);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1); // 1, 5, 20
  const [centerView, setCenterView] = useState<CenterViewMode>('trajectory');

  const animationFrameRef = useRef<number | null>(null);
  const lastTimeRef = useRef<number | null>(null);

  // Run simulation whenever scenario or policies change
  useEffect(() => {
    const res = runWorld26Simulation(selectedScenarioId, policies);
    setSimResult(res);
  }, [selectedScenarioId, policies]);

  // Playback timer loop
  useEffect(() => {
    if (!isPlaying) {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      lastTimeRef.current = null;
      return;
    }

    const animate = (timestamp: number) => {
      if (!lastTimeRef.current) lastTimeRef.current = timestamp;
      const deltaMs = timestamp - lastTimeRef.current;

      if (deltaMs > 30) {
        lastTimeRef.current = timestamp;
        setCurrentYear((prevYear) => {
          const next = prevYear + (0.25 * playbackSpeed);
          if (next >= 2100) {
            setIsPlaying(false);
            return 2100;
          }
          return Math.round(next * 4) / 4;
        });
      }

      animationFrameRef.current = requestAnimationFrame(animate);
    };

    animationFrameRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [isPlaying, playbackSpeed]);

  const handlePolicyChange = (key: keyof PolicyState, value: number) => {
    setPolicies((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const handleResetPolicies = () => {
    setPolicies(DEFAULT_POLICIES);
  };

  const currentScenario = BUILTIN_SCENARIOS.find((s) => s.id === selectedScenarioId) || BUILTIN_SCENARIOS[0];

  // Extract current slice for time scrubber
  const currentDataSlice =
    simResult?.series.find((d) => Math.abs(d.time - currentYear) < 0.3) ||
    simResult?.series[simResult.series.length - 1] ||
    { time: 2026 };

  return (
    <div className="flex-1 flex flex-col bg-[#070a0f] text-slate-100 font-mono select-none overflow-hidden">
      {/* Top Station Header Bar */}
      <div className="h-10 border-b border-slate-800/80 bg-slate-950 px-4 flex items-center justify-between text-xs">
        <div className="flex items-center space-x-3">
          <span className="text-cyan-400 font-bold flex items-center space-x-1.5">
            <Cpu className="w-3.5 h-3.5" />
            <span>Interactive Simulator Workstation</span>
          </span>
          <span className="text-slate-600">|</span>
          <span className="text-slate-300">
            Scenario: <strong className="text-slate-100">{currentScenario.name}</strong>
          </span>
          <span className="hidden sm:inline-block text-[10px] text-slate-500 bg-slate-900 px-2 py-0.5 rounded border border-slate-800">
            {currentScenario.family}
          </span>
        </div>

        <div className="flex items-center space-x-2">
          <ScientificBadge type="SIMULATED" />
          <span className="text-[10px] text-slate-400">Integrator: RK4 (dt = 0.25y)</span>
        </div>
      </div>

      {/* Main 3-Column Simulator Layout */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-0 overflow-y-auto lg:overflow-hidden">
        {/* LEFT COLUMN: Policy & Scenario Composer (3 cols) */}
        <div className="lg:col-span-3 border-r border-slate-800/80 p-3 overflow-y-auto max-h-none lg:max-h-[calc(100vh-140px)] bg-[#070a0f]/90 space-y-3">
          <ScenarioCopilot
            currentParams={policies as any}
            onApplyOverrides={(overrides) => {
              setPolicies((prev) => ({
                ...prev,
                ...overrides,
              }));
            }}
          />
          <PolicyComposer
            selectedScenarioId={selectedScenarioId}
            onSelectScenario={setSelectedScenarioId}
            policies={policies}
            onChangePolicy={handlePolicyChange}
            onResetPolicies={handleResetPolicies}
          />
        </div>


        {/* CENTER COLUMN: Visualizations & Trajectories (6 cols) */}
        <div className="lg:col-span-6 flex flex-col p-3 overflow-y-auto max-h-none lg:max-h-[calc(100vh-140px)] space-y-3 bg-slate-950/40">
          {/* View Mode Tabs */}
          <div className="flex items-center justify-between border-b border-slate-800/80 pb-2">
            <div className="flex items-center space-x-1">
              {[
                { id: 'trajectory', label: 'Trajectory Charts', icon: Activity },
                { id: 'boundaries', label: 'Boundary Wheel', icon: Globe },
                { id: 'map', label: 'World View', icon: MapIcon },
                { id: 'export', label: 'World Card', icon: Share2 },
              ].map((tab) => {
                const Icon = tab.icon;
                const isActive = centerView === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setCenterView(tab.id as CenterViewMode)}
                    className={`flex items-center space-x-1.5 px-3 py-1.5 rounded text-xs transition-all ${
                      isActive
                        ? 'bg-cyan-950 text-cyan-300 border border-cyan-800/80 shadow-[0_0_8px_rgba(0,240,255,0.2)]'
                        : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900 border border-transparent'
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </div>

            <div className="text-[11px] text-slate-400 hidden sm:block">
              Simulated 1900–2100
            </div>
          </div>

          {/* Active Center Visual */}
          <div className="flex-1 min-h-[380px]">
            {centerView === 'trajectory' && simResult && (
              <TrajectoryCharts
                data={simResult.series}
                selectedYear={currentYear}
                onSelectYear={(yr) => setCurrentYear(yr)}
                milestones={simResult.milestones}
              />
            )}

            {centerView === 'boundaries' && simResult && (
              <div className="bg-slate-950/80 border border-slate-800 rounded-lg p-4 flex flex-col items-center justify-center">
                <PlanetaryBoundaryWheel
                  simulatedValues={simResult.boundaryValues}
                  selectedYear={Math.round(currentYear)}
                  interactive={true}
                />
              </div>
            )}

            {centerView === 'map' && (
              <WorldViewMap selectedYear={Math.round(currentYear)} />
            )}

            {centerView === 'export' && simResult && (
              <WorldCardExport
                scenarioName={currentScenario.name}
                year={Math.round(currentYear)}
                dataPoint={currentDataSlice}
              />
            )}
          </div>
        </div>

        {/* RIGHT COLUMN: Causal Explainer ("Why Did That Happen?") (3 cols) */}
        <div className="lg:col-span-3 border-l border-slate-800/80 p-3 overflow-y-auto max-h-none lg:max-h-[calc(100vh-140px)] bg-[#070a0f]/90">
          <CausalExplainer
            selectedYear={Math.round(currentYear)}
            selectedVariable="industrial_output"
          />
        </div>
      </div>

      {/* BOTTOM CONTROL DOCK: 1900-2100 Scrubber & Playback Controls */}
      <div className="h-16 border-t border-slate-800/80 bg-slate-950/95 px-4 flex items-center justify-between gap-4 z-40">
        {/* Playback Controls */}
        <div className="flex items-center space-x-2 shrink-0">
          <button
            onClick={() => setIsPlaying(!isPlaying)}
            className={`p-2 rounded-lg font-bold text-xs flex items-center space-x-1.5 transition-all ${
              isPlaying
                ? 'bg-amber-500 hover:bg-amber-400 text-slate-950'
                : 'bg-cyan-500 hover:bg-cyan-400 text-slate-950 shadow-[0_0_12px_rgba(0,240,255,0.3)]'
            }`}
            title={isPlaying ? 'Pause Simulation' : 'Play Timeline'}
          >
            {isPlaying ? <Pause className="w-4 h-4 fill-current" /> : <Play className="w-4 h-4 fill-current" />}
            <span className="hidden sm:inline">{isPlaying ? 'Pause' : 'Play'}</span>
          </button>

          <button
            onClick={() => {
              setIsPlaying(false);
              setCurrentYear(1900);
            }}
            className="p-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 transition-colors"
            title="Reset to 1900"
          >
            <RotateCcw className="w-4 h-4" />
          </button>

          {/* Speed selector */}
          <div className="flex items-center bg-slate-900 rounded border border-slate-800 p-0.5 text-[10px]">
            {[1, 5, 20].map((spd) => (
              <button
                key={spd}
                onClick={() => setPlaybackSpeed(spd)}
                className={`px-2 py-0.5 rounded ${
                  playbackSpeed === spd
                    ? 'bg-cyan-950 text-cyan-300 font-bold border border-cyan-800'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {spd}x
              </button>
            ))}
          </div>
        </div>

        {/* 1900-2100 Scrubber Slider */}
        <div className="flex-1 flex items-center space-x-3 max-w-3xl">
          <span className="text-[11px] text-slate-400 font-bold">1900</span>
          <div className="relative flex-1 flex items-center">
            <input
              type="range"
              min="1900"
              max="2100"
              step="0.25"
              value={currentYear}
              onChange={(e) => {
                setIsPlaying(false);
                setCurrentYear(parseFloat(e.target.value));
              }}
              className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-400"
            />
            {/* 2026 Present Marker */}
            <div
              className="absolute top-1/2 -translate-y-1/2 w-1.5 h-3 bg-cyan-400 pointer-events-none rounded"
              style={{ left: `${((2026 - 1900) / (2100 - 1900)) * 100}%` }}
              title="2026 Present Transition"
            />
          </div>
          <span className="text-[11px] text-slate-400 font-bold">2100</span>
        </div>

        {/* Current Year Readout Badge */}
        <div className="shrink-0 flex items-center space-x-2">
          <div className="text-right">
            <span className="text-[10px] text-slate-500 uppercase tracking-widest block -mb-0.5">Timeline</span>
            <span className="text-lg font-bold text-cyan-300">{currentYear.toFixed(1)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
