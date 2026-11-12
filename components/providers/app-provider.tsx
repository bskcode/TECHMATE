'use client';

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { CheckCircle2, AlertTriangle, Info, X, ShieldAlert } from 'lucide-react';
import type { Profile, UserRole } from '@/types';

interface ToastItem {
  id: string;
  title?: string;
  message: string;
  type: 'success' | 'error' | 'info' | 'warning';
}

interface ConfirmOptions {
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: 'danger' | 'primary';
}

interface AppContextValue {
  profiles: Profile[];
  activeFaculty: Profile;
  activeStudent: Profile;
  getActiveUser: (role: UserRole) => Profile;
  setActiveUser: (profile: Profile) => void;
  toast: (message: string, type?: ToastItem['type'], title?: string) => void;
  confirmAction: (options: ConfirmOptions) => Promise<boolean>;
}

const DEFAULT_FACULTY: Profile = {
  id: '00000000-0000-0000-0000-000000000001',
  email: 'faculty@adaptivelearn.ai',
  full_name: 'Dr. Aris Thorne',
  role: 'faculty',
  avatar_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
  institution: 'Smart Institute of Technology',
  created_at: '',
};

const DEFAULT_STUDENT: Profile = {
  id: '00000000-0000-0000-0000-000000000101',
  email: 'student1@adaptivelearn.ai',
  full_name: 'Branden Harris',
  role: 'student',
  avatar_url: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150',
  institution: 'Smart Institute of Technology',
  created_at: '',
};

const AppContext = createContext<AppContextValue | null>(null);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [profiles, setProfiles] = useState<Profile[]>([DEFAULT_FACULTY, DEFAULT_STUDENT]);
  const [activeFaculty, setActiveFaculty] = useState<Profile>(DEFAULT_FACULTY);
  const [activeStudent, setActiveStudent] = useState<Profile>(DEFAULT_STUDENT);
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const [confirmState, setConfirmState] = useState<{
    options: ConfirmOptions;
    resolve: (value: boolean) => void;
  } | null>(null);

  useEffect(() => {
    async function loadProfiles() {
      try {
        const res = await fetch('/api/profiles');
        const data = await res.json();
        if (data.success && Array.isArray(data.profiles) && data.profiles.length > 0) {
          setProfiles(data.profiles);

          const savedFacultyId = localStorage.getItem('adaptivelearn_faculty_id');
          const savedStudentId = localStorage.getItem('adaptivelearn_student_id');

          const fac =
            data.profiles.find((p: Profile) => p.id === savedFacultyId && p.role === 'faculty') ||
            data.profiles.find((p: Profile) => p.role === 'faculty');
          const stu =
            data.profiles.find((p: Profile) => p.id === savedStudentId && p.role === 'student') ||
            data.profiles.find((p: Profile) => p.role === 'student');

          if (fac) setActiveFaculty(fac);
          if (stu) setActiveStudent(stu);
        }
      } catch {
        // Fallback to defaults
      }
    }
    loadProfiles();
  }, []);

  const getActiveUser = useCallback(
    (role: UserRole) => (role === 'faculty' ? activeFaculty : activeStudent),
    [activeFaculty, activeStudent]
  );

  const setActiveUser = useCallback((profile: Profile) => {
    if (profile.role === 'faculty') {
      setActiveFaculty(profile);
      localStorage.setItem('adaptivelearn_faculty_id', profile.id);
    } else {
      setActiveStudent(profile);
      localStorage.setItem('adaptivelearn_student_id', profile.id);
    }
  }, []);

  const toast = useCallback((message: string, type: ToastItem['type'] = 'info', title?: string) => {
    const id = `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
    setToasts((prev) => [...prev, { id, title, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4500);
  }, []);

  const confirmAction = useCallback((options: ConfirmOptions) => {
    return new Promise<boolean>((resolve) => {
      setConfirmState({ options, resolve });
    });
  }, []);

  const handleConfirmClose = (result: boolean) => {
    if (confirmState) {
      confirmState.resolve(result);
      setConfirmState(null);
    }
  };

  return (
    <AppContext.Provider
      value={{
        profiles,
        activeFaculty,
        activeStudent,
        getActiveUser,
        setActiveUser,
        toast,
        confirmAction,
      }}
    >
      {children}

      {/* Global Toast Stack */}
      <div className="fixed bottom-5 right-5 z-[100] flex flex-col space-y-2 max-w-sm w-full pointer-events-none">
        {toasts.map((t) => {
          const styles = {
            success: 'bg-emerald-950 text-white border-emerald-700',
            error: 'bg-rose-950 text-white border-rose-700',
            warning: 'bg-amber-950 text-white border-amber-700',
            info: 'bg-[#2C1F52] text-white border-[#4E3982]',
          }[t.type];
          const Icon = {
            success: CheckCircle2,
            error: ShieldAlert,
            warning: AlertTriangle,
            info: Info,
          }[t.type];
          return (
            <div
              key={t.id}
              className={`pointer-events-auto flex items-start space-x-3 p-3.5 rounded-2xl border shadow-xl text-xs animate-fadeIn ${styles}`}
            >
              <Icon className="w-4 h-4 shrink-0 mt-0.5" />
              <div className="flex-1">
                {t.title && <p className="font-bold mb-0.5">{t.title}</p>}
                <p className="leading-relaxed opacity-95">{t.message}</p>
              </div>
              <button
                onClick={() => setToasts((prev) => prev.filter((x) => x.id !== t.id))}
                className="opacity-70 hover:opacity-100"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          );
        })}
      </div>

      {/* Global Confirm Modal */}
      {confirmState && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[110] flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 space-y-4">
            <h3 className="text-base font-extrabold text-gray-900">{confirmState.options.title}</h3>
            <p className="text-xs text-gray-600 leading-relaxed">{confirmState.options.message}</p>
            <div className="flex items-center justify-end space-x-2 pt-2">
              <button
                onClick={() => handleConfirmClose(false)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-gray-700 bg-gray-100 hover:bg-gray-200 transition-colors"
              >
                {confirmState.options.cancelLabel || 'Cancel'}
              </button>
              <button
                onClick={() => handleConfirmClose(true)}
                className={`px-4 py-2 rounded-xl text-xs font-bold text-white transition-colors ${
                  confirmState.options.variant === 'danger'
                    ? 'bg-rose-600 hover:bg-rose-700'
                    : 'bg-[#3E2D68] hover:bg-[#312254]'
                }`}
              >
                {confirmState.options.confirmLabel || 'Confirm'}
              </button>
            </div>
          </div>
        </div>
      )}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used inside AppProvider');
  return ctx;
}

