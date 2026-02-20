import { notFound } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { getSupabaseServer } from '@/lib/supabase/server';
import { getShopifyProducts } from '@/lib/shopify/products';
import { transformSupabaseProduct, transformShopifyProduct, UnifiedProduct } from '@/lib/products';
import { getPricingDisplay } from '@/lib/pricing';
import Header from '@/components/Header';
import PricingDisplay from '@/components/PricingDisplay';
import ProductDescription from '@/components/ProductDescription';
import { Product as SupabaseProduct } from '@/lib/supabase/client';

export const dynamic = 'force-dynamic';

async function getProduct(handle: string): Promise<{ product: UnifiedProduct; raw: SupabaseProduct | null } | null> {
  try {
    // Try Supabase first
    const supabase = getSupabaseServer();
    const { data: supabaseProduct } = await supabase
      .from('products')
      .select('*')
      .eq('handle', handle)
      .single();

    if (supabaseProduct) {
      return {
        product: transformSupabaseProduct(supabaseProduct),
        raw: supabaseProduct,
      };
    }

    // Try Shopify
    const shopifyProducts = await getShopifyProducts();
    const shopifyProduct = shopifyProducts.find((p) => p.handle === handle);

    if (shopifyProduct) {
      return {
        product: transformShopifyProduct(shopifyProduct),
        raw: null,
      };
    }

    return null;
  } catch (error) {
    console.error('Failed to fetch product:', error);
    return null;
  }
}

export default async function ProductPage({
  params,
}: {
  params: { handle: string };
}) {
  const result = await getProduct(params.handle);

  if (!result) {
    notFound();
  }

  const { product, raw } = result;
  const pricing = getPricingDisplay(product.price);

  return (
    <>
      <Header />
      <main style={styles.main}>
        <div style={styles.container}>
          <Link href="/" style={styles.back}>
            ← All Products
          </Link>

          <div style={styles.product}>
            <div style={styles.imageSection}>
              <div style={styles.mainImage}>
                <Image
                  src={product.images.hero}
                  alt={product.title}
                  width={600}
                  height={750}
                  style={styles.image}
                  priority
                />
              </div>
              
              {product.images.front && (
                <div style={styles.thumbnails}>
                  <Image
                    src={product.images.front}
                    alt={`${product.title} - Front`}
                    width={150}
                    height={187}
                    style={styles.thumbnail}
                  />
                </div>
              )}
            </div>

            <div style={styles.details}>
              <h1 style={styles.title}>{product.title}</h1>
              
              {product.category && (
                <span style={styles.category}>{product.category}</span>
              )}

              <PricingDisplay pricing={pricing} />

              <div style={styles.description}>
                <ProductDescription 
                  description={product.description}
                  lines={raw?.description_lines || undefined}
                />
              </div>

              {product.inStock ? (
                <button style={styles.addButton}>
                  Add to Cart
                </button>
              ) : (
                <div style={styles.outOfStock}>Out of Stock</div>
              )}

              <div style={styles.source}>
                {product.source === 'shopify' ? 'Apparel' : 'Home Object'}
              </div>
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
    paddingTop: '2rem',
    paddingBottom: '3rem',
  },
  container: {
    maxWidth: '1400px',
    margin: '0 auto',
    padding: '0 1.5rem',
  },
  back: {
    display: 'inline-block',
    marginBottom: '2rem',
    fontSize: '0.9rem',
    color: '#404040',
    fontFamily: "'Inter', sans-serif",
  },
  product: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '3rem',
  },
  imageSection: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '1rem',
  },
  mainImage: {
    width: '100%',
    aspectRatio: '4 / 5',
    backgroundColor: '#f5f5f0',
    border: '1px solid #e8e8e3',
  },
  image: {
    width: '100%',
    height: '100%',
    objectFit: 'cover' as const,
  },
  thumbnails: {
    display: 'flex',
    gap: '1rem',
  },
  thumbnail: {
    width: '150px',
    height: '187px',
    objectFit: 'cover' as const,
    border: '1px solid #e8e8e3',
    cursor: 'pointer',
  },
  details: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '1.5rem',
  },
  title: {
    fontFamily: "'Crimson Pro', serif",
    fontSize: '2rem',
    fontWeight: 400,
    color: '#1a1a1a',
  },
  category: {
    fontSize: '0.75rem',
    color: '#404040',
    textTransform: 'uppercase' as const,
    letterSpacing: '0.1em',
    fontWeight: 300,
  },
  description: {
    fontFamily: "'Inter', sans-serif",
    fontSize: '1rem',
    lineHeight: 1.7,
    color: '#2d2d2d',
  },
  addButton: {
    padding: '1rem 2rem',
    backgroundColor: '#1a1a1a',
    color: '#f5f5f0',
    fontSize: '0.9rem',
    fontWeight: 400,
    fontFamily: "'Inter', sans-serif",
    textTransform: 'uppercase' as const,
    letterSpacing: '0.1em',
    cursor: 'pointer',
    transition: 'background-color 0.2s',
    border: 'none',
    width: '100%',
  },
  outOfStock: {
    padding: '1rem 2rem',
    backgroundColor: '#e8e8e3',
    color: '#404040',
    fontSize: '0.9rem',
    fontWeight: 400,
    fontFamily: "'Inter', sans-serif",
    textTransform: 'uppercase' as const,
    letterSpacing: '0.1em',
    textAlign: 'center' as const,
  },
  source: {
    fontSize: '0.75rem',
    color: '#404040',
    fontFamily: "'Inter', sans-serif",
    paddingTop: '1rem',
    borderTop: '1px solid #e8e8e3',
  },
} as const;
