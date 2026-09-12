import { productIsAvailable } from './product-display.js';

// Public destinations only. Homepage curation collections are intentionally excluded.
export const SHOP_COLLECTIONS = [
  { handle: 'kiss-lock-bags', label: 'Kisslock Bags', title: 'Gothic Kisslock Bags', description: 'Vintage-inspired kisslock bags with celestial, floral, and gothic motifs. Find a statement bag for everyday outings and evenings out.' },
  { handle: 'gothic-clothing', label: 'Clothing', title: 'Gothic Clothing', description: 'Explore gothic graphic tees, hoodies, tanks, socks, and tights. Find everyday clothing with dark romantic, celestial, and seasonal designs.' },
  { handle: 'gothic-home-decor', label: 'Home & Décor', title: 'Gothic Home Décor', description: 'Make room for the darker details: gothic décor, bedding, serving pieces, ornaments, and objects for the home you love.' },
  { handle: 'candles-ritual', label: 'Candles & Ritual', title: 'Gothic Candles & Ritual', description: 'Discover sculpted candles, taper candles, candle holders, and ritual accessories for quiet evenings and atmospheric spaces.' },
  { handle: 'drinkware', label: 'Drinkware', title: 'Gothic & Bookish Drinkware', description: 'Find gothic mugs, teacups, water bottles, and glassware for coffee breaks, reading nights, and everyday rituals.' },
  { handle: 'accessories', label: 'Accessories', title: 'Gothic Accessories', description: 'Complete your look with gothic jewelry, bags, and hats. Explore celestial details and dark designs you can carry or wear every day.' },
  { handle: 'wall-art', label: 'Wall Art', title: 'Gothic Wall Art', description: 'Explore gothic art prints, canvas artwork, and wall décor with romantic, celestial, and haunting themes.' },
];
export const THEME_COLLECTIONS = [
  { handle: 'smutty-good-girl', label: 'Smutty Good Girl', title: 'Smutty Good Girl — Bookish Gifts', description: 'Bookish drinkware, totes, and everyday essentials for dark-romance readers. Discover the Smutty Good Girl collection from Charmed & Dark.' },
  { handle: 'summerween', label: 'Summerween', title: 'Summerween Clothing & Accessories', description: 'Halloween spirit meets summer style. Explore this season’s Summerween clothing and accessories before these designs retire. Summerween returns next summer with new designs.' },
];
export const PUBLIC_COLLECTIONS = [...SHOP_COLLECTIONS, ...THEME_COLLECTIONS];

export function productInCollection(product, handle) {
  return product.collections?.some((collection) => collection.handle === handle)
    || product.collection === handle
    || (product.tags || []).some((tag) => tag.toLowerCase() === `collection:${handle}`);
}

export function matchesDiscoveryCollection(product, handle) {
  if (productInCollection(product, handle)) return true;
  const category = String(product.category || '').toLowerCase();
  const type = String(product.productType || '').toLowerCase();
  const name = String(product.name || product.title || '').toLowerCase();
  const drinkware = /\b(mug|teacup|water bottle|tumbler|coupe|glassware)\b/.test(`${type} ${name}`);
  switch (handle) {
    case 'gothic-clothing': return category === 'apparel' || ['t-shirt', 'hoodie', 'tank top', 'socks', 'tights'].includes(type);
    case 'gothic-home-decor': return ['home decor', 'home', 'decor'].includes(category);
    case 'candles-ritual': return category === 'ritual' || ['candle', 'candle holder', 'cleansing bundle'].includes(type);
    case 'drinkware': return drinkware;
    case 'accessories': return category === 'accessories' || ['kisslock bag', 'tote bag', 'earrings', 'necklace', 'bracelet', 'beanie', 'baseball cap', 'trucker hat', 'hats'].includes(type);
    case 'wall-art': return category === 'wall art' || ['art print', 'canvas', 'canvas wall art', 'wall decor'].includes(type);
    default: return false;
  }
}

export function discoveryProducts(products, handle) {
  return products.filter((p) => !p.hidden && matchesDiscoveryCollection(p, handle))
    .sort((a, b) => Number(productIsAvailable(b)) - Number(productIsAvailable(a)));
}

export function lastChanceProducts(products) {
  // Summerween is retiring by season, not by quantity. No date is invented here.
  return products.filter((p) => !p.hidden && productIsAvailable(p)
    && p.tags?.includes('lifecycle:last-chance'));
}

export function filterCollectionProducts(products, { type = '', size = '', color = '', available = false } = {}) {
  return products.filter((p) => {
    if (p.hidden || (type && p.productType !== type)) return false;
    if (available && !productIsAvailable(p)) return false;
    if (!size && !color) return true;
    return p.shopifyVariants?.variants?.some((v) => (!available || (v.availableForSale ?? v.available)) &&
      (!size || v.selectedOptions?.some((o) => o.name.toLowerCase() === 'size' && o.value === size)) &&
      (!color || v.selectedOptions?.some((o) => o.name.toLowerCase() === 'color' && o.value === color)));
  });
}

export function rankRelatedProducts(product, candidates, recommendedIds = [], limit = 4) {
  const themes = THEME_COLLECTIONS.filter((c) => productInCollection(product, c.handle));
  const curated = new Map(recommendedIds.map((id, index) => [id, 1000 - index]));
  return candidates.filter((p) => p.id !== product.id && !p.hidden && productIsAvailable(p))
    .map((p, index) => ({ product: p, index, score: curated.get(p.id) ??
      (themes.some((c) => productInCollection(p, c.handle)) ? 20 : 0) +
      (p.productType && p.productType === product.productType ? 10 : 0) +
      (p.category === product.category ? 5 : 0) }))
    .sort((a, b) => b.score - a.score || a.index - b.index)
    .slice(0, limit).map(({ product: p }) => p);
}
