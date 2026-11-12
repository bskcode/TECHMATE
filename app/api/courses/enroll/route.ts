import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { code, student_id } = body;

    if (!code || !student_id) {
      return NextResponse.json(
        { success: false, error: 'Enrollment code and student ID are required.' },
        { status: 400 }
      );
    }

    const result = db.enrollStudent(code, student_id);
    if (!result.success) {
      return NextResponse.json({ success: false, error: result.message }, { status: 400 });
    }

    return NextResponse.json({ success: true, message: result.message, course: result.course });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

