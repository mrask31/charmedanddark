'use client';

import { useEffect, useState } from 'react';
import { getSupabaseClient } from '@/lib/supabase/client';
import { transformSupabaseProduct, UnifiedProduct } from '@/lib/products';
import Header from '@/components/Header';
import ProductGrid from '@/components/ProductGrid';

export default function WardrobePage() {
  const [products, setProducts] = useState<UnifiedProduct[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadWardrobeProducts() {
      try {
        const supabase = getSupabaseClient();
        
        // Filter for apparel/wardrobe items
        const { data, error } = await supabase
          .from('products')
          .select('*')
          .eq('category', 'Apparel')
          .order('title');

        if (error) {
          console.error('Error loading wardrobe products:', error);
          setLoading(false);
          return;
        }

        const unified = (data || []).map(transformSupabaseProduct);
        setProducts(unified);
        setLoading(false);
      } catch (err) {
        console.error('Unexpected error:', err);
        setLoading(false);
      }
    }

    loadWardrobeProducts();
  }, []);

  return (
    <>
      <Header />
      <main style={styles.main}>
        <div style={styles.container}>
          <section style={styles.header}>
            <h1 style={styles.title}>The Wardrobe</h1>
            <p style={styles.subtitle}>Apparel</p>
          </section>

          {loading ? (
            <div style={styles.loading}>
              <p>Loading...</p>
            </div>
          ) : products.length === 0 ? (
            <div style={styles.emptyState}>
              <p>No apparel items available yet.</p>
            </div>
          ) : (
            <ProductGrid products={products} />
          )}
        </div>
      </main>
    </>
  );
}

const styles = {
  main: {
    minHeight: '100vh',
    paddingTop: '3rem',
    paddingBottom: '3rem',
    backgroundColor: '#f5f5f0',
  },
  container: {
    maxWidth: '1400px',
    margin: '0 auto',
    padding: '0 2rem',
  },
  header: {
    textAlign: 'center' as const,
    marginBottom: '4rem',
    paddingTop: '2rem',
  },
  title: {
    fontFamily: "'Crimson Pro', serif",
    fontSize: '2.5rem',
    fontWeight: 400,
    letterSpacing: '0.05em',
    marginBottom: '0.5rem',
    color: '#1a1a1a',
  },
  subtitle: {
    fontFamily: "'Inter', sans-serif",
    fontSize: '0.875rem',
    fontWeight: 300,
    color: '#404040',
    letterSpacing: '0.1em',
    textTransform: 'uppercase' as const,
  },
  loading: {
    textAlign: 'center' as const,
    padding: '4rem 2rem',
    color: '#404040',
  },
  emptyState: {
    textAlign: 'center' as const,
    padding: '4rem 2rem',
    color: '#404040',
  },
} as const;
