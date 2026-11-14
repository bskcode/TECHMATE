// ====================================================================
// ADAPTIVELEARN AI — Syllabus & Curriculum Extractor
// Ingests course syllabus documents and extracts structured modules,
// Course Outcomes (COs), and learning objectives.
// ====================================================================

import { z } from 'zod';
import { groqService } from './groq-provider';

export const ExtractedModuleSchema = z.object({
  title: z.string().min(2),
  order_index: z.number().int().default(1),
  description: z.string().default(''),
  learning_objectives: z.array(z.string()).default([]),
});

export const ExtractedCourseOutcomeSchema = z.object({
  code: z.string().min(1),
  description: z.string().min(5),
  bloom_level: z.string().optional().default('understanding'),
});

const RawExtractedSyllabusSchema = z.object({
  course_code: z.string().optional().default(''),
  course_title: z.string().optional().default(''),
  course_description: z.string().optional().default(''),
  modules: z.array(ExtractedModuleSchema).default([]),
  course_outcomes: z.array(ExtractedCourseOutcomeSchema).default([]),
  learning_objectives: z.array(z.string()).default([]),
});

export const ExtractedSyllabusSchema = z.preprocess((val: any) => {
  if (!val || typeof val !== 'object') return val;
  const copy = { ...val };

  // Map module aliases
  if (!Array.isArray(copy.modules)) {
    if (Array.isArray(copy.curriculum)) copy.modules = copy.curriculum;
    else if (Array.isArray(copy.units)) copy.modules = copy.units;
    else if (Array.isArray(copy.chapters)) copy.modules = copy.chapters;
    else copy.modules = [];
  }

  // Normalize modules
  copy.modules = copy.modules.map((m: any, idx: number) => {
    const rawTitle = m.title || m.name || m.module_title || `Module ${idx + 1}`;
    const orderIndex = Number(m.order_index || m.order || idx + 1) || idx + 1;
    const description = m.description || m.summary || m.topics || '';
    let objectives: string[] = [];
    if (Array.isArray(m.learning_objectives)) {
      objectives = m.learning_objectives.map(String);
    } else if (Array.isArray(m.objectives)) {
      objectives = m.objectives.map(String);
    }
    return {
      title: rawTitle,
      order_index: orderIndex,
      description,
      learning_objectives: objectives,
    };
  });

  // Map course outcome aliases
  if (!Array.isArray(copy.course_outcomes)) {
    if (Array.isArray(copy.outcomes)) copy.course_outcomes = copy.outcomes;
    else if (Array.isArray(copy.cos)) copy.course_outcomes = copy.cos;
    else copy.course_outcomes = [];
  }

  // Normalize course outcomes
  copy.course_outcomes = copy.course_outcomes.map((co: any, idx: number) => {
    const code = co.code || co.id || `CO${idx + 1}`;
    const description = co.description || co.outcome || co.text || `Master core principles for ${code}`;
    const bloom = co.bloom_level || co.bloom || co.trait || 'understanding';
    return {
      code,
      description,
      bloom_level: String(bloom).toLowerCase(),
    };
  });

  // Normalize learning objectives
  if (!Array.isArray(copy.learning_objectives)) {
    if (Array.isArray(copy.objectives)) copy.learning_objectives = copy.objectives;
    else copy.learning_objectives = [];
  }
  copy.learning_objectives = copy.learning_objectives.map(String);

  return copy;
}, RawExtractedSyllabusSchema);

export type ExtractedModule = z.infer<typeof ExtractedModuleSchema>;
export type ExtractedCourseOutcome = z.infer<typeof ExtractedCourseOutcomeSchema>;
export type ExtractedSyllabus = z.infer<typeof ExtractedSyllabusSchema>;

export interface ExtractSyllabusParams {
  syllabusText: string;
  courseCode?: string;
  courseTitle?: string;
}

const SYSTEM_PROMPT = `You are a distinguished university academic dean and curriculum architect for AdaptiveLearn AI.
Your duty is to analyze university course syllabi and extract cleanly structured curriculum components.

You must extract:
1. Curriculum Modules (e.g. "Module 1: ...", "Module 2: ...", "Unit 1: ...")
   - title (e.g. "Module 1: Computational Thinking & Algorithmic Abstraction")
   - order_index (1, 2, 3...)
   - description (clear, concise 1-2 sentence summary of topics and principles covered)
   - learning_objectives (array of 2-4 actionable, student-facing learning objectives for this module)
2. Course Outcomes (COs)
   - code (e.g. "CO1", "CO2", "CO3", "CO4", "CO5")
   - description (Bloom-aligned measurable outcome statement, e.g. "Analyze asymptotic complexity using Big-O notation.")
   - bloom_level ("remembering" | "understanding" | "application" | "analysis" | "evaluation" | "creativity")
3. Course Learning Objectives
   - High-level overall pedagogical objectives for the entire course.
4. Course Code and Title (if clearly stated in the syllabus).

Respond strictly with valid JSON conforming to the schema.`;

export async function extractSyllabus(params: ExtractSyllabusParams): Promise<ExtractedSyllabus> {
  const { syllabusText, courseCode, courseTitle } = params;

  const userPrompt = `${courseCode || courseTitle ? `Context: Course Code: ${courseCode || 'N/A'}, Course Title: ${courseTitle || 'N/A'}\n\n` : ''}SYLLABUS CONTENT:
"""
${syllabusText.slice(0, 35000)}
"""

Extract the structured curriculum. Format your JSON response exactly like this:
{
  "course_code": "e.g. CS101",
  "course_title": "e.g. Introduction to Computer Science & AI",
  "course_description": "Comprehensive course summary...",
  "modules": [
    {
      "order_index": 1,
      "title": "Module 1: ...",
      "description": "Topics covered...",
      "learning_objectives": ["Understand ...", "Apply ..."]
    }
  ],
  "course_outcomes": [
    {
      "code": "CO1",
      "description": "Analyze ...",
      "bloom_level": "analysis"
    }
  ],
  "learning_objectives": [
    "Overall course objective 1...",
    "Overall course objective 2..."
  ]
}`;

  if (groqService.isConfigured()) {
    try {
      const rawJson = await groqService.complete({
        systemPrompt: SYSTEM_PROMPT,
        userPrompt,
        temperature: 0.1,
      });

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
      const validated = ExtractedSyllabusSchema.parse(parsed);

      if (validated.modules.length > 0) {
        return validated;
      }
    } catch (err: any) {
      console.warn('Groq syllabus extraction failed, using deterministic fallback parser:', err.message);
    }
  }

  // Deterministic rule-based syllabus fallback parser
  return extractSyllabusFallback(syllabusText, courseCode, courseTitle);
}

/**
 * Deterministic rule-based extractor that scans headings, modules, units, COs,
 * and bullet points from syllabus text without requiring external API calls.
 */
export function extractSyllabusFallback(
  text: string,
  courseCode?: string,
  courseTitle?: string
): ExtractedSyllabus {
  const lines = text.split('\n').map((l) => l.trim()).filter(Boolean);

  const modules: ExtractedModule[] = [];
  const outcomes: ExtractedCourseOutcome[] = [];
  const overallObjectives: string[] = [];

  let currentModule: Partial<ExtractedModule> | null = null;
  let inOutcomesSection = false;
  let inObjectivesSection = false;

  const moduleHeaderRegex = /^(module|unit|chapter|part)\s*([0-9ivxlcdm]+)?\s*[:\-\.]?\s*(.*)$/i;
  const coRegex = /^(co\s*([0-9]+)|outcome\s*([0-9]+))\s*[:\-\.]?\s*(.*)$/i;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // Detect section headers
    if (/course\s+outcomes|learning\s+outcomes|competencies/i.test(line)) {
      inOutcomesSection = true;
      inObjectivesSection = false;
      continue;
    }
    if (/course\s+objectives|learning\s+objectives|pedagogical\s+goals/i.test(line) && !line.toLowerCase().includes('module')) {
      inObjectivesSection = true;
      inOutcomesSection = false;
      continue;
    }

    // Check for Course Outcome line
    const coMatch = line.match(coRegex);
    if (coMatch || (inOutcomesSection && /^[0-9]\./.test(line))) {
      const coNum = coMatch ? (coMatch[2] || coMatch[3] || `${outcomes.length + 1}`) : `${outcomes.length + 1}`;
      const desc = coMatch ? (coMatch[4] || line).trim() : line.replace(/^[0-9\.\-\*]\s*/, '').trim();
      if (desc.length > 8) {
        let bloom = 'understanding';
        const lowerDesc = desc.toLowerCase();
        if (lowerDesc.includes('analyze') || lowerDesc.includes('examine') || lowerDesc.includes('compare')) bloom = 'analysis';
        else if (lowerDesc.includes('apply') || lowerDesc.includes('implement') || lowerDesc.includes('compute')) bloom = 'application';
        else if (lowerDesc.includes('evaluate') || lowerDesc.includes('critique') || lowerDesc.includes('assess')) bloom = 'evaluation';
        else if (lowerDesc.includes('design') || lowerDesc.includes('formulate') || lowerDesc.includes('create')) bloom = 'creativity';
        else if (lowerDesc.includes('identify') || lowerDesc.includes('recall') || lowerDesc.includes('define')) bloom = 'remembering';

        outcomes.push({
          code: `CO${coNum}`,
          description: desc,
          bloom_level: bloom,
        });
      }
      continue;
    }

    // Check for Course Objective line
    if (inObjectivesSection && (line.startsWith('-') || line.startsWith('•') || /^[0-9]\./.test(line))) {
      const cleanObj = line.replace(/^[\-\*•0-9\.]+\s*/, '').trim();
      if (cleanObj.length > 10) {
        overallObjectives.push(cleanObj);
      }
      continue;
    }

    // Check for Module / Unit header
    const modMatch = line.match(moduleHeaderRegex);
    if (modMatch && (modMatch[2] || modMatch[3])) {
      if (currentModule && currentModule.title) {
        modules.push({
          title: currentModule.title,
          order_index: currentModule.order_index || modules.length + 1,
          description: (currentModule.description || '').trim() || `Core study of ${currentModule.title}`,
          learning_objectives: currentModule.learning_objectives || [],
        });
      }

      const modPrefix = modMatch[1].charAt(0).toUpperCase() + modMatch[1].slice(1).toLowerCase();
      const modNum = modMatch[2] ? modMatch[2].trim() : `${modules.length + 1}`;
      const modSub = modMatch[3] ? modMatch[3].trim() : `Topics for ${modPrefix} ${modNum}`;
      const title = `${modPrefix} ${modNum}: ${modSub}`;

      currentModule = {
        title,
        order_index: modules.length + 1,
        description: '',
        learning_objectives: [],
      };
      inOutcomesSection = false;
      inObjectivesSection = false;
      continue;
    }

    // Accumulate descriptions and objectives into current module
    if (currentModule) {
      if (line.startsWith('-') || line.startsWith('•') || line.toLowerCase().includes('objective:')) {
        const cleanItem = line.replace(/^[\-\*•]\s*/, '').replace(/^objective[s]?:\s*/i, '').trim();
        if (cleanItem.length > 5) {
          currentModule.learning_objectives = currentModule.learning_objectives || [];
          currentModule.learning_objectives.push(cleanItem);
        }
      } else if (!currentModule.description || currentModule.description.length < 250) {
        currentModule.description = currentModule.description ? `${currentModule.description} ${line}` : line;
      }
    }
  }

  // Push final module
  if (currentModule && currentModule.title) {
    modules.push({
      title: currentModule.title,
      order_index: currentModule.order_index || modules.length + 1,
      description: (currentModule.description || '').trim() || `Core concepts and applications for ${currentModule.title}`,
      learning_objectives: currentModule.learning_objectives || [],
    });
  }

  // If no modules were detected by keyword, split paragraphs into modules
  if (modules.length === 0) {
    const paragraphs = text
      .split(/\n\s*\n/)
      .map((p) => p.trim())
      .filter((p) => p.length > 40 && !p.toLowerCase().includes('syllabus'));

    const count = Math.min(5, Math.max(2, paragraphs.length));
    for (let i = 0; i < count; i++) {
      const p = paragraphs[i] || `Foundations and core principles of ${courseTitle || 'the course'}`;
      const firstLine = p.split('\n')[0].slice(0, 60).replace(/[.:]$/, '');
      modules.push({
        title: `Module ${i + 1}: ${firstLine}`,
        order_index: i + 1,
        description: p.slice(0, 200),
        learning_objectives: [
          `Comprehend essential theories and structures in ${firstLine}.`,
          `Apply foundational techniques to practical problem solving.`,
        ],
      });
    }
  }

  // If no outcomes detected, generate standard Bloom-aligned COs
  if (outcomes.length === 0) {
    const sampleCOs = [
      { code: 'CO1', verb: 'Recall and define', trait: 'remembering' },
      { code: 'CO2', verb: 'Explain and contrast', trait: 'understanding' },
      { code: 'CO3', verb: 'Apply computational methodologies to solve problems in', trait: 'application' },
      { code: 'CO4', verb: 'Analyze trade-offs, performance, and structural limits of', trait: 'analysis' },
      { code: 'CO5', verb: 'Formulate and evaluate innovative solutions within', trait: 'evaluation' },
    ];

    sampleCOs.forEach((item) => {
      outcomes.push({
        code: item.code,
        description: `${item.verb} fundamental concepts and advanced models in ${courseTitle || 'this discipline'}.`,
        bloom_level: item.trait,
      });
    });
  }

  // If no overall objectives, synthesize from modules
  if (overallObjectives.length === 0) {
    modules.forEach((m) => {
      overallObjectives.push(`Master concepts and problem-solving skills in ${m.title}`);
    });
  }

  return {
    course_code: courseCode || '',
    course_title: courseTitle || '',
    course_description: text.slice(0, 300).trim(),
    modules,
    course_outcomes: outcomes,
    learning_objectives: overallObjectives,
  };
}

