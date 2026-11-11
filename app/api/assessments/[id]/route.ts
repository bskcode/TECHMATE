import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const { searchParams } = new URL(req.url);
  const isFaculty = searchParams.get('isFaculty') === 'true';

  const assessment = db.getAssessment(params.id);
  if (!assessment) {
    return NextResponse.json({ success: false, error: 'Assessment not found' }, { status: 404 });
  }

  // Security: only faculty receives answer keys and hints. Students receive sanitized questions!
  const questions = db.getQuestions(params.id, isFaculty);

  return NextResponse.json({
    success: true,
    assessment,
    questions,
  });
}
