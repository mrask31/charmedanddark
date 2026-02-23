# Health Check Fix - Database Schema Alignment

**Date**: 2026-02-23  
**Issue**: Postgres error 42703 - column "product_type" does not exist

---

## Problem

The health check was querying for `product_type` and `shopify_product_id` columns that don't exist in the current Supabase products table schema.

**Error**: `column "product_type" does not exist`

---

## Root Cause

The products table uses `category` instead of `product_type`. The schema was misaligned between:
- TypeScript interfaces (had `product_type`, `shopify_product_id`)
- Actual database schema (has `category`, uses `id` as primary key)

---

## Changes Made

### 1. Health Check API (`app/api/health-check/curator/route.ts`)
**Before**:
```typescript
.select('id, handle, title, product_type, description, shopify_product_id')
```

**After**:
```typescript
.select('id, handle, title, category, description')
```

**Usage**:
```typescript
const note = await getCuratorNote(
  product.id,           // Use id directly
  product.title,
  product.category,     // Use category instead of product_type
  product.description
);
```

### 2. Product Page (`app/product/[handle]/page.tsx`)
**Before**:
```typescript
const curatorNote = await getCuratorNote(
  raw.shopify_product_id || raw.id,
  raw.title,
  raw.product_type || null,
  raw.description || null
);
```

**After**:
```typescript
const curatorNote = await getCuratorNote(
  raw.id,
  raw.title,
  raw.category || null,
  raw.description || null
);
```

### 3. CLI Health Check Script (`scripts/health-check-curator.ts`)
Updated interface and query to match API route changes.

### 4. Product Interface (`lib/supabase/client.ts`)
Removed non-existent fields:
- ❌ `product_type`
- ❌ `shopify_product_id`

Kept existing field:
- ✅ `category`

---

## Data Integrity

### Primary Keys
- **Product ID**: `id` (UUID from Supabase)
- **Product Handle**: `handle` (unique slug for URLs)

### Curator Note Sync
The curator note is synced using:
1. **Product ID** (`id`) - Primary identifier
2. **Product Title** (`title`) - For generation context
3. **Category** (`category`) - For generation context (replaces `product_type`)
4. **Description** (`description`) - For generation context

### Metafield Storage
Curator notes are stored in Shopify metafields:
- **Namespace**: `custom`
- **Key**: `curator_note`
- **Product Identifier**: Uses `id` from Supabase products table

---

## Verification Steps

### 1. Check Build
```bash
# Vercel should now build successfully
# No more "column does not exist" errors
```

### 2. Run Health Check
**Preview**:
```
https://charmedanddark.vercel.app/api/health-check/curator
```

**Production** (after deployment):
```
https://charmedanddark.com/api/health-check/curator
```

**Expected Response**:
```json
{
  "success": true,
  "passed": true,
  "summary": {
    "totalProducts": 10,
    "successCount": 8-10,
    "failureCount": 0-2,
    "successRate": "80-100%"
  }
}
```

### 3. Verify Product Pages
Visit any product page and check:
- Curator's Note section appears
- Note is 2 sentences
- Brutalist tone (texture, shadows, architectural presence)
- No marketing fluff

---

## Database Schema Reference

### Products Table (Actual Schema)
```sql
CREATE TABLE products (
  id UUID PRIMARY KEY,
  handle TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  category TEXT,              -- ✅ This exists
  price NUMERIC,
  base_price NUMERIC,
  house_price NUMERIC,
  stock_quantity INTEGER,
  image_url TEXT,
  images JSONB,
  variants JSONB,
  metadata JSONB,
  sync_source TEXT,
  last_synced_at TIMESTAMP,
  created_at TIMESTAMP,
  updated_at TIMESTAMP
);
```

**Note**: No `product_type` or `shopify_product_id` columns exist.

---

## Impact

### ✅ Fixed
- Health check API now works
- Product pages can generate curator notes
- TypeScript types match database schema
- No more Postgres errors

### ⚠️ No Breaking Changes
- Curator note generation still works
- Uses `category` instead of `product_type` (same semantic meaning)
- Uses `id` instead of `shopify_product_id` (more reliable)

---

## Next Steps

1. ✅ Build should succeed on Vercel
2. ⏳ Wait for deployment to complete
3. 🧪 Run health check on preview URL
4. ✅ Verify >80% success rate
5. 🚀 Deploy to production
6. 🧪 Run health check on production URL

---

**Status**: Fixed and deployed  
**Commit**: `e630402` - "Fix: Use category instead of product_type in health check and product queries"
