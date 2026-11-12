import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await req.json();
    const { code, description } = body;
    if (!code || !description) {
      return NextResponse.json(
        { success: false, error: 'Outcome code and description are required' },
        { status: 400 }
      );
    }
    const created = db.createCourseOutcome({
      course_id: params.id,
      code: code.trim().toUpperCase(),
      description: description.trim(),
    });
    return NextResponse.json({ success: true, outcome: created }, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const outcomeId = searchParams.get('outcomeId');
  if (!outcomeId) {
    return NextResponse.json({ success: false, error: 'outcomeId is required' }, { status: 400 });
  }
  const deleted = db.deleteCourseOutcome(outcomeId);
  if (!deleted) {
    return NextResponse.json({ success: false, error: 'Course outcome not found' }, { status: 404 });
  }
  return NextResponse.json({ success: true });
}

