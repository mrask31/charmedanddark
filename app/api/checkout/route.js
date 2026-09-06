import { NextResponse } from 'next/server';
import { reconcileCart } from '@/lib/shopify/cart';
import { hasActiveSanctuaryMembership, sanitizeAttributionAttributes } from '@/lib/shopify/cart-request';

const headers = { 'Cache-Control': 'private, no-store' };

export async function POST(request) {
  try {
    const { cartId, items, attribution } = await request.json();
    const result = await reconcileCart({
      cartId,
      items,
      isMember: await hasActiveSanctuaryMembership(request),
      attributes: sanitizeAttributionAttributes(attribution),
      checkout: true,
    });
    if (result.needsReview) {
      return NextResponse.json({ ...result, error: result.messages.join(' ') }, { status: 409, headers });
    }
    if (!result.cart?.checkoutUrl) throw new Error('No checkout URL returned.');
    return NextResponse.json({ ...result, checkoutUrl: result.cart.checkoutUrl, memberDiscountApplied: result.cart.memberDiscountApplied }, { headers });
  } catch (error) {
    if (!error.status) console.error('Checkout failed:', error.message);
    return NextResponse.json({
      error: error.status ? error.message : 'Checkout is temporarily unavailable. Your selection is saved; please try again.',
      issues: error.issues || [],
      ...(error.cart ? { cart: error.cart } : {}),
    }, { status: error.status || (error instanceof SyntaxError ? 400 : 503), headers });
  }
}
