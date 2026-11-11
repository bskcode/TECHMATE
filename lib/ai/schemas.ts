import { z } from 'zod';

export const BloomTraitEnum = z.enum([
  'remembering',
  'understanding',
  'application',
  'analysis',
  'creativity',
  'evaluation',
]);

export const QuestionTypeEnum = z.enum([
  'mcq',
  'multiple_select',
  'true_false',
  'numeric',
  'fill_in_blank',
]);

export const DifficultyEnum = z.enum(['easy', 'medium', 'hard']);

export const QuestionRubricItemSchema = z.object({
  criteria_name: z.string().min(2),
  description: z.string().min(5),
  max_points: z.number().positive(),
  weight: z.number().min(0).max(1).default(1),
});

export const QuestionPackageSchema = z.object({
  question_text: z.string().min(10),
  question_type: QuestionTypeEnum,
  options: z.array(z.string()).optional(),
  correct_answer: z.string().min(1),
  accepted_variations: z.array(z.string()).optional().default([]),
  reference_answer: z.string().min(5),
  explanation: z.string().min(10),
  rubric: z.array(QuestionRubricItemSchema).min(1),
  max_marks: z.number().positive().default(5),
  primary_trait: BloomTraitEnum,
  secondary_trait: BloomTraitEnum.optional(),
  secondary_trait_weight: z.number().min(0).max(0.5).optional().default(0.0),
  difficulty: DifficultyEnum,
  hint_1: z.string().min(10),
  hint_2: z.string().min(10),
  evaluation_method: z.enum(['deterministic', 'hybrid']).default('deterministic'),
  numeric_tolerance: z.number().optional(),
  source_reference: z.string().optional(),
});

export const AssessmentGenerationResponseSchema = z.object({
  assessment_title: z.string(),
  assessment_description: z.string(),
  questions: z.array(QuestionPackageSchema).min(1),
});

export const WorkedExampleSchema = z.object({
  step: z.number().int().positive(),
  description: z.string().min(10),
});

export const AnalogySchema = z.object({
  concept: z.string().min(3),
  analogy: z.string().min(15),
});

export const PracticeQuestionSchema = z.object({
  question_text: z.string().min(10),
  options: z.array(z.string()).optional(),
  correct_answer: z.string().min(1),
  explanation: z.string().min(10),
  trait: BloomTraitEnum,
});

export const InterventionPackageSchema = z.object({
  title: z.string().min(5),
  learning_gap_summary: z.string().min(15),
  explanation_markdown: z.string().min(50),
  worked_examples: z.array(WorkedExampleSchema).min(1),
  analogies: z.array(AnalogySchema).min(1),
  revision_checklist: z.array(z.string()).min(2),
  recommended_next_steps: z.array(z.string()).min(2),
  practice_questions: z.array(PracticeQuestionSchema).min(2),
});

export type QuestionPackageZod = z.infer<typeof QuestionPackageSchema>;
export type AssessmentGenerationResponseZod = z.infer<typeof AssessmentGenerationResponseSchema>;
export type InterventionPackageZod = z.infer<typeof InterventionPackageSchema>;
