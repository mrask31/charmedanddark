// Mirrors the native Shopify profiles configured on September 16, 2026.
// This is a storefront estimate only; Shopify checkout calculates the charge.
const HEAVY_PRODUCTS = new Set(['8247948640290', '8247950475298', '8247950245922', '8247950278690']);
const HEAVY_VARIANTS = new Set(['44860266676258', '44860269035554', '44860268707874', '44860268740642', '44860268773410', '44860268806178']);
export const HEAVY_SHIPPING = 39.99;
const numericId = id => String(id || '').split('/').pop();

export function isHeavyShippingProduct(product) {
  return HEAVY_PRODUCTS.has(numericId(product?.shopify_id || product?.shopifyId || product?.id));
}

export function heavyShippingEstimate(cart) {
  if (!cart || cart.currency !== 'USD' || !cart.items?.length) return null;
  const heavy = cart.items.filter(item => HEAVY_VARIANTS.has(numericId(item.shopifyVariantId)));
  if (!heavy.length) return null;
  const hasRegularItems = heavy.length < cart.items.length;
  // Discount thresholds are confirmed by Shopify. Avoid promising a tier when
  // cart or line discounts could change the qualifying merchandise subtotal.
  const hasDiscounts = Boolean(cart.discounts?.length || cart.items.some(item => item.discounts?.length));
  const subtotal = Number(cart.subtotal);
  const standard = !hasRegularItems ? 0 : hasDiscounts || !Number.isFinite(subtotal) || subtotal < 0
    ? null : subtotal < 50 ? 9.95 : subtotal < 100 ? 14.95 : 19.95;
  return { hasRegularItems, standard, heavy: HEAVY_SHIPPING };
}
