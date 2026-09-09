import test from 'node:test';
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { runProbe, API_ORIGIN, EXPECTED_SHOPIFY_PRODUCT_ID } from './printful-readonly-probe.mjs';

const TEST_TOKEN = 'test-secret-never-printed';
const env = { PRINTFUL_API_TOKEN: TEST_TOKEN };
const store = { id: 123456, type: 'shopify', name: 'Charmed & Dark' };
const scopes = { scopes: [{ scope: 'sync_products/read' }, { scope: 'stores_list/read' }] };
const product = () => ({
  sync_product: { id: 100, external_id: EXPECTED_SHOPIFY_PRODUCT_ID, variants: 1, synced: 1, is_ignored: false },
  sync_variants: [{ id: 200, sync_product_id: 100, variant_id: 300, synced: true, is_ignored: false, files: [
    { type: 'default', status: 'ok', url: 'https://private.example/secret-art.png', filename: 'private-file-name.png' },
    { type: 'preview', status: 'ok', preview_url: 'https://private.example/preview.png' },
  ] }],
});
const response = (result, options = {}) => new Response(JSON.stringify({ code: 200, result }), {
  headers: { 'content-type': 'application/json' }, ...options,
});
function mockFetch(results = [scopes, [store], store, product()]) {
  const calls = [];
  return {
    calls,
    fetchImpl: async (url, options) => {
      calls.push({ url, ...options });
      assert.ok(calls.length <= results.length, 'unexpected extra network request');
      const result = results[calls.length - 1];
      if (typeof result === 'function') return result(url, options);
      return result instanceof Response ? result : response(result);
    },
  };
}
function assertRedacted(report) {
  const json = JSON.stringify(report);
  assert.equal(json.includes(TEST_TOKEN), false);
  assert.equal(json.includes('private.example'), false);
  assert.equal(json.includes('private-file-name'), false);
  assert.equal(json.includes('Bearer'), false);
  assert.equal(json.includes('Charmed & Dark'), false);
  assert.equal(json.includes('123456'), false);
  assert.equal(json.includes(EXPECTED_SHOPIFY_PRODUCT_ID), false);
}

test('known product succeeds with GET only, fixed origin, no redirects and scoped store headers', async () => {
  const mock = mockFetch();
  const report = await runProbe({ env, fetchImpl: mock.fetchImpl });
  assert.equal(report.status, 'verified');
  assert.equal(report.store_verified, true);
  assert.equal(report.known_product_verified, true);
  assert.deepEqual(mock.calls.map(({ url }) => new URL(url).pathname), [
    '/oauth/scopes', '/stores', '/stores/123456', `/sync/products/@${EXPECTED_SHOPIFY_PRODUCT_ID}`,
  ]);
  for (const call of mock.calls) {
    assert.equal(new URL(call.url).origin, API_ORIGIN);
    assert.equal(call.method, 'GET');
    assert.equal(call.redirect, 'error');
    assert.equal(call.headers.Authorization, `Bearer ${TEST_TOKEN}`);
    assert.equal(call.body, undefined);
  }
  assert.equal(mock.calls[0].headers['X-PF-Store-Id'], undefined);
  assert.equal(mock.calls[2].headers['X-PF-Store-Id'], '123456');
  assert.equal(mock.calls[3].headers['X-PF-Store-Id'], '123456');
  assert.equal(report.product.syncedVariants, 1);
  assert.equal(report.product.artworkFileReferences, 1);
  assert.equal(report.product.previewFileReferences, 1);
  assertRedacted(report);
});

test('optional file read permission is allowed', async () => {
  const mock = mockFetch([{ scopes: [...scopes.scopes, { scope: 'file_library/read' }] }, [store], store, product()]);
  assert.equal((await runProbe({ env, fetchImpl: mock.fetchImpl })).status, 'verified');
});

test('store list access is proved by GET even when its optional scope is not listed', async () => {
  const minimalScopes = { scopes: [{ scope: 'sync_products/read' }] };
  const mock = mockFetch([minimalScopes, [store], store, product()]);
  assert.equal((await runProbe({ env, fetchImpl: mock.fetchImpl })).status, 'verified');
  assert.equal(mock.calls.length, 4);
});

test('missing store access still fails closed at the actual GET response', async () => {
  const minimalScopes = { scopes: [{ scope: 'sync_products/read' }] };
  const mock = mockFetch([minimalScopes, new Response(TEST_TOKEN, { status: 403 })]);
  const report = await runProbe({ env, fetchImpl: mock.fetchImpl });
  assert.equal(report.error, 'http_forbidden');
  assert.deepEqual(report.checks.at(-1), { check: 'shopify_store_selection', status: 'failed' });
  assert.equal(mock.calls.length, 2);
  assertRedacted(report);
});

test('missing or malformed configuration performs zero network requests', async (t) => {
  for (const [config, error] of [
    [{}, 'missing_token'], [{ PRINTFUL_API_TOKEN: '' }, 'missing_token'],
    [{ PRINTFUL_API_TOKEN: 'token\nunsafe' }, 'invalid_token'],
    [{ ...env, PRINTFUL_STORE_ID: '123/x' }, 'invalid_store_id'],
    [{ ...env, PRINTFUL_STORE_ID: '9007199254740993' }, 'invalid_store_id'],
    [{ ...env, PRINTFUL_STORE_ID: '-1' }, 'invalid_store_id'],
  ]) await t.test(error + JSON.stringify(Object.keys(config)), async () => {
    let calls = 0;
    const report = await runProbe({ env: config, fetchImpl: async () => { calls += 1; } });
    assert.equal(report.error, error);
    assert.equal(calls, 0);
  });
});

test('write and unrelated OAuth scopes are refused before store requests', async (t) => {
  for (const extraScope of ['sync_products', 'orders/read', 'orders', 'webhooks', 'account', TEST_TOKEN]) {
    await t.test(extraScope === TEST_TOKEN ? 'untrusted scope name' : extraScope, async () => {
      const mock = mockFetch([{ scopes: [...scopes.scopes, { scope: extraScope }] }]);
      const report = await runProbe({ env, fetchImpl: mock.fetchImpl });
      assert.equal(report.error, 'extra_scope_refused');
      assert.equal(mock.calls.length, 1);
      assertRedacted(report);
    });
  }
});

test('missing required scope and malformed scope envelope are blocked', async (t) => {
  for (const [data, code] of [
    [{ scopes: [{ scope: 'stores_list/read' }] }, 'missing_required_scope'],
    [['sync_products/read', 'stores_list/read'], 'invalid_response'],
    [{ scopes: ['sync_products/read'] }, 'invalid_response'],
  ]) await t.test(code, async () => {
    const mock = mockFetch([data]);
    assert.equal((await runProbe({ env, fetchImpl: mock.fetchImpl })).error, code);
    assert.equal(mock.calls.length, 1);
  });
});

test('scope diagnostics identify known extra permissions while hiding untrusted labels', async () => {
  const mock = mockFetch([{ scopes: [
    ...scopes.scopes,
    { scope: 'sync_products', display_name: TEST_TOKEN },
    { scope: 'orders/read' },
    { scope: 'orders/read' },
    { scope: TEST_TOKEN, display_name: 'private.example' },
  ] }]);
  const report = await runProbe({ env, fetchImpl: mock.fetchImpl });
  assert.equal(report.error, 'extra_scope_refused');
  assert.deepEqual(report.permissions, {
    recognized_scopes: ['sync_products/read', 'stores_list/read', 'orders/read', 'sync_products'],
    unrecognized_scope_count: 1,
    missing_required_scopes: [],
  });
  assert.equal(mock.calls.length, 1);
  assertRedacted(report);
});

test('write permission never substitutes for the required read permission', async () => {
  const mock = mockFetch([{ scopes: [{ scope: 'sync_products' }] }]);
  const report = await runProbe({ env, fetchImpl: mock.fetchImpl });
  assert.equal(report.error, 'extra_scope_refused');
  assert.deepEqual(report.permissions.missing_required_scopes, ['sync_products/read']);
  assert.equal(mock.calls.length, 1);
  assertRedacted(report);
});

test('wrong, ambiguous, and non-Shopify stores stop before product access', async (t) => {
  for (const [stores, config, expected] of [
    [[{ ...store, name: 'Other store' }], env, 'store_not_found'],
    [[{ ...store, type: 'etsy' }], env, 'store_not_found'],
    [[store, { ...store, id: 999 }], env, 'store_ambiguous'],
    [[store], { ...env, PRINTFUL_STORE_ID: '999' }, 'store_not_found'],
    [[{ ...store, name: TEST_TOKEN }], { ...env, PRINTFUL_STORE_ID: '123456' }, 'store_mismatch'],
  ]) await t.test(expected, async () => {
    const mock = mockFetch([scopes, stores]);
    const report = await runProbe({ env: config, fetchImpl: mock.fetchImpl });
    assert.equal(report.error, expected);
    assert.equal(mock.calls.length, 2);
    assertRedacted(report);
  });
});

test('explicit store ID disambiguates only a matching Shopify store', async () => {
  const mock = mockFetch([scopes, [store, { ...store, id: 999 }], store, product()]);
  assert.equal((await runProbe({ env: { ...env, PRINTFUL_STORE_ID: '123456' }, fetchImpl: mock.fetchImpl })).status, 'verified');
});

test('store identity is rechecked before known product fetch', async (t) => {
  for (const changed of [{ ...store, id: 999 }, { ...store, type: 'etsy' }, { ...store, name: TEST_TOKEN }]) {
    await t.test('changed identity', async () => {
      const mock = mockFetch([scopes, [store], changed]);
      const report = await runProbe({ env, fetchImpl: mock.fetchImpl });
      assert.equal(report.error, 'store_mismatch');
      assert.equal(mock.calls.length, 3);
      assertRedacted(report);
    });
  }
});

test('wrong external product ID and store ID are blocked without exposing upstream fields', async (t) => {
  for (const [changed, expected] of [
    [{ external_id: TEST_TOKEN }, 'product_mismatch'],
    [{ store_id: 999 }, 'store_mismatch'],
    [{ variants: 2 }, 'variant_mismatch'],
  ]) await t.test(expected, async () => {
    const item = product();
    Object.assign(item.sync_product, changed);
    const mock = mockFetch([scopes, [store], store, item]);
    const report = await runProbe({ env, fetchImpl: mock.fetchImpl });
    assert.equal(report.error, expected);
    assertRedacted(report);
  });
});

test('unsynced variants, missing artwork and pending artwork are not reported verified', async (t) => {
  for (const [adjust, expected] of [
    [(p) => { p.sync_product.synced = 0; p.sync_variants[0].synced = false; }, 'product_not_fully_synced'],
    [(p) => { p.sync_variants[0].files = [{ type: 'preview', status: 'ok' }]; }, 'missing_artwork'],
    [(p) => { p.sync_variants[0].files[0].status = 'waiting'; }, 'artwork_not_ready'],
    [(p) => { p.sync_variants[0].files[0].status = 'failed'; }, 'artwork_not_ready'],
  ]) await t.test(expected, async () => {
    const item = product(); adjust(item);
    const mock = mockFetch([scopes, [store], store, item]);
    assert.equal((await runProbe({ env, fetchImpl: mock.fetchImpl })).error, expected);
  });
});

test('ignored products and invalid fulfillment identities cannot pass', async (t) => {
  for (const [adjust, expected] of [
    [(p) => { p.sync_product.is_ignored = true; }, 'product_ignored'],
    [(p) => { p.sync_variants[0].is_ignored = true; }, 'product_ignored'],
    [(p) => { p.sync_product.id = 0; }, 'product_mismatch'],
    [(p) => { delete p.sync_product.id; }, 'product_mismatch'],
    [(p) => { p.sync_variants[0].id = 0; }, 'variant_mismatch'],
    [(p) => { delete p.sync_variants[0].variant_id; }, 'variant_mismatch'],
    [(p) => { p.sync_variants[0].variant_id = -1; }, 'variant_mismatch'],
    [(p) => { p.sync_variants[0].sync_product_id = 999; }, 'variant_mismatch'],
  ]) await t.test(expected, async () => {
    const item = product(); adjust(item);
    const mock = mockFetch([scopes, [store], store, item]);
    const report = await runProbe({ env, fetchImpl: mock.fetchImpl });
    assert.equal(report.error, expected);
    assert.equal(report.known_product_verified, false);
    assertRedacted(report);
  });
});

test('redirect response is blocked and no second request is sent', async () => {
  const mock = mockFetch([new Response('', { status: 302, headers: { location: 'https://attacker.example' } })]);
  const report = await runProbe({ env, fetchImpl: mock.fetchImpl });
  assert.equal(report.error, 'redirect_blocked');
  assert.equal(mock.calls.length, 1);
});

test('unexpected response URL is blocked even for an injected fetch implementation', async () => {
  const redirected = response(scopes);
  Object.defineProperty(redirected, 'url', { value: 'https://attacker.example' });
  const mock = mockFetch([redirected]);
  assert.equal((await runProbe({ env, fetchImpl: mock.fetchImpl })).error, 'redirect_blocked');
});

test('HTTP bodies and network exception messages never enter the report', async (t) => {
  for (const status of [401, 403, 404, 429, 500]) await t.test(String(status), async () => {
    const mock = mockFetch([new Response(TEST_TOKEN, { status })]);
    const report = await runProbe({ env, fetchImpl: mock.fetchImpl });
    assert.equal(report.status, 'blocked'); assertRedacted(report);
  });
  const report = await runProbe({ env, fetchImpl: async () => { throw new Error(TEST_TOKEN); } });
  assert.equal(report.error, 'network_error'); assertRedacted(report);
});

test('response size is bounded with or without content-length', async (t) => {
  for (const withHeader of [true, false]) await t.test(String(withHeader), async () => {
    const headers = withHeader ? { 'content-length': '10000' } : {};
    const mock = mockFetch([new Response('x'.repeat(10000), { headers })]);
    assert.equal((await runProbe({ env, fetchImpl: mock.fetchImpl, maxResponseBytes: 50 })).error, 'response_too_large');
  });
});

test('malformed JSON is a fixed error', async () => {
  const mock = mockFetch([new Response(`not-json ${TEST_TOKEN}`)]);
  const report = await runProbe({ env, fetchImpl: mock.fetchImpl });
  assert.equal(report.error, 'invalid_response'); assertRedacted(report);
});

test('timeout covers a fetch that never resolves', async () => {
  const report = await runProbe({ env, timeoutMs: 10, fetchImpl: async () => new Promise(() => {}) });
  assert.equal(report.error, 'request_timeout'); assertRedacted(report);
});

test('CLI refuses arguments without echoing them and returns only redacted JSON', () => {
  const result = spawnSync(process.execPath, [fileURLToPath(new URL('./printful-readonly-probe.mjs', import.meta.url)), '--token', TEST_TOKEN], {
    encoding: 'utf8', env: {},
  });
  assert.equal(result.status, 1);
  assert.equal(result.stderr, '');
  const report = JSON.parse(result.stdout);
  assert.equal(report.error, 'request_not_allowed'); assertRedacted(report);
});
