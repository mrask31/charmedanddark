import { discoveryProducts } from './discovery.js';
import { productIsAvailable } from './product-display.js';
import { isSummerweenSurvivor, SUMMERWEEN_SURVIVOR_HANDLE } from './product-lifecycle.js';

export function availableFallProducts(products) {
  return discoveryProducts(products, 'fall-2026').filter(productIsAvailable);
}

export function summerweenSeason(products) {
  const remaining = discoveryProducts(products, 'summerween').filter(productIsAvailable).filter((product) => {
    if (isSummerweenSurvivor(product)) return false;
    const years = (product.tags || []).map((tag) => tag.toLowerCase()).filter((tag) => tag.startsWith('design-year:'));
    // A later Summerween release must not reopen the 2026 archive.
    return years.includes('design-year:2026');
  });
  return { remaining, retired: remaining.length === 0 };
}

// Previously approved photography of the original now staying year-round.
export const SUMMERWEEN_MEMORY = {
  handle: SUMMERWEEN_SURVIVOR_HANDLE,
  title: 'Bones & Brews · Summerween 2026',
  image: 'https://cdn.shopify.com/s/files/1/0861/2079/2098/files/bones-brews-female-front-batch3.png?v=1789251087',
};
