# Darkroom Architecture - Shopify-Driven Automation

## Overview

Darkroom is an automated image processing pipeline that transforms Faire product images into branded Charmed & Dark product photography. It has been converted from a manual CSV-based system to a fully automated Shopify-driven workflow.

## System Architecture

### 1. Entry Point: Admin UI
**File**: `app/admin/darkroom/page.tsx`

- Admin-only access (requires authentication + email in `NEXT_PUBLIC_ADMIN_EMAILS`)
- Two modes:
  - **Automated Mode** (Primary): Shopify-driven, single-button operation
  - **Manual Mode** (Legacy): CSV upload for edge cases
- Real-time progress streaming via Server-Sent Events (SSE)
- Shows processing status, success/failure counts, and detailed results

### 2. API Endpoint
**File**: `app/api/darkroom/run/route.ts`

- Admin authentication via Supabase Auth token
- Streaming response using Server-Sent Events
- Orchestrates the complete pipeline
- Returns progress updates and final results

### 3. Shopify Integration Layer
**File**: `lib/shopify/darkroom.ts`

**Functions**:
- `fetchProductsNeedingBranding()` - Queries products with tags:
  - `img:needs-brand` (required)
  - `source:faire` (required)
  - `dept:objects` (required)
- `uploadImageToProduct()` - Uploads branded images back to Shopify
- `reorderProductMedia()` - Sets branded images as hero images
- `updateProductTags()` - Adds `img:branded` + `bg:{type}`, removes `img:needs-brand`

**GraphQL Endpoints Used**:
- `products` query with tag filtering
- `productCreateMedia` mutation
- `productReorderMedia` mutation
- `productUpdate` mutation

### 4. AI Background Selector
**File**: `lib/darkroom/background-selector.ts`

- Uses Gemini 2.0 Flash to choose optimal background
- Three background types:
  - **stone**: Dark brutalist concrete (heavy objects, furniture)
  - **candle**: Warm candlelit atmosphere (candles, ritual items)
  - **glass**: Reflective glass surface (glassware, delicate items)
- Fallback to 'stone' if AI unavailable or returns invalid response

### 5. Pipeline Orchestrator
**File**: `lib/darkroom/shopify-pipeline.ts`

**Main Function**: `runShopifyDarkroomPipeline()`

**Workflow**:
1. Fetch products from Shopify (tagged `img:needs-brand`)
2. For each product:
   - AI selects best background type
   - Generate background once (reused for all images)
   - Process each product image:
     - Remove background
     - Composite onto branded background
     - Upload to Supabase Storage (temporary)
     - Upload to Shopify product
   - Reorder media (branded images first)
   - Update tags
3. Return results with success/failure status

**Safety Checks**:
- Never processes `source:printify` or `dept:wardrobe`
- Requires all three tags: `img:needs-brand`, `source:faire`, `dept:objects`
- Limits to 20 products per run (configurable, max 50)
- 3-second delay between products to avoid rate limits
- 2-second delay between images within a product

### 6. Image Processing Pipeline
**File**: `lib/darkroom/pipeline.ts`

**Legacy Function**: `processImagePipeline()` (used by manual CSV mode)

**Steps**:
1. Extract product (remove background)
2. Generate branded background (once, reused)
3. Composite product onto background
4. Upload to Supabase Storage
5. Update database

### 7. Background Removal
**File**: `lib/darkroom/background-removal.ts` (not shown, but referenced)

- Uses Replicate RMBG-1.4 model
- Preserves original product pixels
- Returns transparent PNG

### 8. Background Generation
**File**: `lib/darkroom/background-generation.ts`

**Cost Optimized**: SDXL Lightning 4-step model

**Primary**: Replicate SDXL Lightning
- Model: `5f24084160c9089501c1b3545d9be3c27883ae2239b6f412990e82d4a6210f8f`
- Steps: 4 (hardcoded)
- Guidance scale: 0 (Lightning doesn't use guidance)
- Resolution: Capped at 1024×1024
- Cost: ~$0.005 per image (95%+ savings vs standard SDXL)
- Timeout: 30 seconds

**Fallback**: Stability AI SDXL
- Steps: 15 (reduced from 30)
- Resolution: Capped at 1024×1024
- Cost: Higher, but still optimized

### 9. Image Compositing
**File**: `lib/darkroom/compositor.ts` (not shown, but referenced)

- Uses Sharp library for pixel-perfect compositing
- Adds drop shadows
- Preserves original product quality
- Outputs web-optimized JPEG

### 10. Storage Layer
**File**: `lib/darkroom/storage.ts`

- Uploads to Supabase Storage (`products` bucket)
- Used as temporary hosting before Shopify upload
- Returns public URL

## Data Flow

```
User clicks "Run Darkroom"
    ↓
Admin auth check (Supabase + email whitelist)
    ↓
API endpoint: /api/darkroom/run
    ↓
Fetch products from Shopify (GraphQL query)
    ↓
For each product:
    ↓
    AI selects background type (Gemini)
    ↓
    Generate background once (SDXL Lightning)
    ↓
    For each image:
        ↓
        Remove background (RMBG-1.4)
        ↓
        Composite (Sharp)
        ↓
        Upload to Supabase (temporary)
        ↓
        Upload to Shopify (GraphQL mutation)
    ↓
    Reorder media (GraphQL mutation)
    ↓
    Update tags (GraphQL mutation)
    ↓
Stream progress to UI (SSE)
    ↓
Display results
```

## Environment Variables

### Required for Automated Mode
- `SHOPIFY_ADMIN_ACCESS_TOKEN` - Shopify Admin API token (server-only)
- `NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN` - Store domain (e.g., `charmedanddark.myshopify.com`)
- `GEMINI_API_KEY` - Google Gemini API key for background selection
- `REPLICATE_API_TOKEN` - Replicate API token for image processing
- `NEXT_PUBLIC_ADMIN_EMAILS` - Comma-separated admin email list (preferred)
- `ADMIN_EMAILS` - Comma-separated admin email list (fallback)
- `NEXT_PUBLIC_SUPABASE_URL` - Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Supabase anon key
- `SUPABASE_SERVICE_ROLE_KEY` - Supabase service role key (server-only)

### Optional Fallback
- `STABILITY_API_KEY` - Stability AI API key (fallback for background generation)

### Admin Email Configuration
Supports both environment variable names:
- **Preferred**: `NEXT_PUBLIC_ADMIN_EMAILS=admin1@example.com,admin2@example.com`
- **Fallback**: `ADMIN_EMAILS=admin1@example.com,admin2@example.com`

Emails are automatically normalized (trimmed, lowercased) to prevent casing/spacing issues.

## Cost Analysis

### Per Image Costs (Optimized)
- Background removal (RMBG-1.4): ~$0.003
- Background generation (SDXL Lightning): ~$0.005
- Compositing (Sharp): Free (local processing)
- Storage (Supabase): Negligible
- **Total per image**: ~$0.008

### Previous Costs (Before Optimization)
- Standard SDXL with 50 steps: ~$1.53 per image
- **Savings**: 95%+ cost reduction

## Safety Features

1. **Dual-layer admin protection**:
   - Server-side middleware enforces access (cannot be bypassed)
   - Client-side checks provide immediate feedback
2. **Email normalization**: Trims whitespace, converts to lowercase
3. **Dual env var support**: `NEXT_PUBLIC_ADMIN_EMAILS` or `ADMIN_EMAILS`
4. **Self-diagnosing debug panel**: Shows auth status, whitelist, env var used
5. **Tag-based filtering**: Only processes products with exact tag combination
6. **Printify protection**: Never touches `source:printify` or `dept:wardrobe`
7. **Rate limiting**: Delays between API calls to avoid throttling
8. **Batch limits**: Max 50 products per run (default 20)
9. **Error isolation**: Failures don't stop entire batch
10. **Timeout protection**: 30-second timeout on background generation

## Shopify Tag Workflow

### Before Processing
Product must have:
- `img:needs-brand` ✓
- `source:faire` ✓
- `dept:objects` ✓

### After Processing
Product will have:
- `img:branded` (added)
- `bg:stone` or `bg:candle` or `bg:glass` (added)
- `img:needs-brand` (removed)
- `source:faire` (unchanged)
- `dept:objects` (unchanged)

## Testing Checklist

- [ ] Admin authentication works (login + email check)
- [ ] Shopify product fetch returns correct products
- [ ] AI background selector chooses appropriate backgrounds
- [ ] Background generation completes within 30 seconds
- [ ] Background removal preserves product quality
- [ ] Compositing produces clean, professional images
- [ ] Images upload to Shopify successfully
- [ ] Media reordering sets branded images first
- [ ] Tags update correctly (adds `img:branded`, removes `img:needs-brand`)
- [ ] Progress streaming works in UI
- [ ] Error handling doesn't crash entire batch
- [ ] Rate limiting prevents API throttling
- [ ] Cost per image stays under $0.01

## Known Limitations

1. **Shopify API rate limits**: 2 requests/second (handled with delays)
2. **Batch size**: Limited to 50 products per run
3. **Background generation**: 30-second timeout (Lightning is fast, but network can be slow)
4. **Temporary storage**: Uses Supabase as intermediary (Shopify requires public URL)
5. **No rollback**: If tagging fails, images are already uploaded (manual cleanup needed)

## Future Enhancements

1. **Webhook integration**: Auto-trigger when products are tagged in Shopify
2. **Background caching**: Reuse backgrounds for similar products
3. **Batch optimization**: Process multiple images in parallel
4. **Direct Shopify upload**: Eliminate Supabase intermediary
5. **Rollback mechanism**: Undo changes if pipeline fails mid-process
6. **A/B testing**: Generate multiple background variations
7. **Quality scoring**: AI rates output quality before upload

## Troubleshooting

### "No products found needing branding"
- Check Shopify tags are exactly: `img:needs-brand`, `source:faire`, `dept:objects`
- Verify `SHOPIFY_ADMIN_ACCESS_TOKEN` has read access

### "Background generation timed out"
- Check `REPLICATE_API_TOKEN` is valid
- Verify network connectivity to Replicate API
- Consider increasing timeout (currently 30s)

### "Failed to upload image to Shopify"
- Check `SHOPIFY_ADMIN_ACCESS_TOKEN` has write access
- Verify image URL is publicly accessible
- Check Shopify API rate limits

### "Admin access denied"
- Verify user is logged in via Supabase Auth
- Check email is in `NEXT_PUBLIC_ADMIN_EMAILS` (comma-separated, no spaces)

### "Cost spike"
- Verify `num_inference_steps: 4` in background-generation.ts
- Check `guidance_scale: 0` for Lightning model
- Confirm resolution capped at 1024×1024
- Review Replicate dashboard for unexpected model usage

## Architecture Decisions

### Why Shopify-driven?
- Single source of truth (Shopify inventory)
- No manual CSV uploads
- Automatic tag-based workflow
- Scales with inventory growth

### Why AI background selection?
- Product-specific optimization
- Reduces manual decision-making
- Consistent brand aesthetic
- Learns from product attributes

### Why SDXL Lightning?
- 95%+ cost savings vs standard SDXL
- 4-step generation is fast (5-10 seconds)
- Quality sufficient for product photography
- Predictable costs at scale

### Why Supabase intermediary?
- Shopify requires public URLs for media upload
- Supabase provides instant public URLs
- Alternative: Direct S3/CDN upload (future enhancement)

### Why tag-based filtering?
- Prevents accidental processing of wrong products
- Clear workflow state (needs-brand → branded)
- Easy to query and monitor
- Supports batch operations

## File Structure Summary

```
middleware.ts                       # Server-side route protection (NEW)

app/
  admin/
    darkroom/
      page.tsx                      # Admin UI (automated + manual modes)
      middleware.ts                 # Helper functions for middleware (NEW)
  api/
    darkroom/
      run/
        route.ts                    # API endpoint (streaming SSE)

lib/
  auth/
    admin.ts                        # Admin utilities (enhanced with normalization)
  shopify/
    darkroom.ts                     # Shopify Admin API utilities
  darkroom/
    shopify-pipeline.ts             # Automated pipeline orchestrator
    background-selector.ts          # AI background selection (Gemini)
    background-generation.ts        # SDXL Lightning generation
    pipeline.ts                     # Legacy manual pipeline
    background-removal.ts           # RMBG-1.4 extraction
    compositor.ts                   # Sharp compositing
    storage.ts                      # Supabase Storage upload
    database.ts                     # Database updates
```

## Deployment Notes

### Vercel Configuration
- Set all environment variables in Vercel dashboard
- Ensure `SHOPIFY_ADMIN_ACCESS_TOKEN` is server-only (not exposed to client)
- Set `maxDuration: 300` for API route (5 minutes)
- Enable streaming responses

### Shopify Configuration
1. Create Private App in Shopify Admin
2. Grant permissions:
   - `read_products`
   - `write_products`
   - `read_product_listings`
   - `write_product_listings`
3. Copy Admin API access token to `SHOPIFY_ADMIN_ACCESS_TOKEN`

### Supabase Configuration
1. Create `products` storage bucket
2. Set bucket to public
3. Copy service role key to `SUPABASE_SERVICE_ROLE_KEY`

### Gemini Configuration
1. Get API key from Google AI Studio
2. Copy to `GEMINI_API_KEY`

### Replicate Configuration
1. Get API token from Replicate dashboard
2. Copy to `REPLICATE_API_TOKEN`

---

**Last Updated**: Admin Access V2 (Bulletproof Edition)
**Status**: Architecture complete with dual-layer security, ready for testing
**See Also**: `DARKROOM_ADMIN_ACCESS_V2.md` for detailed security documentation
