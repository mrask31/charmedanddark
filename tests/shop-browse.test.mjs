import test from 'node:test';
import assert from 'node:assert/strict';
import { productShopCategory } from '../lib/catalog-categories.js';
import { discoveryProducts } from '../lib/discovery.js';
import { filterShopProducts, groupShopProducts } from '../lib/shop-browse.js';

const product = (id, productType, category, extra = {}) => ({ id, productType, category, availableForSale: true, ...extra });
const sgg = [
  product('secret', 'Water Bottle', 'Home Decor', { tags: ['SGG'] }),
  product('enchanted', 'Water Bottle', 'Home Decor', { tags: ['Smutty Good Girl Society'] }),
  product('mug', 'Mug', 'Home Decor', { tags: ['collection:smutty-good-girl'] }),
  product('tote', 'Tote Bag', 'Accessories', { collections: [{ handle: 'smutty-good-girl' }] }),
];
test('all four replacement SGG items appear together and remain reachable by product family', () => {
  assert.deepEqual(filterShopProducts(sgg, { category: 'SGG' }).map(p => p.id), ['secret', 'enchanted', 'mug', 'tote']);
  assert.equal(filterShopProducts(sgg, { category: 'DRINKWARE' }).length, 3);
  assert.deepEqual(filterShopProducts(sgg, { category: 'BAGS' }).map(p => p.id), ['tote']);
  assert.equal(discoveryProducts(sgg, 'smutty-good-girl').length, 4);
});
test('current product types override conflicting old category tags and memberships', () => {
  const rows = [
    product('teacup', 'Mug', 'Ritual', { collections: [{ handle: 'candles-ritual' }] }),
    product('pillow', 'Throw Pillow', 'Ritual'),
    product('ornament', 'Ornament', 'Ritual'),
    product('cap', 'Baseball Cap', 'Apparel'),
    product('art', 'Wall Decor', 'Home Decor'),
  ];
  assert.deepEqual(rows.map(productShopCategory), ['DRINKWARE', 'HOME', 'HOME', 'ACCESSORIES', 'WALL_ART']);
  assert.equal(discoveryProducts(rows, 'candles-ritual').length, 0);
  assert.deepEqual(discoveryProducts(rows, 'drinkware').map(p => p.id), ['teacup']);
});
test('unfiltered browsing renders every visible product once, including unfamiliar types', () => {
  const rows = [...sgg, product('bag', 'Kisslock Bag', 'Accessories'), product('unknown', 'New Type', ''), product('sold', 'Candle', 'Ritual', { availableForSale: false }), product('hidden', 'Mug', 'Home Decor', { hidden: true })];
  const ids = Object.values(groupShopProducts(filterShopProducts(rows))).flat().map(p => p.id);
  assert.equal(ids.length, rows.length - 1);
  assert.equal(new Set(ids).size, ids.length);
  assert.ok(ids.includes('unknown'));
  assert.ok(ids.includes('sold'));
  assert.ok(!ids.includes('hidden'));
});
test('bags includes totes and kisslocks; legacy categories remain usable', () => {
  const rows = [sgg[3], product('kisslock', 'Kisslock Bag', 'Accessories'), product('earrings', 'Earrings', 'Accessories')];
  assert.deepEqual(discoveryProducts(rows, 'bags').map(p => p.id), ['tote', 'kisslock']);
  assert.equal(productShopCategory({ category: ' apparel ' }), 'APPAREL');
  assert.equal(productShopCategory({ tags: ['category:Home Decor'] }), 'HOME');
});
test('search and price sorting work across sections without losing results', () => {
  const rows = [product('mug', 'Mug', 'Home Decor', { title: 'Rose Mug', price: 18 }), product('tee', 'T-Shirt', 'Apparel', { title: 'Rose Tee', price: 30 }), product('candle', 'Candle', 'Ritual', { title: 'Rose Candle', price: 12 })];
  assert.deepEqual(filterShopProducts(rows, { query: 'rose', sort: 'Price: Low to High' }).map(p => p.id), ['candle', 'mug', 'tee']);
  assert.equal(filterShopProducts(rows, { query: 'no such item' }).length, 0);
});
