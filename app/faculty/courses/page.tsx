'use client';

import React, { useState, useEffect } from 'react';
import { BookOpen, Plus, Copy, Check, Users, Layers, Award, Trash2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useApp } from '@/components/providers/app-provider';

export default function CoursesPage() {
  const { getActiveUser, toast, confirmAction } = useApp();
  const activeFaculty = getActiveUser('faculty');

  const [courses, setCourses] = useState<any[]>([]);
  const [selectedCourse, setSelectedCourse] = useState<any>(null);
  const [courseDetails, setCourseDetails] = useState<any>(null);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);

  // Course form state
  const [code, setCode] = useState('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [term, setTerm] = useState('Fall 2026');
  const [creating, setCreating] = useState(false);

  // Module & Outcome form state
  const [moduleTitle, setModuleTitle] = useState('');
  const [moduleDesc, setModuleDesc] = useState('');
  const [outcomeCode, setOutcomeCode] = useState('');
  const [outcomeDesc, setOutcomeDesc] = useState('');

  useEffect(() => {
    loadCourses();
  }, [activeFaculty.id]);

  async function loadCourses() {
    const res = await fetch(`/api/courses?userId=${activeFaculty.id}&role=faculty`);
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
        setShowCreateModal(false);
        setCode('');
        setTitle('');
        setDescription('');
        toast(`Course ${data.course.code} created!`, 'success');
        await loadCourses();
      } else {
        toast(data.error || 'Failed to create course', 'error');
      }
    } catch (err: any) {
      toast(err.message || 'Failed to create course', 'error');
    } finally {
      setCreating(false);
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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-gray-900 tracking-tight">Course Management</h1>
          <p className="text-sm text-gray-500 font-medium">
            Manage your courses, syllabus outcomes, and student rosters.
          </p>
        </div>
        <Button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center space-x-2 text-xs font-bold rounded-xl"
        >
          <Plus className="w-4 h-4" />
          <span>Create New Course</span>
        </Button>
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
                <Badge variant="outline" className="text-xs">
                  {courseDetails.modules?.length || 0} Modules
                </Badge>
              </CardHeader>
              <CardContent className="pt-4 space-y-4">
                <div className="divide-y divide-gray-100 space-y-3">
                  {courseDetails.modules?.length === 0 ? (
                    <p className="text-xs text-gray-400 py-2">No modules yet. Add your first module below.</p>
                  ) : (
                    courseDetails.modules?.map((m: any) => (
                      <div key={m.id} className="pt-3 first:pt-0 flex items-start justify-between gap-3">
                        <div>
                          <h4 className="text-sm font-bold text-gray-900">{m.title}</h4>
                          <p className="text-xs text-gray-500 mt-1">{m.description}</p>
                        </div>
                        <div className="flex items-center space-x-2 shrink-0">
                          <span className="text-xs font-mono text-gray-400">#{m.order_index}</span>
                          <button
                            onClick={() => handleDeleteModule(m.id)}
                            className="text-gray-400 hover:text-rose-600 p-1 rounded-lg hover:bg-rose-50 transition-colors"
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
                  <p className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">Add Curriculum Module</p>
                  <input
                    type="text"
                    required
                    placeholder="Module title (e.g. Module 4: Neural Networks)"
                    value={moduleTitle}
                    onChange={(e) => setModuleTitle(e.target.value)}
                    className="w-full rounded-xl border border-gray-200 px-3 py-2 text-xs focus:outline-none focus:border-[#3E2D68]"
                  />
                  <div className="flex space-x-2">
                    <input
                      type="text"
                      placeholder="Brief module summary..."
                      value={moduleDesc}
                      onChange={(e) => setModuleDesc(e.target.value)}
                      className="flex-1 rounded-xl border border-gray-200 px-3 py-2 text-xs focus:outline-none focus:border-[#3E2D68]"
                    />
                    <Button type="submit" size="sm" className="rounded-xl text-xs font-bold">
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
                <a
                  href="/templates/course-objectives-template.md"
                  download
                  className="text-[11px] font-bold text-[#3E2D68] hover:underline bg-purple-50 px-2.5 py-1 rounded-full"
                >
                  Download CO Template
                </a>
              </CardHeader>
              <CardContent className="pt-4 space-y-4">
                <div className="divide-y divide-gray-100 space-y-3">
                  {courseDetails.outcomes?.length === 0 ? (
                    <p className="text-xs text-gray-400 py-2">No outcomes defined yet. Add Bloom-aligned outcomes below.</p>
                  ) : (
                    courseDetails.outcomes?.map((co: any) => (
                      <div key={co.id} className="pt-3 first:pt-0 flex items-start justify-between gap-3">
                        <div className="flex items-start space-x-3">
                          <span className="px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 text-xs font-bold shrink-0 mt-0.5">
                            {co.code}
                          </span>
                          <p className="text-xs text-gray-700 leading-relaxed">{co.description}</p>
                        </div>
                        <button
                          onClick={() => handleDeleteOutcome(co.id)}
                          className="text-gray-400 hover:text-rose-600 p-1 rounded-lg hover:bg-rose-50 transition-colors shrink-0"
                          title="Delete outcome"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))
                  )}
                </div>

                <form onSubmit={handleAddOutcome} className="pt-3 border-t border-gray-100 space-y-2">
                  <p className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">Add Course Outcome</p>
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

      {/* Create Course Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-5 animate-scaleUp">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-gray-900">Create New Course</h3>
              <button
                onClick={() => setShowCreateModal(false)}
                className="text-gray-400 hover:text-gray-600 text-lg font-bold"
              >
                ✕
              </button>
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
                  placeholder="e.g. Deep Reinforcement Learning"
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

              <div className="flex items-center justify-end space-x-3 pt-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowCreateModal(false)}
                  className="rounded-xl text-xs font-semibold"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={creating}
                  className="rounded-xl text-xs font-bold bg-[#3E2D68]"
                >
                  {creating ? 'Creating...' : 'Create Course'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

