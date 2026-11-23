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
  ExternalLink,
  Sparkles,
} from 'lucide-react';

export default function Sidebar() {
  const pathname = usePathname();
  const { t, user } = useApp();

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
      badge: 'Citizen',
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
      badge: 'A02',
    },
    {
      name: t.nav.workflowCenter,
      href: '/workflow',
      icon: GitBranch,
      badge: 'A07',
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
      <div className="glass-pane glass-rim p-4 rounded-3xl space-y-6">
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
                    <span
                      className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-full ${
                        item.badge === 'A02' || item.badge === 'A07'
                          ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-400/40 shadow-sm'
                          : 'bg-white/10 text-slate-300'
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Open311 Interoperability Glass Pill */}
        <div className="pt-3 border-t border-white/10">
          <div className="text-[10px] font-black uppercase tracking-widest text-slate-400 px-3 mb-2">
            Interoperability
          </div>
          <a
            href="/api/open311/v2/services"
            target="_blank"
            rel="noreferrer"
            className="flex items-center justify-between px-3 py-2 rounded-xl text-xs text-slate-300 hover:text-cyan-300 hover:bg-white/5 transition-all"
          >
            <span className="font-medium">Open311 v2 API</span>
            <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
          </a>
        </div>
      </div>

      {/* Floating Bottom Card */}
      <div className="glass-pane glass-rim p-3.5 rounded-2xl text-xs space-y-1 mt-4">
        <div className="flex items-center justify-between">
          <p className="font-black text-white tracking-wide">CODE-ARENAX</p>
          <span className="text-[9px] font-bold text-teal-400 px-1.5 py-0.2 rounded-full bg-teal-400/10 border border-teal-400/30">
            2026
          </span>
        </div>
        <p className="text-cyan-400 font-semibold text-[11px]">World Problem Solver</p>
        <p className="text-slate-400 text-[10px]">A02 & A07 Intelligent Systems</p>
      </div>
    </aside>
  );
}
