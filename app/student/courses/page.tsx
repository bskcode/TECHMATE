'use client';

import React, { useState, useEffect } from 'react';
import { BookOpen, Plus, Layers, Eye, X } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
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

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-gray-900 tracking-tight">My Enrolled Courses</h1>
          <p className="text-sm text-gray-500 font-medium">
            Access curriculum modules, approved handouts, and course outcome requirements.
          </p>
        </div>

        <Button
          onClick={() => setShowEnrollModal(true)}
          className="rounded-xl text-xs font-bold bg-[#3E2D68] flex items-center space-x-1.5"
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
                  <Badge variant="secondary" className="font-bold text-xs text-[#3E2D68]">
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
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Modules (6 cols) */}
          <div className="lg:col-span-6 space-y-4">
            <Card className="rounded-3xl border-none shadow-sm bg-white overflow-hidden p-6 space-y-4">
              <div className="flex items-center space-x-2 pb-3 border-b border-gray-50">
                <Layers className="w-5 h-5 text-[#3E2D68]" />
                <CardTitle className="text-base font-bold text-gray-900">Modules & Learning Milestones</CardTitle>
              </div>

              <div className="space-y-3">
                {courseDetails.modules?.map((m: any) => (
                  <div key={m.id} className="p-3 bg-gray-50 rounded-2xl space-y-1">
                    <h4 className="text-xs font-bold text-gray-900">{m.title}</h4>
                    <p className="text-[11px] text-gray-500">{m.description}</p>
                  </div>
                ))}
              </div>
            </Card>
          </div>

          {/* Approved Materials / Handouts (6 cols) */}
          <div className="lg:col-span-6 space-y-4">
            <Card className="rounded-3xl border-none shadow-sm bg-white overflow-hidden p-6 space-y-4">
              <div className="flex items-center space-x-2 pb-3 border-b border-gray-50">
                <BookOpen className="w-5 h-5 text-[#22C55E]" />
                <CardTitle className="text-base font-bold text-gray-900">Approved Course Handouts</CardTitle>
              </div>

              <div className="space-y-3">
                {courseDetails.materials?.length === 0 ? (
                  <p className="text-xs text-gray-400">No approved handouts uploaded yet.</p>
                ) : (
                  courseDetails.materials?.map((mat: any) => (
                    <div
                      key={mat.id}
                      onClick={() => setPreviewMaterial(mat)}
                      className="p-3 bg-gray-50 hover:bg-purple-50/50 rounded-2xl flex items-center justify-between cursor-pointer transition-colors"
                    >
                      <div>
                        <h4 className="text-xs font-bold text-gray-900">{mat.filename}</h4>
                        <p className="text-[10px] text-gray-400">
                          {(mat.file_size_bytes / 1024).toFixed(1)} KB • Approved by Faculty
                        </p>
                      </div>
                      <Button size="sm" variant="outline" className="h-7 rounded-xl text-[10px] font-bold bg-white">
                        <Eye className="w-3 h-3 mr-1" /> Read
                      </Button>
                    </div>
                  ))
                )}
              </div>
            </Card>
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

