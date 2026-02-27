'use client';

/**
 * ProductDiscoveryGrid - Curated gallery-like product browsing
 * Feature: product-discovery-threshold
 * 
 * Enforces:
 * - Maximum 4 items per row (Spatial Brutalism)
 * - 5-7 products per viewport (The Threshold)
 * - Generous whitespace (non-negotiable)
 * - No infinite scrolling, no pagination
 * - Responsive: 4 → 3 → 2 → 1 columns
 */

import { useState, useEffect } from 'react';
import { UnifiedProduct } from '@/lib/products';
import { AccentRevealCard } from './AccentRevealCard';
import { calculateDensity, getResponsiveColumns } from '@/lib/density-controller';
import { DISCOVERY_SPACING } from '@/lib/discovery-spacing';
import { getSupabaseClient } from '@/lib/supabase/client';

interface ProductDiscoveryGridProps {
  products: UnifiedProduct[];
  route: 'shop' | 'uniform';
  maxItemsPerRow?: number;
  minViewportItems?: number;
  maxViewportItems?: number;
}

interface GridState {
  viewportHeight: number;
  itemsToDisplay: number;
  columnsPerRow: number;
  isRecognized: boolean;
}

export function ProductDiscoveryGrid({
  products,
  route,
}: ProductDiscoveryGridProps) {
  const [gridState, setGridState] = useState<GridState>({
    viewportHeight: 0,
    itemsToDisplay: 7, // Default to max
    columnsPerRow: 4,
    isRecognized: false,
  });

  // Measure viewport and calculate density
  useEffect(() => {
    function updateDensity() {
      const viewportHeight = window.innerHeight;
      const viewportWidth = window.innerWidth;
      const columnsPerRow = getResponsiveColumns(viewportWidth);
      
      const density = calculateDensity(
        viewportHeight,
        columnsPerRow,
        DISCOVERY_SPACING
      );
      
      setGridState(prev => ({
        ...prev,
        viewportHeight,
        itemsToDisplay: density.recommendedCount,
        columnsPerRow,
      }));
    }
    
    // Initial calculation
    updateDensity();
    
    // Debounced resize handler
    let timeoutId: NodeJS.Timeout;
    function handleResize() {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(updateDensity, 150);
    }
    
    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
      clearTimeout(timeoutId);
    };
  }, []);

  // Authentication state - Dual Pricing Law
  useEffect(() => {
    const supabase = getSupabaseClient();
    
    // Check initial auth state
    supabase.auth.getSession().then(({ data: { session } }) => {
      setGridState(prev => ({ ...prev, isRecognized: !!session }));
    });
    
    // Subscribe to auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setGridState(prev => ({ ...prev, isRecognized: !!session }));
      }
    );
    
    return () => subscription.unsubscribe();
  }, []);

  // Slice products based on density calculation
  const displayedProducts = products.slice(0, gridState.itemsToDisplay);

  // Error state - empty products
  if (products.length === 0) {
    return (
      <div style={{
        minHeight: '50vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: DISCOVERY_SPACING.containerPadding,
        textAlign: 'center',
      }}>
        <h2 style={{
          fontSize: '1.5rem',
          fontWeight: 400,
          marginBottom: '1rem',
          color: '#1a1a1a',
        }}>
          Products unavailable
        </h2>
        <p style={{
          fontSize: '1rem',
          color: '#404040',
          marginBottom: '2rem',
        }}>
          Please try again later.
        </p>
        <button
          onClick={() => window.location.reload()}
          style={{
            padding: '0.75rem 2rem',
            backgroundColor: '#1a1a1a',
            color: '#f5f5f0',
            border: 'none',
            borderRadius: '0px',
            fontSize: '0.875rem',
            letterSpacing: '0.1em',
            textTransform: 'uppercase',
            cursor: 'pointer',
          }}
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div style={{
      padding: DISCOVERY_SPACING.containerPadding,
      backgroundColor: '#f5f5f0', // Off-white
    }}>
      {/* Grid - CSS Grid with responsive columns */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: `repeat(${gridState.columnsPerRow}, 1fr)`,
        gap: DISCOVERY_SPACING.gridGap,
        maxWidth: '1400px',
        margin: '0 auto',
      }}>
        {displayedProducts.map((product) => (
          <AccentRevealCard
            key={product.id}
            product={product}
            isRecognized={gridState.isRecognized}
          />
        ))}
      </div>
      
      {/* No pagination, no infinite scroll - The Threshold */}
    </div>
  );
}
