import test from 'node:test';
import assert from 'node:assert/strict';
import { heavyShippingEstimate, isHeavyShippingProduct } from '../lib/shipping-policy.js';

const heavy = { shopifyVariantId: 'gid://shopify/ProductVariant/44860269035554', quantity: 1 };
const ottoman = { shopifyVariantId: 'gid://shopify/ProductVariant/44860266676258', quantity: 1 };
const regular = { shopifyVariantId: 'gid://shopify/ProductVariant/999', quantity: 3 };
const cart = (items, subtotal = 70, extra = {}) => ({items, subtotal, currency: 'USD', discounts: [], ...extra});

test('heavy-only orders pay one flat rate across quantities and different heavy products', () => {
  for (const items of [[heavy], [{...heavy, quantity: 3}], [heavy, ottoman]]) {
    assert.deepEqual(heavyShippingEstimate(cart(items, 300)), {hasRegularItems:false, standard:0, heavy:39.99});
  }
});
test('mixed orders use the full subtotal tier plus one heavy charge', () => {
  for (const [subtotal, standard] of [[49.99,9.95],[50,14.95],[99.99,14.95],[100,19.95],[300,19.95]]) {
    assert.deepEqual(heavyShippingEstimate(cart([heavy,ottoman,regular],subtotal)), {hasRegularItems:true,standard,heavy:39.99});
  }
});
test('regular, empty and non-USD carts have no heavy estimate', () => {
  for (const value of [null, cart([]), cart([regular]), cart([heavy],70,{currency:'CAD'})]) assert.equal(heavyShippingEstimate(value), null);
});
test('discounted mixed carts defer the standard tier to checkout', () => {
  assert.equal(heavyShippingEstimate(cart([heavy,regular],105,{discounts:[{amount:10}]})).standard, null);
  assert.equal(heavyShippingEstimate(cart([heavy,{...regular,discounts:[{amount:10}]}],105)).standard, null);
  assert.equal(heavyShippingEstimate(cart([heavy],70,{discounts:[{amount:7}]})).standard, 0);
});
test('product notice accepts current and legacy Shopify IDs without matching other products', () => {
  assert.equal(isHeavyShippingProduct({id:'gid://shopify/Product/8247950475298'}), true);
  assert.equal(isHeavyShippingProduct({id:'legacy-id',shopify_id:'8247950475298'}), true);
  assert.equal(isHeavyShippingProduct({id:'gid://shopify/Product/999'}), false);
});
