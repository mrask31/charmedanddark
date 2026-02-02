# Product Catalog Studio

Internal tool for managing product records locally.

## Overview

The Product Catalog Studio provides a simple interface for creating and managing product records without requiring authentication, database connections, or ecommerce integrations. All data is stored locally in the browser using localStorage.

## Features

### Product Management
- Create new products
- Edit existing products
- View product list with thumbnails
- Local persistence (survives page reloads)

### Product Fields

**Required:**
- **Name**: Product name
- **Price**: Product price (string or number format)
- **Fulfillment Type**: `printify` or `in_house`
- **Status**: `draft` or `ready_to_publish`

**Optional:**
- **SKU**: Stock keeping unit (recommended for inventory tracking)
- **Primary Image URL**: Main product image
- **Gallery Image URLs**: Additional product images (one URL per line)
- **Linked Narrative**: Connect to a locked narrative from Narrative Studio

### Data Structure

Each product record includes:
```typescript
{
  id: string;              // Auto-generated timestamp-based ID
  name: string;            // Product name
  sku?: string;            // Optional SKU
  price: string | number;  // Product price
  fulfillment_type: 'printify' | 'in_house';
  status: 'draft' | 'ready_to_publish';
  primary_image_url?: string;
  gallery_image_urls?: string[];
  locked_narrative_id?: string;  // Link to locked narrative
  created_at: string;      // ISO timestamp
  updated_at: string;      // ISO timestamp
}
```

## Narrative Linking

Products can be linked to locked narratives from the Narrative Studio. This creates a connection between product records and their finalized brand copy.

### Linking a Narrative

1. In the product create/edit form, scroll to "Linked Narrative" section
2. Select a locked narrative from the dropdown
3. Review the narrative preview (all 6 sections displayed)
4. Click "Open Narrative →" to view full details in Narrative Studio (optional)
5. Save the product

### Narrative Preview

When a narrative is linked, you'll see:
- Short Description
- Long Ritual Description
- Ritual Intention Prompt
- Care & Use Note
- Alt Text
- One-Line Drop Tagline

Long sections are truncated with "Show more/less" toggles for easier scanning.

### Narrative Badge

Products with linked narratives show a blue "Narrative Linked" badge in the product list view, making it easy to identify which products have finalized copy.

### Unlinking

To unlink a narrative, select "None" from the dropdown and save the product.

## Publish Pack Export

Products that are ready to publish with linked narratives can be exported as complete "Publish Packs" containing all product and narrative content.

### Requirements for Export

To export a Publish Pack, the product must:
1. Have a linked locked narrative
2. Be marked as "ready_to_publish"

### Mark Ready to Publish

Before exporting, products must be validated and marked as ready:

1. Fill in all required fields:
   - Product name
   - Price
   - Fulfillment type
   - Linked narrative
2. Click "Mark Ready to Publish" button
3. Status changes to "ready_to_publish"
4. Export section becomes available

If requirements are not met, the button will be disabled with a helper message showing what's missing.

### Export Formats

**Markdown (Product Page Ready):**
- Formatted for direct use on product pages
- Includes all product details and narrative sections
- Clean, readable structure
- Image URLs listed

**JSON (Structured Data):**
- Machine-readable format
- Organized into product, narrative, and images sections
- Easy integration with external systems
- Null values for optional fields

### Export Content

Each Publish Pack includes:
- Product name, SKU, price, fulfillment type
- All 6 narrative sections (from locked narrative)
- Primary image URL
- Gallery image URLs

### Usage

1. Ensure product is marked "ready_to_publish"
2. Export section appears with green background
3. Click "Copy Markdown" or "Copy JSON"
4. Content copied to clipboard
5. Paste into target system

## Usage

### Creating a Product

1. Click "Create Product"
2. Fill in required fields (name, price)
3. Optionally add SKU, images, and set fulfillment/status
4. Click "Create Product" to save

### Editing a Product

1. Click "Edit" on any product in the list
2. Modify fields as needed
3. Click "Save Changes" to update

### Image URLs

- **Primary Image**: Single URL for the main product image
- **Gallery Images**: Multiple URLs, one per line in the textarea

Images are displayed as thumbnails in the product list.

## Persistence

Products are stored in localStorage under the key `product_catalog`. Data persists across page reloads but is local to the browser. Clearing browser data will remove all products.

## Constraints

- No authentication required
- No database connection
- No external API calls
- No ecommerce integration
- Client-side only (React state + localStorage)

## Styling

Consistent with existing studio pages:
- Clean black (#0A0A0A) and white aesthetic
- Generous spacing (48px sections, 24px elements)
- Minimal, professional design
- No emojis or trendy language

## Future Enhancements

Potential additions (not in MVP):
- Product deletion
- Bulk import/export
- Search and filtering
- Image upload (currently URL-based only)
- Product duplication
- Sorting options
