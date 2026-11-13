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
  Compass,
  CheckCircle2,
  TrendingUp,
  ShieldCheck,
  Zap,
  Layers,
  ChevronRight,
  BarChart3,
  HelpCircle,
  Award,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#F8F9FD] text-gray-900 selection:bg-purple-200">
      {/* Top Announcement Bar */}
      <div className="bg-[#3E2D68] text-white py-2 px-4 text-center text-xs font-semibold flex items-center justify-center space-x-2">
        <Sparkles className="w-3.5 h-3.5 text-amber-300 animate-pulse" />
        <span>TechMate AI 2.0: Assessment Questions Strictly Grounded in Uploaded Course PDFs</span>
        <Link
          href="/login"
          className="underline text-purple-200 hover:text-white font-bold ml-1 inline-flex items-center"
        >
          Try Live Demo <ChevronRight className="w-3 h-3 ml-0.5" />
        </Link>
      </div>

      {/* Main Navigation */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 py-3.5 flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-[#3E2D68] to-[#6C47FF] flex items-center justify-center shadow-md shadow-purple-500/20">
              <BrainCircuit className="w-5 h-5 text-white" />
            </div>
            <div>
              <span className="text-xl font-black text-gray-900 tracking-tight block leading-tight">
                Tech<span className="text-[#3E2D68]">Mate</span>
              </span>
              <span className="text-[10px] font-bold text-gray-400 tracking-widest uppercase">
                AdaptiveLearn AI
              </span>
            </div>
          </Link>

          {/* Nav links */}
          <nav className="hidden md:flex items-center space-x-8 text-sm font-semibold text-gray-600">
            <a href="#features" className="hover:text-[#3E2D68] transition-colors">
              Platform Features
            </a>
            <a href="#pedagogy" className="hover:text-[#3E2D68] transition-colors">
              Bloom Pedagogy
            </a>
            <a href="#portals" className="hover:text-[#3E2D68] transition-colors">
              Role Portals
            </a>
            <a href="#architecture" className="hover:text-[#3E2D68] transition-colors">
              Security & Guardrails
            </a>
          </nav>

          {/* CTA Buttons */}
          <div className="flex items-center space-x-3">
            <Link href="/login">
              <Button
                variant="outline"
                className="rounded-xl border-purple-200 text-[#3E2D68] font-bold text-xs hover:bg-purple-50"
              >
                Sign In
              </Button>
            </Link>
            <Link href="/login">
              <Button className="rounded-xl bg-[#3E2D68] hover:bg-[#322353] text-white font-bold text-xs shadow-md shadow-purple-900/10">
                Launch Platform
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden pt-12 pb-20 lg:pt-20 lg:pb-28">
        {/* Background glow orbs */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[350px] bg-gradient-to-tr from-purple-200/40 via-violet-100/50 to-indigo-100/30 blur-3xl -z-10 rounded-full pointer-events-none" />

        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6">
          <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-purple-50 border border-purple-200/80 text-[#3E2D68] text-xs font-bold shadow-sm">
            <Sparkles className="w-3.5 h-3.5 text-[#7C3AED]" />
            <span>Closed-Loop Academic Intelligence for Higher Education</span>
          </div>

          <h1 className="text-4xl sm:text-6xl font-black text-gray-900 tracking-tight leading-[1.12] max-w-4xl mx-auto">
            Where Continuous Assessment Meets{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#3E2D68] via-[#6C47FF] to-[#8B5CF6]">
              Grounded Personalization.
            </span>
          </h1>

          <p className="text-base sm:text-lg text-gray-600 font-medium max-w-2xl mx-auto leading-relaxed">
            Upload your syllabus or lecture PDF. TechMate automatically extracts verified text, synthesizes
            Bloom-aligned question packages with progressive hints, and delivers personalized remediation in a closed loop.
          </p>

          {/* Action CTAs */}
          <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/login?role=faculty" className="w-full sm:w-auto">
              <Button className="w-full sm:w-auto px-7 py-6 rounded-2xl bg-[#3E2D68] hover:bg-[#322353] text-white font-bold text-sm shadow-xl shadow-purple-900/20 flex items-center justify-center space-x-2">
                <GraduationCap className="w-5 h-5" />
                <span>Enter Faculty Portal</span>
                <ArrowRight className="w-4 h-4 ml-1" />
              </Button>
            </Link>

            <Link href="/login?role=student" className="w-full sm:w-auto">
              <Button
                variant="outline"
                className="w-full sm:w-auto px-7 py-6 rounded-2xl border-2 border-[#3E2D68]/20 bg-white hover:bg-purple-50/50 text-[#3E2D68] font-bold text-sm shadow-sm flex items-center justify-center space-x-2"
              >
                <BookOpen className="w-5 h-5" />
                <span>Enter Student Portal</span>
              </Button>
            </Link>
          </div>

          {/* Trust Highlights */}
          <div className="pt-10 grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto text-left">
            <div className="p-4 rounded-2xl bg-white border border-gray-100 shadow-sm">
              <div className="w-8 h-8 rounded-xl bg-purple-50 text-[#3E2D68] flex items-center justify-center mb-2 font-black text-sm">
                PDF
              </div>
              <h4 className="text-xs font-bold text-gray-900">Strict PDF Grounding</h4>
              <p className="text-[11px] text-gray-500 mt-0.5">Questions derived 100% from uploaded material.</p>
            </div>

            <div className="p-4 rounded-2xl bg-white border border-gray-100 shadow-sm">
              <div className="w-8 h-8 rounded-xl bg-purple-50 text-[#3E2D68] flex items-center justify-center mb-2">
                <BrainCircuit className="w-4 h-4" />
              </div>
              <h4 className="text-xs font-bold text-gray-900">Bloom&apos;s Taxonomy</h4>
              <p className="text-[11px] text-gray-500 mt-0.5">Tracks 6 cognitive dimensions on every response.</p>
            </div>

            <div className="p-4 rounded-2xl bg-white border border-gray-100 shadow-sm">
              <div className="w-8 h-8 rounded-xl bg-purple-50 text-[#3E2D68] flex items-center justify-center mb-2">
                <HelpCircle className="w-4 h-4" />
              </div>
              <h4 className="text-xs font-bold text-gray-900">Progressive 2-Tier Hints</h4>
              <p className="text-[11px] text-gray-500 mt-0.5">Subtle clues (-25%) & formulas (-50%) on retry.</p>
            </div>

            <div className="p-4 rounded-2xl bg-white border border-gray-100 shadow-sm">
              <div className="w-8 h-8 rounded-xl bg-purple-50 text-[#3E2D68] flex items-center justify-center mb-2">
                <TrendingUp className="w-4 h-4" />
              </div>
              <h4 className="text-xs font-bold text-gray-900">Closed-Loop Remediation</h4>
              <p className="text-[11px] text-gray-500 mt-0.5">Targeted study packages based on weak traits.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Role Selection Showcase ("Choose Your Portal") */}
      <section id="portals" className="py-16 bg-white border-y border-gray-100">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
          <div className="text-center space-y-2 max-w-2xl mx-auto">
            <Badge className="bg-purple-100 text-[#3E2D68] hover:bg-purple-100 text-xs font-bold px-3 py-1">
              Select Your Role
            </Badge>
            <h2 className="text-3xl font-black text-gray-900 tracking-tight">
              Designed for Faculty Precision & Student Growth
            </h2>
            <p className="text-sm text-gray-500 font-medium">
              Seamlessly toggle between the academic authoring workspace and the interactive student testing suite.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Faculty Portal Card */}
            <div className="relative group rounded-3xl p-8 bg-gradient-to-b from-purple-50/40 to-white border-2 border-purple-100/80 hover:border-[#3E2D68]/40 transition-all shadow-sm hover:shadow-xl flex flex-col justify-between">
              <div className="space-y-5">
                <div className="flex items-center justify-between">
                  <div className="w-14 h-14 rounded-2xl bg-[#3E2D68] text-white flex items-center justify-center shadow-lg shadow-purple-900/20">
                    <GraduationCap className="w-7 h-7" />
                  </div>
                  <Badge variant="secondary" className="text-xs font-bold text-[#3E2D68] bg-purple-50">
                    Instructor Workspace
                  </Badge>
                </div>

                <div>
                  <h3 className="text-xl font-black text-gray-900">Faculty Portal</h3>
                  <p className="text-xs text-gray-500 font-medium mt-1">
                    Complete curriculum oversight, AI question package authoring, and cognitive diagnostic analytics.
                  </p>
                </div>

                <ul className="space-y-3 text-xs font-semibold text-gray-700">
                  <li className="flex items-start space-x-2.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <span>Upload course PDF documents with verified text extraction</span>
                  </li>
                  <li className="flex items-start space-x-2.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <span>Auto-generate Bloom-aligned question packages with keys & rubrics</span>
                  </li>
                  <li className="flex items-start space-x-2.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <span>Monitor cohort Bloom radar distributions and diagnostic risk factors</span>
                  </li>
                  <li className="flex items-start space-x-2.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <span>Review and approve AI-generated remediation interventions</span>
                  </li>
                </ul>
              </div>

              <div className="pt-8">
                <Link href="/login?role=faculty">
                  <Button className="w-full py-6 rounded-2xl bg-[#3E2D68] hover:bg-[#322353] text-white font-bold text-xs shadow-md flex items-center justify-center space-x-2">
                    <span>Login as Faculty</span>
                    <ArrowRight className="w-4 h-4" />
                  </Button>
                </Link>
                <p className="text-center text-[11px] text-gray-400 mt-2 font-medium">
                  Default demo: Dr. Rajesh Sharma (CS101 AI & Computing)
                </p>
              </div>
            </div>

            {/* Student Portal Card */}
            <div className="relative group rounded-3xl p-8 bg-gradient-to-b from-indigo-50/40 to-white border-2 border-indigo-100/80 hover:border-indigo-400 transition-all shadow-sm hover:shadow-xl flex flex-col justify-between">
              <div className="space-y-5">
                <div className="flex items-center justify-between">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-[#6C47FF] to-[#3E2D68] text-white flex items-center justify-center shadow-lg shadow-indigo-500/20">
                    <BookOpen className="w-7 h-7" />
                  </div>
                  <Badge variant="secondary" className="text-xs font-bold text-[#6C47FF] bg-indigo-50">
                    Learner Experience
                  </Badge>
                </div>

                <div>
                  <h3 className="text-xl font-black text-gray-900">Student Portal</h3>
                  <p className="text-xs text-gray-500 font-medium mt-1">
                    Adaptive diagnostic examinations, real-time cognitive growth feedback, and targeted micro-modules.
                  </p>
                </div>

                <ul className="space-y-3 text-xs font-semibold text-gray-700">
                  <li className="flex items-start space-x-2.5">
                    <CheckCircle2 className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
                    <span>Take diagnostic tests with progressive hints on wrong answers</span>
                  </li>
                  <li className="flex items-start space-x-2.5">
                    <CheckCircle2 className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
                    <span>View personal Bloom cognitive radar profile across all 6 traits</span>
                  </li>
                  <li className="flex items-start space-x-2.5">
                    <CheckCircle2 className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
                    <span>Complete assigned personalized study & remediation packages</span>
                  </li>
                  <li className="flex items-start space-x-2.5">
                    <CheckCircle2 className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
                    <span>Track progress from baseline to final comprehensive examination</span>
                  </li>
                </ul>
              </div>

              <div className="pt-8">
                <Link href="/login?role=student">
                  <Button className="w-full py-6 rounded-2xl bg-[#6C47FF] hover:bg-[#5939db] text-white font-bold text-xs shadow-md flex items-center justify-center space-x-2">
                    <span>Login as Student</span>
                    <ArrowRight className="w-4 h-4" />
                  </Button>
                </Link>
                <p className="text-center text-[11px] text-gray-400 mt-2 font-medium">
                  Default demo: Aarav Patel (CS101 Enrolled)
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Architecture Section */}
      <section id="features" className="py-20 bg-[#F8F9FD]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="text-center space-y-2 max-w-2xl mx-auto">
            <span className="text-xs font-bold text-[#3E2D68] uppercase tracking-wider">
              Comprehensive Educational Technology
            </span>
            <h2 className="text-3xl font-black text-gray-900 tracking-tight">
              Built for Pedagogical Integrity & Precision
            </h2>
            <p className="text-sm text-gray-500 font-medium">
              Every assessment question, hint, and intervention package adheres to deterministic academic standards.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-6 rounded-3xl bg-white border border-gray-100 shadow-sm space-y-3">
              <div className="w-10 h-10 rounded-2xl bg-purple-50 text-[#3E2D68] flex items-center justify-center">
                <FileCheck2 className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-gray-900">PDF Ingestion & Text Parsing</h3>
              <p className="text-xs text-gray-500 leading-relaxed">
                Faculty upload course syllabus or lecture notes in standard PDF format. The system extracts clean text
                and prevents AI from generating questions outside the uploaded document.
              </p>
            </div>

            <div className="p-6 rounded-3xl bg-white border border-gray-100 shadow-sm space-y-3">
              <div className="w-10 h-10 rounded-2xl bg-purple-50 text-[#3E2D68] flex items-center justify-center">
                <BrainCircuit className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-gray-900">Authoring-Time Generation</h3>
              <p className="text-xs text-gray-500 leading-relaxed">
                Groq LLM synthesizes complete packages: deterministic question stems, protected answer keys, grading rubrics,
                and calibrated 2-level progressive hints ahead of time for faculty review.
              </p>
            </div>

            <div className="p-6 rounded-3xl bg-white border border-gray-100 shadow-sm space-y-3">
              <div className="w-10 h-10 rounded-2xl bg-purple-50 text-[#3E2D68] flex items-center justify-center">
                <HelpCircle className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-gray-900">Deterministic Hint Engine</h3>
              <p className="text-xs text-gray-500 leading-relaxed">
                State machine controls hint delivery. If a student answers incorrectly, Attempt 2 unlocks a subtle conceptual clue
                with a 25% mark penalty; Attempt 3 unlocks a direct formula clue with a 50% penalty.
              </p>
            </div>

            <div className="p-6 rounded-3xl bg-white border border-gray-100 shadow-sm space-y-3">
              <div className="w-10 h-10 rounded-2xl bg-purple-50 text-[#3E2D68] flex items-center justify-center">
                <BarChart3 className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-gray-900">Bloom Radar Analytics</h3>
              <p className="text-xs text-gray-500 leading-relaxed">
                Scores are mapped across Bloom&apos;s Revised Taxonomy: Remembering, Understanding, Application, Analysis,
                Creativity, and Evaluation, exposing exact cognitive strengths and deficits.
              </p>
            </div>

            <div className="p-6 rounded-3xl bg-white border border-gray-100 shadow-sm space-y-3">
              <div className="w-10 h-10 rounded-2xl bg-purple-50 text-[#3E2D68] flex items-center justify-center">
                <Layers className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-gray-900">Personalized Interventions</h3>
              <p className="text-xs text-gray-500 leading-relaxed">
                When students struggle on specific cognitive dimensions, the platform generates tailored remedial reading materials
                and targeted practice problems, queueing them for faculty release.
              </p>
            </div>

            <div className="p-6 rounded-3xl bg-white border border-gray-100 shadow-sm space-y-3">
              <div className="w-10 h-10 rounded-2xl bg-purple-50 text-[#3E2D68] flex items-center justify-center">
                <Award className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-gray-900">Pre/Post Mastery Growth</h3>
              <p className="text-xs text-gray-500 leading-relaxed">
                Measures true student value-add by comparing baseline diagnostic performance against final comprehensive examinations,
                providing verifiable outcome attainment for accreditation.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-100 py-12">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-xl bg-[#3E2D68] flex items-center justify-center text-white font-black text-sm">
              TM
            </div>
            <div>
              <p className="text-xs font-bold text-gray-900">TechMate / AdaptiveLearn AI</p>
              <p className="text-[11px] text-gray-400">Strictly Grounded Academic Intelligence</p>
            </div>
          </div>

          <div className="flex items-center space-x-6 text-xs font-semibold text-gray-500">
            <Link href="/login?role=faculty" className="hover:text-[#3E2D68]">
              Faculty Portal
            </Link>
            <Link href="/login?role=student" className="hover:text-[#3E2D68]">
              Student Portal
            </Link>
            <Link href="/login" className="hover:text-[#3E2D68]">
              Sign In
            </Link>
          </div>

          <p className="text-[11px] text-gray-400">
            &copy; {new Date().getFullYear()} Smart Institute of Technology. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
