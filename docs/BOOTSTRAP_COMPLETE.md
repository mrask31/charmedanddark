# Database Bootstrap - Ready to Sync

**Date**: 2026-02-23  
**Status**: ✅ READY TO RUN

---

## What Was Created

### 1. Shopify Sync Script
**File**: `scripts/sync-shopify-products.ts`

**Purpose**: CLI script to fetch all active products from Shopify and populate Supabase

**Usage**:
```bash
npm run sync-shopify
```

**Windows**:
```bash
npx ts-node scripts/sync-shopify-products.ts
```

### 2. Admin API Route
**File**: `app/api/admin/sync-products/route.ts`

**Purpose**: Browser-accessible sync endpoint (preview/dev only)

**Usage**: Visit in browser
```
https://charmedanddark.vercel.app/api/admin/sync-products
```

**Security**: Disabled in production

### 3. Documentation
**File**: `docs/SHOPIFY_SYNC.md`

Complete guide with:
- Usage instructions
- Data mapping
- Verification steps
- Troubleshooting

---

## Schema Status

### ✅ No Changes Needed

The current Supabase `products` table already has all required columns:
- `id` (UUID, primary key)
- `handle` (TEXT, unique) - Product URL slug
- `title` (TEXT) - Product name
- `description` (TEXT) - Product description
- `category` (TEXT) - Product type/category
- `price` (NUMERIC) - Base price
- `base_price` (NUMERIC) - Original price
- `stock_quantity` (INTEGER) - Inventory count
- `image_url` (TEXT) - Primary image URL
- `images` (JSONB) - Array of all images
- `metadata` (JSONB) - Shopify-specific data
- `sync_source` (TEXT) - Sync origin
- `last_synced_at` (TIMESTAMP) - Last sync time

### Shopify Data Storage

**Direct Columns**:
- `handle` ← Shopify handle
- `title` ← Shopify title
- `description` ← Shopify description
- `category` ← Shopify productType
- `price` ← Shopify price

**Metadata JSONB** (Shopify-specific):
- `shopify_id` - Shopify product ID
- `vendor` - Product vendor
- `status` - Product status (active/draft)
- `tags` - Product tags array
- `product_type` - Original Shopify productType

---

## Next Steps

### Step 1: Run Sync

**Option A: Browser (Easiest)**
1. Visit: `https://charmedanddark.vercel.app/api/admin/sync-products`
2. Wait for JSON response (30-60 seconds)
3. Check `summary.inserted` > 0

**Option B: CLI**
```bash
npm run sync-shopify
```

### Step 2: Verify Shop Page

**URL**: `https://charmedanddark.vercel.app/shop`

**Expected**:
- Header shows "X Items" (X > 0)
- Product grid displays
- Images load
- Prices show

### Step 3: Test Product Page

**URL**: `https://charmedanddark.vercel.app/product/[any-handle]`

**Expected**:
- Product details load
- Images display
- Curator's Note section (may be empty initially)
- Add to cart button

### Step 4: Run Health Check

**URL**: `https://charmedanddark.vercel.app/api/health-check/curator`

**Expected**:
- `passed: true`
- `successRate` >80%
- Curator notes generated for products

---

## Verification Checklist

- [ ] Sync completed successfully
- [ ] Shop page shows product count > 0
- [ ] Product grid displays with images
- [ ] Individual product pages load
- [ ] Health check passes (>80% success rate)
- [ ] Curator notes generating

---

## Troubleshooting

### Sync Returns 0 Products

**Check**:
1. Shopify has active products
2. `SHOPIFY_ADMIN_ACCESS_TOKEN` is set
3. `NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN` is correct

**Test Credentials**:
```bash
curl -X POST \
  https://charmed-dark.myshopify.com/admin/api/2024-01/graphql.json \
  -H "X-Shopify-Access-Token: YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"query":"{ shop { name } }"}'
```

### Shop Page Shows 0 Items

**Check**:
1. Sync completed successfully
2. Hard refresh browser (Ctrl+Shift+R)
3. Check database:
```sql
SELECT COUNT(*) FROM products WHERE sync_source = 'shopify_admin';
```

### Images Not Loading

**Check**:
1. Image URLs in database
2. Shopify CDN accessible
3. CORS settings

---

## Data Flow

```
Shopify Admin API
    ↓
GraphQL Query (all active products)
    ↓
Transform to Supabase schema
    ↓
Upsert to products table
    ↓
Shop page queries products
    ↓
Product grid renders
```

---

## Files Created/Modified

**New Files**:
- `scripts/sync-shopify-products.ts` - CLI sync script
- `app/api/admin/sync-products/route.ts` - API sync endpoint
- `docs/SHOPIFY_SYNC.md` - Complete documentation
- `docs/BOOTSTRAP_COMPLETE.md` - This file

**Modified Files**:
- `package.json` - Added `sync-shopify` script

---

## Ready to Execute

Everything is deployed and ready. Just run the sync:

**Easiest Method**:
```
https://charmedanddark.vercel.app/api/admin/sync-products
```

Then verify:
```
https://charmedanddark.vercel.app/shop
```

---

**Status**: Deployed and ready to sync  
**Commit**: `72bc72b` - "feat: Add Shopify product sync (API route + CLI script)"
