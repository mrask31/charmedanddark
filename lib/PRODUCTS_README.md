# Product Data Foundation

## Overview

This module serves as the single source of truth for product data in the Charmed & Dark store until Shopify integration is implemented. It provides a clean, type-safe TypeScript foundation for product listings, detail pages, and future Drops functionality.

## File Structure

```
lib/
├── products.ts              # Main product data module
├── __tests__/
│   └── products.test.ts     # Comprehensive test suite
└── PRODUCTS_README.md       # This file
```

## Type Definitions

### ProductStatus
```typescript
type ProductStatus = "core" | "drop_candidate" | "hold";
```
- **core**: Main catalog items (majority of products)
- **drop_candidate**: Products being considered for limited drops
- **hold**: Products temporarily unavailable

### ProductCategory
```typescript
type ProductCategory =
  | "Candles & Scent"
  | "Ritual Drinkware"
  | "Wall Objects"
  | "Decor Objects"
  | "Table & Display"
  | "Objects of Use";
```

### ProductDescription
```typescript
interface ProductDescription {
  ritualIntro: string;        // 2-3 calm, poetic lines
  objectDetails: string[];    // Factual bullets (material, size, care)
  whoFor: string;             // One quiet identity line
}
```

### Product
```typescript
interface Product {
  id: string;                 // Unique identifier
  slug: string;               // URL-safe slug
  name: string;               // Product name
  category: ProductCategory;  // Product category
  status: ProductStatus;      // Product status
  pricePublic: number;        // Public price
  priceSanctuary: number;     // Sanctuary member price (10% off)
  shortDescription: string;   // Brief description for listings
  description: ProductDescription; // Full product description
  images: string[];           // Array of image URLs
  inStock: boolean;           // Availability status
}
```

## Helper Functions

### getProductBySlug(slug: string)
Returns a single product by its slug, or `undefined` if not found.

```typescript
const product = getProductBySlug('midnight-ritual-candle');
```

### getProductsByCategory(category: ProductCategory)
Returns all products in a specific category.

```typescript
const candles = getProductsByCategory('Candles & Scent');
```

### getCoreProducts()
Returns all products with status "core" (excludes drop candidates and holds).

```typescript
const coreProducts = getCoreProducts();
```

### getInStockProducts()
Returns all products currently in stock.

```typescript
const available = getInStockProducts();
```

### getCategoriesWithCounts()
Returns all categories with their product counts.

```typescript
const categories = getCategoriesWithCounts();
// [{ category: "Candles & Scent", count: 2 }, ...]
```

### searchProducts(query: string)
Searches products by name, description, ritual intro, or "who for" text.

```typescript
const results = searchProducts('ritual');
```

## Brand Voice Guidelines

All product copy follows the Charmed & Dark brand voice:

### Structure
1. **Ritual Intro**: 2-3 calm, poetic lines that set the tone
2. **Object Details**: Clear factual bullets (material, size, capacity, care)
3. **Who This Is For**: One quiet identity line

### Tone Rules
- ✅ Elegant, restrained, adult gothic
- ✅ Clarity + atmosphere balance
- ✅ Calm, intentional language
- ❌ No emojis
- ❌ No hype or marketing clichés
- ❌ No excessive metaphors
- ❌ No exclamation marks

### "Who This Is For" Examples
- "For those who prefer stillness over spectacle."
- "For those drawn to meaning beneath the surface."
- "For those who curate with intention."
- "For those who practice clearing rituals."
- "For those who host with presence."

## Pricing

- **Public Price**: Standard retail price
- **Sanctuary Price**: 10% discount for Sanctuary members (automatically calculated)

Example:
```typescript
pricePublic: 32.00
priceSanctuary: 28.80  // Calculated: 32.00 * 0.9
```

## Current Product Catalog

### Candles & Scent (2 products)
- Midnight Ritual Candle
- Three Star Candle

### Table & Display (4 products)
- Obsidian Trinket Dish
- Reflection Tabletop Mirror
- Ritual Charcuterie Board
- Two-Tier Display Tray

### Decor Objects (3 products)
- Skull Bookends (Pair)
- Black Ceramic Vase
- Red Heart Vase

### Wall Objects (1 product)
- Black & Gold Stars Wall Art

### Objects of Use (2 products)
- Ritual Sage Bundle
- Ritual Cheese Knives (Set of 3)

### Ritual Drinkware (1 product)
- Black Ceramic Ritual Mug

**Total: 13 core products**

## Usage Examples

### Shop Listing Page
```typescript
import { getCoreProducts, getCategoriesWithCounts } from '@/lib/products';

export default function ShopPage() {
  const products = getCoreProducts();
  const categories = getCategoriesWithCounts();
  
  return (
    <div>
      {/* Render products */}
    </div>
  );
}
```

### Product Detail Page
```typescript
import { getProductBySlug } from '@/lib/products';

export default function ProductPage({ params }: { params: { slug: string } }) {
  const product = getProductBySlug(params.slug);
  
  if (!product) {
    return <div>Product not found</div>;
  }
  
  return (
    <div>
      <h1>{product.name}</h1>
      <p>{product.description.ritualIntro}</p>
      {/* Render product details */}
    </div>
  );
}
```

### Category Filter
```typescript
import { getProductsByCategory } from '@/lib/products';

export default function CategoryPage({ category }: { category: ProductCategory }) {
  const products = getProductsByCategory(category);
  
  return (
    <div>
      {products.map(product => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
}
```

## Testing

Run the test suite:
```bash
npm test -- lib/__tests__/products.test.ts
```

**Test Coverage:**
- ✅ 30 tests passing
- ✅ Data integrity validation
- ✅ Helper function correctness
- ✅ Brand voice compliance
- ✅ Pricing calculations
- ✅ Slug formatting

## Future Integration

This module is designed to be easily replaced or augmented when Shopify integration is implemented:

1. **Phase 1 (Current)**: Static product data in TypeScript
2. **Phase 2 (Future)**: Shopify API integration
3. **Phase 3 (Future)**: Real-time inventory sync

The type definitions and helper functions will remain consistent, making the transition seamless.

## Adding New Products

To add a new product:

1. Add the product object to the `products` array in `lib/products.ts`
2. Follow the brand voice guidelines for copy
3. Ensure all required fields are populated
4. Calculate Sanctuary pricing using `calculateSanctuaryPrice()`
5. Create a slug using `createSlug()`
6. Run tests to validate: `npm test -- lib/__tests__/products.test.ts`

Example:
```typescript
{
  id: "new-product-id",
  slug: createSlug("New Product Name"),
  name: "New Product Name",
  category: "Candles & Scent",
  status: "core",
  pricePublic: 40.00,
  priceSanctuary: calculateSanctuaryPrice(40.00),
  shortDescription: "Brief description for listings.",
  description: {
    ritualIntro: "Calm, poetic intro. Two to three lines.",
    objectDetails: [
      "Material information",
      "Size: X inches",
      "Care instructions"
    ],
    whoFor: "For those who [identity statement]."
  },
  images: ["/images/product-image.png"],
  inStock: true
}
```

## Notes

- All prices are in USD
- Images are stored in `/public/images/`
- Slugs are automatically generated from product names
- Sanctuary pricing is automatically calculated (10% off)
- All products are currently marked as "core" status
- All products are currently in stock

## Status

✅ **Complete and Production-Ready**

- TypeScript types defined
- 13 core products populated
- All helper functions implemented
- Comprehensive test suite (30 tests passing)
- Brand voice compliant
- Ready for shop/product page integration
