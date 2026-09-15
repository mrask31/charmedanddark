import 'server-only';
import { cache } from 'react';
import { getProducts, isShopifyCatalogEnabled } from './products.js';
import { getShopifyCollection } from './shopify/catalog.js';
import { PUBLIC_COLLECTIONS, discoveryProducts } from './discovery.js';
import { COLLECTION_CATEGORIES } from './catalog-categories.js';

export const getDiscoveryCollection = cache(async function getDiscoveryCollection(handle) {
  const definition = PUBLIC_COLLECTIONS.find((c) => c.handle === handle);
  if (!definition) return null;
  let collection = null;
  if (isShopifyCatalogEnabled()) {
    try { collection = await getShopifyCollection(handle); }
    catch (error) {
      // An as-yet unpublished collection can use the published catalog. API outages cannot.
      if (error.code !== 'CATALOG_CONFIGURATION') throw error;
    }
  }
  const source = COLLECTION_CATEGORIES[handle] ? await getProducts() : collection?.products ?? await getProducts();
  const products = discoveryProducts(source, handle);
  return { ...definition, description: collection?.description || definition.description,
    seo: collection?.seo, products };
});
