-- ====================================================================
-- ADAPTIVELEARN AI — 003_seed_data.sql
-- Demonstration Dataset with Institutional Data, 3 Faculty, 3 Courses,
-- 25 Students, Modules, Outcomes, Approved Materials, Assessments,
-- Pre-Generated Question Packages, Responses, Hints, Trait Scores,
-- Interventions, and Progress Reports
-- ====================================================================

-- 1. SEED FACULTY PROFILES
INSERT INTO public.profiles (id, email, full_name, role, avatar_url, institution) VALUES
('00000000-0000-0000-0000-000000000001', 'faculty@adaptivelearn.ai', 'Dr. Aris Thorne', 'faculty', 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150', 'Smart Institute of Technology'),
('00000000-0000-0000-0000-000000000002', 'maya.lin@adaptivelearn.ai', 'Dr. Maya Lin', 'faculty', 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150', 'Smart Institute of Technology'),
('00000000-0000-0000-0000-000000000003', 'marcus.vance@adaptivelearn.ai', 'Prof. Marcus Vance', 'faculty', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150', 'Smart Institute of Technology')
ON CONFLICT (id) DO UPDATE SET full_name = EXCLUDED.full_name;

-- 2. SEED COURSES
INSERT INTO public.courses (id, instructor_id, code, title, description, enrollment_code, term, is_active) VALUES
('11111111-1111-1111-1111-111111111111', '00000000-0000-0000-0000-000000000001', 'CS101', 'Introduction to Computer Science & AI', 'Foundations of computational thinking, algorithms, discrete logic, and intelligent systems.', 'CS101A', 'Fall 2026', true),
('11111111-1111-1111-1111-111111111112', '00000000-0000-0000-0000-000000000002', 'DS201', 'Data Structures & Algorithms', 'Linear and non-linear data structures, trees, graphs, sorting, and algorithmic complexity.', 'DS201B', 'Fall 2026', true),
('11111111-1111-1111-1111-111111111113', '00000000-0000-0000-0000-000000000003', 'ML301', 'Machine Learning Fundamentals', 'Supervised and unsupervised learning, loss optimization, neural networks, and model evaluation.', 'ML301C', 'Fall 2026', true)
ON CONFLICT (id) DO NOTHING;

-- 3. SEED MODULES FOR CS101
INSERT INTO public.modules (id, course_id, title, description, order_index) VALUES
('22222222-2222-2222-2222-222222222221', '11111111-1111-1111-1111-111111111111', 'Module 1: Computational Thinking & Algorithms', 'Decomposition, pattern recognition, abstraction, and pseudocode design.', 1),
('22222222-2222-2222-2222-222222222222', '11111111-1111-1111-1111-111111111111', 'Module 2: Discrete Logic & Boolean Algebra', 'Logic gates, truth tables, proposition logic, and conditional evaluation.', 2),
('22222222-2222-2222-2222-222222222223', '11111111-1111-1111-1111-111111111111', 'Module 3: Introduction to AI & Search Strategies', 'State space search, breadth-first, depth-first, and heuristics.', 3)
ON CONFLICT (id) DO NOTHING;

-- 4. SEED COURSE OUTCOMES FOR CS101
INSERT INTO public.course_outcomes (id, course_id, code, description) VALUES
('33333333-3333-3333-3333-333333333331', '11111111-1111-1111-1111-111111111111', 'CO1', 'Understand core algorithmic principles and computational abstraction.'),
('33333333-3333-3333-3333-333333333332', '11111111-1111-1111-1111-111111111111', 'CO2', 'Apply discrete logic and Boolean simplifications to real-world control systems.'),
('33333333-3333-3333-3333-333333333333', '11111111-1111-1111-1111-111111111111', 'CO3', 'Analyze time and space complexity of iterative and recursive search algorithms.'),
('33333333-3333-3333-3333-333333333334', '11111111-1111-1111-1111-111111111111', 'CO4', 'Evaluate and formulate intelligent heuristics for state-space exploration.')
ON CONFLICT (id) DO NOTHING;

-- 5. SEED 25 STUDENT PROFILES
INSERT INTO public.profiles (id, email, full_name, role, avatar_url, institution) VALUES
('00000000-0000-0000-0000-000000000101', 'student1@adaptivelearn.ai', 'Branden Harris', 'student', 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150', 'Smart Institute of Technology'),
('00000000-0000-0000-0000-000000000102', 'student2@adaptivelearn.ai', 'Charles James', 'student', 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=150', 'Smart Institute of Technology'),
('00000000-0000-0000-0000-000000000103', 'student3@adaptivelearn.ai', 'Mike Peter', 'student', 'https://images.unsplash.com/photo-1527980965255-d3b416303d12?w=150', 'Smart Institute of Technology'),
('00000000-0000-0000-0000-000000000104', 'student4@adaptivelearn.ai', 'Sophia Chen', 'student', 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150', 'Smart Institute of Technology'),
('00000000-0000-0000-0000-000000000105', 'student5@adaptivelearn.ai', 'Liam Garcia', 'student', 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150', 'Smart Institute of Technology'),
('00000000-0000-0000-0000-000000000106', 'student6@adaptivelearn.ai', 'Emma Watson', 'student', 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150', 'Smart Institute of Technology'),
('00000000-0000-0000-0000-000000000107', 'student7@adaptivelearn.ai', 'Noah Patel', 'student', 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150', 'Smart Institute of Technology'),
('00000000-0000-0000-0000-000000000108', 'student8@adaptivelearn.ai', 'Ava Rodriguez', 'student', 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150', 'Smart Institute of Technology'),
('00000000-0000-0000-0000-000000000109', 'student9@adaptivelearn.ai', 'Lucas Kim', 'student', 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150', 'Smart Institute of Technology'),
('00000000-0000-0000-0000-000000000110', 'student10@adaptivelearn.ai', 'Isabella Morales', 'student', 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150', 'Smart Institute of Technology'),
('00000000-0000-0000-0000-000000000111', 'student11@adaptivelearn.ai', 'Ethan Davis', 'student', 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150', 'Smart Institute of Technology'),
('00000000-0000-0000-0000-000000000112', 'student12@adaptivelearn.ai', 'Mia Taylor', 'student', 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=150', 'Smart Institute of Technology'),
('00000000-0000-0000-0000-000000000113', 'student13@adaptivelearn.ai', 'Oliver Martinez', 'student', 'https://images.unsplash.com/photo-1501196354995-cbb51c65aaea?w=150', 'Smart Institute of Technology'),
('00000000-0000-0000-0000-000000000114', 'student14@adaptivelearn.ai', 'Charlotte Anderson', 'student', 'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=150', 'Smart Institute of Technology'),
('00000000-0000-0000-0000-000000000115', 'student15@adaptivelearn.ai', 'Benjamin Thomas', 'student', 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=150', 'Smart Institute of Technology'),
('00000000-0000-0000-0000-000000000116', 'student16@adaptivelearn.ai', 'Amelia Jackson', 'student', 'https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?w=150', 'Smart Institute of Technology'),
('00000000-0000-0000-0000-000000000117', 'student17@adaptivelearn.ai', 'Henry White', 'student', 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150', 'Smart Institute of Technology'),
('00000000-0000-0000-0000-000000000118', 'student18@adaptivelearn.ai', 'Harper Harris', 'student', 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150', 'Smart Institute of Technology'),
('00000000-0000-0000-0000-000000000119', 'student19@adaptivelearn.ai', 'Alexander Martin', 'student', 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150', 'Smart Institute of Technology'),
('00000000-0000-0000-0000-000000000120', 'student20@adaptivelearn.ai', 'Evelyn Thompson', 'student', 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150', 'Smart Institute of Technology'),
('00000000-0000-0000-0000-000000000121', 'student21@adaptivelearn.ai', 'Daniel Garcia', 'student', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150', 'Smart Institute of Technology'),
('00000000-0000-0000-0000-000000000122', 'student22@adaptivelearn.ai', 'Aria Robinson', 'student', 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150', 'Smart Institute of Technology'),
('00000000-0000-0000-0000-000000000123', 'student23@adaptivelearn.ai', 'Matthew Clark', 'student', 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150', 'Smart Institute of Technology'),
('00000000-0000-0000-0000-000000000124', 'student24@adaptivelearn.ai', 'Scarlett Rodriguez', 'student', 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=150', 'Smart Institute of Technology'),
('00000000-0000-0000-0000-000000000125', 'student25@adaptivelearn.ai', 'David Lewis', 'student', 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150', 'Smart Institute of Technology')
ON CONFLICT (id) DO NOTHING;

-- 6. ENROLL STUDENTS IN CS101
INSERT INTO public.enrollments (course_id, student_id, status)
SELECT '11111111-1111-1111-1111-111111111111', id, 'enrolled'
FROM public.profiles
WHERE role = 'student'
ON CONFLICT (course_id, student_id) DO NOTHING;

-- 7. SEED APPROVED LEARNING MATERIAL (Grounding Source)
INSERT INTO public.learning_materials (
    id, course_id, module_id, uploader_id, filename, storage_path, file_type,
    file_size_bytes, extracted_text, character_count, processing_status, approval_status
) VALUES (
    '44444444-4444-4444-4444-444444444441',
    '11111111-1111-1111-1111-111111111111',
    '22222222-2222-2222-2222-222222222221',
    '00000000-0000-0000-0000-000000000001',
    'CS101_Algorithms_and_Complexity_Syllabus.pdf',
    'materials/cs101_syllabus.pdf',
    'pdf',
    1048576,
    'COURSE SYLLABUS: CS101 — COMPUTATIONAL THINKING & FOUNDATIONS OF AI
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
De Morgan''s Laws:
1. NOT (A AND B) == (NOT A) OR (NOT B)
2. NOT (A OR B) == (NOT A) AND (NOT B)

Module 3: Introduction to State-Space Search in AI
State-space search models problem solving as navigation through a graph of states connected by transitions (actions).
Breadth-First Search (BFS): Explores shallowest nodes first using a FIFO queue. BFS is complete and optimal for unweighted graphs, but has exponential space complexity O(b^d).
Depth-First Search (DFS): Explores deepest paths first using a LIFO stack. DFS has lower memory complexity O(b*d), but is not optimal and can be trapped in infinite cycles unless visited states are tracked.
Heuristic Search: Uses an evaluation function f(n) = g(n) + h(n), where g(n) is the exact cost from start to node n, and h(n) is the estimated cost from n to goal.',
    1920,
    'completed',
    'approved'
) ON CONFLICT (id) DO NOTHING;

-- 8. SEED DIAGNOSTIC ASSESSMENT
INSERT INTO public.assessments (
    id, course_id, module_id, title, description, assessment_type,
    status, time_limit_minutes, max_marks, passing_marks, progressive_hints_enabled, version, published_at
) VALUES (
    '55555555-5555-5555-5555-555555555551',
    '11111111-1111-1111-1111-111111111111',
    '22222222-2222-2222-2222-222222222221',
    'CS101 Diagnostic Assessment: Algorithmic Thinking & Logic',
    'Initial cognitive baseline measuring all 6 Bloom dimensions: Remembering, Understanding, Application, Analysis, Creativity, and Evaluation.',
    'diagnostic',
    'published',
    30,
    30.0,
    15.0,
    true,
    1,
    NOW() - INTERVAL '7 days'
) ON CONFLICT (id) DO NOTHING;

-- 9. SEED QUESTIONS FOR DIAGNOSTIC ASSESSMENT (Covering all 6 Bloom Traits)
-- Q1: Remembering (MCQ)
INSERT INTO public.questions (
    id, assessment_id, order_index, question_text, question_type, options, max_marks,
    primary_trait, difficulty, approval_status, source_reference
) VALUES (
    '66666666-6666-6666-6666-666666666661',
    '55555555-5555-5555-5555-555555555551',
    1,
    'What is the worst-case time complexity of Binary Search on a sorted array of N elements?',
    'mcq',
    '["O(1)", "O(log N)", "O(N)", "O(N log N)"]'::jsonb,
    5.0,
    'remembering',
    'easy',
    'approved',
    'Module 1: Binary Search Time Complexity'
) ON CONFLICT (id) DO NOTHING;

INSERT INTO public.question_answer_keys (
    question_id, correct_answer, accepted_variations, evaluation_method, explanation
) VALUES (
    '66666666-6666-6666-6666-666666666661',
    'O(log N)',
    ARRAY['O(log N)', 'O(log(N))', 'O(logn)'],
    'deterministic',
    'Binary search halves the search space with each comparison step, leading to logarithmic worst-case time complexity O(log N).'
) ON CONFLICT (question_id) DO NOTHING;

INSERT INTO public.question_hints (question_id, hint_number, hint_text, penalty_percentage) VALUES
('66666666-6666-6666-6666-666666666661', 1, 'Consider how the search space shrinks: the array size is divided by 2 at every step.', 25.0),
('66666666-6666-6666-6666-666666666661', 2, 'Inverse of exponentiation 2^k = N gives k = log2(N).', 50.0)
ON CONFLICT (question_id, hint_number) DO NOTHING;

-- Q2: Understanding (True/False)
INSERT INTO public.questions (
    id, assessment_id, order_index, question_text, question_type, options, max_marks,
    primary_trait, difficulty, approval_status, source_reference
) VALUES (
    '66666666-6666-6666-6666-666666666662',
    '55555555-5555-5555-5555-555555555551',
    2,
    'According to De Morgan''s laws, the expression NOT (A AND B) is logically equivalent to (NOT A) AND (NOT B).',
    'true_false',
    '["True", "False"]'::jsonb,
    5.0,
    'understanding',
    'easy',
    'approved',
    'Module 2: De Morgan''s Laws'
) ON CONFLICT (id) DO NOTHING;

INSERT INTO public.question_answer_keys (
    question_id, correct_answer, accepted_variations, evaluation_method, explanation
) VALUES (
    '66666666-6666-6666-6666-666666666662',
    'False',
    ARRAY['False', 'false', 'F'],
    'deterministic',
    'By De Morgan''s law, NOT (A AND B) expands to (NOT A) OR (NOT B), not AND.'
) ON CONFLICT (question_id) DO NOTHING;

INSERT INTO public.question_hints (question_id, hint_number, hint_text, penalty_percentage) VALUES
('66666666-6666-6666-6666-666666666662', 1, 'Recall how distributing a NOT over a conjunction changes the central operator.', 25.0),
('66666666-6666-6666-6666-666666666662', 2, 'The conjunction AND flips to disjunction OR: NOT (A AND B) = (NOT A) OR (NOT B).', 50.0)
ON CONFLICT (question_id, hint_number) DO NOTHING;

-- Q3: Application (Numeric)
INSERT INTO public.questions (
    id, assessment_id, order_index, question_text, question_type, options, max_marks,
    primary_trait, difficulty, approval_status, source_reference
) VALUES (
    '66666666-6666-6666-6666-666666666663',
    '55555555-5555-5555-5555-555555555551',
    3,
    'How many maximum comparisons are needed to search for an integer in a sorted array of 1024 elements using Binary Search?',
    'numeric',
    NULL,
    5.0,
    'application',
    'medium',
    'approved',
    'Module 1: Binary Search Comparisons'
) ON CONFLICT (id) DO NOTHING;

INSERT INTO public.question_answer_keys (
    question_id, correct_answer, accepted_variations, evaluation_method, numeric_tolerance, explanation
) VALUES (
    '66666666-6666-6666-6666-666666666663',
    '10',
    ARRAY['10', '10 comparisons', '10.0'],
    'deterministic',
    0.0,
    'Since 2^10 = 1024, log2(1024) = 10 comparisons are needed in the worst case.'
) ON CONFLICT (question_id) DO NOTHING;

INSERT INTO public.question_hints (question_id, hint_number, hint_text, penalty_percentage) VALUES
('66666666-6666-6666-6666-666666666663', 1, 'Express 1024 as an exact power of 2: 2^k = 1024.', 25.0),
('66666666-6666-6666-6666-666666666663', 2, '2^1 = 2, 2^2 = 4 ... 2^8 = 256, 2^9 = 512, 2^10 = 1024. Therefore k = 10.', 50.0)
ON CONFLICT (question_id, hint_number) DO NOTHING;

-- Q4: Analysis (Multiple-Select)
INSERT INTO public.questions (
    id, assessment_id, order_index, question_text, question_type, options, max_marks,
    primary_trait, difficulty, approval_status, source_reference
) VALUES (
    '66666666-6666-6666-6666-666666666664',
    '55555555-5555-5555-5555-555555555551',
    4,
    'Which of the following characteristics accurately describe Breadth-First Search (BFS)? (Select all that apply)',
    'multiple_select',
    '["Uses a FIFO queue data structure", "Has exponential memory complexity O(b^d)", "Guarantees shortest path on unweighted graphs", "Uses a LIFO stack data structure"]'::jsonb,
    5.0,
    'analysis',
    'medium',
    'approved',
    'Module 3: BFS Properties'
) ON CONFLICT (id) DO NOTHING;

INSERT INTO public.question_answer_keys (
    question_id, correct_answer, accepted_variations, evaluation_method, explanation
) VALUES (
    '66666666-6666-6666-6666-666666666664',
    'Uses a FIFO queue data structure, Has exponential memory complexity O(b^d), Guarantees shortest path on unweighted graphs',
    ARRAY['0,1,2', 'A,B,C'],
    'deterministic',
    'BFS explores layer by layer using a FIFO queue, finds the shortest path on unweighted graphs, and requires storing all frontier nodes (O(b^d) space).'
) ON CONFLICT (question_id) DO NOTHING;

INSERT INTO public.question_hints (question_id, hint_number, hint_text, penalty_percentage) VALUES
('66666666-6666-6666-6666-666666666664', 1, 'Remember that BFS explores level by level, requiring FIFO order rather than LIFO.', 25.0),
('66666666-6666-6666-6666-666666666664', 2, 'Three of the four statements are true properties of BFS; stacks belong to DFS.', 50.0)
ON CONFLICT (question_id, hint_number) DO NOTHING;

-- Q5: Creativity (Fill in the Blank)
INSERT INTO public.questions (
    id, assessment_id, order_index, question_text, question_type, options, max_marks,
    primary_trait, difficulty, approval_status, source_reference
) VALUES (
    '66666666-6666-6666-6666-666666666665',
    '55555555-5555-5555-5555-555555555551',
    5,
    'In informed search algorithms like A*, the heuristic function h(n) is said to be ________ if it never overestimates the true cost to reach the goal.',
    'fill_in_blank',
    NULL,
    5.0,
    'creativity',
    'medium',
    'approved',
    'Module 3: Heuristic Properties'
) ON CONFLICT (id) DO NOTHING;

INSERT INTO public.question_answer_keys (
    question_id, correct_answer, accepted_variations, evaluation_method, explanation
) VALUES (
    '66666666-6666-6666-6666-666666666665',
    'admissible',
    ARRAY['admissible', 'Admissible', 'admissable', 'ADMISSIBLE'],
    'deterministic',
    'An admissible heuristic never overestimates the actual minimal cost to reach the goal state, which guarantees optimality for A* search.'
) ON CONFLICT (question_id) DO NOTHING;

INSERT INTO public.question_hints (question_id, hint_number, hint_text, penalty_percentage) VALUES
('66666666-6666-6666-6666-666666666665', 1, 'The word starts with "adm" and means acceptable or permissible in the context of optimality proofs.', 25.0),
('66666666-6666-6666-6666-666666666665', 2, 'It rhymes with "permissible": a-d-m-i-s-s-i-b-l-e.', 50.0)
ON CONFLICT (question_id, hint_number) DO NOTHING;

-- Q6: Evaluation (MCQ)
INSERT INTO public.questions (
    id, assessment_id, order_index, question_text, question_type, options, max_marks,
    primary_trait, difficulty, approval_status, source_reference
) VALUES (
    '66666666-6666-6666-6666-666666666666',
    '55555555-5555-5555-5555-555555555551',
    6,
    'A robotics engineer must choose a search algorithm for a maze solver on an embedded microcontroller with only 32 KB of RAM. If paths may contain cycles and memory exhaustion is fatal, which strategy is best evaluated as most appropriate?',
    'mcq',
    '["Unbounded Breadth-First Search (BFS)", "Iterative Deepening Search with visited node hashing (IDDFS)", "Depth-First Search without cycle detection", "Exhaustive Bidirectional BFS"]'::jsonb,
    5.0,
    'evaluation',
    'hard',
    'approved',
    'Module 3: Algorithmic Trade-offs'
) ON CONFLICT (id) DO NOTHING;

INSERT INTO public.question_answer_keys (
    question_id, correct_answer, accepted_variations, evaluation_method, explanation
) VALUES (
    '66666666-6666-6666-6666-666666666666',
    'Iterative Deepening Search with visited node hashing (IDDFS)',
    ARRAY['Iterative Deepening Search with visited node hashing (IDDFS)', 'IDDFS', 'Iterative Deepening Search'],
    'deterministic',
    'IDDFS combines the minimal linear memory requirements of DFS (O(b*d)) with the completeness and optimality of BFS, making it ideal for memory-constrained embedded systems.'
) ON CONFLICT (question_id) DO NOTHING;

INSERT INTO public.question_hints (question_id, hint_number, hint_text, penalty_percentage) VALUES
('66666666-6666-6666-6666-666666666666', 1, 'Evaluate which algorithm has O(b*d) linear memory while still guaranteeing complete and optimal paths.', 25.0),
('66666666-6666-6666-6666-666666666666', 2, 'Iterative Deepening Search repeatedly runs depth-limited DFS up to depth d, using minimal memory.', 50.0)
ON CONFLICT (question_id, hint_number) DO NOTHING;

-- 10. SEED SAMPLE STUDENT ATTEMPTS & PROGRESS (Student 1: Branden Harris)
INSERT INTO public.attempts (
    id, assessment_id, student_id, attempt_number, status, started_at, submitted_at,
    total_score, max_score, percentage, is_final
) VALUES (
    '77777777-7777-7777-7777-777777777771',
    '55555555-5555-5555-5555-555555555551',
    '00000000-0000-0000-0000-000000000101',
    1,
    'evaluated',
    NOW() - INTERVAL '5 days',
    NOW() - INTERVAL '5 days' + INTERVAL '24 minutes',
    21.25,
    30.0,
    70.83,
    true
) ON CONFLICT (id) DO NOTHING;

-- Seed Trait Scores for Student 1 on Diagnostic Attempt
INSERT INTO public.trait_scores (
    attempt_id, student_id, course_id, assessment_id, trait, marks_earned, marks_possible,
    score_percentage, evidence_count, confidence
) VALUES
('77777777-7777-7777-7777-777777777771', '00000000-0000-0000-0000-000000000101', '11111111-1111-1111-1111-111111111111', '55555555-5555-5555-5555-555555555551', 'remembering', 5.0, 5.0, 100.0, 1, 'moderate'),
('77777777-7777-7777-7777-777777777771', '00000000-0000-0000-0000-000000000101', '11111111-1111-1111-1111-111111111111', '55555555-5555-5555-5555-555555555551', 'understanding', 5.0, 5.0, 100.0, 1, 'moderate'),
('77777777-7777-7777-7777-777777777771', '00000000-0000-0000-0000-000000000101', '11111111-1111-1111-1111-111111111111', '55555555-5555-5555-5555-555555555551', 'application', 5.0, 5.0, 100.0, 1, 'moderate'),
('77777777-7777-7777-7777-777777777771', '00000000-0000-0000-0000-000000000101', '11111111-1111-1111-1111-111111111111', '55555555-5555-5555-5555-555555555551', 'analysis', 2.5, 5.0, 50.0, 1, 'moderate'),
('77777777-7777-7777-7777-777777777771', '00000000-0000-0000-0000-000000000101', '11111111-1111-1111-1111-111111111111', '55555555-5555-5555-5555-555555555551', 'creativity', 1.25, 5.0, 25.0, 1, 'moderate'),
('77777777-7777-7777-7777-777777777771', '00000000-0000-0000-0000-000000000101', '11111111-1111-1111-1111-111111111111', '55555555-5555-5555-5555-555555555551', 'evaluation', 2.5, 5.0, 50.0, 1, 'moderate')
ON CONFLICT (attempt_id, trait) DO NOTHING;

-- 11. SEED APPROVED PERSONALIZED INTERVENTION FOR STUDENT 1 (Targeting Weak Traits: Analysis & Creativity)
INSERT INTO public.interventions (
    id, student_id, course_id, diagnostic_attempt_id, weak_traits, weak_outcomes,
    status, faculty_notes, approved_by, approved_at, released_at
) VALUES (
    '88888888-8888-8888-8888-888888888881',
    '00000000-0000-0000-0000-000000000101',
    '11111111-1111-1111-1111-111111111111',
    '77777777-7777-7777-7777-777777777771',
    ARRAY['analysis', 'creativity'],
    ARRAY['CO3', 'CO4'],
    'released',
    'Branden performed strongly on foundational recall and logic, but struggled with decomposing graph search algorithms (Analysis) and formulating heuristic admissibility (Creativity). Review the analogies and practice modules.',
    '00000000-0000-0000-0000-000000000001',
    NOW() - INTERVAL '3 days',
    NOW() - INTERVAL '3 days'
) ON CONFLICT (id) DO NOTHING;

INSERT INTO public.intervention_materials (
    id, intervention_id, title, learning_gap_summary, explanation_markdown,
    worked_examples, analogies, revision_checklist, recommended_next_steps, grounding_material_ids
) VALUES (
    '99999999-9999-9999-9999-999999999991',
    '88888888-8888-8888-8888-888888888881',
    'Targeted Remediation: Graph Search Decomposition & Heuristic Design',
    'Difficulty distinguishing memory tradeoffs in graph search (BFS vs DFS) and formulating admissible heuristic properties.',
    '# Mastering State Space Search & Heuristics

## 1. The Core Trade-off: Space vs Completeness
When evaluating **Breadth-First Search (BFS)** versus **Depth-First Search (DFS)**, remember this fundamental distinction:
- **BFS** explores like ripples expanding on a pond. It touches every neighbor at distance 1, then distance 2.
  - Advantage: Guaranteed to discover the shortest path in unweighted graphs.
  - Bottleneck: Memory! It must retain every node in the active frontier: $O(b^d)$ space.
- **DFS** explores like a maze explorer following a single left wall until dead end.
  - Advantage: Memory footprint is lean: $O(b \cdot d)$ linear space.
  - Bottleneck: Can wander down infinite loops if not tracking visited nodes.

## 2. Admissible Heuristics Demystified
A heuristic $h(n)$ is **admissible** if:
$$h(n) \le h^*(n) \quad \text{for all } n$$
Where $h^*(n)$ is the true shortest cost from node $n$ to the goal.

**Think of it as an optimistic navigator**: An admissible GPS always underestimates or exactly predicts your remaining travel time. It NEVER says "it will take 50 minutes" when it only takes 30 minutes.',
    '[{"step": 1, "description": "Formulating Straight-Line Distance: In road navigation, Euclidean line-of-sight distance is always <= actual winding road distance. Hence, straight-line distance is always an admissible heuristic."}]'::jsonb,
    '[{"concept": "BFS Memory Explosion", "analogy": "Imagine searching for a book in a library by reading the first page of every single book on floor 1, then floor 2, keeping all opened books on your desk. Your desk quickly runs out of space!"}]'::jsonb,
    ARRAY['Can you state the Big-O space complexity of BFS and DFS from memory?', 'Do you know why admissible heuristics guarantee A* optimality?', 'Can you identify if a given heuristic ever overestimates true cost?'],
    ARRAY['Complete the 3 practice questions below', 'Re-attempt the state-space diagnostic exercise', 'Proceed to Final Assessment when confident'],
    ARRAY['44444444-4444-4444-4444-444444444441'::uuid]
) ON CONFLICT (id) DO NOTHING;

-- Seed Practice Questions for Student 1
INSERT INTO public.practice_questions (
    id, intervention_id, order_index, question_text, options, correct_answer, explanation, trait
) VALUES (
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa1',
    '88888888-8888-8888-8888-888888888881',
    1,
    'If a road network has a straight-line distance of 15 km between City A and City B, which heuristic estimate h(A) would be INADMISSIBLE?',
    '["10 km", "14.5 km", "15 km", "18 km"]'::jsonb,
    '18 km',
    'An admissible heuristic must never overestimate true cost. Since straight-line distance is 15 km, an estimate of 18 km overestimates the straight-line minimum, making it inadmissible.',
    'creativity'
) ON CONFLICT (id) DO NOTHING;

-- 12. SEED FINAL ASSESSMENT & PROGRESS REPORT
INSERT INTO public.assessments (
    id, course_id, module_id, title, description, assessment_type,
    status, time_limit_minutes, max_marks, passing_marks, progressive_hints_enabled, version, published_at
) VALUES (
    '55555555-5555-5555-5555-555555555552',
    '11111111-1111-1111-1111-111111111111',
    '22222222-2222-2222-2222-222222222221',
    'CS101 Final Examination: Comprehensive Trait Mastery',
    'Final summative examination evaluating all 6 Bloom traits with the progressive 2-hint assistance mechanism.',
    'final',
    'published',
    45,
    30.0,
    15.0,
    true,
    1,
    NOW() - INTERVAL '1 day'
) ON CONFLICT (id) DO NOTHING;

-- Seed Progress Report for Student 1 (Showing Baseline vs Final Trait Improvement)
INSERT INTO public.progress_reports (
    id, student_id, course_id, baseline_assessment_id, final_assessment_id,
    baseline_score, final_score, score_improvement, trait_improvements, evidence_counts, summary_narrative
) VALUES (
    'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbb1',
    '00000000-0000-0000-0000-000000000101',
    '11111111-1111-1111-1111-111111111111',
    '55555555-5555-5555-5555-555555555551',
    '55555555-5555-5555-5555-555555555552',
    70.83,
    93.33,
    22.50, -- +22.5 percentage points!
    '{"remembering": 0.0, "understanding": 0.0, "application": 0.0, "analysis": 45.0, "creativity": 60.0, "evaluation": 30.0}'::jsonb,
    '{"remembering": 2, "understanding": 2, "application": 2, "analysis": 2, "creativity": 2, "evaluation": 2}'::jsonb,
    'Branden achieved exceptional improvement after completing the targeted remediation package in State-Space Search and Heuristics. Analysis increased by +45.0 percentage points, Creativity improved by +60.0 pp, and Evaluation improved by +30.0 pp.'
) ON CONFLICT (id) DO NOTHING;
