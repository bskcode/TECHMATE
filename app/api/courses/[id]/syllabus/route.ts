import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { extractTextFromBuffer } from '@/lib/documents/parser';
import { extractSyllabus } from '@/lib/ai/syllabus-extractor';
import { generateModuleNotes } from '@/lib/ai/notes-generator';

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const course = db.getCourse(params.id);
    if (!course) {
      return NextResponse.json({ success: false, error: 'Course not found' }, { status: 404 });
    }

    let syllabusText = '';
    let filename = 'Course_Syllabus.txt';
    let applyImmediately = true;
    let replaceExisting = true;
    let fileBuffer: Buffer | null = null;
    let fileType: 'pdf' | 'docx' | 'pptx' | 'txt' | 'md' = 'txt';

    const contentType = req.headers.get('content-type') || '';

    if (contentType.includes('multipart/form-data')) {
      const formData = await req.formData();
      const file = formData.get('file') as File | null;
      const textContent = formData.get('textContent') as string | null;
      filename = (formData.get('filename') as string) || (file ? file.name : filename);
      if (formData.has('applyImmediately')) {
        applyImmediately = formData.get('applyImmediately') !== 'false';
      }
      if (formData.has('replaceExisting')) {
        replaceExisting = formData.get('replaceExisting') !== 'false';
      }

      const lowerName = filename.toLowerCase();
      if (lowerName.endsWith('.pdf')) fileType = 'pdf';
      else if (lowerName.endsWith('.docx')) fileType = 'docx';
      else if (lowerName.endsWith('.pptx')) fileType = 'pptx';
      else if (lowerName.endsWith('.md')) fileType = 'md';

      if (file) {
        const arrayBuffer = await file.arrayBuffer();
        fileBuffer = Buffer.from(arrayBuffer);
        const parseType = fileType === 'md' ? 'txt' : fileType;
        const extraction = await extractTextFromBuffer(fileBuffer, parseType);
        if (!extraction.success) {
          return NextResponse.json({ success: false, error: extraction.error }, { status: 400 });
        }
        syllabusText = extraction.text;
      } else if (textContent) {
        syllabusText = textContent.trim();
      }
    } else {
      const body = await req.json().catch(() => ({}));
      syllabusText = body.syllabusText || body.textContent || '';
      if (body.applyImmediately !== undefined) applyImmediately = !!body.applyImmediately;
      if (body.replaceExisting !== undefined) replaceExisting = !!body.replaceExisting;
      if (body.filename) filename = body.filename;
    }

    if (!syllabusText || syllabusText.trim().length === 0) {
      return NextResponse.json(
        { success: false, error: 'No syllabus text or file content provided.' },
        { status: 400 }
      );
    }

    // 1. Store uploaded syllabus into course learning materials for grounding
    db.addMaterial({
      course_id: course.id,
      uploader_id: course.instructor_id,
      filename,
      storage_path: `materials/${course.id}/${filename}`,
      file_type: fileType,
      file_size_bytes: fileBuffer ? fileBuffer.length : Buffer.byteLength(syllabusText),
      extracted_text: syllabusText,
      character_count: syllabusText.length,
      processing_status: 'completed',
      approval_status: 'approved',
    });

    // 2. Extract structured modules, course outcomes, and learning objectives via Groq AI
    const extracted = await extractSyllabus({
      syllabusText,
      courseCode: course.code,
      courseTitle: course.title,
    });

    let savedModules: any[] = [];
    let savedOutcomes: any[] = [];

    // 3. Automatically apply to course database if requested
    if (applyImmediately) {
      if (replaceExisting) {
        db.clearModules(course.id);
        db.clearCourseOutcomes(course.id);
      }

      const existingModules = db.getModules(course.id);
      const startOrder = existingModules.length;

      savedModules = extracted.modules.map((m, idx) => {
        return db.createModule({
          course_id: course.id,
          title: m.title,
          description: m.description,
          order_index: startOrder + (m.order_index || idx + 1),
          learning_objectives: m.learning_objectives,
        });
      });

      savedOutcomes = extracted.course_outcomes.map((co) => {
        return db.createCourseOutcome({
          course_id: course.id,
          code: co.code,
          description: co.description,
          bloom_level: co.bloom_level,
        });
      });

      // Generate module-wise study notes for all extracted modules
      for (const mod of savedModules) {
        try {
          const notesMarkdown = await generateModuleNotes({
            courseTitle: `${course.code}: ${course.title}`,
            moduleTitle: mod.title,
            moduleOrder: mod.order_index,
            moduleDescription: mod.description,
            learningObjectives: mod.learning_objectives,
            groundingText: syllabusText,
          });
          db.updateModule(mod.id, { notes_markdown: notesMarkdown });
        } catch (e: any) {
          console.warn(`Failed to auto-generate notes for module ${mod.title}:`, e.message);
        }
      }

      // Update course description if empty
      if ((!course.description || course.description.trim() === '') && extracted.course_description) {
        db.updateCourse(course.id, { description: extracted.course_description });
      }
    }

    return NextResponse.json({
      success: true,
      message: `Extracted ${extracted.modules.length} curriculum modules and ${extracted.course_outcomes.length} Course Outcomes from syllabus.`,
      extracted,
      savedModules,
      savedOutcomes,
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
