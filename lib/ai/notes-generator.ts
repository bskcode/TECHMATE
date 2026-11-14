// ====================================================================
// ADAPTIVELEARN AI — Module Notes Generator
// Generates comprehensive, module-wise study notes for students
// grounded strictly in uploaded course materials.
// ====================================================================

import { groqService } from './groq-provider';

export interface GenerateModuleNotesParams {
  courseTitle: string;
  moduleTitle: string;
  moduleOrder: number;
  moduleDescription?: string;
  learningObjectives?: string[];
  groundingText: string;
}

const SYSTEM_PROMPT = `You are a distinguished university professor, master educator, and textbook author for AdaptiveLearn AI.
Your duty is to author clear, highly structured, in-depth academic study notes in Markdown format for students.

GROUNDING DIRECTIVE:
You must strictly base all facts, definitions, formulas, algorithms, and explanations on the provided uploaded course materials. Do not invent outside facts.

PEDAGOGICAL FORMAT REQUIREMENTS:
Write the module notes in beautiful, comprehensive GitHub Flavored Markdown:
1. Title: # [Module Title]
2. ## 1. Module Overview & Key Objectives
   - High-level conceptual summary of the module's scope
   - Bulleted list of what students will master
3. ## 2. Foundational Principles & Core Concepts
   - In-depth, crystal-clear conceptual explanations grounded in the text
   - Use bold terms for key academic vocabulary
   - Use LaTeX formulas ($...$ for inline, $$...$$ for display) where applicable
4. ## 3. Detailed Technical Breakdown & Applications
   - Concrete mechanisms, architectural properties, step-by-step algorithms, or comparative tables
5. ## 4. Essential Terminology & Definitions
   - Glossary of critical terms defined in the text
6. ## 5. Quick Revision & Key Takeaways
   - 4 to 6 high-yield summary bullets for rapid exam preparation

Output clean Markdown directly (do NOT wrap the whole response in a \`\`\`markdown code block).`;

export async function generateModuleNotes(
  params: GenerateModuleNotesParams
): Promise<string> {
  const {
    courseTitle,
    moduleTitle,
    moduleOrder,
    moduleDescription = '',
    learningObjectives = [],
    groundingText,
  } = params;

  const userPrompt = `Course: ${courseTitle}
Module Number: ${moduleOrder}
Module Title: ${moduleTitle}
${moduleDescription ? `Module Scope / Topics: ${moduleDescription}` : ''}
${learningObjectives.length > 0 ? `Target Learning Objectives:\n${learningObjectives.map((o) => `- ${o}`).join('\n')}` : ''}

APPROVED UPLOADED COURSE MATERIALS:
"""
${groundingText.slice(0, 35000)}
"""

Author the complete, student-ready module study notes now.`;

  if (groqService.isConfigured()) {
    try {
      const rawText = await groqService.complete({
        systemPrompt: SYSTEM_PROMPT,
        userPrompt,
        temperature: 0.2,
        jsonMode: false,
      });

      let cleaned = rawText.trim();
      // Remove wrapping markdown code fences if LLM wrapped everything in ```markdown ... ```
      if (cleaned.startsWith('```markdown')) {
        cleaned = cleaned.replace(/^```markdown\s*/i, '').replace(/\s*```$/i, '').trim();
      } else if (cleaned.startsWith('```')) {
        cleaned = cleaned.replace(/^```(?:[a-z]+)?\s*/i, '').replace(/\s*```$/i, '').trim();
      }

      if (cleaned.length > 200) {
        return cleaned;
      }
    } catch (err: any) {
      console.warn(`Groq module notes generation for ${moduleTitle} failed, using grounded fallback generator:`, err.message);
    }
  }

  // Deterministic Grounded Fallback Synthesizer
  return generateGroundedNotesFallback(params);
}

/**
 * Deterministic generator that parses definitions, sections, and facts from the
 * uploaded material to construct clean, rich Markdown study notes.
 */
export function generateGroundedNotesFallback(
  params: GenerateModuleNotesParams
): string {
  const {
    courseTitle,
    moduleTitle,
    moduleOrder,
    moduleDescription,
    learningObjectives = [],
    groundingText,
  } = params;

  const lines = groundingText
    .split('\n')
    .map((l) => l.trim())
    .filter((l) => l.length > 15 && !l.startsWith('==='));

  // Extract relevant facts & definitions
  const definitions: { term: string; desc: string }[] = [];
  const keyPoints: string[] = [];

  for (const line of lines) {
    const colonMatch = line.match(/^(\d+[\.\)]\s*)?([A-Za-z0-9\s'-]{3,40}):\s*(.+)$/);
    if (colonMatch && colonMatch[3].length > 10) {
      definitions.push({
        term: colonMatch[2].trim(),
        desc: colonMatch[3].trim(),
      });
      continue;
    }

    const copulaMatch = line.match(/^([A-Za-z0-9\s'()-]{3,40})\s+(is|are|refers to|consists of|provides|handles)\s+(.+)$/i);
    if (copulaMatch && copulaMatch[3].length > 10) {
      definitions.push({
        term: copulaMatch[1].trim(),
        desc: `${copulaMatch[2]} ${copulaMatch[3].trim()}`,
      });
      continue;
    }

    if (line.endsWith('.') && line.length > 30) {
      keyPoints.push(line);
    }
  }

  const cleanTitle = moduleTitle.replace(/^(module|unit)\s*[0-9]+[:\-\.]?\s*/i, '').trim();

  let md = `# Module ${moduleOrder}: ${cleanTitle || moduleTitle}\n\n`;

  // Section 1
  md += `## 1. Module Overview & Learning Objectives\n\n`;
  md += `This module focuses on **${cleanTitle || moduleTitle}** as part of **${courseTitle}**.\n`;
  if (moduleDescription) {
    md += `\n> **Core Scope**: ${moduleDescription}\n\n`;
  }

  if (learningObjectives.length > 0) {
    md += `### Target Learning Outcomes\n`;
    for (const obj of learningObjectives) {
      md += `- ${obj}\n`;
    }
    md += `\n`;
  } else {
    md += `### Target Learning Outcomes\n`;
    md += `- Understand the theoretical principles and architecture of **${cleanTitle || moduleTitle}**.\n`;
    md += `- Apply concepts to solve practical challenges and analysis problems.\n`;
    md += `- Evaluate trade-offs and performance characteristics discussed in the course materials.\n\n`;
  }

  // Section 2
  md += `## 2. Foundational Principles & Core Concepts\n\n`;
  if (definitions.length > 0) {
    const mainDefs = definitions.slice(0, Math.min(4, definitions.length));
    for (const def of mainDefs) {
      md += `### ${def.term}\n`;
      md += `${def.desc}\n\n`;
    }
  } else {
    md += `In this module, students study the foundational mechanisms and structural relationships established in ${courseTitle}.\n\n`;
  }

  if (keyPoints.length > 0) {
    const selectedPoints = keyPoints.slice(0, Math.min(5, keyPoints.length));
    md += `### Key Factual Observations from Course Notes\n`;
    for (const pt of selectedPoints) {
      md += `- ${pt}\n`;
    }
    md += `\n`;
  }

  // Section 3
  md += `## 3. Technical Breakdown & Detailed Walkthrough\n\n`;
  md += `Careful examination of the course material indicates that mastering **${cleanTitle || moduleTitle}** requires understanding the relationship between the underlying principles and their operational constraints.\n\n`;
  if (definitions.length > 4) {
    const remaining = definitions.slice(4, 8);
    for (const item of remaining) {
      md += `- **${item.term}**: ${item.desc}\n`;
    }
    md += `\n`;
  }

  // Section 4
  md += `## 4. Key Terminology & Definitions\n\n`;
  if (definitions.length > 0) {
    md += `| Technical Term | Definition / Role in ${courseTitle} |\n`;
    md += `| :--- | :--- |\n`;
    for (const item of definitions.slice(0, 6)) {
      const cleanDesc = item.desc.replace(/\|/g, '-');
      md += `| **${item.term}** | ${cleanDesc} |\n`;
    }
    md += `\n`;
  } else {
    md += `- **${cleanTitle || 'Core Concept'}**: Foundational subject matter derived from course lecture notes.\n\n`;
  }

  // Section 5
  md += `## 5. Quick Revision & Key Takeaways\n\n`;
  md += `- **Core Subject**: ${cleanTitle || moduleTitle} represents a pivotal building block in ${courseTitle}.\n`;
  if (definitions[0]) {
    md += `- **Primary Definition**: ${definitions[0].term} — ${definitions[0].desc.slice(0, 100)}.\n`;
  }
  md += `- **Assessment Preparedness**: Review key definitions, formulas, and structural properties above before attempting diagnostic and progressive assessments.\n`;

  return md;
}

