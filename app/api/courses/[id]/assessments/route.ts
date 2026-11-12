import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { AssessmentType } from '@/types';

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const { searchParams } = new URL(req.url);
  const onlyPublished = searchParams.get('onlyPublished') === 'true';

  const assessments = db.getAssessments(params.id, onlyPublished);
  return NextResponse.json({ success: true, assessments });
}

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await req.json();
    const {
      title,
      description,
      assessment_type = 'diagnostic' as AssessmentType,
      time_limit_minutes = 30,
      max_marks = 30,
      passing_marks = 15,
      progressive_hints_enabled = true,
      module_id,
    } = body;

    if (!title) {
      return NextResponse.json({ success: false, error: 'Title is required' }, { status: 400 });
    }

    const assessment = db.createAssessment({
      course_id: params.id,
      module_id,
      title,
      description,
      assessment_type,
      status: 'draft',
      time_limit_minutes,
      max_marks,
      passing_marks,
      progressive_hints_enabled,
    });

    return NextResponse.json({ success: true, assessment });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

