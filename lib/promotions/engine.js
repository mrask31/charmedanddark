/**
 * Promotion Engine — Core Logic
 *
 * Handles promotion lookup, product matching, and price computation.
 * All functions are safe to call when the engine is disabled — they return null/empty.
 *
 * This module is server-side only (uses Supabase service client for admin queries
 * and anon client for public queries).
 */

import { supabase } from '@/lib/supabase/client';
import { PROMOTION_ENGINE_ENABLED } from './config';

// ─── In-memory cache ─────────────────────────────────────────────────────────
let _activePromotionsCache = null;
let _cacheTimestamp = 0;
const CACHE_TTL_MS = 60_000; // 60 seconds

function isCacheValid() {
  return _activePromotionsCache !== null && (Date.now() - _cacheTimestamp) < CACHE_TTL_MS;
}

function setCache(data) {
  _activePromotionsCache = data;
  _cacheTimestamp = Date.now();
}

/** Clear cache (called by admin API after CRUD operations) */
export function invalidatePromotionCache() {
  _activePromotionsCache = null;
  _cacheTimestamp = 0;
}

// ─── Data Fetching ───────────────────────────────────────────────────────────

/**
 * Transform a raw Supabase promotion row into the application-level Promotion shape.
 * @param {Object} row
 * @returns {import('./types').Promotion}
 */
function transformPromotion(row) {
  return {
    id: row.id,
    name: row.name,
    slug: row.slug,
    status: row.status,
    enabled: row.enabled,
    startDate: row.start_date,
    endDate: row.end_date,
    promotionType: row.promotion_type,
    percentage: row.percentage ? parseFloat(row.percentage) : null,
    fixedAmount: row.fixed_amount ? parseFloat(row.fixed_amount) : null,
    appliesTo: row.applies_to,
    excludeSanctuary: row.exclude_sanctuary,
    heroTitle: row.hero_title,
    heroSubtitle: row.hero_subtitle,
    heroCtaText: row.hero_cta_text || 'Shop the Sale',
    heroCtaUrl: row.hero_cta_url || '/sale',
    accentColor: row.accent_color || '#c9a96e',
    badgeText: row.badge_text,
    countdownEnabled: row.countdown_enabled,
    homepageEnabled: row.homepage_enabled,
    landingPageEnabled: row.landing_page_enabled,
    navEnabled: row.nav_enabled,
    seoTitle: row.seo_title,
    seoDescription: row.seo_description,
    ogImageUrl: row.og_image_url,
    shopifyDiscountId: row.shopify_discount_id,
    // Targeting arrays — populated separately
    productIds: [],
    excludedProductIds: [],
    collections: [],
    tags: [],
    productOverrides: {},
  };
}

/**
 * Fetch all currently active promotions with their targeting data.
 * Results are cached in-memory for 60 seconds.
 *
 * @param {Object} [opts]
 * @param {boolean} [opts.ignoreStatus] - If true, fetch regardless of status (for preview mode)
 * @param {string} [opts.slug] - If set, filter to a specific promotion slug
 * @returns {Promise<import('./types').Promotion[]>}
 */
export async function getActivePromotions(opts = {}) {
  if (!PROMOTION_ENGINE_ENABLED && !opts.ignoreStatus) {
    return [];
  }

  // Return cache if valid (unless previewing)
  if (!opts.ignoreStatus && !opts.slug && isCacheValid()) {
    return _activePromotionsCache;
  }

  try {
    let query = supabase
      .from('promotions')
      .select('*');

    if (opts.slug) {
      query = query.eq('slug', opts.slug);
    }

    if (!opts.ignoreStatus) {
      query = query
        .eq('enabled', true)
        .eq('status', 'active');
    }

    const { data: promotions, error } = await query.order('created_at', { ascending: false });

    if (error || !promotions?.length) {
      if (!opts.ignoreStatus && !opts.slug) setCache([]);
      return [];
    }

    // Fetch targeting data for all promotions in parallel
    const promoIds = promotions.map((p) => p.id);

    const [productsRes, collectionsRes, tagsRes] = await Promise.all([
      supabase
        .from('promotion_products')
        .select('promotion_id, product_id, excluded, override_percentage, override_fixed')
        .in('promotion_id', promoIds),
      supabase
        .from('promotion_collections')
        .select('promotion_id, collection')
        .in('promotion_id', promoIds),
      supabase
        .from('promotion_tags')
        .select('promotion_id, tag')
        .in('promotion_id', promoIds),
    ]);

    // Build lookup maps
    const productsByPromo = {};
    const excludedByPromo = {};
    const overridesByPromo = {};
    for (const row of (productsRes.data || [])) {
      if (!productsByPromo[row.promotion_id]) {
        productsByPromo[row.promotion_id] = [];
        excludedByPromo[row.promotion_id] = [];
        overridesByPromo[row.promotion_id] = {};
      }
      if (row.excluded) {
        excludedByPromo[row.promotion_id].push(row.product_id);
      } else {
        productsByPromo[row.promotion_id].push(row.product_id);
        if (row.override_percentage || row.override_fixed) {
          overridesByPromo[row.promotion_id][row.product_id] = {
            percentage: row.override_percentage ? parseFloat(row.override_percentage) : undefined,
            fixedAmount: row.override_fixed ? parseFloat(row.override_fixed) : undefined,
          };
        }
      }
    }

    const collectionsByPromo = {};
    for (const row of (collectionsRes.data || [])) {
      if (!collectionsByPromo[row.promotion_id]) collectionsByPromo[row.promotion_id] = [];
      collectionsByPromo[row.promotion_id].push(row.collection);
    }

    const tagsByPromo = {};
    for (const row of (tagsRes.data || [])) {
      if (!tagsByPromo[row.promotion_id]) tagsByPromo[row.promotion_id] = [];
      tagsByPromo[row.promotion_id].push(row.tag);
    }

    // Assemble full Promotion objects
    const result = promotions.map((row) => {
      const promo = transformPromotion(row);
      promo.productIds = productsByPromo[row.id] || [];
      promo.excludedProductIds = excludedByPromo[row.id] || [];
      promo.collections = collectionsByPromo[row.id] || [];
      promo.tags = tagsByPromo[row.id] || [];
      promo.productOverrides = overridesByPromo[row.id] || {};
      return promo;
    });

    // Cache (only for non-preview, non-slug queries)
    if (!opts.ignoreStatus && !opts.slug) {
      setCache(result);
    }

    return result;
  } catch (err) {
    console.error('[PromotionEngine] Failed to fetch active promotions:', err);
    return [];
  }
}

// ─── Product Matching ────────────────────────────────────────────────────────

/**
 * Determine if a product matches a given promotion's targeting rules.
 *
 * @param {import('./types').Promotion} promotion
 * @param {Object} product - { id, category, collection, tags }
 * @returns {boolean}
 */
function productMatchesPromotion(promotion, product) {
  // Check exclusion first
  if (promotion.excludedProductIds.includes(product.id)) {
    return false;
  }

  switch (promotion.appliesTo) {
    case 'all':
      return true;

    case 'specific':
      return promotion.productIds.includes(product.id);

    case 'collection':
      return (
        promotion.collections.includes(product.category) ||
        promotion.collections.includes(product.collection)
      );

    case 'tag': {
      const productTags = (product.tags || []).map((t) => t.toLowerCase());
      return promotion.tags.some((t) => productTags.includes(t.toLowerCase()));
    }

    default:
      return false;
  }
}

/**
 * Find the best matching active promotion for a given product.
 *
 * Priority: specific product match > collection match > tag match > applies_to='all'
 *
 * @param {Object} product - { id, category, collection, tags }
 * @param {import('./types').Promotion[]} [promotions] - Pre-fetched promotions (avoids re-query)
 * @returns {Promise<import('./types').Promotion|null>}
 */
export async function getPromotionForProduct(product, promotions) {
  if (!PROMOTION_ENGINE_ENABLED) return null;

  const activePromos = promotions || await getActivePromotions();
  if (!activePromos.length) return null;

  // Priority ordering: specific > collection > tag > all
  const priorityOrder = ['specific', 'collection', 'tag', 'all'];

  let bestMatch = null;
  let bestPriority = priorityOrder.length;

  for (const promo of activePromos) {
    if (!productMatchesPromotion(promo, product)) continue;

    const priority = priorityOrder.indexOf(promo.appliesTo);
    if (priority < bestPriority) {
      bestMatch = promo;
      bestPriority = priority;
    }
  }

  return bestMatch;
}

// ─── Pricing Computation ─────────────────────────────────────────────────────

/**
 * Compute the promotional pricing for a product.
 *
 * @param {number} basePrice - The product's original price
 * @param {import('./types').Promotion} promotion - The matched promotion
 * @param {string} [productId] - Product ID for per-product override lookup
 * @returns {import('./types').PromotionPricing}
 */
export function computePromotionPrice(basePrice, promotion, productId) {
  if (!promotion || !basePrice || basePrice <= 0) {
    return null;
  }

  // Check for per-product override
  const override = productId ? promotion.productOverrides[productId] : null;
  const effectivePercentage = override?.percentage ?? promotion.percentage;
  const effectiveFixed = override?.fixedAmount ?? promotion.fixedAmount;

  let displayPrice;
  let savings;
  let percentage;

  if (promotion.promotionType === 'percentage' && effectivePercentage) {
    percentage = effectivePercentage;
    savings = +(basePrice * (percentage / 100)).toFixed(2);
    displayPrice = +(basePrice - savings).toFixed(2);
  } else if (promotion.promotionType === 'fixed_amount' && effectiveFixed) {
    savings = Math.min(effectiveFixed, basePrice); // Can't save more than the price
    displayPrice = +(basePrice - savings).toFixed(2);
    percentage = +((savings / basePrice) * 100).toFixed(1);
  } else {
    return null;
  }

  // Safety: ensure display price is never negative
  if (displayPrice < 0) displayPrice = 0;

  return {
    basePrice,
    displayPrice,
    savings,
    percentage,
    badgeText: promotion.badgeText,
    promotionName: promotion.name,
    promotionSlug: promotion.slug,
    endsAt: promotion.endDate,
    countdownEnabled: promotion.countdownEnabled,
  };
}

// ─── Convenience Helpers ─────────────────────────────────────────────────────

/**
 * Quick check: is a product currently on sale?
 *
 * @param {Object} product - { id, category, collection, tags }
 * @param {import('./types').Promotion[]} [promotions] - Pre-fetched promotions
 * @returns {Promise<boolean>}
 */
export async function isProductOnSale(product, promotions) {
  if (!PROMOTION_ENGINE_ENABLED) return false;
  const promo = await getPromotionForProduct(product, promotions);
  return promo !== null;
}

/**
 * Get a promotion by slug (for /sale/[slug] pages or preview mode).
 *
 * @param {string} slug
 * @param {Object} [opts]
 * @param {boolean} [opts.ignoreStatus] - If true, return regardless of status
 * @returns {Promise<import('./types').Promotion|null>}
 */
export async function getPromotionBySlug(slug, opts = {}) {
  const results = await getActivePromotions({ slug, ignoreStatus: opts.ignoreStatus });
  return results[0] || null;
}

/**
 * Get all products that are on sale across all active promotions.
 * Used by the /sale page and "On Sale" filter.
 *
 * @param {Object[]} allProducts - Full product list from getProducts()
 * @param {import('./types').Promotion[]} [promotions] - Pre-fetched promotions
 * @returns {Promise<Array<{product: Object, pricing: import('./types').PromotionPricing}>>}
 */
export async function getSaleProducts(allProducts, promotions) {
  if (!PROMOTION_ENGINE_ENABLED) return [];

  const activePromos = promotions || await getActivePromotions();
  if (!activePromos.length) return [];

  const results = [];

  for (const product of allProducts) {
    const promo = await getPromotionForProduct(product, activePromos);
    if (!promo) continue;

    const pricing = computePromotionPrice(product.price, promo, product.id);
    if (!pricing) continue;

    results.push({ product, pricing });
  }

  return results;
}

/**
 * Get the homepage promotion hero (if any promotion has homepage_enabled=true).
 *
 * @returns {Promise<import('./types').Promotion|null>}
 */
export async function getHomepagePromotion() {
  if (!PROMOTION_ENGINE_ENABLED) return null;

  const promos = await getActivePromotions();
  return promos.find((p) => p.homepageEnabled) || null;
}

/**
 * Check if there's an active promotion with nav_enabled for showing the SALE nav item.
 *
 * @returns {Promise<import('./types').Promotion|null>}
 */
export async function getNavPromotion() {
  if (!PROMOTION_ENGINE_ENABLED) return null;

  const promos = await getActivePromotions();
  return promos.find((p) => p.navEnabled) || null;
}
