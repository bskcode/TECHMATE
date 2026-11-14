import { describe, it, expect } from 'vitest';
import { db } from '../../lib/db';
import {
  isAdministrativeQuestion,
  sanitizeTechnicalGroundingText,
  sanitizeQuestionText,
  cleanSubjectTitle,
  generateGroundedFallbackPackages,
} from '../../lib/ai/question-generator';
import { generateCourseSpecificInterventionFallback } from '../../lib/ai/intervention-generator';

describe('Technical Subject Questions & Cross-Course Isolation', () => {
  it('detects and flags administrative / syllabus metadata questions and subject codes', () => {
    expect(isAdministrativeQuestion('What is the course code for this subject?')).toBe(true);
    expect(isAdministrativeQuestion('What is the course title of CS101?')).toBe(true);
    expect(isAdministrativeQuestion('Who is the instructor for this class?')).toBe(true);
    expect(isAdministrativeQuestion('In which term is this course offered?')).toBe(true);
    expect(isAdministrativeQuestion('How many credits is this course?')).toBe(true);
    expect(isAdministrativeQuestion('What is CO1 in the course syllabus?')).toBe(true);
    expect(isAdministrativeQuestion('What is the subject code for this course?')).toBe(true);
    expect(isAdministrativeQuestion('Which subject code is assigned to this course?')).toBe(true);
    expect(isAdministrativeQuestion('Under subject code CS101, what is taught?')).toBe(true);
    expect(isAdministrativeQuestion('What is the subject name?')).toBe(true);
    expect(isAdministrativeQuestion('Identify the following concept', 'CS101')).toBe(true);
    expect(isAdministrativeQuestion('Identify the following concept', 'CS8391')).toBe(true);

    // Textbook, author, publisher, edition, and ISBN inquiries MUST be strictly detected and flagged as invalid
    expect(
      isAdministrativeQuestion('Who is the publisher of the textbook Artificial Intelligence: A Modern Approach?')
    ).toBe(true);
    expect(
      isAdministrativeQuestion('Which publisher published the reference book?')
    ).toBe(true);
    expect(
      isAdministrativeQuestion('Select the publisher for the prescribed course textbook', 'Pearson Education')
    ).toBe(true);
    expect(
      isAdministrativeQuestion('Who is the author of Introduction to Algorithms?')
    ).toBe(true);
    expect(
      isAdministrativeQuestion('Which edition of the textbook is prescribed for this semester?')
    ).toBe(true);
    expect(
      isAdministrativeQuestion('What is the ISBN of the recommended reference book?')
    ).toBe(true);
    expect(
      isAdministrativeQuestion('Who wrote the prescribed textbook for this module?')
    ).toBe(true);
    expect(
      isAdministrativeQuestion('What is the publication year of the reference book?')
    ).toBe(true);

    // Genuine technical questions must NOT be flagged
    expect(
      isAdministrativeQuestion('What is the worst-case time complexity of Binary Search?')
    ).toBe(false);
    expect(
      isAdministrativeQuestion('Which data structure provides O(1) insertion at the head?')
    ).toBe(false);
    expect(
      isAdministrativeQuestion('In Boolean algebra, what is the negation of (A AND B)?')
    ).toBe(false);
    expect(
      isAdministrativeQuestion('How does Depth-First Search utilize a LIFO stack to traverse paths?')
    ).toBe(false);
  });

  it('sanitizes grounding text to strip administrative metadata and subject codes while keeping technical content', () => {
    const rawText = `COURSE SYLLABUS: CS101 — COMPUTATIONAL THINKING
Subject Code: CS8391
Sub Code: CS101
Paper Code: 19CS401
Course Code: CS101
Course Title: Introduction to Computer Science & AI
Instructor: Dr. Alan Turing
Branch: Computer Science & Engineering
Regulation: 2021
Term: Fall 2026
Credits: 4
L-T-P-C: 3-0-0-3
CS101
Binary Search requires that the input array is sorted.
Big-O Notation characterizes asymptotic runtime growth.

TEXT BOOKS:
1. Stuart Russell and Peter Norvig, "Artificial Intelligence: A Modern Approach", 4th Edition, Pearson Education, 2020.
2. Thomas H. Cormen, Charles E. Leiserson, Ronald L. Rivest, Clifford Stein, "Introduction to Algorithms", 3rd Edition, MIT Press, 2009.

REFERENCES:
1. Elaine Rich, Kevin Knight, Shivashankar B. Nair, "Artificial Intelligence", 3rd Edition, Tata McGraw-Hill, 2017. ISBN 978-0070087705.
2. Michael Sipser, "Introduction to the Theory of Computation", Cengage Learning, 2012.`;

    const sanitized = sanitizeTechnicalGroundingText(rawText);
    expect(sanitized).not.toContain('Course Code:');
    expect(sanitized).not.toContain('Subject Code:');
    expect(sanitized).not.toContain('Sub Code:');
    expect(sanitized).not.toContain('Paper Code:');
    expect(sanitized).not.toContain('Instructor: Dr. Alan Turing');
    expect(sanitized).not.toContain('Regulation: 2021');
    expect(sanitized).not.toContain('Term: Fall 2026');
    expect(sanitized).not.toContain('L-T-P-C:');
    expect(sanitized).not.toContain('Pearson Education');
    expect(sanitized).not.toContain('MIT Press');
    expect(sanitized).not.toContain('Tata McGraw-Hill');
    expect(sanitized).not.toContain('Cengage');
    expect(sanitized).not.toContain('ISBN 978-0070087705');
    expect(sanitized).not.toContain('Stuart Russell');
    expect(sanitized).not.toContain('TEXT BOOKS');
    expect(sanitized).not.toContain('REFERENCES');
    expect(sanitized).toContain('Binary Search requires that the input array is sorted.');
    expect(sanitized).toContain('Big-O Notation characterizes asymptotic runtime growth.');
  });

  it('sanitizes question text by stripping subject code prefixes and awkward filler phrases', () => {
    expect(
      sanitizeQuestionText('In CS101, what is the worst-case time complexity of Binary Search?')
    ).toBe('What is the worst-case time complexity of Binary Search?');

    expect(
      sanitizeQuestionText('In CS101: Introduction to AI, which data structure provides O(1) insertion at the head?')
    ).toBe('Which data structure provides O(1) insertion at the head?');

    expect(
      sanitizeQuestionText('True or False: In CS101, Binary Search requires that the input array is sorted.')
    ).toBe('True or False: Binary Search requires that the input array is sorted.');

    expect(
      sanitizeQuestionText('Fill in the blank: In CS101, the data structure that operates as FIFO is a queue.')
    ).toBe('Fill in the blank: The data structure that operates as FIFO is a queue.');

    expect(
      cleanSubjectTitle('CS101: Introduction to Computer Science & AI')
    ).toBe('Introduction to Computer Science & AI');

    expect(
      cleanSubjectTitle('CS-101 Data Structures')
    ).toBe('Data Structures');
  });

  it('generates standard technical assessment questions with zero subject codes or administrative inquiries', () => {
    const rawGrounding = `Subject Code: CS101
Course Code: CS101
Instructor: Alan Turing
Term: Fall 2026
Regulation: 2021
Binary Search: Divides the sorted search space in half with O(log N) comparisons.
De Morgan Laws: Negation of conjunction yields disjunction of negations.
Breadth-First Search: Explores shallowest nodes using a FIFO queue with exponential memory O(b^d).
Depth-First Search: Explores deepest paths using a LIFO stack with linear memory O(b*d).

TEXT BOOKS:
1. Stuart Russell, Artificial Intelligence, 4th edition, Pearson Education, 2020.
2. Thomas Cormen, Introduction to Algorithms, MIT Press, 2009.`;

    const packages = generateGroundedFallbackPackages(
      'CS101: Introduction to Computer Science & AI',
      rawGrounding,
      ['remembering', 'understanding', 'application', 'analysis'],
      4,
      'CS101'
    );

    expect(packages.length).toBe(4);
    for (const pkg of packages) {
      // Must NOT be an administrative or publisher question
      expect(isAdministrativeQuestion(pkg.question_text)).toBe(false);
      expect(pkg.question_text).not.toContain('Course Code');
      expect(pkg.question_text).not.toContain('Subject Code');
      expect(pkg.question_text).not.toContain('CS101');
      expect(pkg.question_text).not.toContain('Pearson');
      expect(pkg.question_text).not.toContain('MIT Press');
      expect(pkg.question_text).not.toContain('Russell');
      expect(pkg.question_text).not.toContain('Cormen');
      expect(pkg.correct_answer).not.toBe('CS101');
      expect(pkg.correct_answer).not.toBe('Fall 2026');
      expect(pkg.correct_answer).not.toBe('Alan Turing');
      expect(pkg.correct_answer).not.toBe('2021');
      expect(pkg.correct_answer).not.toContain('Pearson');
      expect(pkg.correct_answer).not.toContain('MIT Press');

      for (const opt of pkg.options || []) {
        expect(opt).not.toBe('CS101');
        expect(opt).not.toContain('Subject Code');
        expect(opt).not.toContain('Pearson');
        expect(opt).not.toContain('MIT Press');
      }
    }
  });

  it('generates course-specific remediation for Data Structures without CS101/BFS contamination', () => {
    const dsIntervention = generateCourseSpecificInterventionFallback(
      'Student Alice',
      'DS301: Data Structures',
      ['analysis', 'application'],
      `[Module 1: Arrays & Pointers]
Static array indexing uses contiguous memory offset.
[Module 2: Linked Lists]
Singly linked lists allow O(1) head insertion by updating pointers.`
    );

    expect(dsIntervention.title).toContain('Data Structure');
    expect(dsIntervention.explanation_markdown).toContain('Data Structure Operations');
    expect(dsIntervention.explanation_markdown).toContain('Array');
    expect(dsIntervention.explanation_markdown).toContain('Linked List');

    // Must NOT contain BFS/DFS search tree questions from CS101
    expect(dsIntervention.explanation_markdown).not.toContain('Breadth-First Search');
    expect(dsIntervention.explanation_markdown).not.toContain('Admissible Heuristics');

    for (const pq of dsIntervention.practice_questions) {
      expect(pq.question_text.toLowerCase()).not.toContain('breadth-first search');
      expect(pq.question_text.toLowerCase()).not.toContain('branching factor');
    }
  });

  it('allows students to enroll in courses by course ID directly from dropdown selection', () => {
    const courses = db.getCourses();
    expect(courses.length).toBeGreaterThan(0);
    const targetCourse = courses[0];
    const uniqueStudentId = `test-student-${Date.now()}`;

    // Enroll using targetCourse.id directly (simulating dropdown selection)
    const result = db.enrollStudent(targetCourse.id, uniqueStudentId);
    expect(result.success).toBe(true);
    expect(result.course?.id).toBe(targetCourse.id);

    // Enrolling again indicates already enrolled
    const duplicate = db.enrollStudent(targetCourse.id, uniqueStudentId);
    expect(duplicate.success).toBe(true);
    expect(duplicate.message).toContain('Already enrolled');
  });

  it('generates deeply technical progressive assessment hints with operational and mathematical guidance', () => {
    const rawGrounding = `Binary Search: Divides the sorted search space in half with O(log N) comparisons.
De Morgan Laws: Negation of conjunction yields disjunction of negations.
Breadth-First Search: Explores shallowest nodes using a FIFO queue with exponential memory O(b^d).`;

    const packages = generateGroundedFallbackPackages(
      'Algorithms',
      rawGrounding,
      ['remembering', 'understanding', 'application'],
      3
    );

    for (const pkg of packages) {
      expect(pkg.hint_1).toBeDefined();
      expect(pkg.hint_2).toBeDefined();

      // Hints must be substantive and technical
      expect(pkg.hint_1!.length).toBeGreaterThan(25);
      expect(pkg.hint_2!.length).toBeGreaterThan(25);

      // Hints must not contain trivial meta-word count or spelling tricks
      expect(pkg.hint_1!).not.toContain('word(s)');
      expect(pkg.hint_2!).not.toContain('begins with the letter');
      expect(pkg.hint_1!).not.toContain('Review the technical definition of');
    }
  });

  it('tracks intervention status in class analytics to disable duplicate remediation generation', () => {
    const courses = db.getCourses();
    const course = courses[0];
    const analytics = db.getClassAnalytics(course.id);

    expect(analytics).toBeDefined();
    expect(Array.isArray(analytics.studentsNeedingIntervention)).toBe(true);

    if (analytics.studentsNeedingIntervention.length > 0) {
      const studentItem = analytics.studentsNeedingIntervention[0];
      expect(studentItem).toHaveProperty('hasIntervention');
      expect(typeof studentItem.hasIntervention).toBe('boolean');
    }
  });

  it('tracks 3-stage cognitive mastery progression (Diagnostic, Progressive, Final) with percentage points in progress reports', () => {
    const studentId = '00000000-0000-0000-0000-000000000101';
    const courseId = '11111111-1111-1111-1111-111111111111'; // CS101

    const report = db.getProgressReport(studentId, courseId);
    expect(report).toBeDefined();
    expect(report?.baseline_score).toBeDefined();
    expect(report?.progressive_score).toBeDefined();
    expect(report?.final_score).toBeDefined();

    // Verify 3 stages progression
    expect(report!.baseline_score).toBe(70.83);
    expect(report!.progressive_score).toBeGreaterThan(report!.baseline_score);
    expect(report!.final_score).toBeGreaterThan(report!.progressive_score!);
    expect(report!.progressive_score).toBeCloseTo(84.3, 0);
    expect(report!.final_score).toBe(93.33);

    // Percentage points tracking
    expect(report!.progressive_improvement).toBeDefined();
    expect(report!.score_improvement).toBe(22.5);

    // Verify progressive assessment and Bloom's trait details
    expect(report?.trait_details).toBeDefined();
    const traits = Object.keys(report!.trait_details!);
    expect(traits.length).toBeGreaterThan(0);

    for (const trait of traits) {
      const detail = report!.trait_details![trait];
      expect(detail).toHaveProperty('baseline');
      expect(detail).toHaveProperty('progressive');
      expect(detail).toHaveProperty('final');
      expect(detail).toHaveProperty('progressive_delta');
      expect(detail).toHaveProperty('delta');
      expect(typeof detail.baseline).toBe('number');
      expect(typeof detail.progressive).toBe('number');
      expect(typeof detail.final).toBe('number');
      expect(typeof detail.progressive_delta).toBe('number');
      expect(typeof detail.delta).toBe('number');
    }
  });

  it('attaches course metadata to interventions to ensure personalized study picks content from the diagnostic course', () => {
    const studentId = '00000000-0000-0000-0000-000000000101';
    const interventions = db.getInterventions({ studentId, onlyReleased: true });

    expect(interventions.length).toBeGreaterThan(0);
    for (const inv of interventions) {
      expect(inv.course).toBeDefined();
      expect(inv.course?.id).toBe(inv.course_id);
      expect(inv.course?.code).toBeDefined();
      expect(inv.course?.title).toBeDefined();

      // Ensure material is also present
      expect(inv.material).toBeDefined();
      expect(inv.material?.explanation_markdown).toBeDefined();
    }
  });

  it('identifies diagnostic weak traits and calculates Learning Gain G on maximum score', () => {
    const studentId = '00000000-0000-0000-0000-000000000101';
    const courseId = '11111111-1111-1111-1111-111111111111'; // CS101

    // 1. Identify weak traits from diagnostic evaluation
    const weakTraits = db.getStudentDiagnosticWeakTraits(studentId, courseId);
    expect(weakTraits.length).toBeGreaterThan(0);
    expect(weakTraits).toContain('analysis');

    // 2. Report includes Learning Gain (G)
    const report = db.getProgressReport(studentId, courseId);
    expect(report).toBeDefined();
    expect(report?.learning_gain_g).toBeDefined();
    expect(report!.learning_gain_g!).toBeGreaterThan(0);
    expect(report?.learning_gain_interpretation).toBeDefined();
    expect(report?.motivational_message).toBeDefined();
    expect(report!.motivational_message!).toContain('learning gain');

    // 3. Trait details contain both diagnostic baseline and progressive formative profiles
    const traits = Object.keys(report!.trait_details!);
    for (const t of traits) {
      const detail = report!.trait_details![t];
      expect(typeof detail.baseline).toBe('number');
      expect(typeof detail.progressive).toBe('number');
      expect(typeof detail.progressive_delta).toBe('number');
    }
  });
});

