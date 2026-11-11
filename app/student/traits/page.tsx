'use client';

import React from 'react';
import { Award, BarChart3, TrendingUp, Sparkles, ShieldCheck, HelpCircle } from 'lucide-react';
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

export default function StudentTraitRadarPage() {
  const traitData = [
    { trait: 'Remembering', key: 'remembering', score: 100, earned: 5, possible: 5, evidence: 2, confidence: 'high' },
    { trait: 'Understanding', key: 'understanding', score: 100, earned: 5, possible: 5, evidence: 2, confidence: 'high' },
    { trait: 'Application', key: 'application', score: 100, earned: 5, possible: 5, evidence: 2, confidence: 'high' },
    { trait: 'Analysis', key: 'analysis', score: 95, earned: 4.75, possible: 5, evidence: 2, confidence: 'high' },
    { trait: 'Creativity', key: 'creativity', score: 85, earned: 4.25, possible: 5, evidence: 2, confidence: 'high' },
    { trait: 'Evaluation', key: 'evaluation', score: 80, earned: 4.0, possible: 5, evidence: 2, confidence: 'high' },
  ];

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-black text-gray-900 tracking-tight">Academic Cognitive Trait Dashboard</h1>
        <p className="text-sm text-gray-500 font-medium">
          Comprehensive performance evaluation across Bloom&apos;s Revised Taxonomy with evidence metrics.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Radar Chart (6 cols) */}
        <div className="lg:col-span-6 space-y-4">
          <Card className="rounded-3xl border-none shadow-sm bg-white overflow-hidden p-6">
            <CardHeader className="p-0 pb-4 border-b border-gray-50 flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-base font-bold text-gray-900">Cognitive Profile Radar</CardTitle>
                <p className="text-xs text-gray-400">Continuous trait mastery mapping</p>
              </div>
              <Badge variant="emerald" className="text-xs font-bold">
                Reliable (High Confidence)
              </Badge>
            </CardHeader>

            <div className="h-72 w-full pt-4">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart data={traitData}>
                  <PolarGrid stroke="#E2E8F0" />
                  <PolarAngleAxis dataKey="trait" tick={{ fill: '#334155', fontSize: 11, fontWeight: 700 }} />
                  <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fontSize: 9 }} />
                  <Radar
                    name="My Score"
                    dataKey="score"
                    stroke="#22C55E"
                    fill="#10B981"
                    fillOpacity={0.4}
                  />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </div>

        {/* Trait Cards with Progress Bars (6 cols) */}
        <div className="lg:col-span-6 space-y-3">
          {traitData.map((t) => (
            <Card key={t.key} className="rounded-2xl border-none shadow-sm bg-white p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center space-x-2">
                  <span className="text-xs font-bold text-gray-900">{t.trait}</span>
                  <Badge variant="outline" className="text-[10px] font-semibold">
                    {t.evidence} Evidences
                  </Badge>
                  <Badge variant="emerald" className="text-[9px] uppercase font-bold">
                    {t.confidence} Confidence
                  </Badge>
                </div>
                <span className="text-xs font-black text-gray-900">{t.score}%</span>
              </div>

              <Progress
                value={t.score}
                indicatorColor={t.score >= 80 ? 'bg-[#22C55E]' : t.score >= 60 ? 'bg-[#F7B928]' : 'bg-[#FF6B72]'}
              />

              <div className="mt-2 flex items-center justify-between text-[11px] text-gray-400">
                <span>Earned: {t.earned} / {t.possible} marks</span>
                <span className="text-emerald-600 font-semibold">
                  {t.score >= 80 ? 'Mastery Achieved' : 'Remediation Recommended'}
                </span>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
