/** Shopify sellability is authoritative; quantity alone cannot establish a cap.
 * Zero can be sellable with untracked inventory or continue-selling policies.
 * Provider-managed quantities (including 9999) must never be reinterpreted.
 */
export function getAvailableInventory({ availableForSale, inventoryPolicy, inventoryTracked, variantQuantityAvailable } = {}) {
  if (availableForSale === false) return 0;
  if (inventoryTracked === true && inventoryPolicy === 'DENY' && Number.isInteger(variantQuantityAvailable)) {
    return Math.max(0, variantQuantityAvailable);
  }
  return null;
}

export function calculateAddableQuantity({ requested, alreadyInCart = 0, available }) {
  if (!Number.isInteger(requested) || requested < 1) return { canAdd: 0, limited: true, reason: 'invalid' };
  if (available == null) return { canAdd: requested, limited: false, reason: null };
  if (available <= 0) return { canAdd: 0, limited: true, reason: 'sold_out' };
  const remaining = available - alreadyInCart;
  if (remaining <= 0) return { canAdd: 0, limited: true, reason: 'at_limit' };
  if (requested > remaining) return { canAdd: remaining, limited: true, reason: 'partial' };
  return { canAdd: requested, limited: false, reason: null };
}
