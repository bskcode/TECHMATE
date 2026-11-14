import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const userId = searchParams.get('userId') || undefined;
  const role = (searchParams.get('role') as 'faculty' | 'student') || undefined;

  const courses = db.getCourses(userId, role);
  const allCourses = db.getCourses();
  return NextResponse.json({ success: true, courses, allCourses });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { code, title, description, instructor_id, term } = body;

    if (!code || !title || !instructor_id) {
      return NextResponse.json(
        { success: false, error: 'Course code, title, and instructor are required.' },
        { status: 400 }
      );
    }

    const enrollment_code = code.replace(/[^a-zA-Z0-9]/g, '').slice(0, 5).toUpperCase() + Math.floor(10 + Math.random() * 90);

    const course = db.createCourse({
      code,
      title,
      description: description || '',
      instructor_id,
      enrollment_code,
      term: term || 'Fall 2026',
      is_active: true,
    });

    return NextResponse.json({ success: true, course });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

