# Darkroom Multi-Image Architecture

## Overview
The Darkroom now supports multiple images per product (alternate angles, detail shots, lifestyle images). This upgrade enables a complete product gallery experience on the storefront.

## What Changed

### Database Schema
- Added `images` column (JSONB array) to products table
- Structure: `[{"url": "https://...", "position": 0, "alt": "..."}]`
- Keeps `image_url` for backward compatibility (stores first image)
- Migration: `supabase/migrations/007_add_images_array.sql`

### CSV Format
The Darkroom now accepts multiple image columns:

```csv
product_handle,product_title,image_1,image_2,image_3,image_4
black-taper-candles,Black Taper Candles,https://...,https://...,https://...,
vintage-candlestick,Vintage Candlestick,https://...,https://...,,
```

- Columns: `image_1`, `image_2`, `image_3`, `image_4`, etc.
- Empty columns are skipped (no need to fill all 4)
- Backward compatible: Still accepts single `image_url` column

### Pipeline Processing
1. **Extraction** - Each image is processed through RMBG-1.4 separately
2. **Environment** - Background generated once, reused for all images
3. **Compositing** - Each product image composited onto same background
4. **Upload** - Images saved as `{handle}-1.jpg`, `{handle}-2.jpg`, etc.
5. **Database** - All URLs stored in `images` array with position metadata

### Frontend Display
- **Product Cards** - Show first image (hero)
- **Product Detail Page** - Full image gallery with thumbnails
- **Gallery Component** - Click thumbnails to switch main image
- **Responsive** - Thumbnail grid wraps on mobile

## Migration Steps

### 1. Run Database Migration
Execute in Supabase SQL Editor:

```sql
-- Run migration 007
-- This adds images column and migrates existing image_url data
```

### 2. Update CSV Template
Download new template from `/darkroom-template.csv` with columns:
- `product_handle`
- `product_title`
- `image_1`, `image_2`, `image_3`, `image_4`

### 3. Process Images
Upload CSV to `/admin/darkroom` - pipeline will:
- Process all images for each product
- Upload with position suffixes
- Update database with complete array

### 4. Verify Frontend
Check product detail pages show:
- Main image display
- Thumbnail gallery (if multiple images)
- Click-to-switch functionality

## Example Data Structure

### Database Record
```json
{
  "handle": "black-taper-candles",
  "title": "Black Taper Candles Set",
  "images": [
    {
      "url": "https://supabase.co/.../black-taper-candles-1.jpg",
      "position": 0,
      "alt": "black-taper-candles - Image 1"
    },
    {
      "url": "https://supabase.co/.../black-taper-candles-2.jpg",
      "position": 1,
      "alt": "black-taper-candles - Image 2"
    },
    {
      "url": "https://supabase.co/.../black-taper-candles-3.jpg",
      "position": 2,
      "alt": "black-taper-candles - Image 3"
    }
  ],
  "image_url": "https://supabase.co/.../black-taper-candles-1.jpg"
}
```

### Transformed Product
```typescript
{
  images: {
    hero: "https://supabase.co/.../black-taper-candles-1.jpg",
    front: "https://supabase.co/.../black-taper-candles-2.jpg",
    hover: "https://supabase.co/.../black-taper-candles-3.jpg",
    all: [
      "https://supabase.co/.../black-taper-candles-1.jpg",
      "https://supabase.co/.../black-taper-candles-2.jpg",
      "https://supabase.co/.../black-taper-candles-3.jpg"
    ]
  }
}
```

## UI Components

### ProductImageGallery
New component at `components/ProductImageGallery.tsx`:
- Displays main image (large)
- Shows thumbnail grid below
- Click thumbnail to switch main image
- Active thumbnail has darker border
- Responsive layout

### Product Detail Page
Updated `app/product/[handle]/page.tsx`:
- Uses ProductImageGallery component
- Passes `images.all` array
- Fallback to single hero image if no array

## Cost Impact

### Per Product Processing
- 1 image: ~$0.0078 (same as before)
- 2 images: ~$0.0133 (extraction + 1 compositing)
- 3 images: ~$0.0188 (extraction + 2 compositing)
- 4 images: ~$0.0243 (extraction + 3 compositing)

Background generation cost is shared across all images of same product.

### Example: 50 Products with 3 Images Each
- Total images: 150
- Background removal: 150 × $0.0023 = $0.345
- Background generation: 50 × $0.0055 = $0.275
- **Total: ~$0.62**

## Backward Compatibility

The system maintains full backward compatibility:
- Products with only `image_url` still work
- Single-image CSV format still accepted
- Frontend gracefully handles missing `images` array
- Existing product cards unchanged

## Testing Checklist

- [ ] Run migration 007 in Supabase
- [ ] Upload multi-image CSV to Darkroom
- [ ] Verify all images processed and uploaded
- [ ] Check database `images` array populated
- [ ] Visit product detail page
- [ ] Confirm thumbnail gallery appears
- [ ] Click thumbnails to switch images
- [ ] Test on mobile (thumbnail wrapping)

## Next Steps

1. Run database migration
2. Prepare CSV with multiple image URLs per product
3. Process through Darkroom
4. Verify gallery on product pages
5. Consider adding zoom functionality (future enhancement)
