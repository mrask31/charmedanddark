/**
 * Inventory Quantity Utility
 *
 * Provides helpers to check available inventory and determine if a requested
 * quantity can be fulfilled. Works with both Supabase product.qty and Shopify
 * variant quantityAvailable fields.
 *
 * POD (print-on-demand) products use qty=999 in Supabase and should not be
 * inventory-capped. Only cap when inventory is a meaningful finite number.
 *
 * Inventory data flow:
 *   - sync-products sets qty=999 for vendors "Printify" and "Charmed & Dark"
 *   - sync-products sets qty=totalInventory for all other vendors
 *   - Currently 0 products have qty=null in the database
 *   - If qty is null AND variantQuantityAvailable is null, we return null
 *     (no cap applied client-side, Shopify is the final arbiter at checkout)
 */

// Threshold above which we treat inventory as "unlimited" (POD/made-to-order)
// Origin: sync-products/route.js sets qty=999 for Printify / "Charmed & Dark" vendors
const UNLIMITED_THRESHOLD = 900;

/**
 * Get available inventory for a product or variant.
 * Returns null if inventory tracking is not applicable (POD/unlimited)
 * or if no inventory data is available (Shopify will enforce at checkout).
 *
 * @param {object} opts
 * @param {number|null|undefined} opts.productQty - product.qty from Supabase
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

  // Known unlimited: qty >= 900 (POD/made-to-order, set by sync pipeline)
  // Unknown: qty is null/undefined AND no Shopify data available
  //   → return null (no client-side cap; Shopify Storefront API enforces at checkout)
  //   → client-side quantity selector still hard-caps at 10 as a UX safeguard
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
