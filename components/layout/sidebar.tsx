'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  BookOpen,
  FileText,
  CheckSquare,
  BarChart3,
  Sparkles,
  Award,
  GraduationCap,
  Users,
  Settings,
  HelpCircle,
  TrendingUp,
} from 'lucide-react';

interface SidebarProps {
  currentRole: 'faculty' | 'student';
  onRoleToggle?: () => void;
}

export function Sidebar({ currentRole }: SidebarProps) {
  const pathname = usePathname();
  const [aiStatus, setAiStatus] = useState<{ provider: string; model: string; configured: boolean } | null>(null);

  useEffect(() => {
    fetch('/api/health')
      .then((r) => r.json())
      .then((d) => {
        if (d.ai) setAiStatus(d.ai);
      })
      .catch(() => {});
  }, []);

  const facultyNav = [
    { label: 'Dashboard', href: '/faculty', icon: LayoutDashboard },
    { label: 'Courses', href: '/faculty/courses', icon: BookOpen },
    { label: 'Materials', href: '/faculty/materials', icon: FileText },
    { label: 'Assessments', href: '/faculty/assessments', icon: CheckSquare },
    { label: 'Class Analytics', href: '/faculty/analytics', icon: BarChart3 },
    { label: 'Interventions', href: '/faculty/interventions', icon: Sparkles },
    { label: 'Improvement Reports', href: '/faculty/reports', icon: Award },
  ];

  const studentNav = [
    { label: 'Dashboard', href: '/student', icon: LayoutDashboard },
    { label: 'My Courses', href: '/student/courses', icon: BookOpen },
    { label: 'Assessments', href: '/student/assessments', icon: CheckSquare },
    { label: 'Trait Radar', href: '/student/traits', icon: BarChart3 },
    { label: 'Personalized Study', href: '/student/interventions', icon: Sparkles },
    { label: 'Practice Quiz', href: '/student/practice', icon: GraduationCap },
    { label: 'Final Report', href: '/student/report', icon: TrendingUp },
  ];

  const navItems = currentRole === 'faculty' ? facultyNav : studentNav;

  return (
    <aside className="w-64 bg-[#3E2D68] text-white flex flex-col justify-between shrink-0 shadow-xl min-h-screen z-30 select-none">
      <div>
        {/* Brand Header */}
        <div className="p-6 flex items-center space-x-3 border-b border-[#4E3982]/60">
          <div className="w-10 h-10 rounded-2xl bg-white text-[#3E2D68] flex items-center justify-center font-bold text-xl shadow-md">
            <GraduationCap className="w-6 h-6" />
          </div>
          <div>
            <h1 className="font-extrabold text-base tracking-wide text-white">AdaptiveLearn</h1>
            <p className="text-xs text-[#C4B5FD] font-medium uppercase tracking-wider">AI Platform</p>
          </div>
        </div>

        {/* Current Role Tag */}
        <div className="px-6 py-3">
          <div className="bg-[#4D3A7D] rounded-xl px-3 py-1.5 flex items-center justify-between text-xs text-[#E0D7F5]">
            <span className="font-semibold uppercase tracking-wider text-[10px]">
              {currentRole === 'faculty' ? 'Faculty Portal' : 'Student Portal'}
            </span>
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          </div>
        </div>

        {/* Navigation List with Template Active Pill Tab */}
        <nav className="mt-2 space-y-1 pl-4">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center space-x-3 px-4 py-3 text-sm font-semibold transition-all ${
                  isActive
                    ? 'bg-[#F4F5FA] text-[#3E2D68] rounded-l-3xl shadow-sm relative font-bold before:absolute before:-top-3 before:right-0 before:w-3 before:h-3 before:bg-transparent before:rounded-br-full before:shadow-[3px_3px_0_3px_#F4F5FA] after:absolute after:-bottom-3 after:right-0 after:w-3 after:h-3 after:bg-transparent after:rounded-tr-full after:shadow-[3px_-3px_0_3px_#F4F5FA]'
                    : 'text-[#D8CEF6] hover:text-white hover:bg-[#4E3982]/40 rounded-xl mr-4'
                }`}
              >
                <Icon className={`w-5 h-5 shrink-0 ${isActive ? 'text-[#3E2D68]' : 'text-[#C4B5FD]'}`} />
                <span className="truncate">{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Live AI Engine Status Box */}
      <div className="p-4 mx-4 mb-4 rounded-2xl bg-gradient-to-br from-[#4E3982] to-[#5C4596] border border-[#6850A4] text-xs text-white">
        <div className="flex items-center space-x-2 mb-1">
          <Sparkles className="w-4 h-4 text-amber-300" />
          <span className="font-bold text-amber-200">
            {aiStatus?.configured ? 'Groq Engine Active' : 'Grounded Engine Ready'}
          </span>
        </div>
        <p className="text-[11px] text-[#DDD6FE] leading-relaxed">
          {aiStatus?.configured
            ? `Model: ${aiStatus.model} · 2-hint progressive exams enabled.`
            : 'Deterministic grounded authoring & 2-hint progressive exams active.'}
        </p>
      </div>
    </aside>
  );
}

