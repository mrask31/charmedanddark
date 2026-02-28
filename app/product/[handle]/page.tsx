import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { getSupabaseServerClient } from '@/lib/supabase/server';
import { Product as SupabaseProduct } from '@/lib/supabase/client';
import { transformSupabaseProduct } from '@/lib/products';
import { buildProductJsonLd } from '@/lib/seo/schema';
import { trackProductView } from '@/lib/tracking';
import { getCanonicalUrl } from '@/lib/config/site';
import ProductDetailClient from './ProductDetailClient';

// Force dynamic rendering to always fetch fresh product data
export const dynamic = 'force-dynamic';
export const revalidate = 0;

interface ProductPageProps {
  params: Promise<{
    handle: string;
  }>;
}

/**
 * Fetch product data server-side
 */
async function getProduct(handle: string): Promise<SupabaseProduct | null> {
  try {
    const supabase = getSupabaseServerClient();
    
    console.log('[ProductDetail] Fetching product with handle:', handle);
    
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('handle', handle)
      .single();

    if (error) {
      console.error('[ProductDetail] Supabase error:', error);
      return null;
    }

    if (!data) {
      console.warn('[ProductDetail] No product found for handle:', handle);
      return null;
    }

    console.log('[ProductDetail] Product found:', data.id, data.title);
    console.log('[ProductDetail] Variants data:', data.variants);
    return data;
  } catch (error) {
    console.error('[ProductDetail] Unexpected error:', error);
    return null;
  }
}

/**
 * Generate metadata for product page (SSR)
 */
export async function generateMetadata({ params }: ProductPageProps): Promise<Metadata> {
  const { handle } = await params;
  const product = await getProduct(handle);

  if (!product) {
    return {
      title: 'Product Not Found | Charmed & Dark',
    };
  }

  const canonicalUrl = getCanonicalUrl(`/product/${handle}`);
  // Extract image URL from either image_url or first image in images array
  const imageUrl = product.image_url || 
    (product.images && product.images.length > 0 
      ? (typeof product.images[0] === 'string' ? product.images[0] : product.images[0].url)
      : undefined);

  return {
    title: `${product.title} | Charmed & Dark`,
    description: product.description || `${product.title} - Premium home goods and apparel`,
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      title: product.title,
      description: product.description || undefined,
      url: canonicalUrl,
      siteName: 'Charmed & Dark',
      images: imageUrl ? [
        {
          url: imageUrl,
          width: 1200,
          height: 1200,
          alt: product.title,
        },
      ] : undefined,
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: product.title,
      description: product.description || undefined,
      images: imageUrl ? [imageUrl] : undefined,
    },
  };
}

/**
 * Product page component (SSR)
 */
export default async function ProductPage({ params }: ProductPageProps) {
  const { handle } = await params;
  const raw = await getProduct(handle);

  if (!raw) {
    notFound();
  }

  // Transform to unified product format
  const product = transformSupabaseProduct(raw);
  
  // DEBUG: Log raw variants data from database
  console.log('[ProductDetail] Raw variants from DB:', JSON.stringify(raw.variants));
  console.log('[ProductDetail] Transformed variants:', JSON.stringify(product.variants));

  // Build canonical URL
  const canonicalUrl = `https://charmedanddark.vercel.app/product/${handle}`;

  // Generate JSON-LD schema
  const jsonLd = buildProductJsonLd(product, canonicalUrl);

  // Track product view (server-side)
  trackProductView(raw.id, handle);

  // Check authentication state server-side
  const supabase = getSupabaseServerClient();
  const { data: { session } } = await supabase.auth.getSession();
  const isAuthenticated = !!session;

  return (
    <>
      {/* Inject JSON-LD schema */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      
      {/* Render new client component with product data and auth state */}
      <ProductDetailClient 
        product={product} 
        initialAuthState={isAuthenticated}
      />
    </>
  );
}
