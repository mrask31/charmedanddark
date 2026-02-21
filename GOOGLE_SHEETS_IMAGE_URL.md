# Google Sheets Image URL Column

## Overview

The Google Sheets spreadsheet is now the **Single Source of Truth (SSOT)** for product imagery. The sync script reads the `image_url` column (Column K) and writes it directly to the Supabase database.

## Setup

### 1. Database Migration

Run this migration in Supabase SQL Editor:

```sql
-- Add image_url column
ALTER TABLE products
  ADD COLUMN IF NOT EXISTS image_url TEXT;

-- Add index for faster lookups
CREATE INDEX IF NOT EXISTS idx_products_image_url ON products(image_url) WHERE image_url IS NOT NULL;

-- Add comment
COMMENT ON COLUMN products.image_url IS 'Direct URL to product image (from Google Sheets or Supabase Storage)';
```

### 2. Google Sheets Column

Add a new column K titled `image_url` to your spreadsheet:

| A (handle) | B (title) | ... | J (options) | K (image_url) |
|------------|-----------|-----|-------------|---------------|
| product-1  | Product 1 | ... | {}          | https://... |

### 3. Image URL Format

Use direct URLs to images hosted in:
- **Supabase Storage** (recommended): `https://ewsztwchfbjclbjsqhnd.supabase.co/storage/v1/object/public/products/product-handle.jpg`
- **External CDN**: Any publicly accessible HTTPS URL
- **Leave blank**: System will use branded placeholder

### 4. Sync Process

1. Upload images to Supabase Storage bucket named `products`
2. Copy the public URL for each image
3. Paste URL into Column K of Google Sheets
4. Run sync: `POST https://charmedanddark.vercel.app/api/sync-sheets`
5. Images will appear on site immediately

## Frontend Behavior

- **If image_url exists**: Displays the image from that URL
- **If image_url is null/empty**: Shows branded dark grey placeholder with "C&D" logo
- **If image fails to load**: Falls back to branded placeholder

## Benefits

✅ No manual file organization required
✅ Images can be hosted anywhere (Supabase Storage, CDN, etc.)
✅ Easy bulk updates via spreadsheet
✅ Graceful fallback for missing images
✅ Single source of truth for all product data

## Example Workflow

1. **Upload to Supabase Storage**:
   ```
   Bucket: products
   File: celestial-taper-candles.jpg
   Public URL: https://ewsztwchfbjclbjsqhnd.supabase.co/storage/v1/object/public/products/celestial-taper-candles.jpg
   ```

2. **Update Google Sheets**:
   - Find row with handle `set-of-3-starry-night-celestial-taper-candles`
   - Paste URL into Column K

3. **Sync**:
   ```powershell
   Invoke-RestMethod -Uri "https://charmedanddark.vercel.app/api/sync-sheets" -Method POST
   ```

4. **Verify**: Visit product page to see image

## Migration Notes

- Existing products without `image_url` will fall back to local `/products/[handle]/hero.jpg` paths
- Once you populate `image_url` in the sheet, it takes priority over local files
- You can gradually migrate products to the new system
