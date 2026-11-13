import { describe, it, expect } from 'vitest';
import { db } from '../../lib/db';
import { generateQuestionPackages, generateGroundedFallbackPackages } from '../../lib/ai/question-generator';

const BIO_NOTES = `=== DOCUMENT: BIO201_Cellular_Respiration.txt ===
Cellular respiration is the metabolic process through which biochemical energy is produced from glucose in the form of ATP (adenosine triphosphate).
The complete pathway consists of three successive stages:
1. Glycolysis: Occurs in the cytoplasm. One 6-carbon molecule of glucose is anaerobically cleaved into two 3-carbon molecules of pyruvate, generating a net yield of 2 ATP and 2 NADH.
2. The Krebs Cycle (Citric Acid Cycle): Occurs in the mitochondrial matrix. Acetyl-CoA is oxidized, releasing carbon dioxide (CO2) and generating 2 ATP, 6 NADH, and 2 FADH2.
3. Oxidative Phosphorylation: Occurs along the inner mitochondrial membrane (cristae). High-energy electrons from NADH and FADH2 are transferred through the Electron Transport Chain (ETC).

ATP Synthase: A multi-subunit molecular turbine driven by the proton-motive force (H+ electrochemical gradient) across the inner mitochondrial membrane to synthesize ATP from ADP and inorganic phosphate.
In aerobic eukaryotes, one molecule of glucose generates a theoretical maximum yield of 36 to 38 ATP molecules.
Fermentation occurs under anaerobic conditions to regenerate NAD+ from NADH so glycolysis can continue in the absence of oxygen.`;

describe('End-to-End Smoke Test — Course-Specific & Note-Grounded Question Generation', () => {
  it('generates questions strictly from uploaded notes with the exact requested count', async () => {
    const requestedCount = 4;
    const questions = await generateQuestionPackages({
      courseTitle: 'BIO201: Cell Biology & Genetics',
      moduleTitle: 'Module 3: Cellular Respiration & ATP Synthesis',
      groundingText: BIO_NOTES,
      questionCount: requestedCount,
      targetTraits: ['remembering', 'understanding', 'application', 'analysis'],
      difficulty: 'medium',
    });

    // 1. Check exact question count
    expect(questions.length).toBe(requestedCount);

    // 2. Check that questions are derived from biology notes and NOT binary search / CS101
    const combinedQuestionText = questions
      .map((q) => `${q.question_text} ${q.explanation} ${q.correct_answer}`)
      .join(' ')
      .toLowerCase();

    // Must contain biological concepts from the notes
    const hasBioConcepts =
      combinedQuestionText.includes('atp') ||
      combinedQuestionText.includes('glycolysis') ||
      combinedQuestionText.includes('mitochondri') ||
      combinedQuestionText.includes('respiration') ||
      combinedQuestionText.includes('pyruvate') ||
      combinedQuestionText.includes('krebs') ||
      combinedQuestionText.includes('glucose');

    expect(hasBioConcepts).toBe(true);

    // Must NOT contain computer science fallback leakage
    expect(combinedQuestionText).not.toContain('binary search');
    expect(combinedQuestionText).not.toContain('de morgan');
    expect(combinedQuestionText).not.toContain('breadth-first search');

    // 3. Check question structure and Bloom trait mappings
    for (const q of questions) {
      expect(q.question_text.length).toBeGreaterThan(10);
      expect(q.correct_answer).toBeDefined();
      expect(typeof q.correct_answer).toBe('string');
      expect(q.hint_1).toBeDefined();
      expect(q.hint_2).toBeDefined();
      expect(q.max_marks).toBe(5);
      expect(['remembering', 'understanding', 'application', 'analysis', 'creativity', 'evaluation']).toContain(q.primary_trait);
      expect(['mcq', 'multiple_select', 'true_false', 'numeric', 'fill_in_blank']).toContain(q.question_type);
    }
  });

  it('honors higher requested question counts (e.g. 7 questions)', async () => {
    const requestedCount = 7;
    const questions = await generateQuestionPackages({
      courseTitle: 'BIO201: Cell Biology & Genetics',
      moduleTitle: 'Module 3: Cellular Respiration & ATP Synthesis',
      groundingText: BIO_NOTES,
      questionCount: requestedCount,
      targetTraits: ['remembering', 'understanding', 'application', 'analysis', 'creativity', 'evaluation'],
      difficulty: 'medium',
    });

    expect(questions.length).toBe(requestedCount);
  });

  it('guarantees deterministic note-grounded fallback extraction without CS leaks', () => {
    const fallbackCount = 5;
    const fallbackQuestions = generateGroundedFallbackPackages(
      'BIO201: Cell Biology & Genetics',
      BIO_NOTES,
      ['remembering', 'understanding', 'application', 'analysis', 'creativity'],
      fallbackCount
    );

    expect(fallbackQuestions.length).toBe(fallbackCount);

    const fallbackText = fallbackQuestions
      .map((q) => `${q.question_text} ${q.explanation} ${q.correct_answer}`)
      .join(' ')
      .toLowerCase();

    // Must be grounded in bio notes
    expect(
      fallbackText.includes('glycolysis') ||
      fallbackText.includes('atp') ||
      fallbackText.includes('mitochondr') ||
      fallbackText.includes('respiration') ||
      fallbackText.includes('synthase')
    ).toBe(true);

    // Must not leak CS101 hardcoded questions
    expect(fallbackText).not.toContain('binary search');
    expect(fallbackText).not.toContain('de morgan');
  });

  it('performs end-to-end database workflow: create course -> upload notes -> generate assessment -> publish -> student attempt', () => {
    // 1. Create a brand new course
    const newCourse = db.createCourse({
      code: `TEST${Date.now().toString().slice(-4)}`,
      title: 'Biochemistry Foundations',
      description: 'End-to-end smoke test course',
      instructor_id: '00000000-0000-0000-0000-000000000001',
      term: 'Fall 2026',
      enrollment_code: 'BIO99',
      is_active: true,
    });
    expect(newCourse.id).toBeDefined();

    // 2. Add learning material with extracted text
    const material = db.addMaterial({
      course_id: newCourse.id,
      uploader_id: '00000000-0000-0000-0000-000000000001',
      filename: 'Cellular_Respiration_Guide.txt',
      storage_path: `materials/${newCourse.id}/guide.txt`,
      file_type: 'txt',
      file_size_bytes: BIO_NOTES.length,
      extracted_text: BIO_NOTES,
      character_count: BIO_NOTES.length,
      processing_status: 'completed',
      approval_status: 'approved',
    });
    expect(material.id).toBeDefined();

    // 3. Create an assessment for this course
    const assessment = db.createAssessment({
      course_id: newCourse.id,
      title: 'Biochemistry Diagnostic Assessment',
      description: 'Testing grounding and evaluation pipeline',
      assessment_type: 'progressive',
      status: 'draft',
      time_limit_minutes: 25,
      max_marks: 15,
      passing_marks: 8,
      progressive_hints_enabled: true,
    });
    expect(assessment.id).toBeDefined();

    // 4. Fallback generation creates grounded packages from the uploaded notes
    const questionPackages = generateGroundedFallbackPackages(
      `${newCourse.code}: ${newCourse.title}`,
      material.extracted_text,
      ['remembering', 'understanding', 'application'],
      3
    );
    expect(questionPackages.length).toBe(3);

    // 5. Save generated questions into the assessment
    db.deleteQuestionsForAssessment(assessment.id);
    const savedQuestions = questionPackages.map((pkg, idx) => {
      return db.saveGeneratedQuestionPackage(
        assessment.id,
        {
          ...(pkg as any),
          grounding_material_ids: [material.id],
        },
        idx + 1
      );
    });
    expect(savedQuestions.length).toBe(3);

    // 6. Publish the assessment
    const published = db.publishAssessment(assessment.id);
    expect(published?.status).toBe('published');

    // 7. Student starts attempt
    const studentId = `student-smoke-${Date.now()}`;
    const studentQuestions = db.getQuestions(assessment.id, false);
    expect(studentQuestions.length).toBe(3);

    // Sanitized check: student questions must NOT contain answer keys or locked hints
    for (const sq of studentQuestions) {
      expect((sq as any).answer_key).toBeUndefined();
      expect((sq as any).hint_1).toBeUndefined();
      expect((sq as any).hint_2).toBeUndefined();
    }

    const attempt = db.getOrCreateAttempt(assessment.id, studentId);
    expect(attempt.id).toBeDefined();
    expect(attempt.status).toBe('in_progress');

    // 8. Submit wrong response -> verifies progressive hint 1 unlocked
    const firstQ = savedQuestions[0];
    const sub1 = db.submitResponse(attempt.id, firstQ.id, 1, '__completely_wrong_answer__');
    expect(sub1.is_correct).toBe(false);
    expect(sub1.unlocked_hint?.hint_number).toBe(1);
    expect(sub1.unlocked_hint?.hint_text).toBeDefined();

    // 9. Submit wrong response 2 -> verifies progressive hint 2 unlocked
    const sub2 = db.submitResponse(attempt.id, firstQ.id, 2, '__still_wrong_answer__');
    expect(sub2.is_correct).toBe(false);
    expect(sub2.unlocked_hint?.hint_number).toBe(2);

    // 10. Submit correct response 3 -> verifies 50% penalty on hint 2
    const facultyQ = db.getQuestion(firstQ.id, true);
    expect(facultyQ?.answer_key).toBeDefined();
    const sub3 = db.submitResponse(attempt.id, firstQ.id, 3, facultyQ!.answer_key!.correct_answer);
    expect(sub3.is_correct).toBe(true);
    expect(sub3.awarded_marks).toBe(2.5); // 50% penalty
    expect(sub3.is_question_finalized).toBe(true);
  });
});
