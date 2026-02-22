# Darkroom Testing Guide

## Pre-Testing Checklist

### 1. Environment Variables (Vercel Dashboard)
Verify all required variables are set:

```bash
# Shopify
SHOPIFY_ADMIN_ACCESS_TOKEN=shpat_xxxxx
NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN=charmedanddark.myshopify.com

# AI Services
GEMINI_API_KEY=AIzaSyxxxxx
REPLICATE_API_TOKEN=r8_xxxxx

# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://ewsztwchfbjclbjsqhnd.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Admin Access
NEXT_PUBLIC_ADMIN_EMAILS=your-email@example.com
```

### 2. Shopify Product Setup
Create a test product in Shopify with these tags:
- `img:needs-brand`
- `source:faire`
- `dept:objects`

Add at least 2-3 product images (Faire product photos).

### 3. Admin Access
Ensure your email is in `NEXT_PUBLIC_ADMIN_EMAILS` and you can log in via Supabase Auth.

## Testing Steps

### Test 1: Admin Access Control

1. **Not Logged In**
   - Navigate to `/admin/darkroom`
   - Expected: Redirect to `/threshold/enter`

2. **Logged In, Not Admin**
   - Log in with email NOT in `NEXT_PUBLIC_ADMIN_EMAILS`
   - Navigate to `/admin/darkroom`
   - Expected: Redirect to `/not-authorized`

3. **Logged In, Admin**
   - Log in with email in `NEXT_PUBLIC_ADMIN_EMAILS`
   - Navigate to `/admin/darkroom`
   - Expected: See Darkroom UI with "Run Darkroom" button

### Test 2: Shopify Product Fetch

1. Open browser DevTools (Network tab)
2. Click "Run Darkroom on Tagged Products"
3. Check API call to `/api/darkroom/run`
4. Expected: Stream starts, shows "Found X products to process"

**If no products found:**
- Verify Shopify tags are exact (case-sensitive)
- Check `SHOPIFY_ADMIN_ACCESS_TOKEN` has read permissions
- Test GraphQL query directly in Shopify Admin

### Test 3: AI Background Selection

1. Watch console logs during processing
2. Expected: See log like "Selected background: stone" (or candle/glass)

**If always defaults to 'stone':**
- Check `GEMINI_API_KEY` is valid
- Verify Gemini API is enabled in Google Cloud Console
- Check for API quota limits

### Test 4: Background Generation

1. Watch processing time for first image
2. Expected: Background generates in 5-15 seconds

**If timeout (30+ seconds):**
- Check `REPLICATE_API_TOKEN` is valid
- Verify Replicate account has credits
- Check network connectivity
- Review Replicate dashboard for errors

**If cost spike:**
- Verify `num_inference_steps: 4` in `lib/darkroom/background-generation.ts`
- Check `guidance_scale: 0`
- Confirm model version is SDXL Lightning (not standard SDXL)

### Test 5: Image Processing

1. Watch progress updates in UI
2. Expected: See status change through:
   - "Processing: [Product Name]"
   - Progress counter increments
   - Success/failure counts update

**If processing fails:**
- Check browser console for errors
- Review Vercel function logs
- Verify Replicate API responses
- Check Supabase Storage permissions

### Test 6: Shopify Upload

1. After processing completes, check Shopify product
2. Expected:
   - New branded images appear in product media
   - Branded images are first in media order
   - Original Faire images still present (after branded images)

**If upload fails:**
- Check `SHOPIFY_ADMIN_ACCESS_TOKEN` has write permissions
- Verify image URLs are publicly accessible
- Check Shopify API rate limits (2 req/sec)
- Review Shopify Admin API logs

### Test 7: Tag Updates

1. Check product tags in Shopify after processing
2. Expected:
   - `img:branded` added
   - `bg:stone` (or `bg:candle` or `bg:glass`) added
   - `img:needs-brand` removed
   - `source:faire` unchanged
   - `dept:objects` unchanged

**If tags don't update:**
- Check `SHOPIFY_ADMIN_ACCESS_TOKEN` has write permissions
- Verify GraphQL mutation syntax
- Check for Shopify API errors in logs

### Test 8: Error Handling

1. Create a product with invalid image URL
2. Tag it with `img:needs-brand`, `source:faire`, `dept:objects`
3. Run Darkroom
4. Expected:
   - Product fails gracefully
   - Error message shown in results
   - Other products continue processing
   - Failed count increments

### Test 9: Safety Checks

1. **Printify Protection**
   - Create product with tags: `img:needs-brand`, `source:printify`, `dept:objects`
   - Run Darkroom
   - Expected: Product skipped, error: "Safety check failed: Product is Printify or Wardrobe"

2. **Wardrobe Protection**
   - Create product with tags: `img:needs-brand`, `source:faire`, `dept:wardrobe`
   - Run Darkroom
   - Expected: Product skipped, error: "Safety check failed: Product is Printify or Wardrobe"

### Test 10: Batch Processing

1. Create 3-5 test products with correct tags
2. Run Darkroom
3. Expected:
   - All products process sequentially
   - 3-second delay between products
   - Progress updates for each product
   - Final summary shows total/succeeded/failed counts

### Test 11: Cost Verification

1. After processing, check Replicate dashboard
2. Calculate cost per image:
   - Background generation: ~$0.005
   - Background removal: ~$0.003
   - Total: ~$0.008 per image

**If cost is higher:**
- Check model version (should be SDXL Lightning)
- Verify `num_inference_steps: 4`
- Check for retry loops
- Review Replicate usage logs

## Manual Testing (CSV Mode)

### Test 12: CSV Upload (Legacy)

1. Switch to "Manual (CSV)" mode
2. Download CSV template
3. Fill with test data:
   ```csv
   product_handle,image_1,image_2,image_3
   test-product,https://example.com/img1.jpg,https://example.com/img2.jpg,https://example.com/img3.jpg
   ```
4. Upload CSV
5. Click "Process Images"
6. Expected: Same pipeline runs, but without Shopify integration

## Performance Benchmarks

### Expected Timings (per product)
- AI background selection: 1-3 seconds
- Background generation: 5-15 seconds (once per product)
- Background removal: 3-5 seconds per image
- Compositing: 1-2 seconds per image
- Upload to Supabase: 1-2 seconds per image
- Upload to Shopify: 2-3 seconds per image
- Tag update: 1-2 seconds

**Total per product (3 images)**: ~30-60 seconds

### Rate Limits
- Shopify: 2 requests/second (handled with delays)
- Replicate: 50 requests/minute (should not hit with delays)
- Gemini: 60 requests/minute (should not hit)

## Troubleshooting Common Issues

### Issue: "Missing Shopify Admin API credentials"
**Solution**: Set `SHOPIFY_ADMIN_ACCESS_TOKEN` and `NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN` in Vercel

### Issue: "GEMINI_API_KEY not configured, defaulting to stone background"
**Solution**: Set `GEMINI_API_KEY` in Vercel (optional, but recommended)

### Issue: "No AI generation API key configured"
**Solution**: Set `REPLICATE_API_TOKEN` in Vercel (required)

### Issue: "Supabase credentials not configured"
**Solution**: Set `NEXT_PUBLIC_SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` in Vercel

### Issue: "Admin access required"
**Solution**: Add your email to `NEXT_PUBLIC_ADMIN_EMAILS` (comma-separated, no spaces)

### Issue: "Background generation timed out after 30 seconds"
**Solution**: 
- Check Replicate API status
- Verify network connectivity
- Consider increasing timeout in `background-generation.ts`

### Issue: "GraphQL errors: [...]"
**Solution**:
- Check Shopify Admin API permissions
- Verify GraphQL query syntax
- Review Shopify API version compatibility (using 2024-01)

### Issue: "Failed to upload image to Shopify"
**Solution**:
- Verify image URL is publicly accessible
- Check Shopify Admin API write permissions
- Ensure image format is supported (JPEG/PNG)

## Success Criteria

✅ Admin access control works correctly
✅ Shopify products fetch successfully
✅ AI selects appropriate backgrounds
✅ Background generation completes in <30 seconds
✅ Images process without quality loss
✅ Branded images upload to Shopify
✅ Media reordering works (branded images first)
✅ Tags update correctly
✅ Cost per image stays under $0.01
✅ Error handling doesn't crash batch
✅ Progress streaming works in UI
✅ Safety checks prevent Printify/Wardrobe processing

## Next Steps After Testing

1. **Production Deployment**
   - Deploy to Vercel production
   - Verify all environment variables
   - Test with real Faire products

2. **Monitoring Setup**
   - Set up Vercel function logs monitoring
   - Track Replicate API costs
   - Monitor Shopify API rate limits

3. **Documentation**
   - Document any edge cases discovered
   - Update troubleshooting guide
   - Create runbook for common issues

4. **Optimization**
   - Consider background caching for similar products
   - Explore parallel image processing
   - Investigate direct Shopify upload (eliminate Supabase intermediary)

5. **Automation**
   - Set up Shopify webhook for auto-trigger
   - Create scheduled job for batch processing
   - Implement retry mechanism for failed products

---

**Testing Status**: Ready for end-to-end testing
**Last Updated**: Context Transfer (Query 31)
