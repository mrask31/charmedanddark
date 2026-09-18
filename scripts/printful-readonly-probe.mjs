#!/usr/bin/env node
/**
 * Charmed & Dark: deliberately restricted, read-only Printful connectivity probe.
 * Requires Node 22+. No dependencies, credentials in arguments, or write endpoints.
 */
import { pathToFileURL } from 'node:url';

export const API_ORIGIN = 'https://api.printful.com';
export const EXPECTED_SHOPIFY_PRODUCT_ID = '8636169617442';
export const REQUIRED_SCOPES = Object.freeze(['sync_products/read']);
// Store/file read scope visibility varies by token configuration. The actual GET
// requests below independently prove access; they never bypass a 403 response.
export const ALLOWED_SCOPES = Object.freeze([...REQUIRED_SCOPES, 'stores_list/read', 'file_library/read']);
// These public permission identifiers are diagnostic labels, not additional grants.
// Never print unknown upstream strings or display_name values into public job logs.
const KNOWN_SCOPE_LABELS = Object.freeze([
  ...ALLOWED_SCOPES, 'orders', 'orders/read', 'sync_products', 'file_library',
  'webhooks', 'webhooks/read', 'product_templates',
]);

const DEFAULT_TIMEOUT_MS = 12_000;
const MAX_RESPONSE_BYTES = 2 * 1024 * 1024;
const MAX_COLLECTION_LENGTH = 2_000;
const SAFE_CODES = new Set([
  'missing_token', 'invalid_token', 'invalid_store_id', 'missing_fetch',
  'request_not_allowed', 'request_timeout', 'network_error', 'redirect_blocked',
  'http_unauthorized', 'http_forbidden', 'http_not_found', 'http_rate_limited',
  'http_error', 'response_too_large', 'invalid_response', 'missing_required_scope',
  'extra_scope_refused', 'store_not_found', 'store_ambiguous', 'store_mismatch',
  'product_mismatch', 'product_ignored', 'variant_mismatch', 'product_not_fully_synced',
  'missing_artwork', 'artwork_not_ready', 'internal_error',
]);

class SafeProbeError extends Error {
  constructor(code) {
    super(SAFE_CODES.has(code) ? code : 'internal_error');
    this.code = this.message;
  }
}
const fail = (code) => { throw new SafeProbeError(code); };
const positiveInteger = (value) => Number.isSafeInteger(value) && value > 0;
const isObject = (value) => value !== null && typeof value === 'object' && !Array.isArray(value);
const boundedArray = (value) => Array.isArray(value) && value.length <= MAX_COLLECTION_LENGTH;

function configFromEnv(env) {
  const token = env?.PRINTFUL_API_TOKEN;
  if (typeof token !== 'string' || token.length === 0) fail('missing_token');
  if (token.length > 8192 || /\s|[\u0000-\u001f\u007f]/u.test(token)) fail('invalid_token');
  let storeId;
  const rawId = env?.PRINTFUL_STORE_ID;
  if (rawId !== undefined && rawId !== '') {
    if (typeof rawId !== 'string' || !/^[1-9][0-9]{0,14}$/u.test(rawId)) fail('invalid_store_id');
    storeId = Number(rawId);
    if (!positiveInteger(storeId)) fail('invalid_store_id');
  }
  return { token, storeId };
}

function allowedPath(path) {
  return path === '/oauth/scopes' || path === '/stores'
    || /^\/stores\/[1-9][0-9]{0,14}$/u.test(path)
    || path === `/sync/products/@${EXPECTED_SHOPIFY_PRODUCT_ID}`;
}

async function boundedJson(response, signal, maxBytes) {
  const declaredLength = response.headers.get('content-length');
  if (declaredLength && /^\d+$/u.test(declaredLength) && Number(declaredLength) > maxBytes) {
    await response.body?.cancel().catch(() => {});
    fail('response_too_large');
  }
  if (!response.body) fail('invalid_response');
  const reader = response.body.getReader();
  const chunks = [];
  let byteLength = 0;
  try {
    for (;;) {
      if (signal.aborted) fail('request_timeout');
      const { done, value } = await reader.read();
      if (done) break;
      byteLength += value.byteLength;
      if (byteLength > maxBytes) {
        await reader.cancel().catch(() => {});
        fail('response_too_large');
      }
      chunks.push(value);
    }
  } finally {
    reader.releaseLock();
  }
  const bytes = new Uint8Array(byteLength);
  let offset = 0;
  for (const chunk of chunks) { bytes.set(chunk, offset); offset += chunk.byteLength; }
  let body;
  try { body = JSON.parse(new TextDecoder('utf-8', { fatal: true }).decode(bytes)); }
  catch { fail('invalid_response'); }
  if (!isObject(body) || !Object.hasOwn(body, 'result')) fail('invalid_response');
  if (Object.hasOwn(body, 'code') && body.code !== 200) fail('invalid_response');
  return body.result;
}

function readerFor({ token, fetchImpl, timeoutMs, maxResponseBytes }) {
  return async (path, storeId) => {
    if (!allowedPath(path)) fail('request_not_allowed');
    const url = new URL(path, API_ORIGIN);
    if (url.origin !== API_ORIGIN || url.pathname !== path || url.search || url.hash) fail('request_not_allowed');
    if (storeId !== undefined && !positiveInteger(storeId)) fail('invalid_store_id');
    const controller = new AbortController();
    let timer;
    const deadline = new Promise((_, reject) => {
      timer = setTimeout(() => {
        controller.abort();
        reject(new SafeProbeError('request_timeout'));
      }, timeoutMs);
    });
    const request = async () => {
      const headers = { Accept: 'application/json', Authorization: `Bearer ${token}` };
      if (storeId !== undefined) headers['X-PF-Store-Id'] = String(storeId);
      let response;
      try {
        response = await fetchImpl(url.href, {
          method: 'GET', headers, redirect: 'error', signal: controller.signal,
        });
      } catch {
        fail(controller.signal.aborted ? 'request_timeout' : 'network_error');
      }
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
      return boundedJson(response, controller.signal, maxResponseBytes);
    };
    try { return await Promise.race([request(), deadline]); }
    catch (error) {
      if (error instanceof SafeProbeError) throw error;
      fail(controller.signal.aborted ? 'request_timeout' : 'invalid_response');
    } finally { clearTimeout(timer); controller.abort(); }
  };
}

function verifyScopes(result, report) {
  if (!isObject(result) || !boundedArray(result.scopes)
      || !result.scopes.every((entry) => isObject(entry) && typeof entry.scope === 'string')) fail('invalid_response');
  const scopes = new Set(result.scopes.map(({ scope }) => scope));
  report.permissions = {
    recognized_scopes: KNOWN_SCOPE_LABELS.filter((scope) => scopes.has(scope)),
    unrecognized_scope_count: [...scopes].filter((scope) => !KNOWN_SCOPE_LABELS.includes(scope)).length,
    missing_required_scopes: REQUIRED_SCOPES.filter((scope) => !scopes.has(scope)),
  };
  if ([...scopes].some((scope) => !ALLOWED_SCOPES.includes(scope))) fail('extra_scope_refused');
  if (REQUIRED_SCOPES.some((scope) => !scopes.has(scope))) fail('missing_required_scope');
}

function isExpectedStore(store) {
  if (!isObject(store) || !positiveInteger(store.id) || store.type !== 'shopify' || typeof store.name !== 'string') return false;
  const normalized = store.name.trim().replace(/\s+/gu, ' ').toLowerCase();
  return normalized === 'charmed & dark' || normalized === 'charmed and dark';
}

function selectStore(stores, expectedId) {
  if (!boundedArray(stores) || !stores.every(isObject)) fail('invalid_response');
  if (expectedId !== undefined) {
    const matches = stores.filter((store) => store.id === expectedId);
    if (matches.length === 0) fail('store_not_found');
    if (matches.length !== 1 || !isExpectedStore(matches[0])) fail('store_mismatch');
    return matches[0].id;
  }
  const matches = stores.filter(isExpectedStore);
  if (matches.length === 0) fail('store_not_found');
  if (matches.length !== 1) fail('store_ambiguous');
  return matches[0].id;
}

function summarizeProduct(result, storeId) {
  if (!isObject(result) || !isObject(result.sync_product) || !boundedArray(result.sync_variants)) fail('invalid_response');
  const { sync_product: product, sync_variants: variants } = result;
  if (!positiveInteger(product.id) || String(product.external_id) !== EXPECTED_SHOPIFY_PRODUCT_ID) fail('product_mismatch');
  if (Object.hasOwn(product, 'store_id') && product.store_id !== storeId) fail('store_mismatch');
  if (product.is_ignored === true || variants.some((variant) => isObject(variant) && variant.is_ignored === true)) fail('product_ignored');
  if (!variants.length || !variants.every((variant) => isObject(variant)
      && positiveInteger(variant.id) && positiveInteger(variant.variant_id)
      && (!Object.hasOwn(variant, 'sync_product_id') || variant.sync_product_id === product.id)
      && typeof variant.synced === 'boolean' && boundedArray(variant.files))) fail('variant_mismatch');
  const synced = variants.filter((variant) => variant.synced).length;
  if ((Object.hasOwn(product, 'variants') && product.variants !== variants.length)
      || (Object.hasOwn(product, 'synced') && product.synced !== synced)) fail('variant_mismatch');
  const summary = {
    variants: variants.length,
    syncedVariants: synced,
    unsyncedVariants: variants.length - synced,
    artworkFileReferences: 0,
    readyArtworkFileReferences: 0,
    processingArtworkFileReferences: 0,
    failedArtworkFileReferences: 0,
    unknownArtworkFileReferences: 0,
    previewFileReferences: 0,
    variantsWithoutArtwork: 0,
  };
  for (const variant of variants) {
    let variantArtwork = 0;
    for (const file of variant.files) {
      if (!isObject(file) || typeof file.type !== 'string') fail('invalid_response');
      if (file.type === 'preview') { summary.previewFileReferences += 1; continue; }
      variantArtwork += 1;
      summary.artworkFileReferences += 1;
      if (file.status === 'ok') summary.readyArtworkFileReferences += 1;
      else if (file.status === 'waiting' || file.status === 'processing') summary.processingArtworkFileReferences += 1;
      else if (file.status === 'failed') summary.failedArtworkFileReferences += 1;
      else summary.unknownArtworkFileReferences += 1;
    }
    if (!variantArtwork) summary.variantsWithoutArtwork += 1;
  }
  return summary;
}

/** Public-log-safe: fixed statuses, public scope labels and counts; no IDs, URLs or raw API data. */
export async function runProbe({ env = process.env, fetchImpl = globalThis.fetch,
  timeoutMs = DEFAULT_TIMEOUT_MS, maxResponseBytes = MAX_RESPONSE_BYTES } = {}) {
  const report = {
    status: 'blocked', mode: 'read_only', probe_target: 'known_sgg_draft',
    store_verified: false, known_product_verified: false, checks: [],
  };
  let check = 'configuration';
  const passed = () => report.checks.push({ check, status: 'passed' });
  try {
    const config = configFromEnv(env);
    if (typeof fetchImpl !== 'function') fail('missing_fetch');
    if (!Number.isInteger(timeoutMs) || timeoutMs < 1 || timeoutMs > 30_000
        || !Number.isInteger(maxResponseBytes) || maxResponseBytes < 1 || maxResponseBytes > MAX_RESPONSE_BYTES) fail('internal_error');
    passed();
    const get = readerFor({ token: config.token, fetchImpl, timeoutMs, maxResponseBytes });
    check = 'minimal_read_scopes';
    verifyScopes(await get('/oauth/scopes'), report);
    passed();
    check = 'shopify_store_selection';
    const storeId = selectStore(await get('/stores'), config.storeId);
    passed();
    check = 'shopify_store_identity';
    const store = await get(`/stores/${storeId}`, storeId);
    if (!isExpectedStore(store) || store.id !== storeId) fail('store_mismatch');
    report.store_verified = true;
    report.store_type = 'shopify';
    passed();
    check = 'known_synced_product';
    report.product = summarizeProduct(await get(`/sync/products/@${EXPECTED_SHOPIFY_PRODUCT_ID}`, storeId), storeId);
    if (report.product.unsyncedVariants > 0) fail('product_not_fully_synced');
    if (report.product.variantsWithoutArtwork > 0) fail('missing_artwork');
    if (report.product.readyArtworkFileReferences !== report.product.artworkFileReferences) fail('artwork_not_ready');
    report.known_product_verified = true;
    passed();
    report.status = 'verified';
  } catch (error) {
    report.checks.push({ check, status: 'failed' });
    report.error = error instanceof SafeProbeError ? error.code : 'internal_error';
  }
  return report;
}

const isCli = process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href;
if (isCli) {
  // Arguments are never interpreted or echoed; there is deliberately no token flag.
  const report = process.argv.length > 2
    ? { status: 'blocked', mode: 'read_only', checks: [], error: 'request_not_allowed' }
    : await runProbe();
  process.stdout.write(`${JSON.stringify(report, null, 2)}\n`);
  process.exitCode = report.status === 'verified' ? 0 : 1;
}
