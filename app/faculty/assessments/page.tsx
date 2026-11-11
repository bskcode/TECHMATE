'use client';

import React, { useState, useEffect } from 'react';
import {
  CheckSquare,
  Sparkles,
  Plus,
  Edit3,
  Eye,
  CheckCircle2,
  Clock,
  Award,
  Layers,
  HelpCircle,
  BrainCircuit,
  Lock,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { BloomTrait, Question } from '@/types';

export default function AssessmentsPage() {
  const [courses, setCourses] = useState<any[]>([]);
  const [selectedCourseId, setSelectedCourseId] = useState<string>('');
  const [assessments, setAssessments] = useState<any[]>([]);
  const [selectedAssessment, setSelectedAssessment] = useState<any>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(false);

  // AI Generator Modal
  const [showGenerateModal, setShowGenerateModal] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [targetTraits, setTargetTraits] = useState<BloomTrait[]>([
    'remembering',
    'understanding',
    'application',
    'analysis',
    'creativity',
    'evaluation',
  ]);
  const [difficulty, setDifficulty] = useState<'easy' | 'medium' | 'hard'>('medium');
  const [questionCount, setQuestionCount] = useState(6);

  // Edit Question Modal
  const [editingQuestion, setEditingQuestion] = useState<any>(null);

  // Create Assessment Modal
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newType, setNewType] = useState<'diagnostic' | 'module' | 'final'>('diagnostic');
  const [newDuration, setNewDuration] = useState(30);

  useEffect(() => {
    async function loadCourses() {
      const res = await fetch('/api/courses');
      const data = await res.json();
      setCourses(data.courses || []);
      if (data.courses?.[0]) {
        setSelectedCourseId(data.courses[0].id);
        loadAssessments(data.courses[0].id);
      }
    }
    loadCourses();
  }, []);

  async function loadAssessments(courseId: string) {
    setLoading(true);
    try {
      const res = await fetch(`/api/courses/${courseId}/assessments`);
      const data = await res.json();
      setAssessments(data.assessments || []);
      if (data.assessments?.[0]) {
        loadAssessmentDetails(data.assessments[0].id);
      }
    } finally {
      setLoading(false);
    }
  }

  async function loadAssessmentDetails(assessmentId: string) {
    const res = await fetch(`/api/assessments/${assessmentId}?isFaculty=true`);
    const data = await res.json();
    setSelectedAssessment(data.assessment);
    setQuestions(data.questions || []);
  }

  const handleGenerateQuestions = async () => {
    if (!selectedAssessment) return;
    setGenerating(true);
    try {
      const res = await fetch(`/api/assessments/${selectedAssessment.id}/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          questionCount,
          targetTraits,
          difficulty,
        }),
      });

      const data = await res.json();
      if (data.success) {
        setShowGenerateModal(false);
        await loadAssessmentDetails(selectedAssessment.id);
      } else {
        alert(`Generation error: ${data.error}`);
      }
    } catch (err: any) {
      alert(`Error: ${err.message}`);
    } finally {
      setGenerating(false);
    }
  };

  const handlePublishAssessment = async () => {
    if (!selectedAssessment) return;
    if (!confirm('Publish this assessment? Once published, version will be locked and students can attempt it.')) return;

    const res = await fetch(`/api/assessments/${selectedAssessment.id}/publish`, {
      method: 'POST',
    });
    const data = await res.json();
    if (data.success) {
      await loadAssessmentDetails(selectedAssessment.id);
      await loadAssessments(selectedCourseId);
    }
  };

  const handleSaveQuestionEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingQuestion) return;

    try {
      const res = await fetch(`/api/questions/${editingQuestion.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editingQuestion),
      });

      const data = await res.json();
      if (data.success) {
        setEditingQuestion(null);
        await loadAssessmentDetails(selectedAssessment.id);
      }
    } catch (err: any) {
      alert(`Save error: ${err.message}`);
    }
  };

  const handleCreateAssessment = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch(`/api/courses/${selectedCourseId}/assessments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: newTitle,
          assessment_type: newType,
          time_limit_minutes: newDuration,
          max_marks: 30,
          passing_marks: 15,
          progressive_hints_enabled: true,
        }),
      });

      const data = await res.json();
      if (data.success) {
        setShowCreateModal(false);
        setNewTitle('');
        await loadAssessments(selectedCourseId);
        loadAssessmentDetails(data.assessment.id);
      }
    } catch (err: any) {
      alert(err.message);
    }
  };

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-gray-900 tracking-tight">Assessment Authoring & Workbench</h1>
          <p className="text-sm text-gray-500 font-medium">
            AI pre-generates complete question packages (rubrics, hints, keys). Review, edit, and publish.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <select
            value={selectedCourseId}
            onChange={(e) => {
              setSelectedCourseId(e.target.value);
              loadAssessments(e.target.value);
            }}
            className="rounded-xl border border-gray-200 bg-white px-3 py-2 text-xs font-bold text-[#3E2D68] focus:outline-none focus:border-[#3E2D68] shadow-sm"
          >
            {courses.map((c) => (
              <option key={c.id} value={c.id}>
                {c.code}: {c.title}
              </option>
            ))}
          </select>

          <Button
            onClick={() => setShowCreateModal(true)}
            variant="default"
            size="sm"
            className="rounded-xl text-xs font-bold bg-[#3E2D68]"
          >
            <Plus className="w-4 h-4 mr-1" /> Create Assessment
          </Button>
        </div>
      </div>

      {/* Assessment Selector Tabs */}
      <div className="flex items-center space-x-3 overflow-x-auto pb-2">
        {assessments.map((a) => {
          const isSelected = selectedAssessment?.id === a.id;
          return (
            <button
              key={a.id}
              onClick={() => loadAssessmentDetails(a.id)}
              className={`px-4 py-2.5 rounded-2xl text-xs font-bold whitespace-nowrap transition-all flex items-center space-x-2 border ${
                isSelected
                  ? 'bg-[#3E2D68] text-white border-[#3E2D68] shadow-md'
                  : 'bg-white text-gray-700 border-gray-100 hover:border-gray-300'
              }`}
            >
              <span className="capitalize">[{a.assessment_type}]</span>
              <span>{a.title}</span>
              <span
                className={`text-[10px] px-1.5 py-0.5 rounded-full uppercase ${
                  a.status === 'published' ? 'bg-emerald-500/20 text-emerald-300' : 'bg-amber-500/20 text-amber-300'
                }`}
              >
                {a.status}
              </span>
            </button>
          );
        })}
      </div>

      {/* Active Assessment Overview Bar */}
      {selectedAssessment && (
        <Card className="rounded-3xl border-none shadow-sm bg-white p-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-lg font-bold text-gray-900">{selectedAssessment.title}</h2>
                <Badge
                  variant={selectedAssessment.status === 'published' ? 'emerald' : 'amber'}
                  className="text-xs uppercase font-bold"
                >
                  {selectedAssessment.status}
                </Badge>
                <Badge variant="outline" className="text-xs">
                  v{selectedAssessment.version} Locked
                </Badge>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                {selectedAssessment.description || 'Cognitive assessment evaluating academic traits.'}
              </p>

              <div className="flex items-center space-x-4 mt-3 text-xs text-gray-500 font-semibold">
                <span className="flex items-center space-x-1">
                  <Clock className="w-3.5 h-3.5 text-gray-400" />
                  <span>{selectedAssessment.time_limit_minutes} mins duration</span>
                </span>
                <span>•</span>
                <span className="flex items-center space-x-1">
                  <Award className="w-3.5 h-3.5 text-gray-400" />
                  <span>{selectedAssessment.max_marks} marks total</span>
                </span>
                <span>•</span>
                <span className="flex items-center space-x-1">
                  <CheckSquare className="w-3.5 h-3.5 text-gray-400" />
                  <span>{questions.length} questions mapped</span>
                </span>
              </div>
            </div>

            {/* Actions: Generate with AI or Publish */}
            <div className="flex items-center space-x-3">
              <Button
                onClick={() => setShowGenerateModal(true)}
                variant="outline"
                className="rounded-xl text-xs font-bold border-purple-200 text-[#3E2D68] bg-purple-50/60 hover:bg-purple-100 flex items-center space-x-1.5"
              >
                <Sparkles className="w-4 h-4 text-[#7C3AED]" />
                <span>Generate Questions (Groq)</span>
              </Button>

              {selectedAssessment.status !== 'published' && (
                <Button
                  onClick={handlePublishAssessment}
                  className="rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white flex items-center space-x-1.5 shadow-sm"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Publish Assessment</span>
                </Button>
              )}
            </div>
          </div>
        </Card>
      )}

      {/* Questions List (Workbench) */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-bold text-gray-900">
            Pre-Generated Question Packages ({questions.length})
          </h3>
          <p className="text-xs text-gray-400 font-medium">
            Each question contains pre-configured answer key, rubric weights, and exactly 2 progressive hints.
          </p>
        </div>

        {questions.length === 0 ? (
          <Card className="rounded-3xl border-dashed border-2 border-gray-200 bg-white p-12 text-center">
            <BrainCircuit className="w-12 h-12 text-purple-300 mx-auto mb-3" />
            <h4 className="text-sm font-bold text-gray-800">No questions in this assessment yet</h4>
            <p className="text-xs text-gray-400 mt-1 max-w-sm mx-auto">
              Click &quot;Generate Questions (Groq)&quot; above to have AI create complete question packages grounded in your
              course materials.
            </p>
            <Button
              onClick={() => setShowGenerateModal(true)}
              className="mt-4 rounded-xl text-xs font-bold bg-[#3E2D68]"
            >
              <Sparkles className="w-4 h-4 mr-1.5 text-amber-300" /> Generate Questions Now
            </Button>
          </Card>
        ) : (
          questions.map((q: any, idx: number) => (
            <Card
              key={q.id}
              className="rounded-3xl border-none shadow-sm bg-white overflow-hidden hover:shadow-md transition-shadow"
            >
              <CardContent className="p-6 space-y-4">
                {/* Question Header */}
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-center space-x-3">
                    <span className="w-7 h-7 rounded-xl bg-purple-100 text-[#3E2D68] font-bold text-xs flex items-center justify-center shrink-0">
                      Q{idx + 1}
                    </span>
                    <Badge variant="secondary" className="uppercase font-bold text-[10px] text-[#3E2D68]">
                      {q.primary_trait}
                    </Badge>
                    <Badge variant="outline" className="text-[10px] uppercase font-semibold">
                      {q.question_type.replace('_', ' ')}
                    </Badge>
                    <Badge
                      variant={
                        q.difficulty === 'easy' ? 'emerald' : q.difficulty === 'medium' ? 'amber' : 'coral'
                      }
                      className="text-[10px] uppercase font-bold"
                    >
                      {q.difficulty}
                    </Badge>
                  </div>

                  <div className="flex items-center space-x-2">
                    <span className="text-xs font-bold text-gray-900">{q.max_marks} Marks</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setEditingQuestion(JSON.parse(JSON.stringify(q)))}
                      className="rounded-lg text-gray-500 hover:text-[#3E2D68]"
                    >
                      <Edit3 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>

                {/* Question Text */}
                <p className="text-sm font-semibold text-gray-900 leading-relaxed pl-10">
                  {q.question_text}
                </p>

                {/* Options if MCQ / Multiple Select */}
                {q.options && q.options.length > 0 && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pl-10">
                    {q.options.map((opt: string, i: number) => {
                      const isCorrect =
                        q.answer_key?.correct_answer?.includes(opt) ||
                        opt === q.answer_key?.correct_answer;
                      return (
                        <div
                          key={i}
                          className={`p-2.5 rounded-xl text-xs font-medium border flex items-center space-x-2 ${
                            isCorrect
                              ? 'bg-emerald-50 border-emerald-200 text-emerald-900 font-semibold'
                              : 'bg-gray-50 border-gray-100 text-gray-700'
                          }`}
                        >
                          <span className="w-5 h-5 rounded-md bg-white border text-center text-[10px] font-bold text-gray-500 shrink-0">
                            {String.fromCharCode(65 + i)}
                          </span>
                          <span className="truncate">{opt}</span>
                          {isCorrect && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 ml-auto shrink-0" />}
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* Secure Package Details (Faculty View Only) */}
                <div className="pl-10 pt-2 grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
                  {/* Correct Answer & Explanation */}
                  <div className="p-3 bg-emerald-50/60 rounded-2xl border border-emerald-100">
                    <div className="flex items-center space-x-1 text-emerald-800 font-bold mb-1">
                      <Lock className="w-3 h-3 text-emerald-600" />
                      <span>Answer Key</span>
                    </div>
                    <p className="font-semibold text-emerald-950 truncate">{q.answer_key?.correct_answer}</p>
                    <p className="text-[11px] text-emerald-700/80 mt-1 line-clamp-2">
                      {q.answer_key?.explanation}
                    </p>
                  </div>

                  {/* Pre-generated Hint 1 */}
                  <div className="p-3 bg-purple-50/60 rounded-2xl border border-purple-100">
                    <div className="flex items-center space-x-1 text-[#3E2D68] font-bold mb-1">
                      <Lock className="w-3 h-3 text-[#3E2D68]" />
                      <span>Progressive Hint 1</span>
                    </div>
                    <p className="text-[11px] text-gray-700 line-clamp-3">
                      {q.hints?.find((h: any) => h.hint_number === 1)?.hint_text || 'No hint 1 configured.'}
                    </p>
                  </div>

                  {/* Pre-generated Hint 2 */}
                  <div className="p-3 bg-purple-50/60 rounded-2xl border border-purple-100">
                    <div className="flex items-center space-x-1 text-[#3E2D68] font-bold mb-1">
                      <Lock className="w-3 h-3 text-[#3E2D68]" />
                      <span>Progressive Hint 2</span>
                    </div>
                    <p className="text-[11px] text-gray-700 line-clamp-3">
                      {q.hints?.find((h: any) => h.hint_number === 2)?.hint_text || 'No hint 2 configured.'}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* AI Question Package Generator Modal */}
      {showGenerateModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-lg w-full shadow-2xl space-y-5 animate-scaleUp">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <div className="flex items-center space-x-2">
                <Sparkles className="w-5 h-5 text-[#7C3AED]" />
                <h3 className="text-base font-bold text-gray-900">AI Question Package Generator</h3>
              </div>
              <button
                onClick={() => setShowGenerateModal(false)}
                className="text-gray-400 hover:text-gray-600 font-bold"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-gray-500 leading-relaxed">
              Groq generates complete, grounded question packages conforming to Bloom&apos;s Revised Taxonomy, complete with
              marking keys and progressive hints.
            </p>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Number of Questions</label>
                <input
                  type="number"
                  min={1}
                  max={12}
                  value={questionCount}
                  onChange={(e) => setQuestionCount(Number(e.target.value))}
                  className="w-full rounded-xl border border-gray-200 px-3 py-2 text-xs focus:outline-none focus:border-[#3E2D68]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Difficulty Level</label>
                <select
                  value={difficulty}
                  onChange={(e) => setDifficulty(e.target.value as any)}
                  className="w-full rounded-xl border border-gray-200 px-3 py-2 text-xs focus:outline-none focus:border-[#3E2D68]"
                >
                  <option value="easy">Easy (Foundational Recall & Definition)</option>
                  <option value="medium">Medium (Application & Breakdown)</option>
                  <option value="hard">Hard (Evaluation & Heuristic Design)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  Target Bloom Cognitive Dimensions
                </label>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  {[
                    'remembering',
                    'understanding',
                    'application',
                    'analysis',
                    'creativity',
                    'evaluation',
                  ].map((trait) => (
                    <label key={trait} className="flex items-center space-x-2 bg-gray-50 p-2 rounded-xl cursor-pointer">
                      <input
                        type="checkbox"
                        checked={targetTraits.includes(trait as BloomTrait)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setTargetTraits([...targetTraits, trait as BloomTrait]);
                          } else {
                            setTargetTraits(targetTraits.filter((t) => t !== trait));
                          }
                        }}
                        className="rounded text-[#3E2D68]"
                      />
                      <span className="capitalize font-semibold text-gray-800">{trait}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end space-x-3 pt-3 border-t border-gray-100">
              <Button
                variant="outline"
                onClick={() => setShowGenerateModal(false)}
                className="rounded-xl text-xs font-semibold"
              >
                Cancel
              </Button>
              <Button
                disabled={generating}
                onClick={handleGenerateQuestions}
                className="rounded-xl text-xs font-bold bg-[#3E2D68]"
              >
                {generating ? 'Groq Generating...' : 'Generate Complete Packages'}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Question Modal */}
      {editingQuestion && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-xl w-full shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto animate-scaleUp">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <h3 className="text-base font-bold text-gray-900">Edit Question Package</h3>
              <button
                onClick={() => setEditingQuestion(null)}
                className="text-gray-400 hover:text-gray-600 font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveQuestionEdit} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Question Text</label>
                <textarea
                  rows={3}
                  value={editingQuestion.question_text}
                  onChange={(e) =>
                    setEditingQuestion({ ...editingQuestion, question_text: e.target.value })
                  }
                  className="w-full rounded-xl border border-gray-200 px-3 py-2 text-xs focus:outline-none focus:border-[#3E2D68]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Correct Answer</label>
                <input
                  type="text"
                  value={editingQuestion.answer_key?.correct_answer || ''}
                  onChange={(e) =>
                    setEditingQuestion({
                      ...editingQuestion,
                      answer_key: {
                        ...editingQuestion.answer_key,
                        correct_answer: e.target.value,
                      },
                    })
                  }
                  className="w-full rounded-xl border border-gray-200 px-3 py-2 text-xs focus:outline-none focus:border-[#3E2D68]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Progressive Hint 1</label>
                <textarea
                  rows={2}
                  value={
                    editingQuestion.hint_1 ||
                    editingQuestion.hints?.find((h: any) => h.hint_number === 1)?.hint_text ||
                    ''
                  }
                  onChange={(e) =>
                    setEditingQuestion({
                      ...editingQuestion,
                      hint_1: e.target.value,
                    })
                  }
                  className="w-full rounded-xl border border-gray-200 px-3 py-2 text-xs focus:outline-none focus:border-[#3E2D68]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Progressive Hint 2</label>
                <textarea
                  rows={2}
                  value={
                    editingQuestion.hint_2 ||
                    editingQuestion.hints?.find((h: any) => h.hint_number === 2)?.hint_text ||
                    ''
                  }
                  onChange={(e) =>
                    setEditingQuestion({
                      ...editingQuestion,
                      hint_2: e.target.value,
                    })
                  }
                  className="w-full rounded-xl border border-gray-200 px-3 py-2 text-xs focus:outline-none focus:border-[#3E2D68]"
                />
              </div>

              <div className="flex items-center justify-end space-x-3 pt-3 border-t border-gray-100">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setEditingQuestion(null)}
                  className="rounded-xl text-xs font-semibold"
                >
                  Cancel
                </Button>
                <Button type="submit" className="rounded-xl text-xs font-bold bg-[#3E2D68]">
                  Save Changes
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Create Assessment Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-4 animate-scaleUp">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <h3 className="text-base font-bold text-gray-900">Create New Assessment</h3>
              <button
                onClick={() => setShowCreateModal(false)}
                className="text-gray-400 hover:text-gray-600 font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateAssessment} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Assessment Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Module 3 Search Strategy Quiz"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full rounded-xl border border-gray-200 px-3 py-2 text-xs focus:outline-none focus:border-[#3E2D68]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Assessment Type</label>
                <select
                  value={newType}
                  onChange={(e) => setNewType(e.target.value as any)}
                  className="w-full rounded-xl border border-gray-200 px-3 py-2 text-xs focus:outline-none focus:border-[#3E2D68]"
                >
                  <option value="diagnostic">Diagnostic Assessment (Baseline)</option>
                  <option value="module">Module Assessment</option>
                  <option value="final">Final Examination (Summative)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Duration (Minutes)</label>
                <input
                  type="number"
                  value={newDuration}
                  onChange={(e) => setNewDuration(Number(e.target.value))}
                  className="w-full rounded-xl border border-gray-200 px-3 py-2 text-xs focus:outline-none focus:border-[#3E2D68]"
                />
              </div>

              <div className="flex items-center justify-end space-x-3 pt-3 border-t border-gray-100">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowCreateModal(false)}
                  className="rounded-xl text-xs font-semibold"
                >
                  Cancel
                </Button>
                <Button type="submit" className="rounded-xl text-xs font-bold bg-[#3E2D68]">
                  Create Draft
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
