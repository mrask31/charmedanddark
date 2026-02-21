/**
 * Sanctuary Chat API
 * The Curator AI endpoint for mood-based product recommendations
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { getCuratorRecommendation } from '@/lib/gemini';

export const dynamic = 'force-dynamic';
export const maxDuration = 30;

export async function POST(request: NextRequest) {
  try {
    // Get user prompt from request
    const { prompt, userId, userEmail } = await request.json();

    if (!prompt || !userId || !userEmail) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Initialize Supabase
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Fetch all products for context
    const { data: products, error: productsError } = await supabase
      .from('products')
      .select('id, handle, title, description_lines, category')
      .eq('sync_source', 'google_sheets')
      .gt('stock_quantity', 0)
      .order('title');

    if (productsError || !products) {
      console.error('Error fetching products:', productsError);
      return NextResponse.json(
        { error: 'Failed to load product catalog' },
        { status: 500 }
      );
    }

    // Get AI recommendation
    const { response, recommendedProduct } = await getCuratorRecommendation(
      prompt,
      products
    );

    // Log interaction to database
    const { error: logError } = await supabase
      .from('sanctuary_interactions')
      .insert({
        user_id: userId,
        user_email: userEmail,
        user_prompt: prompt,
        ai_response: response,
        recommended_product_id: recommendedProduct?.id || null,
        recommended_product_handle: recommendedProduct?.handle || null,
      });

    if (logError) {
      console.error('Error logging interaction:', logError);
      // Don't fail the request if logging fails
    }

    return NextResponse.json({
      response,
      recommendedProduct: recommendedProduct
        ? {
            handle: recommendedProduct.handle,
            title: recommendedProduct.title,
          }
        : null,
    });
  } catch (error) {
    console.error('Sanctuary chat error:', error);
    
    return NextResponse.json(
      {
        error: 'The Curator is unavailable',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
