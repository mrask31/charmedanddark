# 🔍 Diagnostic Guide

**Status**: 62 products synced, but styling and images missing

---

## What Was Fixed

### 1. Tailwind CSS Directives ✅
**Problem**: CSS not loading  
**Fix**: Added `@tailwind` directives to `app/globals.css`

```css
@tailwind base;
@tailwind components;
@tailwind utilities;
```

### 2. Image Handling ✅
**Problem**: All products showing "No Image"  
**Fix**: 
- Added `unoptimized` prop for Shopify CDN images
- Added debug logging to identify missing images
- Proper fallback chain: Darkroom → Supabase → "No Image"

### 3. Environment Variable Debugging ✅
**Added**: More detailed env var checking in health check

---

## Diagnostic Endpoints

### Check Product Images
```
https://charmedanddark.vercel.app/api/debug/products
```

**Shows**:
- First 5 products
- Image URLs
- Image counts
- Helps identify if images are in database

### Check Environment Variables
```
https://charmedanddark.vercel.app/api/debug/env-check
```

**Shows**:
- Which env vars are present
- Key lengths (not values)
- Missing required variables

### Health Check (Enhanced)
```
https://charmedanddark.vercel.app/api/health-check/curator
```

**Now shows**:
- Detailed env var status
- Exact error messages per product
- Key lengths for debugging

---

## After Deployment

### 1. Check Styling
**URL**: `https://charmedanddark.vercel.app/shop`

**Expected**:
- Black and white brutalist design
- Grid layout (2 columns mobile, 4 desktop)
- Proper spacing and borders

**If still broken**:
- Hard refresh (Ctrl+Shift+R)
- Check browser console for CSS errors
- Verify Tailwind is compiling in Vercel build logs

### 2. Check Images
**URL**: `https://charmedanddark.vercel.app/api/debug/products`

**Expected**:
```json
{
  "success": true,
  "count": 5,
  "products": [
    {
      "handle": "product-handle",
      "title": "Product Name",
      "image_url": "https://cdn.shopify.com/...",
      "images_count": 3,
      "first_image": "https://cdn.shopify.com/..."
    }
  ]
}
```

**If images are null**:
- Re-run sync: `/api/admin/sync-products`
- Check Shopify products have images
- Verify Shopify API permissions

### 3. Check Curator Notes
**URL**: `https://charmedanddark.vercel.app/api/health-check/curator`

**Look for**:
```json
{
  "envCheck": {
    "geminiApiKey": true,
    "geminiApiKeyLength": 39,
    "shopifyAdminToken": true,
    "shopifyAdminTokenLength": 32
  }
}
```

**If false**:
- Add missing env vars to Vercel
- Redeploy
- Re-run health check

---

## Common Issues

### Issue: Styling Still Missing

**Symptoms**:
- Plain text, no colors
- No grid layout
- No borders

**Solutions**:
1. Check Vercel build logs for Tailwind errors
2. Verify `tailwind.config.ts` exists
3. Hard refresh browser
4. Check `app/layout.tsx` imports `globals.css`

### Issue: Images Still Missing

**Symptoms**:
- All products show "No Image"
- Debug endpoint shows `image_url: null`

**Solutions**:
1. Check if products have images in Shopify
2. Re-run sync: `/api/admin/sync-products`
3. Check sync response for errors
4. Verify Shopify API has `read_products` scope

**Check Shopify**:
1. Go to Shopify Admin → Products
2. Click a product
3. Verify it has images
4. Check image URLs are accessible

### Issue: Some Images Load, Some Don't

**Symptoms**:
- Mixed "No Image" and actual images
- Console shows image load errors

**Solutions**:
1. Check browser console for specific errors
2. Verify Shopify CDN URLs are accessible
3. Check Next.js image optimization settings
4. Add Shopify CDN to `next.config.js` image domains

### Issue: Curator Notes Still Failing

**Symptoms**:
- Health check shows 0% success
- Errors mention "GEMINI_API_KEY"

**Solutions**:
1. Verify key in Vercel: Settings → Environment Variables
2. Check key is valid in [Google AI Studio](https://aistudio.google.com/)
3. Redeploy after adding key
4. Check Gemini API quota not exceeded

---

## Next Steps

### After Styling Fix
1. ✅ Verify shop page looks correct
2. ✅ Check product grid renders properly
3. ✅ Test hover effects work

### After Image Fix
1. ✅ Verify images load
2. ✅ Check image quality
3. ✅ Test on mobile (responsive)

### After Curator Fix
1. ✅ Add `GEMINI_API_KEY` to Vercel
2. ✅ Redeploy
3. ✅ Run health check
4. ✅ Verify >80% success rate

---

## Quick Verification Checklist

- [ ] Shop page has styling (black/white brutalist)
- [ ] Products display in grid (2/4 columns)
- [ ] Images load (not "No Image")
- [ ] Prices display correctly
- [ ] Hover effects work
- [ ] Mobile responsive
- [ ] Health check passes (>80%)
- [ ] Curator notes generating

---

## Debug Commands

**Check what's in database**:
```
/api/debug/products
```

**Check environment variables**:
```
/api/debug/env-check
```

**Check curator note generation**:
```
/api/health-check/curator
```

**Re-sync products**:
```
/api/admin/sync-products
```

---

**Status**: Fixes deployed, waiting for Vercel build  
**Last Updated**: 2026-02-23
