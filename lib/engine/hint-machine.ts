// ====================================================================
// ADAPTIVELEARN AI — Progressive 2-Hint State Machine
// Strict server-side enforcement of exactly two hints per question.
// ====================================================================

import { QuestionHint, QuestionAnswerKey, QuestionType } from '@/types';
import { evaluateResponse, EvaluationResult } from './deterministic-evaluator';

export type QuestionProgressState =
  | 'unattempted'
  | 'hint_1_unlocked'
  | 'hint_2_unlocked'
  | 'finalized_correct'
  | 'finalized_incorrect';

export interface ProcessSubmissionInput {
  questionType: QuestionType;
  studentAnswer: string;
  responseNumber: number; // 1, 2, or 3
  answerKey: QuestionAnswerKey;
  maxMarks: number;
  hints: QuestionHint[]; // Loaded server-side only
}

export interface ProcessSubmissionResult {
  is_correct: boolean;
  awarded_marks: number;
  max_marks: number;
  response_number: number;
  is_question_finalized: boolean;
  next_state: QuestionProgressState;
  unlocked_hint?: {
    hint_number: 1 | 2;
    hint_text: string;
  };
  feedback: string;
  evaluation: EvaluationResult;
}

/**
 * Calculates marks awarded based on attempt number and correctness.
 * Attempt 1: 100% of max marks
 * Attempt 2 (with Hint 1): 75% of max marks
 * Attempt 3 (with Hint 2): 50% of max marks
 */
export function calculateAssistedMarks(
  responseNumber: number,
  maxMarks: number,
  isCorrect: boolean,
  partialScore?: number
): number {
  if (!isCorrect) {
    return partialScore ?? 0;
  }

  switch (responseNumber) {
    case 1:
      return maxMarks; // Full independent score
    case 2:
      return Math.round(maxMarks * 0.75 * 100) / 100; // 25% hint deduction
    case 3:
      return Math.round(maxMarks * 0.50 * 100) / 100; // 50% hint deduction
    default:
      return 0;
  }
}

/**
 * Processes a student's answer submission under the progressive 2-hint state machine.
 * Throws if the student tries to submit more than 3 attempts.
 */
export function processProgressiveSubmission(
  input: ProcessSubmissionInput
): ProcessSubmissionResult {
  const { questionType, studentAnswer, responseNumber, answerKey, maxMarks, hints } = input;

  if (responseNumber < 1 || responseNumber > 3) {
    throw new Error(
      `Invalid attempt number ${responseNumber}. Exactly 3 attempts (Initial + Hint 1 + Hint 2) are permitted.`
    );
  }

  // 1. Evaluate the student's answer deterministically
  const evalResult = evaluateResponse(questionType, studentAnswer, answerKey, maxMarks);

  // Sort hints by hint_number (1, 2)
  const sortedHints = [...hints].sort((a, b) => a.hint_number - b.hint_number);
  const hint1 = sortedHints.find((h) => h.hint_number === 1);
  const hint2 = sortedHints.find((h) => h.hint_number === 2);

  // CASE 1: Student is correct on Attempt 1
  if (responseNumber === 1 && evalResult.is_correct) {
    return {
      is_correct: true,
      awarded_marks: maxMarks,
      max_marks: maxMarks,
      response_number: 1,
      is_question_finalized: true,
      next_state: 'finalized_correct',
      feedback: evalResult.feedback,
      evaluation: evalResult,
    };
  }

  // CASE 2: Student is incorrect on Attempt 1 -> UNLOCK HINT 1
  if (responseNumber === 1 && !evalResult.is_correct) {
    return {
      is_correct: false,
      awarded_marks: 0,
      max_marks: maxMarks,
      response_number: 1,
      is_question_finalized: false,
      next_state: 'hint_1_unlocked',
      unlocked_hint: hint1
        ? { hint_number: 1, hint_text: hint1.hint_text }
        : undefined,
      feedback: 'First attempt was incorrect. Hint 1 has been unlocked to assist you.',
      evaluation: evalResult,
    };
  }

  // CASE 3: Student is correct on Attempt 2 (assisted by Hint 1)
  if (responseNumber === 2 && evalResult.is_correct) {
    const marks = calculateAssistedMarks(2, maxMarks, true);
    return {
      is_correct: true,
      awarded_marks: marks,
      max_marks: maxMarks,
      response_number: 2,
      is_question_finalized: true,
      next_state: 'finalized_correct',
      feedback: `Correct on second attempt with Hint 1! Awarded ${marks}/${maxMarks} marks.`,
      evaluation: evalResult,
    };
  }

  // CASE 4: Student is incorrect on Attempt 2 -> UNLOCK HINT 2
  if (responseNumber === 2 && !evalResult.is_correct) {
    return {
      is_correct: false,
      awarded_marks: 0,
      max_marks: maxMarks,
      response_number: 2,
      is_question_finalized: false,
      next_state: 'hint_2_unlocked',
      unlocked_hint: hint2
        ? { hint_number: 2, hint_text: hint2.hint_text }
        : undefined,
      feedback: 'Second attempt was incorrect. Hint 2 has been unlocked. This is your final attempt.',
      evaluation: evalResult,
    };
  }

  // CASE 5: Attempt 3 (Final attempt, assisted by Hint 2)
  if (responseNumber === 3) {
    const marks = evalResult.is_correct
      ? calculateAssistedMarks(3, maxMarks, true)
      : evalResult.score > 0
      ? Math.round(evalResult.score * 0.5 * 100) / 100
      : 0;

    return {
      is_correct: evalResult.is_correct,
      awarded_marks: marks,
      max_marks: maxMarks,
      response_number: 3,
      is_question_finalized: true,
      next_state: evalResult.is_correct ? 'finalized_correct' : 'finalized_incorrect',
      feedback: evalResult.is_correct
        ? `Correct on final attempt with Hint 2! Awarded ${marks}/${maxMarks} marks.`
        : `Final attempt complete. Awarded ${marks}/${maxMarks} marks.`,
      evaluation: evalResult,
    };
  }

  throw new Error('Unreachable state machine condition.');
}
