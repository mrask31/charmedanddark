'use client';

import { useEffect, useState } from 'react';
import { UnifiedProduct } from '@/lib/products';
import ProductCard from '@/components/ProductCard';
import { getSupabaseClient } from '@/lib/supabase/client';

interface ProductGridProps {
  products: UnifiedProduct[];
}

export default function ProductGrid({ products }: ProductGridProps) {
  const [isRecognized, setIsRecognized] = useState(false);

  useEffect(() => {
    const supabase = getSupabaseClient();
    
    supabase.auth.getSession().then(({ data: { session } }) => {
      setIsRecognized(!!session);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setIsRecognized(!!session);
    });

    return () => subscription.unsubscribe();
  }, []);

  if (products.length === 0) {
    return (
      <div style={styles.empty}>
        <p>No products available at this time.</p>
      </div>
    );
  }

  return (
    <div style={styles.grid}>
      {products.map((product) => (
        <ProductCard
          key={product.id}
          product={product}
          isRecognized={isRecognized}
        />
      ))}
    </div>
  );
}

const styles = {
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
    gap: '2rem',
  },
  empty: {
    textAlign: 'center' as const,
    padding: '3rem',
    color: '#404040',
    fontFamily: "'Inter', sans-serif",
  },
} as const;
