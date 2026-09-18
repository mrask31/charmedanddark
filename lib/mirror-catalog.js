// Product facts always come from the verified candidate list. The language model
// can select an ID and explain it; it cannot invent a product, price or URL.
export function getMirrorCandidates(products, { shopifyCatalogEnabled = false, limit = 250, mood = '' } = {}) {
  const seen = new Set();
  let candidates = (Array.isArray(products) ? products : []).filter((product) => {
    const id = product.shopify_id || product.id;
    const handle = product.handle || product.slug;
    const available = shopifyCatalogEnabled
      ? product.availableForSale === true
      : product.availableForSale ?? Number(product.qty) > 0;
    if (typeof id !== 'string' || !/^gid:\/\/shopify\/Product\/\d+$/.test(id)
      || product.hidden === true || typeof handle !== 'string' || !handle || !available || seen.has(id)) return false;
    seen.add(id);
    return true;
  }).map((product) => ({
    id: product.shopify_id || product.id,
    title: product.name || product.title,
    handle: product.handle || product.slug,
    price: product.salePrice ?? product.price,
    currencyCode: product.currencyCode || 'USD',
    priceVaries: Number(product.priceRange?.max) > Number(product.priceRange?.min),
    category: product.category || '',
    description: String(product.description || '').replace(/<[^>]*>/g, ' ').slice(0, 600),
    tags: Array.isArray(product.tags) ? product.tags : [],
  }));
  const normalized = String(mood).toLowerCase().slice(0, 300);
  const identity = (p) => `${p.title} ${p.handle} ${p.tags.join(' ')}`.toLowerCase();
  const isSGG = (p) => /smutty[ -]good[ -]girl|\bsgg\b|s\.g\.g\./i.test(identity(p));
  const excludesSGG = /\b(?:not|no|without|avoid)\s+(?:anything\s+)?(?:sexy|spicy|smut\w*|s\.?g\.?g\.?|sexual\w*)/i.test(normalized);
  const wantsSGG = !excludesSGG && /\b(?:sexy|spicy|smut\w*|erotica|booktok|sgg)\b|s\.g\.g\./i.test(normalized);
  if (excludesSGG) candidates = candidates.filter((p) => !isSGG(p));
  // Explicit product requests take precedence over a general mood.
  const types = [
    [/\b(?:outfit|clothes|clothing|apparel|shirt|tee|hoodie)\b/, /\b(?:shirt|tee|hoodie|dress|apparel|clothing|top|skirt)\b/],
    [/\bcandles?\b/, /\bcandle\b/],
    [/\b(?:mugs?|cups?)\b/, /\b(?:mug|cup)\b/],
    [/\b(?:totes?|bags?)\b/, /\b(?:tote|bag)\b/],
    [/\bblankets?\b/, /\b(?:blanket|throw)\b/],
    [/\b(?:journals?|notebooks?)\b/, /\b(?:journal|notebook)\b/],
  ];
  const requestedTypes = types.filter(([request]) => request.test(normalized));
  if (requestedTypes.length) {
    candidates = candidates.filter((p) => requestedTypes.some(([, match]) => match.test(`${identity(p)} ${p.category}`)));
  }
  const sgg = candidates.filter(isSGG);
  if (wantsSGG && sgg.length) candidates = sgg;
  return candidates.slice(0, limit);
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
