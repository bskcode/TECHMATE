import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const studentId = searchParams.get('studentId');
  const courseId = searchParams.get('courseId');

  if (!studentId || !courseId) {
    return NextResponse.json(
      { success: false, error: 'studentId and courseId are required' },
      { status: 400 }
    );
  }

  let report = db.getProgressReport(studentId, courseId);
  if (!report) {
    // Check if there are baseline and final assessments
    const assessments = db.getAssessments(courseId);
    const baseline = assessments.find((a) => a.assessment_type === 'diagnostic');
    const final = assessments.find((a) => a.assessment_type === 'final');

    if (baseline && final) {
      report = db.generateProgressReport(studentId, courseId, baseline.id, final.id);
    }
  }

  if (!report) {
    return NextResponse.json({ success: false, error: 'No progress report found' }, { status: 404 });
  }

  return NextResponse.json({ success: true, report });
}
