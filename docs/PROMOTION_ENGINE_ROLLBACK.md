# Promotion Engine v1 — Rollback & Operations Guide

## Immediate Rollback (< 1 minute)

Set `NEXT_PUBLIC_PROMOTIONS_ENABLED=false` in Vercel Environment Variables → Redeploy.

**Result:**
- All promotion UI disappears instantly (hero, badges, sale prices, /sale page, nav link)
- Products revert to base price display
- `/sale` returns 404
- No data loss — promotions remain in database for re-activation
- No code changes required

---

## Full Rollback (revert branch)

If a code-level issue is discovered:

```bash
git revert <commit-range>
```

Or revert the entire PR. The engine is purely additive — all existing code paths are preserved because:
- `transformProduct` still returns `salePrice: null` when engine is off
- `ProductCard` already handles `salePrice || price` gracefully
- `CartContext` already uses `salePrice ?? price`
- `/sale` page calls `notFound()` when no promotions exist

---

## Env Vars Required

| Variable | Required | Description |
|----------|----------|-------------|
| `NEXT_PUBLIC_PROMOTIONS_ENABLED` | Yes | Feature flag. Set to `"true"` to enable. |
| `PROMOTIONS_ADMIN_SECRET` | Yes (for admin) | Bearer token for admin API routes |
| `PROMOTION_PREVIEW_SECRET` | Yes (for preview) | Secret for campaign preview mode |
| `CRON_SECRET` | Optional | Vercel Cron auth for lifecycle transitions |

---

## Vercel Cron Configuration

Add to `vercel.json`:

```json
{
  "crons": [{
    "path": "/api/cron/promotions/lifecycle",
    "schedule": "*/5 * * * *"
  }]
}
```

This runs every 5 minutes to transition `scheduled → active` and `active → expired`.

---

## Database Migration

The migration at `supabase/migrations/20260630000000_create_promotions_tables.sql` must be applied via:
1. Supabase Dashboard → SQL Editor → paste and run, OR
2. `supabase db push` (after repairing migration history)

Tables created: `promotions`, `promotion_products`, `promotion_collections`, `promotion_tags`

---

## Creating a Promotion (Merchant Workflow)

1. **Create in Charmed & Dark admin:**
   ```bash
   curl -X POST https://charmedanddark.com/api/admin/promotions \
     -H "Authorization: Bearer $PROMOTIONS_ADMIN_SECRET" \
     -H "Content-Type: application/json" \
     -d '{
       "name": "Summerween 2026",
       "start_date": "2026-07-01T00:00:00Z",
       "end_date": "2026-07-15T23:59:59Z",
       "promotion_type": "percentage",
       "percentage": 40,
       "badge_text": "40% OFF",
       "hero_title": "SUMMERWEEN SALE",
       "hero_subtitle": "Save up to 40% on select items",
       "homepage_enabled": true,
       "countdown_enabled": true
     }'
   ```

2. **Target products:**
   ```bash
   curl -X POST https://charmedanddark.com/api/admin/promotions/$ID/collections \
     -H "Authorization: Bearer $PROMOTIONS_ADMIN_SECRET" \
     -H "Content-Type: application/json" \
     -d '{"add": ["Accessories", "Ritual"]}'
   ```

3. **Create matching Shopify automatic discount** (same %, same products, same dates)

4. **Preview:**
   Visit `https://charmedanddark.com?preview_promotion=summerween-2026&preview_secret=$SECRET`

5. **Publish:**
   ```bash
   curl -X POST https://charmedanddark.com/api/admin/promotions/$ID/publish \
     -H "Authorization: Bearer $PROMOTIONS_ADMIN_SECRET"
   ```

---

## Monitoring

- Check `/api/promotions/active` for currently active promotions
- Check `/api/cron/promotions/lifecycle` output for transition history
- Check PostHog for `add_to_cart` events with sale prices
- Verify Google Rich Results Test shows correct price in Product schema

---

## Known Limitations (v1)

1. No automatic Shopify discount creation (merchant must create manually)
2. No admin UI (API-only for v1 — UI is a v2 feature)
3. Countdown is static server-rendered end date (not live client-side countdown)
4. No coupon code entry at cart level (only Shopify codes at checkout)
5. No per-variant sale pricing (promotion applies to product-level price)
