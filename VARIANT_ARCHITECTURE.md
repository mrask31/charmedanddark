# Variant Architecture

## Overview
The variant system enables parent products to contain multiple variants (colors, styles, sizes) with individual SKUs, prices, stock levels, and image mappings.

## Database Schema

### Migration 008: Add Variants
Location: `supabase/migrations/008_add_variants.sql`

**New Columns:**
- `variants` (JSONB) - Array of variant objects
- `is_variant_parent` (BOOLEAN) - Flag for products with variants

**Variant Structure:**
```json
[
  {
    "id": "v1",
    "name": "Moth",
    "sku": "IT84018CN",
    "price": 39,
    "house_price": 35,
    "stock_quantity": 10,
    "image_indices": [0, 1],
    "options": {
      "color": "Black",
      "style": "Moth"
    }
  }
]
```

## Frontend Components

### VariantSelector Component
Location: `components/VariantSelector.tsx`

**Features:**
- Ghost button style (brutalist aesthetic)
- Selected state (dark background)
- Out of stock state (disabled, faded)
- No native dropdowns

**Usage:**
```tsx
<VariantSelector
  variants={product.variants}
  selectedVariantId={selectedVariantId}
  onVariantChange={setSelectedVariantId}
/>
```

### Product Page Integration
Location: `app/product/[handle]/page.tsx`

**Variant Logic:**
1. Auto-selects first variant on page load
2. Updates price display when variant changes
3. Maps variant image_indices to gallery images
4. Swaps main gallery when variant selected
5. Passes variant data to cart on "Add to House"

## Image-to-Variant Mapping

### How It Works
Each variant has an `image_indices` array that maps to positions in the product's `images` array.

**Example:**
```json
{
  "images": [
    {"url": "https://.../product-1.jpg", "position": 0},
    {"url": "https://.../product-2.jpg", "position": 1},
    {"url": "https://.../product-3.jpg", "position": 2},
    {"url": "https://.../product-4.jpg", "position": 3}
  ],
  "variants": [
    {
      "id": "v1",
      "name": "Moth",
      "image_indices": [0, 1]  // Shows images 1 & 2
    },
    {
      "id": "v2",
      "name": "Dragon",
      "image_indices": [2, 3]  // Shows images 3 & 4
    }
  ]
}
```

When user selects "Dragon" variant:
- Gallery updates to show only images at indices [2, 3]
- Main image becomes the first image in that subset
- Thumbnails show only variant-specific images

## Cart State Management

### Cart Context
Location: `lib/cart/context.tsx`

**Features:**
- localStorage persistence
- Variant-aware cart items
- Quantity management
- Total calculations

**Cart Item Structure:**
```typescript
{
  productId: string;
  productHandle: string;
  productTitle: string;
  variantId: string | null;      // Null for non-variant products
  variantName: string | null;    // e.g., "Moth"
  sku: string | null;            // e.g., "IT84018CN"
  price: number;                 // Base price
  housePrice: number;            // Discounted price
  quantity: number;
  image: string;                 // First image URL
}
```

**Cart Operations:**
```typescript
const { addItem, removeItem, updateQuantity, clearCart, totalItems, totalPrice } = useCart();

// Add variant to cart
addItem({
  productId: "123",
  variantId: "v1",
  variantName: "Moth",
  sku: "IT84018CN",
  // ...
});
```

## Creating Variant Products

### Option 1: Manual Database Insert
```sql
INSERT INTO products (
  handle,
  title,
  description,
  base_price,
  house_price,
  stock_quantity,
  category,
  is_variant_parent,
  variants,
  images
) VALUES (
  'arcane-kisslock-bag-collection',
  'Arcane Kisslock Bag Collection',
  'Choose your mystical companion',
  39,
  35,
  0,  -- Parent has no stock
  'Accessories',
  true,
  '[
    {
      "id": "v1",
      "name": "Moth",
      "sku": "IT84018CN-MOTH",
      "price": 39,
      "house_price": 35,
      "stock_quantity": 10,
      "image_indices": [0, 1],
      "options": {"style": "Moth"}
    },
    {
      "id": "v2",
      "name": "Dragon",
      "sku": "IT84018CN-DRAGON",
      "price": 39,
      "house_price": 35,
      "stock_quantity": 8,
      "image_indices": [2, 3],
      "options": {"style": "Dragon"}
    }
  ]'::jsonb,
  '[
    {"url": "https://.../moth-1.jpg", "position": 0},
    {"url": "https://.../moth-2.jpg", "position": 1},
    {"url": "https://.../dragon-1.jpg", "position": 2},
    {"url": "https://.../dragon-2.jpg", "position": 3}
  ]'::jsonb
);
```

### Option 2: Google Sheets Sync (Future)
Add columns to Google Sheets:
- `is_variant_parent` (TRUE/FALSE)
- `variants_json` (JSON string)

Update sync script to parse and insert variant data.

## UI Behavior

### Non-Variant Products
- No variant selector shown
- Single price display
- "Add to House" adds parent product

### Variant Products
- Variant selector appears below price
- First variant auto-selected
- Price updates on variant change
- Gallery images swap on variant change
- "Add to House" adds specific variant with SKU

### Out of Stock Variants
- Button disabled and faded
- Shows "Out of Stock" label
- Cannot be selected
- Other variants remain selectable

## Stock Management

### Parent vs Variant Stock
- Parent product `stock_quantity` ignored if `is_variant_parent = true`
- Each variant has independent `stock_quantity`
- Product shows "Out of Stock" only if ALL variants are out of stock

### Checking Availability
```typescript
const hasVariants = product.is_variant_parent && product.variants?.length > 0;

const inStock = hasVariants
  ? product.variants.some(v => v.stock_quantity > 0)
  : product.stock_quantity > 0;
```

## Pricing Logic

### Variant Pricing
- Each variant can have unique `price` and `house_price`
- Display updates when variant selected
- Cart stores variant-specific pricing

### Fallback Behavior
- If variant missing `house_price`, calculate from `price` × 0.9
- If variant missing `price`, use parent `base_price`

## Testing Checklist

- [ ] Run migration 008 in Supabase
- [ ] Create test product with 2-3 variants
- [ ] Add variant-specific images with `image_indices`
- [ ] Visit product page, verify variant selector appears
- [ ] Click each variant, verify:
  - [ ] Price updates
  - [ ] Gallery images swap
  - [ ] Stock status correct
- [ ] Add variant to cart
- [ ] Check localStorage for cart data
- [ ] Verify SKU and variant name in cart item

## Future Enhancements

### Variant Options UI
For products with multiple option types (color + size):
```typescript
{
  "options": {
    "color": "Black",
    "size": "Large",
    "style": "Moth"
  }
}
```

Could render as separate selectors:
- Color: [Black] [White] [Gray]
- Size: [Small] [Medium] [Large]
- Style: [Moth] [Dragon] [Mushroom]

### Variant Images in Darkroom
Update Darkroom CSV to support variant image mapping:
```csv
product_handle,variant_id,variant_name,image_1,image_2
arcane-bag,v1,Moth,https://.../moth1.jpg,https://.../moth2.jpg
arcane-bag,v2,Dragon,https://.../dragon1.jpg,https://.../dragon2.jpg
```

### Inventory Sync
Sync variant stock levels from external inventory system or Google Sheets.

## Migration Path

### Existing Products → Variants
To convert existing products to variants:

1. Create parent product with `is_variant_parent = true`
2. Move existing products to `variants` array
3. Update handles to point to parent
4. Map images to variant indices
5. Archive old individual products

### Example Conversion
**Before:**
- `celestial-moth-bag` (individual product)
- `celestial-dragon-bag` (individual product)

**After:**
- `celestial-kisslock-collection` (parent)
  - Variant: Moth
  - Variant: Dragon
