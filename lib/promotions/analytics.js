/**
 * Promotion Engine — Analytics Integration (PostHog)
 *
 * Provides helper functions for tracking promotion events.
 * All events are additive — they do not interfere with existing analytics.
 *
 * Events:
 *   promotion_impression    — Promotion hero/banner viewed
 *   promotion_product_view  — Sale product card viewed (in viewport)
 *   promotion_click         — User clicked a promotion CTA or badge
 *   promotion_add_to_cart   — User added a sale-priced item to cart
 *   promotion_checkout      — User started checkout with sale items
 *   promotion_purchase      — Order completed with sale items (fired by Shopify pixel)
 *
 * All events include:
 *   promotion_name, promotion_slug, promotion_type, percentage/fixed_amount
 *
 * Usage:
 *   import { trackPromotionEvent } from '@/lib/promotions/analytics';
 *   trackPromotionEvent('promotion_click', { promotion, product });
 */

/**
 * Track a promotion-related event via PostHog.
 * Safely no-ops if PostHog is not loaded.
 *
 * @param {string} eventName - The event name (e.g. 'promotion_impression')
 * @param {Object} opts
 * @param {Object} opts.promotion - Promotion object (name, slug, type, percentage, etc.)
 * @param {Object} [opts.product] - Product object (name, slug, price, salePrice, etc.)
 * @param {Object} [opts.extra] - Additional properties to merge
 */
export function trackPromotionEvent(eventName, { promotion, product, extra } = {}) {
  if (typeof window === 'undefined') return;

  const posthog = window.posthog;
  if (!posthog?.capture) return;

  const properties = {
    // Promotion context
    promotion_name: promotion?.name || promotion?.promotionName,
    promotion_slug: promotion?.slug || promotion?.promotionSlug,
    promotion_type: promotion?.promotionType || promotion?.promotion_type,
    promotion_percentage: promotion?.percentage,
    promotion_fixed_amount: promotion?.fixedAmount || promotion?.fixed_amount,
    promotion_priority: promotion?.priority,

    // Product context (when applicable)
    ...(product && {
      product_title: product.name || product.title,
      product_handle: product.slug || product.handle,
      product_price: product.price,
      product_sale_price: product.salePrice || product.sale_price,
      product_savings: product.saleSavings,
      product_category: product.category,
    }),

    // Page context
    url: window.location.href,
    path: window.location.pathname,

    // Extra properties
    ...extra,
  };

  // Remove undefined values
  const cleaned = Object.fromEntries(
    Object.entries(properties).filter(([_, v]) => v !== undefined && v !== null)
  );

  posthog.capture(eventName, cleaned);
}

/**
 * Track promotion hero/banner impression.
 * Call when the promotion hero enters the viewport.
 */
export function trackPromotionImpression(promotion) {
  trackPromotionEvent('promotion_impression', { promotion, extra: { location: 'homepage_hero' } });
}

/**
 * Track promotion CTA click (hero button, sale page link, etc.)
 */
export function trackPromotionClick(promotion, location = 'homepage_hero') {
  trackPromotionEvent('promotion_click', { promotion, extra: { location } });
}

/**
 * Track when a sale-priced product card is viewed.
 */
export function trackPromotionProductView(promotion, product) {
  trackPromotionEvent('promotion_product_view', { promotion, product });
}

/**
 * Track when a sale-priced item is added to cart.
 * Call from the existing add_to_cart handler when product has salePrice.
 */
export function trackPromotionAddToCart(promotion, product, quantity = 1) {
  trackPromotionEvent('promotion_add_to_cart', {
    promotion,
    product,
    extra: {
      quantity,
      cart_savings: (product.saleSavings || 0) * quantity,
    },
  });
}

/**
 * Track when checkout starts with sale items in cart.
 */
export function trackPromotionCheckout(promotionItems) {
  if (!promotionItems?.length) return;
  if (typeof window === 'undefined' || !window.posthog?.capture) return;

  const totalSavings = promotionItems.reduce((sum, item) => {
    return sum + ((item.originalPrice - item.price) * item.quantity);
  }, 0);

  window.posthog.capture('promotion_checkout', {
    promotion_item_count: promotionItems.length,
    total_promotion_savings: +totalSavings.toFixed(2),
    promotion_names: [...new Set(promotionItems.map((i) => i.promotionName).filter(Boolean))],
    url: window.location.href,
  });
}
