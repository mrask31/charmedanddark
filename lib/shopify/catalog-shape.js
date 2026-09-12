/** Pure Shopify-to-UI mapping. No copied commerce fields enter this module. */
export function connectionNodes(connection) {
  return connection?.edges?.map(({ node }) => node) || connection?.nodes || [];
}

export function mapShopifyVariant(variant) {
  return {
    id: variant.id,
    shopifyVariantId: variant.id,
    title: variant.title,
    sku: variant.sku || null,
    available: variant.availableForSale === true,
    availableForSale: variant.availableForSale === true,
    // Zero can still be sellable when inventory is untracked or overselling is allowed.
    quantityAvailable: variant.quantityAvailable ?? null,
    selectedOptions: variant.selectedOptions || [],
    price: Number(variant.price.amount),
    compareAtPrice: variant.compareAtPrice ? Number(variant.compareAtPrice.amount) : null,
    currency: variant.price.currencyCode,
    currencyCode: variant.price.currencyCode,
    imageUrl: variant.image?.url || null,
    imageAlt: variant.image?.altText || null,
  };
}

export function mapShopifyOptions(options = []) {
  return options
    .map((option) => ({ name: option.name, values: option.optionValues?.map((value) => value.name) || option.values || [] }))
    .filter((option) => !(option.name === 'Title' && option.values.length === 1 && option.values[0] === 'Default Title'))
    .map(({ name, values }) => ({ name, values }));
}

export function mapShopifyProduct(product) {
  const variants = connectionNodes(product.variants).map(mapShopifyVariant);
  const options = mapShopifyOptions(product.options);
  const images = connectionNodes(product.images);
  const collections = connectionNodes(product.collections);
  const price = Number(product.priceRange.minVariantPrice.amount);
  const lowestVariant = variants.find((variant) => variant.price === price);
  const compareAtPrice = lowestVariant?.compareAtPrice > price ? lowestVariant.compareAtPrice : null;
  const quantities = variants.map((variant) => variant.quantityAvailable);
  const categoryTag = (product.tags || []).find((tag) => /^category:\s*\S/i.test(tag));
  const collectionHandles = collections.map((collection) => collection.handle);
  const currencyCode = product.priceRange.minVariantPrice.currencyCode;
  const imageUrls = images.map((image) => image.url);
  return {
    id: product.id,
    shopify_id: product.id,
    commerceSource: 'shopify',
    name: product.title,
    title: product.title,
    slug: product.handle,
    handle: product.handle,
    shopify_handle: product.handle,
    description: product.description,
    descriptionHtml: product.descriptionHtml,
    lore: product.description,
    category: categoryTag?.slice(categoryTag.indexOf(':') + 1).trim() || product.productType || 'Other',
    subcategory: null,
    productType: product.productType || null,
    vendor: product.vendor,
    tags: product.tags || [],
    collections,
    collection: collections[0]?.handle || null,
    price,
    priceRange: {
      min: price,
      max: Number(product.priceRange.maxVariantPrice.amount),
      currencyCode,
    },
    compareAtPrice,
    originalPrice: compareAtPrice || price,
    salePrice: compareAtPrice ? price : null,
    currency: currencyCode,
    currencyCode,
    availableForSale: product.availableForSale === true,
    is_available: product.availableForSale === true,
    hidden: false,
    qty: quantities.length && quantities.every((value) => value !== null)
      ? quantities.reduce((sum, value) => sum + value, 0) : null,
    sku: lowestVariant?.sku || variants[0]?.sku || null,
    shopifyVariantId: variants[0]?.shopifyVariantId || null,
    shopifyVariants: { options, variants },
    productVariants: [],
    isVariantParent: options.length > 0,
    hasShopifyOptions: options.length > 0,
    variantSummary: options.filter((option) => option.values.length > 1)
      .map((option) => ({ type: option.name.toLowerCase(), count: option.values.length })),
    imageUrls,
    image_url: imageUrls[0] || null,
    image_urls: imageUrls,
    imageDetails: images,
    featured: collectionHandles.includes('frontpage') || collectionHandles.includes('featured'),
    bestSeller: collectionHandles.includes('homepage-best-sellers'),
    badge: null,
    metaTitle: product.seo?.title || null,
    metaDescription: product.seo?.description || null,
    createdAt: product.createdAt,
    updatedAt: product.updatedAt,
  };
}

export function attachCatalogIdentity(product, identities = []) {
  const matches = identities.filter((row) => row.shopify_id === product.id).sort((a, b) => {
    const isCurrent = (row) => [row.shopify_handle, row.handle, row.slug].includes(product.handle);
    return Number(isCurrent(b)) - Number(isCurrent(a)) || a.id.localeCompare(b.id);
  });
  return {
    ...product,
    legacyId: matches[0]?.id || null,
    legacyIds: matches.map((row) => row.id),
    aliases: [...new Set([product.handle, ...matches.flatMap((row) => [row.slug, row.handle, row.shopify_handle])].filter(Boolean))],
  };
}

export function resolveCatalogReferences(products, references) {
  const lookup = new Map();
  const aliases = new Map();
  for (const product of products) {
    lookup.set(product.id, product);
    lookup.set(product.handle, product);
    for (const id of product.legacyIds || []) lookup.set(id, product);
    for (const alias of product.aliases || []) {
      if (!aliases.has(alias)) aliases.set(alias, new Map());
      aliases.get(alias).set(product.id, product);
    }
  }
  // Current handles win; ambiguous historical aliases never select an arbitrary item.
  for (const [alias, candidates] of aliases) {
    if (!lookup.has(alias) && candidates.size === 1) lookup.set(alias, candidates.values().next().value);
  }
  const results = references.map((reference) => lookup.get(reference)).filter(Boolean);
  return [...new Map(results.map((product) => [product.id, product])).values()];
}
