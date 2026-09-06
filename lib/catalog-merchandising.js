import 'server-only';
import { getProductsByCollection, getProductsByHandles, isShopifyCatalogEnabled } from '@/lib/products';
import legacyMemberships from '@/data/commerce-collection-migration.json';

// This manifest preserves the current storefront only while the Shopify source
// is explicitly disabled. Once enabled, membership/order belong to Shopify.
export async function getMerchandisingProducts(handle, limit) {
  const products = isShopifyCatalogEnabled()
    ? await getProductsByCollection(handle)
    : await getProductsByHandles(legacyMemberships[handle] || []);
  return limit == null ? products : products.slice(0, limit);
}
