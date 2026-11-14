import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { generateQuestionPackages } from '@/lib/ai/question-generator';
import { BloomTrait } from '@/types';

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const assessment = db.getAssessment(params.id);
    if (!assessment) {
      return NextResponse.json({ success: false, error: 'Assessment not found' }, { status: 404 });
    }

    const course = db.getCourse(assessment.course_id);
    if (!course) {
      return NextResponse.json({ success: false, error: 'Course not found' }, { status: 404 });
    }

    const body = await req.json().catch(() => ({}));
    const questionCount = Math.max(1, Math.min(25, Number(body.questionCount) || 5));
    const targetTraits: BloomTrait[] = body.targetTraits || [
      'remembering',
      'understanding',
      'application',
      'analysis',
      'creativity',
      'evaluation',
    ];
    const difficulty = body.difficulty || 'medium';
    // Default replaceExisting to true so that assessment contains exactly the requested number of questions
    const replaceExisting = body.replaceExisting !== false;

    // Fetch all materials for this course that have non-empty extracted text
    const allMaterials = db.getMaterials(course.id, false).filter(
      (m) => m.extracted_text && m.extracted_text.trim().length > 0
    );

    if (allMaterials.length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: `No learning materials found for ${course.code} (${course.title}). Please upload your lecture notes or syllabus in Learning Materials first so questions are strictly generated from your course notes.`,
        },
        { status: 400 }
      );
    }

    // Auto-approve materials with extracted text if not already approved
    allMaterials.forEach((m) => {
      if (m.approval_status !== 'approved') {
        db.updateMaterialStatus(m.id, 'approved');
      }
    });

    // If assessment is linked to a specific module, prioritize materials for that module
    let materialsToUse = allMaterials;
    if (assessment.module_id) {
      const moduleMaterials = allMaterials.filter((m) => m.module_id === assessment.module_id);
      if (moduleMaterials.length > 0) {
        materialsToUse = moduleMaterials;
      }
    }

    const materialIds = materialsToUse.map((m) => m.id);
    const groundingText = materialsToUse
      .map((m) => `=== DOCUMENT: ${m.filename} ===\n${m.extracted_text}`)
      .join('\n\n');

    // Retrieve module context if linked
    const module = assessment.module_id ? db.getModules(course.id).find((m) => m.id === assessment.module_id) : undefined;
    const moduleTitle = module ? module.title : assessment.title;

    // Call Groq AI generator (with intelligent fallback) to produce complete packages strictly from uploaded material
    const questionPackages = await generateQuestionPackages({
      courseTitle: course.title,
      courseCode: course.code,
      moduleTitle,
      groundingText,
      questionCount,
      targetTraits,
      difficulty,
    });

    // If replaceExisting, clear previous questions for this assessment
    if (replaceExisting) {
      db.deleteQuestionsForAssessment(params.id);
    }

    // Save generated packages into database with grounding material links
    const existingQuestions = db.getQuestions(params.id, true);
    const startOrder = existingQuestions.length;
    const savedQuestions = questionPackages.map((pkg, idx) => {
      return db.saveGeneratedQuestionPackage(
        params.id,
        {
          ...(pkg as any),
          grounding_material_ids: materialIds,
        },
        startOrder + idx + 1
      );
    });

    // Update assessment max_marks and passing_marks
    const totalMarks = savedQuestions.reduce((sum, q) => sum + (q.max_marks || 5), 0);
    if (replaceExisting && totalMarks > 0) {
      db.updateAssessment(params.id, {
        max_marks: totalMarks,
        passing_marks: Math.ceil(totalMarks * 0.5),
      });
    }

    // Return the full question list with answer keys for faculty review
    const fullQuestions = db.getQuestions(params.id, true);

    return NextResponse.json({
      success: true,
      message: `Successfully generated ${savedQuestions.length} complete question packages strictly grounded in uploaded notes for ${course.code}.`,
      questions: fullQuestions,
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
