'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  BookOpen,
  Users,
  CheckSquare,
  Sparkles,
  ArrowUpRight,
  Plus,
  FileUp,
  BrainCircuit,
  Award,
  Calendar,
  Clock,
  ChevronRight,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
} from 'recharts';

export default function FacultyDashboard() {
  const [courses, setCourses] = useState<any[]>([]);
  const [analytics, setAnalytics] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const cRes = await fetch('/api/courses');
        const cData = await cRes.json();
        setCourses(cData.courses || []);

        if (cData.courses?.[0]?.id) {
          const aRes = await fetch(`/api/courses/${cData.courses[0].id}/analytics`);
          const aData = await aRes.json();
          setAnalytics(aData.analytics);
        }
      } catch (err) {
        console.error('Failed to load dashboard data:', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const performanceChartData = [
    { module: 'Mod 1', algos: 85, logic: 70, search: 90 },
    { module: 'Mod 2', algos: 75, logic: 88, search: 65 },
    { module: 'Mod 3', algos: 92, logic: 80, search: 85 },
    { module: 'Mod 4', algos: 68, logic: 75, search: 94 },
  ];

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Top Welcome & Quick Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-gray-900 tracking-tight">Faculty Intelligence Hub</h1>
          <p className="text-sm text-gray-500 font-medium">
            Monitor trait-based diagnostics, review AI question packages, and release remediation.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <Link href="/faculty/assessments">
            <Button variant="default" className="flex items-center space-x-2 text-xs font-bold rounded-xl shadow-sm">
              <BrainCircuit className="w-4 h-4 text-purple-300" />
              <span>Assessment Builder</span>
            </Button>
          </Link>
          <Link href="/faculty/materials">
            <Button variant="outline" className="flex items-center space-x-2 text-xs font-semibold rounded-xl bg-white shadow-sm">
              <FileUp className="w-4 h-4 text-gray-600" />
              <span>Upload Material</span>
            </Button>
          </Link>
        </div>
      </div>

      {/* 4 Template Stat Cards (Coral, Indigo, Amber, Emerald) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Coral Card */}
        <Card className="rounded-2xl border-none shadow-sm hover:shadow-md transition-shadow relative overflow-hidden bg-white">
          <div className="h-1.5 w-full bg-[#FF6B72]" />
          <CardContent className="p-6 flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Active Courses</p>
              <h3 className="text-3xl font-black text-gray-900 mt-1">{courses.length || 3}</h3>
              <p className="text-[11px] text-[#FF6B72] font-semibold mt-1">CS101, DS201, ML301</p>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-rose-50 text-[#FF6B72] flex items-center justify-center shadow-inner">
              <BookOpen className="w-6 h-6" />
            </div>
          </CardContent>
        </Card>

        {/* Deep Indigo Card */}
        <Card className="rounded-2xl border-none shadow-sm hover:shadow-md transition-shadow relative overflow-hidden bg-white">
          <div className="h-1.5 w-full bg-[#3E2D68]" />
          <CardContent className="p-6 flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Enrolled Students</p>
              <h3 className="text-3xl font-black text-gray-900 mt-1">25</h3>
              <p className="text-[11px] text-[#3E2D68] font-semibold mt-1">100% active participation</p>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-purple-50 text-[#3E2D68] flex items-center justify-center shadow-inner">
              <Users className="w-6 h-6" />
            </div>
          </CardContent>
        </Card>

        {/* Amber Card */}
        <Card className="rounded-2xl border-none shadow-sm hover:shadow-md transition-shadow relative overflow-hidden bg-white">
          <div className="h-1.5 w-full bg-[#F7B928]" />
          <CardContent className="p-6 flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Remediations Needed</p>
              <h3 className="text-3xl font-black text-gray-900 mt-1">
                {analytics?.studentsNeedingIntervention?.length ?? 3}
              </h3>
              <p className="text-[11px] text-amber-600 font-semibold mt-1">Analysis & Creativity gaps</p>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-amber-50 text-[#F7B928] flex items-center justify-center shadow-inner">
              <Sparkles className="w-6 h-6" />
            </div>
          </CardContent>
        </Card>

        {/* Emerald Card */}
        <Card className="rounded-2xl border-none shadow-sm hover:shadow-md transition-shadow relative overflow-hidden bg-white">
          <div className="h-1.5 w-full bg-[#22C55E]" />
          <CardContent className="p-6 flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Class Mastery Avg</p>
              <h3 className="text-3xl font-black text-gray-900 mt-1">82.5%</h3>
              <p className="text-[11px] text-emerald-600 font-semibold mt-1">+18.4% post-intervention</p>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-[#22C55E] flex items-center justify-center shadow-inner">
              <Award className="w-6 h-6" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Grid: Left Charts & Feed, Right Performance & Top Scorer Podium */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column (7 cols) */}
        <div className="lg:col-span-7 space-y-8">
          {/* Cognitive Trait Distribution Radar Chart */}
          <Card className="rounded-3xl border-none shadow-sm bg-white overflow-hidden">
            <CardHeader className="flex flex-row items-center justify-between pb-2 border-b border-gray-50">
              <div>
                <CardTitle className="text-base font-bold text-gray-900">Bloom's 6 Cognitive Dimensions</CardTitle>
                <p className="text-xs text-gray-500">Aggregated student evidence across all 6 traits</p>
              </div>
              <Badge variant="secondary" className="font-semibold text-xs text-[#3E2D68]">
                Diagnostic Baseline
              </Badge>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="h-72 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart
                    data={
                      analytics?.traitData || [
                        { trait: 'Remembering', classAverage: 90 },
                        { trait: 'Understanding', classAverage: 85 },
                        { trait: 'Application', classAverage: 75 },
                        { trait: 'Analysis', classAverage: 52 },
                        { trait: 'Creativity', classAverage: 48 },
                        { trait: 'Evaluation', classAverage: 65 },
                      ]
                    }
                  >
                    <PolarGrid stroke="#E2E8F0" />
                    <PolarAngleAxis dataKey="trait" tick={{ fill: '#475569', fontSize: 11, fontWeight: 600 }} />
                    <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fontSize: 9 }} />
                    <Radar
                      name="Class Trait Score"
                      dataKey="classAverage"
                      stroke="#3E2D68"
                      fill="#7C3AED"
                      fillOpacity={0.35}
                    />
                  </RadarChart>
                </ResponsiveContainer>
              </div>

              {/* Trait insights warning */}
              <div className="mt-4 p-3 bg-amber-50/80 rounded-2xl border border-amber-200/60 flex items-start space-x-3 text-xs text-amber-900">
                <Sparkles className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold">Faculty Action Needed:</span> Class evidence shows weakness in{' '}
                  <span className="font-bold underline">Analysis (52%)</span> and{' '}
                  <span className="font-bold underline">Creativity (48%)</span>. 3 personalized remediation packages
                  have been drafted for student release.
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Activity Notifications Card (From Template) */}
          <Card className="rounded-3xl border-none shadow-sm bg-white overflow-hidden">
            <CardHeader className="flex flex-row items-center justify-between pb-2 border-b border-gray-50">
              <CardTitle className="text-base font-bold text-gray-900">Activities & Academic Feed</CardTitle>
              <Link href="/faculty/interventions">
                <Button variant="outline" size="sm" className="rounded-full text-xs font-bold text-gray-600 px-4">
                  View All
                </Button>
              </Link>
            </CardHeader>
            <CardContent className="pt-4 divide-y divide-gray-100 space-y-3">
              <div className="pt-2 flex items-start space-x-3">
                <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 mt-1.5 shrink-0" />
                <div>
                  <p className="text-xs font-bold text-gray-900">Branden Harris completed Practice Questions</p>
                  <p className="text-[11px] text-gray-500">
                    Scored 100% on admissible heuristics practice after targeted remediation in CS101.
                  </p>
                  <span className="text-[10px] text-gray-400 font-medium">10 mins ago</span>
                </div>
              </div>

              <div className="pt-3 flex items-start space-x-3">
                <div className="w-2.5 h-2.5 rounded-full bg-amber-500 mt-1.5 shrink-0" />
                <div>
                  <p className="text-xs font-bold text-gray-900">Personalized Intervention Package Ready</p>
                  <p className="text-[11px] text-gray-500">
                    AI generated grounded package for Charles James on Graph Search Complexity. Pending faculty review.
                  </p>
                  <span className="text-[10px] text-gray-400 font-medium">1 hour ago</span>
                </div>
              </div>

              <div className="pt-3 flex items-start space-x-3">
                <div className="w-2.5 h-2.5 rounded-full bg-[#3E2D68] mt-1.5 shrink-0" />
                <div>
                  <p className="text-xs font-bold text-gray-900">Syllabus Grounding Document Processed</p>
                  <p className="text-[11px] text-gray-500">
                    CS101_Algorithms_and_Complexity_Syllabus.pdf parsed (1,980 characters) and approved for AI.
                  </p>
                  <span className="text-[10px] text-gray-400 font-medium">Yesterday</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column (5 cols) */}
        <div className="lg:col-span-5 space-y-8">
          {/* Performance Bar Chart (Matching Template) */}
          <Card className="rounded-3xl border-none shadow-sm bg-white overflow-hidden">
            <CardHeader className="flex flex-row items-center justify-between pb-2 border-b border-gray-50">
              <div>
                <CardTitle className="text-base font-bold text-gray-900">Module Performance</CardTitle>
                <p className="text-xs text-gray-400">All data in percentage (%)</p>
              </div>
              <div className="flex items-center space-x-2 text-[10px] font-semibold text-gray-500">
                <span className="inline-block w-2.5 h-2.5 rounded-sm bg-[#3E2D68]" /> CS101
                <span className="inline-block w-2.5 h-2.5 rounded-sm bg-[#F7B928]" /> DS201
                <span className="inline-block w-2.5 h-2.5 rounded-sm bg-[#22C55E]" /> ML301
              </div>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="h-60 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={performanceChartData} barGap={4}>
                    <XAxis dataKey="module" tick={{ fontSize: 11, fill: '#64748B' }} />
                    <YAxis domain={[0, 100]} tick={{ fontSize: 10, fill: '#64748B' }} />
                    <Tooltip
                      contentStyle={{ backgroundColor: '#1E293B', borderRadius: '12px', color: '#FFF' }}
                    />
                    <Bar dataKey="algos" fill="#3E2D68" radius={[4, 4, 0, 0]} name="CS101" />
                    <Bar dataKey="logic" fill="#F7B928" radius={[4, 4, 0, 0]} name="DS201" />
                    <Bar dataKey="search" fill="#22C55E" radius={[4, 4, 0, 0]} name="ML301" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Top Scorer / Trait Mastery Podium (From Template) */}
          <Card className="rounded-3xl border-none shadow-sm bg-white overflow-hidden">
            <CardHeader className="flex flex-row items-center justify-between pb-2 border-b border-gray-50">
              <CardTitle className="text-base font-bold text-gray-900">Top Trait Performers</CardTitle>
              <Badge variant="outline" className="text-xs text-gray-600">
                Fall 2026
              </Badge>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="grid grid-cols-3 gap-3">
                {/* 1st Place - Emerald Green */}
                <div className="bg-[#22C55E] text-white rounded-2xl p-4 flex flex-col items-center text-center shadow-md transform hover:-translate-y-1 transition-transform">
                  <img
                    src="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150"
                    alt="Branden Harris"
                    className="w-12 h-12 rounded-full object-cover border-2 border-white/80 shadow-sm"
                  />
                  <p className="text-xs font-bold mt-2 truncate w-full">Branden H.</p>
                  <p className="text-[10px] text-white/80">CS101</p>
                  <div className="mt-2 text-base font-black">99.90%</div>
                  <span className="mt-1 text-[10px] font-extrabold uppercase bg-white/20 px-2 py-0.5 rounded-full">
                    1st
                  </span>
                </div>

                {/* 2nd Place - Royal Purple */}
                <div className="bg-[#4E3788] text-white rounded-2xl p-4 flex flex-col items-center text-center shadow-md transform hover:-translate-y-1 transition-transform">
                  <img
                    src="https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=150"
                    alt="Charles James"
                    className="w-12 h-12 rounded-full object-cover border-2 border-white/80 shadow-sm"
                  />
                  <p className="text-xs font-bold mt-2 truncate w-full">Charles J.</p>
                  <p className="text-[10px] text-white/80">DS201</p>
                  <div className="mt-2 text-base font-black">99.76%</div>
                  <span className="mt-1 text-[10px] font-extrabold uppercase bg-white/20 px-2 py-0.5 rounded-full">
                    2nd
                  </span>
                </div>

                {/* 3rd Place - Warm Amber */}
                <div className="bg-[#F7B928] text-gray-900 rounded-2xl p-4 flex flex-col items-center text-center shadow-md transform hover:-translate-y-1 transition-transform">
                  <img
                    src="https://images.unsplash.com/photo-1527980965255-d3b416303d12?w=150"
                    alt="Mike Peter"
                    className="w-12 h-12 rounded-full object-cover border-2 border-gray-900/30 shadow-sm"
                  />
                  <p className="text-xs font-bold mt-2 truncate w-full">Mike Peter</p>
                  <p className="text-[10px] text-gray-700">ML301</p>
                  <div className="mt-2 text-base font-black">99.50%</div>
                  <span className="mt-1 text-[10px] font-extrabold uppercase bg-black/10 px-2 py-0.5 rounded-full">
                    3rd
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
