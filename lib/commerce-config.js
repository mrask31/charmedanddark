import 'server-only';

// Existing production stays on its established source until preview gates pass.
// Explicit false also provides an operational rollback override.
export function isShopifyCatalogEnabled() {
  return process.env.SHOPIFY_CATALOG_ENABLED === 'true'
    || (process.env.SHOPIFY_CATALOG_ENABLED !== 'false' && process.env.VERCEL_ENV === 'preview');
}

export const SHOPIFY_CATALOG_ENABLED = isShopifyCatalogEnabled();
