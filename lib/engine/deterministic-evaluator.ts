// ====================================================================
// ADAPTIVELEARN AI — Deterministic Evaluation Engine
// Instant (<2ms), 100% deterministic evaluation for all objective questions
// ====================================================================

import { QuestionType, QuestionAnswerKey } from '@/types';

export interface EvaluationResult {
  is_correct: boolean;
  score: number;
  max_score: number;
  percentage: number;
  feedback: string;
  confidence: number;
}

/**
 * Normalizes text for comparison by trimming, lowercasing, and normalizing spaces.
 */
export function normalizeText(text: string): string {
  return text
    .trim()
    .toLowerCase()
    .replace(/\s+/g, ' ')
    .replace(/^[.,;:!?"']+|[.,;:!?"']+$/g, '');
}

/**
 * Evaluates an objective student response against the question's answer key.
 */
export function evaluateResponse(
  questionType: QuestionType,
  studentAnswer: string,
  answerKey: QuestionAnswerKey,
  maxMarks: number
): EvaluationResult {
  if (!studentAnswer || studentAnswer.trim() === '') {
    return {
      is_correct: false,
      score: 0,
      max_score: maxMarks,
      percentage: 0,
      feedback: 'No answer provided.',
      confidence: 1.0,
    };
  }

  const rawAnswer = studentAnswer.trim();
  const normalizedStudent = normalizeText(studentAnswer);
  const normalizedCorrect = normalizeText(answerKey.correct_answer);

  switch (questionType) {
    case 'mcq':
    case 'true_false': {
      // Direct string comparison or index comparison
      const isMatch =
        rawAnswer === answerKey.correct_answer ||
        normalizedStudent === normalizedCorrect ||
        (answerKey.accepted_variations || []).some(
          (v) => normalizeText(v) === normalizedStudent
        );

      return {
        is_correct: isMatch,
        score: isMatch ? maxMarks : 0,
        max_score: maxMarks,
        percentage: isMatch ? 100 : 0,
        feedback: isMatch
          ? 'Correct! ' + (answerKey.explanation || '')
          : 'Incorrect. Re-read the question and analyze your options.',
        confidence: 1.0,
      };
    }

    case 'numeric': {
      const studentNum = parseFloat(studentAnswer.trim());
      const correctNum = parseFloat(answerKey.correct_answer.trim());
      const tolerance = answerKey.numeric_tolerance ?? 0.001;

      if (isNaN(studentNum)) {
        return {
          is_correct: false,
          score: 0,
          max_score: maxMarks,
          percentage: 0,
          feedback: 'Invalid numeric input. Please enter a valid number.',
          confidence: 1.0,
        };
      }

      const diff = Math.abs(studentNum - correctNum);
      const isCorrect = diff <= tolerance;

      return {
        is_correct: isCorrect,
        score: isCorrect ? maxMarks : 0,
        max_score: maxMarks,
        percentage: isCorrect ? 100 : 0,
        feedback: isCorrect
          ? 'Correct! ' + (answerKey.explanation || '')
          : `Incorrect. Your answer (${studentNum}) does not match the target value within tolerance.`,
        confidence: 1.0,
      };
    }

    case 'fill_in_blank': {
      // Check against correct answer and accepted variations
      const accepted = [
        answerKey.correct_answer,
        ...(answerKey.accepted_variations || []),
      ].map((v) => normalizeText(v));

      const isCorrect = accepted.includes(normalizedStudent);

      return {
        is_correct: isCorrect,
        score: isCorrect ? maxMarks : 0,
        max_score: maxMarks,
        percentage: isCorrect ? 100 : 0,
        feedback: isCorrect
          ? 'Correct! ' + (answerKey.explanation || '')
          : 'Incorrect. Check your spelling or terminology.',
        confidence: 1.0,
      };
    }

    case 'multiple_select': {
      // Split by commas, trim each option, and compare sets
      const studentSelected = studentAnswer
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean)
        .sort();

      const correctSelected = answerKey.correct_answer
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean)
        .sort();

      // Check variations if provided (e.g. indices vs full text)
      const isExactMatch =
        studentSelected.length === correctSelected.length &&
        studentSelected.every((item, i) => item === correctSelected[i]);

      if (isExactMatch) {
        return {
          is_correct: true,
          score: maxMarks,
          max_score: maxMarks,
          percentage: 100,
          feedback: 'Correct! All selected options are accurate. ' + (answerKey.explanation || ''),
          confidence: 1.0,
        };
      }

      // Check for partial credit
      const correctMatches = studentSelected.filter((item) =>
        correctSelected.includes(item)
      ).length;
      const incorrectSelections = studentSelected.length - correctMatches;

      // Partial score penalized by false positives
      const netCorrect = Math.max(0, correctMatches - incorrectSelections);
      const partialFraction = correctSelected.length > 0 ? netCorrect / correctSelected.length : 0;
      const partialScore = Math.round(maxMarks * partialFraction * 100) / 100;

      return {
        is_correct: false,
        score: partialScore,
        max_score: maxMarks,
        percentage: (partialScore / maxMarks) * 100,
        feedback: `Partially correct (${correctMatches}/${correctSelected.length} matched).`,
        confidence: 1.0,
      };
    }

    default:
      return {
        is_correct: false,
        score: 0,
        max_score: maxMarks,
        percentage: 0,
        feedback: 'Unsupported question type.',
        confidence: 1.0,
      };
  }
}
