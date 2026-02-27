import { NextResponse } from 'next/server';
import { getSupabaseServerClient } from '@/lib/supabase/server';

/**
 * Debug endpoint to verify Supabase connection
 * GET /api/debug/supabase-connection
 */
export async function GET() {
  try {
    // Check environment variables
    const hasUrl = !!process.env.NEXT_PUBLIC_SUPABASE_URL;
    const hasServiceKey = !!process.env.SUPABASE_SERVICE_ROLE_KEY;
    
    if (!hasUrl || !hasServiceKey) {
      return NextResponse.json({
        success: false,
        error: 'Missing environment variables',
        details: {
          hasUrl,
          hasServiceKey,
        },
      }, { status: 500 });
    }

    // Try to connect and query
    const supabase = getSupabaseServerClient();
    
    const { data, error, count } = await supabase
      .from('products')
      .select('id, handle, title', { count: 'exact' })
      .limit(5);

    if (error) {
      return NextResponse.json({
        success: false,
        error: 'Supabase query failed',
        details: error,
      }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      message: 'Supabase connection successful',
      totalProducts: count,
      sampleProducts: data,
    });
  } catch (error: any) {
    return NextResponse.json({
      success: false,
      error: 'Unexpected error',
      details: error.message,
    }, { status: 500 });
  }
}
