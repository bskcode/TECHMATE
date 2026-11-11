'use client';

import React, { useState, useEffect } from 'react';
import { BookOpen, Plus, Copy, Check, Users, Layers, Award, Sparkles } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

export default function CoursesPage() {
  const [courses, setCourses] = useState<any[]>([]);
  const [selectedCourse, setSelectedCourse] = useState<any>(null);
  const [courseDetails, setCourseDetails] = useState<any>(null);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);

  // Form state
  const [code, setCode] = useState('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [term, setTerm] = useState('Fall 2026');
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    loadCourses();
  }, []);

  async function loadCourses() {
    const res = await fetch('/api/courses');
    const data = await res.json();
    setCourses(data.courses || []);
    if (data.courses?.[0]) {
      loadCourseDetails(data.courses[0].id);
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
          instructor_id: '00000000-0000-0000-0000-000000000001',
        }),
      });
      const data = await res.json();
      if (data.success) {
        setShowCreateModal(false);
        setCode('');
        setTitle('');
        setDescription('');
        await loadCourses();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setCreating(false);
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
                    <span>25 students</span>
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
              <CardContent className="pt-4 divide-y divide-gray-100 space-y-3">
                {courseDetails.modules?.map((m: any, idx: number) => (
                  <div key={m.id} className="pt-3 first:pt-0">
                    <div className="flex items-center justify-between">
                      <h4 className="text-sm font-bold text-gray-900">
                        {m.title}
                      </h4>
                      <span className="text-xs font-mono text-gray-400">Idx #{m.order_index}</span>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">{m.description}</p>
                  </div>
                ))}
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
                <Badge variant="emerald" className="text-xs">
                  Accredited
                </Badge>
              </CardHeader>
              <CardContent className="pt-4 divide-y divide-gray-100 space-y-3">
                {courseDetails.outcomes?.map((co: any) => (
                  <div key={co.id} className="pt-3 first:pt-0 flex items-start space-x-3">
                    <span className="px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 text-xs font-bold shrink-0 mt-0.5">
                      {co.code}
                    </span>
                    <p className="text-xs text-gray-700 leading-relaxed">{co.description}</p>
                  </div>
                ))}
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
