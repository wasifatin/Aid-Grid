'use client';

import React, { useState, useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import Header from '@/components/Header';
import Sidebar from '@/components/Sidebar';
import EmergencyModal from '@/components/EmergencyModal';
import CinematicIntro from '@/components/CinematicIntro';

export default function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [showIntro, setShowIntro] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    // Check if intro has played in this browser session or if replay is requested
    if (typeof window !== 'undefined') {
      const introSeen = sessionStorage.getItem('aidgrid_intro_seen');
      const isReplay = window.location.search.includes('intro=replay');
      if (!introSeen || isReplay) {
        setShowIntro(true);
      }
    }
  }, []);

  const handleIntroComplete = () => {
    if (typeof window !== 'undefined') {
      sessionStorage.setItem('aidgrid_intro_seen', 'true');
    }
    setShowIntro(false);
    // After intro finishes: if not authenticated yet, guide user to login page
    const isAuth = typeof window !== 'undefined' ? sessionStorage.getItem('aidgrid_auth_active') : null;
    if (!isAuth && pathname !== '/login') {
      router.replace('/login');
    }
  };

  if (!mounted) {
    return (
      <div className="w-full min-h-screen bg-[#050811] flex items-center justify-center">
        <div className="w-7 h-7 rounded-full border-2 border-cyan-400 border-t-transparent animate-spin" />
      </div>
    );
  }

  if (showIntro) {
    return <CinematicIntro onComplete={handleIntroComplete} />;
  }

  const isLoginPage = pathname === '/login';

  if (isLoginPage) {
    return (
      <main className="w-full min-h-screen flex items-center justify-center p-0 m-0 overflow-x-hidden">
        {children}
      </main>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      {/* Top Glass Navigation */}
      <Header />

      {/* Main Layout Workspace with Floating Side Dock */}
      <div className="flex flex-1 max-w-[1600px] w-full mx-auto px-2 sm:px-4 lg:px-6">
        <Sidebar />
        <main className="flex-1 p-3 sm:p-5 lg:p-6 overflow-x-hidden min-w-0">
          <div key={pathname} className="pane-section-transition w-full">
            {children}
          </div>
        </main>
      </div>

      <EmergencyModal />
    </div>
  );
}
