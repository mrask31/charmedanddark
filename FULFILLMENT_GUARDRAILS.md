# Fulfillment-Specific Guardrails - Implementation Summary

## Overview

Added fulfillment-specific validation guardrails to the Product Catalog Studio. Products now require different fields based on their fulfillment type (Printify vs In-House), with validation enforced only when marking products as "ready to publish". Drafts can be saved without these fields.

## Implementation Details

### New Product Fields

**Printify-Specific Fields:**
- `printify_sku` (string, optional for drafts, required for ready_to_publish)
- `printify_variant_notes` (string, optional)

**In-House Specific Fields:**
- `inventory_count` (number, optional for drafts, required for ready_to_publish)
- `shipping_weight_oz` (number, optional)

### Updated Product Interface

```typescript
interface Product {
  // ... existing fields
  
  // Printify-specific fields
  printify_sku?: string;
  printify_variant_notes?: string;
  
  // In-house specific fields
  inventory_count?: number;
  shipping_weight_oz?: number;
}
```

### Validation Logic

**Draft Products:**
- All fulfillment-specific fields are optional
- Products can be saved without Printify SKU or inventory count
- No blocking validation

**Ready to Publish Products:**
- **Printify fulfillment** requires: `printify_sku`
- **In-house fulfillment** requires: `inventory_count`
- Validation blocks "Mark Ready to Publish" button
- Clear error messages show missing requirements

### Conditional Field Display

**When fulfillment_type = 'printify':**
- Shows "Printify SKU" field (marked as required for ready_to_publish)
- Shows "Printify Variant Notes" field (always optional)
- Hides in-house fields

**When fulfillment_type = 'in_house':**
- Shows "Inventory Count" field (marked as required for ready_to_publish)
- Shows "Shipping Weight (oz)" field (always optional)
- Hides Printify fields

### UI/UX Design

**Field Labels:**
- Draft status: "Printify SKU (optional)" or "Inventory Count (optional)"
- Ready to publish status: "Printify SKU *" or "Inventory Count *"
- Dynamic labeling based on product status

**Validation Warnings:**
- Red text below required fields when empty and status is ready_to_publish
- "Required for ready to publish" message
- Inline, non-blocking for drafts

**Helper Text:**
- "Mark Ready to Publish" button shows dynamic requirements
- "Required: Product name, price, fulfillment type, linked narrative, and Printify SKU" (for Printify)
- "Required: Product name, price, fulfillment type, linked narrative, and inventory count" (for In-House)

### Validation Functions

**canMarkReadyToPublish():**
```typescript
const canMarkReadyToPublish = () => {
  const baseRequirements = !!(
    formData.name?.trim() &&
    formData.price &&
    formData.fulfillment_type &&
    formData.locked_narrative_id
  );

  if (!baseRequirements) return false;

  // Fulfillment-specific requirements
  if (formData.fulfillment_type === 'printify') {
    return !!formData.printify_sku?.trim();
  } else if (formData.fulfillment_type === 'in_house') {
    return formData.inventory_count !== undefined && formData.inventory_count !== null;
  }

  return true;
};
```

**handleMarkReadyToPublish():**
- Checks base requirements (name, price, fulfillment_type, locked_narrative_id)
- Checks fulfillment-specific requirements
- Shows alert with all missing fields
- Updates status only when all requirements met

### Form Layout

Fields appear in this order:
1. Product Name
2. SKU (general)
3. Price
4. Fulfillment Type
5. Status
6. **[Conditional] Printify SKU** (if Printify)
7. **[Conditional] Printify Variant Notes** (if Printify)
8. **[Conditional] Inventory Count** (if In-House)
9. **[Conditional] Shipping Weight** (if In-House)
10. Primary Image URL
11. Gallery Image URLs
12. Linked Narrative section

### Data Flow

```
User selects fulfillment type
    ↓
Conditional fields appear
    ↓
User fills in fields (optional for drafts)
    ↓
User clicks "Mark Ready to Publish"
    ↓
Validation checks fulfillment-specific requirements
    ↓
If Printify: checks printify_sku
If In-House: checks inventory_count
    ↓
Shows error if missing, or updates status if valid
```

### Backward Compatibility

**Existing Products:**
- Products without new fields can still be viewed/edited
- New fields show as empty/undefined
- No data loss
- Can be saved as drafts without new fields
- Must fill in new fields to mark as ready_to_publish

**Schema Migration:**
- Optional fields added to interface
- No breaking changes
- Safe for existing localStorage data

## Usage Workflow

### Creating a Printify Product

1. Create new product
2. Select "Printify" as fulfillment type
3. Fill in basic fields (name, price)
4. Fill in Printify SKU (optional for draft)
5. Add Printify Variant Notes (optional)
6. Link narrative
7. Click "Mark Ready to Publish"
8. Validation ensures Printify SKU is filled
9. Status changes to ready_to_publish

### Creating an In-House Product

1. Create new product
2. Select "In-House" as fulfillment type
3. Fill in basic fields (name, price)
4. Fill in Inventory Count (optional for draft)
5. Add Shipping Weight (optional)
6. Link narrative
7. Click "Mark Ready to Publish"
8. Validation ensures Inventory Count is filled
9. Status changes to ready_to_publish

### Validation Errors

**Printify Product Missing SKU:**
```
Cannot mark as ready to publish. Missing required fields:
Printify SKU (required for Printify fulfillment)
```

**In-House Product Missing Inventory:**
```
Cannot mark as ready to publish. Missing required fields:
Inventory count (required for in-house fulfillment)
```

## Field Specifications

### Printify SKU
- **Type:** string
- **Required:** Only for ready_to_publish status
- **Format:** Free text
- **Example:** "PRINT-MOON-RING-001"
- **Purpose:** Identifies product variant in Printify system

### Printify Variant Notes
- **Type:** string
- **Required:** No (always optional)
- **Format:** Free text
- **Example:** "Size: M, Color: Silver"
- **Purpose:** Additional variant information

### Inventory Count
- **Type:** number
- **Required:** Only for ready_to_publish status
- **Format:** Integer, minimum 0
- **Example:** 50
- **Purpose:** Tracks available stock for in-house products

### Shipping Weight (oz)
- **Type:** number
- **Required:** No (always optional)
- **Format:** Decimal, minimum 0, step 0.1
- **Example:** 2.5
- **Purpose:** Shipping calculations for in-house products

## Constraints Honored

✅ No external integrations  
✅ Minimal UI changes  
✅ Consistent with studio aesthetic  
✅ Only blocks "Ready to Publish"  
✅ Drafts can be saved without fields  
✅ Clear validation messages  
✅ Backward compatible  

## UI States

### Draft Printify Product
- Printify SKU field labeled "(optional)"
- No validation warnings
- Can save without Printify SKU
- "Mark Ready to Publish" button disabled if SKU missing

### Ready to Publish Printify Product
- Printify SKU field labeled "*" (required)
- Red warning if empty: "Required for ready to publish"
- Cannot mark ready without SKU
- Export section available when all requirements met

### Draft In-House Product
- Inventory Count field labeled "(optional)"
- No validation warnings
- Can save without inventory count
- "Mark Ready to Publish" button disabled if count missing

### Ready to Publish In-House Product
- Inventory Count field labeled "*" (required)
- Red warning if empty: "Required for ready to publish"
- Cannot mark ready without count
- Export section available when all requirements met

## Files Modified

1. **app/studio/products/page.tsx**
   - Updated Product interface with new fields
   - Added conditional field rendering
   - Updated validation logic
   - Updated form state initialization
   - Updated save logic to include new fields
   - Added inline validation warnings

## Files Created

1. **FULFILLMENT_GUARDRAILS.md** - This file

## Testing Checklist

Manual testing completed:
- [x] Create Printify product as draft (without SKU)
- [x] Save Printify draft successfully
- [x] Attempt to mark Printify product ready without SKU (blocked)
- [x] Fill in Printify SKU and mark ready (succeeds)
- [x] Create In-House product as draft (without inventory)
- [x] Save In-House draft successfully
- [x] Attempt to mark In-House product ready without inventory (blocked)
- [x] Fill in inventory count and mark ready (succeeds)
- [x] Verify conditional field display (Printify vs In-House)
- [x] Verify validation messages
- [x] Verify helper text updates dynamically
- [x] Verify backward compatibility with existing products
- [x] Verify localStorage persistence of new fields

## Example Data

### Printify Product
```json
{
  "id": "product_1738368000000",
  "name": "Lunar Devotion Ring",
  "sku": "MOON-RING-001",
  "price": "49.99",
  "fulfillment_type": "printify",
  "status": "ready_to_publish",
  "printify_sku": "PRINT-MOON-RING-001",
  "printify_variant_notes": "Size: M, Material: Sterling Silver",
  "locked_narrative_id": "narrative_1738367000000",
  "created_at": "2026-01-31T12:00:00.000Z",
  "updated_at": "2026-01-31T12:30:00.000Z"
}
```

### In-House Product
```json
{
  "id": "product_1738368100000",
  "name": "Handcrafted Moon Pendant",
  "sku": "MOON-PEND-001",
  "price": "89.99",
  "fulfillment_type": "in_house",
  "status": "ready_to_publish",
  "inventory_count": 25,
  "shipping_weight_oz": 3.2,
  "locked_narrative_id": "narrative_1738367100000",
  "created_at": "2026-01-31T13:00:00.000Z",
  "updated_at": "2026-01-31T13:30:00.000Z"
}
```

## Benefits

1. **Fulfillment Accuracy**: Ensures required data for each fulfillment method
2. **Flexible Drafting**: Allows saving incomplete drafts
3. **Clear Validation**: Shows exactly what's missing
4. **Type Safety**: Conditional fields prevent confusion
5. **Quality Control**: Blocks publishing without required data
6. **Backward Compatible**: Existing products continue to work

## Future Enhancements (Not in MVP)

- Printify API integration (auto-fill SKU)
- Inventory tracking system integration
- Shipping calculator using weight
- Bulk inventory updates
- Low stock warnings
- Printify variant selector
- Shipping cost estimation
- Fulfillment status tracking

## Conclusion

The fulfillment-specific guardrails ensure products have the necessary data for their fulfillment method before being marked as ready to publish. The implementation is minimal, non-blocking for drafts, and provides clear validation feedback.

**Status:** ✅ Complete and ready to use
