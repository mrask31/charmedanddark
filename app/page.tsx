import { getSupabaseServer } from '@/lib/supabase/server';
import { getSupabaseClient } from '@/lib/supabase/client';
import { getShopifyProducts } from '@/lib/shopify/products';
import { transformSupabaseProduct, transformShopifyProduct, UnifiedProduct } from '@/lib/products';
import Header from '@/components/Header';
import ProductGrid from '@/components/ProductGrid';

export const dynamic = 'force-dynamic';

async function getProducts(): Promise<UnifiedProduct[]> {
  try {
    // Fetch Supabase products (50 physical objects)
    const supabase = getSupabaseServer();
    const { data: supabaseProducts, error: supabaseError } = await supabase
      .from('products')
      .select('*')
      .order('title');

    if (supabaseError) {
      console.error('Supabase products error:', supabaseError);
    }

    // Fetch Shopify products (15 apparel items)
    const shopifyProducts = await getShopifyProducts();

    // Transform and merge
    const unified: UnifiedProduct[] = [
      ...(supabaseProducts || []).map(transformSupabaseProduct),
      ...shopifyProducts.map(transformShopifyProduct),
    ];

    return unified;
  } catch (error) {
    console.error('Failed to fetch products:', error);
    return [];
  }
}

export default async function HomePage() {
  const products = await getProducts();

  return (
    <>
      <Header />
      <main style={styles.main}>
        <div style={styles.container}>
          <section style={styles.hero}>
            <h1 style={styles.title}>Apparel & Objects</h1>
            <p style={styles.subtitle}>Everyday Gothic</p>
          </section>

          {products.length === 0 ? (
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
