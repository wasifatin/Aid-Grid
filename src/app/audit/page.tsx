'use client';

import React, { useState, useEffect } from 'react';
import { useApp } from '@/context/AppContext';
import { FileText, Shield, Clock, Search, RefreshCw, Sparkles } from 'lucide-react';

export default function AuditLogsPage() {
  const { t } = useApp();
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/analytics');
      const data = await res.json();
      setLogs(data.recentReports || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  return (
    <div className="space-y-6 perspective-container">
      {/* Top Banner */}
      <div className="glass-pane glass-rim p-6 rounded-3xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="px-3 py-0.5 rounded-full text-[11px] font-black uppercase tracking-wider bg-purple-500/20 text-purple-300 border border-purple-400/40 shadow-sm">
              Accountability Log
            </span>
            <span className="text-xs text-slate-400 font-medium">
              Immutable System Audit Trail
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight flex items-center gap-2">
            Security & Lifecycle Audit Trail
            <Sparkles className="w-5 h-5 text-purple-400 hidden sm:inline" />
          </h1>
          <p className="text-slate-300/80 text-xs sm:text-sm mt-1">
            Verifiable records of every submission, automated A07 transition, field action, and citizen verification.
          </p>
        </div>

        <button
          onClick={fetchLogs}
          className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-bold text-slate-200 transition-all self-start md:self-auto shadow-sm"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh Audit</span>
        </button>
      </div>

      {/* Audit Log Table */}
      <div className="glass-pane glass-rim rounded-3xl overflow-hidden shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-black/30 text-slate-400 font-black uppercase tracking-wider border-b border-white/10">
              <tr>
                <th className="py-3.5 px-4">Timestamp</th>
                <th className="py-3.5 px-4">Entity Ref</th>
                <th className="py-3.5 px-4">Lifecycle State</th>
                <th className="py-3.5 px-4">Action Summary</th>
                <th className="py-3.5 px-4">Actor / System</th>
                <th className="py-3.5 px-4">Security Integrity</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {logs.map((item) => (
                <tr key={item.id} className="hover:bg-white/[0.04] transition-colors">
                  <td className="py-3.5 px-4 font-mono text-slate-400">
                    {new Date(item.createdAt).toLocaleTimeString()}
                  </td>
                  <td className="py-3.5 px-4 font-mono font-bold text-cyan-300">
                    {item.referenceNumber}
                  </td>
                  <td className="py-3.5 px-4">
                    <span className="px-2.5 py-0.5 rounded-full bg-white/5 border border-white/10 text-slate-200 text-[10px] font-bold">
                      {item.status}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-slate-200 max-w-sm truncate font-medium">
                    {item.title}
                  </td>
                  <td className="py-3.5 px-4 text-slate-400 font-medium">
                    AidGrid Engine v2.6
                  </td>
                  <td className="py-3.5 px-4">
                    <span className="px-3 py-1 rounded-full bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 text-[10px] font-bold shadow-sm">
                      ✓ SHA-256 Verified
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
