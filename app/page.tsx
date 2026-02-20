'use client';

import { useEffect, useState } from 'react';
import { getSupabaseClient } from '@/lib/supabase/client';
import { transformSupabaseProduct, UnifiedProduct } from '@/lib/products';
import Header from '@/components/Header';
import ProductGrid from '@/components/ProductGrid';

export default function HomePage() {
  const [products, setProducts] = useState<UnifiedProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadProducts() {
      try {
        const supabase = getSupabaseClient();
        
        // Test connection first
        const { data: testData, error: testError } = await supabase
          .from('products')
          .select('count')
          .limit(1);

        if (testError) {
          console.error('Supabase connection error:', testError);
          setError(`Database connection failed: ${testError.message}`);
          setLoading(false);
          return;
        }

        // Fetch products
        const { data, error: supabaseError } = await supabase
          .from('products')
          .select('*')
          .order('title');

        if (supabaseError) {
          console.error('Supabase query error:', supabaseError);
          setError(`Failed to load products: ${supabaseError.message}`);
          setLoading(false);
          return;
        }

        const unified = (data || []).map(transformSupabaseProduct);
        setProducts(unified);
        setLoading(false);
      } catch (err) {
        console.error('Unexpected error:', err);
        setError(`Unexpected error: ${err instanceof Error ? err.message : 'Unknown error'}`);
        setLoading(false);
      }
    }

    loadProducts();
  }, []);

  return (
    <>
      <Header />
      <main style={styles.main}>
        <div style={styles.container}>
          <section style={styles.hero}>
            <h1 style={styles.title}>Apparel & Objects</h1>
            <p style={styles.subtitle}>Everyday Gothic</p>
          </section>

          {loading ? (
            <div style={styles.loading}>
              <p>Loading...</p>
            </div>
          ) : error ? (
            <div style={styles.error}>
              <p style={styles.errorTitle}>Configuration Issue</p>
              <p style={styles.errorMessage}>{error}</p>
              <p style={styles.errorHint}>
                Check that Supabase environment variables are set in Vercel:
                <br />
                • NEXT_PUBLIC_SUPABASE_URL
                <br />
                • NEXT_PUBLIC_SUPABASE_ANON_KEY
              </p>
            </div>
          ) : products.length === 0 ? (
            <div style={styles.emptyState}>
              <p>No products available yet.</p>
              <p style={styles.emptyHint}>Run the Google Sheets sync to populate products.</p>
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
  },
  container: {
    maxWidth: '1400px',
    margin: '0 auto',
    padding: '0 1.5rem',
  },
  hero: {
    textAlign: 'center' as const,
    marginBottom: '3rem',
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
    fontSize: '1rem',
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
  error: {
    textAlign: 'center' as const,
    padding: '4rem 2rem',
    maxWidth: '600px',
    margin: '0 auto',
  },
  errorTitle: {
    fontSize: '1.25rem',
    fontWeight: 500,
    color: '#d32f2f',
    marginBottom: '1rem',
  },
  errorMessage: {
    color: '#666',
    marginBottom: '1.5rem',
    fontSize: '0.95rem',
  },
  errorHint: {
    fontSize: '0.875rem',
    color: '#888',
    lineHeight: 1.6,
  },
  emptyState: {
    textAlign: 'center' as const,
    padding: '4rem 2rem',
    color: '#404040',
  },
  emptyHint: {
    marginTop: '1rem',
    fontSize: '0.875rem',
    color: '#666',
  },
} as const;
