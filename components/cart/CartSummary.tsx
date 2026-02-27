'use client';

/**
 * CartSummary - Cart summary with proceed action
 * Feature: cart
 * 
 * Enforces:
 * - Muted gold subtotal emphasis
 * - Singular proceed action (NO competing CTAs)
 * - Deep red hover state (300ms transition)
 * - Absolute Geometry (0px border radius)
 * - The Purge (NO shipping estimates, NO cross-sells, NO urgency)
 * - Ritualized language ("Proceed", NOT "Checkout now")
 */

import { useState } from 'react';
import type { Cart } from '@/lib/cart/types';

interface CartSummaryProps {
  cart: Cart;
  onProceed: () => void;
  isProceedingToCheckout: boolean;
}

export default function CartSummary({ cart, onProceed, isProceedingToCheckout }: CartSummaryProps) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div style={styles.summary}>
      {/* Item count */}
      <div style={styles.itemCount}>
        {cart.itemCount} {cart.itemCount === 1 ? 'object' : 'objects'} claimed
      </div>

      {/* Subtotal */}
      <div style={styles.subtotalSection}>
        <span style={styles.subtotalLabel}>Subtotal</span>
        <span style={styles.subtotalValue}>${cart.subtotal.toFixed(2)}</span>
      </div>

      {/* NO shipping estimate */}
      {/* NO delivery timeframe */}
      {/* NO "Free shipping threshold" progress bar */}
      {/* NO discount code field */}
      {/* NO upsells or cross-sells */}

      {/* Proceed action (singular primary CTA) */}
      <button
        onClick={onProceed}
        disabled={isProceedingToCheckout}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        style={{
          ...styles.proceedButton,
          ...(isHovered && !isProceedingToCheckout ? styles.proceedButtonHover : {}),
          ...(isProceedingToCheckout ? styles.proceedButtonDisabled : {}),
        }}
      >
        {isProceedingToCheckout ? 'Proceeding...' : 'Proceed'}
      </button>
    </div>
  );
}

const styles = {
  summary: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '18px', // Element spacing (transactional state)
    padding: '24px',
    backgroundColor: '#ffffff',
    borderRadius: '0px', // Absolute Geometry
    border: '1px solid #e8e8e3',
    position: 'sticky' as const,
    top: '2rem',
  },
  itemCount: {
    fontSize: '1rem',
    fontWeight: 400,
    color: '#1a1a1a',
    fontFamily: "'Inter', sans-serif",
  },
  subtotalSection: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'baseline',
    paddingTop: '18px',
    borderTop: '1px solid #e8e8e3',
  },
  subtotalLabel: {
    fontSize: '1rem',
    fontWeight: 400,
    color: '#1a1a1a',
    fontFamily: "'Inter', sans-serif",
  },
  subtotalValue: {
    fontSize: '1.25rem', // 20px (Body Large)
    fontWeight: 300,
    color: '#8B7355', // Muted gold (antique-gold) - emphasis
    fontFamily: "'Inter', sans-serif",
  },
  proceedButton: {
    marginTop: '54px', // 72px - 18px = 54px additional spacing for section gap
    padding: '1rem 2rem',
    backgroundColor: '#1a1a1a', // Near-black fill
    color: '#8B7355', // Muted gold text
    border: '1px solid #8B7355', // Muted gold border
    borderRadius: '0px', // Absolute Geometry
    fontSize: '1rem',
    fontWeight: 400,
    fontFamily: "'Inter', sans-serif",
    textTransform: 'uppercase' as const,
    letterSpacing: '0.15em',
    cursor: 'pointer',
    transition: 'all 300ms ease-in-out',
    width: '100%',
  },
  proceedButtonHover: {
    backgroundColor: '#6B1515', // Deep red (blood)
    borderColor: '#6B1515',
    color: '#f5f5f0',
  },
  proceedButtonDisabled: {
    backgroundColor: '#e8e8e3',
    borderColor: '#e8e8e3',
    color: '#999',
    cursor: 'not-allowed',
  },
} as const;
