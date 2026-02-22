import { NextRequest, NextResponse } from 'next/server';
import { runShopifyDarkroomPipeline, PipelineProgress } from '@/lib/darkroom/shopify-pipeline';
import { getSupabaseClient } from '@/lib/supabase/client';

export const runtime = 'nodejs';
export const maxDuration = 300; // 5 minutes

/**
 * Run automated Darkroom pipeline on Shopify products
 * Admin-only endpoint
 */
export async function POST(request: NextRequest) {
  try {
    // Admin authentication check
    const authHeader = request.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Missing authorization' }, { status: 401 });
    }

    const token = authHeader.substring(7);

    // Verify user is authenticated and is admin
    const supabase = getSupabaseClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);

    if (authError || !user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user is admin
    const adminEmails = process.env.NEXT_PUBLIC_ADMIN_EMAILS || '';
    const adminList = adminEmails.split(',').map(email => email.trim().toLowerCase());

    if (!adminList.includes(user.email.toLowerCase())) {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    // Verify Shopify credentials
    if (!process.env.SHOPIFY_ADMIN_ACCESS_TOKEN) {
      return NextResponse.json(
        { error: 'SHOPIFY_ADMIN_ACCESS_TOKEN not configured' },
        { status: 500 }
      );
    }

    // Get limit from request body
    const body = await request.json().catch(() => ({}));
    const requestedLimit = body.limit || 20;
    
    // Enforce maximum of 50 products (hard cap)
    const limit = Math.min(Math.max(1, requestedLimit), 50);

    console.log(`Starting Darkroom pipeline for ${limit} products (requested: ${requestedLimit})...`);
    console.log(`Initiated by: ${user.email}`);

    // Create streaming response
    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      async start(controller) {
        try {
          // Send initial status
          controller.enqueue(
            encoder.encode(`data: ${JSON.stringify({
              type: 'start',
              limit,
              timestamp: new Date().toISOString(),
            })}\n\n`)
          );

          // Run pipeline with progress updates
          const results = await runShopifyDarkroomPipeline(limit, (progress: PipelineProgress) => {
            controller.enqueue(
              encoder.encode(`data: ${JSON.stringify({
                type: 'progress',
                ...progress,
              })}\n\n`)
            );
          });

          // Send final results
          controller.enqueue(
            encoder.encode(`data: ${JSON.stringify({
              type: 'complete',
              results,
              summary: {
                total: results.length,
                succeeded: results.filter(r => r.status === 'success').length,
                failed: results.filter(r => r.status === 'error').length,
              },
              timestamp: new Date().toISOString(),
            })}\n\n`)
          );

          controller.close();
        } catch (error) {
          console.error('Pipeline error:', error);
          controller.enqueue(
            encoder.encode(`data: ${JSON.stringify({
              type: 'error',
              error: error instanceof Error ? error.message : 'Unknown error',
              timestamp: new Date().toISOString(),
            })}\n\n`)
          );
          controller.close();
        }
      },
    });

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    });
  } catch (error) {
    console.error('Darkroom API error:', error);
    return NextResponse.json(
      {
        error: 'Failed to run Darkroom pipeline',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
