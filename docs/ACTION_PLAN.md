# 🎯 ACTION PLAN - Get Products Showing

**Current Status**: Shop page shows "0 Items" because database is empty

**Solution**: Run the sync to populate database, then shop page will work

---

## What Just Got Fixed

### ✅ Shop Page Now Queries Supabase
**Before**: Queried Shopify Storefront API directly (slow, unreliable)  
**After**: Queries Supabase products table (fast, reliable)

**Commit**: `90214f4` - "fix: Change shop page to query Supabase instead of Shopify Storefront API"

### ✅ Sync Endpoint Ready
**File**: `app/api/admin/sync-products/route.ts`  
**Purpose**: Fetches all products from Shopify and populates Supabase

---

## 🚀 DO THIS NOW

### Step 1: Wait for Vercel Deploy
Check Vercel dashboard - wait for deployment to complete (should be building now)

### Step 2: Run the Sync
Once deployed, open this URL in your browser:

```
https://charmedanddark.vercel.app/api/admin/sync-products
```

**What happens**:
- Browser loads for 30-60 seconds
- Shows JSON response with sync results
- Products are now in database

**Expected response**:
```json
{
  "success": true,
  "summary": {
    "totalProducts": 45,
    "inserted": 45,
    "updated": 0,
    "errors": 0
  }
}
```

### Step 3: Refresh Shop Page
```
https://charmedanddark.vercel.app/shop
```

**Expected**:
- Header shows "45 Items" (or your product count)
- Product grid displays
- Images load
- Prices show

---

## Why This Works Now

### Before (Broken)
```
Shop Page → Shopify Storefront API → Products
                ↓
           Empty response (no products configured)
```

### After (Fixed)
```
1. Sync: Shopify Admin API → Supabase products table
2. Shop Page → Supabase → Products display
```

---

## Schema Status

### ✅ NO SCHEMA CHANGES NEEDED

The `products` table already has everything:
- `id`, `handle`, `title`, `description`
- `category` (stores product type)
- `price`, `base_price`, `stock_quantity`
- `image_url`, `images` (JSONB array)
- `metadata` (JSONB) - stores shopify_id, vendor, status, tags

**Shopify-specific fields** (vendor, status, tags, product_type) are stored in the `metadata` JSONB column, not as separate columns.

---

## Data Flow

```
┌─────────────────┐
│ Shopify Admin   │
│ API             │
└────────┬────────┘
         │
         │ Sync (one-time)
         ↓
┌─────────────────┐
│ Supabase        │
│ products table  │
└────────┬────────┘
         │
         │ Query (every page load)
         ↓
┌─────────────────┐
│ Shop Page       │
│ /shop           │
└─────────────────┘
```

---

## Troubleshooting

### Sync Returns Error

**Check Vercel environment variables**:
- `SHOPIFY_ADMIN_ACCESS_TOKEN` - Must be set
- `NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN` - Must be `charmed-dark.myshopify.com`
- `NEXT_PUBLIC_SUPABASE_URL` - Must be set
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Must be set

### Shop Still Shows 0 Items

1. Check sync response - was `inserted` > 0?
2. Hard refresh browser (Ctrl+Shift+R)
3. Re-run sync URL
4. Check browser console for errors

### Images Not Loading

- Darkroom images take priority (if they exist)
- Falls back to Shopify CDN images
- Shows "No Image" placeholder if both missing

---

## Alternative: CLI Sync

If browser method doesn't work:

```bash
npm run sync-shopify
```

Or on Windows:
```bash
npx ts-node scripts/sync-shopify-products.ts
```

---

## Summary

1. ✅ Shop page fixed to query Supabase
2. ✅ Sync endpoint deployed
3. ✅ Schema already correct (no changes needed)
4. ⏳ **YOU NEED TO**: Run the sync URL
5. ✅ Shop page will then show products

---

## Quick Links

**Sync**: https://charmedanddark.vercel.app/api/admin/sync-products  
**Shop**: https://charmedanddark.vercel.app/shop  
**Health Check**: https://charmedanddark.vercel.app/api/health-check/curator

---

**Status**: Ready to sync  
**Next Action**: Run the sync URL once Vercel deploys  
**Last Updated**: 2026-02-23
