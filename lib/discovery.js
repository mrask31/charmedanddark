import { productIsAvailable } from './product-display.js';
import { COLLECTION_CATEGORIES, productShopCategory } from './catalog-categories.js';
import { merchandiseClothing } from './clothing-merchandising.js';
import { isSummerweenSurvivor } from './product-lifecycle.js';

// Public destinations only. Homepage curation collections are intentionally excluded.
export const SHOP_COLLECTIONS = [
  { handle: 'bags', label: 'Bags', title: 'Gothic Bags & Book Totes', description: 'Explore vintage-inspired kisslock bags and gothic book totes. Find a statement bag for everyday outings, reading days, and evenings out.' },
  { handle: 'gothic-clothing', label: 'Clothing', title: 'Gothic Clothing', description: 'Explore gothic graphic tees, hoodies, tanks, socks, and tights. Find everyday clothing with dark romantic, celestial, and seasonal designs.' },
  { handle: 'gothic-home-decor', label: 'Home & Décor', title: 'Gothic Home Décor', description: 'Make room for the darker details: gothic décor, bedding, serving pieces, ornaments, and objects for the home you love.' },
  { handle: 'candles-ritual', label: 'Candles & Ritual', title: 'Gothic Candles & Ritual', description: 'Discover sculpted candles, taper candles, candle holders, and ritual accessories for quiet evenings and atmospheric spaces.' },
  { handle: 'drinkware', label: 'Drinkware', title: 'Gothic & Bookish Drinkware', description: 'Find gothic mugs, teacups, water bottles, and glassware for coffee breaks, reading nights, and everyday rituals.' },
  { handle: 'accessories', label: 'Jewelry & Hats', title: 'Gothic Jewelry & Hats', description: 'Complete your look with gothic jewelry and embroidered hats. Explore celestial details and dark designs you can wear every day.' },
  { handle: 'wall-art', label: 'Wall Art', title: 'Gothic Wall Art', description: 'Explore gothic art prints, canvas artwork, and wall décor with romantic, celestial, and haunting themes.' },
];
export const THEME_COLLECTIONS = [
  { handle: 'fall-2026', label: 'Fall Collection', title: 'Fall Gothic Clothing — Autumn 2026', description: 'Longer nights. Darker layers. Discover Autumn Mourning Society, Autumn Skull, and bookish gothic tees and hoodies for fall.' },
  { handle: 'smutty-good-girl', label: 'Smutty Good Girl', title: 'Smutty Good Girl — Bookish Gifts', description: 'Bookish drinkware, totes, and everyday essentials for adult smut readers across genres. Discover the Smutty Good Girl collection from Charmed & Dark.' },
  { handle: 'summerween', label: 'Summerween', title: 'Summerween — The Spirit Lives On', description: 'Summerween has been laid to rest for the season, but Bones & Brews lives on year-round. The collection returns next summer with all-new designs.' },
];
export const PUBLIC_COLLECTIONS = [...SHOP_COLLECTIONS, ...THEME_COLLECTIONS,
{ handle: 'kiss-lock-bags', label: 'Kisslock Bags', title: 'Gothic Kisslock Bags', description: 'Vintage-inspired kisslock bags with celestial, floral, and gothic motifs. Find a statement bag for everyday outings and evenings out.' },
];

export function productInCollection(product, handle) {
  const normalize = (value) => String(value || '').trim().toLowerCase();
  const tags = (product.tags || []).map(normalize);
  return product.collections?.some((collection) => normalize(typeof collection === 'string' ? collection : collection.handle) === handle)
    || normalize(product.collection) === handle
    || tags.includes(`collection:${handle}`)
    || (handle === 'fall-2026' && tags.includes('fall 2026'))
    || (handle === 'smutty-good-girl' && tags.some((tag) => ['sgg', 'smutty good girl society', 'smutty good girl'].includes(tag)));
}

export function matchesDiscoveryCollection(product, handle) {
  // Family pages share the same type-first rules as Shop, even when old tags conflict.
  if (COLLECTION_CATEGORIES[handle]) return productShopCategory(product) === COLLECTION_CATEGORIES[handle];
  if (handle === 'kiss-lock-bags') return productInCollection(product, handle)
    || ['kisslock bag', 'kiss lock bag'].includes(String(product.productType || '').trim().toLowerCase());
  return productInCollection(product, handle);
}

export function discoveryProducts(products, handle) {
  const result = products.filter((p) => !p.hidden && matchesDiscoveryCollection(p, handle))
    .sort((a, b) => Number(productIsAvailable(b)) - Number(productIsAvailable(a)));
  return handle === 'gothic-clothing' ? merchandiseClothing(result) : result;
}

export function lastChanceProducts(products) {
  // Keep the year-round survivor out even if an older catalog response has its former tag.
  return products.filter((p) => !p.hidden && !isSummerweenSurvivor(p) && productIsAvailable(p)
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
