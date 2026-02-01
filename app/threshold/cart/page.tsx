'use client';

import { useState } from 'react';

/**
 * Cart page with Checkout redirect
 * 
 * CRITICAL: Uses cart.checkoutUrl directly (no checkoutCreate mutation)
 */
export default function CartPage() {
  const [isRedirecting, setIsRedirecting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Mock cart ID - in real implementation, this would come from cart state/context
  const cartId = 'gid://shopify/Cart/example-cart-id';

  async function handleProceedToCheckout() {
    setIsRedirecting(true);
    setError(null);

    try {
      // Fetch cart to get checkoutUrl
      const response = await fetch('/api/cart', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cartId }),
      });

      if (!response.ok) {
        throw new Error('Failed to fetch cart');
      }

      const data = await response.json();

      if (!data.checkoutUrl) {
        throw new Error('Checkout URL not available');
      }

      // Redirect to Shopify checkout
      window.location.href = data.checkoutUrl;
    } catch (err) {
      // Display calm error, preserve cart
      setError('Unable to proceed at this moment. Please try again shortly.');
      setIsRedirecting(false);
      console.error('Checkout redirect failed:', err);
    }
  }

  return (
    <div style={styles.container}>
      <h1 style={styles.heading}>Your Collection</h1>

      {/* Mock cart items - in real implementation, show actual cart items */}
      <div style={styles.cartItems}>
        <p style={styles.placeholder}>Cart items would be displayed here</p>
      </div>

      {/* Error message */}
      {error && <p style={styles.error}>{error}</p>}

      {/* Proceed button */}
      <button
        onClick={handleProceedToCheckout}
        disabled={isRedirecting}
        style={{
          ...styles.proceedButton,
          ...(isRedirecting ? styles.proceedButtonDisabled : {}),
        }}
      >
        {isRedirecting ? 'Proceeding...' : 'Proceed'}
      </button>
    </div>
  );
}

// Minimal styling (visual-system aesthetic)
const styles = {
  container: {
    maxWidth: '800px',
    margin: '0 auto',
    padding: '96px 24px',
    backgroundColor: '#0A0A0A',
    minHeight: '100vh',
    color: '#E5E5E5',
  },
  heading: {
    fontSize: '32px',
    fontWeight: 400,
    marginBottom: '72px',
    color: '#E5E5E5',
  },
  cartItems: {
    marginBottom: '72px',
  },
  placeholder: {
    color: '#666',
    fontSize: '16px',
  },
  error: {
    color: '#8B7355', // Muted gold
    fontSize: '16px',
    marginBottom: '24px',
  },
  proceedButton: {
    backgroundColor: '#0A0A0A',
    color: '#8B7355', // Muted gold
    border: '1px solid #8B7355',
    padding: '16px 48px',
    fontSize: '16px',
    cursor: 'pointer',
    transition: 'all 150ms ease',
  },
  proceedButtonDisabled: {
    opacity: 0.5,
    cursor: 'not-allowed',
  },
};
