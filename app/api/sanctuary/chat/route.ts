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

    console.log('Sanctuary request:', { prompt, userId, userEmail });

    if (!prompt || !userId || !userEmail) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Initialize Supabase
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
    
    console.log('Supabase config:', { 
      url: supabaseUrl, 
      hasKey: !!supabaseKey 
    });

    const supabase = createClient(supabaseUrl, supabaseKey);

    // Fetch all products for context
    console.log('Fetching products...');
    const { data: products, error: productsError } = await supabase
      .from('products')
      .select('id, handle, title, description_lines, category')
      .eq('sync_source', 'google_sheets')
      .gt('stock_quantity', 0)
      .order('title');

    if (productsError) {
      console.error('Products fetch error:', productsError);
      return NextResponse.json(
        { error: 'Failed to load product catalog', details: productsError.message },
        { status: 500 }
      );
    }

    if (!products || products.length === 0) {
      console.error('No products found');
      return NextResponse.json(
        { error: 'No products available' },
        { status: 500 }
      );
    }

    console.log(`Fetched ${products.length} products`);

    // Get AI recommendation
    console.log('Calling Gemini API...');
    let response, recommendedProduct;
    try {
      const result = await getCuratorRecommendation(prompt, products);
      response = result.response;
      recommendedProduct = result.recommendedProduct;
    } catch (geminiError) {
      console.error('Gemini API call failed:', geminiError);
      if (geminiError instanceof Error) {
        console.error('Gemini error details:', {
          name: geminiError.name,
          message: geminiError.message,
          stack: geminiError.stack,
        });
      }
      throw geminiError;
    }

    console.log('Gemini response received:', { 
      hasResponse: !!response, 
      hasRecommendation: !!recommendedProduct 
    });

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
    
    // Detailed error logging
    if (error instanceof Error) {
      console.error('Error name:', error.name);
      console.error('Error message:', error.message);
      console.error('Error stack:', error.stack);
    }
    
    return NextResponse.json(
      {
        error: 'The Curator is unavailable',
        details: error instanceof Error ? error.message : 'Unknown error',
        errorType: error instanceof Error ? error.name : typeof error,
        stack: error instanceof Error ? error.stack : undefined,
      },
      { status: 500 }
    );
  }
}
