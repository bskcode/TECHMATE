# AdaptiveLearn AI — Security & Row Level Security (RLS) Specification

## 1. Security Architecture Principles
AdaptiveLearn AI implements defense-in-depth across database access control, server-side API authorization, data sanitization, and environment boundary protections.

### Sensitive Data Isolation
- **Answer Keys**: `question_answer_keys`
- **Multi-Criterion Rubrics**: `question_rubrics`
- **Progressive Hints**: `question_hints`

> [!CAUTION]
> Under no circumstances do student client queries have SELECT permissions on `question_answer_keys`, `question_rubrics`, or unearned `question_hints`.

## 2. Row Level Security (RLS) Policies
All 20 application tables have RLS enabled.

| Table | Faculty Policy | Student Policy |
|---|---|---|
| `profiles` | View all, update own | View all (rosters/instructors), update own |
| `courses` | Full CRUD on own courses (`instructor_id = auth.uid()`) | Read active courses (`is_active = true`) |
| `enrollments` | View & manage enrollments in own courses | View own enrollments; insert own enrollment via code |
| `modules`, `course_outcomes` | Full CRUD on own courses | View modules/outcomes for enrolled courses |
| `learning_materials` | Full CRUD on own course materials | View ONLY approved materials in enrolled courses |
| `assessments` | Full CRUD on own courses | View ONLY published assessments in enrolled courses |
| `questions` | Full CRUD on own courses | View sanitized questions for published assessments |
| `question_answer_keys` | Full CRUD on own courses | **DENIED (0 rows returned to students)** |
| `question_rubrics` | Full CRUD on own courses | **DENIED (0 rows returned to students)** |
| `question_hints` | Full CRUD on own courses | **DENIED (Direct student queries return 0 rows)** |
| `attempts` | View attempts in own courses | CRUD own attempts (`student_id = auth.uid()`) |
| `responses` | View responses in own courses | Insert and view own responses |
| `evaluations` | Full access in own courses | View evaluations for own attempts |
| `hint_events` | View in own courses | View own hint events |
| `trait_scores` | View all in own courses | View own trait scores |
| `interventions` | Manage, approve, edit in own courses | View ONLY if `status = 'released'` and `student_id = auth.uid()` |
| `intervention_materials` | Manage in own courses | View ONLY if parent intervention is released to student |
| `practice_questions` | Manage in own courses | View ONLY if parent intervention is released to student |
| `practice_attempts` | View in own courses | Insert and view own practice attempts |
| `progress_reports` | View in own courses | View own progress reports |

## 3. Server-Side Progressive 2-Hint State Machine Guard
Hints are never stored in client-accessible state. When a student submits Response 1:
1. Server receives `{ question_id, student_answer, response_number: 1 }`.
2. Server queries private `question_answer_keys` and evaluates answer.
3. If incorrect, server queries `question_hints WHERE hint_number = 1`, records a `hint_events` row, and returns `{ is_correct: false, unlocked_hint: { hint_number: 1, hint_text: "..." } }`.
4. If the student attempts to request Hint 2 or submit a 4th response out of order, the server state machine rejects the request with HTTP `403 Forbidden`.

## 4. API Key Protection
- `SUPABASE_SERVICE_ROLE_KEY` is restricted strictly to server-side operations and never exposed with `NEXT_PUBLIC_` prefixes.
- `GROQ_API_KEY` is loaded strictly server-side in API routes and server modules.
