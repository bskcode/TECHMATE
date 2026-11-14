'use client';

import React, { useState, useEffect } from 'react';
import { BarChart3, ShieldCheck } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
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

export default function StudentTraitsPage() {
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

  const traitDetails = report?.trait_details || {};
  const traitsData = Object.entries(traitDetails).map(([key, info]: [string, any]) => ({
    trait: key.charAt(0).toUpperCase() + key.slice(1),
    diagnostic: info.baseline ?? 0,
    progressive: info.progressive ?? info.baseline ?? 0,
    final: info.final ?? info.progressive ?? 0,
    progressive_delta: info.progressive_delta ?? Math.round(((info.progressive ?? info.baseline ?? 0) - (info.baseline ?? 0)) * 10) / 10,
    delta: info.delta ?? 0,
    score: info.progressive ?? info.final ?? 0,
    earned: info.marks_earned ?? 0,
    possible: info.marks_possible ?? 0,
    evidence: info.evidence_count ?? 0,
    confidence: info.confidence ?? 'low',
  }));

  const highConfCount = traitsData.filter((t) => t.confidence === 'high' || t.confidence === 'moderate').length;

  return (
    <div className="space-y-8 animate-fadeIn">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-gray-900 tracking-tight">My Cognitive Trait Profile</h1>
          <p className="text-sm text-gray-500 font-medium">
            Comparative Bloom&apos;s Taxonomy trajectory: Diagnostic Baseline vs Progressive Formative Assessment.
          </p>
        </div>

        <div className="flex items-center space-x-3">
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
          <Badge variant="emerald" className="text-xs font-bold px-3 py-1">
            {highConfCount}/{traitsData.length || 6} Reliable Dimensions
          </Badge>
        </div>
      </div>

      {/* Motivational Learning Gain (G) Banner */}
      {report && (
        <div className="p-5 rounded-3xl bg-gradient-to-r from-[#3E2D68] to-[#553E8A] text-white flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-sm">
          <div className="space-y-1.5">
            <div className="flex items-center space-x-2">
              <Badge variant="secondary" className="bg-emerald-400 text-emerald-950 text-xs font-bold">
                {report.learning_gain_interpretation || 'Learning Gain Active'}
              </Badge>
              <span className="text-xs text-purple-200">
                Formula: G = (Progressive - Diagnostic) / Max Score
              </span>
            </div>
            <h3 className="text-xl font-black text-white">
              Cognitive Learning Gain (G):{' '}
              <span className="text-emerald-300">
                {report.learning_gain_g !== undefined
                  ? `${report.learning_gain_g >= 0 ? '+' : ''}${report.learning_gain_g}%`
                  : `+${report.score_improvement}%`}
              </span>
            </h3>
            <p className="text-xs text-purple-100 max-w-2xl leading-relaxed">
              {report.motivational_message ||
                'Progressive hints and study guides successfully helped you bridge diagnostic learning gaps!'}
            </p>
          </div>
          <div className="text-right shrink-0 bg-white/10 p-4 rounded-2xl border border-white/15 backdrop-blur-sm">
            <p className="text-[10px] uppercase font-bold text-purple-200">Progressive Mastery</p>
            <p className="text-2xl font-black text-white">
              {report.progressive_score !== undefined ? `${report.progressive_score}%` : `${report.final_score}%`}
            </p>
            <span className="text-[10px] text-emerald-300 font-bold">
              +{report.learning_gain_g ?? report.score_improvement} pp Gain
            </span>
          </div>
        </div>
      )}

      {traitsData.length === 0 ? (
        <Card className="rounded-3xl border-dashed border-2 border-gray-200 bg-white p-12 text-center text-gray-400 text-xs">
          <BarChart3 className="w-10 h-10 mx-auto mb-3 text-gray-300" />
          <p className="font-bold text-gray-700">No trait evidence recorded in this course yet.</p>
          <p className="mt-1">Complete a diagnostic and progressive assessment to generate your Bloom&apos;s Taxonomy dual radar.</p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-5">
            <Card className="rounded-3xl border-none shadow-sm bg-white p-6">
              <CardHeader className="p-0 pb-3 border-b border-gray-50 flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="text-base font-bold text-gray-900">Bloom&apos;s Taxonomy Dual Radar</CardTitle>
                  <p className="text-xs text-gray-400 mt-0.5">Diagnostic Baseline vs Progressive Assessment</p>
                </div>
                <Badge variant="secondary" className="text-[10px] font-bold uppercase bg-purple-100 text-[#3E2D68]">
                  Dual Profile
                </Badge>
              </CardHeader>
              <div className="h-80 w-full pt-4">
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart data={traitsData} margin={{ top: 10, right: 10, bottom: 10, left: 10 }}>
                    <PolarGrid stroke="#E2E8F0" />
                    <PolarAngleAxis dataKey="trait" tick={{ fill: '#334155', fontSize: 11, fontWeight: 700 }} />
                    <PolarRadiusAxis domain={[0, 100]} tick={{ fontSize: 9 }} />
                    <Tooltip
                      formatter={(val: any, name: string) => [`${val}%`, name]}
                      contentStyle={{ backgroundColor: '#1E293B', borderRadius: '12px', color: '#FFF' }}
                    />
                    <Legend wrapperStyle={{ fontSize: '11px', fontWeight: 600, paddingTop: '10px' }} />
                    <Radar
                      name="Diagnostic Baseline"
                      dataKey="diagnostic"
                      stroke="#6366F1"
                      fill="#6366F1"
                      fillOpacity={0.3}
                    />
                    <Radar
                      name="Progressive Assessment"
                      dataKey="progressive"
                      stroke="#A855F7"
                      fill="#A855F7"
                      fillOpacity={0.45}
                    />
                  </RadarChart>
                </ResponsiveContainer>
              </div>
            </Card>
          </div>

          <div className="lg:col-span-7 space-y-4">
            {traitsData.map((t) => (
              <Card key={t.trait} className="rounded-2xl border-none shadow-sm bg-white p-5 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <h4 className="font-bold text-sm text-gray-900">{t.trait}</h4>
                    <Badge
                      variant={
                        t.confidence === 'high' ? 'emerald' : t.confidence === 'moderate' ? 'amber' : 'secondary'
                      }
                      className="text-[10px] font-bold uppercase flex items-center space-x-1"
                    >
                      <ShieldCheck className="w-3 h-3" />
                      <span>{t.confidence} ({t.evidence} evidences)</span>
                    </Badge>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span
                      className={`text-xs font-black px-2 py-0.5 rounded-full ${
                        t.progressive_delta >= 0
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-rose-100 text-rose-800'
                      }`}
                    >
                      {t.progressive_delta >= 0 ? `+${t.progressive_delta}` : t.progressive_delta} pp Gain
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 pt-1 text-xs">
                  <div className="p-2.5 rounded-xl bg-indigo-50/70 border border-indigo-100">
                    <div className="flex items-center justify-between text-indigo-900 mb-1">
                      <span className="font-semibold text-[11px]">1. Diagnostic Baseline:</span>
                      <span className="font-black">{t.diagnostic}%</span>
                    </div>
                    <Progress value={t.diagnostic} className="h-1.5 bg-indigo-200" />
                  </div>

                  <div className="p-2.5 rounded-xl bg-purple-50/70 border border-purple-100">
                    <div className="flex items-center justify-between text-purple-900 mb-1">
                      <span className="font-semibold text-[11px]">2. Progressive Formative:</span>
                      <span className="font-black">{t.progressive}%</span>
                    </div>
                    <Progress value={t.progressive} className="h-1.5 bg-purple-200" />
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
