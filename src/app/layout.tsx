import type { Metadata } from 'next';
import './globals.css';
import { AppProvider } from '@/context/AppContext';
import AppShell from '@/components/AppShell';

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
          <AppShell>{children}</AppShell>
        </AppProvider>
      </body>
    </html>
  );
}
