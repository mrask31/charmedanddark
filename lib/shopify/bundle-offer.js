/** Display metadata owned in Shopify. Checkout discount allocations are authoritative. */
export function readBundleOffer(metafield, basePrice, currency, variantCount) {
  if (!metafield || variantCount !== 1) return null;
  try {
    const offer = JSON.parse(metafield.value);
    const regular = Number(offer.regularPrice);
    const saving = Number(offer.discountAmount);
    if (offer.version !== 1 || offer.currency !== currency || currency !== 'USD'
      || !Number.isFinite(regular) || !Number.isFinite(saving) || saving <= 0 || saving >= regular
      || Math.round(regular * 100) !== Math.round(basePrice * 100)
      || !/^gid:\/\/shopify\/DiscountAutomaticNode\/\d+$/.test(offer.discountId)
      || !Array.isArray(offer.components) || offer.components.length !== 3
      || !offer.components.every(item => typeof item.label === 'string' && item.label.length > 0)) return null;
    return { ...offer, regularPrice: regular, discountAmount: saving, price: (Math.round(regular * 100) - Math.round(saving * 100)) / 100 };
  } catch { return null; }
}
