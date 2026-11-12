import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const studentId = searchParams.get('studentId');
  if (!studentId) {
    return NextResponse.json({ success: false, error: 'studentId is required' }, { status: 400 });
  }
  const attempts = db.getPracticeAttempts(studentId);
  return NextResponse.json({ success: true, attempts });
}

