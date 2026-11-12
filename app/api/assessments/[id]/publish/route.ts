import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const published = db.publishAssessment(params.id);
  if (!published) {
    return NextResponse.json({ success: false, error: 'Assessment not found' }, { status: 404 });
  }

  return NextResponse.json({
    success: true,
    message: 'Assessment published successfully. It is now accessible to enrolled students.',
    assessment: published,
  });
}

