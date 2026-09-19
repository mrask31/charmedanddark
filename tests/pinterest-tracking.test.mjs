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
