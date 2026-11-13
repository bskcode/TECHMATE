import { describe, it, expect } from 'vitest';
import { db } from '../../lib/db';

describe('PDF Material Grounding & End-to-End DB Service', () => {
  it('retrieves approved course materials for assessment question grounding', () => {
    const courses = db.getCourses();
    expect(courses.length).toBeGreaterThan(0);
    const cs101 = courses.find((c) => c.code === 'CS101') || courses[0];
    const materials = db.getMaterials(cs101.id, true);
    expect(materials.length).toBeGreaterThan(0);
    expect(materials[0].extracted_text).toBeDefined();
    expect(materials[0].approval_status).toBe('approved');
  });

  it('validates attempt sequence and blocks duplicate response_number replay', () => {
    const courses = db.getCourses();
    const cs101 = courses.find((c) => c.code === 'CS101') || courses[0];
    const assessments = db.getAssessments(cs101.id, true);
    expect(assessments.length).toBeGreaterThan(0);
    const diag = assessments[0];
    const questions = db.getQuestions(diag.id, false);
    expect(questions.length).toBeGreaterThan(0);
    const q = questions[0];

    const uniqueStudentId = `test-student-${Date.now()}`;
    const attempt = db.getOrCreateAttempt(diag.id, uniqueStudentId);

    // First attempt (wrong answer)
    const r1 = db.submitResponse(attempt.id, q.id, 1, '__wrong_answer__');
    expect(r1.is_correct).toBe(false);
    expect(r1.unlocked_hint?.hint_number).toBe(1);

    // Replaying response_number: 1 must throw
    expect(() => db.submitResponse(attempt.id, q.id, 1, '__wrong_answer__')).toThrow(
      /Invalid attempt sequence/
    );
  });

  it('computes real progress reports without hardcoded fallback percentages', () => {
    const courses = db.getCourses();
    const ds201 = courses.find((c) => c.code === 'DS201');
    expect(ds201).toBeDefined();
    if (!ds201) return;

    const report = db.generateProgressReport(
      '00000000-0000-0000-0000-000000000102',
      ds201.id,
      'non-existent-base',
      'non-existent-final'
    );
    expect(report.baseline_score).toBe(0);
    expect(report.final_score).toBe(0);
    expect(report.score_improvement).toBe(0);
  });
});
