# Darkroom Preflight Check Feature

## Overview

The preflight check allows you to preview which products will be processed before starting the Darkroom pipeline. This prevents surprises and wasted API costs by showing exactly what will happen.

## How It Works

### Step 1: Check Products
1. Set your desired limit (1, 20, or 50)
2. Click "Check Products (X)"
3. Wait for preflight check to complete (~2-5 seconds)

### Step 2: Review Results
A table displays all products found with:
- Product title
- Handle
- Product ID (shortened)
- Image count
- Tags (color-coded)
- Status (will process or skip with reason)

### Step 3: Confirm or Cancel
- **Cancel**: Go back and adjust settings
- **Confirm & Start**: Proceed with processing

## Preflight Table

### Columns

**Product**
- Full product title
- Bold text for easy scanning

**Handle**
- Product handle (URL slug)
- Monospace font
- Gray background

**Product ID**
- Shopify product ID (shortened)
- Removes `gid://shopify/Product/` prefix
- Monospace font

**Images**
- Number of images on product
- Centered column
- Shows 0 if no images (will skip)

**Tags**
- All product tags displayed as chips
- Color-coded:
  - **Green**: Required tags (`img:needs-brand`, `source:faire`, `dept:objects`)
  - **Red**: Danger tags (`source:printify`, `dept:wardrobe`)
  - **Gray**: Other tags

**Status**
- **✓ Will process**: Product meets all requirements
- **✗ Skip: [reason]**: Product will be skipped with explanation

### Visual Indicators

**Row Background**:
- White: Product will process
- Light red (#fff5f5): Product will skip

**Tag Colors**:
- Green background: Required tags present
- Red background: Danger tags present
- Gray background: Other tags

**Status Colors**:
- Green text: Will process
- Red text: Will skip

## Skip Reasons

Products are skipped for these reasons:

### 1. Printify Product
- **Reason**: Has `source:printify` tag
- **Why**: Safety check - never process Printify products
- **Fix**: Remove `source:printify` tag (but you probably shouldn't)

### 2. Wardrobe Product
- **Reason**: Has `dept:wardrobe` tag
- **Why**: Safety check - never process wardrobe items
- **Fix**: Remove `dept:wardrobe` tag or change to `dept:objects`

### 3. Missing source:faire Tag
- **Reason**: Doesn't have `source:faire` tag
- **Why**: Required tag for Faire products
- **Fix**: Add `source:faire` tag

### 4. Missing dept:objects Tag
- **Reason**: Doesn't have `dept:objects` tag
- **Why**: Required tag for object categorization
- **Fix**: Add `dept:objects` tag

### 5. No Images
- **Reason**: Product has 0 images
- **Why**: Nothing to process
- **Fix**: Upload at least 1 image to product

## Example Preflight Results

### Scenario 1: All Products Will Process
```
┌────────────────────────────────────────────────────────────────┐
│ Preflight Check: 3 products found                             │
│                                    ✓ 3 will process  ✗ 0 skip │
├────────────────────────────────────────────────────────────────┤
│ Product          │ Handle    │ ID    │ Img │ Tags            │
├────────────────────────────────────────────────────────────────┤
│ Candle Holder    │ candle-1  │ 12345 │ 3   │ [green tags]    │
│ ✓ Will process                                                 │
├────────────────────────────────────────────────────────────────┤
│ Glass Vase       │ vase-1    │ 12346 │ 2   │ [green tags]    │
│ ✓ Will process                                                 │
├────────────────────────────────────────────────────────────────┤
│ Stone Bowl       │ bowl-1    │ 12347 │ 4   │ [green tags]    │
│ ✓ Will process                                                 │
└────────────────────────────────────────────────────────────────┘

[Cancel]  [Confirm & Start Processing (3 products)]
```

### Scenario 2: Mixed Results
```
┌────────────────────────────────────────────────────────────────┐
│ Preflight Check: 5 products found                             │
│                                    ✓ 3 will process  ✗ 2 skip │
├────────────────────────────────────────────────────────────────┤
│ Product          │ Handle    │ ID    │ Img │ Tags            │
├────────────────────────────────────────────────────────────────┤
│ Candle Holder    │ candle-1  │ 12345 │ 3   │ [green tags]    │
│ ✓ Will process                                                 │
├────────────────────────────────────────────────────────────────┤
│ T-Shirt (RED)    │ tshirt-1  │ 12346 │ 2   │ [red: wardrobe] │
│ ✗ Skip: Wardrobe product                                      │
├────────────────────────────────────────────────────────────────┤
│ Glass Vase       │ vase-1    │ 12347 │ 2   │ [green tags]    │
│ ✓ Will process                                                 │
├────────────────────────────────────────────────────────────────┤
│ Mug (Printify)   │ mug-1     │ 12348 │ 1   │ [red: printify] │
│ ✗ Skip: Printify product                                      │
├────────────────────────────────────────────────────────────────┤
│ Stone Bowl       │ bowl-1    │ 12349 │ 4   │ [green tags]    │
│ ✓ Will process                                                 │
└────────────────────────────────────────────────────────────────┘

[Cancel]  [Confirm & Start Processing (3 products)]
```

### Scenario 3: No Valid Products
```
┌────────────────────────────────────────────────────────────────┐
│ Preflight Check: 2 products found                             │
│                                    ✓ 0 will process  ✗ 2 skip │
├────────────────────────────────────────────────────────────────┤
│ Product          │ Handle    │ ID    │ Img │ Tags            │
├────────────────────────────────────────────────────────────────┤
│ Empty Product    │ empty-1   │ 12345 │ 0   │ [green tags]    │
│ ✗ Skip: No images                                             │
├────────────────────────────────────────────────────────────────┤
│ T-Shirt          │ tshirt-1  │ 12346 │ 2   │ [red: wardrobe] │
│ ✗ Skip: Wardrobe product                                      │
└────────────────────────────────────────────────────────────────┘

[Cancel]  [Confirm & Start Processing (0 products)] ← DISABLED
```

## API Endpoint

### POST /api/darkroom/preflight

**Request**:
```json
{
  "limit": 20
}
```

**Response**:
```json
{
  "products": [
    {
      "id": "gid://shopify/Product/12345",
      "handle": "candle-holder",
      "title": "Candle Holder",
      "tags": ["img:needs-brand", "source:faire", "dept:objects"],
      "imageCount": 3,
      "willProcess": true
    },
    {
      "id": "gid://shopify/Product/12346",
      "handle": "tshirt-1",
      "title": "T-Shirt",
      "tags": ["img:needs-brand", "source:faire", "dept:wardrobe"],
      "imageCount": 2,
      "willProcess": false,
      "skipReason": "Wardrobe product"
    }
  ],
  "summary": {
    "total": 2,
    "willProcess": 1,
    "willSkip": 1
  }
}
```

## Benefits

### 1. Cost Prevention
- See exactly what will be processed
- Avoid wasting API credits on invalid products
- Catch configuration errors before processing

### 2. Transparency
- No surprises about what gets processed
- Clear reasons for skipped products
- Easy to verify tag configuration

### 3. Confidence
- Review before committing
- Verify product selection is correct
- Catch edge cases early

### 4. Debugging
- Quickly identify misconfigured products
- See which tags are present/missing
- Understand why products are skipped

## Workflow

### Before Preflight (Old Way)
```
1. Click "Run Darkroom"
2. Wait 5-10 minutes
3. Discover some products were skipped
4. Wonder why
5. Check logs
6. Fix tags
7. Run again
```

### With Preflight (New Way)
```
1. Click "Check Products"
2. Wait 2-5 seconds
3. See exactly what will happen
4. Fix any issues in Shopify
5. Click "Check Products" again
6. Verify all products will process
7. Click "Confirm & Start"
8. Processing runs smoothly
```

## Technical Details

### Preflight Check Logic
```typescript
// For each product:
if (tags.includes('source:printify')) {
  skip('Printify product');
} else if (tags.includes('dept:wardrobe')) {
  skip('Wardrobe product');
} else if (!tags.includes('source:faire')) {
  skip('Missing source:faire tag');
} else if (!tags.includes('dept:objects')) {
  skip('Missing dept:objects tag');
} else if (images.length === 0) {
  skip('No images');
} else {
  willProcess = true;
}
```

### Performance
- Fetches products from Shopify (same as processing)
- Does NOT process images (fast)
- Does NOT call AI APIs (fast)
- Typical time: 2-5 seconds for 20 products

### Security
- Admin-only endpoint
- Same auth as processing endpoint
- Enforces 50 product limit

## UI States

### 1. Initial State
- Button: "Check Products (X)"
- No preflight table visible

### 2. Loading State
- Button: "Checking products..."
- Button disabled
- Limit controls disabled

### 3. Results State
- Preflight table visible
- Two buttons: "Cancel" and "Confirm & Start"
- "Confirm & Start" shows count of valid products
- "Confirm & Start" disabled if no valid products

### 4. Processing State
- Preflight table hidden
- Progress updates shown
- Same as before

## Error Handling

### No Products Found
```
Preflight Check: 0 products found
✓ 0 will process  ✗ 0 skip

No products match the query:
tag:img:needs-brand AND tag:source:faire AND tag:dept:objects

[Cancel]
```

### API Error
```
Alert: "Preflight check failed: [error message]"
```

### Auth Error
```
Alert: "Preflight check failed: Unauthorized"
```

## Testing Checklist

- [ ] Click "Check Products (1)" with valid product
- [ ] Verify table shows product details
- [ ] Verify tags are color-coded correctly
- [ ] Verify status shows "✓ Will process"
- [ ] Click "Confirm & Start"
- [ ] Verify processing starts
- [ ] Test with product that has `source:printify`
- [ ] Verify status shows "✗ Skip: Printify product"
- [ ] Verify row has red background
- [ ] Test with product that has no images
- [ ] Verify status shows "✗ Skip: No images"
- [ ] Test with limit = 20
- [ ] Verify all products shown in table
- [ ] Test "Cancel" button
- [ ] Verify table disappears
- [ ] Test with 0 valid products
- [ ] Verify "Confirm & Start" is disabled

## Future Enhancements

### Possible Additions
1. **Dry run mode**: Show what would be generated without processing
2. **Cost estimate**: Show estimated cost for batch
3. **Image preview**: Show thumbnails of source images
4. **Tag editor**: Edit tags directly in preflight table
5. **Bulk actions**: Select/deselect products to process
6. **Export**: Export preflight results to CSV
7. **History**: Show previous preflight checks

---

**Status**: ✅ Implemented and ready for testing
**Benefit**: Prevents wasted API costs and surprises
**Workflow**: Check → Review → Confirm → Process
