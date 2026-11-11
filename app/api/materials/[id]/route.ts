import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await req.json();
    const { approval_status, rejection_reason } = body;

    const updated = db.updateMaterialStatus(params.id, approval_status, rejection_reason);
    if (!updated) {
      return NextResponse.json({ success: false, error: 'Material not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, material: updated });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const success = db.deleteMaterial(params.id);
  if (!success) {
    return NextResponse.json({ success: false, error: 'Material not found' }, { status: 404 });
  }
  return NextResponse.json({ success: true, message: 'Material deleted successfully' });
}
