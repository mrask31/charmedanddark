#!/usr/bin/env node
/**
 * Read-only HTTP release checks. Run browser journeys separately; a 200 response
 * does not prove that selecting a variant, changing a cart, or checkout works.
 * Node 20+. No credentials, browser installation, or third-party packages needed.
 */
import { readFile, writeFile } from 'node:fs/promises';
import { parseArgs } from 'node:util';

const { values } = parseArgs({ options: {
  url: { type: 'string', default: 'https://www.charmedanddark.com' },
  baseline: { type: 'string' },
  output: { type: 'string' },
  record: { type: 'boolean', default: false },
  preview: { type: 'boolean', default: false },
  'all-products': { type: 'boolean', default: false },
  'strict-seo': { type: 'boolean', default: false },
} });
const base = new URL(values.url);
if (!['http:', 'https:'].includes(base.protocol) || base.username || base.password) {
  throw new Error('--url must be an HTTP(S) origin without embedded credentials');
}
const canonicalOrigin = 'https://www.charmedanddark.com';
const baseline = values.baseline ? JSON.parse(await readFile(values.baseline, 'utf8')) : null;
const report = { version: 1, checkedAt: new Date().toISOString(), origin: base.origin, pages: [], sitemap: [], feed: [], checks: [] };
const check = (pass, scope, message) => report.checks.push({ pass: Boolean(pass), scope, message });
const decode = (text = '') => text.replace(/&(?:amp|quot|apos|lt|gt|#39|#x27|#x([\da-f]+)|#(\d+));/gi, (entity, hex, decimal) => {
  if (hex || decimal) return String.fromCodePoint(Number.parseInt(hex || decimal, hex ? 16 : 10));
  return ({ '&amp;': '&', '&quot;': '"', '&apos;': "'", '&lt;': '<', '&gt;': '>', '&#39;': "'", '&#x27;': "'" })[entity.toLowerCase()] || entity;
});
const textContent = (text = '') => decode(text.replace(/<[^>]*>/g, '')).replace(/\s+/g, ' ').trim();
const tags = (html, tag) => [...html.matchAll(new RegExp(`<${tag}\\b[^>]*>`, 'gi'))].map(([source]) => Object.fromEntries(
  [...source.matchAll(/([\w:-]+)\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s>]+))/g)].map(([, key, a, b, c]) => [key.toLowerCase(), decode(a ?? b ?? c)]),
));
const xmlText = (xml, tag) => decode((xml.match(new RegExp(`<${tag}>([\\s\\S]*?)<\\/${tag}>`, 'i'))?.[1] || '').replace(/^<!\[CDATA\[([\s\S]*)\]\]>$/, '$1')).trim();
const pathOf = (url) => { try { return new URL(url, canonicalOrigin).pathname; } catch { return null; } };
const unique = (array) => [...new Set(array)];

async function fetchPath(path) {
  const started = performance.now();
  try {
    const headers = { 'User-Agent': 'CharmedDarkReleaseCheck/1.0', Accept: 'text/html,application/xml,application/json' };
    if (process.env.COMMERCE_VERIFY_BYPASS) headers['x-vercel-protection-bypass'] = process.env.COMMERCE_VERIFY_BYPASS;
    const response = await fetch(new URL(path, base.origin), { headers, signal: AbortSignal.timeout(45000) });
    return { path, status: response.status, finalUrl: response.url, contentType: response.headers.get('content-type') || '', robotsHeader: response.headers.get('x-robots-tag') || '', elapsedMs: Math.round(performance.now() - started), body: await response.text() };
  } catch (error) { return { path, status: 0, error: error.message, body: '' }; }
}

function extractPage(response) {
  const { body, ...page } = response;
  const metas = tags(body, 'meta');
  const links = tags(body, 'link');
  page.title = textContent(body.match(/<title[^>]*>([\s\S]*?)<\/title>/i)?.[1]);
  page.description = metas.find((m) => m.name === 'description')?.content || '';
  page.robots = metas.filter((m) => ['robots', 'googlebot'].includes(m.name)).map((m) => m.content).join(',');
  page.canonicals = links.filter((l) => l.rel === 'canonical').map((l) => l.href);
  page.h1 = [...body.matchAll(/<h1\b[^>]*>([\s\S]*?)<\/h1>/gi)].map((m) => textContent(m[1]));
  page.productLinks = unique(tags(body, 'a').map((a) => pathOf(a.href)).filter((path) => path?.startsWith('/shop/')));
  page.images = tags(body, 'img').map(({ src, alt }) => ({ src, alt }));
  page.jsonLd = [];
  for (const match of body.matchAll(/<script\b[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi)) {
    try { page.jsonLd.push(JSON.parse(match[1])); } catch { check(false, page.path, 'Malformed JSON-LD'); }
  }
  check(page.status === 200, page.path, `HTTP 200 (received ${page.status})`);
  check(Boolean(page.title) && !/Application error|Internal Server Error|Product Not Found/i.test(page.title), page.path, 'Meaningful page title, no error shell');
  check(page.h1.length === 1 && Boolean(page.h1[0]), page.path, 'One nonempty H1');
  check(Boolean(page.description), page.path, 'Meta description present');
  check(!/\bnoindex\b/i.test(page.robots), page.path, 'Public page metadata is indexable');
  if (base.origin === canonicalOrigin) check(!/\bnoindex\b/i.test(page.robotsHeader), page.path, 'Production response has no noindex header');
  if (values.preview || base.hostname.endsWith('.vercel.app')) check(/\bnoindex\b/i.test(page.robotsHeader), page.path, 'Preview response is protected from indexing by X-Robots-Tag');
  if (values['strict-seo']) {
    check(page.canonicals.length === 1 && page.canonicals[0] === canonicalOrigin + pathOf(page.finalUrl), page.path, 'One canonical using the final production path');
    check(!/Charmed\s*&\s*Dark\s*\|\s*Charmed\s*&\s*Dark/i.test(page.title), page.path, 'Brand suffix is not duplicated');
  }
  if (page.path.startsWith('/shop/')) {
    const schemas = page.jsonLd.flatMap((node) => Array.isArray(node) ? node : node['@graph'] || [node]);
    const product = schemas.find((node) => [node['@type']].flat().some((type) => ['Product', 'ProductGroup'].includes(type)));
    check(Boolean(product), page.path, 'Product structured data present');
    if (product) {
      check(Boolean(product.name) && Boolean(product.image), page.path, 'Product schema has name and image');
      const offers = product.offers ? [product.offers].flat() : (product.hasVariant || []).flatMap((variant) => [variant.offers].flat()).filter(Boolean);
      check(offers.length > 0, page.path, 'Product structured data includes offers');
      for (const offer of offers) {
        check(Number.isFinite(Number(offer.price ?? offer.lowPrice)) && Number(offer.price ?? offer.lowPrice) >= 0 && Boolean(offer.priceCurrency), page.path, 'Offer has numeric nonnegative price and currency');
        if (offer['@type'] !== 'AggregateOffer') check(/^https?:\/\/schema.org\/(InStock|OutOfStock|PreOrder|BackOrder|LimitedAvailability|SoldOut)$/.test(offer.availability || ''), page.path, 'Offer has valid availability');
        if (offer.url) check(new URL(offer.url, canonicalOrigin).origin === canonicalOrigin, page.path, 'Offer URL uses production origin');
      }
    }
  }
  return page;
}

const [sitemapResponse, feedResponse, robotsResponse, promotionsResponse] = await Promise.all([
  fetchPath('/sitemap.xml'), fetchPath('/api/google-feed'), fetchPath('/robots.txt'), fetchPath('/api/promotions/active'),
]);
check(sitemapResponse.status === 200 && /<urlset\b/.test(sitemapResponse.body), '/sitemap.xml', 'Sitemap returns XML urlset');
report.sitemap = unique([...sitemapResponse.body.matchAll(/<loc>([\s\S]*?)<\/loc>/g)].map((m) => decode(m[1])));
check(report.sitemap.length > 0, '/sitemap.xml', 'Sitemap is nonempty');
check(report.sitemap.every((url) => { try { return new URL(url).origin === canonicalOrigin; } catch { return false; } }), '/sitemap.xml', 'Sitemap URLs use production origin');
check(robotsResponse.status === 200, '/robots.txt', 'Robots file available');
check(!/^Disallow:\s*\/\s*$/im.test(robotsResponse.body), '/robots.txt', 'Robots does not block the entire storefront');
check(feedResponse.status === 200 && /<rss\b/.test(feedResponse.body), '/api/google-feed', 'Merchant feed returns RSS XML');
report.feed = [...feedResponse.body.matchAll(/<item>([\s\S]*?)<\/item>/g)].map((m) => Object.fromEntries(
  ['id', 'link', 'price', 'sale_price', 'availability', 'image_link'].map((field) => [field, xmlText(m[1], 'g:' + field)]),
));
check(report.feed.length > 0, '/api/google-feed', 'Merchant feed is nonempty');
check(new Set(report.feed.map((item) => item.id)).size === report.feed.length && report.feed.every((item) => item.id), '/api/google-feed', 'Feed IDs are unique and nonempty');
for (const item of report.feed) {
  check(/^\d+(\.\d+)? [A-Z]{3}$/.test(item.price) && Boolean(item.link) && Boolean(item.image_link), '/api/google-feed', `Feed item ${item.id} has price, landing URL and image`);
  check(['in_stock', 'out_of_stock', 'preorder', 'backorder', 'in stock', 'out of stock'].includes(item.availability), '/api/google-feed', `Feed item ${item.id} has valid availability`);
}
check(promotionsResponse.status === 200, '/api/promotions/active', 'Promotions endpoint available');
try { report.promotions = JSON.parse(promotionsResponse.body); } catch { check(false, '/api/promotions/active', 'Promotions response is valid JSON'); }

const corePaths = ['/', '/shop', '/collections/kiss-lock-bags', '/collections/smutty-good-girl', '/drops', '/journal', '/shop/celestial-kisslock-bag-in-linen-blended-fabric', '/shop/unisex-softstyle-t-shirt', '/shop/bones-and-brew-summer-unisex-tee-1'];
const productPaths = values['all-products'] ? unique([...report.sitemap, ...(baseline?.sitemap || [])].map(pathOf).filter((path) => path?.startsWith('/shop/'))) : [];
const queue = unique([...corePaths, ...productPaths]);
await Promise.all(Array.from({ length: 3 }, async () => {
  while (queue.length) report.pages.push(extractPage(await fetchPath(queue.shift())));
}));
report.pages.sort((a, b) => a.path.localeCompare(b.path));
if (baseline) {
  for (const oldUrl of baseline.sitemap || []) {
    if (pathOf(oldUrl)?.startsWith('/shop/')) check(report.sitemap.includes(oldUrl), '/sitemap.xml', `Preserved product URL: ${oldUrl}`);
  }
  const feedIds = new Set(report.feed.map((item) => item.id));
  for (const item of baseline.feed || []) check(feedIds.has(item.id), '/api/google-feed', `Preserved feed ID: ${item.id}`);
  const currentShop = report.pages.find((page) => page.path === '/shop');
  for (const path of baseline.pages?.find((page) => page.path === '/shop')?.productLinks || []) check(currentShop?.productLinks.includes(path), '/shop', `Preserved shop product link: ${path}`);
}
const failures = report.checks.filter((item) => !item.pass);
report.result = { passed: report.checks.length - failures.length, failed: failures.length, pages: report.pages.length, sitemapUrls: report.sitemap.length, feedItems: report.feed.length };
if (values.output) await writeFile(values.output, JSON.stringify(report, null, 2) + '\n');
console.log(JSON.stringify({ ...report.result, failures, output: values.output || null }, null, 2));
if (failures.length && !values.record) process.exitCode = 1;
