'use client';

import React, { useState, useEffect } from 'react';
import { useApp } from '@/context/AppContext';
import PerspectiveCard from '@/components/PerspectiveCard';
import {
  GitBranch,
  Play,
  RotateCcw,
  AlertTriangle,
  CheckCircle2,
  Clock,
  ShieldAlert,
  Flame,
  Bug,
  Activity,
  Layers,
  ChevronDown,
  RefreshCw,
  Sparkles,
} from 'lucide-react';
import { WORKFLOW_STEPS_DEF } from '@/lib/constants';

export default function WorkflowCenterPage() {
  const { t, lang, showToast } = useApp();

  const [runs, setRuns] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRun, setSelectedRun] = useState<any>(null);
  const [recovering, setRecovering] = useState(false);
  const [heartbeatResult, setHeartbeatResult] = useState<any>(null);
  const [runningHeartbeat, setRunningHeartbeat] = useState(false);

  const fetchWorkflowRuns = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/workflow/runs');
      const data = await res.json();
      setRuns(data.runs || []);
      if (data.runs?.length > 0 && !selectedRun) {
        setSelectedRun(data.runs[0]);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWorkflowRuns();
  }, []);

  // Resume / Recover Failed Workflow Run
  const handleResumeRun = async (runId: string) => {
    setRecovering(true);
    try {
      const res = await fetch('/api/workflow/runs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'RESUME_FAILED',
          workflowRunId: runId,
        }),
      });
      const data = await res.json();
      if (data.success) {
        showToast('Automated Recovery Succeeded! Resumed from last successful step without duplicate operations.');
        fetchWorkflowRuns();
      } else {
        showToast(`Recovery error: ${data.error}`);
      }
    } catch (e: any) {
      showToast(e.message);
    } finally {
      setRecovering(false);
    }
  };

  // Run SLA Heartbeat Escalation Daemon
  const handleTriggerSlaHeartbeat = async () => {
    setRunningHeartbeat(true);
    try {
      const res = await fetch('/api/workflow/runs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'RUN_SLA_HEARTBEAT' }),
      });
      const data = await res.json();
      if (data.success) {
        setHeartbeatResult(data.result);
        showToast(
          `SLA Heartbeat Complete: ${data.result.scannedCount} scanned, ${data.result.escalatedCount} overdue issues escalated to managers.`
        );
        fetchWorkflowRuns();
      }
    } catch (e: any) {
      showToast(e.message);
    } finally {
      setRunningHeartbeat(false);
    }
  };

  return (
    <div className="space-y-6 perspective-container">
      {/* Top Banner */}
      <div className="glass-pane glass-rim p-6 rounded-3xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="px-3 py-0.5 rounded-full text-[11px] font-black uppercase tracking-wider bg-cyan-500/20 text-cyan-300 border border-cyan-400/40 shadow-sm">
              Advanced Challenge A07
            </span>
            <span className="text-xs text-slate-400 font-medium">
              Persistent Event-Driven Multi-Step Workflow Engine
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            {t.workflow.title}
          </h1>
          <p className="text-slate-300/80 text-xs sm:text-sm mt-1">
            {t.workflow.subtitle}
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={fetchWorkflowRuns}
            className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-bold text-slate-200 transition-all shadow-sm"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>
          <button
            onClick={handleTriggerSlaHeartbeat}
            disabled={runningHeartbeat}
            className="flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-gradient-to-r from-rose-500 to-orange-400 hover:opacity-95 text-navy-950 font-black text-xs uppercase tracking-wider shadow-lg shadow-rose-500/25 transition-all hover:scale-105"
          >
            <Activity className="w-3.5 h-3.5" />
            <span>{t.workflow.runSlaCheck}</span>
          </button>
        </div>
      </div>

      {/* Judge Failure-Injection & Recovery Sandbox Notice */}
      <div className="glass-pane glass-rim p-5 rounded-3xl shadow-xl flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="space-y-1 text-left">
          <div className="flex items-center gap-2 text-cyan-400 font-black text-sm">
            <Bug className="w-4 h-4 text-cyan-400" />
            <span>{t.workflow.failInjectionTitle}</span>
          </div>
          <p className="text-xs text-slate-300 max-w-2xl leading-relaxed">
            {t.workflow.failInjectionDesc}
          </p>
          <p className="text-[11px] text-teal-300 font-semibold">
            {t.workflow.idempotencyNote}
          </p>
        </div>

        {selectedRun && (selectedRun.status === 'RETRY_PENDING' || selectedRun.status === 'FAILED') ? (
          <button
            onClick={() => handleResumeRun(selectedRun.id)}
            disabled={recovering}
            className="px-6 py-3 rounded-2xl bg-gradient-to-r from-teal-400 via-cyan-400 to-teal-400 hover:opacity-95 text-navy-950 font-black text-xs uppercase tracking-wider shadow-lg shadow-teal-500/30 flex items-center gap-2 transition-transform hover:scale-105 shrink-0"
          >
            <RotateCcw className={`w-4 h-4 ${recovering ? 'animate-spin' : ''}`} />
            <span>{t.workflow.triggerRecoveryBtn}</span>
          </button>
        ) : (
          <span className="px-3.5 py-1.5 rounded-full bg-black/30 text-slate-400 text-xs border border-white/10">
            Selected run is healthy or completed
          </span>
        )}
      </div>

      {/* Main Grid: Runs List on Left, 12-Step Timeline on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Workflow Runs List */}
        <div className="lg:col-span-5 glass-pane glass-rim p-5 rounded-3xl shadow-xl space-y-3">
          <div className="flex items-center justify-between pb-3 border-b border-white/10">
            <h2 className="text-sm font-black text-white uppercase tracking-wider flex items-center gap-2">
              <Layers className="w-4 h-4 text-cyan-400" />
              {t.workflow.activeRuns}
            </h2>
            <span className="text-xs text-slate-400 font-mono font-bold">{runs.length} Runs</span>
          </div>

          <div className="space-y-2.5 max-h-[600px] overflow-y-auto pr-1">
            {runs.length === 0 ? (
              <div className="p-4 text-center text-xs text-slate-400">
                No active workflow runs found in database.
              </div>
            ) : (
              runs.map((run) => {
                const isSelected = selectedRun?.id === run.id;
                const isFailed = run.status === 'FAILED' || run.status === 'RETRY_PENDING';
                return (
                  <div
                    key={run.id}
                    onClick={() => setSelectedRun(run)}
                    className={`p-4 rounded-2xl border text-left cursor-pointer transition-all duration-300 ease-[cubic-bezier(0.34,1.45,0.55,1)] ${
                      isSelected
                        ? 'bg-gradient-to-r from-cyan-500/20 to-teal-500/10 border-cyan-400 shadow-md shadow-cyan-500/20 scale-[1.01]'
                        : 'bg-black/25 border-white/5 hover:border-white/15 hover:bg-white/5'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-mono font-bold text-cyan-300">
                        {run.report?.referenceNumber || run.idempotencyKey}
                      </span>
                      <span
                        className={`text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full border shadow-sm ${
                          isFailed
                            ? 'bg-rose-500/20 text-rose-300 border-rose-500/40 animate-pulse'
                            : run.status === 'COMPLETED'
                            ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                            : 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30'
                        }`}
                      >
                        {run.status}
                      </span>
                    </div>

                    <p className="text-xs font-bold text-slate-200 line-clamp-1 mb-1">
                      {run.report?.title || 'Civic Infrastructure Incident'}
                    </p>

                    <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1.5 border-t border-white/10">
                      <span>Step {run.currentStep}/8 completed</span>
                      <span>Retries: {run.retryCount}/{run.maxRetries}</span>
                    </div>

                    {run.errorMessage && (
                      <div className="mt-2 p-2.5 rounded-xl bg-rose-950/40 border border-rose-900/60 text-[10px] font-mono text-rose-300 line-clamp-2">
                        {run.errorMessage}
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right Column: 12-Step Detailed Pipeline Visualizer */}
        <div className="lg:col-span-7 glass-pane glass-rim p-6 rounded-3xl shadow-xl space-y-5">
          <div className="flex items-center justify-between pb-3 border-b border-white/10">
            <div>
              <h2 className="text-sm font-black text-white uppercase tracking-wider flex items-center gap-2">
                <GitBranch className="w-4 h-4 text-cyan-400" />
                {t.workflow.stepTimeline}
              </h2>
              <p className="text-xs text-slate-400">
                Idempotent execution trail for Ref: {selectedRun?.report?.referenceNumber || 'Selected Run'}
              </p>
            </div>
          </div>

          {/* Steps Timeline Display */}
          <div className="space-y-3">
            {WORKFLOW_STEPS_DEF.slice(0, 8).map((stepDef) => {
              const matchingStep = selectedRun?.steps?.find((s: any) => s.stepNumber === stepDef.step);
              const isCompleted = matchingStep?.status === 'COMPLETED';
              const isFailed = matchingStep?.status === 'FAILED';

              return (
                <div
                  key={stepDef.step}
                  className={`p-4 rounded-2xl border transition-all flex items-start gap-3.5 text-left ${
                    isFailed
                      ? 'bg-rose-950/30 border-rose-500/50 shadow-md shadow-rose-950/40'
                      : isCompleted
                      ? 'bg-black/30 border-white/10 hover:border-white/20'
                      : 'bg-black/15 border-white/5 text-slate-500'
                  }`}
                >
                  <div
                    className={`w-8 h-8 rounded-xl flex items-center justify-center font-mono font-bold text-xs shrink-0 shadow-sm ${
                      isCompleted
                        ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                        : isFailed
                        ? 'bg-rose-500/20 text-rose-400 border border-rose-500/40'
                        : 'bg-white/5 text-slate-500 border border-white/5'
                    }`}
                  >
                    {isCompleted ? '✓' : isFailed ? '✕' : stepDef.step}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-0.5">
                      <span className="text-xs font-bold text-slate-200">
                        Step {stepDef.step}: {stepDef.name}
                      </span>
                      <span
                        className={`text-[10px] font-mono px-2.5 py-0.5 rounded-full font-bold ${
                          isCompleted
                            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                            : isFailed
                            ? 'bg-rose-500/15 text-rose-400 border border-rose-500/30'
                            : 'text-slate-500'
                        }`}
                      >
                        {matchingStep?.status || 'PENDING'}
                      </span>
                    </div>

                    <p className="text-[11px] text-slate-400">{stepDef.title}</p>

                    {matchingStep?.errorDetailsJson && (
                      <div className="mt-2 p-2.5 rounded-xl bg-rose-950/50 border border-rose-800/80 text-[10px] font-mono text-rose-300">
                        {matchingStep.errorDetailsJson}
                      </div>
                    )}
                    {matchingStep?.outputPayloadJson && (
                      <div className="mt-1.5 p-2 rounded-xl bg-black/40 border border-white/5 text-[10px] font-mono text-slate-400 truncate">
                        Output: {matchingStep.outputPayloadJson}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
