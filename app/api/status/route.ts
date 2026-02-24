import { NextResponse } from 'next/server';

/**
 * Simple Status Check - Always Available
 * No production restrictions
 */

export async function GET() {
  const envStatus = {
    nodeEnv: process.env.NODE_ENV,
    geminiApiKey: !!process.env.GEMINI_API_KEY,
    geminiKeyLength: process.env.GEMINI_API_KEY?.length || 0,
    shopifyAdminToken: !!process.env.SHOPIFY_ADMIN_ACCESS_TOKEN,
    shopifyTokenLength: process.env.SHOPIFY_ADMIN_ACCESS_TOKEN?.length || 0,
    shopifyDomain: process.env.NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN || 'NOT SET',
    supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL || 'NOT SET',
    supabaseKey: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  };

  const missing = [];
  if (!envStatus.geminiApiKey) missing.push('GEMINI_API_KEY');
  if (!envStatus.shopifyAdminToken) missing.push('SHOPIFY_ADMIN_ACCESS_TOKEN');
  if (envStatus.shopifyDomain === 'NOT SET') missing.push('NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN');
  if (envStatus.supabaseUrl === 'NOT SET') missing.push('NEXT_PUBLIC_SUPABASE_URL');
  if (!envStatus.supabaseKey) missing.push('NEXT_PUBLIC_SUPABASE_ANON_KEY');

  return NextResponse.json({
    status: 'online',
    timestamp: new Date().toISOString(),
    environment: envStatus,
    missingRequired: missing,
    allConfigured: missing.length === 0,
  });
}
