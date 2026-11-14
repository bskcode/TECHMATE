'use client';

import React, { useState, useEffect } from 'react';
import {
  BookOpen,
  Plus,
  Copy,
  Check,
  Users,
  Layers,
  Award,
  Trash2,
  Sparkles,
  FileUp,
  FileText,
  CheckCircle2,
  Target,
  ArrowRight,
  ListChecks,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useApp } from '@/components/providers/app-provider';

function getBloomBadgeColor(bloom?: string) {
  switch (bloom?.toLowerCase()) {
    case 'remembering':
      return 'bg-blue-50 text-blue-700 border-blue-200';
    case 'understanding':
      return 'bg-emerald-50 text-emerald-700 border-emerald-200';
    case 'application':
      return 'bg-amber-50 text-amber-700 border-amber-200';
    case 'analysis':
      return 'bg-purple-50 text-purple-700 border-purple-200';
    case 'evaluation':
      return 'bg-rose-50 text-rose-700 border-rose-200';
    case 'creativity':
      return 'bg-indigo-50 text-indigo-700 border-indigo-200';
    default:
      return 'bg-gray-50 text-gray-700 border-gray-200';
  }
}

export default function CoursesPage() {
  const { getActiveUser, toast, confirmAction } = useApp();
  const activeFaculty = getActiveUser('faculty');

  const [courses, setCourses] = useState<any[]>([]);
  const [selectedCourse, setSelectedCourse] = useState<any>(null);
  const [courseDetails, setCourseDetails] = useState<any>(null);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  // Manual course creation state
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [code, setCode] = useState('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [term, setTerm] = useState('Fall 2026');
  const [creating, setCreating] = useState(false);

  // Quick syllabus in Create Course modal
  const [createSyllabusFile, setCreateSyllabusFile] = useState<File | null>(null);
  const [extractingCreateSyllabus, setExtractingCreateSyllabus] = useState(false);
  const [extractedCreateData, setExtractedCreateData] = useState<any>(null);

  // Manual module & outcome form state
  const [moduleTitle, setModuleTitle] = useState('');
  const [moduleDesc, setModuleDesc] = useState('');
  const [outcomeCode, setOutcomeCode] = useState('');
  const [outcomeDesc, setOutcomeDesc] = useState('');

  // AI Syllabus Extraction Modal state
  const [showSyllabusModal, setShowSyllabusModal] = useState(false);
  const [syllabusInputMode, setSyllabusInputMode] = useState<'file' | 'text'>('file');
  const [syllabusFile, setSyllabusFile] = useState<File | null>(null);
  const [syllabusText, setSyllabusText] = useState('');
  const [replaceExistingSyllabus, setReplaceExistingSyllabus] = useState(true);
  const [extractingSyllabus, setExtractingSyllabus] = useState(false);
  const [extractedResult, setExtractedResult] = useState<any>(null);

  useEffect(() => {
    loadCourses();
  }, [activeFaculty.id]);

  async function loadCourses(targetCourseId?: string) {
    const res = await fetch(`/api/courses?userId=${activeFaculty.id}&role=faculty`);
    const data = await res.json();
    const list = data.courses || [];
    setCourses(list);
    const idToSelect = targetCourseId || selectedCourse?.id || list[0]?.id;
    if (idToSelect && list.some((c: any) => c.id === idToSelect)) {
      loadCourseDetails(idToSelect);
    } else if (list[0]) {
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

  const copyToClipboard = (codeStr: string) => {
    navigator.clipboard.writeText(codeStr);
    setCopiedCode(codeStr);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const handleCreateCourse = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreating(true);
    try {
      const res = await fetch('/api/courses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code,
          title,
          description,
          term,
          instructor_id: activeFaculty.id,
        }),
      });
      const data = await res.json();
      if (data.success) {
        // If syllabus was pre-extracted in modal, save modules and outcomes
        if (extractedCreateData) {
          for (const m of extractedCreateData.modules || []) {
            await fetch(`/api/courses/${data.course.id}/modules`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                title: m.title,
                description: m.description,
                order_index: m.order_index,
                learning_objectives: m.learning_objectives,
              }),
            });
          }
          for (const co of extractedCreateData.course_outcomes || []) {
            await fetch(`/api/courses/${data.course.id}/outcomes`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                code: co.code,
                description: co.description,
                bloom_level: co.bloom_level,
              }),
            });
          }
        }

        setShowCreateModal(false);
        setCode('');
        setTitle('');
        setDescription('');
        setCreateSyllabusFile(null);
        setExtractedCreateData(null);
        toast(`Course ${data.course.code} created with extracted curriculum!`, 'success');
        await loadCourses(data.course.id);
      } else {
        toast(data.error || 'Failed to create course', 'error');
      }
    } catch (err: any) {
      toast(err.message || 'Failed to create course', 'error');
    } finally {
      setCreating(false);
    }
  };

  const handleCreateSyllabusUpload = async (file: File) => {
    setCreateSyllabusFile(file);
    setExtractingCreateSyllabus(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('filename', file.name);

      const res = await fetch('/api/courses/extract-syllabus', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();
      if (data.success && data.extracted) {
        const ext = data.extracted;
        setExtractedCreateData(ext);
        if (ext.course_code && !code) setCode(ext.course_code);
        if (ext.course_title && !title) setTitle(ext.course_title);
        if (ext.course_description && !description) setDescription(ext.course_description);
        toast(`Auto-extracted ${ext.modules?.length || 0} modules and ${ext.course_outcomes?.length || 0} outcomes!`, 'success');
      } else {
        toast(data.error || 'Failed to extract syllabus', 'error');
      }
    } catch (err: any) {
      toast(err.message || 'Error extracting syllabus', 'error');
    } finally {
      setExtractingCreateSyllabus(false);
    }
  };

  const handleExtractSyllabus = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCourse) return;

    if (syllabusInputMode === 'file' && !syllabusFile) {
      toast('Please select a syllabus document to upload.', 'warning');
      return;
    }
    if (syllabusInputMode === 'text' && !syllabusText.trim()) {
      toast('Please enter or paste your syllabus text.', 'warning');
      return;
    }

    setExtractingSyllabus(true);
    try {
      let res;
      if (syllabusInputMode === 'file' && syllabusFile) {
        const formData = new FormData();
        formData.append('file', syllabusFile);
        formData.append('filename', syllabusFile.name);
        formData.append('applyImmediately', 'true');
        formData.append('replaceExisting', String(replaceExistingSyllabus));

        res = await fetch(`/api/courses/${selectedCourse.id}/syllabus`, {
          method: 'POST',
          body: formData,
        });
      } else {
        res = await fetch(`/api/courses/${selectedCourse.id}/syllabus`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            syllabusText,
            applyImmediately: true,
            replaceExisting: replaceExistingSyllabus,
          }),
        });
      }

      const data = await res.json();
      if (data.success) {
        setExtractedResult(data.extracted);
        toast(data.message || 'Curriculum modules, COs, and objectives extracted successfully!', 'success');
        await loadCourseDetails(selectedCourse.id);
        await loadCourses(selectedCourse.id);
      } else {
        toast(data.error || 'Failed to extract syllabus', 'error');
      }
    } catch (err: any) {
      toast(err.message || 'Error extracting syllabus', 'error');
    } finally {
      setExtractingSyllabus(false);
    }
  };

  const handleAddModule = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCourse || !moduleTitle.trim()) return;
    const res = await fetch(`/api/courses/${selectedCourse.id}/modules`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title: moduleTitle, description: moduleDesc }),
    });
    const data = await res.json();
    if (data.success) {
      setModuleTitle('');
      setModuleDesc('');
      toast('Module added', 'success');
      await loadCourseDetails(selectedCourse.id);
    } else {
      toast(data.error || 'Failed to add module', 'error');
    }
  };

  const handleDeleteModule = async (moduleId: string) => {
    if (!selectedCourse) return;
    const ok = await confirmAction({
      title: 'Delete Module',
      message: 'Remove this curriculum module from the course?',
      confirmLabel: 'Delete',
      variant: 'danger',
    });
    if (!ok) return;
    const res = await fetch(`/api/courses/${selectedCourse.id}/modules?moduleId=${moduleId}`, {
      method: 'DELETE',
    });
    if (res.ok) {
      toast('Module removed', 'info');
      await loadCourseDetails(selectedCourse.id);
    }
  };

  const handleAddOutcome = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCourse || !outcomeCode.trim() || !outcomeDesc.trim()) return;
    const res = await fetch(`/api/courses/${selectedCourse.id}/outcomes`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code: outcomeCode, description: outcomeDesc }),
    });
    const data = await res.json();
    if (data.success) {
      setOutcomeCode('');
      setOutcomeDesc('');
      toast('Course outcome added', 'success');
      await loadCourseDetails(selectedCourse.id);
    } else {
      toast(data.error || 'Failed to add outcome', 'error');
    }
  };

  const handleDeleteOutcome = async (outcomeId: string) => {
    if (!selectedCourse) return;
    const ok = await confirmAction({
      title: 'Delete Course Outcome',
      message: 'Remove this course outcome?',
      confirmLabel: 'Delete',
      variant: 'danger',
    });
    if (!ok) return;
    const res = await fetch(`/api/courses/${selectedCourse.id}/outcomes?outcomeId=${outcomeId}`, {
      method: 'DELETE',
    });
    if (res.ok) {
      toast('Outcome removed', 'info');
      await loadCourseDetails(selectedCourse.id);
    }
  };

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-gray-900 tracking-tight">Course Management</h1>
          <p className="text-sm text-gray-500 font-medium">
            Manage your courses, syllabus outcomes, and student rosters.
          </p>
        </div>
        <div className="flex items-center space-x-3">
          {selectedCourse && (
            <Button
              onClick={() => {
                setExtractedResult(null);
                setSyllabusFile(null);
                setSyllabusText('');
                setShowSyllabusModal(true);
              }}
              variant="outline"
              className="flex items-center space-x-2 text-xs font-bold rounded-xl border-purple-200 text-[#3E2D68] hover:bg-purple-50"
            >
              <Sparkles className="w-4 h-4 text-[#7C3AED]" />
              <span>Upload Syllabus & Extract</span>
            </Button>
          )}
          <Button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center space-x-2 text-xs font-bold rounded-xl bg-[#3E2D68] hover:bg-[#322353]"
          >
            <Plus className="w-4 h-4" />
            <span>Create New Course</span>
          </Button>
        </div>
      </div>

      {/* Courses List Grid */}
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
                  <Badge variant="secondary" className="font-bold text-xs text-[#3E2D68]">
                    {c.code}
                  </Badge>
                  <span className="text-xs text-gray-400 font-medium">{c.term}</span>
                </div>

                <h3 className="font-bold text-base text-gray-900 mt-3 line-clamp-1">{c.title}</h3>
                <p className="text-xs text-gray-500 mt-1 line-clamp-2">{c.description || 'No description provided.'}</p>

                <div className="mt-5 pt-4 border-t border-gray-50 flex items-center justify-between">
                  {/* Enrollment code badge */}
                  <div className="flex items-center space-x-2">
                    <span className="text-[11px] text-gray-400 font-medium">Code:</span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        copyToClipboard(c.enrollment_code);
                      }}
                      className="px-2 py-0.5 rounded-md bg-purple-50 text-[#3E2D68] text-xs font-mono font-bold flex items-center space-x-1 hover:bg-purple-100 transition-colors"
                    >
                      <span>{c.enrollment_code}</span>
                      {copiedCode === c.enrollment_code ? (
                        <Check className="w-3 h-3 text-emerald-600" />
                      ) : (
                        <Copy className="w-3 h-3 text-gray-400" />
                      )}
                    </button>
                  </div>

                  <div className="flex items-center space-x-1 text-xs text-gray-500 font-medium">
                    <Users className="w-3.5 h-3.5 text-gray-400" />
                    <span>{c.enrolled_count ?? 0} students</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Selected Course Action Banner */}
      {selectedCourse && (
        <div className="bg-gradient-to-r from-purple-50 via-indigo-50/30 to-white rounded-3xl p-5 border border-purple-100 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-sm animate-fadeIn">
          <div className="flex items-start sm:items-center space-x-3.5">
            <div className="w-11 h-11 rounded-2xl bg-[#3E2D68] text-white flex items-center justify-center shrink-0 shadow-sm">
              <Sparkles className="w-5 h-5 text-purple-200" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-bold text-sm text-gray-900">
                  {selectedCourse.code}: {selectedCourse.title}
                </span>
                <span className="text-[11px] font-semibold text-gray-400">({selectedCourse.term})</span>
              </div>
              <p className="text-xs text-gray-500 mt-0.5 leading-relaxed">
                Upload your course syllabus (PDF, DOCX, TXT, MD) to automatically extract curriculum modules (Module 1, Module 2...), Course Outcomes (COs), and learning objectives.
              </p>
            </div>
          </div>
          <Button
            onClick={() => {
              setExtractedResult(null);
              setSyllabusFile(null);
              setSyllabusText('');
              setShowSyllabusModal(true);
            }}
            className="rounded-xl text-xs font-bold bg-[#3E2D68] hover:bg-[#322353] text-white shrink-0 shadow-sm px-4 py-2"
          >
            <Sparkles className="w-4 h-4 mr-1.5 text-purple-300" />
            <span>Upload Syllabus & Extract</span>
          </Button>
        </div>
      )}

      {/* Selected Course Modules & Outcomes Details */}
      {courseDetails && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Modules (6 cols) */}
          <div className="lg:col-span-6 space-y-4">
            <Card className="rounded-3xl border-none shadow-sm bg-white overflow-hidden">
              <CardHeader className="flex flex-row items-center justify-between pb-3 border-b border-gray-50">
                <div className="flex items-center space-x-2">
                  <Layers className="w-5 h-5 text-[#3E2D68]" />
                  <CardTitle className="text-base font-bold text-gray-900">Curriculum Modules</CardTitle>
                </div>
                <div className="flex items-center space-x-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setExtractedResult(null);
                      setSyllabusFile(null);
                      setSyllabusText('');
                      setShowSyllabusModal(true);
                    }}
                    className="text-[11px] font-bold text-[#7C3AED] hover:text-[#6D28D9] hover:bg-purple-50 h-7 px-2"
                  >
                    <Sparkles className="w-3.5 h-3.5 mr-1" />
                    <span>Auto-Extract</span>
                  </Button>
                  <Badge variant="outline" className="text-xs font-bold">
                    {courseDetails.modules?.length || 0} Modules
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="pt-4 space-y-4">
                <div className="divide-y divide-gray-100 space-y-3">
                  {courseDetails.modules?.length === 0 ? (
                    <div className="py-6 text-center space-y-2">
                      <p className="text-xs text-gray-400">No modules yet. Upload a syllabus or add manually below.</p>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setShowSyllabusModal(true)}
                        className="rounded-xl text-xs font-bold text-[#3E2D68] border-purple-200"
                      >
                        <Sparkles className="w-3.5 h-3.5 mr-1 text-[#7C3AED]" /> Extract from Syllabus
                      </Button>
                    </div>
                  ) : (
                    courseDetails.modules?.map((m: any) => (
                      <div key={m.id} className="pt-3 first:pt-0 flex items-start justify-between gap-3">
                        <div className="space-y-1.5 flex-1">
                          <div className="flex items-center space-x-2">
                            <span className="w-6 h-6 rounded-lg bg-purple-50 text-[#3E2D68] text-xs font-black flex items-center justify-center shrink-0">
                              {m.order_index}
                            </span>
                            <h4 className="text-sm font-bold text-gray-900">{m.title}</h4>
                          </div>
                          {m.description && (
                            <p className="text-xs text-gray-500 pl-8 leading-relaxed">{m.description}</p>
                          )}
                          {/* Extracted Learning Objectives */}
                          {m.learning_objectives && m.learning_objectives.length > 0 && (
                            <div className="pl-8 pt-1 space-y-1">
                              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">
                                Learning Objectives ({m.learning_objectives.length})
                              </span>
                              <ul className="space-y-0.5 text-[11px] text-gray-600">
                                {m.learning_objectives.map((obj: string, oIdx: number) => (
                                  <li key={oIdx} className="flex items-start space-x-1.5">
                                    <span className="text-[#7C3AED] font-bold shrink-0 mt-0.5">•</span>
                                    <span className="leading-tight">{obj}</span>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}
                        </div>
                        <div className="flex items-center space-x-2 shrink-0">
                          <button
                            onClick={() => handleDeleteModule(m.id)}
                            className="text-gray-400 hover:text-rose-600 p-1.5 rounded-lg hover:bg-rose-50 transition-colors"
                            title="Delete module"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>

                <form onSubmit={handleAddModule} className="pt-3 border-t border-gray-100 space-y-2">
                  <p className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">Add Curriculum Module Manually</p>
                  <input
                    type="text"
                    required
                    placeholder="Module title (e.g. Module 4: Neural Networks & Deep Learning)"
                    value={moduleTitle}
                    onChange={(e) => setModuleTitle(e.target.value)}
                    className="w-full rounded-xl border border-gray-200 px-3 py-2 text-xs focus:outline-none focus:border-[#3E2D68]"
                  />
                  <div className="flex space-x-2">
                    <input
                      type="text"
                      placeholder="Brief module summary / topics..."
                      value={moduleDesc}
                      onChange={(e) => setModuleDesc(e.target.value)}
                      className="flex-1 rounded-xl border border-gray-200 px-3 py-2 text-xs focus:outline-none focus:border-[#3E2D68]"
                    />
                    <Button type="submit" size="sm" className="rounded-xl text-xs font-bold bg-[#3E2D68]">
                      <Plus className="w-3.5 h-3.5 mr-1" /> Add
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>

          {/* Course Outcomes (6 cols) */}
          <div className="lg:col-span-6 space-y-4">
            <Card className="rounded-3xl border-none shadow-sm bg-white overflow-hidden">
              <CardHeader className="flex flex-row items-center justify-between pb-3 border-b border-gray-50">
                <div className="flex items-center space-x-2">
                  <Award className="w-5 h-5 text-emerald-600" />
                  <CardTitle className="text-base font-bold text-gray-900">Course Outcomes (COs)</CardTitle>
                </div>
                <Badge variant="outline" className="text-xs font-bold">
                  {courseDetails.outcomes?.length || 0} Outcomes
                </Badge>
              </CardHeader>
              <CardContent className="pt-4 space-y-4">
                <div className="divide-y divide-gray-100 space-y-3">
                  {courseDetails.outcomes?.length === 0 ? (
                    <div className="py-6 text-center space-y-2">
                      <p className="text-xs text-gray-400">No outcomes defined yet. Upload a syllabus or add manually below.</p>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setShowSyllabusModal(true)}
                        className="rounded-xl text-xs font-bold text-emerald-700 border-emerald-200"
                      >
                        <Sparkles className="w-3.5 h-3.5 mr-1 text-emerald-600" /> Extract COs from Syllabus
                      </Button>
                    </div>
                  ) : (
                    courseDetails.outcomes?.map((co: any) => (
                      <div key={co.id} className="pt-3 first:pt-0 flex items-start justify-between gap-3">
                        <div className="flex items-start space-x-3">
                          <span className="px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 text-xs font-bold shrink-0 mt-0.5">
                            {co.code}
                          </span>
                          <div className="space-y-1">
                            {co.bloom_level && (
                              <span
                                className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${getBloomBadgeColor(
                                  co.bloom_level
                                )}`}
                              >
                                {co.bloom_level}
                              </span>
                            )}
                            <p className="text-xs text-gray-700 leading-relaxed">{co.description}</p>
                          </div>
                        </div>
                        <button
                          onClick={() => handleDeleteOutcome(co.id)}
                          className="text-gray-400 hover:text-rose-600 p-1.5 rounded-lg hover:bg-rose-50 transition-colors shrink-0"
                          title="Delete outcome"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))
                  )}
                </div>

                <form onSubmit={handleAddOutcome} className="pt-3 border-t border-gray-100 space-y-2">
                  <p className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">Add Course Outcome Manually</p>
                  <div className="flex space-x-2">
                    <input
                      type="text"
                      required
                      placeholder="CO4"
                      value={outcomeCode}
                      onChange={(e) => setOutcomeCode(e.target.value)}
                      className="w-20 rounded-xl border border-gray-200 px-3 py-2 text-xs font-bold focus:outline-none focus:border-[#3E2D68]"
                    />
                    <input
                      type="text"
                      required
                      placeholder="[Bloom Level] Measurable action verb + concept..."
                      value={outcomeDesc}
                      onChange={(e) => setOutcomeDesc(e.target.value)}
                      className="flex-1 rounded-xl border border-gray-200 px-3 py-2 text-xs focus:outline-none focus:border-[#3E2D68]"
                    />
                    <Button type="submit" size="sm" className="rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-700">
                      <Plus className="w-3.5 h-3.5 mr-1" /> Add
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {/* AI Syllabus Upload & Extraction Modal */}
      {showSyllabusModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-2xl w-full shadow-2xl space-y-5 animate-scaleUp max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <div className="flex items-center space-x-2">
                <Sparkles className="w-5 h-5 text-[#7C3AED]" />
                <h3 className="text-base font-bold text-gray-900">Upload Syllabus & Extract Curriculum</h3>
              </div>
              <button
                onClick={() => setShowSyllabusModal(false)}
                className="text-gray-400 hover:text-gray-600 text-lg font-bold"
              >
                ✕
              </button>
            </div>

            <div className="p-3 rounded-2xl bg-gray-50 border border-gray-200 text-xs flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Target Course</span>
                <span className="font-bold text-[#3E2D68]">
                  {selectedCourse?.code}: {selectedCourse?.title}
                </span>
              </div>
              <span className="text-xs text-gray-400 font-semibold">{selectedCourse?.term}</span>
            </div>

            {/* If Extracted Result is Ready */}
            {extractedResult ? (
              <div className="space-y-4 animate-fadeIn">
                <div className="p-3.5 bg-emerald-50 rounded-2xl border border-emerald-200 flex items-start space-x-2.5">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 mt-0.5 shrink-0" />
                  <div className="text-xs text-emerald-800 leading-relaxed">
                    <span className="font-bold block mb-0.5">Syllabus Extracted Successfully!</span>
                    Extracted {extractedResult.modules?.length || 0} Curriculum Modules, {extractedResult.course_outcomes?.length || 0} Course Outcomes, and {extractedResult.learning_objectives?.length || 0} Learning Objectives.
                  </div>
                </div>

                {/* Modules Preview */}
                <div className="space-y-2">
                  <h4 className="text-xs font-bold text-gray-700 uppercase tracking-wider flex items-center space-x-1.5">
                    <Layers className="w-4 h-4 text-[#7C3AED]" />
                    <span>Extracted Curriculum Modules ({extractedResult.modules?.length || 0})</span>
                  </h4>
                  <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                    {extractedResult.modules?.map((m: any, idx: number) => (
                      <div key={idx} className="p-3 rounded-2xl border border-gray-100 bg-gray-50/50 space-y-1">
                        <div className="flex items-center space-x-2">
                          <span className="w-5 h-5 rounded-md bg-[#3E2D68] text-white text-[10px] font-black flex items-center justify-center shrink-0">
                            {m.order_index || idx + 1}
                          </span>
                          <span className="text-xs font-bold text-gray-900">{m.title}</span>
                        </div>
                        {m.description && <p className="text-[11px] text-gray-500 pl-7">{m.description}</p>}
                        {m.learning_objectives?.length > 0 && (
                          <div className="pl-7 pt-1">
                            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-0.5">
                              Learning Objectives:
                            </span>
                            <ul className="space-y-0.5 text-[11px] text-gray-600">
                              {m.learning_objectives.map((lo: string, lIdx: number) => (
                                <li key={lIdx} className="flex items-start space-x-1">
                                  <span className="text-[#7C3AED]">•</span>
                                  <span>{lo}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Course Outcomes Preview */}
                <div className="space-y-2">
                  <h4 className="text-xs font-bold text-gray-700 uppercase tracking-wider flex items-center space-x-1.5">
                    <Award className="w-4 h-4 text-emerald-600" />
                    <span>Extracted Course Outcomes ({extractedResult.course_outcomes?.length || 0})</span>
                  </h4>
                  <div className="space-y-2 max-h-36 overflow-y-auto pr-1">
                    {extractedResult.course_outcomes?.map((co: any, idx: number) => (
                      <div key={idx} className="p-2.5 rounded-2xl border border-gray-100 bg-gray-50/50 flex items-start space-x-2.5">
                        <span className="px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 text-xs font-bold shrink-0 mt-0.5">
                          {co.code}
                        </span>
                        <div className="space-y-0.5 flex-1">
                          {co.bloom_level && (
                            <span
                              className={`inline-block px-1.5 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider border ${getBloomBadgeColor(
                                co.bloom_level
                              )}`}
                            >
                              {co.bloom_level}
                            </span>
                          )}
                          <p className="text-xs text-gray-700 leading-relaxed">{co.description}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex items-center justify-end space-x-3 pt-3 border-t border-gray-100">
                  <Button
                    onClick={() => {
                      setShowSyllabusModal(false);
                      setExtractedResult(null);
                    }}
                    className="rounded-xl text-xs font-bold bg-[#3E2D68] hover:bg-[#322353]"
                  >
                    Done
                  </Button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleExtractSyllabus} className="space-y-4">
                {/* Mode Selector Tabs */}
                <div className="flex items-center space-x-2 border-b border-gray-100 pb-2">
                  <button
                    type="button"
                    onClick={() => setSyllabusInputMode('file')}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                      syllabusInputMode === 'file'
                        ? 'bg-[#3E2D68] text-white shadow-sm'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    Upload Document (PDF, TXT, DOCX, MD)
                  </button>
                  <button
                    type="button"
                    onClick={() => setSyllabusInputMode('text')}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                      syllabusInputMode === 'text'
                        ? 'bg-[#3E2D68] text-white shadow-sm'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    Paste Syllabus Text
                  </button>
                </div>

                {syllabusInputMode === 'file' ? (
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1.5">
                      Select Syllabus File (.pdf, .docx, .txt, .md)
                    </label>
                    <div className="border-2 border-dashed border-purple-200 hover:border-[#3E2D68] rounded-2xl p-6 text-center bg-purple-50/20 transition-colors">
                      <input
                        type="file"
                        accept=".pdf,.docx,.txt,.md,.pptx,text/plain,application/pdf"
                        id="syllabus-file-upload"
                        onChange={(e) => {
                          if (e.target.files?.[0]) {
                            setSyllabusFile(e.target.files[0]);
                          }
                        }}
                        className="hidden"
                      />
                      <label htmlFor="syllabus-file-upload" className="cursor-pointer flex flex-col items-center justify-center space-y-2">
                        <div className="w-12 h-12 rounded-2xl bg-[#3E2D68]/10 text-[#3E2D68] flex items-center justify-center">
                          <FileText className="w-6 h-6" />
                        </div>
                        <div>
                          <span className="text-xs font-bold text-[#3E2D68] hover:underline">
                            Choose syllabus file
                          </span>
                          <p className="text-[11px] text-gray-400 mt-0.5">PDF, DOCX, TXT, MD up to 25MB</p>
                        </div>
                      </label>
                    </div>

                    {syllabusFile && (
                      <div className="mt-3 p-3 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center justify-between">
                        <div className="flex items-center space-x-2 overflow-hidden">
                          <FileText className="w-4 h-4 text-emerald-600 shrink-0" />
                          <span className="text-xs font-semibold text-emerald-800 truncate">
                            {syllabusFile.name}
                          </span>
                          <span className="text-[10px] text-emerald-600 font-mono shrink-0">
                            ({(syllabusFile.size / 1024).toFixed(1)} KB)
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={() => setSyllabusFile(null)}
                          className="text-xs text-rose-500 hover:text-rose-700 font-bold ml-2"
                        >
                          Remove
                        </button>
                      </div>
                    )}
                  </div>
                ) : (
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">
                      Paste Syllabus Content
                    </label>
                    <textarea
                      rows={8}
                      placeholder="Paste your course syllabus here (including Module 1, Module 2..., Course Outcomes, objectives)..."
                      value={syllabusText}
                      onChange={(e) => setSyllabusText(e.target.value)}
                      className="w-full rounded-2xl border border-gray-200 p-3 text-xs focus:outline-none focus:border-[#3E2D68] font-mono leading-relaxed"
                    />
                  </div>
                )}

                <div className="pt-2">
                  <label className="flex items-center space-x-2 text-xs font-semibold text-gray-700 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={replaceExistingSyllabus}
                      onChange={(e) => setReplaceExistingSyllabus(e.target.checked)}
                      className="rounded border-gray-300 text-[#3E2D68] focus:ring-[#3E2D68]"
                    />
                    <span>Replace existing modules and course outcomes with extracted ones</span>
                  </label>
                </div>

                <div className="flex items-center justify-end space-x-3 pt-3 border-t border-gray-100">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowSyllabusModal(false)}
                    className="rounded-xl text-xs font-semibold"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={extractingSyllabus || (syllabusInputMode === 'file' ? !syllabusFile : !syllabusText.trim())}
                    className="rounded-xl text-xs font-bold bg-[#3E2D68] hover:bg-[#322353] py-2 px-4 shadow-sm"
                  >
                    {extractingSyllabus ? (
                      <span className="flex items-center space-x-2">
                        <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                        <span>Extracting Curriculum with AI...</span>
                      </span>
                    ) : (
                      <span className="flex items-center space-x-1.5">
                        <Sparkles className="w-4 h-4 text-purple-200" />
                        <span>Extract & Apply Curriculum</span>
                      </span>
                    )}
                  </Button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* Create Course Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-lg w-full shadow-2xl space-y-5 animate-scaleUp max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <h3 className="text-lg font-bold text-gray-900">Create New Course</h3>
              <button
                onClick={() => {
                  setShowCreateModal(false);
                  setCreateSyllabusFile(null);
                  setExtractedCreateData(null);
                }}
                className="text-gray-400 hover:text-gray-600 text-lg font-bold"
              >
                ✕
              </button>
            </div>

            {/* Quick Auto-Fill from Syllabus Dropzone */}
            <div className="p-3.5 bg-gradient-to-r from-purple-50 to-indigo-50/30 rounded-2xl border border-purple-100 space-y-2">
              <div className="flex items-center space-x-2 text-[#3E2D68] text-xs font-bold">
                <Sparkles className="w-4 h-4 text-[#7C3AED]" />
                <span>Auto-Fill from Syllabus (Optional)</span>
              </div>
              <p className="text-[11px] text-gray-500 leading-relaxed">
                Upload your syllabus document to automatically extract the course code, title, description, curriculum modules, and course outcomes.
              </p>
              <div>
                <input
                  type="file"
                  accept=".pdf,.docx,.txt,.md,.pptx,text/plain,application/pdf"
                  id="create-modal-syllabus"
                  onChange={(e) => {
                    if (e.target.files?.[0]) {
                      handleCreateSyllabusUpload(e.target.files[0]);
                    }
                  }}
                  className="hidden"
                />
                <label
                  htmlFor="create-modal-syllabus"
                  className="inline-flex items-center space-x-2 px-3 py-1.5 bg-white border border-purple-200 hover:border-[#3E2D68] rounded-xl text-xs font-bold text-[#3E2D68] cursor-pointer shadow-2xs transition-colors"
                >
                  <FileUp className="w-3.5 h-3.5 text-[#7C3AED]" />
                  <span>
                    {extractingCreateSyllabus
                      ? 'Extracting Syllabus with AI...'
                      : createSyllabusFile
                      ? `Selected: ${createSyllabusFile.name}`
                      : 'Choose Syllabus Document'}
                  </span>
                </label>
              </div>

              {extractedCreateData && (
                <div className="mt-2 text-[11px] text-emerald-800 font-semibold bg-emerald-50 p-2 rounded-xl border border-emerald-200">
                  ✓ Extracted {extractedCreateData.modules?.length || 0} modules and {extractedCreateData.course_outcomes?.length || 0} course outcomes ready to be saved!
                </div>
              )}
            </div>

            <form onSubmit={handleCreateCourse} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Course Code</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. AI401"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  className="w-full rounded-xl border border-gray-200 px-3 py-2 text-xs focus:outline-none focus:border-[#3E2D68]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Course Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Deep Reinforcement Learning & Neural Search"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full rounded-xl border border-gray-200 px-3 py-2 text-xs focus:outline-none focus:border-[#3E2D68]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Academic Term</label>
                <input
                  type="text"
                  value={term}
                  onChange={(e) => setTerm(e.target.value)}
                  className="w-full rounded-xl border border-gray-200 px-3 py-2 text-xs focus:outline-none focus:border-[#3E2D68]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Course Description</label>
                <textarea
                  rows={3}
                  placeholder="Core concepts, syllabus summary, prerequisites..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full rounded-xl border border-gray-200 px-3 py-2 text-xs focus:outline-none focus:border-[#3E2D68]"
                />
              </div>

              <div className="flex items-center justify-end space-x-3 pt-3 border-t border-gray-100">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setShowCreateModal(false);
                    setCreateSyllabusFile(null);
                    setExtractedCreateData(null);
                  }}
                  className="rounded-xl text-xs font-semibold"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={creating || extractingCreateSyllabus}
                  className="rounded-xl text-xs font-bold bg-[#3E2D68] hover:bg-[#322353]"
                >
                  {creating ? 'Creating Course...' : 'Create Course'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
