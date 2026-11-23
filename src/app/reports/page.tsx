'use client';

import React, { useState, useEffect } from 'react';
import { useApp } from '@/context/AppContext';
import PerspectiveCard from '@/components/PerspectiveCard';
import { Search, ListFilter, MapPin, Eye, ThumbsUp, Sparkles } from 'lucide-react';

export default function PublicReportsPage() {
  const { t, lang } = useApp();
  const [reports, setReports] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedReport, setSelectedReport] = useState<any>(null);

  useEffect(() => {
    fetch(`/api/reports?search=${encodeURIComponent(searchTerm)}&limit=50`)
      .then((res) => res.json())
      .then((data) => setReports(data.reports || []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [searchTerm]);

  return (
    <div className="space-y-6 perspective-container">
      {/* Banner */}
      <div className="glass-pane glass-rim p-6 rounded-3xl text-left">
        <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight flex items-center gap-2">
          Public & Citizen Issues Directory
          <Sparkles className="w-5 h-5 text-cyan-400 hidden sm:inline" />
        </h1>
        <p className="text-slate-300/80 text-xs sm:text-sm mt-1">
          Open civic reporting records. Personal contact information and sensitive private data are protected by system security rules.
        </p>
      </div>

      {/* Search Bar */}
      <div className="glass-pane glass-rim p-3.5 rounded-2xl flex items-center gap-3">
        <Search className="w-4 h-4 text-slate-400 ml-2" />
        <input
          type="text"
          placeholder="Search by reference number, road, or issue type..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full bg-transparent border-none text-xs text-white placeholder-slate-500 focus:outline-none"
        />
      </div>

      {/* Reports Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {reports.map((r) => (
          <PerspectiveCard
            key={r.id}
            onClick={() => setSelectedReport(r)}
            className="p-5 flex flex-col justify-between text-left"
          >
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-mono font-bold text-cyan-300 px-3 py-0.5 rounded-full bg-cyan-500/15 border border-cyan-400/40">
                  {r.referenceNumber}
                </span>
                <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-white/5 border border-white/10 text-slate-300">
                  {r.status}
                </span>
              </div>

              <h3 className="text-sm font-bold text-white line-clamp-2 mb-1.5">
                {r.title}
              </h3>
              <p className="text-xs text-slate-400 line-clamp-2 mb-3">
                {r.description}
              </p>

              <div className="flex items-center gap-1.5 text-xs text-slate-300 mb-2">
                <MapPin className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                <span className="truncate">{r.address}</span>
              </div>
            </div>

            <div className="pt-3 border-t border-white/10 flex items-center justify-between text-[11px] text-slate-400">
              <span>{r.corroborationCount} community confirmations</span>
              <span className="text-cyan-300 font-bold flex items-center gap-1">
                <Eye className="w-3.5 h-3.5" /> View
              </span>
            </div>
          </PerspectiveCard>
        ))}
      </div>

      {/* Modal */}
      {selectedReport && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-fadeIn">
          <div className="glass-pane-chrome glass-rim rounded-3xl max-w-lg w-full p-6 shadow-2xl relative text-left animate-scaleUp">
            <button
              onClick={() => setSelectedReport(null)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white p-1 rounded-full bg-white/5"
            >
              ✕
            </button>
            <span className="text-xs font-mono font-bold text-cyan-300 px-3 py-1 rounded-full bg-cyan-500/15 border border-cyan-400/40">
              {selectedReport.referenceNumber}
            </span>
            <h3 className="text-lg font-black text-white mt-1 mb-2">
              {selectedReport.title}
            </h3>
            <p className="text-xs text-slate-300 leading-relaxed mb-4">
              {selectedReport.description}
            </p>
            <div className="bg-black/30 p-3.5 rounded-2xl border border-white/10 text-xs text-slate-300 space-y-1.5 mb-4">
              <div>Address: <strong className="text-slate-100">{selectedReport.address}</strong></div>
              <div>Category: <strong className="text-slate-100">{selectedReport.category?.name}</strong></div>
              <div>Status: <strong className="text-cyan-300">{selectedReport.status}</strong></div>
              <div>Priority: <strong className="text-rose-400">{selectedReport.priority}</strong></div>
            </div>
            {selectedReport.resolutionSummary && (
              <div className="p-3.5 rounded-2xl bg-teal-500/15 border border-teal-500/30 text-xs text-teal-300 mb-4 font-medium">
                <strong>Resolution Note:</strong> {selectedReport.resolutionSummary}
              </div>
            )}
            <button
              onClick={() => setSelectedReport(null)}
              className="w-full py-2.5 rounded-xl bg-white/10 hover:bg-white/15 text-white text-xs font-bold transition-all"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
