import { discoveryProducts } from './discovery.js';
import { productIsAvailable } from './product-display.js';

export function availableFallProducts(products) {
  return discoveryProducts(products, 'fall-2026').filter(productIsAvailable);
}

export function summerweenSeason(products) {
  const remaining = discoveryProducts(products, 'summerween').filter(productIsAvailable);
  return { remaining, retired: remaining.length === 0 };
}

// Public, previously approved collection photography, retained after retirement.
// Archive imagery has no price, stock claim or product purchase link.
export const SUMMERWEEN_MEMORY = {
  title: 'Bones & Brews · Summerween 2026',
  image: 'https://cdn.shopify.com/s/files/1/0861/2079/2098/files/bones-brews-female-front-batch3.png?v=1789251087',
};
