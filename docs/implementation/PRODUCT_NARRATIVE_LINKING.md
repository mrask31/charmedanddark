# Product-Narrative Linking - Implementation Summary

## Overview

Extended the Product Catalog Studio to link products with locked narratives from the Narrative Studio. This creates a connection between product records and their finalized brand copy, enabling a unified content management workflow.

## Implementation Details

### Schema Changes

**Product Interface Updated:**
```typescript
interface Product {
  id: string;
  name: string;
  sku?: string;
  price: string | number;
  fulfillment_type: FulfillmentType;
  status: ProductStatus;
  primary_image_url?: string;
  gallery_image_urls?: string[];
  locked_narrative_id?: string;  // NEW FIELD
  created_at: string;
  updated_at: string;
}
```

**Narrative Interfaces Added:**
```typescript
interface NarrativeBundle {
  short_description: string;
  long_ritual_description: string;
  ritual_intention_prompt: string;
  care_use_note: string;
  alt_text: string;
  one_line_drop_tagline: string;
}

interface SavedNarrative {
  id: string;
  product_name: string;
  narrative_bundle: NarrativeBundle;
  locked_at: string;
  version: string;
}
```

### Features Implemented

#### 1. Narrative Selection Dropdown
- Located in product create/edit form under "Linked Narrative" section
- Dropdown lists all saved locked narratives from Narrative Studio
- Shows narrative product name + locked date for easy identification
- "None" option to unlink narratives
- Empty state message when no narratives available

#### 2. Narrative Preview Panel
- Appears when a narrative is selected
- Shows all 6 narrative sections in collapsible cards:
  - Short Description
  - Long Ritual Description
  - Ritual Intention Prompt
  - Care & Use Note
  - Alt Text
  - One-Line Drop Tagline
- Truncates long content (>150 chars) with "Show more/less" toggle
- Read-only display (no editing from product page)

#### 3. Open Narrative Button
- "Open Narrative →" button in preview panel header
- Opens Narrative Studio in new tab
- Allows viewing full narrative details
- Uses target="_blank" for non-disruptive workflow

#### 4. Narrative Linked Badge
- Blue badge in product list view
- Shows "Narrative Linked" when product has linked narrative
- Positioned alongside status badges (Draft/Ready to Publish)
- Color-coded: light blue background (#e3f2fd), dark blue text (#1565c0)

#### 5. Data Persistence
- Reads from `saved_narratives` localStorage key
- Writes `locked_narrative_id` to product records
- Safe schema migration (optional field, backward compatible)
- No data loss for existing products

### UI/UX Design

**Consistent Styling:**
- Matches existing Product Catalog aesthetic
- Clean black/white color scheme
- Generous spacing (24px sections, 16px elements)
- Professional, minimal design

**Narrative Preview Cards:**
- White background with light gray border
- Compact display with expand/collapse
- Clear section titles
- Readable typography (14px body, 1.5 line height)

**Badge Design:**
- Small, unobtrusive (12px font, 2px padding)
- Color-coded for quick scanning
- Consistent with existing status badges

### Data Flow

1. **Load Narratives**: On mount, reads `saved_narratives` from localStorage
2. **Select Narrative**: User chooses from dropdown, updates formData
3. **Preview Display**: Finds narrative by ID, renders preview panel
4. **Save Product**: Stores `locked_narrative_id` with product record
5. **List Display**: Shows badge if `locked_narrative_id` exists

### Constraints Honored

✅ Only locked/saved narratives can be linked  
✅ No schema migrations (optional field added safely)  
✅ localStorage-based (no database)  
✅ No external services  
✅ Backward compatible (existing products unaffected)  
✅ Consistent styling with existing pages  

## Usage Workflow

### Linking a Narrative to a Product

1. Navigate to `/studio/products`
2. Create new product or edit existing product
3. Scroll to "Linked Narrative" section
4. Select a locked narrative from dropdown
5. Review narrative preview (optional)
6. Click "Open Narrative →" to view full details (optional)
7. Save product

### Viewing Linked Narratives

**In Product List:**
- Products with linked narratives show blue "Narrative Linked" badge
- Badge appears alongside status badges

**In Product Edit:**
- Dropdown shows currently selected narrative
- Preview panel displays all 6 narrative sections
- "Open Narrative" button provides quick access

### Unlinking a Narrative

1. Edit the product
2. Select "None" from narrative dropdown
3. Save product

## Integration Points

**Narrative Studio → Product Catalog:**
- Locked narratives automatically appear in product dropdown
- Real-time sync via localStorage
- No manual refresh needed

**Product Catalog → Narrative Studio:**
- "Open Narrative" button navigates to Narrative Studio
- Opens in new tab for non-disruptive workflow
- Direct link to narrative viewing (future enhancement: deep link to specific narrative)

## Technical Details

### localStorage Keys Used
- `product_catalog` - Product records (updated with locked_narrative_id)
- `saved_narratives` - Locked narratives from Narrative Studio (read-only)

### Component Structure
```
ProductCatalogPage
├── Product List View
│   └── Product Card (with Narrative Linked badge)
├── Product Form View
│   ├── Basic Fields
│   ├── Image Fields
│   └── Linked Narrative Section
│       ├── Narrative Dropdown
│       └── Narrative Preview Panel
│           ├── Preview Header (with Open button)
│           └── NarrativePreviewSection (x6)
└── NarrativePreviewSection Component
    ├── Section Title
    ├── Content Display (truncated)
    └── Show More/Less Toggle
```

### Error Handling
- Gracefully handles missing narratives (shows empty dropdown)
- Handles deleted narratives (shows "None" if ID not found)
- No errors if `saved_narratives` key doesn't exist

## Future Enhancements (Not in MVP)

- Deep linking to specific narrative in Narrative Studio
- Bulk narrative linking
- Narrative search/filter in dropdown
- Show narrative preview in product list (hover/expand)
- Warn when unlinking narratives
- Show which products use a specific narrative
- Export product + narrative together
- Narrative versioning support

## Testing Checklist

Manual testing completed:
- [x] Create product with linked narrative
- [x] Edit product to change linked narrative
- [x] Unlink narrative (select "None")
- [x] View narrative preview with all 6 sections
- [x] Expand/collapse long narrative sections
- [x] Click "Open Narrative" button
- [x] View "Narrative Linked" badge in product list
- [x] Handle empty narratives list gracefully
- [x] Verify localStorage persistence
- [x] Test backward compatibility (existing products)

## Files Modified

1. `app/studio/products/page.tsx` - Main component (updated)
   - Added `locked_narrative_id` to Product interface
   - Added NarrativeBundle and SavedNarrative interfaces
   - Added savedNarratives state
   - Added narrative loading from localStorage
   - Added Linked Narrative section to form
   - Added NarrativePreviewSection component
   - Added "Narrative Linked" badge to list view

## Files Created

1. `PRODUCT_NARRATIVE_LINKING.md` - This file

## Example Data Structure

```json
{
  "id": "product_1738368000000",
  "name": "Lunar Devotion Ring",
  "sku": "MOON-RING-001",
  "price": "49.99",
  "fulfillment_type": "printify",
  "status": "ready_to_publish",
  "primary_image_url": "https://example.com/moon-ring.jpg",
  "gallery_image_urls": ["https://example.com/moon-ring-1.jpg"],
  "locked_narrative_id": "narrative_1738367000000",
  "created_at": "2026-01-31T12:00:00.000Z",
  "updated_at": "2026-01-31T12:30:00.000Z"
}
```

## Benefits

1. **Unified Workflow**: Connect products with their brand copy in one place
2. **Content Integrity**: Only locked (finalized) narratives can be linked
3. **Easy Access**: Quick preview and navigation to full narrative
4. **Visual Indicators**: Clear badges show which products have narratives
5. **Flexible**: Optional linking, can unlink anytime
6. **Safe**: Backward compatible, no breaking changes

## Conclusion

The Product-Narrative linking feature successfully bridges the Product Catalog and Narrative Studio, creating a cohesive content management system. Products can now be associated with their finalized brand copy, enabling better organization and workflow efficiency.
