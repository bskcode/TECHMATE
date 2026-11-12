// ====================================================================
// ADAPTIVELEARN AI — Academic Trait Calculator (Bloom's Revised Taxonomy)
// Calculates 6-dimensional cognitive traits with evidence metrics
// ====================================================================

import { BloomTrait, ConfidenceLevel } from '@/types';

export const BLOOM_TRAITS: BloomTrait[] = [
  'remembering',
  'understanding',
  'application',
  'analysis',
  'creativity',
  'evaluation',
];

export interface QuestionScoringItem {
  questionId: string;
  maxMarks: number;
  awardedMarks: number;
  primaryTrait: BloomTrait;
  secondaryTrait?: BloomTrait;
  secondaryTraitWeight?: number; // e.g. 0.3
}

export interface TraitCalculationResult {
  trait: BloomTrait;
  marksEarned: number;
  marksPossible: number;
  scorePercentage: number;
  evidenceCount: number;
  confidence: ConfidenceLevel;
}

/**
 * Calculates trait scores for all 6 Bloom dimensions from student attempt responses.
 * Implements strict weight normalization to guarantee zero double-counting of marks.
 */
export function calculateTraitScores(
  items: QuestionScoringItem[]
): Record<BloomTrait, TraitCalculationResult> {
  const traitAccumulators: Record<
    BloomTrait,
    { earned: number; possible: number; evidenceCount: number }
  > = {
    remembering: { earned: 0, possible: 0, evidenceCount: 0 },
    understanding: { earned: 0, possible: 0, evidenceCount: 0 },
    application: { earned: 0, possible: 0, evidenceCount: 0 },
    analysis: { earned: 0, possible: 0, evidenceCount: 0 },
    creativity: { earned: 0, possible: 0, evidenceCount: 0 },
    evaluation: { earned: 0, possible: 0, evidenceCount: 0 },
  };

  for (const item of items) {
    const { maxMarks, awardedMarks, primaryTrait, secondaryTrait, secondaryTraitWeight } = item;

    // Weight allocation between primary and secondary
    let primaryWeight = 1.0;
    let secWeight = 0.0;

    if (secondaryTrait && secondaryTraitWeight && secondaryTraitWeight > 0) {
      // Normalize weights so primaryWeight + secWeight = 1.0
      const totalRawWeight = 1.0 + secondaryTraitWeight;
      primaryWeight = 1.0 / totalRawWeight;
      secWeight = secondaryTraitWeight / totalRawWeight;
    }

    // Allocate to primary trait
    const primaryEarned = awardedMarks * primaryWeight;
    const primaryPossible = maxMarks * primaryWeight;
    traitAccumulators[primaryTrait].earned += primaryEarned;
    traitAccumulators[primaryTrait].possible += primaryPossible;
    traitAccumulators[primaryTrait].evidenceCount += 1;

    // Allocate to secondary trait if present
    if (secondaryTrait && secWeight > 0) {
      const secEarned = awardedMarks * secWeight;
      const secPossible = maxMarks * secWeight;
      traitAccumulators[secondaryTrait].earned += secEarned;
      traitAccumulators[secondaryTrait].possible += secPossible;
      traitAccumulators[secondaryTrait].evidenceCount += 1;
    }
  }

  const results: Partial<Record<BloomTrait, TraitCalculationResult>> = {};

  for (const trait of BLOOM_TRAITS) {
    const data = traitAccumulators[trait];
    const possible = Math.round(data.possible * 100) / 100;
    const earned = Math.round(data.earned * 100) / 100;

    const percentage =
      possible > 0 ? Math.round((earned / possible) * 10000) / 100 : 0;

    // Determine confidence based on evidence count and total points
    let confidence: ConfidenceLevel = 'low';
    if (data.evidenceCount >= 3 && possible >= 10) {
      confidence = 'high';
    } else if (data.evidenceCount >= 2 || possible >= 5) {
      confidence = 'moderate';
    } else {
      confidence = 'low';
    }

    results[trait] = {
      trait,
      marksEarned: earned,
      marksPossible: possible,
      scorePercentage: percentage,
      evidenceCount: data.evidenceCount,
      confidence,
    };
  }

  return results as Record<BloomTrait, TraitCalculationResult>;
}

/**
 * Calculates trait improvement between baseline (diagnostic) and final assessments.
 * Expressed in percentage points (pp).
 */
export function calculateTraitImprovement(
  baseline: Record<BloomTrait, TraitCalculationResult>,
  final: Record<BloomTrait, TraitCalculationResult>
): {
  improvements: Record<BloomTrait, number>;
  averageImprovement: number;
} {
  const improvements: Partial<Record<BloomTrait, number>> = {};
  let totalDelta = 0;

  for (const trait of BLOOM_TRAITS) {
    const basePct = baseline[trait]?.scorePercentage ?? 0;
    const finalPct = final[trait]?.scorePercentage ?? 0;
    const delta = Math.round((finalPct - basePct) * 100) / 100;
    improvements[trait] = delta;
    totalDelta += delta;
  }

  const averageImprovement =
    Math.round((totalDelta / BLOOM_TRAITS.length) * 100) / 100;

  return {
    improvements: improvements as Record<BloomTrait, number>,
    averageImprovement,
  };
}

