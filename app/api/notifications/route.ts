import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const userId = searchParams.get('userId') || '';
  const role = searchParams.get('role') === 'student' ? 'student' : 'faculty';

  const notifications = db.getNotifications(userId, role);
  return NextResponse.json({ success: true, notifications });
}

