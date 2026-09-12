import test from 'node:test';
import assert from 'node:assert/strict';
import { discoveryProducts, lastChanceProducts, filterCollectionProducts, rankRelatedProducts } from '../lib/discovery.js';

test('physical goods remain discoverable with blank types and retained categories', () => {
  const rows = [{ id: 'bag', category: 'Accessories' }, { id: 'art', category: 'Wall Art' }, { id: 'bedding', category: 'Home Decor' }, { id: 'candle', category: 'Ritual' }];
  for (const [handle, id] of [['accessories', 'bag'], ['wall-art', 'art'], ['gothic-home-decor', 'bedding'], ['candles-ritual', 'candle']]) {
    assert.deepEqual(discoveryProducts(rows, handle).map(p => p.id), [id]);
  }
});
test('drinkware includes physical teacups and normalized water bottles without depending on supplier', () => {
  const rows = [{ id: 'cup', name: 'The Weaver’s Teacup', vendor: 'Physical goods' }, { id: 'bottle', productType: 'Water Bottle', vendor: 'Printful' }, { id: 'hidden', productType: 'Mug', hidden: true }];
  assert.deepEqual(discoveryProducts(rows, 'drinkware').map(p => p.id), ['cup', 'bottle']);
});
test('Last Chance requires explicit retirement membership, including sellable zero-quantity POD', () => {
  const rows = [{ id: '2026', qty: 0, availableForSale: true, tags: ['lifecycle:last-chance'] },
    { id: '2027', availableForSale: true, collections: [{ handle: 'summerween' }], tags: ['design-year:2027'] },
    { id: 'sold', qty: 1, availableForSale: false, tags: ['lifecycle:last-chance'] },
    { id: 'hidden', hidden: true, availableForSale: true, tags: ['lifecycle:last-chance'] }];
  assert.deepEqual(lastChanceProducts(rows).map(p => p.id), ['2026']);
});
test('size, color, and availability must match the same actual variant', () => {
  const option = (color, size, available) => ({ available, selectedOptions: [{ name: 'Color', value: color }, { name: 'Size', value: size }] });
  const rows = [{ id: 'tee', availableForSale: true, shopifyVariants: { variants: [option('White', 'S', false), option('Black', 'M', true)] } }];
  assert.equal(filterCollectionProducts(rows, { size: 'M', color: 'White' }).length, 0);
  assert.equal(filterCollectionProducts(rows, { size: 'S', color: 'White', available: true }).length, 0);
  assert.equal(filterCollectionProducts(rows, { size: 'M', color: 'Black', available: true }).length, 1);
});
test('native recommendations retain their order but exclude the current, hidden, and unavailable products', () => {
  const p = { id: 'current', availableForSale: true, category: 'Apparel' };
  const rows = [p, { id: 'other', availableForSale: true }, { id: 'curated', availableForSale: true }, { id: 'hidden', availableForSale: true, hidden: true }, { id: 'sold', availableForSale: false }];
  assert.deepEqual(rankRelatedProducts(p, rows, ['hidden', 'sold', 'current', 'curated']).map(p => p.id), ['curated', 'other']);
});
test('without native recommendations, a shared branded collection outranks unrelated merchandise', () => {
  const p = { id: 'mug', category: 'Home Decor', collections: [{ handle: 'smutty-good-girl' }] };
  const rows = [{ id: 'vase', availableForSale: true, category: 'Home Decor' }, { id: 'tote', availableForSale: true, category: 'Accessories', collections: [{ handle: 'smutty-good-girl' }] }];
  assert.equal(rankRelatedProducts(p, rows)[0].id, 'tote');
});
