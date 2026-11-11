import { describe, it, expect } from 'vitest';
import {
  calculateTraitScores,
  calculateTraitImprovement,
  BLOOM_TRAITS,
} from '../../lib/engine/trait-calculator';

describe('Academic Trait Calculator', () => {
  it('correctly calculates 6 Bloom traits without double counting', () => {
    const items = [
      {
        questionId: 'q1',
        maxMarks: 10,
        awardedMarks: 10,
        primaryTrait: 'remembering' as const,
      },
      {
        questionId: 'q2',
        maxMarks: 10,
        awardedMarks: 5,
        primaryTrait: 'understanding' as const,
      },
      {
        questionId: 'q3',
        maxMarks: 10,
        awardedMarks: 7.5,
        primaryTrait: 'application' as const,
        secondaryTrait: 'analysis' as const,
        secondaryTraitWeight: 0.25, // 1.0 vs 0.25 -> total 1.25 -> 80% primary, 20% secondary
      },
    ];

    const results = calculateTraitScores(items);

    expect(results.remembering.scorePercentage).toBe(100);
    expect(results.remembering.marksEarned).toBe(10);
    expect(results.remembering.marksPossible).toBe(10);
    expect(results.remembering.evidenceCount).toBe(1);

    expect(results.understanding.scorePercentage).toBe(50);
    expect(results.understanding.marksEarned).toBe(5);
    expect(results.understanding.marksPossible).toBe(10);

    // Question 3 weighted check:
    // primary = 10 * (1 / 1.25) = 8.0 possible, 7.5 * (1 / 1.25) = 6.0 earned -> 6 / 8 = 75%
    // secondary = 10 * (0.25 / 1.25) = 2.0 possible, 7.5 * (0.25 / 1.25) = 1.5 earned -> 1.5 / 2 = 75%
    expect(results.application.marksPossible).toBe(8);
    expect(results.application.marksEarned).toBe(6);
    expect(results.application.scorePercentage).toBe(75);

    expect(results.analysis.marksPossible).toBe(2);
    expect(results.analysis.marksEarned).toBe(1.5);
    expect(results.analysis.scorePercentage).toBe(75);

    // Sum of possible marks across application and analysis equals exactly 10 (no double counting!)
    expect(results.application.marksPossible + results.analysis.marksPossible).toBe(10);
    expect(results.application.marksEarned + results.analysis.marksEarned).toBe(7.5);
  });

  it('correctly assigns confidence levels based on evidence count and total marks', () => {
    const items = [
      { questionId: 'q1', maxMarks: 5, awardedMarks: 5, primaryTrait: 'evaluation' as const },
      { questionId: 'q2', maxMarks: 5, awardedMarks: 4, primaryTrait: 'evaluation' as const },
      { questionId: 'q3', maxMarks: 5, awardedMarks: 5, primaryTrait: 'evaluation' as const },
    ];

    const results = calculateTraitScores(items);
    // 3 questions, 15 marks -> High confidence
    expect(results.evaluation.confidence).toBe('high');
    expect(results.evaluation.evidenceCount).toBe(3);

    // Remembering has 0 items -> Low confidence
    expect(results.remembering.confidence).toBe('low');
  });

  it('calculates trait improvement in percentage points between baseline and final', () => {
    const baselineItems = [
      { questionId: 'b1', maxMarks: 10, awardedMarks: 5, primaryTrait: 'analysis' as const },
    ];
    const finalItems = [
      { questionId: 'f1', maxMarks: 10, awardedMarks: 9, primaryTrait: 'analysis' as const },
    ];

    const baseline = calculateTraitScores(baselineItems);
    const final = calculateTraitScores(finalItems);

    const { improvements, averageImprovement } = calculateTraitImprovement(baseline, final);

    // Baseline was 50%, final was 90% -> improvement is +40 percentage points
    expect(improvements.analysis).toBe(40);
  });
});
