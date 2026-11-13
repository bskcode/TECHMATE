'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  GraduationCap,
  BookOpen,
  ArrowRight,
  ShieldCheck,
  BrainCircuit,
  Lock,
  Mail,
  CheckCircle2,
  Sparkles,
  ArrowLeft,
  KeyRound,
  UserCheck,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useApp } from '@/components/providers/app-provider';
import type { Profile } from '@/types';

export default function LoginPage() {
  return (
    <React.Suspense
      fallback={
        <div className="min-h-screen bg-[#F4F5FA] flex items-center justify-center">
          <div className="w-8 h-8 border-3 border-[#3E2D68] border-t-transparent rounded-full animate-spin"></div>
        </div>
      }
    >
      <LoginForm />
    </React.Suspense>
  );
}

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialRole = searchParams.get('role') === 'student' ? 'student' : 'faculty';

  const { profiles, setActiveUser, toast } = useApp();

  const [role, setRole] = useState<'faculty' | 'student'>(initialRole);
  const [selectedProfileId, setSelectedProfileId] = useState<string>('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('academic2026');
  const [rememberMe, setRememberMe] = useState(true);
  const [loading, setLoading] = useState(false);

  // Filter profiles for active role
  const facultyProfiles = profiles.filter((p) => p.role === 'faculty');
  const studentProfiles = profiles.filter((p) => p.role === 'student');
  const currentRoleProfiles = role === 'faculty' ? facultyProfiles : studentProfiles;

  // When role changes, pick the first profile
  useEffect(() => {
    const list = role === 'faculty' ? facultyProfiles : studentProfiles;
    if (list.length > 0) {
      const first = list[0];
      setSelectedProfileId(first.id);
      setEmail(first.email);
    }
  }, [role, profiles.length]);

  const handleSelectProfile = (p: Profile) => {
    setSelectedProfileId(p.id);
    setEmail(p.email);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      toast('Please enter or select your academic email.', 'warning');
      return;
    }

    setLoading(true);

    // Find profile by selected ID or entered email
    const matchedProfile =
      currentRoleProfiles.find((p) => p.id === selectedProfileId) ||
      currentRoleProfiles.find((p) => p.email.toLowerCase() === email.toLowerCase()) ||
      currentRoleProfiles[0];

    setTimeout(() => {
      if (matchedProfile) {
        setActiveUser(matchedProfile);
        toast(`Welcome back, ${matchedProfile.full_name}!`, 'success');
        if (role === 'faculty') {
          router.push('/faculty');
        } else {
          router.push('/student');
        }
      } else {
        toast('Account not found for this role.', 'error');
        setLoading(false);
      }
    }, 450);
  };

  const isFaculty = role === 'faculty';

  return (
    <div className="min-h-screen bg-[#F4F5FA] flex flex-col justify-between selection:bg-purple-200">
      {/* Top Header */}
      <header className="p-4 sm:px-8 flex items-center justify-between">
        <Link
          href="/"
          className="inline-flex items-center space-x-2 text-xs font-bold text-gray-500 hover:text-[#3E2D68] transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Landing Page</span>
        </Link>

        <div className="flex items-center space-x-3">
          <img
            src="/logos/rnsit-seal.png"
            alt="RNSIT Seal"
            className="w-9 h-9 object-contain drop-shadow-sm"
          />
          <img
            src="/logos/rnsit-jubilee.jpg"
            alt="RNSIT Jubilee"
            className="h-8 w-auto object-contain drop-shadow-sm"
          />
          <div className="hidden sm:block text-left">
            <span className="text-xs font-bold text-gray-900 block leading-tight">
              RNS Institute of Technology
            </span>
            <span className="text-[10px] text-gray-500 font-semibold">TechMate Portal</span>
          </div>
        </div>
      </header>

      {/* Main Login Card */}
      <div className="max-w-md w-full mx-auto px-4 py-6">
        <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-6 sm:p-8 space-y-6 animate-fadeIn">
          {/* Brand & Heading */}
          <div className="text-center space-y-2">
            <div className="flex items-center justify-center space-x-3 mb-1">
              <img
                src="/logos/rnsit-seal.png"
                alt="RNSIT Seal"
                className="w-14 h-14 object-contain drop-shadow"
              />
              <img
                src="/logos/rnsit-jubilee.jpg"
                alt="RNSIT Jubilee"
                className="h-12 w-auto object-contain drop-shadow"
              />
            </div>
            <div>
              <p className="text-[11px] font-black uppercase tracking-wider text-[#3E2D68]">
                RNS Institute of Technology
              </p>
              <h1 className="text-2xl font-black text-gray-900 tracking-tight">
                TechMate Sign In
              </h1>
            </div>
            <p className="text-xs text-gray-500 font-medium">
              Select your role and authenticate to access your cognitive learning dashboard.
            </p>
          </div>

          {/* Role Switcher Tabs */}
          <div className="grid grid-cols-2 p-1.5 bg-[#F4F5FA] rounded-2xl gap-1">
            <button
              type="button"
              onClick={() => setRole('faculty')}
              className={`flex items-center justify-center space-x-2 py-2.5 rounded-xl text-xs font-bold transition-all ${
                isFaculty
                  ? 'bg-white text-[#3E2D68] shadow-sm'
                  : 'text-gray-500 hover:text-gray-900'
              }`}
            >
              <GraduationCap className="w-4 h-4" />
              <span>Faculty Portal</span>
            </button>

            <button
              type="button"
              onClick={() => setRole('student')}
              className={`flex items-center justify-center space-x-2 py-2.5 rounded-xl text-xs font-bold transition-all ${
                !isFaculty
                  ? 'bg-white text-[#6C47FF] shadow-sm'
                  : 'text-gray-500 hover:text-gray-900'
              }`}
            >
              <BookOpen className="w-4 h-4" />
              <span>Student Portal</span>
            </button>
          </div>

          {/* 1-Click Demo Profiles */}
          <div className="space-y-2.5">
            <div className="flex items-center justify-between">
              <label className="text-[11px] font-bold text-gray-600 uppercase tracking-wider flex items-center space-x-1">
                <Sparkles className="w-3 h-3 text-amber-500" />
                <span>1-Click Demo Accounts</span>
              </label>
              <span className="text-[10px] text-gray-400">Click to switch</span>
            </div>

            <div className="space-y-1.5 max-h-44 overflow-y-auto pr-1">
              {currentRoleProfiles.map((p) => {
                const active = p.id === selectedProfileId;
                return (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => handleSelectProfile(p)}
                    className={`w-full text-left p-2.5 rounded-2xl border transition-all flex items-center justify-between ${
                      active
                        ? isFaculty
                          ? 'bg-purple-50/70 border-purple-300 ring-1 ring-[#3E2D68]/20'
                          : 'bg-indigo-50/70 border-indigo-300 ring-1 ring-indigo-500/20'
                        : 'bg-white border-gray-100 hover:bg-gray-50'
                    }`}
                  >
                    <div className="flex items-center space-x-2.5 min-w-0">
                      <img
                        src={p.avatar_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'}
                        alt={p.full_name}
                        className="w-7 h-7 rounded-full object-cover shrink-0 ring-1 ring-gray-200"
                      />
                      <div className="min-w-0">
                        <p className="text-xs font-bold text-gray-900 truncate">{p.full_name}</p>
                        <p className="text-[10px] text-gray-500 truncate">{p.email}</p>
                      </div>
                    </div>
                    {active && (
                      <CheckCircle2
                        className={`w-4 h-4 shrink-0 ${isFaculty ? 'text-[#3E2D68]' : 'text-[#6C47FF]'}`}
                      />
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Credentials Form */}
          <form onSubmit={handleSubmit} className="space-y-4 pt-1 border-t border-gray-100">
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">
                {isFaculty ? 'Faculty Academic Email' : 'Student Email / ID'}
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={isFaculty ? 'faculty@adaptivelearn.ai' : 'student1@adaptivelearn.ai'}
                  className="w-full pl-10 pr-3 py-2.5 rounded-xl border border-gray-200 text-xs font-medium focus:outline-none focus:border-[#3E2D68] focus:ring-1 focus:ring-[#3E2D68]"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-bold text-gray-700">Password</label>
                <span className="text-[10px] text-gray-400">Demo preset: academic2026</span>
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-3 py-2.5 rounded-xl border border-gray-200 text-xs font-medium focus:outline-none focus:border-[#3E2D68] focus:ring-1 focus:ring-[#3E2D68]"
                />
              </div>
            </div>

            <div className="flex items-center justify-between text-xs">
              <label className="flex items-center space-x-2 text-gray-600 cursor-pointer">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="rounded border-gray-300 text-[#3E2D68] focus:ring-[#3E2D68]"
                />
                <span className="text-[11px] font-medium">Keep me signed in</span>
              </label>
              <span className="text-[11px] text-gray-400">Institutional SSO Enabled</span>
            </div>

            <Button
              type="submit"
              disabled={loading}
              className={`w-full py-5 rounded-2xl text-xs font-bold text-white shadow-lg transition-all ${
                isFaculty
                  ? 'bg-[#3E2D68] hover:bg-[#322353] shadow-purple-900/15'
                  : 'bg-[#6C47FF] hover:bg-[#5939db] shadow-indigo-900/15'
              }`}
            >
              {loading ? (
                <span className="flex items-center justify-center space-x-2">
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                  <span>Signing into {isFaculty ? 'Faculty Portal' : 'Student Portal'}...</span>
                </span>
              ) : (
                <span className="flex items-center justify-center space-x-1.5">
                  <span>Sign In as {isFaculty ? 'Faculty Member' : 'Student'}</span>
                  <ArrowRight className="w-3.5 h-3.5 ml-1" />
                </span>
              )}
            </Button>
          </form>

          {/* Security Notice */}
          <div className="p-3 bg-purple-50/50 rounded-2xl border border-purple-100 flex items-center space-x-2.5">
            <ShieldCheck className="w-4 h-4 text-[#3E2D68] shrink-0" />
            <p className="text-[11px] text-[#3E2D68] font-medium leading-relaxed">
              FERPA & Institutional Compliance: Strict role-based isolation between assessment generation and student attempts.
            </p>
          </div>
        </div>
      </div>

      {/* Bottom Footer */}
      <footer className="p-4 text-center text-xs text-gray-400">
        &copy; {new Date().getFullYear()} RNS Institute of Technology • TechMate Platform. All rights reserved.
      </footer>
    </div>
  );
}

