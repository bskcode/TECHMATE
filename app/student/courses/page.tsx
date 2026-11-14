'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  BookOpen,
  Plus,
  Layers,
  Eye,
  X,
  Clock,
  Copy,
  Check,
  ChevronRight,
  Sparkles,
  Award,
  ArrowRight,
  BookMarked,
  CheckCircle2,
  FileText,
  Search,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { MarkdownView } from '@/components/ui/markdown-view';
import { useApp } from '@/components/providers/app-provider';

export default function StudentCoursesPage() {
  const { getActiveUser, toast } = useApp();
  const activeStudent = getActiveUser('student');

  const [courses, setCourses] = useState<any[]>([]);
  const [selectedCourse, setSelectedCourse] = useState<any>(null);
  const [courseDetails, setCourseDetails] = useState<any>(null);
  const [showEnrollModal, setShowEnrollModal] = useState(false);
  const [enrollCode, setEnrollCode] = useState('');
  const [enrolling, setEnrolling] = useState(false);
  const [previewMaterial, setPreviewMaterial] = useState<any>(null);

  // Module Study Notes Reader State
  const [selectedReadingModule, setSelectedReadingModule] = useState<any>(null);
  const [copiedNotes, setCopiedNotes] = useState(false);

  useEffect(() => {
    loadCourses();
  }, [activeStudent.id]);

  async function loadCourses() {
    const res = await fetch(`/api/courses?userId=${activeStudent.id}&role=student`);
    const data = await res.json();
    const list = data.courses || [];
    setCourses(list);
    if (list[0]) {
      loadCourseDetails(list[0].id);
    } else {
      setSelectedCourse(null);
      setCourseDetails(null);
    }
  }

  async function loadCourseDetails(id: string) {
    const res = await fetch(`/api/courses/${id}`);
    const data = await res.json();
    setSelectedCourse(data.course);
    setCourseDetails(data);
  }

  const handleEnroll = async (e: React.FormEvent) => {
    e.preventDefault();
    setEnrolling(true);
    try {
      const res = await fetch('/api/courses/enroll', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code: enrollCode,
          student_id: activeStudent.id,
        }),
      });

      const data = await res.json();
      if (data.success) {
        setShowEnrollModal(false);
        setEnrollCode('');
        toast(data.message, 'success');
        await loadCourses();
      } else {
        toast(data.error || 'Enrollment failed', 'error');
      }
    } catch (err: any) {
      toast(err.message, 'error');
    } finally {
      setEnrolling(false);
    }
  };

  const copyNotesToClipboard = (text: string) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopiedNotes(true);
    toast('Module notes copied to clipboard!', 'success');
    setTimeout(() => setCopiedNotes(false), 2000);
  };

  const getEstimatedReadMinutes = (text?: string) => {
    if (!text) return 3;
    const words = text.trim().split(/\s+/).length;
    return Math.max(1, Math.ceil(words / 180));
  };

  const currentModuleIndex = selectedReadingModule && courseDetails?.modules
    ? courseDetails.modules.findIndex((m: any) => m.id === selectedReadingModule.id)
    : -1;

  const prevModule = currentModuleIndex > 0 ? courseDetails?.modules[currentModuleIndex - 1] : null;
  const nextModule =
    currentModuleIndex >= 0 && currentModuleIndex < (courseDetails?.modules?.length || 0) - 1
      ? courseDetails?.modules[currentModuleIndex + 1]
      : null;

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-gray-900 tracking-tight">My Enrolled Courses</h1>
          <p className="text-sm text-gray-500 font-medium">
            Select any course and choose which curriculum module you want to study from.
          </p>
        </div>

        <Button
          onClick={() => setShowEnrollModal(true)}
          className="rounded-xl text-xs font-bold bg-[#3E2D68] hover:bg-[#3E2D68]/90 text-white flex items-center space-x-1.5 shadow-sm"
        >
          <Plus className="w-4 h-4" />
          <span>Join Course with Code</span>
        </Button>
      </div>

      {/* Courses List */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {courses.map((c) => {
          const isSelected = selectedCourse?.id === c.id;
          return (
            <Card
              key={c.id}
              onClick={() => loadCourseDetails(c.id)}
              className={`rounded-2xl cursor-pointer transition-all border ${
                isSelected
                  ? 'border-[#3E2D68] ring-2 ring-[#3E2D68]/20 bg-white shadow-md'
                  : 'border-gray-100 hover:border-gray-300 bg-white'
              }`}
            >
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <Badge variant="secondary" className="font-bold text-xs text-[#3E2D68] bg-purple-50">
                    {c.code}
                  </Badge>
                  <span className="text-xs text-gray-400 font-medium">{c.term}</span>
                </div>

                <h3 className="font-bold text-base text-gray-900 mt-3 line-clamp-1">{c.title}</h3>
                <p className="text-xs text-gray-500 mt-1 line-clamp-2">{c.description || 'No description provided.'}</p>

                <div className="mt-5 pt-4 border-t border-gray-50 flex items-center justify-between text-xs text-gray-500 font-medium">
                  <span>Instructor: {c.instructor?.full_name || 'Faculty'}</span>
                  <Badge variant="emerald" className="text-[10px] uppercase font-bold">
                    Active
                  </Badge>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Course Details */}
      {courseDetails && (
        <div className="space-y-6">
          {/* Active Course Banner */}
          <div className="bg-gradient-to-r from-[#3E2D68] to-[#5a3a8a] text-white rounded-3xl p-6 sm:p-8 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-2 max-w-2xl">
              <div className="flex items-center space-x-2">
                <span className="px-2.5 py-1 rounded-lg bg-white/20 text-white font-mono text-xs font-bold uppercase tracking-wider">
                  {selectedCourse?.code}
                </span>
                <span className="text-white/70 text-xs font-medium">{selectedCourse?.term}</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-black tracking-tight">{selectedCourse?.title}</h2>
              <p className="text-xs sm:text-sm text-purple-100/90 leading-relaxed">
                {selectedCourse?.description || 'Select a curriculum module below to read AI-generated structured notes, review concepts, and test your knowledge.'}
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 shrink-0">
              <Link href={`/student/diagnostic`}>
                <Button className="w-full sm:w-auto bg-white hover:bg-white/90 text-[#3E2D68] font-bold text-xs rounded-xl shadow-sm flex items-center justify-center space-x-2">
                  <Sparkles className="w-4 h-4 text-[#7C3AED]" />
                  <span>Take Diagnostic Quiz</span>
                </Button>
              </Link>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Curriculum Modules & Choose to Read (7 cols) */}
            <div className="lg:col-span-7 space-y-4">
              <Card className="rounded-3xl border-none shadow-sm bg-white overflow-hidden p-6 space-y-5">
                <div className="flex items-center justify-between pb-3 border-b border-gray-100">
                  <div className="flex items-center space-x-2">
                    <Layers className="w-5 h-5 text-[#3E2D68]" />
                    <div>
                      <CardTitle className="text-base font-bold text-gray-900">Choose Module to Read</CardTitle>
                      <p className="text-[11px] text-gray-400 font-medium">
                        Click on any module to open dedicated notes, formulas, and revision tables
                      </p>
                    </div>
                  </div>
                  <Badge variant="secondary" className="font-bold text-xs text-[#3E2D68]">
                    {courseDetails.modules?.length || 0} Modules
                  </Badge>
                </div>

                <div className="space-y-3">
                  {!courseDetails.modules || courseDetails.modules.length === 0 ? (
                    <div className="p-8 text-center bg-gray-50 rounded-2xl border border-dashed border-gray-200">
                      <Layers className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                      <p className="text-xs font-semibold text-gray-500">No curriculum modules extracted yet.</p>
                      <p className="text-[11px] text-gray-400 mt-1">
                        Modules will automatically appear when syllabus or course materials are uploaded.
                      </p>
                    </div>
                  ) : (
                    courseDetails.modules.map((m: any, idx: number) => {
                      const hasNotes = Boolean(m.notes_markdown && m.notes_markdown.trim().length > 0);
                      const readTime = getEstimatedReadMinutes(m.notes_markdown);
                      return (
                        <div
                          key={m.id}
                          className="p-4 bg-gray-50/70 hover:bg-purple-50/40 rounded-2xl border border-gray-100/80 transition-all hover:border-purple-200 group flex flex-col space-y-3 cursor-pointer"
                          onClick={() => setSelectedReadingModule(m)}
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div className="flex items-center space-x-2.5">
                              <span className="w-7 h-7 rounded-xl bg-[#3E2D68] text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-sm">
                                {m.order_index || idx + 1}
                              </span>
                              <h4 className="text-xs sm:text-sm font-bold text-gray-900 group-hover:text-[#3E2D68] transition-colors">
                                {m.title}
                              </h4>
                            </div>

                            {hasNotes ? (
                              <Badge variant="emerald" className="text-[10px] font-bold shrink-0 flex items-center space-x-1">
                                <Sparkles className="w-3 h-3 mr-1" />
                                <span>Notes Ready</span>
                              </Badge>
                            ) : (
                              <Badge variant="secondary" className="text-[10px] text-gray-500 shrink-0">
                                Overview Only
                              </Badge>
                            )}
                          </div>

                          {m.description && (
                            <p className="text-xs text-gray-600 pl-9 leading-relaxed line-clamp-2">
                              {m.description}
                            </p>
                          )}

                          {/* Learning Objectives Preview */}
                          {m.learning_objectives && m.learning_objectives.length > 0 && (
                            <div className="pl-9 pt-1 flex flex-wrap gap-1.5 items-center">
                              <span className="text-[10px] font-semibold text-gray-400 mr-1">Objectives:</span>
                              {m.learning_objectives.slice(0, 2).map((obj: string, oIdx: number) => (
                                <span
                                  key={oIdx}
                                  className="px-2 py-0.5 rounded-lg bg-white border border-gray-200 text-[10px] text-gray-600 line-clamp-1 max-w-[280px]"
                                >
                                  • {obj}
                                </span>
                              ))}
                              {m.learning_objectives.length > 2 && (
                                <span className="text-[10px] text-[#7C3AED] font-bold">
                                  +{m.learning_objectives.length - 2} more
                                </span>
                              )}
                            </div>
                          )}

                          {/* Action Footer */}
                          <div className="pl-9 pt-2 border-t border-gray-100 flex items-center justify-between text-xs">
                            <span className="text-[11px] text-gray-400 font-medium flex items-center">
                              <Clock className="w-3 h-3 mr-1" />
                              {readTime} min read
                            </span>

                            <Button
                              size="sm"
                              className="h-8 rounded-xl text-xs font-bold bg-[#3E2D68] hover:bg-[#3E2D68]/90 text-white flex items-center space-x-1 shadow-sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedReadingModule(m);
                              }}
                            >
                              <BookOpen className="w-3.5 h-3.5 mr-1" />
                              <span>Read Module Notes</span>
                            </Button>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </Card>
            </div>

            {/* Approved Materials / Handouts & Outcomes (5 cols) */}
            <div className="lg:col-span-5 space-y-6">
              {/* Approved Handouts */}
              <Card className="rounded-3xl border-none shadow-sm bg-white overflow-hidden p-6 space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-gray-100">
                  <div className="flex items-center space-x-2">
                    <BookOpen className="w-5 h-5 text-[#22C55E]" />
                    <CardTitle className="text-base font-bold text-gray-900">Course Handouts</CardTitle>
                  </div>
                  <Badge variant="secondary" className="font-bold text-xs text-emerald-700 bg-emerald-50">
                    {courseDetails.materials?.length || 0} Files
                  </Badge>
                </div>

                <div className="space-y-3">
                  {!courseDetails.materials || courseDetails.materials.length === 0 ? (
                    <p className="text-xs text-gray-400 py-3 text-center">No approved handouts uploaded yet.</p>
                  ) : (
                    courseDetails.materials.map((mat: any) => (
                      <div
                        key={mat.id}
                        onClick={() => setPreviewMaterial(mat)}
                        className="p-3 bg-gray-50 hover:bg-purple-50/50 rounded-2xl flex items-center justify-between cursor-pointer transition-colors border border-transparent hover:border-purple-200"
                      >
                        <div className="space-y-0.5">
                          <h4 className="text-xs font-bold text-gray-900 line-clamp-1">{mat.filename}</h4>
                          <p className="text-[10px] text-gray-400">
                            {(mat.file_size_bytes / 1024).toFixed(1)} KB • Approved Handout
                          </p>
                        </div>
                        <Button size="sm" variant="outline" className="h-7 rounded-xl text-[10px] font-bold bg-white">
                          <Eye className="w-3 h-3 mr-1" /> View
                        </Button>
                      </div>
                    ))
                  )}
                </div>
              </Card>

              {/* Course Outcomes (COs) */}
              <Card className="rounded-3xl border-none shadow-sm bg-white overflow-hidden p-6 space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-gray-100">
                  <div className="flex items-center space-x-2">
                    <Award className="w-5 h-5 text-[#7C3AED]" />
                    <CardTitle className="text-base font-bold text-gray-900">Course Outcomes</CardTitle>
                  </div>
                  <Badge variant="secondary" className="font-bold text-xs text-[#7C3AED] bg-purple-50">
                    {courseDetails.outcomes?.length || 0} COs
                  </Badge>
                </div>

                <div className="space-y-2.5">
                  {!courseDetails.outcomes || courseDetails.outcomes.length === 0 ? (
                    <p className="text-xs text-gray-400 py-2 text-center">No course outcomes extracted yet.</p>
                  ) : (
                    courseDetails.outcomes.map((co: any) => (
                      <div key={co.id} className="p-3 bg-gray-50/80 rounded-2xl space-y-1">
                        <div className="flex items-center justify-between">
                          <Badge variant="outline" className="text-[10px] font-mono font-bold text-[#7C3AED] border-purple-200">
                            {co.code}
                          </Badge>
                          {co.bloom_level && (
                            <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">
                              Bloom: {co.bloom_level}
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-gray-700 leading-snug">{co.description}</p>
                      </div>
                    ))
                  )}
                </div>
              </Card>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* DEDICATED MODULE NOTES STUDY READER MODAL                                  */}
      {/* Allows student to seamlessly choose which module to read from and read it  */}
      {/* ========================================================================= */}
      {selectedReadingModule && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-3 sm:p-6 animate-fadeIn">
          <div className="bg-white rounded-3xl w-full max-w-4xl h-[90vh] shadow-2xl border border-gray-100 flex flex-col overflow-hidden animate-scaleUp">
            {/* Modal Header */}
            <div className="p-5 border-b border-gray-100 bg-[#FAF9FC] flex flex-col space-y-3 shrink-0">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Badge variant="secondary" className="font-bold text-xs text-[#3E2D68] bg-purple-100/60">
                    {selectedCourse?.code}
                  </Badge>
                  <span className="text-xs font-semibold text-gray-500">
                    Module {selectedReadingModule.order_index} of {courseDetails?.modules?.length || 1}
                  </span>
                </div>

                <div className="flex items-center space-x-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => copyNotesToClipboard(selectedReadingModule.notes_markdown || '')}
                    className="h-8 rounded-xl text-xs font-semibold bg-white border-gray-200 flex items-center space-x-1"
                  >
                    {copiedNotes ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                        <span className="text-emerald-700 font-bold">Copied</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5 text-gray-600" />
                        <span>Copy Notes</span>
                      </>
                    )}
                  </Button>

                  <button
                    onClick={() => setSelectedReadingModule(null)}
                    className="p-1.5 rounded-xl hover:bg-gray-200 text-gray-500 transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              <div>
                <h2 className="text-lg sm:text-xl font-black text-gray-900 tracking-tight">
                  {selectedReadingModule.title}
                </h2>
                {selectedReadingModule.description && (
                  <p className="text-xs text-gray-500 mt-0.5 line-clamp-1">
                    {selectedReadingModule.description}
                  </p>
                )}
              </div>

              {/* Module Switcher Tabs: Choose Which Module to Read */}
              <div className="flex items-center space-x-2 overflow-x-auto pt-2 pb-1 scrollbar-none">
                <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider shrink-0 mr-1">
                  Choose Module:
                </span>
                {courseDetails?.modules?.map((mod: any) => {
                  const isActive = mod.id === selectedReadingModule.id;
                  return (
                    <button
                      key={mod.id}
                      onClick={() => setSelectedReadingModule(mod)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap flex items-center space-x-1.5 shrink-0 ${
                        isActive
                          ? 'bg-[#3E2D68] text-white shadow-sm'
                          : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
                      }`}
                    >
                      <span>Mod {mod.order_index}</span>
                      {mod.notes_markdown && (
                        <span className={`w-1.5 h-1.5 rounded-full ${isActive ? 'bg-emerald-400' : 'bg-emerald-500'}`} />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Modal Body: Learning Objectives + Study Notes Markdown */}
            <div className="flex-1 overflow-y-auto p-6 sm:p-8 space-y-6">
              {/* Learning Objectives Callout */}
              {selectedReadingModule.learning_objectives &&
                selectedReadingModule.learning_objectives.length > 0 && (
                  <div className="p-4 rounded-2xl bg-purple-50/60 border border-purple-100 space-y-2">
                    <div className="flex items-center space-x-2 text-xs font-bold text-[#3E2D68] uppercase tracking-wider">
                      <CheckCircle2 className="w-4 h-4 text-[#7C3AED]" />
                      <span>Target Learning Milestones & Objectives</span>
                    </div>
                    <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                      {selectedReadingModule.learning_objectives.map((obj: string, i: number) => (
                        <li key={i} className="flex items-start space-x-2 text-xs text-gray-700">
                          <span className="text-[#7C3AED] font-bold mt-0.5">•</span>
                          <span className="leading-snug">{obj}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

              {/* Study Notes Markdown Content */}
              {selectedReadingModule.notes_markdown ? (
                <div className="prose prose-sm max-w-none text-gray-800">
                  <MarkdownView content={selectedReadingModule.notes_markdown} />
                </div>
              ) : (
                <div className="p-12 text-center bg-gray-50 rounded-3xl border border-dashed border-gray-200 space-y-3">
                  <BookMarked className="w-10 h-10 text-gray-300 mx-auto" />
                  <h3 className="text-sm font-bold text-gray-700">Detailed Notes Pending</h3>
                  <p className="text-xs text-gray-400 max-w-md mx-auto">
                    Study notes for this module are automatically generated when course handouts are uploaded.
                    You can still read the general module description above or consult the course handouts.
                  </p>
                </div>
              )}
            </div>

            {/* Modal Navigation Footer */}
            <div className="p-4 border-t border-gray-100 bg-[#FAF9FC] flex items-center justify-between shrink-0">
              <div>
                {prevModule ? (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setSelectedReadingModule(prevModule)}
                    className="h-8 rounded-xl text-xs font-bold bg-white"
                  >
                    ← Mod {prevModule.order_index}: {prevModule.title.split(':')[0]}
                  </Button>
                ) : (
                  <span className="text-xs text-gray-400">First Module</span>
                )}
              </div>

              <div className="flex items-center space-x-2">
                <Link href={`/student/diagnostic`}>
                  <Button
                    size="sm"
                    className="h-8 rounded-xl text-xs font-bold bg-[#7C3AED] hover:bg-[#6D28D9] text-white flex items-center space-x-1"
                  >
                    <Sparkles className="w-3.5 h-3.5 mr-1" />
                    <span>Practice Quiz</span>
                  </Button>
                </Link>

                {nextModule && (
                  <Button
                    size="sm"
                    onClick={() => setSelectedReadingModule(nextModule)}
                    className="h-8 rounded-xl text-xs font-bold bg-[#3E2D68] hover:bg-[#3E2D68]/90 text-white"
                  >
                    Mod {nextModule.order_index} →
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Handout Preview Modal */}
      {previewMaterial && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-2xl w-full shadow-2xl space-y-4 max-h-[85vh] flex flex-col">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <div>
                <h3 className="text-base font-bold text-gray-900">{previewMaterial.filename}</h3>
                <p className="text-[11px] text-gray-400">{previewMaterial.character_count} characters</p>
              </div>
              <button
                onClick={() => setPreviewMaterial(null)}
                className="p-1.5 rounded-xl hover:bg-gray-100 text-gray-500"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="overflow-y-auto flex-1 p-4 bg-[#F4F5FA] rounded-2xl text-xs text-gray-800 whitespace-pre-wrap leading-relaxed font-mono">
              {previewMaterial.extracted_text || 'No preview text available.'}
            </div>
          </div>
        </div>
      )}

      {/* Enroll Modal */}
      {showEnrollModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-sm w-full shadow-2xl space-y-4 animate-scaleUp">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-gray-900">Join a Course</h3>
              <button
                onClick={() => setShowEnrollModal(false)}
                className="text-gray-400 hover:text-gray-600 font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleEnroll} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Enter Enrollment Code</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. CS101A"
                  value={enrollCode}
                  onChange={(e) => setEnrollCode(e.target.value.toUpperCase())}
                  className="w-full rounded-xl border border-gray-200 px-3 py-2 text-xs font-mono font-bold uppercase focus:outline-none focus:border-[#3E2D68]"
                />
              </div>

              <div className="flex items-center justify-end space-x-2 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowEnrollModal(false)}
                  className="rounded-xl text-xs font-semibold"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={enrolling}
                  className="rounded-xl text-xs font-bold bg-[#3E2D68]"
                >
                  {enrolling ? 'Enrolling...' : 'Join Course'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
