# AdaptiveLearn AI — Personalized Learning & Trait-Based Assessment Platform

**AdaptiveLearn AI** is a production-grade, browser-based, AI-powered personalized learning and trait-based assessment platform designed for universities and academic institutions.

It unites curriculum instruction, diagnostic assessment, cognitive trait analytics, and faculty-approved remediation in a continuous closed loop:
$$\text{ASSESS} \longrightarrow \text{DIAGNOSE} \longrightarrow \text{PERSONALIZE} \longrightarrow \text{PRACTICE} \longrightarrow \text{ASSIST} \longrightarrow \text{IMPROVE}$$

---

## 🌟 Core Innovations

1. **Authoring-Time Complete Question Packages**: The AI generates questions, full answer keys, accepted variations, multi-criterion rubrics, and both progressive hints at authoring time. During student examinations, **zero AI calls are made**, delivering instant (<2ms) deterministic evaluation with zero hallucination.
2. **Server-Enforced Progressive 2-Hint State Machine**: Exactly two hints per question. Answer keys and hints remain in protected tables isolated by Row Level Security (RLS). The server state machine unlocks Hint 1 on the first incorrect submission, Hint 2 on the second, and strictly finalizes the question on the third attempt.
3. **Academic Trait Framework (Bloom's Revised Taxonomy)**: Evaluates six cognitive dimensions (Remembering, Understanding, Application, Analysis, Creativity, Evaluation) with weighted scoring, evidence counts, statistical confidence badges, and percentage-point improvement tracking ($\Delta \text{Trait} = \text{Final} - \text{Baseline}$).
4. **Pedagogical Grounding Guard**: AI question packages and personalized remediation packages are strictly grounded in approved course materials (syllabi, lecture notes, textbook excerpts).
5. **UI Aesthetic Matched to Modern Academic Dashboard**: Deep purple branded sidebar (`#3E2D68`), active curved white pill tabs, soft lavender background (`#F4F5FA`), 4 vibrant stat cards (Coral, Indigo, Amber, Emerald), and top scorer podium cards.

---

## 🏗️ Technology Stack

| Layer | Technology |
|---|---|
| Frontend Framework | Next.js 14 (App Router, React 18, TypeScript) |
| Styling & Components | Tailwind CSS, Lucide React, shadcn/ui primitives |
| Data Visualizations | Recharts (Radar, Bar, and Cartesian Charts) |
| Database & Security | Supabase PostgreSQL with 20 relational tables & full RLS |
| Authentication | Supabase Auth (Faculty & Student roles) |
| Storage | Supabase Storage (Private document buckets) |
| AI Inference Engine | Groq API (`groq-sdk`, `llama-3.3-70b-versatile`) |
| Data Validation | Zod strict schema validation |
| Testing | Vitest (18 passed automated tests) |
| Hosting & Deployment | Render Web Service (`render.yaml`) |

---

## 🚀 Quick Start

### 1. Clone & Install Dependencies
```bash
git clone https://github.com/your-username/adaptivelearn-ai.git
cd adaptivelearn-ai
npm.cmd install
```

### 2. Configure Environment
Copy `.env.example` to `.env.local`:
```bash
cp .env.example .env.local
```
Add your `GROQ_API_KEY` for live AI generation. (If unset, the platform's high-quality grounded fallback engine operates seamlessly).

### 3. Run Automated Tests
```bash
npm.cmd test
```
All 18 tests will execute, verifying deterministic evaluation, the 2-hint state machine, Bloom's trait scoring, and Zod schemas.

### 4. Start Development Server
```bash
npm.cmd run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 👥 Demo Accounts & Pre-Seeded Dataset

The platform includes a preloaded demonstration dataset with institutional data, 3 faculty, 3 courses, and 25 student accounts:

| Role | Name | Email | Course / Focus |
|---|---|---|---|
| **Faculty** | Dr. Aris Thorne | `faculty@adaptivelearn.ai` | CS101: Introduction to Computer Science & AI |
| **Faculty** | Dr. Maya Lin | `maya.lin@adaptivelearn.ai` | DS201: Data Structures & Algorithms |
| **Faculty** | Prof. Marcus Vance | `marcus.vance@adaptivelearn.ai` | ML301: Machine Learning Fundamentals |
| **Student** | Branden Harris | `student1@adaptivelearn.ai` | CS101 (Baseline: 70.8%, Final: 93.3%, +22.5 pp growth) |
| **Student** | Charles James | `student2@adaptivelearn.ai` | DS201 |
| **Student** | Mike Peter | `student3@adaptivelearn.ai` | ML301 |

*Note: Use the "Switch View" button in the top navigation bar to toggle between Faculty and Student portals instantly.*

---

## 📚 Mandatory Documentation Index

1. [`PROJECT_PLAN.md`](./PROJECT_PLAN.md) — Comprehensive product roadmap, milestones, and workflow specifications.
2. [`DATABASE_SCHEMA.md`](./DATABASE_SCHEMA.md) — Detailed relational schema for all 20 Supabase tables.
3. [`API_SPECIFICATION.md`](./API_SPECIFICATION.md) — Endpoint specifications, payloads, responses, and authorization rules.
4. [`AI_ARCHITECTURE.md`](./AI_ARCHITECTURE.md) — Authoring-time package generation, Groq provider, and Zod schemas.
5. [`SECURITY_AND_RLS.md`](./SECURITY_AND_RLS.md) — Row Level Security policies and answer key protection.
6. [`TESTING_REPORT.md`](./TESTING_REPORT.md) — Vitest test results (18/18 passed) and production build logs.
7. [`DEPLOYMENT_GUIDE.md`](./DEPLOYMENT_GUIDE.md) — Step-by-step instructions for Render Web Service deployment.
8. [`render.yaml`](./render.yaml) — Infrastructure-as-Code specification for Render.
9. [`.env.example`](./.env.example) — Complete environment variable template.
10. [`supabase/migrations/`](./supabase/migrations/) — Version-controlled SQL migrations (`001_initial_schema.sql`, `002_rls_policies.sql`, `003_seed_data.sql`).

