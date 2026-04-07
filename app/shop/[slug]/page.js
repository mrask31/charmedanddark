import { getProducts, getProductBySlug } from '@/lib/products';
import { supabase } from '@/lib/supabase/client';
import { notFound } from 'next/navigation';
import { getShopifyVariants } from '@/lib/shopify/variants';
import ProductDetail from '@/components/shop/ProductDetail';

export async function generateStaticParams() {
  const products = await getProducts();
  return products.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);

  if (!product) return { title: 'Product Not Found' };

  return {
    title: product.name,
    description:
      product.description?.replace(/<[^>]*>/g, '').slice(0, 160) ||
      'Discover this artifact at Charmed & Dark.',
    openGraph: {
      title: product.name,
      description: product.description?.replace(/<[^>]*>/g, '').slice(0, 160),
      images: product.imageUrls?.[0]
        ? [{ url: product.imageUrls[0], width: 800, height: 800 }]
        : [],
    },
  };
}

async function getRelatedProducts(product) {
  try {
    // First try same category
    const { data: sameCat } = await supabase
      .from('products')
      .select('*')
      .eq('category', product.category)
      .neq('slug', product.slug)
      .or('hidden.is.null,hidden.eq.false')
      .order('created_at', { ascending: false })
      .limit(4);

    const results = (sameCat || []).map(transformRow);

    // If fewer than 4, fill from other categories
    if (results.length < 4) {
      const excludeSlugs = [product.slug, ...results.map((r) => r.slug)];
      const { data: others } = await supabase
        .from('products')
        .select('*')
        .not('slug', 'in', `(${excludeSlugs.join(',')})`)
        .or('hidden.is.null,hidden.eq.false')
        .order('created_at', { ascending: false })
        .limit(4 - results.length);

      results.push(...(others || []).map(transformRow));
    }

    return results.slice(0, 4);
  } catch (err) {
    console.error('Failed to fetch related products:', err);
    return [];
  }
}

function transformRow(row) {
  return {
    id: row.id,
    sku: row.sku,
    name: row.name || row.title,
    slug: row.slug || row.handle,
    category: row.category,
    description: row.description || row.lore,
    price: row.sale_price || row.price,
    imageUrls: row.image_urls || (row.image_url ? [row.image_url] : []),
    shopifyVariantId: row.shopify_variant_id,
    shopify_id: row.shopify_id,
  };
}

export default async function ProductPage({ params }) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);

  if (!product) return notFound();

  console.log('[PRODUCT DEBUG]', {
    slug,
    lore: product.lore?.substring(0, 100),
    description: product.description?.substring(0, 100),
    finalDescription: (product.description || product.lore)?.substring(0, 100),
  });

  const relatedProducts = await getRelatedProducts(product);

  // Fetch Shopify variants using the product GID (shopify_id)
  const shopifyVariants = product.shopify_id
    ? await getShopifyVariants(product.shopify_id)
    : null;

  return (
    <ProductDetail
      product={product}
      relatedProducts={relatedProducts}
      shopifyVariants={shopifyVariants}
    />
  );
}
