import 'server-only';

// Upgrade this deliberately after validating the catalog and cart operations.
export const SHOPIFY_API_VERSION = '2026-07';
export const SHOPIFY_CATALOG_CACHE_TAG = 'shopify-catalog';

export class ShopifyRequestError extends Error {
  constructor(message, code, status = null) {
    super(message);
    this.name = 'ShopifyRequestError';
    this.code = code;
    this.status = status;
  }
}

/** Catalog reads have a short cache; cart operations always bypass it. */
export async function shopifyFetch({
  query,
  variables = {},
  cache = 'force-cache',
  revalidate = 60,
  tags = [],
  timeoutMs = 10000,
}) {
  const domain = process.env.SHOPIFY_STORE_DOMAIN;
  const token = process.env.SHOPIFY_STOREFRONT_ACCESS_TOKEN;
  if (!domain || !/^[a-z0-9][a-z0-9.-]*\.myshopify\.com$/i.test(domain) || !token) {
    throw new ShopifyRequestError('Shopify is not configured', 'CONFIGURATION');
  }

  const noStore = cache === 'no-store' || /\bmutation\b/.test(query);
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const response = await fetch(`https://${domain}/api/${SHOPIFY_API_VERSION}/graphql.json`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Shopify-Storefront-Access-Token': token,
      },
      body: JSON.stringify({ query, variables }),
      signal: controller.signal,
      cache: noStore ? 'no-store' : cache,
      ...(!noStore && {
        next: { revalidate, tags: [...new Set([SHOPIFY_CATALOG_CACHE_TAG, ...tags])] },
      }),
    });

    if (!response.ok) {
      throw new ShopifyRequestError('Shopify is temporarily unavailable', 'HTTP', response.status);
    }
    let json;
    try {
      json = await response.json();
    } catch {
      throw new ShopifyRequestError('Shopify returned an invalid response', 'INVALID_RESPONSE');
    }
    if (json.errors?.length) {
      // Upstream messages can contain request details. Keep customer/log errors generic.
      throw new ShopifyRequestError('Shopify could not complete this request', 'GRAPHQL');
    }
    if (!json.data || typeof json.data !== 'object') {
      throw new ShopifyRequestError('Shopify returned an incomplete response', 'INVALID_RESPONSE');
    }
    return json.data;
  } catch (error) {
    if (error instanceof ShopifyRequestError) throw error;
    throw new ShopifyRequestError(
      controller.signal.aborted ? 'Shopify request timed out' : 'Shopify is temporarily unavailable',
      controller.signal.aborted ? 'TIMEOUT' : 'NETWORK',
    );
  } finally {
    clearTimeout(timeout);
  }
}
