# 🚀 RUN THE SYNC NOW

The sync endpoint is deployed and ready. Follow these steps:

---

## Step 1: Run the Sync

**Open this URL in your browser:**

```
https://charmedanddark.vercel.app/api/admin/sync-products
```

**What will happen:**
- Browser will show "Loading..." for 30-60 seconds
- Then display JSON response with sync results

**Expected Response:**
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

---

## Step 2: Verify Shop Page

**Refresh this URL:**

```
https://charmedanddark.vercel.app/shop
```

**Expected:**
- Header shows "45 Items" (or whatever your product count is)
- Product grid displays with images
- Products are clickable

---

## Step 3: Test a Product Page

Click any product or visit:

```
https://charmedanddark.vercel.app/product/[any-handle]
```

**Expected:**
- Product details load
- Images display
- Price shows
- Add to cart button appears

---

## Troubleshooting

### If sync returns error

**Check environment variables in Vercel:**
1. Go to Vercel dashboard
2. Select project
3. Settings → Environment Variables
4. Verify these exist:
   - `SHOPIFY_ADMIN_ACCESS_TOKEN`
   - `NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN`
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`

### If shop still shows 0 items

1. Hard refresh browser (Ctrl+Shift+R)
2. Check sync response - was `inserted` > 0?
3. Re-run sync URL
4. Check browser console for errors

---

## Alternative: CLI Method

If browser method doesn't work, run locally:

```bash
npm run sync-shopify
```

Or on Windows:
```bash
npx ts-node scripts/sync-shopify-products.ts
```

---

## What the Sync Does

1. Fetches all active products from Shopify Admin API
2. Transforms data to Supabase schema
3. Inserts into `products` table
4. Maps:
   - `handle` → URL slug
   - `title` → Product name
   - `category` → Product type
   - `price` → Base price
   - `images` → Image URLs
   - `metadata.shopify_id` → Shopify ID

---

## Schema Status

✅ **No schema changes needed!**

The current `products` table already has all required columns:
- `handle`, `title`, `description`, `category`
- `price`, `base_price`, `stock_quantity`
- `image_url`, `images` (JSONB)
- `metadata` (JSONB) - stores vendor, status, tags, shopify_id

---

## Ready to Go!

Just click this link:

👉 **https://charmedanddark.vercel.app/api/admin/sync-products**

Then refresh:

👉 **https://charmedanddark.vercel.app/shop**

---

**Status**: Deployed and ready  
**Last Updated**: 2026-02-23
