import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const modules = db.getModules(params.id);
  return NextResponse.json({ success: true, modules });
}

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await req.json();
    const { title, description } = body;
    if (!title || !title.trim()) {
      return NextResponse.json({ success: false, error: 'Module title is required' }, { status: 400 });
    }
    const existing = db.getModules(params.id);
    const created = db.createModule({
      course_id: params.id,
      title: title.trim(),
      description: description?.trim() || '',
      order_index: existing.length + 1,
    });
    return NextResponse.json({ success: true, module: created }, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const moduleId = searchParams.get('moduleId');
  if (!moduleId) {
    return NextResponse.json({ success: false, error: 'moduleId is required' }, { status: 400 });
  }
  const deleted = db.deleteModule(moduleId);
  if (!deleted) {
    return NextResponse.json({ success: false, error: 'Module not found' }, { status: 404 });
  }
  return NextResponse.json({ success: true });
}

