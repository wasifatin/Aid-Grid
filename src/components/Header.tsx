'use client';

import React from 'react';
import Link from 'next/link';
import { useApp } from '@/context/AppContext';
import {
  Globe,
  Shield,
  PhoneCall,
  LogOut,
  ExternalLink,
  Sparkles,
} from 'lucide-react';

export default function Header() {
  const { user, lang, t, setLanguage, loginAsJudgeRole, logout, setShowEmergencyModal, toastMessage } = useApp();

  return (
    <header className="sticky top-0 z-30 px-4 sm:px-6 lg:px-8 pt-3 pb-2">
      {/* Toast Notification Banner (Liquid Glass Droplet) */}
      {toastMessage && (
        <div className="max-w-md mx-auto mb-2 glass-pane glass-rim px-4 py-2 text-center text-xs font-bold text-cyan-300 shadow-xl border-cyan-500/40 animate-bounce">
          ✨ {toastMessage}
        </div>
      )}

      {/* Main Floating Glass Top Bar */}
      <div className="max-w-7xl mx-auto glass-pane-chrome glass-rim px-5 h-16 flex items-center justify-between gap-4 rounded-2xl">
        {/* Brand Logo with Glowing Glass Gem */}
        <div className="flex items-center gap-3">
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-cyan-500 via-teal-400 to-indigo-500 flex items-center justify-center text-navy-950 font-black text-base shadow-lg shadow-cyan-500/30 group-hover:scale-105 group-hover:rotate-3 transition-transform">
              AG
            </div>
            <div>
              <span className="text-base font-black tracking-wider text-white flex items-center gap-1.5">
                AIDGRID
                <span className="text-[9px] uppercase font-bold tracking-widest px-1.5 py-0.5 rounded-full bg-cyan-500/15 text-cyan-300 border border-cyan-500/30">
                  PANE
                </span>
              </span>
              <p className="text-[11px] text-slate-400 font-medium hidden sm:block">
                {t.app.tagline}
              </p>
            </div>
          </Link>
        </div>

        {/* Center Space for Dynamic Island */}
        <div className="flex-1 max-w-sm hidden md:block"></div>

        {/* Right Controls: Bilingual Switcher, Judge Role Pill, & Avatar */}
        <div className="flex items-center gap-3">
          {/* Bilingual Language Switcher (Glass Capsule) */}
          <div className="flex items-center bg-black/30 border border-white/10 rounded-full p-0.5 shadow-inner">
            <button
              onClick={() => setLanguage('en')}
              className={`px-3 py-1 text-xs font-bold rounded-full transition-all ${
                lang === 'en'
                  ? 'bg-gradient-to-r from-cyan-500 to-teal-400 text-navy-950 shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              EN
            </button>
            <button
              onClick={() => setLanguage('bn')}
              className={`px-3 py-1 text-xs font-bold rounded-full transition-all ${
                lang === 'bn'
                  ? 'bg-gradient-to-r from-cyan-500 to-teal-400 text-navy-950 shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              বাংলা
            </button>
          </div>

          {/* User Profile Glass Pill */}
          {user && (
            <div className="flex items-center gap-2 pl-2 border-l border-white/10">
              <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-cyan-500/20 to-teal-500/20 border border-cyan-400/40 flex items-center justify-center text-xs font-bold text-cyan-300 shadow-sm">
                {user.fullName.charAt(0)}
              </div>
              <div className="hidden lg:block text-left">
                <p className="text-xs font-bold text-slate-100 truncate max-w-[120px]">
                  {user.fullName.split(' ')[0]}
                </p>
                <span className="text-[10px] font-bold text-cyan-400 uppercase tracking-wider block">
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
