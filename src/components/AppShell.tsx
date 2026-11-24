'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import Header from '@/components/Header';
import Sidebar from '@/components/Sidebar';
import EmergencyModal from '@/components/EmergencyModal';

export default function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
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
          {children}
        </main>
      </div>

      <EmergencyModal />
    </div>
  );
}
