// ====================================================================
// ADAPTIVELEARN AI — Question Package Generator
// Authoring-time generation of complete question packages strictly
// grounded in uploaded course notes and lecture materials.
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

const SYSTEM_PROMPT = `You are a distinguished university professor and academic assessment architect for AdaptiveLearn AI.
Your absolute duty is to generate assessment question packages grounded STRICTLY and EXCLUSIVELY in the provided uploaded course materials.

STRICT GROUNDING DIRECTIVES:
1. EXCLUSIVE SOURCE MATERIAL: Every single question, multiple choice option, correct answer, hint, and explanation MUST be directly derived from the text provided in the "Approved Grounding Course Materials" section below.
2. ZERO EXTERNAL INVENTIONS: Under NO circumstances should you introduce facts, theories, definitions, questions, or outside concepts not explicitly mentioned or defined in the provided uploaded text. If the text does not discuss a concept, DO NOT test it.
3. CITATION: Every question package MUST cite the specific document title, section, or excerpt from which it was extracted in the "source_reference" field (e.g. "Document: Lecture_Notes.pdf, Section 2").
4. OBJECTIVE EVALUATION: ONLY generate deterministic, auto-evaluable questions: 'mcq', 'multiple_select', 'true_false', 'numeric', or 'fill_in_blank'. DO NOT generate open-ended essay questions.
5. BLOOM TAXONOMY MAPPING: Map each question to its primary cognitive dimension:
   - remembering: factual recall from the text
   - understanding: comprehension of principles stated in the text
   - application: problem solving or calculations based on principles in the text
   - analysis: comparing structures, properties, or relationships outlined in the text
   - creativity: formulating hypotheses or heuristic approaches grounded in the text
   - evaluation: appraising trade-offs or decisions presented in the text
6. MANDATORY FIELDS PER QUESTION:
   - question_text (clear, unambiguous question grounded strictly in the uploaded text)
   - question_type ('mcq' | 'multiple_select' | 'true_false' | 'numeric' | 'fill_in_blank')
   - options (array of 4 distinct choices for mcq / multiple_select; ['True', 'False'] for true_false)
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

  const userPrompt = `Course: ${courseTitle}
${moduleTitle ? `Assessment / Module: ${moduleTitle}` : ''}
Target Bloom Traits: ${targetTraits.join(', ')}
Difficulty: ${difficulty}

EXACT NUMBER OF QUESTIONS REQUIRED: ${questionCount}
(MANDATORY: You MUST return an array containing EXACTLY ${questionCount} complete question objects. Count them before returning — there must be exactly ${questionCount} questions.)

APPROVED UPLOADED LECTURE MATERIAL (ALL QUESTIONS MUST BE DERIVED STRICTLY FROM THIS TEXT ONLY):
"""
${groundingText.slice(0, 35000)}
"""

CRITICAL GROUNDING DIRECTIVES:
1. Every single question, answer option, correct answer, explanation, hint, and rubric criteria MUST be formulated EXCLUSIVELY and DIRECTLY from the uploaded lecture text above.
2. Under NO circumstances should you introduce facts, terms, or topics that are absent from this text.
3. The questions array MUST have a length of EXACTLY ${questionCount}.
4. Output ONLY valid JSON with this exact structure:
{
  "assessment_title": "${courseTitle} - ${moduleTitle || 'Assessment'}",
  "assessment_description": "Objective assessment grounded strictly in course materials.",
  "questions": [
    {
      "question_text": "...",
      "question_type": "mcq",
      "options": ["Option 1", "Option 2", "Option 3", "Option 4"],
      "correct_answer": "Option 1",
      "accepted_variations": ["Option 1"],
      "reference_answer": "Model answer from lecture text",
      "explanation": "Why this is correct based strictly on the text",
      "rubric": [{ "criteria_name": "Accuracy", "description": "Grounded per lecture notes", "max_points": 5, "weight": 1.0 }],
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
      const questions = validated.questions.map((q) => ({
        ...q,
        reference_answer: q.reference_answer || q.correct_answer,
      }));

      // Strictly return exactly questionCount as requested by user
      if (questions.length === questionCount) {
        return questions;
      }

      if (questions.length > questionCount) {
        return questions.slice(0, questionCount);
      }

      // If Groq returned fewer than questionCount, dynamically generate remaining grounded questions from text
      const remainingNeeded = questionCount - questions.length;
      const fallback = generateGroundedFallbackPackages(courseTitle, groundingText, targetTraits, remainingNeeded);
      return [...questions, ...fallback].slice(0, questionCount);
    } catch (err: any) {
      console.warn('Groq question generation failed or invalid schema, falling back to grounded text generator:', err.message);
    }
  }

  // Grounded Deterministic Generator Fallback strictly using provided text
  return generateGroundedFallbackPackages(courseTitle, groundingText, targetTraits, questionCount);
}

interface ExtractedFact {
  subject: string;
  relation?: string;
  detail: string;
  raw: string;
}

/**
 * Parses factual definitions, enumerations, and statements directly from the uploaded text.
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
      facts.push({
        subject: colonMatch[2].trim(),
        detail: colonMatch[3].trim(),
        raw: line,
      });
      continue;
    }

    // 2. Definition via copula: "Term is / are / refers to / consists of ..."
    const copulaMatch = line.match(/^([A-Za-z0-9\s'()-]{3,45})\s+(is|are|refers to|consists of|provides|handles|operates on)\s+(.+)$/i);
    if (copulaMatch && copulaMatch[3].length > 10) {
      facts.push({
        subject: copulaMatch[1].trim(),
        relation: copulaMatch[2].toLowerCase(),
        detail: copulaMatch[3].trim(),
        raw: line,
      });
      continue;
    }

    // 3. Complete sentences
    if (line.endsWith('.') && line.length > 25) {
      const words = line.split(' ');
      const subject = words.slice(0, Math.min(4, words.length)).join(' ');
      facts.push({
        subject,
        detail: line,
        raw: line,
      });
    }
  }

  return facts;
}

/**
 * High-quality grounded fallback generator that parses concepts from the provided
 * course text and maps them dynamically to Bloom's 6 cognitive dimensions.
 * Strictly derives questions from the provided groundingText.
 */
export function generateGroundedFallbackPackages(
  courseTitle: string,
  groundingText: string,
  targetTraits: BloomTrait[] = ['remembering', 'understanding', 'application', 'analysis', 'creativity', 'evaluation'],
  count: number = 6
): QuestionPackageZod[] {
  const packages: QuestionPackageZod[] = [];
  const facts = extractFactsFromText(groundingText);

  // If no structured facts extracted, create sentences from plain paragraphs
  const fallbackSentences = groundingText
    .split(/[.\n]/)
    .map((s) => s.trim())
    .filter((s) => s.length > 20);

  const traits = targetTraits.length > 0 ? targetTraits : ['remembering', 'understanding', 'application', 'analysis', 'creativity', 'evaluation'];

  for (let i = 0; i < count; i++) {
    const trait = traits[i % traits.length] as BloomTrait;
    const factIndex = facts.length > 0 ? i % facts.length : 0;
    const fact = facts[factIndex];

    const subject = fact?.subject || `Core Topic ${i + 1}`;
    const detail = fact?.detail || fallbackSentences[i % Math.max(1, fallbackSentences.length)] || `Concepts of ${courseTitle}`;
    const sourceRef = `Course Notes: ${subject}`;

    switch (trait) {
      case 'remembering': {
        const questionText = fact?.relation
          ? `According to the course material, what ${fact.relation} ${subject}?`
          : `In the study of ${courseTitle}, which statement accurately identifies the definition or role of "${subject}"?`;
        const correctAnswer = detail.endsWith('.') ? detail.slice(0, -1) : detail;
        const distractor1 = `It is completely unrelated to ${subject} and does not apply.`;
        const distractor2 = `It inverts the standard operation and operates without bounds.`;
        const distractor3 = `It applies exclusively to unverified legacy protocols.`;

        packages.push({
          question_text: questionText,
          question_type: 'mcq',
          options: [correctAnswer, distractor1, distractor2, distractor3].sort(),
          correct_answer: correctAnswer,
          accepted_variations: [correctAnswer],
          reference_answer: `${subject} ${fact?.relation || 'is'}: ${detail}`,
          explanation: `Directly stated in the uploaded lecture material: "${fact?.raw || detail}"`,
          rubric: [{ criteria_name: 'Factual Recall', description: 'Accurately identifies concept from material', max_points: 5, weight: 1.0 }],
          max_marks: 5,
          primary_trait: 'remembering',
          secondary_trait_weight: 0.0,
          difficulty: 'easy',
          hint_1: `Review the section covering ${subject} in your lecture notes.`,
          hint_2: `The notes state: "${detail.slice(0, 80)}..."`,
          evaluation_method: 'deterministic',
          source_reference: sourceRef,
        });
        break;
      }

      case 'understanding': {
        const isTrue = i % 2 === 0;
        const statement = isTrue
          ? `According to the uploaded material: "${subject} ${fact?.relation || 'is defined as'} ${detail}".`
          : `According to the uploaded material, ${subject} operates in reverse and contradicts: "${detail}".`;

        packages.push({
          question_text: `True or False: ${statement}`,
          question_type: 'true_false',
          options: ['True', 'False'],
          correct_answer: isTrue ? 'True' : 'False',
          accepted_variations: [isTrue ? 'True' : 'False', isTrue ? 'true' : 'false', isTrue ? 'T' : 'F'],
          reference_answer: isTrue ? 'True.' : 'False. The statement mischaracterizes the text.',
          explanation: `The uploaded course notes state: "${fact?.raw || detail}"`,
          rubric: [{ criteria_name: 'Conceptual Understanding', description: 'Correctly verifies factual validity', max_points: 5, weight: 1.0 }],
          max_marks: 5,
          primary_trait: 'understanding',
          secondary_trait_weight: 0.0,
          difficulty: 'easy',
          hint_1: `Read the definition of ${subject} carefully.`,
          hint_2: `Compare the assertion directly with the lecture excerpt: "${detail.slice(0, 60)}"`,
          evaluation_method: 'deterministic',
          source_reference: sourceRef,
        });
        break;
      }

      case 'application': {
        const questionText = `A practitioner working in ${courseTitle} needs to address the following requirement: "${detail}". Which concept from the course notes should be applied?`;
        const otherSubjects = facts
          .filter((_, idx) => idx !== factIndex)
          .map((f) => f.subject)
          .slice(0, 3);
        while (otherSubjects.length < 3) {
          otherSubjects.push(`Alternative Strategy ${otherSubjects.length + 1}`);
        }

        packages.push({
          question_text: questionText,
          question_type: 'mcq',
          options: [subject, ...otherSubjects].sort(),
          correct_answer: subject,
          accepted_variations: [subject],
          reference_answer: subject,
          explanation: `According to the text, ${subject} addresses this directly: "${fact?.raw || detail}"`,
          rubric: [{ criteria_name: 'Application of Principle', description: 'Correctly maps requirement to concept', max_points: 5, weight: 1.0 }],
          max_marks: 5,
          primary_trait: 'application',
          secondary_trait_weight: 0.0,
          difficulty: 'medium',
          hint_1: `Consider which topic in the syllabus was introduced specifically for this function.`,
          hint_2: `The term you are looking for is ${subject}.`,
          evaluation_method: 'deterministic',
          source_reference: sourceRef,
        });
        break;
      }

      case 'analysis': {
        const questionText = `Fill in the blank: In the context of ${courseTitle}, ________ ${fact?.relation || 'is described as'}: ${detail}.`;

        packages.push({
          question_text: questionText,
          question_type: 'fill_in_blank',
          correct_answer: subject,
          accepted_variations: [subject, subject.toLowerCase(), subject.toUpperCase()],
          reference_answer: subject,
          explanation: `The course text provides: "${fact?.raw || detail}"`,
          rubric: [{ criteria_name: 'Structural Analysis', description: 'Identifies technical component from functionality', max_points: 5, weight: 1.0 }],
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
        const correct2 = `Directly discussed in ${courseTitle}`;
        const incorrect1 = `An obsolete method strictly prohibited by the course syllabus`;
        const incorrect2 = `Requires infinite resources and cannot terminate`;

        packages.push({
          question_text: questionText,
          question_type: 'multiple_select',
          options: [correct1, correct2, incorrect1, incorrect2],
          correct_answer: `${correct1}, ${correct2}`,
          accepted_variations: [`${correct1}, ${correct2}`, `${correct2}, ${correct1}`],
          reference_answer: `Both "${correct1}" and "${correct2}" are supported by the lecture notes.`,
          explanation: `Based directly on the uploaded material: "${fact?.raw || detail}"`,
          rubric: [{ criteria_name: 'Synthesis and Discernment', description: 'Selects all valid characteristics', max_points: 5, weight: 1.0 }],
          max_marks: 5,
          primary_trait: 'creativity',
          secondary_trait_weight: 0.0,
          difficulty: 'medium',
          hint_1: `Identify the two statements that are affirmed by your course material.`,
          hint_2: `Statements mentioning prohibition or infinite resources are inaccurate distractors.`,
          evaluation_method: 'deterministic',
          source_reference: sourceRef,
        });
        break;
      }

      case 'evaluation':
      default: {
        const questionText = `When evaluating architectural and theoretical trade-offs in ${courseTitle}, what makes "${subject}" significant according to the uploaded notes?`;
        const correctOpt = `It provides: ${detail}`;
        const dist1 = `It has no practical utility in modern implementations`;
        const dist2 = `It was replaced by unverified heuristic estimates`;
        const dist3 = `It causes indeterminate side-effects in all environments`;

        packages.push({
          question_text: questionText,
          question_type: 'mcq',
          options: [correctOpt, dist1, dist2, dist3].sort(),
          correct_answer: correctOpt,
          accepted_variations: [correctOpt],
          reference_answer: correctOpt,
          explanation: `The uploaded course notes specify: "${fact?.raw || detail}"`,
          rubric: [{ criteria_name: 'Architectural Evaluation', description: 'Justifies significance per lecture text', max_points: 5, weight: 1.0 }],
          max_marks: 5,
          primary_trait: 'evaluation',
          secondary_trait_weight: 0.0,
          difficulty: 'hard',
          hint_1: `Evaluate the functional utility described in your notes.`,
          hint_2: `The significance is directly tied to: "${detail.slice(0, 60)}"`,
          evaluation_method: 'deterministic',
          source_reference: sourceRef,
        });
        break;
      }
    }
  }

  return packages.slice(0, count);
}
