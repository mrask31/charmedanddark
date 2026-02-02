# Launch Board

Internal dashboard for tracking product launch readiness across the entire catalog.

## Overview

The Launch Board provides a real-time operational overview of all products, automatically categorizing them by readiness status and highlighting blocking issues. This read-only dashboard helps you understand what's ready to launch, what's blocked, and what needs attention.

## Features

### Summary Statistics
Four key metrics displayed at the top:
- **Total Products**: All products in catalog
- **Ready to Publish**: Products meeting all requirements
- **Blocked**: Products with issues preventing publication
- **Drafts**: Work-in-progress products

### Product Sections

**✅ Ready to Publish**
- Green section
- Products that meet all requirements
- Status is "ready_to_publish"
- No blocking issues
- Ready for launch

**⚠️ Blocked**
- Red section
- Products with issues preventing publication
- Inline diagnostics showing specific problems
- Click to fix issues

**📝 Drafts**
- Orange section
- Work-in-progress products
- No blocking issues yet
- Complete and mark ready when done

### Readiness Diagnostics

For blocked products, the dashboard shows specific issues:
- "Product name missing"
- "Price not set"
- "Missing locked narrative"
- "Printify SKU missing" (for Printify products)
- "Inventory count missing" (for In-House products)

Diagnostics are:
- **Deterministic**: Same product = same diagnostics
- **Human-readable**: Clear, actionable messages
- **Ordered**: Most important issues first
- **Inline**: Displayed directly under product card

### Launch Snapshot Export

Click "Copy Launch Snapshot" to export a JSON summary containing:
- Timestamp
- Product counts (total, ready, blocked, drafts)
- List of ready products (id, name, sku, fulfillment type)
- List of blocked products (id, name, diagnostics)

Use this for:
- Internal tracking
- Launch planning
- Progress monitoring
- Team communication

## Usage

### Viewing Launch Readiness

1. Navigate to `/studio/launch`
2. Review summary statistics
3. Scroll through sections to see product status
4. Click any product to edit and fix issues

### Understanding Blocked Products

1. Find product in "Blocked" section
2. Read the diagnostics panel (red background)
3. Note specific issues listed
4. Click "Fix →" to navigate to product edit
5. Address the issues
6. Return to Launch Board to verify

### Exporting Snapshot

1. Click "Copy Launch Snapshot" button
2. JSON is copied to clipboard
3. Paste into your tracking document
4. Review counts and blocked products
5. Use for launch planning and team updates

## Blocking Criteria

A product is considered "Blocked" if it's missing:

**Base Requirements:**
- Product name
- Price
- Locked narrative

**Printify Products:**
- Printify SKU

**In-House Products:**
- Inventory count

## Navigation

- Click any product card to navigate to product edit
- Products open in Product Catalog with edit mode
- Fix issues and return to Launch Board
- Dashboard updates automatically on reload

## Data Source

- Reads from `product_catalog` localStorage
- No write operations (read-only)
- Real-time view of current product state
- Refresh page to see latest changes

## Example Snapshot

```json
{
  "timestamp": "2026-01-31T12:00:00.000Z",
  "total_products": 10,
  "ready_to_publish_count": 7,
  "blocked_count": 2,
  "draft_count": 1,
  "ready_products": [
    {
      "id": "product_123",
      "name": "Lunar Devotion Ring",
      "sku": "MOON-RING-001",
      "fulfillment_type": "printify"
    }
  ],
  "blocked_products": [
    {
      "id": "product_456",
      "name": "Rose Pendant",
      "diagnostics": [
        "Missing locked narrative",
        "Printify SKU missing"
      ]
    }
  ]
}
```

## Tips

- **Check regularly**: Review Launch Board before launch planning
- **Fix blockers first**: Address blocked products before drafts
- **Export snapshots**: Track progress over time
- **Use diagnostics**: Clear guidance on what needs fixing
- **Click to fix**: Quick navigation to product edit

## Constraints

- Read-only dashboard (no editing here)
- No new storage structures
- Informational only (non-blocking)
- Requires products in Product Catalog

## Integration

Works seamlessly with:
- **Product Catalog** (`/studio/products`) - Click to edit
- **Narrative Studio** (`/studio/narrative`) - Checks for linked narratives
- **External Tools** - Export snapshot for tracking
