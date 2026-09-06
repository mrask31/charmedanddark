export function getInlineProductReferences(markdown = '') {
  if (typeof markdown !== 'string') return [];
  return [...new Set(Array.from(markdown.matchAll(/\[product:([^\]]+)\]/g), (match) => match[1]))];
}

export function productMatchesReference(product, reference) {
  return [
    product.id, product.shopify_id, product.legacyId, product.slug, product.handle,
    ...(product.legacyIds || []), ...(product.aliases || []),
  ].includes(reference);
}

export function buildProductLinks(products) {
  const links = {};
  const historical = new Map();
  // A current URL always wins if another product once used that same handle.
  for (const product of products) {
    const canonical = product.handle || product.slug;
    if (!canonical) continue;
    links[canonical] = canonical;
    for (const alias of [product.slug, ...(product.aliases || [])].filter(Boolean)) {
      if (!historical.has(alias)) historical.set(alias, new Set());
      historical.get(alias).add(canonical);
    }
  }
  for (const [alias, destinations] of historical) {
    if (!Object.hasOwn(links, alias) && destinations.size === 1) links[alias] = [...destinations][0];
  }
  return links;
}
