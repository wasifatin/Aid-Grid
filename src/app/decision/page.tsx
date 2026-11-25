'use client';

import React, { useState, useEffect } from 'react';
import { useApp } from '@/context/AppContext';
import PerspectiveCard from '@/components/PerspectiveCard';
import CitizenReadOnlyNotice from '@/components/CitizenReadOnlyNotice';
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
import CustomDropdown from '@/components/CustomDropdown';

export default function DecisionIntelligencePage() {
  const { t, lang, user, showToast } = useApp();

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

  // Weights Config State
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

  // Save Config to DB
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

  // Test Scenario Presets for Judges
  const applyTestScenario = (scenario: number) => {
    if (scenario === 1) {
      setSafety(95);
      setSeverity(90);
      setPeople(85);
      setLocation(90);
      setSla(40);
      setCorroboration(20);
      setSelectedCategory('ROADS');
      showToast('Loaded Scenario 1: High-Severity Arterial Infrastructure Hazard (Expect: Critical > 80 pts)');
    } else if (scenario === 2) {
      setSafety(20);
      setSeverity(25);
      setPeople(30);
      setLocation(20);
      setSla(10);
      setCorroboration(0);
      setSelectedCategory('GENERAL');
      showToast('Loaded Scenario 2: Low-Severity Municipal Park Bench (Expect: Low < 35 pts)');
    } else if (scenario === 3) {
      setSafety(80);
      setSeverity(80);
      setSelectedCategory('LIGHTS');
      setSelectedZoneId('DSCC-Z5');
      showToast('Loaded Scenario 3: Missing Skill / Certification Conflict (Expect: Infeasible Outcome)');
    } else if (scenario === 4) {
      setSafety(75);
      setSeverity(70);
      setSelectedCategory('TREES');
      showToast('Loaded Scenario 4: Heavy Arborist Capacity Limitation (Expect: Verified Capacity Check)');
    }
  };

  if (user?.role === 'CITIZEN') {
    return (
      <CitizenReadOnlyNotice
        title="Decision Configuration Restricted"
        description="Citizen accounts can view cases and public analytics, and cannot modify A02 priority weights or decision configuration documents."
      />
    );
  }

  return (
    <div className="space-y-6 perspective-container">
      {/* Top Banner */}
      <div className="glass-pane glass-rim p-6 rounded-3xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="px-3 py-0.5 rounded-full text-[11px] font-black uppercase tracking-wider bg-cyan-500/20 text-cyan-300 border border-cyan-400/40 shadow-sm">
              Advanced Challenge A02
            </span>
            <span className="text-xs text-slate-400 font-medium">
              Deterministic Decision Intelligence & Optimization
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            {t.decision.title}
          </h1>
          <p className="text-slate-300/80 text-xs sm:text-sm mt-1">
            {t.decision.subtitle}
          </p>
        </div>

        <button
          onClick={runEvaluation}
          className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-bold text-slate-200 transition-all self-start md:self-auto shadow-sm"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${calculating ? 'animate-spin' : ''}`} />
          <span>Re-Evaluate</span>
        </button>
      </div>

      {/* A02 Judge Demonstration Presets Bar (Glass Capsule Bar) */}
      <div className="glass-pane glass-rim p-4 rounded-2xl flex flex-col md:flex-row items-center justify-between gap-3 shadow-lg">
        <div className="flex items-center gap-2 text-xs font-black uppercase text-cyan-300">
          <Play className="w-4 h-4 text-cyan-400" />
          <span>Judge Test Scenarios (1-Click Presets):</span>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => applyTestScenario(1)}
            className="px-3.5 py-1.5 rounded-xl jellyfish-interactive bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-bold text-slate-200 transition-all"
          >
            1. High-Hazard Sinkhole
          </button>
          <button
            onClick={() => applyTestScenario(2)}
            className="px-3.5 py-1.5 rounded-xl jellyfish-interactive bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-bold text-slate-200 transition-all"
          >
            2. Low-Severity Bench
          </button>
          <button
            onClick={() => applyTestScenario(3)}
            className="px-3.5 py-1.5 rounded-xl jellyfish-interactive bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-bold text-slate-200 transition-all"
          >
            3. Uncertified Skill Conflict
          </button>
          <button
            onClick={() => applyTestScenario(4)}
            className="px-3.5 py-1.5 rounded-xl jellyfish-interactive bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-bold text-slate-200 transition-all"
          >
            4. Capacity Saturation
          </button>
        </div>
      </div>

      {/* Main Grid: Priority Engine on Left, Assignment Recommendation on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Factor Sliders & Score Meter */}
        <div className="lg:col-span-6 glass-pane glass-rim p-6 rounded-3xl shadow-xl space-y-5">
          <div className="flex items-center justify-between pb-3 border-b border-white/10">
            <div>
              <h2 className="text-sm font-black text-white uppercase tracking-wider flex items-center gap-2">
                <Sliders className="w-4 h-4 text-cyan-400" />
                Explainable Priority Engine
              </h2>
              <p className="text-xs text-slate-400">Normalized multi-factor input sliders</p>
            </div>
            {priorityResult && (
              <span
                className={`text-xs font-black px-3 py-1 rounded-full uppercase tracking-wider shadow-sm ${
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
          <div className="bg-black/30 p-3.5 rounded-2xl border border-white/10 text-[11px] font-mono text-cyan-300 leading-relaxed shadow-inner">
            {t.decision.formula}
          </div>

          {/* 6 Normalized Factor Sliders */}
          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="font-bold text-slate-300">{t.decision.safety} ({(safetyWeight * 100).toFixed(0)}%)</span>
                <span className="font-black text-rose-400">{safety}/100</span>
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

            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="font-bold text-slate-300">{t.decision.severity} ({(severityWeight * 100).toFixed(0)}%)</span>
                <span className="font-black text-orange-400">{severity}/100</span>
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

            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="font-bold text-slate-300">{t.decision.people} ({(peopleWeight * 100).toFixed(0)}%)</span>
                <span className="font-black text-cyan-400">{people}/100</span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={people}
                onChange={(e) => setPeople(parseInt(e.target.value, 10))}
                className="w-full accent-cyan-400 cursor-pointer"
              />
            </div>

            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="font-bold text-slate-300">{t.decision.location} ({(locationWeight * 100).toFixed(0)}%)</span>
                <span className="font-black text-teal-300">{location}/100</span>
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

            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="font-bold text-slate-300">{t.decision.sla} ({(slaWeight * 100).toFixed(0)}%)</span>
                <span className="font-black text-indigo-300">{sla}/100</span>
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

            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="font-bold text-slate-300">{t.decision.corroboration} ({(corroborationWeight * 100).toFixed(0)}%)</span>
                <span className="font-black text-emerald-400">{corroboration}/100</span>
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

          {/* Narrative Explanation */}
          {priorityResult && (
            <div className="bg-black/25 p-4 rounded-2xl border border-white/10 text-xs space-y-2">
              <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block">
                Deterministic Calculation Narrative:
              </span>
              <p className="text-slate-300 leading-relaxed">
                {priorityResult.narrativeExplanation}
              </p>
              <div className="flex flex-wrap gap-1.5 pt-2 border-t border-white/10">
                {priorityResult.rulesApplied?.map((rule: string) => (
                  <span
                    key={rule}
                    className="text-[10px] font-mono font-bold px-2.5 py-0.5 rounded-full bg-cyan-500/10 text-cyan-300 border border-cyan-400/30"
                  >
                    {rule}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Live Weight Tuning Section */}
          <div className="pt-4 border-t border-white/10">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-black text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                <Scale className="w-3.5 h-3.5 text-cyan-400" />
                {t.decision.tuningHeader}
              </span>
              <button
                onClick={handleSaveConfig}
                className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-cyan-500 to-teal-400 hover:opacity-95 text-navy-950 font-black text-xs shadow-md transition-all hover:scale-105"
              >
                <Save className="w-3.5 h-3.5" />
                <span>Save Config</span>
              </button>
            </div>
            <div className="grid grid-cols-3 gap-2 text-xs">
              <div>
                <label className="text-[10px] text-slate-400 font-bold">Safety Wgt</label>
                <input
                  type="number"
                  step="0.05"
                  value={safetyWeight}
                  onChange={(e) => setSafetyWeight(parseFloat(e.target.value))}
                  className="w-full px-2.5 py-1.5 bg-black/40 border border-white/10 rounded-xl text-slate-200"
                />
              </div>
              <div>
                <label className="text-[10px] text-slate-400 font-bold">Severity Wgt</label>
                <input
                  type="number"
                  step="0.05"
                  value={severityWeight}
                  onChange={(e) => setSeverityWeight(parseFloat(e.target.value))}
                  className="w-full px-2.5 py-1.5 bg-black/40 border border-white/10 rounded-xl text-slate-200"
                />
              </div>
              <div>
                <label className="text-[10px] text-slate-400 font-bold">People Wgt</label>
                <input
                  type="number"
                  step="0.05"
                  value={peopleWeight}
                  onChange={(e) => setPeopleWeight(parseFloat(e.target.value))}
                  className="w-full px-2.5 py-1.5 bg-black/40 border border-white/10 rounded-xl text-slate-200"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Intelligent Assignment & Constraint Validation */}
        <div className="lg:col-span-6 glass-pane glass-rim p-6 rounded-3xl shadow-xl space-y-5">
          <div className="flex items-center justify-between pb-3 border-b border-white/10">
            <div>
              <h2 className="text-sm font-black text-white uppercase tracking-wider flex items-center gap-2">
                <Compass className="w-4 h-4 text-teal-400" />
                Intelligent Team Assignment Engine
              </h2>
              <p className="text-xs text-slate-400">Skill verification & capacity optimization</p>
            </div>
            {assignmentResult && (
              <span
                className={`text-xs font-black px-3 py-1 rounded-full uppercase tracking-wider shadow-sm ${
                  assignmentResult.isFeasible
                    ? 'bg-teal-500/20 text-teal-300 border border-teal-400/40'
                    : 'bg-rose-500/20 text-rose-300 border border-rose-500/40 animate-pulse'
                }`}
              >
                {assignmentResult.isFeasible ? 'Feasible' : 'Infeasible / Conflict'}
              </span>
            )}
          </div>

          {/* Test Setup Inputs */}
          <div className="grid grid-cols-2 gap-3 text-xs">
            <div>
              <label className="block text-slate-400 mb-1 font-bold">Incident Category</label>
              <CustomDropdown
                options={CATEGORIES_LIST.map((c) => ({
                  value: c.code,
                  label: c.name,
                }))}
                value={selectedCategory}
                onChange={setSelectedCategory}
              />
            </div>

            <div>
              <label className="block text-slate-400 mb-1 font-bold">Jurisdiction Zone</label>
              <CustomDropdown
                options={PILOT_ZONES.map((z) => ({
                  value: z.code,
                  label: z.name,
                  sublabel: z.code,
                }))}
                value={selectedZoneId}
                onChange={setSelectedZoneId}
              />
            </div>
          </div>

          {/* Feasible Recommended Team Card */}
          {assignmentResult?.isFeasible && assignmentResult.recommendedTeam ? (
            <div className="bg-black/30 border border-teal-500/40 rounded-3xl p-5 space-y-3 shadow-lg">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black uppercase tracking-wider text-teal-400 flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-teal-400" />
                  {t.decision.bestTeam}
                </span>
                <span className="text-xs font-mono font-bold text-white px-2.5 py-0.5 rounded-full bg-teal-500/20 border border-teal-500/30">
                  Cost: {assignmentResult.recommendedTeam.assignmentCost} pts
                </span>
              </div>

              <h3 className="text-lg font-black text-white">
                {assignmentResult.recommendedTeam.teamName}
              </h3>
              <p className="text-xs text-slate-400">
                Department: {assignmentResult.recommendedTeam.departmentName}
              </p>

              <div className="grid grid-cols-3 gap-2 pt-3 border-t border-white/10 text-xs">
                <div>
                  <span className="text-slate-400 block text-[10px] font-bold">Estimated Distance</span>
                  <span className="font-black text-cyan-300">{assignmentResult.recommendedTeam.distanceKm} km</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px] font-bold">Workload / Capacity</span>
                  <span className="font-black text-slate-200">
                    {assignmentResult.recommendedTeam.activeWorkload} / {assignmentResult.recommendedTeam.capacity}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px] font-bold">Mandatory Skill</span>
                  <span className="font-bold text-teal-300">
                    {assignmentResult.recommendedTeam.verifiedSkillName || 'Verified'}
                  </span>
                </div>
              </div>
            </div>
          ) : null}

          {/* Conflict Alert & Infeasibility Analysis */}
          {assignmentResult && !assignmentResult.isFeasible && (
            <div className="bg-rose-950/30 border border-rose-500/50 rounded-3xl p-5 space-y-3 text-left shadow-lg">
              <div className="flex items-center gap-2 text-rose-400">
                <AlertOctagon className="w-5 h-5 text-rose-400 shrink-0" />
                <h3 className="text-sm font-black text-white">
                  {t.decision.conflictAlert}
                </h3>
              </div>

              <p className="text-xs text-rose-200/90 leading-relaxed">
                {assignmentResult.infeasibilityReason}
              </p>

              <div className="bg-black/30 p-3.5 rounded-2xl border border-white/10 text-xs text-slate-300 space-y-1">
                <span className="font-bold text-slate-200 block">Automated Safeguard Action:</span>
                <p className="text-[11px] text-slate-400">
                  System strictly prevents invalid assignment. Issue is shifted into Supervisor Review queue and flagged in the audit log.
                </p>
              </div>
            </div>
          )}

          {/* Ineligible Candidate Teams Breakdown */}
          {assignmentResult?.ineligibleTeams?.length > 0 && (
            <div>
              <span className="text-xs font-black uppercase tracking-wider text-slate-400 block mb-2">
                Evaluated Teams (Constraint Rejection Details):
              </span>
              <div className="space-y-2 max-h-52 overflow-y-auto pr-1">
                {assignmentResult.ineligibleTeams.map((team: any) => (
                  <div
                    key={team.teamId}
                    className="p-3.5 rounded-2xl bg-black/25 border border-white/10 text-xs space-y-1"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-300">{team.teamName}</span>
                      <span className="text-[10px] text-rose-400 font-black">Rejected</span>
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
