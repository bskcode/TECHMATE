'use client';

import React from 'react';
import Link from 'next/link';
import {
  Sparkles,
  ArrowRight,
  GraduationCap,
  BookOpen,
  FileCheck2,
  BrainCircuit,
  CheckCircle2,
  TrendingUp,
  ShieldCheck,
  Layers,
  ChevronRight,
  BarChart3,
  HelpCircle,
  Award,
  Lock,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useApp } from '@/components/providers/app-provider';
import { useRouter } from 'next/navigation';

export default function LandingPage() {
  const router = useRouter();
  const { profiles, setActiveUser, toast } = useApp();

  const facultyProfiles = profiles.filter((p) => p.role === 'faculty');
  const studentProfiles = profiles.filter((p) => p.role === 'student');

  const handleQuickLogin = (profile: any, targetPath: string) => {
    setActiveUser(profile);
    toast(`Welcome back, ${profile.full_name}!`, 'success');
    router.push(targetPath);
  };

  return (
    <div className="min-h-screen bg-[#F8F9FD] text-gray-900 selection:bg-purple-200">
      {/* Institutional Top Ribbon */}
      <div className="bg-[#3E2D68] text-white py-2 px-4 text-center text-xs font-semibold flex flex-wrap items-center justify-center gap-2">
        <span className="inline-flex items-center space-x-1.5 bg-amber-400/20 text-amber-300 px-2 py-0.5 rounded-full font-bold text-[10px] uppercase tracking-wider">
          <Sparkles className="w-3 h-3 text-amber-300" />
          Silver Jubilee (2001–2026)
        </span>
        <span>
          RNS Institute of Technology • Autonomous Institution Affiliated to VTU, Belagavi • Approved by AICTE
        </span>
      </div>

      {/* Main Navigation Bar */}
      <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-gray-100 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex items-center justify-between">
          {/* Institution Logos & Project Name */}
          <div className="flex items-center space-x-3.5">
            <Link href="/" className="flex items-center space-x-3 group">
              <img
                src="/logos/rnsit-seal.png"
                alt="RNSIT Seal"
                className="w-12 h-12 object-contain drop-shadow-sm group-hover:scale-105 transition-transform"
              />
              <img
                src="/logos/rnsit-jubilee.jpg"
                alt="RNSIT 25 Years"
                className="h-10 w-auto object-contain drop-shadow-sm group-hover:scale-105 transition-transform"
              />
              <div className="border-l border-gray-200 pl-3">
                <span className="text-base sm:text-lg font-black text-gray-900 tracking-tight block leading-tight">
                  RNS Institute of Technology
                </span>
                <span className="text-xs font-extrabold text-[#3E2D68] tracking-wide flex items-center space-x-1">
                  <span>TechMate</span>
                  <span className="text-[10px] text-gray-400 font-medium">• Outcome-Based AI</span>
                </span>
              </div>
            </Link>
          </div>

          {/* Nav links */}
          <nav className="hidden lg:flex items-center space-x-8 text-xs font-bold text-gray-600">
            <a href="#portals" className="hover:text-[#3E2D68] transition-colors">
              Portals
            </a>
            <a href="#pedagogy" className="hover:text-[#3E2D68] transition-colors">
              Pedagogy & Bloom Radar
            </a>
            <a href="#features" className="hover:text-[#3E2D68] transition-colors">
              Module Architecture
            </a>
            <a href="#about" className="hover:text-[#3E2D68] transition-colors">
              About RNSIT
            </a>
          </nav>

          {/* Dedicated Login Action Buttons */}
          <div className="flex items-center space-x-2.5">
            <Link href="/login?role=faculty">
              <Button
                variant="outline"
                size="sm"
                className="rounded-xl border-purple-200 text-[#3E2D68] font-bold text-xs hover:bg-purple-50"
              >
                <GraduationCap className="w-3.5 h-3.5 mr-1 text-[#3E2D68]" />
                Faculty Login
              </Button>
            </Link>
            <Link href="/login?role=student">
              <Button
                size="sm"
                className="rounded-xl bg-[#3E2D68] hover:bg-[#322353] text-white font-bold text-xs shadow-md shadow-purple-900/10"
              >
                <BookOpen className="w-3.5 h-3.5 mr-1" />
                Student Login
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden pt-10 pb-16 lg:pt-14 lg:pb-24">
        {/* Soft background glow */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[350px] bg-gradient-to-tr from-purple-200/40 via-violet-100/50 to-indigo-100/30 blur-3xl -z-10 rounded-full pointer-events-none" />

        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8 text-center">
          {/* Institutional Badge */}
          <div className="inline-flex items-center space-x-2 px-4 py-1.5 rounded-full bg-purple-50 border border-purple-200 text-[#3E2D68] text-xs font-bold shadow-sm">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>RNSIT Department of Computer Science & Engineering</span>
          </div>

          {/* Main Hero Title */}
          <div className="space-y-3 max-w-4xl mx-auto">
            <h2 className="text-xl sm:text-2xl font-bold uppercase tracking-widest text-[#3E2D68]">
              RNS Institute of Technology
            </h2>
            <h1 className="text-4xl sm:text-6xl font-black text-gray-900 tracking-tight leading-[1.12]">
              TechMate:{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#3E2D68] via-[#6C47FF] to-[#8B5CF6]">
                Adaptive Learning & Diagnostic Assessment
              </span>
            </h1>
            <p className="text-sm sm:text-base text-gray-600 font-medium max-w-2xl mx-auto leading-relaxed pt-2">
              Outcome-Based Education platform with <strong>module-wise diagnostic baselines (strictly zero hints)</strong>,{' '}
              <strong>progressive formative examinations (up to 2 hints on retry)</strong>, and AI-grounded learning material derived exclusively from faculty lecture notes.
            </p>
          </div>

          {/* DUAL LOGIN CARDS EMBEDDED DIRECTLY IN HERO */}
          <div id="portals" className="pt-6 grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto text-left">
            {/* Faculty Portal Card */}
            <div className="rounded-3xl p-6 sm:p-7 bg-white border-2 border-purple-100 shadow-xl shadow-purple-900/5 hover:border-[#3E2D68] transition-all flex flex-col justify-between space-y-5">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="w-12 h-12 rounded-2xl bg-[#3E2D68] text-white flex items-center justify-center shadow-md shadow-purple-900/20">
                    <GraduationCap className="w-6 h-6" />
                  </div>
                  <Badge variant="secondary" className="bg-purple-50 text-[#3E2D68] font-bold text-[11px] uppercase tracking-wider">
                    Faculty Portal
                  </Badge>
                </div>

                <div>
                  <h3 className="text-xl font-black text-gray-900">Faculty & Evaluator Login</h3>
                  <p className="text-xs text-gray-500 font-medium mt-1">
                    Manage course modules, generate strictly PDF-grounded questions with Groq, and review cognitive analytics.
                  </p>
                </div>

                {/* 1-Click Faculty Demo Profiles */}
                <div className="space-y-2 pt-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 block">
                    Quick 1-Click Institutional Access:
                  </span>
                  <div className="space-y-1.5">
                    {facultyProfiles.slice(0, 3).map((p) => (
                      <button
                        key={p.id}
                        type="button"
                        onClick={() => handleQuickLogin(p, '/faculty')}
                        className="w-full p-2 rounded-xl bg-gray-50 hover:bg-purple-50/70 border border-gray-100 hover:border-purple-200 transition-all flex items-center justify-between text-xs group"
                      >
                        <div className="flex items-center space-x-2.5 truncate">
                          <img
                            src={p.avatar_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'}
                            alt={p.full_name}
                            className="w-6 h-6 rounded-full object-cover shrink-0 ring-1 ring-gray-200"
                          />
                          <div className="text-left truncate">
                            <span className="font-bold text-gray-900 group-hover:text-[#3E2D68] block truncate">
                              {p.full_name}
                            </span>
                            <span className="text-[10px] text-gray-400 block truncate">
                              {(p as any).title || 'Faculty Member, CSE'}
                            </span>
                          </div>
                        </div>
                        <ArrowRight className="w-3.5 h-3.5 text-gray-400 group-hover:text-[#3E2D68] shrink-0 ml-1" />
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="pt-2">
                <Link href="/login?role=faculty" className="block">
                  <Button className="w-full py-5 rounded-2xl bg-[#3E2D68] hover:bg-[#322353] text-white font-bold text-xs shadow-md flex items-center justify-center space-x-2">
                    <span>Enter Faculty Portal</span>
                    <ArrowRight className="w-4 h-4" />
                  </Button>
                </Link>
              </div>
            </div>

            {/* Student Portal Card */}
            <div className="rounded-3xl p-6 sm:p-7 bg-white border-2 border-indigo-100 shadow-xl shadow-indigo-900/5 hover:border-[#6C47FF] transition-all flex flex-col justify-between space-y-5">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-[#6C47FF] to-[#3E2D68] text-white flex items-center justify-center shadow-md shadow-indigo-500/20">
                    <BookOpen className="w-6 h-6" />
                  </div>
                  <Badge variant="secondary" className="bg-indigo-50 text-[#6C47FF] font-bold text-[11px] uppercase tracking-wider">
                    Student Portal
                  </Badge>
                </div>

                <div>
                  <h3 className="text-xl font-black text-gray-900">Student Examination Login</h3>
                  <p className="text-xs text-gray-500 font-medium mt-1">
                    Take module diagnostic baselines, practice progressive quizzes with 2 hints, and view your Bloom radar.
                  </p>
                </div>

                {/* 1-Click Student Demo Profiles */}
                <div className="space-y-2 pt-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 block">
                    Quick 1-Click Student Access:
                  </span>
                  <div className="space-y-1.5">
                    {studentProfiles.slice(0, 3).map((p) => (
                      <button
                        key={p.id}
                        type="button"
                        onClick={() => handleQuickLogin(p, '/student')}
                        className="w-full p-2 rounded-xl bg-gray-50 hover:bg-indigo-50/70 border border-gray-100 hover:border-indigo-200 transition-all flex items-center justify-between text-xs group"
                      >
                        <div className="flex items-center space-x-2.5 truncate">
                          <img
                            src={p.avatar_url || 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150'}
                            alt={p.full_name}
                            className="w-6 h-6 rounded-full object-cover shrink-0 ring-1 ring-gray-200"
                          />
                          <div className="text-left truncate">
                            <span className="font-bold text-gray-900 group-hover:text-[#6C47FF] block truncate">
                              {p.full_name}
                            </span>
                            <span className="text-[10px] text-gray-400 block truncate">
                              {(p as any).academic_level || 'Sem 5 • CSE'}
                            </span>
                          </div>
                        </div>
                        <ArrowRight className="w-3.5 h-3.5 text-gray-400 group-hover:text-[#6C47FF] shrink-0 ml-1" />
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="pt-2">
                <Link href="/login?role=student" className="block">
                  <Button className="w-full py-5 rounded-2xl bg-[#6C47FF] hover:bg-[#5939db] text-white font-bold text-xs shadow-md flex items-center justify-center space-x-2">
                    <span>Enter Student Portal</span>
                    <ArrowRight className="w-4 h-4" />
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Pillar: Module-Wise Assessment System */}
      <section id="features" className="py-16 bg-white border-y border-gray-100">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
          <div className="text-center space-y-2 max-w-2xl mx-auto">
            <Badge className="bg-purple-100 text-[#3E2D68] hover:bg-purple-100 text-xs font-bold px-3 py-1">
              Assessment Architecture
            </Badge>
            <h2 className="text-3xl font-black text-gray-900 tracking-tight">
              Module-Wise Diagnostic & Progressive Testing
            </h2>
            <p className="text-sm text-gray-500 font-medium">
              Every course module in TechMate delivers two synchronized assessment modalities configured specifically for outcome measurement.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Diagnostic Card */}
            <div className="p-7 rounded-3xl bg-amber-50/40 border-2 border-amber-200 space-y-4">
              <div className="flex items-center justify-between">
                <Badge variant="outline" className="bg-amber-100 text-amber-900 border-amber-300 font-bold text-xs">
                  Modality 1
                </Badge>
                <span className="text-xs font-bold text-amber-800 uppercase tracking-wider">
                  Baseline Evaluation
                </span>
              </div>
              <h3 className="text-xl font-bold text-gray-900">
                Diagnostic Assessment (Strictly Zero Hints)
              </h3>
              <p className="text-xs text-gray-600 leading-relaxed font-medium">
                Administered before or during module commencement. The student answers each question independently without assistance.
                Hints are strictly locked and suppressed to accurately benchmark prerequisite retention and knowledge deficits.
              </p>
              <div className="space-y-2 text-xs text-gray-700 font-semibold pt-2">
                <div className="flex items-center space-x-2">
                  <CheckCircle2 className="w-4 h-4 text-amber-600 shrink-0" />
                  <span>Single attempt per question • 100% baseline weighting</span>
                </div>
                <div className="flex items-center space-x-2">
                  <CheckCircle2 className="w-4 h-4 text-amber-600 shrink-0" />
                  <span>Directly populates Bloom trait radar and learning gap diagnosis</span>
                </div>
              </div>
            </div>

            {/* Progressive Card */}
            <div className="p-7 rounded-3xl bg-emerald-50/40 border-2 border-emerald-200 space-y-4">
              <div className="flex items-center justify-between">
                <Badge variant="outline" className="bg-emerald-100 text-emerald-900 border-emerald-300 font-bold text-xs">
                  Modality 2
                </Badge>
                <span className="text-xs font-bold text-emerald-800 uppercase tracking-wider">
                  Formative Mastery
                </span>
              </div>
              <h3 className="text-xl font-bold text-gray-900">
                Progressive Assessment (Max 2 Hints on Retry)
              </h3>
              <p className="text-xs text-gray-600 leading-relaxed font-medium">
                Administered for skill formation and conceptual mastery. When a student submits an incorrect response,
                up to two progressive hints unlock sequentially to guide analytical thinking and derivation.
              </p>
              <div className="space-y-2 text-xs text-gray-700 font-semibold pt-2">
                <div className="flex items-center space-x-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Attempt 1 Wrong → Hint 1 Unlocks (Conceptual clue, 75% marks)</span>
                </div>
                <div className="flex items-center space-x-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Attempt 2 Wrong → Hint 2 Unlocks (Formula / principle clue, 50% marks)</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Pillar: Strict Grounding & Pedagogy */}
      <section id="pedagogy" className="py-16 bg-[#F8F9FD]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="text-center space-y-2 max-w-2xl mx-auto">
            <span className="text-xs font-bold text-[#3E2D68] uppercase tracking-wider">
              Educational Quality & Rigor
            </span>
            <h2 className="text-3xl font-black text-gray-900 tracking-tight">
              Strict PDF Grounding via Groq LLM
            </h2>
            <p className="text-sm text-gray-500 font-medium">
              Every question stem, distracter option, answer key, and hint is derived exclusively from uploaded faculty lecture material.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-6 rounded-3xl bg-white border border-gray-100 shadow-sm space-y-3">
              <div className="w-10 h-10 rounded-2xl bg-purple-50 text-[#3E2D68] flex items-center justify-center font-bold text-xs">
                PDF
              </div>
              <h3 className="text-base font-bold text-gray-900">Zero External Hallucinations</h3>
              <p className="text-xs text-gray-500 leading-relaxed">
                Groq LLM is strictly constrained to the text extracted from uploaded course notes. No outside trivia or unapproved concepts are introduced.
              </p>
            </div>

            <div className="p-6 rounded-3xl bg-white border border-gray-100 shadow-sm space-y-3">
              <div className="w-10 h-10 rounded-2xl bg-purple-50 text-[#3E2D68] flex items-center justify-center">
                <BrainCircuit className="w-5 h-5 text-[#3E2D68]" />
              </div>
              <h3 className="text-base font-bold text-gray-900">Bloom&apos;s Revised Taxonomy</h3>
              <p className="text-xs text-gray-500 leading-relaxed">
                Deterministic mapping across all 6 cognitive levels: Remembering, Understanding, Application, Analysis, Creativity, and Evaluation.
              </p>
            </div>

            <div className="p-6 rounded-3xl bg-white border border-gray-100 shadow-sm space-y-3">
              <div className="w-10 h-10 rounded-2xl bg-purple-50 text-[#3E2D68] flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-[#3E2D68]" />
              </div>
              <h3 className="text-base font-bold text-gray-900">Faculty-in-the-Loop Interventions</h3>
              <p className="text-xs text-gray-500 leading-relaxed">
                When students exhibit cognitive friction, personalized walkthroughs with worked examples and analogies are generated for faculty approval.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Institutional Footer with Both Logos */}
      <footer id="about" className="bg-white border-t border-gray-100 py-12">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6 pb-8 border-b border-gray-100">
            <div className="flex items-center space-x-4">
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
              <div>
                <h4 className="text-sm font-black text-gray-900">
                  RNS Institute of Technology
                </h4>
                <p className="text-xs text-gray-500 font-medium">
                  TechMate — Outcome-Based Adaptive Learning Platform
                </p>
                <p className="text-[11px] text-gray-400">
                  Department of Computer Science & Engineering • Silver Jubilee (2001–2026)
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-4 text-xs font-bold text-gray-600">
              <Link href="/login?role=faculty" className="hover:text-[#3E2D68] px-3 py-2 rounded-xl hover:bg-gray-50">
                Faculty Portal
              </Link>
              <Link href="/login?role=student" className="hover:text-[#3E2D68] px-3 py-2 rounded-xl hover:bg-gray-50">
                Student Portal
              </Link>
              <Link href="/login" className="hover:text-[#3E2D68] px-3 py-2 rounded-xl hover:bg-gray-50">
                Sign In
              </Link>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-between text-[11px] text-gray-400 gap-2">
            <p>
              &copy; {new Date().getFullYear()} RNS Institute of Technology, Channasandra, Dr. Vishnuvardhan Road, Bengaluru - 560098. All rights reserved.
            </p>
            <p className="font-semibold text-gray-500">
              TechMate • Developed for RNSIT
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
