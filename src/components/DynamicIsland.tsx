'use client';

import React, { useState } from 'react';
import { useApp } from '@/context/AppContext';
import {
  Activity,
  Shield,
  PhoneCall,
  Bell,
  ChevronDown,
  ChevronUp,
  MapPin,
  Sparkles,
} from 'lucide-react';

export default function DynamicIsland() {
  const { user, lang, t, loginAsJudgeRole, setShowEmergencyModal } = useApp();
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="fixed top-3 left-1/2 -translate-x-1/2 z-40 transition-all duration-500 ease-[cubic-bezier(0.34,1.45,0.55,1)]">
      <div
        className={`glass-capsule glass-rim flex flex-col items-center overflow-hidden transition-all duration-400 ease-[cubic-bezier(0.34,1.45,0.55,1)] ${
          expanded ? 'px-6 py-4 rounded-3xl w-[420px]' : 'px-4 py-2 rounded-full w-auto'
        }`}
      >
        {/* Compact View */}
        <div className="flex items-center gap-3 w-full justify-between">
          {/* Heartbeat Status Indicator */}
          <div className="flex items-center gap-2">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-teal-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-teal-400"></span>
            </span>
            <span className="text-xs font-bold text-white tracking-wide flex items-center gap-1.5">
              AIDGRID
              <span className="text-[10px] uppercase font-bold px-1.5 py-0.2 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                PANE v2.6
              </span>
            </span>
          </div>

          {/* Quick Pilot & Role Badge */}
          <div className="flex items-center gap-1.5">
            <span className="text-[11px] font-semibold text-slate-300 hidden sm:inline px-2 py-0.5 rounded-full bg-white/5 border border-white/10">
              {user ? user.role.replace('_', ' ') : 'DEMO'}
            </span>

            {/* Quick Emergency Pill */}
            <button
              onClick={() => setShowEmergencyModal(true)}
              className="flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-rose-500/15 hover:bg-rose-500/25 border border-rose-500/30 text-rose-300 text-[11px] font-bold transition-colors"
            >
              <PhoneCall className="w-2.5 h-2.5 text-rose-400" />
              <span>999</span>
            </button>

            {/* Expand / Collapse Button */}
            <button
              onClick={() => setExpanded(!expanded)}
              className="p-1 rounded-full text-slate-400 hover:text-white transition-colors ml-0.5"
              title="Expand Island Details"
            >
              {expanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            </button>
          </div>
        </div>

        {/* Expanded View */}
        {expanded && (
          <div className="w-full mt-3 pt-3 border-t border-white/10 text-left space-y-3 animate-fadeIn">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-400 flex items-center gap-1.5">
                <MapPin className="w-3 h-3 text-cyan-400" /> Pilot Coverage:
              </span>
              <span className="font-bold text-slate-200">Dhaka DNCC & DSCC (Zones 1-5)</span>
            </div>

            {/* Judge 1-Click Role Switch Pills */}
            <div className="space-y-1.5">
              <span className="text-[10px] font-bold uppercase tracking-wider text-cyan-400 block">
                Switch Evaluator Role:
              </span>
              <div className="grid grid-cols-4 gap-1.5 text-[11px]">
                <button
                  onClick={() => {
                    loginAsJudgeRole('SYSTEM_ADMIN');
                    setExpanded(false);
                  }}
                  className={`py-1 rounded-lg font-bold border transition-all ${
                    user?.role === 'SYSTEM_ADMIN'
                      ? 'bg-purple-600/30 border-purple-500 text-purple-300'
                      : 'bg-white/5 border-white/10 text-slate-300 hover:bg-white/10'
                  }`}
                >
                  Admin
                </button>
                <button
                  onClick={() => {
                    loginAsJudgeRole('DEPARTMENT_MANAGER');
                    setExpanded(false);
                  }}
                  className={`py-1 rounded-lg font-bold border transition-all ${
                    user?.role === 'DEPARTMENT_MANAGER'
                      ? 'bg-blue-600/30 border-blue-500 text-blue-300'
                      : 'bg-white/5 border-white/10 text-slate-300 hover:bg-white/10'
                  }`}
                >
                  Manager
                </button>
                <button
                  onClick={() => {
                    loginAsJudgeRole('FIELD_OFFICER');
                    setExpanded(false);
                  }}
                  className={`py-1 rounded-lg font-bold border transition-all ${
                    user?.role === 'FIELD_OFFICER'
                      ? 'bg-amber-600/30 border-amber-500 text-amber-300'
                      : 'bg-white/5 border-white/10 text-slate-300 hover:bg-white/10'
                  }`}
                >
                  Field Lead
                </button>
                <button
                  onClick={() => {
                    loginAsJudgeRole('CITIZEN');
                    setExpanded(false);
                  }}
                  className={`py-1 rounded-lg font-bold border transition-all ${
                    user?.role === 'CITIZEN'
                      ? 'bg-teal-600/30 border-teal-500 text-teal-300'
                      : 'bg-white/5 border-white/10 text-slate-300 hover:bg-white/10'
                  }`}
                >
                  Citizen
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
