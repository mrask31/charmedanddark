/** Shared presentation only; Shopify remains the commerce authority. */
export function productIsAvailable(product) {
  return typeof product.availableForSale === 'boolean'
    ? product.availableForSale
    : Number(product.qty) > 0;
}

export function productPricing(product) {
  const price = Number(product.price) || 0;
  const compareAt = Number(product.compareAtPrice ?? product.originalPrice) || 0;
  const legacySale = product.salePrice == null ? null : Number(product.salePrice);
  const publicPrice = product.commerceSource !== 'shopify' && legacySale != null && legacySale >= 0 && legacySale < price ? legacySale : price;
  const originalPrice = Math.max(compareAt, price);
  const isOnSale = originalPrice > publicPrice;
  return {
    publicPrice,
    originalPrice,
    isOnSale,
    salePercentage: isOnSale ? Math.round((1 - publicPrice / originalPrice) * 100) : null,
  };
}

export function formatProductPrice(value, currency = 'USD') {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(Number(value));
}

export function productInCollection(product, handle) {
  return (product.collections || []).some((collection) =>
    (typeof collection === 'string' ? collection : collection.handle) === handle
  );
}

export function productBrand(product) {
  const vendor = String(product.vendor || '').trim();
  // Provider vendor labels identify fulfillment, not the brand on our POD goods.
  return !vendor || ['printify', 'printful'].includes(vendor.toLowerCase()) ? 'Charmed & Dark' : vendor;
}
