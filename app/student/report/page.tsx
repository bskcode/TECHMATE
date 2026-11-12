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
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <Card className="rounded-2xl border-none shadow-sm bg-white p-6">
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Diagnostic Baseline</p>
              <h3 className="text-3xl font-black text-gray-900 mt-1">{report.baseline_score.toFixed(1)}%</h3>
              <p className="text-[11px] text-gray-500 mt-1">Pre-intervention evaluation</p>
            </Card>

            <Card className="rounded-2xl border-none shadow-sm bg-white p-6">
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Final Examination</p>
              <h3 className="text-3xl font-black text-[#3E2D68] mt-1">{report.final_score.toFixed(1)}%</h3>
              <p className="text-[11px] text-gray-500 mt-1">With progressive 2-hint assistance</p>
            </Card>

            <Card className="rounded-2xl border-none shadow-sm bg-[#22C55E] text-white p-6 relative overflow-hidden">
              <p className="text-xs font-bold text-white/80 uppercase tracking-wider">Trait Growth</p>
              <h3 className="text-3xl font-black mt-1">
                {report.score_improvement >= 0 ? '+' : ''}
                {report.score_improvement.toFixed(1)} pp
              </h3>
              <p className="text-[11px] text-white/90 mt-1">Net percentage points gained</p>
              <TrendingUp className="w-16 h-16 text-white/15 absolute -right-2 -bottom-2" />
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
