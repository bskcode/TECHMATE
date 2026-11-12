'use client';

import React, { useState, useEffect } from 'react';
import { Award, TrendingUp, User, ArrowUpRight, Printer, RefreshCw } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import { useApp } from '@/components/providers/app-provider';

export default function FacultyReportsPage() {
  const { getActiveUser, toast } = useApp();
  const activeFaculty = getActiveUser('faculty');

  const [courses, setCourses] = useState<any[]>([]);
  const [selectedCourseId, setSelectedCourseId] = useState<string>('');
  const [students, setStudents] = useState<any[]>([]);
  const [selectedStudentId, setSelectedStudentId] = useState<string>('');
  const [report, setReport] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function loadCourses() {
      const cRes = await fetch(`/api/courses?userId=${activeFaculty.id}&role=faculty`);
      const cData = await cRes.json();
      const list = cData.courses || [];
      setCourses(list);
      if (list[0]) {
        setSelectedCourseId(list[0].id);
        loadCourseStudents(list[0].id);
      } else {
        setSelectedCourseId('');
        setStudents([]);
        setSelectedStudentId('');
        setReport(null);
      }
    }
    loadCourses();
  }, [activeFaculty.id]);

  async function loadCourseStudents(courseId: string) {
    const res = await fetch(`/api/courses/${courseId}`);
    const data = await res.json();
    const enrolled = (data.enrollments || []).map((e: any) => e.student).filter(Boolean);
    setStudents(enrolled);
    if (enrolled[0]) {
      setSelectedStudentId(enrolled[0].id);
      loadReport(courseId, enrolled[0].id);
    } else {
      setSelectedStudentId('');
      setReport(null);
    }
  }

  async function loadReport(courseId: string, studentId: string, refresh = false) {
    if (!courseId || !studentId) return;
    setLoading(true);
    try {
      const res = await fetch(
        `/api/reports?courseId=${courseId}&studentId=${studentId}${refresh ? '&refresh=true' : ''}`
      );
      const data = await res.json();
      setReport(data.success ? data.report : null);
      if (refresh && data.success) toast('Report recalculated from latest attempts.', 'success');
    } finally {
      setLoading(false);
    }
  }

  const traitDetails = report?.trait_details || {};
  const chartData = Object.entries(traitDetails).map(([trait, info]: [string, any]) => ({
    trait: trait.charAt(0).toUpperCase() + trait.slice(1),
    improvement: info.delta,
    baseline: info.baseline,
    final: info.final,
    evidence: info.evidence_count,
    confidence: info.confidence,
  }));

  const selectedCourse = courses.find((c) => c.id === selectedCourseId);

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-gray-900 tracking-tight">Student Trait Improvement Reports</h1>
          <p className="text-sm text-gray-500 font-medium">
            Accreditation-grade comparative performance: Diagnostic Baseline vs Final Examination.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <select
            value={selectedCourseId}
            onChange={(e) => {
              setSelectedCourseId(e.target.value);
              loadCourseStudents(e.target.value);
            }}
            className="rounded-xl border border-gray-200 bg-white px-3 py-2 text-xs font-bold text-[#3E2D68] shadow-sm"
          >
            {courses.map((c) => (
              <option key={c.id} value={c.id}>
                {c.code}: {c.title}
              </option>
            ))}
          </select>

          <select
            value={selectedStudentId}
            onChange={(e) => {
              setSelectedStudentId(e.target.value);
              loadReport(selectedCourseId, e.target.value);
            }}
            className="rounded-xl border border-gray-200 bg-white px-3 py-2 text-xs font-bold text-gray-800 shadow-sm"
          >
            {students.length === 0 ? (
              <option value="">No enrolled students</option>
            ) : (
              students.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.full_name} ({s.email})
                </option>
              ))
            )}
          </select>

          <Button
            variant="outline"
            size="sm"
            disabled={!selectedStudentId || loading}
            onClick={() => loadReport(selectedCourseId, selectedStudentId, true)}
            className="rounded-xl text-xs font-bold bg-white"
          >
            <RefreshCw className={`w-3.5 h-3.5 mr-1.5 ${loading ? 'animate-spin' : ''}`} />
            Recalculate
          </Button>

          <Button
            variant="outline"
            size="sm"
            disabled={!report}
            onClick={() => window.print()}
            className="rounded-xl text-xs font-bold bg-white"
          >
            <Printer className="w-3.5 h-3.5 mr-1.5" />
            Print / PDF
          </Button>
        </div>
      </div>

      {report ? (
        <div className="space-y-6">
          {/* Top Score Comparison Banner */}
          <Card className="rounded-3xl border-none shadow-sm bg-gradient-to-br from-[#3E2D68] to-[#584193] text-white p-8">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 items-center">
              <div className="md:col-span-2 space-y-2">
                <div className="flex items-center space-x-2 text-purple-200 text-xs font-semibold">
                  <User className="w-4 h-4" />
                  <span>{report.student?.full_name || 'Student'}</span>
                  <span>•</span>
                  <span>{report.student?.email}</span>
                  <span>•</span>
                  <span>{selectedCourse?.code}</span>
                </div>
                <h2 className="text-3xl font-black tracking-tight">
                  {report.score_improvement >= 0 ? `+${report.score_improvement}` : report.score_improvement} Percentage Points
                </h2>
                <p className="text-xs text-purple-100 leading-relaxed max-w-lg">
                  {report.summary_narrative}
                </p>
              </div>

              <div className="bg-white/10 rounded-2xl p-4 text-center backdrop-blur-sm">
                <p className="text-[11px] font-bold text-purple-200 uppercase">Diagnostic Baseline</p>
                <p className="text-3xl font-black mt-1">{report.baseline_score}%</p>
              </div>

              <div className="bg-emerald-500/20 border border-emerald-400/30 rounded-2xl p-4 text-center backdrop-blur-sm">
                <p className="text-[11px] font-bold text-emerald-200 uppercase">Final Mastery</p>
                <div className="flex items-center justify-center space-x-1 mt-1">
                  <p className="text-3xl font-black text-emerald-300">{report.final_score}%</p>
                  <ArrowUpRight className="w-6 h-6 text-emerald-300" />
                </div>
              </div>
            </div>
          </Card>

          {/* Trait Growth Bar Chart + Evidence Table */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <Card className="lg:col-span-7 rounded-3xl border-none shadow-sm bg-white p-6">
              <CardHeader className="p-0 pb-4 border-b border-gray-50">
                <CardTitle className="text-base font-bold text-gray-900">
                  Bloom&apos;s Trait Delta (Percentage Points)
                </CardTitle>
              </CardHeader>
              <div className="h-72 w-full pt-4">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
                    <XAxis dataKey="trait" tick={{ fontSize: 11, fontWeight: 600 }} />
                    <YAxis tick={{ fontSize: 10 }} />
                    <Tooltip
                      formatter={(val: any) => [`${val >= 0 ? '+' : ''}${val} pp`, 'Growth']}
                      contentStyle={{ backgroundColor: '#1E293B', borderRadius: '12px', color: '#FFF' }}
                    />
                    <Bar dataKey="improvement" fill="#22C55E" radius={[8, 8, 0, 0]} maxBarSize={44} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </Card>

            <Card className="lg:col-span-5 rounded-3xl border-none shadow-sm bg-white p-6">
              <CardHeader className="p-0 pb-4 border-b border-gray-50 flex flex-row items-center justify-between">
                <CardTitle className="text-base font-bold text-gray-900">Evidence & Confidence</CardTitle>
                <Award className="w-5 h-5 text-emerald-600" />
              </CardHeader>
              <CardContent className="p-0 pt-4 space-y-3">
                {chartData.map((row) => (
                  <div
                    key={row.trait}
                    className="flex items-center justify-between p-3 rounded-2xl bg-[#F4F5FA] text-xs"
                  >
                    <div>
                      <p className="font-bold text-gray-900">{row.trait}</p>
                      <p className="text-[11px] text-gray-500">
                        {row.baseline}% → {row.final}% ({row.evidence} evidences)
                      </p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span
                        className={`font-black ${
                          row.improvement >= 0 ? 'text-emerald-600' : 'text-rose-600'
                        }`}
                      >
                        {row.improvement >= 0 ? `+${row.improvement}` : row.improvement}pp
                      </span>
                      <Badge
                        variant={
                          row.confidence === 'high'
                            ? 'emerald'
                            : row.confidence === 'moderate'
                            ? 'amber'
                            : 'secondary'
                        }
                        className="text-[10px] uppercase font-bold"
                      >
                        {row.confidence}
                      </Badge>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </div>
      ) : (
        <Card className="rounded-3xl border-dashed border-2 border-gray-200 bg-white p-12 text-center text-gray-400 text-xs">
          <TrendingUp className="w-10 h-10 mx-auto mb-3 text-gray-300" />
          <p className="font-bold text-gray-700">No report available for this student & course yet.</p>
          <p className="mt-1">Ensure the course has diagnostic/final assessments and the student has completed an attempt.</p>
        </Card>
      )}
    </div>
  );
}
