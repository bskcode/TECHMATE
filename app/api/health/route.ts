import { NextResponse } from 'next/server';
import { groqService } from '@/lib/ai/groq-provider';
import { db } from '@/lib/db';

export async function GET() {
  const profilesCount = db.getAllProfiles().length;
  const coursesCount = db.getCourses().length;
  const groqConfigured = groqService.isConfigured();
  const groqModel = process.env.GROQ_MODEL || 'llama-3.3-70b-versatile';

  return NextResponse.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    service: 'AdaptiveLearn AI Web Service',
    database: 'persistent-local-store',
    stats: {
      profiles: profilesCount,
      courses: coursesCount,
    },
    ai: {
      provider: groqConfigured ? 'groq' : 'grounded-fallback',
      model: groqConfigured ? groqModel : 'deterministic-grounded-fallback',
      configured: groqConfigured,
    },
    environment: process.env.NODE_ENV || 'development',
  });
}
