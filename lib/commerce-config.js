import 'server-only';

// Shopify is authoritative after the verified migration release.
// Explicit false preserves an operational rollback override.
export function isShopifyCatalogEnabled() {
  return process.env.SHOPIFY_CATALOG_ENABLED !== 'false';
}

export const SHOPIFY_CATALOG_ENABLED = isShopifyCatalogEnabled();
