/**
 * Sanctuary Debug Endpoint
 * Tests each component of the Sanctuary system
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const diagnostics: any = {
    timestamp: new Date().toISOString(),
    checks: {},
  };

  // Check 1: Environment Variables
  diagnostics.checks.env = {
    GEMINI_API_KEY: !!process.env.GEMINI_API_KEY,
    GEMINI_API_KEY_length: process.env.GEMINI_API_KEY?.length || 0,
    SUPABASE_URL: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
    SUPABASE_SERVICE_KEY: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
  };

  // Check 2: Supabase Connection
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { data: products, error } = await supabase
      .from('products')
      .select('id, handle, title')
      .limit(5);

    diagnostics.checks.supabase = {
      connected: !error,
      error: error?.message || null,
      productCount: products?.length || 0,
      sampleProducts: products?.map(p => p.title) || [],
    };
  } catch (error) {
    diagnostics.checks.supabase = {
      connected: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }

  // Check 3: Gemini SDK
  try {
    const { GoogleGenerativeAI } = await import('@google/generative-ai');
    diagnostics.checks.gemini = {
      sdkLoaded: true,
      hasApiKey: !!process.env.GEMINI_API_KEY,
    };

    // Try to initialize (but don't call API)
    if (process.env.GEMINI_API_KEY) {
      try {
        const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
        const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
        diagnostics.checks.gemini.initialized = true;
        diagnostics.checks.gemini.modelName = 'gemini-2.5-flash';
      } catch (initError) {
        diagnostics.checks.gemini.initialized = false;
        diagnostics.checks.gemini.initError = initError instanceof Error ? initError.message : 'Unknown';
      }
    }
  } catch (error) {
    diagnostics.checks.gemini = {
      sdkLoaded: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }

  return NextResponse.json(diagnostics, { status: 200 });
}
