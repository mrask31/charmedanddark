# Promotion Engine v1 — Architecture & Design

## Executive Summary

A permanent, reusable promotion system for Charmed & Dark that powers all future campaigns (Summerween, Halloween, Black Friday, Valentine's, Flash Sales) without ever editing product prices in Shopify or Supabase.

The engine is **presentation-layer only** on the storefront. Shopify remains the payment authority. Actual checkout discounts are enforced by parallel Shopify automatic discounts that the merchant creates to match each promotion.

---

## 1. Critical Architecture Constraint

```
┌────────────────────────────────────┐
│   Charmed & Dark Storefront        │
│   (Presentation + Merchandising)   │
│                                    │
│   Promotion Engine lives HERE      │
│   • Computes display_price         │
│   • Shows strike-through           │
│   • Renders badges/banners         │
│   • Powers /sale page              │
└──────────────┬─────────────────────┘
               │
               │  Shopify Storefront API
               │  (merchandiseId + quantity ONLY)
               │
┌──────────────▼─────────────────────┐
│   Shopify Checkout                 │
│   (Source of Truth for Payment)    │
│                                    │
│   • Owns variant prices            │
│   • Applies automatic discounts    │
│   • Processes payment              │
│   • HOUSE10 for Sanctuary members  │
└────────────────────────────────────┘
```

**Rule:** The storefront NEVER sends a custom price to Shopify. It sends variant IDs and quantities. Shopify's own automatic discounts handle the actual price reduction.

**Merchant workflow for each campaign:**
1. Create promotion in Charmed & Dark admin (targeting, percentage, dates)
2. Create matching automatic discount in Shopify admin (same products, same %, same dates)
3. Publish — storefront displays the sale, Shopify enforces the price

---

## 2. Database Schema

### 2.1 `promotions` table

```sql
CREATE TABLE promotions (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Identity
  name            TEXT NOT NULL,                    -- Internal name: "Summerween 2026 Flash Sale"
  slug            TEXT NOT NULL UNIQUE,             -- URL slug: "summerween-2026"
  
  -- Status & Scheduling
  status          TEXT NOT NULL DEFAULT 'draft',    -- draft | scheduled | active | expired | archived
  enabled         BOOLEAN NOT NULL DEFAULT false,   -- Feature flag: must be true + active status to render
  start_date      TIMESTAMPTZ NOT NULL,
  end_date        TIMESTAMPTZ NOT NULL,
  
  -- Discount Configuration
  promotion_type  TEXT NOT NULL DEFAULT 'percentage', -- percentage | fixed_amount | bogo (future)
  percentage      NUMERIC(5,2),                    -- e.g. 40.00 for 40% off
  fixed_amount    NUMERIC(10,2),                   -- e.g. 10.00 for $10 off
  
  -- Targeting
  applies_to      TEXT NOT NULL DEFAULT 'specific', -- all | specific | collection | tag
  exclude_sanctuary BOOLEAN NOT NULL DEFAULT false, -- If true, Sanctuary members don't see this promo (they already get 10%)
  
  -- Presentation: Hero / Homepage
  hero_title      TEXT,                            -- "SUMMERWEEN SALE"
  hero_subtitle   TEXT,                            -- "Save up to 40%"
  hero_cta_text   TEXT DEFAULT 'Shop the Sale',
  hero_cta_url    TEXT DEFAULT '/sale',
  accent_color    TEXT DEFAULT '#c9a96e',          -- Campaign accent (gold default)
  badge_text      TEXT,                            -- "40% OFF" or "SUMMERWEEN" on product cards
  
  -- Features
  countdown_enabled   BOOLEAN NOT NULL DEFAULT false,
  homepage_enabled    BOOLEAN NOT NULL DEFAULT false,  -- Show hero on homepage
  landing_page_enabled BOOLEAN NOT NULL DEFAULT true,  -- Show on /sale
  nav_enabled         BOOLEAN NOT NULL DEFAULT true,   -- Show SALE nav item
  
  -- SEO
  seo_title       TEXT,
  seo_description TEXT,
  og_image_url    TEXT,
  
  -- Shopify Sync Reference
  shopify_discount_id TEXT,                       -- Reference to matching Shopify automatic discount
  
  -- Timestamps
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Status lifecycle index
CREATE INDEX idx_promotions_status_dates ON promotions(status, enabled, start_date, end_date);
CREATE INDEX idx_promotions_slug ON promotions(slug);
```

### 2.2 `promotion_products` junction table

```sql
CREATE TABLE promotion_products (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  promotion_id  UUID NOT NULL REFERENCES promotions(id) ON DELETE CASCADE,
  product_id    UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  
  -- Per-product override (optional — falls back to promotion-level percentage/amount)
  override_percentage  NUMERIC(5,2),
  override_fixed       NUMERIC(10,2),
  
  -- Exclusion flag: explicitly exclude this product even if collection matches
  excluded      BOOLEAN NOT NULL DEFAULT false,
  
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  UNIQUE(promotion_id, product_id)
);

CREATE INDEX idx_promotion_products_product ON promotion_products(product_id);
CREATE INDEX idx_promotion_products_promotion ON promotion_products(promotion_id);
```

### 2.3 `promotion_collections` junction table

```sql
CREATE TABLE promotion_collections (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  promotion_id  UUID NOT NULL REFERENCES promotions(id) ON DELETE CASCADE,
  collection    TEXT NOT NULL,    -- Matches products.category or products.collection
  
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  UNIQUE(promotion_id, collection)
);

CREATE INDEX idx_promotion_collections_promotion ON promotion_collections(promotion_id);
```

### 2.4 `promotion_tags` junction table

```sql
CREATE TABLE promotion_tags (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  promotion_id  UUID NOT NULL REFERENCES promotions(id) ON DELETE CASCADE,
  tag           TEXT NOT NULL,    -- Matches ANY tag in products.tags array
  
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  UNIQUE(promotion_id, tag)
);

CREATE INDEX idx_promotion_tags_promotion ON promotion_tags(promotion_id);
```

### 2.5 RLS Policies

```sql
ALTER TABLE promotions ENABLE ROW LEVEL SECURITY;
ALTER TABLE promotion_products ENABLE ROW LEVEL SECURITY;
ALTER TABLE promotion_collections ENABLE ROW LEVEL SECURITY;
ALTER TABLE promotion_tags ENABLE ROW LEVEL SECURITY;

-- Public read for active/enabled promotions only
CREATE POLICY "Public read active promotions" ON promotions
  FOR SELECT USING (enabled = true AND status = 'active');

-- Admin write (service role bypasses RLS)
-- Junction tables: public read via join on active promotions
CREATE POLICY "Public read promotion_products" ON promotion_products
  FOR SELECT USING (true);
CREATE POLICY "Public read promotion_collections" ON promotion_collections
  FOR SELECT USING (true);
CREATE POLICY "Public read promotion_tags" ON promotion_tags
  FOR SELECT USING (true);
```

---

## 3. Domain Model (TypeScript Types)

```typescript
// lib/promotions/types.ts

export type PromotionStatus = 'draft' | 'scheduled' | 'active' | 'expired' | 'archived';
export type PromotionType = 'percentage' | 'fixed_amount';
export type AppliesTo = 'all' | 'specific' | 'collection' | 'tag';

export interface Promotion {
  id: string;
  name: string;
  slug: string;
  status: PromotionStatus;
  enabled: boolean;
  startDate: string;  // ISO timestamp
  endDate: string;
  promotionType: PromotionType;
  percentage: number | null;
  fixedAmount: number | null;
  appliesTo: AppliesTo;
  excludeSanctuary: boolean;

  // Presentation
  heroTitle: string | null;
  heroSubtitle: string | null;
  heroCtaText: string;
  heroCtaUrl: string;
  accentColor: string;
  badgeText: string | null;

  // Features
  countdownEnabled: boolean;
  homepageEnabled: boolean;
  landingPageEnabled: boolean;
  navEnabled: boolean;

  // SEO
  seoTitle: string | null;
  seoDescription: string | null;
  ogImageUrl: string | null;

  // Targeting (loaded separately)
  productIds?: string[];
  collections?: string[];
  tags?: string[];
  excludedProductIds?: string[];
}

export interface PromotionPricing {
  basePrice: number;
  displayPrice: number;
  savings: number;
  percentage: number;
  badgeText: string | null;
  promotionName: string;
  promotionSlug: string;
  endsAt: string;
  countdownEnabled: boolean;
}
```

---

## 4. Core Library Design

### 4.1 `lib/promotions/engine.js`

```
getActivePromotions()
  → Queries promotions where enabled=true, status='active', now() BETWEEN start_date AND end_date
  → Cached for 60 seconds (ISR-compatible)
  → Returns Promotion[] with targeting data joined

getPromotionForProduct(productId, category, tags)
  → Given a product, find the best matching active promotion
  → Priority: specific product match > collection match > tag match > applies_to='all'
  → Returns Promotion | null

computePromotionPrice(basePrice, promotion, productOverride?)
  → Computes display_price based on promotion_type + percentage/fixed_amount
  → Respects per-product overrides
  → Returns PromotionPricing

isProductOnSale(product)
  → Quick boolean check for badge/filter logic

getPromotionBySlug(slug)
  → For /sale/[slug] landing pages (future multi-campaign support)
```

### 4.2 `lib/promotions/cache.js`

```
Caching strategy:
- Server-side: ISR with revalidate = 60 (promotion data changes infrequently)
- Client-side: React context or SWR with stale-while-revalidate
- Cache key includes current timestamp bucketed to nearest minute
- Cache invalidation: Admin CRUD triggers revalidation via /api/revalidate
```

### 4.3 Feature Flag

```javascript
// lib/promotions/config.js
export const PROMOTION_ENGINE_ENABLED = process.env.NEXT_PUBLIC_PROMOTIONS_ENABLED === 'true';

// Usage in components:
if (!PROMOTION_ENGINE_ENABLED) return null; // No-op, zero regression
```

**Rollout strategy:**
1. Deploy with `NEXT_PUBLIC_PROMOTIONS_ENABLED=false` — zero visual change
2. Create first promotion in admin, validate in preview mode
3. Set `NEXT_PUBLIC_PROMOTIONS_ENABLED=true` in Vercel env vars
4. Redeploy — promotion goes live

---

## 5. API Design

### 5.1 Public API (storefront)

```
GET /api/promotions/active
  → Returns active promotions with targeting (cached, public)

GET /api/promotions/[slug]
  → Returns single promotion by slug (for /sale page)

GET /api/promotions/preview?secret=PREVIEW_SECRET&slug=summerween-2026
  → Returns promotion regardless of status (for Campaign Preview mode)
```

### 5.2 Admin API (authenticated)

```
GET    /api/admin/promotions           → List all promotions
POST   /api/admin/promotions           → Create promotion
GET    /api/admin/promotions/[id]      → Get promotion with targeting
PUT    /api/admin/promotions/[id]      → Update promotion
DELETE /api/admin/promotions/[id]      → Archive promotion (soft delete)
POST   /api/admin/promotions/[id]/publish   → Set status to 'active'
POST   /api/admin/promotions/[id]/schedule  → Set status to 'scheduled'

POST   /api/admin/promotions/[id]/products  → Add/remove products
POST   /api/admin/promotions/[id]/collections → Add/remove collections
POST   /api/admin/promotions/[id]/tags      → Add/remove tags
```

### 5.3 Cron API

```
GET /api/cron/promotions/lifecycle
  → Runs every 5 minutes via Vercel Cron
  → Transitions: scheduled → active (when start_date passes)
  → Transitions: active → expired (when end_date passes)
  → Triggers revalidation on state change
```

---

## 6. Storefront Integration Points

### 6.1 Product Transform Enhancement

```javascript
// In lib/products.js → transformProduct
// After base transform, inject promotion pricing:

function transformProduct(row) {
  const base = { /* existing transform */ };
  
  if (PROMOTION_ENGINE_ENABLED) {
    const promo = getPromotionForProduct(row.id, row.category, row.tags);
    if (promo) {
      base.salePrice = computePromotionPrice(base.price, promo).displayPrice;
      base.saleSavings = computePromotionPrice(base.price, promo).savings;
      base.salePercentage = promo.percentage;
      base.saleBadge = promo.badgeText;
      base.saleEndsAt = promo.endDate;
      base.promotionSlug = promo.slug;
    }
  }
  
  return base;
}
```

### 6.2 Component Integration

| Component | Current Behavior | With Promotion Engine |
|-----------|-----------------|----------------------|
| ProductCard | Shows `salePrice \|\| price` | Same — `salePrice` is now populated by engine |
| ProductDetail | Shows `compareAtPrice` strikethrough | Also shows promotion strikethrough + badge |
| HomepageProductSection | Shows `sale_price \|\| price` | Same — promotion populates `sale_price` |
| CartContext | Uses `product.salePrice ?? product.price` | Same — automatically picks up sale price |
| SlideOutCart | Shows item.price | Shows item.price (which is already the sale price) |
| Google Feed | No sale_price | Adds `<g:sale_price>` + `<g:sale_price_effective_date>` |

### 6.3 New Components

```
components/promotions/PromotionHero.js     — Campaign hero banner (homepage)
components/promotions/PromotionBadge.js    — Product card sale badge
components/promotions/CountdownTimer.js    — Campaign countdown
components/promotions/SaleNavItem.js       — Conditional SALE nav link
```

---

## 7. /sale Page Design

```
app/sale/page.js          — Dynamic sale landing page
app/sale/[slug]/page.js   — Future: per-campaign landing pages
```

**Behavior:**
- Fetches all active promotions and their targeted products
- Displays as a filterable, sortable product grid
- If no active promotions exist: returns `notFound()` (404)
- Supports: category filter, sort by discount %, sort by savings $, pagination
- ISR with revalidate = 60

---

## 8. SEO Strategy

### 8.1 /sale Page SEO

```javascript
export async function generateMetadata() {
  const promo = await getActivePromotions();
  if (!promo.length) return { title: 'Sale | Charmed & Dark' };
  
  return {
    title: promo[0].seoTitle || `${promo[0].name} | Charmed & Dark`,
    description: promo[0].seoDescription || `Shop the ${promo[0].name}`,
    openGraph: { /* ... */ },
    alternates: { canonical: 'https://www.charmedanddark.com/sale' },
  };
}
```

### 8.2 Product Page JSON-LD (new)

```json
{
  "@context": "https://schema.org",
  "@type": "Product",
  "name": "Celestial Kisslock Bag",
  "offers": {
    "@type": "Offer",
    "price": "16.19",
    "priceCurrency": "USD",
    "priceValidUntil": "2026-07-15",
    "availability": "https://schema.org/InStock",
    "seller": {
      "@type": "Organization",
      "name": "Charmed & Dark"
    }
  }
}
```

### 8.3 Sitemap

```typescript
// Conditionally include /sale only when active promotions exist
if (activePromotions.length > 0) {
  urls.push({
    url: `${baseUrl}/sale`,
    lastModified: new Date(),
    changeFrequency: 'daily',
    priority: 0.9,
  });
}
```

---

## 9. Campaign Preview Mode

### Design

- URL parameter: `?preview_promotion=SLUG&preview_secret=SECRET`
- When present: loads the specified promotion regardless of status/enabled
- All storefront components check for preview context and render accordingly
- Secret is stored in env vars (`PROMOTION_PREVIEW_SECRET`)
- Preview mode adds a floating banner: "PREVIEW MODE — This promotion is not live"

### Implementation

```javascript
// lib/promotions/preview.js
export function getPreviewPromotion(searchParams) {
  const slug = searchParams.get('preview_promotion');
  const secret = searchParams.get('preview_secret');
  
  if (!slug || secret !== process.env.PROMOTION_PREVIEW_SECRET) return null;
  
  return fetchPromotionBySlug(slug, { ignoreStatus: true });
}
```

---

## 10. Migration Plan

### Phase Order (each phase is independently deployable)

| Phase | Ships | Risk | Rollback |
|-------|-------|------|----------|
| 2: Database | Tables only, no runtime effect | Zero — unused tables | Drop tables |
| 3: Core library | Feature-flagged OFF | Zero — code not reached | Remove imports |
| 4: Admin API | Auth-gated, no public effect | Low — admin-only routes | Remove routes |
| 5: Storefront | Feature-flagged OFF | Zero — flag prevents rendering | Toggle flag off |
| 6: /sale page | Only renders when promotions exist | Zero — 404 when empty | notFound() |
| 7: Shop filter | Only shows when promotions exist | Zero — conditional render | Remove filter option |
| 8: SEO | Additive JSON-LD, no removals | Zero — adds structured data | Remove script tag |
| 9: Preview | Secret-gated, no public effect | Zero — requires secret | Remove param check |
| 10: Go-live | Toggle NEXT_PUBLIC_PROMOTIONS_ENABLED=true | Low — toggle back to false | Set env var false |

### Rollback Strategy

**Immediate (< 1 minute):** Set `NEXT_PUBLIC_PROMOTIONS_ENABLED=false` in Vercel → redeploy. All promotion UI disappears instantly. No data loss, no code changes needed.

**Full rollback:** Revert the branch. Existing code paths are preserved because the engine is purely additive — it injects `salePrice` into an existing field that defaults to `null`.

---

## 11. Shopify Discount Alignment

For each promotion, the merchant must create a matching Shopify automatic discount:

| Charmed & Dark Promotion | Shopify Automatic Discount |
|--------------------------|---------------------------|
| Name: Summerween 2026    | Name: SUMMERWEEN-2026-AUTO |
| Type: 40% off            | Type: Percentage, 40% |
| Products: [specific IDs] | Products: Same collection/products |
| Dates: July 1–15         | Dates: July 1–15 |

**Why this dual-system approach:**
- Storefront shows the correct sale price (presentation)
- Shopify enforces the actual discount at payment (authority)
- No price editing required on either side
- Sanctuary HOUSE10 can stack or be excluded per promotion configuration

**Future enhancement (Phase 2.0):** Auto-create Shopify automatic discounts via the Shopify Admin API when a promotion is published in our admin. This eliminates the manual step.

---

## 12. Performance Budget

| Metric | Target | Strategy |
|--------|--------|----------|
| LCP | < 2.5s | Promotion data cached via ISR (60s), no waterfall queries |
| CLS | 0 | Sale badges are fixed-size, price layout accounts for strikethrough |
| FCP | < 1.8s | Promotion hero is server-rendered, no client-side fetch delay |
| Query count | +1 per page load | Single `getActivePromotions()` call, batch product matching |
| Cache hit rate | > 95% | 60-second ISR + Vercel edge cache |

---

## 13. Security Model

| Concern | Mitigation |
|---------|-----------|
| Checkout price manipulation | Impossible — we don't send prices to Shopify |
| Admin access | Service role key required for writes; RLS enforces read policies |
| Preview mode leak | Secret-gated; secret rotates per campaign |
| XSS in promotion copy | All user-generated strings sanitized before rendering |
| Inventory manipulation | Engine is read-only; never writes to products table |

---

## 14. Zero-Promotion Guarantee

When `PROMOTION_ENGINE_ENABLED=false` OR no active promotions exist:

- `transformProduct` returns `salePrice: null` (same as today)
- `ProductCard` renders `price` only (same as today)
- `ProductDetail` shows base price + Sanctuary price (same as today)
- Homepage shows no promotion hero (same as today)
- `/sale` returns 404 (graceful)
- Navigation shows no SALE link (same as today)
- Google feed has no `sale_price` element (same as today)
- Cart uses `product.price` (same as today)
- Checkout sends variant IDs only (same as today)

**This is not a behavioral promise. It is an architectural guarantee enforced by the feature flag and null-propagation design.**


---

## 15. Conflict Resolution (Production Review Item 2)

### Precedence Algorithm

When a product matches multiple active promotions, the engine resolves conflicts deterministically:

```
1. Higher priority number wins (promotions.priority DESC)
2. If priorities match: largest discount wins (percentage DESC)
3. If discounts match: newest promotion wins (start_date DESC)
```

### Database Fields

```sql
priority     INTEGER NOT NULL DEFAULT 0   -- Higher = wins conflict
is_exclusive BOOLEAN NOT NULL DEFAULT true -- V1: always true (no stacking)
```

### Exclusive vs Non-Exclusive (V2 Architecture)

| Mode | V1 Behavior | V2 Behavior |
|------|-------------|-------------|
| `is_exclusive = true` | Only this promotion applies (winner-takes-all) | Same |
| `is_exclusive = false` | Same as exclusive (V1 doesn't stack) | Can stack with lower-priority promos |

V2 stacking example:
- Priority 10: "Black Friday 30% off" (exclusive) → wins, no stacking
- Priority 5: "Free shipping on bags" (non-exclusive) → could stack below a higher-priority promo
- Priority 0: "Loyalty 5% off" (non-exclusive) → could stack

V1 simplification: **highest-priority match always wins, period.** The `is_exclusive` column exists for forward compatibility but is not evaluated in V1.

### Example Scenario

```
Summerween Sale      priority=10  percentage=40%  → matches bags tagged "summerween"
Halloween General    priority=5   percentage=25%  → matches category "Accessories"  
VIP Weekend          priority=3   percentage=15%  → matches all products
```

A Kiss Lock Bag with tag "summerween":
- Matches all 3 promotions
- Summerween (priority=10) wins → 40% off displayed

A candle without "summerween" tag:
- Matches Halloween (priority=5) and VIP Weekend (priority=3)
- Halloween wins → 25% off displayed

---

## 16. Expanded Lifecycle (Production Review Item 3)

### States

```
draft → scheduled → active/live → expired → archived
```

| Status | Meaning | Visibility | Transitions To |
|--------|---------|-----------|----------------|
| `draft` | Being configured, not ready | Admin only | scheduled, archived |
| `scheduled` | Ready, waiting for start_date | Admin only | active (auto), archived |
| `active`/`live` | Running, visible to customers | Public | expired (auto), archived |
| `expired` | End_date passed, auto-disabled | Admin only | archived |
| `archived` | Soft-deleted, never shown | Admin only | (terminal) |

### Automatic Transitions (Cron)

The cron job at `/api/cron/promotions/lifecycle` runs every 5 minutes:

```
scheduled + enabled + start_date <= NOW() + end_date > NOW()  → active
active + end_date <= NOW()                                    → expired + enabled=false
live + end_date <= NOW()                                      → expired + enabled=false
```

No manual intervention required. Promotions start and stop on schedule.

### Merchant Workflow

1. Create promotion (status: `draft`)
2. Configure targeting, copy, dates
3. Preview (uses preview mode, sees live rendering without publishing)
4. Publish → status becomes `scheduled` (if start_date is future) or `active` (if start_date is now/past)
5. Cron activates when start_date arrives
6. Cron expires when end_date passes
7. Archive when done reviewing results
