'use client';

import React, { useState, useEffect } from 'react';
import { TrendingUp, Printer, BookOpen } from 'lucide-react';
import { Card, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import { useApp } from '@/components/providers/app-provider';

export default function StudentFinalReportPage() {
  const { getActiveUser } = useApp();
  const activeStudent = getActiveUser('student');

  const [courses, setCourses] = useState<any[]>([]);
  const [selectedCourseId, setSelectedCourseId] = useState<string>('');
  const [report, setReport] = useState<any>(null);

  useEffect(() => {
    async function loadCourses() {
      const res = await fetch(`/api/courses?userId=${activeStudent.id}&role=student`);
      const data = await res.json();
      const list = data.courses || [];
      setCourses(list);
      if (list[0]) {
        setSelectedCourseId(list[0].id);
      } else {
        setSelectedCourseId('');
        setReport(null);
      }
    }
    loadCourses();
  }, [activeStudent.id]);

  useEffect(() => {
    if (!selectedCourseId) return;
    fetch(`/api/reports?courseId=${selectedCourseId}&studentId=${activeStudent.id}`)
      .then((r) => r.json())
      .then((d) => setReport(d.success ? d.report : null));
  }, [selectedCourseId, activeStudent.id]);

  const chartData = report?.trait_improvements
    ? Object.entries(report.trait_improvements).map(([trait, delta]) => ({
        trait: trait.charAt(0).toUpperCase() + trait.slice(1),
        improvement: delta,
      }))
    : [];

  return (
    <div className="space-y-8 animate-fadeIn max-w-4xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-gray-900 tracking-tight">
            Student Academic Growth &amp; Improvement Report
          </h1>
          <p className="text-sm text-gray-500 font-medium">
            Evidence-based cognitive trajectory comparing Diagnostic Baseline to Final Examination.
          </p>
        </div>

        <div className="flex items-center space-x-2">
          {courses.length > 0 && (
            <select
              value={selectedCourseId}
              onChange={(e) => setSelectedCourseId(e.target.value)}
              className="rounded-xl border border-gray-200 bg-white px-3 py-2 text-xs font-bold text-[#3E2D68] shadow-sm"
            >
              {courses.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.code}: {c.title}
                </option>
              ))}
            </select>
          )}
          <Button
            variant="outline"
            size="sm"
            disabled={!report}
            onClick={() => window.print()}
            className="rounded-xl text-xs font-bold bg-white"
          >
            <Printer className="w-3.5 h-3.5 mr-1.5" /> Print / PDF
          </Button>
        </div>
      </div>

      {report ? (
        <div className="space-y-6">
          {/* Motivational Learning Gain (G) Showcase */}
          <Card className="rounded-3xl border-none shadow-sm bg-gradient-to-r from-[#3E2D68] via-[#503A82] to-[#22C55E] text-white p-6 sm:p-8 space-y-3 relative overflow-hidden">
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="secondary" className="bg-emerald-400 text-emerald-950 text-xs font-bold uppercase">
                {report.learning_gain_interpretation || 'Mastery Leap'}
              </Badge>
              <span className="text-xs text-purple-200">
                Metric: Formative Learning Gain G = (Progressive - Diagnostic) / Max Score
              </span>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-2">
              <h2 className="text-2xl sm:text-3xl font-black tracking-tight">
                Cognitive Learning Gain (G):{' '}
                <span className="text-emerald-300">
                  {report.learning_gain_g !== undefined
                    ? `${report.learning_gain_g >= 0 ? '+' : ''}${report.learning_gain_g}%`
                    : `+${report.score_improvement}%`}
                </span>
              </h2>
              <span className="text-xs font-semibold text-purple-200">
                Progression: {report.baseline_score.toFixed(1)}% →{' '}
                {report.progressive_score !== undefined
                  ? `${report.progressive_score.toFixed(1)}%`
                  : `${report.final_score.toFixed(1)}%`}
              </span>
            </div>

            <p className="text-xs sm:text-sm text-purple-100 max-w-2xl leading-relaxed">
              {report.motivational_message ||
                'Outstanding work! Your progressive assessment performance demonstrates that formative hints helped you master foundational concepts and turn diagnostic learning gaps into genuine cognitive strengths.'}
            </p>
          </Card>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="rounded-2xl border-none shadow-sm bg-white p-5">
              <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">1. Diagnostic Baseline</p>
              <h3 className="text-2xl sm:text-3xl font-black text-gray-900 mt-1">{report.baseline_score.toFixed(1)}%</h3>
              <p className="text-[11px] text-gray-500 mt-1">Initial competency baseline</p>
            </Card>

            <Card className="rounded-2xl border-none shadow-sm bg-purple-50/70 border border-purple-100 p-5">
              <div className="flex items-center justify-between">
                <p className="text-[11px] font-bold text-purple-700 uppercase tracking-wider">2. Progressive Formative</p>
                {report.progressive_improvement !== undefined && (
                  <Badge variant="secondary" className="text-[10px] font-bold bg-purple-100 text-purple-800">
                    {report.progressive_improvement >= 0 ? `+${report.progressive_improvement.toFixed(1)}` : report.progressive_improvement.toFixed(1)} pp
                  </Badge>
                )}
              </div>
              <h3 className="text-2xl sm:text-3xl font-black text-purple-900 mt-1">
                {report.progressive_score !== undefined ? `${report.progressive_score.toFixed(1)}%` : 'In Progress'}
              </h3>
              <p className="text-[11px] text-purple-600 mt-1">Formative evaluation with hints</p>
            </Card>

            <Card className="rounded-2xl border-none shadow-sm bg-white p-5">
              <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">3. Final Examination</p>
              <h3 className="text-2xl sm:text-3xl font-black text-[#3E2D68] mt-1">{report.final_score.toFixed(1)}%</h3>
              <p className="text-[11px] text-gray-500 mt-1">Summative final mastery</p>
            </Card>

            <Card className="rounded-2xl border-none shadow-sm bg-[#22C55E] text-white p-5 relative overflow-hidden">
              <p className="text-[11px] font-bold text-white/80 uppercase tracking-wider">Trait Growth</p>
              <h3 className="text-2xl sm:text-3xl font-black mt-1">
                {report.score_improvement >= 0 ? '+' : ''}
                {report.score_improvement.toFixed(1)} pp
              </h3>
              <p className="text-[11px] text-white/90 mt-1">Net percentage points gained</p>
              <TrendingUp className="w-14 h-14 text-white/15 absolute -right-2 -bottom-2" />
            </Card>
          </div>

          <Card className="rounded-3xl border-none shadow-sm bg-white overflow-hidden p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-gray-50">
              <div>
                <CardTitle className="text-base font-bold text-gray-900">
                  Trait-wise Growth Across Bloom Dimensions
                </CardTitle>
                <p className="text-xs text-gray-400">Percentage points gained per cognitive competency</p>
              </div>
              <Badge variant="emerald" className="text-xs font-bold">
                Official Record
              </Badge>
            </div>

            <div className="h-64 w-full pt-2">
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

            <p className="text-xs text-gray-600 bg-[#F4F5FA] p-4 rounded-2xl leading-relaxed">
              {report.summary_narrative}
            </p>
          </Card>
        </div>
      ) : (
        <Card className="rounded-3xl border-dashed border-2 border-gray-200 bg-white p-12 text-center text-gray-400 text-xs">
          <BookOpen className="w-10 h-10 mx-auto mb-3 text-gray-300" />
          <p className="font-bold text-gray-700">No improvement report available yet.</p>
          <p className="mt-1">Complete your diagnostic and final assessments in this course to generate your report.</p>
        </Card>
      )}
    </div>
  );
}
