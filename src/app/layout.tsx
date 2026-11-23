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
      <body className="bg-navy-950 text-slate-100 min-h-screen flex flex-col antialiased">
        <AppProvider>
          <Header />
          <div className="flex flex-1">
            <Sidebar />
            <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full overflow-x-hidden">
              {children}
            </main>
          </div>
          <EmergencyModal />
        </AppProvider>
      </body>
    </html>
  );
}
