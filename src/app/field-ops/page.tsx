'use client';

import React, { useState, useEffect } from 'react';
import { useApp } from '@/context/AppContext';
import {
  Truck,
  CheckCircle2,
  Clock,
  Play,
  FileCheck,
  MapPin,
  Calendar,
  AlertTriangle,
  Camera,
  RefreshCw,
  Send,
  MessageSquare,
} from 'lucide-react';

export default function FieldOperationsPage() {
  const { t, lang, user, showToast } = useApp();
  const [assignments, setAssignments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedAssignment, setSelectedAssignment] = useState<any>(null);

  // Resolution modal state
  const [resolvingAssignment, setResolvingAssignment] = useState<any>(null);
  const [resolutionSummary, setResolutionSummary] = useState('');
  const [resolutionPhotoUrl, setResolutionPhotoUrl] = useState('');
  const [fieldNotes, setFieldNotes] = useState('');
  const [processingAction, setProcessingAction] = useState(false);

  const fetchAssignments = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/field-ops');
      const data = await res.json();
      setAssignments(data.assignments || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAssignments();
  }, []);

  // Handle Quick Acknowledge
  const handleAcknowledge = async (assignmentId: string) => {
    setProcessingAction(true);
    try {
      const res = await fetch('/api/field-ops', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          assignmentId,
          action: 'ACKNOWLEDGE',
          officerId: user?.id,
        }),
      });
      const data = await res.json();
      if (data.success) {
        showToast('Assignment acknowledged! Dispatch status updated to ACKNOWLEDGED.');
        fetchAssignments();
      }
    } catch (e) {
      console.error(e);
    } finally {
      setProcessingAction(false);
    }
  };

  // Handle Start Work
  const handleStartWork = async (assignmentId: string) => {
    setProcessingAction(true);
    try {
      const res = await fetch('/api/field-ops', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          assignmentId,
          action: 'START_WORK',
          officerId: user?.id,
        }),
      });
      const data = await res.json();
      if (data.success) {
        showToast('Physical on-site work commenced! Status changed to IN_PROGRESS.');
        fetchAssignments();
      }
    } catch (e) {
      console.error(e);
    } finally {
      setProcessingAction(false);
    }
  };

  // Submit Completion and Resolution
  const handleSubmitResolution = async () => {
    if (!resolvingAssignment || !resolutionSummary) {
      showToast('Please provide a resolution summary of work completed.');
      return;
    }

    setProcessingAction(true);
    try {
      const res = await fetch('/api/field-ops', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          assignmentId: resolvingAssignment.id,
          action: 'RESOLVE',
          officerId: user?.id,
          notes: fieldNotes,
          resolutionSummary,
          resolutionEvidenceUrl: resolutionPhotoUrl || 'https://images.unsplash.com/photo-1584467735871-8e85353a8413?auto=format&fit=crop&w=600&q=80',
        }),
      });
      const data = await res.json();
      if (data.success) {
        showToast('Work completed! Submitted for Citizen Verification & Review.');
        setResolvingAssignment(null);
        setResolutionSummary('');
        setResolutionPhotoUrl('');
        setFieldNotes('');
        fetchAssignments();
      }
    } catch (e) {
      console.error(e);
    } finally {
      setProcessingAction(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-r from-navy-900 via-navy-850 to-navy-900 p-6 rounded-2xl border border-navy-800 shadow-xl">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider bg-amber-500/20 text-amber-300 border border-amber-500/30">
              Module C Workspace
            </span>
            <span className="text-xs text-slate-400 font-medium">
              Field Officer Dispatch & Work Queue
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            {t.fieldOps.title}
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            {t.fieldOps.subtitle}
          </p>
        </div>

        <button
          onClick={fetchAssignments}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-navy-800 hover:bg-navy-700 border border-navy-700 text-xs font-semibold text-slate-200 transition-colors self-start md:self-auto"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh Queue</span>
        </button>
      </div>

      {/* Assignments Queue Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {assignments.length === 0 ? (
          <div className="col-span-full py-12 text-center text-slate-500 bg-navy-900 rounded-2xl border border-navy-800">
            No active assignments currently allocated to this field response unit.
          </div>
        ) : (
          assignments.map((asgn) => {
            const report = asgn.report;
            const isCompleted = asgn.status === 'COMPLETED' || report.status === 'CLOSED';
            const isAcknowledged = asgn.status === 'ACKNOWLEDGED' || asgn.status === 'IN_PROGRESS';
            const isInProgress = asgn.status === 'IN_PROGRESS';

            return (
              <div
                key={asgn.id}
                className="bg-navy-900 border border-navy-800 hover:border-navy-700 rounded-2xl p-5 shadow-lg flex flex-col justify-between transition-all"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-mono font-bold text-cyan-400 px-2.5 py-0.5 rounded bg-cyan-500/10 border border-cyan-500/30">
                      {report?.referenceNumber}
                    </span>
                    <span
                      className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded border ${
                        asgn.status === 'PENDING_ACK'
                          ? 'bg-amber-500/15 text-amber-300 border-amber-500/30 animate-pulse'
                          : asgn.status === 'IN_PROGRESS'
                          ? 'bg-cyan-500/15 text-cyan-300 border-cyan-500/30'
                          : asgn.status === 'COMPLETED'
                          ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30'
                          : 'bg-navy-800 text-slate-300 border-navy-700'
                      }`}
                    >
                      {asgn.status}
                    </span>
                  </div>

                  <h3 className="text-sm font-bold text-white line-clamp-2 mb-1.5">
                    {report?.title}
                  </h3>

                  <p className="text-xs text-slate-400 line-clamp-2 mb-3">
                    {report?.description}
                  </p>

                  <div className="bg-navy-950/70 p-3 rounded-xl border border-navy-800/80 space-y-1.5 text-xs text-slate-300 mb-4">
                    <div className="flex items-center gap-1.5 text-slate-300">
                      <MapPin className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                      <span className="truncate">{report?.address}</span>
                    </div>
                    <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1 border-t border-navy-800">
                      <span>Assigned Team: <strong className="text-slate-200">{asgn.team?.name}</strong></span>
                      <span>Cost: <strong className="text-cyan-400">{asgn.assignmentCost} pts</strong></span>
                    </div>
                  </div>
                </div>

                {/* Action Controls for Field Technicians */}
                <div className="pt-2 border-t border-navy-800 flex items-center gap-2">
                  {asgn.status === 'PENDING_ACK' && (
                    <button
                      onClick={() => handleAcknowledge(asgn.id)}
                      disabled={processingAction}
                      className="w-full py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-navy-950 font-bold text-xs uppercase tracking-wider shadow-sm transition-all flex items-center justify-center gap-1.5"
                    >
                      <Clock className="w-3.5 h-3.5" />
                      <span>{t.fieldOps.ackAction}</span>
                    </button>
                  )}

                  {asgn.status === 'ACKNOWLEDGED' && (
                    <button
                      onClick={() => handleStartWork(asgn.id)}
                      disabled={processingAction}
                      className="w-full py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-navy-950 font-bold text-xs uppercase tracking-wider shadow-sm transition-all flex items-center justify-center gap-1.5"
                    >
                      <Play className="w-3.5 h-3.5" />
                      <span>{t.fieldOps.startWork}</span>
                    </button>
                  )}

                  {asgn.status === 'IN_PROGRESS' && (
                    <button
                      onClick={() => {
                        setResolvingAssignment(asgn);
                        setResolutionSummary('');
                      }}
                      className="w-full py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-400 text-navy-950 font-bold text-xs uppercase tracking-wider shadow-sm transition-all flex items-center justify-center gap-1.5"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>{t.fieldOps.submitResolution}</span>
                    </button>
                  )}

                  {asgn.status === 'COMPLETED' && (
                    <div className="w-full py-1.5 text-center text-xs text-emerald-400 font-semibold bg-emerald-500/10 rounded-lg border border-emerald-500/20">
                      ✓ Resolution Submitted
                    </div>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Resolution & Evidence Submission Modal */}
      {resolvingAssignment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-950/80 backdrop-blur-sm animate-fadeIn">
          <div className="bg-navy-900 border border-emerald-500/50 rounded-2xl max-w-lg w-full p-6 shadow-2xl relative text-left">
            <button
              onClick={() => setResolvingAssignment(null)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white"
            >
              ✕
            </button>

            <span className="text-xs font-mono font-bold text-cyan-400 px-2 py-0.5 rounded bg-cyan-500/10 border border-cyan-500/30">
              {resolvingAssignment.report?.referenceNumber}
            </span>
            <h3 className="text-lg font-bold text-white mt-1 mb-2">
              {t.fieldOps.submitResolution}
            </h3>
            <p className="text-xs text-slate-400 mb-4">
              Enter verifiable proof of physical municipal completion to trigger the citizen confirmation gate.
            </p>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1">
                  Resolution Summary & Materials Used *
                </label>
                <textarea
                  required
                  rows={3}
                  placeholder={t.fieldOps.resolutionNotesPlaceholder}
                  value={resolutionSummary}
                  onChange={(e) => setResolutionSummary(e.target.value)}
                  className="w-full px-3 py-2 bg-navy-950 border border-navy-700 rounded-xl text-xs text-white placeholder-slate-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1">
                  {t.fieldOps.uploadAfterPhoto}
                </label>
                <div className="flex gap-2">
                  <input
                    type="url"
                    placeholder="Enter post-repair photo URL (or click demo button)"
                    value={resolutionPhotoUrl}
                    onChange={(e) => setResolutionPhotoUrl(e.target.value)}
                    className="flex-1 px-3 py-2 bg-navy-950 border border-navy-700 rounded-xl text-xs text-white placeholder-slate-500"
                  />
                  <button
                    type="button"
                    onClick={() => setResolutionPhotoUrl('https://images.unsplash.com/photo-1541888946425-d0fbb1861564?auto=format&fit=crop&w=600&q=80')}
                    className="px-3 py-2 bg-navy-800 hover:bg-navy-700 text-slate-300 text-xs rounded-xl border border-navy-700 font-semibold"
                  >
                    Demo Proof
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1">
                  Internal Crew Work Notes (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. 4 man-hours, compacted hot bitumen, road dry"
                  value={fieldNotes}
                  onChange={(e) => setFieldNotes(e.target.value)}
                  className="w-full px-3 py-2 bg-navy-950 border border-navy-700 rounded-xl text-xs text-white placeholder-slate-500"
                />
              </div>
            </div>

            <button
              onClick={handleSubmitResolution}
              disabled={processingAction}
              className="w-full mt-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-400 text-navy-950 font-black text-xs uppercase tracking-wider shadow-lg transition-transform hover:scale-[1.01]"
            >
              {t.fieldOps.completeBtn}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
