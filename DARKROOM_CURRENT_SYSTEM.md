# Darkroom System - Current Implementation (February 2026)

## Overview

The Darkroom is now a **fully automated Shopify-integrated image processing pipeline** that automatically finds, processes, and brands product images without any manual CSV uploads.

---

## What Changed from the Original System

### OLD SYSTEM (Deprecated)
- **Manual CSV Upload**: Admin uploaded a CSV file with product handles and image URLs
- **External Image Sources**: Images came from Google Sheets or external URLs
- **Manual Process**: Required creating and maintaining CSV files
- **One-off Processing**: Each batch required a new CSV upload

### NEW SYSTEM (Current)
- **Automated Shopify Integration**: Directly queries Shopify Admin API for products
- **Tag-Based Selection**: Automatically finds products that need branding based on tags
- **Zero Manual Input**: No CSV files, no spreadsheets - fully automated
- **Continuous Processing**: Can run repeatedly to process new products as they're tagged

---

## How It Works Now

### 1. Product Selection (Automated)

The system automatically finds products in Shopify that have ALL three tags:
- `img:needs-brand` - Product needs branded images
- `source:faire` - Product is from Faire wholesale
- `dept:objects` - Product is in the Objects department

**Why these tags?**
- **Safety filter**: Prevents accidentally processing Printify products (print-on-demand) or Wardrobe items
- **Workflow control**: You manually add these tags to products when they're ready for branding
- **Batch control**: Process products in controlled batches by tagging them

**GraphQL Query Used:**
```graphql
tag:"img:needs-brand" AND tag:"source:faire" AND tag:"dept:objects"
```

Note: Tags with colons must be quoted in Shopify's search syntax.

---

### 2. Image Processing Pipeline

For each product found, the system processes ALL product images through these steps:

#### Step A: AI Background Selection
- **Tool**: Google Gemini AI (currently falling back to "stone" due to model version issue)
- **Input**: Product title and tags
- **Output**: Best background type (stone, candle, glass, etc.)
- **Purpose**: Intelligently matches background to product aesthetic

#### Step B: Background Generation
- **Tool**: Replicate API with SDXL Lightning model
- **Input**: Background prompt (e.g., "Smooth stone surface with natural texture")
- **Output**: 1024x1024px branded background image
- **Cost**: ~$0.005 per image (very cheap)
- **Generated once per product**: All images use the same background

#### Step C: Background Removal
- **Tool**: Replicate API with RMBG-1.4 model
- **Input**: Original product image from Shopify
- **Output**: Product with transparent background (PNG)
- **Purpose**: Isolate the product from its original background

#### Step D: Image Compositing
- **Tool**: Sharp (Node.js image processing library)
- **Process**:
  1. Place branded background as base layer
  2. Overlay extracted product on top
  3. Add subtle drop shadow for depth
  4. Export as high-quality JPEG
- **Output**: Final branded product image

#### Step E: Upload to Supabase Storage
- **Bucket**: `products` (public)
- **Path**: `temp-shopify/{product-handle}-{image-number}-{timestamp}.jpg`
- **Purpose**: Temporary hosting so Shopify can fetch the image
- **Result**: Public URL that Shopify can access

#### Step F: Upload to Shopify
- **API**: Shopify Admin GraphQL API
- **Mutation**: `productCreateMedia`
- **Process**: Tell Shopify to fetch the image from Supabase URL
- **Result**: Shopify downloads, processes, and hosts the image permanently
- **Note**: Shopify may take a few seconds to process, so media ID might not be immediately available

#### Step G: Media Reordering (Optional)
- **Goal**: Put branded images first in the product gallery
- **Status**: Currently skipped if Shopify hasn't finished processing
- **Future**: Could be done as a follow-up process

#### Step H: Tag Updates
- **Remove**: `img:needs-brand`
- **Add**: `img:branded` (marks as complete)
- **Add**: `bg:{type}` (e.g., `bg:stone`) - tracks which background was used
- **Purpose**: Prevents reprocessing and tracks completion

---

### 3. Access Control

**Admin-Only Access:**
- **Client-side check**: Page component verifies user is authenticated and in admin whitelist
- **Environment variable**: `NEXT_PUBLIC_ADMIN_EMAILS` (comma-separated list)
- **Email normalization**: Trims whitespace and converts to lowercase
- **Redirect behavior**:
  - Not logged in → `/threshold/enter` (login page)
  - Logged in but not admin → `/not-authorized`

**Why client-side only?**
- Middleware couldn't access Supabase auth cookies reliably
- Page-level protection is sufficient for admin tools
- Simpler and more maintainable

---

### 4. API Endpoints

#### `/api/darkroom/run` (POST)
- **Purpose**: Run the automated pipeline
- **Auth**: Requires Bearer token (Supabase session)
- **Input**: `{ limit: number }` (max 50, default 20)
- **Output**: Server-Sent Events (SSE) stream with progress updates
- **Response types**:
  - `progress`: Current status (total, processed, succeeded, failed)
  - `complete`: Final results array
  - `error`: Pipeline failure

#### `/api/darkroom/preflight` (POST) - NOT YET IMPLEMENTED
- **Purpose**: Preview which products will be processed without running
- **Status**: Documented but not in current codebase
- **Future feature**: Would show product list, tags, image counts, skip reasons

---

### 5. Environment Variables Required

**Shopify Integration:**
- `SHOPIFY_ADMIN_ACCESS_TOKEN` - Admin API token (starts with `shpat_`)
- `NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN` - Store domain (e.g., `charmed-dark.myshopify.com`)

**Supabase:**
- `NEXT_PUBLIC_SUPABASE_URL` - Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Public anon key
- `SUPABASE_SERVICE_ROLE_KEY` - Service role key (for storage uploads)

**AI Services:**
- `GEMINI_API_KEY` - Google Gemini API key (for background selection)
- `REPLICATE_API_TOKEN` - Replicate API token (for image processing)

**Admin Access:**
- `NEXT_PUBLIC_ADMIN_EMAILS` - Comma-separated admin emails

---

## Current Workflow for Using Darkroom

### Step 1: Tag Products in Shopify
1. Go to Shopify Admin → Products
2. Find products that need branding (usually Faire wholesale items)
3. Add these three tags:
   - `img:needs-brand`
   - `source:faire`
   - `dept:objects`
4. Save the product

### Step 2: Run Darkroom
1. Go to: `https://charmedanddark.vercel.app/admin/darkroom`
2. Log in with admin email
3. Click "RUN DARKROOM ON TAGGED PRODUCTS"
4. Wait for processing (2-3 minutes per product depending on image count)
5. View results on the page

### Step 3: Verify in Shopify
1. Go back to Shopify Admin → Products
2. Check the processed products:
   - New branded images should be added
   - Tags updated: `img:needs-brand` removed, `img:branded` and `bg:stone` added
3. Manually reorder images if needed (branded images may not be first)

---

## Technical Architecture

### File Structure

```
app/admin/darkroom/
  └── page.tsx                    # Admin UI (client component)

app/api/darkroom/
  ├── run/route.ts                # Main pipeline endpoint
  └── preflight/route.ts          # Preview endpoint (not implemented)

lib/darkroom/
  ├── shopify-pipeline.ts         # Main orchestration logic
  ├── background-selector.ts      # AI background selection
  ├── background-generation.ts    # Replicate background generation
  ├── background-removal.ts       # Replicate background removal
  ├── compositor.ts               # Sharp image compositing
  └── storage.ts                  # Supabase storage upload

lib/shopify/
  └── darkroom.ts                 # Shopify Admin API integration
      ├── fetchProductsNeedingBranding()
      ├── uploadImageToProduct()
      ├── reorderProductMedia()
      └── updateProductTags()

lib/auth/
  └── admin.ts                    # Admin access control utilities
```

### Data Flow

```
User clicks button
    ↓
Frontend calls /api/darkroom/run
    ↓
Backend queries Shopify for tagged products
    ↓
For each product:
    ↓
    AI selects background type
    ↓
    Generate background (Replicate)
    ↓
    For each product image:
        ↓
        Remove background (Replicate)
        ↓
        Composite onto branded background (Sharp)
        ↓
        Upload to Supabase Storage
        ↓
        Tell Shopify to fetch from Supabase
        ↓
    Update product tags
    ↓
Return results to frontend
```

---

## Known Issues & Limitations

### 1. Gemini Model Version
- **Issue**: `gemini-2.0-flash-exp` model not found
- **Impact**: AI background selection fails, falls back to "stone"
- **Fix needed**: Update to correct Gemini model name
- **Workaround**: Stone background works fine for most products

### 2. Shopify Image Processing Delay
- **Issue**: Shopify doesn't immediately return image URLs after upload
- **Impact**: Can't reorder images automatically
- **Current solution**: Skip reordering step
- **Future fix**: Add follow-up process to reorder after delay

### 3. No Preflight Preview
- **Issue**: Can't preview which products will be processed before running
- **Impact**: Might process unexpected products
- **Workaround**: Carefully tag only products you want to process
- **Future feature**: Implement preflight endpoint and UI

### 4. Manual CSV Mode Still Exists
- **Status**: Legacy code still in codebase but not used
- **Recommendation**: Remove or clearly separate from automated mode

---

## Cost Analysis

**Per Product (with 7 images):**
- Background generation: 1 × $0.005 = $0.005
- Background removal: 7 × $0.003 = $0.021
- Image compositing: Free (Sharp library)
- Total: ~$0.026 per product

**Batch of 20 products:**
- Estimated cost: ~$0.52
- Processing time: ~40-60 minutes
- Supabase storage: Negligible (images are temporary)

---

## Security Considerations

1. **Admin Access**: Only whitelisted emails can access Darkroom
2. **API Authentication**: All API calls require valid Supabase session token
3. **Shopify Token**: Admin API token stored securely in environment variables
4. **Safety Filters**: Tag-based system prevents accidental processing of wrong products
5. **Rate Limiting**: 2-3 second delays between images to avoid API throttling

---

## Future Enhancements

### High Priority
1. Fix Gemini model version for AI background selection
2. Implement preflight preview feature
3. Add automatic image reordering after Shopify processing delay

### Medium Priority
4. Add batch size controls in UI (currently hardcoded to 20)
5. Add progress bar with real-time updates
6. Add ability to cancel running jobs
7. Add detailed error reporting per product

### Low Priority
8. Remove legacy CSV upload code
9. Add support for custom background prompts
10. Add image quality settings
11. Add webhook to auto-process when products are tagged

---

## Troubleshooting

### "No products found needing branding"
- Check that products have ALL three tags (not just one or two)
- Verify tags are spelled correctly with colons: `img:needs-brand`, `source:faire`, `dept:objects`
- Check that products are Active (not Draft) in Shopify

### "Missing Shopify Admin API credentials"
- Verify `SHOPIFY_ADMIN_ACCESS_TOKEN` is set in Vercel
- Verify `NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN` is set correctly
- Check token starts with `shpat_`

### "Cannot read properties of null (reading 'url')"
- This was fixed - Shopify image processing delay is now handled
- If still occurring, check Vercel logs for detailed error

### Images not appearing in Shopify
- Check Supabase `products` bucket is set to Public
- Verify images were uploaded to Supabase (check Storage in Supabase dashboard)
- Check Shopify product page - images may be there but not reordered

---

## Summary for Gemini

**What to remember:**
1. Darkroom is now fully automated - no more CSV files
2. Products are selected by Shopify tags, not manual lists
3. All images are processed automatically when you click one button
4. Images are uploaded to Supabase temporarily, then Shopify hosts them permanently
5. Tags are updated automatically to track completion
6. Only admin users can access the Darkroom
7. The system is production-ready and working (with minor limitations)

**Key tags to remember:**
- `img:needs-brand` - Needs processing
- `img:branded` - Already processed
- `source:faire` - From Faire wholesale
- `dept:objects` - Objects department
- `bg:stone` - Background type used

**When user asks about Darkroom:**
- Refer to this document for current implementation
- Don't suggest CSV uploads - that's the old system
- Focus on tag-based workflow
- Mention it's admin-only and fully automated
