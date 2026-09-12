'use client';
import React, { useState } from 'react';
import { 
  Sparkles, 
  Send, 
  Check, 
  X, 
  Sliders, 
  ArrowRight, 
  ShieldCheck, 
  Lightbulb,
  Cpu
} from 'lucide-react';
import { extractParametersFromPrompt, CopilotResponse, CopilotParamDiff } from '@/lib/copilot';


interface ScenarioCopilotProps {
  onApplyOverrides: (overrides: Record<string, number>) => void;
  currentParams?: Record<string, number>;
}

const QUICK_PROMPTS = [
  'Accelerate solar & wind to 95% by 2045 with circular hardware mandate',
  'Post-silicon optical computing breakthrough in 2032 with 8x efficiency',
  'Enact $100/ton carbon tax, universal basic services, and cut food waste by 50%',
  'Cap annual compute cluster scaling to 15% to mitigate grid power competition',
];

export function ScenarioCopilot({ onApplyOverrides, currentParams = {} }: ScenarioCopilotProps) {
  const [prompt, setPrompt] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [proposedResult, setProposedResult] = useState<CopilotResponse | null>(null);

  const handleSubmit = (textToProcess?: string) => {
    const q = textToProcess || prompt;
    if (!q.trim()) return;

    setIsProcessing(true);
    // Execute deterministic rule-based extractor
    setTimeout(() => {
      try {
        const res = extractParametersFromPrompt(q, currentParams);
        setProposedResult(res);
      } catch (err) {
        console.error('Copilot extraction error:', err);
      } finally {
        setIsProcessing(false);
      }
    }, 80);
  };

  const handleApply = () => {
    if (!proposedResult) return;
    const overrides: Record<string, number> = {};
    for (const diff of proposedResult.diffs) {
      overrides[diff.paramKey] = diff.proposedValue;
    }
    onApplyOverrides(overrides);
    setProposedResult(null);
    setPrompt('');
  };

  return (
    <div className="p-4 rounded-xl border border-slate-800 bg-slate-950/90 font-mono text-xs space-y-4 shadow-[0_4px_20px_rgba(0,0,0,0.5)]">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
        <div className="flex items-center space-x-2">
          <div className="w-5 h-5 rounded bg-cyan-500/20 border border-cyan-500/50 flex items-center justify-center text-cyan-400">
            <Sparkles className="w-3 h-3" />
          </div>
          <span className="font-bold text-slate-100 text-xs">Scenario Copilot</span>
          <span className="text-[10px] text-slate-500 font-normal">Deterministic Natural Language Policy Composer</span>
        </div>
        <div className="flex items-center space-x-1 text-[10px] text-emerald-400">
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>Offline Capable</span>
        </div>
      </div>

      {/* Input Field & Submit */}
      <div className="flex items-center space-x-2">
        <div className="relative flex-1">
          <input
            type="text"
            placeholder="Describe a scenario: e.g., 'Target 95% clean power by 2045 and optical chips by 2032'..."
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleSubmit();
            }}
            className="w-full bg-slate-900 border border-slate-700/80 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-cyan-400 font-mono placeholder:text-slate-500"
          />
        </div>
        <button
          onClick={() => handleSubmit()}
          disabled={!prompt.trim() || isProcessing}
          className="px-3.5 py-2 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold transition-all disabled:opacity-40 flex items-center space-x-1.5 shadow-[0_0_10px_rgba(0,240,255,0.25)]"
        >
          <span>{isProcessing ? 'Parsing...' : 'Propose'}</span>
          <Send className="w-3 h-3" />
        </button>
      </div>

      {/* Suggestion Chips */}
      <div className="flex items-center space-x-1.5 overflow-x-auto pb-1">
        <span className="text-[10px] text-slate-500 uppercase flex items-center gap-1 shrink-0">
          <Lightbulb className="w-3 h-3 text-amber-400" />
          Suggestions:
        </span>
        {QUICK_PROMPTS.map((qp, idx) => (
          <button
            key={idx}
            onClick={() => {
              setPrompt(qp);
              handleSubmit(qp);
            }}
            className="px-2 py-1 rounded bg-slate-900 hover:bg-slate-850 border border-slate-800 text-[10px] text-slate-400 hover:text-slate-200 transition-colors whitespace-nowrap"
          >
            {qp}
          </button>
        ))}
      </div>

      {/* Proposed Diff Modal / Card */}
      {proposedResult && (
        <div className="p-3.5 rounded-lg border border-cyan-500/40 bg-cyan-950/20 space-y-3 animate-fadeIn">
          <div className="flex items-start justify-between border-b border-cyan-900/50 pb-2">
            <div>
              <div className="font-bold text-cyan-300 text-xs flex items-center gap-1.5">
                <Sliders className="w-3.5 h-3.5 text-cyan-400" />
                <span>Proposed Policy Adjustments</span>
              </div>
              <p className="text-[11px] text-slate-300 mt-0.5">{proposedResult.summary}</p>
            </div>
            <button
              onClick={() => setProposedResult(null)}
              className="text-slate-500 hover:text-slate-300 p-0.5"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Diffs List */}
          <div className="space-y-2">
            {proposedResult.diffs.map((diff: CopilotParamDiff, idx: number) => {
              return (
                <div
                  key={idx}
                  className="p-2.5 rounded bg-slate-900/70 border border-slate-800 flex items-center justify-between text-xs"
                >
                  <div>
                    <span className="font-bold text-slate-200 block">{diff.paramLabel}</span>
                    <span className="text-[10px] text-slate-400 block">{diff.rationale}</span>
                  </div>

                  <div className="flex items-center space-x-2 shrink-0 pl-3">
                    <span className="text-slate-400 font-mono">{diff.currentValue}</span>
                    <ArrowRight className="w-3 h-3 text-cyan-400" />
                    <span className="text-emerald-400 font-bold font-mono bg-emerald-950/60 px-1.5 py-0.5 rounded border border-emerald-800/60">
                      {diff.proposedValue} {diff.unit}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Apply / Cancel Bar */}
          <div className="flex items-center justify-between pt-2 border-t border-cyan-900/40">
            <span className="text-[10px] text-slate-400">
              {proposedResult.diffs.length} parameter lever{proposedResult.diffs.length > 1 ? 's' : ''} affected
            </span>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setProposedResult(null)}
                className="px-3 py-1.5 rounded text-xs text-slate-400 hover:text-slate-200 hover:bg-slate-900 border border-transparent"
              >
                Cancel
              </button>
              <button
                onClick={handleApply}
                className="px-4 py-1.5 rounded bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs flex items-center space-x-1.5 shadow-[0_0_12px_rgba(16,185,129,0.35)] transition-all"
              >
                <Check className="w-3.5 h-3.5" />
                <span>Apply to Simulator</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
