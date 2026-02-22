# Darkroom Preflight Implementation Summary

## What Was Added

A complete preflight check system that shows exactly which products will be processed before starting the Darkroom pipeline.

## Changes Made

### 1. New API Endpoint
**File**: `app/api/darkroom/preflight/route.ts`

- Fetches products from Shopify (same query as processing)
- Analyzes each product for validity
- Returns detailed information about each product
- Shows which products will process and which will skip
- Provides skip reasons for invalid products

### 2. UI Enhancements
**File**: `app/admin/darkroom/page.tsx`

**New Button**: "Check Products (X)"
- Replaces "Run Darkroom" as first step
- Shows limit in button text
- Disabled during loading

**Preflight Table**:
- Shows all products found
- Columns: Product, Handle, ID, Images, Tags, Status
- Color-coded tags (green=required, red=danger, gray=other)
- Row highlighting (white=valid, light red=skip)
- Clear status indicators

**Action Buttons**:
- Cancel: Go back to settings
- Confirm & Start: Proceed with processing
- Confirm button shows count of valid products
- Confirm button disabled if no valid products

### 3. Product Analysis Logic

**Products are skipped if**:
1. Has `source:printify` tag → "Printify product"
2. Has `dept:wardrobe` tag → "Wardrobe product"
3. Missing `source:faire` tag → "Missing source:faire tag"
4. Missing `dept:objects` tag → "Missing dept:objects tag"
5. Has 0 images → "No images"

**Products will process if**:
- Has all required tags: `img:needs-brand`, `source:faire`, `dept:objects`
- Does NOT have danger tags: `source:printify`, `dept:wardrobe`
- Has at least 1 image

## User Workflow

### Before (Old Way)
```
1. Set limit
2. Click "Run Darkroom"
3. Wait 5-10 minutes
4. Discover some products were skipped
5. Check logs to understand why
6. Fix issues in Shopify
7. Run again
```

### After (New Way)
```
1. Set limit
2. Click "Check Products"
3. Wait 2-5 seconds
4. Review preflight table
5. See exactly what will happen
6. Fix any issues in Shopify (if needed)
7. Click "Check Products" again (if fixed)
8. Click "Confirm & Start"
9. Processing runs smoothly
```

## Benefits

### 1. Cost Prevention
- See what will be processed before spending API credits
- Avoid processing invalid products
- Catch configuration errors early

### 2. Transparency
- No surprises about what gets processed
- Clear reasons for skipped products
- Easy to verify tag configuration

### 3. Confidence
- Review before committing
- Verify product selection is correct
- Understand exactly what will happen

### 4. Debugging
- Quickly identify misconfigured products
- See which tags are present/missing
- Understand why products are skipped

## Visual Design

### Tag Color Coding
- **Green background**: Required tags (`img:needs-brand`, `source:faire`, `dept:objects`)
- **Red background**: Danger tags (`source:printify`, `dept:wardrobe`)
- **Gray background**: Other tags

### Row Highlighting
- **White background**: Product will process
- **Light red background**: Product will skip

### Status Indicators
- **✓ Will process** (green text): Product is valid
- **✗ Skip: [reason]** (red text): Product will be skipped

## Technical Details

### API Performance
- Fetches products from Shopify (same as processing)
- Does NOT process images (fast)
- Does NOT call AI APIs (fast)
- Typical time: 2-5 seconds for 20 products

### Security
- Admin-only endpoint
- Same authentication as processing endpoint
- Enforces 50 product limit (hard cap)

### Data Flow
```
User clicks "Check Products"
    ↓
POST /api/darkroom/preflight
    ↓
Fetch products from Shopify
    ↓
Analyze each product:
  - Check for danger tags
  - Check for required tags
  - Check for images
    ↓
Return analysis results
    ↓
Display preflight table
    ↓
User reviews and clicks "Confirm & Start"
    ↓
POST /api/darkroom/run (existing endpoint)
    ↓
Processing begins
```

## Example Scenarios

### Scenario 1: All Products Valid
```
Preflight Check: 3 products found
✓ 3 will process  ✗ 0 skip

All products have:
- Required tags present
- No danger tags
- At least 1 image

[Cancel]  [Confirm & Start Processing (3 products)]
```

### Scenario 2: Mixed Results
```
Preflight Check: 5 products found
✓ 3 will process  ✗ 2 skip

Valid products: 3
Skipped products:
- 1 Printify product
- 1 Wardrobe product

[Cancel]  [Confirm & Start Processing (3 products)]
```

### Scenario 3: No Valid Products
```
Preflight Check: 2 products found
✓ 0 will process  ✗ 2 skip

All products skipped:
- 1 has no images
- 1 is Wardrobe product

[Cancel]  [Confirm & Start Processing (0 products)] ← DISABLED
```

## Files Modified/Created

### New Files
1. `app/api/darkroom/preflight/route.ts` - Preflight API endpoint
2. `DARKROOM_PREFLIGHT_FEATURE.md` - Feature documentation
3. `DARKROOM_PREFLIGHT_VISUAL.md` - Visual design guide
4. `DARKROOM_PREFLIGHT_SUMMARY.md` - This file

### Modified Files
1. `app/admin/darkroom/page.tsx`:
   - Added preflight state management
   - Added preflight table UI
   - Added "Check Products" button
   - Added "Confirm & Start" workflow
   - Added styles for preflight components

## Testing Checklist

### Basic Functionality
- [ ] Click "Check Products (1)" with valid product
- [ ] Verify table shows product details
- [ ] Verify tags are color-coded correctly
- [ ] Verify status shows "✓ Will process"
- [ ] Click "Confirm & Start"
- [ ] Verify processing starts

### Skip Scenarios
- [ ] Test with `source:printify` product
- [ ] Verify shows "✗ Skip: Printify product"
- [ ] Verify row has red background
- [ ] Test with `dept:wardrobe` product
- [ ] Verify shows "✗ Skip: Wardrobe product"
- [ ] Test with product that has no images
- [ ] Verify shows "✗ Skip: No images"
- [ ] Test with missing `source:faire` tag
- [ ] Verify shows "✗ Skip: Missing source:faire tag"

### UI Behavior
- [ ] Test "Cancel" button
- [ ] Verify table disappears
- [ ] Test with 0 valid products
- [ ] Verify "Confirm & Start" is disabled
- [ ] Test with limit = 20
- [ ] Verify all products shown in table
- [ ] Test loading state
- [ ] Verify button shows "Checking products..."

### Edge Cases
- [ ] Test with no products found
- [ ] Verify appropriate message shown
- [ ] Test with API error
- [ ] Verify error alert shown
- [ ] Test with auth error
- [ ] Verify redirected to login

## Cost Impact

### Before Preflight
- Risk: Processing invalid products wastes API credits
- Example: 20 products, 5 invalid = $0.04 wasted

### After Preflight
- Cost: ~$0 (just fetches product data, no image processing)
- Benefit: Prevents wasted API credits
- ROI: Immediate (first prevented mistake pays for itself)

## Next Steps

1. **Deploy to Vercel**
2. **Test with real products**:
   - Test with valid Faire products
   - Test with Printify products
   - Test with products missing images
   - Test with various tag combinations
3. **Verify table displays correctly**
4. **Confirm skip reasons are accurate**
5. **Test complete workflow**: Check → Review → Confirm → Process

## Future Enhancements

### Possible Additions
1. **Cost estimate**: Show estimated cost for batch in preflight
2. **Image preview**: Show thumbnails of source images
3. **Tag editor**: Edit tags directly in preflight table
4. **Bulk selection**: Select/deselect specific products
5. **Export**: Export preflight results to CSV
6. **Dry run**: Show what backgrounds would be generated
7. **History**: Show previous preflight checks

---

**Status**: ✅ Implemented and ready for testing
**Impact**: High - Prevents wasted API costs and surprises
**User Experience**: Significantly improved - transparency and control
**Workflow**: Check → Review → Confirm → Process
