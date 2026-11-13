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
    const questionCount = body.questionCount || 6;
    const targetTraits: BloomTrait[] = body.targetTraits || [
      'remembering',
      'understanding',
      'application',
      'analysis',
      'creativity',
      'evaluation',
    ];
    const difficulty = body.difficulty || 'medium';

    // Fetch approved course materials for grounding — questions MUST be from uploaded material
    const approvedMaterials = db.getMaterials(course.id, true).filter(
      (m) => m.extracted_text && m.extracted_text.trim().length > 0
    );

    if (approvedMaterials.length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: `No approved course materials found for ${course.code}. Please upload your course PDF in Learning Materials first so questions can be generated directly from your uploaded material.`,
        },
        { status: 400 }
      );
    }

    const materialIds = approvedMaterials.map((m) => m.id);
    const groundingText = approvedMaterials
      .map((m) => `=== DOCUMENT: ${m.filename} ===\n${m.extracted_text}`)
      .join('\n\n');

    // Call Groq / Grounded generator to produce complete packages strictly from uploaded material
    const questionPackages = await generateQuestionPackages({
      courseTitle: `${course.code}: ${course.title}`,
      moduleTitle: assessment.title,
      groundingText,
      questionCount,
      targetTraits,
      difficulty,
    });

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

    // Return the full question list with answer keys for faculty review
    const fullQuestions = db.getQuestions(params.id, true);

    return NextResponse.json({
      success: true,
      message: `Successfully generated ${savedQuestions.length} complete question packages with Bloom trait mappings and progressive hints.`,
      questions: fullQuestions,
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

