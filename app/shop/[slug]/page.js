import { getProducts, getProductBySlug } from '@/lib/products';
import { supabase } from '@/lib/supabase/client';
import { notFound } from 'next/navigation';
import { getShopifyVariants } from '@/lib/shopify/variants';
import ProductDetail from '@/components/shop/ProductDetail';

// Revalidate every 60 seconds for faster variant/image updates
export const revalidate = 60;

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
    price: row.price,
    imageUrls: row.image_urls || (row.image_url ? [row.image_url] : []),
    shopifyVariantId: row.shopify_variant_id,
    shopify_id: row.shopify_id,
  };
}

export default async function ProductPage({ params }) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);

  if (!product) return notFound();

  const relatedProducts = await getRelatedProducts(product);

  // Fetch Shopify variants using the product GID (shopify_id)
  const shopifyVariants = product.shopify_id
    ? await getShopifyVariants(product.shopify_id)
    : null;

  // Map Shopify variant images back to Supabase product_variants by matching SKU
  if (shopifyVariants?.variants && product.productVariants?.length > 0) {
    for (const pv of product.productVariants) {
      if (pv.image_url) continue; // already has an image
      if (!pv.sku) continue; // no SKU to match on
      const match = shopifyVariants.variants.find((sv) =>
        sv.sku && sv.sku === pv.sku
      );
      if (match?.imageUrl) {
        pv.image_url = match.imageUrl;
      }
    }
  }

  return (
    <>
      <ProductDetail
        product={product}
        relatedProducts={relatedProducts}
        shopifyVariants={shopifyVariants}
      />
      {/* Product JSON-LD structured data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(buildProductJsonLd(product)),
        }}
      />
    </>
  );
}

/**
 * Build schema.org Product + Offer JSON-LD for SEO.
 * Includes sale price and priceValidUntil when a promotion is active.
 */
function buildProductJsonLd(product) {
  const url = `https://www.charmedanddark.com/shop/${product.slug}`;
  const effectivePrice = product.salePrice || product.price;
  const isOnSale = product.salePrice && product.salePrice < product.price;

  const offer = {
    "@type": "Offer",
    price: effectivePrice.toFixed(2),
    priceCurrency: "USD",
    availability: product.qty > 0
      ? "https://schema.org/InStock"
      : "https://schema.org/OutOfStock",
    url,
    seller: {
      "@type": "Organization",
      name: "Charmed & Dark",
    },
  };

  // Add priceValidUntil when on sale (helps Google show sale price in search)
  if (isOnSale && product.saleEndsAt) {
    offer.priceValidUntil = product.saleEndsAt.split('T')[0]; // YYYY-MM-DD
  }

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    url,
    description: product.description?.replace(/<[^>]*>/g, '').slice(0, 300) || undefined,
    ...(product.imageUrls?.[0] && { image: product.imageUrls[0] }),
    ...(product.sku && { sku: product.sku }),
    brand: {
      "@type": "Brand",
      name: "Charmed & Dark",
    },
    offers: offer,
  };

  return jsonLd;
}
