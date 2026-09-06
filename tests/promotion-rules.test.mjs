import assert from 'node:assert/strict';
import test from 'node:test';
import {
  calculatePromotionPrice,
  isPromotionActive,
  productMatchesPromotion,
  publicPromotionsAt,
  selectPromotionForProduct,
} from '../lib/promotions/rules.js';

const now = Date.parse('2026-09-06T12:00:00Z');
const promotion = (overrides = {}) => ({
  id: 'campaign-a',
  status: 'active',
  enabled: true,
  startDate: '2026-09-06T12:00:00Z',
  endDate: '2026-09-06T13:00:00Z',
  createdAt: '2026-09-01T12:00:00Z',
  appliesTo: 'all',
  priority: 0,
  promotionType: 'percentage',
  percentage: 10,
  productIds: [],
  excludedProductIds: [],
  productOverrides: {},
  ...overrides,
});

const product = {
  id: 'gid://shopify/Product/8444896378914',
  legacyId: 'current-uuid',
  legacyIds: ['current-uuid', 'archived-uuid'],
  collectionHandles: ['kiss-lock-bags'],
  tags: ['Gothic'],
  price: 60,
};

test('cached campaigns stop exactly at the end time and begin at their start', () => {
  const cached = [promotion()];
  assert.deepEqual(publicPromotionsAt(cached, { now: now - 1 }), []);
  assert.equal(publicPromotionsAt(cached, { now }).length, 1);
  assert.equal(publicPromotionsAt(cached, { now: now + 3_600_000 - 1 }).length, 1);
  assert.deepEqual(publicPromotionsAt(cached, { now: now + 3_600_000 }), []);
  assert.equal(cached.length, 1, 'checking cached data does not mutate the cached source');
});

test('disabled, expired, scheduled and malformed campaigns never appear publicly', () => {
  for (const change of [
    { enabled: false }, { enabled: 'false' }, { status: 'expired' }, { status: 'scheduled' },
    { startDate: 'bad' }, { endDate: null }, { startDate: '2026-09-06T14:00:00Z' },
  ]) assert.equal(isPromotionActive(promotion(change), now), false);
  assert.equal(isPromotionActive(promotion({ status: 'live' }), now), true);
});

test('an editable Shopify discount ID cannot authorize storefront sale claims', () => {
  const campaigns = [promotion({ shopifyDiscountId: 'gid://shopify/DiscountAutomaticNode/123' })];
  assert.deepEqual(publicPromotionsAt(campaigns, { now, shopifyCatalogEnabled: true }), []);
  assert.equal(selectPromotionForProduct(product, campaigns, { now, shopifyCatalogEnabled: true }), null);
});

test('all legacy UUIDs and the canonical Shopify GID match without losing exclusions', () => {
  for (const identity of [product.id, ...product.legacyIds]) {
    assert.equal(productMatchesPromotion(promotion({ appliesTo: 'specific', productIds: [identity] }), product), true);
    assert.equal(productMatchesPromotion(promotion({ excludedProductIds: [identity] }), product), false);
  }
  const excludedAlias = promotion({ appliesTo: 'specific', productIds: [product.id], excludedProductIds: ['archived-uuid'] });
  assert.equal(productMatchesPromotion(excludedAlias, product), false);
});

test('native collection handles and tags match while absent targeting fails closed', () => {
  assert.equal(productMatchesPromotion(promotion({ appliesTo: 'collection', collections: ['kiss-lock-bags'] }), product), true);
  assert.equal(productMatchesPromotion(promotion({ appliesTo: 'collection', collections: ['smutty-good-girl'] }), product), false);
  assert.equal(productMatchesPromotion(promotion({ appliesTo: 'collection', collections: ['kiss-lock-bags'] }), {
    id: product.id, collections: [{ handle: 'kiss-lock-bags' }],
  }), true);
  assert.equal(productMatchesPromotion(promotion({ appliesTo: 'tag', tags: ['gothic'] }), product), true);
  assert.equal(productMatchesPromotion(promotion({ appliesTo: 'tag', tags: ['gothic'] }), { tags: null }), false);
});

test('numeric priority beats targeting specificity across all consumers', () => {
  const specific = promotion({ id: 'specific', appliesTo: 'specific', productIds: ['archived-uuid'], percentage: 40 });
  const priority = promotion({ id: 'priority', priority: 1, percentage: 5 });
  assert.equal(selectPromotionForProduct(product, [specific, priority], { now }).id, 'priority');
  assert.equal(selectPromotionForProduct(product, [priority, specific], { now }).id, 'priority');
});

test('equal-priority fixed and percentage campaigns compare actual variant savings', () => {
  const percentage = promotion({ id: 'percent', percentage: 10 });
  const fixed = promotion({ id: 'fixed', promotionType: 'fixed_amount', fixedAmount: 5 });
  assert.equal(selectPromotionForProduct({ ...product, price: 30 }, [percentage, fixed], { now }).id, 'fixed');
  assert.equal(selectPromotionForProduct({ ...product, price: 60 }, [percentage, fixed], { now }).id, 'percent');
  assert.equal(calculatePromotionPrice(60, fixed, product).displayPrice, 55);
});

test('legacy product overrides and creation time resolve ties consistently', () => {
  const overridden = promotion({ id: 'overridden', productOverrides: { 'archived-uuid': { percentage: 20 } } });
  assert.equal(calculatePromotionPrice(60, overridden, product).displayPrice, 48);
  const newer = promotion({ id: 'newer', percentage: 20, createdAt: '2026-09-02T12:00:00Z' });
  assert.equal(selectPromotionForProduct(product, [overridden, newer], { now }).id, 'newer');
});

test('expired prefetched promotion cannot be selected and invalid prices cannot be quoted', () => {
  assert.equal(selectPromotionForProduct(product, [promotion()], { now: now + 3_600_000 }), null);
  for (const price of [NaN, Infinity, -1, 0, 'invalid']) {
    assert.equal(calculatePromotionPrice(price, promotion(), product), null);
  }
  assert.equal(calculatePromotionPrice(60, promotion({ percentage: 120 }), product), null);
  assert.equal(calculatePromotionPrice(60, promotion({ promotionType: 'fixed_amount', fixedAmount: 100 }), product).displayPrice, 0);
});
