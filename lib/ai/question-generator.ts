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
  courseCode?: string;
  moduleTitle?: string;
  groundingText: string;
  questionCount: number;
  targetTraits?: BloomTrait[];
  difficulty?: 'easy' | 'medium' | 'hard';
}

/**
 * Strips subject codes (e.g. "CS101:", "CS-101 -", "19CS401 |", "CS101 ")
 * to obtain the clean technical subject name.
 */
export function cleanSubjectTitle(title: string): string {
  if (!title) return '';
  let cleaned = title.trim();
  // Strip code prefixes like "CS101: Introduction to AI" -> "Introduction to AI"
  cleaned = cleaned.replace(/^[A-Z]{2,6}\s*[-_]?\s*\d{2,5}[A-Z]?\s*[:\-–|]\s*/i, '');
  // Strip leading code if space separated and followed by text: "CS101 Computer Science" -> "Computer Science"
  cleaned = cleaned.replace(/^[A-Z]{2,6}\s*[-_]?\s*\d{2,5}[A-Z]?\s+(?=[A-Za-z])/i, '');
  // If the entire title was just a code like "CS101", return empty string
  if (/^[A-Z]{2,6}\s*[-_]?\s*\d{2,5}[A-Z]?$/i.test(cleaned.trim())) {
    return '';
  }
  return cleaned.trim();
}

/**
 * Strips administrative metadata lines (subject code, course code, instructor, term, credits, regulations),
 * syllabus outlines (course outcomes, learning objectives, program outcomes),
 * AND textbook / reference bibliography sections (textbooks, authors, publishers, editions, ISBNs)
 * so that questions are purely technical and grounded strictly in technical lecture notes.
 */
export function sanitizeTechnicalGroundingText(text: string): string {
  const lines = text.split('\n');
  let inReferenceSection = false;
  let inOutcomesOrObjectivesSection = false;

  const filtered = lines.filter((line) => {
    const trimmed = line.trim();
    if (!trimmed) return true;

    // Detect beginning of reference / textbook / bibliography sections
    if (
      /^(text\s*books?|prescribed\s*books?|reference\s*books?|references?|suggested\s*readings?|further\s*readings?|recommended\s*books?|bibliography)\b/i.test(
        trimmed
      )
    ) {
      inReferenceSection = true;
      return false;
    }

    // Detect beginning of Course Outcomes (COs) or Learning Objectives sections
    if (
      /^(course\s+outcomes?|program\s+outcomes?|program\s+specific\s+outcomes?|pos?|psos?|learning\s+objectives?|course\s+objectives?|instructional\s+objectives?|expected\s+outcomes?)\b/i.test(
        trimmed
      )
    ) {
      inOutcomesOrObjectivesSection = true;
      return false;
    }

    // If we are inside an outcomes/objectives section, check if a technical section has begun
    if (inOutcomesOrObjectivesSection) {
      if (
        /^(module\s+\d+|unit\s+\d+|chapter\s+\d+|lecture\s+\d+|section\s+\d+|part\s+\d+|topic\s*[:\-–]|course\s+content|syllabus\s+content)/i.test(
          trimmed
        )
      ) {
        inOutcomesOrObjectivesSection = false;
      } else {
        return false;
      }
    }

    // If we are inside a reference/textbook section, check if a new technical section has begun
    if (inReferenceSection) {
      // New technical section header: Module, Unit, Chapter, Topic, Lecture, Section, Part, etc.
      if (
        /^(module\s+\d+|unit\s+\d+|chapter\s+\d+|lecture\s+\d+|section\s+\d+|part\s+\d+|topic\s*[:\-–]|course\s+content|syllabus\s+content)/i.test(
          trimmed
        )
      ) {
        inReferenceSection = false;
      } else {
        // Still inside reference section: discard line
        return false;
      }
    }

    // Filter bibliographic citation lines anywhere in the text (e.g. "1. Stuart Russell, Peter Norvig, Pearson Education, 2020", "ISBN 978-0134610993")
    if (
      /\b(pearson(\s+education)?|mcgraw[\s-]*hill|wiley(\s+&\s+sons)?|springer(\s+nature)?|mit\s+press|prentice[\s-]*hall|cengage(\s+learning)?|addison[\s-]*wesley|o'reilly(\s+media)?|oxford\s+university\s+press|cambridge\s+university\s+press|elsevier|morgan\s+kaufmann|academic\s+press|crc\s+press|routledge|tata\s+mcgraw|narosa\s+publishing|packt(\s+publishing)?|bloomsbury)\b/i.test(
        trimmed
      ) ||
      /\b\d+(st|nd|rd|th)\s+(ed\.?|edition)\b/i.test(trimmed) ||
      /\bisbn[\s:-]*[0-9xX-]{10,17}\b/i.test(trimmed) ||
      /\b(published\s+by|publishing\s+house|publishers?|press|publications?)\b/i.test(trimmed)
    ) {
      return false;
    }

    // Filter standalone Course Outcome (CO1, CO2..) or Learning Objective lines
    if (
      /^(co\s*[1-9]|po\s*[1-9]|pso\s*[1-9]|lo\s*[1-9])\s*[:\-–.]/i.test(trimmed) ||
      /^(learning\s+objective\s*\d*|course\s+objective\s*\d*)\s*[:\-–.]/i.test(trimmed) ||
      /^students?\s+(will\s+be\s+able\s+to|should\s+be\s+able\s+to|learns?\s+to)\s*[:\-–]/i.test(trimmed)
    ) {
      return false;
    }

    // Filter administrative metadata labels with colon/hyphen:
    if (
      /^(course\s+(code|title|name|id|number|credits?)|subject\s+(code|name|title)|sub\.?\s*code|paper\s*code|code|catalog\s*(no|number|num)|course\s*(no|number|num)|instructor|professor|faculty|lecturer|teacher|ta|teaching\s+assistant|term|semester|academic\s+year|year\s*\/\s*semester|batch|regulation|credits?|credit\s+hours?|l\s*[-]?\s*t\s*[-]?\s*p\s*[-]?\s*c|hours(\s*\/\s*week)?|prerequisites?|pre-requisite|corequisites?|office\s+hours?|email|contact|phone|website|classroom|class\s+room|venue|department|dept|school|university|college|institution|branch|degree|programme|program|grading\s+policy|evaluation\s+(scheme|criteria)|marks\s+distribution|internal\s+marks|external\s+marks|total\s+marks|passing\s+(minimum|marks)|exam\s+duration|duration|attendance|exam\s+date|midterm\s+date|final\s+exam|text\s*books?|prescribed\s+books?|reference\s*books?|references?|suggested\s+readings?|course\s+outcomes?|program\s+outcomes?|pos?|cos?|learning\s+objectives?|course\s+objectives?)\s*[:\-–]/i.test(
        trimmed
      )
    ) {
      return false;
    }

    // Filter isolated subject codes or headers (e.g. "CS101", "CS8391", "19CS401")
    if (/^[A-Z]{2,6}\s*[-_]?\s*\d{2,5}[A-Z]?$/i.test(trimmed)) {
      return false;
    }

    // Filter syllabus header lines:
    if (/^(COURSE\s+SYLLABUS|SYLLABUS\s+FOR|COURSE\s+OUTLINE|CURRICULUM\s+STRUCTURE|DEPARTMENT\s+OF|FACULTY\s+OF)\s*[:\-–]?/i.test(trimmed)) {
      return false;
    }

    return true;
  });
  return filtered.join('\n');
}

/**
 * Checks if a question is asking about administrative metadata, subject codes,
 * syllabus structures (course outcomes, learning objectives),
 * or bibliographic / textbook / publisher / author metadata rather than technical subject matter.
 */
export function isAdministrativeQuestion(text: string, correctAnswer?: string): boolean {
  const lower = text.toLowerCase().trim();

  // 1. Check for administrative and course metadata inquiries
  if (
    /what\s+is\s+the\s+(course|subject|paper|sub)\s*(code|id|title|name|number)/i.test(lower) ||
    /which\s+(course|subject|paper)\s*(code|title|number|outcome)/i.test(lower) ||
    /\b(subject|course|paper|sub)\s*code\b/i.test(lower) ||
    /who\s+is\s+the\s+(instructor|professor|faculty|lecturer|teacher)/i.test(lower) ||
    /in\s+which\s+(term|semester|academic\s*year|regulation|batch)/i.test(lower) ||
    /what\s+is\s+the\s+(term|semester|academic\s*year|regulation|batch)/i.test(lower) ||
    /how\s+many\s+credits/i.test(lower) ||
    /\bcredit\s*hours?\b/i.test(lower) ||
    /what\s+is\s+(co[1-9]|course\s+outcome)/i.test(lower) ||
    /which\s+course\s+outcome/i.test(lower) ||
    /\bsyllabus\s*code\b/i.test(lower) ||
    /\bgrading\s+policy\b/i.test(lower) ||
    /\binternal\s+marks\b/i.test(lower) ||
    /\bpassing\s+(marks|minimum)\b/i.test(lower) ||
    /under\s+subject\s+code\b/i.test(lower) ||
    /course\s+code\s+for\s+this\s+subject/i.test(lower) ||
    /what\s+is\s+the\s+subject\s+name/i.test(lower) ||
    /subject\s+code\s+is\s+assigned/i.test(lower)
  ) {
    return true;
  }

  // 2. Check for Course Outcomes (COs) and Learning Objectives inquiries
  if (
    /\b(course\s+outcome|learning\s+objective|course\s+objective|program\s+outcome)\b/i.test(lower) ||
    /\b(what\s+is\s+co\d+|which\s+co\d+|state\s+co\d+|define\s+co\d+)\b/i.test(lower) ||
    /\b(co\s*[1-9]|po\s*[1-9]|pso\s*[1-9]|lo\s*[1-9])\s*states?\b/i.test(lower) ||
    /\b(objective\s+of\s+this\s+course|objective\s+of\s+the\s+course|learning\s+goals?)\b/i.test(lower) ||
    /students\s+will\s+be\s+able\s+to/i.test(lower)
  ) {
    return true;
  }

  // 3. Check for textbook, author of book, publisher, edition, publication year, ISBN inquiries
  if (
    /\b(publisher|publishers|publishing\s+house|published\s+by|who\s+published|which\s+publisher|which\s+publication)\b/i.test(lower) ||
    /\b(text\s*books?|reference\s*books?|prescribed\s*books?|prescribed\s+textbook|recommended\s+book)\b/i.test(lower) ||
    /\b(which\s+book|what\s+book|recommended\s+reading|suggested\s+reading)\b/i.test(lower) ||
    /\b(who\s+(wrote|authored|is\s+the\s+author\s+of)|author\s+of(\s+the)?\s+(book|textbook))\b/i.test(lower) ||
    /\b(which\s+edition|what\s+edition|edition\s+of\s+(the\s+)?(book|textbook)|\d+(st|nd|rd|th)\s+edition)\b/i.test(lower) ||
    /\b(publication\s+year|year\s+of\s+publication|published\s+in\s+\d{4})\b/i.test(lower) ||
    /\bisbn\b/i.test(lower)
  ) {
    return true;
  }

  // 4. If correct answer is a publisher, book edition, author, subject code, or administrative value
  if (correctAnswer) {
    const trimmedAns = correctAnswer.trim();
    if (/^[A-Z]{2,6}\s*[-_]?\s*\d{2,5}[A-Z]?$/i.test(trimmedAns)) return true;
    if (/^(fall|spring|summer)\s+\d{4}$/i.test(trimmedAns)) return true;
    if (/^\d+\s*credits?$/i.test(trimmedAns)) return true;
    if (/^CO\s*[1-9]$/i.test(trimmedAns)) return true;
    if (
      /\b(pearson|mcgraw[\s-]*hill|wiley|springer|mit\s+press|prentice[\s-]*hall|cengage|addison[\s-]*wesley|o'reilly|oxford|cambridge|elsevier|morgan\s+kaufmann|narosa|packt)\b/i.test(
        trimmedAns
      )
    ) {
      return true;
    }
    if (/\b\d+(st|nd|rd|th)\s+edition\b/i.test(trimmedAns)) return true;
    if (/\bisbn/i.test(trimmedAns)) return true;
  }

  return false;
}

/**
 * Post-processes question text, options, explanations, and hints to ensure
 * zero subject code mentions or awkward course code prefixes.
 */
export function sanitizeQuestionText(text: string, courseCode?: string): string {
  if (!text) return '';
  let cleaned = text.trim();

  // Strip prefixes like "In CS101: Introduction to AI, " or "In CS101, " or "In the course CS101, "
  cleaned = cleaned.replace(/^In\s+[A-Z]{2,6}\s*[-_]?\s*\d{2,5}[A-Z]?\s*[:\-–]\s*[A-Za-z\s&'-]+,\s*/i, '');
  cleaned = cleaned.replace(/^In\s+[A-Z]{2,6}\s*[-_]?\s*\d{2,5}[A-Z]?,\s*/i, '');
  cleaned = cleaned.replace(/^In\s+the\s+course\s+[A-Z]{2,6}\s*[-_]?\s*\d{2,5}[A-Z]?(?:\s*[:\-–]\s*[A-Za-z\s&'-]+)?,\s*/i, '');
  cleaned = cleaned.replace(/^According\s+to\s+(?:the\s+)?[A-Z]{2,6}\s*[-_]?\s*\d{2,5}[A-Z]?(?:\s+syllabus|\s+notes)?,\s*/i, '');
  cleaned = cleaned.replace(/^Under\s+subject\s+code\s+[A-Z]{2,6}\s*[-_]?\s*\d{2,5}[A-Z]?(?:,\s*)?/i, '');
  cleaned = cleaned.replace(/^Fill\s+in\s+the\s+blank:\s*In\s+[A-Z]{2,6}\s*[-_]?\s*\d{2,5}[A-Z]?(?:\s*[:\-–]\s*[A-Za-z\s&'-]+)?,\s*/i, 'Fill in the blank: ');
  cleaned = cleaned.replace(/^True\s+or\s+False:\s*In\s+[A-Z]{2,6}\s*[-_]?\s*\d{2,5}[A-Z]?(?:\s*[:\-–]\s*[A-Za-z\s&'-]+)?,\s*/i, 'True or False: ');
  cleaned = cleaned.replace(/^When\s+evaluating\s+system\s+trade-offs\s+in\s+[A-Z]{2,6}\s*[-_]?\s*\d{2,5}[A-Z]?(?:\s*[:\-–]\s*[A-Za-z\s&'-]+)?,\s*/i, 'When evaluating system trade-offs, ');
  cleaned = cleaned.replace(/^A\s+software\s+engineer\s+working\s+in\s+[A-Z]{2,6}\s*[-_]?\s*\d{2,5}[A-Z]?(?:\s*[:\-–]\s*[A-Za-z\s&'-]+)?\s+must\s+satisfy/i, 'A software engineer must satisfy');

  // Strip any inline course code if passed explicitly (e.g. "CS101")
  if (courseCode && courseCode.trim().length > 1) {
    const escapedCode = courseCode.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    cleaned = cleaned.replace(new RegExp(`^In\\s+${escapedCode},\\s*`, 'i'), '');
    cleaned = cleaned.replace(new RegExp(`\\b${escapedCode}\\b[:\\-–]?\\s*`, 'gi'), '');
  }

  // Also clean any leftover double spaces
  cleaned = cleaned.replace(/\s{2,}/g, ' ').trim();

  // Ensure capitalization after prefix phrases
  cleaned = cleaned.replace(
    /^(Fill\s+in\s+the\s+blank:\s*)([a-z])/i,
    (_, prefix, letter) => `${prefix}${letter.toUpperCase()}`
  );
  cleaned = cleaned.replace(
    /^(True\s+or\s+False:\s*)([a-z])/i,
    (_, prefix, letter) => `${prefix}${letter.toUpperCase()}`
  );

  // Ensure capitalization of the first letter
  if (cleaned.length > 0) {
    cleaned = cleaned.charAt(0).toUpperCase() + cleaned.slice(1);
  }

  return cleaned;
}

const SYSTEM_PROMPT = `You are a distinguished university professor and academic assessment architect for AdaptiveLearn AI.
Your absolute duty is to generate assessment question packages grounded STRICTLY in the provided uploaded course materials.

STRICT TECHNICAL SUBJECT-MATTER DIRECTIVES:
1. RIGOROUS TECHNICAL SUBJECT CONTENT ONLY: Every question must test academic, technical, subject-matter concepts (algorithms, mathematical logic, code execution, data structure invariants, operational mechanisms, formulas, computational complexity, architectural trade-offs, or formal definitions).
2. ABSOLUTE PROHIBITION ON ADMINISTRATIVE / SYLLABUS / SUBJECT CODE QUESTIONS:
   - NEVER ask questions about the course code, subject code, course title, course number, course name, instructor name, semester, term, academic year, credit hours, office hours, syllabus organization, or course outcome codes (e.g. NEVER ask "What is the course code?", "What is the subject code?", "What is the course title?", "Who is the instructor?").
   - NEVER include course codes or subject codes (such as CS101, DS301, CS8391, etc.) anywhere in question texts, options, explanations, or answers. Do NOT start questions with "In CS101," or "Under subject code...".
   - If the grounding text contains headers like course codes, subject codes, or instructors, IGNORE them completely. Only test the actual technical domain concepts.
3. ABSOLUTE PROHIBITION ON COURSE OUTCOMES (COs) & LEARNING OBJECTIVES QUESTIONS:
   - NEVER ask questions about Course Outcomes (e.g. "What is CO1?", "Which course outcome addresses X?", "What does CO2 state?").
   - NEVER ask questions about syllabus learning objectives or pedagogical goals (e.g. "What is the objective of this module?", "What will students be able to do according to the learning objectives?").
   - Course outcomes and learning objectives are curriculum meta-labels, NOT technical exam questions.
4. ABSOLUTE PROHIBITION ON TEXTBOOK / PUBLISHER / BIBLIOGRAPHIC / AUTHOR QUESTIONS:
   - NEVER ask questions about the publisher of the textbook/book, publishing houses (e.g., Pearson, McGraw-Hill, Wiley, Springer, MIT Press, Prentice Hall, Oxford, Cambridge, etc.), authors of books, textbook titles, textbook editions (e.g. "3rd edition"), publication years, ISBN numbers, or recommended reference books.
   - Questions asking "Who is the author of...", "Which publisher published...", "What edition is recommended...", or "Which book is prescribed..." are STRICTLY FORBIDDEN and completely invalid.
   - Only test the core engineering, scientific, and technical principles taught in the lecture notes.
5. EXCLUSIVE SOURCE MATERIAL: Every question, option, correct answer, hint, and explanation MUST be directly derived from technical content in the provided course material text.
6. ZERO EXTERNAL INVENTIONS: Under NO circumstances introduce outside facts not grounded in the material.
7. OBJECTIVE EVALUATION: ONLY generate deterministic questions: 'mcq', 'multiple_select', 'true_false', 'numeric', or 'fill_in_blank'.
8. BLOOM TAXONOMY MAPPING: Map each question to its primary cognitive dimension:
   - remembering: factual technical definition or property recall
   - understanding: conceptual comprehension of mechanisms or operational rules
   - application: problem solving, calculation, or code analysis
   - analysis: comparing structures, complexity bounds, or algorithmic trade-offs
   - creativity: formulating hypotheses, heuristic approaches, or synthesis
   - evaluation: appraising trade-offs, optimality, or design decisions
9. MANDATORY FIELDS PER QUESTION:
   - question_text (unambiguous, professional university-grade technical question without subject code prefixes)
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
   - hint_1 (HIGHLY TECHNICAL CONCEPTUAL HINT: Explain the governing theorem, invariant, data structure property, operational rule, or formula needed to approach this specific question. Must be actionable and technically sound. NEVER write meta-text like "Review your notes" or word-length clues.)
   - hint_2 (DEEP TECHNICAL APPLICATION CLUE: Provide the concrete analytical derivation, mathematical step, invariant comparison, or elimination logic that helps the student deduce the correct answer.)
   - evaluation_method ('deterministic')
   - source_reference (explicit citation of the uploaded material section)

Respond ONLY with valid JSON conforming to the requested schema.`;

export async function generateQuestionPackages(
  params: GenerateQuestionsParams
): Promise<QuestionPackageZod[]> {
  const {
    courseTitle,
    courseCode,
    moduleTitle,
    groundingText,
    questionCount = 5,
    targetTraits = ['remembering', 'understanding', 'application', 'analysis', 'creativity', 'evaluation'],
    difficulty = 'medium',
  } = params;

  // Sanitize grounding text to ensure zero administrative metadata or subject codes are ingested
  const sanitizedText = sanitizeTechnicalGroundingText(groundingText);
  const cleanTitle = cleanSubjectTitle(courseTitle) || courseTitle;

  const userPrompt = `Subject / Topic: ${cleanTitle}
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
2. ABSOLUTELY NO ADMINISTRATIVE QUESTIONS: Do NOT ask for course code, subject code, course title, instructor, term, credits, or syllabus organization.
3. ABSOLUTELY NO COURSE OUTCOMES (COs) OR LEARNING OBJECTIVES QUESTIONS: Do NOT ask questions about COs (e.g. "What does CO1 state?"), program outcomes, or syllabus learning objectives. Questions must test technical subject matter, NEVER syllabus metadata.
4. ABSOLUTELY NO TEXTBOOK / PUBLISHER / AUTHOR / EDITION QUESTIONS: Do NOT ask for the publisher of a book (e.g. Pearson, McGraw-Hill, etc.), author of a book, edition, ISBN, or textbook title. Questions must strictly test technical lecture concepts, algorithms, data structures, or code mechanics.
5. NEVER mention the course code or subject code (e.g. CS101, DS301, etc.) anywhere in question_text, options, correct_answer, explanation, or hints. Questions must be strictly technical academic questions.
6. All options, correct answers, explanations, and hints must be formulated EXCLUSIVELY and DIRECTLY from the technical lecture text above.
5. Output ONLY valid JSON with this exact structure:
{
  "assessment_title": "${cleanTitle} - ${moduleTitle || 'Assessment'}",
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
      "hint_1": "Technical concept/formula hint explaining the governing invariant or mechanism needed to solve this question",
      "hint_2": "Technical deductive clue showing the exact operational step or invariant property that unlocks the correct answer",
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

      // Filter out any administrative metadata question or subject code questions if Groq slipped one in
      const technicalQuestions = validated.questions
        .filter((q) => !isAdministrativeQuestion(q.question_text, q.correct_answer))
        .map((q) => ({
          ...q,
          question_text: sanitizeQuestionText(q.question_text, courseCode),
          hint_1: sanitizeQuestionText(q.hint_1, courseCode),
          hint_2: sanitizeQuestionText(q.hint_2, courseCode),
          explanation: sanitizeQuestionText(q.explanation, courseCode),
          options: q.options ? q.options.map((opt) => sanitizeQuestionText(opt, courseCode)) : undefined,
          correct_answer: sanitizeQuestionText(q.correct_answer, courseCode),
        }))
        .filter((q) => !isAdministrativeQuestion(q.question_text, q.correct_answer));

      if (technicalQuestions.length >= questionCount) {
        return technicalQuestions.slice(0, questionCount);
      }

      // If some were filtered out, supplement with deterministic grounded technical questions
      if (technicalQuestions.length > 0) {
        const needed = questionCount - technicalQuestions.length;
        const supplemental = generateGroundedFallbackPackages(
          cleanTitle,
          sanitizedText,
          targetTraits,
          needed,
          courseCode
        );
        return [...technicalQuestions, ...supplemental].slice(0, questionCount);
      }
    } catch (err: any) {
      console.warn('Groq question generation failed or invalid schema, falling back to grounded text generator:', err.message);
    }
  }

  // Grounded Deterministic Generator Fallback strictly using sanitized technical text
  return generateGroundedFallbackPackages(cleanTitle, sanitizedText, targetTraits, questionCount, courseCode);
}

interface ExtractedFact {
  subject: string;
  relation?: string;
  detail: string;
  raw: string;
}

const ADMINISTRATIVE_SUBJECT_REGEX =
  /^(course|course\s+code|course\s+title|course\s+name|course\s+id|course\s+number|subject|subject\s+code|subject\s+name|sub\s+code|sub\.?\s*code|paper\s+code|code|catalog\s+number|instructor|professor|faculty|lecturer|teacher|term|semester|academic\s*year|batch|regulation|degree|programme|program|branch|credits?|credit\s+hours?|l\s*t\s*p\s*c|hours|duration|prerequisites?|office\s*hours?|email|contact|department|dept|school|university|college|syllabus|grading|grade|evaluation\s+criteria|internal\s+marks|external\s+marks|total\s+marks|passing\s+marks|course\s+outcome|course\s+outcomes|co\d+|outcome\d*|learning\s+objective|learning\s+objectives|course\s+objective|course\s+objectives|module\s+\d+|unit\s+\d+|chapter\s+\d+|lecture\s+\d+|textbook|textbooks|text\s*books|reference\s*books?|references?|suggested\s+readings?|publisher|publishers|publishing|edition|editions|author|authors|isbn|pearson|mcgraw|wiley|springer|mit\s+press|prentice\s+hall|[A-Z]{2,6}\s*[-_]?\s*\d{2,5}[A-Z]?)$/i;

const BIBLIOGRAPHIC_LINE_REGEX =
  /\b(pearson|mcgraw|wiley|springer|mit\s+press|prentice[\s-]*hall|cengage|addison[\s-]*wesley|o'reilly|oxford|cambridge|elsevier|morgan\s+kaufmann|narosa|packt|isbn|\d+(st|nd|rd|th)\s+edition|published\s+by|publishing\s+house|learning\s+objectives?|course\s+outcomes?|students?\s+will\s+be\s+able\s+to)\b/i;

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
    if (BIBLIOGRAPHIC_LINE_REGEX.test(line)) continue;

    // 1. Definition via colon: "Term: Definition description"
    const colonMatch = line.match(/^(\d+[\.\)]\s*)?([A-Za-z0-9\s'-]+):\s*(.+)$/);
    if (colonMatch && colonMatch[2].length < 50 && colonMatch[3].length > 10) {
      const subject = colonMatch[2].trim();
      const detail = colonMatch[3].trim();

      // Skip administrative or publisher subjects or values
      if (ADMINISTRATIVE_SUBJECT_REGEX.test(subject)) continue;
      if (BIBLIOGRAPHIC_LINE_REGEX.test(subject) || BIBLIOGRAPHIC_LINE_REGEX.test(detail)) continue;
      if (/^[A-Z]{2,6}\s*[-_]?\s*\d{2,5}[A-Z]?$/i.test(subject)) continue;
      if (/^[A-Z]{2,6}\s*[-_]?\s*\d{2,5}[A-Z]?$/i.test(detail)) continue;
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
      if (BIBLIOGRAPHIC_LINE_REGEX.test(subject) || BIBLIOGRAPHIC_LINE_REGEX.test(detail)) continue;
      if (/^[A-Z]{2,6}\s*[-_]?\s*\d{2,5}[A-Z]?$/i.test(subject)) continue;
      if (/^[A-Z]{2,6}\s*[-_]?\s*\d{2,5}[A-Z]?$/i.test(detail)) continue;

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
      if (BIBLIOGRAPHIC_LINE_REGEX.test(line)) continue;

      const words = line.split(' ');
      const subject = words.slice(0, Math.min(4, words.length)).join(' ');
      if (!ADMINISTRATIVE_SUBJECT_REGEX.test(subject) && !BIBLIOGRAPHIC_LINE_REGEX.test(subject) && !/^[A-Z]{2,6}\s*[-_]?\s*\d{2,5}[A-Z]?$/i.test(subject)) {
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
  count: number = 6,
  courseCode?: string
): QuestionPackageZod[] {
  const packages: QuestionPackageZod[] = [];
  const sanitized = sanitizeTechnicalGroundingText(groundingText);
  const cleanTitle = cleanSubjectTitle(courseTitle) || 'Course Topic';
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

    const subject = fact?.subject || `Core Technical Principle ${i + 1}`;
    const detail =
      fact?.detail ||
      fallbackSentences[i % Math.max(1, fallbackSentences.length)] ||
      `Technical algorithmic foundations in ${cleanTitle}`;
    const sourceRef = `Course Lecture Notes: ${subject}`;

    switch (trait) {
      case 'remembering': {
        const questionText = fact?.relation
          ? `What ${fact.relation} "${subject}"?`
          : `Which statement accurately identifies the technical definition or property of "${subject}"?`;
        const correctAnswer = detail.endsWith('.') ? detail.slice(0, -1) : detail;
        const distractor1 = `It inverts the standard operation and operates without bounded termination.`;
        const distractor2 = `It strictly requires exponential stack frames regardless of input sizing.`;
        const distractor3 = `It applies exclusively to deprecated legacy protocols without runtime guarantees.`;

        packages.push({
          question_text: sanitizeQuestionText(questionText, courseCode),
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
          hint_1: `Analyze the governing theoretical definition of "${subject}": it formally establishes ${fact?.relation || 'the operation'} defined by: "${detail.slice(0, 80)}".`,
          hint_2: `Recall that "${subject}" maintains the exact technical invariant: "${detail.slice(0, 110)}". Compare this invariant directly against the given options.`,
          evaluation_method: 'deterministic',
          source_reference: sourceRef,
        });
        break;
      }

      case 'understanding': {
        const isTrue = i % 2 === 0;
        const statement = isTrue
          ? `"${subject}" ${fact?.relation || 'is defined as'}: "${detail}".`
          : `"${subject}" operates in reverse and contradicts: "${detail}".`;

        packages.push({
          question_text: sanitizeQuestionText(`True or False: ${statement}`, courseCode),
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
          hint_1: `Analyze the formal operational mechanism of "${subject}": evaluate whether it correctly ${fact?.relation || 'operates on'} "${detail.slice(0, 80)}".`,
          hint_2: `Compare the assertion against the foundational principle: the lecture specification states that "${detail.slice(0, 100)}". Check if the operational direction is preserved or contradicted.`,
          evaluation_method: 'deterministic',
          source_reference: sourceRef,
        });
        break;
      }

      case 'application': {
        const questionText = `A software engineer must satisfy the following technical requirement: "${detail}". Which core concept or mechanism should be applied?`;
        const otherSubjects = facts
          .filter((_, idx) => idx !== factIndex)
          .map((f) => f.subject)
          .filter((s) => s !== subject)
          .slice(0, 3);
        while (otherSubjects.length < 3) {
          otherSubjects.push(`Alternative Computational Strategy ${otherSubjects.length + 1}`);
        }

        packages.push({
          question_text: sanitizeQuestionText(questionText, courseCode),
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
          hint_1: `Analyze the technical requirement: "${detail.slice(0, 85)}". Determine which algorithmic structure or formal mechanism guarantees this exact invariant under nominal runtime conditions.`,
          hint_2: `The required technical mechanism is "${subject}", specifically engineered to handle this invariant by ensuring that "${detail.slice(0, 100)}".`,
          evaluation_method: 'deterministic',
          source_reference: sourceRef,
        });
        break;
      }

      case 'analysis': {
        const questionText = `Fill in the blank: The technical mechanism that ${fact?.relation || 'is characterized as'} "${detail}" is ________.`;

        packages.push({
          question_text: sanitizeQuestionText(questionText, courseCode),
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
          hint_1: `Examine the operational specification: "${detail.slice(0, 85)}". Identify the formal technical mechanism that exhibits this exact asymptotic or structural characteristic.`,
          hint_2: `The required technical component is "${subject}", which provides the operational behavior: "${detail.slice(0, 100)}".`,
          evaluation_method: 'deterministic',
          source_reference: sourceRef,
        });
        break;
      }

      case 'creativity': {
        const questionText = `Which of the following characteristics accurately represent "${subject}" as established in the course material? (Select all that apply)`;
        const correct1 = detail.slice(0, 80);
        const correct2 = `Satisfies the foundational theoretical properties of this mechanism`;
        const incorrect1 = `An obsolete methodology that violates algorithmic correctness`;
        const incorrect2 = `Requires unbounded polynomial memory overhead in the base case`;

        packages.push({
          question_text: sanitizeQuestionText(questionText, courseCode),
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
          hint_1: `Examine each statement against the theoretical properties of "${subject}". Identify the properties that are mathematically and computationally sound according to the technical lecture notes.`,
          hint_2: `Valid properties must satisfy: "${detail.slice(0, 85)}" while upholding formal algorithmic correctness without assuming unbounded memory or deprecated logic.`,
          evaluation_method: 'deterministic',
          source_reference: sourceRef,
        });
        break;
      }

      case 'evaluation': {
        const questionText = `When evaluating system trade-offs and performance bounds, what is the primary operational constraint or trade-off associated with "${subject}"?`;
        const correctEvaluation = `It provides ${detail.slice(0, 90)}, subject to its theoretical invariants.`;
        const distractor1 = `It guarantees zero computational overhead at the cost of infinite data corruption.`;
        const distractor2 = `It inverts the memory hierarchy and bypasses the CPU cache entirely.`;
        const distractor3 = `It is nondeterministic and cannot be formally analyzed.`;

        packages.push({
          question_text: sanitizeQuestionText(questionText, courseCode),
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
          hint_1: `Analyze the operational trade-offs and performance bounds of "${subject}": evaluate how its asymptotic bounds and theoretical invariants constrain system latency and throughput.`,
          hint_2: `The governing constraint stems directly from its operational mechanism: "${detail.slice(0, 95)}". Focus on the trade-off between correctness guarantees and memory overhead.`,
          evaluation_method: 'deterministic',
          source_reference: sourceRef,
        });
        break;
      }
    }
  }

  return packages;
}
