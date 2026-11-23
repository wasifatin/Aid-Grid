'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useApp } from '@/context/AppContext';
import PerspectiveCard from '@/components/PerspectiveCard';
import {
  Users,
  Shield,
  Truck,
  Building2,
  Lock,
  Mail,
  KeyRound,
  CheckCircle2,
  ArrowRight,
  Sparkles,
  MapPin,
  Check,
} from 'lucide-react';

const PRESET_ROLES = [
  {
    role: 'CITIZEN' as const,
    name: 'Citizen / Resident',
    email: 'citizen@aidgrid.gov.bd',
    fullName: 'Rahim Ahmed',
    targetHref: '/citizen',
    description: 'Report civic issues, view interactive GIS maps, duplicate corroboration, and verify completed resolutions.',
    icon: Users,
    badge: 'Module A Access',
    badgeColor: 'border-cyan-400/40 text-cyan-300 bg-cyan-500/15',
  },
  {
    role: 'FIELD_OFFICER' as const,
    name: 'Field Response Lead',
    email: 'officer@aidgrid.gov.bd',
    fullName: 'Kamal Hossain (Alpha-1 Lead)',
    targetHref: '/field-ops',
    description: 'Acknowledge work orders, manage dispatch queue, start physical repairs, and upload completion proof.',
    icon: Truck,
    badge: 'Module C Access',
    badgeColor: 'border-sky-400/40 text-sky-300 bg-sky-500/15',
  },
  {
    role: 'DEPARTMENT_MANAGER' as const,
    name: 'Department Manager',
    email: 'manager@dncc.gov.bd',
    fullName: 'Engr. Nazmul Haque (DNCC Roads)',
    targetHref: '/analytics',
    description: 'Cross-department coordination, team capacity, SLA compliance, and emergency escalation management.',
    icon: Building2,
    badge: 'Operations Command',
    badgeColor: 'border-teal-400/40 text-teal-300 bg-teal-500/15',
  },
  {
    role: 'SYSTEM_ADMIN' as const,
    name: 'System Administrator',
    email: 'admin@aidgrid.gov.bd',
    fullName: 'Tariqul Islam (System Admin)',
    targetHref: '/',
    description: 'Full administrative control, A02 decision engine weights calibration, A07 automated workflow recovery, and audit trails.',
    icon: Shield,
    badge: 'System Admin',
    badgeColor: 'border-indigo-400/40 text-indigo-300 bg-indigo-500/15',
  },
];

export default function LoginPage() {
  const router = useRouter();
  const { user, loginAsJudgeRole, loginWithCredentials } = useApp();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('password123');
  const [loadingRole, setLoadingRole] = useState<string | null>(null);
  const [loadingCredentials, setLoadingCredentials] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleQuickLogin = async (roleObj: typeof PRESET_ROLES[0]) => {
    setLoadingRole(roleObj.role);
    setErrorMsg(null);
    try {
      await loginAsJudgeRole(roleObj.role);
      router.push(roleObj.targetHref);
    } catch (e: any) {
      setErrorMsg(e.message || 'Login failed');
    } finally {
      setLoadingRole(null);
    }
  };

  const handleCredentialsSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoadingCredentials(true);
    setErrorMsg(null);
    const res = await loginWithCredentials(email, password);
    setLoadingCredentials(false);
    if (res.success) {
      router.push('/');
    } else {
      setErrorMsg(res.error || 'Invalid credentials');
    }
  };

  const autofill = (demoEmail: string) => {
    setEmail(demoEmail);
    setPassword('password123');
  };

  return (
    <div className="min-h-screen py-10 px-4 max-w-5xl mx-auto space-y-8 perspective-container text-left">
      {/* Brand Header */}
      <div className="glass-pane glass-rim p-6 rounded-3xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="px-3 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-cyan-500/15 text-cyan-300 border border-cyan-400/30">
              Role-Based Authentication
            </span>
            <span className="text-xs text-slate-400 font-medium">
              Pilot Coverage: Dhaka DNCC & DSCC (Zones 1-5)
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight flex items-center gap-2">
            Sign In to AidGrid
            <Sparkles className="w-5 h-5 text-cyan-400 animate-pulse hidden sm:inline" />
          </h1>
          <p className="text-slate-300/80 text-xs sm:text-sm mt-1 max-w-2xl">
            Choose any of the 4 defined operational roles for instant evaluator access, or enter account credentials.
          </p>
        </div>

        {user && (
          <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-cyan-500/20 border border-cyan-400/40 flex items-center justify-center text-xs font-bold text-cyan-300">
              {user.fullName.charAt(0)}
            </div>
            <div>
              <p className="text-xs font-bold text-white leading-tight">
                {user.fullName}
              </p>
              <span className="text-[10px] font-bold text-cyan-400 uppercase tracking-wider block">
                Active: {user.role.replace('_', ' ')}
              </span>
            </div>
            <Link
              href="/"
              className="ml-2 px-3 py-1.5 rounded-xl btn-jellyfish text-xs font-bold"
            >
              Enter Dashboard
            </Link>
          </div>
        )}
      </div>

      {errorMsg && (
        <div className="p-4 rounded-2xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs font-semibold flex items-center justify-between">
          <span>✕ {errorMsg}</span>
          <button onClick={() => setErrorMsg(null)} className="text-rose-400 hover:text-white">✕</button>
        </div>
      )}

      {/* Section 1: 4 Roles 1-Click Cards Grid */}
      <div>
        <div className="flex items-center justify-between mb-3 px-1">
          <h2 className="text-xs font-black uppercase tracking-wider text-cyan-400">
            Option 1 — 1-Click Role Access (Instant Evaluator Switching):
          </h2>
          <span className="text-[11px] text-slate-400 font-mono">No password required</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {PRESET_ROLES.map((item) => {
            const Icon = item.icon;
            const isCurrent = user?.role === item.role;
            const isLoading = loadingRole === item.role;

            return (
              <PerspectiveCard
                key={item.role}
                className={`p-5 flex flex-col justify-between jellyfish-interactive ${
                  isCurrent ? 'border-cyan-400/50 shadow-lg shadow-cyan-500/15' : ''
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className={`text-[9px] font-black uppercase px-2.5 py-0.5 rounded-full border ${item.badgeColor}`}>
                      {item.badge}
                    </span>
                    {isCurrent && (
                      <span className="flex items-center gap-1 text-[10px] font-bold text-emerald-400">
                        <Check className="w-3 h-3" />
                        <span>Active</span>
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-2 mb-2">
                    <div className="p-2 rounded-xl bg-white/5 border border-white/10 text-cyan-400">
                      <Icon className="w-4 h-4" />
                    </div>
                    <h3 className="text-sm font-black text-white">{item.name}</h3>
                  </div>

                  <p className="text-xs font-bold text-slate-300 mb-1.5">{item.fullName}</p>

                  <p className="text-[11px] text-slate-400 leading-relaxed mb-3">
                    {item.description}
                  </p>

                  <div className="p-2 rounded-xl bg-black/20 border border-white/5 text-[10px] font-mono text-slate-400 truncate mb-4">
                    {item.email}
                  </div>
                </div>

                <button
                  onClick={() => handleQuickLogin(item)}
                  disabled={isLoading}
                  className="w-full py-2.5 px-3 rounded-xl btn-jellyfish text-xs font-black uppercase tracking-wider flex items-center justify-center gap-1.5"
                >
                  <span>{isLoading ? 'Authenticating...' : `Sign In as ${item.name.split(' ')[0]}`}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </PerspectiveCard>
            );
          })}
        </div>
      </div>

      {/* Section 2: Standard Email & Password Authentication */}
      <div className="glass-pane glass-rim p-6 rounded-3xl max-w-xl mx-auto shadow-2xl">
        <h2 className="text-sm font-black uppercase tracking-wider text-white mb-1 flex items-center gap-2">
          <Lock className="w-4 h-4 text-cyan-400" />
          <span>Option 2 — Standard Credentials Sign In:</span>
        </h2>
        <p className="text-xs text-slate-400 mb-4">
          Authenticate directly against the database profiles with secure bcrypt password verification.
        </p>

        <form onSubmit={handleCredentialsSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-black uppercase tracking-wider text-slate-300 mb-1.5">
              Account Email
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

          {/* Autofill Pills */}
          <div className="pt-1">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5">
              Fill demo credentials:
            </span>
            <div className="flex flex-wrap gap-2 text-[10px]">
              {PRESET_ROLES.map((r) => (
                <button
                  key={r.email}
                  type="button"
                  onClick={() => autofill(r.email)}
                  className="px-3 py-1 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 font-medium transition-colors"
                >
                  {r.name}
                </button>
              ))}
            </div>
          </div>

          <button
            type="submit"
            disabled={loadingCredentials}
            className="w-full mt-4 py-3 rounded-2xl btn-jellyfish text-xs font-black uppercase tracking-wider shadow-lg flex items-center justify-center gap-2"
          >
            <Lock className="w-3.5 h-3.5" />
            <span>{loadingCredentials ? 'Verifying...' : 'Sign In with Credentials'}</span>
          </button>
        </form>

        <div className="mt-4 pt-3 border-t border-white/10 text-center text-xs text-slate-400">
          Default password for all demo accounts: <strong className="text-cyan-300 font-mono">password123</strong>
        </div>
      </div>
    </div>
  );
}
