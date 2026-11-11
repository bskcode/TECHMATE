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

export default function StudentAssessmentExamRoom() {
  const router = useRouter();

  const [courses, setCourses] = useState<any[]>([]);
  const [selectedCourseId, setSelectedCourseId] = useState<string>('');
  const [assessments, setAssessments] = useState<any[]>([]);
  const [selectedAssessmentId, setSelectedAssessmentId] = useState<string>('');

  // Exam Room State
  const [examStarted, setExamStarted] = useState(false);
  const [attempt, setAttempt] = useState<any>(null);
  const [questions, setQuestions] = useState<any[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);

  // Student Answers & State Machine Tracking per question
  // questionId -> { currentAnswer, responseNumber (1,2,3), isFinalized, isCorrect, feedback, hint1Text, hint2Text, awardedMarks }
  const [questionStates, setQuestionStates] = useState<Record<string, any>>({});
  const [submitting, setSubmitting] = useState(false);
  const [finalizing, setFinalizing] = useState(false);
  const [finalResult, setFinalResult] = useState<any>(null);

  useEffect(() => {
    async function loadData() {
      const cRes = await fetch('/api/courses?userId=00000000-0000-0000-0000-000000000101&role=student');
      const cData = await cRes.json();
      setCourses(cData.courses || []);

      if (cData.courses?.[0]?.id) {
        const courseId = cData.courses[0].id;
        setSelectedCourseId(courseId);
        const aRes = await fetch(`/api/courses/${courseId}/assessments?onlyPublished=true`);
        const aData = await aRes.json();
        setAssessments(aData.assessments || []);
        if (aData.assessments?.[0]?.id) {
          setSelectedAssessmentId(aData.assessments[0].id);
        }
      }
    }
    loadData();
  }, []);

  const handleStartExam = async () => {
    if (!selectedAssessmentId) return;

    const res = await fetch('/api/attempts/start', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        assessment_id: selectedAssessmentId,
        student_id: '00000000-0000-0000-0000-000000000101',
      }),
    });

    const data = await res.json();
    if (data.success) {
      setAttempt(data.attempt);
      setQuestions(data.questions || []);

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

      setQuestionStates(initialStates);
      setCurrentIndex(0);
      setExamStarted(true);
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
      alert('Please enter or select an answer before submitting.');
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
        alert(data.error);
      }
    } catch (err: any) {
      alert(`Submission error: ${err.message}`);
    } finally {
      setSubmitting(false);
    }
  };

  const handleFinalizeExam = async () => {
    if (!attempt) return;
    if (!confirm('Finalize your assessment attempt? This will submit all responses and calculate your Bloom cognitive trait scores.')) return;

    setFinalizing(true);
    try {
      const res = await fetch(`/api/attempts/${attempt.id}/finalize`, {
        method: 'POST',
      });

      const data = await res.json();
      if (data.success) {
        setFinalResult(data);
        confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
      }
    } catch (err: any) {
      alert(err.message);
    } finally {
      setFinalizing(false);
    }
  };

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Pre-Exam Selection Screen */}
      {!examStarted ? (
        <div className="max-w-2xl mx-auto space-y-6">
          <div>
            <h1 className="text-2xl font-black text-gray-900 tracking-tight">Progressive Assessment Examination Room</h1>
            <p className="text-sm text-gray-500 font-medium">
              Take scheduled diagnostic baselines and final exams with server-assisted progressive hints.
            </p>
          </div>

          <Card className="rounded-3xl border-none shadow-sm bg-white p-6 space-y-6">
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Select Course</label>
                <select
                  value={selectedCourseId}
                  onChange={(e) => setSelectedCourseId(e.target.value)}
                  className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-xs font-bold text-[#3E2D68] focus:outline-none"
                >
                  {courses.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.code}: {c.title}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Select Assessment</label>
                <select
                  value={selectedAssessmentId}
                  onChange={(e) => setSelectedAssessmentId(e.target.value)}
                  className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-xs font-bold text-[#3E2D68] focus:outline-none"
                >
                  {assessments.map((a) => (
                    <option key={a.id} value={a.id}>
                      [{a.assessment_type.toUpperCase()}] {a.title} ({a.time_limit_minutes} mins)
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Assessment Rules & Progressive Hint Notice */}
            <div className="p-4 bg-purple-50/70 rounded-2xl border border-purple-200/60 text-xs text-[#3E2D68] space-y-2">
              <div className="flex items-center space-x-2 font-bold text-sm">
                <Sparkles className="w-4 h-4 text-[#7C3AED]" />
                <span>How the Progressive 2-Hint Mechanism Works</span>
              </div>
              <ul className="space-y-1.5 text-[11px] text-gray-700 list-disc pl-4 leading-relaxed">
                <li>
                  <strong>First Attempt:</strong> Submit your best answer. If correct, you earn full marks (100%).
                </li>
                <li>
                  <strong>Incorrect Attempt 1:</strong> <strong>Hint 1</strong> unlocks automatically to guide your thinking. Submit Attempt 2 for up to 75% marks.
                </li>
                <li>
                  <strong>Incorrect Attempt 2:</strong> <strong>Hint 2</strong> unlocks with deep formula/concept clues. Submit Attempt 3 for up to 50% marks.
                </li>
                <li>
                  <strong>Strict Limit:</strong> Exactly 3 submissions permitted per question. No 4th attempt is allowed.
                </li>
              </ul>
            </div>

            <Button
              onClick={handleStartExam}
              size="lg"
              className="w-full rounded-2xl font-bold bg-[#3E2D68] hover:bg-[#322454] text-white shadow-md"
            >
              Start Assessment Now <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </Card>
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

            <div className="pt-4 flex items-center justify-center space-x-3">
              <Link href="/student/traits">
                <Button className="rounded-xl text-xs font-bold bg-[#3E2D68]">
                  View Trait Radar Dashboard <ArrowRight className="w-4 h-4 ml-1" />
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
            </div>

            <div className="flex items-center space-x-3">
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
                  <div className="text-xs text-gray-400 font-medium">
                    Attempt {currentState.responseNumber} of 3 •{' '}
                    {currentState.responseNumber === 1
                      ? '100% marks available'
                      : currentState.responseNumber === 2
                      ? '75% marks available'
                      : '50% marks available'}
                  </div>

                  <Button
                    onClick={handleSubmitCurrentAnswer}
                    disabled={submitting}
                    className="rounded-xl text-xs font-bold bg-[#3E2D68] px-6 py-2.5 text-white shadow-sm"
                  >
                    {submitting ? 'Evaluating...' : `Submit Attempt ${currentState.responseNumber}`}
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
