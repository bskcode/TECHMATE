'use client';

import React, { useState, useEffect } from 'react';
import {
  FileText,
  CheckCircle2,
  XCircle,
  Trash2,
  Eye,
  FileUp,
  Sparkles,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useApp } from '@/components/providers/app-provider';

export default function MaterialsPage() {
  const { getActiveUser, toast, confirmAction } = useApp();
  const activeFaculty = getActiveUser('faculty');

  const [courses, setCourses] = useState<any[]>([]);
  const [selectedCourseId, setSelectedCourseId] = useState<string>('');
  const [materials, setMaterials] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [previewMaterial, setPreviewMaterial] = useState<any>(null);

  // Form: PDF File Upload Only
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  useEffect(() => {
    async function loadCourses() {
      const res = await fetch(`/api/courses?userId=${activeFaculty.id}&role=faculty`);
      const data = await res.json();
      setCourses(data.courses || []);
      if (data.courses?.[0]) {
        setSelectedCourseId(data.courses[0].id);
        loadMaterials(data.courses[0].id);
      } else {
        setSelectedCourseId('');
        setMaterials([]);
      }
    }
    loadCourses();
  }, [activeFaculty.id]);

  async function loadMaterials(courseId: string) {
    setLoading(true);
    try {
      const res = await fetch(`/api/courses/${courseId}/materials`);
      const data = await res.json();
      setMaterials(data.materials || []);
    } finally {
      setLoading(false);
    }
  }

  const handleCourseChange = (id: string) => {
    setSelectedCourseId(id);
    loadMaterials(id);
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCourseId) {
      toast('Please select a course first.', 'warning');
      return;
    }

    if (!selectedFile) {
      toast('Please select a PDF file to upload.', 'warning');
      return;
    }

    const lower = selectedFile.name.toLowerCase();
    const validExts = ['.pdf', '.txt', '.docx', '.pptx', '.md'];
    if (!validExts.some(ext => lower.endsWith(ext))) {
      toast('Supported formats: PDF, TXT, DOCX, PPTX, MD.', 'error');
      return;
    }

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('uploader_id', activeFaculty.id);
      formData.append('file', selectedFile);
      formData.append('filename', selectedFile.name);

      const res = await fetch(`/api/courses/${selectedCourseId}/materials`, {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();
      if (data.success) {
        setSelectedFile(null);
        toast('PDF material uploaded and text extracted for AI question grounding!', 'success');
        await loadMaterials(selectedCourseId);
      } else {
        toast(`Upload error: ${data.error}`, 'error');
      }
    } catch (err: any) {
      toast(`Error uploading: ${err.message}`, 'error');
    } finally {
      setUploading(false);
    }
  };

  const updateStatus = async (materialId: string, status: 'approved' | 'rejected') => {
    const res = await fetch(`/api/materials/${materialId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ approval_status: status }),
    });
    const data = await res.json();
    if (!res.ok || !data.success) {
      toast(data.error || 'Failed to update material status', 'error');
      return;
    }
    toast(`Material marked as ${status}.`, 'success');
    await loadMaterials(selectedCourseId);
  };

  const deleteMaterial = async (materialId: string) => {
    const ok = await confirmAction({
      title: 'Delete Material',
      message: 'Are you sure you want to delete this learning material? AI will no longer ground questions in it.',
      confirmLabel: 'Delete',
      variant: 'danger',
    });
    if (!ok) return;
    const res = await fetch(`/api/materials/${materialId}`, {
      method: 'DELETE',
    });
    if (!res.ok) {
      toast('Failed to delete material', 'error');
      return;
    }
    toast('Material deleted.', 'info');
    await loadMaterials(selectedCourseId);
  };

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-gray-900 tracking-tight">Learning Materials & Grounding Sources</h1>
          <p className="text-sm text-gray-500 font-medium">
            Upload syllabi, lecture notes, and slides. Only approved materials are used by AI for assessments.
          </p>
        </div>

        {/* Course Filter */}
        <div className="flex items-center space-x-2">
          <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Course:</span>
          <select
            value={selectedCourseId}
            onChange={(e) => handleCourseChange(e.target.value)}
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
        {/* Upload Panel (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          <Card className="rounded-3xl border-none shadow-sm bg-white overflow-hidden">
            <CardHeader className="border-b border-gray-50 pb-3">
              <div className="flex items-center space-x-2">
                <FileUp className="w-5 h-5 text-[#3E2D68]" />
                <CardTitle className="text-base font-bold text-gray-900">Upload Course Material</CardTitle>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Upload your course syllabus, lecture slides, or textbook (PDF, TXT, DOCX, MD). Assessment questions are strictly generated from this uploaded content.
              </p>
            </CardHeader>
            <CardContent className="pt-4">
              <form onSubmit={handleUpload} className="space-y-4">
                {/* File Dropzone */}
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1.5">
                    Select Document (PDF, TXT, DOCX, MD)
                  </label>
                  <div className="border-2 border-dashed border-purple-200 hover:border-[#3E2D68] rounded-2xl p-4 text-center bg-purple-50/30 transition-colors">
                    <input
                      type="file"
                      accept=".pdf,.txt,.docx,.pptx,.md,application/pdf,text/plain"
                      id="pdf-upload"
                      onChange={(e) => {
                        if (e.target.files?.[0]) {
                          setSelectedFile(e.target.files[0]);
                        }
                      }}
                      className="hidden"
                    />
                    <label
                      htmlFor="pdf-upload"
                      className="cursor-pointer flex flex-col items-center justify-center space-y-2"
                    >
                      <div className="w-12 h-12 rounded-2xl bg-[#3E2D68]/10 text-[#3E2D68] flex items-center justify-center">
                        <FileText className="w-6 h-6" />
                      </div>
                      <div>
                        <span className="text-xs font-bold text-[#3E2D68] hover:underline">
                          Choose a PDF file
                        </span>
                        <p className="text-[11px] text-gray-400 mt-0.5">PDF documents up to 25MB</p>
                      </div>
                    </label>
                  </div>

                  {selectedFile && (
                    <div className="mt-3 p-3 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center justify-between">
                      <div className="flex items-center space-x-2 overflow-hidden">
                        <FileText className="w-4 h-4 text-emerald-600 shrink-0" />
                        <span className="text-xs font-semibold text-emerald-800 truncate">
                          {selectedFile.name}
                        </span>
                        <span className="text-[10px] text-emerald-600 font-mono shrink-0">
                          ({(selectedFile.size / 1024).toFixed(1)} KB)
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => setSelectedFile(null)}
                        className="text-xs text-rose-500 hover:text-rose-700 font-bold ml-2"
                      >
                        Remove
                      </button>
                    </div>
                  )}
                </div>

                <Button
                  type="submit"
                  disabled={uploading || !selectedFile}
                  className="w-full rounded-xl text-xs font-bold bg-[#3E2D68] hover:bg-[#322353] py-5 shadow-sm"
                >
                  {uploading ? (
                    <span className="flex items-center space-x-2">
                      <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                      <span>Ingesting PDF & Extracting Text...</span>
                    </span>
                  ) : (
                    'Upload & Extract PDF for Grounding'
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* AI Grounding Notice */}
          <div className="p-4 rounded-2xl bg-purple-50/70 border border-purple-200/60 text-xs text-[#3E2D68]">
            <div className="flex items-center space-x-2 mb-1">
              <Sparkles className="w-4 h-4 text-[#7C3AED]" />
              <span className="font-bold">Strict Grounding Guarantee</span>
            </div>
            <p className="text-[11px] leading-relaxed text-[#4E3982]">
              All AI assessment questions, answers, rubrics, and diagnostic hints are generated <strong>exclusively</strong> from the text extracted from your approved uploaded PDF materials.
            </p>
          </div>
        </div>

        {/* Materials Table & Approval Actions (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          <Card className="rounded-3xl border-none shadow-sm bg-white overflow-hidden">
            <CardHeader className="flex flex-row items-center justify-between pb-3 border-b border-gray-50">
              <CardTitle className="text-base font-bold text-gray-900">Ingested Course Materials</CardTitle>
              <Badge variant="outline" className="text-xs">
                {materials.length} Documents
              </Badge>
            </CardHeader>
            <CardContent className="pt-4 divide-y divide-gray-100">
              {materials.length === 0 ? (
                <div className="text-center py-12 text-gray-400 text-xs">
                  No materials uploaded yet for this course. Use the form on the left to upload your syllabus.
                </div>
              ) : (
                materials.map((m) => (
                  <div key={m.id} className="py-4 first:pt-0 flex items-start justify-between gap-4">
                    <div className="flex items-start space-x-3">
                      <div className="w-10 h-10 rounded-xl bg-purple-50 text-[#3E2D68] flex items-center justify-center shrink-0 mt-0.5">
                        <FileText className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-gray-900">{m.filename}</h4>
                        <div className="flex items-center space-x-3 text-[11px] text-gray-400 mt-1 font-medium">
                          <span>{m.file_type.toUpperCase()}</span>
                          <span>•</span>
                          <span>{m.character_count || 0} characters</span>
                          <span>•</span>
                          <span>{new Date(m.created_at).toLocaleDateString()}</span>
                        </div>
                      </div>
                    </div>

                    {/* Actions and Status */}
                    <div className="flex items-center space-x-2 shrink-0">
                      {m.approval_status === 'approved' ? (
                        <Badge variant="emerald" className="text-[10px] font-bold">
                          Approved
                        </Badge>
                      ) : (
                        <div className="flex items-center space-x-1">
                          <button
                            onClick={() => updateStatus(m.id, 'approved')}
                            title="Approve for AI Grounding"
                            className="p-1 rounded-lg text-emerald-600 hover:bg-emerald-50 transition-colors"
                          >
                            <CheckCircle2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => updateStatus(m.id, 'rejected')}
                            title="Reject"
                            className="p-1 rounded-lg text-rose-500 hover:bg-rose-50 transition-colors"
                          >
                            <XCircle className="w-4 h-4" />
                          </button>
                        </div>
                      )}

                      <button
                        onClick={() => setPreviewMaterial(m)}
                        title="Preview Extracted Text"
                        className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors"
                      >
                        <Eye className="w-4 h-4" />
                      </button>

                      <button
                        onClick={() => deleteMaterial(m.id)}
                        title="Delete Document"
                        className="p-1.5 rounded-lg text-gray-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Extracted Text Preview Modal */}
      {previewMaterial && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-2xl w-full shadow-2xl space-y-4 max-h-[85vh] flex flex-col animate-scaleUp">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <div>
                <h3 className="text-base font-bold text-gray-900">{previewMaterial.filename}</h3>
                <p className="text-xs text-gray-400">
                  {previewMaterial.character_count} characters extracted • Status: {previewMaterial.approval_status}
                </p>
              </div>
              <button
                onClick={() => setPreviewMaterial(null)}
                className="text-gray-400 hover:text-gray-600 font-bold"
              >
                ✕
              </button>
            </div>

            <div className="flex-1 overflow-y-auto bg-gray-50 rounded-2xl p-4 font-mono text-xs text-gray-700 whitespace-pre-wrap leading-relaxed">
              {previewMaterial.extracted_text || 'No text extracted.'}
            </div>

            <div className="flex items-center justify-end space-x-3 pt-2">
              <Button
                variant="outline"
                onClick={() => setPreviewMaterial(null)}
                className="rounded-xl text-xs font-semibold"
              >
                Close Preview
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

