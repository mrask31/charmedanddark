'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { getSupabaseClient } from '@/lib/supabase/client';
import { transformSupabaseProduct, UnifiedProduct } from '@/lib/products';
import Header from '@/components/Header';
import ProductGrid from '@/components/ProductGrid';
import CategoryFilter from '@/components/CategoryFilter';

export default function ObjectsPage() {
  const [products, setProducts] = useState<UnifiedProduct[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const searchParams = useSearchParams();
  const currentCategory = searchParams.get('category') || undefined;

  useEffect(() => {
    async function loadObjectProducts() {
      try {
        const supabase = getSupabaseClient();
        
        // Build query - filter for physical objects (exclude Apparel)
        let query = supabase
          .from('products')
          .select('*')
          .neq('category', 'Apparel');

        // Apply category filter if present
        if (currentCategory && currentCategory !== 'all') {
          query = query.eq('category', currentCategory);
        }

        const { data, error } = await query.order('title');

        if (error) {
          console.error('Error loading object products:', error);
          setLoading(false);
          return;
        }

        // Extract unique categories for filter
        const uniqueCategories = Array.from(
          new Set(data?.map(p => p.category).filter(Boolean) as string[])
        ).sort();
        setCategories(uniqueCategories);

        const unified = (data || []).map(transformSupabaseProduct);
        setProducts(unified);
        setLoading(false);
      } catch (err) {
        console.error('Unexpected error:', err);
        setLoading(false);
      }
    }

    loadObjectProducts();
  }, [currentCategory]);

  return (
    <>
      <Header />
      <main style={styles.main}>
        <div style={styles.container}>
          <section style={styles.header}>
            <h1 style={styles.title}>The Objects</h1>
            <p style={styles.subtitle}>Physical Goods</p>
          </section>

          <div style={styles.layout}>
            {categories.length > 0 && (
              <CategoryFilter 
                categories={categories} 
                currentCategory={currentCategory}
              />
            )}
            
            <div style={categories.length > 0 ? styles.content : styles.contentFull}>
              {loading ? (
                <div style={styles.loading}>
                  <p>Loading...</p>
                </div>
              ) : products.length === 0 ? (
                <div style={styles.emptyState}>
                  <p>No objects available yet.</p>
                </div>
              ) : (
                <ProductGrid products={products} />
              )}
            </div>
          </div>
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
  layout: {
    display: 'grid',
    gridTemplateColumns: '200px 1fr',
    gap: '4rem',
  },
  content: {
    minHeight: '400px',
  },
  contentFull: {
    minHeight: '400px',
    gridColumn: '1 / -1',
  },
  loading: {
    textAlign: 'center' as const,
    padding: '4rem 0',
    color: '#404040',
  },
  emptyState: {
    textAlign: 'center' as const,
    padding: '4rem 0',
    color: '#404040',
  },
} as const;
