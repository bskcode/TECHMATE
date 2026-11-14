'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  BookOpen,
  CheckSquare,
  Sparkles,
  Award,
  TrendingUp,
  ArrowRight,
  Clock,
  Lightbulb,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  Legend,
  Tooltip,
} from 'recharts';
import { useApp } from '@/components/providers/app-provider';

export default function StudentDashboard() {
  const { getActiveUser } = useApp();
  const activeStudent = getActiveUser('student');

  const [courses, setCourses] = useState<any[]>([]);
  const [selectedCourseId, setSelectedCourseId] = useState<string>('');
  const [assessments, setAssessments] = useState<any[]>([]);
  const [interventions, setInterventions] = useState<any[]>([]);
  const [report, setReport] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      try {
        const [cRes, iRes] = await Promise.all([
          fetch(`/api/courses?userId=${activeStudent.id}&role=student`),
          fetch(`/api/interventions?studentId=${activeStudent.id}&onlyReleased=true`),
        ]);
        const [cData, iData] = await Promise.all([cRes.json(), iRes.json()]);
        const courseList = cData.courses || [];
        const allList = cData.allCourses || [];
        // Combine enrolled and available faculty courses
        const merged = [...courseList];
        allList.forEach((ac: any) => {
          if (!merged.some((c: any) => c.id === ac.id)) {
            merged.push(ac);
          }
        });
        setCourses(merged);
        setInterventions(iData.interventions || []);

        if (merged[0]?.id) {
          setSelectedCourseId(merged[0].id);
        } else {
          setSelectedCourseId('');
          setAssessments([]);
          setReport(null);
        }
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [activeStudent.id]);

  useEffect(() => {
    if (!selectedCourseId) return;
    async function loadCourseContext() {
      const [aRes, rRes] = await Promise.all([
        fetch(`/api/courses/${selectedCourseId}/assessments?onlyPublished=true`),
        fetch(`/api/reports?courseId=${selectedCourseId}&studentId=${activeStudent.id}`),
      ]);
      const [aData, rData] = await Promise.all([aRes.json(), rRes.json()]);
      setAssessments(aData.assessments || []);
      setReport(rData.success ? rData.report : null);
    }
    loadCourseContext();
  }, [selectedCourseId, activeStudent.id]);

  const traitDetails = report?.trait_details || {};
  const traitRadarData = Object.entries(traitDetails).map(([trait, info]: [string, any]) => ({
    trait: trait.charAt(0).toUpperCase() + trait.slice(1),
    diagnostic: info.baseline ?? 0,
    progressive: info.progressive ?? info.baseline ?? 0,
    final: info.final ?? info.progressive ?? 0,
    score: info.progressive ?? info.final ?? 0,
  }));

  const sortedTraits = [...traitRadarData].sort((a, b) => b.score - a.score);
  const topTraits = sortedTraits.slice(0, 2);
  const growthTraits = [...traitRadarData].sort((a, b) => a.score - b.score).slice(0, 2);
  const firstName = activeStudent.full_name.split(' ')[0];

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Top Welcome Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-gray-900 tracking-tight">Student Learning Journey</h1>
          <p className="text-sm text-gray-500 font-medium">
            Welcome, {firstName}!{' '}
            {growthTraits.length > 0 && report
              ? `Your cognitive profile highlights growth opportunities in ${growthTraits.map((t) => t.trait).join(' and ')}.`
              : 'Complete a diagnostic assessment to unlock your personalized cognitive profile.'}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {courses.length > 0 && (
            <select
              value={selectedCourseId}
              onChange={(e) => setSelectedCourseId(e.target.value)}
              className="bg-white border border-gray-200 rounded-xl px-3 py-2 text-xs font-bold text-[#3E2D68] shadow-sm"
            >
              {courses.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.code}: {c.title}
                </option>
              ))}
            </select>
          )}
          <Link href="/student/assessments">
            <Button className="rounded-xl text-xs font-bold bg-[#3E2D68] shadow-sm flex items-center space-x-1.5">
              <CheckSquare className="w-4 h-4 text-purple-300" />
              <span>Take Assessment</span>
            </Button>
          </Link>
          <Link href="/student/interventions">
            <Button variant="outline" className="rounded-xl text-xs font-semibold bg-white shadow-sm flex items-center space-x-1.5">
              <Sparkles className="w-4 h-4 text-amber-500" />
              <span>Personalized Study</span>
            </Button>
          </Link>
        </div>
      </div>

      {/* 4 Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <Card className="rounded-2xl border-none shadow-sm bg-white overflow-hidden flex">
          <div className="w-1.5 shrink-0 bg-[#FF6B72] rounded-l-2xl" />
          <CardContent className="p-5 flex items-center justify-between flex-1">
            <div>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Enrolled Courses</p>
              <h3 className="text-3xl font-black text-gray-900 mt-1">{loading ? '…' : courses.length}</h3>
              <p className="text-[11px] text-[#FF6B72] font-semibold mt-1 truncate max-w-[140px]">
                {courses.map((c) => c.code).join(', ') || 'None enrolled'}
              </p>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-rose-50 text-[#FF6B72] flex items-center justify-center">
              <BookOpen className="w-6 h-6" />
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-2xl border-none shadow-sm bg-white overflow-hidden flex">
          <div className="w-1.5 shrink-0 bg-[#3E2D68] rounded-l-2xl" />
          <CardContent className="p-5 flex items-center justify-between flex-1">
            <div>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Diagnostic Baseline</p>
              <h3 className="text-3xl font-black text-gray-900 mt-1">
                {report ? `${report.baseline_score}%` : '—'}
              </h3>
              <p className="text-[11px] text-[#3E2D68] font-semibold mt-1">Initial assessment</p>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-purple-50 text-[#3E2D68] flex items-center justify-center">
              <Clock className="w-6 h-6" />
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-2xl border-none shadow-sm bg-white overflow-hidden flex">
          <div className="w-1.5 shrink-0 bg-[#F7B928] rounded-l-2xl" />
          <CardContent className="p-5 flex items-center justify-between flex-1">
            <div>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Latest Mastery</p>
              <h3 className="text-3xl font-black text-gray-900 mt-1">
                {report ? `${report.final_score}%` : '—'}
              </h3>
              <p className="text-[11px] text-amber-600 font-semibold mt-1">
                {assessments.length} published exam(s)
              </p>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-amber-50 text-[#F7B928] flex items-center justify-center">
              <Award className="w-6 h-6" />
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-2xl border-none shadow-sm bg-white overflow-hidden flex">
          <div className="w-1.5 shrink-0 bg-[#22C55E] rounded-l-2xl" />
          <CardContent className="p-5 flex items-center justify-between flex-1">
            <div>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Cognitive Growth</p>
              <h3 className="text-3xl font-black text-gray-900 mt-1">
                {report ? `${report.score_improvement >= 0 ? '+' : ''}${report.score_improvement} pp` : '—'}
              </h3>
              <p className="text-[11px] text-emerald-600 font-semibold mt-1">
                {interventions.length} study plan(s) active
              </p>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-[#22C55E] flex items-center justify-center">
              <TrendingUp className="w-6 h-6" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left: Next Action & Assessments (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          <Card className="rounded-3xl border-none shadow-sm bg-gradient-to-br from-[#3E2D68] to-[#56408D] text-white overflow-hidden">
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div className="space-y-2">
                  <Badge className="bg-amber-400 text-amber-950 font-bold text-[10px] uppercase">
                    {interventions.length > 0 ? 'Personalized Study Plan Ready' : 'Diagnostic Pathway'}
                  </Badge>
                  <h3 className="text-lg font-extrabold tracking-tight">
                    {interventions[0]?.material?.title || 'Start Your Adaptive Learning Loop'}
                  </h3>
                  <p className="text-xs text-purple-100 leading-relaxed max-w-lg">
                    {interventions[0]?.material?.learning_gap_summary ||
                      'Take your published diagnostic assessment with 2 progressive hints to build your personalized Bloom taxonomy study plan.'}
                  </p>
                </div>
                <Sparkles className="w-8 h-8 text-amber-300 shrink-0" />
              </div>

              <div className="mt-5 flex items-center space-x-3">
                <Link href={interventions.length > 0 ? '/student/interventions' : '/student/assessments'}>
                  <Button size="sm" className="rounded-xl bg-white text-[#3E2D68] hover:bg-purple-50 text-xs font-bold">
                    <span>{interventions.length > 0 ? 'Open Study Material' : 'Go to Assessments'}</span>
                    <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
                  </Button>
                </Link>
                {interventions.length > 0 && (
                  <Link href="/student/practice">
                    <Button size="sm" variant="ghost" className="rounded-xl text-white hover:bg-white/10 text-xs font-semibold">
                      Take Practice Quiz
                    </Button>
                  </Link>
                )}
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-3xl border-none shadow-sm bg-white overflow-hidden">
            <CardHeader className="pb-3 border-b border-gray-50 flex flex-row items-center justify-between">
              <CardTitle className="text-base font-bold text-gray-900">Available Assessments</CardTitle>
              <Link href="/student/assessments" className="text-xs font-bold text-[#3E2D68] hover:underline">
                Go to Exam Room →
              </Link>
            </CardHeader>
            <CardContent className="pt-4 space-y-3">
              {assessments.length === 0 ? (
                <p className="text-xs text-gray-400 text-center py-6">No published assessments in this course yet.</p>
              ) : (
                assessments.map((a) => (
                  <div
                    key={a.id}
                    className="p-4 rounded-2xl bg-[#F4F5FA] flex items-center justify-between hover:bg-purple-50/50 transition-colors"
                  >
                    <div>
                      <div className="flex items-center space-x-2">
                        <h4 className="text-xs font-bold text-gray-900">{a.title}</h4>
                        <Badge variant="outline" className="text-[10px] uppercase">
                          {a.assessment_type}
                        </Badge>
                      </div>
                      <p className="text-[11px] text-gray-500 mt-1">
                        {a.time_limit_minutes} mins · {a.max_marks} Marks · {a.questions_count ?? 0} Questions · 2 Hints Enabled
                      </p>
                    </div>
                    <Link href="/student/assessments">
                      <Button size="sm" className="rounded-xl text-xs font-bold bg-[#3E2D68]">
                        Start
                      </Button>
                    </Link>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right: Bloom's Trait Radar (5 cols) */}
        <div className="lg:col-span-5">
          <Card className="rounded-3xl border-none shadow-sm bg-white overflow-hidden p-6">
            <CardHeader className="p-0 pb-3 border-b border-gray-50 flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-base font-bold text-gray-900">Your Cognitive Trait Radar</CardTitle>
                <p className="text-xs text-gray-400">6-Dimensional Bloom Mastery Profile</p>
              </div>
              <Link href="/student/traits" className="text-xs font-bold text-[#3E2D68] hover:underline">
                Details
              </Link>
            </CardHeader>

            {traitRadarData.length === 0 ? (
              <div className="h-64 flex items-center justify-center text-xs text-gray-400 text-center">
                Complete an assessment to view your Bloom&apos;s Taxonomy radar.
              </div>
            ) : (
              <div className="h-64 w-full pt-2">
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart data={traitRadarData} margin={{ top: 10, right: 10, bottom: 10, left: 10 }}>
                    <PolarGrid stroke="#E2E8F0" />
                    <PolarAngleAxis dataKey="trait" tick={{ fill: '#334155', fontSize: 10, fontWeight: 700 }} />
                    <PolarRadiusAxis domain={[0, 100]} tick={{ fontSize: 9 }} />
                    <Tooltip
                      formatter={(val: any, name: string) => [`${val}%`, name]}
                      contentStyle={{ backgroundColor: '#1E293B', borderRadius: '12px', color: '#FFF' }}
                    />
                    <Legend wrapperStyle={{ fontSize: '10px', fontWeight: 600, paddingTop: '6px' }} />
                    <Radar
                      name="Diagnostic"
                      dataKey="diagnostic"
                      stroke="#6366F1"
                      fill="#6366F1"
                      fillOpacity={0.25}
                    />
                    <Radar
                      name="Progressive"
                      dataKey="progressive"
                      stroke="#A855F7"
                      fill="#A855F7"
                      fillOpacity={0.4}
                    />
                  </RadarChart>
                </ResponsiveContainer>
              </div>
            )}

            {topTraits.length > 0 && (
              <div className="mt-4 p-3 rounded-2xl bg-emerald-50 border border-emerald-200/60 flex items-start space-x-2 text-xs text-emerald-900">
                <Lightbulb className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <p className="leading-relaxed">
                  Strongest dimensions:{' '}
                  <span className="font-bold">
                    {topTraits.map((t) => `${t.trait} (${t.score}%)`).join(' & ')}
                  </span>.
                </p>
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}
