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
    mockDb.saveToDisk();
    return newCourse;
  },

  updateCourse(id: string, updates: Partial<Course>): Course | undefined {
    const course = mockDb.courses.find((c) => c.id === id);
    if (!course) return undefined;
    Object.assign(course, updates);
    mockDb.saveToDisk();
    return course;
  },

  enrollStudent(identifier: string, studentId: string): { success: boolean; message: string; course?: Course } {
    const trimmed = (identifier || '').trim().toUpperCase();
    const course = mockDb.courses.find(
      (c) =>
        c.id === identifier ||
        c.code.toUpperCase() === trimmed ||
        c.enrollment_code.toUpperCase() === trimmed
    );
    if (!course) {
      return { success: false, message: 'Course not found. Please choose a valid course from the list.' };
    }

    const existing = mockDb.enrollments.find(
      (e) => e.course_id === course.id && e.student_id === studentId
    );
    if (existing) {
      return { success: true, message: `Already enrolled in ${course.code}: ${course.title}.`, course };
    }

    mockDb.enrollments.push({
      id: crypto.randomUUID(),
      course_id: course.id,
      student_id: studentId,
      status: 'enrolled',
      enrolled_at: new Date().toISOString(),
    });
    mockDb.saveToDisk();

    return { success: true, message: `Successfully enrolled in ${course.code}: ${course.title}!`, course };
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
    mockDb.saveToDisk();
    return newModule;
  },

  deleteModule(id: string): boolean {
    const idx = mockDb.modules.findIndex((m) => m.id === id);
    if (idx < 0) return false;
    mockDb.modules.splice(idx, 1);
    mockDb.saveToDisk();
    return true;
  },

  updateModule(id: string, updates: Partial<Module>): Module | undefined {
    const mod = mockDb.modules.find((m) => m.id === id);
    if (!mod) return undefined;
    Object.assign(mod, updates);
    mockDb.saveToDisk();
    return mod;
  },

  clearModules(courseId: string): number {
    const initial = mockDb.modules.length;
    mockDb.modules = mockDb.modules.filter((m) => m.course_id !== courseId);
    mockDb.saveToDisk();
    return initial - mockDb.modules.length;
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
    mockDb.saveToDisk();
    return newOutcome;
  },

  deleteCourseOutcome(id: string): boolean {
    const idx = mockDb.course_outcomes.findIndex((co) => co.id === id);
    if (idx < 0) return false;
    mockDb.course_outcomes.splice(idx, 1);
    mockDb.saveToDisk();
    return true;
  },

  clearCourseOutcomes(courseId: string): number {
    const initial = mockDb.course_outcomes.length;
    mockDb.course_outcomes = mockDb.course_outcomes.filter((co) => co.course_id !== courseId);
    mockDb.saveToDisk();
    return initial - mockDb.course_outcomes.length;
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
    mockDb.saveToDisk();
    return newMat;
  },

  getMaterial(id: string): LearningMaterial | undefined {
    return mockDb.learning_materials.find((m) => m.id === id);
  },

  updateMaterialStatus(id: string, status: 'approved' | 'rejected', reason?: string): LearningMaterial | undefined {
    const mat = mockDb.learning_materials.find((m) => m.id === id);
    if (!mat) return undefined;
    mat.approval_status = status;
    if (reason !== undefined) mat.rejection_reason = reason;
    mockDb.saveToDisk();
    return mat;
  },

  deleteMaterial(id: string): boolean {
    const index = mockDb.learning_materials.findIndex((m) => m.id === id);
    if (index >= 0) {
      mockDb.learning_materials.splice(index, 1);
      mockDb.saveToDisk();
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
    mockDb.saveToDisk();
    return newAssessment;
  },

  publishAssessment(id: string): Assessment | undefined {
    const assessment = mockDb.assessments.find((a) => a.id === id);
    if (!assessment) return undefined;
    assessment.status = 'published';
    assessment.published_at = new Date().toISOString();
    mockDb.saveToDisk();
    return assessment;
  },

  updateAssessment(id: string, updates: Partial<Assessment>): Assessment | undefined {
    const assessment = mockDb.assessments.find((a) => a.id === id);
    if (!assessment) return undefined;
    Object.assign(assessment, updates);
    mockDb.saveToDisk();
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
      grounding_material_ids: (pkg as any).grounding_material_ids || [],
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

    mockDb.saveToDisk();
    return newQuestion;
  },

  updateQuestion(id: string, updates: Partial<Question & { answer_key?: Partial<QuestionAnswerKey>; hint_1?: string; hint_2?: string }>): Question | undefined {
    const q = mockDb.questions.find((item) => item.id === id);
    if (!q) return undefined;

    if (updates.question_text !== undefined) q.question_text = updates.question_text;
    if (updates.question_type !== undefined) q.question_type = updates.question_type;
    if (updates.options !== undefined) q.options = updates.options;
    if (updates.max_marks !== undefined) q.max_marks = updates.max_marks;
    if (updates.primary_trait !== undefined) q.primary_trait = updates.primary_trait;
    if (updates.secondary_trait !== undefined) q.secondary_trait = updates.secondary_trait;
    if (updates.difficulty !== undefined) q.difficulty = updates.difficulty;
    if (updates.approval_status !== undefined) q.approval_status = updates.approval_status;
    if (updates.source_reference !== undefined) q.source_reference = updates.source_reference;

    // Update answer key
    if (updates.answer_key) {
      const ak = mockDb.question_answer_keys.find((k) => k.question_id === id);
      if (ak) {
        Object.assign(ak, updates.answer_key);
      } else {
        mockDb.question_answer_keys.push({
          id: crypto.randomUUID(),
          question_id: id,
          correct_answer: updates.answer_key.correct_answer ?? '',
          accepted_variations: updates.answer_key.accepted_variations ?? [],
          evaluation_method: updates.answer_key.evaluation_method ?? 'deterministic',
          explanation: updates.answer_key.explanation,
        });
      }
    }

    // Update hints
    if (updates.hint_1 !== undefined) {
      const h1 = mockDb.question_hints.find((h) => h.question_id === id && h.hint_number === 1);
      if (h1) h1.hint_text = updates.hint_1;
      else {
        mockDb.question_hints.push({
          id: crypto.randomUUID(),
          question_id: id,
          hint_number: 1,
          hint_text: updates.hint_1,
          penalty_percentage: 25.0,
        });
      }
    }
    if (updates.hint_2 !== undefined) {
      const h2 = mockDb.question_hints.find((h) => h.question_id === id && h.hint_number === 2);
      if (h2) h2.hint_text = updates.hint_2;
      else {
        mockDb.question_hints.push({
          id: crypto.randomUUID(),
          question_id: id,
          hint_number: 2,
          hint_text: updates.hint_2,
          penalty_percentage: 50.0,
        });
      }
    }

    mockDb.saveToDisk();
    return this.getQuestion(id, true);
  },

  deleteQuestion(id: string): boolean {
    const idx = mockDb.questions.findIndex((q) => q.id === id);
    if (idx < 0) return false;
    mockDb.questions.splice(idx, 1);
    mockDb.question_answer_keys = mockDb.question_answer_keys.filter((ak) => ak.question_id !== id);
    mockDb.question_hints = mockDb.question_hints.filter((h) => h.question_id !== id);
    mockDb.saveToDisk();
    return true;
  },

  deleteQuestionsForAssessment(assessmentId: string): number {
    const qIds = mockDb.questions.filter((q) => q.assessment_id === assessmentId).map((q) => q.id);
    if (qIds.length === 0) return 0;
    mockDb.questions = mockDb.questions.filter((q) => q.assessment_id !== assessmentId);
    mockDb.question_answer_keys = mockDb.question_answer_keys.filter((ak) => !qIds.includes(ak.question_id));
    mockDb.question_hints = mockDb.question_hints.filter((h) => !qIds.includes(h.question_id));
    mockDb.saveToDisk();
    return qIds.length;
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
    mockDb.saveToDisk();
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

  getHintEventsForAttempt(attemptId: string): Array<HintEvent & { hint_text?: string }> {
    return mockDb.hint_events
      .filter((h) => h.attempt_id === attemptId)
      .map((h) => {
        const hint = mockDb.question_hints.find(
          (qh) => qh.question_id === h.question_id && qh.hint_number === h.hint_number
        );
        return { ...h, hint_text: hint?.hint_text };
      });
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
    const attempt = mockDb.attempts.find((a) => a.id === attemptId);
    if (!attempt) throw new Error('Attempt not found');
    if (attempt.status !== 'in_progress') {
      throw new Error('This attempt has already been finalized and cannot accept new submissions.');
    }

    const existingResponses = mockDb.responses.filter(
      (r) => r.attempt_id === attemptId && r.question_id === questionId
    );
    const expectedNext = (existingResponses.length + 1) as number;
    if (existingResponses.some((r) => r.is_correct)) {
      throw new Error('Question is already solved and finalized.');
    }
    if (responseNumber !== expectedNext) {
      throw new Error(`Invalid attempt sequence: expected attempt ${expectedNext}, received ${responseNumber}.`);
    }

    const question = mockDb.questions.find((q) => q.id === questionId);
    if (!question) throw new Error('Question not found');

    const answerKey = mockDb.question_answer_keys.find((ak) => ak.question_id === questionId);
    if (!answerKey) throw new Error('Answer key not found');

    const assessment = mockDb.assessments.find((a) => a.id === attempt.assessment_id);
    const isDiagnostic = assessment?.assessment_type === 'diagnostic' || assessment?.progressive_hints_enabled === false;
    const hints = isDiagnostic ? [] : mockDb.question_hints.filter((h) => h.question_id === questionId);

    // Run the progressive 2-hint state machine
    const result = processProgressiveSubmission({
      questionType: question.question_type,
      studentAnswer,
      responseNumber,
      answerKey,
      maxMarks: question.max_marks,
      hints,
    });

    if (isDiagnostic) {
      // Diagnostic assessment: Strictly NO hints permitted
      result.unlocked_hint = undefined;
      result.is_question_finalized = true;
      if (!result.is_correct) {
        result.feedback = 'Incorrect. (Diagnostic Assessment — hints are strictly disabled)';
      }
    }

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

    mockDb.saveToDisk();
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

    mockDb.saveToDisk();
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

    // Weakest trait identifying (only among traits that have evidence, or lowest overall)
    const scoredTraits = traitData.filter((t) => traitAverages[t.key].count > 0);
    const weakest = [...(scoredTraits.length > 0 ? scoredTraits : traitData)].sort(
      (a, b) => a.classAverage - b.classAverage
    )[0];

    // Enrolled students in this course
    const enrolledStudentIds = new Set(
      mockDb.enrollments
        .filter((e) => e.course_id === courseId && e.status === 'enrolled')
        .map((e) => e.student_id)
    );
    const courseAssessmentIds = new Set(
      mockDb.assessments.filter((a) => a.course_id === courseId).map((a) => a.id)
    );

    const enrolledStudents = mockDb.profiles.filter(
      (p) => p.role === 'student' && enrolledStudentIds.has(p.id)
    );

    // Student performance summaries
    const studentPerformances = enrolledStudents.map((s) => {
      const studentScores = mockDb.trait_scores.filter(
        (ts) => ts.student_id === s.id && ts.course_id === courseId
      );
      const weakTraits = studentScores.filter((ts) => ts.score_percentage < 60).map((ts) => ts.trait);
      const studentAttempts = mockDb.attempts
        .filter(
          (a) =>
            a.student_id === s.id &&
            a.status === 'evaluated' &&
            courseAssessmentIds.has(a.assessment_id)
        )
        .sort((a, b) => new Date(b.submitted_at || b.started_at).getTime() - new Date(a.submitted_at || a.started_at).getTime());
      const latestAttempt = studentAttempts[0];
      return {
        student: s,
        weakTraits,
        latestScore: latestAttempt?.percentage ?? 0,
        hasAttempt: Boolean(latestAttempt),
        needsHelp: weakTraits.length > 0 || (latestAttempt ? latestAttempt.percentage < 60 : false),
      };
    });

    const studentsNeedingIntervention = studentPerformances.filter((item) => item.needsHelp);

    const topPerformers = studentPerformances
      .filter((item) => item.hasAttempt)
      .sort((a, b) => b.latestScore - a.latestScore)
      .slice(0, 3)
      .map((item) => ({
        student: item.student,
        score: item.latestScore,
      }));

    const evaluatedAttempts = courseAttempts.filter((a) => a.status === 'evaluated');
    const classMastery =
      evaluatedAttempts.length > 0
        ? Math.round((evaluatedAttempts.reduce((sum, a) => sum + a.percentage, 0) / evaluatedAttempts.length) * 10) / 10
        : 0;

    const courseReports = mockDb.progress_reports.filter((r) => r.course_id === courseId);
    const avgGrowth =
      courseReports.length > 0
        ? Math.round((courseReports.reduce((sum, r) => sum + r.score_improvement, 0) / courseReports.length) * 10) / 10
        : 0;

    return {
      studentCount,
      totalAttempts: courseAttempts.length,
      classMastery,
      avgGrowth,
      traitData,
      weakestTrait: weakest?.trait ?? 'None',
      studentsNeedingIntervention,
      topPerformers,
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

    mockDb.saveToDisk();
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
    mockDb.saveToDisk();
    return this.getIntervention(id);
  },

  updateIntervention(
    id: string,
    updates: { faculty_notes?: string; completed_checklist_items?: number[] }
  ): Intervention | undefined {
    const item = mockDb.interventions.find((i) => i.id === id);
    if (!item) return undefined;
    if (updates.faculty_notes !== undefined) item.faculty_notes = updates.faculty_notes;
    if (updates.completed_checklist_items !== undefined) {
      item.completed_checklist_items = updates.completed_checklist_items;
    }
    mockDb.saveToDisk();
    return this.getIntervention(id);
  },

  getPracticeAttempts(studentId: string): PracticeAttempt[] {
    return mockDb.practice_attempts.filter((pa) => pa.student_id === studentId);
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

    mockDb.saveToDisk();
    return { is_correct, explanation: question.explanation };
  },

  // ------------------------------------------------------------------
  // PROGRESS REPORTS (BASELINE VS FINAL COMPARISONS)
  // ------------------------------------------------------------------
  getProgressReport(studentId: string, courseId: string): (ProgressReport & { trait_details?: Record<string, { baseline: number; final: number; delta: number; marks_earned: number; marks_possible: number; evidence_count: number; confidence: string }> }) | undefined {
    const report = mockDb.progress_reports.find(
      (r) => r.student_id === studentId && r.course_id === courseId
    );
    if (!report) return undefined;

    const student = mockDb.profiles.find((p) => p.id === studentId);
    const baseline = mockDb.assessments.find((a) => a.id === report.baseline_assessment_id);
    const final = mockDb.assessments.find((a) => a.id === report.final_assessment_id);

    const baselineTraits = mockDb.trait_scores.filter(
      (ts) => ts.student_id === studentId && ts.assessment_id === report.baseline_assessment_id
    );
    const finalTraits = mockDb.trait_scores.filter(
      (ts) => ts.student_id === studentId && ts.assessment_id === report.final_assessment_id
    );

    const trait_details: Record<string, { baseline: number; final: number; delta: number; marks_earned: number; marks_possible: number; evidence_count: number; confidence: string }> = {};
    BLOOM_TRAITS.forEach((t) => {
      const b = baselineTraits.find((s) => s.trait === t);
      const f = finalTraits.find((s) => s.trait === t);
      const latest = f || b;
      const bPct = b?.score_percentage ?? 0;
      const fPct = f?.score_percentage ?? bPct;
      const ev = (report.evidence_counts as any)?.[t] ?? ((b?.evidence_count ?? 0) + (f?.evidence_count ?? 0));
      trait_details[t] = {
        baseline: Math.round(bPct * 10) / 10,
        final: Math.round(fPct * 10) / 10,
        delta: (report.trait_improvements as any)?.[t] ?? Math.round((fPct - bPct) * 10) / 10,
        marks_earned: latest?.marks_earned ?? 0,
        marks_possible: latest?.marks_possible ?? 0,
        evidence_count: ev,
        confidence: latest?.confidence ?? (ev >= 3 ? 'high' : ev >= 2 ? 'moderate' : 'low'),
      };
    });

    return { ...report, student, baseline_assessment: baseline, final_assessment: final, trait_details };
  },

  generateProgressReport(studentId: string, courseId: string, baselineId: string, finalId: string): ProgressReport {
    const baselineScores = mockDb.trait_scores.filter(
      (ts) => ts.student_id === studentId && ts.assessment_id === baselineId
    );
    const finalScores = mockDb.trait_scores.filter(
      (ts) => ts.student_id === studentId && ts.assessment_id === finalId
    );

    const baselineAttempt = mockDb.attempts
      .filter((a) => a.student_id === studentId && a.assessment_id === baselineId && a.status === 'evaluated')
      .sort((a, b) => new Date(b.submitted_at || b.started_at).getTime() - new Date(a.submitted_at || a.started_at).getTime())[0];
    const finalAttempt = mockDb.attempts
      .filter((a) => a.student_id === studentId && a.assessment_id === finalId && a.status === 'evaluated')
      .sort((a, b) => new Date(b.submitted_at || b.started_at).getTime() - new Date(a.submitted_at || a.started_at).getTime())[0];

    const baseScore = baselineAttempt?.percentage ?? 0;
    const finScore = finalAttempt?.percentage ?? baseScore;

    const trait_improvements: Record<string, number> = {};
    const evidence_counts: Record<string, number> = {};

    BLOOM_TRAITS.forEach((t) => {
      const bObj = baselineScores.find((s) => s.trait === t);
      const fObj = finalScores.find((s) => s.trait === t);
      const b = bObj?.score_percentage ?? 0;
      const f = fObj?.score_percentage ?? b;
      trait_improvements[t] = Math.round((f - b) * 100) / 100;
      evidence_counts[t] = (bObj?.evidence_count ?? 0) + (fObj?.evidence_count ?? 0);
    });

    const delta = Math.round((finScore - baseScore) * 10) / 10;
    const topGains = Object.entries(trait_improvements)
      .filter(([, val]) => val > 0)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 2)
      .map(([k]) => k.charAt(0).toUpperCase() + k.slice(1));

    const studentName = mockDb.profiles.find((p) => p.id === studentId)?.full_name ?? 'Student';
    let narrative: string;
    if (!baselineAttempt && !finalAttempt) {
      narrative = `${studentName} has not yet completed an evaluated assessment in this course.`;
    } else if (!finalAttempt) {
      narrative = `${studentName} completed the baseline diagnostic assessment with ${baseScore}%. Final assessment comparison will update once the final exam is evaluated.`;
    } else {
      const gainStr = topGains.length > 0 ? ` with the strongest gains in ${topGains.join(' and ')}` : '';
      narrative = `${studentName} demonstrated ${delta >= 0 ? `+${delta}` : delta} percentage points overall change (${baseScore}% → ${finScore}%)${gainStr}.`;
    }

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
      summary_narrative: narrative,
      generated_at: new Date().toISOString(),
    };

    mockDb.progress_reports = mockDb.progress_reports.filter(
      (r) => !(r.student_id === studentId && r.course_id === courseId)
    );
    mockDb.progress_reports.push(report);
    mockDb.saveToDisk();
    return this.getProgressReport(studentId, courseId)!;
  },

  getNotifications(userId: string, role: 'faculty' | 'student') {
    const items: Array<{ id: string; title: string; detail: string; time: string; href: string; type: 'info' | 'warning' | 'success' }> = [];

    if (role === 'faculty') {
      const pendingInterventions = mockDb.interventions.filter((i) => i.status === 'pending_approval' || i.status === 'generated');
      pendingInterventions.slice(0, 3).forEach((i) => {
        const student = mockDb.profiles.find((p) => p.id === i.student_id);
        items.push({
          id: `int-${i.id}`,
          title: `Intervention Pending: ${student?.full_name ?? 'Student'}`,
          detail: `Weak traits: ${i.weak_traits.join(', ')}`,
          time: i.created_at,
          href: '/faculty/interventions',
          type: 'warning',
        });
      });

      const recentAttempts = [...mockDb.attempts]
        .filter((a) => a.status === 'evaluated')
        .sort((a, b) => new Date(b.submitted_at || b.started_at).getTime() - new Date(a.submitted_at || a.started_at).getTime())
        .slice(0, 4);
      recentAttempts.forEach((a) => {
        const student = mockDb.profiles.find((p) => p.id === a.student_id);
        const assessment = mockDb.assessments.find((as) => as.id === a.assessment_id);
        items.push({
          id: `att-${a.id}`,
          title: `${student?.full_name ?? 'Student'} completed ${assessment?.title ?? 'Assessment'}`,
          detail: `Score: ${a.percentage}% (${a.total_score}/${a.max_score})`,
          time: a.submitted_at || a.started_at,
          href: '/faculty/analytics',
          type: a.percentage >= 60 ? 'success' : 'warning',
        });
      });
    } else {
      const released = mockDb.interventions.filter((i) => i.student_id === userId && i.status === 'released');
      released.forEach((i) => {
        items.push({
          id: `rel-${i.id}`,
          title: 'Personalized Study Plan Released',
          detail: `Focus areas: ${i.weak_traits.join(', ')}`,
          time: i.released_at || i.created_at,
          href: '/student/interventions',
          type: 'info',
        });
      });

      const enrolledIds = new Set(
        mockDb.enrollments.filter((e) => e.student_id === userId && e.status === 'enrolled').map((e) => e.course_id)
      );
      const published = mockDb.assessments.filter((a) => enrolledIds.has(a.course_id) && a.status === 'published');
      published.slice(0, 4).forEach((a) => {
        items.push({
          id: `pub-${a.id}`,
          title: `Assessment Available: ${a.title}`,
          detail: `${a.time_limit_minutes} mins · ${a.max_marks} marks`,
          time: a.published_at || a.created_at,
          href: '/student/assessments',
          type: 'info',
        });
      });
    }

    return items.sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime()).slice(0, 8);
  },

  searchPlatform(query: string, role: 'faculty' | 'student') {
    const q = query.trim().toLowerCase();
    if (!q) return [];

    const results: Array<{ id: string; category: string; title: string; subtitle: string; href: string }> = [];

    mockDb.courses.forEach((c) => {
      if (c.code.toLowerCase().includes(q) || c.title.toLowerCase().includes(q)) {
        results.push({
          id: `c-${c.id}`,
          category: 'Course',
          title: `${c.code}: ${c.title}`,
          subtitle: c.term,
          href: role === 'faculty' ? '/faculty/courses' : '/student/courses',
        });
      }
    });

    mockDb.course_outcomes.forEach((co) => {
      if (co.code.toLowerCase().includes(q) || co.description.toLowerCase().includes(q)) {
        results.push({
          id: `co-${co.id}`,
          category: 'Outcome',
          title: `${co.code}`,
          subtitle: co.description.slice(0, 80),
          href: role === 'faculty' ? '/faculty/courses' : '/student/courses',
        });
      }
    });

    mockDb.assessments.forEach((a) => {
      if (role === 'student' && a.status !== 'published') return;
      if (a.title.toLowerCase().includes(q) || (a.description || '').toLowerCase().includes(q)) {
        results.push({
          id: `a-${a.id}`,
          category: 'Assessment',
          title: a.title,
          subtitle: `${a.assessment_type} · ${a.max_marks} marks`,
          href: role === 'faculty' ? '/faculty/assessments' : '/student/assessments',
        });
      }
    });

    mockDb.learning_materials.forEach((m) => {
      if (role === 'student' && m.approval_status !== 'approved') return;
      if (m.filename.toLowerCase().includes(q)) {
        results.push({
          id: `m-${m.id}`,
          category: 'Material',
          title: m.filename,
          subtitle: `${m.character_count} chars · ${m.approval_status}`,
          href: role === 'faculty' ? '/faculty/materials' : '/student/courses',
        });
      }
    });

    return results.slice(0, 10);
  },
};

