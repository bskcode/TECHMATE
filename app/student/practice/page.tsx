'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  GraduationCap,
  CheckCircle2,
  XCircle,
  Sparkles,
  ArrowRight,
  HelpCircle,
  Award,
  Briefcase,
  Target,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import confetti from 'canvas-confetti';
import { useApp } from '@/components/providers/app-provider';

export default function StudentPracticeCenter() {
  const { getActiveUser, toast } = useApp();
  const activeStudent = getActiveUser('student');

  const [interventions, setInterventions] = useState<any[]>([]);
  const [practiceQuestions, setPracticeQuestions] = useState<any[]>([]);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, string>>({});
  const [results, setResults] = useState<Record<string, any>>({});
  const [submittingId, setSubmittingId] = useState<string | null>(null);

  useEffect(() => {
    async function loadData() {
      const [iRes, aRes] = await Promise.all([
        fetch(`/api/interventions?studentId=${activeStudent.id}&onlyReleased=true`),
        fetch(`/api/practice/attempts?studentId=${activeStudent.id}`),
      ]);
      const [iData, aData] = await Promise.all([iRes.json(), aRes.json()]);
      const list = iData.interventions || [];
      setInterventions(list);

      const allQuestions = list.flatMap((inv: any) =>
        (inv.practice_questions || []).map((pq: any) => ({
          ...pq,
          course: inv.course,
        }))
      );
      setPracticeQuestions(allQuestions);

      const priorAnswers: Record<string, string> = {};
      const priorResults: Record<string, any> = {};
      (aData.attempts || []).forEach((att: any) => {
        priorAnswers[att.practice_question_id] = att.student_answer;
        priorResults[att.practice_question_id] = {
          is_correct: att.is_correct,
          explanation: att.feedback?.replace(/^(Correct! |Incorrect\. )/, '') || '',
        };
      });
      setSelectedAnswers(priorAnswers);
      setResults(priorResults);
    }
    loadData();
  }, [activeStudent.id]);

  const attemptedCount = Object.keys(results).length;
  const correctCount = Object.values(results).filter((r: any) => r.is_correct).length;
  const accuracyPct = attemptedCount > 0 ? Math.round((correctCount / attemptedCount) * 100) : 0;

  const handleSelect = (qId: string, option: string) => {
    if (results[qId]) return; // locked after evaluation
    setSelectedAnswers({
      ...selectedAnswers,
      [qId]: option,
    });
  };

  const handleSubmitPractice = async (qId: string) => {
    const answer = selectedAnswers[qId];
    if (!answer) {
      toast('Please select an answer first.', 'warning');
      return;
    }

    setSubmittingId(qId);
    try {
      const res = await fetch('/api/practice/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          practice_question_id: qId,
          student_id: activeStudent.id,
          student_answer: answer,
        }),
      });

      const data = await res.json();
      if (data.success) {
        setResults({
          ...results,
          [qId]: data.result,
        });

        if (data.result.is_correct) {
          confetti({ particleCount: 60, spread: 60, origin: { y: 0.7 } });
        }
      } else {
        toast(data.error || 'Submission failed', 'error');
      }
    } catch (err: any) {
      toast(`Error: ${err.message}`, 'error');
    } finally {
      setSubmittingId(null);
    }
  };

  return (
    <div className="space-y-8 animate-fadeIn max-w-3xl mx-auto">
      {/* Header & Placement Readiness Summary */}
      <div className="space-y-4">
        <div>
          <div className="flex items-center space-x-2">
            <h1 className="text-2xl font-black text-gray-900 tracking-tight">Interactive Practice Center</h1>
            <Badge variant="secondary" className="bg-purple-100 text-[#3E2D68] font-bold text-[11px] flex items-center space-x-1">
              <Briefcase className="w-3 h-3 mr-1" />
              <span>Placement Grade</span>
            </Badge>
          </div>
          <p className="text-sm text-gray-500 font-medium mt-1">
            Technical placement quiz questions (minimum 5 questions per topic) designed to prepare you for campus corporate assessments and technical interviews.
          </p>
        </div>

        {/* Live Placement Readiness Scorecard */}
        {practiceQuestions.length > 0 && (
          <Card className="rounded-3xl border-none shadow-sm bg-gradient-to-br from-[#3E2D68] to-[#584193] text-white p-5 sm:p-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center space-x-2 text-purple-200 text-xs font-semibold">
                  <Target className="w-4 h-4 text-emerald-300" />
                  <span>Campus Placement Preparedness</span>
                </div>
                <h3 className="text-xl sm:text-2xl font-black">
                  {accuracyPct}% Placement Accuracy
                </h3>
                <p className="text-xs text-purple-100 max-w-md">
                  {attemptedCount === 0
                    ? `Complete all ${practiceQuestions.length} practice questions to measure your placement aptitude.`
                    : `${correctCount} of ${attemptedCount} attempted answered correctly (${practiceQuestions.length} total placement questions assigned).`}
                </p>
              </div>

              <div className="flex items-center space-x-2">
                <div className="bg-white/10 backdrop-blur-md rounded-2xl px-4 py-2.5 text-center border border-white/10">
                  <p className="text-[10px] uppercase font-bold text-purple-200">Questions</p>
                  <p className="text-lg font-black text-white">{practiceQuestions.length}</p>
                </div>
                <div className="bg-emerald-500/20 backdrop-blur-md rounded-2xl px-4 py-2.5 text-center border border-emerald-400/30">
                  <p className="text-[10px] uppercase font-bold text-emerald-200">Completed</p>
                  <p className="text-lg font-black text-emerald-300">{attemptedCount}/{practiceQuestions.length}</p>
                </div>
              </div>
            </div>
          </Card>
        )}
      </div>

      <div className="space-y-6">
        {practiceQuestions.length === 0 ? (
          <Card className="rounded-3xl border-dashed border-2 border-gray-200 bg-white p-12 text-center text-gray-400 text-xs">
            No practice questions currently assigned. Complete your diagnostic assessment to trigger tailored
            placement practice questions.
          </Card>
        ) : (
          practiceQuestions.map((pq, idx) => {
            const result = results[pq.id];
            const selectedOpt = selectedAnswers[pq.id];

            return (
              <Card key={pq.id} className="rounded-3xl border-none shadow-sm bg-white p-6 sm:p-8 space-y-5">
                <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                  <div className="flex items-center space-x-2">
                    {pq.course && (
                      <Badge variant="secondary" className="text-[10px] font-bold bg-indigo-50 text-indigo-700">
                        {pq.course.code}
                      </Badge>
                    )}
                    <span className="w-6 h-6 rounded-lg bg-purple-100 text-[#3E2D68] text-xs font-bold flex items-center justify-center">
                      #{idx + 1}
                    </span>
                    <Badge variant="secondary" className="uppercase text-[10px] font-bold text-[#3E2D68]">
                      {pq.trait}
                    </Badge>
                  </div>

                  <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full flex items-center space-x-1">
                    <Briefcase className="w-3 h-3 mr-0.5" />
                    <span>Placement Caliber</span>
                  </span>
                </div>

                <h3 className="text-sm sm:text-base font-bold text-gray-900 leading-relaxed">
                  {pq.question_text}
                </h3>

                {/* Options */}
                {pq.options && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                    {pq.options.map((opt: string, i: number) => {
                      const isChosen = selectedOpt === opt;
                      return (
                        <div
                          key={i}
                          onClick={() => handleSelect(pq.id, opt)}
                          className={`p-3.5 rounded-2xl border text-xs font-semibold cursor-pointer transition-all flex items-center space-x-3 ${
                            isChosen
                              ? 'bg-purple-50/80 border-[#3E2D68] text-[#3E2D68] ring-1 ring-[#3E2D68]'
                              : 'bg-white border-gray-200 hover:border-gray-300 text-gray-800'
                          } ${result ? 'pointer-events-none' : ''}`}
                        >
                          <span
                            className={`w-5 h-5 rounded-md flex items-center justify-center font-bold text-[10px] border ${
                              isChosen
                                ? 'bg-[#3E2D68] text-white border-[#3E2D68]'
                                : 'bg-gray-50 text-gray-500 border-gray-200'
                            }`}
                          >
                            {String.fromCharCode(65 + i)}
                          </span>
                          <span className="flex-1 truncate">{opt}</span>
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* Submit / Result Feedback */}
                {!result ? (
                  <div className="pt-2 flex justify-end">
                    <Button
                      onClick={() => handleSubmitPractice(pq.id)}
                      disabled={submittingId === pq.id}
                      className="rounded-xl text-xs font-bold bg-[#3E2D68] px-5 text-white"
                    >
                      {submittingId === pq.id ? 'Checking...' : 'Check Answer'}
                    </Button>
                  </div>
                ) : (
                  <div
                    className={`p-4 rounded-2xl border text-xs space-y-1.5 animate-fadeIn ${
                      result.is_correct
                        ? 'bg-emerald-50 border-emerald-200 text-emerald-950'
                        : 'bg-rose-50 border-rose-200 text-rose-950'
                    }`}
                  >
                    <div className="flex items-center space-x-2 font-bold">
                      {result.is_correct ? (
                        <>
                          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                          <span>Brilliant! That is correct.</span>
                        </>
                      ) : (
                        <>
                          <XCircle className="w-4 h-4 text-rose-600" />
                          <span>Incorrect. Review the concept explanation below.</span>
                        </>
                      )}
                    </div>
                    <p className="text-[11px] leading-relaxed pl-6">{result.explanation}</p>
                  </div>
                )}
              </Card>
            );
          })
        )}
      </div>
    </div>
  );
}

