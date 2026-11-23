'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useApp } from '@/context/AppContext';
import {
  LayoutDashboard,
  FilePlus,
  ListFilter,
  MapPin,
  Truck,
  Cpu,
  GitBranch,
  BarChart3,
  FileText,
  PhoneCall,
} from 'lucide-react';

export default function Sidebar() {
  const pathname = usePathname();
  const { t, user, loginAsJudgeRole, setShowEmergencyModal, setIsSignInModalOpen } = useApp();

  const navigation = [
    {
      name: t.nav.overview,
      href: '/',
      icon: LayoutDashboard,
      badge: null,
    },
    {
      name: t.nav.citizenPortal,
      href: '/citizen',
      icon: FilePlus,
      badge: null, // Removed citizen word box per user instruction
    },
    {
      name: t.nav.reports,
      href: '/reports',
      icon: ListFilter,
      badge: null,
    },
    {
      name: t.nav.liveMap,
      href: '/map',
      icon: MapPin,
      badge: 'GIS',
    },
    {
      name: t.nav.fieldOps,
      href: '/field-ops',
      icon: Truck,
      badge: user?.role === 'FIELD_OFFICER' ? 'Active' : null,
    },
    {
      name: t.nav.decisionIntelligence,
      href: '/decision',
      icon: Cpu,
      badge: null, // Removed A02 word box per user instruction
    },
    {
      name: t.nav.workflowCenter,
      href: '/workflow',
      icon: GitBranch,
      badge: null, // Removed A07 word box per user instruction
    },
    {
      name: t.nav.analytics,
      href: '/analytics',
      icon: BarChart3,
      badge: null,
    },
    {
      name: t.nav.auditLogs,
      href: '/audit',
      icon: FileText,
      badge: null,
    },
  ];

  return (
    <aside className="w-64 p-3 pl-4 hidden md:flex flex-col justify-between shrink-0">
      {/* Floating Liquid Glass Dock */}
      <div className="glass-pane glass-rim p-3.5 rounded-3xl space-y-4">
        {/* Workspaces Menu */}
        <div>
          <div className="text-[10px] font-black uppercase tracking-widest text-slate-400 px-3 mb-2 flex items-center justify-between">
            <span>Workspaces</span>
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse"></span>
          </div>

          <nav className="space-y-1">
            {navigation.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`group relative flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all duration-300 ease-[cubic-bezier(0.34,1.45,0.55,1)] ${
                    isActive
                      ? 'glass-lens text-white shadow-lg shadow-cyan-500/20 translate-x-1'
                      : 'text-slate-300 hover:text-white hover:bg-white/5 hover:translate-x-1'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className={`w-4 h-4 transition-transform group-hover:scale-110 ${isActive ? 'text-cyan-300' : 'text-slate-400'}`} />
                    <span className="tracking-wide">{item.name}</span>
                  </div>

                  {item.badge && (
                    <span className="text-[9px] font-black uppercase px-2 py-0.5 rounded-full bg-white/10 text-slate-300">
                      {item.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Evaluator Role & Pilot Switcher (Switched directly into the mini taskbar) */}
        <div className="pt-3 border-t border-white/10 space-y-2.5">
          {/* Header Row */}
          <div className="flex items-center justify-between text-[11px]">
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-teal-400 animate-pulse"></span>
              <span className="font-bold text-white tracking-wide">AIDGRID</span>
              <span className="text-[8px] font-black uppercase px-1.5 py-0.2 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-400/30">
                PANE V2.6
              </span>
            </div>

            <button
              onClick={() => setShowEmergencyModal(true)}
              className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-rose-500/15 hover:bg-rose-500/25 border border-rose-500/30 text-rose-300 text-[10px] font-bold transition-colors"
            >
              <PhoneCall className="w-2.5 h-2.5 text-rose-400" />
              <span>999</span>
            </button>
          </div>

          {/* Active Role Pill */}
          <div className="flex items-center justify-between text-[10px] px-2.5 py-1 rounded-xl bg-white/5 border border-white/10">
            <span className="text-slate-400 font-medium">Active Role:</span>
            <span className="font-black text-cyan-300 uppercase tracking-wider">
              {user?.role.replace('_', ' ') || 'SYSTEM ADMIN'}
            </span>
          </div>

          {/* Pilot Coverage Row */}
          <div className="text-[10px] text-slate-400 flex items-center gap-1 leading-tight">
            <MapPin className="w-3 h-3 text-cyan-400 shrink-0" />
            <span>Pilot: <strong className="text-slate-200">Dhaka DNCC & DSCC (Zones 1-5)</strong></span>
          </div>

          {/* Switch Evaluator Role Section */}
          <div className="space-y-1 pt-1">
            <div className="flex items-center justify-between text-[9px] font-black uppercase tracking-wider text-cyan-400">
              <span>4 ROLES SIGN IN:</span>
              <button
                onClick={() => setIsSignInModalOpen(true)}
                className="hover:underline text-[9px] lowercase font-normal text-slate-400 hover:text-cyan-300"
              >
                manage
              </button>
            </div>
            <div className="grid grid-cols-2 gap-1 text-[10px]">
              <button
                onClick={() => loginAsJudgeRole('SYSTEM_ADMIN')}
                className={`py-1 px-2 rounded-lg font-bold border transition-all text-center jellyfish-interactive ${
                  user?.role === 'SYSTEM_ADMIN'
                    ? 'bg-cyan-500/25 border-cyan-400 text-cyan-200 shadow-sm shadow-cyan-500/20'
                    : 'bg-white/5 border-white/10 text-slate-300 hover:border-cyan-500/40 hover:text-white'
                }`}
              >
                Admin
              </button>
              <button
                onClick={() => loginAsJudgeRole('DEPARTMENT_MANAGER')}
                className={`py-1 px-2 rounded-lg font-bold border transition-all text-center jellyfish-interactive ${
                  user?.role === 'DEPARTMENT_MANAGER'
                    ? 'bg-cyan-500/25 border-cyan-400 text-cyan-200 shadow-sm shadow-cyan-500/20'
                    : 'bg-white/5 border-white/10 text-slate-300 hover:border-cyan-500/40 hover:text-white'
                }`}
              >
                Manager
              </button>
              <button
                onClick={() => loginAsJudgeRole('FIELD_OFFICER')}
                className={`py-1 px-2 rounded-lg font-bold border transition-all text-center jellyfish-interactive ${
                  user?.role === 'FIELD_OFFICER'
                    ? 'bg-cyan-500/25 border-cyan-400 text-cyan-200 shadow-sm shadow-cyan-500/20'
                    : 'bg-white/5 border-white/10 text-slate-300 hover:border-cyan-500/40 hover:text-white'
                }`}
              >
                Field Lead
              </button>
              <button
                onClick={() => loginAsJudgeRole('CITIZEN')}
                className={`py-1 px-2 rounded-lg font-bold border transition-all text-center jellyfish-interactive ${
                  user?.role === 'CITIZEN'
                    ? 'bg-cyan-500/25 border-cyan-400 text-cyan-200 shadow-sm shadow-cyan-500/20'
                    : 'bg-white/5 border-white/10 text-slate-300 hover:border-cyan-500/40 hover:text-white'
                }`}
              >
                Citizen
              </button>
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
}
