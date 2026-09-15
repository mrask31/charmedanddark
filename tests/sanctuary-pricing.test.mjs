import test from 'node:test';
import assert from 'node:assert/strict';
import { setTimeout as tick } from 'node:timers/promises';
import { productPricing, sanctuaryPricePreview } from '../lib/product-display.js';
import { isActiveSanctuaryMembership, observeSanctuaryAccess } from '../lib/sanctuary-access.js';

test('new products need no copied member-price field and a selected size uses its own current price', () => {
  const product = { commerceSource: 'shopify', price: 24.99, compareAtPrice: 29.99, salePrice: 9.99 };
  assert.equal(sanctuaryPricePreview(productPricing(product).publicPrice), 22.49);
  assert.equal(sanctuaryPricePreview(29.99), 26.99);
  assert.equal(product.price, 24.99, 'the preview never changes the price sent to the cart');
  assert.equal(sanctuaryPricePreview(24.95), 22.45, 'discount is rounded in minor currency units');
});

test('price previews handle free items, currency precision and invalid inputs', () => {
  assert.equal(sanctuaryPricePreview(0), 0);
  assert.equal(sanctuaryPricePreview('39.99'), 35.99);
  assert.equal(sanctuaryPricePreview(999, 'JPY'), 899);
  assert.equal(sanctuaryPricePreview(1.999, 'KWD'), 1.799);
  for (const value of [undefined, null, '', NaN, Infinity, -1, 'bad']) assert.equal(sanctuaryPricePreview(value), null);
});

test('UI and server eligibility reject inactive, expired and malformed memberships', () => {
  const now = Date.parse('2026-09-15T12:00:00Z');
  assert.equal(isActiveSanctuaryMembership({ status: 'active', expires_at: null }, now), true);
  assert.equal(isActiveSanctuaryMembership({ status: 'active', expires_at: '2026-09-16' }, now), true);
  for (const membership of [null, {}, { status: 'cancelled' }, { status: 'active', expires_at: 'bad' },
    { status: 'active', expires_at: '2026-09-15T12:00:00Z' }]) {
    assert.equal(isActiveSanctuaryMembership(membership, now), false);
  }
});

function harness(membership = { status: 'active' }) {
  let callback, session = null, unsubscribed = false;
  const states = [];
  const client = {
    auth: {
      onAuthStateChange(fn) { callback = fn; fn('INITIAL_SESSION', session); return { data: { subscription: { unsubscribe() { unsubscribed = true; } } } }; },
      async getSession() { return { data: { session } }; },
    },
    from(table) {
      const query = {
        select() { return query; }, eq() { return query; }, order() { return query; },
        async limit() { return { data: [] }; },
        async maybeSingle() { return table === 'memberships' ? { data: await membership } : { data: null }; },
      };
      return query;
    },
  };
  const observer = observeSanctuaryAccess(client, value => states.push(value));
  return { observer, states, latest: () => states.at(-1), unsubscribed: () => unsubscribed,
    emit(event, userId) { session = userId ? { user: { id: userId } } : null; callback(event, session); },
    membership(value) { membership = value; } };
}

test('member display refreshes after sign-in and immediately locks on sign-out', async () => {
  const h = harness();
  try {
    await tick(5);
    assert.equal(h.latest().isMember, false);
    h.emit('SIGNED_IN', 'member');
    await tick(5);
    assert.equal(h.latest().isMember, true);
    h.emit('SIGNED_OUT', null);
    assert.equal(h.latest().isMember, false);
    await tick(5);
    assert.equal(h.latest().isAuthenticated, false);
  } finally { h.observer.dispose(); }
  assert.equal(h.unsubscribed(), true);
});

test('a membership created after SIGNED_IN can unlock without another login', async () => {
  const h = harness(null);
  try {
    h.emit('SIGNED_IN', 'new-member');
    await tick(5);
    assert.equal(h.latest().isMember, false);
    h.membership({ status: 'active' });
    h.observer.refresh();
    await tick(5);
    assert.equal(h.latest().isMember, true);
  } finally { h.observer.dispose(); }
});

test('an old membership response cannot unlock a signed-out or different account', async () => {
  let resolve;
  const h = harness(new Promise(done => { resolve = done; }));
  try {
    h.emit('SIGNED_IN', 'old-member');
    await tick(5);
    h.membership(null);
    h.emit('SIGNED_IN', 'other-account');
    await tick(5);
    resolve({ status: 'active' });
    await tick(5);
    assert.equal(h.latest().isMember, false);
    assert.equal(h.latest().isAuthenticated, true);
  } finally { h.observer.dispose(); }
});

test('unmount discards in-flight membership responses and unsubscribes', async () => {
  let resolve;
  const h = harness(new Promise(done => { resolve = done; }));
  h.emit('SIGNED_IN', 'member');
  await tick(5);
  h.observer.dispose();
  const count = h.states.length;
  resolve({ status: 'active' });
  await tick(5);
  assert.equal(h.states.length, count);
  assert.equal(h.unsubscribed(), true);
});
