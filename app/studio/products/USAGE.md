# Product Catalog Studio - Usage Guide

## Quick Start

1. Navigate to `/studio/products` in your browser
2. Click "Create Product" to add your first product
3. Fill in the required fields (name and price)
4. Click "Create Product" to save

## Creating Products

### Required Information
- **Product Name**: The display name for your product
- **Price**: Product price (can be formatted as "49.99" or "$49.99")

### Recommended Information
- **SKU**: Stock keeping unit for inventory tracking (e.g., "MOON-RING-001")

### Optional Information
- **Fulfillment Type**: Choose between:
  - `printify` - Products fulfilled through Printify
  - `in_house` - Products fulfilled in-house
- **Status**: Choose between:
  - `draft` - Product is still being prepared
  - `ready_to_publish` - Product is ready to go live
- **Primary Image URL**: Main product image (must be a valid URL)
- **Gallery Image URLs**: Additional product images (one URL per line)

## Editing Products

1. Find the product in the list
2. Click the "Edit" button
3. Modify any fields
4. Click "Save Changes" to update

Changes are saved immediately to localStorage.

## Product List

The product list shows:
- **Thumbnail**: Primary image (or placeholder if none)
- **Product Name**: Main identifier
- **SKU**: If provided
- **Price**: As entered
- **Fulfillment Type**: printify or in_house
- **Status Badge**: Color-coded (green = ready, orange = draft)
- **Timestamps**: Created and last updated dates

## Image URLs

### Primary Image
Enter a single URL pointing to the main product image:
```
https://example.com/products/moon-ring.jpg
```

### Gallery Images
Enter multiple URLs, one per line:
```
https://example.com/products/moon-ring-front.jpg
https://example.com/products/moon-ring-side.jpg
https://example.com/products/moon-ring-detail.jpg
```

Images must be publicly accessible URLs. The system does not upload or host images.

## Data Persistence

- Products are saved to browser localStorage
- Data persists across page reloads
- Data is local to your browser only
- Clearing browser data will remove all products
- No cloud sync or backup

## Price Formatting

The price field accepts flexible formats:
- `49.99` - Numeric format
- `$49.99` - With currency symbol
- `49` - Whole numbers
- Any string format you prefer

The system stores exactly what you enter.

## Status Workflow

Typical workflow:
1. Create product with status = `draft`
2. Add all product details (images, SKU, etc.)
3. Review and finalize
4. Change status to `ready_to_publish`

Status is purely organizational - it doesn't trigger any automated actions.

## Tips

### SKU Naming
Use a consistent format for SKUs:
- `{SYMBOL}-{TYPE}-{NUMBER}` (e.g., "MOON-RING-001")
- `{COLLECTION}-{ITEM}` (e.g., "LUNAR-DEVOTION-RING")

### Image Management
- Use a consistent image hosting service
- Keep URLs organized (e.g., all in one folder)
- Use descriptive filenames
- Consider image dimensions for consistency

### Status Management
- Use `draft` for products in development
- Use `ready_to_publish` for finalized products
- Review all `ready_to_publish` products before actual publishing

## Limitations

- No product deletion (MVP constraint)
- No search or filtering (MVP constraint)
- No bulk operations (MVP constraint)
- No image upload (URL-based only)
- No data export (MVP constraint)
- No undo/redo functionality

## Example Product

```json
{
  "id": "product_1738368000000",
  "name": "Lunar Devotion Ring",
  "sku": "MOON-RING-001",
  "price": "49.99",
  "fulfillment_type": "printify",
  "status": "ready_to_publish",
  "primary_image_url": "https://cdn.example.com/products/moon-ring.jpg",
  "gallery_image_urls": [
    "https://cdn.example.com/products/moon-ring-1.jpg",
    "https://cdn.example.com/products/moon-ring-2.jpg",
    "https://cdn.example.com/products/moon-ring-3.jpg"
  ],
  "created_at": "2026-01-31T12:00:00.000Z",
  "updated_at": "2026-01-31T12:00:00.000Z"
}
```

## Troubleshooting

### Products not saving
- Check browser console for errors
- Ensure localStorage is enabled
- Try a different browser

### Images not displaying
- Verify URLs are publicly accessible
- Check for HTTPS (some browsers block HTTP images)
- Ensure URLs are complete and valid

### Form validation errors
- Product name cannot be empty
- Price must be provided
- All other fields are optional
