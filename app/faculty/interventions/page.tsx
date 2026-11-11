'use client';

import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  CheckCircle2,
  XCircle,
  Eye,
  Send,
  BookOpen,
  HelpCircle,
  Lightbulb,
  CheckSquare,
  ShieldCheck,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

export default function FacultyInterventionsPage() {
  const [courses, setCourses] = useState<any[]>([]);
  const [selectedCourseId, setSelectedCourseId] = useState<string>('');
  const [interventions, setInterventions] = useState<any[]>([]);
  const [selectedIntervention, setSelectedIntervention] = useState<any>(null);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    async function loadCourses() {
      const res = await fetch('/api/courses');
      const data = await res.json();
      setCourses(data.courses || []);
      if (data.courses?.[0]) {
        setSelectedCourseId(data.courses[0].id);
        loadInterventions(data.courses[0].id);
      }
    }
    loadCourses();
  }, []);

  async function loadInterventions(courseId: string) {
    const res = await fetch(`/api/interventions?courseId=${courseId}`);
    const data = await res.json();
    setInterventions(data.interventions || []);
    if (data.interventions?.[0]) {
      loadInterventionDetails(data.interventions[0].id);
    }
  }

  async function loadInterventionDetails(id: string) {
    const res = await fetch(`/api/interventions/${id}`);
    const data = await res.json();
    setSelectedIntervention(data.intervention);
  }

  const handleUpdateStatus = async (status: 'approved' | 'rejected' | 'released') => {
    if (!selectedIntervention) return;
    setUpdating(true);
    try {
      const res = await fetch(`/api/interventions/${selectedIntervention.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status,
          faculty_id: '00000000-0000-0000-0000-000000000001',
        }),
      });

      const data = await res.json();
      if (data.success) {
        await loadInterventions(selectedCourseId);
        await loadInterventionDetails(selectedIntervention.id);
      }
    } catch (err: any) {
      alert(`Error: ${err.message}`);
    } finally {
      setUpdating(false);
    }
  };

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-gray-900 tracking-tight">Personalized Learning & Interventions</h1>
          <p className="text-sm text-gray-500 font-medium">
            Review AI-generated remediation packages, verify pedagogical grounding, and release to students.
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Course:</span>
          <select
            value={selectedCourseId}
            onChange={(e) => {
              setSelectedCourseId(e.target.value);
              loadInterventions(e.target.value);
            }}
            className="rounded-xl border border-gray-200 bg-white px-3 py-2 text-xs font-bold text-[#3E2D68] focus:outline-none focus:border-[#3E2D68] shadow-sm"
          >
            {courses.map((c) => (
              <option key={c.id} value={c.id}>
                {c.code}: {c.title}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: List of Interventions (4 cols) */}
        <div className="lg:col-span-4 space-y-4">
          <Card className="rounded-3xl border-none shadow-sm bg-white overflow-hidden p-4">
            <CardHeader className="p-2 pb-3 border-b border-gray-50">
              <CardTitle className="text-sm font-bold text-gray-900">
                Student Remediation Queue ({interventions.length})
              </CardTitle>
            </CardHeader>
            <div className="pt-2 space-y-2">
              {interventions.length === 0 ? (
                <div className="p-8 text-center text-xs text-gray-400">
                  No interventions created yet. Trigger generation from the Class Analytics tab.
                </div>
              ) : (
                interventions.map((item) => {
                  const isSelected = selectedIntervention?.id === item.id;
                  return (
                    <div
                      key={item.id}
                      onClick={() => loadInterventionDetails(item.id)}
                      className={`p-3.5 rounded-2xl cursor-pointer transition-all border ${
                        isSelected
                          ? 'bg-purple-50/70 border-purple-200 shadow-sm'
                          : 'bg-white border-gray-100 hover:border-gray-200'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-gray-900">{item.student?.full_name}</span>
                        <Badge
                          variant={
                            item.status === 'released'
                              ? 'emerald'
                              : item.status === 'approved'
                              ? 'secondary'
                              : 'amber'
                          }
                          className="text-[9px] uppercase font-bold"
                        >
                          {item.status.replace('_', ' ')}
                        </Badge>
                      </div>

                      <div className="flex items-center space-x-1 mt-2">
                        {item.weak_traits?.map((t: string) => (
                          <span
                            key={t}
                            className="px-1.5 py-0.5 rounded-md bg-rose-50 text-rose-700 text-[9px] uppercase font-bold"
                          >
                            {t}
                          </span>
                        ))}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </Card>
        </div>

        {/* Right Column: Remediation Package Inspection & Approval (8 cols) */}
        <div className="lg:col-span-8 space-y-6">
          {selectedIntervention ? (
            <Card className="rounded-3xl border-none shadow-sm bg-white overflow-hidden">
              <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-gray-50 gap-4">
                <div>
                  <div className="flex items-center space-x-2">
                    <h2 className="text-base font-bold text-gray-900">
                      {selectedIntervention.material?.title || 'Personalized Remediation Package'}
                    </h2>
                    <Badge
                      variant={
                        selectedIntervention.status === 'released'
                          ? 'emerald'
                          : selectedIntervention.status === 'approved'
                          ? 'secondary'
                          : 'amber'
                      }
                      className="text-xs font-bold uppercase"
                    >
                      {selectedIntervention.status.replace('_', ' ')}
                    </Badge>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    Student: <span className="font-bold text-gray-900">{selectedIntervention.student?.full_name}</span> •{' '}
                    Identified Gaps: {selectedIntervention.weak_traits?.join(', ')}
                  </p>
                </div>

                {/* Faculty Approval Controls */}
                <div className="flex items-center space-x-2">
                  {selectedIntervention.status !== 'released' && (
                    <Button
                      size="sm"
                      disabled={updating}
                      onClick={() => handleUpdateStatus('released')}
                      className="rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white flex items-center space-x-1.5 shadow-sm"
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>Approve & Release to Student</span>
                    </Button>
                  )}
                  {selectedIntervention.status === 'released' && (
                    <Badge variant="emerald" className="text-xs font-bold py-1 px-3">
                      Released to Student
                    </Badge>
                  )}
                </div>
              </CardHeader>

              <CardContent className="p-6 space-y-6">
                {/* Learning Gap Summary */}
                <div className="p-4 bg-amber-50/70 rounded-2xl border border-amber-200/60">
                  <div className="flex items-center space-x-2 text-amber-900 font-bold text-xs mb-1">
                    <HelpCircle className="w-4 h-4 text-amber-600" />
                    <span>Identified Learning Gap</span>
                  </div>
                  <p className="text-xs text-amber-950 leading-relaxed">
                    {selectedIntervention.material?.learning_gap_summary}
                  </p>
                </div>

                {/* Step-by-Step Explanation */}
                <div className="space-y-2">
                  <h3 className="text-xs font-bold text-gray-700 uppercase tracking-wider flex items-center space-x-1.5">
                    <BookOpen className="w-4 h-4 text-[#3E2D68]" />
                    <span>Grounded Pedagogical Walkthrough</span>
                  </h3>
                  <div className="bg-gray-50 rounded-2xl p-4 text-xs text-gray-800 leading-relaxed font-sans whitespace-pre-wrap">
                    {selectedIntervention.material?.explanation_markdown}
                  </div>
                </div>

                {/* Worked Examples & Analogies */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Worked Examples */}
                  <div className="p-4 bg-purple-50/60 rounded-2xl border border-purple-100 space-y-2">
                    <h4 className="text-xs font-bold text-[#3E2D68] flex items-center space-x-1">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Worked Examples</span>
                    </h4>
                    {selectedIntervention.material?.worked_examples?.map((ex: any, i: number) => (
                      <p key={i} className="text-[11px] text-gray-700 leading-relaxed">
                        • {ex.description}
                      </p>
                    ))}
                  </div>

                  {/* Real-world Analogies */}
                  <div className="p-4 bg-emerald-50/60 rounded-2xl border border-emerald-100 space-y-2">
                    <h4 className="text-xs font-bold text-emerald-800 flex items-center space-x-1">
                      <Lightbulb className="w-3.5 h-3.5" />
                      <span>Intuitive Mental Analogies</span>
                    </h4>
                    {selectedIntervention.material?.analogies?.map((an: any, i: number) => (
                      <p key={i} className="text-[11px] text-gray-700 leading-relaxed">
                        • <span className="font-semibold">{an.concept}:</span> {an.analogy}
                      </p>
                    ))}
                  </div>
                </div>

                {/* Targeted Practice Questions Preview */}
                <div className="space-y-3">
                  <h3 className="text-xs font-bold text-gray-700 uppercase tracking-wider flex items-center space-x-1.5">
                    <CheckSquare className="w-4 h-4 text-[#3E2D68]" />
                    <span>Practice Assessment Widget ({selectedIntervention.practice_questions?.length || 0})</span>
                  </h3>
                  <div className="space-y-2">
                    {selectedIntervention.practice_questions?.map((pq: any, i: number) => (
                      <div key={pq.id} className="p-3 bg-white border border-gray-100 rounded-xl text-xs space-y-1">
                        <p className="font-bold text-gray-900">
                          {i + 1}. {pq.question_text}
                        </p>
                        <p className="text-[11px] text-emerald-700 font-semibold">
                          Answer: {pq.correct_answer}
                        </p>
                        <p className="text-[11px] text-gray-500">{pq.explanation}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card className="rounded-3xl border-dashed border-2 border-gray-200 bg-white p-12 text-center text-gray-400 text-xs">
              Select an intervention from the left queue to inspect and approve.
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
