'use client';

import React, { useState, useEffect } from 'react';
import { Award, TrendingUp, User, ArrowUpRight, Printer, RefreshCw } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, Legend } from 'recharts';
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
    progressive: info.progressive ?? info.baseline,
    final: info.final,
    progressive_delta: info.progressive_delta ?? 0,
    final_delta: info.final_delta ?? 0,
    delta: info.delta,
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
            3-Stage Cognitive Mastery: Diagnostic Baseline → Progressive Formative → Final Examination.
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
          {/* Top Score Comparison Banner: 3-Stage Mastery Progression & Learning Gain (G) */}
          <Card className="rounded-3xl border-none shadow-sm bg-gradient-to-br from-[#3E2D68] to-[#584193] text-white p-6 sm:p-8">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
              <div className="lg:col-span-4 space-y-2">
                <div className="flex items-center space-x-2 text-purple-200 text-xs font-semibold">
                  <User className="w-4 h-4" />
                  <span>{report.student?.full_name || 'Student'}</span>
                  <span>•</span>
                  <span>{report.student?.email}</span>
                  <span>•</span>
                  <span>{selectedCourse?.code}</span>
                </div>
                <h2 className="text-2xl sm:text-3xl font-black tracking-tight">
                  {report.score_improvement >= 0 ? `+${report.score_improvement}` : report.score_improvement} Percentage Points
                </h2>
                <p className="text-xs text-purple-100 leading-relaxed max-w-lg">
                  {report.summary_narrative}
                </p>
              </div>

              <div className="lg:col-span-8 grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                {/* Stage 1: Diagnostic Baseline */}
                <div className="bg-white/10 rounded-2xl p-3.5 text-center backdrop-blur-sm border border-white/10 flex flex-col justify-between">
                  <p className="text-[10px] font-bold text-purple-200 uppercase tracking-wider">1. Diagnostic</p>
                  <p className="text-xl sm:text-2xl font-black my-1 text-white">{report.baseline_score}%</p>
                  <span className="inline-block px-1.5 py-0.5 rounded-full text-[9px] font-semibold bg-white/10 text-purple-200">
                    Pre-Intervention
                  </span>
                </div>

                {/* Stage 2: Progressive Assessment */}
                <div className="bg-purple-400/20 rounded-2xl p-3.5 text-center backdrop-blur-sm border border-purple-300/30 flex flex-col justify-between">
                  <p className="text-[10px] font-bold text-purple-200 uppercase tracking-wider">2. Progressive</p>
                  <p className="text-xl sm:text-2xl font-black my-1 text-purple-200">
                    {report.progressive_score !== undefined ? `${report.progressive_score}%` : 'N/A'}
                  </p>
                  <span className="inline-block px-1.5 py-0.5 rounded-full text-[9px] font-bold bg-purple-300/30 text-purple-100">
                    {report.progressive_improvement !== undefined ? `${report.progressive_improvement >= 0 ? '+' : ''}${report.progressive_improvement} pp` : 'In Progress'}
                  </span>
                </div>

                {/* Normalized Learning Gain (G) */}
                <div className="bg-gradient-to-br from-amber-500/20 to-emerald-500/20 rounded-2xl p-3.5 text-center backdrop-blur-sm border border-emerald-400/30 flex flex-col justify-between">
                  <div className="flex items-center justify-center space-x-1">
                    <p className="text-[10px] font-bold text-amber-200 uppercase tracking-wider">Gain (G)</p>
                  </div>
                  <p className="text-xl sm:text-2xl font-black my-1 text-emerald-300">
                    {report.learning_gain_g !== undefined ? `+${report.learning_gain_g}%` : `${report.score_improvement >= 0 ? '+' : ''}${report.score_improvement}%`}
                  </p>
                  <span className="inline-block px-1.5 py-0.5 rounded-full text-[9px] font-bold bg-emerald-400/30 text-emerald-200 truncate" title="G = (Progressive - Diagnostic) / Max Score">
                    {report.learning_gain_interpretation?.split(' ')[0] || 'High'} Gain
                  </span>
                </div>

                {/* Stage 3: Final Mastery */}
                <div className="bg-emerald-500/20 border border-emerald-400/40 rounded-2xl p-3.5 text-center backdrop-blur-sm flex flex-col justify-between">
                  <p className="text-[10px] font-bold text-emerald-200 uppercase tracking-wider">3. Final Mastery</p>
                  <div className="flex items-center justify-center space-x-0.5 my-1">
                    <p className="text-xl sm:text-2xl font-black text-emerald-300">{report.final_score}%</p>
                    <ArrowUpRight className="w-4 h-4 text-emerald-300" />
                  </div>
                  <span className="inline-block px-1.5 py-0.5 rounded-full text-[9px] font-bold bg-emerald-500/30 text-emerald-200">
                    {report.score_improvement >= 0 ? `+${report.score_improvement}` : report.score_improvement} pp Net
                  </span>
                </div>
              </div>
            </div>
          </Card>

          {/* Placement Preparedness & Practice Quiz Performance Widget */}
          {report.practice_quiz_performance && (
            <Card className="rounded-3xl border-none shadow-sm bg-white p-6 sm:p-7 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between pb-3 border-b border-gray-100 gap-3">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-2xl bg-indigo-50 text-indigo-700 flex items-center justify-center font-bold">
                    <Award className="w-5 h-5 text-[#3E2D68]" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-gray-900">
                      Placement Practice Quiz &amp; Technical Preparedness
                    </h3>
                    <p className="text-xs text-gray-500">
                      Evaluates student performance on placement-grade technical MCQ challenges (minimum 5 questions).
                    </p>
                  </div>
                </div>

                <Badge
                  variant="secondary"
                  className={`text-xs font-bold px-3 py-1 ${
                    report.practice_quiz_performance.placement_readiness_level === 'Placement Ready (Distinction)'
                      ? 'bg-emerald-100 text-emerald-800'
                      : report.practice_quiz_performance.placement_readiness_level === 'Placement Competitive'
                      ? 'bg-indigo-100 text-indigo-800'
                      : 'bg-amber-100 text-amber-800'
                  }`}
                >
                  {report.practice_quiz_performance.placement_readiness_level}
                </Badge>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 pt-1">
                <div className="bg-[#F8F9FD] rounded-2xl p-4 border border-gray-100 text-center">
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Placement Accuracy</p>
                  <p className="text-2xl font-black text-gray-900 mt-1">
                    {report.practice_quiz_performance.accuracy_percentage}%
                  </p>
                  <span className="text-[10px] text-gray-500">
                    {report.practice_quiz_performance.total_correct} / {report.practice_quiz_performance.total_attempted} correct
                  </span>
                </div>

                <div className="bg-[#F8F9FD] rounded-2xl p-4 border border-gray-100 text-center">
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Questions Assigned</p>
                  <p className="text-2xl font-black text-[#3E2D68] mt-1">
                    {report.practice_quiz_performance.total_assigned}
                  </p>
                  <span className="text-[10px] text-gray-500">Targeted placement MCQs</span>
                </div>

                <div className="bg-[#F8F9FD] rounded-2xl p-4 border border-gray-100 text-center">
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Attempted by Student</p>
                  <p className="text-2xl font-black text-emerald-600 mt-1">
                    {report.practice_quiz_performance.total_attempted}
                  </p>
                  <span className="text-[10px] text-gray-500">
                    {report.practice_quiz_performance.total_assigned > 0
                      ? `${Math.round((report.practice_quiz_performance.total_attempted / report.practice_quiz_performance.total_assigned) * 100)}% completion`
                      : '0% completion'}
                  </span>
                </div>

                <div className="bg-[#F8F9FD] rounded-2xl p-4 border border-gray-100 text-center flex flex-col justify-center">
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Placement Status</p>
                  <p className="text-sm font-black text-indigo-900 mt-1">
                    {report.practice_quiz_performance.accuracy_percentage >= 80 ? 'Corporate Caliber' : 'Technical Review'}
                  </p>
                  <span className="text-[10px] text-gray-500">Campus interview grade</span>
                </div>
              </div>

              <div className="p-3.5 rounded-2xl bg-indigo-50/60 border border-indigo-100/70 text-xs text-indigo-950 flex items-start space-x-2.5">
                <span className="font-bold text-indigo-800 shrink-0">Placement Assessment Note:</span>
                <p className="text-[11px] leading-relaxed">
                  {report.practice_quiz_performance.placement_readiness_summary}
                </p>
              </div>
            </Card>
          )}

          {/* Trait Growth Grouped Bar Chart + Evidence Table */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <Card className="lg:col-span-7 rounded-3xl border-none shadow-sm bg-white p-6">
              <CardHeader className="p-0 pb-4 border-b border-gray-50 flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="text-base font-bold text-gray-900">
                    Bloom&apos;s Traits Mastery Progression
                  </CardTitle>
                  <p className="text-xs text-gray-400 mt-0.5">
                    Comparative scores: Diagnostic Baseline vs Progressive Formative vs Final Mastery
                  </p>
                </div>
                <Badge variant="secondary" className="text-[10px] font-bold uppercase bg-indigo-100 text-indigo-800">
                  3-Stage Trajectory
                </Badge>
              </CardHeader>
              <div className="h-80 w-full pt-4">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData} margin={{ top: 15, right: 15, left: -10, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
                    <XAxis dataKey="trait" tick={{ fontSize: 11, fontWeight: 600 }} />
                    <YAxis domain={[0, 100]} tick={{ fontSize: 10 }} unit="%" />
                    <Tooltip
                      formatter={(val: any, name: string) => [`${val}%`, name]}
                      contentStyle={{ backgroundColor: '#1E293B', borderRadius: '12px', color: '#FFF' }}
                    />
                    <Legend
                      verticalAlign="top"
                      wrapperStyle={{ paddingBottom: '10px', fontSize: '11px', fontWeight: 600 }}
                    />
                    <Bar dataKey="baseline" name="Diagnostic Baseline" fill="#6366F1" radius={[4, 4, 0, 0]} maxBarSize={22} />
                    <Bar dataKey="progressive" name="Progressive Assessment" fill="#A855F7" radius={[4, 4, 0, 0]} maxBarSize={22} />
                    <Bar dataKey="final" name="Final Examination" fill="#22C55E" radius={[4, 4, 0, 0]} maxBarSize={22} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </Card>

            <Card className="lg:col-span-5 rounded-3xl border-none shadow-sm bg-white p-6">
              <CardHeader className="p-0 pb-4 border-b border-gray-50 flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="text-base font-bold text-gray-900">Bloom&apos;s Traits Delta</CardTitle>
                  <p className="text-xs text-gray-400 mt-0.5">Stage-by-stage percentage points progression</p>
                </div>
                <Award className="w-5 h-5 text-emerald-600" />
              </CardHeader>
              <CardContent className="p-0 pt-4 space-y-3">
                {chartData.map((row) => (
                  <div
                    key={row.trait}
                    className="flex flex-col p-3 rounded-2xl bg-[#F4F5FA] text-xs space-y-2 border border-gray-100"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <span className="w-2.5 h-2.5 rounded-full bg-[#3E2D68]" />
                        <p className="font-bold text-gray-900 text-sm">{row.trait}</p>
                      </div>
                      <div className="flex items-center space-x-1.5">
                        <span
                          className={`font-black text-sm ${
                            row.delta >= 0 ? 'text-emerald-600' : 'text-rose-600'
                          }`}
                        >
                          {row.delta >= 0 ? `+${row.delta}` : row.delta} pp
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

                    <div className="flex flex-wrap items-center justify-between text-[11px] text-gray-600 pt-1.5 border-t border-gray-200/60 gap-1">
                      <div className="flex flex-wrap items-center gap-1.5 font-medium">
                        <span className="px-1.5 py-0.5 rounded bg-indigo-50 text-indigo-700 font-semibold">
                          Diag: {row.baseline}%
                        </span>
                        <span>→</span>
                        <span className="px-1.5 py-0.5 rounded bg-purple-50 text-purple-700 font-semibold">
                          Prog: {row.progressive}% ({row.progressive_delta >= 0 ? `+${row.progressive_delta}` : row.progressive_delta} pp)
                        </span>
                        <span>→</span>
                        <span className="px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-700 font-semibold">
                          Final: {row.final}% ({row.final_delta >= 0 ? `+${row.final_delta}` : row.final_delta} pp)
                        </span>
                      </div>
                      <span className="text-gray-400 text-[10px]">({row.evidence} evidences)</span>
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
          <p className="font-bold text-gray-700">No report available for this student &amp; course yet.</p>
          <p className="mt-1">Ensure the course has diagnostic/progressive/final assessments and the student has completed an attempt.</p>
        </Card>
      )}
    </div>
  );
}
