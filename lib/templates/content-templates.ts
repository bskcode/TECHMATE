export interface ContentTemplate {
  id: 'syllabus' | 'objectives' | 'material';
  title: string;
  filename: string;
  description: string;
  downloadPath: string;
  content: string;
}

export const SYLLABUS_TEMPLATE = `# COURSE SYLLABUS TEMPLATE
# Course Code: [e.g., CS101]
# Course Title: [e.g., Introduction to Computer Science & AI]
# Term: [e.g., Fall 2026]
# Instructor: [e.g., Dr. Aris Thorne]
# Credits: [e.g., 3.0]

## 1. Course Description
[Provide a concise 3–5 sentence overview of the course scope, prerequisites, and core themes.]

## 2. Course Learning Outcomes (CLOs)
- **CO1 (Remembering / Understanding):** Define and explain core foundational concepts and terminology.
- **CO2 (Application):** Apply standard algorithms, models, or methods to solve structured domain problems.
- **CO3 (Analysis):** Analyze trade-offs, time/space complexity, or system behaviors across alternative approaches.
- **CO4 (Evaluation / Creativity):** Evaluate solution quality against constraints and design novel extensions.

## 3. Weekly Module Schedule
### Module 1: Foundations & Core Terminology
- Topics: [Topic 1.1, Topic 1.2, Topic 1.3]
- Readings: [Chapter 1, Lecture Notes 1]
- Assessment Alignment: Diagnostic Quiz (CO1, CO2)

### Module 2: Methods, Algorithms & Applied Problem Solving
- Topics: [Topic 2.1, Topic 2.2, Topic 2.3]
- Readings: [Chapter 2–3, Lab Handout 2]
- Assessment Alignment: Module Assessment (CO2, CO3)

### Module 3: Advanced Analysis, Design & Synthesis
- Topics: [Topic 3.1, Topic 3.2, Topic 3.3]
- Readings: [Chapter 4–5, Case Studies]
- Assessment Alignment: Final Examination (CO1–CO4)

## 4. Grading & Assessment Policy
- Diagnostic Baseline Assessment: 20%
- Module Assessments & Practice: 30%
- Final Comprehensive Assessment: 50%
`;

export const OBJECTIVES_TEMPLATE = `# COURSE OBJECTIVES & LEARNING OUTCOMES TEMPLATE
# Course Code: [e.g., CS101]
# Standard: Bloom's Revised Taxonomy Alignment

## Outcome Format
Each Course Outcome (CO) should follow: [Code] | [Bloom's Level] | [Measurable Action Verb + Concept + Context]

---

### CO1 — Foundational Recall & Comprehension
- **Code:** CO1
- **Bloom's Target:** Remembering, Understanding
- **Statement:** Identify, define, and explain the core principles, notation, and foundational models of the discipline.
- **Assessment Evidence:** Definitions, conceptual comparisons, true/false justifications.

### CO2 — Procedural & Conceptual Application
- **Code:** CO2
- **Bloom's Target:** Application
- **Statement:** Apply standard techniques, formulas, and algorithms to compute accurate solutions for well-defined problems.
- **Assessment Evidence:** Step-by-step calculations, trace tables, numeric/structured problem solving.

### CO3 — Analytical Decomposition & Trade-off Evaluation
- **Code:** CO3
- **Bloom's Target:** Analysis, Evaluation
- **Statement:** Analyze system constraints, compare competing approaches, and justify optimal design choices using quantitative criteria.
- **Assessment Evidence:** Complexity comparisons, edge-case diagnosis, rubric-backed critique.

### CO4 — Synthesis & Creative Design
- **Code:** CO4
- **Bloom's Target:** Creativity
- **Statement:** Design or adapt a structured solution, heuristic, or workflow to address an unfamiliar or constrained scenario.
- **Assessment Evidence:** Novel heuristic formulation, multi-step synthesis problems.
`;

export const MATERIAL_TEMPLATE = `# LEARNING MATERIAL / LECTURE MODULE TEMPLATE
# Course Code: [e.g., CS101]
# Module: [e.g., Module 1: Search & Problem Solving]
# Author: [Instructor Name]
# Grounding Standard: Approved for AI Question & Remediation Generation

## 1. Learning Objectives for This Material
- Understand [Key Concept A] and its formal definition.
- Apply [Method / Algorithm B] to a concrete example.
- Analyze common pitfalls, edge cases, and complexity trade-offs.

## 2. Core Concepts & Definitions
### Concept 1: [Name of Concept]
- **Definition:** [Clear, canonical definition that will serve as the ground truth for exam questions.]
- **Key Properties:**
  - Property 1: [Detail]
  - Property 2: [Detail]
- **Common Misconception:** [Explicitly state what students often confuse.]

### Concept 2: [Name of Concept / Algorithm]
- **Definition:** [Formal explanation]
- **Formula / Rule:** [e.g., f(n) = g(n) + h(n) or O(log n)]
- **Constraints / Preconditions:** [e.g., Input array must be sorted; heuristic must be admissible.]

## 3. Worked Example
**Problem:** [State a representative problem.]
**Step 1:** [Initial setup / identification of knowns]
**Step 2:** [Application of rule / formula]
**Step 3:** [Verification of result]
**Final Answer:** [Exact canonical answer]

## 4. Summary & Key Takeaways
- [Takeaway 1]
- [Takeaway 2]
- [Takeaway 3]
`;

export const CONTENT_TEMPLATES: ContentTemplate[] = [
  {
    id: 'syllabus',
    title: 'Course Syllabus Standard',
    filename: 'syllabus-template.md',
    description: 'Structured syllabus with course metadata, CLOs, weekly modules, and grading policy.',
    downloadPath: '/templates/syllabus-template.md',
    content: SYLLABUS_TEMPLATE,
  },
  {
    id: 'objectives',
    title: 'Course Objectives & Outcomes',
    filename: 'course-objectives-template.md',
    description: "Bloom's Revised Taxonomy-aligned Course Outcomes (CO1–CO4) with measurable verbs.",
    downloadPath: '/templates/course-objectives-template.md',
    content: OBJECTIVES_TEMPLATE,
  },
  {
    id: 'material',
    title: 'Lecture Notes & Material',
    filename: 'learning-material-template.md',
    description: 'Standardized lecture note format with definitions, misconceptions, and worked examples for AI grounding.',
    downloadPath: '/templates/learning-material-template.md',
    content: MATERIAL_TEMPLATE,
  },
];

