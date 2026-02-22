import { NextRequest, NextResponse } from 'next/server';
import { fetchProductsNeedingBranding } from '@/lib/shopify/darkroom';
import { getSupabaseClient } from '@/lib/supabase/client';

export const runtime = 'nodejs';
export const maxDuration = 60; // 1 minute

interface PreflightProduct {
  id: string;
  handle: string;
  title: string;
  tags: string[];
  imageCount: number;
  willProcess: boolean;
  skipReason?: string;
}

/**
 * Preflight check - Fetch products and analyze which will be processed
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
    const adminEmails = process.env.NEXT_PUBLIC_ADMIN_EMAILS || process.env.ADMIN_EMAILS || '';
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

    console.log(`Preflight check for ${limit} products (requested: ${requestedLimit})...`);
    console.log(`Initiated by: ${user.email}`);

    // Fetch products from Shopify
    const products = await fetchProductsNeedingBranding(limit);

    // Analyze each product
    const preflightResults: PreflightProduct[] = products.map(product => {
      let willProcess = true;
      let skipReason: string | undefined;

      // Check for Printify products
      if (product.tags.includes('source:printify')) {
        willProcess = false;
        skipReason = 'Printify product';
      }
      // Check for Wardrobe products
      else if (product.tags.includes('dept:wardrobe')) {
        willProcess = false;
        skipReason = 'Wardrobe product';
      }
      // Check for missing required tags
      else if (!product.tags.includes('source:faire')) {
        willProcess = false;
        skipReason = 'Missing source:faire tag';
      }
      else if (!product.tags.includes('dept:objects')) {
        willProcess = false;
        skipReason = 'Missing dept:objects tag';
      }
      // Check for no images
      else if (product.images.length === 0) {
        willProcess = false;
        skipReason = 'No images';
      }

      return {
        id: product.id,
        handle: product.handle,
        title: product.title,
        tags: product.tags,
        imageCount: product.images.length,
        willProcess,
        skipReason,
      };
    });

    console.log(`Preflight results: ${preflightResults.filter(p => p.willProcess).length} will process, ${preflightResults.filter(p => !p.willProcess).length} will skip`);

    return NextResponse.json({
      products: preflightResults,
      summary: {
        total: preflightResults.length,
        willProcess: preflightResults.filter(p => p.willProcess).length,
        willSkip: preflightResults.filter(p => !p.willProcess).length,
      },
    });
  } catch (error) {
    console.error('Preflight API error:', error);
    return NextResponse.json(
      {
        error: 'Failed to run preflight check',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
