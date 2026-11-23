'use client';

import React from 'react';
import { useApp } from '@/context/AppContext';
import { AlertTriangle, PhoneCall, X } from 'lucide-react';

export default function EmergencyModal() {
  const { showEmergencyModal, setShowEmergencyModal, t } = useApp();

  if (!showEmergencyModal) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-950/80 backdrop-blur-sm animate-fadeIn">
      <div className="bg-navy-900 border-2 border-rose-500/50 rounded-2xl max-w-lg w-full p-6 shadow-2xl relative text-left">
        <button
          onClick={() => setShowEmergencyModal(false)}
          className="absolute top-4 right-4 text-slate-400 hover:text-white p-1 rounded-lg"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 text-rose-400 mb-4">
          <div className="w-12 h-12 rounded-xl bg-rose-500/20 border border-rose-500/40 flex items-center justify-center">
            <AlertTriangle className="w-6 h-6 text-rose-400" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white">Emergency Services Notice</h3>
            <p className="text-xs text-rose-300 font-medium">Critical Civic Safety Warning</p>
          </div>
        </div>

        <p className="text-slate-300 text-sm leading-relaxed mb-6">
          {t.app.emergencyWarning}
        </p>

        <div className="bg-navy-950 rounded-xl p-4 border border-navy-800 space-y-3 mb-6">
          <div className="flex items-center justify-between">
            <span className="text-sm font-semibold text-slate-200">National Emergency Services (Police, Fire, Ambulance):</span>
            <span className="text-lg font-black text-rose-400 px-3 py-1 rounded bg-rose-500/10 border border-rose-500/20">999</span>
          </div>
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Dhaka Fire Service Command Center:</span>
            <span className="font-mono text-slate-200">+880 2 223355555</span>
          </div>
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>WASA Emergency Clean Water Control:</span>
            <span className="font-mono text-slate-200">16162</span>
          </div>
        </div>

        <button
          onClick={() => setShowEmergencyModal(false)}
          className="w-full py-2.5 rounded-lg bg-navy-800 hover:bg-navy-700 text-white font-semibold text-sm transition-colors border border-navy-700"
        >
          I Understand — Proceed to AidGrid Municipal Portal
        </button>
      </div>
    </div>
  );
}
