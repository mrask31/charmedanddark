/**
 * Inventory Quantity Utility
 *
 * Provides helpers to check available inventory and determine if a requested
 * quantity can be fulfilled. Works with both Supabase product.qty and Shopify
 * variant quantityAvailable fields.
 *
 * POD (print-on-demand) products use qty=999 in Supabase and should not be
 * inventory-capped. Only cap when inventory is a meaningful finite number.
 */

// Threshold above which we treat inventory as "unlimited" (POD/made-to-order)
const UNLIMITED_THRESHOLD = 900;

/**
 * Get available inventory for a product or variant.
 * Returns null if inventory tracking is not applicable (POD/unlimited).
 *
 * @param {object} opts
 * @param {number} opts.productQty - product.qty from Supabase
 * @param {number|null} opts.variantQuantityAvailable - Shopify variant quantityAvailable
 * @returns {number|null} Available quantity, or null if unlimited/not tracked
 */
export function getAvailableInventory({ productQty, variantQuantityAvailable }) {
  // If Shopify variant has specific inventory, use that (unless it's a POD marker)
  if (variantQuantityAvailable != null && variantQuantityAvailable < UNLIMITED_THRESHOLD) {
    return Math.max(0, variantQuantityAvailable);
  }

  // Fall back to Supabase product-level qty
  if (productQty != null && productQty < UNLIMITED_THRESHOLD) {
    return Math.max(0, productQty);
  }

  // Unlimited / POD — don't cap
  return null;
}

/**
 * Calculate how many units can actually be added given inventory constraints.
 *
 * @param {object} opts
 * @param {number} opts.requested - Quantity user wants to add
 * @param {number} opts.alreadyInCart - Quantity already in cart for this item
 * @param {number|null} opts.available - Available inventory (null = unlimited)
 * @returns {{ canAdd: number, limited: boolean, reason: string|null }}
 */
export function calculateAddableQuantity({ requested, alreadyInCart, available }) {
  // No inventory tracking — allow all
  if (available === null || available === undefined) {
    return { canAdd: requested, limited: false, reason: null };
  }

  // Sold out
  if (available <= 0) {
    return { canAdd: 0, limited: true, reason: 'sold_out' };
  }

  const remaining = available - alreadyInCart;

  // Already at max
  if (remaining <= 0) {
    return { canAdd: 0, limited: true, reason: 'at_limit' };
  }

  // Can partially fulfill
  if (requested > remaining) {
    return { canAdd: remaining, limited: true, reason: 'partial' };
  }

  // Full request can be fulfilled
  return { canAdd: requested, limited: false, reason: null };
}
