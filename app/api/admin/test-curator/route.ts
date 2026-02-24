import { NextResponse } from 'next/server';
import { getSupabaseClient } from '@/lib/supabase/client';
import { getCuratorNote } from '@/app/product/[handle]/actions';

/**
 * Admin API: Test Curator Note Generation
 * Generates curator notes for first 5 products
 * 
 * Usage: GET /api/admin/test-curator
 */

export async function GET() {
  try {
    // Temporarily allow in production for testing
    const allowInProduction = true; // TEMPORARY
    
    if (process.env.NODE_ENV === 'production' && !allowInProduction) {
      return NextResponse.json(
        { error: 'This endpoint is disabled in production' },
        { status: 403 }
      );
    }

    const supabase = getSupabaseClient();

    // Fetch first 5 products
    const { data: products, error } = await supabase
      .from('products')
      .select('id, handle, title, category, description')
      .limit(5);

    if (error || !products) {
      return NextResponse.json({
        success: false,
        error: 'Failed to fetch products',
        details: error,
      }, { status: 500 });
    }

    const results = [];

    // Generate curator note for each product
    for (const product of products) {
      const startTime = Date.now();
      
      try {
        console.log(`[Test Curator] Generating note for ${product.handle}...`);
        
        const note = await getCuratorNote(
          product.id,
          product.title,
          product.category,
          product.description
        );

        const duration = Date.now() - startTime;

        results.push({
          handle: product.handle,
          title: product.title,
          success: !!note,
          duration,
          noteLength: note?.length || 0,
          note: note ? note.substring(0, 150) + (note.length > 150 ? '...' : '') : null,
        });

        console.log(`[Test Curator] ${product.handle}: ${note ? 'SUCCESS' : 'FAILED'} (${duration}ms)`);
      } catch (err) {
        const duration = Date.now() - startTime;
        console.error(`[Test Curator] Error for ${product.handle}:`, err);
        
        results.push({
          handle: product.handle,
          title: product.title,
          success: false,
          duration,
          error: err instanceof Error ? err.message : String(err),
        });
      }
    }

    const successCount = results.filter(r => r.success).length;
    const successRate = Math.round((successCount / results.length) * 100);

    return NextResponse.json({
      success: true,
      summary: {
        total: results.length,
        successful: successCount,
        failed: results.length - successCount,
        successRate: `${successRate}%`,
      },
      results,
    });
  } catch (error) {
    console.error('[Test Curator] Fatal error:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
    }, { status: 500 });
  }
}
