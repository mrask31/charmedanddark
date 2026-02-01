import { NextRequest, NextResponse } from 'next/server';
import { getCart } from '@/lib/shopify/storefront';

/**
 * Cart API endpoint
 * Returns cart.checkoutUrl for redirect
 */
export async function POST(request: NextRequest) {
  try {
    const { cartId } = await request.json();

    if (!cartId) {
      return NextResponse.json({ error: 'Cart ID required' }, { status: 400 });
    }

    // Fetch cart from Shopify Storefront API
    const cart = await getCart(cartId);

    if (!cart) {
      return NextResponse.json({ error: 'Cart not found' }, { status: 404 });
    }

    if (!cart.checkoutUrl) {
      return NextResponse.json(
        { error: 'Checkout URL not available' },
        { status: 400 }
      );
    }

    // Return checkoutUrl
    return NextResponse.json({
      checkoutUrl: cart.checkoutUrl,
    });
  } catch (error) {
    console.error('Failed to fetch cart:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
