'use client';

/**
 * CartView - Curated collection review interface
 * Feature: cart
 * 
 * Enforces:
 * - Transactional state spacing (18px between elements, 72px between sections)
 * - Responsive layout (single-column mobile, two-column desktop)
 * - Maximum density (5-7 items per viewport)
 * - Visual-system conformance (black dominance, gold scarcity, deep red hovers)
 * - The Purge (NO shipping estimates, NO cross-sells, NO urgency)
 * - Absolute Geometry (0px border radius)
 */

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import CartItemCard from './CartItemCard';
import CartSummary from './CartSummary';
import EmptyCartState from './EmptyCartState';
import { fetchCart, createCart, getCheckoutUrl } from '@/lib/cart/shopify';
import type { Cart, ModificationFeedback } from '@/lib/cart/types';

export default function CartView() {
  const router = useRouter();
  const [cart, setCart] = useState<Cart | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [feedback, setFeedback] = useState<ModificationFeedback | null>(null);
  const [isProceedingToCheckout, setIsProceedingToCheckout] = useState(false);

  // Load cart on mount
  useEffect(() => {
    async function loadCart() {
      try {
        // Get cart ID from localStorage
        const cartId = localStorage.getItem('shopify_cart_id');
        
        if (cartId) {
          const cartData = await fetchCart(cartId);
          setCart(cartData);
        } else {
          // Create new cart if none exists
          const newCart = await createCart();
          if (newCart) {
            localStorage.setItem('shopify_cart_id', newCart.id);
            setCart(newCart);
          }
        }
      } catch (error) {
        console.error('[CartView] Failed to load cart:', error);
      } finally {
        setIsLoading(false);
      }
    }

    loadCart();
  }, []);

  // Handle cart modifications
  const handleCartUpdate = (updatedCart: Cart, modificationFeedback?: ModificationFeedback) => {
    setCart(updatedCart);
    
    if (modificationFeedback) {
      setFeedback(modificationFeedback);
      
      // Clear feedback after duration
      setTimeout(() => {
        setFeedback(null);
      }, modificationFeedback.duration);
    }
  };

  // Handle proceed to checkout
  const handleProceed = async () => {
    if (!cart) return;
    
    try {
      setIsProceedingToCheckout(true);
      
      const checkoutUrl = await getCheckoutUrl(cart.id);
      
      if (checkoutUrl) {
        // Navigate to Shopify checkout
        window.location.href = checkoutUrl;
      } else {
        setFeedback({
          type: 'error',
          message: 'Unable to proceed. Please try again shortly.',
          duration: 3000,
        });
        setIsProceedingToCheckout(false);
      }
    } catch (error) {
      console.error('[CartView] Failed to proceed to checkout:', error);
      setFeedback({
        type: 'error',
        message: 'Unable to proceed. Please try again shortly.',
        duration: 3000,
      });
      setIsProceedingToCheckout(false);
    }
  };

  if (isLoading) {
    return (
      <div style={styles.page}>
        <div style={styles.container}>
          <div style={styles.loadingState}>Loading collection...</div>
        </div>
      </div>
    );
  }

  // Empty cart state
  if (!cart || cart.lineItems.length === 0) {
    return (
      <div style={styles.page}>
        <div style={styles.container}>
          <Link href="/shop" style={styles.back}>
            ← Return to threshold
          </Link>
          <EmptyCartState />
        </div>
      </div>
    );
  }

  return (
    <div style={styles.page}>
      <div style={styles.container}>
        {/* Back navigation */}
        <Link href="/shop" style={styles.back}>
          ← Return to threshold
        </Link>

        {/* Modification feedback (subtle, inline) */}
        {feedback && (
          <div style={{
            ...styles.feedback,
            ...(feedback.type === 'error' ? styles.feedbackError : {}),
          }}>
            {feedback.message}
          </div>
        )}

        {/* Cart layout - responsive */}
        <div style={styles.cartLayout}>
          {/* Cart items section */}
          <div style={styles.itemsSection}>
            <h1 style={styles.title}>Your Collection</h1>
            
            <div style={styles.itemsList}>
              {cart.lineItems.map((item) => (
                <CartItemCard
                  key={item.id}
                  lineItem={item}
                  cartId={cart.id}
                  onUpdate={handleCartUpdate}
                />
              ))}
            </div>
          </div>

          {/* Cart summary section */}
          <div style={styles.summarySection}>
            <CartSummary
              cart={cart}
              onProceed={handleProceed}
              isProceedingToCheckout={isProceedingToCheckout}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

const styles = {
  page: {
    minHeight: '100vh',
    backgroundColor: '#f5f5f0', // Off-white
    paddingTop: '2rem',
    paddingBottom: '4rem',
  },
  container: {
    maxWidth: '1400px',
    margin: '0 auto',
    padding: '0 3rem',
    '@media (max-width: 768px)': {
      padding: '0 1.5rem',
    },
  },
  back: {
    display: 'inline-block',
    fontSize: '0.875rem',
    color: '#404040',
    textDecoration: 'none',
    marginBottom: '2rem',
    fontFamily: "'Inter', sans-serif",
    transition: 'color 300ms ease-in-out',
  },
  loadingState: {
    fontSize: '0.875rem',
    color: '#404040',
    letterSpacing: '0.2em',
    fontFamily: "'Inter', sans-serif",
    textTransform: 'uppercase' as const,
    textAlign: 'center' as const,
    padding: '4rem 0',
  },
  feedback: {
    padding: '1rem',
    backgroundColor: '#1a1a1a',
    color: '#f5f5f0',
    fontSize: '0.875rem',
    fontFamily: "'Inter', sans-serif",
    marginBottom: '2rem',
    borderRadius: '0px', // Absolute Geometry
    transition: 'opacity 300ms ease',
  },
  feedbackError: {
    backgroundColor: '#4A0E0E', // Wine (deep red)
  },
  cartLayout: {
    display: 'grid',
    gridTemplateColumns: '1fr', // Single column on mobile
    gap: '72px', // Section spacing (transactional state)
    '@media (min-width: 1025px)': {
      gridTemplateColumns: '2fr 1fr', // Two-column on desktop (items left, summary right)
    },
  },
  itemsSection: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '18px', // Element spacing (transactional state)
  },
  title: {
    fontSize: '2rem',
    fontWeight: 400,
    fontFamily: "'Crimson Pro', serif",
    color: '#1a1a1a',
    marginBottom: '1rem',
  },
  itemsList: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '18px', // Item spacing (transactional state)
  },
  summarySection: {
    display: 'flex',
    flexDirection: 'column' as const,
  },
} as const;
