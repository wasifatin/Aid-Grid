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
  Settings,
  HelpCircle,
  ExternalLink,
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
      badge: user?.role === 'FIELD_OFFICER' ? 'Assigned' : null,
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
    <aside className="w-64 border-r border-navy-800 bg-navy-950 min-h-[calc(100vh-4rem)] flex flex-col justify-between p-4 hidden md:flex shrink-0">
      <div className="space-y-6">
        <div>
          <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 px-3 mb-2">
            Operations & Portals
          </div>
          <nav className="space-y-1">
            {navigation.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                    isActive
                      ? 'bg-gradient-to-r from-cyan-500/20 to-teal-500/10 text-cyan-400 border border-cyan-500/30 font-semibold'
                      : 'text-slate-300 hover:bg-navy-850 hover:text-white'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className={`w-4 h-4 ${isActive ? 'text-cyan-400' : 'text-slate-400'}`} />
                    <span>{item.name}</span>
                  </div>
                  {item.badge && (
                    <span
                      className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                        item.badge === 'A02' || item.badge === 'A07'
                          ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                          : 'bg-navy-800 text-slate-300'
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

        {/* Open311 GeoReport API Link */}
        <div className="pt-4 border-t border-navy-800">
          <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 px-3 mb-2">
            Interoperability
          </div>
          <a
            href="/api/open311/v2/services"
            target="_blank"
            rel="noreferrer"
            className="flex items-center justify-between px-3 py-2 rounded-lg text-xs text-slate-300 hover:bg-navy-850 hover:text-cyan-400 transition-colors"
          >
            <span>Open311 GeoReport v2 API</span>
            <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
          </a>
        </div>
      </div>

      {/* Track & Hackathon Footer Info */}
      <div className="p-3 bg-navy-900/80 rounded-xl border border-navy-800 text-xs space-y-1">
        <p className="font-bold text-slate-200">CODE-ARENAX 2026</p>
        <p className="text-cyan-400 font-medium">World Problem Solver Track</p>
        <p className="text-slate-400 text-[11px]">Declared: A02 & A07 Engine</p>
      </div>
    </aside>
  );
}
