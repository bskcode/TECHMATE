import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await req.json();
    const { question_id, response_number, student_answer } = body;

    if (!question_id || !response_number || student_answer === undefined) {
      return NextResponse.json(
        { success: false, error: 'Question ID, response number, and student answer are required' },
        { status: 400 }
      );
    }

    if (response_number < 1 || response_number > 3) {
      return NextResponse.json(
        { success: false, error: 'Illegal attempt count. Maximum 3 attempts (Initial, Hint 1, Hint 2) permitted.' },
        { status: 403 }
      );
    }

    // Process submission via server-side 2-hint state machine
    const result = db.submitResponse(
      params.id,
      question_id,
      response_number as 1 | 2 | 3,
      String(student_answer)
    );

    return NextResponse.json({
      success: true,
      result: {
        is_correct: result.is_correct,
        awarded_marks: result.awarded_marks,
        max_marks: result.max_marks,
        response_number: result.response_number,
        is_question_finalized: result.is_question_finalized,
        next_state: result.next_state,
        unlocked_hint: result.unlocked_hint, // only provided if unlocked
        feedback: result.feedback,
      },
    });
  } catch (err: any) {
    const isClientErr =
      err.message?.includes('Attempt not found') ||
      err.message?.includes('Invalid attempt') ||
      err.message?.includes('already');
    return NextResponse.json({ success: false, error: err.message }, { status: isClientErr ? 400 : 500 });
  }
}

