# AdaptiveLearn AI — Complete Project Plan

## Executive Overview
**AdaptiveLearn AI** is a browser-based, AI-powered personalized learning and trait-based assessment platform designed for higher education institutions. The system bridges classroom instruction and personalized remediation through a closed-loop academic workflow:
$$\text{ASSESS} \longrightarrow \text{DIAGNOSE} \longrightarrow \text{PERSONALIZE} \longrightarrow \text{PRACTICE} \longrightarrow \text{ASSIST} \longrightarrow \text{IMPROVE}$$

## Key Capabilities
- **Faculty Portal**: Course authoring, syllabus & material document ingestion, AI-generated complete question packages with Bloom trait mapping, question workbench, class & student trait analytics, intervention approval, and improvement reporting.
- **Student Portal**: Course overview, interactive examination room with server-enforced **Progressive 2-Hint Assistance**, cognitive trait radar dashboard, personalized learning center, micro-practice quiz center, and baseline vs final summative reports.
- **Bloom's Revised Taxonomy (6 Dimensions)**: Remembering, Understanding, Application, Analysis, Creativity, and Evaluation.
- **Authoring-Time Complete Question Packages**: The AI generates questions, full answer keys, accepted variations, multi-criterion rubrics, and both progressive hints at authoring time. Zero AI calls are made during student exams for deterministic questions.
- **Progressive 2-Hint State Machine**: Enforces exactly 2 progressive hints per question on the server. Answer keys and hints remain in protected tables isolated by Row Level Security (RLS).
- **Deployment**: Configured for Render Web Service deployment with zero local file persistence and complete documentation.

## Roadmap & Milestones
- **Phase 1 (Foundation)**: Schema, RLS, auth isolation, seed datasets.
- **Phase 2 (Course Workflows)**: Course creation, enrollment codes, document ingestion (PDF/DOCX/TXT).
- **Phase 3 (Assessment Engine)**: Groq-powered question package generator with Zod validation, faculty review workbench, publish version locking.
- **Phase 4 (Student Examination)**: Progressive 2-hint state machine, instant deterministic scoring, attempt persistence.
- **Phase 5 (Analytics)**: Bloom's trait aggregation, evidence counting, statistical confidence calculation, $\Delta \text{Trait}$ improvement tracking.
- **Phase 6 (Personalized Remediation)**: Weak trait diagnosis, grounded study package generation, faculty approval, student practice quiz.
- **Phase 7 (Deployment & Quality)**: Automated Vitest suite (100% pass), Render deployment configuration, documentation.
