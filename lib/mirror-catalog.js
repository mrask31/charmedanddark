// Product facts always come from the verified candidate list. The language model
// can select an ID and explain it; it cannot invent a product, price or URL.
export function getMirrorCandidates(products, { shopifyCatalogEnabled = false, limit = 250 } = {}) {
  const seen = new Set();
  return (Array.isArray(products) ? products : []).filter((product) => {
    const id = product.shopify_id || product.id;
    const handle = product.handle || product.slug;
    const available = shopifyCatalogEnabled
      ? product.availableForSale === true
      : product.availableForSale ?? Number(product.qty) > 0;
    if (typeof id !== 'string' || !/^gid:\/\/shopify\/Product\/\d+$/.test(id)
      || typeof handle !== 'string' || !handle || !available || seen.has(id)) return false;
    seen.add(id);
    return true;
  }).slice(0, limit).map((product) => ({
    id: product.shopify_id || product.id,
    title: product.name || product.title,
    handle: product.handle || product.slug,
    price: product.salePrice ?? product.price,
    currencyCode: product.currencyCode || 'USD',
    priceVaries: Number(product.priceRange?.max) > Number(product.priceRange?.min),
    category: product.category || '',
  }));
}

export function resolveMirrorRecommendations(recommendations, candidates, limit = 1) {
  if (!Array.isArray(recommendations)) return [];
  const allowed = new Map(candidates.map((product) => [product.id, product]));
  const seen = new Set();
  const resolved = [];
  for (const recommendation of recommendations) {
    const product = allowed.get(recommendation?.id);
    if (!product || seen.has(product.id)) continue;
    seen.add(product.id);
    resolved.push({
      ...product,
      reason: typeof recommendation.reason === 'string' ? recommendation.reason.slice(0, 300) : '',
    });
    if (resolved.length >= limit) break;
  }
  return resolved;
}
