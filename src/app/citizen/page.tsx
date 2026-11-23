'use client';

import React, { useState, useEffect } from 'react';
import { useApp } from '@/context/AppContext';
import {
  FilePlus,
  MapPin,
  Camera,
  AlertCircle,
  CheckCircle,
  Clock,
  Sparkles,
  Layers,
  ThumbsUp,
  RotateCcw,
  Star,
  Send,
  AlertTriangle,
} from 'lucide-react';
import { PILOT_ZONES, CATEGORIES_LIST } from '@/lib/constants';

export default function CitizenPortalPage() {
  const { t, lang, user, showToast } = useApp();

  // Form State
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [categoryId, setCategoryId] = useState(CATEGORIES_LIST[0].code);
  const [selectedZone, setSelectedZone] = useState(PILOT_ZONES[0]);
  const [address, setAddress] = useState('Begum Rokeya Sarani, Mirpur 10 Roundabout, Dhaka');
  const [latitude, setLatitude] = useState(23.8223);
  const [longitude, setLongitude] = useState(90.3654);
  const [safetyImpact, setSafetyImpact] = useState(70);
  const [peopleAffected, setPeopleAffected] = useState(65);
  const [photoUrl, setPhotoUrl] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Duplicate Check & Corroboration State
  const [nearbyReports, setNearbyReports] = useState<any[]>([]);
  const [checkingNearby, setCheckingNearby] = useState(false);

  // Citizen's Report History
  const [myReports, setMyReports] = useState<any[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(false);

  // Verification / Reopen Modal
  const [reviewingReport, setReviewingReport] = useState<any>(null);
  const [reviewAction, setReviewAction] = useState<'CONFIRM' | 'REOPEN'>('CONFIRM');
  const [rating, setRating] = useState(5);
  const [feedbackComment, setFeedbackComment] = useState('');
  const [reopenReason, setReopenReason] = useState('');

  // Fetch Nearby Duplicates when location or category changes
  useEffect(() => {
    const fetchNearby = async () => {
      setCheckingNearby(true);
      try {
        const res = await fetch(`/api/reports/nearby?lat=${latitude}&lng=${longitude}&radius=0.8`);
        const data = await res.json();
        setNearbyReports(data.nearby || []);
      } catch (e) {
        console.error(e);
      } finally {
        setCheckingNearby(false);
      }
    };

    const timer = setTimeout(fetchNearby, 400);
    return () => clearTimeout(timer);
  }, [latitude, longitude, categoryId]);

  // Fetch User's reports
  const fetchMyReports = async () => {
    setLoadingHistory(true);
    try {
      const res = await fetch(`/api/reports?citizenId=${user?.id || ''}&limit=10`);
      const data = await res.json();
      setMyReports(data.reports || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingHistory(false);
    }
  };

  useEffect(() => {
    fetchMyReports();
  }, [user]);

  // Handle Zone Selection
  const handleZoneChange = (zoneCode: string) => {
    const zone = PILOT_ZONES.find((z) => z.code === zoneCode) || PILOT_ZONES[0];
    setSelectedZone(zone);
    setLatitude(zone.centerLat);
    setLongitude(zone.centerLng);
  };

  // Corroborate existing issue
  const handleCorroborate = async (reportId: string, refNum: string) => {
    try {
      const res = await fetch(`/api/reports/${reportId}/corroborate`, { method: 'POST' });
      const data = await res.json();
      if (data.success) {
        showToast(`Corroborated ${refNum}! Urgency boosted (+5% priority).`);
        // Refresh nearby
        const nearbyRes = await fetch(`/api/reports/nearby?lat=${latitude}&lng=${longitude}&radius=0.8`);
        const nearbyData = await nearbyRes.json();
        setNearbyReports(nearbyData.nearby || []);
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Submit New Report
  const handleSubmitReport = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !description || !address) {
      showToast('Please fill in all required fields.');
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch('/api/reports', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          description,
          categoryId,
          serviceZoneId: selectedZone.code,
          citizenId: user?.id,
          latitude,
          longitude,
          address,
          safetyScore: safetyImpact,
          severityScore: safetyImpact,
          peopleScore: peopleAffected,
          locationScore: 65,
          photoUrl: photoUrl || null,
        }),
      });

      const data = await res.json();
      if (data.success) {
        showToast(`Report created successfully! Ref: ${data.report.referenceNumber}`);
        setTitle('');
        setDescription('');
        setPhotoUrl('');
        fetchMyReports();
      } else {
        showToast(`Error: ${data.error || 'Failed to submit'}`);
      }
    } catch (e: any) {
      showToast(`Error: ${e.message}`);
    } finally {
      setSubmitting(false);
    }
  };

  // Submit Citizen Verification (Accept or Reopen)
  const handleCitizenVerification = async () => {
    if (!reviewingReport) return;

    try {
      const body: any = {
        citizenVerified: reviewAction === 'CONFIRM',
        citizenFeedbackRating: reviewAction === 'CONFIRM' ? rating : null,
        citizenFeedbackComment: reviewAction === 'CONFIRM' ? feedbackComment : null,
        reopenReason: reviewAction === 'REOPEN' ? reopenReason : null,
        changedById: user?.id,
      };

      const res = await fetch(`/api/reports/${reviewingReport.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      const data = await res.json();
      if (data.success) {
        showToast(
          reviewAction === 'CONFIRM'
            ? `Confirmed resolution for ${reviewingReport.referenceNumber}. Issue successfully closed!`
            : `Issue ${reviewingReport.referenceNumber} reopened and returned to operations queue.`
        );
        setReviewingReport(null);
        fetchMyReports();
      }
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      {/* Banner */}
      <div className="bg-gradient-to-r from-navy-900 to-navy-850 p-6 rounded-2xl border border-navy-800 shadow-xl">
        <div className="flex items-center gap-2 mb-1">
          <span className="px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider bg-teal-500/20 text-teal-300 border border-teal-500/30">
            {t.citizen.welcome}
          </span>
          <span className="text-xs text-slate-400">Mobile-First Civic Portal</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
          {t.reportForm.title}
        </h1>
        <p className="text-slate-400 text-sm mt-1">
          {t.reportForm.subtitle}
        </p>
      </div>

      {/* Main Grid: Form on Left, Duplicate Detection & My Reports on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left: Reporting Form */}
        <div className="lg:col-span-7 bg-navy-900 border border-navy-800 rounded-2xl p-6 shadow-lg">
          <form onSubmit={handleSubmitReport} className="space-y-5">
            {/* Category Selector */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-2">
                {t.reportForm.categoryLabel} *
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {CATEGORIES_LIST.map((cat) => (
                  <button
                    key={cat.code}
                    type="button"
                    onClick={() => setCategoryId(cat.code)}
                    className={`p-2.5 rounded-xl border text-left transition-all ${
                      categoryId === cat.code
                        ? 'bg-cyan-500/15 border-cyan-500 text-cyan-300 shadow-sm'
                        : 'bg-navy-950 border-navy-800 text-slate-400 hover:border-navy-700'
                    }`}
                  >
                    <p className="text-xs font-bold leading-tight truncate">
                      {lang === 'bn' ? cat.nameBn : cat.name}
                    </p>
                    <span className="text-[10px] text-slate-500 font-medium">SLA: {cat.baseSlaHours}h</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Title */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
                {t.reportForm.titleLabel} *
              </label>
              <input
                type="text"
                required
                placeholder={t.reportForm.titlePlaceholder}
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-navy-950 border border-navy-700 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
              />
            </div>

            {/* Description */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
                {t.reportForm.descLabel} *
              </label>
              <textarea
                required
                rows={3}
                placeholder={t.reportForm.descPlaceholder}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-navy-950 border border-navy-700 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 leading-relaxed"
              />
            </div>

            {/* Location Section */}
            <div className="bg-navy-950/60 p-4 rounded-xl border border-navy-800 space-y-3">
              <span className="text-xs font-bold uppercase tracking-wider text-cyan-400 flex items-center gap-1.5">
                <MapPin className="w-4 h-4" /> {t.reportForm.locationSection}
              </span>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                    {t.reportForm.zoneLabel}
                  </label>
                  <select
                    value={selectedZone.code}
                    onChange={(e) => handleZoneChange(e.target.value)}
                    className="w-full px-3 py-2 bg-navy-900 border border-navy-700 rounded-lg text-xs text-slate-200"
                  >
                    {PILOT_ZONES.map((z) => (
                      <option key={z.code} value={z.code}>
                        {lang === 'bn' ? z.nameBn : z.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                    {t.reportForm.coordsLabel}
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      step="0.0001"
                      value={latitude}
                      onChange={(e) => setLatitude(parseFloat(e.target.value))}
                      className="w-1/2 px-2 py-1.5 bg-navy-900 border border-navy-700 rounded text-xs text-white"
                    />
                    <input
                      type="number"
                      step="0.0001"
                      value={longitude}
                      onChange={(e) => setLongitude(parseFloat(e.target.value))}
                      className="w-1/2 px-2 py-1.5 bg-navy-900 border border-navy-700 rounded text-xs text-white"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                  {t.reportForm.addressLabel} *
                </label>
                <input
                  type="text"
                  required
                  placeholder={t.reportForm.addressPlaceholder}
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="w-full px-3 py-2 bg-navy-900 border border-navy-700 rounded-lg text-xs text-white placeholder-slate-500"
                />
              </div>
            </div>

            {/* A02 Explainable Factors: Public Safety & People Affected */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-navy-950/40 p-4 rounded-xl border border-navy-800">
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="font-semibold text-slate-300">Public Safety Danger (0-100)</span>
                  <span className="font-bold text-rose-400">{safetyImpact}</span>
                </div>
                <input
                  type="range"
                  min="10"
                  max="100"
                  value={safetyImpact}
                  onChange={(e) => setSafetyImpact(parseInt(e.target.value, 10))}
                  className="w-full accent-rose-500 cursor-pointer"
                />
                <span className="text-[10px] text-slate-500">A02 30% Weight Factor</span>
              </div>

              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="font-semibold text-slate-300">People Affected / Crowd (0-100)</span>
                  <span className="font-bold text-cyan-400">{peopleAffected}</span>
                </div>
                <input
                  type="range"
                  min="10"
                  max="100"
                  value={peopleAffected}
                  onChange={(e) => setPeopleAffected(parseInt(e.target.value, 10))}
                  className="w-full accent-cyan-500 cursor-pointer"
                />
                <span className="text-[10px] text-slate-500">A02 15% Weight Factor</span>
              </div>
            </div>

            {/* Photo Evidence URL */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1">
                {t.reportForm.photoSection}
              </label>
              <div className="flex gap-2">
                <input
                  type="url"
                  placeholder="Paste photo URL (or leave blank for standard inspection)"
                  value={photoUrl}
                  onChange={(e) => setPhotoUrl(e.target.value)}
                  className="flex-1 px-3 py-2 bg-navy-950 border border-navy-700 rounded-xl text-xs text-white placeholder-slate-500"
                />
                <button
                  type="button"
                  onClick={() => setPhotoUrl('https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?auto=format&fit=crop&w=600&q=80')}
                  className="px-3 py-2 bg-navy-800 hover:bg-navy-700 text-slate-300 text-xs rounded-xl border border-navy-700 font-semibold"
                >
                  Insert Demo Photo
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={submitting}
              className="w-full py-3.5 rounded-xl bg-gradient-to-r from-cyan-500 via-teal-400 to-cyan-500 hover:opacity-95 text-navy-950 font-black text-sm uppercase tracking-wider shadow-lg shadow-cyan-500/20 transition-all flex items-center justify-center gap-2"
            >
              {submitting ? (
                <span>{t.reportForm.submitting}</span>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  <span>{t.reportForm.submitBtn}</span>
                </>
              )}
            </button>
          </form>
        </div>

        {/* Right Column: Duplicate Detection & My Reported Issues */}
        <div className="lg:col-span-5 space-y-6">
          {/* Duplicate Detection Alert Card */}
          <div className="bg-navy-900 border border-navy-800 rounded-2xl p-5 shadow-lg">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
                <AlertTriangle className="w-4 h-4" /> {t.reportForm.nearbyTitle}
              </span>
              <span className="text-[11px] text-slate-400">
                {checkingNearby ? 'Scanning GPS...' : `${nearbyReports.length} nearby`}
              </span>
            </div>
            <p className="text-xs text-slate-400 mb-4">
              {t.reportForm.nearbyDesc}
            </p>

            <div className="space-y-2.5 max-h-56 overflow-y-auto pr-1">
              {nearbyReports.length === 0 ? (
                <div className="p-4 rounded-xl bg-navy-950/60 border border-navy-800/80 text-center text-xs text-slate-500">
                  No duplicate complaints found within 800m. Your report will be treated as primary incident!
                </div>
              ) : (
                nearbyReports.map((rep) => (
                  <div
                    key={rep.id}
                    className="p-3 rounded-xl bg-navy-950 border border-navy-800 hover:border-navy-700 transition-colors"
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[11px] font-mono font-bold text-cyan-400">
                        {rep.referenceNumber}
                      </span>
                      <span className="text-[10px] text-slate-400">
                        {(rep.distanceKm * 1000).toFixed(0)}m away
                      </span>
                    </div>
                    <p className="text-xs font-semibold text-slate-200 line-clamp-1 mb-2">
                      {rep.title}
                    </p>
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] text-slate-400">
                        {rep.corroborationCount} community confirmations
                      </span>
                      <button
                        type="button"
                        onClick={() => handleCorroborate(rep.id, rep.referenceNumber)}
                        className="px-2.5 py-1 rounded bg-teal-500/15 hover:bg-teal-500/25 border border-teal-500/30 text-teal-300 text-[10px] font-bold flex items-center gap-1 transition-colors"
                      >
                        <ThumbsUp className="w-3 h-3" />
                        <span>Corroborate (+5%)</span>
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Citizen's Reported Issues & Status Verification */}
          <div className="bg-navy-900 border border-navy-800 rounded-2xl p-5 shadow-lg">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-bold text-white uppercase tracking-wider">
                {t.citizen.myIssues}
              </h2>
              <button
                onClick={fetchMyReports}
                className="text-xs text-cyan-400 hover:underline"
              >
                Refresh
              </button>
            </div>

            <div className="space-y-3 max-h-72 overflow-y-auto pr-1">
              {myReports.length === 0 ? (
                <div className="p-4 text-center text-xs text-slate-500">
                  {t.citizen.noIssues}
                </div>
              ) : (
                myReports.map((r) => (
                  <div
                    key={r.id}
                    className="p-3.5 rounded-xl bg-navy-950 border border-navy-800 space-y-2 text-left"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-mono font-bold text-cyan-400">
                        {r.referenceNumber}
                      </span>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded border ${
                          r.status === 'CITIZEN_REVIEW'
                            ? 'bg-teal-500/20 text-teal-300 border-teal-500/30 animate-pulse'
                            : 'bg-navy-800 text-slate-300 border-navy-700'
                        }`}
                      >
                        {r.status}
                      </span>
                    </div>

                    <p className="text-xs font-bold text-slate-200 line-clamp-1">
                      {r.title}
                    </p>

                    {/* If Citizen Review is required, show verification prompt button! */}
                    {r.status === 'CITIZEN_REVIEW' && (
                      <div className="pt-2 border-t border-navy-800/80 flex items-center justify-between">
                        <span className="text-[11px] text-teal-400 font-semibold">
                          Work marked resolved! Please verify:
                        </span>
                        <button
                          onClick={() => {
                            setReviewingReport(r);
                            setReviewAction('CONFIRM');
                          }}
                          className="px-3 py-1 rounded bg-teal-500 hover:bg-teal-400 text-navy-950 text-xs font-black shadow-sm transition-all"
                        >
                          Verify Resolution
                        </button>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Citizen Verification Modal (Requirement: Citizen verifies or rejects/reopens) */}
      {reviewingReport && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-950/80 backdrop-blur-sm animate-fadeIn">
          <div className="bg-navy-900 border border-teal-500/40 rounded-2xl max-w-lg w-full p-6 shadow-2xl relative text-left">
            <button
              onClick={() => setReviewingReport(null)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white"
            >
              ✕
            </button>

            <span className="text-xs font-mono font-bold text-cyan-400 px-2 py-0.5 rounded bg-cyan-500/10 border border-cyan-500/30">
              {reviewingReport.referenceNumber}
            </span>
            <h3 className="text-lg font-bold text-white mt-1 mb-2">
              {t.citizen.verifyResolution}
            </h3>

            {reviewingReport.resolutionSummary && (
              <div className="bg-navy-950 p-3 rounded-xl border border-navy-800 text-xs text-slate-300 mb-4">
                <span className="text-slate-400 block font-semibold mb-0.5">Field Officer Resolution Report:</span>
                "{reviewingReport.resolutionSummary}"
              </div>
            )}

            {/* Toggle Action: Confirm vs Reopen */}
            <div className="grid grid-cols-2 gap-2 mb-4">
              <button
                type="button"
                onClick={() => setReviewAction('CONFIRM')}
                className={`py-2 text-xs font-bold rounded-xl border transition-all ${
                  reviewAction === 'CONFIRM'
                    ? 'bg-teal-500/20 border-teal-500 text-teal-300'
                    : 'bg-navy-950 border-navy-800 text-slate-400'
                }`}
              >
                ✓ {t.citizen.confirmSatisfied}
              </button>
              <button
                type="button"
                onClick={() => setReviewAction('REOPEN')}
                className={`py-2 text-xs font-bold rounded-xl border transition-all ${
                  reviewAction === 'REOPEN'
                    ? 'bg-rose-500/20 border-rose-500 text-rose-300'
                    : 'bg-navy-950 border-navy-800 text-slate-400'
                }`}
              >
                ✕ {t.citizen.reopenIssue}
              </button>
            </div>

            {reviewAction === 'CONFIRM' ? (
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    {t.citizen.ratingPrompt}
                  </label>
                  <div className="flex items-center gap-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setRating(star)}
                        className={`p-2 rounded-lg border text-sm font-bold ${
                          star <= rating
                            ? 'bg-amber-500/20 border-amber-500 text-amber-400'
                            : 'bg-navy-950 border-navy-800 text-slate-500'
                        }`}
                      >
                        ★ {star}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Feedback / Commendation Comment (Optional)
                  </label>
                  <textarea
                    rows={2}
                    placeholder="Good speed, clean work site..."
                    value={feedbackComment}
                    onChange={(e) => setFeedbackComment(e.target.value)}
                    className="w-full px-3 py-2 bg-navy-950 border border-navy-700 rounded-lg text-xs text-white"
                  />
                </div>
              </div>
            ) : (
              <div>
                <label className="block text-xs font-semibold text-rose-400 mb-1">
                  Reason for Rejecting & Reopening:
                </label>
                <textarea
                  rows={3}
                  required
                  placeholder={t.citizen.reopenReasonPlaceholder}
                  value={reopenReason}
                  onChange={(e) => setReopenReason(e.target.value)}
                  className="w-full px-3 py-2 bg-navy-950 border border-navy-700 rounded-lg text-xs text-white placeholder-slate-500"
                />
              </div>
            )}

            <button
              onClick={handleCitizenVerification}
              className="w-full mt-6 py-2.5 rounded-xl bg-gradient-to-r from-teal-500 to-cyan-400 text-navy-950 font-black text-xs uppercase tracking-wider shadow-lg transition-transform hover:scale-[1.01]"
            >
              {t.citizen.submitFeedback}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
