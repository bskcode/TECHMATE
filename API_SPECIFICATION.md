# AdaptiveLearn AI — Complete API Specification

All endpoints are authenticated, enforce role-based access control (RBAC), and validate request schemas with Zod.

## Base URL
`/api`

---

## 1. Health Check
### `GET /api/health`
- **Description**: Render Web Service uptime and health monitoring endpoint.
- **Response `200 OK`**:
```json
{
  "status": "healthy",
  "timestamp": "2026-11-11T15:00:00.000Z",
  "service": "AdaptiveLearn AI Web Service",
  "database": "connected",
  "environment": "production"
}
```

---

## 2. Courses & Roster
### `GET /api/courses`
- **Query Params**: `userId` (optional), `role` (`'faculty' | 'student'`)
- **Response**: `{ "success": true, "courses": [...] }`

### `POST /api/courses`
- **Role**: Faculty Only
- **Body**: `{ "code": "CS101", "title": "Introduction to Computer Science & AI", "instructor_id": "...", "term": "Fall 2026", "description": "..." }`
- **Response**: `{ "success": true, "course": { "id": "...", "enrollment_code": "CS101A", ... } }`

### `POST /api/courses/enroll`
- **Role**: Student Only
- **Body**: `{ "code": "CS101A", "student_id": "..." }`
- **Response**: `{ "success": true, "message": "Successfully enrolled in CS101", "course": { ... } }`

### `GET /api/courses/[id]`
- **Response**: Detailed course metadata, modules, course outcomes, materials, assessments, and enrolled roster.

---

## 3. Learning Materials (Document Ingestion)
### `GET /api/courses/[id]/materials`
- **Query Params**: `onlyApproved` (`boolean`)
- **Response**: List of course materials with extraction status and character counts.

### `POST /api/courses/[id]/materials`
- **Role**: Faculty Only
- **Payload**: `multipart/form-data` with `file` (PDF, DOCX, PPTX) OR `textContent`
- **Behavior**: Extracts plain text server-side using `pdf-parse` / `mammoth`, computes character count, stores extracted text and metadata.

### `PATCH /api/materials/[id]`
- **Role**: Faculty Only
- **Body**: `{ "approval_status": "approved" | "rejected", "rejection_reason": "..." }`
- **Behavior**: Approved documents become immediately accessible to the AI grounding engine.

---

## 4. Assessment Authoring & Generation
### `POST /api/courses/[id]/assessments`
- **Role**: Faculty Only
- **Body**: `{ "title": "...", "assessment_type": "diagnostic" | "module" | "final", "time_limit_minutes": 30, "max_marks": 30 }`
- **Response**: New assessment draft record.

### `POST /api/assessments/[id]/generate`
- **Role**: Faculty Only
- **Body**: `{ "questionCount": 6, "targetTraits": ["remembering", ...], "difficulty": "medium" }`
- **Behavior**: Invokes Groq API (`llama-3.3-70b-versatile`) grounded strictly in approved course materials. AI outputs complete question packages (Question text, options, answer key, variations, explanation, Hint 1, Hint 2, rubric criteria, trait mappings). Packages are persisted to `questions`, `question_answer_keys`, and `question_hints`.
- **Response**: Complete question packages for faculty workbench review.

### `GET /api/assessments/[id]`
- **Query Params**: `isFaculty=true` (Faculty mode) vs default/student mode
- **Security Check**:
  - If `isFaculty === true`: returns questions WITH answer keys, rubrics, and hints.
  - If `isFaculty === false`: **strictly strips** all answer keys, rubrics, and locked hints!

### `PUT /api/questions/[id]`
- **Role**: Faculty Only
- **Body**: Question text, answer key, Hint 1, Hint 2, or trait updates.

### `POST /api/assessments/[id]/publish`
- **Role**: Faculty Only
- **Behavior**: Locks version and publishes assessment to enrolled students.

---

## 5. Examination & Progressive 2-Hint State Machine
### `POST /api/attempts/start`
- **Role**: Student Only
- **Body**: `{ "assessment_id": "...", "student_id": "..." }`
- **Response**: Attempt record, sanitized questions (no keys or hints), and prior submitted responses.

### `POST /api/attempts/[id]/submit`
- **Body**: `{ "question_id": "...", "response_number": 1 | 2 | 3, "student_answer": "..." }`
- **Server Enforcement**:
  - `response_number == 1` & Correct: Awards 100% marks, locks question.
  - `response_number == 1` & Incorrect: Unlocks **Hint 1** `{ hint_number: 1, hint_text: "..." }`, marks = 0.
  - `response_number == 2` & Correct: Awards 75% marks, locks question.
  - `response_number == 2` & Incorrect: Unlocks **Hint 2** `{ hint_number: 2, hint_text: "..." }`, marks = 0.
  - `response_number == 3`: Final answer. Evaluated (up to 50% marks), locks question.
  - `response_number > 3`: **403 Forbidden** (State machine rejects 4th attempt).

### `POST /api/attempts/[id]/finalize`
- **Behavior**: Finalizes attempt, calculates overall percentage, and calculates Bloom's 6 cognitive dimensions trait scores without double counting.
- **Response**: Evaluated attempt and persisted `trait_scores`.

---

## 6. Analytics & Remediation
### `GET /api/courses/[id]/analytics`
- **Role**: Faculty
- **Response**: Class trait averages across Bloom dimensions, weakest traits, and students needing intervention.

### `POST /api/interventions/generate`
- **Role**: Faculty
- **Body**: `{ "student_id": "...", "course_id": "...", "weak_traits": ["analysis", "creativity"] }`
- **Behavior**: AI generates grounded remediation package (learning gap, markdown explanation, worked examples, analogies, revision checklist, practice questions) with status `pending_approval`.

### `PATCH /api/interventions/[id]`
- **Role**: Faculty Only
- **Body**: `{ "status": "approved" | "released" }`
- **Behavior**: Releasing makes the package accessible to the assigned student.

### `POST /api/practice/submit`
- **Role**: Student
- **Body**: `{ "practice_question_id": "...", "student_id": "...", "student_answer": "..." }`
- **Response**: `{ "is_correct": boolean, "explanation": "..." }`

### `GET /api/reports`
- **Query Params**: `courseId`, `studentId`
- **Response**: Accreditation progress report comparing Baseline Diagnostic vs Final Examination with $\Delta \text{Trait}$ percentage point improvements.
