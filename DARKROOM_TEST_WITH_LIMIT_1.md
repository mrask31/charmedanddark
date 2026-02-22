# Testing Darkroom with Limit = 1

## Pre-Test Setup

### 1. Ensure You Have a Test Product in Shopify

**Required Tags**:
- `img:needs-brand`
- `source:faire`
- `dept:objects`

**Product Requirements**:
- At least 1 image uploaded
- NOT tagged with `source:printify` or `dept:wardrobe`

**Example Test Product**:
```
Title: Test Candle Holder
Handle: test-candle-holder
Tags: img:needs-brand, source:faire, dept:objects
Images: 1-3 product photos
```

### 2. Verify Environment Variables

Check Vercel dashboard has:
- `SHOPIFY_ADMIN_ACCESS_TOKEN` ✓
- `NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN` ✓
- `GEMINI_API_KEY` ✓
- `REPLICATE_API_TOKEN` ✓
- `NEXT_PUBLIC_ADMIN_EMAILS` ✓
- `SUPABASE_SERVICE_ROLE_KEY` ✓

### 3. Verify Admin Access

- Log in with email in `NEXT_PUBLIC_ADMIN_EMAILS`
- Navigate to `/admin/darkroom`
- Should see Darkroom UI (not redirected)

## Test Procedure

### Step 1: Access Darkroom
1. Navigate to `https://charmedanddark.vercel.app/admin/darkroom`
2. Verify you see the Darkroom UI
3. Verify "Automated (Shopify)" mode is selected

### Step 2: Verify UI Elements
Check that you see:
- [x] GraphQL query box showing:
  ```
  tag:img:needs-brand AND tag:source:faire AND tag:dept:objects
  ```
- [x] Endpoint: `/admin/api/2024-01/graphql.json`
- [x] Batch Limit input showing: `1`
- [x] Three preset buttons: Test (1), Normal (20), Max (50)
- [x] "Test (1)" button is active (dark background)
- [x] Run button says: "Run Darkroom (1 product)"

### Step 3: Verify Limit Controls
1. **Test preset button**:
   - Click "Test (1)"
   - Verify input shows: 1
   - Verify button text: "Run Darkroom (1 product)"

2. **Normal preset button**:
   - Click "Normal (20)"
   - Verify input shows: 20
   - Verify button text: "Run Darkroom (20 products)"

3. **Max preset button**:
   - Click "Max (50)"
   - Verify input shows: 50
   - Verify button text: "Run Darkroom (50 products)"

4. **Manual input**:
   - Type "5" in input
   - Verify button text: "Run Darkroom (5 products)"

5. **Reset to Test**:
   - Click "Test (1)"
   - Verify input shows: 1

### Step 4: Run with Limit = 1
1. Ensure "Test (1)" is selected
2. Click "Run Darkroom (1 product)"
3. Observe:
   - Button changes to "Processing..."
   - Button becomes disabled
   - Limit controls become disabled

### Step 5: Monitor Progress
Watch for progress box to appear:
```
Progress: 0 / 1    ✓ 0    ✗ 0
Processing: [Product Name]
```

**Expected Timeline** (for 1 product with 3 images):
- 0-5s: Fetching products from Shopify
- 5-10s: AI selecting background
- 10-25s: Generating background (SDXL Lightning)
- 25-40s: Processing image 1 (remove bg, composite)
- 40-55s: Processing image 2
- 55-70s: Processing image 3
- 70-75s: Uploading to Shopify
- 75-80s: Reordering media
- 80-85s: Updating tags
- **Total**: ~85 seconds for 1 product with 3 images

### Step 6: Verify Results
After completion, check results section:

**Success Card Should Show**:
```
[Product Title]                                    success
[product-handle]
Background: stone (or candle or glass) • Images: 3
```

**Verify in Shopify**:
1. Go to Shopify Admin → Products
2. Find the processed product
3. Check:
   - [x] New branded images appear first in media
   - [x] Original images still present (after branded)
   - [x] Tags updated:
     - Added: `img:branded`
     - Added: `bg:stone` (or candle/glass)
     - Removed: `img:needs-brand`

### Step 7: Verify Debug Panel (if visible)
Scroll to bottom, check debug panel shows:
- Your email
- Admin status: ✓ Admin
- Env var used: NEXT_PUBLIC_ADMIN_EMAILS
- Admin whitelist: (your email)

## Expected Results

### Console Logs (Browser)
```
Fetching products tagged img:needs-brand...
Found 1 products to process
Processing: [Product Name] ([handle])
  Selecting background for [Product Name]...
  Selected background: stone
  Generating stone background...
  Processing image 1/3...
  Processing image 2/3...
  Processing image 3/3...
  Reordering media...
  Updating tags...
  ✓ Successfully processed [Product Name]
```

### Server Logs (Vercel)
```
Starting Darkroom pipeline for 1 products (requested: 1)...
Initiated by: admin@example.com
Fetching products tagged img:needs-brand...
Found 1 products to process
Processing: [Product Name] ([handle])
  Selecting background for [Product Name]...
  Selected background: stone
  Generating stone background...
  Processing image 1/3...
  Processing image 2/3...
  Processing image 3/3...
  Reordering media...
  Updating tags...
  ✓ Successfully processed [Product Name]
```

### Shopify Changes
**Before**:
- Tags: `img:needs-brand`, `source:faire`, `dept:objects`
- Images: 3 original Faire photos

**After**:
- Tags: `img:branded`, `bg:stone`, `source:faire`, `dept:objects`
- Images: 3 branded photos (first), 3 original photos (after)

## Troubleshooting

### Issue: "No products found needing branding"
**Cause**: No products match the tag filter
**Solution**:
1. Go to Shopify Admin → Products
2. Find a product
3. Add tags: `img:needs-brand`, `source:faire`, `dept:objects`
4. Save product
5. Try again

### Issue: "Product has no images"
**Cause**: Product exists but has no images uploaded
**Solution**:
1. Go to Shopify Admin → Products
2. Find the product
3. Upload at least 1 image
4. Save product
5. Try again

### Issue: "Safety check failed: Product is Printify or Wardrobe"
**Cause**: Product has excluded tags
**Solution**:
1. Remove `source:printify` tag
2. Remove `dept:wardrobe` tag
3. Try again

### Issue: "Product missing required tags"
**Cause**: Product doesn't have all three required tags
**Solution**:
1. Verify product has: `img:needs-brand`, `source:faire`, `dept:objects`
2. Add missing tags
3. Try again

### Issue: "Background generation timed out"
**Cause**: Replicate API slow or unavailable
**Solution**:
1. Check Replicate API status
2. Verify `REPLICATE_API_TOKEN` is valid
3. Try again in a few minutes

### Issue: "Failed to upload image to Shopify"
**Cause**: Shopify API error or permissions issue
**Solution**:
1. Verify `SHOPIFY_ADMIN_ACCESS_TOKEN` has write permissions
2. Check Shopify API status
3. Try again

## Success Criteria

- [x] UI shows limit = 1 by default
- [x] GraphQL query box displays correctly
- [x] Preset buttons work
- [x] Run button shows correct text
- [x] Processing completes successfully
- [x] Progress updates in real-time
- [x] Results show success
- [x] Shopify product updated correctly
- [x] Tags updated correctly
- [x] Images uploaded and reordered
- [x] No errors in console
- [x] No errors in Vercel logs

## Next Steps After Successful Test

1. **Test with Limit = 5**:
   - Click "Manual input"
   - Type "5"
   - Run and verify

2. **Test with Limit = 20**:
   - Click "Normal (20)"
   - Run and verify

3. **Production Use**:
   - Tag all Faire products needing branding
   - Run with appropriate limit
   - Monitor progress
   - Verify results

## Cost Verification

After test with 1 product (3 images):
- Background generation: ~$0.005
- Background removal (3x): ~$0.009
- **Total**: ~$0.014 for 1 product

Check Replicate dashboard to verify actual cost.

---

**Test Status**: Ready to run
**Default Limit**: 1 (safe for testing)
**Recommended**: Start with 1, verify success, then scale up
