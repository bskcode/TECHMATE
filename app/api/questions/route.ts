import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      assessment_id,
      question_text,
      question_type = 'mcq',
      options,
      max_marks = 5,
      primary_trait = 'understanding',
      secondary_trait,
      difficulty = 'medium',
      correct_answer,
      accepted_variations = [],
      explanation = '',
      hint_1 = 'Review the core concept from your course materials.',
      hint_2 = 'Eliminate options that violate the fundamental constraint.',
    } = body;

    if (!assessment_id || !question_text || !correct_answer) {
      return NextResponse.json(
        { success: false, error: 'assessment_id, question_text, and correct_answer are required' },
        { status: 400 }
      );
    }

    const existing = db.getQuestions(assessment_id, true);
    const created = db.saveGeneratedQuestionPackage(
      assessment_id,
      {
        question_text,
        question_type,
        options: Array.isArray(options) ? options : undefined,
        max_marks: Number(max_marks) || 5,
        primary_trait,
        secondary_trait,
        secondary_trait_weight: secondary_trait ? 0.3 : 0,
        difficulty,
        correct_answer,
        reference_answer: correct_answer,
        accepted_variations: Array.isArray(accepted_variations) ? accepted_variations : [],
        evaluation_method: 'deterministic',
        explanation,
        hint_1,
        hint_2,
        rubric: [],
        source_reference: 'Faculty Manual Authoring',
      },
      existing.length + 1
    );

    return NextResponse.json({ success: true, question: db.getQuestion(created.id, true) }, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

