import { getProductBySlug, getRelatedProducts } from '@/lib/products';
import { notFound, permanentRedirect } from 'next/navigation';
import { getShopifyVariants } from '@/lib/shopify/variants';
import { productIsAvailable, productPricing, productBrand } from '@/lib/product-display';
import ProductDetail from '@/components/shop/ProductDetail';
import { ProductPromotionProvider } from '@/components/shop/ProductPromotionContext';

export const revalidate = 60;
const SITE_URL = 'https://www.charmedanddark.com';

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) return { title: 'Product Not Found', robots: { index: false, follow: true } };
  const title = product.metaTitle || product.name;
  const description = product.metaDescription || product.description?.replace(/<[^>]*>/g, '').slice(0, 160) || 'Discover this artifact at Charmed & Dark.';
  const url = `${SITE_URL}/shop/${product.slug}`;
  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: {
      title,
      description,
      url,
      images: product.imageUrls?.[0] ? [{ url: product.imageUrls[0], alt: product.name }] : [],
    },
  };
}

export default async function ProductPage({ params, searchParams }) {
  const [{ slug }, query] = await Promise.all([params, searchParams]);
  const product = await getProductBySlug(slug);
  if (!product) notFound();

  // Redirect only after the identity bridge has resolved a published product.
  // Variant links and campaign attribution must survive historical handle URLs.
  if (product.slug !== slug) {
    const preserved = new URLSearchParams();
    for (const [key, value] of Object.entries(query || {})) {
      for (const item of Array.isArray(value) ? value : [value]) {
        if (typeof item === 'string') preserved.append(key, item);
      }
    }
    permanentRedirect(`/shop/${product.slug}${preserved.size ? `?${preserved}` : ''}`);
  }

  const [relatedProducts, shopifyVariants] = await Promise.all([
    getRelatedProducts(product, 4),
    product.shopifyVariants || (product.shopify_id ? getShopifyVariants(product.shopify_id) : null),
  ]);

  return (
    <>
      <ProductPromotionProvider product={product}>
        <ProductDetail
          key={`${product.id}:${typeof query?.variant === 'string' ? query.variant : ''}`}
          product={product}
          relatedProducts={relatedProducts}
          shopifyVariants={shopifyVariants}
          initialVariantId={typeof query?.variant === 'string' ? query.variant : null}
        />
      </ProductPromotionProvider>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(buildProductJsonLd(product, shopifyVariants)).replace(/</g, '\\u003c') }}
      />
    </>
  );
}

function buildProductJsonLd(product, variantData) {
  const url = `${SITE_URL}/shop/${product.slug}`;
  const variants = variantData?.variants || [];
  const seller = { '@type': 'Organization', name: 'Charmed & Dark' };
  const offers = variants.length ? variants.map((variant) => ({
    '@type': 'Offer',
    price: Number(variant.price).toFixed(2),
    priceCurrency: variant.currency || product.currency || 'USD',
    availability: (variant.availableForSale ?? variant.available) ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
    url: `${url}?variant=${(variant.shopifyVariantId || variant.id).split('/').pop()}`,
    ...(variant.sku && { sku: variant.sku }),
    seller,
  })) : [{
    '@type': 'Offer',
    price: productPricing(product).publicPrice.toFixed(2),
    priceCurrency: product.currency || 'USD',
    availability: productIsAvailable(product) ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
    url,
    seller,
  }];
  return {
    '@context': 'https://schema.org',
    '@type': 'Product',
    '@id': `${url}#product`,
    name: product.name,
    url,
    description: product.description?.replace(/<[^>]*>/g, '').slice(0, 500) || undefined,
    ...(product.imageUrls?.length && { image: product.imageUrls }),
    ...(product.sku && { sku: product.sku }),
    brand: { '@type': 'Brand', name: productBrand(product) },
    offers,
  };
}
