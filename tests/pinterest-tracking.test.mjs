import test from 'node:test';
import assert from 'node:assert/strict';
import { canTrackPinterest, trackPinterestPage } from '../lib/pinterest-tracking.js';

test('tracking is restricted to the public production storefront and honors browser opt-outs', () => {
  const context = { hostname: 'www.charmedanddark.com', pathname: '/shop/pillow', production: true };
  assert.equal(canTrackPinterest(context), true);
  for (const change of [{ hostname: 'preview.vercel.app' }, { production: false },
    { globalPrivacyControl: true }, { doNotTrack: '1' }, { doNotTrack: 'yes' },
    ...['/admin/promotions', '/auth/confirm', '/reset-password', '/recover-cart', '/sanctuary/grimoire'].map(pathname => ({ pathname }))]) {
    assert.equal(canTrackPinterest({ ...context, ...change }), false);
  }
});

test('loads one tag and counts each route visit once without customer identifiers', () => {
  const previous = process.env.NODE_ENV;
  process.env.NODE_ENV = 'production';
  try {
    const scripts = [];
    const win = { location: { hostname: 'www.charmedanddark.com' }, navigator: {} };
    const doc = { createElement: () => ({}), head: { appendChild: script => scripts.push(script) } };
    trackPinterestPage(win, doc, '/shop/pillow');
    trackPinterestPage(win, doc, '/shop/pillow');
    trackPinterestPage(win, doc, '/journal');
    trackPinterestPage(win, doc, '/shop/pillow');
    assert.equal(scripts.length, 1);
    assert.deepEqual(win.pintrk.queue, [
      ['load', '2612491816640'], ['page'],
      ['track', 'pagevisit'], ['track', 'pagevisit'], ['track', 'pagevisit'],
    ]);
  } finally {
    if (previous === undefined) delete process.env.NODE_ENV;
    else process.env.NODE_ENV = previous;
  }
});

test('cart tracking reports only added units, honors opt-outs, and cannot break shopping', async () => {
  const { trackPinterestAddToCart } = await import('../lib/pinterest-tracking.js');
  const previous = process.env.NODE_ENV;
  process.env.NODE_ENV = 'production';
  try {
    const calls = [];
    const win = { location: { hostname: 'www.charmedanddark.com', pathname: '/shop/blanket' }, navigator: {}, pintrk: (...args) => calls.push(args) };
    const item = { catalogId: 'BLANKET-SKU', price: 24.99, quantity: 5, currency: 'USD' };
    trackPinterestAddToCart(win, {}, item, 2);
    assert.deepEqual(calls.at(-1), ['track', 'addtocart', { value: 49.98, currency: 'USD', order_quantity: 2,
      line_items: [{ product_id: 'BLANKET-SKU', product_price: 24.99, product_quantity: 2 }] }]);
    const count = calls.length;
    for (const bad of [null, { ...item, price: NaN }, { ...item, catalogId: '' }, { ...item, currency: '' }]) trackPinterestAddToCart(win, {}, bad, 2);
    trackPinterestAddToCart(win, {}, item, 6);
    win.navigator.globalPrivacyControl = true;
    trackPinterestAddToCart(win, {}, item, 2);
    assert.equal(calls.length, count);
    win.navigator.globalPrivacyControl = false;
    win.pintrk = () => { throw new Error('blocked'); };
    assert.doesNotThrow(() => trackPinterestAddToCart(win, {}, item, 2));
  } finally {
    if (previous === undefined) delete process.env.NODE_ENV;
    else process.env.NODE_ENV = previous;
  }
});
