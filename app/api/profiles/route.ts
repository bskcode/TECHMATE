import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const role = searchParams.get('role');

  let profiles = db.getAllProfiles();
  if (role === 'faculty' || role === 'student') {
    profiles = profiles.filter((p) => p.role === role);
  }

  return NextResponse.json({ success: true, profiles });
}

