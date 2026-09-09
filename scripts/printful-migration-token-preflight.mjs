#!/usr/bin/env node
/**
 * Check the dedicated migration credential using exactly three GET requests.
 * This checks permissions and store identity only. It never tests a write.
 * Public logs contain fixed labels only: no tokens, store IDs, or API payloads.
 */
import { pathToFileURL } from 'node:url';

const API_ORIGIN = 'https://api.printful.com';
const TIMEOUT_MS = 12_000;
const MAX_BYTES = 1024 * 1024;
export const REQUIRED_SCOPES = Object.freeze(['sync_products', 'file_library']);
const ERROR_CODES = new Set([
  'token_missing', 'invalid_token', 'invalid_arguments', 'invalid_configuration',
  'request_not_allowed', 'request_timeout', 'network_error', 'redirect_blocked',
  'http_unauthorized', 'http_forbidden', 'http_not_found', 'http_rate_limited',
  'http_error', 'response_too_large', 'invalid_response', 'missing_required_scope',
  'extra_scope_refused', 'store_not_found', 'store_ambiguous', 'store_mismatch',
  'internal_error',
]);
class SafeError extends Error {
  constructor(code) {
    super(ERROR_CODES.has(code) ? code : 'internal_error');
    this.code = this.message;
  }
}
const fail = (code) => { throw new SafeError(code); };
const object = (value) => value !== null && typeof value === 'object' && !Array.isArray(value);
const storeIdValid = (value) => Number.isSafeInteger(value) && value > 0 && value <= 999_999_999_999_999;

function tokenFrom(env) {
  const token = env?.PRINTFUL_MIGRATION_API_TOKEN;
  if (token === undefined || token === '') fail('token_missing');
  if (typeof token !== 'string' || token.length > 8192 || /\s|[\u0000-\u001f\u007f]/u.test(token)) fail('invalid_token');
  return token;
}

async function boundedResult(response, signal, maxBytes) {
  const length = response.headers.get('content-length');
  if (length && /^\d+$/u.test(length) && Number(length) > maxBytes) {
    await response.body?.cancel().catch(() => {});
    fail('response_too_large');
  }
  if (!response.body) fail('invalid_response');
  const reader = response.body.getReader();
  const chunks = [];
  let bytes = 0;
  try {
    for (;;) {
      if (signal.aborted) fail('request_timeout');
      const { done, value } = await reader.read();
      if (done) break;
      bytes += value.byteLength;
      if (bytes > maxBytes) {
        await reader.cancel().catch(() => {});
        fail('response_too_large');
      }
      chunks.push(value);
    }
  } finally { reader.releaseLock(); }
  const data = new Uint8Array(bytes);
  let offset = 0;
  for (const chunk of chunks) { data.set(chunk, offset); offset += chunk.byteLength; }
  let body;
  try { body = JSON.parse(new TextDecoder('utf-8', { fatal: true }).decode(data)); }
  catch { fail('invalid_response'); }
  if (!object(body) || !Object.hasOwn(body, 'result') || (Object.hasOwn(body, 'code') && body.code !== 200)) fail('invalid_response');
  return body.result;
}

function readOnlyClient({ token, fetchImpl, timeoutMs, maxResponseBytes }) {
  let requests = 0;
  let verifiedListStoreId;
  return {
    allowStoreId(id) {
      if (!storeIdValid(id) || requests !== 2 || verifiedListStoreId !== undefined) fail('request_not_allowed');
      verifiedListStoreId = id;
    },
    async get(path) {
      const nextPath = requests === 0 ? '/oauth/scopes' : requests === 1 ? '/stores'
        : requests === 2 && verifiedListStoreId !== undefined ? `/stores/${verifiedListStoreId}` : null;
      if (path !== nextPath) fail('request_not_allowed');
      requests += 1;
      const url = new URL(path, API_ORIGIN);
      if (url.origin !== API_ORIGIN || url.pathname !== path || url.search || url.hash) fail('request_not_allowed');
      const controller = new AbortController();
      let timer;
      const deadline = new Promise((_, reject) => {
        timer = setTimeout(() => {
          controller.abort();
          reject(new SafeError('request_timeout'));
        }, timeoutMs);
      });
      const request = async () => {
        let response;
        try {
          response = await fetchImpl(url.href, {
            method: 'GET', redirect: 'error', signal: controller.signal,
            headers: { Accept: 'application/json', Authorization: `Bearer ${token}` },
          });
        } catch { fail(controller.signal.aborted ? 'request_timeout' : 'network_error'); }
        if (response.redirected || (response.status >= 300 && response.status < 400)
            || (response.url && response.url !== url.href)) {
          await response.body?.cancel().catch(() => {});
          fail('redirect_blocked');
        }
        if (!response.ok) {
          await response.body?.cancel().catch(() => {});
          const codes = { 401: 'http_unauthorized', 403: 'http_forbidden', 404: 'http_not_found', 429: 'http_rate_limited' };
          fail(codes[response.status] ?? 'http_error');
        }
        return boundedResult(response, controller.signal, maxResponseBytes);
      };
      try { return await Promise.race([request(), deadline]); }
      catch (error) {
        if (error instanceof SafeError) throw error;
        fail(controller.signal.aborted ? 'request_timeout' : 'invalid_response');
      } finally { clearTimeout(timer); controller.abort(); }
    },
  };
}

function checkScopes(result) {
  if (!object(result) || !Array.isArray(result.scopes) || result.scopes.length > 100
      || !result.scopes.every((entry) => object(entry) && typeof entry.scope === 'string')) fail('invalid_response');
  const scopes = result.scopes.map((entry) => entry.scope);
  if (new Set(scopes).size !== scopes.length) fail('invalid_response');
  // Manage permissions include reads. Separate /read grants are redundant and refused.
  if (scopes.some((scope) => !REQUIRED_SCOPES.includes(scope))) fail('extra_scope_refused');
  if (REQUIRED_SCOPES.some((scope) => !scopes.includes(scope))) fail('missing_required_scope');
}

function expectedStore(store) {
  if (!object(store) || !storeIdValid(store.id) || store.type !== 'shopify' || typeof store.name !== 'string') return false;
  const name = store.name.trim().replace(/\s+/gu, ' ').toLowerCase();
  return name === 'charmed & dark' || name === 'charmed and dark';
}

function onlyStore(stores) {
  if (!Array.isArray(stores) || stores.length > 100 || !stores.every(object)) fail('invalid_response');
  if (stores.length === 0) fail('store_not_found');
  // A token exposing any second store is outside this task's single-store scope.
  if (stores.length !== 1) fail('store_ambiguous');
  if (!expectedStore(stores[0])) fail('store_mismatch');
  return stores[0].id;
}

export async function runPreflight({ env = process.env, fetchImpl = globalThis.fetch,
  timeoutMs = TIMEOUT_MS, maxResponseBytes = MAX_BYTES, args = [] } = {}) {
  const report = {
    status: 'blocked', mode: 'get_only', permissions_verified: false,
    store_verified: false, writes_performed: 0, writes_tested: false, checks: [],
  };
  let check = 'configuration';
  const passed = () => report.checks.push({ check, status: 'passed' });
  try {
    if (!Array.isArray(args) || args.length !== 0) fail('invalid_arguments');
    const token = tokenFrom(env);
    if (typeof fetchImpl !== 'function' || !Number.isInteger(timeoutMs) || timeoutMs < 1 || timeoutMs > TIMEOUT_MS
        || !Number.isInteger(maxResponseBytes) || maxResponseBytes < 1 || maxResponseBytes > MAX_BYTES) fail('invalid_configuration');
    passed();
    const client = readOnlyClient({ token, fetchImpl, timeoutMs, maxResponseBytes });
    check = 'exact_migration_scopes';
    checkScopes(await client.get('/oauth/scopes'));
    report.permissions_verified = true;
    passed();
    check = 'single_shopify_store';
    const storeId = onlyStore(await client.get('/stores'));
    client.allowStoreId(storeId);
    passed();
    check = 'shopify_store_identity';
    const store = await client.get(`/stores/${storeId}`);
    if (!expectedStore(store) || store.id !== storeId) fail('store_mismatch');
    report.store_verified = true;
    passed();
    report.status = 'verified';
  } catch (error) {
    report.error = error instanceof SafeError ? error.code : 'internal_error';
    if (report.error === 'token_missing') report.status = 'token_missing';
    report.checks.push({ check, status: 'failed' });
  }
  return report;
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const report = await runPreflight({ args: process.argv.slice(2) });
  process.stdout.write(`${JSON.stringify(report, null, 2)}\n`);
  process.exitCode = report.status === 'verified' ? 0 : 2;
}
