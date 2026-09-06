import test from 'node:test';
import assert from 'node:assert/strict';
import {
  mapShopifyProduct, mapShopifyVariant, attachCatalogIdentity, resolveCatalogReferences,
} from '../lib/shopify/catalog-shape.js';
import {
  collectConnection, getRawShopifyProducts, getShopifyCollection,
} from '../lib/shopify/catalog.js';
import { shopifyFetch, SHOPIFY_API_VERSION } from '../lib/shopify/client.js';
import { isShopifyCatalogEnabled } from '../lib/commerce-config.js';

const connection = (nodes, next = null) => ({
  edges: nodes.map((node) => ({ node })),
  pageInfo: { hasNextPage: next !== null, endCursor: next },
});
const money = (amount) => ({ amount: String(amount), currencyCode: 'USD' });
const variant = (id = '1', overrides = {}) => ({
  id: `gid://shopify/ProductVariant/${id}`, title: 'Default Title', sku: `SKU-${id}`,
  availableForSale: true, quantityAvailable: 0,
  price: money(24.99), compareAtPrice: null,
  selectedOptions: [{ name: 'Title', value: 'Default Title' }],
  ...overrides,
});
const product = (id = '1', overrides = {}) => ({
  id: `gid://shopify/Product/${id}`, title: 'Shopify current title', handle: `current-${id}`,
  description: 'Current description', descriptionHtml: '<p>Current description</p>',
  productType: 'Apparel', tags: [], vendor: 'Printful', availableForSale: true,
  createdAt: '2026-09-01T12:00:00Z', updatedAt: '2026-09-06T12:00:00Z',
  seo: { title: 'Shopify SEO', description: 'Shopify search description' },
  options: [{ name: 'Title', optionValues: [{ name: 'Default Title' }] }],
  priceRange: { minVariantPrice: money(24.99), maxVariantPrice: money(24.99) },
  images: connection([{ url: 'https://cdn.shopify.com/a.jpg', altText: 'Accurate alt' }]),
  collections: connection([{ id: 'gid://shopify/Collection/1', handle: 'apparel', title: 'Apparel' }]),
  variants: connection([variant(id)]),
  ...overrides,
});
function useStorefront(t, handler) {
  const previousDomain = process.env.SHOPIFY_STORE_DOMAIN;
  const previousToken = process.env.SHOPIFY_STOREFRONT_ACCESS_TOKEN;
  process.env.SHOPIFY_STORE_DOMAIN = 'example.myshopify.com';
  process.env.SHOPIFY_STOREFRONT_ACCESS_TOKEN = 'test-only-token';
  t.after(() => {
    if (previousDomain === undefined) delete process.env.SHOPIFY_STORE_DOMAIN;
    else process.env.SHOPIFY_STORE_DOMAIN = previousDomain;
    if (previousToken === undefined) delete process.env.SHOPIFY_STOREFRONT_ACCESS_TOKEN;
    else process.env.SHOPIFY_STOREFRONT_ACCESS_TOKEN = previousToken;
  });
  return t.mock.method(globalThis, 'fetch', handler);
}
const response = (data) => new Response(JSON.stringify({ data }), { status: 200 });

test('default variant remains purchasable at zero reported quantity with its Shopify price and SEO', () => {
  const mapped = mapShopifyProduct(product('1', {
    variants: connection([variant('1', { compareAtPrice: money(30) })]),
  }));
  assert.equal(mapped.availableForSale, true);
  assert.equal(mapped.qty, 0);
  assert.equal(mapped.price, 24.99);
  assert.equal(mapped.originalPrice, 30);
  assert.equal(mapped.salePrice, 24.99);
  assert.equal(mapped.shopifyVariants.variants.length, 1);
  assert.deepEqual(mapped.shopifyVariants.options, []);
  assert.equal(mapped.shopifyVariants.variants[0].available, true);
  assert.equal(mapped.shopifyVariantId, 'gid://shopify/ProductVariant/1');
  assert.equal(mapped.metaTitle, 'Shopify SEO');
  assert.equal(mapped.imageDetails[0].altText, 'Accurate alt');
  assert.equal(mapped.updatedAt, '2026-09-06T12:00:00Z');
});

test('provider quantities are preserved and never override Shopify buyability', () => {
  assert.equal(mapShopifyVariant(variant('1', { quantityAvailable: 9999 })).quantityAvailable, 9999);
  const unavailable = mapShopifyVariant(variant('2', { availableForSale: false, quantityAvailable: 10 }));
  assert.equal(unavailable.available, false);
  assert.equal(unavailable.quantityAvailable, 10);
  assert.equal(mapShopifyVariant(variant('3', { quantityAvailable: null })).quantityAvailable, null);
});

test('approved Shopify category tags and native merchandising membership retain existing storefront groups', () => {
  const mapped = mapShopifyProduct(product('1', {
    productType: 'Provider type', tags: ['category:Home Decor'],
    collections: connection([{ handle: 'homepage-best-sellers', title: 'Best sellers' }]),
  }));
  assert.equal(mapped.category, 'Home Decor');
  assert.equal(mapped.bestSeller, true);
  assert.equal(mapShopifyProduct(product('2', { productType: '', tags: [] })).category, 'Other');
});

test('multiple historical UUIDs and aliases resolve to one canonical product without overriding commerce', () => {
  const canonical = mapShopifyProduct(product());
  const bridged = attachCatalogIdentity(canonical, [
    { id: 'old-uuid', shopify_id: canonical.id, handle: 'old-name', slug: 'old-slug', price: 1 },
    { id: 'current-uuid', shopify_id: canonical.id, handle: canonical.handle, slug: canonical.handle, price: 2 },
  ]);
  assert.equal(bridged.id, canonical.id);
  assert.equal(bridged.legacyId, 'current-uuid');
  assert.equal(bridged.price, 24.99);
  assert.deepEqual(bridged.legacyIds, ['current-uuid', 'old-uuid']);
  assert.deepEqual(resolveCatalogReferences([bridged], ['old-uuid', 'old-name', canonical.id]), [bridged]);
});

test('ambiguous old aliases do not pick a product; current canonical handles keep priority', () => {
  const first = { ...mapShopifyProduct(product('1')), aliases: ['ambiguous', 'current-2'], legacyIds: [] };
  const second = { ...mapShopifyProduct(product('2')), aliases: ['ambiguous'], legacyIds: [] };
  assert.deepEqual(resolveCatalogReferences([first, second], ['ambiguous']), []);
  assert.deepEqual(resolveCatalogReferences([first, second], ['current-2']), [second]);
});

test('pagination completes all pages and rejects a missing or repeated cursor', async () => {
  const seen = [];
  const complete = await collectConnection(connection(['a'], 'one'), async (cursor) => {
    seen.push(cursor);
    return cursor === 'one' ? connection(['b'], 'two') : connection(['c']);
  });
  assert.deepEqual(complete.edges.map(({ node }) => node), ['a', 'b', 'c']);
  assert.deepEqual(seen, ['one', 'two']);
  await assert.rejects(
    collectConnection(connection(['a'], 'same'), async () => connection(['b'], 'same')),
    (error) => error.code === 'INVALID_PAGINATION',
  );
  await assert.rejects(
    collectConnection({ edges: [], pageInfo: { hasNextPage: true, endCursor: null } }, async () => {}),
    (error) => error.code === 'INVALID_PAGINATION',
  );
});

test('catalog pagination includes products and every nested variant, image, and collection', async (t) => {
  const calls = [];
  const first = product('1', {
    variants: connection([variant('1')], 'v1'),
    images: connection([{ url: 'first.jpg' }], 'i1'),
    collections: connection([{ handle: 'first' }], 'c1'),
  });
  useStorefront(t, async (url, options) => {
    const { query, variables } = JSON.parse(options.body);
    calls.push({ query, variables });
    assert.ok(url.includes(`/api/${SHOPIFY_API_VERSION}/`));
    if (query.includes('query AllProducts')) {
      return response({ products: variables.after ? connection([product('2')]) : connection([first], 'p1') });
    }
    if (query.includes('query ProductVariants')) return response({ product: { variants: connection([variant('101')]) } });
    if (query.includes('query ProductImages')) return response({ product: { images: connection([{ url: 'later.jpg' }]) } });
    if (query.includes('query ProductCollections')) return response({ product: { collections: connection([{ handle: 'later' }]) } });
    throw new Error('Unexpected request');
  });
  const products = await getRawShopifyProducts();
  assert.equal(products.length, 2);
  assert.equal(products[0].variants.edges.length, 2);
  assert.equal(products[0].images.edges[1].node.url, 'later.jpg');
  assert.equal(products[0].collections.edges[1].node.handle, 'later');
  assert.equal(calls.length, 5);
  assert.ok(calls.every((call) => call.variables.country === 'US'));
});

test('native collection order survives multiple product pages', async (t) => {
  useStorefront(t, async (_url, options) => {
    const { variables } = JSON.parse(options.body);
    return response({ collection: {
      id: 'gid://shopify/Collection/1', handle: 'curated', title: 'Curated',
      products: variables.after ? connection([product('1')]) : connection([product('2')], 'next'),
    } });
  });
  const collection = await getShopifyCollection('curated');
  assert.deepEqual(collection.products.map((item) => item.handle), ['current-2', 'current-1']);
});

test('missing required collection and interrupted nested pagination surface errors instead of empty catalog', async (t) => {
  const mocked = useStorefront(t, async () => response({ collection: null }));
  await assert.rejects(getShopifyCollection('missing'), (error) => error.code === 'CATALOG_CONFIGURATION');
  mocked.mock.mockImplementation(async (_url, options) => {
    const { query } = JSON.parse(options.body);
    if (query.includes('query AllProducts')) {
      return response({ products: connection([product('1', { variants: connection([variant('1')], 'next') })]) });
    }
    return response({ product: null });
  });
  await assert.rejects(getRawShopifyProducts(), (error) => error.code === 'CATALOG_CHANGED');
});

test('reads use explicit cache tags; all mutations and explicit cart reads bypass caches', async (t) => {
  const calls = [];
  useStorefront(t, async (_url, options) => { calls.push(options); return response({ shop: { name: 'Example' } }); });
  await shopifyFetch({ query: 'query { shop { name } }', tags: ['product:1'] });
  await shopifyFetch({ query: 'mutation { cartCreate { cart { id } } }' });
  await shopifyFetch({ query: 'query { cart { id } }', cache: 'no-store' });
  assert.equal(calls[0].cache, 'force-cache');
  assert.deepEqual(calls[0].next, { revalidate: 60, tags: ['shopify-catalog', 'product:1'] });
  for (const call of calls.slice(1)) {
    assert.equal(call.cache, 'no-store');
    assert.equal(call.next, undefined);
  }
});

test('HTTP, malformed JSON and GraphQL partial failures never expose upstream details or partial data', async (t) => {
  const mocked = useStorefront(t, async () => new Response('unavailable', { status: 503 }));
  await assert.rejects(shopifyFetch({ query: 'query { shop { name } }' }), (error) => error.code === 'HTTP' && error.status === 503);
  mocked.mock.mockImplementation(async () => new Response('invalid-json', { status: 200 }));
  await assert.rejects(shopifyFetch({ query: 'query { shop { name } }' }), (error) => error.code === 'INVALID_RESPONSE');
  mocked.mock.mockImplementation(async () => new Response(JSON.stringify({
    data: { products: [] }, errors: [{ message: 'private request value' }],
  }), { status: 200 }));
  await assert.rejects(shopifyFetch({ query: 'query { shop { name } }' }), (error) => {
    assert.equal(error.code, 'GRAPHQL');
    assert.ok(!error.message.includes('private request'));
    return true;
  });
});

test('upstream timeout is bounded and distinguishable', async (t) => {
  useStorefront(t, async (_url, options) => new Promise((_resolve, reject) => {
    options.signal.addEventListener('abort', () => reject(new Error('aborted')), { once: true });
  }));
  await assert.rejects(shopifyFetch({ query: 'query { shop { name } }', timeoutMs: 5 }), (error) => error.code === 'TIMEOUT');
});

test('preview enables the new source while production and explicit rollback retain legacy', (t) => {
  const previousFlag = process.env.SHOPIFY_CATALOG_ENABLED;
  const previousEnvironment = process.env.VERCEL_ENV;
  t.after(() => {
    if (previousFlag === undefined) delete process.env.SHOPIFY_CATALOG_ENABLED;
    else process.env.SHOPIFY_CATALOG_ENABLED = previousFlag;
    if (previousEnvironment === undefined) delete process.env.VERCEL_ENV;
    else process.env.VERCEL_ENV = previousEnvironment;
  });
  delete process.env.SHOPIFY_CATALOG_ENABLED;
  process.env.VERCEL_ENV = 'production';
  assert.equal(isShopifyCatalogEnabled(), false);
  process.env.VERCEL_ENV = 'preview';
  assert.equal(isShopifyCatalogEnabled(), true);
  process.env.SHOPIFY_CATALOG_ENABLED = 'false';
  assert.equal(isShopifyCatalogEnabled(), false);
  process.env.SHOPIFY_CATALOG_ENABLED = 'true';
  process.env.VERCEL_ENV = 'production';
  assert.equal(isShopifyCatalogEnabled(), true);
});
