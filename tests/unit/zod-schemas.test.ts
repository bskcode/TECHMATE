import { describe, it, expect } from 'vitest';
import { QuestionPackageSchema, AssessmentGenerationResponseSchema } from '../../lib/ai/schemas';

describe('AI Zod Schemas', () => {
  it('validates a complete question package', () => {
    const validPkg = {
      question_text: 'What is the runtime of Binary Search on a sorted array?',
      question_type: 'mcq',
      options: ['O(1)', 'O(log N)', 'O(N)', 'O(N log N)'],
      correct_answer: 'O(log N)',
      accepted_variations: ['O(log N)', 'O(logn)'],
      reference_answer: 'Binary search runs in O(log N).',
      explanation: 'Halves the search space at each iteration.',
      rubric: [
        { criteria_name: 'Complexity Identification', description: 'Identifies logarithmic complexity', max_points: 5, weight: 1.0 },
      ],
      max_marks: 5,
      primary_trait: 'remembering',
      difficulty: 'easy',
      hint_1: 'Consider how the array size is divided by 2 at each step.',
      hint_2: 'The inverse operation of doubling is base-2 logarithm.',
      evaluation_method: 'deterministic',
    };

    const parsed = QuestionPackageSchema.parse(validPkg);
    expect(parsed.primary_trait).toBe('remembering');
    expect(parsed.max_marks).toBe(5);
  });

  it('rejects a question package missing required hints or answer key', () => {
    const invalidPkg = {
      question_text: 'Short question?',
      question_type: 'mcq',
      primary_trait: 'remembering',
      difficulty: 'easy',
    };

    expect(() => QuestionPackageSchema.parse(invalidPkg)).toThrow();
  });
});
