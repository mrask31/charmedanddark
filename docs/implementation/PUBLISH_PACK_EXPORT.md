# Publish Pack Export - Implementation Summary

## Overview

Added "Publish Pack" export functionality to the Product Catalog Studio, enabling export of complete product page content (product details + narrative) in Markdown and JSON formats. Includes validation gating to ensure only ready-to-publish products with linked narratives can be exported.

## Implementation Details

### Features Implemented

#### 1. Mark Ready to Publish Button
- Validates required fields before allowing status change
- Required fields:
  - Product name
  - Price
  - Fulfillment type
  - Linked narrative
- Shows validation message when requirements not met
- Green button when enabled, gray when disabled
- Only visible when product status is "draft"

#### 2. Publish Pack Export Section
- Only visible when:
  - Product has linked locked narrative
  - Product status is "ready_to_publish"
- Green background panel with clear messaging
- Two export buttons: "Copy Markdown" and "Copy JSON"
- Uses locked narrative text (finalized brand copy)

#### 3. Export Formats

**Markdown Format (Product Page Ready):**
```markdown
# Product Name

## Product Details

**SKU:** SKU-001
**Price:** $49.99
**Fulfillment:** printify

## Short Description

[narrative content]

## Long Ritual Description

[narrative content]

## Ritual Prompt

[narrative content]

## Care & Use Note

[narrative content]

## Alt Text

[narrative content]

## Tagline

[narrative content]

## Images

**Primary Image:** [URL]

**Gallery Images:**
1. [URL]
2. [URL]
```

**JSON Format (Structured Data):**
```json
{
  "product": {
    "name": "Product Name",
    "sku": "SKU-001",
    "price": "49.99",
    "fulfillment_type": "printify"
  },
  "narrative": {
    "short_description": "...",
    "long_ritual_description": "...",
    "ritual_prompt": "...",
    "care_use_note": "...",
    "alt_text": "...",
    "tagline": "..."
  },
  "images": {
    "primary": "https://...",
    "gallery": ["https://...", "https://..."]
  }
}
```

### Validation Logic

**canMarkReadyToPublish():**
- Checks for: name, price, fulfillment_type, locked_narrative_id
- Returns boolean
- Used to enable/disable "Mark Ready to Publish" button

**canExportPublishPack():**
- Checks for: locked_narrative_id AND status === 'ready_to_publish'
- Returns boolean
- Used to show/hide export section

### UI/UX Design

**Mark Ready to Publish Section:**
- Green button (#2e7d32) when enabled
- Gray button (#ccc) when disabled
- Helper text shows missing requirements
- Only visible for draft products

**Publish Pack Export Section:**
- Light green background (#e8f5e9)
- Green border (#2e7d32)
- Clear heading and description
- Two export buttons side-by-side
- Only visible for ready-to-publish products with narratives

**Button Styling:**
- Consistent with existing studio aesthetic
- White background with black border for export buttons
- Clear, readable labels

### Data Flow

```
User fills product form
    ↓
Clicks "Mark Ready to Publish"
    ↓
Validation checks required fields
    ↓
Status updated to "ready_to_publish"
    ↓
Export section becomes visible
    ↓
User clicks "Copy Markdown" or "Copy JSON"
    ↓
System finds linked narrative
    ↓
Formats export data
    ↓
Copies to clipboard
    ↓
Shows feedback message
```

### Functions Added

**canMarkReadyToPublish():**
```typescript
const canMarkReadyToPublish = () => {
  return !!(
    formData.name?.trim() &&
    formData.price &&
    formData.fulfillment_type &&
    formData.locked_narrative_id
  );
};
```

**handleMarkReadyToPublish():**
- Validates requirements
- Shows alert with missing fields if validation fails
- Updates status to "ready_to_publish"
- Shows success feedback

**canExportPublishPack():**
```typescript
const canExportPublishPack = () => {
  return !!(
    formData.locked_narrative_id &&
    formData.status === 'ready_to_publish'
  );
};
```

**exportPublishPackMarkdown():**
- Finds linked narrative
- Formats product + narrative as Markdown
- Copies to clipboard

**exportPublishPackJSON():**
- Finds linked narrative
- Structures data as JSON object
- Copies to clipboard

### Constraints Honored

✅ No external integrations  
✅ Uses locked narrative text only  
✅ Clean export output  
✅ Proper gating logic  
✅ Validation before export  
✅ Consistent styling  

## Usage Workflow

### Preparing a Product for Publishing

1. Navigate to `/studio/products`
2. Create or edit a product
3. Fill in required fields:
   - Product name
   - Price
   - Fulfillment type
4. Link a locked narrative from dropdown
5. Click "Mark Ready to Publish"
6. Status changes to "ready_to_publish"
7. Export section appears

### Exporting Publish Pack

1. Ensure product is marked "ready_to_publish"
2. Ensure narrative is linked
3. Export section appears with green background
4. Click "Copy Markdown" for product page format
5. OR click "Copy JSON" for structured data
6. Content copied to clipboard
7. Paste into target system

### Validation Errors

If "Mark Ready to Publish" is disabled:
- Check helper text for missing requirements
- Fill in missing fields
- Link a narrative if not already linked
- Button will enable automatically

## Export Content Included

### Product Information
- Product name
- SKU (or "N/A" if not provided)
- Price (formatted)
- Fulfillment type

### Narrative Content (from locked narrative)
- Short Description
- Long Ritual Description
- Ritual Prompt (labeled as "Ritual Prompt" in export)
- Care & Use Note
- Alt Text
- Tagline (or "(none)" if empty)

### Image URLs
- Primary image URL (or "N/A" if not provided)
- Gallery image URLs (numbered list, or "N/A" if none)

## Technical Details

### Markdown Export Structure
- H1 for product name
- H2 for major sections
- Bold for product detail labels
- Numbered list for gallery images
- Clean, readable formatting

### JSON Export Structure
```typescript
{
  product: {
    name: string;
    sku: string | null;
    price: string | number;
    fulfillment_type: string;
  };
  narrative: {
    short_description: string;
    long_ritual_description: string;
    ritual_prompt: string;
    care_use_note: string;
    alt_text: string;
    tagline: string | null;
  };
  images: {
    primary: string | null;
    gallery: string[];
  };
}
```

### Error Handling
- Gracefully handles missing narratives
- Shows clear validation messages
- Prevents export when requirements not met
- Provides helpful feedback

## UI States

### Draft Product (No Narrative)
- "Mark Ready to Publish" button disabled
- Helper text: "Required: Product name, price, fulfillment type, and linked narrative"
- No export section visible

### Draft Product (With Narrative)
- "Mark Ready to Publish" button enabled
- No export section visible

### Ready to Publish Product
- No "Mark Ready to Publish" button (already published)
- Export section visible with green background
- Both export buttons enabled

## Files Modified

1. **app/studio/products/page.tsx**
   - Added `canMarkReadyToPublish()` function
   - Added `handleMarkReadyToPublish()` function
   - Added `canExportPublishPack()` function
   - Added `exportPublishPackMarkdown()` function
   - Added `exportPublishPackJSON()` function
   - Updated form actions section with new UI

## Files Created

1. **PUBLISH_PACK_EXPORT.md** - This file

## Testing Checklist

Manual testing completed:
- [x] Mark product as ready to publish with all requirements
- [x] Attempt to mark ready without narrative (validation blocks)
- [x] Attempt to mark ready without name (validation blocks)
- [x] Attempt to mark ready without price (validation blocks)
- [x] Export Markdown format
- [x] Export JSON format
- [x] Verify export includes all product fields
- [x] Verify export includes all narrative sections
- [x] Verify export includes image URLs
- [x] Verify export section only shows for ready_to_publish
- [x] Verify export section only shows with linked narrative
- [x] Verify clipboard copy works
- [x] Verify feedback messages display

## Example Exports

### Markdown Export Example
```markdown
# Lunar Devotion Ring

## Product Details

**SKU:** MOON-RING-001
**Price:** $49.99
**Fulfillment:** printify

## Short Description

A sterling silver ring featuring a crescent moon symbol, designed for those who seek connection with lunar cycles and devotion practices.

## Long Ritual Description

[Full narrative content...]

## Ritual Prompt

Hold this ring during new moon rituals to set intentions for the cycle ahead.

## Care & Use Note

Treat this piece as a companion in your devotional practice, not merely an ornament.

## Alt Text

Sterling silver ring featuring crescent moon symbol with textured band

## Tagline

Moon phases guide your devotion

## Images

**Primary Image:** https://example.com/moon-ring.jpg

**Gallery Images:**
1. https://example.com/moon-ring-1.jpg
2. https://example.com/moon-ring-2.jpg
3. https://example.com/moon-ring-3.jpg
```

### JSON Export Example
```json
{
  "product": {
    "name": "Lunar Devotion Ring",
    "sku": "MOON-RING-001",
    "price": "49.99",
    "fulfillment_type": "printify"
  },
  "narrative": {
    "short_description": "A sterling silver ring featuring a crescent moon symbol...",
    "long_ritual_description": "[Full narrative content...]",
    "ritual_prompt": "Hold this ring during new moon rituals...",
    "care_use_note": "Treat this piece as a companion...",
    "alt_text": "Sterling silver ring featuring crescent moon symbol...",
    "tagline": "Moon phases guide your devotion"
  },
  "images": {
    "primary": "https://example.com/moon-ring.jpg",
    "gallery": [
      "https://example.com/moon-ring-1.jpg",
      "https://example.com/moon-ring-2.jpg",
      "https://example.com/moon-ring-3.jpg"
    ]
  }
}
```

## Benefits

1. **Quality Control**: Validation ensures complete product data before publishing
2. **Content Integrity**: Only locked (finalized) narratives can be exported
3. **Flexible Formats**: Markdown for humans, JSON for systems
4. **Clear Gating**: Visual indicators show when export is available
5. **Complete Package**: All product + narrative + images in one export
6. **Easy Integration**: Copy-paste ready for various platforms

## Future Enhancements (Not in MVP)

- Bulk export (multiple products at once)
- Custom export templates
- Export to file (download instead of clipboard)
- Export history/log
- Preview before export
- Additional export formats (CSV, XML)
- Shopify-specific export format
- Auto-export on status change

## Conclusion

The Publish Pack export feature provides a complete, validated export workflow for products with finalized narratives. The gating logic ensures only ready-to-publish products with linked narratives can be exported, maintaining content quality and integrity.

**Status:** ✅ Complete and ready to use
