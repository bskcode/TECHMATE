import { describe, it, expect } from 'vitest';
import { db } from '../../lib/db';
import { CONTENT_TEMPLATES } from '../../lib/templates/content-templates';

describe('Content Templates & End-to-End DB Service', () => {
  it('provides standardized templates for syllabus, objectives, and materials', () => {
    const ids = CONTENT_TEMPLATES.map((t) => t.id);
    expect(ids).toEqual(['syllabus', 'objectives', 'material']);
    CONTENT_TEMPLATES.forEach((tpl) => {
      expect(tpl.content.length).toBeGreaterThan(100);
      expect(tpl.downloadPath).toMatch(/^\/templates\/.+\.md$/);
    });
  });

  it('validates attempt sequence and blocks duplicate response_number replay', () => {
    const courses = db.getCourses();
    const cs101 = courses[0];
    const assessments = db.getAssessments(cs101.id, true);
    const diag = assessments[0];
    const questions = db.getQuestions(diag.id, false);
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
