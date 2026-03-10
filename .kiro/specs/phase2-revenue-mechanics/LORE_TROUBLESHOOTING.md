# Lore Display Troubleshooting Guide

## Issue
Product pages and quick view modals are showing generic placeholder text instead of AI-generated gothic lore from Supabase.

## Diagnostic Steps

### 1. Check if lore exists in Supabase

Run the diagnostic script:
```bash
node scripts/check-lore.js
```

This will show:
- Whether products have lore in the database
- The length of the lore field
- A preview of the lore content

### 2. Verify the data flow

The data flow is:
1. Supabase `products` table has `lore` column
2. `lib/products.js` queries with `select('*')` to get all columns
3. `transformProduct()` function sets `description: row.lore || row.description`
4. Components display `product.description`

### 3. Check for RLS policy issues

If lore exists in the database but isn't being returned, check RLS policies:

```sql
-- In Supabase SQL Editor
SELECT * FROM products LIMIT 1;
```

If you can see the lore column in the SQL editor but not in the app, the RLS policy might be blocking it.

## Common Issues and Fixes

### Issue 1: Lore field is empty in database

**Symptom**: `check-lore.js` shows "NO LORE" for all products

**Fix**: Run the sync pipeline with ANTHROPIC_API_KEY configured:

1. Add ANTHROPIC_API_KEY to `.env.local`:
   ```
   ANTHROPIC_API_KEY=sk-ant-your-api-key
   ```

2. Run the sync pipeline:
   ```powershell
   Invoke-RestMethod -Uri "http://localhost:3000/api/admin/sync-products" `
     -Method POST `
     -Headers @{
       "Authorization"="Bearer charmed-dark-sync-2026-secretkey"
       "Content-Type"="application/json"
     }
   ```

3. Check the response for `lore_generated` count

### Issue 2: RLS policy blocking lore column

**Symptom**: Lore exists in database (visible in SQL editor) but not returned by API

**Fix**: Update RLS policy to allow reading lore:

```sql
-- In Supabase SQL Editor
DROP POLICY IF EXISTS "Allow public read access to products" ON products;

CREATE POLICY "Allow public read access to products"
ON products FOR SELECT
USING (hidden IS NULL OR hidden = false);
```

This policy allows reading ALL columns (including lore) for non-hidden products.

### Issue 3: Fallback description being used

**Symptom**: ProductDetailContent shows "A refined gothic piece designed for quiet ritual and calm presence."

**Cause**: The component has a fallback when `product.description` is empty:
```javascript
const ritualLine = product.description || "A refined gothic piece...";
```

**Fix**: Ensure lore is populated in the database (see Issue 1)

### Issue 4: CSV fallback being used

**Symptom**: Products display but with no lore

**Cause**: Supabase query is failing and falling back to CSV data (which has no lore field)

**Fix**: Check console logs for "Supabase getProducts failed, falling back to CSV"

If you see this error:
1. Verify Supabase credentials in `.env.local`
2. Check Supabase project is running
3. Verify network connectivity

## Verification

After fixing, verify lore is displaying:

1. Visit http://localhost:3000/shop
2. Click on any product to open quick view modal
3. The description should show gothic prose starting with phrases like:
   - "In the quiet hours when shadows gather..."
   - "Silence is rising tonight..."
   - "You reach for this piece when..."

4. Visit a product detail page
5. The description should show the same gothic lore

## Code Reference

### lib/products.js
```javascript
// This function transforms Supabase rows to product objects
function transformProduct(row) {
  return {
    // ...
    description: row.lore || row.description,  // Prefers lore
    lore: row.lore,  // Also available as separate field
    // ...
  };
}
```

### components/ProductDetailContent.js
```javascript
const ritualLine = product.description || "A refined gothic piece...";
```

### components/ShopContent.js (Quick View Modal)
```javascript
<p className="mt-2 text-sm text-white/70">
  {activeProduct.description}
</p>
```

## Next Steps

If lore still doesn't display after following these steps:

1. Run `node scripts/check-lore.js` and share the output
2. Check browser console for errors
3. Check server console for Supabase errors
4. Verify the sync pipeline completed successfully with `lore_generated > 0`
