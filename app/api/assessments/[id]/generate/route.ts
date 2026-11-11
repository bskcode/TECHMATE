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

    // Fetch approved course materials for grounding
    const approvedMaterials = db.getMaterials(course.id, true);
    let groundingText = approvedMaterials
      .map((m) => `[Document: ${m.filename}]\n${m.extracted_text || ''}`)
      .join('\n\n');

    if (!groundingText || groundingText.trim() === '') {
      // If no approved text uploaded yet, use course description
      groundingText = `Course: ${course.code} - ${course.title}. ${course.description || ''}`;
    }

    // Call Groq / Grounded generator to produce complete packages
    const questionPackages = await generateQuestionPackages({
      courseTitle: `${course.code}: ${course.title}`,
      moduleTitle: assessment.title,
      groundingText,
      questionCount,
      targetTraits,
      difficulty,
    });

    // Save generated packages into database
    const savedQuestions = questionPackages.map((pkg, idx) => {
      return db.saveGeneratedQuestionPackage(params.id, pkg as any, idx + 1);
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
