/**
 * Cart Page
 * Feature: cart
 * 
 * The curated collection space where visitors review claimed objects
 * Enforces visual-system conformance with transactional state spacing
 */

import { Suspense } from 'react';
import CartView from '@/components/cart/CartView';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default function CartPage() {
  return (
    <Suspense fallback={<CartLoadingState />}>
      <CartView />
    </Suspense>
  );
}

function CartLoadingState() {
  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#f5f5f0',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
    }}>
      <div style={{
        fontSize: '0.875rem',
        color: '#404040',
        letterSpacing: '0.2em',
        fontFamily: "'Inter', sans-serif",
        textTransform: 'uppercase' as const,
      }}>
        Loading collection...
      </div>
    </div>
  );
}
