# Vercel Environment Variables Setup

This document lists all environment variables that need to be configured in Vercel for production deployment.

## How to Add Environment Variables in Vercel

1. Go to https://vercel.com/dashboard
2. Select your project (charmedanddark)
3. Go to **Settings** → **Environment Variables**
4. Add each variable below with the appropriate value
5. Select **Production**, **Preview**, and **Development** for each variable (or as specified)

---

## Required Environment Variables

### Supabase Configuration

| Variable | Value | Environments |
|----------|-------|--------------|
| `NEXT_PUBLIC_SUPABASE_URL` | `https://ewsztwchfbjclbjsqhnd.supabase.co` | All |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...` | All |
| `SUPABASE_SERVICE_ROLE_KEY` | `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...` | Production, Preview |

### Shopify Configuration

| Variable | Value | Environments |
|----------|-------|--------------|
| `SHOPIFY_STORE_DOMAIN` | `charmed-dark.myshopify.com` | All |
| `SHOPIFY_STOREFRONT_ACCESS_TOKEN` | `f18c13c8112e7595237c8f255afcc2b5` | All |
| `SHOPIFY_WEBHOOK_SECRET` | Get from Shopify webhook config | Production, Preview |
| `NEXT_PUBLIC_SHOPIFY_CHECKOUT_DOMAIN` | `charmed-dark.myshopify.com` | All |

### AI Lore Generation

| Variable | Value | Environments |
|----------|-------|--------------|
| `ANTHROPIC_API_KEY` | `sk-ant-...` (your API key) | Production, Preview |

### Admin API

| Variable | Value | Environments |
|----------|-------|--------------|
| `SYNC_API_SECRET` | `charmed-dark-sync-2026-secretkey` | Production, Preview |

---

## Verification Steps

After adding all environment variables:

1. Trigger a new deployment (push to main or redeploy)
2. Check deployment logs for any missing variable errors
3. Test each API route:
   - `/api/checkout` - Should create Shopify cart
   - `/api/webhooks/shopify/orders` - Should verify HMAC and store orders
   - `/api/admin/sync-products` - Should sync products and generate lore
4. Verify no console errors about missing environment variables

---

## Security Notes

- **Never commit** `.env.local` or `.env` files to git
- The `.env.example` file is safe to commit (contains no real secrets)
- `SUPABASE_SERVICE_ROLE_KEY` bypasses Row Level Security - keep it secret
- `SHOPIFY_WEBHOOK_SECRET` is used for HMAC verification - must match Shopify config
- `ANTHROPIC_API_KEY` is billed per token - monitor usage

---

## Getting Missing Values

### SHOPIFY_WEBHOOK_SECRET
1. Go to Shopify Admin → Settings → Notifications → Webhooks
2. Click on your Order creation webhook
3. Copy the "Webhook signing secret"

### ANTHROPIC_API_KEY
1. Go to https://console.anthropic.com/
2. Navigate to API Keys
3. Create a new key or use existing key
4. Copy the key (starts with `sk-ant-`)

### SUPABASE Keys
Already configured in `.env.local` - copy from there or get from:
1. Go to https://supabase.com/dashboard
2. Select your project (charmedanddark)
3. Go to Settings → API
4. Copy "anon public" and "service_role" keys
