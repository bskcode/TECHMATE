'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  CheckSquare,
  Clock,
  Award,
  AlertCircle,
  HelpCircle,
  CheckCircle2,
  XCircle,
  Lightbulb,
  ArrowRight,
  ArrowLeft,
  Lock,
  Sparkles,
  ShieldAlert,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import confetti from 'canvas-confetti';
import { useApp } from '@/components/providers/app-provider';

export default function StudentAssessmentExamRoom() {
  const router = useRouter();
  const { getActiveUser, toast, confirmAction } = useApp();
  const activeStudent = getActiveUser('student');

  const [courses, setCourses] = useState<any[]>([]);
  const [selectedCourseId, setSelectedCourseId] = useState<string>('');
  const [modules, setModules] = useState<any[]>([]);
  const [assessments, setAssessments] = useState<any[]>([]);
  const [selectedAssessmentId, setSelectedAssessmentId] = useState<string>('');

  // Exam Room State
  const [examStarted, setExamStarted] = useState(false);
  const [attempt, setAttempt] = useState<any>(null);
  const [questions, setQuestions] = useState<any[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [secondsLeft, setSecondsLeft] = useState<number | null>(null);

  // Student Answers & State Machine Tracking per question
  // questionId -> { currentAnswer, responseNumber (1,2,3), isFinalized, isCorrect, feedback, hint1Text, hint2Text, awardedMarks }
  const [questionStates, setQuestionStates] = useState<Record<string, any>>({});
  const [diagnosticWeakTraits, setDiagnosticWeakTraits] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [finalizing, setFinalizing] = useState(false);
  const [finalResult, setFinalResult] = useState<any>(null);

  async function loadAssessmentsForCourse(courseId: string) {
    const [aRes, mRes] = await Promise.all([
      fetch(`/api/courses/${courseId}/assessments?onlyPublished=true`),
      fetch(`/api/courses/${courseId}/modules`),
    ]);
    const aData = await aRes.json();
    const mData = await mRes.json();
    const list = aData.assessments || [];
    setAssessments(list);
    setModules(mData.modules || []);
    setSelectedAssessmentId(list[0]?.id || '');
  }

  useEffect(() => {
    async function loadData() {
      const cRes = await fetch(`/api/courses?userId=${activeStudent.id}&role=student`);
      const cData = await cRes.json();
      const list = cData.courses || [];
      const all = cData.allCourses || [];
      // Present all faculty-created courses in the dropdown so students can choose immediately
      const mergedCourses = [...list];
      all.forEach((ac: any) => {
        if (!mergedCourses.some((c: any) => c.id === ac.id)) {
          mergedCourses.push(ac);
        }
      });
      setCourses(mergedCourses);

      if (mergedCourses[0]?.id) {
        setSelectedCourseId(mergedCourses[0].id);
        await loadAssessmentsForCourse(mergedCourses[0].id);
      } else {
        setSelectedCourseId('');
        setAssessments([]);
        setSelectedAssessmentId('');
      }
    }
    loadData();
  }, [activeStudent.id]);

  // Countdown timer effect
  useEffect(() => {
    if (!examStarted || finalResult || secondsLeft === null) return;
    if (secondsLeft <= 0) {
      if (!finalizing && attempt) {
        (async () => {
          setFinalizing(true);
          try {
            const res = await fetch(`/api/attempts/${attempt.id}/finalize`, { method: 'POST' });
            const data = await res.json();
            if (data.success) {
              setFinalResult(data);
              toast('Time expired! Your assessment has been automatically submitted.', 'warning');
            }
          } finally {
            setFinalizing(false);
          }
        })();
      }
      return;
    }

    const interval = setInterval(() => {
      setSecondsLeft((prev) => (prev !== null && prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(interval);
  }, [examStarted, finalResult, secondsLeft, finalizing, attempt, toast]);

  const formatTimer = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  };

  const handleStartExam = async (targetAssessmentId?: string) => {
    const aid = targetAssessmentId || selectedAssessmentId;
    if (!aid) return;
    setSelectedAssessmentId(aid);

    const res = await fetch('/api/attempts/start', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        assessment_id: aid,
        student_id: activeStudent.id,
      }),
    });

    const data = await res.json();
    if (data.success) {
      setAttempt(data.attempt);
      setQuestions(data.questions || []);
      setDiagnosticWeakTraits(data.diagnostic_weak_traits || []);

      const selectedAsmt = assessments.find((a) => a.id === aid);
      const limitMins = selectedAsmt?.time_limit_minutes || 30;
      const elapsedSec = data.attempt?.started_at
        ? Math.floor((Date.now() - new Date(data.attempt.started_at).getTime()) / 1000)
        : 0;
      setSecondsLeft(Math.max(0, limitMins * 60 - elapsedSec));

      // Initialize question state dictionary
      const initialStates: Record<string, any> = {};
      data.questions.forEach((q: any) => {
        initialStates[q.id] = {
          currentAnswer: '',
          selectedOptions: [],
          responseNumber: 1, // Next attempt to submit
          isFinalized: false,
          isCorrect: false,
          feedback: '',
          hint1Text: null,
          hint2Text: null,
          awardedMarks: 0,
        };
      });

      // Restore any previous responses
      if (data.responses && data.responses.length > 0) {
        data.responses.forEach((r: any) => {
          if (initialStates[r.question_id]) {
            initialStates[r.question_id].currentAnswer = r.student_answer;
            initialStates[r.question_id].selectedOptions = r.student_answer
              ? String(r.student_answer).split(',').map((s: string) => s.trim())
              : [];
            initialStates[r.question_id].awardedMarks = r.awarded_marks;
            initialStates[r.question_id].isCorrect = r.is_correct;
            initialStates[r.question_id].feedback = r.feedback;
            if (r.is_correct || r.response_number === 3) {
              initialStates[r.question_id].isFinalized = true;
            } else {
              initialStates[r.question_id].responseNumber = r.response_number + 1;
            }
          }
        });
      }

      // Restore unlocked hints on resume
      if (data.hintEvents && data.hintEvents.length > 0) {
        data.hintEvents.forEach((he: any) => {
          if (initialStates[he.question_id]) {
            if (he.hint_number === 1) {
              initialStates[he.question_id].hint1Text =
                he.hint_text || 'Hint 1 unlocked (25% penalty applied).';
            } else if (he.hint_number === 2) {
              initialStates[he.question_id].hint2Text =
                he.hint_text || 'Hint 2 unlocked (50% penalty applied).';
            }
          }
        });
      }

      setQuestionStates(initialStates);
      setCurrentIndex(0);
      setExamStarted(true);
    } else {
      toast(data.error || 'Could not start assessment', 'error');
    }
  };

  const currentQ = questions[currentIndex];
  const currentState = currentQ ? questionStates[currentQ.id] : null;

  const handleOptionSelect = (optionText: string) => {
    if (!currentQ || currentState?.isFinalized) return;

    if (currentQ.question_type === 'multiple_select') {
      const selected = currentState.selectedOptions || [];
      const updated = selected.includes(optionText)
        ? selected.filter((o: string) => o !== optionText)
        : [...selected, optionText];

      setQuestionStates({
        ...questionStates,
        [currentQ.id]: {
          ...currentState,
          selectedOptions: updated,
          currentAnswer: updated.join(', '),
        },
      });
    } else {
      setQuestionStates({
        ...questionStates,
        [currentQ.id]: {
          ...currentState,
          currentAnswer: optionText,
        },
      });
    }
  };

  const handleSubmitCurrentAnswer = async () => {
    if (!currentQ || !currentState || currentState.isFinalized || submitting) return;

    const answer = currentState.currentAnswer.trim();
    if (!answer) {
      toast('Please enter or select an answer before submitting.', 'warning');
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch(`/api/attempts/${attempt.id}/submit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question_id: currentQ.id,
          response_number: currentState.responseNumber,
          student_answer: answer,
        }),
      });

      const data = await res.json();
      if (data.success) {
        const { result } = data;

        const updated = {
          ...currentState,
          isCorrect: result.is_correct,
          awardedMarks: result.awarded_marks,
          isFinalized: result.is_question_finalized,
          feedback: result.feedback,
        };

        if (result.is_correct) {
          confetti({ particleCount: 50, spread: 60, origin: { y: 0.8 } });
        }

        if (result.unlocked_hint) {
          if (result.unlocked_hint.hint_number === 1) {
            updated.hint1Text = result.unlocked_hint.hint_text;
            updated.responseNumber = 2;
          } else if (result.unlocked_hint.hint_number === 2) {
            updated.hint2Text = result.unlocked_hint.hint_text;
            updated.responseNumber = 3;
          }
        }

        setQuestionStates({
          ...questionStates,
          [currentQ.id]: updated,
        });
      } else {
        toast(data.error || 'Submission failed', 'error');
      }
    } catch (err: any) {
      toast(`Submission error: ${err.message}`, 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleFinalizeExam = async () => {
    if (!attempt) return;
    const ok = await confirmAction({
      title: 'Finalize Assessment',
      message: 'Finalize your assessment attempt? This will submit all responses and calculate your Bloom cognitive trait scores.',
      confirmLabel: 'Submit & Score',
    });
    if (!ok) return;

    setFinalizing(true);
    try {
      const res = await fetch(`/api/attempts/${attempt.id}/finalize`, {
        method: 'POST',
      });

      const data = await res.json();
      if (data.success) {
        setFinalResult(data);
        confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
      } else {
        toast(data.error || 'Failed to finalize', 'error');
      }
    } catch (err: any) {
      toast(err.message, 'error');
    } finally {
      setFinalizing(false);
    }
  };

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Pre-Exam Selection Screen */}
      {!examStarted ? (
        <div className="max-w-4xl mx-auto space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-black text-gray-900 tracking-tight">
                Module-Wise Progressive Assessment Room
              </h1>
              <p className="text-sm text-gray-500 font-medium">
                Choose a module to begin either a diagnostic baseline (strictly zero hints) or a progressive formative assessment (up to 2 hints on retry).
              </p>
            </div>

            <div className="min-w-[240px]">
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">
                Active Course
              </label>
              <select
                value={selectedCourseId}
                onChange={(e) => {
                  const newId = e.target.value;
                  setSelectedCourseId(newId);
                  loadAssessmentsForCourse(newId);
                  fetch('/api/courses/enroll', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ course_id: newId, student_id: activeStudent.id }),
                  }).catch(() => {});
                }}
                className="w-full rounded-xl border border-gray-200 px-3 py-2 text-xs font-bold text-[#3E2D68] bg-white shadow-sm focus:outline-none"
              >
                {courses.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.code}: {c.title}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Assessment Rules & Progressive Hint Notice */}
          <div className="p-4 bg-purple-50/70 rounded-2xl border border-purple-200/60 text-xs text-[#3E2D68] space-y-2">
            <div className="flex items-center space-x-2 font-bold text-sm">
              <Sparkles className="w-4 h-4 text-[#7C3AED]" />
              <span>Assessment Modes & The Progressive 2-Hint Engine</span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
              <div className="p-3 bg-white/80 rounded-xl border border-amber-200">
                <span className="font-bold text-amber-900 block mb-1">1. Diagnostic Assessment (Zero Hints)</span>
                <p className="text-[11px] text-gray-600 leading-relaxed">
                  Evaluates initial knowledge, foundational recall, and knowledge gaps prior to lecture discussion. Strictly no hints are unlocked.
                </p>
              </div>
              <div className="p-3 bg-white/80 rounded-xl border border-emerald-200">
                <span className="font-bold text-emerald-900 block mb-1">2. Progressive Assessment (Max 2 Hints)</span>
                <p className="text-[11px] text-gray-600 leading-relaxed">
                  Mastery testing with up to 3 submissions. Incorrect answers unlock <strong>Hint 1 (-25%)</strong> and <strong>Hint 2 (-50%)</strong> dynamically.
                </p>
              </div>
            </div>
          </div>

          {/* Module-Wise Assessment Cards */}
          <div className="space-y-4">
            {modules.length === 0 ? (
              <Card className="rounded-3xl border-none shadow-sm bg-white p-8 text-center">
                <p className="text-xs font-semibold text-gray-500">
                  No modules or published assessments found for this course yet.
                </p>
              </Card>
            ) : (
              modules.map((m: any, mIdx: number) => {
                const moduleAssessments = assessments.filter(
                  (a) => a.module_id === m.id || (mIdx === 0 && !a.module_id)
                );
                const diagAsmt = moduleAssessments.find((a) => a.assessment_type === 'diagnostic');
                const progAsmt = moduleAssessments.find((a) => a.assessment_type === 'progressive');

                return (
                  <Card key={m.id} className="rounded-3xl border-none shadow-sm bg-white p-6 space-y-4">
                    <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                      <div className="flex items-center space-x-2.5">
                        <span className="w-6 h-6 rounded-lg bg-purple-100 text-[#3E2D68] font-black text-xs flex items-center justify-center">
                          {mIdx + 1}
                        </span>
                        <div>
                          <h3 className="text-base font-bold text-gray-900">{m.title}</h3>
                          <p className="text-[11px] text-gray-400 font-medium">
                            {m.description || `Module ${mIdx + 1} curriculum and cognitive outcomes`}
                          </p>
                        </div>
                      </div>
                      <Badge variant="outline" className="text-[10px] text-gray-500">
                        Module {mIdx + 1}
                      </Badge>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Diagnostic Card */}
                      <div className="p-4 rounded-2xl border border-amber-200/80 bg-amber-50/30 flex flex-col justify-between space-y-3">
                        <div>
                          <div className="flex items-center justify-between">
                            <Badge variant="outline" className="bg-amber-100 text-amber-800 border-amber-300 text-[10px] font-bold">
                              Diagnostic • Zero Hints
                            </Badge>
                            <span className="text-[11px] font-semibold text-gray-400 flex items-center space-x-1">
                              <Clock className="w-3 h-3 text-gray-400 mr-1" />
                              {diagAsmt ? `${diagAsmt.time_limit_minutes} mins` : '25 mins'}
                            </span>
                          </div>
                          <h4 className="text-sm font-bold text-gray-900 mt-2">
                            {diagAsmt?.title || `${m.title}: Diagnostic Assessment`}
                          </h4>
                          <p className="text-xs text-gray-600 mt-1 line-clamp-2">
                            {diagAsmt?.description || 'Baseline diagnostic evaluation testing foundational knowledge without hints.'}
                          </p>
                        </div>

                        {diagAsmt ? (
                          <Button
                            onClick={() => handleStartExam(diagAsmt.id)}
                            size="sm"
                            className="rounded-xl font-bold bg-[#3E2D68] hover:bg-[#322454] text-white text-xs w-full shadow-sm"
                          >
                            Start Diagnostic Exam <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
                          </Button>
                        ) : (
                          <div className="text-[11px] text-gray-400 italic font-medium py-1 text-center bg-gray-50 rounded-xl">
                            Pending Faculty Publishing
                          </div>
                        )}
                      </div>

                      {/* Progressive Card */}
                      <div className="p-4 rounded-2xl border border-emerald-200/80 bg-emerald-50/30 flex flex-col justify-between space-y-3">
                        <div>
                          <div className="flex items-center justify-between">
                            <Badge variant="outline" className="bg-emerald-100 text-emerald-800 border-emerald-300 text-[10px] font-bold">
                              Progressive • 2 Hints on Retry
                            </Badge>
                            <span className="text-[11px] font-semibold text-gray-400 flex items-center space-x-1">
                              <Clock className="w-3 h-3 text-gray-400 mr-1" />
                              {progAsmt ? `${progAsmt.time_limit_minutes} mins` : '35 mins'}
                            </span>
                          </div>
                          <h4 className="text-sm font-bold text-gray-900 mt-2">
                            {progAsmt?.title || `${m.title}: Progressive Assessment`}
                          </h4>
                          <p className="text-xs text-gray-600 mt-1 line-clamp-2">
                            {progAsmt?.description || 'Formative mastery assessment where incorrect answers unlock up to two progressive hints.'}
                          </p>
                        </div>

                        {progAsmt ? (
                          <Button
                            onClick={() => handleStartExam(progAsmt.id)}
                            size="sm"
                            className="rounded-xl font-bold bg-emerald-600 hover:bg-emerald-700 text-white text-xs w-full shadow-sm"
                          >
                            Start Progressive Exam <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
                          </Button>
                        ) : (
                          <div className="text-[11px] text-gray-400 italic font-medium py-1 text-center bg-gray-50 rounded-xl">
                            Pending Faculty Publishing
                          </div>
                        )}
                      </div>
                    </div>
                  </Card>
                );
              })
            )}
          </div>
        </div>
      ) : finalResult ? (
        /* Final Exam Result Summary Screen */
        <div className="max-w-xl mx-auto space-y-6">
          <Card className="rounded-3xl border-none shadow-md bg-white p-8 text-center space-y-5 animate-scaleUp">
            <div className="w-16 h-16 rounded-3xl bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-inner">
              <Award className="w-8 h-8" />
            </div>

            <div>
              <h2 className="text-2xl font-black text-gray-900">Assessment Completed!</h2>
              <p className="text-xs text-gray-500 mt-1">Your responses have been deterministically scored.</p>
            </div>

            <div className="p-5 bg-purple-50 rounded-2xl flex items-center justify-around">
              <div>
                <p className="text-xs text-gray-400 font-semibold uppercase">Total Score</p>
                <h3 className="text-3xl font-black text-[#3E2D68] mt-1">
                  {finalResult.attempt.total_score} / {finalResult.attempt.max_score}
                </h3>
              </div>
              <div className="h-10 w-px bg-purple-200" />
              <div>
                <p className="text-xs text-gray-400 font-semibold uppercase">Percentage</p>
                <h3 className="text-3xl font-black text-emerald-600 mt-1">
                  {finalResult.attempt.percentage.toFixed(1)}%
                </h3>
              </div>
            </div>

            <div className="space-y-2 text-left">
              <h4 className="text-xs font-bold text-gray-700 uppercase tracking-wider">Trait Scores Calculated</h4>
              <div className="grid grid-cols-2 gap-2 text-xs">
                {finalResult.traitScores?.map((ts: any) => (
                  <div key={ts.trait} className="p-2.5 rounded-xl bg-gray-50 flex items-center justify-between">
                    <span className="capitalize font-semibold text-gray-700">{ts.trait}:</span>
                    <span className="font-bold text-[#3E2D68]">{ts.score_percentage.toFixed(0)}%</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-4 flex flex-wrap items-center justify-center gap-3">
              <Link href="/student/traits">
                <Button className="rounded-xl text-xs font-bold bg-[#3E2D68]">
                  View Trait Radar (Diag vs Prog) <ArrowRight className="w-4 h-4 ml-1" />
                </Button>
              </Link>
              <Link href="/student/report">
                <Button variant="outline" className="rounded-xl text-xs font-bold border-purple-200 text-[#3E2D68]">
                  View Learning Gain (G) Report
                </Button>
              </Link>
            </div>
          </Card>
        </div>
      ) : (
        /* Active Progressive Exam Room */
        <div className="space-y-6">
          {/* Header Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 rounded-2xl shadow-sm">
            <div className="flex items-center space-x-3">
              <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Assessment:</span>
              <h2 className="text-sm font-bold text-gray-900 truncate">{attempt?.assessment?.title || 'Examination'}</h2>
              {attempt?.assessment?.assessment_type === 'diagnostic' || attempt?.assessment?.progressive_hints_enabled === false ? (
                <Badge variant="outline" className="bg-amber-100 text-amber-800 border-amber-300 text-[10px] font-bold uppercase">
                  Diagnostic: Strictly No Hints
                </Badge>
              ) : (
                <Badge variant="outline" className="bg-emerald-100 text-emerald-800 border-emerald-300 text-[10px] font-bold uppercase">
                  Progressive: 2 Hints on Retry
                </Badge>
              )}
            </div>

            <div className="flex items-center space-x-3">
              {secondsLeft !== null && (
                <Badge
                  variant={secondsLeft < 300 ? 'coral' : 'outline'}
                  className="text-xs font-mono font-bold flex items-center space-x-1"
                >
                  <Clock className="w-3.5 h-3.5" />
                  <span>{formatTimer(secondsLeft)}</span>
                </Badge>
              )}
              <Badge variant="secondary" className="text-xs font-bold text-[#3E2D68]">
                Question {currentIndex + 1} of {questions.length}
              </Badge>
              <Button
                size="sm"
                variant="outline"
                disabled={finalizing}
                onClick={handleFinalizeExam}
                className="rounded-xl text-xs font-bold border-emerald-500 text-emerald-700 hover:bg-emerald-50"
              >
                {finalizing ? 'Finalizing...' : 'Finalize Assessment'}
              </Button>
            </div>
          </div>

          {/* Diagnostic Focus Notice for Progressive Assessment */}
          {attempt?.assessment?.assessment_type === 'progressive' && diagnosticWeakTraits.length > 0 && (
            <div className="p-4 bg-gradient-to-r from-purple-50 to-indigo-50 border border-purple-200/80 rounded-2xl flex items-start space-x-3 text-xs text-purple-950 shadow-sm animate-fadeIn">
              <Sparkles className="w-5 h-5 text-purple-600 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold text-purple-900 block text-sm mb-0.5">
                  Targeted Progressive Focus Active
                </span>
                <p className="leading-relaxed text-purple-800">
                  Questions are prioritized to address your diagnostic growth areas:{' '}
                  <span className="font-bold text-[#3E2D68]">
                    {diagnosticWeakTraits.map((t) => t.charAt(0).toUpperCase() + t.slice(1)).join(' & ')}
                  </span>.
                  Incorrect answers unlock up to 2 progressive technical hints to guide you to mastery!
                </p>
              </div>
            </div>
          )}

          {/* Question Palette Indicator */}
          <div className="flex items-center space-x-2 overflow-x-auto pb-2">
            {questions.map((q, idx) => {
              const qState = questionStates[q.id];
              const isCurrent = idx === currentIndex;
              const isCorrect = qState?.isCorrect;
              const isFinalized = qState?.isFinalized;
              const usedHints = qState?.hint1Text || qState?.hint2Text;

              let bgClass = 'bg-white border-gray-200 text-gray-700';
              if (isFinalized && isCorrect) bgClass = 'bg-emerald-500 border-emerald-600 text-white';
              else if (isFinalized && !isCorrect) bgClass = 'bg-rose-500 border-rose-600 text-white';
              else if (usedHints) bgClass = 'bg-amber-400 border-amber-500 text-gray-900 font-bold';

              return (
                <button
                  key={q.id}
                  onClick={() => setCurrentIndex(idx)}
                  className={`w-9 h-9 rounded-xl border text-xs font-bold transition-all flex items-center justify-center shrink-0 ${bgClass} ${
                    isCurrent ? 'ring-2 ring-[#3E2D68] scale-105 shadow-sm' : ''
                  }`}
                >
                  {idx + 1}
                </button>
              );
            })}
          </div>

          {/* Current Question Card with Progressive Hint Panels */}
          {currentQ && currentState && (
            <Card className="rounded-3xl border-none shadow-sm bg-white p-6 sm:p-8 space-y-6">
              {/* Question Metadata */}
              <div className="flex items-center justify-between border-b border-gray-100 pb-4">
                <div className="flex items-center space-x-3">
                  <Badge variant="secondary" className="uppercase font-bold text-xs text-[#3E2D68]">
                    {currentQ.primary_trait}
                  </Badge>
                  <Badge variant="outline" className="text-xs uppercase font-medium">
                    {currentQ.question_type.replace('_', ' ')}
                  </Badge>
                  <Badge variant="amber" className="text-xs uppercase font-bold">
                    {currentQ.difficulty}
                  </Badge>
                </div>

                <div className="flex items-center space-x-3">
                  <span className="text-xs font-bold text-gray-500">Max: {currentQ.max_marks} marks</span>
                  <div className="flex items-center space-x-1 text-xs font-bold text-[#3E2D68] bg-purple-50 px-2.5 py-1 rounded-xl">
                    <span>Attempt {currentState.responseNumber} / 3</span>
                  </div>
                </div>
              </div>

              {/* Question Text */}
              <div className="space-y-2">
                <h3 className="text-base sm:text-lg font-bold text-gray-900 leading-relaxed">
                  {currentQ.question_text}
                </h3>
              </div>

              {/* Input Area Depending on Question Type */}
              <div className="space-y-3 pt-2">
                {/* MCQ & True/False */}
                {(currentQ.question_type === 'mcq' || currentQ.question_type === 'true_false') && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {currentQ.options?.map((opt: string, i: number) => {
                      const isSelected = currentState.currentAnswer === opt;
                      return (
                        <div
                          key={i}
                          onClick={() => handleOptionSelect(opt)}
                          className={`p-4 rounded-2xl border text-xs font-semibold cursor-pointer transition-all flex items-center space-x-3 ${
                            isSelected
                              ? 'bg-purple-50/80 border-[#3E2D68] text-[#3E2D68] ring-1 ring-[#3E2D68]'
                              : 'bg-white border-gray-200 hover:border-gray-300 text-gray-800'
                          } ${currentState.isFinalized ? 'pointer-events-none opacity-80' : ''}`}
                        >
                          <span
                            className={`w-6 h-6 rounded-lg flex items-center justify-center font-bold text-xs border ${
                              isSelected
                                ? 'bg-[#3E2D68] text-white border-[#3E2D68]'
                                : 'bg-gray-50 text-gray-500 border-gray-200'
                            }`}
                          >
                            {String.fromCharCode(65 + i)}
                          </span>
                          <span className="flex-1">{opt}</span>
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* Multiple Select */}
                {currentQ.question_type === 'multiple_select' && (
                  <div className="space-y-2">
                    <p className="text-xs text-gray-400 font-medium">Select all correct statements:</p>
                    <div className="grid grid-cols-1 gap-2.5">
                      {currentQ.options?.map((opt: string, i: number) => {
                        const isSelected = currentState.selectedOptions?.includes(opt);
                        return (
                          <div
                            key={i}
                            onClick={() => handleOptionSelect(opt)}
                            className={`p-3.5 rounded-2xl border text-xs font-semibold cursor-pointer transition-all flex items-center space-x-3 ${
                              isSelected
                                ? 'bg-purple-50/80 border-[#3E2D68] text-[#3E2D68] ring-1 ring-[#3E2D68]'
                                : 'bg-white border-gray-200 hover:border-gray-300 text-gray-800'
                            } ${currentState.isFinalized ? 'pointer-events-none opacity-80' : ''}`}
                          >
                            <input
                              type="checkbox"
                              checked={isSelected || false}
                              readOnly
                              className="rounded text-[#3E2D68] w-4 h-4"
                            />
                            <span>{opt}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Numeric */}
                {currentQ.question_type === 'numeric' && (
                  <div className="max-w-xs space-y-1">
                    <label className="text-xs font-bold text-gray-700">Enter Numeric Answer</label>
                    <input
                      type="number"
                      step="any"
                      placeholder="e.g. 10"
                      disabled={currentState.isFinalized}
                      value={currentState.currentAnswer}
                      onChange={(e) =>
                        setQuestionStates({
                          ...questionStates,
                          [currentQ.id]: {
                            ...currentState,
                            currentAnswer: e.target.value,
                          },
                        })
                      }
                      className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm font-bold focus:outline-none focus:border-[#3E2D68]"
                    />
                  </div>
                )}

                {/* Fill in the blank */}
                {currentQ.question_type === 'fill_in_blank' && (
                  <div className="max-w-md space-y-1">
                    <label className="text-xs font-bold text-gray-700">Fill in the missing term</label>
                    <input
                      type="text"
                      placeholder="Type the exact academic terminology..."
                      disabled={currentState.isFinalized}
                      value={currentState.currentAnswer}
                      onChange={(e) =>
                        setQuestionStates({
                          ...questionStates,
                          [currentQ.id]: {
                            ...currentState,
                            currentAnswer: e.target.value,
                          },
                        })
                      }
                      className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm font-bold focus:outline-none focus:border-[#3E2D68]"
                    />
                  </div>
                )}
              </div>

              {/* Submit Button & Progress State */}
              {!currentState.isFinalized ? (
                <div className="pt-2 flex items-center justify-between">
                  <div className="text-xs text-gray-500 font-medium">
                    {attempt?.assessment?.assessment_type === 'diagnostic' || attempt?.assessment?.progressive_hints_enabled === false ? (
                      <span className="text-amber-800 font-bold">
                        Diagnostic Baseline • Single attempt per question • Strictly zero hints
                      </span>
                    ) : (
                      <span>
                        Attempt {currentState.responseNumber} of 3 •{' '}
                        {currentState.responseNumber === 1
                          ? '100% marks available'
                          : currentState.responseNumber === 2
                          ? '75% marks available'
                          : '50% marks available'}
                      </span>
                    )}
                  </div>

                  <Button
                    onClick={handleSubmitCurrentAnswer}
                    disabled={submitting}
                    className="rounded-xl text-xs font-bold bg-[#3E2D68] px-6 py-2.5 text-white shadow-sm"
                  >
                    {submitting
                      ? 'Evaluating...'
                      : attempt?.assessment?.assessment_type === 'diagnostic' || attempt?.assessment?.progressive_hints_enabled === false
                      ? 'Submit Answer'
                      : `Submit Attempt ${currentState.responseNumber}`}
                  </Button>
                </div>
              ) : (
                <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-between text-xs text-emerald-900">
                  <div className="flex items-center space-x-2">
                    <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                    <div>
                      <span className="font-bold">Question Finalized:</span> Awarded{' '}
                      <span className="font-bold underline">{currentState.awardedMarks} / {currentQ.max_marks} marks</span>.
                      <p className="text-[11px] text-emerald-800 mt-0.5">{currentState.feedback}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* PROGRESSIVE HINT 1 CARD (Revealed when wrong on attempt 1) */}
              {currentState.hint1Text && (
                <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200/80 animate-fadeIn space-y-1">
                  <div className="flex items-center space-x-2 text-amber-900 font-bold text-xs">
                    <Lightbulb className="w-4 h-4 text-amber-600" />
                    <span>Progressive Hint 1 Unlocked</span>
                  </div>
                  <p className="text-xs text-amber-950 pl-6 leading-relaxed">
                    {currentState.hint1Text}
                  </p>
                </div>
              )}

              {/* PROGRESSIVE HINT 2 CARD (Revealed when wrong on attempt 2) */}
              {currentState.hint2Text && (
                <div className="p-4 rounded-2xl bg-purple-50 border border-purple-200 animate-fadeIn space-y-1">
                  <div className="flex items-center space-x-2 text-[#3E2D68] font-bold text-xs">
                    <Sparkles className="w-4 h-4 text-[#7C3AED]" />
                    <span>Progressive Hint 2 Unlocked (Final Concept Clue)</span>
                  </div>
                  <p className="text-xs text-[#3E2D68] pl-6 leading-relaxed font-medium">
                    {currentState.hint2Text}
                  </p>
                </div>
              )}

              {/* Prev / Next Navigation */}
              <div className="pt-4 border-t border-gray-100 flex items-center justify-between">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={currentIndex === 0}
                  onClick={() => setCurrentIndex(currentIndex - 1)}
                  className="rounded-xl text-xs font-semibold"
                >
                  <ArrowLeft className="w-3.5 h-3.5 mr-1" /> Previous Question
                </Button>

                <Button
                  variant="outline"
                  size="sm"
                  disabled={currentIndex === questions.length - 1}
                  onClick={() => setCurrentIndex(currentIndex + 1)}
                  className="rounded-xl text-xs font-semibold"
                >
                  Next Question <ArrowRight className="w-3.5 h-3.5 ml-1" />
                </Button>
              </div>
            </Card>
          )}
        </div>
      )}
    </div>
  );
}
