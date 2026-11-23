'use client';

import React from 'react';
import Link from 'next/link';
import { useApp } from '@/context/AppContext';
import SignInModal from '@/components/SignInModal';
import {
  Globe,
  Shield,
  PhoneCall,
  LogOut,
  ExternalLink,
  Sparkles,
  Sun,
  Moon,
  LogIn,
  Users,
} from 'lucide-react';

export default function Header() {
  const {
    user,
    lang,
    t,
    setLanguage,
    theme,
    toggleTheme,
    logout,
    setIsSignInModalOpen,
    toastMessage,
  } = useApp();

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

        {/* Right Controls: Theme Toggle, Bilingual Switcher, 4 Roles Sign In, & User Pill */}
        <div className="flex items-center gap-2.5">
          {/* Light / Dark Mode Toggle */}
          <button
            onClick={toggleTheme}
            title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            className="p-2 rounded-xl bg-black/20 hover:bg-black/30 border border-white/10 text-slate-300 hover:text-white transition-colors"
          >
            {theme === 'dark' ? (
              <Sun className="w-4 h-4 text-cyan-400" />
            ) : (
              <Moon className="w-4 h-4 text-slate-700" />
            )}
          </button>

          {/* Bilingual Language Switcher (Glass Capsule) */}
          <div className="flex items-center bg-black/30 border border-white/10 rounded-full p-0.5 shadow-inner">
            <button
              onClick={() => setLanguage('en')}
              className={`px-3 py-1 text-xs font-bold rounded-full transition-all ${
                lang === 'en'
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-400/40 shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              EN
            </button>
            <button
              onClick={() => setLanguage('bn')}
              className={`px-3 py-1 text-xs font-bold rounded-full transition-all ${
                lang === 'bn'
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-400/40 shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              বাংলা
            </button>
          </div>

          {/* 4 Roles Sign In Trigger Button */}
          <button
            onClick={() => setIsSignInModalOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl btn-jellyfish text-xs font-bold shadow-sm"
          >
            <Users className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Sign In / Roles</span>
            <span className="sm:hidden">Roles</span>
          </button>

          {/* User Profile Glass Pill */}
          {user && (
            <div
              onClick={() => setIsSignInModalOpen(true)}
              className="flex items-center gap-2 pl-2 border-l border-white/10 cursor-pointer group"
              title="Click to Switch Role or Sign Out"
            >
              <div className="w-8 h-8 rounded-full bg-cyan-500/20 border border-cyan-400/40 flex items-center justify-center text-xs font-bold text-cyan-300 shadow-sm group-hover:scale-105 transition-transform">
                {user.fullName.charAt(0)}
              </div>
              <div className="hidden lg:block text-left">
                <p className="text-xs font-bold text-slate-100 truncate max-w-[120px] group-hover:text-cyan-300 transition-colors">
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

      {/* Global 4 Roles Sign In Modal */}
      <SignInModal />
    </header>
  );
}
