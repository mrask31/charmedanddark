# The Darkroom - Setup Guide

## Overview
The Darkroom is an automated image processing pipeline that transforms product images using AI compositing. It preserves 100% of original product pixels while generating branded brutalist backdrops.

## Architecture

### Pipeline Flow
1. **Extraction** - RMBG-1.4 removes background with alpha channel preservation
2. **Environment** - Generate branded brutalist backdrop separately (SDXL)
3. **Compositing** - Pixel-perfect layering with drop shadows using Sharp
4. **Sync** - Upload to Supabase Storage and update database

### Key Features
- Compositing-first approach prevents AI hallucination
- Original product pixels are never modified by AI
- Streaming SSE progress updates
- Batch CSV processing

## Setup Instructions

### 1. Environment Variables

Add these to your Vercel environment variables:

```bash
# Required
REPLICATE_API_TOKEN=r8_xxxxxxxxxxxxxxxxxxxxxxxxxxxxx

# Optional (fallback for background generation)
STABILITY_API_KEY=sk-xxxxxxxxxxxxxxxxxxxxxxxxxxxxx

# Already configured
NEXT_PUBLIC_SUPABASE_URL=https://ewsztwchfbjclbjsqhnd.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

### 2. Supabase Storage Bucket

Create a public storage bucket named `products` in your Supabase dashboard:

1. Go to Storage in Supabase dashboard
2. Create new bucket: `products`
3. Set as **Public bucket** (images need to be publicly accessible)
4. No RLS policies needed for public bucket

### 3. API Keys

#### Replicate API Key
1. Sign up at https://replicate.com
2. Go to Account Settings → API Tokens
3. Create new token
4. Add to Vercel as `REPLICATE_API_TOKEN`

#### Stability AI (Optional)
1. Sign up at https://platform.stability.ai
2. Go to API Keys
3. Create new key
4. Add to Vercel as `STABILITY_API_KEY`

### 4. CSV Format

The Darkroom accepts CSV files with these columns:

```csv
product_handle,product_title,image_url
black-taper-candles,Black Taper Candles Set,https://example.com/image.jpg
vintage-brass-candlestick,Vintage Brass Candlestick,https://example.com/image2.jpg
```

**Required columns:**
- `product_handle` or `handle` - Must match database handle exactly
- `image_url` or `image` - Source image URL to process

**Optional columns:**
- `product_title` or `title` - For display in UI (uses handle if missing)

## Usage

### Access The Darkroom
Navigate to: `https://charmedanddark.vercel.app/admin/darkroom`

### Process Images
1. Upload CSV file with product handles and source image URLs
2. Click "Process Images"
3. Watch real-time progress for each product
4. Images are automatically uploaded to Supabase Storage
5. Database `image_url` column is updated automatically

### Monitoring
- Each job shows status: pending → extracting → generating → compositing → uploading → complete
- Errors are displayed inline with job details
- Completed jobs show "View Image" link to verify output

## Technical Details

### Background Removal
- Model: RMBG-1.4 via Replicate
- Output: PNG with alpha channel
- Preserves 100% of original product pixels

### Background Generation
- Primary: Stable Diffusion XL via Replicate
- Fallback: Stability AI API
- Prompt: "Dark brutalist concrete wall, moody single-source lighting, architectural shadows, empty space, product photography backdrop, matte finish"
- Negative prompt: "product, object, text, watermark, logo, people, faces"

### Compositing
- Library: Sharp (Node.js image processing)
- Product scaled to max 80% of background size
- Centered positioning
- Drop shadow: 2% offset, 3% blur, 30% brightness
- Output: JPEG at 90% quality with mozjpeg optimization

### Storage
- Bucket: `products`
- Filename: `{product-handle}.jpg`
- Upsert: true (overwrites existing)
- Public URL format: `https://ewsztwchfbjclbjsqhnd.supabase.co/storage/v1/object/public/products/{filename}`

## Troubleshooting

### "REPLICATE_API_TOKEN not configured"
Add the API token to Vercel environment variables and redeploy.

### "Storage upload failed"
Ensure the `products` bucket exists and is set to public in Supabase.

### "Database update failed"
Verify `SUPABASE_SERVICE_ROLE_KEY` is set correctly in Vercel.

### Images not showing on site
Check that the `image_url` column was updated in the database and the URL is publicly accessible.

## Cost Estimates

### Replicate (Pay-per-use)
- RMBG-1.4: ~$0.0023 per image
- SDXL: ~$0.0055 per image
- **Total per image: ~$0.0078**

### Stability AI (Alternative)
- SDXL: ~$0.004 per image

### Example: 50 products
- Replicate: ~$0.39
- Stability: ~$0.20

## Next Steps

1. Add `REPLICATE_API_TOKEN` to Vercel
2. Create `products` bucket in Supabase Storage
3. Deploy to Vercel (will install `sharp` dependency)
4. Test with small CSV (2-3 products)
5. Process full inventory CSV
