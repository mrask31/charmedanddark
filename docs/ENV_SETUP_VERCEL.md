# Environment Variables Setup for Vercel

**Issue**: Health check shows 0% success, shop shows 0 items  
**Root Cause**: Missing environment variables in Vercel

---

## Required Environment Variables

### 1. Gemini AI (CRITICAL for Curator Notes)

```
GEMINI_API_KEY=your_gemini_api_key_here
```

**Where to get it**:
1. Go to [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Create API key
3. Copy the key

**Without this**: Curator notes will fail immediately

---

### 2. Shopify Admin API

```
SHOPIFY_ADMIN_ACCESS_TOKEN=shpat_xxxxxxxxxxxxx
```

**Where to get it**:
1. Shopify Admin → Apps → Develop apps
2. Create app or use existing
3. Admin API access token
4. Needs scopes: `read_products`, `write_products`, `read_inventory`

**Without this**: Cannot sync products, cannot save curator notes

---

### 3. Shopify Store Domain

```
NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN=charmed-dark.myshopify.com
```

**Format**: `your-store.myshopify.com` (no https://)

---

### 4. Shopify Storefront API (Optional)

```
NEXT_PUBLIC_SHOPIFY_STOREFRONT_ACCESS_TOKEN=xxxxxxxxxxxxx
```

**Note**: Currently not used since we query Supabase directly

---

### 5. Supabase

```
NEXT_PUBLIC_SUPABASE_URL=https://xxxxxxxxxxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Where to get it**:
1. Supabase Dashboard → Project Settings → API
2. Copy Project URL
3. Copy anon/public key

---

### 6. Google Sheets (Optional - for inventory sync)

```
GOOGLE_SHEETS_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
GOOGLE_SHEETS_CLIENT_EMAIL=your-service-account@project.iam.gserviceaccount.com
GOOGLE_SHEETS_SPREADSHEET_ID=1xxxxxxxxxxxxx
```

---

## How to Add to Vercel

### Method 1: Vercel Dashboard (Recommended)

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Select your project (`charmedanddark`)
3. Click **Settings** tab
4. Click **Environment Variables** in sidebar
5. For each variable:
   - Click **Add New**
   - Enter **Key** (e.g., `GEMINI_API_KEY`)
   - Enter **Value** (your actual key)
   - Select environments: **Production**, **Preview**, **Development**
   - Click **Save**

### Method 2: Vercel CLI

```bash
vercel env add GEMINI_API_KEY
# Paste value when prompted
# Select: Production, Preview, Development

vercel env add SHOPIFY_ADMIN_ACCESS_TOKEN
# Repeat for each variable
```

### Method 3: Bulk Import

Create `.env.production` file:
```bash
GEMINI_API_KEY=your_key
SHOPIFY_ADMIN_ACCESS_TOKEN=your_token
NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN=charmed-dark.myshopify.com
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGci...
```

Then:
```bash
vercel env pull .env.production
```

---

## Verification

### Step 1: Check Environment Variables

**URL**: `https://charmedanddark.vercel.app/api/debug/env-check`

**Expected Response**:
```json
{
  "success": true,
  "envVars": {
    "GEMINI_API_KEY": { "present": true, "length": 39 },
    "SHOPIFY_ADMIN_ACCESS_TOKEN": { "present": true, "length": 32 },
    "NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN": { "present": true, "value": "charmed-dark.myshopify.com" },
    "NEXT_PUBLIC_SUPABASE_URL": { "present": true, "value": "https://xxx.supabase.co" },
    "NEXT_PUBLIC_SUPABASE_ANON_KEY": { "present": true, "length": 200+ }
  },
  "missingRequired": []
}
```

### Step 2: Re-run Health Check

**URL**: `https://charmedanddark.vercel.app/api/health-check/curator`

**Expected**:
- `envCheck` shows all `true`
- `successRate` >80%
- `results` array shows actual error messages if still failing

### Step 3: Verify Shop Page

**URL**: `https://charmedanddark.vercel.app/shop`

**Expected**:
- Shows product count > 0
- Products display in grid

---

## Common Issues

### Issue: "GEMINI_API_KEY environment variable is not configured"

**Solution**: Add `GEMINI_API_KEY` to Vercel environment variables

**Steps**:
1. Get key from [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Add to Vercel: Settings → Environment Variables
3. Redeploy or wait for next deployment

### Issue: "SHOPIFY_ADMIN_ACCESS_TOKEN is not configured"

**Solution**: Add Shopify Admin API token

**Steps**:
1. Shopify Admin → Apps → Develop apps
2. Create app with Admin API access
3. Copy access token (starts with `shpat_`)
4. Add to Vercel environment variables

### Issue: Shop shows 0 items but health check works

**Solution**: Run the product sync

**URL**: `https://charmedanddark.vercel.app/api/admin/sync-products`

This populates the database with products from Shopify.

### Issue: Curator notes still failing after adding GEMINI_API_KEY

**Possible causes**:
1. API key is invalid
2. API key doesn't have access to Gemini 1.5 Flash
3. Quota exceeded
4. Need to redeploy after adding env vars

**Solution**:
1. Verify key works: Test in [Google AI Studio](https://aistudio.google.com/)
2. Check quota: [Google Cloud Console](https://console.cloud.google.com/)
3. Redeploy: `git commit --allow-empty -m "Trigger redeploy" && git push`

---

## Redeploy After Adding Variables

**Important**: After adding environment variables, you must redeploy!

### Method 1: Trigger Redeploy in Vercel

1. Go to Deployments tab
2. Click ⋯ on latest deployment
3. Click "Redeploy"

### Method 2: Push Empty Commit

```bash
git commit --allow-empty -m "Trigger redeploy with new env vars"
git push origin reset/google-revenue-engine
```

---

## Security Notes

### Public vs Private Variables

**Public** (`NEXT_PUBLIC_*`):
- Exposed to browser
- Can be seen in Network tab
- Use for: URLs, public keys

**Private** (no prefix):
- Server-side only
- Never exposed to browser
- Use for: API keys, tokens, secrets

### Never Commit Secrets

❌ **DON'T**:
```bash
git add .env
git commit -m "Add env vars"
```

✅ **DO**:
- Add to `.gitignore`
- Use Vercel environment variables
- Use local `.env.local` for development

---

## Quick Checklist

- [ ] `GEMINI_API_KEY` added to Vercel
- [ ] `SHOPIFY_ADMIN_ACCESS_TOKEN` added to Vercel
- [ ] `NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN` added to Vercel
- [ ] `NEXT_PUBLIC_SUPABASE_URL` added to Vercel
- [ ] `NEXT_PUBLIC_SUPABASE_ANON_KEY` added to Vercel
- [ ] All variables set for Production, Preview, Development
- [ ] Redeployed after adding variables
- [ ] Verified with `/api/debug/env-check`
- [ ] Health check passes
- [ ] Shop page shows products

---

**Status**: Ready to configure  
**Next Action**: Add environment variables to Vercel  
**Last Updated**: 2026-02-23
