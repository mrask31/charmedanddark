import { NextResponse } from 'next/server';
import { reconcileCart } from '@/lib/shopify/cart';
import { hasActiveSanctuaryMembership } from '@/lib/shopify/cart-request';

export const dynamic = 'force-dynamic';
const headers = { 'Cache-Control': 'private, no-store' };

export async function POST(request) {
  try {
    const { cartId, items } = await request.json();
    const result = await reconcileCart({ cartId, items, isMember: await hasActiveSanctuaryMembership(request) });
    return NextResponse.json(result, { headers });
  } catch (error) {
    if (!error.status) console.error('Cart update failed:', error.message);
    return NextResponse.json({
      error: error.status ? error.message : 'We could not update your cart. Your selection is saved; please try again.',
      issues: error.issues || [],
      ...(error.cart ? { cart: error.cart } : {}),
    }, { status: error.status || (error instanceof SyntaxError ? 400 : 503), headers });
  }
}
