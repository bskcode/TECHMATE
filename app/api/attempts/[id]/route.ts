import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const attempt = db.getAttempt(params.id);
  if (!attempt) {
    return NextResponse.json({ success: false, error: 'Attempt not found' }, { status: 404 });
  }

  const responses = db.getResponsesForAttempt(params.id);
  const hintEvents = db.getHintEventsForAttempt(params.id);
  const traitScores = db.getTraitScoresForAttempt(params.id);

  return NextResponse.json({
    success: true,
    attempt,
    responses,
    hintEvents,
    traitScores,
  });
}

