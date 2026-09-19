const SITE_URL = 'https://www.charmedanddark.com';

const csv = (value) => `"${String(value).replaceAll('"', '""')}"`;

/** Pinterest's country-feed template uses `override`, not `countryCode`.
 * IDs must match the Shopify integration's numeric variant IDs exactly.
 * Only published Storefront products are supplied; this cannot create items.
 */
export function buildPinterestCountryFeed(products) {
  const rows = [['id', 'override', 'price', 'sale_price', 'availability', 'link']];
  const ids = new Set();
  for (const product of products) {
    const handle = product.handle;
    if (!handle || !product.shopifyVariants?.variants?.length) {
      throw new Error('Incomplete Pinterest catalog product');
    }
    for (const variant of product.shopifyVariants.variants) {
      const id = String(variant.shopifyVariantId || '').match(/^gid:\/\/shopify\/ProductVariant\/(\d+)$/)?.[1];
      const price = variant.price;
      const currency = variant.currencyCode;
      if (!id || ids.has(id) || !Number.isFinite(price) || price < 0 || currency !== 'USD'
        || typeof variant.availableForSale !== 'boolean') {
        throw new Error('Invalid Pinterest catalog variant');
      }
      ids.add(id);
      const compareAt = variant.compareAtPrice;
      const onSale = Number.isFinite(compareAt) && compareAt > price;
      const link = new URL(`/shop/${encodeURIComponent(handle)}`, SITE_URL);
      link.searchParams.set('variant', id);
      link.searchParams.set('utm_source', 'Pinterest');
      link.searchParams.set('utm_medium', 'organic');
      rows.push([id, 'US', `${(onSale ? compareAt : price).toFixed(2)} USD`,
        onSale ? `${price.toFixed(2)} USD` : '',
        variant.availableForSale ? 'in stock' : 'out of stock', link.href]);
    }
  }
  if (!ids.size) throw new Error('Empty Pinterest catalog');
  return rows.map(row => row.map(csv).join(',')).join('\r\n') + '\r\n';
}
