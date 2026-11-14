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

const RawRubricItemSchema = z.object({
  criteria_name: z.string().default('Accuracy'),
  description: z.string().default('Grounded correctness per lecture material'),
  max_points: z.number().default(5),
  weight: z.number().default(1),
});

export const QuestionRubricItemSchema = z.preprocess((val: any) => {
  if (typeof val === 'string') {
    return {
      criteria_name: 'Criterion',
      description: val,
      max_points: 5,
      weight: 1.0,
    };
  }
  if (val && typeof val === 'object') {
    return {
      criteria_name: val.criteria_name || val.criterion || val.name || 'Accuracy',
      description: val.description || val.criterion || val.details || 'Grounded correctness per lecture material',
      max_points: typeof val.max_points === 'number' ? val.max_points : (typeof val.points === 'number' ? val.points : 5),
      weight: typeof val.weight === 'number' ? val.weight : 1.0,
    };
  }
  return val;
}, RawRubricItemSchema);

const RawQuestionPackageSchema = z.object({
  question_text: z.string().min(5),
  question_type: QuestionTypeEnum.default('mcq'),
  options: z.array(z.string()).optional(),
  correct_answer: z.string().min(1),
  accepted_variations: z.array(z.string()).optional().default([]),
  reference_answer: z.string().optional().default(''),
  explanation: z.string().optional().default('Grounded in uploaded course material.'),
  rubric: z.array(QuestionRubricItemSchema).optional().default([
    { criteria_name: 'Correctness', description: 'Evaluated against lecture notes', max_points: 5, weight: 1.0 },
  ]),
  max_marks: z.number().positive().default(5),
  primary_trait: BloomTraitEnum.default('understanding'),
  secondary_trait: BloomTraitEnum.optional(),
  secondary_trait_weight: z.number().min(0).max(0.5).optional(),
  difficulty: DifficultyEnum.default('medium'),
  hint_1: z.string().optional().default('Recall the governing technical theorem or definition for this mechanism.'),
  hint_2: z.string().optional().default('Apply the foundational invariant or operational formula established in the lecture material.'),
  evaluation_method: z.enum(['deterministic', 'hybrid']).default('deterministic'),
  numeric_tolerance: z.number().optional(),
  source_reference: z.string().optional(),
});

export const QuestionPackageSchema = z.preprocess((val: any) => {
  if (!val || typeof val !== 'object') return val;
  const copy = { ...val };

  // Normalize question_type
  if (copy.question_type) {
    const qt = String(copy.question_type).toLowerCase().trim();
    if (qt === 'multiple-choice' || qt === 'multiple_choice' || qt === 'choice' || qt === 'single_choice') {
      copy.question_type = 'mcq';
    } else if (qt === 'multi_select' || qt === 'multiple-select' || qt === 'checkbox' || qt === 'multi-choice') {
      copy.question_type = 'multiple_select';
    } else if (qt === 'true-false' || qt === 'true/false' || qt === 'boolean') {
      copy.question_type = 'true_false';
    } else if (qt === 'numerical' || qt === 'number' || qt === 'calculation') {
      copy.question_type = 'numeric';
    } else if (qt === 'fill_in_the_blank' || qt === 'fill-in-the-blank' || qt === 'blank' || qt === 'fill_blank') {
      copy.question_type = 'fill_in_blank';
    } else if (!['mcq', 'multiple_select', 'true_false', 'numeric', 'fill_in_blank'].includes(qt)) {
      if (Array.isArray(copy.options) && copy.options.length === 2 && copy.options.some((o: string) => String(o).toLowerCase().includes('true'))) {
        copy.question_type = 'true_false';
      } else if (Array.isArray(copy.options) && copy.options.length >= 2) {
        copy.question_type = 'mcq';
      } else {
        copy.question_type = 'mcq';
      }
    }
  }

  // Normalize correct_answer: must be string
  if (Array.isArray(copy.correct_answer)) {
    copy.correct_answer = copy.correct_answer.map(String).join(', ');
  } else if (typeof copy.correct_answer === 'boolean') {
    copy.correct_answer = copy.correct_answer ? 'True' : 'False';
  } else if (typeof copy.correct_answer === 'number') {
    copy.correct_answer = String(copy.correct_answer);
  } else if (copy.correct_answer !== undefined && copy.correct_answer !== null) {
    copy.correct_answer = String(copy.correct_answer).trim();
  }

  // Normalize accepted_variations: flat array of strings
  if (Array.isArray(copy.accepted_variations)) {
    copy.accepted_variations = copy.accepted_variations.flat().map(String);
  } else if (copy.accepted_variations !== undefined && copy.accepted_variations !== null) {
    copy.accepted_variations = [String(copy.accepted_variations)];
  } else {
    copy.accepted_variations = [];
  }

  // Normalize options
  if (copy.question_type === 'true_false') {
    if (!copy.options || !Array.isArray(copy.options) || copy.options.length !== 2) {
      copy.options = ['True', 'False'];
    }
  } else if (Array.isArray(copy.options)) {
    copy.options = copy.options.map(String);
  }

  // Normalize primary_trait
  if (copy.primary_trait) {
    const pt = String(copy.primary_trait).toLowerCase().trim();
    const traitMap: Record<string, string> = {
      recall: 'remembering',
      remember: 'remembering',
      remembered: 'remembering',
      comprehension: 'understanding',
      understand: 'understanding',
      apply: 'application',
      applied: 'application',
      analyze: 'analysis',
      analytical: 'analysis',
      create: 'creativity',
      creative: 'creativity',
      synthesis: 'creativity',
      synthesize: 'creativity',
      evaluate: 'evaluation',
      evaluative: 'evaluation',
    };
    copy.primary_trait = traitMap[pt] || (['remembering', 'understanding', 'application', 'analysis', 'creativity', 'evaluation'].includes(pt) ? pt : 'understanding');
  }

  // Normalize difficulty
  if (copy.difficulty) {
    const diff = String(copy.difficulty).toLowerCase().trim();
    copy.difficulty = ['easy', 'medium', 'hard'].includes(diff) ? diff : 'medium';
  }

  // Normalize max_marks
  if (copy.max_marks !== undefined) {
    copy.max_marks = Number(copy.max_marks) || 5;
  }

  if (copy.secondary_trait_weight === undefined) {
    copy.secondary_trait_weight = 0.0;
  }

  // Normalize reference_answer
  if (!copy.reference_answer && copy.correct_answer) {
    copy.reference_answer = String(copy.correct_answer);
  }

  // Fallback progressive hints if omitted
  if (!copy.hint_1) copy.hint_1 = 'Recall the governing technical theorem or definition for this mechanism.';
  if (!copy.hint_2) copy.hint_2 = 'Apply the foundational invariant or operational formula established in the lecture material.';

  return copy;
}, RawQuestionPackageSchema);

const RawAssessmentGenerationResponseSchema = z.object({
  assessment_title: z.string().default('Course Assessment'),
  assessment_description: z.string().default('AI-generated assessment package'),
  questions: z.array(QuestionPackageSchema).min(1),
});

export const AssessmentGenerationResponseSchema = z.preprocess((val: any) => {
  if (!val || typeof val !== 'object') return val;
  const copy = { ...val };
  if (!Array.isArray(copy.questions)) {
    if (Array.isArray(copy.data?.questions)) copy.questions = copy.data.questions;
    else if (Array.isArray(copy.items)) copy.questions = copy.items;
  }
  if (!copy.assessment_title) copy.assessment_title = 'Course Assessment';
  if (!copy.assessment_description) copy.assessment_description = 'AI-generated assessment package';
  return copy;
}, RawAssessmentGenerationResponseSchema);

export const WorkedExampleSchema = z.object({
  step: z.number().int().positive(),
  description: z.string().min(10),
});

export const AnalogySchema = z.object({
  concept: z.string().min(3),
  analogy: z.string().min(15),
});

const RawPracticeQuestionSchema = z.object({
  question_text: z.string().min(10),
  options: z.array(z.string()).optional(),
  correct_answer: z.string().min(1),
  explanation: z.string().min(10),
  trait: BloomTraitEnum,
});

export const PracticeQuestionSchema = z.preprocess((val: any) => {
  if (!val || typeof val !== 'object') return val;
  const copy = { ...val };
  if (Array.isArray(copy.correct_answer)) copy.correct_answer = copy.correct_answer.join(', ');
  else if (typeof copy.correct_answer === 'boolean') copy.correct_answer = copy.correct_answer ? 'True' : 'False';
  else if (typeof copy.correct_answer === 'number') copy.correct_answer = String(copy.correct_answer);

  if (copy.trait) {
    const t = String(copy.trait).toLowerCase().trim();
    const map: Record<string, string> = {
      recall: 'remembering',
      comprehension: 'understanding',
      apply: 'application',
      analyze: 'analysis',
      create: 'creativity',
      evaluate: 'evaluation',
    };
    copy.trait = map[t] || (['remembering', 'understanding', 'application', 'analysis', 'creativity', 'evaluation'].includes(t) ? t : 'understanding');
  }
  return copy;
}, RawPracticeQuestionSchema);

export const InterventionPackageSchema = z.object({
  title: z.string().min(5),
  learning_gap_summary: z.string().min(15),
  explanation_markdown: z.string().min(50),
  worked_examples: z.array(WorkedExampleSchema).min(1),
  analogies: z.array(AnalogySchema).min(1),
  revision_checklist: z.array(z.string()).min(2),
  recommended_next_steps: z.array(z.string()).min(2),
  practice_questions: z.array(PracticeQuestionSchema).min(5),
});

export type QuestionPackageZod = z.infer<typeof QuestionPackageSchema>;
export type AssessmentGenerationResponseZod = z.infer<typeof AssessmentGenerationResponseSchema>;
export type InterventionPackageZod = z.infer<typeof InterventionPackageSchema>;
