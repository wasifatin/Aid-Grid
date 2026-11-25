'use client';

import React, { useState, useEffect } from 'react';
import { useApp } from '@/context/AppContext';
import PerspectiveCard from '@/components/PerspectiveCard';
import CustomDropdown from '@/components/CustomDropdown';
import ModalPortal from '@/components/ModalPortal';
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
  const [isClosing, setIsClosing] = useState(false);

  const handleCloseReview = () => {
    setIsClosing(true);
    setTimeout(() => {
      setReviewingReport(null);
      setIsClosing(false);
    }, 200);
  };

  // Fetch Nearby Duplicates (Stabilized against category switches to eliminate flicker)
  useEffect(() => {
    let isCancelled = false;
    const fetchNearby = async () => {
      try {
        const res = await fetch(`/api/reports/nearby?lat=${latitude}&lng=${longitude}&radius=0.8`);
        const data = await res.json();
        if (!isCancelled) {
          setNearbyReports(data.nearby || []);
          setCheckingNearby(false);
        }
      } catch (e) {
        console.error(e);
        if (!isCancelled) setCheckingNearby(false);
      }
    };

    setCheckingNearby(true);
    const timer = setTimeout(fetchNearby, 300);
    return () => {
      isCancelled = true;
      clearTimeout(timer);
    };
  }, [latitude, longitude]);

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

  // Submit Citizen Verification
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
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Banner */}
      <div className="glass-pane glass-rim p-6 rounded-3xl">
        <div className="flex items-center gap-2 mb-1.5">
          <span className="px-3 py-0.5 rounded-full text-[11px] font-black uppercase tracking-wider bg-teal-500/20 text-teal-300 border border-teal-400/40 shadow-sm">
            {t.citizen.welcome}
          </span>
          <span className="text-xs text-slate-400 font-medium">Mobile-First Citizen Portal</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
          {t.reportForm.title}
        </h1>
        <p className="text-slate-300/80 text-xs sm:text-sm mt-1">
          {t.reportForm.subtitle}
        </p>
      </div>

      {/* Main Grid: Form on Left, Duplicate Detection & My Reports on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Reporting Form */}
        <div className="lg:col-span-7 glass-pane glass-rim p-6 rounded-3xl shadow-xl">
          <form onSubmit={handleSubmitReport} className="space-y-5">
            {/* Category Selector */}
            <div>
              <label className="block text-xs font-black uppercase tracking-wider text-slate-300 mb-2">
                {t.reportForm.categoryLabel} *
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {CATEGORIES_LIST.map((cat) => (
                  <button
                    key={cat.code}
                    type="button"
                    onClick={() => setCategoryId(cat.code)}
                    className={`p-3 rounded-2xl border text-left jellyfish-interactive transition-all ${
                      categoryId === cat.code
                        ? 'bg-cyan-500/20 border-cyan-400 text-cyan-200 shadow-md shadow-cyan-500/20 scale-[1.02]'
                        : 'bg-black/20 border-white/10 text-slate-400 hover:border-cyan-500/40 hover:text-slate-200'
                    }`}
                  >
                    <p className="text-xs font-bold leading-tight truncate">
                      {lang === 'bn' ? cat.nameBn : cat.name}
                    </p>
                    <span className="text-[10px] text-slate-500 font-semibold block mt-1">SLA: {cat.baseSlaHours}h</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Title */}
            <div>
              <label className="block text-xs font-black uppercase tracking-wider text-slate-300 mb-1.5">
                {t.reportForm.titleLabel} *
              </label>
              <input
                type="text"
                required
                placeholder={t.reportForm.titlePlaceholder}
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-4 py-3 bg-black/30 border border-white/10 rounded-2xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 transition-colors shadow-inner"
              />
            </div>

            {/* Description */}
            <div>
              <label className="block text-xs font-black uppercase tracking-wider text-slate-300 mb-1.5">
                {t.reportForm.descLabel} *
              </label>
              <textarea
                required
                rows={3}
                placeholder={t.reportForm.descPlaceholder}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full px-4 py-3 bg-black/30 border border-white/10 rounded-2xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 transition-colors shadow-inner leading-relaxed"
              />
            </div>

            {/* Location Section */}
            <div className="bg-black/25 p-4 rounded-2xl border border-white/10 space-y-3">
              <span className="text-xs font-black uppercase tracking-wider text-cyan-400 flex items-center gap-1.5">
                <MapPin className="w-4 h-4" /> {t.reportForm.locationSection}
              </span>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-400 mb-1">
                    {t.reportForm.zoneLabel}
                  </label>
                  <CustomDropdown
                    options={PILOT_ZONES.map((z) => ({
                      value: z.code,
                      label: lang === 'bn' ? z.nameBn : z.name,
                      sublabel: `GPS: ${z.centerLat}, ${z.centerLng}`,
                    }))}
                    value={selectedZone.code}
                    onChange={handleZoneChange}
                    icon={<MapPin className="w-3.5 h-3.5 text-cyan-400" />}
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-400 mb-1">
                    {t.reportForm.coordsLabel}
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      step="0.0001"
                      value={latitude}
                      onChange={(e) => setLatitude(parseFloat(e.target.value))}
                      className="w-1/2 px-2.5 py-2 bg-black/40 border border-white/10 rounded-xl text-xs text-white"
                    />
                    <input
                      type="number"
                      step="0.0001"
                      value={longitude}
                      onChange={(e) => setLongitude(parseFloat(e.target.value))}
                      className="w-1/2 px-2.5 py-2 bg-black/40 border border-white/10 rounded-xl text-xs text-white"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-400 mb-1">
                  {t.reportForm.addressLabel} *
                </label>
                <input
                  type="text"
                  required
                  placeholder={t.reportForm.addressPlaceholder}
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-black/40 border border-white/10 rounded-xl text-xs text-white placeholder-slate-500"
                />
              </div>
            </div>

            {/* A02 Explainable Factors: Public Safety & People Affected */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-black/25 p-4 rounded-2xl border border-white/10">
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="font-bold text-slate-300">Public Safety Danger (0-100)</span>
                  <span className="font-black text-rose-400">{safetyImpact}</span>
                </div>
                <input
                  type="range"
                  min="10"
                  max="100"
                  value={safetyImpact}
                  onChange={(e) => setSafetyImpact(parseInt(e.target.value, 10))}
                  className="w-full accent-rose-500 cursor-pointer"
                />
                <span className="text-[10px] text-slate-400">A02 30% Weight Factor</span>
              </div>

              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="font-bold text-slate-300">People Affected / Crowd (0-100)</span>
                  <span className="font-black text-cyan-400">{peopleAffected}</span>
                </div>
                <input
                  type="range"
                  min="10"
                  max="100"
                  value={peopleAffected}
                  onChange={(e) => setPeopleAffected(parseInt(e.target.value, 10))}
                  className="w-full accent-cyan-400 cursor-pointer"
                />
                <span className="text-[10px] text-slate-400">A02 15% Weight Factor</span>
              </div>
            </div>

            {/* Photo Evidence URL */}
            <div>
              <label className="block text-xs font-black uppercase tracking-wider text-slate-300 mb-1.5">
                {t.reportForm.photoSection}
              </label>
              <div className="flex gap-2">
                <input
                  type="url"
                  placeholder="Paste photo URL (or leave blank for standard inspection)"
                  value={photoUrl}
                  onChange={(e) => setPhotoUrl(e.target.value)}
                  className="flex-1 px-3.5 py-2.5 bg-black/30 border border-white/10 rounded-2xl text-xs text-white placeholder-slate-500"
                />
                <button
                  type="button"
                  onClick={() => setPhotoUrl('https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?auto=format&fit=crop&w=600&q=80')}
                  className="px-4 py-2.5 bg-white/5 hover:bg-white/10 text-slate-300 text-xs rounded-2xl border border-white/10 font-bold transition-all"
                >
                  Demo Photo
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={submitting}
              className="w-full py-3.5 rounded-2xl btn-jellyfish font-black text-xs uppercase tracking-wider shadow-lg shadow-cyan-500/20 flex items-center justify-center gap-2"
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
          <div className="glass-pane glass-rim p-5 rounded-3xl shadow-xl">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-black uppercase tracking-wider text-amber-300 flex items-center gap-1.5">
                <AlertTriangle className="w-4 h-4" /> {t.reportForm.nearbyTitle}
              </span>
              <span className="text-[11px] text-slate-400 font-semibold">
                {checkingNearby ? 'Scanning GPS...' : `${nearbyReports.length} nearby`}
              </span>
            </div>
            <p className="text-xs text-slate-400 mb-4">
              {t.reportForm.nearbyDesc}
            </p>

            <div className={`space-y-2.5 max-h-56 overflow-y-auto pr-1 transition-opacity duration-300 ${checkingNearby ? 'opacity-70' : 'opacity-100'}`}>
              {nearbyReports.length === 0 ? (
                <div className="p-4 rounded-2xl bg-black/20 border border-white/5 text-center text-xs text-slate-400">
                  No duplicate complaints found within 800m. Your report will be treated as primary incident!
                </div>
              ) : (
                nearbyReports.map((rep) => (
                  <div
                    key={rep.id}
                    className="p-3.5 rounded-2xl bg-black/30 border border-white/10 hover:border-white/20 transition-all text-left"
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[11px] font-mono font-bold text-cyan-300">
                        {rep.referenceNumber}
                      </span>
                      <span className="text-[10px] text-slate-400 font-medium">
                        {(rep.distanceKm * 1000).toFixed(0)}m away
                      </span>
                    </div>
                    <p className="text-xs font-bold text-slate-200 line-clamp-1 mb-2">
                      {rep.title}
                    </p>
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] text-slate-400">
                        {rep.corroborationCount} community confirmations
                      </span>
                      <button
                        type="button"
                        onClick={() => handleCorroborate(rep.id, rep.referenceNumber)}
                        className="px-3 py-1 rounded-full bg-teal-500/15 hover:bg-teal-500/25 border border-teal-500/30 text-teal-300 text-[10px] font-black flex items-center gap-1 transition-all"
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

          {/* Citizen's Reported Issues */}
          <div className="glass-pane glass-rim p-5 rounded-3xl shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-black text-white uppercase tracking-wider">
                {t.citizen.myIssues}
              </h2>
              <button
                onClick={fetchMyReports}
                className="text-xs text-cyan-400 hover:underline font-bold"
              >
                Refresh
              </button>
            </div>

            <div className="space-y-3 max-h-72 overflow-y-auto pr-1">
              {myReports.length === 0 ? (
                <div className="p-4 text-center text-xs text-slate-400">
                  {t.citizen.noIssues}
                </div>
              ) : (
                myReports.map((r) => (
                  <div
                    key={r.id}
                    className="p-3.5 rounded-2xl bg-black/30 border border-white/10 space-y-2 text-left"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-mono font-bold text-cyan-300">
                        {r.referenceNumber}
                      </span>
                      <span
                        className={`text-[10px] font-black px-2.5 py-0.5 rounded-full border ${
                          r.status === 'CITIZEN_REVIEW'
                            ? 'bg-teal-500/20 text-teal-300 border-teal-500/40 animate-pulse'
                            : 'bg-white/5 text-slate-300 border-white/10'
                        }`}
                      >
                        {r.status}
                      </span>
                    </div>

                    <p className="text-xs font-bold text-slate-200 line-clamp-1">
                      {r.title}
                    </p>

                    {r.status === 'CITIZEN_REVIEW' && (
                      <div className="pt-2 border-t border-white/10 flex items-center justify-between">
                        <span className="text-[11px] text-teal-300 font-bold">
                          Work marked resolved! Please verify:
                        </span>
                        <button
                          onClick={() => {
                            setIsClosing(false);
                            setReviewingReport(r);
                            setReviewAction('CONFIRM');
                          }}
                          className="px-3.5 py-1.5 rounded-full bg-gradient-to-r from-teal-400 to-cyan-500 hover:opacity-95 text-navy-950 text-xs font-black shadow-md transition-all hover:scale-105"
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

      {/* Citizen Verification Modal */}
      {reviewingReport && (
        <ModalPortal>
          <div
            onClick={handleCloseReview}
            className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/75 backdrop-blur-md"
          >
            <div
              onClick={(e) => e.stopPropagation()}
              className={`glass-pane-chrome glass-rim rounded-3xl max-w-lg w-full p-6 shadow-2xl max-h-[90vh] overflow-y-auto relative text-left border border-teal-500/30 ${
                isClosing ? 'modal-pop-out' : 'modal-pop-in'
              }`}
            >
              <button
                onClick={handleCloseReview}
                className="absolute top-4 right-4 text-slate-400 hover:text-white p-1 rounded-full bg-white/5 hover:bg-white/10 transition-colors"
              >
                ✕
              </button>

              <span className="text-xs font-mono font-bold text-cyan-300 px-3 py-1 rounded-full bg-cyan-500/15 border border-cyan-400/40">
                {reviewingReport.referenceNumber}
              </span>
              <h3 className="text-lg font-black text-white mt-1 mb-2">
                {t.citizen.verifyResolution}
              </h3>

              {reviewingReport.resolutionSummary && (
                <div className="bg-black/30 p-3.5 rounded-2xl border border-white/10 text-xs text-slate-300 mb-4">
                  <span className="text-slate-400 block font-bold mb-0.5">Field Officer Resolution Report:</span>
                  "{reviewingReport.resolutionSummary}"
                </div>
              )}

              {/* Toggle Action */}
              <div className="grid grid-cols-2 gap-2 mb-4">
                <button
                  type="button"
                  onClick={() => setReviewAction('CONFIRM')}
                  className={`py-2 text-xs font-black rounded-2xl border transition-all ${
                    reviewAction === 'CONFIRM'
                      ? 'bg-teal-500/20 border-teal-400 text-teal-300 shadow-sm'
                      : 'bg-black/20 border-white/10 text-slate-400'
                  }`}
                >
                  ✓ {t.citizen.confirmSatisfied}
                </button>
                <button
                  type="button"
                  onClick={() => setReviewAction('REOPEN')}
                  className={`py-2 text-xs font-black rounded-2xl border transition-all ${
                    reviewAction === 'REOPEN'
                      ? 'bg-rose-500/20 border-rose-400 text-rose-300 shadow-sm'
                      : 'bg-black/20 border-white/10 text-slate-400'
                  }`}
                >
                  ✕ {t.citizen.reopenIssue}
                </button>
              </div>

              {reviewAction === 'CONFIRM' ? (
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1.5">
                      {t.citizen.ratingPrompt}
                    </label>
                    <div className="flex items-center gap-2">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          onClick={() => setRating(star)}
                          className={`p-2.5 rounded-xl border text-sm font-black transition-all ${
                            star <= rating
                              ? 'bg-amber-500/20 border-amber-400 text-amber-300 shadow-sm'
                              : 'bg-black/20 border-white/10 text-slate-500'
                          }`}
                        >
                          ★ {star}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1">
                      Feedback / Commendation Comment (Optional)
                    </label>
                    <textarea
                      rows={2}
                      placeholder="Good speed, clean work site..."
                      value={feedbackComment}
                      onChange={(e) => setFeedbackComment(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-black/30 border border-white/10 rounded-2xl text-xs text-white"
                    />
                  </div>
                </div>
              ) : (
                <div>
                  <label className="block text-xs font-bold text-rose-400 mb-1">
                    Reason for Rejecting & Reopening:
                  </label>
                  <textarea
                    rows={3}
                    required
                    placeholder={t.reportForm.descPlaceholder}
                    value={reopenReason}
                    onChange={(e) => setReopenReason(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-black/30 border border-white/10 rounded-2xl text-xs text-white placeholder-slate-500"
                  />
                </div>
              )}

              <button
                onClick={handleCitizenVerification}
                className="w-full mt-6 py-3 rounded-2xl bg-gradient-to-r from-teal-400 to-cyan-400 text-navy-950 font-black text-xs uppercase tracking-wider shadow-lg transition-transform hover:scale-[1.01]"
              >
                {t.citizen.submitFeedback}
              </button>
            </div>
          </div>
        </ModalPortal>
      )}
    </div>
  );
}
