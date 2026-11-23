'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useApp } from '@/context/AppContext';
import {
  Users,
  Shield,
  Truck,
  Building2,
  Lock,
  Mail,
  KeyRound,
  CheckCircle2,
  X,
  ExternalLink,
  Sparkles,
  ArrowRight,
  LogOut,
} from 'lucide-react';

const PRESET_ROLES = [
  {
    role: 'CITIZEN' as const,
    name: 'Citizen Portal',
    email: 'citizen@aidgrid.gov.bd',
    fullName: 'Rahim Ahmed',
    description: 'Public issue reporting, interactive map pinning, duplicate detection, and citizen resolution review.',
    icon: Users,
    badge: 'Resident Access',
    badgeColor: 'border-cyan-400/40 text-cyan-300 bg-cyan-500/15',
  },
  {
    role: 'FIELD_OFFICER' as const,
    name: 'Field Officer',
    email: 'officer@aidgrid.gov.bd',
    fullName: 'Kamal Hossain (Alpha-1 Lead)',
    description: 'Field response queue, acknowledge work orders, progress tracking, and photographic completion verification.',
    icon: Truck,
    badge: 'Field Operations',
    badgeColor: 'border-sky-400/40 text-sky-300 bg-sky-500/15',
  },
  {
    role: 'DEPARTMENT_MANAGER' as const,
    name: 'Department Manager',
    email: 'manager@dncc.gov.bd',
    fullName: 'Engr. Nazmul Haque (DNCC Roads)',
    description: 'Resource management, cross-department coordination, team capacity, and SLA compliance oversight.',
    icon: Building2,
    badge: 'Operations Lead',
    badgeColor: 'border-teal-400/40 text-teal-300 bg-teal-500/15',
  },
  {
    role: 'SYSTEM_ADMIN' as const,
    name: 'System Administrator',
    email: 'admin@aidgrid.gov.bd',
    fullName: 'Tariqul Islam (System Admin)',
    description: 'Full administrative authority, A02 decision weight tuning, A07 automated workflow recovery, and audit trails.',
    icon: Shield,
    badge: 'Full Authority',
    badgeColor: 'border-indigo-400/40 text-indigo-300 bg-indigo-500/15',
  },
];

export default function SignInModal() {
  const {
    user,
    isSignInModalOpen,
    setIsSignInModalOpen,
    loginAsJudgeRole,
    loginWithCredentials,
    logout,
  } = useApp();

  const [activeTab, setActiveTab] = useState<'presets' | 'credentials'>('presets');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('password123');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isSignInModalOpen) return null;

  const handleRoleClick = async (role: any) => {
    setLoading(true);
    setErrorMsg(null);
    try {
      await loginAsJudgeRole(role);
      setIsSignInModalOpen(false);
    } catch (e: any) {
      setErrorMsg(e.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const handleCredentialsSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg(null);
    const result = await loginWithCredentials(email, password);
    setLoading(false);
    if (result.success) {
      setIsSignInModalOpen(false);
    } else {
      setErrorMsg(result.error || 'Invalid credentials');
    }
  };

  const autofill = (demoEmail: string) => {
    setEmail(demoEmail);
    setPassword('password123');
    setActiveTab('credentials');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-fadeIn">
      <div className="glass-pane-chrome glass-rim rounded-3xl max-w-2xl w-full p-6 shadow-2xl relative text-left overflow-hidden border border-white/15">
        {/* Close Button */}
        <button
          onClick={() => setIsSignInModalOpen(false)}
          className="absolute top-5 right-5 text-slate-400 hover:text-white p-1.5 rounded-full bg-white/5 hover:bg-white/10 transition-colors z-20"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-2 mb-1.5">
          <span className="px-3 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-cyan-500/15 text-cyan-300 border border-cyan-400/30">
            Authentication Gate
          </span>
          <span className="text-xs text-slate-400 font-medium">AidGrid Unified Access</span>
        </div>
        <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight flex items-center gap-2">
          Sign In for the 4 Roles
          <Sparkles className="w-5 h-5 text-cyan-400 animate-pulse hidden sm:inline" />
        </h2>
        <p className="text-xs text-slate-300 mt-1 mb-5">
          Select any of the 4 civic operational roles below for instant sign-in, or authenticate with custom credentials.
        </p>

        {/* Current Active Session Status */}
        {user && (
          <div className="mb-4 p-3 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-full bg-cyan-500/20 border border-cyan-400/40 flex items-center justify-center text-xs font-bold text-cyan-300">
                {user.fullName.charAt(0)}
              </div>
              <div>
                <p className="text-xs font-bold text-white leading-tight">
                  {user.fullName}
                </p>
                <span className="text-[10px] font-bold text-cyan-400 uppercase tracking-wider">
                  Active Role: {user.role.replace('_', ' ')}
                </span>
              </div>
            </div>
            <button
              onClick={() => logout()}
              className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs text-slate-300 transition-colors"
            >
              <LogOut className="w-3 h-3 text-rose-400" />
              <span>Sign Out</span>
            </button>
          </div>
        )}

        {/* Tab Switcher */}
        <div className="flex items-center gap-2 mb-4 p-1 rounded-2xl bg-black/30 border border-white/10 w-fit">
          <button
            onClick={() => setActiveTab('presets')}
            className={`px-4 py-1.5 text-xs font-bold rounded-xl transition-all ${
              activeTab === 'presets'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-400/30 shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            4 Roles 1-Click Sign In
          </button>
          <button
            onClick={() => setActiveTab('credentials')}
            className={`px-4 py-1.5 text-xs font-bold rounded-xl transition-all ${
              activeTab === 'credentials'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-400/30 shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Email & Password Sign In
          </button>
        </div>

        {errorMsg && (
          <div className="p-3 mb-4 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs font-semibold">
            ✕ {errorMsg}
          </div>
        )}

        {/* Tab 1: 4 Roles 1-Click Sign In Cards */}
        {activeTab === 'presets' ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[50vh] overflow-y-auto pr-1">
            {PRESET_ROLES.map((item) => {
              const Icon = item.icon;
              const isCurrent = user?.role === item.role;
              return (
                <div
                  key={item.role}
                  className={`p-4 rounded-2xl border transition-all flex flex-col justify-between text-left jellyfish-interactive ${
                    isCurrent
                      ? 'bg-cyan-500/10 border-cyan-400/50 shadow-md'
                      : 'bg-black/25 border-white/10 hover:border-cyan-500/30'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-full border ${item.badgeColor}`}>
                        {item.badge}
                      </span>
                      {isCurrent && (
                        <span className="flex items-center gap-1 text-[10px] font-bold text-emerald-400">
                          <CheckCircle2 className="w-3 h-3" />
                          <span>Active</span>
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-2 mb-1.5">
                      <div className="p-1.5 rounded-xl bg-white/5 border border-white/10 text-cyan-400">
                        <Icon className="w-4 h-4" />
                      </div>
                      <h4 className="text-sm font-black text-white">{item.name}</h4>
                    </div>

                    <p className="text-[11px] text-slate-300 leading-snug mb-2 line-clamp-2">
                      {item.description}
                    </p>

                    <p className="text-[10px] font-mono text-slate-400 truncate mb-3">
                      {item.email}
                    </p>
                  </div>

                  <button
                    onClick={() => handleRoleClick(item.role)}
                    disabled={loading}
                    className="w-full py-2 px-3 rounded-xl btn-jellyfish text-xs font-black uppercase tracking-wider flex items-center justify-center gap-1.5"
                  >
                    <span>Sign In as {item.name.split(' ')[0]}</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                </div>
              );
            })}
          </div>
        ) : (
          /* Tab 2: Standard Email & Password Form */
          <form onSubmit={handleCredentialsSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-black uppercase tracking-wider text-slate-300 mb-1.5">
                Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  placeholder="name@aidgrid.gov.bd"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-3 py-2.5 bg-black/30 border border-white/10 rounded-2xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-black uppercase tracking-wider text-slate-300 mb-1.5">
                Password
              </label>
              <div className="relative">
                <KeyRound className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  required
                  placeholder="Enter password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-3 py-2.5 bg-black/30 border border-white/10 rounded-2xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400"
                />
              </div>
            </div>

            {/* Quick Autofill Pills */}
            <div className="pt-1">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5">
                Quick autofill demo account:
              </span>
              <div className="flex flex-wrap gap-1.5 text-[10px]">
                {PRESET_ROLES.map((r) => (
                  <button
                    key={r.email}
                    type="button"
                    onClick={() => autofill(r.email)}
                    className="px-2.5 py-1 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 transition-colors"
                  >
                    {r.name.split(' ')[0]}
                  </button>
                ))}
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-4 py-3 rounded-2xl btn-jellyfish text-xs font-black uppercase tracking-wider shadow-lg flex items-center justify-center gap-2"
            >
              <Lock className="w-3.5 h-3.5" />
              <span>{loading ? 'Authenticating...' : 'Sign In with Credentials'}</span>
            </button>
          </form>
        )}

        <div className="mt-4 pt-3 border-t border-white/10 flex items-center justify-between text-[11px] text-slate-400">
          <span>Demo password for all 4 roles: <strong className="text-cyan-300 font-mono">password123</strong></span>
          <Link
            href="/login"
            onClick={() => setIsSignInModalOpen(false)}
            className="text-cyan-400 hover:underline flex items-center gap-1 font-bold"
          >
            <span>Full Sign-In Page</span>
            <ExternalLink className="w-3 h-3" />
          </Link>
        </div>
      </div>
    </div>
  );
}
