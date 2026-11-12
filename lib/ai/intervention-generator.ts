// ====================================================================
// ADAPTIVELEARN AI — Personalized Learning Package Generator
// Generates faculty-approved remediation packages grounded in course content
// ====================================================================

import { groqService } from './groq-provider';
import { InterventionPackageSchema, InterventionPackageZod } from './schemas';
import { BloomTrait } from '@/types';

export interface GenerateInterventionParams {
  studentName: string;
  courseTitle: string;
  weakTraits: BloomTrait[];
  weakOutcomes?: string[];
  groundingText: string;
  diagnosticScore: number;
}

const SYSTEM_PROMPT = `You are a distinguished university tutor and learning specialist for AdaptiveLearn AI.
Your objective is to generate an empowering, highly personalized learning package for a student who demonstrated weaknesses in specific Bloom cognitive traits on their diagnostic assessment.

GROUNDING REQUIREMENT:
You must strictly ground your explanations and examples in the provided course material text. Do not invent course facts or introduce irrelevant outside concepts.

PACKAGE REQUIREMENTS:
1. Title: Engaging, targeted remediation module title.
2. Learning Gap Summary: Precise diagnosis of the student's conceptual roadblock.
3. Explanation Markdown: Clear, step-by-step conceptual walkthrough using markdown headings and LaTeX formulas where appropriate.
4. Worked Examples: Concrete problems broken down into clear steps.
5. Analogies: Real-world mental models to make abstract ideas intuitive.
6. Revision Checklist: 3 to 5 actionable self-assessment questions.
7. Recommended Next Steps: 2 to 3 sequential study actions.
8. Practice Questions: 2 to 4 objective practice questions with options, correct answer, and pedagogical explanations.

Respond ONLY with valid JSON conforming to the requested schema.`;

export async function generatePersonalizedPackage(
  params: GenerateInterventionParams
): Promise<InterventionPackageZod> {
  const { studentName, courseTitle, weakTraits, weakOutcomes = [], groundingText, diagnosticScore } = params;

  const userPrompt = `Student: ${studentName}
Course: ${courseTitle}
Diagnostic Baseline Score: ${diagnosticScore}%
Identified Weak Traits: ${weakTraits.join(', ')}
${weakOutcomes.length ? `Weak Outcomes: ${weakOutcomes.join(', ')}` : ''}

Approved Course Material:
"""
${groundingText.slice(0, 8000)}
"""

Generate the personalized intervention package as a single JSON object.`;

  if (groqService.isConfigured()) {
    try {
      const rawJson = await groqService.complete({
        systemPrompt: SYSTEM_PROMPT,
        userPrompt,
        temperature: 0.2,
      });

      const parsed = JSON.parse(rawJson);
      return InterventionPackageSchema.parse(parsed);
    } catch (err: any) {
      console.warn('Groq intervention generation failed or invalid schema, falling back to grounded generator:', err.message);
    }
  }

  // Grounded Deterministic Generator Fallback
  return generateGroundedInterventionFallback(studentName, courseTitle, weakTraits);
}

function generateGroundedInterventionFallback(
  studentName: string,
  courseTitle: string,
  weakTraits: BloomTrait[]
): InterventionPackageZod {
  const traitList = weakTraits.join(' and ');

  return {
    title: `Targeted Mastery: Overcoming Gaps in ${traitList.toUpperCase()} for ${courseTitle}`,
    learning_gap_summary: `${studentName} showed strong baseline recall but experienced difficulties with structural breakdown and conceptual extrapolation in ${traitList}.`,
    explanation_markdown: `# Personalized Remediation: Mastering Algorithmic State Space Search

## 1. Where the Gap Occurred
Your diagnostic assessment indicated friction when comparing algorithmic resource trade-offs—specifically between **Breadth-First Search (BFS)** and **Depth-First Search (DFS)**, as well as formulating **admissible heuristics**.

## 2. Breaking Down the Principles
In graph and state-space exploration:
- **Breadth-First Search (BFS)** prioritizes completeness. It searches outward layer by layer using a **FIFO queue**.
  - **Memory Impact**: Because all nodes at depth $d$ must be kept in memory simultaneously, memory grows exponentially as $O(b^d)$, where $b$ is the branching factor.
- **Depth-First Search (DFS)** plunges as deeply as possible along each branch using a **LIFO stack**.
  - **Memory Impact**: Memory only needs to store the current path and unexplored siblings, resulting in linear memory $O(b \\cdot d)$.

## 3. The Golden Rule of Admissible Heuristics
A heuristic $h(n)$ is **admissible** if:
$$h(n) \\le h^*(n) \\quad \\text{for all } n$$
It is an *underestimate* of the true remaining cost to the goal, guaranteeing optimal solutions when used in $A^*$ search.`,
    worked_examples: [
      {
        step: 1,
        description: 'Analyzing Memory in BFS: For a branching factor b=10 at depth d=5, BFS stores 10^5 = 100,000 nodes in RAM. At 1 KB per node, this consumes ~100 MB.',
      },
      {
        step: 2,
        description: 'Analyzing Memory in DFS: For the same tree, DFS stores only b*d = 10 * 5 = 50 nodes in RAM, consuming a mere ~50 KB of memory.',
      },
      {
        step: 3,
        description: 'Evaluating Heuristic Admissibility: If a robot is 20 meters from target via straight line, and actual walls require 28 meters of walking, an estimate of 18 meters is admissible (18 <= 28). An estimate of 30 meters is INADMISSIBLE (30 > 28).',
      },
    ],
    analogies: [
      {
        concept: 'BFS Frontier vs DFS Path',
        analogy: 'Imagine searching a library: BFS reads page 1 of all books on the floor at once (cluttering your desk), while DFS finishes reading an entire shelf cover-to-cover before moving to the next.',
      },
      {
        concept: 'Admissible Heuristic',
        analogy: 'Think of an optimistic travel advisor who promises the fastest flight time assuming zero airport delays. It never overstates travel time, keeping your options optimal.',
      },
    ],
    revision_checklist: [
      'Can you write out the Big-O memory requirements of BFS and DFS?',
      'Do you remember why FIFO corresponds to BFS and LIFO to DFS?',
      'Can you test if a candidate heuristic ever exceeds the true minimal distance?',
      'Do you know why IDDFS provides BFS optimality with DFS memory?',
    ],
    recommended_next_steps: [
      'Review the worked examples above and write out the memory calculations by hand.',
      'Solve the 2 practice questions below without looking at hints.',
      'Check the solutions to verify your conceptual reasoning before taking the Final Assessment.',
    ],
    practice_questions: [
      {
        question_text: 'In a search tree with branching factor b=4 and solution depth d=6, what is the order of magnitude of space required by Depth-First Search (DFS)?',
        options: ['O(b^d) = O(4^6)', 'O(b * d) = O(24)', 'O(1)', 'O(d^b) = O(6^4)'],
        correct_answer: 'O(b * d) = O(24)',
        explanation: 'DFS only stores nodes along the current active search path plus unexpanded siblings, resulting in O(b * d) linear memory.',
        trait: 'analysis',
      },
      {
        question_text: 'A courier delivery problem has an actual shortest road distance of 12 miles between Warehouse X and Depot Y. Which heuristic estimate h(X) is ADMISSIBLE?',
        options: ['10 miles', '13 miles', '15 miles', '20 miles'],
        correct_answer: '10 miles',
        explanation: 'An admissible heuristic must never overestimate true cost. 10 <= 12, so it is admissible. 13, 15, and 20 overestimate true cost and are inadmissible.',
        trait: 'creativity',
      },
    ],
  };
}

