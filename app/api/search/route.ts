import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const query = searchParams.get('q') || '';
  const role = searchParams.get('role') === 'student' ? 'student' : 'faculty';

  const results = db.searchPlatform(query, role);
  return NextResponse.json({ success: true, results });
}

