import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { practice_question_id, student_id, student_answer } = body;

    if (!practice_question_id || !student_id || student_answer === undefined) {
      return NextResponse.json(
        { success: false, error: 'Practice question ID, student ID, and answer are required' },
        { status: 400 }
      );
    }

    const result = db.recordPracticeAttempt(practice_question_id, student_id, String(student_answer));
    return NextResponse.json({ success: true, result });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

