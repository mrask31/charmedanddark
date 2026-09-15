import test from 'node:test';
import assert from 'node:assert/strict';
import { productShopCategory } from '../lib/catalog-categories.js';
import { discoveryProducts } from '../lib/discovery.js';
import { filterShopProducts, groupShopProducts, shopSectionPreviews } from '../lib/shop-browse.js';
import { productCardTitle } from '../lib/product-card-title.js';

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

test('compact sections keep all four SGG items and every remaining item accessible through full views', () => {
  const bags = Array.from({ length: 9 }, (_, i) => product(`bag-${i}`, 'Kisslock Bag', 'Accessories', { title: `Bag ${i}` }));
  const rows = [...sgg, ...bags, product('unfamiliar', 'New Type', '')];
  const sections = shopSectionPreviews(rows);
  assert.deepEqual(sections.find(s => s.id === 'SGG').products.map(p => p.id), sgg.map(p => p.id));
  assert.equal(sections.find(s => s.id === 'BAGS').products.length, 4);
  assert.equal(sections.find(s => s.id === 'BAGS').total, 10); // The Bags page also includes the SGG tote.
  assert.equal(sections.find(s => s.id === 'OTHER').products[0].id, 'unfamiliar');
  assert.equal(filterShopProducts(rows, { category: 'ALL' }).length, rows.length);
  assert.equal(filterShopProducts(rows, { query: 'Bag 8' })[0].id, 'bag-8');
});

test('display titles retain capacity and garment differences without changing canonical product data', () => {
  const bottle = Object.freeze({ handle: 'sgg-enchanted-reads-gothic-water-bottle-32-oz', name: 'S.G.G. Enchanted Reads Gothic Water Bottle — 32 oz', metaTitle: 'Original SEO title' });
  assert.match(productCardTitle(bottle), /32 oz/);
  assert.equal(bottle.name, 'S.G.G. Enchanted Reads Gothic Water Bottle — 32 oz');
  assert.equal(bottle.metaTitle, 'Original SEO title');
  const ringer = productCardTitle({ handle: 'charmed-by-night-gothic-unisex-ringer-t-shirt' });
  const rose = productCardTitle({ handle: 'charmed-by-night-gothic-rose-unisex-t-shirt' });
  assert.notEqual(ringer, rose);
  assert.match(ringer, /Ringer/);
  assert.equal(productCardTitle({ handle: 'new-product', title: 'A Brand New Design' }), 'A Brand New Design');
});
