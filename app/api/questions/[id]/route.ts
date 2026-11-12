import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await req.json();
    const updated = db.updateQuestion(params.id, body);
    if (!updated) {
      return NextResponse.json({ success: false, error: 'Question not found' }, { status: 404 });
    }

    const fullQuestion = db.getQuestion(params.id, true);
    return NextResponse.json({ success: true, question: fullQuestion });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const deleted = db.deleteQuestion(params.id);
  if (!deleted) {
    return NextResponse.json({ success: false, error: 'Question not found' }, { status: 404 });
  }
  return NextResponse.json({ success: true, message: 'Question deleted' });
}
