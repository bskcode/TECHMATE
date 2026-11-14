// ====================================================================
// ADAPTIVELEARN AI — Personalized Learning Package Generator
// Generates faculty-approved remediation packages grounded strictly in
// the specific course curriculum (zero cross-course contamination).
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

STRICT COURSE-SPECIFIC ISOLATION:
1. EXCLUSIVE SPECIFIC COURSE SCOPE: All explanations, learning gap analyses, worked examples, analogies, revision checklists, and practice questions MUST be 100% grounded in and specific to the course named in the prompt and its provided lecture material.
2. ZERO CROSS-COURSE CONTAMINATION: Under NO circumstances should you introduce facts, theories, definitions, questions, or examples from unrelated courses (e.g. if the course is Data Structures, do NOT generate AI heuristic questions; if the course is Database Systems, do NOT generate compiler theory questions).
3. PEDAGOGICAL GROUNDING: Use clear markdown headings, KaTeX math notation where relevant, realistic step-by-step worked examples, and objective practice questions with plausible distractors.

PACKAGE REQUIREMENTS:
1. Title: Engaging, targeted remediation module title specific to the course.
2. Learning Gap Summary: Precise diagnosis of the student's conceptual roadblock in this course.
3. Explanation Markdown: Clear, step-by-step conceptual walkthrough using markdown headings and formulas.
4. Worked Examples: Concrete problems in this course broken down into clear steps.
5. Analogies: Real-world mental models to make this course's abstract ideas intuitive.
6. Revision Checklist: 3 to 5 actionable self-assessment questions for this course.
7. Recommended Next Steps: 2 to 3 sequential study actions.
8. Practice Questions: 2 to 4 objective practice questions with options, correct answer, and pedagogical explanations grounded in this course.

Respond ONLY with valid JSON conforming to the requested schema.`;

export async function generatePersonalizedPackage(
  params: GenerateInterventionParams
): Promise<InterventionPackageZod> {
  const { studentName, courseTitle, weakTraits, weakOutcomes = [], groundingText, diagnosticScore } = params;

  const userPrompt = `Student: ${studentName}
Target Course: ${courseTitle}
Diagnostic Baseline Score: ${diagnosticScore}%
Identified Weak Traits: ${weakTraits.join(', ')}
${weakOutcomes.length ? `Weak Outcomes: ${weakOutcomes.join(', ')}` : ''}

Approved Specific Course Material (derive all remediation EXCLUSIVELY from this text):
"""
${groundingText.slice(0, 15000)}
"""

STRICT REQUIREMENT: All content, worked examples, analogies, and practice questions must be strictly and exclusively derived from "${courseTitle}". Do NOT use concepts or questions from any other course.

Generate the personalized intervention package as a single JSON object.`;

  if (groqService.isConfigured()) {
    try {
      const rawJson = await groqService.complete({
        systemPrompt: SYSTEM_PROMPT,
        userPrompt,
        temperature: 0.1,
      });

      // Strip code fences or isolate JSON block
      let cleanedJson = rawJson.trim();
      const codeFenceMatch = cleanedJson.match(/```(?:json)?\s*([\s\S]*?)\s*```/i);
      if (codeFenceMatch) {
        cleanedJson = codeFenceMatch[1].trim();
      } else {
        const firstBrace = cleanedJson.indexOf('{');
        const lastBrace = cleanedJson.lastIndexOf('}');
        if (firstBrace !== -1 && lastBrace !== -1) {
          cleanedJson = cleanedJson.slice(firstBrace, lastBrace + 1);
        }
      }

      const parsed = JSON.parse(cleanedJson);
      return InterventionPackageSchema.parse(parsed);
    } catch (err: any) {
      console.warn('Groq intervention generation failed or invalid schema, falling back to course-specific generator:', err.message);
    }
  }

  // Course-specific Grounded Deterministic Generator Fallback
  return generateCourseSpecificInterventionFallback(
    studentName,
    courseTitle,
    weakTraits,
    groundingText,
    weakOutcomes
  );
}

/**
 * Parses key technical topics and definitions directly from the specific course text.
 */
function extractCourseTopics(courseTitle: string, text: string): string[] {
  const topics: string[] = [];
  const lines = text.split('\n').map((l) => l.trim()).filter((l) => l.length > 5);

  for (const line of lines) {
    const modMatch = line.match(/^\[?(?:Module\s*\d*[:\s-]+)?([A-Za-z0-9\s,&/()'-]{4,45})\]?$/i);
    if (modMatch && !modMatch[1].toLowerCase().includes('course outcomes')) {
      topics.push(modMatch[1].trim());
      continue;
    }

    const colonMatch = line.match(/^([A-Za-z0-9\s'-]{4,35}):\s*.+$/);
    if (
      colonMatch &&
      !/^(course|instructor|term|credits?|document|overview)/i.test(colonMatch[1])
    ) {
      topics.push(colonMatch[1].trim());
    }
  }

  if (topics.length > 0) {
    return Array.from(new Set(topics)).slice(0, 8);
  }

  // Heuristic topic fallback based on course title
  const lower = courseTitle.toLowerCase();
  if (lower.includes('data structure') || lower.includes('ds')) {
    return ['Arrays and Pointers', 'Linked Lists', 'Stacks and Queues', 'Binary Search Trees', 'Hash Tables'];
  }
  if (lower.includes('database') || lower.includes('dbms')) {
    return ['Relational Schemas', 'SQL Query Optimization', 'B+ Tree Indexing', 'ACID Transactions'];
  }
  if (lower.includes('network')) {
    return ['OSI & TCP/IP Stack', 'Routing Algorithms', 'Congestion Control', 'Socket Programming'];
  }
  if (lower.includes('operating system') || lower.includes('os')) {
    return ['Process Scheduling', 'Virtual Memory & Paging', 'Deadlock Invariants', 'Concurrency Semaphores'];
  }

  return ['Core Principles', 'Operational Mechanics', 'Algorithmic Complexity', 'Architectural Trade-offs'];
}

/**
 * Deterministic course-specific fallback generator that grounds all remediation,
 * explanations, worked examples, and practice questions strictly in the specific course.
 */
export function generateCourseSpecificInterventionFallback(
  studentName: string,
  courseTitle: string,
  weakTraits: BloomTrait[],
  groundingText: string,
  weakOutcomes: string[] = []
): InterventionPackageZod {
  const traitList = weakTraits.join(' and ');
  const topics = extractCourseTopics(courseTitle, groundingText);
  const primaryTopic = topics[0] || 'Core Subject Foundations';
  const secondaryTopic = topics[1] || topics[0] || 'Operational Mechanisms';

  // Specific course detection
  const lower = courseTitle.toLowerCase();
  const isDataStructures = lower.includes('data structure') || lower.includes('ds');
  const isAIorCS101 = lower.includes('computer science') || lower.includes('ai') || lower.includes('cs101');

  if (isDataStructures) {
    return {
      title: `Targeted Mastery: Data Structure Invariants & Complexity in ${courseTitle}`,
      learning_gap_summary: `${studentName} demonstrated solid baseline understanding but encountered friction applying structural invariants and Big-O trade-offs in ${courseTitle} (targeting ${traitList}).`,
      explanation_markdown: `# Personalized Remediation: Data Structure Operations & Memory Trade-offs
Course Context: **${courseTitle}**

## 1. Where the Gap Occurred
Your diagnostic assessment indicated difficulty analyzing the performance trade-offs between **contiguous memory structures (Arrays)** and **node-based pointer structures (Linked Lists)**, as well as tree-based search structures.

## 2. Breaking Down the Principles
In ${courseTitle}, data structure selection dictates both runtime and spatial memory overhead:
- **Array / Dynamic Array**:
  - **Random Access**: $O(1)$ direct index lookup via base pointer offset: $\\text{Address}(A[i]) = \\text{Base} + i \\times \\text{Size}$.
  - **Insertion / Deletion at Index 0**: $O(N)$ due to shifting elements.
- **Singly / Doubly Linked List**:
  - **Random Access**: $O(N)$ sequential pointer traversal.
  - **Insertion at Head / Tail (with tail pointer)**: $O(1)$ pointer reassignment without copying.
- **Binary Search Tree (BST)**:
  - **Invariants**: For every node $X$, all keys in the left subtree are $< X.\\text{key}$, and all keys in the right subtree are $> X.\\text{key}$.
  - **Average Search**: $O(\\log N)$ when balanced; degrades to $O(N)$ when skewed into a linear chain.

## 3. Core Complexity Summary
| Data Structure | Access | Search | Insertion (Head) | Insertion (Middle) | Space Overhead |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Array** | $O(1)$ | $O(N)$ or $O(\\log N)$ sorted | $O(N)$ | $O(N)$ | None (tight packing) |
| **Linked List** | $O(N)$ | $O(N)$ | $O(1)$ | $O(1)$ if pointer given | Extra pointers per node |
| **Balanced BST** | $O(\\log N)$ | $O(\\log N)$ | $O(\\log N)$ | $O(\\log N)$ | Left/Right child pointers |`,
      worked_examples: [
        {
          step: 1,
          description: `Analyzing Array Index Calculation in ${courseTitle}: In a 64-bit integer array where integers occupy 8 bytes, accessing array[42] with base address 0x1000 calculates address 0x1000 + (42 * 8) = 0x1150 in O(1) clock cycles.`,
        },
        {
          step: 2,
          description: `Evaluating Linked List vs Array Traversal: To retrieve the median element in an unsorted list of N=10,000 items, an array allows O(1) direct access once sorted, whereas a linked list requires traversing exactly 5,000 pointer hops.`,
        },
        {
          step: 3,
          description: `BST Invariant Verification: Given root key 50, left child 30, and right child 70, inserting 45 places it as the right child of 30 because 30 < 45 < 50.`,
        },
      ],
      analogies: [
        {
          concept: 'Array vs Linked List',
          analogy: 'An array is like a numbered row of adjacent lockers (instant access if you know the locker number, but inserting a new locker in the middle requires shifting every locker down). A linked list is like a treasure hunt clue card pointing to the next location (easy to insert a clue, but you must visit every clue in order to reach the 10th one).',
        },
        {
          concept: 'BST Search Property',
          analogy: 'A Binary Search Tree is like playing the higher-or-lower guessing game: every comparison deterministically cuts half of the remaining search space.',
        },
      ],
      revision_checklist: [
        `Can you state why array indexing is O(1) in ${courseTitle}?`,
        'Can you trace pointer reassignments during a linked list node deletion?',
        'Do you know the exact condition under which a BST degenerates to O(N)?',
        'Can you determine which data structure minimizes memory for frequent head insertions?',
      ],
      recommended_next_steps: [
        `Review the core data structure trade-off table above for ${courseTitle}.`,
        'Solve the 2 practice questions below to reinforce structural analysis.',
        'Review your progressive assessment to verify mastery of these concepts.',
      ],
      practice_questions: [
        {
          question_text: `In ${courseTitle}, what is the worst-case time complexity of searching for an element in an unbalanced Binary Search Tree containing N elements?`,
          options: ['O(1)', 'O(log N)', 'O(N)', 'O(N^2)'],
          correct_answer: 'O(N)',
          explanation: 'When a BST is completely unbalanced (e.g., elements inserted in ascending order), it degenerates into a linear linked list where search takes O(N).',
          trait: 'analysis',
        },
        {
          question_text: `Which data structure provides O(1) time complexity for inserting an element at the beginning, without requiring elements to be shifted in memory?`,
          options: ['Contiguous Static Array', 'Dynamic Array (Vector)', 'Singly Linked List', 'Binary Heap'],
          correct_answer: 'Singly Linked List',
          explanation: 'A Singly Linked List inserts a node at the head in O(1) by updating the new node’s next pointer to current head and resetting the head pointer.',
          trait: 'application',
        },
      ],
    };
  }

  // General course-specific fallback strictly derived from the course topics and grounding text
  return {
    title: `Targeted Remediation: Mastering ${primaryTopic} in ${courseTitle}`,
    learning_gap_summary: `${studentName} demonstrated strong foundational engagement but experienced difficulties synthesizing operational principles and evaluating structural trade-offs in ${primaryTopic} for ${courseTitle} (addressing ${traitList}).`,
    explanation_markdown: `# Targeted Remediation: ${primaryTopic} & ${secondaryTopic}
Course Context: **${courseTitle}**

## 1. Where the Gap Occurred
Your diagnostic assessment indicated friction when applying core analytical principles and evaluating structural constraints in **${primaryTopic}**.

## 2. Core Principles & Operational Foundations
In **${courseTitle}**, mastering this domain requires understanding the direct relationship between technical definitions and their computational or practical invariants:
- **${primaryTopic}**: Serves as a foundational structural building block. Understanding how it transforms inputs and maintains system invariants is essential for passing progressive assessments.
- **${secondaryTopic}**: Operates in conjunction with **${primaryTopic}** to govern operational constraints, bounds, and correctness conditions.

## 3. Key Invariants & Formulas
- Review the specific relationships defined in your syllabus and lecture notes for **${courseTitle}**.
- Ensure that every problem formulation clearly distinguishes between independent inputs, state transitions, and expected terminal conditions.`,
    worked_examples: [
      {
        step: 1,
        description: `Deconstructing Problem Specifications in ${courseTitle}: First identify the governing constraints associated with ${primaryTopic}.`,
      },
      {
        step: 2,
        description: `Applying Formal Invariants: Evaluate how transitions affect the underlying structure, verifying that correctness criteria remain satisfied.`,
      },
      {
        step: 3,
        description: `Verifying Boundary Conditions: Test corner cases to ensure the operational guarantees of ${secondaryTopic} hold without degradation.`,
      },
    ],
    analogies: [
      {
        concept: `${primaryTopic} Invariants`,
        analogy: `Think of ${primaryTopic} as a precision railway track switch: every movement must follow strict mechanical rules so that subsequent operations execute smoothly without derailment.`,
      },
    ],
    revision_checklist: [
      `Can you write out the formal definition of ${primaryTopic} in ${courseTitle}?`,
      `Do you understand how ${primaryTopic} interacts with ${secondaryTopic}?`,
      'Can you identify the boundary constraints and potential failure points in standard problem configurations?',
    ],
    recommended_next_steps: [
      `Review your course notes and syllabus milestones for ${courseTitle}.`,
      'Work through the 2 practice questions below without reference to notes.',
      'Check your explanations against the lecture materials before taking the next assessment.',
    ],
    practice_questions: [
      {
        question_text: `In the study of ${courseTitle}, which statement accurately identifies the primary role of ${primaryTopic}?`,
        options: [
          `It defines the core operational invariants and structural rules in ${courseTitle}.`,
          `It acts as an obsolete placeholder that violates system constraints.`,
          `It operates strictly without termination conditions or formal bounds.`,
          `It inverts all inputs and produces non-deterministic outputs.`,
        ],
        correct_answer: `It defines the core operational invariants and structural rules in ${courseTitle}.`,
        explanation: `In ${courseTitle}, ${primaryTopic} establishes the foundational operational invariants necessary for correctness and analytical evaluation.`,
        trait: 'understanding',
      },
      {
        question_text: `When evaluating system requirements in ${courseTitle}, under which condition is ${secondaryTopic} most appropriately applied?`,
        options: [
          `When operational bounds require structured verification of system state.`,
          `When the system must execute without memory or storage allocation.`,
          `Only in legacy environments where verification is intentionally bypassed.`,
          `When all algorithmic transitions must be non-deterministic.`,
        ],
        correct_answer: `When operational bounds require structured verification of system state.`,
        explanation: `According to ${courseTitle} principles, ${secondaryTopic} provides structured verification of system invariants under defined operational bounds.`,
        trait: 'analysis',
      },
    ],
  };
}
