/**
 * Promotion Engine — Product Enrichment
 *
 * Injects promotion pricing into product objects after they've been transformed.
 * This is the bridge between the promotion engine and the storefront display layer.
 *
 * Usage:
 *   const products = await getProducts();
 *   const enriched = await enrichProductsWithPromotions(products);
 *
 * When PROMOTION_ENGINE_ENABLED=false, returns products unchanged.
 */

import { PROMOTION_ENGINE_ENABLED } from './config';
import { getActivePromotions, getPromotionForProduct, computePromotionPrice } from './engine';

/**
 * Enrich a list of products with promotion pricing data.
 * Mutates nothing — returns a new array with enriched product objects.
 *
 * @param {Object[]} products - Transformed product objects from lib/products.js
 * @returns {Promise<Object[]>} Products with salePrice, saleSavings, saleBadge, etc. injected
 */
export async function enrichProductsWithPromotions(products) {
  if (!PROMOTION_ENGINE_ENABLED || !products?.length) {
    return products;
  }

  // Fetch active promotions once for the entire batch
  const activePromotions = await getActivePromotions();
  if (!activePromotions.length) {
    return products;
  }

  return products.map((product) => {
    const promo = getPromotionForProductSync(product, activePromotions);
    if (!promo) return product;

    const pricing = computePromotionPrice(product.price, promo, product.id);
    if (!pricing) return product;

    // Return new object with promotion pricing injected
    return {
      ...product,
      salePrice: pricing.displayPrice,
      saleSavings: pricing.savings,
      salePercentage: pricing.percentage,
      saleBadge: pricing.badgeText,
      saleEndsAt: pricing.endsAt,
      promotionSlug: pricing.promotionSlug,
      promotionName: pricing.promotionName,
      saleCountdownEnabled: pricing.countdownEnabled,
    };
  });
}

/**
 * Enrich a single product with promotion pricing.
 * Used on product detail pages where only one product is loaded.
 *
 * @param {Object} product - Transformed product object
 * @returns {Promise<Object>} Product with promotion pricing injected (or unchanged)
 */
export async function enrichProductWithPromotion(product) {
  if (!PROMOTION_ENGINE_ENABLED || !product) {
    return product;
  }

  const activePromotions = await getActivePromotions();
  if (!activePromotions.length) return product;

  const promo = getPromotionForProductSync(product, activePromotions);
  if (!promo) return product;

  const pricing = computePromotionPrice(product.price, promo, product.id);
  if (!pricing) return product;

  return {
    ...product,
    salePrice: pricing.displayPrice,
    saleSavings: pricing.savings,
    salePercentage: pricing.percentage,
    saleBadge: pricing.badgeText,
    saleEndsAt: pricing.endsAt,
    promotionSlug: pricing.promotionSlug,
    promotionName: pricing.promotionName,
    saleCountdownEnabled: pricing.countdownEnabled,
  };
}

/**
 * Synchronous product-to-promotion matching (used within map operations).
 * Requires pre-fetched promotions array.
 */
function getPromotionForProductSync(product, activePromotions) {
  const priorityOrder = ['specific', 'collection', 'tag', 'all'];
  let bestMatch = null;
  let bestPriority = priorityOrder.length;

  for (const promo of activePromotions) {
    if (!productMatchesPromotion(promo, product)) continue;

    const priority = priorityOrder.indexOf(promo.appliesTo);
    if (priority < bestPriority) {
      bestMatch = promo;
      bestPriority = priority;
    }
  }

  return bestMatch;
}

function productMatchesPromotion(promotion, product) {
  if (promotion.excludedProductIds?.includes(product.id)) return false;

  switch (promotion.appliesTo) {
    case 'all':
      return true;
    case 'specific':
      return promotion.productIds?.includes(product.id);
    case 'collection':
      return (
        promotion.collections?.includes(product.category) ||
        promotion.collections?.includes(product.collection)
      );
    case 'tag': {
      const productTags = (product.tags || []).map((t) => t.toLowerCase());
      return promotion.tags?.some((t) => productTags.includes(t.toLowerCase()));
    }
    default:
      return false;
  }
}
