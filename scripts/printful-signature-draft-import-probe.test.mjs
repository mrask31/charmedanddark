import test from 'node:test';
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { SHOPIFY_PRODUCT_ID, SHOPIFY_VARIANT_IDS, runImportProbe } from './printful-signature-draft-import-probe.mjs';

const TOKEN = 'synthetic-read-only-secret';
const env = { PRINTFUL_API_TOKEN: TOKEN };
const scopes = { scopes: [{ scope: 'sync_products/read', display_name: TOKEN }] };
const store = { id: 719382, name: 'Charmed & Dark', type: 'shopify' };
function product(synced = 0) {
  return {
    sync_product: { id: 291721, external_id: SHOPIFY_PRODUCT_ID, store_id: store.id, variants: 21, synced, name: TOKEN },
    sync_variants: SHOPIFY_VARIANT_IDS.map((external_id, i) => ({
      id: 493021 + i, external_id, sync_product_id: 291721, synced: i < synced, sku: TOKEN,
      files: [{ id: 491883, url: `https://private.invalid/${TOKEN}`, preview_url: TOKEN }],
    })),
  };
}
const json = (result) => new Response(JSON.stringify({ code: 200, result }));
function fixture(results = [scopes, [store], store, product()]) {
  const calls = [];
  return {
    calls, fetchImpl: async (url, options) => {
      calls.push({ url, options });
      assert.ok(calls.length <= results.length, 'No unplanned requests');
      const value = results[calls.length - 1];
      return value instanceof Response ? value : json(value);
    },
  };
}
function sanitized(report) {
  const output = JSON.stringify(report);
  for (const forbidden of [TOKEN, String(store.id), '291721', '493021', SHOPIFY_PRODUCT_ID, ...SHOPIFY_VARIANT_IDS, 'https://', 'sku', 'preview_url']) {
    assert.equal(output.includes(forbidden), false);
  }
  assert.equal(report.writes_performed, 0);
  assert.equal(report.writes_tested, false);
}
async function blocked(results, error, requests) {
  const f = fixture(results);
  const report = await runImportProbe({ env, fetchImpl: f.fetchImpl });
  assert.equal(report.status, 'blocked');
  assert.equal(report.error, error);
  assert.equal(f.calls.length, requests);
  sanitized(report);
}

test('fixed 21-variant draft import is observed using exactly four GETs', async () => {
  const f = fixture();
  const report = await runImportProbe({ env, fetchImpl: f.fetchImpl });
  assert.equal(report.status, 'imported');
  assert.equal(report.product_verified, true);
  assert.equal(report.store_verified, true);
  assert.deepEqual(report.variant_counts, { variants: 21, synced_variants: 0, unsynced_variants: 21, all_synced: false, ignored_variants: 0, product_ignored: false });
  assert.deepEqual(f.calls.map(({ url }) => url), [
    'https://api.printful.com/oauth/scopes', 'https://api.printful.com/stores',
    `https://api.printful.com/stores/${store.id}`, 'https://api.printful.com/sync/products/@8641656848418',
  ]);
  for (const { options } of f.calls) {
    assert.equal(options.method, 'GET');
    assert.equal(options.redirect, 'error');
    assert.equal(options.body, undefined);
    assert.deepEqual(options.headers, { Accept: 'application/json', Authorization: `Bearer ${TOKEN}` });
  }
  sanitized(report);
});

test('synced and ignored states are reported as counts without changing import interpretation', async () => {
  for (const count of [2, 21]) {
    const p = product(count);
    p.sync_product.is_ignored = true;
    p.sync_variants[0].is_ignored = true;
    p.sync_variants.reverse();
    // Numeric API external IDs and order changes are legitimate.
    p.sync_product.external_id = Number(p.sync_product.external_id);
    p.sync_variants[0].external_id = Number(p.sync_variants[0].external_id);
    const f = fixture([scopes, [store], store, p]);
    const report = await runImportProbe({ env, fetchImpl: f.fetchImpl });
    assert.equal(report.status, 'imported');
    assert.equal(report.variant_counts.synced_variants, count);
    assert.equal(report.variant_counts.all_synced, count === 21);
    assert.equal(report.variant_counts.ignored_variants, 1);
    assert.equal(report.variant_counts.product_ignored, true);
    sanitized(report);
  }
});

test('404 on the fixed product means not_imported, while 404 elsewhere remains a failure', async () => {
  const f = fixture([scopes, [store], store, new Response(TOKEN, { status: 404 })]);
  const report = await runImportProbe({ env, fetchImpl: f.fetchImpl });
  assert.equal(report.status, 'not_imported');
  assert.equal(report.store_verified, true);
  assert.equal(report.product_verified, false);
  assert.equal(report.variant_counts, null);
  assert.equal(report.error, undefined);
  assert.equal(f.calls.length, 4);
  sanitized(report);
  await blocked([new Response(TOKEN, { status: 404 })], 'http_not_found', 1);
  await blocked([scopes, [store], new Response(TOKEN, { status: 404 })], 'http_not_found', 3);
  for (const [status, error] of [[401, 'http_unauthorized'], [403, 'http_forbidden'], [429, 'http_rate_limited'], [500, 'http_error']]) {
    await blocked([scopes, [store], store, new Response(TOKEN, { status })], error, 4);
  }
});

test('only required product read and optional store/file read scopes are accepted', async () => {
  for (const extra of ['sync_products', 'file_library', 'orders/read', 'webhooks/read', TOKEN]) {
    await blocked([{ scopes: [...scopes.scopes, { scope: extra }] }], 'extra_scope_refused', 1);
  }
  await blocked([{ scopes: [{ scope: 'file_library/read' }] }], 'missing_required_scope', 1);
  await blocked([{ scopes: [...scopes.scopes, ...scopes.scopes] }], 'invalid_response', 1);
  const optional = { scopes: [...scopes.scopes, { scope: 'stores_list/read' }, { scope: 'file_library/read' }] };
  const f = fixture([optional, [store], store, product()]);
  assert.equal((await runImportProbe({ env, fetchImpl: f.fetchImpl })).status, 'imported');
});

test('single expected Shopify store and detail identity are mandatory before draft lookup', async () => {
  await blocked([scopes, []], 'store_not_found', 2);
  await blocked([scopes, [store, { ...store, id: 3 }]], 'store_ambiguous', 2);
  for (const changed of [{ id: 0 }, { id: '719382' }, { name: TOKEN }, { type: 'api' }]) {
    await blocked([scopes, [{ ...store, ...changed }]], 'store_mismatch', 2);
  }
  await blocked([scopes, [store], { ...store, id: 9 }], 'store_mismatch', 3);
  await blocked([scopes, [store], { ...store, name: TOKEN }], 'store_mismatch', 3);
});

test('product external ID, private store binding and product shape must match', async () => {
  for (const changed of [{ external_id: '12345' }, { id: 0 }]) {
    const p = product(); Object.assign(p.sync_product, changed);
    await blocked([scopes, [store], store, p], 'product_mismatch', 4);
  }
  const wrongStore = product(); wrongStore.sync_product.store_id = 9;
  await blocked([scopes, [store], store, wrongStore], 'store_mismatch', 4);
  await blocked([scopes, [store], store, { sync_product: null, sync_variants: [] }], 'invalid_response', 4);
});

test('all 21 exact external variants must be present once with consistent sync counts', async () => {
  const mutations = [
    (p) => p.sync_variants.pop(),
    (p) => p.sync_variants.push({ ...p.sync_variants[0], id: 1 }),
    (p) => { p.sync_variants[0].external_id = '999999'; },
    (p) => { p.sync_variants[0].external_id = p.sync_variants[1].external_id; },
    (p) => { p.sync_variants[0].id = p.sync_variants[1].id; },
    (p) => { p.sync_variants[0].sync_product_id = 9; },
    (p) => { p.sync_variants[0].synced = null; },
    (p) => { p.sync_variants[0].is_ignored = 'false'; },
    (p) => { p.sync_product.variants = 20; },
    (p) => { p.sync_product.synced = 1; },
    (p) => { p.sync_product.is_ignored = 'false'; },
  ];
  for (const mutate of mutations) {
    const p = product(); mutate(p);
    await blocked([scopes, [store], store, p], 'variant_mismatch', 4);
  }
});

test('missing read credential, malformed credential and external args never make requests', async () => {
  for (const [overrides, error] of [
    [{ env: {} }, 'token_missing'],
    [{ env: { PRINTFUL_MIGRATION_API_TOKEN: TOKEN } }, 'token_missing'],
    [{ env: { PRINTFUL_API_TOKEN: 'has space' } }, 'invalid_token'],
    [{ args: ['--product', '99999'] }, 'invalid_arguments'],
    [{ timeoutMs: 12001 }, 'invalid_configuration'],
  ]) {
    const report = await runImportProbe({ env, fetchImpl: () => assert.fail('Must not request'), ...overrides });
    assert.equal(report.error, error);
    sanitized(report);
  }
});

test('redirect and network exceptions are sanitized without following locations', async () => {
  await blocked([new Response(TOKEN, { status: 302, headers: { location: 'https://private.invalid' } })], 'redirect_blocked', 1);
  const differentUrl = json(scopes);
  Object.defineProperty(differentUrl, 'url', { value: 'https://private.invalid/scopes' });
  await blocked([differentUrl], 'redirect_blocked', 1);
  const report = await runImportProbe({ env, fetchImpl: async () => { throw new Error(TOKEN); } });
  assert.equal(report.error, 'network_error');
  sanitized(report);
});

test('malformed and oversized responses never enter the report', async () => {
  for (const response of [new Response(TOKEN), new Response(JSON.stringify({ code: 403, result: TOKEN })), json({ scopes: null })]) {
    await blocked([response], 'invalid_response', 1);
  }
  await blocked([new Response(TOKEN, { headers: { 'content-length': '1048577' } })], 'response_too_large', 1);
  await blocked([new Response('x'.repeat(1048577))], 'response_too_large', 1);
});

test('deadlines bound both fetch and stalled response bodies', async () => {
  for (const fetchImpl of [
    () => new Promise(() => {}),
    async () => new Response(new ReadableStream({ start(c) { c.enqueue(new TextEncoder().encode('{')); } })),
  ]) {
    const report = await runImportProbe({ env, fetchImpl, timeoutMs: 10 });
    assert.equal(report.error, 'request_timeout');
    sanitized(report);
  }
});

test('CLI refuses arguments and does not fall back to migration credential', () => {
  for (const [args, error] of [[[], 'token_missing'], [['--url', 'https://private.invalid'], 'invalid_arguments']]) {
    const proc = spawnSync(process.execPath, [fileURLToPath(new URL('./printful-signature-draft-import-probe.mjs', import.meta.url)), ...args], {
      env: { PATH: process.env.PATH, PRINTFUL_MIGRATION_API_TOKEN: TOKEN }, encoding: 'utf8', timeout: 5000,
    });
    assert.equal(proc.status, 2);
    assert.equal(proc.stderr, '');
    const report = JSON.parse(proc.stdout);
    assert.equal(report.error, error);
    sanitized(report);
  }
});
