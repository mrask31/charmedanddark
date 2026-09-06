import test from 'node:test';
import assert from 'node:assert/strict';
import { getLegacyCampaignPickerProducts } from '../lib/admin/catalog-picker.js';

test('campaign picker uses live commerce values while preserving all existing UUID targets', () => {
  const products = getLegacyCampaignPickerProducts([
    { id: 'gid://shopify/Product/1', legacyId: 'current-uuid', legacyIds: ['current-uuid', 'old-uuid'], name: 'Current Shopify title', handle: 'current-url', price: 29.99, availableForSale: false, imageUrls: ['https://cdn.shopify.com/current.jpg'] },
    { id: 'gid://shopify/Product/2', legacyId: null, legacyIds: [], name: 'New product' },
  ]);
  assert.equal(products.length, 2);
  assert.equal(products.find((product) => product.id === 'old-uuid').legacyAlias, true);
  assert.equal(products.find((product) => product.id === 'current-uuid').legacyAlias, false);
  assert.ok(products.every((product) => product.price === 29.99 && product.name === 'Current Shopify title' && product.isAvailable === false));
  assert.ok(products.every((product) => !product.id.startsWith('gid://')));
});
