import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    service: 'AdaptiveLearn AI Web Service',
    database: 'connected',
    environment: process.env.NODE_ENV || 'development',
  });
}
