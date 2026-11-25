'use client';

import React from 'react';
import Link from 'next/link';
import { Eye, Lock, ArrowRight } from 'lucide-react';

interface CitizenReadOnlyNoticeProps {
  title?: string;
  description?: string;
}

/**
 * Displays a consistent read-only access banner for Citizen accounts on
 * operational or document-mutating workspaces.
 */
export default function CitizenReadOnlyNotice({
  title = 'Read-Only Citizen Case Access',
  description = 'Citizen accounts are limited to viewing civic cases and live status updates and cannot create or modify any documents.',
}: CitizenReadOnlyNoticeProps) {
  return (
    <div className="glass-pane glass-rim rounded-3xl p-8 max-w-2xl mx-auto text-center space-y-5 shadow-2xl">
      <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-cyan-500/15 border border-cyan-400/35 text-cyan-300 text-[11px] font-black uppercase tracking-wider">
        <Lock className="w-3.5 h-3.5" />
        <span>Citizen Role — Read-Only Mode</span>
      </div>

      <div className="space-y-2">
        <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
          {title}
        </h2>
        <p className="text-xs sm:text-sm text-slate-300 leading-relaxed max-w-lg mx-auto">
          {description}
        </p>
      </div>

      <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
        <Link
          href="/"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl btn-jellyfish text-xs font-black uppercase tracking-wider"
        >
          <Eye className="w-4 h-4" />
          <span>View Cases Dashboard</span>
        </Link>
        <Link
          href="/reports"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-bold text-slate-200 transition-colors"
        >
          <span>Public Cases Directory</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>
    </div>
  );
}
