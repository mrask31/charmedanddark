/**
 * SEO Schema Generation
 * Builds JSON-LD structured data for search engines
 */

import type { UnifiedProduct } from '@/lib/products';

/**
 * Build Product JSON-LD schema
 * @param product - Product data
 * @param canonicalUrl - Canonical URL for the product
 * @returns JSON-LD object
 */
export function buildProductJsonLd(product: UnifiedProduct, canonicalUrl: string) {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.title,
    description: product.description,
    url: canonicalUrl,
    image: product.images.all || [product.images.hero],
    brand: {
      '@type': 'Brand',
      name: 'Charmed & Dark',
    },
    offers: {
      '@type': 'Offer',
      price: product.price.toFixed(2),
      priceCurrency: 'USD',
      availability: product.inStock 
        ? 'https://schema.org/InStock' 
        : 'https://schema.org/OutOfStock',
      url: canonicalUrl,
    },
  };

  // Add category if available
  if (product.category) {
    (schema as any).category = product.category;
  }

  return schema;
}

/**
 * Build FAQ JSON-LD schema (scaffold for future use)
 * @param faqs - Array of FAQ items
 * @returns JSON-LD object
 */
export function buildFaqJsonLd(faqs: Array<{ question: string; answer: string }>) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map(faq => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.answer,
      },
    })),
  };
}

/**
 * Build Organization JSON-LD schema
 * @param siteUrl - Base site URL
 * @returns JSON-LD object
 */
export function buildOrganizationJsonLd(siteUrl: string) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'Charmed & Dark',
    url: siteUrl,
    logo: `${siteUrl}/images/logo.png`,
    description: 'Premium home goods and apparel for intentional living',
    sameAs: [
      // Add social media URLs when available
    ],
  };
}
