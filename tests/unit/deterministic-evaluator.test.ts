import { describe, it, expect } from 'vitest';
import { evaluateResponse, normalizeText } from '../../lib/engine/deterministic-evaluator';
import { QuestionAnswerKey } from '../../types';

describe('Deterministic Evaluator', () => {
  it('normalizes text properly', () => {
    expect(normalizeText('  Binary Search.  ')).toBe('binary search');
    expect(normalizeText('O(log N)')).toBe('o(log n)');
  });

  it('correctly evaluates MCQ single choice answers', () => {
    const key: QuestionAnswerKey = {
      id: 'k1',
      question_id: 'q1',
      correct_answer: 'O(log N)',
      accepted_variations: ['O(logn)', 'O(log(N))'],
      evaluation_method: 'deterministic',
    };

    const correctRes = evaluateResponse('mcq', 'O(log N)', key, 5);
    expect(correctRes.is_correct).toBe(true);
    expect(correctRes.score).toBe(5);
    expect(correctRes.percentage).toBe(100);

    const variationRes = evaluateResponse('mcq', 'o(logn)', key, 5);
    expect(variationRes.is_correct).toBe(true);
    expect(variationRes.score).toBe(5);

    const wrongRes = evaluateResponse('mcq', 'O(N)', key, 5);
    expect(wrongRes.is_correct).toBe(false);
    expect(wrongRes.score).toBe(0);
  });

  it('correctly evaluates True/False questions', () => {
    const key: QuestionAnswerKey = {
      id: 'k2',
      question_id: 'q2',
      correct_answer: 'False',
      accepted_variations: ['false', 'F'],
      evaluation_method: 'deterministic',
    };

    expect(evaluateResponse('true_false', 'False', key, 5).is_correct).toBe(true);
    expect(evaluateResponse('true_false', 'false', key, 5).is_correct).toBe(true);
    expect(evaluateResponse('true_false', 'True', key, 5).is_correct).toBe(false);
  });

  it('correctly evaluates Numeric questions with tolerance', () => {
    const key: QuestionAnswerKey = {
      id: 'k3',
      question_id: 'q3',
      correct_answer: '10',
      accepted_variations: [],
      evaluation_method: 'deterministic',
      numeric_tolerance: 0.1,
    };

    expect(evaluateResponse('numeric', '10', key, 5).is_correct).toBe(true);
    expect(evaluateResponse('numeric', '10.05', key, 5).is_correct).toBe(true);
    expect(evaluateResponse('numeric', '10.5', key, 5).is_correct).toBe(false);
    expect(evaluateResponse('numeric', 'invalid_string', key, 5).is_correct).toBe(false);
  });

  it('correctly evaluates Fill-in-the-blank with accepted variations', () => {
    const key: QuestionAnswerKey = {
      id: 'k4',
      question_id: 'q4',
      correct_answer: 'admissible',
      accepted_variations: ['Admissible', 'admissable'],
      evaluation_method: 'deterministic',
    };

    expect(evaluateResponse('fill_in_blank', 'admissible', key, 5).is_correct).toBe(true);
    expect(evaluateResponse('fill_in_blank', 'ADMISSIBLE', key, 5).is_correct).toBe(true);
    expect(evaluateResponse('fill_in_blank', 'admissable', key, 5).is_correct).toBe(true);
    expect(evaluateResponse('fill_in_blank', 'consistent', key, 5).is_correct).toBe(false);
  });

  it('correctly evaluates Multiple-Select questions and computes partial credit', () => {
    const key: QuestionAnswerKey = {
      id: 'k5',
      question_id: 'q5',
      correct_answer: 'FIFO queue, Exponential memory, Shortest path',
      accepted_variations: [],
      evaluation_method: 'deterministic',
    };

    // Full match
    const fullMatch = evaluateResponse(
      'multiple_select',
      'FIFO queue, Exponential memory, Shortest path',
      key,
      6
    );
    expect(fullMatch.is_correct).toBe(true);
    expect(fullMatch.score).toBe(6);

    // Partial match (2 out of 3)
    const partialMatch = evaluateResponse(
      'multiple_select',
      'FIFO queue, Exponential memory',
      key,
      6
    );
    expect(partialMatch.is_correct).toBe(false);
    expect(partialMatch.score).toBe(4); // 2/3 * 6 = 4
  });
});

