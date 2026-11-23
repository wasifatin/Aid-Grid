'use client';

import React from 'react';
import Link from 'next/link';
import { useApp } from '@/context/AppContext';
import {
  AlertTriangle,
  Globe,
  UserCheck,
  Shield,
  PhoneCall,
  LogOut,
  ExternalLink,
} from 'lucide-react';

export default function Header() {
  const { user, lang, t, setLanguage, loginAsJudgeRole, logout, setShowEmergencyModal, toastMessage } = useApp();

  return (
    <header className="sticky top-0 z-50 border-b border-navy-800 bg-navy-950/95 backdrop-blur-md">
      {/* Toast Notification Banner */}
      {toastMessage && (
        <div className="bg-gradient-to-r from-cyan-600 to-teal-500 text-navy-950 font-medium px-4 py-2 text-center text-sm shadow-md animate-fadeIn">
          {toastMessage}
        </div>
      )}

      {/* Main Top Navigation */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Brand Logo */}
        <div className="flex items-center gap-3">
          <Link href="/" className="flex items-center gap-2 group">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-tr from-cyan-500 to-teal-400 flex items-center justify-center text-navy-950 font-black text-xl shadow-lg shadow-cyan-500/20 group-hover:scale-105 transition-transform">
              AG
            </div>
            <div>
              <span className="text-xl font-black tracking-wider text-white flex items-center gap-1.5">
                AIDGRID
                <span className="text-[10px] uppercase font-bold tracking-widest px-1.5 py-0.5 rounded bg-cyan-500/20 text-cyan-400 border border-cyan-500/30">
                  CIVIC v2.6
                </span>
              </span>
              <p className="text-xs text-slate-400 font-medium hidden sm:block">
                {t.app.tagline}
              </p>
            </div>
          </Link>

          {/* Pilot Area Badge */}
          <div className="hidden lg:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-navy-850 border border-navy-700 text-xs text-slate-300">
            <span className="w-2 h-2 rounded-full bg-teal-450 animate-pulse"></span>
            <span>{t.app.pilotNotice}</span>
          </div>
        </div>

        {/* Center / Right Action Controls */}
        <div className="flex items-center gap-3">
          {/* Emergency 999 Notice Modal Button */}
          <button
            onClick={() => setShowEmergencyModal(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-rose-500/15 border border-rose-500/30 text-rose-300 hover:bg-rose-500/25 transition-colors text-xs font-semibold"
            title="Emergency Services Notice"
          >
            <PhoneCall className="w-3.5 h-3.5 text-rose-400" />
            <span className="hidden md:inline">Emergency? 999</span>
          </button>

          {/* Bilingual Language Switcher */}
          <div className="flex items-center bg-navy-850 border border-navy-700 rounded-lg p-0.5">
            <button
              onClick={() => setLanguage('en')}
              className={`px-2.5 py-1 text-xs font-semibold rounded ${
                lang === 'en'
                  ? 'bg-cyan-500 text-navy-950 shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              EN
            </button>
            <button
              onClick={() => setLanguage('bn')}
              className={`px-2.5 py-1 text-xs font-semibold rounded ${
                lang === 'bn'
                  ? 'bg-cyan-500 text-navy-950 shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              বাংলা
            </button>
          </div>

          {/* Judge Quick-Role Switcher Dropdown / Buttons */}
          <div className="hidden xl:flex items-center gap-1.5 bg-navy-900 border border-navy-700/80 px-2 py-1 rounded-lg">
            <span className="text-[11px] font-bold uppercase tracking-wider text-cyan-400 mr-1 flex items-center gap-1">
              <Shield className="w-3 h-3" /> Judge Role:
            </span>
            <button
              onClick={() => loginAsJudgeRole('SYSTEM_ADMIN')}
              className={`px-2 py-0.5 text-xs rounded font-medium transition-colors ${
                user?.role === 'SYSTEM_ADMIN'
                  ? 'bg-purple-600 text-white font-bold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Admin
            </button>
            <button
              onClick={() => loginAsJudgeRole('DEPARTMENT_MANAGER')}
              className={`px-2 py-0.5 text-xs rounded font-medium transition-colors ${
                user?.role === 'DEPARTMENT_MANAGER'
                  ? 'bg-blue-600 text-white font-bold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Manager
            </button>
            <button
              onClick={() => loginAsJudgeRole('FIELD_OFFICER')}
              className={`px-2 py-0.5 text-xs rounded font-medium transition-colors ${
                user?.role === 'FIELD_OFFICER'
                  ? 'bg-amber-600 text-white font-bold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Field Lead
            </button>
            <button
              onClick={() => loginAsJudgeRole('CITIZEN')}
              className={`px-2 py-0.5 text-xs rounded font-medium transition-colors ${
                user?.role === 'CITIZEN'
                  ? 'bg-teal-600 text-white font-bold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Citizen
            </button>
          </div>

          {/* User Profile Info */}
          {user && (
            <div className="flex items-center gap-2 pl-2 border-l border-navy-800">
              <div className="w-8 h-8 rounded-full bg-navy-800 border border-cyan-500/40 flex items-center justify-center text-xs font-bold text-cyan-400">
                {user.fullName.charAt(0)}
              </div>
              <div className="hidden sm:block text-left">
                <p className="text-xs font-semibold text-slate-200 truncate max-w-[120px]">
                  {user.fullName.split(' ')[0]}
                </p>
                <span className="text-[10px] font-bold text-cyan-400 uppercase tracking-wider">
                  {t.roles[user.role] || user.role}
                </span>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
