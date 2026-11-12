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
    score: info.final ?? 0,
    baseline: info.baseline ?? 0,
    delta: info.delta ?? 0,
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
            6-Dimensional Bloom&apos;s Taxonomy evaluation with statistical evidence counts and confidence bands.
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

      {traitsData.length === 0 ? (
        <Card className="rounded-3xl border-dashed border-2 border-gray-200 bg-white p-12 text-center text-gray-400 text-xs">
          <BarChart3 className="w-10 h-10 mx-auto mb-3 text-gray-300" />
          <p className="font-bold text-gray-700">No trait evidence recorded in this course yet.</p>
          <p className="mt-1">Complete a published assessment to generate your Bloom&apos;s Taxonomy radar.</p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-5">
            <Card className="rounded-3xl border-none shadow-sm bg-white p-6">
              <CardHeader className="p-0 pb-3 border-b border-gray-50">
                <CardTitle className="text-base font-bold text-gray-900">Bloom&apos;s Taxonomy Radar</CardTitle>
              </CardHeader>
              <div className="h-80 w-full pt-4">
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart data={traitsData}>
                    <PolarGrid stroke="#E2E8F0" />
                    <PolarAngleAxis dataKey="trait" tick={{ fill: '#334155', fontSize: 11, fontWeight: 700 }} />
                    <PolarRadiusAxis domain={[0, 100]} tick={{ fontSize: 9 }} />
                    <Radar
                      name="Score"
                      dataKey="score"
                      stroke="#3E2D68"
                      fill="#7C3AED"
                      fillOpacity={0.4}
                    />
                  </RadarChart>
                </ResponsiveContainer>
              </div>
            </Card>
          </div>

          <div className="lg:col-span-7 space-y-4">
            {traitsData.map((t) => (
              <Card key={t.trait} className="rounded-2xl border-none shadow-sm bg-white p-5">
                <div className="flex items-center justify-between mb-2">
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
                  <div className="text-right">
                    <span className="text-sm font-black text-[#3E2D68]">{t.score}%</span>
                    <span className="text-[11px] text-gray-400 ml-2">
                      ({t.earned}/{t.possible} marks)
                    </span>
                  </div>
                </div>
                <Progress value={t.score} className="h-2 bg-gray-100" />
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
