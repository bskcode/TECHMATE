import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { assessment_id, student_id } = body;

    if (!assessment_id || !student_id) {
      return NextResponse.json(
        { success: false, error: 'Assessment ID and student ID are required' },
        { status: 400 }
      );
    }

    const assessment = db.getAssessment(assessment_id);
    if (!assessment) {
      return NextResponse.json({ success: false, error: 'Assessment not found' }, { status: 404 });
    }

    if (assessment.status !== 'published') {
      return NextResponse.json(
        { success: false, error: 'This assessment is not yet published.' },
        { status: 403 }
      );
    }

    const attempt = db.getOrCreateAttempt(assessment_id, student_id);

    // Fetch sanitized questions (strictly no answer keys or locked hints!)
    const questions = db.getQuestions(assessment_id, false);

    // Fetch any previously recorded responses for this attempt
    const responses = db.getResponsesForAttempt(attempt.id);

    // Fetch any previously unlocked hints for this attempt
    const hintEvents = db.getHintEventsForAttempt(attempt.id);

    return NextResponse.json({
      success: true,
      attempt,
      questions,
      responses,
      hintEvents,
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

