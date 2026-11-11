# AdaptiveLearn AI — AI Architecture Specification

## 1. Core Principle: Authoring-Time Generation
A fundamental architecture principle of **AdaptiveLearn AI** is that the AI generates the complete question package at assessment authoring time, **never dynamically during student examinations**.

```
[Faculty Uploads Course Document]
               │
               ▼
[Server Extracts Text & Faculty Approves]
               │
               ▼
[Groq API Generates Complete Question Packages]
 ├── Question Text & Question Type
 ├── Options (for MCQ & Multi-Select)
 ├── Correct Answer & Accepted Variations
 ├── Academic Explanation
 ├── Progressive Hint 1 (Guiding concept)
 ├── Progressive Hint 2 (Deep formula/clue)
 ├── Multi-Criterion Marking Rubrics
 └── Bloom's 6 Trait Mappings
               │
               ▼
[Faculty Workbench: Review, Edit, Approve, Publish]
               │
               ▼
[Student Takes Exam] ---> ZERO AI CALLS (100% Deterministic <2ms Evaluation)
```

## 2. Advantages of Authoring-Time Generation
1. **Zero Exam Latency**: Evaluating student submissions takes `< 2ms` via deterministic comparison, avoiding multi-second LLM latencies during tests.
2. **Deterministic Grading**: Eliminates AI hallucinations, scoring inconsistencies, and drift during student exams.
3. **Faculty Oversight**: Faculty can review, edit, reject, or regenerate questions and hints before publishing.
4. **Cost Efficiency**: Inference costs are incurred once during assessment creation, rather than multiplied by every student attempt.

## 3. Groq Inference Engine
- **Provider**: Groq Cloud SDK (`groq-sdk`)
- **Primary Model**: `llama-3.3-70b-versatile` (or `llama-3.1-8b-instant`)
- **Mode**: JSON Object Mode (`response_format: { type: 'json_object' }`)
- **Validation**: Strict Zod schema (`AssessmentGenerationResponseSchema` & `InterventionPackageSchema`)
- **Retry Mechanism**: Bounded exponential backoff (up to 3 retries)

## 4. Academic Grounding Guard
- When generating questions or personalized remediation packages, the prompt context contains **only** text chunks from approved materials belonging to that specific course.
- If no approved materials exist, the platform notifies faculty to upload and approve a syllabus or lecture handout first, preventing the model from hallucinating outside course facts.

## 5. Bloom's Revised Taxonomy (6 Dimensions)
Every question is mapped to a cognitive dimension:
1. **Remembering**: Factual recall of terms, Big-O classes, and formulas.
2. **Understanding**: Comprehension of principles (e.g. De Morgan's laws).
3. **Application**: Problem solving and mathematical calculations.
4. **Analysis**: Comparing algorithmic structures, time & space complexities.
5. **Creativity**: Formulating heuristics, designing optimal navigation patterns.
6. **Evaluation**: Appraising tradeoffs under physical memory/resource constraints.

## 6. Progressive 2-Hint State Machine
- When students submit an incorrect answer on Attempt 1, **Hint 1** is unlocked by the server.
- When students submit an incorrect answer on Attempt 2, **Hint 2** is unlocked by the server.
- Attempt 3 is final. Submitting a 4th attempt is rejected by the backend state machine.
- Locked hints are never transmitted to the student's browser until unlocked by the server state machine.
