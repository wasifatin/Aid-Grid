'use client';

import React, { useState, useEffect } from 'react';
import { useApp } from '@/context/AppContext';
import PerspectiveCard from '@/components/PerspectiveCard';
import ModalPortal from '@/components/ModalPortal';
import CitizenReadOnlyNotice from '@/components/CitizenReadOnlyNotice';
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
  Sparkles,
} from 'lucide-react';

export default function FieldOperationsPage() {
  const { t, lang, user, showToast } = useApp();
  const [assignments, setAssignments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Resolution modal state
  const [resolvingAssignment, setResolvingAssignment] = useState<any>(null);
  const [resolutionSummary, setResolutionSummary] = useState('');
  const [resolutionPhotoUrl, setResolutionPhotoUrl] = useState('');
  const [fieldNotes, setFieldNotes] = useState('');
  const [processingAction, setProcessingAction] = useState(false);
  const [isClosing, setIsClosing] = useState(false);

  const handleCloseModal = () => {
    setIsClosing(true);
    setTimeout(() => {
      setResolvingAssignment(null);
      setIsClosing(false);
    }, 200);
  };

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
    if (user?.role !== 'CITIZEN') {
      fetchAssignments();
    }
  }, [user?.role]);

  if (user?.role === 'CITIZEN') {
    return (
      <CitizenReadOnlyNotice
        title="Field Operations Restricted"
        description="Citizen accounts have read-only case viewing access and cannot acknowledge, start, or modify field assignments."
      />
    );
  }

  // Quick Acknowledge
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

  // Start Work
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
      <div className="glass-pane glass-rim p-6 rounded-3xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="px-3 py-0.5 rounded-full text-[11px] font-black uppercase tracking-wider bg-cyan-500/15 text-cyan-300 border border-cyan-400/30 shadow-sm">
              Module C Workspace
            </span>
            <span className="text-xs text-slate-400 font-medium">
              Field Officer Dispatch & Work Queue
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            {t.fieldOps.title}
          </h1>
          <p className="text-slate-300/80 text-xs sm:text-sm mt-1">
            {t.fieldOps.subtitle}
          </p>
        </div>

        <button
          onClick={fetchAssignments}
          className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-bold text-slate-200 transition-all self-start md:self-auto shadow-sm"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh Queue</span>
        </button>
      </div>

      {/* Assignments Queue Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {assignments.length === 0 ? (
          <div className="col-span-full py-14 text-center text-slate-400 glass-pane rounded-3xl">
            No active assignments currently allocated to this field response unit.
          </div>
        ) : (
          assignments.map((asgn) => {
            const report = asgn.report;
            return (
              <PerspectiveCard key={asgn.id} className="p-5 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-mono font-bold text-cyan-300 px-3 py-0.5 rounded-full bg-cyan-500/15 border border-cyan-400/40">
                      {report?.referenceNumber}
                    </span>
                    <span
                      className={`text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full border shadow-sm ${
                        asgn.status === 'PENDING_ACK'
                          ? 'bg-cyan-500/15 text-cyan-300 border-cyan-500/40'
                          : asgn.status === 'IN_PROGRESS'
                          ? 'bg-sky-500/15 text-sky-300 border-sky-500/40'
                          : asgn.status === 'COMPLETED'
                          ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/40'
                          : 'bg-white/5 text-slate-300 border-white/10'
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

                  <div className="bg-black/25 p-3.5 rounded-2xl border border-white/10 space-y-1.5 text-xs text-slate-300 mb-4">
                    <div className="flex items-center gap-1.5 text-slate-300">
                      <MapPin className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                      <span className="truncate">{report?.address}</span>
                    </div>
                    <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1.5 border-t border-white/10">
                      <span>Team: <strong className="text-slate-200">{asgn.team?.name}</strong></span>
                      <span>Cost: <strong className="text-cyan-300">{asgn.assignmentCost} pts</strong></span>
                    </div>
                  </div>
                </div>

                {/* Action Controls */}
                <div className="pt-3 border-t border-white/10 flex items-center gap-2">
                  {asgn.status === 'PENDING_ACK' && (
                    <button
                      onClick={() => handleAcknowledge(asgn.id)}
                      disabled={processingAction}
                      className="w-full py-2.5 rounded-xl btn-jellyfish text-xs uppercase tracking-wider shadow-md flex items-center justify-center gap-1.5"
                    >
                      <Clock className="w-3.5 h-3.5" />
                      <span>{t.fieldOps.ackAction}</span>
                    </button>
                  )}

                  {asgn.status === 'ACKNOWLEDGED' && (
                    <button
                      onClick={() => handleStartWork(asgn.id)}
                      disabled={processingAction}
                      className="w-full py-2.5 rounded-xl btn-jellyfish text-xs uppercase tracking-wider shadow-md flex items-center justify-center gap-1.5"
                    >
                      <Play className="w-3.5 h-3.5" />
                      <span>{t.fieldOps.startWork}</span>
                    </button>
                  )}

                  {asgn.status === 'IN_PROGRESS' && (
                    <button
                      onClick={() => {
                        setIsClosing(false);
                        setResolvingAssignment(asgn);
                        setResolutionSummary('');
                      }}
                      className="w-full py-2.5 rounded-xl btn-jellyfish text-xs uppercase tracking-wider shadow-md flex items-center justify-center gap-1.5"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>{t.fieldOps.submitResolution}</span>
                    </button>
                  )}

                  {asgn.status === 'COMPLETED' && (
                    <div className="w-full py-2 text-center text-xs text-cyan-300 font-bold bg-cyan-500/10 rounded-xl border border-cyan-500/25">
                      ✓ Resolution Submitted
                    </div>
                  )}
                </div>
              </PerspectiveCard>
            );
          })
        )}
      </div>

      {/* Resolution Submission Modal */}
      {resolvingAssignment && (
        <ModalPortal>
          <div
            onClick={handleCloseModal}
            className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/75 backdrop-blur-md"
          >
            <div
              onClick={(e) => e.stopPropagation()}
              className={`glass-pane-chrome glass-rim rounded-3xl max-w-lg w-full p-6 shadow-2xl max-h-[90vh] overflow-y-auto relative text-left border border-cyan-500/30 ${
                isClosing ? 'modal-pop-out' : 'modal-pop-in'
              }`}
            >
              <button
                onClick={handleCloseModal}
                className="absolute top-4 right-4 text-slate-400 hover:text-white p-1 rounded-full bg-white/5 hover:bg-white/10 transition-colors"
              >
                ✕
              </button>

              <span className="text-xs font-mono font-bold text-cyan-300 px-3 py-1 rounded-full bg-cyan-500/15 border border-cyan-400/40">
                {resolvingAssignment.report?.referenceNumber}
              </span>
              <h3 className="text-lg font-black text-white mt-1 mb-2">
                {t.fieldOps.submitResolution}
              </h3>
              <p className="text-xs text-slate-400 mb-4">
                Enter verifiable proof of physical municipal completion to trigger the citizen confirmation gate.
              </p>

              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-black uppercase tracking-wider text-slate-300 mb-1">
                    Resolution Summary & Materials Used *
                  </label>
                  <textarea
                    required
                    rows={3}
                    placeholder={t.fieldOps.resolutionNotesPlaceholder}
                    value={resolutionSummary}
                    onChange={(e) => setResolutionSummary(e.target.value)}
                    className="w-full px-4 py-3 bg-black/30 border border-white/10 rounded-2xl text-xs text-white placeholder-slate-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-black uppercase tracking-wider text-slate-300 mb-1">
                    {t.fieldOps.uploadAfterPhoto}
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="url"
                      placeholder="Enter post-repair photo URL (or click demo button)"
                      value={resolutionPhotoUrl}
                      onChange={(e) => setResolutionPhotoUrl(e.target.value)}
                      className="flex-1 px-4 py-2.5 bg-black/30 border border-white/10 rounded-2xl text-xs text-white placeholder-slate-500"
                    />
                    <button
                      type="button"
                      onClick={() => setResolutionPhotoUrl('https://images.unsplash.com/photo-1541888946425-d0fbb1861564?auto=format&fit=crop&w=600&q=80')}
                      className="px-4 py-2.5 bg-white/5 hover:bg-white/10 text-slate-300 text-xs rounded-2xl border border-white/10 font-bold"
                    >
                      Demo Proof
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-black uppercase tracking-wider text-slate-300 mb-1">
                    Internal Crew Work Notes (Optional)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. 4 man-hours, compacted hot bitumen, road dry"
                    value={fieldNotes}
                    onChange={(e) => setFieldNotes(e.target.value)}
                    className="w-full px-4 py-2.5 bg-black/30 border border-white/10 rounded-2xl text-xs text-white placeholder-slate-500"
                  />
                </div>
              </div>

              <button
                onClick={handleSubmitResolution}
                disabled={processingAction}
                className="w-full mt-6 py-3 rounded-2xl btn-jellyfish text-xs font-black uppercase tracking-wider shadow-lg flex items-center justify-center gap-2"
              >
                {t.fieldOps.completeBtn}
              </button>
            </div>
          </div>
        </ModalPortal>
      )}
    </div>
  );
}
