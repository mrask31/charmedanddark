import { NextResponse } from 'next/server';
import { getSupabaseClient } from '@/lib/supabase/client';
import { getCuratorNote } from '@/app/product/[handle]/actions';

/**
 * Curator Note Health Check API
 * Tests curator note generation for first 10 products
 * 
 * Usage: GET /api/health-check/curator
 */

interface HealthCheckResult {
  handle: string;
  status: 'success' | 'failure' | 'timeout';
  duration: number;
  noteLength?: number;
  note?: string;
  error?: string;
}

export async function GET() {
  const startTime = Date.now();
  
  // Check environment variables first
  const envCheck = {
    geminiApiKey: !!process.env.GEMINI_API_KEY,
    geminiApiKeyLength: process.env.GEMINI_API_KEY?.length || 0,
    shopifyAdminToken: !!process.env.SHOPIFY_ADMIN_ACCESS_TOKEN,
    shopifyAdminTokenLength: process.env.SHOPIFY_ADMIN_ACCESS_TOKEN?.length || 0,
    shopifyDomain: !!process.env.NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN,
    shopifyDomainValue: process.env.NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN || 'NOT SET',
    supabaseUrl: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
    supabaseKey: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  };
  
  try {
    const supabase = getSupabaseClient();

    // Fetch first 10 products
    const { data: products, error } = await supabase
      .from('products')
      .select('id, handle, title, category, description')
      .limit(10);

    if (error || !products) {
      return NextResponse.json({
        success: false,
        error: 'Failed to fetch products',
        details: error,
        envCheck,
      }, { status: 500 });
    }

    const results: HealthCheckResult[] = [];
    let successCount = 0;
    let failureCount = 0;
    let timeoutCount = 0;

    // Test each product
    for (const product of products) {
      const productStartTime = Date.now();
      
      try {
        const note = await getCuratorNote(
          product.id,
          product.title,
          product.category,
          product.description
        );

        const duration = Date.now() - productStartTime;

        if (note) {
          successCount++;
          results.push({
            handle: product.handle,
            status: 'success',
            duration,
            noteLength: note.length,
            note: note.substring(0, 100) + (note.length > 100 ? '...' : ''),
          });
        } else {
          if (duration >= 3000) {
            timeoutCount++;
            results.push({
              handle: product.handle,
              status: 'timeout',
              duration,
              error: 'Generation exceeded 3s timeout',
            });
          } else {
            failureCount++;
            results.push({
              handle: product.handle,
              status: 'failure',
              duration,
              error: 'Generation returned null (check logs for details)',
            });
          }
        }
      } catch (err) {
        const duration = Date.now() - productStartTime;
        failureCount++;
        
        // Log full error to console for debugging
        console.error(`[Health Check] Error for ${product.handle}:`, err);
        
        results.push({
          handle: product.handle,
          status: 'failure',
          duration,
          error: err instanceof Error ? err.message : String(err),
        });
      }
    }

    // Calculate statistics
    const successResults = results.filter(r => r.status === 'success');
    const avgDuration = successResults.length > 0
      ? successResults.reduce((sum, r) => sum + r.duration, 0) / successResults.length
      : 0;
    const maxDuration = successResults.length > 0
      ? Math.max(...successResults.map(r => r.duration))
      : 0;
    const minDuration = successResults.length > 0
      ? Math.min(...successResults.map(r => r.duration))
      : 0;

    const noteLengths = successResults.filter(r => r.noteLength).map(r => r.noteLength!);
    const avgNoteLength = noteLengths.length > 0
      ? noteLengths.reduce((sum, len) => sum + len, 0) / noteLengths.length
      : 0;

    const totalDuration = Date.now() - startTime;
    const successRate = Math.round((successCount / products.length) * 100);
    const passed = failureCount <= products.length * 0.2; // Pass if <20% failure rate

    return NextResponse.json({
      success: true,
      passed,
      envCheck,
      summary: {
        totalProducts: products.length,
        successCount,
        failureCount,
        timeoutCount,
        successRate: `${successRate}%`,
        totalDuration: `${totalDuration}ms`,
      },
      performance: {
        avgDuration: Math.round(avgDuration),
        minDuration,
        maxDuration,
      },
      noteStats: {
        avgLength: Math.round(avgNoteLength),
        minLength: noteLengths.length > 0 ? Math.min(...noteLengths) : 0,
        maxLength: noteLengths.length > 0 ? Math.max(...noteLengths) : 0,
      },
      results,
    });
  } catch (error) {
    console.error('[Health Check] Fatal error:', error);
    return NextResponse.json({
      success: false,
      error: 'Health check failed',
      details: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
      envCheck,
    }, { status: 500 });
  }
}
