# 🚨 IMMEDIATE ACTIONS REQUIRED

**Problem**: Health check shows 0% success, shop shows 0 items  
**Root Cause**: Missing environment variables in Vercel

---

## Step 1: Check What's Missing

**URL**: `https://charmedanddark.vercel.app/api/debug/env-check`

This will show which environment variables are missing.

**Expected to see**:
```json
{
  "success": false,
  "missingRequired": [
    "GEMINI_API_KEY",
    "SHOPIFY_ADMIN_ACCESS_TOKEN"
  ]
}
```

---

## Step 2: Add Missing Variables to Vercel

### Go to Vercel Dashboard

1. Visit: https://vercel.com/dashboard
2. Select project: `charmedanddark`
3. Click **Settings** tab
4. Click **Environment Variables** in left sidebar

### Add These Variables

#### GEMINI_API_KEY (CRITICAL)
- **Key**: `GEMINI_API_KEY`
- **Value**: Get from [Google AI Studio](https://makersuite.google.com/app/apikey)
- **Environments**: Production, Preview, Development
- **Why**: Required for curator note generation

#### SHOPIFY_ADMIN_ACCESS_TOKEN (CRITICAL)
- **Key**: `SHOPIFY_ADMIN_ACCESS_TOKEN`
- **Value**: From Shopify Admin → Apps → Develop apps
- **Environments**: Production, Preview, Development
- **Why**: Required for syncing products and saving curator notes

#### NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN
- **Key**: `NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN`
- **Value**: `charmed-dark.myshopify.com`
- **Environments**: Production, Preview, Development

#### NEXT_PUBLIC_SUPABASE_URL
- **Key**: `NEXT_PUBLIC_SUPABASE_URL`
- **Value**: From Supabase Dashboard → Project Settings → API
- **Environments**: Production, Preview, Development

#### NEXT_PUBLIC_SUPABASE_ANON_KEY
- **Key**: `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- **Value**: From Supabase Dashboard → Project Settings → API (anon/public key)
- **Environments**: Production, Preview, Development

---

## Step 3: Redeploy

After adding variables, trigger a redeploy:

### Option A: Vercel Dashboard
1. Go to **Deployments** tab
2. Click ⋯ on latest deployment
3. Click **Redeploy**

### Option B: Git Push
```bash
git commit --allow-empty -m "Trigger redeploy with env vars"
git push origin reset/google-revenue-engine
```

---

## Step 4: Verify Environment Variables

**URL**: `https://charmedanddark.vercel.app/api/debug/env-check`

**Expected**:
```json
{
  "success": true,
  "missingRequired": []
}
```

---

## Step 5: Run Product Sync

**URL**: `https://charmedanddark.vercel.app/api/admin/sync-products`

This populates the database with products from Shopify.

**Expected**:
```json
{
  "success": true,
  "summary": {
    "totalProducts": 45,
    "inserted": 45
  }
}
```

---

## Step 6: Verify Shop Page

**URL**: `https://charmedanddark.vercel.app/shop`

**Expected**:
- Header shows "45 Items" (or your product count)
- Product grid displays
- Images load

---

## Step 7: Run Health Check

**URL**: `https://charmedanddark.vercel.app/api/health-check/curator`

**Expected**:
```json
{
  "success": true,
  "passed": true,
  "envCheck": {
    "geminiApiKey": true,
    "shopifyAdminToken": true,
    "shopifyDomain": true,
    "supabaseUrl": true,
    "supabaseKey": true
  },
  "summary": {
    "successRate": "80-100%"
  }
}
```

---

## Troubleshooting

### Health Check Still Shows Errors

**Check the `results` array** in health check response:
```json
{
  "results": [
    {
      "handle": "product-handle",
      "status": "failure",
      "error": "GEMINI_API_KEY environment variable is not configured"
    }
  ]
}
```

The error message tells you exactly what's wrong.

### Shop Still Shows 0 Items

1. Did you run the sync? (`/api/admin/sync-products`)
2. Check sync response - was `inserted` > 0?
3. Hard refresh browser (Ctrl+Shift+R)

### Curator Notes Still Failing

1. Verify `GEMINI_API_KEY` is set in Vercel
2. Test key works in [Google AI Studio](https://aistudio.google.com/)
3. Check you redeployed after adding env vars
4. Check Vercel logs for detailed errors

---

## Quick Links

**Env Check**: https://charmedanddark.vercel.app/api/debug/env-check  
**Sync Products**: https://charmedanddark.vercel.app/api/admin/sync-products  
**Health Check**: https://charmedanddark.vercel.app/api/health-check/curator  
**Shop Page**: https://charmedanddark.vercel.app/shop  
**Vercel Dashboard**: https://vercel.com/dashboard

---

## Summary

1. ✅ Check missing env vars: `/api/debug/env-check`
2. ✅ Add to Vercel: Settings → Environment Variables
3. ✅ Redeploy: Deployments → Redeploy
4. ✅ Verify: `/api/debug/env-check` shows all present
5. ✅ Sync products: `/api/admin/sync-products`
6. ✅ Check shop: `/shop` shows products
7. ✅ Health check: `/api/health-check/curator` passes

---

**Status**: Deployed, waiting for env vars  
**Next Action**: Add environment variables to Vercel  
**Last Updated**: 2026-02-23
