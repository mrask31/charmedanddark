import { NextRequest, NextResponse } from 'next/server';
import { generateConfirmationToken } from '@/lib/confirmToken';

/**
 * Generate signed confirmation token
 * Used by Shopify thank-you page redirect (Shopify Plus only)
 * 
 * Flow:
 * 1. Shopify redirects to: /api/generate-token?order_id=123456
 * 2. This endpoint generates signed token
 * 3. Redirects to: /threshold/confirmation?t={token}
 */
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const orderId = searchParams.get('order_id');

  if (!orderId) {
    // No order ID - redirect to home
    return NextResponse.redirect(new URL('/threshold', request.url));
  }

  try {
    // Generate signed token
    const token = generateConfirmationToken(orderId);

    // Redirect to confirmation page with token
    const confirmationUrl = new URL('/threshold/confirmation', request.url);
    confirmationUrl.searchParams.set('t', token);

    return NextResponse.redirect(confirmationUrl);
  } catch (error) {
    console.error('Failed to generate confirmation token:', error);
    
    // Redirect to home on error
    return NextResponse.redirect(new URL('/threshold', request.url));
  }
}
