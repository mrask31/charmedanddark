import { productShopCategory } from './catalog-categories.js';
import { productIsAvailable } from './product-display.js';

// Stable editorial order: a bookish tee, seasonal layer, rose tee and a tank.
// No random shuffle: returning customers should find pieces where they left them.
const FEATURED = [
  'cozy-crypt-book-club-gothic-t-shirt',
  'autumn-mourning-society-gothic-pullover-hoodie',
  'charmed-by-night-gothic-rose-unisex-t-shirt',
  'crimson-reliquary-gothic-ribbed-racer-tank',
];

function mix(products) {
  const featured = FEATURED.map((handle) => products.find((p) => (p.handle || p.slug) === handle)).filter(Boolean);
  const remaining = products.filter((p) => !featured.includes(p));
  const types = ['t-shirt', 'hoodie', 'tank top'];
  const groups = types.map((type) => remaining.filter((p) => p.productType?.toLowerCase() === type));
  const others = remaining.filter((p) => !types.includes(p.productType?.toLowerCase()));
  const mixed = [];
  for (let i = 0; groups.some((group) => i < group.length); i++) {
    for (const group of groups) if (group[i]) mixed.push(group[i]);
  }
  return [...featured, ...mixed, ...others];
}

export function merchandiseClothing(products) {
  const clothing = products.filter((p) => productShopCategory(p) === 'APPAREL');
  const ordered = [...mix(clothing.filter(productIsAvailable)), ...mix(clothing.filter((p) => !productIsAvailable(p)))];
  let index = 0;
  return products.map((p) => productShopCategory(p) === 'APPAREL' ? ordered[index++] : p);
}
