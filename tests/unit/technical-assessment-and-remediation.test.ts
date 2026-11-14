import { describe, it, expect } from 'vitest';
import { db } from '../../lib/db';
import {
  isAdministrativeQuestion,
  sanitizeTechnicalGroundingText,
  generateGroundedFallbackPackages,
} from '../../lib/ai/question-generator';
import { generateCourseSpecificInterventionFallback } from '../../lib/ai/intervention-generator';

describe('Technical Subject Questions & Cross-Course Isolation', () => {
  it('detects and flags administrative / syllabus metadata questions', () => {
    expect(isAdministrativeQuestion('What is the course code for this subject?')).toBe(true);
    expect(isAdministrativeQuestion('What is the course title of CS101?')).toBe(true);
    expect(isAdministrativeQuestion('Who is the instructor for this class?')).toBe(true);
    expect(isAdministrativeQuestion('In which term is this course offered?')).toBe(true);
    expect(isAdministrativeQuestion('How many credits is this course?')).toBe(true);
    expect(isAdministrativeQuestion('What is CO1 in the course syllabus?')).toBe(true);

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
  });

  it('sanitizes grounding text to strip administrative metadata while keeping technical content', () => {
    const rawText = `COURSE SYLLABUS: CS101 — COMPUTATIONAL THINKING
Course Code: CS101
Course Title: Introduction to Computer Science & AI
Instructor: Dr. Alan Turing
Term: Fall 2026
Credits: 4
Binary Search requires that the input array is sorted.
Big-O Notation characterizes asymptotic runtime growth.`;

    const sanitized = sanitizeTechnicalGroundingText(rawText);
    expect(sanitized).not.toContain('Course Code:');
    expect(sanitized).not.toContain('Instructor: Dr. Alan Turing');
    expect(sanitized).not.toContain('Term: Fall 2026');
    expect(sanitized).toContain('Binary Search requires that the input array is sorted.');
    expect(sanitized).toContain('Big-O Notation characterizes asymptotic runtime growth.');
  });

  it('generates standard technical assessment questions with zero administrative inquiries', () => {
    const rawGrounding = `Course Code: CS101
Instructor: Alan Turing
Term: Fall 2026
Binary Search: Divides the sorted search space in half with O(log N) comparisons.
De Morgan Laws: Negation of conjunction yields disjunction of negations.
Breadth-First Search: Explores shallowest nodes using a FIFO queue with exponential memory O(b^d).
Depth-First Search: Explores deepest paths using a LIFO stack with linear memory O(b*d).`;

    const packages = generateGroundedFallbackPackages(
      'CS101: Introduction to Computer Science & AI',
      rawGrounding,
      ['remembering', 'understanding', 'application', 'analysis'],
      4
    );

    expect(packages.length).toBe(4);
    for (const pkg of packages) {
      // Must NOT be an administrative question
      expect(isAdministrativeQuestion(pkg.question_text)).toBe(false);
      expect(pkg.question_text).not.toContain('Course Code');
      expect(pkg.correct_answer).not.toBe('CS101');
      expect(pkg.correct_answer).not.toBe('Fall 2026');
      expect(pkg.correct_answer).not.toBe('Alan Turing');
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
});

