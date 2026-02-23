import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { getSupabaseClient, Product as SupabaseProduct } from '@/lib/supabase/client';
import { transformSupabaseProduct } from '@/lib/products';
import { buildProductJsonLd } from '@/lib/seo/schema';
import { trackProductView } from '@/lib/tracking';
import { getCanonicalUrl } from '@/lib/config/site';
import { getCuratorNote } from './actions';
import ProductClient from './ProductClient';

interface ProductPageProps {
  params: {
    handle: string;
  };
}

/**
 * Fetch product data server-side
 */
async function getProduct(handle: string): Promise<SupabaseProduct | null> {
  const supabase = getSupabaseClient();
  
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .eq('handle', handle)
    .single();

  if (error || !data) {
    return null;
  }

  return data;
}

/**
 * Generate metadata for product page (SSR)
 */
export async function generateMetadata({ params }: ProductPageProps): Promise<Metadata> {
  const product = await getProduct(params.handle);

  if (!product) {
    return {
      title: 'Product Not Found | Charmed & Dark',
    };
  }

  const canonicalUrl = getCanonicalUrl(`/product/${params.handle}`);
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
  const raw = await getProduct(params.handle);

  if (!raw) {
    notFound();
  }

  // Transform to unified product format
  const product = transformSupabaseProduct(raw);

  // Build canonical URL
  const canonicalUrl = `https://charmedanddark.vercel.app/product/${params.handle}`;

  // Generate JSON-LD schema
  const jsonLd = buildProductJsonLd(product, canonicalUrl);

  // Track product view (server-side)
  trackProductView(raw.id, params.handle);

  // Fetch or generate curator note
  const curatorNote = await getCuratorNote(
    raw.id,
    raw.title,
    raw.category || null,
    raw.description || null
  );

  return (
    <>
      {/* Inject JSON-LD schema */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      
      {/* Render client component with product data */}
      <ProductClient product={product} raw={raw} curatorNote={curatorNote} />
    </>
  );
}
