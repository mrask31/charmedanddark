import { NextResponse } from 'next/server';

/**
 * Debug: Environment Variable Check
 * Shows which required env vars are configured (not the values, just presence)
 * 
 * Usage: GET /api/debug/env-check
 */

export async function GET() {
  // Only allow in non-production or with specific header
  const isDev = process.env.NODE_ENV !== 'production';
  
  if (!isDev) {
    return NextResponse.json(
      { error: 'This endpoint is disabled in production' },
      { status: 403 }
    );
  }

  const envVars = {
    // Gemini AI
    GEMINI_API_KEY: {
      present: !!process.env.GEMINI_API_KEY,
      length: process.env.GEMINI_API_KEY?.length || 0,
    },
    
    // Shopify
    SHOPIFY_ADMIN_ACCESS_TOKEN: {
      present: !!process.env.SHOPIFY_ADMIN_ACCESS_TOKEN,
      length: process.env.SHOPIFY_ADMIN_ACCESS_TOKEN?.length || 0,
    },
    NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN: {
      present: !!process.env.NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN,
      value: process.env.NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN || 'NOT SET',
    },
    NEXT_PUBLIC_SHOPIFY_STOREFRONT_ACCESS_TOKEN: {
      present: !!process.env.NEXT_PUBLIC_SHOPIFY_STOREFRONT_ACCESS_TOKEN,
      length: process.env.NEXT_PUBLIC_SHOPIFY_STOREFRONT_ACCESS_TOKEN?.length || 0,
    },
    
    // Supabase
    NEXT_PUBLIC_SUPABASE_URL: {
      present: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
      value: process.env.NEXT_PUBLIC_SUPABASE_URL || 'NOT SET',
    },
    NEXT_PUBLIC_SUPABASE_ANON_KEY: {
      present: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      length: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.length || 0,
    },
    
    // Google Sheets (optional)
    GOOGLE_SHEETS_PRIVATE_KEY: {
      present: !!process.env.GOOGLE_SHEETS_PRIVATE_KEY,
      length: process.env.GOOGLE_SHEETS_PRIVATE_KEY?.length || 0,
    },
    GOOGLE_SHEETS_CLIENT_EMAIL: {
      present: !!process.env.GOOGLE_SHEETS_CLIENT_EMAIL,
      value: process.env.GOOGLE_SHEETS_CLIENT_EMAIL || 'NOT SET',
    },
  };

  const missingRequired = Object.entries(envVars)
    .filter(([key, val]) => !val.present && !key.includes('GOOGLE_SHEETS'))
    .map(([key]) => key);

  return NextResponse.json({
    success: missingRequired.length === 0,
    environment: process.env.NODE_ENV,
    envVars,
    missingRequired,
    summary: {
      total: Object.keys(envVars).length,
      present: Object.values(envVars).filter(v => v.present).length,
      missing: Object.values(envVars).filter(v => !v.present).length,
    },
  });
}
