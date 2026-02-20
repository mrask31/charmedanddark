/**
 * API Route: Sync Google Sheets to Supabase
 * Can be triggered manually or via cron job
 */

import { NextRequest, NextResponse } from 'next/server';
import { syncGoogleSheets } from '@/lib/google-sheets/sync';

export const dynamic = 'force-dynamic';
export const maxDuration = 60; // 60 seconds for Vercel

export async function POST(request: NextRequest) {
  try {
    // Verify authorization (optional but recommended)
    const authHeader = request.headers.get('authorization');
    const expectedToken = process.env.SYNC_API_TOKEN;

    if (expectedToken && authHeader !== `Bearer ${expectedToken}`) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Run sync
    const results = await syncGoogleSheets();

    return NextResponse.json({
      success: true,
      results,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Sync error:', error);
    
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

// Allow GET for manual testing (remove in production)
export async function GET(request: NextRequest) {
  // Check if we're in development
  if (process.env.NODE_ENV !== 'development') {
    return NextResponse.json(
      { error: 'GET method only available in development' },
      { status: 403 }
    );
  }

  return POST(request);
}
