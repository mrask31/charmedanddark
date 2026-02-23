# Shopify Product Sync

**Purpose**: Bootstrap the Supabase database with all active products from Shopify

---

## Quick Start

### Option 1: API Route (Easiest - Browser)

**URL**: `https://charmedanddark.vercel.app/api/admin/sync-products`

**Method**: GET (just visit in browser)

**Note**: Only works in development/preview (disabled in production for security)

**Steps**:
1. Visit the URL in your browser
2. Wait for sync to complete (may take 30-60 seconds)
3. Check response JSON for summary
4. Verify at `/shop` page

### Option 2: npm Script (Local)

```bash
npm run sync-shopify
```

**Windows Users**: If npm script fails, use:
```bash
npx ts-node scripts/sync-shopify-products.ts
```

---

## What It Does

1. **Fetches** all active products from Shopify Admin API
2. **Transforms** Shopify data to Supabase schema
3. **Upserts** products (inserts new, updates existing)
4. **Maps** critical fields:
   - `handle` → Product URL slug
   - `shopify_id` → Stored in metadata
   - `category` → Product type from Shopify
   - `images` → Array of image URLs
   - `price` → Base price
   - `stock_quantity` → Inventory from first variant

---

## Response Format

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

## Data Mapping

### Shopify → Supabase

| Shopify Field | Supabase Column | Notes |
|--------------|----------------|-------|
| `handle` | `handle` | URL slug (unique) |
| `title` | `title` | Product name |
| `description` | `description` | Plain text description |
| `productType` | `category` | Product category |
| `priceRangeV2.minVariantPrice.amount` | `price`, `base_price` | Numeric price |
| `variants[0].inventoryQuantity` | `stock_quantity` | First variant stock |
| `images[0].url` | `image_url` | Primary image |
| `images[]` | `images` | JSONB array of all images |
| `id` | `metadata.shopify_id` | Shopify GraphQL ID |
| `vendor` | `metadata.vendor` | Product vendor |
| `status` | `metadata.status` | Product status |
| `tags` | `metadata.tags` | Product tags array |

---

## Schema Requirements

### Existing Columns (Already in DB)
- ✅ `id` (UUID, primary key)
- ✅ `handle` (TEXT, unique)
- ✅ `title` (TEXT)
- ✅ `description` (TEXT)
- ✅ `category` (TEXT)
- ✅ `price` (NUMERIC)
- ✅ `base_price` (NUMERIC)
- ✅ `stock_quantity` (INTEGER)
- ✅ `image_url` (TEXT)
- ✅ `images` (JSONB)
- ✅ `metadata` (JSONB)
- ✅ `sync_source` (TEXT)
- ✅ `last_synced_at` (TIMESTAMP)

### No Schema Changes Needed
The current schema already supports all required fields. Shopify-specific data (vendor, status, tags, product_type) is stored in the `metadata` JSONB column.

---

## Verification Steps

### 1. Check Sync Response
```json
{
  "success": true,
  "summary": {
    "totalProducts": 45,  // Should be > 0
    "inserted": 45,       // New products
    "updated": 0,         // Existing products
    "errors": 0           // Should be 0
  }
}
```

### 2. Visit Shop Page
**URL**: `https://charmedanddark.vercel.app/shop`

**Expected**:
- Header shows "X Items" (X > 0)
- Grid displays product cards
- Images load correctly
- Prices display correctly

### 3. Check Individual Product
**URL**: `https://charmedanddark.vercel.app/product/[handle]`

**Expected**:
- Product details load
- Images display
- Price shows
- Add to cart works

### 4. Database Verification
```sql
-- Check product count
SELECT COUNT(*) FROM products WHERE sync_source = 'shopify_admin';

-- Check sample products
SELECT handle, title, category, price, stock_quantity 
FROM products 
WHERE sync_source = 'shopify_admin'
LIMIT 5;

-- Check metadata
SELECT handle, metadata->>'shopify_id', metadata->>'vendor'
FROM products
WHERE sync_source = 'shopify_admin'
LIMIT 5;
```

---

## Troubleshooting

### No Products Synced (inserted: 0)

**Possible Causes**:
1. No active products in Shopify
2. Shopify API credentials missing
3. Network/API error

**Solutions**:
1. Check Shopify admin for active products
2. Verify `SHOPIFY_ADMIN_ACCESS_TOKEN` in env
3. Check API response for errors

### Some Products Failed (errors > 0)

**Possible Causes**:
1. Invalid data format
2. Missing required fields
3. Database constraint violations

**Solutions**:
1. Check error messages in response
2. Verify product data in Shopify
3. Check Supabase logs

### Shop Page Still Shows "0 Items"

**Possible Causes**:
1. Sync didn't complete
2. Products not active
3. Cache issue

**Solutions**:
1. Re-run sync
2. Hard refresh browser (Ctrl+Shift+R)
3. Check database directly
4. Verify `sync_source = 'shopify_admin'`

### Images Not Loading

**Possible Causes**:
1. Shopify CDN URLs expired
2. Image URLs not saved correctly
3. CORS issues

**Solutions**:
1. Check `image_url` field in database
2. Verify images array in `images` JSONB
3. Test image URL directly in browser

---

## Re-Running Sync

### Safe to Re-Run
The sync uses **upsert** logic:
- Existing products (by `handle`) are **updated**
- New products are **inserted**
- No duplicates created

### When to Re-Run
- After adding new products in Shopify
- After updating product details
- After fixing data issues
- Periodically to keep in sync

### Automated Sync (Future)
Consider setting up:
1. Shopify webhook for product updates
2. Scheduled cron job (daily/weekly)
3. Manual trigger in admin panel

---

## API Endpoint Details

**Route**: `app/api/admin/sync-products/route.ts`

**Method**: GET

**Authentication**: None (but disabled in production)

**Rate Limiting**: None (Shopify API has rate limits)

**Timeout**: None (may take 30-60 seconds for large catalogs)

**Environment**:
- ✅ Development: Enabled
- ✅ Preview: Enabled
- ❌ Production: Disabled (security)

---

## Security Notes

### Production Disabled
The API endpoint is **disabled in production** to prevent unauthorized access. For production syncs:
1. Use the CLI script locally
2. Add authentication to API route
3. Use Shopify webhooks instead

### Credentials Required
- `SHOPIFY_ADMIN_ACCESS_TOKEN` - Admin API access token
- `NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN` - Store domain (e.g., `charmed-dark.myshopify.com`)

### Permissions Needed
Shopify Admin API token needs:
- `read_products` - Read product data
- `read_inventory` - Read stock quantities

---

## Next Steps

1. ✅ Run sync (API or CLI)
2. ✅ Verify shop page shows products
3. ✅ Test product detail pages
4. ✅ Run health check for curator notes
5. 🚀 Deploy to production

---

**Status**: Ready to run  
**Last Updated**: 2026-02-23
