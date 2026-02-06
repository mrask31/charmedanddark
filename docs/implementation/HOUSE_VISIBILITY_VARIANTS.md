# House Visibility & Variant Support Implementation

## Summary

Successfully implemented realm-based product visibility filtering and variant support system. The House (`/shop`) now displays all products where `realm === 'house'` AND `status !== 'archive'`. Product detail pages now support optional variants with dynamic pricing, images, and availability.

---

## Changes Applied

### 1. Type System Updates (`lib/products.ts`)

**New Types Added:**
```typescript
export type ProductRealm = "house" | "uniform";
export type ProductStatus = "core" | "drop_candidate" | "hold" | "archive";

export interface ProductVariant {
  id: string;
  label: string; // e.g., "8oz", "12oz", "Matte Black"
  pricePublic: number;
  priceSanctuary: number;
  inStock: boolean;
  isDefault?: boolean;
  image?: string; // Optional variant-specific image
}
```

**Product Interface Updated:**
- Added `realm: ProductRealm` (required)
- Added `variants?: ProductVariant[]` (optional)
- Updated `status` type to include `"archive"`

**All Existing Products:**
- Added `realm: "house"` to all 13 existing products
- No variants added yet (system ready for future use)

---

### 2. Shop Page Updates (`app/shop/page.tsx`)

**Visibility Filtering:**
```typescript
// OLD: Showed all products
const filteredProducts = selectedCategory === 'All' 
  ? products 
  : products.filter(p => p.category === selectedCategory);

// NEW: Shows only House products (realm === 'house' AND status !== 'archive')
const houseProducts = getHouseProducts();
const filteredProducts = selectedCategory === 'All' 
  ? houseProducts 
  : houseProducts.filter(p => p.category === selectedCategory);
```

**What Changed:**
- Imported `getHouseProducts()` helper function
- Applied realm-based filtering BEFORE category filtering
- Category pills now filter within the House realm only
- No changes to UI, styling, or user experience

---

### 3. Product Detail Page Updates (`app/product/[slug]/page.tsx`)

**Variant Support Added:**

**State Management:**
```typescript
const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(null);

useEffect(() => {
  // Set default variant when product loads
  if (product && product.variants && product.variants.length > 0) {
    const defaultVariant = product.variants.find(v => v.isDefault) || product.variants[0];
    setSelectedVariant(defaultVariant);
  }
}, [product]);
```

**Dynamic Pricing:**
```typescript
const hasVariants = product.variants && product.variants.length > 1;
const displayPricePublic = selectedVariant ? selectedVariant.pricePublic : product.pricePublic;
const displayPriceSanctuary = selectedVariant ? selectedVariant.priceSanctuary : product.priceSanctuary;
const displayInStock = selectedVariant ? selectedVariant.inStock : product.inStock;
const displayImage = (selectedVariant?.image) || (product.images.length > 0 ? product.images[0] : null);
```

**Variant Selector UI:**
```tsx
{hasVariants && (
  <div className="product-variant-selector">
    <label className="variant-label">Select:</label>
    <div className="variant-options">
      {product.variants!.map((variant) => (
        <button
          key={variant.id}
          className={`variant-pill ${selectedVariant?.id === variant.id ? 'active' : ''}`}
          onClick={() => setSelectedVariant(variant)}
          type="button"
        >
          {variant.label}
        </button>
      ))}
    </div>
  </div>
)}
```

**Behavior:**
- Variant selector only appears if `product.variants.length > 1`
- First variant or explicitly marked default variant is selected on load
- Clicking a variant updates: price (public + sanctuary), availability, and image (if variant has one)
- Thumbnails hidden when variant has specific image
- No variants = UI unchanged (backward compatible)

---

### 4. CSS Styling (`app/globals.css`)

**Variant Selector Styles Added:**
```css
.product-variant-selector {
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 20px 0;
  border-bottom: 1px solid var(--edge-subtle);
}

.variant-pill {
  padding: 10px 20px;
  background: var(--black-elevated);
  border: 1px solid var(--edge-subtle);
  border-radius: 6px;
  /* ... transitions and hover states */
}

.variant-pill.active {
  background: rgba(180, 150, 100, 0.08);
  border-color: var(--accent-gold-edge);
  color: var(--text-accent);
  box-shadow: 0 0 8px var(--accent-gold-glow);
}
```

**Design Principles:**
- Follows existing accent reveal system (gold on interaction)
- Restrained, minimal design matching brand voice
- Accessible focus states with keyboard navigation
- Reduced motion support via `prefers-reduced-motion`
- Pills, not dropdown (more tactile, less corporate)

---

## Helper Functions Added

### `getHouseProducts()` in `lib/products.ts`
```typescript
export function getHouseProducts(): Product[] {
  return products.filter(product => 
    product.realm === 'house' && product.status !== 'archive'
  );
}
```

**Purpose:**
- Centralized House visibility logic
- Ensures consistent filtering across all pages
- Easy to update if visibility rules change

---

## Variant System Rules

### When Variants Appear:
- Product must have `variants` array with length > 1
- Single variant = treated as no variants (UI unchanged)
- No variants = UI unchanged (backward compatible)

### Variant Labels:
- Factual only: "8oz", "12oz", "16oz", "Matte Black", "Glossy Black", "Set of 3"
- NO promotional language: "Best Value", "Most Popular", "Limited Edition"
- NO variant info in product titles or ritual copy

### Variant Pricing:
- Each variant has independent `pricePublic` and `priceSanctuary`
- Sanctuary discount can vary per variant (not enforced at 10%)
- Base product price serves as fallback if no variants

### Variant Images:
- Optional `image` field per variant
- If variant has image, it replaces main product image
- If variant has no image, main product images are used
- Thumbnails hidden when variant-specific image is shown

---

## Visibility Rules

### House Products (`/shop`):
```typescript
realm === 'house' AND status !== 'archive'
```

**Included:**
- `status: "core"` - Permanent collection
- `status: "drop_candidate"` - Testing for elevation
- `status: "hold"` - Temporarily unavailable but visible

**Excluded:**
- `status: "archive"` - Removed from House
- `realm: "uniform"` - Apparel (shown on `/uniform` only)

### Category Filtering:
- Applied AFTER realm filtering
- "All" shows all House products
- Category pills filter within House realm only

---

## Backward Compatibility

### Existing Products:
- All 13 products now have `realm: "house"`
- No variants added (system ready but not used)
- All existing functionality preserved
- No breaking changes to UI or UX

### Future Products:
- Must specify `realm` (required field)
- Can optionally include `variants` array
- Variants are opt-in, not required

---

## Quality Gates Passed

✅ `npm run build` - Build successful  
✅ `npm test` - All 112 tests passing  
✅ TypeScript compilation - No errors  
✅ No hydration errors  
✅ Backward compatible with existing products  
✅ Accessible keyboard navigation  
✅ Reduced motion support  

---

## Example: Product with Variants

```typescript
{
  id: "candle-midnight",
  slug: "midnight-candle",
  name: "Midnight Candle",
  realm: "house",
  category: "Candles & Scent",
  status: "core",
  pricePublic: 32.00, // Base price (fallback)
  priceSanctuary: 28.80,
  shortDescription: "A clean-burning candle for when the noise becomes too much.",
  description: { /* ... */ },
  images: ["/images/candle-default.png"],
  inStock: true,
  variants: [
    {
      id: "candle-midnight-8oz",
      label: "8oz",
      pricePublic: 28.00,
      priceSanctuary: 25.20,
      inStock: true,
      isDefault: true
    },
    {
      id: "candle-midnight-12oz",
      label: "12oz",
      pricePublic: 32.00,
      priceSanctuary: 28.80,
      inStock: true
    },
    {
      id: "candle-midnight-16oz",
      label: "16oz",
      pricePublic: 38.00,
      priceSanctuary: 34.20,
      inStock: false
    }
  ]
}
```

**Result:**
- Variant selector appears with 3 pills: "8oz", "12oz", "16oz"
- "8oz" selected by default (marked with `isDefault: true`)
- Clicking "12oz" updates price to $32.00 / $28.80
- "16oz" shows as "Gone Quiet" when selected
- No variant info appears in product name or description

---

## What This Enables

### Immediate Benefits:
1. **Realm Separation** - House and Uniform products can coexist in same data module
2. **Archive Support** - Products can be removed from House without deletion
3. **Variant Foundation** - System ready for size/finish/set variants

### Future Capabilities:
1. **Size Variants** - Candles (8oz, 12oz, 16oz), Mugs (10oz, 12oz, 16oz)
2. **Finish Variants** - Vases (Matte Black, Glossy Black), Frames (Black, Gold)
3. **Set Variants** - Bookends (Single, Pair), Knives (3-piece, 5-piece)
4. **Material Variants** - Boards (Acacia, Walnut, Maple)

### Constraints Maintained:
- Variants NEVER appear in shop grid (only on detail page)
- Variant labels are factual only (no hype)
- No variant info in product titles or ritual copy
- Mirror eligibility is product-level, not variant-level

---

## Next Steps (Optional)

### If Adding Variants to Existing Products:
1. Add `variants` array to product in `lib/products.ts`
2. Mark one variant as `isDefault: true`
3. Ensure variant labels are factual ("8oz", not "Small")
4. Test pricing updates and image swapping
5. Verify accessibility with keyboard navigation

### If Adding New Realms:
1. Add new realm to `ProductRealm` type
2. Create helper function like `getUniformProducts()`
3. Update relevant pages to filter by new realm
4. Document visibility rules for new realm

### If Adding Archive Status:
1. Change product `status` to `"archive"`
2. Product disappears from House automatically
3. Direct links still work (404 not enforced)
4. Can be restored by changing status back

---

## Final Note

This implementation establishes the foundation for realm-based product organization and variant support without breaking existing functionality. The system is:

- **Flexible** - Variants are optional, not required
- **Restrained** - No promotional language, factual labels only
- **Accessible** - Keyboard navigation, focus states, reduced motion
- **Maintainable** - Centralized filtering logic, clear separation of concerns

The House now shows exactly what it should: objects chosen to remain.
