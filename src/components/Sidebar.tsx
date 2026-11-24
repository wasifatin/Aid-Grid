'use client';

import React, { useState, useRef } from 'react';
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
  Shield,
  Building2,
  Users,
  Check,
  ChevronUp,
  KeyRound,
} from 'lucide-react';

export default function Sidebar() {
  const pathname = usePathname();
  const { t, user, loginAsJudgeRole, setShowEmergencyModal, setIsSignInModalOpen } = useApp();
  const [roleMenuOpen, setRoleMenuOpen] = useState(false);
  const hoverTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const roles = [
    {
      role: 'SYSTEM_ADMIN' as const,
      name: 'System Admin',
      subtitle: 'System & Security Operations',
      icon: Shield,
      badge: 'Admin',
    },
    {
      role: 'DEPARTMENT_MANAGER' as const,
      name: 'Department Manager',
      subtitle: 'Triage, Assignment & SLA',
      icon: Building2,
      badge: 'Manager',
    },
    {
      role: 'FIELD_OFFICER' as const,
      name: 'Field Lead',
      subtitle: 'On-site Operations & Dispatch',
      icon: Truck,
      badge: 'Field',
    },
    {
      role: 'CITIZEN' as const,
      name: 'Citizen',
      subtitle: 'Public Grievance & Tracking',
      icon: Users,
      badge: 'Citizen',
    },
  ];

  const handleMouseEnter = () => {
    if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current);
    setRoleMenuOpen(true);
  };

  const handleMouseLeave = () => {
    hoverTimeoutRef.current = setTimeout(() => {
      setRoleMenuOpen(false);
    }, 140);
  };

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
    <aside className="w-72 p-3 pl-4 hidden md:flex flex-col shrink-0 sticky top-20 h-[calc(100vh-5.5rem)] pb-4">
      {/* Floating Liquid Glass Dock (Elongated Full Height & Spaced Sections) */}
      <div className="glass-pane glass-rim p-4 rounded-3xl flex flex-col justify-between h-full shadow-2xl relative">
        {/* Workspaces Menu Section */}
        <div className="overflow-y-auto pr-1 flex-1 mb-2 custom-scrollbar">
          <div className="text-[10px] font-black uppercase tracking-widest text-slate-400 px-3 mb-3 flex items-center justify-between">
            <span>Workspaces</span>
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse"></span>
          </div>

          <nav className="space-y-2">
            {navigation.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`group relative flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all duration-300 ease-[cubic-bezier(0.34,1.45,0.55,1)] ${
                    isActive
                      ? 'glass-lens text-white shadow-lg shadow-cyan-500/20 translate-x-1 border border-cyan-400/30'
                      : 'text-slate-300 hover:text-white hover:bg-white/5 hover:translate-x-1'
                  }`}
                >
                  {isActive && (
                    <span className="absolute left-1 top-2 bottom-2 w-1 rounded-full bg-cyan-400 shadow-[0_0_8px_#00d1ff]" />
                  )}
                  <div className="flex items-center gap-3 pl-1">
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

        {/* Evaluator Role & Pilot Switcher Section (Maintained Gap & Elongated) */}
        <div className="mt-auto pt-4 border-t border-white/10 space-y-3">
          {/* Header Row */}
          <div className="flex items-center justify-between text-[11px] px-1">
            <div className="flex items-center gap-1.5">
              <img
                src="/images/aidgrid-emblem.png"
                alt="AIDGRID"
                className="h-4 w-auto object-contain filter drop-shadow-[0_0_8px_rgba(0,209,255,0.4)]"
              />
              <span className="font-bold text-white tracking-wide">AIDGRID</span>
              <span className="text-[8px] font-black uppercase px-1.5 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-400/30">
                PANE V2.6
              </span>
            </div>

            <button
              onClick={() => setShowEmergencyModal(true)}
              className="flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-rose-500/15 hover:bg-rose-500/25 border border-rose-500/30 text-rose-300 text-[10px] font-bold transition-colors shadow-sm"
            >
              <PhoneCall className="w-2.5 h-2.5 text-rose-400" />
              <span>999</span>
            </button>
          </div>

          {/* Pilot Coverage Row */}
          <div className="text-[10px] text-slate-400 flex items-center gap-1.5 px-1 leading-tight">
            <MapPin className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
            <span>Pilot: <strong className="text-slate-200">Dhaka DNCC & DSCC (Zones 1-5)</strong></span>
          </div>

          {/* Bottom Left Corner Role Hover Capsule */}
          <div
            className="relative"
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
          >
            {/* Hovering Menu Bar (Pops up above trigger) */}
            <div
              className={`absolute bottom-full left-0 right-0 mb-2.5 z-50 rounded-2xl p-2 bg-[#0b1222]/98 backdrop-blur-2xl border border-cyan-400/30 shadow-[0_20px_50px_rgba(0,0,0,0.95),0_0_25px_rgba(0,209,255,0.15)] transition-all duration-200 ease-[cubic-bezier(0.16,1,0.3,1)] ${
                roleMenuOpen
                  ? 'opacity-100 translate-y-0 scale-100 pointer-events-auto'
                  : 'opacity-0 translate-y-2 scale-[0.96] pointer-events-none'
              }`}
            >
              {/* Menu Header */}
              <div className="flex items-center justify-between px-2.5 py-1.5 mb-1 border-b border-white/10 text-[9px] font-black uppercase tracking-wider text-slate-400">
                <span className="flex items-center gap-1.5 text-cyan-300">
                  <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
                  Switch Evaluator Role
                </span>
                <span className="text-[8px] font-mono text-slate-500">4 ROLES</span>
              </div>

              {/* Roles List */}
              <div className="space-y-1">
                {roles.map((r) => {
                  const RoleIcon = r.icon;
                  const isCurrent = (user?.role || 'SYSTEM_ADMIN') === r.role;
                  return (
                    <button
                      key={r.role}
                      type="button"
                      onClick={() => {
                        loginAsJudgeRole(r.role);
                        setRoleMenuOpen(false);
                      }}
                      className={`w-full flex items-center justify-between p-2 rounded-xl text-left transition-all duration-150 group ${
                        isCurrent
                          ? 'bg-cyan-500/20 text-white border border-cyan-400/40 shadow-sm shadow-cyan-500/20'
                          : 'hover:bg-white/10 text-slate-300 hover:text-white border border-transparent'
                      }`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div
                          className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${
                            isCurrent
                              ? 'bg-cyan-400 text-navy-950 font-black'
                              : 'bg-white/5 text-slate-300 group-hover:text-cyan-300 group-hover:bg-white/10'
                          }`}
                        >
                          <RoleIcon className="w-3.5 h-3.5" />
                        </div>
                        <div className="min-w-0">
                          <div className="text-xs font-bold truncate leading-tight flex items-center gap-1.5">
                            <span>{r.name}</span>
                            <span className="text-[8px] font-mono px-1.5 py-0.5 rounded bg-white/10 text-slate-300">
                              {r.badge}
                            </span>
                          </div>
                          <p className="text-[9px] text-slate-400 truncate leading-tight mt-0.5">
                            {r.subtitle}
                          </p>
                        </div>
                      </div>

                      {isCurrent && (
                        <Check className="w-4 h-4 text-cyan-400 shrink-0 ml-1.5" />
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Footer Utilities */}
              <div className="mt-1.5 pt-1.5 border-t border-white/10 flex items-center justify-between text-[10px] px-1">
                <button
                  type="button"
                  onClick={() => {
                    setRoleMenuOpen(false);
                    setIsSignInModalOpen(true);
                  }}
                  className="flex items-center gap-1.5 text-slate-400 hover:text-cyan-300 transition-colors py-1 px-1.5 rounded-lg hover:bg-white/5"
                >
                  <KeyRound className="w-3 h-3 text-cyan-400" />
                  <span>Custom Credentials</span>
                </button>
              </div>
            </div>

            {/* Trigger Profile Capsule (Matches video bottom-left row) */}
            <button
              type="button"
              onClick={() => setRoleMenuOpen(!roleMenuOpen)}
              className={`w-full flex items-center justify-between p-2.5 rounded-2xl border transition-all duration-200 group text-left ${
                roleMenuOpen
                  ? 'bg-white/10 border-cyan-400/50 shadow-lg shadow-cyan-500/20'
                  : 'bg-white/5 hover:bg-white/10 border-white/10 hover:border-cyan-400/40'
              }`}
            >
              <div className="flex items-center gap-2.5 min-w-0">
                {/* Avatar with Glow */}
                <div className="relative">
                  <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-cyan-400 via-sky-500 to-indigo-600 flex items-center justify-center text-navy-950 font-black text-xs shadow-md shadow-cyan-500/30 shrink-0">
                    {user?.fullName?.charAt(0) || 'S'}
                  </div>
                  <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-teal-400 border-2 border-[#0e1628] shadow-sm" />
                </div>

                <div className="min-w-0">
                  <div className="text-xs font-black text-white truncate leading-tight group-hover:text-cyan-200 transition-colors">
                    {user?.fullName || 'Sayeed Rahman'}
                  </div>
                  <div className="text-[10px] font-bold text-cyan-400 truncate uppercase tracking-wider leading-tight flex items-center gap-1 mt-0.5">
                    <span>{user?.role?.replace('_', ' ') || 'SYSTEM ADMIN'}</span>
                  </div>
                </div>
              </div>

              <ChevronUp
                className={`w-4 h-4 transition-transform duration-200 shrink-0 ${
                  roleMenuOpen ? 'rotate-180 text-cyan-400' : 'text-slate-400 group-hover:text-white'
                }`}
              />
            </button>
          </div>
        </div>
      </div>
    </aside>
  );
}
