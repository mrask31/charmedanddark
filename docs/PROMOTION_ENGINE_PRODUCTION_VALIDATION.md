# Promotion Engine v1 — Production Validation

## Item 6: SEO Validation

### JSON-LD Product Structured Data

Location: `app/shop/[slug]/page.js` → `buildProductJsonLd()`

**Schema output when product is on sale:**
```json
{
  "@context": "https://schema.org",
  "@type": "Product",
  "name": "Celestial Kisslock Bag",
  "url": "https://www.charmedanddark.com/shop/celestial-kisslock-bag-in-linen-blended-fabric",
  "image": "https://cdn.shopify.com/...",
  "sku": "...",
  "brand": { "@type": "Brand", "name": "Charmed & Dark" },
  "offers": {
    "@type": "Offer",
    "price": "16.19",
    "priceCurrency": "USD",
    "priceValidUntil": "2026-07-15",
    "availability": "https://schema.org/InStock",
    "url": "https://www.charmedanddark.com/shop/celestial-kisslock-bag-in-linen-blended-fabric",
    "seller": { "@type": "Organization", "name": "Charmed & Dark" }
  }
}
```

**Schema output when NOT on sale:**
```json
{
  "offers": {
    "@type": "Offer",
    "price": "26.99",
    "priceCurrency": "USD",
    "availability": "https://schema.org/InStock"
  }
}
```
No `priceValidUntil` when not on sale.

### OpenGraph

Product pages have OG meta via `generateMetadata()`:
- `og:title` = product name
- `og:description` = product description (160 chars)
- `og:image` = primary product image

Sale page (`/sale`) has OG meta:
- `og:title` = promotion seo_title or name
- `og:description` = promotion seo_description
- `og:type` = "website"
- `og:url` = canonical

### Twitter Cards

Inherited from OpenGraph via Next.js metadata API (automatic fallback).

### Sitemap

`app/sitemap.ts` conditionally includes `/sale`:
- Present when `getActivePromotions()` returns results
- Removed automatically when no active promotions exist
- Priority: 0.9, changeFrequency: "daily"

### Robots

No robots.txt changes. Default allows all crawling.
`/sale` is not blocked — it's indexed when active, returns 404 when expired (Google removes from index automatically).

### Canonical URLs

- `/sale` → `https://www.charmedanddark.com/sale`
- Product pages → `https://www.charmedanddark.com/shop/{slug}` (unchanged)
- No duplicate content issues — sale page has unique URL with unique content

### Google Rich Results Eligibility

Requirements met:
- [x] schema.org Product type
- [x] offers.price (numeric string)
- [x] offers.priceCurrency (USD)
- [x] offers.availability (schema.org URL)
- [x] priceValidUntil (when on sale)
- [x] Product name
- [x] Product image
- [x] Brand

**Validation:** Run Google Rich Results Test on any product URL after deployment.

---

## Item 7: Merchant Center Compatibility

### The Price Alignment Rule

```
Google Merchant Feed Price = Shopify Variant Price = Actual Checkout Price
```

**The Promotion Engine does NOT modify any of these.** It only adds a *display* layer.

### Flow Verification

1. **Merchant Feed** (`/api/google-feed`): Fetches prices directly from Shopify Storefront API
   - Uses `variant.price.amount` — Shopify's live price
   - Does NOT use our Supabase `sale_price` or promotion engine
   - Feed is always accurate to what Shopify will charge

2. **Shopify Checkout**: Uses variant price from Shopify's own database
   - Our `/api/checkout` sends `merchandiseId` + `quantity` only
   - Never sends a custom price amount
   - Shopify applies its own automatic discounts

3. **Promotion Engine Display**: Shows computed `displayPrice` on the storefront
   - This is purely cosmetic until the matching Shopify automatic discount takes effect at checkout

### When Prices Could Mismatch

| Scenario | Risk | Mitigation |
|----------|------|-----------|
| Promotion created in C&D but not in Shopify | Customer sees sale price, pays full price | Merchant workflow requires creating matching Shopify discount |
| Shopify discount expired but C&D promo still active | Customer pays full, sees sale price | Cron expires C&D promos on end_date; use same dates |
| Shopify discount has different % than C&D promo | Slight price difference | Merchant sets same % in both systems |

### Validation Process

Before publishing any promotion:
1. Create the Shopify automatic discount with matching: products, percentage, dates
2. Preview the promotion on the storefront
3. Add a test product to cart, proceed to checkout
4. Verify Shopify shows the discounted price at checkout
5. Only then publish the C&D promotion

### Google Merchant Center Safety

- Feed price always comes from Shopify (ground truth)
- When Shopify has an active automatic discount + compareAtPrice set, the feed could include `<g:sale_price>`
- Our engine never writes to the feed — zero risk of feed price mismatch
- No Merchant Center disapprovals possible from the Promotion Engine

---

## Item 8: Performance Validation

### Caching Strategy

| Layer | TTL | Scope |
|-------|-----|-------|
| In-memory promotion cache | 60s | Server process (shared across requests) |
| ISR page cache | 60s | Edge/CDN level |
| Supabase connection pooling | Persistent | Database connections |

### Query Count Analysis

**Without Promotion Engine (baseline):**
- Homepage: 5 Supabase queries (one per product section)
- Shop page: 1 query (all products)
- Product page: 2 queries (product + variants)

**With Promotion Engine enabled, 0 active promotions:**
- Homepage: 5 + 1 (getActivePromotions returns empty, cached) = 6 queries
- Extra: +1 query, cached for 60s across all requests

**With Promotion Engine enabled, active promotions:**
- Homepage: 5 + 1 (promotions) + 3 (junction tables) = 9 queries on cache miss
- After cache: 5 + 0 (cached) = 5 queries (same as baseline)
- Cache hit rate: >95% (60s TTL, most users hit cached data)

### N+1 Prevention

- Promotions and targeting data fetched in a **single batch** per cache-miss
- Product enrichment uses a synchronous map over pre-fetched promotion data
- No per-product database query — all matching is done in-memory

### Performance Budget

| Metric | Target | Expected Impact |
|--------|--------|----------------|
| LCP | < 2.5s (no regression) | +0ms on cache hit, +50ms on cache miss (1 extra query) |
| CLS | 0 | Sale badges are fixed-size, inline with existing badge system |
| INP | No regression | SaleNavItem fetch is non-blocking (useEffect) |
| TTFB | No regression | ISR cache serves most requests |

### Measurement Plan

After deployment to preview:
1. Run Lighthouse on homepage (desktop + mobile) — compare to baseline
2. Run Lighthouse on product page with sale price
3. Run Lighthouse on /sale page
4. Measure with WebPageTest for real-world network conditions
5. Compare Core Web Vitals in Search Console after 7 days

---

## Item 9: Testing Strategy

### Unit Tests (lib/promotions/)

| Test | Covers |
|------|--------|
| `computePromotionPrice` with percentage | Basic calculation |
| `computePromotionPrice` with fixed_amount | Fixed discount |
| `computePromotionPrice` with per-product override | Override priority |
| `computePromotionPrice` with price=0 | Edge: free product |
| `computePromotionPrice` with discount > price | Edge: cap at $0 |
| Priority resolution: highest priority wins | Conflict resolution |
| Priority tie: largest discount wins | Tiebreaker 1 |
| Priority+discount tie: newest wins | Tiebreaker 2 |
| Product matching: specific | Targeting |
| Product matching: collection | Targeting |
| Product matching: tag (case-insensitive) | Targeting |
| Product matching: all | Targeting |
| Product exclusion | Exclusion list |
| Lifecycle: draft → not matched | Status gating |
| Lifecycle: expired → not matched | Status gating |
| Feature flag OFF → all returns null | Safety |

### Integration Tests (pages)

| Test | Covers |
|------|--------|
| Homepage with no promotions | Zero regression |
| Homepage with active promotion | Hero renders, prices enriched |
| /sale with no promotions | Returns 404 |
| /sale with active promotion | Products displayed, sorted |
| /shop with sale products | ON SALE filter appears |
| /shop without sale products | ON SALE filter hidden |
| Product page with sale price | Strike-through + JSON-LD |
| Product page without sale | Normal price + JSON-LD (no priceValidUntil) |
| Preview mode: valid secret | Panel renders |
| Preview mode: invalid secret | Nothing renders |
| Nav: SALE link appears when promotion active | Conditional nav |
| Nav: SALE link hidden when no promotion | Conditional nav |

### Edge Cases

| Test | Covers |
|------|--------|
| 0 promotions in database | Graceful empty |
| All promotions expired | Same as 0 |
| Future promotions only (scheduled) | Not shown |
| Product in multiple matching promotions | Highest priority wins |
| Product excluded from matching promotion | Exclusion respected |
| Promotion with no targeted products | Empty /sale page → 404 |
| Invalid promotion data (null percentage) | computePromotionPrice returns null |
| Extremely high percentage (100%) | Price = $0.00 |
| Cache invalidation after admin CRUD | Fresh data served |

### Visual Regression

To be verified manually or via Playwright screenshots:
- Desktop: homepage hero, /sale grid, product card badges, PDP pricing
- Tablet: responsive grid, preview panel
- Mobile: stacked layout, touch targets, preview banner

---

## Item 10: Production Rollout Plan

### Phase A — Feature Flag OFF (Deploy)

**Actions:**
1. Merge PR to main
2. Deploy to Vercel (production)
3. `NEXT_PUBLIC_PROMOTIONS_ENABLED=false` in env vars

**Verification:**
- All pages render identically to pre-merge state
- No new UI elements visible
- No console errors from promotion imports
- Lighthouse scores unchanged
- Google Search Console: no new indexing issues

**Rollback:** Revert merge (but shouldn't be needed — flag OFF means zero visual change)

---

### Phase B — Internal Preview (QA Only)

**Actions:**
1. Apply migration via `supabase db push` (already done)
2. Set `PROMOTION_PREVIEW_SECRET` in Vercel env vars
3. Create a test promotion via Admin API (status: draft)
4. Target a few products

**Verification:**
- Visit `/?preview_promotion=test&preview_secret=SECRET`
- Confirm PreviewPanel shows pricing comparison
- Confirm PreviewBanner appears
- Confirm no public-facing changes
- Confirm /sale still returns 404

**Rollback:** Delete test promotion from database

---

### Phase C — Single Promotion (Internal Testing)

**Actions:**
1. Set `NEXT_PUBLIC_PROMOTIONS_ENABLED=true` in Vercel
2. Create a real promotion (e.g., "Staff Testing 5%" with very low priority)
3. Target 2-3 products
4. Create matching Shopify automatic discount
5. Publish promotion

**Verification:**
- Targeted products show sale price on /shop
- /sale page renders with those products
- Add to cart uses sale price
- Checkout at Shopify shows matching discount
- PostHog events fire correctly
- Google feed prices unchanged (still full Shopify price)
- SALE nav link appears

**Rollback:** Set promotion status to archived, or set env var to false

---

### Phase D — Limited Production (Small Campaign)

**Actions:**
1. Create first real campaign (e.g., "Summerween Flash 2026")
2. Target a collection or tag
3. Set reasonable dates (2-3 days)
4. Create matching Shopify automatic discount
5. Preview → verify → publish

**Verification:**
- Monitor PostHog for promotion events
- Check Google Search Console for any crawl issues
- Verify revenue tracking still works
- Verify Sanctuary discount stacking behavior
- Check /sale page SEO (indexing)

**Rollback:** Archive promotion + disable Shopify discount

---

### Phase E — General Availability (Full Release)

**Actions:**
1. All validation passes from Phase D
2. Document merchant workflow for future campaigns
3. Remove "testing" guardrails
4. Enable for all future campaigns

**Ongoing monitoring:**
- PostHog dashboard for promotion event funnels
- Google Search Console for Rich Results
- Merchant Center for price accuracy
- Core Web Vitals for performance

**Rollback (always available):**
- Set `NEXT_PUBLIC_PROMOTIONS_ENABLED=false` → redeploy
- Takes < 1 minute
- All promotion UI disappears
- No data loss
