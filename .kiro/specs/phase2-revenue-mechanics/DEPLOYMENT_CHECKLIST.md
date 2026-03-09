# Phase 2 Revenue Mechanics - Deployment Checklist

## Pre-Deployment Steps

### 1. Database Migration
- [ ] Run SQL migration in Supabase SQL Editor:
  ```sql
  ALTER TABLE products ADD COLUMN IF NOT EXISTS shopify_variant_id TEXT;
  CREATE INDEX IF NOT EXISTS idx_products_shopify_variant_id ON products(shopify_variant_id);
  ```
  (SQL file: `.kiro/specs/phase2-revenue-mechanics/migrations/001_add_shopify_variant_id.sql`)

### 2. Vercel Environment Variables
- [ ] Add all required environment variables to Vercel (see `VERCEL_ENV_SETUP.md`)
  - [ ] NEXT_PUBLIC_SUPABASE_URL
  - [ ] NEXT_PUBLIC_SUPABASE_ANON_KEY
  - [ ] SUPABASE_SERVICE_ROLE_KEY
  - [ ] SHOPIFY_STORE_DOMAIN
  - [ ] SHOPIFY_STOREFRONT_ACCESS_TOKEN
  - [ ] SHOPIFY_WEBHOOK_SECRET (get from Shopify after webhook setup)
  - [ ] NEXT_PUBLIC_SHOPIFY_CHECKOUT_DOMAIN
  - [ ] ANTHROPIC_API_KEY
  - [ ] SYNC_API_SECRET

### 3. Shopify Admin Configuration
- [ ] Create HOUSE10 discount code (see `SHOPIFY_SETUP.md`)
  - 10% off entire order
  - No usage limits
  - No expiration date
  - Applies to all products

### 4. Deploy to Production
- [ ] Merge feature branch to main
  ```bash
  git checkout main
  git merge feature/phase2-revenue-mechanics
  git push origin main
  ```
- [ ] Verify Vercel deployment succeeds
- [ ] Check deployment logs for errors

### 5. Shopify Webhook Configuration
- [ ] Create Order creation webhook in Shopify (see `SHOPIFY_SETUP.md`)
  - URL: `https://charmedanddark.com/api/webhooks/shopify/orders`
  - Format: JSON
  - Event: Order creation
- [ ] Copy webhook signing secret
- [ ] Add SHOPIFY_WEBHOOK_SECRET to Vercel environment variables
- [ ] Redeploy to apply new environment variable

---

## Post-Deployment Testing

### 6. Verify Cart Functionality
- [ ] Visit production site
- [ ] Navigate to a product page
- [ ] Click "Add to Selection"
- [ ] Verify cart opens with product
- [ ] Verify dual pricing displays (Public Price + House Price with gold accent)
- [ ] Test quantity controls (+/- buttons)
- [ ] Test remove item
- [ ] Reload page and verify cart persists

### 7. Test Checkout Flow
- [ ] Add multiple products to cart
- [ ] Click "Proceed to Checkout"
- [ ] Verify redirect to Shopify checkout
- [ ] Verify HOUSE10 discount is automatically applied
- [ ] Verify 10% discount is calculated correctly
- [ ] Complete test purchase with test payment

### 8. Verify Webhook Handler
- [ ] Check Shopify Admin → Settings → Notifications → Webhooks
- [ ] Find Order creation webhook
- [ ] Check "Recent deliveries" section
- [ ] Verify latest delivery shows 200 OK status
- [ ] Open Supabase dashboard
- [ ] Go to Table Editor → orders table
- [ ] Verify test order appears with correct data:
  - shopify_order_id
  - total_price
  - discount_codes (should include HOUSE10)
  - line_items (JSONB)
  - customer information

### 9. Test Sync Pipeline (Optional)
- [ ] Run sync pipeline to populate variant IDs:
  ```powershell
  Invoke-RestMethod -Uri "https://charmedanddark.com/api/admin/sync-products" `
    -Method POST `
    -Headers @{
      "Authorization"="Bearer charmed-dark-sync-2026-secretkey"
      "Content-Type"="application/json"
    }
  ```
- [ ] Verify response shows synced products
- [ ] Check products table for shopify_variant_id values
- [ ] Verify lore generation (if ANTHROPIC_API_KEY is configured)

---

## Rollback Plan

If issues occur in production:

1. **Revert deployment**:
   ```bash
   git revert HEAD
   git push origin main
   ```

2. **Or rollback in Vercel**:
   - Go to Vercel dashboard → Deployments
   - Find previous working deployment
   - Click "..." → "Promote to Production"

3. **Database rollback** (if needed):
   ```sql
   DROP INDEX IF EXISTS idx_products_shopify_variant_id;
   ALTER TABLE products DROP COLUMN IF EXISTS shopify_variant_id;
   ```

---

## Success Criteria

Phase 2 Revenue Mechanics is successfully deployed when:

- ✅ Customers can add products to cart
- ✅ Cart persists across page reloads
- ✅ Dual pricing displays correctly (Public + House prices)
- ✅ Checkout redirects to Shopify with HOUSE10 discount applied
- ✅ Completed orders are stored in Supabase via webhook
- ✅ HMAC verification prevents unauthorized webhook requests
- ✅ No console errors about missing environment variables
- ✅ Build completes without errors
- ✅ All API routes return expected responses

---

## Monitoring

After deployment, monitor:

1. **Vercel Logs**: Check for runtime errors
2. **Supabase Logs**: Monitor database queries and errors
3. **Shopify Webhook Deliveries**: Ensure 200 OK responses
4. **Cart Conversion**: Track add-to-cart → checkout → purchase flow
5. **Error Rates**: Watch for 4xx/5xx responses on API routes

---

## Support Documentation

- Requirements: `.kiro/specs/phase2-revenue-mechanics/requirements.md`
- Design: `.kiro/specs/phase2-revenue-mechanics/design.md`
- Tasks: `.kiro/specs/phase2-revenue-mechanics/tasks.md`
- Shopify Setup: `.kiro/specs/phase2-revenue-mechanics/SHOPIFY_SETUP.md`
- Vercel Setup: `.kiro/specs/phase2-revenue-mechanics/VERCEL_ENV_SETUP.md`
- SQL Migration: `.kiro/specs/phase2-revenue-mechanics/migrations/001_add_shopify_variant_id.sql`
