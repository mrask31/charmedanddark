import test from 'node:test';
import assert from 'node:assert/strict';
import { productIsAvailable, productPricing, productInCollection, productBrand } from '../lib/product-display.js';

test('sellability follows Shopify even when provider quantity disagrees', () => {
  assert.equal(productIsAvailable({ availableForSale: true, qty: 0 }), true);
  assert.equal(productIsAvailable({ availableForSale: false, qty: 9999 }), false);
});

test('Shopify current price cannot be lowered by stale application promotion fields', () => {
  const pricing = productPricing({ commerceSource: 'shopify', price: 24.99, compareAtPrice: 29.99, salePrice: 9.99 });
  assert.equal(pricing.publicPrice, 24.99);
  assert.equal(pricing.originalPrice, 29.99);
  assert.equal(pricing.isOnSale, true);
});

test('rollout rollback retains the legacy sale display contract', () => {
  const pricing = productPricing({ price: 20, salePrice: 15 });
  assert.equal(pricing.publicPrice, 15);
  assert.equal(pricing.originalPrice, 20);
});

test('zero dollar Shopify variants remain valid and collection discovery uses native handles', () => {
  assert.equal(productPricing({ commerceSource: 'shopify', price: 0 }).publicPrice, 0);
  assert.equal(productInCollection({ collections: [{ handle: 'smutty-good-girl' }] }, 'smutty-good-girl'), true);
});

test('fulfillment provider labels do not replace our brand in merchant metadata', () => {
  assert.equal(productBrand({ vendor: 'Printify' }), 'Charmed & Dark');
  assert.equal(productBrand({ vendor: 'Printful' }), 'Charmed & Dark');
  assert.equal(productBrand({ vendor: 'Distinct Wholesale Brand' }), 'Distinct Wholesale Brand');
});
