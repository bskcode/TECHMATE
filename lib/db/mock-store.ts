// ====================================================================
// ADAPTIVELEARN AI — In-Memory & Seeded Persistent Store
// Provides 100% complete seed state with real data matching 003_seed_data.sql
// ====================================================================

import fs from 'fs';
import path from 'path';
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
  QuestionRubric,
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

class MemoryDatabase {
  public profiles: Profile[] = [];
  public courses: Course[] = [];
  public enrollments: Enrollment[] = [];
  public modules: Module[] = [];
  public course_outcomes: CourseOutcome[] = [];
  public learning_materials: LearningMaterial[] = [];
  public assessments: Assessment[] = [];
  public questions: Question[] = [];
  public question_answer_keys: QuestionAnswerKey[] = [];
  public question_rubrics: QuestionRubric[] = [];
  public question_hints: QuestionHint[] = [];
  public attempts: Attempt[] = [];
  public responses: StudentResponse[] = [];
  public evaluations: EvaluationRecord[] = [];
  public hint_events: HintEvent[] = [];
  public trait_scores: TraitScore[] = [];
  public interventions: Intervention[] = [];
  public intervention_materials: InterventionMaterial[] = [];
  public practice_questions: PracticeQuestion[] = [];
  public practice_attempts: PracticeAttempt[] = [];
  public progress_reports: ProgressReport[] = [];

  constructor() {
    if (!this.loadFromDisk()) {
      this.seedInitialData();
      this.saveToDisk();
    }
  }

  private getDbFilePath(): string {
    return path.join(process.cwd(), '.data', 'adaptivelearn-db.json');
  }

  public loadFromDisk(): boolean {
    try {
      const filePath = this.getDbFilePath();
      if (!fs.existsSync(filePath)) return false;
      const raw = fs.readFileSync(filePath, 'utf-8');
      const data = JSON.parse(raw);
      const keys: (keyof MemoryDatabase)[] = [
        'profiles', 'courses', 'enrollments', 'modules', 'course_outcomes',
        'learning_materials', 'assessments', 'questions', 'question_answer_keys',
        'question_rubrics', 'question_hints', 'attempts', 'responses', 'evaluations',
        'hint_events', 'trait_scores', 'interventions', 'intervention_materials',
        'practice_questions', 'practice_attempts', 'progress_reports',
      ];
      for (const k of keys) {
        if (Array.isArray(data[k])) {
          (this as any)[k] = data[k];
        }
      }
      return this.profiles.length > 0;
    } catch {
      return false;
    }
  }

  public saveToDisk(): void {
    try {
      const filePath = this.getDbFilePath();
      const dir = path.dirname(filePath);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      const snapshot = {
        profiles: this.profiles,
        courses: this.courses,
        enrollments: this.enrollments,
        modules: this.modules,
        course_outcomes: this.course_outcomes,
        learning_materials: this.learning_materials,
        assessments: this.assessments,
        questions: this.questions,
        question_answer_keys: this.question_answer_keys,
        question_rubrics: this.question_rubrics,
        question_hints: this.question_hints,
        attempts: this.attempts,
        responses: this.responses,
        evaluations: this.evaluations,
        hint_events: this.hint_events,
        trait_scores: this.trait_scores,
        interventions: this.interventions,
        intervention_materials: this.intervention_materials,
        practice_questions: this.practice_questions,
        practice_attempts: this.practice_attempts,
        progress_reports: this.progress_reports,
      };
      fs.writeFileSync(filePath, JSON.stringify(snapshot), 'utf-8');
    } catch {
      // Non-fatal in read-only environments
    }
  }

  private seedInitialData() {
    // 1. Faculty Profiles
    this.profiles.push(
      {
        id: '00000000-0000-0000-0000-000000000001',
        email: 'faculty@adaptivelearn.ai',
        full_name: 'Dr. Aris Thorne',
        role: 'faculty',
        avatar_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
        institution: 'Smart Institute of Technology',
        created_at: new Date().toISOString(),
      },
      {
        id: '00000000-0000-0000-0000-000000000002',
        email: 'maya.lin@adaptivelearn.ai',
        full_name: 'Dr. Maya Lin',
        role: 'faculty',
        avatar_url: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150',
        institution: 'Smart Institute of Technology',
        created_at: new Date().toISOString(),
      },
      {
        id: '00000000-0000-0000-0000-000000000003',
        email: 'marcus.vance@adaptivelearn.ai',
        full_name: 'Prof. Marcus Vance',
        role: 'faculty',
        avatar_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
        institution: 'Smart Institute of Technology',
        created_at: new Date().toISOString(),
      }
    );

    // 2. 25 Student Profiles
    const studentNames = [
      'Branden Harris', 'Charles James', 'Mike Peter', 'Sophia Chen', 'Liam Garcia',
      'Emma Watson', 'Noah Patel', 'Ava Rodriguez', 'Lucas Kim', 'Isabella Morales',
      'Ethan Davis', 'Mia Taylor', 'Oliver Martinez', 'Charlotte Anderson', 'Benjamin Thomas',
      'Amelia Jackson', 'Henry White', 'Harper Harris', 'Alexander Martin', 'Evelyn Thompson',
      'Daniel Garcia', 'Aria Robinson', 'Matthew Clark', 'Scarlett Rodriguez', 'David Lewis'
    ];

    studentNames.forEach((name, i) => {
      const idx = String(101 + i).padStart(3, '0');
      this.profiles.push({
        id: `00000000-0000-0000-0000-000000000${idx}`,
        email: `student${i + 1}@adaptivelearn.ai`,
        full_name: name,
        role: 'student',
        avatar_url: `https://images.unsplash.com/photo-${1500000000000 + i * 1000}?w=150`,
        institution: 'Smart Institute of Technology',
        created_at: new Date().toISOString(),
      });
    });

    // 3. Courses
    this.courses.push(
      {
        id: '11111111-1111-1111-1111-111111111111',
        instructor_id: '00000000-0000-0000-0000-000000000001',
        code: 'CS101',
        title: 'Introduction to Computer Science & AI',
        description: 'Foundations of computational thinking, algorithms, discrete logic, and intelligent systems.',
        enrollment_code: 'CS101A',
        term: 'Fall 2026',
        is_active: true,
        created_at: new Date().toISOString(),
      },
      {
        id: '11111111-1111-1111-1111-111111111112',
        instructor_id: '00000000-0000-0000-0000-000000000002',
        code: 'DS201',
        title: 'Data Structures & Algorithms',
        description: 'Linear and non-linear data structures, trees, graphs, sorting, and algorithmic complexity.',
        enrollment_code: 'DS201B',
        term: 'Fall 2026',
        is_active: true,
        created_at: new Date().toISOString(),
      },
      {
        id: '11111111-1111-1111-1111-111111111113',
        instructor_id: '00000000-0000-0000-0000-000000000003',
        code: 'ML301',
        title: 'Machine Learning Fundamentals',
        description: 'Supervised and unsupervised learning, loss optimization, neural networks, and model evaluation.',
        enrollment_code: 'ML301C',
        term: 'Fall 2026',
        is_active: true,
        created_at: new Date().toISOString(),
      }
    );

    // 4. Enroll Students into CS101
    this.profiles
      .filter((p) => p.role === 'student')
      .forEach((s) => {
        this.enrollments.push({
          id: `e-${s.id}`,
          course_id: '11111111-1111-1111-1111-111111111111',
          student_id: s.id,
          status: 'enrolled',
          enrolled_at: new Date().toISOString(),
        });
      });

    // 5. Modules
    this.modules.push(
      {
        id: '22222222-2222-2222-2222-222222222221',
        course_id: '11111111-1111-1111-1111-111111111111',
        title: 'Module 1: Computational Thinking & Algorithms',
        description: 'Decomposition, pattern recognition, abstraction, and pseudocode design.',
        order_index: 1,
        created_at: new Date().toISOString(),
      },
      {
        id: '22222222-2222-2222-2222-222222222222',
        course_id: '11111111-1111-1111-1111-111111111111',
        title: 'Module 2: Discrete Logic & Boolean Algebra',
        description: 'Logic gates, truth tables, proposition logic, and conditional evaluation.',
        order_index: 2,
        created_at: new Date().toISOString(),
      },
      {
        id: '22222222-2222-2222-2222-222222222223',
        course_id: '11111111-1111-1111-1111-111111111111',
        title: 'Module 3: Introduction to AI & Search Strategies',
        description: 'State space search, breadth-first, depth-first, and heuristics.',
        order_index: 3,
        created_at: new Date().toISOString(),
      }
    );

    // 6. Course Outcomes
    this.course_outcomes.push(
      {
        id: '33333333-3333-3333-3333-333333333331',
        course_id: '11111111-1111-1111-1111-111111111111',
        code: 'CO1',
        description: 'Understand core algorithmic principles and computational abstraction.',
        created_at: new Date().toISOString(),
      },
      {
        id: '33333333-3333-3333-3333-333333333332',
        course_id: '11111111-1111-1111-1111-111111111111',
        code: 'CO2',
        description: 'Apply discrete logic and Boolean simplifications to real-world control systems.',
        created_at: new Date().toISOString(),
      },
      {
        id: '33333333-3333-3333-3333-333333333333',
        course_id: '11111111-1111-1111-1111-111111111111',
        code: 'CO3',
        description: 'Analyze time and space complexity of iterative and recursive search algorithms.',
        created_at: new Date().toISOString(),
      },
      {
        id: '33333333-3333-3333-3333-333333333334',
        course_id: '11111111-1111-1111-1111-111111111111',
        code: 'CO4',
        description: 'Evaluate and formulate intelligent heuristics for state-space exploration.',
        created_at: new Date().toISOString(),
      }
    );

    // 7. Approved Grounding Material
    this.learning_materials.push({
      id: '44444444-4444-4444-4444-444444444441',
      course_id: '11111111-1111-1111-1111-111111111111',
      module_id: '22222222-2222-2222-2222-222222222221',
      uploader_id: '00000000-0000-0000-0000-000000000001',
      filename: 'CS101_Algorithms_and_Complexity_Syllabus.pdf',
      storage_path: 'materials/cs101_syllabus.pdf',
      file_type: 'pdf',
      file_size_bytes: 1048576,
      extracted_text: `COURSE SYLLABUS: CS101 — COMPUTATIONAL THINKING & FOUNDATIONS OF AI
Module 1: Computational Thinking & Algorithmic Abstraction
Algorithms are formal, finite sequences of unambiguous instructions that transform inputs into outputs.
Big-O Notation: Characterizes runtime as input size N grows asymptotically.
- Constant time O(1): Accessing an array element by index.
- Logarithmic time O(log N): Binary search in a sorted array of N elements.
- Linear time O(N): Scanning an unsorted list.
- Linearithmic time O(N log N): MergeSort and QuickSort average case.
- Quadratic time O(N^2): Bubble sort or nested comparison loops.

Binary Search requires that the input array is sorted. It repeatedly divides the search space in half by comparing the target with the median element. At most ceil(log2(N)) comparisons are needed.

Module 2: Discrete Logic & Boolean Algebra
Boolean logic operates on two truth values: True (1) and False (0).
Basic logic gates:
- AND: True only if both inputs are True.
- OR: True if at least one input is True.
- NOT: Inverts the input truth value.
- XOR (Exclusive OR): True if inputs differ (one is True, one is False).
De Morgan's Laws:
1. NOT (A AND B) == (NOT A) OR (NOT B)
2. NOT (A OR B) == (NOT A) AND (NOT B)

Module 3: Introduction to State-Space Search in AI
State-space search models problem solving as navigation through a graph of states connected by transitions (actions).
Breadth-First Search (BFS): Explores shallowest nodes first using a FIFO queue. BFS is complete and optimal for unweighted graphs, but has exponential space complexity O(b^d).
Depth-First Search (DFS): Explores deepest paths first using a LIFO stack. DFS has lower memory complexity O(b*d), but is not optimal and can be trapped in infinite cycles unless visited states are tracked.
Heuristic Search: Uses an evaluation function f(n) = g(n) + h(n), where g(n) is the exact cost from start to node n, and h(n) is the estimated cost from n to goal.
A heuristic is admissible if h(n) <= h*(n) for all n.`,
      character_count: 1980,
      processing_status: 'completed',
      approval_status: 'approved',
      created_at: new Date().toISOString(),
    });

    // 8. Assessments
    this.assessments.push(
      {
        id: '55555555-5555-5555-5555-555555555551',
        course_id: '11111111-1111-1111-1111-111111111111',
        module_id: '22222222-2222-2222-2222-222222222221',
        title: 'CS101 Diagnostic Assessment: Algorithmic Thinking & Logic',
        description: 'Initial cognitive baseline measuring all 6 Bloom dimensions: Remembering, Understanding, Application, Analysis, Creativity, and Evaluation.',
        assessment_type: 'diagnostic',
        status: 'published',
        time_limit_minutes: 30,
        max_marks: 30,
        passing_marks: 15,
        progressive_hints_enabled: true,
        version: 1,
        created_at: new Date().toISOString(),
        published_at: new Date().toISOString(),
      },
      {
        id: '55555555-5555-5555-5555-555555555552',
        course_id: '11111111-1111-1111-1111-111111111111',
        module_id: '22222222-2222-2222-2222-222222222221',
        title: 'CS101 Final Examination: Comprehensive Trait Mastery',
        description: 'Final summative examination evaluating all 6 Bloom traits with the progressive 2-hint assistance mechanism.',
        assessment_type: 'final',
        status: 'published',
        time_limit_minutes: 45,
        max_marks: 30,
        passing_marks: 15,
        progressive_hints_enabled: true,
        version: 1,
        created_at: new Date().toISOString(),
        published_at: new Date().toISOString(),
      }
    );

    // 9. Diagnostic Questions (6 Bloom Dimensions)
    this.seedQuestions();

    // 10. Sample Diagnostic Attempt for Branden Harris
    this.attempts.push({
      id: '77777777-7777-7777-7777-777777777771',
      assessment_id: '55555555-5555-5555-5555-555555555551',
      student_id: '00000000-0000-0000-0000-000000000101',
      attempt_number: 1,
      status: 'evaluated',
      started_at: new Date(Date.now() - 5 * 86400000).toISOString(),
      submitted_at: new Date(Date.now() - 5 * 86400000 + 24 * 60000).toISOString(),
      total_score: 21.25,
      max_score: 30.0,
      percentage: 70.83,
      is_final: true,
    });

    // Trait Scores for Branden Harris
    const student1Traits: Array<[any, number, number, number, any]> = [
      ['remembering', 5.0, 5.0, 100.0, 'moderate'],
      ['understanding', 5.0, 5.0, 100.0, 'moderate'],
      ['application', 5.0, 5.0, 100.0, 'moderate'],
      ['analysis', 2.5, 5.0, 50.0, 'moderate'],
      ['creativity', 1.25, 5.0, 25.0, 'moderate'],
      ['evaluation', 2.5, 5.0, 50.0, 'moderate'],
    ];

    student1Traits.forEach(([trait, earned, possible, pct, conf]) => {
      this.trait_scores.push({
        id: `ts-${trait}`,
        attempt_id: '77777777-7777-7777-7777-777777777771',
        student_id: '00000000-0000-0000-0000-000000000101',
        course_id: '11111111-1111-1111-1111-111111111111',
        assessment_id: '55555555-5555-5555-5555-555555555551',
        trait,
        marks_earned: earned,
        marks_possible: possible,
        score_percentage: pct,
        evidence_count: 1,
        confidence: conf,
      });
    });

    // 11. Released Intervention for Branden Harris
    this.interventions.push({
      id: '88888888-8888-8888-8888-888888888881',
      student_id: '00000000-0000-0000-0000-000000000101',
      course_id: '11111111-1111-1111-1111-111111111111',
      diagnostic_attempt_id: '77777777-7777-7777-7777-777777777771',
      weak_traits: ['analysis', 'creativity'],
      weak_outcomes: ['CO3', 'CO4'],
      status: 'released',
      faculty_notes: 'Branden performed strongly on foundational recall, but had difficulty decomposing graph search memory trade-offs and admissible heuristic design. Please review analogies and complete practice quiz.',
      approved_by: '00000000-0000-0000-0000-000000000001',
      approved_at: new Date(Date.now() - 3 * 86400000).toISOString(),
      released_at: new Date(Date.now() - 3 * 86400000).toISOString(),
      created_at: new Date(Date.now() - 3 * 86400000).toISOString(),
    });

    this.intervention_materials.push({
      id: '99999999-9999-9999-9999-999999999991',
      intervention_id: '88888888-8888-8888-8888-888888888881',
      title: 'Targeted Remediation: Graph Search Decomposition & Heuristic Design',
      learning_gap_summary: 'Difficulty distinguishing memory tradeoffs in graph search (BFS vs DFS) and formulating admissible heuristic properties.',
      explanation_markdown: `# Mastering State Space Search & Heuristics

## 1. The Core Trade-off: Space vs Completeness
When evaluating **Breadth-First Search (BFS)** versus **Depth-First Search (DFS)**, remember this fundamental distinction:
- **BFS** explores like ripples expanding on a pond. It touches every neighbor at distance 1, then distance 2.
  - Advantage: Guaranteed to discover the shortest path in unweighted graphs.
  - Bottleneck: Memory! It must retain every node in the active frontier: $O(b^d)$ space.
- **DFS** explores like a maze explorer following a single left wall until dead end.
  - Advantage: Memory footprint is lean: $O(b \\cdot d)$ linear space.
  - Bottleneck: Can wander down infinite loops if not tracking visited nodes.

## 2. Admissible Heuristics Demystified
A heuristic $h(n)$ is **admissible** if:
$$h(n) \\le h^*(n) \\quad \\text{for all } n$$
Where $h^*(n)$ is the true shortest cost from node $n$ to the goal.

**Think of it as an optimistic navigator**: An admissible GPS always underestimates or exactly predicts your remaining travel time. It NEVER says "it will take 50 minutes" when it only takes 30 minutes.`,
      worked_examples: [
        {
          step: 1,
          description: 'Analyzing Memory in BFS: For branching factor b=10 at depth d=5, BFS stores 10^5 = 100,000 nodes in RAM. At 1 KB per node, this consumes ~100 MB.',
        },
        {
          step: 2,
          description: 'Analyzing Memory in DFS: For the same tree, DFS stores only b*d = 10 * 5 = 50 nodes in RAM, consuming a mere ~50 KB of memory.',
        },
      ],
      analogies: [
        {
          concept: 'BFS Memory Explosion',
          analogy: 'Imagine searching for a book in a library by reading the first page of every single book on floor 1, then floor 2, keeping all opened books on your desk. Your desk quickly runs out of space!',
        },
      ],
      revision_checklist: [
        'Can you state the Big-O space complexity of BFS and DFS from memory?',
        'Do you know why admissible heuristics guarantee A* optimality?',
        'Can you identify if a given heuristic ever overestimates true cost?',
      ],
      recommended_next_steps: [
        'Complete the practice questions below.',
        'Review the worked examples by hand.',
        'Take the Final Assessment to verify your mastery growth.',
      ],
      grounding_material_ids: ['44444444-4444-4444-4444-444444444441'],
    });

    this.practice_questions.push({
      id: 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa1',
      intervention_id: '88888888-8888-8888-8888-888888888881',
      order_index: 1,
      question_text: 'If a road network has a straight-line distance of 15 km between City A and City B, which heuristic estimate h(A) would be INADMISSIBLE?',
      options: ['10 km', '14.5 km', '15 km', '18 km'],
      correct_answer: '18 km',
      explanation: 'An admissible heuristic must never overestimate true cost. Since straight-line distance is 15 km, an estimate of 18 km overestimates the straight-line minimum, making it inadmissible.',
      trait: 'creativity',
    });

    // 12. Progress Report for Branden Harris (+22.5 pp overall improvement)
    this.progress_reports.push({
      id: 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbb1',
      student_id: '00000000-0000-0000-0000-000000000101',
      course_id: '11111111-1111-1111-1111-111111111111',
      baseline_assessment_id: '55555555-5555-5555-5555-555555555551',
      final_assessment_id: '55555555-5555-5555-5555-555555555552',
      baseline_score: 70.83,
      final_score: 93.33,
      score_improvement: 22.5,
      trait_improvements: {
        remembering: 0.0,
        understanding: 0.0,
        application: 0.0,
        analysis: 45.0,
        creativity: 60.0,
        evaluation: 30.0,
      },
      evidence_counts: {
        remembering: 2,
        understanding: 2,
        application: 2,
        analysis: 2,
        creativity: 2,
        evaluation: 2,
      },
      summary_narrative: 'Branden achieved exceptional improvement after completing the targeted remediation package in State-Space Search and Heuristics. Analysis increased by +45.0 percentage points, Creativity improved by +60.0 pp, and Evaluation improved by +30.0 pp.',
      generated_at: new Date(Date.now() - 86400000).toISOString(),
    });
  }

  private seedQuestions() {
    const qList = [
      {
        id: '66666666-6666-6666-6666-666666666661',
        assessment_id: '55555555-5555-5555-5555-555555555551',
        order_index: 1,
        question_text: 'What is the worst-case time complexity of Binary Search on a sorted array of N elements?',
        question_type: 'mcq' as const,
        options: ['O(1)', 'O(log N)', 'O(N)', 'O(N log N)'],
        max_marks: 5,
        primary_trait: 'remembering' as const,
        difficulty: 'easy' as const,
        approval_status: 'approved' as const,
        course_outcome_ids: ['33333333-3333-3333-3333-333333333331'],
        grounding_material_ids: ['44444444-4444-4444-4444-444444444441'],
        source_reference: 'Module 1: Binary Search Time Complexity',
        created_at: new Date().toISOString(),
        correct_answer: 'O(log N)',
        accepted_variations: ['O(log N)', 'O(log(N))', 'O(logn)'],
        explanation: 'Binary search halves the search space with each comparison step, leading to logarithmic worst-case time complexity O(log N).',
        hint_1: 'Consider how the search space shrinks: the array size is divided by 2 at every step.',
        hint_2: 'Inverse of exponentiation 2^k = N gives k = log2(N).',
      },
      {
        id: '66666666-6666-6666-6666-666666666662',
        assessment_id: '55555555-5555-5555-5555-555555555551',
        order_index: 2,
        question_text: 'According to De Morgan\'s laws, the expression NOT (A AND B) is logically equivalent to (NOT A) AND (NOT B).',
        question_type: 'true_false' as const,
        options: ['True', 'False'],
        max_marks: 5,
        primary_trait: 'understanding' as const,
        difficulty: 'easy' as const,
        approval_status: 'approved' as const,
        course_outcome_ids: ['33333333-3333-3333-3333-333333333332'],
        grounding_material_ids: ['44444444-4444-4444-4444-444444444441'],
        source_reference: 'Module 2: De Morgan\'s Laws',
        created_at: new Date().toISOString(),
        correct_answer: 'False',
        accepted_variations: ['False', 'false', 'F'],
        explanation: 'By De Morgan\'s law, NOT (A AND B) expands to (NOT A) OR (NOT B), not AND.',
        hint_1: 'Recall how distributing a NOT over a conjunction changes the central operator.',
        hint_2: 'The conjunction AND flips to disjunction OR: NOT (A AND B) = (NOT A) OR (NOT B).',
      },
      {
        id: '66666666-6666-6666-6666-666666666663',
        assessment_id: '55555555-5555-5555-5555-555555555551',
        order_index: 3,
        question_text: 'How many maximum comparisons are needed to search for an integer in a sorted array of 1024 elements using Binary Search?',
        question_type: 'numeric' as const,
        max_marks: 5,
        primary_trait: 'application' as const,
        difficulty: 'medium' as const,
        approval_status: 'approved' as const,
        course_outcome_ids: ['33333333-3333-3333-3333-333333333331'],
        grounding_material_ids: ['44444444-4444-4444-4444-444444444441'],
        source_reference: 'Module 1: Binary Search Comparisons',
        created_at: new Date().toISOString(),
        correct_answer: '10',
        accepted_variations: ['10', '10 comparisons', '10.0'],
        explanation: 'Since 2^10 = 1024, log2(1024) = 10 comparisons are needed in the worst case.',
        hint_1: 'Express 1024 as an exact power of 2: 2^k = 1024.',
        hint_2: '2^1 = 2, 2^2 = 4 ... 2^8 = 256, 2^9 = 512, 2^10 = 1024. Therefore k = 10.',
      },
      {
        id: '66666666-6666-6666-6666-666666666664',
        assessment_id: '55555555-5555-5555-5555-555555555551',
        order_index: 4,
        question_text: 'Which of the following characteristics accurately describe Breadth-First Search (BFS)? (Select all that apply)',
        question_type: 'multiple_select' as const,
        options: [
          'Uses a FIFO queue data structure',
          'Has exponential memory complexity O(b^d)',
          'Guarantees shortest path on unweighted graphs',
          'Uses a LIFO stack data structure',
        ],
        max_marks: 5,
        primary_trait: 'analysis' as const,
        difficulty: 'medium' as const,
        approval_status: 'approved' as const,
        course_outcome_ids: ['33333333-3333-3333-3333-333333333333'],
        grounding_material_ids: ['44444444-4444-4444-4444-444444444441'],
        source_reference: 'Module 3: BFS Properties',
        created_at: new Date().toISOString(),
        correct_answer: 'Uses a FIFO queue data structure, Has exponential memory complexity O(b^d), Guarantees shortest path on unweighted graphs',
        accepted_variations: ['0,1,2', 'A,B,C'],
        explanation: 'BFS explores layer by layer using a FIFO queue, finds the shortest path on unweighted graphs, and requires storing all frontier nodes (O(b^d) space).',
        hint_1: 'Remember that BFS explores level by level, requiring FIFO order rather than LIFO.',
        hint_2: 'Three of the four statements are true properties of BFS; stacks belong to DFS.',
      },
      {
        id: '66666666-6666-6666-6666-666666666665',
        assessment_id: '55555555-5555-5555-5555-555555555551',
        order_index: 5,
        question_text: 'In informed search algorithms like A*, the heuristic function h(n) is said to be ________ if it never overestimates the true cost to reach the goal.',
        question_type: 'fill_in_blank' as const,
        max_marks: 5,
        primary_trait: 'creativity' as const,
        difficulty: 'medium' as const,
        approval_status: 'approved' as const,
        course_outcome_ids: ['33333333-3333-3333-3333-333333333334'],
        grounding_material_ids: ['44444444-4444-4444-4444-444444444441'],
        source_reference: 'Module 3: Heuristic Properties',
        created_at: new Date().toISOString(),
        correct_answer: 'admissible',
        accepted_variations: ['admissible', 'Admissible', 'admissable', 'ADMISSIBLE'],
        explanation: 'An admissible heuristic never overestimates the actual minimal cost to reach the goal state, which guarantees optimality for A* search.',
        hint_1: 'The word starts with "adm" and means acceptable or permissible in the context of optimality proofs.',
        hint_2: 'It rhymes with "permissible": a-d-m-i-s-s-i-b-l-e.',
      },
      {
        id: '66666666-6666-6666-6666-666666666666',
        assessment_id: '55555555-5555-5555-5555-555555555551',
        order_index: 6,
        question_text: 'A robotics engineer must choose a search algorithm for a maze solver on an embedded microcontroller with only 32 KB of RAM. If paths may contain cycles and memory exhaustion is fatal, which strategy is best evaluated as most appropriate?',
        question_type: 'mcq' as const,
        options: [
          'Unbounded Breadth-First Search (BFS)',
          'Iterative Deepening Search with visited node hashing (IDDFS)',
          'Depth-First Search without cycle detection',
          'Exhaustive Bidirectional BFS',
        ],
        max_marks: 5,
        primary_trait: 'evaluation' as const,
        difficulty: 'hard' as const,
        approval_status: 'approved' as const,
        course_outcome_ids: ['33333333-3333-3333-3333-333333333333'],
        grounding_material_ids: ['44444444-4444-4444-4444-444444444441'],
        source_reference: 'Module 3: Algorithmic Trade-offs',
        created_at: new Date().toISOString(),
        correct_answer: 'Iterative Deepening Search with visited node hashing (IDDFS)',
        accepted_variations: ['Iterative Deepening Search with visited node hashing (IDDFS)', 'IDDFS', 'Iterative Deepening Search'],
        explanation: 'IDDFS combines the minimal linear memory requirements of DFS (O(b*d)) with the completeness and optimality of BFS, making it ideal for memory-constrained embedded systems.',
        hint_1: 'Evaluate which algorithm has O(b*d) linear memory while still guaranteeing complete and optimal paths.',
        hint_2: 'Iterative Deepening Search repeatedly runs depth-limited DFS up to depth d, using minimal memory.',
      },
    ];

    qList.forEach((q) => {
      this.questions.push({
        id: q.id,
        assessment_id: q.assessment_id,
        order_index: q.order_index,
        question_text: q.question_text,
        question_type: q.question_type,
        options: q.options,
        max_marks: q.max_marks,
        primary_trait: q.primary_trait,
        difficulty: q.difficulty,
        approval_status: q.approval_status,
        course_outcome_ids: q.course_outcome_ids,
        grounding_material_ids: q.grounding_material_ids,
        source_reference: q.source_reference,
        created_at: q.created_at,
      });

      this.question_answer_keys.push({
        id: `ak-${q.id}`,
        question_id: q.id,
        correct_answer: q.correct_answer,
        accepted_variations: q.accepted_variations,
        evaluation_method: 'deterministic',
        explanation: q.explanation,
      });

      this.question_hints.push(
        {
          id: `h1-${q.id}`,
          question_id: q.id,
          hint_number: 1,
          hint_text: q.hint_1,
          penalty_percentage: 25.0,
        },
        {
          id: `h2-${q.id}`,
          question_id: q.id,
          hint_number: 2,
          hint_text: q.hint_2,
          penalty_percentage: 50.0,
        }
      );
    });
  }
}

// Global Singleton Memory Database for Next.js hot reload
const globalForDb = globalThis as unknown as { mockDb: MemoryDatabase };
export const mockDb = globalForDb.mockDb || new MemoryDatabase();
if (process.env.NODE_ENV !== 'production') globalForDb.mockDb = mockDb;

