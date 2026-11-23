'use client';

import React, { useState, useEffect } from 'react';
import { useApp } from '@/context/AppContext';
import {
  Cpu,
  Sparkles,
  Sliders,
  ShieldCheck,
  AlertOctagon,
  Scale,
  Compass,
  CheckCircle2,
  XCircle,
  HelpCircle,
  RefreshCw,
  Save,
  Play,
  RotateCcw,
} from 'lucide-react';
import { PILOT_ZONES, CATEGORIES_LIST } from '@/lib/constants';

export default function DecisionIntelligencePage() {
  const { t, lang, showToast } = useApp();

  // Factor Sliders State (0-100)
  const [safety, setSafety] = useState(85);
  const [severity, setSeverity] = useState(80);
  const [people, setPeople] = useState(70);
  const [location, setLocation] = useState(75);
  const [sla, setSla] = useState(40);
  const [corroboration, setCorroboration] = useState(15);

  // Department & Category Selection
  const [selectedCategory, setSelectedCategory] = useState(CATEGORIES_LIST[0].code);
  const [selectedDeptId, setSelectedDeptId] = useState('');
  const [selectedZoneId, setSelectedZoneId] = useState(PILOT_ZONES[0].code);

  // Departments List
  const [departments, setDepartments] = useState<any[]>([]);

  // Calculation Results
  const [priorityResult, setPriorityResult] = useState<any>(null);
  const [assignmentResult, setAssignmentResult] = useState<any>(null);
  const [calculating, setCalculating] = useState(false);

  // Weights Config State (Administrator Tuning)
  const [safetyWeight, setSafetyWeight] = useState(0.30);
  const [severityWeight, setSeverityWeight] = useState(0.25);
  const [peopleWeight, setPeopleWeight] = useState(0.15);
  const [locationWeight, setLocationWeight] = useState(0.15);
  const [slaWeight, setSlaWeight] = useState(0.10);
  const [corroborationWeight, setCorroborationWeight] = useState(0.05);

  // Fetch initial config & departments
  useEffect(() => {
    fetch('/api/decision/config')
      .then((res) => res.json())
      .then((data) => {
        if (data.config) {
          setSafetyWeight(data.config.safetyWeight);
          setSeverityWeight(data.config.severityWeight);
          setPeopleWeight(data.config.peopleWeight);
          setLocationWeight(data.config.locationWeight);
          setSlaWeight(data.config.slaWeight);
          setCorroborationWeight(data.config.corroborationWeight);
        }
      })
      .catch(console.error);

    fetch('/api/analytics')
      .then((res) => res.json())
      .then((data) => {
        if (data.departmentPerformance) {
          setDepartments(data.departmentPerformance);
        }
      })
      .catch(console.error);
  }, []);

  // Run live evaluation
  const runEvaluation = async () => {
    setCalculating(true);
    try {
      const res = await fetch('/api/decision/evaluate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          safety,
          severity,
          people,
          location,
          sla,
          corroboration,
          categoryCode: selectedCategory,
          departmentId: selectedDeptId || undefined,
          serviceZoneId: selectedZoneId || undefined,
          customWeights: {
            safety: safetyWeight,
            severity: severityWeight,
            people: peopleWeight,
            location: locationWeight,
            sla: slaWeight,
            corroboration: corroborationWeight,
          },
        }),
      });
      const data = await res.json();
      setPriorityResult(data.priority);
      setAssignmentResult(data.assignment);
    } catch (e) {
      console.error(e);
    } finally {
      setCalculating(false);
    }
  };

  useEffect(() => {
    runEvaluation();
  }, [
    safety,
    severity,
    people,
    location,
    sla,
    corroboration,
    selectedCategory,
    selectedDeptId,
    selectedZoneId,
    safetyWeight,
    severityWeight,
    peopleWeight,
    locationWeight,
    slaWeight,
    corroborationWeight,
  ]);

  // Save Config to DB (A02 Admin Configuration without code modification)
  const handleSaveConfig = async () => {
    try {
      const res = await fetch('/api/decision/config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          safetyWeight,
          severityWeight,
          peopleWeight,
          locationWeight,
          slaWeight,
          corroborationWeight,
          criticalThreshold: 80,
          highThreshold: 60,
          mediumThreshold: 35,
        }),
      });
      const data = await res.json();
      if (data.success) {
        showToast('Priority configuration saved to database successfully!');
      } else {
        showToast(`Save failed: ${data.error}`);
      }
    } catch (e: any) {
      showToast(e.message);
    }
  };

  // Test Scenario Presets for Judges (A02 Evaluation)
  const applyTestScenario = (scenario: number) => {
    if (scenario === 1) {
      // High-severity hazard
      setSafety(95);
      setSeverity(90);
      setPeople(85);
      setLocation(90);
      setSla(40);
      setCorroboration(20);
      setSelectedCategory('ROADS');
      showToast('Loaded Scenario 1: High-Severity Arterial Infrastructure Hazard (Expect: Critical > 80 pts)');
    } else if (scenario === 2) {
      // Low-severity maintenance issue
      setSafety(20);
      setSeverity(25);
      setPeople(30);
      setLocation(20);
      setSla(10);
      setCorroboration(0);
      setSelectedCategory('GENERAL');
      showToast('Loaded Scenario 2: Low-Severity Municipal Park Bench (Expect: Low < 35 pts)');
    } else if (scenario === 3) {
      // Nearest team lacks required certification (Conflict test)
      setSafety(80);
      setSeverity(80);
      setSelectedCategory('LIGHTS'); // Requires HIGH_VOLTAGE_ELEC
      setSelectedZoneId('DSCC-Z5'); // Old Dhaka where no 440V electrical team is stationed
      showToast('Loaded Scenario 3: Missing Skill / Certification Conflict (Expect: Infeasible Outcome)');
    } else if (scenario === 4) {
      // All qualified teams unavailable
      setSafety(75);
      setSeverity(70);
      setSelectedCategory('TREES');
      showToast('Loaded Scenario 4: Heavy Arborist Capacity Limitation (Expect: Verified Capacity Check)');
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-r from-navy-900 via-navy-850 to-navy-900 p-6 rounded-2xl border border-navy-800 shadow-xl">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
              Advanced Challenge A02
            </span>
            <span className="text-xs text-slate-400 font-medium">
              Deterministic Decision Intelligence & Optimization
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            {t.decision.title}
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            {t.decision.subtitle}
          </p>
        </div>

        <button
          onClick={runEvaluation}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-navy-800 hover:bg-navy-700 border border-navy-700 text-xs font-semibold text-slate-200 transition-colors self-start md:self-auto"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${calculating ? 'animate-spin' : ''}`} />
          <span>Re-Evaluate</span>
        </button>
      </div>

      {/* A02 Judge Demonstration Presets Bar */}
      <div className="bg-navy-900/90 border border-navy-700 p-4 rounded-xl flex flex-col md:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-xs font-bold uppercase text-amber-400">
          <Play className="w-4 h-4" />
          <span>Judge Test Scenarios (1-Click Presets):</span>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => applyTestScenario(1)}
            className="px-3 py-1.5 rounded-lg bg-navy-800 hover:bg-navy-700 border border-navy-700 text-xs font-semibold text-slate-200 transition-colors"
          >
            1. High-Hazard Sinkhole
          </button>
          <button
            onClick={() => applyTestScenario(2)}
            className="px-3 py-1.5 rounded-lg bg-navy-800 hover:bg-navy-700 border border-navy-700 text-xs font-semibold text-slate-200 transition-colors"
          >
            2. Low-Severity Park Bench
          </button>
          <button
            onClick={() => applyTestScenario(3)}
            className="px-3 py-1.5 rounded-lg bg-rose-500/15 hover:bg-rose-500/25 border border-rose-500/30 text-xs font-semibold text-rose-300 transition-colors"
          >
            3. Uncertified Skill Conflict
          </button>
          <button
            onClick={() => applyTestScenario(4)}
            className="px-3 py-1.5 rounded-lg bg-navy-800 hover:bg-navy-700 border border-navy-700 text-xs font-semibold text-slate-200 transition-colors"
          >
            4. Capacity Saturation
          </button>
        </div>
      </div>

      {/* Main Grid: Priority Engine on Left, Assignment Recommendation on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Factor Sliders & Score Meter */}
        <div className="lg:col-span-6 bg-navy-900 border border-navy-800 rounded-2xl p-6 shadow-lg space-y-5">
          <div className="flex items-center justify-between pb-3 border-b border-navy-800">
            <div>
              <h2 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <Sliders className="w-4 h-4 text-cyan-400" />
                Explainable Priority Engine
              </h2>
              <p className="text-xs text-slate-400">Normalized multi-factor input sliders</p>
            </div>
            {priorityResult && (
              <span
                className={`text-xs font-black px-3 py-1 rounded-full uppercase tracking-wider ${
                  priorityResult.priorityBand === 'CRITICAL'
                    ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                    : priorityResult.priorityBand === 'HIGH'
                    ? 'bg-orange-500/20 text-orange-300 border border-orange-500/40'
                    : priorityResult.priorityBand === 'MEDIUM'
                    ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                    : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                }`}
              >
                {priorityResult.priorityBand} ({priorityResult.totalScore})
              </span>
            )}
          </div>

          {/* Formula Display Box */}
          <div className="bg-navy-950 p-3 rounded-xl border border-navy-800 text-[11px] font-mono text-cyan-300 leading-relaxed">
            {t.decision.formula}
          </div>

          {/* 6 Normalized Factor Sliders */}
          <div className="space-y-4">
            {/* Factor 1: Safety */}
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="font-semibold text-slate-300">{t.decision.safety} ({(safetyWeight * 100).toFixed(0)}%)</span>
                <span className="font-bold text-rose-400">{safety}/100</span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={safety}
                onChange={(e) => setSafety(parseInt(e.target.value, 10))}
                className="w-full accent-rose-500 cursor-pointer"
              />
            </div>

            {/* Factor 2: Severity */}
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="font-semibold text-slate-300">{t.decision.severity} ({(severityWeight * 100).toFixed(0)}%)</span>
                <span className="font-bold text-orange-400">{severity}/100</span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={severity}
                onChange={(e) => setSeverity(parseInt(e.target.value, 10))}
                className="w-full accent-orange-500 cursor-pointer"
              />
            </div>

            {/* Factor 3: People Affected */}
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="font-semibold text-slate-300">{t.decision.people} ({(peopleWeight * 100).toFixed(0)}%)</span>
                <span className="font-bold text-cyan-400">{people}/100</span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={people}
                onChange={(e) => setPeople(parseInt(e.target.value, 10))}
                className="w-full accent-cyan-500 cursor-pointer"
              />
            </div>

            {/* Factor 4: Location Importance */}
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="font-semibold text-slate-300">{t.decision.location} ({(locationWeight * 100).toFixed(0)}%)</span>
                <span className="font-bold text-teal-400">{location}/100</span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={location}
                onChange={(e) => setLocation(parseInt(e.target.value, 10))}
                className="w-full accent-teal-400 cursor-pointer"
              />
            </div>

            {/* Factor 5: SLA Elapsed Pressure */}
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="font-semibold text-slate-300">{t.decision.sla} ({(slaWeight * 100).toFixed(0)}%)</span>
                <span className="font-bold text-indigo-400">{sla}/100</span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={sla}
                onChange={(e) => setSla(parseInt(e.target.value, 10))}
                className="w-full accent-indigo-400 cursor-pointer"
              />
            </div>

            {/* Factor 6: Corroboration */}
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="font-semibold text-slate-300">{t.decision.corroboration} ({(corroborationWeight * 100).toFixed(0)}%)</span>
                <span className="font-bold text-emerald-400">{corroboration}/100</span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={corroboration}
                onChange={(e) => setCorroboration(parseInt(e.target.value, 10))}
                className="w-full accent-emerald-500 cursor-pointer"
              />
            </div>
          </div>

          {/* Narrative Explanation Box */}
          {priorityResult && (
            <div className="bg-navy-950 p-4 rounded-xl border border-navy-800 text-xs space-y-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
                Deterministic Calculation Narrative:
              </span>
              <p className="text-slate-300 leading-relaxed">
                {priorityResult.narrativeExplanation}
              </p>
              <div className="flex flex-wrap gap-1.5 pt-2 border-t border-navy-800">
                {priorityResult.rulesApplied?.map((rule: string) => (
                  <span
                    key={rule}
                    className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-500/10 text-cyan-300 border border-cyan-500/20"
                  >
                    {rule}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Live Weight Tuning Section (Requirement: Configure weights without code modification) */}
          <div className="pt-4 border-t border-navy-800">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                <Scale className="w-3.5 h-3.5 text-cyan-400" />
                {t.decision.tuningHeader}
              </span>
              <button
                onClick={handleSaveConfig}
                className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-navy-950 font-bold text-xs shadow-sm transition-colors"
              >
                <Save className="w-3.5 h-3.5" />
                <span>Save Config</span>
              </button>
            </div>
            <div className="grid grid-cols-3 gap-2 text-xs">
              <div>
                <label className="text-[10px] text-slate-400">Safety Wgt</label>
                <input
                  type="number"
                  step="0.05"
                  value={safetyWeight}
                  onChange={(e) => setSafetyWeight(parseFloat(e.target.value))}
                  className="w-full px-2 py-1 bg-navy-950 border border-navy-700 rounded text-slate-200"
                />
              </div>
              <div>
                <label className="text-[10px] text-slate-400">Severity Wgt</label>
                <input
                  type="number"
                  step="0.05"
                  value={severityWeight}
                  onChange={(e) => setSeverityWeight(parseFloat(e.target.value))}
                  className="w-full px-2 py-1 bg-navy-950 border border-navy-700 rounded text-slate-200"
                />
              </div>
              <div>
                <label className="text-[10px] text-slate-400">People Wgt</label>
                <input
                  type="number"
                  step="0.05"
                  value={peopleWeight}
                  onChange={(e) => setPeopleWeight(parseFloat(e.target.value))}
                  className="w-full px-2 py-1 bg-navy-950 border border-navy-700 rounded text-slate-200"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Intelligent Assignment & Constraint Validation */}
        <div className="lg:col-span-6 bg-navy-900 border border-navy-800 rounded-2xl p-6 shadow-lg space-y-5">
          <div className="flex items-center justify-between pb-3 border-b border-navy-800">
            <div>
              <h2 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <Compass className="w-4 h-4 text-teal-400" />
                Intelligent Team Assignment Engine
              </h2>
              <p className="text-xs text-slate-400">Skill verification & capacity optimization</p>
            </div>
            {assignmentResult && (
              <span
                className={`text-xs font-bold px-2.5 py-0.5 rounded ${
                  assignmentResult.isFeasible
                    ? 'bg-teal-500/20 text-teal-300 border border-teal-500/30'
                    : 'bg-rose-500/20 text-rose-300 border border-rose-500/30 animate-pulse'
                }`}
              >
                {assignmentResult.isFeasible ? 'Assignment Feasible' : 'Infeasible / Conflict'}
              </span>
            )}
          </div>

          {/* Test Setup Inputs */}
          <div className="grid grid-cols-2 gap-3 text-xs">
            <div>
              <label className="block text-slate-400 mb-1 font-semibold">Incident Category</label>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full px-3 py-2 bg-navy-950 border border-navy-700 rounded-lg text-slate-200"
              >
                {CATEGORIES_LIST.map((c) => (
                  <option key={c.code} value={c.code}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-slate-400 mb-1 font-semibold">Jurisdiction Service Zone</label>
              <select
                value={selectedZoneId}
                onChange={(e) => setSelectedZoneId(e.target.value)}
                className="w-full px-3 py-2 bg-navy-950 border border-navy-700 rounded-lg text-slate-200"
              >
                {PILOT_ZONES.map((z) => (
                  <option key={z.code} value={z.code}>
                    {z.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Feasible Recommended Team Card */}
          {assignmentResult?.isFeasible && assignmentResult.recommendedTeam ? (
            <div className="bg-gradient-to-br from-navy-950 to-navy-900 border border-teal-500/40 rounded-2xl p-5 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-teal-400 flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-teal-400" />
                  {t.decision.bestTeam}
                </span>
                <span className="text-xs font-mono font-bold text-white px-2 py-0.5 rounded bg-teal-500/15 border border-teal-500/30">
                  Cost: {assignmentResult.recommendedTeam.assignmentCost} pts
                </span>
              </div>

              <h3 className="text-lg font-black text-white">
                {assignmentResult.recommendedTeam.teamName}
              </h3>
              <p className="text-xs text-slate-400">
                Department: {assignmentResult.recommendedTeam.departmentName}
              </p>

              <div className="grid grid-cols-3 gap-2 pt-2 border-t border-navy-800 text-xs">
                <div>
                  <span className="text-slate-400 block text-[10px]">Estimated Distance</span>
                  <span className="font-bold text-cyan-400">{assignmentResult.recommendedTeam.distanceKm} km</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">Workload / Capacity</span>
                  <span className="font-bold text-slate-200">
                    {assignmentResult.recommendedTeam.activeWorkload} / {assignmentResult.recommendedTeam.capacity}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">Mandatory Skill</span>
                  <span className="font-bold text-teal-300">
                    {assignmentResult.recommendedTeam.verifiedSkillName || 'Verified'}
                  </span>
                </div>
              </div>
            </div>
          ) : null}

          {/* Conflict Alert & Infeasibility Analysis (Requirement: When no eligible team exists) */}
          {assignmentResult && !assignmentResult.isFeasible && (
            <div className="bg-rose-950/40 border border-rose-500/50 rounded-2xl p-5 space-y-3 text-left">
              <div className="flex items-center gap-2 text-rose-400">
                <AlertOctagon className="w-5 h-5 text-rose-400 shrink-0" />
                <h3 className="text-sm font-bold text-white">
                  {t.decision.conflictAlert}
                </h3>
              </div>

              <p className="text-xs text-rose-200/90 leading-relaxed">
                {assignmentResult.infeasibilityReason}
              </p>

              <div className="bg-navy-950/80 p-3 rounded-xl border border-navy-800 text-xs text-slate-300 space-y-1">
                <span className="font-semibold text-slate-200 block">Automated Safeguard Action:</span>
                <p className="text-[11px] text-slate-400">
                  System strictly prevents invalid assignment. Issue is shifted into Supervisor Review queue and flagged in the audit log.
                </p>
              </div>
            </div>
          )}

          {/* Ineligible Candidate Teams Breakdown */}
          {assignmentResult?.ineligibleTeams?.length > 0 && (
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block mb-2">
                Evaluated Teams (Constraint Rejection Details):
              </span>
              <div className="space-y-2 max-h-52 overflow-y-auto pr-1">
                {assignmentResult.ineligibleTeams.map((team: any) => (
                  <div
                    key={team.teamId}
                    className="p-3 rounded-xl bg-navy-950 border border-navy-800 text-xs space-y-1"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-300">{team.teamName}</span>
                      <span className="text-[10px] text-rose-400 font-semibold">Rejected</span>
                    </div>
                    <ul className="text-[11px] text-slate-400 list-disc list-inside">
                      {team.ineligibilityReasons?.map((reason: string, i: number) => (
                        <li key={i}>{reason}</li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
