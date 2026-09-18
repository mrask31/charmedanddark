#!/usr/bin/env node
/**
 * Charmed & Dark: deliberately restricted, read-only Printful catalog audit.
 * Requires Node 22+. No dependencies, credentials in arguments, or write endpoints.
 */
import { pathToFileURL } from 'node:url';

export const API_ORIGIN = 'https://api.printful.com';
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
  'invalid_paging', 'pagination_limit_exceeded', 'catalog_changed', 'duplicate_product',
  'duplicate_variant', 'invalid_file_metadata', 'catalog_product_mismatch',
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

const PAGE_SIZE = 100;
const MAX_PAGES = 20;
export const KNOWN_PRODUCTS = Object.freeze([
  ['8634299449378','cozy_crypt_tee','existing_printful_draft'],
  ['8634327236642','crystal_ball_boxy_tee','existing_printful_draft'],
  ['8634327760930','signature_hoodie_black_logo','existing_printful_draft'],
  ['8634328481826','autumn_skull_zip_hoodie','existing_printful_draft'],
  ['8634329301026','autumn_mourning_boxy_tee','existing_printful_draft'],
  ['8634331529250','signature_tee_black_logo','existing_printful_draft'],
  ['8634332282914','signature_hoodie_white_logo','existing_printful_draft'],
  ['8634332905506','marked_by_rose_tee','existing_printful_draft'],
  ['8634333823010','autumn_mourning_hoodie','existing_printful_draft'],
  ['8636169617442','sgg_secret_society_bottle','existing_printful_draft'],
  ['8636230434850','sgg_reading_fuel_mug','existing_printful_draft'],
  ['8636250652706','sgg_enchanted_reads_bottle','existing_printful_draft'],
  ['8634330939426','bones_sample_do_not_publish','protected_sample'],
  ['8228020879394','legacy_crystal_ball_tee','legacy_already_covered'],
  ['8228021076002','legacy_marked_by_rose_tee','legacy_already_covered'],
  ['8344998772770','legacy_signature_hoodie','legacy_already_covered'],
  ['8556173295650','legacy_sgg_secret_society_bottle','legacy_already_covered'],
  ['8556173066274','legacy_sgg_reading_fuel_mug','legacy_already_covered'],
  ['8556174540834','legacy_sgg_enchanted_reads_bottle','legacy_already_covered'],
  ['8408724537378','camp_charmed_dark_ringer','keep_printify'],
  ['8408622858274','salty_spells','keep_printify'],
  ['8344998936610','charmed_by_night_white_tee','pending_migration'],
  ['8228020846626','cursed_hearts_tee','pending_migration'],
  ['8228020977698','lunar_moth_tee','pending_migration'],
  ['8556134563874','sgg_tote','pending_migration'],
  ['8228021010466','crimson_reliquary_tee','pending_migration'],
  ['8406000042018','siren_apparel','pending_migration'],
  ['8405954461730','gothic_ringer_tee','pending_migration'],
  ['8228020551714','signature_beanie','pending_migration'],
  ['8228020584482','obsidian_zip_hoodie','pending_migration'],
  ['8406030712866','white_sigil_cap','pending_migration'],
  ['8406033465378','black_sigil_cap','pending_migration'],
  ['8408563417122','summer_trucker_cap','pending_migration'],
  ['8408700747810','bones_and_brews_tee','pending_migration'],
  ['8408692129826','hexes_and_heat_tee','pending_migration'],
  ['8469015429154','summerween_patriot_pocket_tee','pending_migration'],
  ['8228020912162','ballerina_apparel','pending_migration'],
  ['8228021141538','crown_apparel','pending_migration'],
  ['8228021108770','moon_maiden_crop','pending_migration'],
  ['8408636489762','flowy_tank','pending_migration'],
  ['8228021043234','crimson_reliquary_crop','pending_migration'],
  ['8228020944930','till_death_apparel','pending_migration'],
  ['8344998969378','after_death_canvas','pending_migration'],
  ['8344999133218','last_kiss_canvas','pending_migration'],
].map(([shopify_id, alias, category]) => Object.freeze({shopify_id, alias, category})));
const KNOWN_BY_ID = new Map(KNOWN_PRODUCTS.map((p) => [p.shopify_id, p]));
const DETAIL_PATHS = new Set(KNOWN_PRODUCTS.map((p) => `/sync/products/@${p.shopify_id}`));
const PAGE_PATHS = new Set(Array.from({length: MAX_PAGES}, (_, i) => `/sync/products?limit=${PAGE_SIZE}&offset=${i * PAGE_SIZE}`));
const PLACEMENTS = Object.freeze([
  'default', 'front', 'back', 'left', 'right', 'left_sleeve', 'right_sleeve',
  'sleeve_left', 'sleeve_right', 'label_inside', 'label_outside',
  'embroidery_front', 'embroidery_back', 'embroidery_left', 'embroidery_right',
  'embroidery_chest_left', 'embroidery_chest_right', 'embroidery_large_center',
  'embroidery_front_large', 'embroidery_sleeve_left', 'embroidery_sleeve_right',
]);
function allowedPath(path) {
  return path === '/oauth/scopes' || path === '/stores'
    || /^\/stores\/[1-9][0-9]{0,14}$/u.test(path)
    || DETAIL_PATHS.has(path) || PAGE_PATHS.has(path)
    || path === '/products/71' || path === '/mockup-generator/printfiles/71?technique=DTG';
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
  return body;
}

function readerFor({ token, fetchImpl, timeoutMs, maxResponseBytes }) {
  return async (path, storeId) => {
    if (!allowedPath(path)) fail('request_not_allowed');
    const url = new URL(path, API_ORIGIN);
    if (url.origin !== API_ORIGIN || `${url.pathname}${url.search}` !== path || url.hash) fail('request_not_allowed');
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


const nonnegativeInteger = (value) => Number.isSafeInteger(value) && value >= 0;
const countField = (value) => nonnegativeInteger(value) && value <= MAX_COLLECTION_LENGTH;
function validateProductListEntry(product, storeId) {
  if (!isObject(product) || !positiveInteger(product.id)
      || !(typeof product.external_id === 'string' || positiveInteger(product.external_id) || product.external_id === null)
      || !countField(product.variants) || !countField(product.synced) || product.synced > product.variants
      || (Object.hasOwn(product, 'is_ignored') && typeof product.is_ignored !== 'boolean')) fail('invalid_response');
  if (Object.hasOwn(product, 'store_id') && product.store_id !== storeId) fail('store_mismatch');
}

async function readCatalog(get, storeId, report) {
  const observed = new Map();
  const productIds = new Set();
  const externalIds = new Set();
  let expectedTotal;
  for (let page = 0; page < MAX_PAGES; page += 1) {
    const offset = page * PAGE_SIZE;
    const body = await get(`/sync/products?limit=${PAGE_SIZE}&offset=${offset}`, storeId);
    const {result, paging} = body;
    if (!Array.isArray(result) || result.length > PAGE_SIZE || !isObject(paging)
        || !nonnegativeInteger(paging.total) || paging.offset !== offset || paging.limit !== PAGE_SIZE) fail('invalid_paging');
    if (paging.total > PAGE_SIZE * MAX_PAGES) fail('pagination_limit_exceeded');
    if (expectedTotal !== undefined && paging.total !== expectedTotal) fail('catalog_changed');
    expectedTotal = paging.total;
    if (result.length !== Math.min(PAGE_SIZE, Math.max(0, expectedTotal - offset))) fail('invalid_paging');
    for (const product of result) {
      validateProductListEntry(product, storeId);
      const externalId = product.external_id === null ? null : String(product.external_id);
      if (productIds.has(product.id) || (externalId !== null && externalIds.has(externalId))) fail('duplicate_product');
      productIds.add(product.id);
      if (externalId !== null) externalIds.add(externalId);
      report.catalog.products += 1;
      report.catalog.variants += product.variants;
      report.catalog.synced_variants += product.synced;
      if (product.is_ignored === true) report.catalog.ignored_products += 1;
      if (KNOWN_BY_ID.has(externalId)) observed.set(externalId, product);
      else report.catalog.unknown_products += 1;
    }
    report.catalog.pages += 1;
    if (offset + result.length === expectedTotal) {
      report.catalog.complete = true;
      report.catalog.known_products_present = observed.size;
      return observed;
    }
  }
  fail('pagination_limit_exceeded');
}

function dimension(value, maximum) {
  if (value === null || value === undefined || value === 0) return null;
  if (typeof value !== 'number' || !Number.isFinite(value) || value <= 0 || value > maximum) fail('invalid_file_metadata');
  return value;
}
function summaryFor(result, observed, storeId) {
  if (!isObject(result) || !isObject(result.sync_product) || !boundedArray(result.sync_variants)) fail('invalid_response');
  const {sync_product: product, sync_variants: variants} = result;
  validateProductListEntry(product, storeId);
  if (product.id !== observed.id || String(product.external_id) !== String(observed.external_id)) fail('product_mismatch');
  if (product.variants !== observed.variants || product.synced !== observed.synced
      || product.is_ignored !== observed.is_ignored) fail('catalog_changed');
  if (product.variants !== variants.length) fail('variant_mismatch');
  const uniqueVariants = new Set();
  const profiles = new Map();
  const placements = new Set();
  const catalogProductIds = new Set();
  const summary = {
    ignored: product.is_ignored === true,
    variants: variants.length, synced_variants: 0, mapped_variants: 0, ignored_variants: 0,
    variants_without_artwork: 0, artwork_file_references: 0, ready_artwork_file_references: 0,
    processing_artwork_file_references: 0, failed_artwork_file_references: 0,
    unknown_status_artwork_file_references: 0, preview_file_references: 0,
    unknown_placement_file_references: 0, files_with_position_field: 0,
    files_with_position_object: 0, variants_with_position_field: 0,
    product_has_position_field: Object.hasOwn(product, 'position'),
    observed_placements: [], artwork_metadata_profiles: [], public_catalog_product_ids: [],
  };
  for (const variant of variants) {
    if (!isObject(variant) || !positiveInteger(variant.id)
        || typeof variant.synced !== 'boolean'
        || (Object.hasOwn(variant, 'is_ignored') && typeof variant.is_ignored !== 'boolean')
        || (Object.hasOwn(variant, 'sync_product_id') && variant.sync_product_id !== product.id)) fail('variant_mismatch');
    if (uniqueVariants.has(variant.id)) fail('duplicate_variant');
    uniqueVariants.add(variant.id);
    if (isObject(variant.product) && Object.hasOwn(variant.product, 'product_id')) {
      if (!positiveInteger(variant.product.product_id)) fail('variant_mismatch');
      catalogProductIds.add(variant.product.product_id);
    }
    if (variant.synced) summary.synced_variants += 1;
    if (positiveInteger(variant.variant_id)) summary.mapped_variants += 1;
    else if (variant.synced || !(variant.variant_id === null || variant.variant_id === undefined || variant.variant_id === 0)) fail('variant_mismatch');
    if (variant.is_ignored === true) summary.ignored_variants += 1;
    if (Object.hasOwn(variant, 'position')) summary.variants_with_position_field += 1;
    const files = variant.files ?? [];
    if (!boundedArray(files)) fail('invalid_response');
    let artwork = 0;
    for (const file of files) {
      if (!isObject(file) || typeof file.type !== 'string') fail('invalid_response');
      if (file.type === 'preview') { summary.preview_file_references += 1; continue; }
      artwork += 1;
      summary.artwork_file_references += 1;
      if (file.status === 'ok') summary.ready_artwork_file_references += 1;
      else if (file.status === 'waiting' || file.status === 'processing') summary.processing_artwork_file_references += 1;
      else if (file.status === 'failed') summary.failed_artwork_file_references += 1;
      else summary.unknown_status_artwork_file_references += 1;
      const placement = PLACEMENTS.includes(file.type) ? file.type : 'unrecognized';
      if (placement === 'unrecognized') summary.unknown_placement_file_references += 1;
      else placements.add(placement);
      const metadata = {
        placement,
        width_pixels: dimension(file.width, 1_000_000),
        height_pixels: dimension(file.height, 1_000_000),
        file_dpi: dimension(file.dpi, 100_000),
      };
      const key = JSON.stringify(metadata);
      const previous = profiles.get(key);
      if (previous) previous.references += 1;
      else profiles.set(key, {...metadata, references: 1});
      if (profiles.size > MAX_COLLECTION_LENGTH) fail('invalid_file_metadata');
      if (Object.hasOwn(file, 'position')) summary.files_with_position_field += 1;
      if (isObject(file.position)) summary.files_with_position_object += 1;
    }
    if (!artwork) summary.variants_without_artwork += 1;
  }
  if (summary.synced_variants !== product.synced) fail('variant_mismatch');
  summary.public_catalog_product_ids = [...catalogProductIds].sort((a,b) => a-b);
  summary.observed_placements = PLACEMENTS.filter((p) => placements.has(p));
  summary.artwork_metadata_profiles = [...profiles.values()];
  summary.unsynced_variants = variants.length - summary.synced_variants;
  summary.all_variants_synced = variants.length > 0 && summary.unsynced_variants === 0;
  summary.all_artwork_ready = summary.artwork_file_references > 0
    && summary.variants_without_artwork === 0
    && summary.artwork_file_references === summary.ready_artwork_file_references;
  // File dimensions/DPI and presence of a position field do not establish physical
  // print placement, transparent backgrounds, print quality, or Shopify draft status.
  summary.physical_print_placement_verified = false;
  return summary;
}

const CANDIDATE_COLORS = Object.freeze(['Black','Navy','Maroon','Asphalt','Dark Grey Heather','Forest']);
const CANDIDATE_SIZES = Object.freeze(['XS','S','M','L','XL','2XL','3XL','4XL','5XL']);
const PUBLIC_REGIONS = Object.freeze(['US','EU','EU_LV','EU_ES','AU','CA','UK','BR','JP']);
const PUBLIC_AVAILABILITY = Object.freeze(['in_stock','out_of_stock','stocked_on_demand','discontinued']);
const PUBLIC_CURRENCIES = Object.freeze(['USD','EUR','GBP','CAD','AUD','JPY']);
function publicCatalogSummary(result) {
  if (!isObject(result) || !isObject(result.product) || !boundedArray(result.variants)) fail('invalid_response');
  const p = result.product;
  const normalize = (v) => typeof v === 'string' ? v.toLowerCase().replace(/[^a-z0-9]/gu,'') : '';
  if (p.id !== 71 || normalize(p.brand) !== 'bellacanvas' || normalize(p.model) !== '3001') fail('catalog_product_mismatch');
  if (typeof p.is_discontinued !== 'boolean') fail('invalid_response');
  const variants = [];
  const ids = new Set();
  const matches = new Set();
  for (const v of result.variants) {
    if (!isObject(v) || !positiveInteger(v.id) || v.product_id !== 71 || ids.has(v.id)) fail('catalog_product_mismatch');
    ids.add(v.id);
    const color = CANDIDATE_COLORS.find((c) => normalize(c) === normalize(v.color));
    const size = CANDIDATE_SIZES.find((s) => s === v.size);
    if (!color || !size) continue;
    if (matches.has(`${color}/${size}`)) fail('catalog_product_mismatch');
    matches.add(`${color}/${size}`);
    if (typeof v.in_stock !== 'boolean' || typeof v.price !== 'string' || !/^[0-9]{1,4}(?:\.[0-9]{1,2})?$/u.test(v.price)) fail('invalid_response');
    const availability = [];
    if (v.availability_status !== undefined && !boundedArray(v.availability_status)) fail('invalid_response');
    for (const a of v.availability_status ?? []) {
      if (!isObject(a)) fail('invalid_response');
      const region = PUBLIC_REGIONS.find((r) => r === a.region);
      if (!region) continue;
      availability.push({region, status: PUBLIC_AVAILABILITY.find((s) => s === a.status) ?? 'unrecognized'});
    }
    variants.push({catalog_variant_id:v.id,color,size,base_price:Number(v.price),in_stock:v.in_stock,availability});
  }
  return {status:'verified',catalog_product_id:71,expected_model:'bella_canvas_3001',model_verified:true,
    is_discontinued:p.is_discontinued,currency:PUBLIC_CURRENCIES.find((c) => c === p.currency) ?? 'unrecognized',
    total_catalog_variants:result.variants.length,selected_variants:variants};
}
function publicPrintAreaSummary(result, catalog) {
  if (!isObject(result) || result.product_id !== 71 || !boundedArray(result.printfiles)
      || !boundedArray(result.variant_printfiles) || !isObject(result.available_placements)) fail('invalid_response');
  const wanted = new Set(catalog.selected_variants.map((v) => v.catalog_variant_id));
  const neededFiles = new Set();
  const seenVariants = new Set();
  const mappings = [];
  for (const v of result.variant_printfiles) {
    if (!isObject(v) || !positiveInteger(v.variant_id) || !isObject(v.placements)) fail('invalid_response');
    if (!wanted.has(v.variant_id)) continue;
    if (seenVariants.has(v.variant_id)) fail('variant_mismatch');
    seenVariants.add(v.variant_id);
    const placements = [];
    for (const p of PLACEMENTS) {
      if (!Object.hasOwn(v.placements,p)) continue;
      if (!positiveInteger(v.placements[p])) fail('invalid_response');
      neededFiles.add(v.placements[p]);
      placements.push({placement:p,public_printfile_id:v.placements[p]});
    }
    mappings.push({catalog_variant_id:v.variant_id,placements});
  }
  const files = [];
  const seenFiles = new Set();
  for (const f of result.printfiles) {
    if (!isObject(f) || !positiveInteger(f.printfile_id)) fail('invalid_response');
    if (!neededFiles.has(f.printfile_id)) continue;
    if (seenFiles.has(f.printfile_id)) fail('invalid_response');
    seenFiles.add(f.printfile_id);
    const width = dimension(f.width,1_000_000); const height = dimension(f.height,1_000_000); const dpi = dimension(f.dpi,100_000);
    if (!width || !height || !dpi || !['fit','cover'].includes(f.fill_mode) || typeof f.can_rotate !== 'boolean') fail('invalid_file_metadata');
    files.push({public_printfile_id:f.printfile_id,width_pixels:width,height_pixels:height,dpi,fill_mode:f.fill_mode,can_rotate:f.can_rotate});
  }
  if (neededFiles.size !== seenFiles.size) fail('invalid_response');
  return {status:'verified',catalog_product_id:71,technique:'DTG',
    available_placements:PLACEMENTS.filter((p) => Object.hasOwn(result.available_placements,p)),
    selected_variants_without_printarea_mapping:wanted.size-seenVariants.size,printareas:files,variant_printareas:mappings};
}
async function readPublicCatalogFacts(get,storeId,target) {
  try {target.catalog_product=publicCatalogSummary((await get('/products/71',storeId)).result);}
  catch(error) {target.catalog_product={status:'blocked',error:error instanceof SafeProbeError ? error.code : 'internal_error'};}
  if (target.catalog_product.status !== 'verified') {
    target.print_area={status:'not_checked',reason:'catalog_product_unverified'};
    return;
  }
  try {target.print_area=publicPrintAreaSummary((await get('/mockup-generator/printfiles/71?technique=DTG',storeId)).result,target.catalog_product);}
  catch(error) {target.print_area={status:'blocked',error:error instanceof SafeProbeError ? error.code : 'internal_error'};}
}

/** Public-log-safe fixed known aliases/Shopify IDs + counts/numeric file metadata only. */
export async function runCatalogAudit({env = process.env, fetchImpl = globalThis.fetch,
  timeoutMs = DEFAULT_TIMEOUT_MS, maxResponseBytes = MAX_RESPONSE_BYTES} = {}) {
  const report = {
    schema_version: 1, status: 'blocked', mode: 'read_only', store_verified: false,
    catalog: {complete: false, pages: 0, products: 0, variants: 0, synced_variants: 0,
      ignored_products: 0, unknown_products: 0, known_products_present: 0},
    public_catalog: {catalog_product: {status: 'not_checked'}, print_area: {status: 'not_checked'}},
    products: KNOWN_PRODUCTS.map((p) => ({...p, presence: 'not_checked', detail_status: 'not_checked'})),
    checks: [],
  };
  let check = 'configuration';
  const passed = () => report.checks.push({check, status: 'passed'});
  try {
    const config = configFromEnv(env);
    if (typeof fetchImpl !== 'function') fail('missing_fetch');
    if (!Number.isInteger(timeoutMs) || timeoutMs < 1 || timeoutMs > 30_000
        || !Number.isInteger(maxResponseBytes) || maxResponseBytes < 1 || maxResponseBytes > MAX_RESPONSE_BYTES) fail('internal_error');
    passed();
    const get = readerFor({token: config.token, fetchImpl, timeoutMs, maxResponseBytes});
    check = 'minimal_read_scopes';
    verifyScopes((await get('/oauth/scopes')).result, report);
    passed();
    check = 'shopify_store_selection';
    const storeId = selectStore((await get('/stores')).result, config.storeId);
    passed();
    check = 'shopify_store_identity';
    const store = (await get(`/stores/${storeId}`, storeId)).result;
    if (!isExpectedStore(store) || store.id !== storeId) fail('store_mismatch');
    report.store_verified = true;
    passed();
    await readPublicCatalogFacts(get, storeId, report.public_catalog);
    check = 'catalog_pagination';
    const observed = await readCatalog(get, storeId, report);
    passed();
    for (const product of report.products) product.presence = observed.has(product.shopify_id) ? 'present' : 'absent';
    check = 'known_product_details';
    for (const product of report.products) {
      if (product.presence === 'absent') { product.detail_status = 'not_applicable'; continue; }
      product.detail_status = 'reading';
      try {
        const body = await get(`/sync/products/@${product.shopify_id}`, storeId);
        product.summary = summaryFor(body.result, observed.get(product.shopify_id), storeId);
        product.detail_status = 'verified';
      } catch (error) {
        product.detail_status = 'blocked';
        throw error;
      }
    }
    passed();
    report.status = 'complete';
  } catch (error) {
    report.checks.push({check, status: 'failed'});
    report.error = error instanceof SafeProbeError ? error.code : 'internal_error';
  }
  return report;
}

const isCli = process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href;
if (isCli) {
  const report = process.argv.length > 2
    ? {status: 'blocked', mode: 'read_only', checks: [], error: 'request_not_allowed'}
    : await runCatalogAudit();
  process.stdout.write(`${JSON.stringify(report, null, 2)}\n`);
  process.exitCode = report.status === 'complete' ? 0 : 1;
}
