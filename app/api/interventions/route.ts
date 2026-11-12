import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const studentId = searchParams.get('studentId') || undefined;
  const courseId = searchParams.get('courseId') || undefined;
  const onlyReleased = searchParams.get('onlyReleased') === 'true';

  const interventions = db.getInterventions({ studentId, courseId, onlyReleased });
  return NextResponse.json({ success: true, interventions });
}

