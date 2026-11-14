// ====================================================================
// ADAPTIVELEARN AI — Question Package Generator
// Authoring-time generation of complete question packages strictly
// grounded in uploaded course notes and lecture materials.
// Standard technical subject-matter questions with zero administrative metadata.
// ====================================================================

import { groqService } from './groq-provider';
import { AssessmentGenerationResponseSchema, QuestionPackageZod } from './schemas';
import { BloomTrait } from '@/types';

export interface GenerateQuestionsParams {
  courseTitle: string;
  moduleTitle?: string;
  groundingText: string;
  questionCount: number;
  targetTraits?: BloomTrait[];
  difficulty?: 'easy' | 'medium' | 'hard';
}

/**
 * Strips administrative metadata lines (course code, instructor, term, credits)
 * so that questions are purely technical and subject-matter focused.
 */
export function sanitizeTechnicalGroundingText(text: string): string {
  const lines = text.split('\n');
  const filtered = lines.filter((line) => {
    const trimmed = line.trim();
    if (!trimmed) return true;
    if (
      /^(course\s+(code|title|name|id|number|credits?)|instructor|professor|faculty|term|semester|academic\s+year|credits?|credit\s+hours?|prerequisites?|office\s+hours?|email|contact|department|school|university|grading\s+policy|attendance|exam\s+date)\s*:/i.test(
        trimmed
      )
    ) {
      return false;
    }
    if (/^COURSE\s+SYLLABUS\s*:/i.test(trimmed)) {
      return false;
    }
    return true;
  });
  return filtered.join('\n');
}

/**
 * Checks if a question is asking about administrative metadata rather than technical subject matter.
 */
export function isAdministrativeQuestion(text: string): boolean {
  const lower = text.toLowerCase();
  return (
    /what\s+is\s+the\s+course\s+(code|id|title|name|number)/i.test(lower) ||
    /which\s+course\s+(code|title|number|outcome)/i.test(lower) ||
    /who\s+is\s+the\s+(instructor|professor|faculty|lecturer)/i.test(lower) ||
    /in\s+which\s+(term|semester|academic\s+year)/i.test(lower) ||
    /how\s+many\s+credits/i.test(lower) ||
    /what\s+is\s+(co[1-6]|course\s+outcome)/i.test(lower) ||
    /syllabus\s+code/i.test(lower)
  );
}

const SYSTEM_PROMPT = `You are a distinguished university professor and academic assessment architect for AdaptiveLearn AI.
Your absolute duty is to generate assessment question packages grounded STRICTLY in the provided uploaded course materials.

STRICT TECHNICAL SUBJECT-MATTER DIRECTIVES:
1. RIGOROUS TECHNICAL SUBJECT CONTENT ONLY: Every question must test academic, technical, subject-matter concepts (algorithms, mathematical logic, code execution, data structure invariants, operational mechanisms, formulas, computational complexity, architectural trade-offs, or formal definitions).
2. ABSOLUTE PROHIBITION ON ADMINISTRATIVE / SYLLABUS METADATA QUESTIONS:
   - NEVER ask questions about the course code, course title, course number, course name, instructor name, semester, term, academic year, credit hours, office hours, syllabus organization, or course outcome codes (e.g. NEVER ask "What is the course code?", "What is the course title?", "Who is the instructor?", "Which course outcome addresses X?").
   - If the grounding text contains headers like course codes or instructors, IGNORE them completely. Only test the actual technical domain concepts.
3. EXCLUSIVE SOURCE MATERIAL: Every question, option, correct answer, hint, and explanation MUST be directly derived from technical content in the provided course material text.
4. ZERO EXTERNAL INVENTIONS: Under NO circumstances introduce outside facts not grounded in the material.
5. OBJECTIVE EVALUATION: ONLY generate deterministic questions: 'mcq', 'multiple_select', 'true_false', 'numeric', or 'fill_in_blank'.
6. BLOOM TAXONOMY MAPPING: Map each question to its primary cognitive dimension:
   - remembering: factual technical definition or property recall
   - understanding: conceptual comprehension of mechanisms or operational rules
   - application: problem solving, calculation, or code analysis
   - analysis: comparing structures, complexity bounds, or algorithmic trade-offs
   - creativity: formulating hypotheses, heuristic approaches, or synthesis
   - evaluation: appraising trade-offs, optimality, or design decisions
7. MANDATORY FIELDS PER QUESTION:
   - question_text (unambiguous, professional university-grade question)
   - question_type ('mcq' | 'multiple_select' | 'true_false' | 'numeric' | 'fill_in_blank')
   - options (array of 4 distinct plausible choices for mcq / multiple_select; ['True', 'False'] for true_false)
   - correct_answer (the exact correct option string; for multiple_select, comma-separated options)
   - accepted_variations (array of alternate valid representations)
   - reference_answer (concise model answer directly quoting or citing the material)
   - explanation (clear academic explanation based strictly on the material)
   - rubric (array of marking criteria with criteria_name, description, max_points: 5, weight: 1.0)
   - max_marks (usually 5.0)
   - primary_trait (one of Bloom's 6 dimensions)
   - difficulty ('easy' | 'medium' | 'hard')
   - hint_1 (first progressive hint guiding student towards the concept from the text)
   - hint_2 (second deeper hint with formula or direct clue from the text)
   - evaluation_method ('deterministic')
   - source_reference (explicit citation of the uploaded material section)

Respond ONLY with valid JSON conforming to the requested schema.`;

export async function generateQuestionPackages(
  params: GenerateQuestionsParams
): Promise<QuestionPackageZod[]> {
  const {
    courseTitle,
    moduleTitle,
    groundingText,
    questionCount = 5,
    targetTraits = ['remembering', 'understanding', 'application', 'analysis', 'creativity', 'evaluation'],
    difficulty = 'medium',
  } = params;

  // Sanitize grounding text to ensure zero administrative metadata is ingested
  const sanitizedText = sanitizeTechnicalGroundingText(groundingText);

  const userPrompt = `Course: ${courseTitle}
${moduleTitle ? `Assessment / Module: ${moduleTitle}` : ''}
Target Bloom Traits: ${targetTraits.join(', ')}
Difficulty: ${difficulty}

EXACT NUMBER OF QUESTIONS REQUIRED: ${questionCount}
(MANDATORY: You MUST return an array containing EXACTLY ${questionCount} complete question objects. Count them before returning — there must be exactly ${questionCount} questions.)

APPROVED UPLOADED TECHNICAL MATERIAL (DERIVE QUESTIONS EXCLUSIVELY FROM THIS TEXT):
"""
${sanitizedText.slice(0, 35000)}
"""

CRITICAL GROUNDING & TECHNICAL DIRECTIVES:
1. Every question MUST be a STANDARD, TECHNICAL SUBJECT-MATTER question testing algorithms, data structures, logic, formulas, or operational mechanisms.
2. ABSOLUTELY NO ADMINISTRATIVE QUESTIONS: Do NOT ask for course code, course title, instructor, term, credits, or CO numbers.
3. All options, correct answers, explanations, and hints must be formulated EXCLUSIVELY and DIRECTLY from the technical lecture text above.
4. Output ONLY valid JSON with this exact structure:
{
  "assessment_title": "${courseTitle} - ${moduleTitle || 'Assessment'}",
  "assessment_description": "Standard university subject assessment grounded strictly in course materials.",
  "questions": [
    {
      "question_text": "...",
      "question_type": "mcq",
      "options": ["Option 1", "Option 2", "Option 3", "Option 4"],
      "correct_answer": "Option 1",
      "accepted_variations": ["Option 1"],
      "reference_answer": "Model answer from lecture text",
      "explanation": "Why this is correct based strictly on the text",
      "rubric": [{ "criteria_name": "Technical Accuracy", "description": "Grounded per lecture notes", "max_points": 5, "weight": 1.0 }],
      "max_marks": 5,
      "primary_trait": "understanding",
      "difficulty": "${difficulty}",
      "hint_1": "Progressive clue 1 from text",
      "hint_2": "Progressive clue 2 with deeper quote/formula from text",
      "evaluation_method": "deterministic",
      "source_reference": "Document citation"
    }
  ]
}`;

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
      const validated = AssessmentGenerationResponseSchema.parse(parsed);

      // Filter out any administrative metadata question if Groq slipped one in
      const technicalQuestions = validated.questions.filter(
        (q) => !isAdministrativeQuestion(q.question_text)
      );

      if (technicalQuestions.length >= questionCount) {
        return technicalQuestions.slice(0, questionCount);
      }

      // If some were filtered out, supplement with deterministic grounded technical questions
      if (technicalQuestions.length > 0) {
        const needed = questionCount - technicalQuestions.length;
        const supplemental = generateGroundedFallbackPackages(
          courseTitle,
          sanitizedText,
          targetTraits,
          needed
        );
        return [...technicalQuestions, ...supplemental].slice(0, questionCount);
      }
    } catch (err: any) {
      console.warn('Groq question generation failed or invalid schema, falling back to grounded text generator:', err.message);
    }
  }

  // Grounded Deterministic Generator Fallback strictly using sanitized technical text
  return generateGroundedFallbackPackages(courseTitle, sanitizedText, targetTraits, questionCount);
}

interface ExtractedFact {
  subject: string;
  relation?: string;
  detail: string;
  raw: string;
}

const ADMINISTRATIVE_SUBJECT_REGEX = /^(course|course\s+code|course\s+title|course\s+name|course\s+id|course\s+number|instructor|professor|faculty|term|semester|academic\s*year|credits?|credit\s+hours?|prerequisites?|office\s*hours?|email|contact|department|school|university|syllabus|grading|grade|evaluation\s+criteria|course\s+outcome|co\d+|outcome\d*|module\s+\d+|unit\s+\d+|chapter\s+\d+|lecture\s+\d+|textbook|reference\s+books?)$/i;

/**
 * Parses factual definitions, equations, and technical statements directly from the uploaded text,
 * strictly filtering out any administrative metadata.
 */
function extractFactsFromText(text: string): ExtractedFact[] {
  const lines = text
    .split('\n')
    .map((l) => l.trim())
    .filter((l) => l.length > 10 && !l.startsWith('==='));

  const facts: ExtractedFact[] = [];

  for (const line of lines) {
    // 1. Definition via colon: "Term: Definition description"
    const colonMatch = line.match(/^(\d+[\.\)]\s*)?([A-Za-z0-9\s'-]+):\s*(.+)$/);
    if (colonMatch && colonMatch[2].length < 50 && colonMatch[3].length > 10) {
      const subject = colonMatch[2].trim();
      const detail = colonMatch[3].trim();

      // Skip administrative subjects or values
      if (ADMINISTRATIVE_SUBJECT_REGEX.test(subject)) continue;
      if (/^(CS|DS|AI|EE|ME|MATH|IT|SE)\d+[A-Z]?$/i.test(detail)) continue;
      if (/^Fall\s+\d{4}|Spring\s+\d{4}/i.test(detail)) continue;

      facts.push({
        subject,
        detail,
        raw: line,
      });
      continue;
    }

    // 2. Definition via copula: "Term is / are / refers to / consists of ..."
    const copulaMatch = line.match(
      /^([A-Za-z0-9\s'()-]{3,45})\s+(is|are|refers to|consists of|provides|handles|operates on|requires|evaluates to|models)\s+(.+)$/i
    );
    if (copulaMatch && copulaMatch[3].length > 10) {
      const subject = copulaMatch[1].trim();
      const detail = copulaMatch[3].trim();

      if (ADMINISTRATIVE_SUBJECT_REGEX.test(subject)) continue;

      facts.push({
        subject,
        relation: copulaMatch[2].toLowerCase(),
        detail,
        raw: line,
      });
      continue;
    }

    // 3. Complete sentences that describe technical principles
    if (line.endsWith('.') && line.length > 25) {
      // Ignore administrative sentences
      if (ADMINISTRATIVE_SUBJECT_REGEX.test(line.slice(0, 20))) continue;

      const words = line.split(' ');
      const subject = words.slice(0, Math.min(4, words.length)).join(' ');
      if (!ADMINISTRATIVE_SUBJECT_REGEX.test(subject)) {
        facts.push({
          subject,
          detail: line,
          raw: line,
        });
      }
    }
  }

  return facts;
}

/**
 * Standard subject-matter grounded fallback generator that parses technical concepts
 * and maps them dynamically to Bloom's 6 cognitive dimensions.
 * Produces standard academic university questions with ZERO course code or metadata inquiries.
 */
export function generateGroundedFallbackPackages(
  courseTitle: string,
  groundingText: string,
  targetTraits: BloomTrait[] = ['remembering', 'understanding', 'application', 'analysis', 'creativity', 'evaluation'],
  count: number = 6
): QuestionPackageZod[] {
  const packages: QuestionPackageZod[] = [];
  const sanitized = sanitizeTechnicalGroundingText(groundingText);
  const facts = extractFactsFromText(sanitized);

  // If no structured facts extracted, create sentences from plain technical paragraphs
  const fallbackSentences = sanitized
    .split(/[.\n]/)
    .map((s) => s.trim())
    .filter((s) => s.length > 20 && !ADMINISTRATIVE_SUBJECT_REGEX.test(s));

  const traits =
    targetTraits.length > 0
      ? targetTraits
      : ['remembering', 'understanding', 'application', 'analysis', 'creativity', 'evaluation'];

  for (let i = 0; i < count; i++) {
    const trait = traits[i % traits.length] as BloomTrait;
    const factIndex = facts.length > 0 ? i % facts.length : 0;
    const fact = facts[factIndex];

    const subject = fact?.subject || `Core Principle ${i + 1}`;
    const detail =
      fact?.detail ||
      fallbackSentences[i % Math.max(1, fallbackSentences.length)] ||
      `Technical algorithmic foundations in ${courseTitle}`;
    const sourceRef = `Course Lecture Notes: ${subject}`;

    switch (trait) {
      case 'remembering': {
        const questionText = fact?.relation
          ? `In ${courseTitle}, what ${fact.relation} ${subject}?`
          : `Which statement accurately identifies the technical definition or property of "${subject}"?`;
        const correctAnswer = detail.endsWith('.') ? detail.slice(0, -1) : detail;
        const distractor1 = `It inverts the standard operation and operates without bounded termination.`;
        const distractor2 = `It strictly requires exponential stack frames regardless of input sizing.`;
        const distractor3 = `It applies exclusively to deprecated legacy protocols without runtime guarantees.`;

        packages.push({
          question_text: questionText,
          question_type: 'mcq',
          options: [correctAnswer, distractor1, distractor2, distractor3].sort(),
          correct_answer: correctAnswer,
          accepted_variations: [correctAnswer],
          reference_answer: `${subject} ${fact?.relation || 'is'}: ${detail}`,
          explanation: `Directly defined in the technical course material: "${fact?.raw || detail}"`,
          rubric: [
            {
              criteria_name: 'Factual Technical Recall',
              description: 'Accurately identifies technical definition from course material',
              max_points: 5,
              weight: 1.0,
            },
          ],
          max_marks: 5,
          primary_trait: 'remembering',
          secondary_trait_weight: 0.0,
          difficulty: 'easy',
          hint_1: `Review the technical definition of ${subject} in your lecture notes.`,
          hint_2: `The notes define it as: "${detail.slice(0, 80)}..."`,
          evaluation_method: 'deterministic',
          source_reference: sourceRef,
        });
        break;
      }

      case 'understanding': {
        const isTrue = i % 2 === 0;
        const statement = isTrue
          ? `In ${courseTitle}, ${subject} ${fact?.relation || 'is defined as'}: "${detail}".`
          : `In ${courseTitle}, ${subject} operates in reverse and contradicts: "${detail}".`;

        packages.push({
          question_text: `True or False: ${statement}`,
          question_type: 'true_false',
          options: ['True', 'False'],
          correct_answer: isTrue ? 'True' : 'False',
          accepted_variations: [isTrue ? 'True' : 'False', isTrue ? 'true' : 'false', isTrue ? 'T' : 'F'],
          reference_answer: isTrue ? 'True.' : 'False. The statement mischaracterizes the technical mechanism.',
          explanation: `The technical lecture notes state: "${fact?.raw || detail}"`,
          rubric: [
            {
              criteria_name: 'Conceptual Technical Understanding',
              description: 'Correctly verifies technical validity of the assertion',
              max_points: 5,
              weight: 1.0,
            },
          ],
          max_marks: 5,
          primary_trait: 'understanding',
          secondary_trait_weight: 0.0,
          difficulty: 'easy',
          hint_1: `Examine the operational mechanics of ${subject}.`,
          hint_2: `Compare the assertion directly with the lecture statement: "${detail.slice(0, 60)}"`,
          evaluation_method: 'deterministic',
          source_reference: sourceRef,
        });
        break;
      }

      case 'application': {
        const questionText = `A software engineer working in ${courseTitle} must satisfy the following requirement: "${detail}". Which core concept or mechanism should be applied?`;
        const otherSubjects = facts
          .filter((_, idx) => idx !== factIndex)
          .map((f) => f.subject)
          .filter((s) => s !== subject)
          .slice(0, 3);
        while (otherSubjects.length < 3) {
          otherSubjects.push(`Alternative Computational Strategy ${otherSubjects.length + 1}`);
        }

        packages.push({
          question_text: questionText,
          question_type: 'mcq',
          options: [subject, ...otherSubjects].sort(),
          correct_answer: subject,
          accepted_variations: [subject],
          reference_answer: subject,
          explanation: `According to the material, ${subject} addresses this technical requirement: "${fact?.raw || detail}"`,
          rubric: [
            {
              criteria_name: 'Application of Principle',
              description: 'Correctly applies concept to concrete technical requirement',
              max_points: 5,
              weight: 1.0,
            },
          ],
          max_marks: 5,
          primary_trait: 'application',
          secondary_trait_weight: 0.0,
          difficulty: 'medium',
          hint_1: `Consider which data structure, algorithm, or theorem addresses this requirement.`,
          hint_2: `The correct technical mechanism is ${subject}.`,
          evaluation_method: 'deterministic',
          source_reference: sourceRef,
        });
        break;
      }

      case 'analysis': {
        const questionText = `Fill in the blank: In ${courseTitle}, the technical mechanism that ${fact?.relation || 'is characterized as'} "${detail}" is ________.`;

        packages.push({
          question_text: questionText,
          question_type: 'fill_in_blank',
          correct_answer: subject,
          accepted_variations: [subject, subject.toLowerCase(), subject.toUpperCase()],
          reference_answer: subject,
          explanation: `The technical lecture notes specify: "${fact?.raw || detail}"`,
          rubric: [
            {
              criteria_name: 'Structural Analysis',
              description: 'Identifies technical component from its operational specification',
              max_points: 5,
              weight: 1.0,
            },
          ],
          max_marks: 5,
          primary_trait: 'analysis',
          secondary_trait_weight: 0.0,
          difficulty: 'medium',
          hint_1: `The term has ${subject.split(' ').length} word(s).`,
          hint_2: `The term begins with the letter "${subject.charAt(0)}".`,
          evaluation_method: 'deterministic',
          source_reference: sourceRef,
        });
        break;
      }

      case 'creativity': {
        const questionText = `Which of the following characteristics accurately represent "${subject}" as established in the course material? (Select all that apply)`;
        const correct1 = detail.slice(0, 80);
        const correct2 = `Governed by the foundational axioms of ${courseTitle}`;
        const incorrect1 = `An obsolete methodology that violates algorithmic correctness`;
        const incorrect2 = `Requires unbounded polynomial memory overhead in the base case`;

        packages.push({
          question_text: questionText,
          question_type: 'multiple_select',
          options: [correct1, correct2, incorrect1, incorrect2],
          correct_answer: `${correct1}, ${correct2}`,
          accepted_variations: [`${correct1}, ${correct2}`, `${correct2}, ${correct1}`],
          reference_answer: `Both "${correct1}" and "${correct2}" are supported by the technical lecture notes.`,
          explanation: `Based directly on the uploaded material: "${fact?.raw || detail}"`,
          rubric: [
            {
              criteria_name: 'Synthesis and Discernment',
              description: 'Selects all valid technical characteristics',
              max_points: 5,
              weight: 1.0,
            },
          ],
          max_marks: 5,
          primary_trait: 'creativity',
          secondary_trait_weight: 0.0,
          difficulty: 'medium',
          hint_1: `Identify the two statements that are verified by your technical lecture notes.`,
          hint_2: `Options citing violations of correctness or unbounded memory are incorrect distractors.`,
          evaluation_method: 'deterministic',
          source_reference: sourceRef,
        });
        break;
      }

      case 'evaluation': {
        const questionText = `When evaluating system trade-offs in ${courseTitle}, what is the primary operational trade-off or constraint associated with "${subject}"?`;
        const correctEvaluation = `It provides ${detail.slice(0, 90)}, subject to its theoretical invariants.`;
        const distractor1 = `It guarantees zero computational overhead at the cost of infinite data corruption.`;
        const distractor2 = `It inverts the memory hierarchy and bypasses the CPU cache entirely.`;
        const distractor3 = `It is nondeterministic and cannot be formally analyzed.`;

        packages.push({
          question_text: questionText,
          question_type: 'mcq',
          options: [correctEvaluation, distractor1, distractor2, distractor3].sort(),
          correct_answer: correctEvaluation,
          accepted_variations: [correctEvaluation],
          reference_answer: correctEvaluation,
          explanation: `According to the lecture notes: "${fact?.raw || detail}"`,
          rubric: [
            {
              criteria_name: 'Critical Technical Evaluation',
              description: 'Accurately appraises trade-offs and operational bounds',
              max_points: 5,
              weight: 1.0,
            },
          ],
          max_marks: 5,
          primary_trait: 'evaluation',
          secondary_trait_weight: 0.0,
          difficulty: 'hard',
          hint_1: `Focus on the formal bounds and theoretical invariants described in the material.`,
          hint_2: `Notice that: "${detail.slice(0, 60)}..."`,
          evaluation_method: 'deterministic',
          source_reference: sourceRef,
        });
        break;
      }
    }
  }

  return packages;
}
