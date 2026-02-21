# The Darkroom - Quick Start

## Status: Ready for Deployment

All code is complete and pushed to GitHub. Vercel will automatically deploy.

## Your Action Items

### 1. Add API Keys to Vercel (Required)

Go to: https://vercel.com/mrask31/charmedanddark/settings/environment-variables

Add this variable:
```
REPLICATE_API_TOKEN = r8_your_token_here
```

Get your token at: https://replicate.com/account/api-tokens

### 2. Create Supabase Storage Bucket (Required)

1. Go to: https://supabase.com/dashboard/project/ewsztwchfbjclbjsqhnd/storage/buckets
2. Click "New bucket"
3. Name: `products`
4. Set as **Public bucket** ✓
5. Click "Create bucket"

### 3. Wait for Vercel Deployment

After pushing to GitHub, Vercel will automatically:
- Install the `sharp` dependency
- Build and deploy the new code
- The Darkroom will be live at: `/admin/darkroom`

### 4. Test The Darkroom

1. Navigate to: `https://charmedanddark.vercel.app/admin/darkroom`
2. Upload a test CSV with 2-3 products
3. Watch the real-time processing queue
4. Verify images appear in Supabase Storage
5. Check that `image_url` column is updated in database

## CSV Format Example

```csv
product_handle,product_title,image_url
black-taper-candles,Black Taper Candles Set,https://cdn.faire.com/image1.jpg
brass-candlestick,Vintage Brass Candlestick,https://cdn.faire.com/image2.jpg
```

## What Happens During Processing

1. **Extraction** - AI removes background, preserves product pixels
2. **Environment** - AI generates dark brutalist backdrop
3. **Compositing** - Sharp layers product over background with shadows
4. **Upload** - Image saved to Supabase Storage as `{handle}.jpg`
5. **Database** - `image_url` column updated automatically

## Cost Per Image

- Background removal: $0.0023
- Background generation: $0.0055
- **Total: ~$0.0078 per image**

For 50 products: ~$0.39

## Troubleshooting

**Build fails with "sharp" error:**
- This is normal on Windows local dev
- Vercel will install sharp correctly in production

**"REPLICATE_API_TOKEN not configured":**
- Add the token to Vercel environment variables
- Redeploy (or wait for auto-deploy)

**Images not uploading:**
- Verify `products` bucket exists in Supabase
- Ensure bucket is set to **Public**

## Ready to Process Full Inventory

Once testing is successful:
1. Export full product list from Faire with image URLs
2. Upload CSV to The Darkroom
3. Let it process all images (will take ~5-10 minutes for 50 products)
4. All product pages will automatically show new images

---

**The Darkroom is ready. Add your Replicate API key and create the storage bucket, then you're cleared for launch.**
