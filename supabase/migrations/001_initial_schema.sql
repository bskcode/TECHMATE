-- ====================================================================
-- ADAPTIVELEARN AI — 001_initial_schema.sql
-- Complete Relational Database Schema (20 tables)
-- ====================================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. PROFILES
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL,
    full_name TEXT NOT NULL,
    role TEXT NOT NULL CHECK (role IN ('faculty', 'student')),
    avatar_url TEXT,
    institution TEXT DEFAULT 'Smart Institute of Higher Education',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. COURSES
CREATE TABLE IF NOT EXISTS public.courses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    instructor_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    code TEXT NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    enrollment_code TEXT UNIQUE NOT NULL,
    term TEXT DEFAULT 'Fall 2026',
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. ENROLLMENTS
CREATE TABLE IF NOT EXISTS public.enrollments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    course_id UUID NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
    student_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    status TEXT NOT NULL DEFAULT 'enrolled' CHECK (status IN ('enrolled', 'dropped')),
    enrolled_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(course_id, student_id)
);

-- 4. MODULES
CREATE TABLE IF NOT EXISTS public.modules (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    course_id UUID NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    order_index INT NOT NULL DEFAULT 1,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. COURSE OUTCOMES
CREATE TABLE IF NOT EXISTS public.course_outcomes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    course_id UUID NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
    code TEXT NOT NULL, -- e.g. CO1, CO2
    description TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. LEARNING MATERIALS (Grounding Documents)
CREATE TABLE IF NOT EXISTS public.learning_materials (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    course_id UUID NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
    module_id UUID REFERENCES public.modules(id) ON DELETE SET NULL,
    uploader_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    filename TEXT NOT NULL,
    storage_path TEXT NOT NULL,
    file_type TEXT NOT NULL CHECK (file_type IN ('pdf', 'docx', 'pptx')),
    file_size_bytes BIGINT NOT NULL DEFAULT 0,
    extracted_text TEXT,
    character_count INT DEFAULT 0,
    processing_status TEXT NOT NULL DEFAULT 'completed' CHECK (processing_status IN ('pending', 'processing', 'completed', 'failed')),
    approval_status TEXT NOT NULL DEFAULT 'pending' CHECK (approval_status IN ('pending', 'approved', 'rejected')),
    rejection_reason TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. ASSESSMENTS
CREATE TABLE IF NOT EXISTS public.assessments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    course_id UUID NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
    module_id UUID REFERENCES public.modules(id) ON DELETE SET NULL,
    title TEXT NOT NULL,
    description TEXT,
    assessment_type TEXT NOT NULL CHECK (assessment_type IN ('diagnostic', 'module', 'final')),
    status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'pending_approval', 'published', 'archived')),
    time_limit_minutes INT DEFAULT 45,
    max_marks NUMERIC(6, 2) NOT NULL DEFAULT 30,
    passing_marks NUMERIC(6, 2) NOT NULL DEFAULT 15,
    progressive_hints_enabled BOOLEAN DEFAULT TRUE,
    version INT NOT NULL DEFAULT 1,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    published_at TIMESTAMPTZ
);

-- 8. QUESTIONS
CREATE TABLE IF NOT EXISTS public.questions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    assessment_id UUID NOT NULL REFERENCES public.assessments(id) ON DELETE CASCADE,
    order_index INT NOT NULL DEFAULT 1,
    question_text TEXT NOT NULL,
    question_type TEXT NOT NULL CHECK (question_type IN ('mcq', 'multiple_select', 'true_false', 'numeric', 'fill_in_blank')),
    options JSONB, -- Array of string options for MCQ / Multi-select
    max_marks NUMERIC(5, 2) NOT NULL DEFAULT 5,
    primary_trait TEXT NOT NULL CHECK (primary_trait IN ('remembering', 'understanding', 'application', 'analysis', 'creativity', 'evaluation')),
    secondary_trait TEXT CHECK (secondary_trait IN ('remembering', 'understanding', 'application', 'analysis', 'creativity', 'evaluation')),
    secondary_trait_weight NUMERIC(3, 2) DEFAULT 0.0,
    course_outcome_ids UUID[] DEFAULT '{}',
    difficulty TEXT NOT NULL CHECK (difficulty IN ('easy', 'medium', 'hard')),
    approval_status TEXT NOT NULL DEFAULT 'generated' CHECK (approval_status IN ('draft', 'generated', 'approved', 'rejected')),
    grounding_material_ids UUID[] DEFAULT '{}',
    source_reference TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 9. QUESTION ANSWER KEYS (Isolated & Private from students)
CREATE TABLE IF NOT EXISTS public.question_answer_keys (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    question_id UUID NOT NULL UNIQUE REFERENCES public.questions(id) ON DELETE CASCADE,
    correct_answer TEXT NOT NULL,
    accepted_variations TEXT[] DEFAULT '{}',
    reference_answer TEXT,
    evaluation_method TEXT NOT NULL DEFAULT 'deterministic' CHECK (evaluation_method IN ('deterministic', 'hybrid')),
    numeric_tolerance NUMERIC(8, 4),
    case_sensitive BOOLEAN DEFAULT FALSE,
    explanation TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 10. QUESTION RUBRICS (For multi-criterion weighting)
CREATE TABLE IF NOT EXISTS public.question_rubrics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    question_id UUID NOT NULL REFERENCES public.questions(id) ON DELETE CASCADE,
    criteria_name TEXT NOT NULL,
    description TEXT NOT NULL,
    max_points NUMERIC(5, 2) NOT NULL,
    weight NUMERIC(3, 2) NOT NULL DEFAULT 1.0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 11. QUESTION HINTS (Progressive Hints: Exactly 2 hints per question)
CREATE TABLE IF NOT EXISTS public.question_hints (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    question_id UUID NOT NULL REFERENCES public.questions(id) ON DELETE CASCADE,
    hint_number INT NOT NULL CHECK (hint_number IN (1, 2)),
    hint_text TEXT NOT NULL,
    penalty_percentage NUMERIC(5, 2) DEFAULT 0.0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(question_id, hint_number)
);

-- 12. ATTEMPTS
CREATE TABLE IF NOT EXISTS public.attempts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    assessment_id UUID NOT NULL REFERENCES public.assessments(id) ON DELETE CASCADE,
    student_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    attempt_number INT NOT NULL DEFAULT 1,
    status TEXT NOT NULL DEFAULT 'in_progress' CHECK (status IN ('in_progress', 'submitted', 'evaluated')),
    started_at TIMESTAMPTZ DEFAULT NOW(),
    submitted_at TIMESTAMPTZ,
    total_score NUMERIC(6, 2) DEFAULT 0,
    max_score NUMERIC(6, 2) DEFAULT 0,
    percentage NUMERIC(5, 2) DEFAULT 0,
    is_final BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 13. RESPONSES (Up to 3 submissions per question per attempt)
CREATE TABLE IF NOT EXISTS public.responses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    attempt_id UUID NOT NULL REFERENCES public.attempts(id) ON DELETE CASCADE,
    question_id UUID NOT NULL REFERENCES public.questions(id) ON DELETE CASCADE,
    response_number INT NOT NULL CHECK (response_number IN (1, 2, 3)),
    student_answer TEXT NOT NULL,
    submitted_at TIMESTAMPTZ DEFAULT NOW(),
    awarded_marks NUMERIC(5, 2) DEFAULT 0,
    is_correct BOOLEAN DEFAULT FALSE,
    feedback TEXT,
    evaluation_method TEXT NOT NULL DEFAULT 'deterministic',
    confidence NUMERIC(3, 2) DEFAULT 1.0,
    UNIQUE(attempt_id, question_id, response_number)
);

-- 14. EVALUATIONS (Persisted evaluation audit log)
CREATE TABLE IF NOT EXISTS public.evaluations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    response_id UUID NOT NULL UNIQUE REFERENCES public.responses(id) ON DELETE CASCADE,
    attempt_id UUID NOT NULL REFERENCES public.attempts(id) ON DELETE CASCADE,
    question_id UUID NOT NULL REFERENCES public.questions(id) ON DELETE CASCADE,
    score NUMERIC(5, 2) NOT NULL,
    rubric_breakdown JSONB DEFAULT '{}',
    feedback TEXT,
    evaluator TEXT NOT NULL DEFAULT 'deterministic',
    evaluated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 15. HINT EVENTS (Tracking exactly when Hint 1 and Hint 2 were unlocked)
CREATE TABLE IF NOT EXISTS public.hint_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    attempt_id UUID NOT NULL REFERENCES public.attempts(id) ON DELETE CASCADE,
    question_id UUID NOT NULL REFERENCES public.questions(id) ON DELETE CASCADE,
    hint_number INT NOT NULL CHECK (hint_number IN (1, 2)),
    unlocked_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(attempt_id, question_id, hint_number)
);

-- 16. TRAIT SCORES (Cognitive trait scores per attempt)
CREATE TABLE IF NOT EXISTS public.trait_scores (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    attempt_id UUID NOT NULL REFERENCES public.attempts(id) ON DELETE CASCADE,
    student_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    course_id UUID NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
    assessment_id UUID NOT NULL REFERENCES public.assessments(id) ON DELETE CASCADE,
    trait TEXT NOT NULL CHECK (trait IN ('remembering', 'understanding', 'application', 'analysis', 'creativity', 'evaluation')),
    marks_earned NUMERIC(6, 2) NOT NULL DEFAULT 0,
    marks_possible NUMERIC(6, 2) NOT NULL DEFAULT 0,
    score_percentage NUMERIC(5, 2) NOT NULL DEFAULT 0,
    evidence_count INT NOT NULL DEFAULT 0,
    confidence TEXT NOT NULL DEFAULT 'moderate' CHECK (confidence IN ('high', 'moderate', 'low')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(attempt_id, trait)
);

-- 17. INTERVENTIONS (Remediation packages)
CREATE TABLE IF NOT EXISTS public.interventions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    course_id UUID NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
    diagnostic_attempt_id UUID REFERENCES public.attempts(id) ON DELETE SET NULL,
    weak_traits TEXT[] DEFAULT '{}',
    weak_outcomes TEXT[] DEFAULT '{}',
    status TEXT NOT NULL DEFAULT 'generated' CHECK (status IN ('generated', 'pending_approval', 'approved', 'rejected', 'released')),
    faculty_notes TEXT,
    approved_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    approved_at TIMESTAMPTZ,
    released_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 18. INTERVENTION MATERIALS (Grounded explanatory content)
CREATE TABLE IF NOT EXISTS public.intervention_materials (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    intervention_id UUID NOT NULL REFERENCES public.interventions(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    learning_gap_summary TEXT NOT NULL,
    explanation_markdown TEXT NOT NULL,
    worked_examples JSONB DEFAULT '[]',
    analogies JSONB DEFAULT '[]',
    revision_checklist TEXT[] DEFAULT '{}',
    recommended_next_steps TEXT[] DEFAULT '{}',
    grounding_material_ids UUID[] DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 19. PRACTICE QUESTIONS & ATTEMPTS
CREATE TABLE IF NOT EXISTS public.practice_questions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    intervention_id UUID NOT NULL REFERENCES public.interventions(id) ON DELETE CASCADE,
    order_index INT NOT NULL DEFAULT 1,
    question_text TEXT NOT NULL,
    options JSONB,
    correct_answer TEXT NOT NULL,
    explanation TEXT NOT NULL,
    trait TEXT NOT NULL CHECK (trait IN ('remembering', 'understanding', 'application', 'analysis', 'creativity', 'evaluation')),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.practice_attempts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    practice_question_id UUID NOT NULL REFERENCES public.practice_questions(id) ON DELETE CASCADE,
    student_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    student_answer TEXT NOT NULL,
    is_correct BOOLEAN NOT NULL DEFAULT FALSE,
    feedback TEXT,
    attempted_at TIMESTAMPTZ DEFAULT NOW()
);

-- 20. PROGRESS REPORTS (Baseline vs Final Assessment Trait Growth)
CREATE TABLE IF NOT EXISTS public.progress_reports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    course_id UUID NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
    baseline_assessment_id UUID NOT NULL REFERENCES public.assessments(id) ON DELETE CASCADE,
    final_assessment_id UUID NOT NULL REFERENCES public.assessments(id) ON DELETE CASCADE,
    baseline_score NUMERIC(5, 2) NOT NULL,
    final_score NUMERIC(5, 2) NOT NULL,
    score_improvement NUMERIC(5, 2) NOT NULL, -- final_score - baseline_score
    trait_improvements JSONB NOT NULL, -- { "remembering": +15.5, ... }
    evidence_counts JSONB NOT NULL,
    summary_narrative TEXT,
    generated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(student_id, course_id, final_assessment_id)
);

-- INDEXES FOR PERFORMANCE
CREATE INDEX IF NOT EXISTS idx_courses_instructor ON public.courses(instructor_id);
CREATE INDEX IF NOT EXISTS idx_enrollments_student ON public.enrollments(student_id);
CREATE INDEX IF NOT EXISTS idx_enrollments_course ON public.enrollments(course_id);
CREATE INDEX IF NOT EXISTS idx_materials_course ON public.learning_materials(course_id);
CREATE INDEX IF NOT EXISTS idx_assessments_course ON public.assessments(course_id);
CREATE INDEX IF NOT EXISTS idx_questions_assessment ON public.questions(assessment_id);
CREATE INDEX IF NOT EXISTS idx_attempts_student ON public.attempts(student_id);
CREATE INDEX IF NOT EXISTS idx_attempts_assessment ON public.attempts(assessment_id);
CREATE INDEX IF NOT EXISTS idx_responses_attempt ON public.responses(attempt_id);
CREATE INDEX IF NOT EXISTS idx_trait_scores_student ON public.trait_scores(student_id);
CREATE INDEX IF NOT EXISTS idx_trait_scores_course ON public.trait_scores(course_id);
CREATE INDEX IF NOT EXISTS idx_interventions_student ON public.interventions(student_id);
CREATE INDEX IF NOT EXISTS idx_interventions_course ON public.interventions(course_id);

