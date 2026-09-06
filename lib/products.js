import 'server-only';
import { cache } from 'react';
import { isShopifyCatalogEnabled } from './commerce-config.js';
import { getCatalogIdentities } from './catalog-identity.js';
import {
  getShopifyProducts,
  getShopifyProductByHandle,
  getShopifyProductById,
  getShopifyCollection,
} from './shopify/catalog.js';
import { attachCatalogIdentity, resolveCatalogReferences } from './shopify/catalog-shape.js';
import { getShopifyVariants } from './shopify/variants.js';

export { isShopifyCatalogEnabled } from './commerce-config.js';

const legacy = () => import('./products-legacy.js');

// Current Shopify products remain usable if the application identity archive is
// unavailable. Resolving an old-only URL/UUID requires the archive and fails visibly.
const optionalIdentities = cache(async function optionalIdentities() {
  try {
    return await getCatalogIdentities();
  } catch {
    console.error('Catalog identity archive is temporarily unavailable');
    return [];
  }
});

export const getProducts = cache(async function getProducts() {
  if (!isShopifyCatalogEnabled()) return (await legacy()).getProducts();
  const [products, identities] = await Promise.all([getShopifyProducts(), optionalIdentities()]);
  return products.map((product) => attachCatalogIdentity(product, identities));
});

export const getProductBySlug = cache(async function getProductBySlug(slug) {
  if (!isShopifyCatalogEnabled()) {
    const product = await (await legacy()).getProductBySlug(slug);
    if (!product?.shopify_id) return product;
    const shopifyVariants = await getShopifyVariants(product.shopify_id);
    return {
      ...product,
      shopifyVariants,
      availableForSale: shopifyVariants?.variants.some((variant) => variant.available) ?? false,
      currency: shopifyVariants?.variants[0]?.currency || 'USD',
      shopifyVariantId: shopifyVariants?.variants[0]?.shopifyVariantId || null,
    };
  }
  if (typeof slug !== 'string' || !slug || slug.length > 255) return null;
  const current = await getShopifyProductByHandle(slug);
  if (current) return attachCatalogIdentity(current, await optionalIdentities());

  const identities = await getCatalogIdentities();
  const matches = identities.filter((row) => [row.slug, row.handle, row.shopify_handle].includes(slug));
  const ids = [...new Set(matches.map((row) => row.shopify_id).filter(Boolean))];
  // Conflicting historical aliases must never guess a different product.
  if (ids.length !== 1) return null;
  const product = await getShopifyProductById(ids[0]);
  return product ? attachCatalogIdentity(product, identities) : null;
});

export async function getProductsByIds(ids = []) {
  const references = [...new Set(ids.filter((id) => typeof id === 'string' && id))];
  if (!references.length) return [];
  if (!isShopifyCatalogEnabled()) return (await legacy()).getProductsByReferences(references);
  let products = await getProducts();
  const current = new Set(products.flatMap((product) => [product.id, product.handle]));
  if (references.some((reference) => !current.has(reference) && !reference.startsWith('gid://shopify/Product/'))) {
    // Do not misreport an archive outage as a deleted UUID or missing historical URL.
    const identities = await getCatalogIdentities();
    products = products.map((product) => attachCatalogIdentity(product, identities));
  }
  return resolveCatalogReferences(products, references);
}

export async function getProductsByHandles(handles = []) {
  return getProductsByIds(handles);
}

export async function getProductsByCollection(handle) {
  if (!isShopifyCatalogEnabled()) return (await legacy()).getProductsByCollection(handle);
  const [collection, identities] = await Promise.all([getShopifyCollection(handle), optionalIdentities()]);
  return collection.products.map((product) => attachCatalogIdentity(product, identities));
}

const normalizeCategory = (value) => String(value || '').trim().toLowerCase().replace(/\s+/g, '-');

export async function getProductsByCategory(category) {
  if (!isShopifyCatalogEnabled()) return (await legacy()).getProductsByCategory(category);
  const key = normalizeCategory(category);
  return (await getProducts()).filter((product) => normalizeCategory(product.category) === key
    || product.collections.some((collection) => collection.handle === key));
}

export async function getBestSellers() {
  if (!isShopifyCatalogEnabled()) return (await legacy()).getBestSellers();
  return (await getProductsByCollection('homepage-best-sellers')).slice(0, 8);
}

export async function getFeaturedProducts() {
  if (!isShopifyCatalogEnabled()) return (await legacy()).getFeaturedProducts();
  return (await getProductsByCollection('frontpage')).slice(0, 4);
}

export async function getRelatedProducts(product, limit = 4) {
  const products = await getProducts();
  const candidates = products.filter((item) => item.id !== product.id);
  const related = candidates.filter((item) => item.category === product.category);
  const others = candidates.filter((item) => item.category !== product.category);
  return [...related, ...others].slice(0, limit);
}
