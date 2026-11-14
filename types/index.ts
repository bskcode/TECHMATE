// ====================================================================
// ADAPTIVELEARN AI — Core Domain TypeScript Types
// ====================================================================

export type UserRole = 'faculty' | 'student';

export type BloomTrait =
  | 'remembering'
  | 'understanding'
  | 'application'
  | 'analysis'
  | 'creativity'
  | 'evaluation';

export type QuestionType =
  | 'mcq'
  | 'multiple_select'
  | 'true_false'
  | 'numeric'
  | 'fill_in_blank';

export type DifficultyLevel = 'easy' | 'medium' | 'hard';

export type AssessmentType = 'diagnostic' | 'progressive' | 'module' | 'final';

export type AssessmentStatus = 'draft' | 'pending_approval' | 'published' | 'archived';

export type QuestionApprovalStatus = 'draft' | 'generated' | 'approved' | 'rejected';

export type AttemptStatus = 'in_progress' | 'submitted' | 'evaluated';

export type ConfidenceLevel = 'high' | 'moderate' | 'low';

export type InterventionStatus =
  | 'generated'
  | 'pending_approval'
  | 'approved'
  | 'rejected'
  | 'released';

export interface Profile {
  id: string;
  email: string;
  full_name: string;
  role: UserRole;
  avatar_url?: string;
  institution: string;
  created_at: string;
}

export interface Course {
  id: string;
  instructor_id: string;
  code: string;
  title: string;
  description?: string;
  enrollment_code: string;
  term: string;
  is_active: boolean;
  created_at: string;
  instructor?: Profile;
  enrolled_count?: number;
}

export interface Enrollment {
  id: string;
  course_id: string;
  student_id: string;
  status: 'enrolled' | 'dropped';
  enrolled_at: string;
  student?: Profile;
  course?: Course;
}

export interface Module {
  id: string;
  course_id: string;
  title: string;
  description?: string;
  order_index: number;
  learning_objectives?: string[];
  created_at: string;
}

export interface CourseOutcome {
  id: string;
  course_id: string;
  code: string; // e.g. CO1
  description: string;
  bloom_level?: string;
  created_at: string;
}

export interface LearningMaterial {
  id: string;
  course_id: string;
  module_id?: string;
  uploader_id: string;
  filename: string;
  storage_path: string;
  file_type: 'pdf' | 'docx' | 'pptx' | 'txt' | 'md';
  file_size_bytes: number;
  extracted_text?: string;
  character_count: number;
  processing_status: 'pending' | 'processing' | 'completed' | 'failed';
  approval_status: 'pending' | 'approved' | 'rejected';
  rejection_reason?: string;
  created_at: string;
}

export interface Assessment {
  id: string;
  course_id: string;
  module_id?: string;
  title: string;
  description?: string;
  assessment_type: AssessmentType;
  status: AssessmentStatus;
  time_limit_minutes: number;
  max_marks: number;
  passing_marks: number;
  progressive_hints_enabled: boolean;
  version: number;
  created_at: string;
  published_at?: string;
  questions_count?: number;
}

export interface Question {
  id: string;
  assessment_id: string;
  order_index: number;
  question_text: string;
  question_type: QuestionType;
  options?: string[]; // Array of choices for MCQ / multi-select
  max_marks: number;
  primary_trait: BloomTrait;
  secondary_trait?: BloomTrait;
  secondary_trait_weight?: number;
  course_outcome_ids: string[];
  difficulty: DifficultyLevel;
  approval_status: QuestionApprovalStatus;
  grounding_material_ids: string[];
  source_reference?: string;
  created_at: string;
  // Included when loaded for faculty review:
  answer_key?: QuestionAnswerKey;
  rubrics?: QuestionRubric[];
  hints?: QuestionHint[];
}

export interface QuestionAnswerKey {
  id: string;
  question_id: string;
  correct_answer: string;
  accepted_variations: string[];
  reference_answer?: string;
  evaluation_method: 'deterministic' | 'hybrid';
  numeric_tolerance?: number;
  case_sensitive?: boolean;
  explanation?: string;
}

export interface QuestionRubric {
  id: string;
  question_id: string;
  criteria_name: string;
  description: string;
  max_points: number;
  weight: number;
}

export interface QuestionHint {
  id: string;
  question_id: string;
  hint_number: 1 | 2;
  hint_text: string;
  penalty_percentage: number;
}

export interface Attempt {
  id: string;
  assessment_id: string;
  student_id: string;
  attempt_number: number;
  status: AttemptStatus;
  started_at: string;
  submitted_at?: string;
  total_score: number;
  max_score: number;
  percentage: number;
  is_final: boolean;
  assessment?: Assessment;
  student?: Profile;
}

export interface StudentResponse {
  id: string;
  attempt_id: string;
  question_id: string;
  response_number: 1 | 2 | 3;
  student_answer: string;
  submitted_at: string;
  awarded_marks: number;
  is_correct: boolean;
  feedback?: string;
  evaluation_method: string;
  confidence: number;
}

export interface EvaluationRecord {
  id: string;
  response_id: string;
  attempt_id: string;
  question_id: string;
  score: number;
  rubric_breakdown?: Record<string, number>;
  feedback?: string;
  evaluator: 'deterministic' | 'groq' | 'faculty';
  evaluated_at: string;
}

export interface HintEvent {
  id: string;
  attempt_id: string;
  question_id: string;
  hint_number: 1 | 2;
  unlocked_at: string;
}

export interface TraitScore {
  id: string;
  attempt_id: string;
  student_id: string;
  course_id: string;
  assessment_id: string;
  trait: BloomTrait;
  marks_earned: number;
  marks_possible: number;
  score_percentage: number;
  evidence_count: number;
  confidence: ConfidenceLevel;
}

export interface Intervention {
  id: string;
  student_id: string;
  course_id: string;
  diagnostic_attempt_id?: string;
  weak_traits: BloomTrait[];
  weak_outcomes: string[];
  status: InterventionStatus;
  faculty_notes?: string;
  approved_by?: string;
  approved_at?: string;
  released_at?: string;
  created_at: string;
  completed_checklist_items?: number[];
  student?: Profile;
  material?: InterventionMaterial;
  practice_questions?: PracticeQuestion[];
}

export interface InterventionMaterial {
  id: string;
  intervention_id: string;
  title: string;
  learning_gap_summary: string;
  explanation_markdown: string;
  worked_examples: Array<{
    step: number;
    description: string;
  }>;
  analogies: Array<{
    concept: string;
    analogy: string;
  }>;
  revision_checklist: string[];
  recommended_next_steps: string[];
  grounding_material_ids: string[];
}

export interface PracticeQuestion {
  id: string;
  intervention_id: string;
  order_index: number;
  question_text: string;
  options?: string[];
  correct_answer: string;
  explanation: string;
  trait: BloomTrait;
}

export interface PracticeAttempt {
  id: string;
  practice_question_id: string;
  student_id: string;
  student_answer: string;
  is_correct: boolean;
  feedback?: string;
  attempted_at: string;
}

export interface ProgressReport {
  id: string;
  student_id: string;
  course_id: string;
  baseline_assessment_id: string;
  final_assessment_id: string;
  baseline_score: number;
  final_score: number;
  score_improvement: number; // final - baseline
  trait_improvements: Record<BloomTrait, number>; // in percentage points
  evidence_counts: Record<BloomTrait, number>;
  summary_narrative?: string;
  generated_at: string;
  student?: Profile;
  baseline_assessment?: Assessment;
  final_assessment?: Assessment;
}

// Complete Question Package generated by AI at Authoring Time
export interface QuestionPackage {
  question_text: string;
  question_type: QuestionType;
  options?: string[];
  correct_answer: string;
  accepted_variations: string[];
  reference_answer: string;
  explanation: string;
  rubric: Array<{
    criteria_name: string;
    description: string;
    max_points: number;
    weight: number;
  }>;
  max_marks: number;
  primary_trait: BloomTrait;
  secondary_trait?: BloomTrait;
  secondary_trait_weight?: number;
  difficulty: DifficultyLevel;
  hint_1: string;
  hint_2: string;
  evaluation_method: 'deterministic' | 'hybrid';
  numeric_tolerance?: number;
  source_reference?: string;
}

