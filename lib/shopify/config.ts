/**
 * Shopify API Configuration
 * Centralized configuration for all Shopify API clients
 */

export const SHOPIFY_API_VERSION = '2024-01';

/**
 * Get Shopify store domain from environment
 */
export function getStoreDomain(): string {
  const domain = process.env.NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN;
  if (!domain) {
    throw new Error('NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN is not configured');
  }
  return domain;
}

/**
 * Get Shopify Storefront Access Token from environment
 */
export function getStorefrontToken(): string {
  const token = process.env.NEXT_PUBLIC_SHOPIFY_STOREFRONT_ACCESS_TOKEN;
  if (!token) {
    throw new Error('NEXT_PUBLIC_SHOPIFY_STOREFRONT_ACCESS_TOKEN is not configured');
  }
  return token;
}

/**
 * Get Shopify Admin Access Token from environment
 */
export function getAdminToken(): string {
  const token = process.env.SHOPIFY_ADMIN_ACCESS_TOKEN;
  if (!token) {
    throw new Error('SHOPIFY_ADMIN_ACCESS_TOKEN is not configured');
  }
  return token;
}

/**
 * Get Shopify Webhook Secret from environment (optional)
 */
export function getWebhookSecret(): string | undefined {
  return process.env.SHOPIFY_WEBHOOK_SECRET;
}

/**
 * Build Shopify Storefront API endpoint URL
 */
export function getStorefrontEndpoint(): string {
  return `https://${getStoreDomain()}/api/${SHOPIFY_API_VERSION}/graphql.json`;
}

/**
 * Build Shopify Admin API endpoint URL
 */
export function getAdminEndpoint(): string {
  return `https://${getStoreDomain()}/admin/api/${SHOPIFY_API_VERSION}/graphql.json`;
}

/**
 * Collection handles and featured product settings
 */
export const STOREFRONT_CONFIG = {
  // Primary navigation collections
  collections: {
    apparel: 'apparel',
    apparelFeatured: 'apparel-featured',
    new: 'new',
    homeDecor: 'home-decor',
    decorFeatured: 'decor-featured',
  },
  
  // Capsule collections (brand identity)
  capsules: {
    stillness: 'stillness',
    afterHours: 'after-hours',
    solace: 'solace',
  },
  
  // Featured product limits
  limits: {
    homepageApparelFeatured: 12,
    homepageDecorPreview: 6,
    relatedProducts: 4,
  },
} as const;

export type CollectionHandle = keyof typeof STOREFRONT_CONFIG.collections | keyof typeof STOREFRONT_CONFIG.capsules;
