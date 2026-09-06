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
