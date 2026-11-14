'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Sparkles,
  BookOpen,
  CheckCircle2,
  Lightbulb,
  CheckSquare,
  ArrowRight,
  HelpCircle,
  GraduationCap,
  Layers,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useApp } from '@/components/providers/app-provider';
import { MarkdownView } from '@/components/ui/markdown-view';

export default function StudentInterventionsPage() {
  const { getActiveUser } = useApp();
  const activeStudent = getActiveUser('student');

  const [courses, setCourses] = useState<any[]>([]);
  const [selectedCourseId, setSelectedCourseId] = useState<string>('');
  const [interventions, setInterventions] = useState<any[]>([]);
  const [selectedIntervention, setSelectedIntervention] = useState<any>(null);
  const [checkedItems, setCheckedItems] = useState<Record<number, boolean>>({});
  const [loading, setLoading] = useState(true);

  // 1. Load student's courses
  useEffect(() => {
    async function loadCourses() {
      try {
        const res = await fetch(`/api/courses?userId=${activeStudent.id}&role=student`);
        const data = await res.json();
        const list = data.courses || [];
        setCourses(list);
        if (list.length > 0) {
          setSelectedCourseId(list[0].id);
        }
      } catch (err) {
        console.error('Failed to load courses', err);
      }
    }
    loadCourses();
  }, [activeStudent.id]);

  // 2. Load interventions strictly for the active course where diagnostic was taken
  useEffect(() => {
    async function loadData() {
      if (!activeStudent.id) return;
      setLoading(true);
      try {
        const url = selectedCourseId
          ? `/api/interventions?studentId=${activeStudent.id}&courseId=${selectedCourseId}&onlyReleased=true`
          : `/api/interventions?studentId=${activeStudent.id}&onlyReleased=true`;
        const res = await fetch(url);
        const data = await res.json();
        const list = data.interventions || [];
        setInterventions(list);

        if (list.length > 0) {
          selectIntervention(list[0]);
        } else {
          setSelectedIntervention(null);
          setCheckedItems({});
        }
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [activeStudent.id, selectedCourseId]);

  const selectIntervention = (item: any) => {
    setSelectedIntervention(item);
    const map: Record<number, boolean> = {};
    (item.completed_checklist_items || []).forEach((idx: number) => {
      map[idx] = true;
    });
    setCheckedItems(map);
  };

  const toggleCheck = async (idx: number) => {
    if (!selectedIntervention) return;
    const next = { ...checkedItems, [idx]: !checkedItems[idx] };
    setCheckedItems(next);
    const completed = Object.entries(next)
      .filter(([, v]) => v)
      .map(([k]) => Number(k));
    await fetch(`/api/interventions/${selectedIntervention.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ completed_checklist_items: completed }),
    });
  };

  const currentCourse = courses.find((c) => c.id === selectedCourseId) || selectedIntervention?.course;

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Header with Course Context */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="p-1 rounded bg-[#3E2D68] text-white">
              <GraduationCap className="w-4 h-4" />
            </span>
            <span className="text-xs font-bold uppercase tracking-wider text-[#3E2D68]">
              Personalized Learning Center
            </span>
          </div>
          <h1 className="text-2xl font-black text-gray-900 tracking-tight mt-1">
            Grounded Course Remediation &amp; Study Guides
          </h1>
          <p className="text-sm text-gray-500 font-medium">
            Strictly tailored to curriculum materials from the course in which you took your diagnostic assessment.
          </p>
        </div>

        {/* Course Filter / Selector */}
        <div className="flex flex-wrap items-center gap-2">
          {courses.length > 1 && (
            <div className="flex items-center space-x-1.5 bg-white p-1 rounded-2xl border border-gray-200 shadow-sm">
              <span className="text-xs font-bold text-gray-500 pl-2">Course:</span>
              <select
                value={selectedCourseId}
                onChange={(e) => setSelectedCourseId(e.target.value)}
                className="rounded-xl border-none bg-transparent px-2 py-1 text-xs font-bold text-[#3E2D68] focus:ring-0 cursor-pointer"
              >
                {courses.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.code}: {c.title}
                  </option>
                ))}
              </select>
            </div>
          )}

          {interventions.length > 1 && (
            <div className="flex flex-wrap gap-1.5">
              {interventions.map((inv, idx) => (
                <button
                  key={inv.id}
                  onClick={() => selectIntervention(inv)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                    selectedIntervention?.id === inv.id
                      ? 'bg-[#3E2D68] text-white shadow-sm'
                      : 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-50'
                  }`}
                >
                  Plan #{idx + 1}: {inv.weak_traits?.slice(0, 2).join(', ')}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {loading ? (
        <Card className="rounded-3xl border-none bg-white p-12 text-center text-gray-400 text-xs">
          Loading personalized course learning packages...
        </Card>
      ) : selectedIntervention ? (
        <div className="space-y-6">
          {/* Top Course-Specific Remediation Banner */}
          <Card className="rounded-3xl border-none shadow-sm bg-gradient-to-r from-[#3E2D68] to-[#553E8A] text-white p-6 sm:p-8 space-y-3">
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="emerald" className="text-xs font-bold uppercase">
                Faculty Approved &amp; Released
              </Badge>
              <Badge variant="secondary" className="text-xs font-bold bg-white/20 text-white border-none">
                {selectedIntervention.course?.code || currentCourse?.code || 'Course'}: {selectedIntervention.course?.title || currentCourse?.title}
              </Badge>
              <span className="text-xs text-purple-200">
                Cognitive Focus: {selectedIntervention.weak_traits?.join(', ')}
              </span>
            </div>

            <h2 className="text-xl sm:text-2xl font-black leading-tight">
              {selectedIntervention.material?.title || `${selectedIntervention.course?.code || 'Course'} Targeted Mastery Module`}
            </h2>

            <p className="text-xs text-purple-100 max-w-3xl leading-relaxed">
              {selectedIntervention.faculty_notes ||
                `Personalized study module grounded directly in the ${selectedIntervention.course?.title || 'course'} diagnostic assessment results and syllabus materials.`}
            </p>
          </Card>

          {/* Identified Gap & Walkthrough */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Walkthrough (8 cols) */}
            <div className="lg:col-span-8 space-y-6">
              {/* Learning Gap Diagnostic */}
              <div className="p-4 bg-amber-50 rounded-2xl border border-amber-200/60 flex items-start space-x-3 text-xs text-amber-950">
                <HelpCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-bold text-amber-900 mb-0.5">
                    Diagnosed Learning Gap ({selectedIntervention.course?.code || currentCourse?.code || 'Diagnostic Assessment'})
                  </h4>
                  <p className="leading-relaxed">{selectedIntervention.material?.learning_gap_summary}</p>
                </div>
              </div>

              {/* Grounded Walkthrough Markdown */}
              <Card className="rounded-3xl border-none shadow-sm bg-white p-6 space-y-4">
                <div className="flex items-center space-x-2 pb-3 border-b border-gray-50">
                  <BookOpen className="w-5 h-5 text-[#3E2D68]" />
                  <div>
                    <CardTitle className="text-base font-bold text-gray-900">
                      Curriculum-Grounded Conceptual Walkthrough
                    </CardTitle>
                    <p className="text-[11px] text-gray-400">
                      Sourced from approved materials for {selectedIntervention.course?.title || currentCourse?.title || 'this course'}
                    </p>
                  </div>
                </div>
                <MarkdownView content={selectedIntervention.material?.explanation_markdown} />
              </Card>

              {/* Worked Examples */}
              <Card className="rounded-3xl border-none shadow-sm bg-white p-6 space-y-4">
                <div className="flex items-center space-x-2 pb-3 border-b border-gray-50">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                  <CardTitle className="text-base font-bold text-gray-900">Step-by-Step Worked Examples</CardTitle>
                </div>
                <div className="space-y-3">
                  {selectedIntervention.material?.worked_examples?.map((ex: any, i: number) => (
                    <div key={i} className="p-3.5 bg-purple-50/50 rounded-2xl border border-purple-100 text-xs">
                      <span className="font-bold text-[#3E2D68] mr-2">Step {ex.step}:</span>
                      <span className="text-gray-800">{ex.description}</span>
                    </div>
                  ))}
                </div>
              </Card>

              {/* Practice Questions Grounded in this Course */}
              {selectedIntervention.practice_questions && selectedIntervention.practice_questions.length > 0 && (
                <Card className="rounded-3xl border-none shadow-sm bg-white p-6 space-y-4">
                  <div className="flex items-center justify-between pb-3 border-b border-gray-50">
                    <div className="flex items-center space-x-2">
                      <Layers className="w-5 h-5 text-purple-700" />
                      <CardTitle className="text-base font-bold text-gray-900">
                        Course Remediation Practice ({selectedIntervention.course?.code || currentCourse?.code})
                      </CardTitle>
                    </div>
                    <Link href={`/student/practice`}>
                      <Button size="sm" className="rounded-xl text-xs font-bold bg-[#3E2D68]">
                        Open Full Quiz <ArrowRight className="w-3.5 h-3.5 ml-1" />
                      </Button>
                    </Link>
                  </div>
                  <div className="space-y-3">
                    {selectedIntervention.practice_questions.map((pq: any, i: number) => (
                      <div key={pq.id || i} className="p-4 rounded-2xl border border-gray-100 bg-[#F8F9FC] text-xs space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-[#3E2D68]">Question #{i + 1}</span>
                          <Badge variant="secondary" className="text-[10px] uppercase font-bold">
                            {pq.trait}
                          </Badge>
                        </div>
                        <p className="font-medium text-gray-900">{pq.question_text}</p>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 pt-1">
                          {pq.options?.map((opt: string, optIdx: number) => (
                            <div key={optIdx} className="px-3 py-1.5 rounded-xl bg-white border border-gray-200 text-gray-700 text-[11px]">
                              {opt}
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </Card>
              )}
            </div>

            {/* Sidebar Checklists & Next Steps (4 cols) */}
            <div className="lg:col-span-4 space-y-6">
              {/* Mental Analogies */}
              <Card className="rounded-3xl border-none shadow-sm bg-white p-6 space-y-4">
                <div className="flex items-center space-x-2 pb-3 border-b border-gray-50">
                  <Lightbulb className="w-5 h-5 text-amber-500" />
                  <CardTitle className="text-base font-bold text-gray-900">Mental Analogies</CardTitle>
                </div>
                <div className="space-y-3">
                  {selectedIntervention.material?.analogies?.map((an: any, i: number) => (
                    <div key={i} className="p-3 bg-amber-50/60 rounded-2xl border border-amber-100 text-xs space-y-1">
                      <p className="font-bold text-amber-900">{an.concept}</p>
                      <p className="text-[11px] text-amber-800 leading-relaxed">{an.analogy}</p>
                    </div>
                  ))}
                </div>
              </Card>

              {/* Interactive Revision Checklist */}
              <Card className="rounded-3xl border-none shadow-sm bg-white p-6 space-y-4">
                <div className="flex items-center space-x-2 pb-3 border-b border-gray-50">
                  <CheckSquare className="w-5 h-5 text-[#3E2D68]" />
                  <CardTitle className="text-base font-bold text-gray-900">Revision Checklist</CardTitle>
                </div>
                <div className="space-y-2.5">
                  {selectedIntervention.material?.revision_checklist?.map((item: string, i: number) => {
                    const isChecked = checkedItems[i] || false;
                    return (
                      <div
                        key={i}
                        onClick={() => toggleCheck(i)}
                        className={`p-3 rounded-2xl border text-xs cursor-pointer transition-all flex items-start space-x-2.5 ${
                          isChecked
                            ? 'bg-emerald-50 border-emerald-200 text-emerald-900 line-through'
                            : 'bg-white border-gray-100 text-gray-800 hover:border-gray-200'
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={isChecked}
                          readOnly
                          className="mt-0.5 rounded text-emerald-600"
                        />
                        <span className="leading-relaxed">{item}</span>
                      </div>
                    );
                  })}
                </div>

                <div className="pt-3 border-t border-gray-50">
                  <Link href="/student/practice">
                    <Button className="w-full rounded-2xl text-xs font-bold bg-[#3E2D68]">
                      Go to Practice Quiz <ArrowRight className="w-3.5 h-3.5 ml-1" />
                    </Button>
                  </Link>
                </div>
              </Card>
            </div>
          </div>
        </div>
      ) : (
        <Card className="rounded-3xl border-dashed border-2 border-gray-200 bg-white p-12 text-center text-gray-400 text-xs">
          <GraduationCap className="w-10 h-10 mx-auto mb-3 text-gray-300" />
          <p className="font-bold text-gray-700">No released personalized learning packages found for this course.</p>
          <p className="mt-1">
            Complete the diagnostic assessment in {currentCourse?.code || 'this course'}, and your faculty will release a course-grounded study package.
          </p>
        </Card>
      )}
    </div>
  );
}
