# ⚡ POWER ON SEQUENCE

**Status**: Debug endpoints enabled, ready for final verification

---

## What Was Done

### ✅ Task 1: Bypass Production Safety
- Enabled `/api/debug/env-check` in production
- Enabled `/api/debug/products` in production
- Enabled `/api/admin/sync-products` in production
- Enabled `/api/admin/test-curator` (new endpoint)

**Note**: These have `allowDebug = true` flags that should be set to `false` after verification

---

## Execute Power-On Sequence

### Step 1: Check Environment Variables

**URL**: `https://charmedanddark.vercel.app/api/debug/env-check`

**Expected**:
```json
{
  "success": true,
  "envVars": {
    "GEMINI_API_KEY": { "present": true, "length": 39 },
    "SHOPIFY_ADMIN_ACCESS_TOKEN": { "present": true, "length": 32 },
    "NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN": { "present": true, "value": "charmed-dark.myshopify.com" }
  },
  "missingRequired": []
}
```

**If GEMINI_API_KEY is missing**:
1. Go to Vercel Dashboard → Settings → Environment Variables
2. Add `GEMINI_API_KEY` from [Google AI Studio](https://makersuite.google.com/app/apikey)
3. Redeploy
4. Re-run this check

---

### Step 2: Check Product Images

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
      "image_url": "https://cdn.shopify.com/s/files/...",
      "images_count": 3,
      "first_image": "https://cdn.shopify.com/s/files/..."
    }
  ]
}
```

**If images are null**:
- Products in Shopify don't have images, OR
- Sync didn't capture them properly
- Proceed to Step 3 to re-sync

---

### Step 3: Force Re-Sync Products

**URL**: `https://charmedanddark.vercel.app/api/admin/sync-products`

**What it does**:
- Fetches all active products from Shopify Admin API
- Updates existing products in Supabase
- Captures image URLs from Shopify CDN

**Expected**:
```json
{
  "success": true,
  "summary": {
    "totalProducts": 62,
    "inserted": 0,
    "updated": 62,
    "errors": 0
  }
}
```

**After sync**:
- Re-check `/api/debug/products` to verify images are now present
- Refresh `/shop` page to see images load

---

### Step 4: Test Curator Notes (First 5 Products)

**URL**: `https://charmedanddark.vercel.app/api/admin/test-curator`

**What it does**:
- Generates curator notes for first 5 products
- Tests Gemini API integration
- Saves notes to Shopify metafields

**Expected**:
```json
{
  "success": true,
  "summary": {
    "total": 5,
    "successful": 4-5,
    "failed": 0-1,
    "successRate": "80-100%"
  },
  "results": [
    {
      "handle": "product-handle",
      "title": "Product Name",
      "success": true,
      "duration": 1234,
      "noteLength": 156,
      "note": "Heavy wax forms architectural shadows..."
    }
  ]
}
```

**If all fail**:
- Check `error` field in results
- Likely missing `GEMINI_API_KEY`
- Go back to Step 1

---

### Step 5: Run Full Health Check

**URL**: `https://charmedanddark.vercel.app/api/health-check/curator`

**Expected**:
```json
{
  "success": true,
  "passed": true,
  "envCheck": {
    "geminiApiKey": true,
    "geminiApiKeyLength": 39,
    "shopifyAdminToken": true
  },
  "summary": {
    "totalProducts": 10,
    "successCount": 8-10,
    "successRate": "80-100%"
  }
}
```

---

### Step 6: Verify Shop Page

**URL**: `https://charmedanddark.vercel.app/shop`

**Expected**:
- ✅ Styling: Black/white brutalist design
- ✅ Grid: 2 columns mobile, 4 desktop
- ✅ Images: Product images load (not "No Image")
- ✅ Prices: Display correctly
- ✅ Hover: Scale effect on images

---

### Step 7: Verify Product Page

**URL**: `https://charmedanddark.vercel.app/product/[any-handle]`

**Expected**:
- ✅ Product details load
- ✅ Images display
- ✅ Curator's Note section appears
- ✅ Note text displays (if generated)
- ✅ Add to cart button works

---

## Troubleshooting

### Issue: GEMINI_API_KEY Still Missing

**Check**:
```
/api/debug/env-check
```

**Solution**:
1. Verify added to Vercel: Settings → Environment Variables
2. Check all environments selected: Production, Preview, Development
3. Redeploy: Deployments → Redeploy
4. Wait 2-3 minutes for deployment
5. Re-check `/api/debug/env-check`

### Issue: Images Still Null After Sync

**Possible Causes**:
1. Products in Shopify don't have images
2. Shopify API permissions issue
3. Image URLs not accessible

**Solutions**:
1. Check Shopify Admin → Products → Verify images exist
2. Check Shopify API token has `read_products` scope
3. Test image URL directly in browser
4. Check sync response for specific errors

### Issue: Curator Notes Still Failing

**Check error messages**:
```
/api/admin/test-curator
```

**Common Errors**:
- `"GEMINI_API_KEY environment variable is not configured"` → Add to Vercel
- `"API key not valid"` → Get new key from Google AI Studio
- `"Quota exceeded"` → Check Google Cloud Console quota
- `"SHOPIFY_ADMIN_ACCESS_TOKEN is not configured"` → Add to Vercel

### Issue: Styling Still Missing

**Symptoms**:
- Plain text, no colors
- No grid layout

**Solutions**:
1. Hard refresh: Ctrl+Shift+R (Windows) or Cmd+Shift+R (Mac)
2. Clear browser cache
3. Check Vercel build logs for Tailwind errors
4. Verify deployment completed successfully

---

## After Verification

### Disable Debug Endpoints

Once everything is working, disable production access:

**Files to update**:
1. `app/api/debug/env-check/route.ts` - Set `allowDebug = false`
2. `app/api/debug/products/route.ts` - Set `allowDebug = false`
3. `app/api/admin/sync-products/route.ts` - Set `allowInProduction = false`
4. `app/api/admin/test-curator/route.ts` - Set `allowInProduction = false`

**Then**:
```bash
git add -A
git commit -m "chore: Disable debug endpoints in production"
git push
```

---

## Success Criteria

- [x] 62 products synced
- [ ] Styling displays correctly (black/white brutalist)
- [ ] Images load (not "No Image")
- [ ] Curator notes generate (>80% success)
- [ ] Health check passes
- [ ] Shop page fully functional
- [ ] Product pages load correctly

---

## Quick Links

**Env Check**: https://charmedanddark.vercel.app/api/debug/env-check  
**Product Images**: https://charmedanddark.vercel.app/api/debug/products  
**Re-Sync**: https://charmedanddark.vercel.app/api/admin/sync-products  
**Test Curator**: https://charmedanddark.vercel.app/api/admin/test-curator  
**Health Check**: https://charmedanddark.vercel.app/api/health-check/curator  
**Shop Page**: https://charmedanddark.vercel.app/shop

---

**Status**: Ready for power-on sequence  
**Next Action**: Execute steps 1-7 in order  
**Last Updated**: 2026-02-23
