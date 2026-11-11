import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const course = db.getCourse(params.id);
  if (!course) {
    return NextResponse.json({ success: false, error: 'Course not found' }, { status: 404 });
  }

  const modules = db.getModules(params.id);
  const outcomes = db.getCourseOutcomes(params.id);
  const materials = db.getMaterials(params.id);
  const assessments = db.getAssessments(params.id);
  const enrollments = db.getEnrollments(params.id);

  return NextResponse.json({
    success: true,
    course,
    modules,
    outcomes,
    materials,
    assessments,
    enrollments,
  });
}
