'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  BookOpen,
  CheckSquare,
  Sparkles,
  Award,
  TrendingUp,
  GraduationCap,
  ArrowRight,
  Clock,
  AlertCircle,
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
} from 'recharts';

export default function StudentDashboard() {
  const [courses, setCourses] = useState<any[]>([]);
  const [assessments, setAssessments] = useState<any[]>([]);
  const [interventions, setInterventions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const cRes = await fetch('/api/courses?userId=00000000-0000-0000-0000-000000000101&role=student');
        const cData = await cRes.json();
        setCourses(cData.courses || []);

        if (cData.courses?.[0]?.id) {
          const aRes = await fetch(`/api/courses/${cData.courses[0].id}/assessments?onlyPublished=true`);
          const aData = await aRes.json();
          setAssessments(aData.assessments || []);
        }

        const iRes = await fetch('/api/interventions?studentId=00000000-0000-0000-0000-000000000101&onlyReleased=true');
        const iData = await iRes.json();
        setInterventions(iData.interventions || []);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const traitRadarData = [
    { trait: 'Remembering', score: 100 },
    { trait: 'Understanding', score: 100 },
    { trait: 'Application', score: 100 },
    { trait: 'Analysis', score: 95 },
    { trait: 'Creativity', score: 85 },
    { trait: 'Evaluation', score: 80 },
  ];

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Top Welcome Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-gray-900 tracking-tight">Student Learning Journey</h1>
          <p className="text-sm text-gray-500 font-medium">
            Welcome, Branden! Your diagnostic assessment identified growth opportunities in Analysis and Creativity.
          </p>
        </div>

        <div className="flex items-center space-x-3">
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
        <Card className="rounded-2xl border-none shadow-sm bg-white overflow-hidden">
          <div className="h-1.5 w-full bg-[#FF6B72]" />
          <CardContent className="p-6 flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Enrolled Courses</p>
              <h3 className="text-3xl font-black text-gray-900 mt-1">{courses.length || 3}</h3>
              <p className="text-[11px] text-[#FF6B72] font-semibold mt-1">CS101, DS201, ML301</p>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-rose-50 text-[#FF6B72] flex items-center justify-center">
              <BookOpen className="w-6 h-6" />
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-2xl border-none shadow-sm bg-white overflow-hidden">
          <div className="h-1.5 w-full bg-[#3E2D68]" />
          <CardContent className="p-6 flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Diagnostic Baseline</p>
              <h3 className="text-3xl font-black text-gray-900 mt-1">70.8%</h3>
              <p className="text-[11px] text-[#3E2D68] font-semibold mt-1">Initial assessment</p>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-purple-50 text-[#3E2D68] flex items-center justify-center">
              <Clock className="w-6 h-6" />
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-2xl border-none shadow-sm bg-white overflow-hidden">
          <div className="h-1.5 w-full bg-[#22C55E]" />
          <CardContent className="p-6 flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Final Exam Score</p>
              <h3 className="text-3xl font-black text-gray-900 mt-1">93.3%</h3>
              <p className="text-[11px] text-emerald-600 font-semibold mt-1">Post-remediation test</p>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-[#22C55E] flex items-center justify-center">
              <Award className="w-6 h-6" />
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-2xl border-none shadow-sm bg-white overflow-hidden">
          <div className="h-1.5 w-full bg-[#F7B928]" />
          <CardContent className="p-6 flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Cognitive Growth</p>
              <h3 className="text-3xl font-black text-gray-900 mt-1">+22.5 pp</h3>
              <p className="text-[11px] text-amber-600 font-semibold mt-1">Across 6 Bloom traits</p>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-amber-50 text-[#F7B928] flex items-center justify-center">
              <TrendingUp className="w-6 h-6" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Grid: Left Tasks & Interventions, Right Trait Radar */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          {/* Active Remediation Alert */}
          {interventions.length > 0 && (
            <Card className="rounded-3xl border-2 border-purple-200 bg-gradient-to-r from-purple-50/80 to-indigo-50/60 p-6 shadow-sm">
              <div className="flex items-start justify-between">
                <div className="space-y-1.5">
                  <div className="flex items-center space-x-2">
                    <Sparkles className="w-4 h-4 text-[#7C3AED]" />
                    <span className="text-xs font-extrabold uppercase tracking-wider text-[#3E2D68]">
                      Faculty-Approved Remediation Available
                    </span>
                  </div>
                  <h3 className="text-base font-bold text-gray-900">
                    {interventions[0].material?.title || 'State Space Search & Heuristic Design'}
                  </h3>
                  <p className="text-xs text-gray-600 leading-relaxed">
                    Dr. Aris Thorne released a personalized study guide and practice quiz targeting your identified gaps in{' '}
                    <span className="font-bold underline">Analysis</span> and <span className="font-bold underline">Creativity</span>.
                  </p>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-purple-100 flex items-center justify-between">
                <span className="text-[11px] font-semibold text-purple-700">Includes 2 worked examples & practice quiz</span>
                <Link href="/student/interventions">
                  <Button size="sm" className="rounded-xl text-xs font-bold bg-[#3E2D68] text-white">
                    Start Learning <ArrowRight className="w-3.5 h-3.5 ml-1" />
                  </Button>
                </Link>
              </div>
            </Card>
          )}

          {/* Published Assessments List */}
          <Card className="rounded-3xl border-none shadow-sm bg-white overflow-hidden p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-gray-50">
              <CardTitle className="text-base font-bold text-gray-900">Course Assessments</CardTitle>
              <Badge variant="outline" className="text-xs font-bold">
                Progressive 2-Hint System Active
              </Badge>
            </div>

            <div className="space-y-3">
              {assessments.map((a) => (
                <div
                  key={a.id}
                  className="p-4 rounded-2xl border border-gray-100 hover:border-gray-200 bg-white flex items-center justify-between transition-all"
                >
                  <div className="space-y-1">
                    <div className="flex items-center space-x-2">
                      <Badge variant="secondary" className="text-[10px] uppercase font-bold text-[#3E2D68]">
                        {a.assessment_type}
                      </Badge>
                      <h4 className="text-xs font-bold text-gray-900">{a.title}</h4>
                    </div>
                    <div className="flex items-center space-x-3 text-[11px] text-gray-400 font-medium">
                      <span>{a.time_limit_minutes} mins</span>
                      <span>•</span>
                      <span>{a.max_marks} marks</span>
                      <span>•</span>
                      <span className="text-purple-600 font-semibold">2 progressive hints</span>
                    </div>
                  </div>

                  <Link href={`/student/assessments`}>
                    <Button size="sm" className="rounded-xl text-xs font-bold bg-[#3E2D68]">
                      Enter Exam Room
                    </Button>
                  </Link>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Right Column (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          {/* Cognitive Trait Radar */}
          <Card className="rounded-3xl border-none shadow-sm bg-white overflow-hidden p-6">
            <CardHeader className="p-0 pb-4 border-b border-gray-50 flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-base font-bold text-gray-900">My Trait Mastery Radar</CardTitle>
                <p className="text-xs text-gray-400">Current proficiency across Bloom dimensions</p>
              </div>
              <Badge variant="emerald" className="text-xs font-bold">
                Post-Remediation
              </Badge>
            </CardHeader>

            <div className="h-64 w-full pt-4">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart data={traitRadarData}>
                  <PolarGrid stroke="#E2E8F0" />
                  <PolarAngleAxis dataKey="trait" tick={{ fill: '#334155', fontSize: 10, fontWeight: 700 }} />
                  <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fontSize: 9 }} />
                  <Radar
                    name="My Score"
                    dataKey="score"
                    stroke="#22C55E"
                    fill="#10B981"
                    fillOpacity={0.35}
                  />
                </RadarChart>
              </ResponsiveContainer>
            </div>

            <div className="mt-4 pt-3 border-t border-gray-50 flex items-center justify-between text-xs">
              <span className="text-gray-500 font-medium">Strongest Trait:</span>
              <span className="font-bold text-emerald-600">Remembering & Application (100%)</span>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
