import type { Metadata } from 'next';
import './globals.css';
import { AppProvider } from '@/context/AppContext';
import Header from '@/components/Header';
import Sidebar from '@/components/Sidebar';
import EmergencyModal from '@/components/EmergencyModal';

export const metadata: Metadata = {
  title: 'AIDGRID — Intelligent Civic Problem-Solving & Public Service Intelligence Platform',
  description: 'Public issues. Accountable action. Complete civic reporting, A02 decision intelligence, and A07 persistent automated multi-step workflows.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="text-slate-100 min-h-screen flex flex-col antialiased selection:bg-cyan-500/30 selection:text-cyan-200">
        {/* Ambient Wall Lighting Canvas (Liquid Glass Foundation) */}
        <div className="wall-ambient">
          <div className="wall-orb wall-orb-1"></div>
          <div className="wall-orb wall-orb-2"></div>
          <div className="wall-orb wall-orb-3"></div>
        </div>

        <AppProvider>
          {/* Top Glass Navigation */}
          <Header />

          {/* Main Layout Workspace with Floating Side Dock */}
          <div className="flex flex-1 max-w-[1720px] w-full mx-auto">
            <Sidebar />
            <main className="flex-1 p-3 sm:p-5 lg:p-6 overflow-x-hidden min-w-0">
              {children}
            </main>
          </div>

          <EmergencyModal />
        </AppProvider>
      </body>
    </html>
  );
}
