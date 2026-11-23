'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useApp } from '@/context/AppContext';
import {
  Users,
  Shield,
  Truck,
  Building2,
  Lock,
  Mail,
  Eye,
  EyeOff,
  Check,
  Sparkles,
  ArrowRight,
  MapPin,
} from 'lucide-react';

const PRESET_ROLES = [
  {
    role: 'SYSTEM_ADMIN' as const,
    name: 'Admin',
    fullName: 'Tariqul Islam',
    email: 'admin@aidgrid.gov.bd',
    icon: Shield,
    badge: 'System Admin',
    desc: 'Full operational authority & A02/A07 controls',
  },
  {
    role: 'DEPARTMENT_MANAGER' as const,
    name: 'Manager',
    fullName: 'Engr. Nazmul Haque',
    email: 'manager@dncc.gov.bd',
    icon: Building2,
    badge: 'DNCC Roads Lead',
    desc: 'Department workload & team capacity oversight',
  },
  {
    role: 'FIELD_OFFICER' as const,
    name: 'Field Lead',
    fullName: 'Kamal Hossain',
    email: 'officer@aidgrid.gov.bd',
    icon: Truck,
    badge: 'Alpha-1 Dispatch',
    desc: 'Field response queue & work resolution proof',
  },
  {
    role: 'CITIZEN' as const,
    name: 'Citizen',
    fullName: 'Rahim Ahmed',
    email: 'citizen@aidgrid.gov.bd',
    icon: Users,
    badge: 'Mirpur Resident',
    desc: 'Civic issue reporting & GIS map pinning',
  },
];

export default function LoginPage() {
  const router = useRouter();
  const { user, loginAsJudgeRole, loginWithCredentials } = useApp();

  const [email, setEmail] = useState('admin@aidgrid.gov.bd');
  const [password, setPassword] = useState('password123');
  const [showPassword, setShowPassword] = useState(false);
  const [selectedRole, setSelectedRole] = useState<'SYSTEM_ADMIN' | 'DEPARTMENT_MANAGER' | 'FIELD_OFFICER' | 'CITIZEN'>('SYSTEM_ADMIN');
  const [statusMsg, setStatusMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isMelting, setIsMelting] = useState(false);
  const [isDone, setIsDone] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Mouse interaction for metaball hero
  const stageRef = useRef<HTMLDivElement>(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePos({
        x: (e.clientX / window.innerWidth - 0.5) * 24,
        y: (e.clientY / window.innerHeight - 0.5) * 18,
      });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  // Handle Quick Role Select
  const handleSelectRole = (r: typeof PRESET_ROLES[0]) => {
    setSelectedRole(r.role);
    setEmail(r.email);
    setPassword('password123');
    setErrorMsg(null);
  };

  // Perform Sign-In & Smooth Transition to Dashboard
  const handleSignIn = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (submitting) return;

    if (!email) {
      setErrorMsg('Please enter your account email.');
      return;
    }
    if (!password) {
      setErrorMsg('Please enter your password.');
      return;
    }

    setSubmitting(true);
    setErrorMsg(null);
    setStatusMsg('Signing you in...');
    setIsMelting(true);

    try {
      // Authenticate via credentials
      const res = await loginWithCredentials(email, password);
      if (res.success) {
        setIsDone(true);
        setStatusMsg('Welcome back!');
        // Liquid melt completion then smooth transition to dashboard
        setTimeout(() => {
          router.push('/');
        }, 800);
      } else {
        setIsMelting(false);
        setIsDone(false);
        setSubmitting(false);
        setStatusMsg('');
        setErrorMsg(res.error || 'Authentication failed. Please verify credentials.');
      }
    } catch (err: any) {
      setIsMelting(false);
      setIsDone(false);
      setSubmitting(false);
      setStatusMsg('');
      setErrorMsg(err.message || 'Network error during sign-in.');
    }
  };

  // One-click Instant Login as specific role
  const handle1ClickRoleLogin = async (role: typeof PRESET_ROLES[0]['role']) => {
    if (submitting) return;
    setSubmitting(true);
    setSelectedRole(role);
    setStatusMsg(`Authenticating as ${role.replace('_', ' ')}...`);
    setIsMelting(true);

    try {
      const res = await loginAsJudgeRole(role);
      if (res?.success !== false) {
        setIsDone(true);
        setStatusMsg('Welcome back!');
        setTimeout(() => {
          router.push('/');
        }, 800);
      } else {
        setIsMelting(false);
        setIsDone(false);
        setSubmitting(false);
        setStatusMsg('');
        setErrorMsg(res.error || 'Role login failed.');
      }
    } catch (err: any) {
      setIsMelting(false);
      setIsDone(false);
      setSubmitting(false);
      setStatusMsg('');
      setErrorMsg(err.message || 'Error switching role.');
    }
  };

  return (
    <div className="relative min-h-screen w-full flex items-center justify-center p-4 sm:p-6 overflow-hidden">
      {/* Code & Chill Flow SVG Filters Defs */}
      <svg className="absolute w-0 h-0" aria-hidden="true">
        <defs>
          <filter id="flowGoo">
            <feGaussianBlur in="SourceGraphic" stdDeviation="7" result="b" />
            <feColorMatrix in="b" mode="matrix" values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 19 -9" result="goo" />
            <feBlend in="SourceGraphic" in2="goo" />
          </filter>
          <linearGradient id="flowLiquidGrad" x1="0" y1="0" x2="0.4" y2="1">
            <stop offset="0%" stopColor="#00d1ff" />
            <stop offset="52%" stopColor="#0ea5e9" />
            <stop offset="100%" stopColor="#2563eb" />
          </linearGradient>
          <radialGradient id="flowGlossGrad" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#ffffff" stopOpacity="0.85" />
            <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
          </radialGradient>
        </defs>
      </svg>

      {/* Ambient Backdrop Canvas */}
      <div className="flow-ambient">
        <div className="wall-orb wall-orb-1" style={{ width: '700px', height: '700px', top: '-150px', left: '15%' }}></div>
        <div className="wall-orb wall-orb-2" style={{ width: '650px', height: '650px', bottom: '-200px', right: '10%' }}></div>
      </div>

      <main className="relative z-10 w-full max-w-md mx-auto flex flex-col items-center">
        {/* ===================== THE LIQUID HERO ===================== */}
        {/* Living cluster of metaballs that breathe and react to cursor movement */}
        <div
          ref={stageRef}
          className="w-48 h-36 flex items-center justify-center mb-2 transition-transform duration-300 ease-out pointer-events-none"
          style={{
            transform: `translate3d(${mousePos.x}px, ${mousePos.y}px, 0)`,
            filter: 'drop-shadow(0 20px 35px rgba(0, 209, 255, 0.45))',
          }}
        >
          <svg className="w-full h-full" viewBox="0 0 240 200">
            <g filter="url(#flowGoo)" fill="url(#flowLiquidGrad)">
              <circle cx="120" cy="100" r="36" />
              <circle cx="100" cy="90" r="26" />
              <circle cx="140" cy="90" r="24" />
              <circle cx="120" cy="120" r="26" />
              <circle cx="110" cy="105" r="22" />
            </g>
            {/* Specular gloss sheen */}
            <ellipse cx="106" cy="82" rx="24" ry="14" fill="url(#flowGlossGrad)" />
            <circle cx="140" cy="78" r="4" fill="#ffffff" />
          </svg>
        </div>

        {/* ===================== THE FLOW CARD ===================== */}
        <section className="flow-card w-full p-6 sm:p-7 text-left">
          {/* Brand Header */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-cyan-400 to-blue-600 flex items-center justify-center text-navy-950 font-black text-xs shadow-md shadow-cyan-500/30">
                AG
              </div>
              <div>
                <h1 className="text-sm font-black tracking-wider text-white">AIDGRID</h1>
                <span className="text-[10px] text-cyan-400 font-bold uppercase tracking-wider block">
                  FLOW V2.6
                </span>
              </div>
            </div>

            <div className="text-[10px] text-slate-400 flex items-center gap-1 font-mono">
              <MapPin className="w-3 h-3 text-cyan-400" />
              <span>Dhaka Pilot</span>
            </div>
          </div>

          <h2 className="text-xl font-black text-white tracking-tight mb-1">
            Sign In to AidGrid
          </h2>
          <p className="text-xs text-slate-300 mb-4">
            Public issues. Accountable action. Enter credentials or select an operational role.
          </p>

          {/* 4 Roles One-Click Selector Pills (Flow style) */}
          <div className="mb-4">
            <span className="text-[10px] font-black uppercase tracking-wider text-cyan-400 block mb-1.5">
              1-Click Role Access:
            </span>
            <div className="grid grid-cols-4 gap-1.5">
              {PRESET_ROLES.map((r) => {
                const isSelected = selectedRole === r.role;
                return (
                  <button
                    key={r.role}
                    type="button"
                    onClick={() => handleSelectRole(r)}
                    className={`py-2 px-1 rounded-xl text-center border transition-all duration-200 flex flex-col items-center justify-center ${
                      isSelected
                        ? 'bg-cyan-500/20 border-cyan-400 text-cyan-200 shadow-md shadow-cyan-500/25 scale-[1.03]'
                        : 'bg-black/30 border-white/10 text-slate-400 hover:border-cyan-500/40 hover:text-slate-200'
                    }`}
                  >
                    <span className="text-[11px] font-black leading-tight block">{r.name}</span>
                    <span className="text-[9px] text-slate-400 font-normal truncate max-w-full">
                      {r.role.split('_')[0]}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {errorMsg && (
            <div className="p-3 mb-4 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs font-semibold animate-fadeIn">
              ✕ {errorMsg}
            </div>
          )}

          {/* Flow Input Form */}
          <form onSubmit={handleSignIn} className="space-y-3.5">
            {/* Email Field with Floating Label */}
            <div className="flow-field">
              <input
                id="email"
                type="email"
                required
                placeholder=" "
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              <label htmlFor="email">Account Email</label>
            </div>

            {/* Password Field with Floating Label & Reveal Eye */}
            <div className="flow-field">
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                required
                placeholder=" "
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <label htmlFor="password">Password</label>

              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white p-1"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>

            {/* Status Message */}
            {statusMsg && (
              <p className="text-xs font-bold text-cyan-300 text-center animate-pulse pt-1">
                {statusMsg}
              </p>
            )}

            {/* Flow Submit Button (Melts into checkmark) */}
            <button
              type="submit"
              disabled={submitting}
              className={`flow-btn w-full py-3.5 mt-2 flex items-center justify-center gap-2 text-xs uppercase tracking-wider ${
                isMelting ? 'is-melting' : ''
              } ${isDone ? 'is-done' : ''}`}
            >
              {isDone ? (
                <>
                  <Check className="w-4 h-4" />
                  <span>Authenticated</span>
                </>
              ) : submitting ? (
                <span>Verifying...</span>
              ) : (
                <>
                  <span>Sign In & Enter Dashboard</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Direct 1-Click Instant Sign-In Button */}
          <div className="mt-4 pt-3 border-t border-white/10 flex items-center justify-between text-[11px] text-slate-400">
            <span>Instant Access:</span>
            <button
              type="button"
              onClick={() => handle1ClickRoleLogin(selectedRole)}
              disabled={submitting}
              className="text-cyan-400 hover:text-cyan-300 font-bold hover:underline flex items-center gap-1"
            >
              <span>Instant Enter as {selectedRole.replace('_', ' ')}</span>
              <Sparkles className="w-3 h-3 text-cyan-400" />
            </button>
          </div>
        </section>
      </main>
    </div>
  );
}
