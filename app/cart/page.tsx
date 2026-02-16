'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { getCart } from '@/lib/storefront';
import type { Cart } from '@/lib/storefront/types';

function formatPrice(amount: string, currency: string = 'USD'): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
  }).format(parseFloat(amount));
}

export default function CartPage() {
  const [cart, setCart] = useState<Cart | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadCart() {
      const cartId = localStorage.getItem('shopify_cart_id');
      
      if (!cartId) {
        setLoading(false);
        return;
      }

      const cartData = await getCart(cartId);
      setCart(cartData);
      setLoading(false);
    }

    loadCart();
  }, []);

  if (loading) {
    return (
      <main className="cart-page">
        <div className="container">
          <div className="loading-state">
            <p>Loading cart...</p>
          </div>
        </div>
      </main>
    );
  }

  if (!cart || cart.lines.length === 0) {
    return (
      <main className="cart-page">
        <div className="container">
          <div className="empty-cart">
            <h1>Your cart is empty</h1>
            <p>Add some items to get started.</p>
            <Link href="/" className="btn-primary">
              Continue Shopping
            </Link>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="cart-page">
      <div className="container">
        <h1 className="cart-title">Shopping Cart</h1>

        <div className="cart-content">
          <div className="cart-items">
            {cart.lines.map((line) => (
              <div key={line.id} className="cart-item">
                <div className="cart-item-image">
                  {line.merchandise.image ? (
                    <Image
                      src={line.merchandise.image.url}
                      alt={line.merchandise.product.title}
                      width={100}
                      height={125}
                    />
                  ) : (
                    <div className="cart-item-placeholder">No image</div>
                  )}
                </div>
                <div className="cart-item-details">
                  <h3 className="cart-item-title">
                    <Link href={`/product/${line.merchandise.product.handle}`}>
                      {line.merchandise.product.title}
                    </Link>
                  </h3>
                  {line.merchandise.title !== 'Default Title' && (
                    <p className="cart-item-variant">{line.merchandise.title}</p>
                  )}
                  <p className="cart-item-price">
                    {formatPrice(
                      line.merchandise.priceV2.amount,
                      line.merchandise.priceV2.currencyCode
                    )}
                  </p>
                </div>
                <div className="cart-item-quantity">
                  <span>Qty: {line.quantity}</span>
                </div>
              </div>
            ))}
          </div>

          <div className="cart-summary">
            <h2 className="cart-summary-title">Order Summary</h2>
            <div className="cart-summary-row">
              <span>Subtotal</span>
              <span>
                {formatPrice(
                  cart.cost.totalAmount.amount,
                  cart.cost.totalAmount.currencyCode
                )}
              </span>
            </div>
            <p className="cart-summary-note">
              Shipping and taxes calculated at checkout
            </p>
            <a href={cart.checkoutUrl} className="btn-primary cart-checkout-btn">
              Proceed to Checkout
            </a>
            <Link href="/" className="btn-secondary">
              Continue Shopping
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
