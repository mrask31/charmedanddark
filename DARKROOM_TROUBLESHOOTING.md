# Darkroom Troubleshooting Guide

## Common Errors

### "Payment Required" Error

**Cause:** Your Replicate account needs payment setup or has run out of credits.

**Solution:**
1. Go to https://replicate.com/account/billing
2. Add a payment method
3. Add credits to your account (minimum $5 recommended)
4. Wait a few minutes for the payment to process
5. Retry the Darkroom processing

**Note:** Replicate charges per API call:
- Background removal: ~$0.0023 per image
- Background generation: ~$0.0055 per image
- Total per product image: ~$0.0078

### "Rate Limit Exceeded" Error

**Cause:** You've made too many API requests in a short time period.

**Solution:**
1. Wait 5-10 minutes before retrying
2. Process smaller batches (5-10 products at a time instead of 50+)
3. The system now automatically adds delays between requests

**Rate Limits:**
- Replicate free tier: Limited requests per minute
- Replicate paid tier: Higher limits based on plan

### "REPLICATE_API_TOKEN not configured"

**Cause:** API key not set in Vercel environment variables.

**Solution:**
1. Go to https://vercel.com/mrask31/charmedanddark/settings/environment-variables
2. Add variable: `REPLICATE_API_TOKEN`
3. Value: Your token from https://replicate.com/account/api-tokens
4. Redeploy the application

### "Storage upload failed"

**Cause:** Supabase Storage bucket doesn't exist or isn't public.

**Solution:**
1. Go to https://supabase.com/dashboard/project/ewsztwchfbjclbjsqhnd/storage/buckets
2. Check if `products` bucket exists
3. If not, create it and set as **Public bucket**
4. If exists, verify it's set to public

### "Database update failed"

**Cause:** Missing service role key or incorrect product handle.

**Solution:**
1. Verify `SUPABASE_SERVICE_ROLE_KEY` is set in Vercel
2. Check that product handles in CSV match database exactly
3. Run migration 007 if `images` column doesn't exist

### "Background removal timed out"

**Cause:** Replicate API is slow or overloaded.

**Solution:**
1. Retry the failed products
2. Check Replicate status: https://status.replicate.com
3. Try processing during off-peak hours

## Best Practices

### Batch Processing
- Process 5-10 products at a time for testing
- For production batches, process 20-30 products max
- Monitor the queue for errors before processing more

### Cost Management
- Test with 2-3 products first
- Calculate costs before large batches: products × images × $0.0078
- Set up billing alerts in Replicate dashboard

### Image Quality
- Use high-resolution source images (1000px+ recommended)
- Ensure clean product photos with minimal background clutter
- Avoid images with text overlays or watermarks

### Error Recovery
- If batch fails mid-way, note which products completed
- Create new CSV with only failed products
- Reprocess failed products separately

## Rate Limiting Strategy

The system now includes automatic rate limiting:
- 2 second delay between images of same product
- 3 second delay between different products
- Stops batch processing on payment/rate limit errors

### Recommended Batch Sizes
- **Free tier:** 5 products at a time, wait 5 minutes between batches
- **Paid tier:** 20-30 products at a time
- **Multiple images:** Reduce batch size (more API calls per product)

## Monitoring

### Check Processing Status
1. Watch the real-time queue in Darkroom UI
2. Each job shows: pending → extracting → generating → compositing → uploading → complete
3. Errors display inline with job details

### Verify Results
1. Click "Image 1 →" links to view processed images
2. Check Supabase Storage bucket for uploaded files
3. Query database to verify `images` array populated:
   ```sql
   SELECT handle, images FROM products WHERE handle = 'your-product-handle';
   ```

### Check Costs
1. Go to https://replicate.com/account/billing
2. View usage and costs per day
3. Set up billing alerts if needed

## Emergency Stops

### Stop Processing Mid-Batch
- Close the browser tab (processing continues server-side)
- Wait for current product to finish
- System will stop on rate limit/payment errors automatically

### Clear Failed Jobs
- Refresh the Darkroom page
- Processing queue resets
- Previous errors don't affect new batches

## Getting Help

### Check Logs
1. Open browser console (F12)
2. Look for detailed error messages
3. Check Network tab for API responses

### Vercel Logs
1. Go to https://vercel.com/mrask31/charmedanddark/logs
2. Filter by `/api/admin/darkroom/process`
3. Look for server-side errors

### Supabase Logs
1. Go to Supabase dashboard
2. Check Storage logs for upload errors
3. Check Database logs for update errors

## Quick Fixes

### "Too Many Requests" - Quick Recovery
```bash
# Wait 5 minutes, then process smaller batch
# Create CSV with just 5 products
# Upload to Darkroom
# Monitor for success
# Gradually increase batch size
```

### "Payment Required" - Quick Setup
```bash
# 1. Add payment method: https://replicate.com/account/billing
# 2. Add $10 credits (processes ~1,280 images)
# 3. Wait 2-3 minutes
# 4. Retry processing
```

### Test Single Product
```csv
product_handle,product_title,image_1
test-product,Test Product,https://example.com/image.jpg
```

Upload this single-product CSV to verify:
- API keys working
- Storage bucket accessible
- Database updates working
- No rate limit issues

## Contact Support

If issues persist:
1. Check all environment variables are set
2. Verify Replicate account has credits
3. Confirm Supabase bucket exists and is public
4. Test with single product CSV
5. Review Vercel deployment logs
