'use client';

import React, { useState, useEffect } from 'react';
import { Award, TrendingUp, CheckCircle2, BookOpen, Sparkles, ArrowRight } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';

export default function StudentFinalReportPage() {
  const [report, setReport] = useState<any>(null);

  useEffect(() => {
    async function loadData() {
      const res = await fetch(
        '/api/reports?courseId=11111111-1111-1111-1111-111111111111&studentId=00000000-0000-0000-0000-000000000101'
      );
      const data = await res.json();
      setReport(data.report);
    }
    loadData();
  }, []);

  const chartData = report?.trait_improvements
    ? Object.entries(report.trait_improvements).map(([trait, delta]) => ({
        trait: trait.charAt(0).toUpperCase() + trait.slice(1),
        improvement: delta,
      }))
    : [];

  return (
    <div className="space-y-8 animate-fadeIn max-w-4xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-black text-gray-900 tracking-tight">Student Academic Growth & Improvement Report</h1>
        <p className="text-sm text-gray-500 font-medium">
          Evidence-based cognitive trajectory comparing Diagnostic Baseline to Final Examination.
        </p>
      </div>

      {report ? (
        <div className="space-y-6">
          {/* Top Score Comparison */}
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
              <h3 className="text-3xl font-black mt-1">+{report.score_improvement.toFixed(1)} pp</h3>
              <p className="text-[11px] text-white/90 mt-1">Net percentage points gained</p>
              <TrendingUp className="w-16 h-16 text-white/15 absolute -right-2 -bottom-2" />
            </Card>
          </div>

          {/* Trait Improvement Chart */}
          <Card className="rounded-3xl border-none shadow-sm bg-white overflow-hidden p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-gray-50">
              <div>
                <CardTitle className="text-base font-bold text-gray-900">
                  Trait-wise Growth Across Bloom Dimensions
                </CardTitle>
                <p className="text-xs text-gray-400">Percentage points gained per cognitive competency</p>
              </div>
              <Badge variant="emerald" className="text-xs font-bold">
                Significant Progress
              </Badge>
            </div>

            <div className="h-64 w-full pt-2">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                  <XAxis dataKey="trait" tick={{ fontSize: 11, fontWeight: 600 }} />
                  <YAxis domain={[0, 80]} tick={{ fontSize: 10 }} />
                  <Tooltip
                    formatter={(val) => [`+${val} pp`, 'Cognitive Growth']}
                    contentStyle={{ backgroundColor: '#1E293B', borderRadius: '12px', color: '#FFF' }}
                  />
                  <Bar dataKey="improvement" fill="#22C55E" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>

          {/* Academic Evaluator Narrative */}
          <Card className="rounded-3xl border-none shadow-sm bg-white p-6 space-y-3">
            <div className="flex items-center space-x-2">
              <Sparkles className="w-4 h-4 text-amber-500" />
              <CardTitle className="text-sm font-bold text-gray-900">Academic Evaluator Feedback</CardTitle>
            </div>
            <p className="text-xs text-gray-700 leading-relaxed bg-gray-50 p-4 rounded-2xl">
              {report.summary_narrative}
            </p>
          </Card>
        </div>
      ) : (
        <Card className="rounded-3xl border-dashed border-2 border-gray-200 bg-white p-12 text-center text-gray-400 text-xs">
          Loading student report...
        </Card>
      )}
    </div>
  );
}
