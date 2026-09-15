import test from 'node:test';
import assert from 'node:assert/strict';
import { BROWSE_RETURN_KEY, shopStateFromParams, collectionStateFromParams, updatedBrowseUrl, browseReturnSnapshot } from '../lib/browse-state.js';
import { filterShopProducts, shopSectionPreviews } from '../lib/shop-browse.js';
import { discoveryProducts } from '../lib/discovery.js';
import { summerweenSeason, availableFallProducts } from '../lib/seasonal-collections.js';

test('a return URL reconstructs category, search, collection, view and sort without initial page props', () => {
  const before = 'https://www.charmedanddark.com/shop?category=APPAREL&q=rose&collection=fall-2026&view=all&sort=Price%3A+High+to+Low';
  assert.deepEqual(shopStateFromParams(new URL(before).searchParams), { category: 'APPAREL', query: 'rose', collection: 'fall-2026', view: 'all', sort: 'Price: High to Low' });
  const wall = updatedBrowseUrl(before, { category: 'WALL_ART', q: '', collection: '', sort: '' });
  assert.deepEqual(shopStateFromParams(new URL(wall, before).searchParams), { category: 'WALL_ART', query: '', collection: '', view: 'all', sort: 'Featured' });
  // An unrelated URL parameter survives editing the browse state.
  assert.equal(updatedBrowseUrl('https://example.com/shop?utm_source=email', { category: 'APPAREL' }), '/shop?utm_source=email&category=APPAREL');
});

test('collection return URLs preserve the exact options and explicit price order', () => {
  const href = updatedBrowseUrl('https://example.com/collections/gothic-clothing', { type: 'Hoodie', color: 'Forest Green', size: 'XL', available: true, sort: 'price-asc' });
  assert.deepEqual(collectionStateFromParams(new URL(href, 'https://example.com').searchParams), { type: 'Hoodie', color: 'Forest Green', size: 'XL', available: true, sort: 'price-asc' });
});

test('scroll positions belong to their own history entry and complete list URL', () => {
  const url = '/shop?category=WALL_ART&view=all';
  const saved = { url, y: 1360, product: 'undying-love-art-print', offset: 250 };
  assert.equal(browseReturnSnapshot({ [BROWSE_RETURN_KEY]: saved }, url), saved);
  assert.equal(browseReturnSnapshot({ [BROWSE_RETURN_KEY]: saved }, '/shop?category=APPAREL'), null);
  assert.equal(browseReturnSnapshot({}, url), null); // A fresh Shop visit starts fresh.
  assert.equal(browseReturnSnapshot({ [BROWSE_RETURN_KEY]: { url, y: NaN } }, url), null);
});

test('Clothing opens with varied garments, stays stable, preserves every product and honors explicit sorting', () => {
  const item = (id, type, price, handle = id) => ({ id, handle, productType: type, price, availableForSale: true });
  const rows = [item('tank1', 'Tank Top', 30), item('tank2', 'Tank Top', 25), item('tank3', 'Tank Top', 29),
    item('tee1', 'T-Shirt', 20), item('tee2', 'T-Shirt', 22), item('hoodie', 'Hoodie', 50), item('bag', 'Kisslock Bag', 27)];
  const clothing = filterShopProducts(rows, { category: 'APPAREL' });
  assert.deepEqual(clothing.slice(0, 4).map(p => p.productType), ['T-Shirt', 'Hoodie', 'Tank Top', 'T-Shirt']);
  assert.deepEqual(filterShopProducts(rows, { category: 'APPAREL' }), clothing);
  assert.equal(new Set(clothing.map(p => p.id)).size, 6);
  assert.equal(filterShopProducts(rows).length, rows.length);
  assert.deepEqual(discoveryProducts(rows, 'gothic-clothing'), clothing);
  assert.deepEqual(shopSectionPreviews(filterShopProducts(rows)).find(s => s.id === 'APPAREL').products, clothing.slice(0, 4));
  assert.deepEqual(filterShopProducts(rows, { category: 'APPAREL', sort: 'Price: Low to High' }).map(p => p.price), [20, 22, 25, 29, 30, 50]);
  const sold = { ...item('cozy', 'T-Shirt', 20, 'cozy-crypt-book-club-gothic-t-shirt'), availableForSale: false };
  assert.equal(filterShopProducts([sold, ...rows], { category: 'APPAREL' }).at(-1).id, 'cozy');
});

test('seasonal features use published membership and farewell copy stays accurate while Summerween remains orderable', () => {
  const fall = { id: 'fall', tags: ['Fall 2026'], availableForSale: true };
  const summer = { id: 'summer', collections: [{ handle: 'summerween' }], availableForSale: true };
  assert.deepEqual(availableFallProducts([fall, summer, { ...fall, id: 'hidden', hidden: true }]), [fall]);
  assert.equal(summerweenSeason([fall, summer]).retired, false);
  assert.equal(summerweenSeason([fall, { ...summer, hidden: true }]).retired, true);
  assert.equal(summerweenSeason([fall]).retired, true);
});
