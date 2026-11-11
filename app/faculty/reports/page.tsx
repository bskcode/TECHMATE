'use client';

import React, { useState, useEffect } from 'react';
import { Award, TrendingUp, CheckCircle2, User, BookOpen, Sparkles, ArrowUpRight } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';

export default function FacultyReportsPage() {
  const [courses, setCourses] = useState<any[]>([]);
  const [selectedCourseId, setSelectedCourseId] = useState<string>('');
  const [report, setReport] = useState<any>(null);

  useEffect(() => {
    async function loadData() {
      const cRes = await fetch('/api/courses');
      const cData = await cRes.json();
      setCourses(cData.courses || []);
      if (cData.courses?.[0]) {
        setSelectedCourseId(cData.courses[0].id);
        loadReport(cData.courses[0].id, '00000000-0000-0000-0000-000000000101');
      }
    }
    loadData();
  }, []);

  async function loadReport(courseId: string, studentId: string) {
    const res = await fetch(`/api/reports?courseId=${courseId}&studentId=${studentId}`);
    const data = await res.json();
    setReport(data.report);
  }

  const chartData = report?.trait_improvements
    ? Object.entries(report.trait_improvements).map(([trait, delta]) => ({
        trait: trait.charAt(0).toUpperCase() + trait.slice(1),
        improvement: delta,
      }))
    : [];

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-gray-900 tracking-tight">Student Trait Improvement Reports</h1>
          <p className="text-sm text-gray-500 font-medium">
            Accreditation-grade comparative performance: Diagnostic Baseline vs Final Examination.
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <Badge variant="emerald" className="text-xs font-bold px-3 py-1">
            Official Audit Record
          </Badge>
        </div>
      </div>

      {report ? (
        <div className="space-y-6">
          {/* Top Score Comparison Banner */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {/* Baseline Score Card */}
            <Card className="rounded-2xl border-none shadow-sm bg-white p-6">
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Diagnostic Baseline</p>
              <h3 className="text-3xl font-black text-gray-900 mt-1">{report.baseline_score.toFixed(1)}%</h3>
              <p className="text-[11px] text-gray-500 mt-1">Pre-intervention evaluation</p>
            </Card>

            {/* Final Examination Score Card */}
            <Card className="rounded-2xl border-none shadow-sm bg-white p-6">
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Final Examination</p>
              <h3 className="text-3xl font-black text-[#3E2D68] mt-1">{report.final_score.toFixed(1)}%</h3>
              <p className="text-[11px] text-gray-500 mt-1">Summative assessment (with hints)</p>
            </Card>

            {/* Growth / Improvement Card */}
            <Card className="rounded-2xl border-none shadow-sm bg-emerald-500 text-white p-6 relative overflow-hidden">
              <p className="text-xs font-bold text-white/80 uppercase tracking-wider">Net Growth (ΔScore)</p>
              <h3 className="text-3xl font-black mt-1">+{report.score_improvement.toFixed(1)} pp</h3>
              <p className="text-[11px] text-white/90 mt-1">Percentage points gained across traits</p>
              <TrendingUp className="w-16 h-16 text-white/10 absolute -right-2 -bottom-2" />
            </Card>
          </div>

          {/* Trait Growth Chart & Narrative */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Chart (7 cols) */}
            <div className="lg:col-span-7 space-y-4">
              <Card className="rounded-3xl border-none shadow-sm bg-white overflow-hidden p-6">
                <CardHeader className="p-0 pb-4 border-b border-gray-50 flex flex-row items-center justify-between">
                  <div>
                    <CardTitle className="text-base font-bold text-gray-900">
                      Trait-wise Growth (Percentage Points)
                    </CardTitle>
                    <p className="text-xs text-gray-400">ΔTrait = Final Trait Score - Baseline Trait Score</p>
                  </div>
                  <Badge variant="outline" className="text-xs font-bold">
                    6 Dimensions
                  </Badge>
                </CardHeader>

                <div className="h-64 w-full pt-4">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                      <XAxis dataKey="trait" tick={{ fontSize: 11, fontWeight: 600 }} />
                      <YAxis domain={[0, 80]} tick={{ fontSize: 10 }} />
                      <Tooltip
                        formatter={(val) => [`+${val} pp`, 'Trait Improvement']}
                        contentStyle={{ backgroundColor: '#1E293B', borderRadius: '12px', color: '#FFF' }}
                      />
                      <Bar dataKey="improvement" fill="#22C55E" radius={[6, 6, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </Card>
            </div>

            {/* Narrative & Student Info (5 cols) */}
            <div className="lg:col-span-5 space-y-4">
              <Card className="rounded-3xl border-none shadow-sm bg-white overflow-hidden p-6 space-y-4">
                <div className="flex items-center space-x-3 pb-3 border-b border-gray-50">
                  <img
                    src="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150"
                    alt="Branden Harris"
                    className="w-12 h-12 rounded-full object-cover border"
                  />
                  <div>
                    <h3 className="text-sm font-bold text-gray-900">Branden Harris</h3>
                    <p className="text-xs text-gray-400">student1@adaptivelearn.ai • CS101</p>
                  </div>
                </div>

                <div className="space-y-2">
                  <h4 className="text-xs font-bold text-gray-700 uppercase tracking-wider flex items-center space-x-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                    <span>Academic Evaluator Narrative</span>
                  </h4>
                  <p className="text-xs text-gray-700 leading-relaxed bg-gray-50 p-4 rounded-2xl">
                    {report.summary_narrative}
                  </p>
                </div>

                {/* Statistical Confidence Badges */}
                <div className="pt-2 border-t border-gray-50 space-y-2">
                  <p className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">
                    Measurement Reliability Status
                  </p>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="p-2.5 rounded-xl bg-purple-50 text-[#3E2D68] flex items-center justify-between font-semibold">
                      <span>Analysis:</span>
                      <Badge variant="emerald" className="text-[9px] font-bold">
                        HIGH (2 Evidences)
                      </Badge>
                    </div>
                    <div className="p-2.5 rounded-xl bg-purple-50 text-[#3E2D68] flex items-center justify-between font-semibold">
                      <span>Creativity:</span>
                      <Badge variant="emerald" className="text-[9px] font-bold">
                        HIGH (2 Evidences)
                      </Badge>
                    </div>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </div>
      ) : (
        <Card className="rounded-3xl border-dashed border-2 border-gray-200 bg-white p-12 text-center text-gray-400 text-xs">
          Loading improvement report data...
        </Card>
      )}
    </div>
  );
}
