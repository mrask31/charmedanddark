/**
 * Promotion Engine — Public API
 *
 * Re-exports all public functions from the engine.
 * Import from '@/lib/promotions' in application code.
 */

export { PROMOTION_ENGINE_ENABLED, PROMOTION_CACHE_TTL } from './config';

export {
  getActivePromotions,
  getPromotionForProduct,
  computePromotionPrice,
  isProductOnSale,
  getPromotionBySlug,
  getSaleProducts,
  getHomepagePromotion,
  getNavPromotion,
  invalidatePromotionCache,
} from './engine';

export {
  enrichProductsWithPromotions,
  enrichProductWithPromotion,
} from './enrich';

export {
  getPreviewPromotion,
  isPreviewMode,
} from './preview';
