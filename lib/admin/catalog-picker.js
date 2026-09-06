// Campaign product_id remains a legacy UUID foreign key. Commercial fields are
// taken exclusively from the live product; historical UUID aliases only label
// saved selections and are never offered as duplicate new targets.
export function getLegacyCampaignPickerProducts(products) {
  return products.flatMap((product) => (product.legacyIds || []).map((id) => ({
    id,
    shopifyId: product.id,
    legacyAlias: id !== product.legacyId,
    name: product.name || product.title,
    slug: product.handle || product.slug,
    category: product.category,
    price: product.price == null ? null : Number(product.price),
    currencyCode: product.currencyCode || 'USD',
    imageUrl: product.imageUrls?.[0] || null,
    isAvailable: product.availableForSale === true,
  }))).sort((a, b) => a.name.localeCompare(b.name) || a.id.localeCompare(b.id));
}
