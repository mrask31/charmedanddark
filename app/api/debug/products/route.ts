import { NextResponse } from 'next/server';
import { getSupabaseClient } from '@/lib/supabase/client';

/**
 * Debug: Check Product Data
 * Shows first 5 products with image data
 * 
 * Usage: GET /api/debug/products
 */

export async function GET() {
  // Only allow in non-production
  if (process.env.NODE_ENV === 'production') {
    return NextResponse.json(
      { error: 'This endpoint is disabled in production' },
      { status: 403 }
    );
  }

  try {
    const supabase = getSupabaseClient();

    const { data: products, error } = await supabase
      .from('products')
      .select('id, handle, title, price, image_url, images')
      .limit(5);

    if (error) {
      return NextResponse.json({
        success: false,
        error: error.message,
      }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      count: products?.length || 0,
      products: products?.map(p => ({
        handle: p.handle,
        title: p.title,
        price: p.price,
        image_url: p.image_url,
        images_count: Array.isArray(p.images) ? p.images.length : 0,
        first_image: Array.isArray(p.images) && p.images[0] ? p.images[0].url : null,
      })),
    });
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    }, { status: 500 });
  }
}
