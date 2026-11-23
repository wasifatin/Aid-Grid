'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { translations, Language } from '@/lib/translations';

export interface UserSession {
  id: string;
  email: string;
  fullName: string;
  role: 'CITIZEN' | 'FIELD_OFFICER' | 'DEPARTMENT_MANAGER' | 'SYSTEM_ADMIN';
  departmentId?: string | null;
  departmentName?: string | null;
  teamId?: string | null;
  teamName?: string | null;
  serviceZoneId?: string | null;
  serviceZoneName?: string | null;
  preferredLang?: string;
}

interface AppContextType {
  user: UserSession | null;
  lang: Language;
  t: typeof translations['en'];
  setLanguage: (lang: Language) => void;
  loginAsJudgeRole: (role: 'CITIZEN' | 'FIELD_OFFICER' | 'DEPARTMENT_MANAGER' | 'SYSTEM_ADMIN') => Promise<any>;
  loginWithCredentials: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  setUser: (user: UserSession | null) => void;
  isSignInModalOpen: boolean;
  setIsSignInModalOpen: (open: boolean) => void;
  showEmergencyModal: boolean;
  setShowEmergencyModal: (show: boolean) => void;
  toastMessage: string | null;
  showToast: (msg: string) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserSession | null>(null);
  const [lang, setLang] = useState<Language>('en');
  const [isSignInModalOpen, setIsSignInModalOpen] = useState<boolean>(false);
  const [showEmergencyModal, setShowEmergencyModal] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const t = translations[lang];

  useEffect(() => {
    // Permanent Dark Liquid Glass Theme
    if (typeof window !== 'undefined') {
      localStorage.removeItem('aidgrid_theme');
      document.documentElement.classList.remove('light');
      document.documentElement.classList.add('dark');
    }

    // Check initial session
    fetch('/api/auth/me')
      .then((res) => res.json())
      .then((data) => {
        if (data.user) {
          setUser(data.user);
          if (data.user.preferredLang === 'bn') {
            setLang('bn');
          }
        } else {
          // If not authenticated, prompt sign-in gate first
          setUser(null);
          if (typeof window !== 'undefined' && window.location.pathname !== '/login') {
            window.location.href = '/login';
          }
        }
      })
      .catch(() => {
        setUser(null);
        if (typeof window !== 'undefined' && window.location.pathname !== '/login') {
          window.location.href = '/login';
        }
      });
  }, []);

  const setLanguage = (newLang: Language) => {
    setLang(newLang);
    localStorage.setItem('aidgrid_lang', newLang);
  };

  const showToast = (msg: string) => {
    // Suppress intrusive UI popups per user request
    console.log('[AidGrid Notification]', msg);
  };

  const loginAsJudgeRole = async (role: 'CITIZEN' | 'FIELD_OFFICER' | 'DEPARTMENT_MANAGER' | 'SYSTEM_ADMIN') => {
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ judgeRole: role }),
      });
      const data = await res.json();
      if (data.user) {
        setUser(data.user);
        showToast(`Authenticated as: ${t.roles[role]} (${data.user.fullName})`);
        return { success: true };
      }
      return { success: false, error: data.error };
    } catch (e: any) {
      console.error(e);
      return { success: false, error: e.message || 'Login failed' };
    }
  };

  const loginWithCredentials = async (email: string, password: string) => {
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (data.success && data.user) {
        setUser(data.user);
        showToast(`Signed in successfully as ${data.user.fullName}!`);
        return { success: true };
      }
      return { success: false, error: data.error || 'Invalid credentials' };
    } catch (e: any) {
      console.error(e);
      return { success: false, error: e.message || 'Network error during sign-in' };
    }
  };

  const logout = async () => {
    await fetch('/api/auth/login', { method: 'DELETE' });
    setUser(null);
    showToast('Signed out of session.');
    if (typeof window !== 'undefined') {
      window.location.href = '/login';
    }
  };

  return (
    <AppContext.Provider
      value={{
        user,
        lang,
        t,
        setLanguage,
        loginAsJudgeRole,
        loginWithCredentials,
        logout,
        setUser,
        isSignInModalOpen,
        setIsSignInModalOpen,
        showEmergencyModal,
        setShowEmergencyModal,
        toastMessage,
        showToast,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used within an AppProvider');
  return context;
}
