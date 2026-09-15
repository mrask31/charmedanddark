import { productShopCategory } from './catalog-categories.js';
import { productInCollection } from './discovery.js';
import { productIsAvailable, productPricing } from './product-display.js';
import { merchandiseClothing } from './clothing-merchandising.js';

export const SHOP_FILTERS = [
  { id: 'ALL', label: 'Shop all' }, { id: 'SGG', label: 'Smutty Good Girl' },
  { id: 'BAGS', label: 'Bags' }, { id: 'APPAREL', label: 'Clothing' },
  { id: 'HOME', label: 'Home & Décor' }, { id: 'RITUAL', label: 'Candles & Ritual' },
  { id: 'DRINKWARE', label: 'Drinkware' }, { id: 'ACCESSORIES', label: 'Jewelry & Hats' },
  { id: 'WALL_ART', label: 'Wall Art' },
];
export const SHOP_SECTIONS = [
  { id: 'SGG', title: 'Smutty Good Girl', subtitle: 'Bookish drinkware, totes, and everyday essentials for readers with questionable bookmarks', href: '/collections/smutty-good-girl' },
  { id: 'BAGS', title: 'Bags', subtitle: 'Kisslock bags and book totes for everyday outings and late-night chapters', href: '/collections/bags' },
  { id: 'APPAREL', title: 'The Wardrobe', subtitle: 'Gothic tees, hoodies, tanks, socks, and tights for your everyday', href: '/collections/gothic-clothing' },
  { id: 'HOME', title: 'Dark Home', subtitle: 'Atmospheric décor, bedding, and serving pieces for the space you call your own', href: '/collections/gothic-home-decor' },
  { id: 'RITUAL', title: 'Light the Darkness', subtitle: 'Candles, holders, and ritual essentials for the softer hours', href: '/collections/candles-ritual' },
  { id: 'DRINKWARE', title: 'Drinkware', subtitle: 'Mugs, bottles, and glassware for reading rituals and evenings in', href: '/collections/drinkware' },
  { id: 'ACCESSORIES', title: 'Adornments', subtitle: 'Jewelry and hats with a darker edge', href: '/collections/accessories' },
  { id: 'WALL_ART', title: 'The Gallery', subtitle: 'Dark art for walls that refuse to be ordinary', href: '/collections/wall-art' },
  { id: 'OTHER', title: 'More to Discover', subtitle: 'The latest additions to your kind of beautiful', href: '/shop' },
];
export function normalizeShopFilter(value) {
  return value === 'ON_SALE' || SHOP_FILTERS.some((filter) => filter.id === value) ? value : 'ALL';
}
export function filterShopProducts(products, { category = 'ALL', collection = '', query = '', sort = 'Featured' } = {}) {
  const filter = normalizeShopFilter(category);
  const search = String(query).trim().toLowerCase();
  const result = products.filter((product) => {
    if (product.hidden) return false;
    if (filter === 'ON_SALE' && !productPricing(product).isOnSale) return false;
    if (filter === 'SGG' && !productInCollection(product, 'smutty-good-girl')) return false;
    if (!['ALL', 'ON_SALE', 'SGG'].includes(filter) && productShopCategory(product) !== filter) return false;
    if (collection && !productInCollection(product, collection)) return false;
    return !search || [product.name || product.title, product.category, product.productType, ...(product.tags || [])].join(' ').toLowerCase().includes(search);
  });
  if (sort === 'Price: Low to High') result.sort((a, b) => productPricing(a).publicPrice - productPricing(b).publicPrice);
  else if (sort === 'Price: High to Low') result.sort((a, b) => productPricing(b).publicPrice - productPricing(a).publicPrice);
  else if (sort === 'Newest') result.sort((a, b) => (Date.parse(b.createdAt) || 0) - (Date.parse(a.createdAt) || 0));
  else result.sort((a, b) => Number(productIsAvailable(b)) - Number(productIsAvailable(a)));
  return sort === 'Featured' ? merchandiseClothing(result) : result;
}
export function groupShopProducts(products) {
  const groups = Object.fromEntries(SHOP_SECTIONS.map(({ id }) => [id, []]));
  for (const product of products) {
    if (product.hidden) continue;
    const key = productInCollection(product, 'smutty-good-girl') ? 'SGG' : productShopCategory(product);
    groups[key].push(product);
  }
  return groups;
}

// A compact introduction; the family destinations and Shop all retain the full catalog.
export function shopSectionPreviews(products, limit = 4) {
  const groups = groupShopProducts(products);
  return SHOP_SECTIONS.filter(({ id }) => groups[id].length > 0).map((section) => ({
    ...section,
    products: groups[section.id].slice(0, limit),
    total: section.id === 'OTHER' ? groups.OTHER.length : filterShopProducts(products, { category: section.id }).length,
  }));
}
