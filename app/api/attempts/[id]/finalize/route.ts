import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const finalized = db.finalizeAttempt(params.id);
    if (!finalized) {
      return NextResponse.json({ success: false, error: 'Attempt not found' }, { status: 404 });
    }

    const traitScores = db.getTraitScoresForAttempt(params.id);

    return NextResponse.json({
      success: true,
      attempt: finalized,
      traitScores,
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

