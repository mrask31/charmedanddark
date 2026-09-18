import test from 'node:test';
import assert from 'node:assert/strict';
import { getMirrorCandidates, resolveMirrorRecommendations } from '../lib/mirror-catalog.js';

const product = {
  id: 'gid://shopify/Product/123', name: 'Moon bag', slug: 'moon-bag',
  price: 26.99, currencyCode: 'USD', availableForSale: true, qty: 0,
};

test('Shopify sellability allows zero inventory and excludes unavailable and unknown products', () => {
  const candidates = getMirrorCandidates([
    product, { ...product, id: 'gid://shopify/Product/124', availableForSale: false },
    { ...product, id: 'gid://shopify/Product/125', availableForSale: undefined, qty: 9999 },
    { ...product, id: 'invented' }, product,
  ], { shopifyCatalogEnabled: true });
  assert.deepEqual(candidates.map((p) => p.id), [product.id]);
});

test('model output cannot override facts, link unknown IDs, or duplicate a product', () => {
  const candidates = getMirrorCandidates([product], { shopifyCatalogEnabled: true });
  const result = resolveMirrorRecommendations([
    { id: 'gid://shopify/Product/999', title: 'Fake', handle: 'fake' },
    { id: product.id, handle: 'wrong-url', title: 'Wrong title', price: 0, reason: 'A small ritual.' },
    { id: product.id, reason: 'Duplicate.' },
  ], candidates, 3);
  assert.deepEqual(result, [{ ...candidates[0], reason: 'A small ritual.' }]);
  assert.deepEqual(resolveMirrorRecommendations([{ id: product.id }], [], 3), []);
  assert.deepEqual(resolveMirrorRecommendations('invalid', candidates, 3), []);
});

const catalog = [
  { ...product, name: 'Midnight Bloom Tealight Holder', slug: 'midnight-bloom' },
  { ...product, id: 'gid://shopify/Product/201', name: 'Smutty Good Girl Book Tote', slug: 'sgg-book-tote' },
  { ...product, id: 'gid://shopify/Product/202', name: 'Velvet Dress', slug: 'velvet-dress' },
  { ...product, id: 'gid://shopify/Product/203', name: 'S.G.G. Reading Fuel Mug', slug: 'reading-fuel' },
];
const choose = (mood, products = catalog, limit = 250) => getMirrorCandidates(products, { mood, limit, shopifyCatalogEnabled: true }).map(p => p.id);

test('sexy and spicy reading moods select SGG before the catalog limit', () => {
  for (const mood of ['Sexy', 'spicy reader', 'smut reader', 'S.G.G.']) {
    assert.deepEqual(choose(mood), [catalog[1].id, catalog[3].id]);
  }
  assert.deepEqual(choose('sexy', catalog, 1), [catalog[1].id]);
});
test('explicit item requests override general mood and do not substitute unrelated decor', () => {
  assert.deepEqual(choose('sexy outfit'), [catalog[2].id]);
  assert.deepEqual(choose('spicy mug'), [catalog[3].id]);
  assert.deepEqual(choose('sexy candle'), []);
});
test('exclusions and unrelated moods do not force SGG', () => {
  assert.deepEqual(choose('cozy, no smut'), [catalog[0].id, catalog[2].id]);
  assert.deepEqual(choose('not sexy'), [catalog[0].id, catalog[2].id]);
  assert.equal(choose('calm').length, catalog.length);
});
test('SGG relevance never restores hidden or unavailable products', () => {
  assert.deepEqual(choose('sexy', [
    { ...catalog[1], hidden: true }, { ...catalog[3], availableForSale: false },
  ]), []);
});
