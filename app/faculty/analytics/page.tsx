'use client';

import React, { useState, useEffect } from 'react';
import {
  BarChart3,
  Users,
  AlertTriangle,
  Sparkles,
  ArrowRight,
  ShieldAlert,
  Award,
  Layers,
  Download,
  CheckCircle2,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useApp } from '@/components/providers/app-provider';
import {
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
} from 'recharts';

export default function FacultyAnalyticsPage() {
  const { getActiveUser, toast } = useApp();
  const activeFaculty = getActiveUser('faculty');

  const [courses, setCourses] = useState<any[]>([]);
  const [selectedCourseId, setSelectedCourseId] = useState<string>('');
  const [analytics, setAnalytics] = useState<any>(null);
  const [generatingForStudent, setGeneratingForStudent] = useState<string | null>(null);
  const [generatedStudentIds, setGeneratedStudentIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    async function loadCourses() {
      const res = await fetch(`/api/courses?userId=${activeFaculty.id}&role=faculty`);
      const data = await res.json();
      setCourses(data.courses || []);
      if (data.courses?.[0]) {
        setSelectedCourseId(data.courses[0].id);
        loadAnalytics(data.courses[0].id);
      } else {
        setSelectedCourseId('');
        setAnalytics(null);
      }
    }
    loadCourses();
  }, [activeFaculty.id]);

  async function loadAnalytics(courseId: string) {
    const res = await fetch(`/api/courses/${courseId}/analytics`);
    const data = await res.json();
    setAnalytics(data.analytics);
  }

  const handleGenerateIntervention = async (studentId: string, weakTraits: string[]) => {
    setGeneratingForStudent(studentId);
    try {
      const res = await fetch('/api/interventions/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          student_id: studentId,
          course_id: selectedCourseId,
          weak_traits: weakTraits.length ? weakTraits : ['analysis', 'creativity'],
        }),
      });

      const data = await res.json();
      if (data.success) {
        setGeneratedStudentIds((prev) => {
          const next = new Set(prev);
          next.add(studentId);
          return next;
        });
        toast('Personalized remediation package generated! Sent to Interventions tab for approval.', 'success');
        await loadAnalytics(selectedCourseId);
      } else {
        toast(data.error || 'Failed to generate intervention', 'error');
      }
    } catch (err: any) {
      toast(`Error: ${err.message}`, 'error');
    } finally {
      setGeneratingForStudent(null);
    }
  };

  const handleExportCsv = () => {
    if (!analytics?.traitData) return;
    const rows = [
      ['Trait', 'Class Average (%)'],
      ...analytics.traitData.map((t: any) => [t.trait, String(t.classAverage)]),
    ];
    const csv = rows.map((r) => r.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `class-analytics-${selectedCourseId}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast('Exported analytics CSV.', 'success');
  };

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-gray-900 tracking-tight">Class Cognitive & Trait Analytics</h1>
          <p className="text-sm text-gray-500 font-medium">
            Analyze class-wide Bloom taxonomy mastery, track evidence metrics, and trigger automated remediation.
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Course:</span>
          <select
            value={selectedCourseId}
            onChange={(e) => {
              setSelectedCourseId(e.target.value);
              loadAnalytics(e.target.value);
            }}
            className="rounded-xl border border-gray-200 bg-white px-3 py-2 text-xs font-bold text-[#3E2D68] focus:outline-none focus:border-[#3E2D68] shadow-sm"
          >
            {courses.map((c) => (
              <option key={c.id} value={c.id}>
                {c.code}: {c.title}
              </option>
            ))}
          </select>
          <Button
            onClick={handleExportCsv}
            variant="outline"
            size="sm"
            className="rounded-xl text-xs font-bold bg-white"
          >
            <Download className="w-3.5 h-3.5 mr-1.5" /> Export CSV
          </Button>
        </div>
      </div>

      {/* Grid: Radar vs Bar */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Bloom's Trait Radar (6 cols) */}
        <div className="lg:col-span-6 space-y-4">
          <Card className="rounded-3xl border-none shadow-sm bg-white overflow-hidden p-6">
            <CardHeader className="p-0 pb-4 border-b border-gray-50 flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-base font-bold text-gray-900">Cognitive Trait Profile (Radar)</CardTitle>
                <p className="text-xs text-gray-400">Class aggregate percentage across Bloom&apos;s 6 dimensions</p>
              </div>
              <Badge variant="secondary" className="text-xs font-bold text-[#3E2D68]">
                Diagnostic Baseline
              </Badge>
            </CardHeader>

            <div className="h-72 w-full pt-4">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart data={analytics?.traitData || []}>
                  <PolarGrid stroke="#E2E8F0" />
                  <PolarAngleAxis dataKey="trait" tick={{ fill: '#334155', fontSize: 11, fontWeight: 700 }} />
                  <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fontSize: 9 }} />
                  <Radar
                    name="Class Score"
                    dataKey="classAverage"
                    stroke="#3E2D68"
                    fill="#7C3AED"
                    fillOpacity={0.4}
                  />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </div>

        {/* Trait Breakdown Bar Chart (6 cols) */}
        <div className="lg:col-span-6 space-y-4">
          <Card className="rounded-3xl border-none shadow-sm bg-white overflow-hidden p-6">
            <CardHeader className="p-0 pb-4 border-b border-gray-50 flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-base font-bold text-gray-900">Trait Mastery Breakdown</CardTitle>
                <p className="text-xs text-gray-400">Comparing proficiency across cognitive levels</p>
              </div>
              <Badge variant="outline" className="text-xs">
                Threshold: 60%
              </Badge>
            </CardHeader>

            <div className="h-72 w-full pt-4">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={analytics?.traitData || []}
                  layout="vertical"
                  margin={{ left: 20, right: 20 }}
                >
                  <XAxis type="number" domain={[0, 100]} tick={{ fontSize: 10 }} />
                  <YAxis dataKey="trait" type="category" tick={{ fontSize: 11, fontWeight: 600 }} />
                  <Tooltip
                    formatter={(val) => [`${val}%`, 'Class Average']}
                    contentStyle={{ backgroundColor: '#1E293B', borderRadius: '12px', color: '#FFF' }}
                  />
                  <Bar dataKey="classAverage" fill="#3E2D68" radius={[0, 6, 6, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </div>
      </div>

      {/* Students Requiring Intervention Card */}
      <Card className="rounded-3xl border-none shadow-sm bg-white overflow-hidden">
        <CardHeader className="flex flex-row items-center justify-between pb-3 border-b border-gray-50">
          <div className="flex items-center space-x-2">
            <AlertTriangle className="w-5 h-5 text-amber-500" />
            <CardTitle className="text-base font-bold text-gray-900">
              Students Requiring Personalized Remediation
            </CardTitle>
          </div>
          <Badge variant="amber" className="text-xs font-bold">
            Action Recommended
          </Badge>
        </CardHeader>

        <CardContent className="pt-4 divide-y divide-gray-100">
          {analytics?.studentsNeedingIntervention?.length === 0 ? (
            <div className="py-8 text-center text-xs text-gray-400">
              All students meet or exceed cognitive trait mastery thresholds.
            </div>
          ) : (
            analytics?.studentsNeedingIntervention?.map((item: any) => (
              <div key={item.student.id} className="py-4 first:pt-0 flex items-center justify-between gap-4">
                <div className="flex items-center space-x-3">
                  <img
                    src={item.student.avatar_url || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150'}
                    alt={item.student.full_name}
                    className="w-10 h-10 rounded-full object-cover border"
                  />
                  <div>
                    <h4 className="text-xs font-bold text-gray-900">{item.student.full_name}</h4>
                    <p className="text-[11px] text-gray-400">{item.student.email}</p>
                    <div className="flex items-center space-x-1.5 mt-1">
                      <span className="text-[10px] text-gray-500 font-semibold">Identified Gaps:</span>
                      {item.weakTraits.map((t: string) => (
                        <Badge key={t} variant="destructive" className="text-[9px] uppercase px-1.5 py-0 font-bold">
                          {t}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <div className="text-right">
                    <p className="text-xs font-black text-gray-900">{item.latestScore.toFixed(1)}%</p>
                    <p className="text-[10px] text-gray-400 font-medium">Diagnostic Baseline</p>
                  </div>

                  {(() => {
                    const isRemediated = Boolean(item.hasIntervention) || generatedStudentIds.has(item.student.id);
                    const isGenerating = generatingForStudent === item.student.id;
                    const isDisabled = isRemediated || isGenerating;

                    return (
                      <Button
                        size="sm"
                        disabled={isDisabled}
                        onClick={() => handleGenerateIntervention(item.student.id, item.weakTraits)}
                        className={`rounded-xl text-xs font-bold flex items-center space-x-1.5 transition-all ${
                          isRemediated
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-300 cursor-not-allowed opacity-90'
                            : 'bg-[#3E2D68] hover:bg-[#322454] text-white'
                        }`}
                      >
                        {isGenerating ? (
                          <>
                            <Sparkles className="w-3.5 h-3.5 text-amber-300 animate-spin" />
                            <span>Generating...</span>
                          </>
                        ) : isRemediated ? (
                          <>
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                            <span>Remediation Generated</span>
                          </>
                        ) : (
                          <>
                            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                            <span>Generate Remediation</span>
                          </>
                        )}
                      </Button>
                    );
                  })()}
                </div>
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  );
}

