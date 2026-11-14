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
        email: 'rajesh.sharma@adaptivelearn.ai',
        full_name: 'Dr. Rajesh Sharma',
        role: 'faculty',
        avatar_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
        institution: 'Smart Institute of Technology',
        created_at: new Date().toISOString(),
      },
      {
        id: '00000000-0000-0000-0000-000000000002',
        email: 'ananya.iyer@adaptivelearn.ai',
        full_name: 'Dr. Ananya Iyer',
        role: 'faculty',
        avatar_url: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150',
        institution: 'Smart Institute of Technology',
        created_at: new Date().toISOString(),
      },
      {
        id: '00000000-0000-0000-0000-000000000003',
        email: 'vikram.deshmukh@adaptivelearn.ai',
        full_name: 'Prof. Vikram Deshmukh',
        role: 'faculty',
        avatar_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
        institution: 'Smart Institute of Technology',
        created_at: new Date().toISOString(),
      }
    );

    // 2. 25 Indian Student Profiles
    const studentNames = [
      'Aarav Patel', 'Rohan Mehta', 'Priya Nair', 'Aditya Verma', 'Sneha Kulkarni',
      'Ishaan Gupta', 'Kavya Reddy', 'Rahul Joshi', 'Ananya Rao', 'Siddharth Malhotra',
      'Neha Pillai', 'Arjun Das', 'Meera Nambiar', 'Karan Bhatia', 'Ritu Singhania',
      'Devendra Prasad', 'Tanvi Saxena', 'Manish Chawla', 'Pooja Hegde', 'Vivek Sengupta',
      'Shreya Mukherjee', 'Abhinav Mishra', 'Divya Srinivasan', 'Kunal Agrawal', 'Rhea Kapoor'
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
        title: 'Module 1: Computational Thinking & Algorithmic Abstraction',
        description: 'Decomposition, pattern recognition, abstraction, Big-O complexity, and binary search bounds.',
        order_index: 1,
        learning_objectives: [
          'Master algorithmic decomposition and state transformation.',
          'Calculate asymptotic time complexity bounds using Big-O notation.',
          'Implement logarithmic binary search on ordered sequences.',
        ],
        notes_markdown: `# Module 1: Computational Thinking & Algorithmic Abstraction

## 1. Module Overview & Learning Objectives
This module introduces the mathematical foundations of computational thinking, algorithmic efficiency, and asymptotic complexity analysis.
- Understand how computational problems are decomposed into unambiguous instructions.
- Analyze growth rates of algorithms using **Big-O notation**.
- Contrast logarithmic $O(\\log N)$, linear $O(N)$, and quadratic $O(N^2)$ execution costs.

## 2. Foundational Principles & Core Concepts
### Computational Abstraction & Growth Rates
Algorithms are finite sequences of rigorous instructions transforming inputs to outputs.
- **Constant Time $O(1)$**: Accessing an array element by index.
- **Logarithmic Time $O(\\log N)$**: Halving the search range iteratively (Binary Search).
- **Linear Time $O(N)$**: Scanning an unsorted sequence.
- **Linearithmic Time $O(N \\log N)$**: Optimal comparison sorting (MergeSort, QuickSort average).
- **Quadratic Time $O(N^2)$**: Nested loops such as Bubble Sort or brute-force pair comparisons.

### Binary Search Mechanics
Binary Search requires an **ordered** (sorted) array. By repeatedly testing the median element:
$$\\text{Max Comparisons} = \\lceil \\log_2(N) \\rceil$$
For an array of $N = 1024$ items, exactly $\\log_2(1024) = 10$ comparisons are performed in the worst case.

## 3. Key Terminology & Definitions
| Term | Academic Definition |
| :--- | :--- |
| **Big-O** | Formal asymptotic notation describing the worst-case growth rate upper bound. |
| **Binary Search** | Divide-and-conquer search executing in logarithmic $O(\\log N)$ time. |
| **Asymptotic Bound** | Mathematical limit of runtime behavior as input size $N \\to \\infty$. |

## 4. Quick Revision & Key Takeaways
- Sorting is a mandatory prerequisite for Binary Search.
- Halving the problem size at each step produces logarithmic time complexity $O(\\log N)$.
- Review logarithmic vs linearithmic complexity before taking the Module 1 Diagnostic Assessment.`,
        created_at: new Date().toISOString(),
      },
      {
        id: '22222222-2222-2222-2222-222222222222',
        course_id: '11111111-1111-1111-1111-111111111111',
        title: 'Module 2: Discrete Logic & Boolean Algebra',
        description: 'Logic gates, truth tables, propositional logic, and De Morgan algebraic simplifications.',
        order_index: 2,
        learning_objectives: [
          'Evaluate truth tables and Boolean operations (AND, OR, NOT, XOR).',
          'Prove logical equivalence using De Morgan Laws.',
          'Simplify digital control logic for decision systems.',
        ],
        notes_markdown: `# Module 2: Discrete Logic & Boolean Algebra

## 1. Module Overview & Learning Objectives
This module establishes formal propositional logic and Boolean algebraic structures fundamental to digital computation and artificial intelligence knowledge representation.
- Define fundamental truth valuations for propositional connectives.
- Apply **De Morgan's Laws** to transform compound expressions.
- Analyze circuit simplifications using Boolean duality.

## 2. Foundational Principles & Core Concepts
### Boolean Logic Gates
Boolean variables take one of two truth values: $\\text{True } (1)$ or $\\text{False } (0)$.
- **AND $(\\land)$**: True exclusively when both operands are True.
- **OR $(\\lor)$**: True when at least one operand is True.
- **NOT $(\\neg)$**: Inverts the logical valuation.
- **XOR $(\\oplus)$**: True if and only if operands have differing truth values.

### De Morgan's Laws
The negation of a conjunction yields a disjunction of negations, and vice-versa:
1. $$\\neg (A \\land B) \\iff (\\neg A) \\lor (\\neg B)$$
2. $$\\neg (A \\lor B) \\iff (\\neg A) \\land (\\neg B)$$
*Common Student Error*: Do NOT distribute negation without flipping the central connective (AND flips to OR, OR flips to AND).

## 3. Key Terminology & Definitions
| Term | Formal Definition |
| :--- | :--- |
| **Proposition** | A declarative statement that is deterministically either True or False. |
| **Tautology** | A compound formula that evaluates to True under all truth assignments. |
| **De Morgan's Theorem** | Dual rules expressing connectives in terms of their negations. |

## 4. Quick Revision & Key Takeaways
- Negating $(A \\text{ AND } B)$ yields $(\\text{NOT } A \\text{ OR } \\text{NOT } B)$.
- XOR outputs False when both inputs are True.`,
        created_at: new Date().toISOString(),
      },
      {
        id: '22222222-2222-2222-2222-222222222223',
        course_id: '11111111-1111-1111-1111-111111111111',
        title: 'Module 3: Introduction to AI & Search Strategies',
        description: 'State space graph exploration, Breadth-First Search, Depth-First Search, and Admissible Heuristics.',
        order_index: 3,
        learning_objectives: [
          'Formulate state-space graphs with states, actions, and transition costs.',
          'Discriminate BFS queue vs DFS stack memory and optimality trade-offs.',
          'Formulate admissible and consistent heuristic evaluation functions for A* search.',
        ],
        notes_markdown: `# Module 3: Introduction to AI & Search Strategies

## 1. Module Overview & Learning Objectives
This module investigates foundational graph and state-space exploration algorithms that power automated reasoning, path planning, and artificial intelligence solvers.
- Model problem domains as state-space graphs $(S, A, T, G)$.
- Contrast the memory complexity of **BFS** $O(b^d)$ vs **DFS** $O(b \\cdot d)$.
- Apply the criterion of **admissibility** to heuristic functions $h(n)$.

## 2. Foundational Principles & Core Concepts
### Uninformed Search Algorithms
- **Breadth-First Search (BFS)**: Explores shallowest unexplored nodes first using a **FIFO (First-In, First-Out) Queue**.
  - *Completeness*: Complete for finite branching factor $b$.
  - *Optimality*: Guarantees the shortest path on unweighted graphs.
  - *Space Complexity*: Exponential $O(b^d)$ — memory overflow is the primary failure mode.
- **Depth-First Search (DFS)**: Explores deepest frontiers first using a **LIFO (Last-In, First-Out) Stack**.
  - *Space Complexity*: Linear memory $O(b \\cdot d)$, making it vastly more RAM-efficient.
  - *Optimality*: Not optimal; can traverse infinite cycles without cycle detection.

### Heuristic Search & Admissibility
In informed search algorithms like $A^*$, evaluation combines exact path cost $g(n)$ with estimated future cost $h(n)$:
$$f(n) = g(n) + h(n)$$
A heuristic function $h(n)$ is defined as **admissible** if:
$$h(n) \\le h^*(n) \\quad \\forall n$$
Where $h^*(n)$ represents the true minimal cost to achieve the goal from node $n$. An admissible heuristic never overestimates the true cost, guaranteeing finding an optimal solution.

## 3. Key Terminology & Definitions
| Algorithm / Concept | Memory Complexity | Optimality (Unweighted) | Frontier Structure |
| :--- | :--- | :--- | :--- |
| **BFS** | $O(b^d)$ (Exponential) | **Yes** (Guaranteed) | FIFO Queue |
| **DFS** | $O(b \\cdot d)$ (Linear) | No | LIFO Stack |
| **IDDFS** | $O(b \\cdot d)$ (Linear) | **Yes** (Guaranteed) | Iterative DFS |
| **A* Search** | $O(b^d)$ (Exponential) | **Yes** (if admissible) | Priority Queue |

## 4. Quick Revision & Key Takeaways
- BFS utilizes a FIFO Queue and requires exponential memory $O(b^d)$.
- DFS utilizes a LIFO Stack and has linear memory $O(b \\cdot d)$.
- An admissible heuristic never overestimates the minimal distance to the goal.`,
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

    // 8. Module-wise Assessments (Diagnostic & Progressive for each module)
    this.assessments.push(
      // Module 1 Assessments
      {
        id: '55555555-5555-5555-5555-555555555551',
        course_id: '11111111-1111-1111-1111-111111111111',
        module_id: '22222222-2222-2222-2222-222222222221',
        title: 'Module 1: Diagnostic Assessment (Algorithms & Complexity)',
        description: 'Module baseline diagnostic measuring Bloom dimensions. Strictly no hints provided to gauge independent foundation.',
        assessment_type: 'diagnostic',
        status: 'published',
        time_limit_minutes: 25,
        max_marks: 30,
        passing_marks: 15,
        progressive_hints_enabled: false,
        version: 1,
        created_at: new Date().toISOString(),
        published_at: new Date().toISOString(),
      },
      {
        id: '55555555-5555-5555-5555-555555555552',
        course_id: '11111111-1111-1111-1111-111111111111',
        module_id: '22222222-2222-2222-2222-222222222221',
        title: 'Module 1: Progressive Assessment (Algorithms & Complexity)',
        description: 'Formative mastery assessment with up to two progressive hints unlocked on wrong answers.',
        assessment_type: 'progressive',
        status: 'published',
        time_limit_minutes: 35,
        max_marks: 30,
        passing_marks: 15,
        progressive_hints_enabled: true,
        version: 1,
        created_at: new Date().toISOString(),
        published_at: new Date().toISOString(),
      },
      // Module 2 Assessments
      {
        id: '55555555-5555-5555-5555-555555555553',
        course_id: '11111111-1111-1111-1111-111111111111',
        module_id: '22222222-2222-2222-2222-222222222222',
        title: 'Module 2: Diagnostic Assessment (Discrete Logic & Boolean Algebra)',
        description: 'Logic baseline evaluation without hints to measure initial Boolean mastery.',
        assessment_type: 'diagnostic',
        status: 'published',
        time_limit_minutes: 25,
        max_marks: 30,
        passing_marks: 15,
        progressive_hints_enabled: false,
        version: 1,
        created_at: new Date().toISOString(),
        published_at: new Date().toISOString(),
      },
      {
        id: '55555555-5555-5555-5555-555555555554',
        course_id: '11111111-1111-1111-1111-111111111111',
        module_id: '22222222-2222-2222-2222-222222222222',
        title: 'Module 2: Progressive Assessment (Discrete Logic & Boolean Algebra)',
        description: 'Progressive problem solving with up to 2 hints enabled upon incorrect submissions.',
        assessment_type: 'progressive',
        status: 'published',
        time_limit_minutes: 35,
        max_marks: 30,
        passing_marks: 15,
        progressive_hints_enabled: true,
        version: 1,
        created_at: new Date().toISOString(),
        published_at: new Date().toISOString(),
      },
      // Module 3 Assessments
      {
        id: '55555555-5555-5555-5555-555555555555',
        course_id: '11111111-1111-1111-1111-111111111111',
        module_id: '22222222-2222-2222-2222-222222222223',
        title: 'Module 3: Diagnostic Assessment (AI & Search Strategies)',
        description: 'State space search baseline assessment without hints.',
        assessment_type: 'diagnostic',
        status: 'published',
        time_limit_minutes: 25,
        max_marks: 30,
        passing_marks: 15,
        progressive_hints_enabled: false,
        version: 1,
        created_at: new Date().toISOString(),
        published_at: new Date().toISOString(),
      },
      {
        id: '55555555-5555-5555-5555-555555555556',
        course_id: '11111111-1111-1111-1111-111111111111',
        module_id: '22222222-2222-2222-2222-222222222223',
        title: 'Module 3: Progressive Assessment (AI & Search Strategies)',
        description: 'Heuristic and state space search evaluation with 2 progressive hints on wrong answers.',
        assessment_type: 'progressive',
        status: 'published',
        time_limit_minutes: 35,
        max_marks: 30,
        passing_marks: 15,
        progressive_hints_enabled: true,
        version: 1,
        created_at: new Date().toISOString(),
        published_at: new Date().toISOString(),
      },
      // Final Examination
      {
        id: '55555555-5555-5555-5555-555555555557',
        course_id: '11111111-1111-1111-1111-111111111111',
        title: 'Comprehensive Final Examination',
        description: 'Comprehensive university final examination evaluating student mastery across all course modules.',
        assessment_type: 'final',
        status: 'published',
        time_limit_minutes: 45,
        max_marks: 30,
        passing_marks: 15,
        progressive_hints_enabled: false,
        version: 1,
        created_at: new Date().toISOString(),
        published_at: new Date().toISOString(),
      }
    );

    // 9. Diagnostic Questions (6 Bloom Dimensions)
    this.seedQuestions();

    // 10. Sample Diagnostic, Progressive, and Final Attempts for Branden Harris
    this.attempts.push(
      {
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
      },
      {
        id: '77777777-7777-7777-7777-777777777772',
        assessment_id: '55555555-5555-5555-5555-555555555552',
        student_id: '00000000-0000-0000-0000-000000000101',
        attempt_number: 1,
        status: 'evaluated',
        started_at: new Date(Date.now() - 3 * 86400000).toISOString(),
        submitted_at: new Date(Date.now() - 3 * 86400000 + 30 * 60000).toISOString(),
        total_score: 25.25,
        max_score: 30.0,
        percentage: 84.17,
        is_final: true,
      },
      {
        id: '77777777-7777-7777-7777-777777777773',
        assessment_id: '55555555-5555-5555-5555-555555555557',
        student_id: '00000000-0000-0000-0000-000000000101',
        attempt_number: 1,
        status: 'evaluated',
        started_at: new Date(Date.now() - 86400000).toISOString(),
        submitted_at: new Date(Date.now() - 86400000 + 40 * 60000).toISOString(),
        total_score: 28.0,
        max_score: 30.0,
        percentage: 93.33,
        is_final: true,
      }
    );

    // Trait Scores across Diagnostic, Progressive, and Final for Branden Harris
    const student1DiagnosticTraits: Array<[any, number, number, number, any]> = [
      ['remembering', 5.0, 5.0, 100.0, 'moderate'],
      ['understanding', 5.0, 5.0, 100.0, 'moderate'],
      ['application', 5.0, 5.0, 100.0, 'moderate'],
      ['analysis', 2.5, 5.0, 50.0, 'moderate'],
      ['creativity', 1.25, 5.0, 25.0, 'moderate'],
      ['evaluation', 2.5, 5.0, 50.0, 'moderate'],
    ];

    student1DiagnosticTraits.forEach(([trait, earned, possible, pct, conf]) => {
      this.trait_scores.push({
        id: `ts-diag-${trait}`,
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

    const student1ProgressiveTraits: Array<[any, number, number, number, any]> = [
      ['remembering', 5.0, 5.0, 100.0, 'high'],
      ['understanding', 5.0, 5.0, 100.0, 'high'],
      ['application', 5.0, 5.0, 100.0, 'high'],
      ['analysis', 3.75, 5.0, 75.0, 'high'],
      ['creativity', 3.25, 5.0, 65.0, 'moderate'],
      ['evaluation', 3.25, 5.0, 65.0, 'moderate'],
    ];

    student1ProgressiveTraits.forEach(([trait, earned, possible, pct, conf]) => {
      this.trait_scores.push({
        id: `ts-prog-${trait}`,
        attempt_id: '77777777-7777-7777-7777-777777777772',
        student_id: '00000000-0000-0000-0000-000000000101',
        course_id: '11111111-1111-1111-1111-111111111111',
        assessment_id: '55555555-5555-5555-5555-555555555552',
        trait,
        marks_earned: earned,
        marks_possible: possible,
        score_percentage: pct,
        evidence_count: 2,
        confidence: conf,
      });
    });

    const student1FinalTraits: Array<[any, number, number, number, any]> = [
      ['remembering', 5.0, 5.0, 100.0, 'high'],
      ['understanding', 5.0, 5.0, 100.0, 'high'],
      ['application', 5.0, 5.0, 100.0, 'high'],
      ['analysis', 4.75, 5.0, 95.0, 'high'],
      ['creativity', 4.25, 5.0, 85.0, 'high'],
      ['evaluation', 4.0, 5.0, 80.0, 'high'],
    ];

    student1FinalTraits.forEach(([trait, earned, possible, pct, conf]) => {
      this.trait_scores.push({
        id: `ts-final-${trait}`,
        attempt_id: '77777777-7777-7777-7777-777777777773',
        student_id: '00000000-0000-0000-0000-000000000101',
        course_id: '11111111-1111-1111-1111-111111111111',
        assessment_id: '55555555-5555-5555-5555-555555555557',
        trait,
        marks_earned: earned,
        marks_possible: possible,
        score_percentage: pct,
        evidence_count: 3,
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

    // 12. Progress Report for Branden Harris: Diagnostic Baseline -> Progressive Assessment -> Final Mastery
    this.progress_reports.push({
      id: 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbb1',
      student_id: '00000000-0000-0000-0000-000000000101',
      course_id: '11111111-1111-1111-1111-111111111111',
      baseline_assessment_id: '55555555-5555-5555-5555-555555555551',
      progressive_assessment_id: '55555555-5555-5555-5555-555555555552',
      final_assessment_id: '55555555-5555-5555-5555-555555555557',
      baseline_score: 70.83,
      progressive_score: 84.17,
      final_score: 93.33,
      score_improvement: 22.5,
      progressive_improvement: 13.34,
      learning_gain_g: 13.34,
      learning_gain_interpretation: 'Substantial Mastery Leap (High Gain)',
      motivational_message: 'Outstanding cognitive acceleration! Your progressive assessment learning gain of +13.3% shows you turned diagnostic friction in Analysis and Creativity into major mastery breakthroughs!',
      trait_improvements: {
        remembering: 0.0,
        understanding: 0.0,
        application: 0.0,
        analysis: 45.0,
        creativity: 60.0,
        evaluation: 30.0,
      },
      progressive_trait_improvements: {
        remembering: 0.0,
        understanding: 0.0,
        application: 0.0,
        analysis: 25.0,
        creativity: 40.0,
        evaluation: 15.0,
      },
      evidence_counts: {
        remembering: 3,
        understanding: 3,
        application: 3,
        analysis: 3,
        creativity: 3,
        evaluation: 3,
      },
      summary_narrative: 'Aarav demonstrated measurable cognitive progression from Diagnostic Baseline (70.8%) through Progressive Formative Assessment (84.2%, +13.3 pp) to Final Examination (93.3%, +22.5 pp overall). Strongest gains occurred in Creativity (+60.0 pp) and Analysis (+45.0 pp).',
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
        hint_1: 'Analyze the recurrence relation for Binary Search: T(N) = T(N/2) + O(1). At each comparison, the search interval [low, high] is bisected in half.',
        hint_2: 'Repeated bisection terminates when the subarray reaches size 1. The number of division steps k satisfies 2^k = N, yielding k = log2(N) which gives worst-case O(log N).',
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
        hint_1: 'Apply De Morgan\'s duality theorem: distributing negation across a conjunction (AND) inverts both boolean literals AND inverts the logical operator.',
        hint_2: 'The formal equivalence states NOT (A AND B) ≡ (NOT A) OR (NOT B). The central operator MUST become OR (disjunction), which makes the statement False.',
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
        hint_1: 'Binary search worst-case comparison count is given by ceil(log2(N)). Express N = 1024 as an exact power of 2: 2^k = 1024.',
        hint_2: 'Compute the powers of two: 2^8 = 256, 2^9 = 512, and 2^10 = 1024. Therefore, k = log2(1024) = 10 maximum comparisons.',
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
        hint_1: 'Examine BFS operational mechanics: BFS discovers all vertices at depth d before depth d+1 using a FIFO queue, guaranteeing minimal edge paths on unweighted graphs.',
        hint_2: 'Because BFS must retain all unexplored nodes at the current frontier in memory simultaneously, its spatial complexity is O(b^d). Conversely, LIFO stacks belong to DFS, not BFS.',
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
        hint_1: 'In A* search optimality theory, a heuristic function h(n) guarantees an optimal solution if it satisfies h(n) <= h*(n) for all nodes n, where h*(n) is the true minimal cost to the goal.',
        hint_2: 'A heuristic that satisfies 0 <= h(n) <= h*(n) and never overestimates the true remaining distance is formally defined as an "admissible" heuristic.',
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
        hint_1: 'Evaluate memory bounds: on a 32 KB microcontroller, BFS requires O(b^d) exponential queue memory which causes immediate RAM exhaustion. DFS uses O(b*d) linear memory but gets trapped in infinite cycles.',
        hint_2: 'Iterative Deepening Depth-First Search (IDDFS) visits nodes order by order using depth-limited DFS with O(b*d) linear stack memory while guaranteeing BFS completeness and optimality.',
      },
    ];

    const progressiveQList = qList.map((q, idx) => ({
      ...q,
      id: `66666666-6666-6666-6666-66666666667${idx + 1}`,
      assessment_id: '55555555-5555-5555-5555-555555555552',
    }));

    [...qList, ...progressiveQList].forEach((q) => {
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

    // Also populate questions for Module 1 Progressive Assessment
    qList.forEach((q, idx) => {
      const progId = `66666666-6666-6666-6666-77777777777${idx + 1}`;
      this.questions.push({
        id: progId,
        assessment_id: '55555555-5555-5555-5555-555555555552',
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
        id: `ak-${progId}`,
        question_id: progId,
        correct_answer: q.correct_answer,
        accepted_variations: q.accepted_variations,
        evaluation_method: 'deterministic',
        explanation: q.explanation,
      });

      this.question_hints.push(
        {
          id: `h1-${progId}`,
          question_id: progId,
          hint_number: 1,
          hint_text: q.hint_1,
          penalty_percentage: 25.0,
        },
        {
          id: `h2-${progId}`,
          question_id: progId,
          hint_number: 2,
          hint_text: q.hint_2,
          penalty_percentage: 50.0,
        }
      );
    });

    // Also populate questions for Final Examination
    qList.forEach((q, idx) => {
      const finalQId = `66666666-6666-6666-6666-88888888888${idx + 1}`;
      this.questions.push({
        id: finalQId,
        assessment_id: '55555555-5555-5555-5555-555555555557',
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
        id: `ak-${finalQId}`,
        question_id: finalQId,
        correct_answer: q.correct_answer,
        accepted_variations: q.accepted_variations,
        evaluation_method: 'deterministic',
        explanation: q.explanation,
      });

      this.question_hints.push(
        {
          id: `h1-${finalQId}`,
          question_id: finalQId,
          hint_number: 1,
          hint_text: q.hint_1,
          penalty_percentage: 25.0,
        },
        {
          id: `h2-${finalQId}`,
          question_id: finalQId,
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

