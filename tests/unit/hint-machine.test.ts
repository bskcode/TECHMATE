import { describe, it, expect } from 'vitest';
import {
  processProgressiveSubmission,
  calculateAssistedMarks,
} from '../../lib/engine/hint-machine';
import { QuestionAnswerKey, QuestionHint } from '../../types';

describe('Progressive 2-Hint State Machine', () => {
  const answerKey: QuestionAnswerKey = {
    id: 'ak1',
    question_id: 'q1',
    correct_answer: 'O(log N)',
    accepted_variations: ['O(logn)'],
    evaluation_method: 'deterministic',
  };

  const hints: QuestionHint[] = [
    {
      id: 'h1',
      question_id: 'q1',
      hint_number: 1,
      hint_text: 'Think about halving the search space.',
      penalty_percentage: 25,
    },
    {
      id: 'h2',
      question_id: 'q1',
      hint_number: 2,
      hint_text: 'The mathematical inverse of 2^k is log2(N).',
      penalty_percentage: 50,
    },
  ];

  it('awards full marks and finalizes when correct on attempt 1', () => {
    const res = processProgressiveSubmission({
      questionType: 'mcq',
      studentAnswer: 'O(log N)',
      responseNumber: 1,
      answerKey,
      maxMarks: 10,
      hints,
    });

    expect(res.is_correct).toBe(true);
    expect(res.awarded_marks).toBe(10);
    expect(res.is_question_finalized).toBe(true);
    expect(res.unlocked_hint).toBeUndefined();
  });

  it('unlocks Hint 1 and awards 0 marks when incorrect on attempt 1', () => {
    const res = processProgressiveSubmission({
      questionType: 'mcq',
      studentAnswer: 'O(N)',
      responseNumber: 1,
      answerKey,
      maxMarks: 10,
      hints,
    });

    expect(res.is_correct).toBe(false);
    expect(res.awarded_marks).toBe(0);
    expect(res.is_question_finalized).toBe(false);
    expect(res.next_state).toBe('hint_1_unlocked');
    expect(res.unlocked_hint?.hint_number).toBe(1);
    expect(res.unlocked_hint?.hint_text).toBe('Think about halving the search space.');
  });

  it('awards assisted marks (75%) and finalizes when correct on attempt 2', () => {
    const res = processProgressiveSubmission({
      questionType: 'mcq',
      studentAnswer: 'O(log N)',
      responseNumber: 2,
      answerKey,
      maxMarks: 10,
      hints,
    });

    expect(res.is_correct).toBe(true);
    expect(res.awarded_marks).toBe(7.5);
    expect(res.is_question_finalized).toBe(true);
    expect(res.next_state).toBe('finalized_correct');
  });

  it('unlocks Hint 2 and awards 0 marks when incorrect on attempt 2', () => {
    const res = processProgressiveSubmission({
      questionType: 'mcq',
      studentAnswer: 'O(N^2)',
      responseNumber: 2,
      answerKey,
      maxMarks: 10,
      hints,
    });

    expect(res.is_correct).toBe(false);
    expect(res.awarded_marks).toBe(0);
    expect(res.is_question_finalized).toBe(false);
    expect(res.next_state).toBe('hint_2_unlocked');
    expect(res.unlocked_hint?.hint_number).toBe(2);
    expect(res.unlocked_hint?.hint_text).toBe('The mathematical inverse of 2^k is log2(N).');
  });

  it('awards 50% marks and finalizes on attempt 3 if correct', () => {
    const res = processProgressiveSubmission({
      questionType: 'mcq',
      studentAnswer: 'O(log N)',
      responseNumber: 3,
      answerKey,
      maxMarks: 10,
      hints,
    });

    expect(res.is_correct).toBe(true);
    expect(res.awarded_marks).toBe(5.0);
    expect(res.is_question_finalized).toBe(true);
    expect(res.next_state).toBe('finalized_correct');
  });

  it('finalizes with 0 marks on attempt 3 if incorrect', () => {
    const res = processProgressiveSubmission({
      questionType: 'mcq',
      studentAnswer: 'O(1)',
      responseNumber: 3,
      answerKey,
      maxMarks: 10,
      hints,
    });

    expect(res.is_correct).toBe(false);
    expect(res.awarded_marks).toBe(0);
    expect(res.is_question_finalized).toBe(true);
    expect(res.next_state).toBe('finalized_incorrect');
  });

  it('strictly rejects any 4th attempt with an error', () => {
    expect(() =>
      processProgressiveSubmission({
        questionType: 'mcq',
        studentAnswer: 'O(log N)',
        responseNumber: 4,
        answerKey,
        maxMarks: 10,
        hints,
      })
    ).toThrow(/Exactly 3 attempts/);
  });
});

