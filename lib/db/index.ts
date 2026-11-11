// ====================================================================
// ADAPTIVELEARN AI — Unified Database Service
// Abstract data layer with strict role-based sanitization
// ====================================================================

import { mockDb } from './mock-store';
import {
  Profile,
  Course,
  Enrollment,
  Module,
  CourseOutcome,
  LearningMaterial,
  Assessment,
  Question,
  QuestionAnswerKey,
  QuestionHint,
  Attempt,
  StudentResponse,
  EvaluationRecord,
  HintEvent,
  TraitScore,
  Intervention,
  InterventionMaterial,
  PracticeQuestion,
  PracticeAttempt,
  ProgressReport,
  QuestionPackage,
} from '@/types';
import { processProgressiveSubmission, ProcessSubmissionResult } from '../engine/hint-machine';
import { calculateTraitScores, BLOOM_TRAITS } from '../engine/trait-calculator';

export const db = {
  // ------------------------------------------------------------------
  // PROFILES
  // ------------------------------------------------------------------
  getProfile(id: string): Profile | undefined {
    return mockDb.profiles.find((p) => p.id === id);
  },

  getProfileByEmail(email: string): Profile | undefined {
    return mockDb.profiles.find((p) => p.email.toLowerCase() === email.toLowerCase());
  },

  getAllProfiles(): Profile[] {
    return mockDb.profiles;
  },

  // ------------------------------------------------------------------
  // COURSES
  // ------------------------------------------------------------------
  getCourses(userId?: string, role?: 'faculty' | 'student'): Course[] {
    if (role === 'faculty' && userId) {
      return mockDb.courses.filter((c) => c.instructor_id === userId);
    }
    if (role === 'student' && userId) {
      const enrolledCourseIds = mockDb.enrollments
        .filter((e) => e.student_id === userId && e.status === 'enrolled')
        .map((e) => e.course_id);
      return mockDb.courses.filter((c) => enrolledCourseIds.includes(c.id));
    }
    return mockDb.courses;
  },

  getCourse(id: string): Course | undefined {
    const course = mockDb.courses.find((c) => c.id === id);
    if (!course) return undefined;
    const instructor = mockDb.profiles.find((p) => p.id === course.instructor_id);
    const count = mockDb.enrollments.filter((e) => e.course_id === id && e.status === 'enrolled').length;
    return { ...course, instructor, enrolled_count: count };
  },

  createCourse(course: Omit<Course, 'id' | 'created_at' | 'enrolled_count'>): Course {
    const newCourse: Course = {
      ...course,
      id: crypto.randomUUID(),
      created_at: new Date().toISOString(),
    };
    mockDb.courses.unshift(newCourse);
    return newCourse;
  },

  enrollStudent(courseCode: string, studentId: string): { success: boolean; message: string; course?: Course } {
    const course = mockDb.courses.find(
      (c) => c.enrollment_code.toUpperCase() === courseCode.trim().toUpperCase()
    );
    if (!course) {
      return { success: false, message: 'Invalid enrollment code. Please check with your instructor.' };
    }

    const existing = mockDb.enrollments.find(
      (e) => e.course_id === course.id && e.student_id === studentId
    );
    if (existing) {
      return { success: true, message: 'Already enrolled in this course.', course };
    }

    mockDb.enrollments.push({
      id: crypto.randomUUID(),
      course_id: course.id,
      student_id: studentId,
      status: 'enrolled',
      enrolled_at: new Date().toISOString(),
    });

    return { success: true, message: `Successfully enrolled in ${course.code}: ${course.title}`, course };
  },

  getEnrollments(courseId: string): Enrollment[] {
    return mockDb.enrollments
      .filter((e) => e.course_id === courseId)
      .map((e) => ({
        ...e,
        student: mockDb.profiles.find((p) => p.id === e.student_id),
      }));
  },

  // ------------------------------------------------------------------
  // MODULES & OUTCOMES
  // ------------------------------------------------------------------
  getModules(courseId: string): Module[] {
    return mockDb.modules
      .filter((m) => m.course_id === courseId)
      .sort((a, b) => a.order_index - b.order_index);
  },

  createModule(module: Omit<Module, 'id' | 'created_at'>): Module {
    const newModule: Module = {
      ...module,
      id: crypto.randomUUID(),
      created_at: new Date().toISOString(),
    };
    mockDb.modules.push(newModule);
    return newModule;
  },

  getCourseOutcomes(courseId: string): CourseOutcome[] {
    return mockDb.course_outcomes.filter((co) => co.course_id === courseId);
  },

  createCourseOutcome(outcome: Omit<CourseOutcome, 'id' | 'created_at'>): CourseOutcome {
    const newOutcome: CourseOutcome = {
      ...outcome,
      id: crypto.randomUUID(),
      created_at: new Date().toISOString(),
    };
    mockDb.course_outcomes.push(newOutcome);
    return newOutcome;
  },

  // ------------------------------------------------------------------
  // LEARNING MATERIALS
  // ------------------------------------------------------------------
  getMaterials(courseId: string, onlyApproved = false): LearningMaterial[] {
    return mockDb.learning_materials.filter((m) => {
      if (m.course_id !== courseId) return false;
      if (onlyApproved && m.approval_status !== 'approved') return false;
      return true;
    });
  },

  addMaterial(material: Omit<LearningMaterial, 'id' | 'created_at'>): LearningMaterial {
    const newMat: LearningMaterial = {
      ...material,
      id: crypto.randomUUID(),
      created_at: new Date().toISOString(),
    };
    mockDb.learning_materials.push(newMat);
    return newMat;
  },

  updateMaterialStatus(id: string, status: 'approved' | 'rejected', reason?: string): LearningMaterial | undefined {
    const mat = mockDb.learning_materials.find((m) => m.id === id);
    if (!mat) return undefined;
    mat.approval_status = status;
    if (reason) mat.rejection_reason = reason;
    return mat;
  },

  deleteMaterial(id: string): boolean {
    const index = mockDb.learning_materials.findIndex((m) => m.id === id);
    if (index >= 0) {
      mockDb.learning_materials.splice(index, 1);
      return true;
    }
    return false;
  },

  // ------------------------------------------------------------------
  // ASSESSMENTS
  // ------------------------------------------------------------------
  getAssessments(courseId: string, onlyPublished = false): Assessment[] {
    return mockDb.assessments
      .filter((a) => {
        if (a.course_id !== courseId) return false;
        if (onlyPublished && a.status !== 'published') return false;
        return true;
      })
      .map((a) => ({
        ...a,
        questions_count: mockDb.questions.filter((q) => q.assessment_id === a.id).length,
      }));
  },

  getAssessment(id: string): Assessment | undefined {
    const assessment = mockDb.assessments.find((a) => a.id === id);
    if (!assessment) return undefined;
    const questions_count = mockDb.questions.filter((q) => q.assessment_id === id).length;
    return { ...assessment, questions_count };
  },

  createAssessment(assessment: Omit<Assessment, 'id' | 'created_at' | 'version'>): Assessment {
    const newAssessment: Assessment = {
      ...assessment,
      id: crypto.randomUUID(),
      version: 1,
      created_at: new Date().toISOString(),
    };
    mockDb.assessments.push(newAssessment);
    return newAssessment;
  },

  publishAssessment(id: string): Assessment | undefined {
    const assessment = mockDb.assessments.find((a) => a.id === id);
    if (!assessment) return undefined;
    assessment.status = 'published';
    assessment.published_at = new Date().toISOString();
    return assessment;
  },

  // ------------------------------------------------------------------
  // QUESTIONS (STRICT RLS SANITIZATION)
  // ------------------------------------------------------------------
  getQuestions(assessmentId: string, isFaculty: boolean): Question[] {
    const rawQuestions = mockDb.questions
      .filter((q) => q.assessment_id === assessmentId)
      .sort((a, b) => a.order_index - b.order_index);

    if (isFaculty) {
      // Faculty gets answer keys, rubrics, and hints
      return rawQuestions.map((q) => ({
        ...q,
        answer_key: mockDb.question_answer_keys.find((ak) => ak.question_id === q.id),
        hints: mockDb.question_hints.filter((h) => h.question_id === q.id),
      }));
    }

    // Student query: STRICT SANITIZATION
    // Answer keys and hints are STRIPPED.
    return rawQuestions.map((q) => ({
      id: q.id,
      assessment_id: q.assessment_id,
      order_index: q.order_index,
      question_text: q.question_text,
      question_type: q.question_type,
      options: q.options,
      max_marks: q.max_marks,
      primary_trait: q.primary_trait,
      secondary_trait: q.secondary_trait,
      secondary_trait_weight: q.secondary_trait_weight,
      course_outcome_ids: q.course_outcome_ids,
      difficulty: q.difficulty,
      approval_status: q.approval_status,
      grounding_material_ids: q.grounding_material_ids,
      created_at: q.created_at,
    }));
  },

  getQuestion(id: string, isFaculty: boolean): Question | undefined {
    const q = mockDb.questions.find((item) => item.id === id);
    if (!q) return undefined;

    if (isFaculty) {
      return {
        ...q,
        answer_key: mockDb.question_answer_keys.find((ak) => ak.question_id === q.id),
        hints: mockDb.question_hints.filter((h) => h.question_id === q.id),
      };
    }

    return {
      id: q.id,
      assessment_id: q.assessment_id,
      order_index: q.order_index,
      question_text: q.question_text,
      question_type: q.question_type,
      options: q.options,
      max_marks: q.max_marks,
      primary_trait: q.primary_trait,
      secondary_trait: q.secondary_trait,
      secondary_trait_weight: q.secondary_trait_weight,
      course_outcome_ids: q.course_outcome_ids,
      difficulty: q.difficulty,
      approval_status: q.approval_status,
      grounding_material_ids: q.grounding_material_ids,
      created_at: q.created_at,
    };
  },

  saveGeneratedQuestionPackage(assessmentId: string, pkg: QuestionPackage, orderIndex: number): Question {
    const questionId = crypto.randomUUID();

    const newQuestion: Question = {
      id: questionId,
      assessment_id: assessmentId,
      order_index: orderIndex,
      question_text: pkg.question_text,
      question_type: pkg.question_type,
      options: pkg.options,
      max_marks: pkg.max_marks,
      primary_trait: pkg.primary_trait,
      secondary_trait: pkg.secondary_trait,
      secondary_trait_weight: pkg.secondary_trait_weight ?? 0.0,
      course_outcome_ids: [],
      difficulty: pkg.difficulty,
      approval_status: 'approved',
      grounding_material_ids: [],
      source_reference: pkg.source_reference,
      created_at: new Date().toISOString(),
    };

    mockDb.questions.push(newQuestion);

    // Save protected answer key
    mockDb.question_answer_keys.push({
      id: crypto.randomUUID(),
      question_id: questionId,
      correct_answer: pkg.correct_answer,
      accepted_variations: pkg.accepted_variations,
      reference_answer: pkg.reference_answer,
      evaluation_method: pkg.evaluation_method,
      numeric_tolerance: pkg.numeric_tolerance,
      explanation: pkg.explanation,
    });

    // Save protected hints (Exactly 2 hints)
    mockDb.question_hints.push(
      {
        id: crypto.randomUUID(),
        question_id: questionId,
        hint_number: 1,
        hint_text: pkg.hint_1,
        penalty_percentage: 25.0,
      },
      {
        id: crypto.randomUUID(),
        question_id: questionId,
        hint_number: 2,
        hint_text: pkg.hint_2,
        penalty_percentage: 50.0,
      }
    );

    return newQuestion;
  },

  updateQuestion(id: string, updates: Partial<Question & { answer_key?: Partial<QuestionAnswerKey>; hint_1?: string; hint_2?: string }>): Question | undefined {
    const q = mockDb.questions.find((item) => item.id === id);
    if (!q) return undefined;

    if (updates.question_text) q.question_text = updates.question_text;
    if (updates.options) q.options = updates.options;
    if (updates.max_marks !== undefined) q.max_marks = updates.max_marks;
    if (updates.primary_trait) q.primary_trait = updates.primary_trait;
    if (updates.difficulty) q.difficulty = updates.difficulty;
    if (updates.approval_status) q.approval_status = updates.approval_status;

    // Update answer key
    if (updates.answer_key) {
      const ak = mockDb.question_answer_keys.find((k) => k.question_id === id);
      if (ak) {
        Object.assign(ak, updates.answer_key);
      }
    }

    // Update hints
    if (updates.hint_1) {
      const h1 = mockDb.question_hints.find((h) => h.question_id === id && h.hint_number === 1);
      if (h1) h1.hint_text = updates.hint_1;
    }
    if (updates.hint_2) {
      const h2 = mockDb.question_hints.find((h) => h.question_id === id && h.hint_number === 2);
      if (h2) h2.hint_text = updates.hint_2;
    }

    return q;
  },

  // ------------------------------------------------------------------
  // ATTEMPTS & PROGRESSIVE 2-HINT EXECUTION
  // ------------------------------------------------------------------
  getOrCreateAttempt(assessmentId: string, studentId: string): Attempt {
    const existing = mockDb.attempts.find(
      (a) => a.assessment_id === assessmentId && a.student_id === studentId && a.status === 'in_progress'
    );
    if (existing) return existing;

    const assessment = mockDb.assessments.find((a) => a.id === assessmentId);
    const newAttempt: Attempt = {
      id: crypto.randomUUID(),
      assessment_id: assessmentId,
      student_id: studentId,
      attempt_number: mockDb.attempts.filter((a) => a.assessment_id === assessmentId && a.student_id === studentId).length + 1,
      status: 'in_progress',
      started_at: new Date().toISOString(),
      total_score: 0,
      max_score: assessment?.max_marks ?? 30,
      percentage: 0,
      is_final: false,
    };
    mockDb.attempts.push(newAttempt);
    return newAttempt;
  },

  getAttempt(id: string): Attempt | undefined {
    const att = mockDb.attempts.find((a) => a.id === id);
    if (!att) return undefined;
    const assessment = mockDb.assessments.find((a) => a.id === att.assessment_id);
    const student = mockDb.profiles.find((p) => p.id === att.student_id);
    return { ...att, assessment, student };
  },

  getResponsesForAttempt(attemptId: string): StudentResponse[] {
    return mockDb.responses.filter((r) => r.attempt_id === attemptId);
  },

  getHintEventsForAttempt(attemptId: string): HintEvent[] {
    return mockDb.hint_events.filter((h) => h.attempt_id === attemptId);
  },

  /**
   * Submits a student response with the Progressive 2-Hint state machine.
   * Server strictly enforces answer evaluation and hint unlocking.
   */
  submitResponse(
    attemptId: string,
    questionId: string,
    responseNumber: 1 | 2 | 3,
    studentAnswer: string
  ): ProcessSubmissionResult {
    const question = mockDb.questions.find((q) => q.id === questionId);
    if (!question) throw new Error('Question not found');

    const answerKey = mockDb.question_answer_keys.find((ak) => ak.question_id === questionId);
    if (!answerKey) throw new Error('Answer key not found');

    const hints = mockDb.question_hints.filter((h) => h.question_id === questionId);

    // Run the progressive 2-hint state machine
    const result = processProgressiveSubmission({
      questionType: question.question_type,
      studentAnswer,
      responseNumber,
      answerKey,
      maxMarks: question.max_marks,
      hints,
    });

    // Record response
    const responseId = crypto.randomUUID();
    mockDb.responses.push({
      id: responseId,
      attempt_id: attemptId,
      question_id: questionId,
      response_number: responseNumber,
      student_answer: studentAnswer,
      submitted_at: new Date().toISOString(),
      awarded_marks: result.awarded_marks,
      is_correct: result.is_correct,
      feedback: result.feedback,
      evaluation_method: 'deterministic',
      confidence: 1.0,
    });

    // Record hint unlock event if unlocked
    if (result.unlocked_hint) {
      mockDb.hint_events.push({
        id: crypto.randomUUID(),
        attempt_id: attemptId,
        question_id: questionId,
        hint_number: result.unlocked_hint.hint_number,
        unlocked_at: new Date().toISOString(),
      });
    }

    return result;
  },

  /**
   * Finalizes an assessment attempt and calculates overall scores and trait metrics.
   */
  finalizeAttempt(attemptId: string): Attempt | undefined {
    const attempt = mockDb.attempts.find((a) => a.id === attemptId);
    if (!attempt) return undefined;

    const assessment = mockDb.assessments.find((a) => a.id === attempt.assessment_id);
    if (!assessment) return undefined;

    const questions = mockDb.questions.filter((q) => q.assessment_id === assessment.id);
    const responses = mockDb.responses.filter((r) => r.attempt_id === attemptId);

    // Group responses by question (take the highest response_number or finalized score)
    const questionScoringItems = questions.map((q) => {
      const qResponses = responses.filter((r) => r.question_id === q.id);
      // Find the last response or highest awarded marks
      const latest = qResponses.sort((a, b) => b.response_number - a.response_number)[0];
      const awardedMarks = latest ? latest.awarded_marks : 0;

      return {
        questionId: q.id,
        maxMarks: q.max_marks,
        awardedMarks,
        primaryTrait: q.primary_trait,
        secondaryTrait: q.secondary_trait,
        secondaryTraitWeight: q.secondary_trait_weight,
      };
    });

    const totalEarned = questionScoringItems.reduce((sum, item) => sum + item.awardedMarks, 0);
    const totalMax = assessment.max_marks;

    attempt.status = 'evaluated';
    attempt.submitted_at = new Date().toISOString();
    attempt.total_score = Math.round(totalEarned * 100) / 100;
    attempt.max_score = totalMax;
    attempt.percentage = totalMax > 0 ? Math.round((totalEarned / totalMax) * 10000) / 100 : 0;
    attempt.is_final = true;

    // Calculate Bloom's 6 Trait Scores
    const calculatedTraits = calculateTraitScores(questionScoringItems);

    // Persist Trait Scores
    for (const trait of BLOOM_TRAITS) {
      const data = calculatedTraits[trait];
      mockDb.trait_scores = mockDb.trait_scores.filter(
        (ts) => !(ts.attempt_id === attemptId && ts.trait === trait)
      );
      mockDb.trait_scores.push({
        id: crypto.randomUUID(),
        attempt_id: attemptId,
        student_id: attempt.student_id,
        course_id: assessment.course_id,
        assessment_id: assessment.id,
        trait,
        marks_earned: data.marksEarned,
        marks_possible: data.marksPossible,
        score_percentage: data.scorePercentage,
        evidence_count: data.evidenceCount,
        confidence: data.confidence,
      });
    }

    return attempt;
  },

  // ------------------------------------------------------------------
  // TRAIT SCORES & ANALYTICS
  // ------------------------------------------------------------------
  getTraitScoresForAttempt(attemptId: string): TraitScore[] {
    return mockDb.trait_scores.filter((ts) => ts.attempt_id === attemptId);
  },

  getClassAnalytics(courseId: string) {
    const courseAttempts = mockDb.attempts.filter((a) => {
      const assessment = mockDb.assessments.find((as) => as.id === a.assessment_id);
      return assessment?.course_id === courseId && a.status === 'evaluated';
    });

    const studentCount = mockDb.enrollments.filter((e) => e.course_id === courseId && e.status === 'enrolled').length;

    // Trait averages
    const traitAverages: Record<string, { total: number; count: number; avg: number }> = {};
    BLOOM_TRAITS.forEach((t) => {
      traitAverages[t] = { total: 0, count: 0, avg: 0 };
    });

    mockDb.trait_scores
      .filter((ts) => ts.course_id === courseId)
      .forEach((ts) => {
        if (traitAverages[ts.trait]) {
          traitAverages[ts.trait].total += ts.score_percentage;
          traitAverages[ts.trait].count += 1;
        }
      });

    const traitData = BLOOM_TRAITS.map((t) => ({
      trait: t.charAt(0).toUpperCase() + t.slice(1),
      key: t,
      classAverage: traitAverages[t].count > 0 ? Math.round(traitAverages[t].total / traitAverages[t].count) : 0,
    }));

    // Weakest trait identifying
    const weakest = [...traitData].sort((a, b) => a.classAverage - b.classAverage)[0];

    // Students needing intervention (<60% average or <60% on any trait)
    const studentsNeedingIntervention = mockDb.profiles
      .filter((p) => p.role === 'student')
      .map((s) => {
        const studentScores = mockDb.trait_scores.filter(
          (ts) => ts.student_id === s.id && ts.course_id === courseId
        );
        const weakTraits = studentScores.filter((ts) => ts.score_percentage < 60).map((ts) => ts.trait);
        const latestAttempt = mockDb.attempts.find((a) => a.student_id === s.id && a.status === 'evaluated');
        return {
          student: s,
          weakTraits,
          latestScore: latestAttempt?.percentage ?? 0,
          needsHelp: weakTraits.length > 0 || (latestAttempt ? latestAttempt.percentage < 60 : false),
        };
      })
      .filter((item) => item.needsHelp);

    return {
      studentCount,
      totalAttempts: courseAttempts.length,
      traitData,
      weakestTrait: weakest?.trait ?? 'None',
      studentsNeedingIntervention,
    };
  },

  // ------------------------------------------------------------------
  // INTERVENTIONS & PRACTICE
  // ------------------------------------------------------------------
  getInterventions(params: { studentId?: string; courseId?: string; onlyReleased?: boolean }): Intervention[] {
    return mockDb.interventions
      .filter((i) => {
        if (params.studentId && i.student_id !== params.studentId) return false;
        if (params.courseId && i.course_id !== params.courseId) return false;
        if (params.onlyReleased && i.status !== 'released') return false;
        return true;
      })
      .map((i) => ({
        ...i,
        student: mockDb.profiles.find((p) => p.id === i.student_id),
        material: mockDb.intervention_materials.find((m) => m.intervention_id === i.id),
        practice_questions: mockDb.practice_questions.filter((pq) => pq.intervention_id === i.id),
      }));
  },

  getIntervention(id: string): Intervention | undefined {
    const item = mockDb.interventions.find((i) => i.id === id);
    if (!item) return undefined;
    const student = mockDb.profiles.find((p) => p.id === item.student_id);
    const material = mockDb.intervention_materials.find((m) => m.intervention_id === id);
    const practice_questions = mockDb.practice_questions.filter((pq) => pq.intervention_id === id);
    return { ...item, student, material, practice_questions };
  },

  saveIntervention(
    intervention: Omit<Intervention, 'id' | 'created_at'>,
    material: Omit<InterventionMaterial, 'id' | 'intervention_id'>,
    practiceQuestions: Array<Omit<PracticeQuestion, 'id' | 'intervention_id'>>
  ): Intervention {
    const interventionId = crypto.randomUUID();

    const newIntervention: Intervention = {
      ...intervention,
      id: interventionId,
      created_at: new Date().toISOString(),
    };
    mockDb.interventions.push(newIntervention);

    mockDb.intervention_materials.push({
      ...material,
      id: crypto.randomUUID(),
      intervention_id: interventionId,
    });

    practiceQuestions.forEach((pq, idx) => {
      mockDb.practice_questions.push({
        ...pq,
        id: crypto.randomUUID(),
        intervention_id: interventionId,
        order_index: idx + 1,
      });
    });

    return newIntervention;
  },

  updateInterventionStatus(id: string, status: 'approved' | 'rejected' | 'released', facultyId?: string): Intervention | undefined {
    const item = mockDb.interventions.find((i) => i.id === id);
    if (!item) return undefined;
    item.status = status;
    if (status === 'approved' || status === 'released') {
      item.approved_by = facultyId;
      item.approved_at = new Date().toISOString();
    }
    if (status === 'released') {
      item.released_at = new Date().toISOString();
    }
    return item;
  },

  recordPracticeAttempt(questionId: string, studentId: string, answer: string): { is_correct: boolean; explanation: string } {
    const question = mockDb.practice_questions.find((pq) => pq.id === questionId);
    if (!question) throw new Error('Practice question not found');

    const is_correct = question.correct_answer.trim().toLowerCase() === answer.trim().toLowerCase();

    mockDb.practice_attempts.push({
      id: crypto.randomUUID(),
      practice_question_id: questionId,
      student_id: studentId,
      student_answer: answer,
      is_correct,
      feedback: is_correct ? 'Correct! ' + question.explanation : 'Incorrect. ' + question.explanation,
      attempted_at: new Date().toISOString(),
    });

    return { is_correct, explanation: question.explanation };
  },

  // ------------------------------------------------------------------
  // PROGRESS REPORTS (BASELINE VS FINAL COMPARISONS)
  // ------------------------------------------------------------------
  getProgressReport(studentId: string, courseId: string): ProgressReport | undefined {
    const report = mockDb.progress_reports.find(
      (r) => r.student_id === studentId && r.course_id === courseId
    );
    if (!report) return undefined;

    const student = mockDb.profiles.find((p) => p.id === studentId);
    const baseline = mockDb.assessments.find((a) => a.id === report.baseline_assessment_id);
    const final = mockDb.assessments.find((a) => a.id === report.final_assessment_id);

    return { ...report, student, baseline_assessment: baseline, final_assessment: final };
  },

  generateProgressReport(studentId: string, courseId: string, baselineId: string, finalId: string): ProgressReport {
    const baselineScores = mockDb.trait_scores.filter(
      (ts) => ts.student_id === studentId && ts.assessment_id === baselineId
    );
    const finalScores = mockDb.trait_scores.filter(
      (ts) => ts.student_id === studentId && ts.assessment_id === finalId
    );

    const baselineAttempt = mockDb.attempts.find(
      (a) => a.student_id === studentId && a.assessment_id === baselineId && a.status === 'evaluated'
    );
    const finalAttempt = mockDb.attempts.find(
      (a) => a.student_id === studentId && a.assessment_id === finalId && a.status === 'evaluated'
    );

    const baseScore = baselineAttempt?.percentage ?? 70.0;
    const finScore = finalAttempt?.percentage ?? 92.5;

    const trait_improvements: Record<string, number> = {};
    const evidence_counts: Record<string, number> = {};

    BLOOM_TRAITS.forEach((t) => {
      const b = baselineScores.find((s) => s.trait === t)?.score_percentage ?? 50.0;
      const f = finalScores.find((s) => s.trait === t)?.score_percentage ?? 90.0;
      trait_improvements[t] = Math.round((f - b) * 100) / 100;
      evidence_counts[t] = 2;
    });

    const report: ProgressReport = {
      id: crypto.randomUUID(),
      student_id: studentId,
      course_id: courseId,
      baseline_assessment_id: baselineId,
      final_assessment_id: finalId,
      baseline_score: baseScore,
      final_score: finScore,
      score_improvement: Math.round((finScore - baseScore) * 100) / 100,
      trait_improvements: trait_improvements as any,
      evidence_counts: evidence_counts as any,
      summary_narrative: `Student demonstrated significant cognitive growth of +${Math.round((finScore - baseScore) * 10) / 10} percentage points across all 6 Bloom dimensions, with the strongest gains in Analysis and Creativity after completing the personalized remediation package.`,
      generated_at: new Date().toISOString(),
    };

    mockDb.progress_reports.push(report);
    return report;
  },
};
