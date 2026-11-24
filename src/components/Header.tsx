'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useApp } from '@/context/AppContext';
import SignInModal from '@/components/SignInModal';
import {
  Globe,
  Shield,
  PhoneCall,
  LogOut,
  ExternalLink,
  LogIn,
  Users,
  Menu,
  X,
  LayoutDashboard,
  FilePlus,
  ListFilter,
  MapPin,
  Truck,
  Cpu,
  GitBranch,
  BarChart3,
  FileText,
} from 'lucide-react';

export default function Header() {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const {
    user,
    lang,
    t,
    setLanguage,
    logout,
    setIsSignInModalOpen,
  } = useApp();

  const navigation = [
    { name: t.nav.overview, href: '/', icon: LayoutDashboard },
    { name: t.nav.citizenPortal, href: '/citizen', icon: FilePlus },
    { name: t.nav.reports, href: '/reports', icon: ListFilter },
    { name: t.nav.liveMap, href: '/map', icon: MapPin },
    { name: t.nav.fieldOps, href: '/field-ops', icon: Truck },
    { name: 'Decision Intelligence', href: '/decision', icon: Cpu },
    { name: 'Workflow Engine', href: '/workflow', icon: GitBranch },
    { name: t.nav.analytics, href: '/analytics', icon: BarChart3 },
    { name: t.nav.auditLogs, href: '/audit', icon: FileText },
  ];

  return (
    <header className="sticky top-0 z-40 px-3 sm:px-4 lg:px-6 pt-3 pb-2">
      {/* Main Floating Glass Top Bar */}
      <div className="max-w-[1600px] w-full mx-auto glass-pane-chrome glass-rim px-4 sm:px-5 h-16 flex items-center justify-between gap-3 rounded-2xl shadow-lg">
        {/* Brand Logo with Glowing Glass Gem */}
        <div className="flex items-center gap-2.5">
          {/* Mobile Menu Hamburger Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-xl bg-white/5 border border-white/10 text-slate-300 hover:text-white"
            aria-label="Toggle Navigation Menu"
          >
            {mobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
          </button>

          <Link href="/" className="flex items-center gap-3 group">
            <div className="relative flex items-center">
              <img
                src="/images/aidgrid-logo.png"
                alt="AIDGRID"
                className="h-7 sm:h-8 w-auto object-contain transition-transform duration-300 group-hover:scale-105 filter drop-shadow-[0_0_12px_rgba(0,209,255,0.45)]"
              />
            </div>
            <span className="text-[9px] uppercase font-bold tracking-widest px-2 py-0.5 rounded-full bg-cyan-500/15 text-cyan-300 border border-cyan-500/30 hidden sm:inline-block">
              PANE V2.6
            </span>
          </Link>
        </div>

        {/* Center Space for Dynamic Island */}
        <div className="flex-1 max-w-sm hidden md:block"></div>

        {/* Right Controls: Bilingual Switcher, 4 Roles Sign In, & User Pill */}
        <div className="flex items-center gap-2 sm:gap-2.5">

          {/* Bilingual Language Switcher (Glass Capsule) */}
          <div className="flex items-center bg-black/30 border border-white/10 rounded-full p-0.5 shadow-inner">
            <button
              onClick={() => setLanguage('en')}
              className={`px-2.5 sm:px-3 py-1 text-xs font-bold rounded-full transition-all ${
                lang === 'en'
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-400/40 shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              EN
            </button>
            <button
              onClick={() => setLanguage('bn')}
              className={`px-2.5 sm:px-3 py-1 text-xs font-bold rounded-full transition-all ${
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

      {/* Mobile Navigation Dropdown Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden mt-2 max-w-[1600px] w-full mx-auto glass-pane-chrome glass-rim p-3 rounded-2xl shadow-2xl modal-pop-in">
          <nav className="grid grid-cols-2 gap-1.5">
            {navigation.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
                    isActive
                      ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-400/40 shadow-sm'
                      : 'text-slate-300 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                  <span className="truncate">{item.name}</span>
                </Link>
              );
            })}
          </nav>
        </div>
      )}

      {/* 4-Role Modal */}
      <SignInModal />
    </header>
  );
}
