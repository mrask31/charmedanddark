import test from 'node:test';
import assert from 'node:assert/strict';
import { buildPinterestCountryFeed } from '../lib/pinterest-feed.js';

const variant = (id, extra = {}) => ({ shopifyVariantId: `gid://shopify/ProductVariant/${id}`,
  price: 29.99, currencyCode: 'USD', availableForSale: true, ...extra });
const product = (variants) => ({ handle: 'gothic-pillow', shopifyVariants: { variants } });

test('country feed matches Shopify item IDs and selects each variant on the real storefront', () => {
  const feed = buildPinterestCountryFeed([product([variant('44860267757602'), variant('44860267757603', {
    price: 24.99, compareAtPrice: 30, availableForSale: false,
  })])]);
  const rows = feed.trim().split('\r\n').map(row => row.slice(1, -1).split('\",\"'));
  assert.deepEqual(rows[0], ['id', 'override', 'price', 'sale_price', 'availability', 'link']);
  assert.equal(rows.length, 3);
  assert.deepEqual(rows[1].slice(0, 5), ['44860267757602', 'US', '29.99 USD', '', 'in stock']);
  assert.deepEqual(rows[2].slice(0, 5), ['44860267757603', 'US', '30.00 USD', '24.99 USD', 'out of stock']);
  for (const row of rows.slice(1)) {
    const url = new URL(row[5]);
    assert.equal(url.origin, 'https://www.charmedanddark.com');
    assert.equal(url.pathname, '/shop/gothic-pillow');
    assert.equal(url.searchParams.get('variant'), row[0]);
    assert.equal(url.searchParams.get('utm_source'), 'Pinterest');
  }
});

test('invalid or incomplete data fails the whole feed instead of silently truncating updates', () => {
  for (const products of [[], [product([])], [product([variant('1'), variant('1')])],
    [product([variant('1', { price: NaN })])], [product([variant('1', { currencyCode: 'CAD' })])],
    [product([variant('1', { availableForSale: undefined })])]]) {
    assert.throws(() => buildPinterestCountryFeed(products));
  }
});
