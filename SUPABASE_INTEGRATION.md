# Supabase & Shopify Integration

This document describes the Supabase and Shopify integration for Charmed & Dark, implemented as part of Directive 002.

## Overview

The site has been migrated from a static CSV data source to a dynamic Supabase PostgreSQL database, with Shopify as the commerce engine feeding product data.

## What Changed

### Data Layer Migration
- **Before**: Products loaded from `data/charmed_dark_products_ready.csv` via custom parser
- **After**: Products loaded from Supabase PostgreSQL database via `@supabase/supabase-js`
- **Fallback**: CSV functions preserved in `lib/products-csv.js` as safety net

### Frontend Impact
**ZERO CHANGES** - All components receive identical prop shapes. The data source swap is invisible to the frontend.

## Database Schema

### Products Table
Stores enriched product data with the following key columns:
- `id`, `sku`, `shopify_id`, `name`, `slug`, `handle`, `title`
- `category`, `subcategory`, `description`, `lore` (AI-generated)
- `price`, `sale_price`, `cost_price`
- `qty`, `stock_quantity`, `hidden`
- `image_urls` (TEXT[]), `image_url`, `tags` (TEXT[])
- `featured`, `is_featured`, `best_seller`, `collection`
- `meta_title`, `meta_description`
- Timestamps: `created_at`, `updated_at`, `last_synced_at`

### Orders Table
Stores verified order data from Shopify webhooks (Phase 2):
- `id`, `shopify_order_id`, `order_number`
- `email`, `total_price`, `currency`
- `financial_status`, `line_items` (JSONB)
- `shipping_address` (JSONB)

### Email Subscribers Table
Stores email capture form submissions:
- `id`, `email`, `source`
- `utm_campaign`, `utm_source`, `utm_medium`
- `subscribed`, `created_at`

### Blog Posts Table
Stores Journal content (Phase 3):
- `id`, `slug`, `title`, `body_markdown`
- `status` ('draft', 'scheduled', 'published')
- `publish_date`, `featured_product_ids` (UUID[])

## Row Level Security (RLS)

All tables have RLS enabled with the following policies:

- **Products**: Public read (hidden=false), admin write
- **Orders**: Admin only
- **Email Subscribers**: Public insert, admin read/update
- **Blog Posts**: Public read (published only), admin write

## Environment Variables

Required in `.env.local` and Vercel:

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://ewsztwchfbjclbjsqhnd.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGci...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGci... # Server-side only, NEVER expose to client

# Shopify (to be configured)
SHOPIFY_STORE_DOMAIN=your-store.myshopify.com
SHOPIFY_STOREFRONT_ACCESS_TOKEN=your-storefront-api-token

# Sync API
SYNC_API_SECRET=generate-a-random-secret-string-here
```

## API Routes

### POST /api/subscribe
Email signup endpoint. Accepts:
```json
{
  "email": "user@example.com",
  "source": "join_page",
  "utm_campaign": "launch",
  "utm_source": "organic",
  "utm_medium": "web"
}
```

### POST /api/admin/sync-products
Vault Sync Pipeline - pulls products from Shopify and syncs to Supabase.

**Authentication**: Requires `Authorization: Bearer <SYNC_API_SECRET>` header

**Response**:
```json
{
  "success": true,
  "total_shopify": 50,
  "synced": 50,
  "errors": 0,
  "error_details": [],
  "synced_at": "2026-03-08T..."
}
```

**Usage**:
```bash
curl -X POST https://charmedanddark.com/api/admin/sync-products \
  -H "Authorization: Bearer YOUR_SYNC_API_SECRET" \
  -H "Content-Type: application/json"
```

## Data Fetching Functions

All functions in `lib/products.js`:

- `getProducts()` - Returns all non-hidden products
- `getProductBySlug(slug)` - Returns single product by slug
- `getProductsByCategory(category)` - Filter by category
- `getProductsByCollection(collection)` - Filter by collection
- `getBestSellers()` - Returns up to 8 best sellers
- `getFeaturedProducts()` - Returns up to 4 featured products

All functions include CSV fallback if Supabase is unreachable.

## Seeding Data

To migrate CSV data to Supabase:

```bash
npm run seed
```

This runs `scripts/seed-products.js` which:
1. Reads all products from CSV via `lib/products-csv.js`
2. Transforms to Supabase schema
3. Upserts to `products` table (conflict on `slug`)

## Shopify Integration

### Client Utility
`lib/shopify/client.js` - GraphQL client for Shopify Storefront API

### Queries
`lib/shopify/queries.js` - Product queries including:
- `ALL_PRODUCTS_QUERY` - Paginated product fetch
- `getAllShopifyProducts()` - Fetches all products with pagination

## Migration Checklist

- [x] Supabase project provisioned (ewsztwchfbjclbjsqhnd)
- [x] Database schema created (products, orders, email_subscribers, blog_posts)
- [x] RLS policies configured
- [x] Supabase client utilities created
- [x] CSV functions renamed to products-csv.js
- [x] New Supabase-backed products.js created
- [x] Email subscribe API route created
- [x] Shopify client utilities created
- [x] Vault Sync Pipeline API route created
- [x] Sitemap updated to use Supabase
- [x] Build verification passed
- [ ] Seed script executed (requires SUPABASE_SERVICE_ROLE_KEY)
- [ ] Shopify credentials configured
- [ ] Vault Sync tested
- [ ] Frontend verification (all pages render identically)
- [ ] Vercel environment variables configured

## Next Steps (Phase 2)

1. Configure Shopify credentials
2. Run seed script to migrate CSV data
3. Test Vault Sync Pipeline
4. Integrate Claude API for lore generation
5. Build HMAC webhook handler for orders
6. Implement slide-out cart
7. Build Shopify checkout redirect

## Troubleshooting

### Build fails with Supabase errors
- Check environment variables are set correctly
- Verify Supabase project is active
- Check RLS policies allow public read access

### Products not loading
- Check browser console for Supabase errors
- Verify CSV fallback is working
- Check network tab for failed API calls

### Seed script fails
- Verify SUPABASE_SERVICE_ROLE_KEY is set in .env.local
- Check Supabase project is active
- Verify products table schema matches expectations

## Files Modified/Created

### Created
- `lib/supabase/client.js` - Public Supabase client
- `lib/supabase/admin.js` - Admin Supabase client (server-side only)
- `lib/products.js` - Supabase-backed product functions
- `lib/products-csv.js` - Renamed from products.js (fallback)
- `lib/shopify/client.js` - Shopify GraphQL client
- `lib/shopify/queries.js` - Shopify product queries
- `app/api/subscribe/route.js` - Email subscription endpoint
- `app/api/admin/sync-products/route.js` - Vault Sync Pipeline
- `scripts/seed-products.js` - CSV to Supabase migration script
- `.env.local` - Environment variables (not committed)

### Modified
- `app/sitemap.ts` - Updated to use Supabase-backed getProducts
- `package.json` - Added @supabase/supabase-js, dotenv, seed script

### Preserved
- All component files (zero changes)
- All page files (zero changes)
- `data/charmed_dark_products_ready.csv` (kept as fallback)
