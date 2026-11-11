-- ====================================================================
-- ADAPTIVELEARN AI — 002_rls_policies.sql
-- Comprehensive Row Level Security (RLS) Policies
-- Strict isolation between Faculty and Students
-- Zero student access to answer keys, rubrics, and locked hints
-- ====================================================================

-- 1. ENABLE RLS ON ALL TABLES
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.enrollments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.modules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.course_outcomes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.learning_materials ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assessments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.question_answer_keys ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.question_rubrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.question_hints ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.responses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.evaluations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hint_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.trait_scores ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.interventions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.intervention_materials ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.practice_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.practice_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.progress_reports ENABLE ROW LEVEL SECURITY;

-- HELPER FUNCTIONS FOR ROLE CHECKS
CREATE OR REPLACE FUNCTION public.is_faculty()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'faculty'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION public.is_student()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'student'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- --------------------------------------------------------------------
-- 1. PROFILES POLICIES
-- --------------------------------------------------------------------
CREATE POLICY "Public profiles are viewable by authenticated users"
ON public.profiles FOR SELECT TO authenticated USING (true);

CREATE POLICY "Users can update their own profile"
ON public.profiles FOR UPDATE TO authenticated USING (id = auth.uid());

CREATE POLICY "Users can insert their own profile"
ON public.profiles FOR INSERT TO authenticated WITH CHECK (id = auth.uid());

-- --------------------------------------------------------------------
-- 2. COURSES POLICIES
-- --------------------------------------------------------------------
CREATE POLICY "Faculty can manage their own courses"
ON public.courses FOR ALL TO authenticated
USING (instructor_id = auth.uid());

CREATE POLICY "Students can view active courses"
ON public.courses FOR SELECT TO authenticated
USING (is_active = true);

-- --------------------------------------------------------------------
-- 3. ENROLLMENTS POLICIES
-- --------------------------------------------------------------------
CREATE POLICY "Faculty can view enrollments in their courses"
ON public.enrollments FOR SELECT TO authenticated
USING (EXISTS (SELECT 1 FROM public.courses WHERE id = enrollments.course_id AND instructor_id = auth.uid()));

CREATE POLICY "Students can view own enrollments"
ON public.enrollments FOR SELECT TO authenticated
USING (student_id = auth.uid());

CREATE POLICY "Students can enroll in courses"
ON public.enrollments FOR INSERT TO authenticated
WITH CHECK (student_id = auth.uid());

-- --------------------------------------------------------------------
-- 4. MODULES & COURSE OUTCOMES POLICIES
-- --------------------------------------------------------------------
CREATE POLICY "Faculty can manage modules in own courses"
ON public.modules FOR ALL TO authenticated
USING (EXISTS (SELECT 1 FROM public.courses WHERE id = modules.course_id AND instructor_id = auth.uid()));

CREATE POLICY "Students can view modules of enrolled courses"
ON public.modules FOR SELECT TO authenticated
USING (EXISTS (SELECT 1 FROM public.enrollments WHERE course_id = modules.course_id AND student_id = auth.uid()));

CREATE POLICY "Faculty can manage outcomes in own courses"
ON public.course_outcomes FOR ALL TO authenticated
USING (EXISTS (SELECT 1 FROM public.courses WHERE id = course_outcomes.course_id AND instructor_id = auth.uid()));

CREATE POLICY "Students can view outcomes of enrolled courses"
ON public.course_outcomes FOR SELECT TO authenticated
USING (EXISTS (SELECT 1 FROM public.enrollments WHERE course_id = course_outcomes.course_id AND student_id = auth.uid()));

-- --------------------------------------------------------------------
-- 5. LEARNING MATERIALS POLICIES
-- --------------------------------------------------------------------
CREATE POLICY "Faculty can manage materials in own courses"
ON public.learning_materials FOR ALL TO authenticated
USING (EXISTS (SELECT 1 FROM public.courses WHERE id = learning_materials.course_id AND instructor_id = auth.uid()));

CREATE POLICY "Students can view approved materials in enrolled courses"
ON public.learning_materials FOR SELECT TO authenticated
USING (
  approval_status = 'approved' AND
  EXISTS (SELECT 1 FROM public.enrollments WHERE course_id = learning_materials.course_id AND student_id = auth.uid())
);

-- --------------------------------------------------------------------
-- 6. ASSESSMENTS POLICIES
-- --------------------------------------------------------------------
CREATE POLICY "Faculty can manage assessments in own courses"
ON public.assessments FOR ALL TO authenticated
USING (EXISTS (SELECT 1 FROM public.courses WHERE id = assessments.course_id AND instructor_id = auth.uid()));

CREATE POLICY "Students can view published assessments in enrolled courses"
ON public.assessments FOR SELECT TO authenticated
USING (
  status = 'published' AND
  EXISTS (SELECT 1 FROM public.enrollments WHERE course_id = assessments.course_id AND student_id = auth.uid())
);

-- --------------------------------------------------------------------
-- 7. QUESTIONS POLICIES
-- --------------------------------------------------------------------
CREATE POLICY "Faculty can manage questions in own courses"
ON public.questions FOR ALL TO authenticated
USING (EXISTS (
  SELECT 1 FROM public.assessments a
  JOIN public.courses c ON a.course_id = c.id
  WHERE a.id = questions.assessment_id AND c.instructor_id = auth.uid()
));

CREATE POLICY "Students can view questions for published assessments"
ON public.questions FOR SELECT TO authenticated
USING (EXISTS (
  SELECT 1 FROM public.assessments a
  JOIN public.enrollments e ON a.course_id = e.course_id
  WHERE a.id = questions.assessment_id AND a.status = 'published' AND e.student_id = auth.uid()
));

-- --------------------------------------------------------------------
-- 8. QUESTION ANSWER KEYS (FACULTY ONLY — STRICT DENY TO STUDENTS)
-- --------------------------------------------------------------------
CREATE POLICY "Faculty can manage answer keys for own courses"
ON public.question_answer_keys FOR ALL TO authenticated
USING (EXISTS (
  SELECT 1 FROM public.questions q
  JOIN public.assessments a ON q.assessment_id = a.id
  JOIN public.courses c ON a.course_id = c.id
  WHERE q.id = question_answer_keys.question_id AND c.instructor_id = auth.uid()
));
-- NO STUDENT SELECT POLICY! Students cannot query question_answer_keys under any circumstances.

-- --------------------------------------------------------------------
-- 9. QUESTION RUBRICS (FACULTY ONLY — STRICT DENY TO STUDENTS)
-- --------------------------------------------------------------------
CREATE POLICY "Faculty can manage rubrics for own courses"
ON public.question_rubrics FOR ALL TO authenticated
USING (EXISTS (
  SELECT 1 FROM public.questions q
  JOIN public.assessments a ON q.assessment_id = a.id
  JOIN public.courses c ON a.course_id = c.id
  WHERE q.id = question_rubrics.question_id AND c.instructor_id = auth.uid()
));
-- NO STUDENT SELECT POLICY!

-- --------------------------------------------------------------------
-- 10. QUESTION HINTS (FACULTY ONLY — SERVED VIA SECURE SERVER API)
-- --------------------------------------------------------------------
CREATE POLICY "Faculty can manage hints for own courses"
ON public.question_hints FOR ALL TO authenticated
USING (EXISTS (
  SELECT 1 FROM public.questions q
  JOIN public.assessments a ON q.assessment_id = a.id
  JOIN public.courses c ON a.course_id = c.id
  WHERE q.id = question_hints.question_id AND c.instructor_id = auth.uid()
));
-- NO STUDENT SELECT POLICY! Students never directly read question_hints.

-- --------------------------------------------------------------------
-- 11. ATTEMPTS POLICIES
-- --------------------------------------------------------------------
CREATE POLICY "Faculty can view attempts in own courses"
ON public.attempts FOR SELECT TO authenticated
USING (EXISTS (
  SELECT 1 FROM public.assessments a
  JOIN public.courses c ON a.course_id = c.id
  WHERE a.id = attempts.assessment_id AND c.instructor_id = auth.uid()
));

CREATE POLICY "Students can manage own attempts"
ON public.attempts FOR ALL TO authenticated
USING (student_id = auth.uid());

-- --------------------------------------------------------------------
-- 12. RESPONSES POLICIES
-- --------------------------------------------------------------------
CREATE POLICY "Faculty can view responses in own courses"
ON public.responses FOR SELECT TO authenticated
USING (EXISTS (
  SELECT 1 FROM public.attempts att
  JOIN public.assessments a ON att.assessment_id = a.id
  JOIN public.courses c ON a.course_id = c.id
  WHERE att.id = responses.attempt_id AND c.instructor_id = auth.uid()
));

CREATE POLICY "Students can insert and view own responses"
ON public.responses FOR ALL TO authenticated
USING (EXISTS (
  SELECT 1 FROM public.attempts att
  WHERE att.id = responses.attempt_id AND att.student_id = auth.uid()
));

-- --------------------------------------------------------------------
-- 13. EVALUATIONS POLICIES
-- --------------------------------------------------------------------
CREATE POLICY "Faculty can view all evaluations in own courses"
ON public.evaluations FOR SELECT TO authenticated
USING (EXISTS (
  SELECT 1 FROM public.attempts att
  JOIN public.assessments a ON att.assessment_id = a.id
  JOIN public.courses c ON a.course_id = c.id
  WHERE att.id = evaluations.attempt_id AND c.instructor_id = auth.uid()
));

CREATE POLICY "Students can view evaluations for own attempts"
ON public.evaluations FOR SELECT TO authenticated
USING (EXISTS (
  SELECT 1 FROM public.attempts att
  WHERE att.id = evaluations.attempt_id AND att.student_id = auth.uid()
));

-- --------------------------------------------------------------------
-- 14. HINT EVENTS POLICIES
-- --------------------------------------------------------------------
CREATE POLICY "Faculty can view hint events in own courses"
ON public.hint_events FOR SELECT TO authenticated
USING (EXISTS (
  SELECT 1 FROM public.attempts att
  JOIN public.assessments a ON att.assessment_id = a.id
  JOIN public.courses c ON a.course_id = c.id
  WHERE att.id = hint_events.attempt_id AND c.instructor_id = auth.uid()
));

CREATE POLICY "Students can view own hint events"
ON public.hint_events FOR SELECT TO authenticated
USING (EXISTS (
  SELECT 1 FROM public.attempts att
  WHERE att.id = hint_events.attempt_id AND att.student_id = auth.uid()
));

-- --------------------------------------------------------------------
-- 15. TRAIT SCORES POLICIES
-- --------------------------------------------------------------------
CREATE POLICY "Faculty can view trait scores in own courses"
ON public.trait_scores FOR SELECT TO authenticated
USING (EXISTS (
  SELECT 1 FROM public.courses c
  WHERE c.id = trait_scores.course_id AND c.instructor_id = auth.uid()
));

CREATE POLICY "Students can view own trait scores"
ON public.trait_scores FOR SELECT TO authenticated
USING (student_id = auth.uid());

-- --------------------------------------------------------------------
-- 16. INTERVENTIONS POLICIES
-- --------------------------------------------------------------------
CREATE POLICY "Faculty can manage interventions in own courses"
ON public.interventions FOR ALL TO authenticated
USING (EXISTS (
  SELECT 1 FROM public.courses c
  WHERE c.id = interventions.course_id AND c.instructor_id = auth.uid()
));

CREATE POLICY "Students can view released interventions assigned to them"
ON public.interventions FOR SELECT TO authenticated
USING (status = 'released' AND student_id = auth.uid());

-- --------------------------------------------------------------------
-- 17. INTERVENTION MATERIALS & PRACTICE QUESTIONS POLICIES
-- --------------------------------------------------------------------
CREATE POLICY "Faculty can manage intervention materials in own courses"
ON public.intervention_materials FOR ALL TO authenticated
USING (EXISTS (
  SELECT 1 FROM public.interventions i
  JOIN public.courses c ON i.course_id = c.id
  WHERE i.id = intervention_materials.intervention_id AND c.instructor_id = auth.uid()
));

CREATE POLICY "Students can view materials of released interventions"
ON public.intervention_materials FOR SELECT TO authenticated
USING (EXISTS (
  SELECT 1 FROM public.interventions i
  WHERE i.id = intervention_materials.intervention_id AND i.status = 'released' AND i.student_id = auth.uid()
));

CREATE POLICY "Faculty can manage practice questions in own courses"
ON public.practice_questions FOR ALL TO authenticated
USING (EXISTS (
  SELECT 1 FROM public.interventions i
  JOIN public.courses c ON i.course_id = c.id
  WHERE i.id = practice_questions.intervention_id AND c.instructor_id = auth.uid()
));

CREATE POLICY "Students can view practice questions of released interventions"
ON public.practice_questions FOR SELECT TO authenticated
USING (EXISTS (
  SELECT 1 FROM public.interventions i
  WHERE i.id = practice_questions.intervention_id AND i.status = 'released' AND i.student_id = auth.uid()
));

CREATE POLICY "Students can manage own practice attempts"
ON public.practice_attempts FOR ALL TO authenticated
USING (student_id = auth.uid());

CREATE POLICY "Faculty can view practice attempts in own courses"
ON public.practice_attempts FOR SELECT TO authenticated
USING (EXISTS (
  SELECT 1 FROM public.practice_questions pq
  JOIN public.interventions i ON pq.intervention_id = i.id
  JOIN public.courses c ON i.course_id = c.id
  WHERE pq.id = practice_attempts.practice_question_id AND c.instructor_id = auth.uid()
));

-- --------------------------------------------------------------------
-- 18. PROGRESS REPORTS POLICIES
-- --------------------------------------------------------------------
CREATE POLICY "Faculty can view progress reports in own courses"
ON public.progress_reports FOR SELECT TO authenticated
USING (EXISTS (
  SELECT 1 FROM public.courses c
  WHERE c.id = progress_reports.course_id AND c.instructor_id = auth.uid()
));

CREATE POLICY "Students can view own progress reports"
ON public.progress_reports FOR SELECT TO authenticated
USING (student_id = auth.uid());
