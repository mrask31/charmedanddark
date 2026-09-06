/** Pure campaign rules shared by catalog enrichment and promotion lookups. */

export function isPromotionActive(promotion, now = Date.now()) {
  if (promotion?.enabled !== true || !['active', 'live'].includes(promotion.status)) return false;
  const start = Date.parse(promotion.startDate);
  const end = Date.parse(promotion.endDate);
  return Number.isFinite(start) && Number.isFinite(end)
    && start <= now && now < end && start < end;
}

export function publicPromotionsAt(promotions, { now = Date.now(), shopifyCatalogEnabled = false } = {}) {
  // These records only describe monetary campaigns. A stored discount ID does
  // not verify Shopify scope, dates, eligibility, or checkout enforcement.
  if (shopifyCatalogEnabled) return [];
  return (promotions || []).filter((promotion) => isPromotionActive(promotion, now));
}

function productIdentities(product) {
  if (typeof product === 'string') return [product];
  return [...new Set([
    product?.id,
    product?.shopifyProductId,
    product?.legacyId,
    ...(Array.isArray(product?.legacyIds) ? product.legacyIds : []),
  ].filter((id) => typeof id === 'string' && id))];
}

const normalize = (value) => typeof value === 'string' ? value.trim().toLowerCase() : '';

export function productMatchesPromotion(promotion, product) {
  if (!promotion || !product) return false;
  const identities = productIdentities(product);
  if (identities.some((id) => promotion.excludedProductIds?.includes(id))) return false;

  switch (promotion.appliesTo) {
    case 'all':
      return true;
    case 'specific':
      return identities.some((id) => promotion.productIds?.includes(id));
    case 'collection': {
      const collections = [
        product.category,
        product.collection,
        ...(Array.isArray(product.collectionHandles) ? product.collectionHandles : []),
        ...(Array.isArray(product.collections) ? product.collections.map((collection) =>
          typeof collection === 'string' ? collection : collection?.handle) : []),
      ].map(normalize).filter(Boolean);
      return (promotion.collections || []).some((collection) => collections.includes(normalize(collection)));
    }
    case 'tag': {
      const tags = (Array.isArray(product.tags) ? product.tags : []).map(normalize).filter(Boolean);
      return (promotion.tags || []).some((tag) => tags.includes(normalize(tag)));
    }
    default:
      return false;
  }
}

/** Legacy calculation and authenticated draft preview only; Shopify owns live prices. */
export function calculatePromotionPrice(basePrice, promotion, product) {
  const price = Number(basePrice);
  if (!promotion || !Number.isFinite(price) || price <= 0) return null;

  const overrideId = productIdentities(product).find((id) => promotion.productOverrides?.[id]);
  const override = overrideId ? promotion.productOverrides[overrideId] : null;
  const effectivePercentage = Number(override?.percentage ?? promotion.percentage);
  const effectiveFixed = Number(override?.fixedAmount ?? promotion.fixedAmount);
  let savings;
  let percentage;

  if (promotion.promotionType === 'percentage'
      && Number.isFinite(effectivePercentage) && effectivePercentage > 0 && effectivePercentage <= 100) {
    percentage = effectivePercentage;
    savings = +(price * percentage / 100).toFixed(2);
  } else if (promotion.promotionType === 'fixed_amount'
      && Number.isFinite(effectiveFixed) && effectiveFixed > 0) {
    savings = +Math.min(effectiveFixed, price).toFixed(2);
    percentage = +(savings / price * 100).toFixed(1);
  } else {
    return null;
  }

  return {
    basePrice: price,
    displayPrice: Math.max(0, +(price - savings).toFixed(2)),
    savings,
    percentage,
    badgeText: promotion.badgeText,
    promotionName: promotion.name,
    promotionSlug: promotion.slug,
    endsAt: promotion.endDate,
    countdownEnabled: promotion.countdownEnabled,
  };
}

export function selectPromotionForProduct(product, promotions, options = {}) {
  const matches = publicPromotionsAt(promotions, options)
    .filter((promotion) => productMatchesPromotion(promotion, product));
  matches.sort((a, b) => {
    const priority = (Number(b.priority) || 0) - (Number(a.priority) || 0);
    if (priority) return priority;
    const savingsA = calculatePromotionPrice(product.price, a, product)?.savings || 0;
    const savingsB = calculatePromotionPrice(product.price, b, product)?.savings || 0;
    if (savingsA !== savingsB) return savingsB - savingsA;
    const createdA = Date.parse(a.createdAt || a.startDate) || 0;
    const createdB = Date.parse(b.createdAt || b.startDate) || 0;
    return createdB - createdA || String(a.id).localeCompare(String(b.id));
  });
  return matches[0] || null;
}
