'use client';

import React, { useState, useEffect } from 'react';
import { useApp } from '@/context/AppContext';
import { Search, ListFilter, MapPin, Eye, ThumbsUp } from 'lucide-react';

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
    <div className="space-y-6">
      {/* Banner */}
      <div className="bg-gradient-to-r from-navy-900 via-navy-850 to-navy-900 p-6 rounded-2xl border border-navy-800 shadow-xl text-left">
        <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
          Public & Citizen Issues Directory
        </h1>
        <p className="text-slate-400 text-sm mt-1">
          Open civic reporting records. Personal contact information and sensitive private data are protected by system security rules.
        </p>
      </div>

      {/* Search Bar */}
      <div className="bg-navy-900 border border-navy-800 p-4 rounded-xl flex items-center gap-3">
        <Search className="w-4 h-4 text-slate-400" />
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
          <div
            key={r.id}
            onClick={() => setSelectedReport(r)}
            className="bg-navy-900 border border-navy-800 hover:border-navy-700 rounded-2xl p-5 shadow-lg cursor-pointer text-left transition-all flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-mono font-bold text-cyan-400 px-2 py-0.5 rounded bg-cyan-500/10 border border-cyan-500/30">
                  {r.referenceNumber}
                </span>
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-navy-850 border border-navy-700 text-slate-300">
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

            <div className="pt-2 border-t border-navy-800 flex items-center justify-between text-[11px] text-slate-400">
              <span>{r.corroborationCount} community confirmations</span>
              <span className="text-cyan-400 font-semibold flex items-center gap-1">
                <Eye className="w-3.5 h-3.5" /> View
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Modal */}
      {selectedReport && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-950/80 backdrop-blur-sm animate-fadeIn">
          <div className="bg-navy-900 border border-navy-700 rounded-2xl max-w-lg w-full p-6 shadow-2xl relative text-left">
            <button
              onClick={() => setSelectedReport(null)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white"
            >
              ✕
            </button>
            <span className="text-xs font-mono font-bold text-cyan-400 px-2 py-0.5 rounded bg-cyan-500/10 border border-cyan-500/30">
              {selectedReport.referenceNumber}
            </span>
            <h3 className="text-lg font-bold text-white mt-1 mb-2">
              {selectedReport.title}
            </h3>
            <p className="text-xs text-slate-300 leading-relaxed mb-4">
              {selectedReport.description}
            </p>
            <div className="bg-navy-950 p-3 rounded-xl border border-navy-800 text-xs text-slate-300 space-y-1 mb-4">
              <div>Address: <strong className="text-slate-100">{selectedReport.address}</strong></div>
              <div>Category: <strong className="text-slate-100">{selectedReport.category?.name}</strong></div>
              <div>Status: <strong className="text-cyan-400">{selectedReport.status}</strong></div>
              <div>Priority: <strong className="text-rose-400">{selectedReport.priority}</strong></div>
            </div>
            {selectedReport.resolutionSummary && (
              <div className="p-3 rounded-xl bg-teal-500/10 border border-teal-500/30 text-xs text-teal-300 mb-4">
                <strong>Resolution Note:</strong> {selectedReport.resolutionSummary}
              </div>
            )}
            <button
              onClick={() => setSelectedReport(null)}
              className="w-full py-2 rounded-xl bg-navy-800 hover:bg-navy-700 text-white text-xs font-semibold"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
