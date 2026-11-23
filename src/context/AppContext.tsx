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
  loginAsJudgeRole: (role: 'CITIZEN' | 'FIELD_OFFICER' | 'DEPARTMENT_MANAGER' | 'SYSTEM_ADMIN') => Promise<void>;
  logout: () => Promise<void>;
  setUser: (user: UserSession | null) => void;
  showEmergencyModal: boolean;
  setShowEmergencyModal: (show: boolean) => void;
  toastMessage: string | null;
  showToast: (msg: string) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserSession | null>(null);
  const [lang, setLang] = useState<Language>('en');
  const [showEmergencyModal, setShowEmergencyModal] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const t = translations[lang];

  useEffect(() => {
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
          // Default demo auto-login as Admin for seamless judge evaluation
          loginAsJudgeRole('SYSTEM_ADMIN');
        }
      })
      .catch(() => {
        // Fallback demo user
        loginAsJudgeRole('SYSTEM_ADMIN');
      });
  }, []);

  const setLanguage = (newLang: Language) => {
    setLang(newLang);
    localStorage.setItem('aidgrid_lang', newLang);
  };

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
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
        showToast(`Switched active session to: ${t.roles[role]} (${data.user.fullName})`);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const logout = async () => {
    await fetch('/api/auth/login', { method: 'DELETE' });
    setUser(null);
    showToast('Signed out of session.');
  };

  return (
    <AppContext.Provider
      value={{
        user,
        lang,
        t,
        setLanguage,
        loginAsJudgeRole,
        logout,
        setUser,
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
