import test from 'node:test';
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { REQUIRED_SCOPES, runPreflight } from './printful-migration-token-preflight.mjs';

const TOKEN = 'synthetic-migration-secret-never-output';
const env = { PRINTFUL_MIGRATION_API_TOKEN: TOKEN };
const store = { id: 617382, name: 'Charmed & Dark', type: 'shopify', private_note: TOKEN };
const scopes = { scopes: REQUIRED_SCOPES.map((scope) => ({ scope, display_name: TOKEN })) };
const json = (result) => new Response(JSON.stringify({ code: 200, result }), { headers: { 'content-type': 'application/json' } });
function fixture(results = [scopes, [store], store]) {
  const calls = [];
  return {
    calls,
    fetchImpl: async (url, options) => {
      calls.push({ url, options });
      assert.ok(calls.length <= results.length, 'No unexpected network requests');
      const result = results[calls.length - 1];
      return result instanceof Response ? result : json(result);
    },
  };
}
function noPrivateData(report) {
  const output = JSON.stringify(report);
  for (const value of [TOKEN, String(store.id), store.name, 'https://', 'private_note']) assert.equal(output.includes(value), false);
  assert.equal(report.writes_performed, 0);
  assert.equal(report.writes_tested, false);
}
async function blocked(results, error, expectedCalls) {
  const f = fixture(results);
  const report = await runPreflight({ env, fetchImpl: f.fetchImpl });
  assert.equal(report.status, 'blocked');
  assert.equal(report.error, error);
  assert.equal(f.calls.length, expectedCalls);
  noPrivateData(report);
  return report;
}

test('exact scopes and one identified store succeed with three fixed GETs', async () => {
  const f = fixture();
  const report = await runPreflight({ env, fetchImpl: f.fetchImpl });
  assert.equal(report.status, 'verified');
  assert.equal(report.permissions_verified, true);
  assert.equal(report.store_verified, true);
  assert.deepEqual(f.calls.map(({ url }) => url), [
    'https://api.printful.com/oauth/scopes', 'https://api.printful.com/stores',
    `https://api.printful.com/stores/${store.id}`,
  ]);
  for (const { options } of f.calls) {
    assert.equal(options.method, 'GET');
    assert.equal(options.redirect, 'error');
    assert.equal(options.body, undefined);
    assert.deepEqual(options.headers, { Accept: 'application/json', Authorization: `Bearer ${TOKEN}` });
    assert.ok(options.signal instanceof AbortSignal);
  }
  noPrivateData(report);
});

test('missing dedicated token is fixed token_missing and never falls back', async () => {
  for (const missingEnv of [{}, { PRINTFUL_MIGRATION_API_TOKEN: '' }, { PRINTFUL_API_TOKEN: TOKEN }]) {
    const report = await runPreflight({ env: missingEnv, fetchImpl: () => assert.fail('Network must not run') });
    assert.equal(report.status, 'token_missing');
    assert.equal(report.error, 'token_missing');
    assert.equal(report.permissions_verified, false);
    noPrivateData(report);
  }
});

test('token format, CLI arguments and operational bounds fail before networking', async () => {
  const cases = [
    [{ env: { PRINTFUL_MIGRATION_API_TOKEN: 'has space' } }, 'invalid_token'],
    [{ env: { PRINTFUL_MIGRATION_API_TOKEN: 'has\nnewline' } }, 'invalid_token'],
    [{ env: { PRINTFUL_MIGRATION_API_TOKEN: null } }, 'invalid_token'],
    [{ env: { PRINTFUL_MIGRATION_API_TOKEN: 'a'.repeat(8193) } }, 'invalid_token'],
    [{ args: ['https://untrusted.invalid'] }, 'invalid_arguments'],
    [{ timeoutMs: 0 }, 'invalid_configuration'],
    [{ timeoutMs: 12001 }, 'invalid_configuration'],
    [{ maxResponseBytes: 1048577 }, 'invalid_configuration'],
    [{ maxResponseBytes: 0 }, 'invalid_configuration'],
  ];
  for (const [overrides, error] of cases) {
    const report = await runPreflight({ env, fetchImpl: () => assert.fail('Network must not run'), ...overrides });
    assert.equal(report.error, error);
    noPrivateData(report);
  }
});

test('scope failures stop before store discovery and never echo arbitrary labels', async () => {
  for (const required of REQUIRED_SCOPES) {
    await blocked([{ scopes: [{ scope: required }] }], 'missing_required_scope', 1);
  }
  for (const extra of ['orders', 'orders/read', 'webhooks', 'sync_products/read', 'file_library/read', 'stores_list/read', TOKEN]) {
    await blocked([{ scopes: [...scopes.scopes, { scope: extra, display_name: TOKEN }] }], 'extra_scope_refused', 1);
  }
  await blocked([{ scopes: [] }], 'missing_required_scope', 1);
  await blocked([{ scopes: [...scopes.scopes, scopes.scopes[0]] }], 'invalid_response', 1);
  await blocked([{ scopes: ['sync_products', 'file_library'] }], 'invalid_response', 1);
  await blocked([{ scopes: [{ scope: 12 }] }], 'invalid_response', 1);
  await blocked([{ scopes: new Array(101).fill({ scope: 'sync_products' }) }], 'invalid_response', 1);
});

test('selection requires exactly one matching Shopify store', async () => {
  await blocked([scopes, []], 'store_not_found', 2);
  await blocked([scopes, [store, { ...store, id: 9, name: 'Other store' }]], 'store_ambiguous', 2);
  await blocked([scopes, [store, store]], 'store_ambiguous', 2);
  for (const changed of [
    { name: TOKEN }, { type: 'api' }, { id: 0 }, { id: -1 }, { id: '617382' },
    { id: 1.5 }, { id: 1000000000000000 }, { name: null },
  ]) await blocked([scopes, [{ ...store, ...changed }]], 'store_mismatch', 2);
  await blocked([scopes, null], 'invalid_response', 2);
  await blocked([scopes, [null]], 'invalid_response', 2);
});

test('detail must match the observed ID and brand identity exactly', async () => {
  for (const changed of [{ id: 8 }, { name: 'Another store' }, { type: 'api' }]) {
    const report = await blocked([scopes, [store], { ...store, ...changed }], 'store_mismatch', 3);
    assert.equal(report.store_verified, false);
    assert.equal(report.permissions_verified, true);
  }
});

test('only documented brand whitespace and and/& normalization is accepted', async () => {
  const normalized = { ...store, name: '  CHARMED  and DARK  ' };
  const f = fixture([scopes, [normalized], normalized]);
  const report = await runPreflight({ env, fetchImpl: f.fetchImpl });
  assert.equal(report.status, 'verified');
  noPrivateData(report);
});

test('HTTP errors are sanitized and their bodies are discarded', async () => {
  for (const [status, error] of [[401, 'http_unauthorized'], [403, 'http_forbidden'], [404, 'http_not_found'], [429, 'http_rate_limited'], [500, 'http_error']]) {
    await blocked([new Response(TOKEN, { status })], error, 1);
  }
});

test('redirect responses and unexpected final origins never pass', async () => {
  await blocked([new Response(TOKEN, { status: 302, headers: { location: `https://untrusted.invalid/${TOKEN}` } })], 'redirect_blocked', 1);
  const redirected = json(scopes);
  Object.defineProperty(redirected, 'redirected', { value: true });
  await blocked([redirected], 'redirect_blocked', 1);
  const wrongUrl = json(scopes);
  Object.defineProperty(wrongUrl, 'url', { value: 'https://untrusted.invalid/scopes' });
  await blocked([wrongUrl], 'redirect_blocked', 1);
});

test('network exception text never enters output', async () => {
  const report = await runPreflight({ env, fetchImpl: async () => { throw new Error(TOKEN); } });
  assert.equal(report.error, 'network_error');
  noPrivateData(report);
});

test('malformed JSON, UTF8, envelope and body shapes are sanitized', async () => {
  for (const response of [
    new Response(TOKEN), new Response(new Uint8Array([255, 254])),
    new Response(JSON.stringify({ error: TOKEN })), new Response(JSON.stringify({ code: 403, result: scopes })),
    new Response(null), json(null), json({ scopes: null }),
  ]) await blocked([response], 'invalid_response', 1);
});

test('announced and streamed response bytes are capped', async () => {
  for (const response of [
    new Response(TOKEN, { headers: { 'content-length': '1048577' } }),
    new Response('x'.repeat(1048577)),
  ]) await blocked([response], 'response_too_large', 1);
});

test('deadline bounds fetch that ignores abort', async () => {
  const report = await runPreflight({ env, timeoutMs: 10, fetchImpl: () => new Promise(() => {}) });
  assert.equal(report.error, 'request_timeout');
  noPrivateData(report);
});

test('deadline also bounds a response body that never finishes', async () => {
  const response = new Response(new ReadableStream({ start(controller) { controller.enqueue(new TextEncoder().encode('{')); } }));
  const report = await runPreflight({ env, timeoutMs: 10, fetchImpl: async () => response });
  assert.equal(report.error, 'request_timeout');
  noPrivateData(report);
});

test('CLI missing token exits nonzero with parseable sanitized output', () => {
  const proc = spawnSync(process.execPath, [fileURLToPath(new URL('./printful-migration-token-preflight.mjs', import.meta.url))], {
    encoding: 'utf8', env: { PATH: process.env.PATH, PRINTFUL_API_TOKEN: TOKEN }, timeout: 5000,
  });
  assert.equal(proc.status, 2);
  assert.equal(proc.stderr, '');
  const report = JSON.parse(proc.stdout);
  assert.equal(report.status, 'token_missing');
  noPrivateData(report);
});

test('CLI refuses all arguments before credentials or networking', () => {
  const proc = spawnSync(process.execPath, [fileURLToPath(new URL('./printful-migration-token-preflight.mjs', import.meta.url)), '--url', 'https://untrusted.invalid'], {
    encoding: 'utf8', env: { PATH: process.env.PATH }, timeout: 5000,
  });
  assert.equal(proc.status, 2);
  assert.equal(proc.stderr, '');
  const report = JSON.parse(proc.stdout);
  assert.equal(report.error, 'invalid_arguments');
  noPrivateData(report);
});
