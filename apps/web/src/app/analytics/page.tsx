'use client';
import React, { useState, useMemo } from 'react';
import { 
  Database, 
  Play, 
  Download, 
  Terminal, 
  Table, 
  Layers, 
  RotateCcw, 
  CheckCircle2, 
  AlertCircle,
  Clock,
  Code
} from 'lucide-react';
import { ScientificBadge } from '@/components/ScientificBadge';
import { executeSqlQuery, SQL_PRESETS, SqlPreset, SqlQueryResult } from '@/lib/sql-engine';

export default function AnalyticsPage() {
  const [activeSql, setActiveSql] = useState<string>(SQL_PRESETS[0].sql);
  const [selectedPresetId, setSelectedPresetId] = useState<string>(SQL_PRESETS[0].id);
  const [queryResult, setQueryResult] = useState<SqlQueryResult>(() => executeSqlQuery(SQL_PRESETS[0].sql));

  const handleRunQuery = () => {
    const res = executeSqlQuery(activeSql);
    setQueryResult(res);
  };

  const handleSelectPreset = (preset: SqlPreset) => {
    setSelectedPresetId(preset.id);
    setActiveSql(preset.sql);
    const res = executeSqlQuery(preset.sql);
    setQueryResult(res);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
      e.preventDefault();
      handleRunQuery();
    }
  };

  const handleExportCsv = () => {
    if (!queryResult || queryResult.columns.length === 0) return;
    const header = queryResult.columns.join(',');
    const rows = queryResult.rows.map(r => r.map(cell => `"${cell ?? ''}"`).join(','));
    const csvContent = [header, ...rows].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `world26_query_${Date.now()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleExportJson = () => {
    if (!queryResult || queryResult.columns.length === 0) return;
    const formatted = queryResult.rows.map(row => {
      const obj: Record<string, any> = {};
      queryResult.columns.forEach((col, idx) => {
        obj[col] = row[idx];
      });
      return obj;
    });
    const blob = new Blob([JSON.stringify(formatted, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `world26_query_${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="max-w-[1720px] mx-auto px-4 py-8 space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-slate-800 pb-6 gap-4">
        <div>
          <div className="flex items-center space-x-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 shadow-[0_0_15px_rgba(0,240,255,0.15)]">
              <Terminal className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-100 tracking-tight font-mono">
                SQL Analytics Workbench
              </h1>
              <p className="text-xs text-slate-400">
                In-browser relational querying over planetary simulation runs, tipping elements, and historical calibration records.
              </p>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <ScientificBadge type="SIMULATED" tooltip="Dynamic relational query engine executing in-memory" />
          <ScientificBadge type="CALIBRATED" tooltip="Preloaded with empirical observations 1960-2025" />
          <ScientificBadge type="EXPERIMENTAL" tooltip="Interactive ad-hoc SQL query workbench" />
        </div>
      </div>

      {/* Main Grid: Left side Presets & Schema (4 cols), Right side Query & Results (8 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Schema & Presets */}
        <div className="lg:col-span-4 space-y-6">
          {/* SQL Presets */}
          <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-5 space-y-3">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <span className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center space-x-1.5">
                <Code className="w-3.5 h-3.5 text-cyan-400" />
                <span>Analytical SQL Presets</span>
              </span>
              <span className="text-[10px] text-slate-500 font-mono">
                {SQL_PRESETS.length} Available
              </span>
            </div>

            <div className="space-y-2">
              {SQL_PRESETS.map((preset) => {
                const isSelected = preset.id === selectedPresetId;
                return (
                  <button
                    key={preset.id}
                    onClick={() => handleSelectPreset(preset)}
                    className={`w-full text-left p-3 rounded-lg border transition-all ${
                      isSelected
                        ? 'bg-cyan-950/70 border-cyan-500/50 text-cyan-200 shadow-[0_0_12px_rgba(0,240,255,0.15)]'
                        : 'bg-slate-900/40 border-slate-800/80 text-slate-300 hover:bg-slate-900 hover:border-slate-700'
                    }`}
                  >
                    <span className="font-bold text-xs block">{preset.name}</span>
                    <span className="text-[11px] text-slate-400 line-clamp-2 mt-0.5">
                      {preset.description}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Virtual Tables Schema Browser */}
          <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-5 space-y-3">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <span className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center space-x-1.5">
                <Database className="w-3.5 h-3.5 text-emerald-400" />
                <span>Virtual Planetary Tables</span>
              </span>
              <span className="text-[10px] text-emerald-400 font-mono">4 Tables</span>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-2.5 rounded bg-slate-900/60 border border-slate-800">
                <div className="flex justify-between items-center font-mono font-bold text-cyan-300">
                  <span>runs</span>
                  <span className="text-[10px] text-slate-500">201 rows (1900-2100)</span>
                </div>
                <p className="text-[10px] text-slate-400 mt-1">
                  Columns: time, population, atmospheric_co2_ppm, temperature_anomaly, installed_compute_eflops, ai_electricity_demand_twh, amoc_stability_index, permafrost_thaw_co2_gt, sea_level_rise_m...
                </p>
              </div>

              <div className="p-2.5 rounded bg-slate-900/60 border border-slate-800">
                <div className="flex justify-between items-center font-mono font-bold text-emerald-300">
                  <span>regions</span>
                  <span className="text-[10px] text-slate-500">10 macro-regions</span>
                </div>
                <p className="text-[10px] text-slate-400 mt-1">
                  Columns: id, name, population_share, gdp_share, clean_energy_share, installed_compute_share
                </p>
              </div>

              <div className="p-2.5 rounded bg-slate-900/60 border border-slate-800">
                <div className="flex justify-between items-center font-mono font-bold text-amber-300">
                  <span>historical</span>
                  <span className="text-[10px] text-slate-500">18 observations (1960-2025)</span>
                </div>
                <p className="text-[10px] text-slate-400 mt-1">
                  Columns: year, population, energy_ej, co2_emissions_gt, co2_ppm, temp_anomaly, compute_eflops
                </p>
              </div>

              <div className="p-2.5 rounded bg-slate-900/60 border border-slate-800">
                <div className="flex justify-between items-center font-mono font-bold text-purple-300">
                  <span>boundaries</span>
                  <span className="text-[10px] text-slate-500">13 control variables</span>
                </div>
                <p className="text-[10px] text-slate-400 mt-1">
                  Columns: id, name, category, currentValue, boundaryThreshold, status, unit
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: SQL Editor & Table Results */}
        <div className="lg:col-span-8 space-y-6">
          {/* Query Editor Box */}
          <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-5 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-300 uppercase tracking-wider font-mono flex items-center space-x-1.5">
                <Terminal className="w-3.5 h-3.5 text-cyan-400" />
                <span>Interactive SQL Query Editor</span>
              </span>
              <span className="text-[11px] text-slate-500 font-mono">
                Press <kbd className="px-1.5 py-0.5 rounded bg-slate-900 border border-slate-700 text-slate-300">Ctrl + Enter</kbd> to Run
              </span>
            </div>

            <div className="relative">
              <textarea
                value={activeSql}
                onChange={(e) => setActiveSql(e.target.value)}
                onKeyDown={handleKeyDown}
                rows={5}
                className="w-full bg-[#05080e] border border-slate-800 rounded-lg p-3 font-mono text-xs text-cyan-200 focus:outline-none focus:border-cyan-500 shadow-inner resize-y leading-relaxed"
                placeholder="SELECT * FROM runs WHERE time >= 2020"
              />
            </div>

            {/* Action Bar */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-1 border-t border-slate-800/80">
              <div className="flex items-center space-x-3 text-xs">
                <button
                  onClick={handleRunQuery}
                  className="flex items-center space-x-1.5 px-4 py-2 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold transition-all hover:scale-105 active:scale-95 shadow-[0_0_12px_rgba(0,240,255,0.25)]"
                >
                  <Play className="w-3.5 h-3.5 fill-current" />
                  <span>Execute SQL</span>
                </button>

                <button
                  onClick={() => setActiveSql(SQL_PRESETS[0].sql)}
                  className="p-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-slate-200 border border-slate-800 transition-colors"
                  title="Reset to default preset"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Status / Timing / Export buttons */}
              <div className="flex items-center space-x-3 text-xs">
                {queryResult.error ? (
                  <span className="flex items-center space-x-1 text-rose-400 font-mono text-[11px]">
                    <AlertCircle className="w-3.5 h-3.5" />
                    <span>Query Syntax Error</span>
                  </span>
                ) : (
                  <div className="flex items-center space-x-2 text-slate-400 font-mono text-[11px]">
                    <Clock className="w-3 h-3 text-slate-500" />
                    <span>{queryResult.executionTimeMs} ms</span>
                    <span>&bull;</span>
                    <span className="text-cyan-300 font-bold">{queryResult.rowCount} rows</span>
                  </div>
                )}

                <div className="flex items-center space-x-1.5 pl-2 border-l border-slate-800">
                  <button
                    onClick={handleExportCsv}
                    disabled={queryResult.rowCount === 0}
                    className="flex items-center space-x-1 px-2.5 py-1.5 rounded bg-slate-900 hover:bg-slate-800 border border-slate-800 text-[11px] text-slate-300 font-mono transition-colors disabled:opacity-40"
                  >
                    <Download className="w-3 h-3 text-cyan-400" />
                    <span>CSV</span>
                  </button>
                  <button
                    onClick={handleExportJson}
                    disabled={queryResult.rowCount === 0}
                    className="flex items-center space-x-1 px-2.5 py-1.5 rounded bg-slate-900 hover:bg-slate-800 border border-slate-800 text-[11px] text-slate-300 font-mono transition-colors disabled:opacity-40"
                  >
                    <Download className="w-3 h-3 text-emerald-400" />
                    <span>JSON</span>
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Query Results Table */}
          <div className="bg-slate-950/80 border border-slate-800 rounded-xl overflow-hidden shadow-xl">
            <div className="p-4 bg-slate-900/70 border-b border-slate-800 flex items-center justify-between">
              <span className="text-xs font-bold text-slate-300 uppercase tracking-wider font-mono flex items-center space-x-1.5">
                <Table className="w-3.5 h-3.5 text-cyan-400" />
                <span>Result Table ({queryResult.rowCount} rows returned)</span>
              </span>
            </div>

            {queryResult.error ? (
              <div className="p-6 bg-rose-950/20 text-rose-300 font-mono text-xs border-b border-rose-900/50 flex items-start space-x-3">
                <AlertCircle className="w-5 h-5 shrink-0 text-rose-400 mt-0.5" />
                <div>
                  <span className="font-bold block">Execution Error:</span>
                  <p className="mt-1 text-slate-300">{queryResult.error}</p>
                </div>
              </div>
            ) : queryResult.rows.length === 0 ? (
              <div className="p-12 text-center text-slate-500 font-mono text-xs">
                No rows match the specified criteria.
              </div>
            ) : (
              <div className="overflow-x-auto max-h-[500px]">
                <table className="w-full text-left text-xs border-collapse">
                  <thead className="bg-slate-900/90 text-slate-400 font-mono text-[11px] uppercase tracking-wider sticky top-0 border-b border-slate-800 backdrop-blur-sm z-10">
                    <tr>
                      <th className="py-2.5 px-3 border-r border-slate-800/80 w-12 text-center text-slate-600">
                        #
                      </th>
                      {queryResult.columns.map((col, idx) => (
                        <th key={idx} className="py-2.5 px-3 border-r border-slate-800/80 whitespace-nowrap font-bold text-cyan-300">
                          {col}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60 font-mono text-[11px]">
                    {queryResult.rows.map((row, rowIdx) => (
                      <tr key={rowIdx} className="hover:bg-slate-900/50 transition-colors">
                        <td className="py-2 px-3 border-r border-slate-800/60 text-center text-slate-600 select-none">
                          {rowIdx + 1}
                        </td>
                        {row.map((cell, cellIdx) => (
                          <td key={cellIdx} className="py-2 px-3 border-r border-slate-800/60 whitespace-nowrap text-slate-300">
                            {cell === null || cell === undefined ? (
                              <span className="text-slate-600 italic">null</span>
                            ) : typeof cell === 'number' ? (
                              <span className="text-slate-200 font-semibold">{cell.toLocaleString()}</span>
                            ) : (
                              <span>{String(cell)}</span>
                            )}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
