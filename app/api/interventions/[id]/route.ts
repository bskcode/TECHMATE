import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const intervention = db.getIntervention(params.id);
  if (!intervention) {
    return NextResponse.json({ success: false, error: 'Intervention not found' }, { status: 404 });
  }

  return NextResponse.json({ success: true, intervention });
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await req.json();
    const { status, faculty_id } = body;

    if (!['approved', 'rejected', 'released'].includes(status)) {
      return NextResponse.json({ success: false, error: 'Invalid status' }, { status: 400 });
    }

    const updated = db.updateInterventionStatus(params.id, status, faculty_id);
    if (!updated) {
      return NextResponse.json({ success: false, error: 'Intervention not found' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      message: `Intervention ${status} successfully.`,
      intervention: db.getIntervention(params.id),
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
