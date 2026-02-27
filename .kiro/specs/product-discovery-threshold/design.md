# Product Discovery Threshold - Design Document

## Overview

The Product Discovery Threshold feature transforms the `/shop` and `/uniform` routes into curated, gallery-like product browsing experiences. This design prioritizes visual presentation with strict density controls (5-7 products per viewport, maximum 4 per row), generous whitespace, and integration with the existing Accent Reveal System. The feature explicitly rejects common e-commerce patterns like infinite scrolling and pagination in favor of a focused, threshold-based discovery experience that aligns with the project's "everyday gothic" aesthetic.

### Design Philosophy

This feature embodies a deliberate constraint: showing fewer products, better. By limiting viewport density and enforcing generous spacing, we create a browsing experience that encourages thoughtful consideration rather than overwhelming choice. The threshold concept means users see a curated selection that fits naturally within their viewport, creating a sense of completeness rather than endless scrolling.

### Key Design Decisions

1. **Fixed Density Over Infinite Scroll**: The 5-7 product viewport limit creates natural boundaries and prevents decision fatigue
2. **Image-Dominant Layout**: Product imagery takes precedence over text, with minimal metadata displayed
3. **Accent Reveal Integration**: Hover states use deep red for standard items and deep purple for featured items, maintaining consistency with existing interaction patterns
4. **Responsive Adaptation**: Grid columns reduce gracefully (4 → 3 → 2 → 1) while maintaining density constraints across all viewport sizes

## Architecture

### Component Structure

```
/shop or /uniform route
└── ProductDiscoveryGrid (new component)
    ├── DensityController (manages 5-7 viewport constraint)
    ├── AccentRevealProvider (integrates with existing system)
    └── ProductCard[] (enhanced with accent reveal)
        ├── ProductImage (with hover state management)
        ├── ProductMetadata (minimal text)
        └── AccentBorder (deep red or deep purple)
```

### Data Flow

```
Route Page (Server Component)
    │
    ├─► Fetch products from Inventory System
    │   ├─► Supabase: SELECT * FROM products
    │   └─► Transform to UnifiedProduct[]
    │
    └─► Pass to ProductDiscoveryGrid (Client Component)
        │
        ├─► DensityController calculates viewport capacity
        │   └─► Determines how many products to display (5-7)
        │
        └─► Render ProductCard[] with AccentReveal
            ├─► Standard products: deep red hover
            └─► Featured products: deep purple hover
```

### Integration Points

1. **Inventory System**: Consumes `UnifiedProduct[]` from existing `lib/products.ts`
2. **Accent Reveal System**: Extends existing hover interaction patterns from `ProductCard.tsx`
3. **Visual System**: Adheres to spacing constraints, typography, and color palette from `VISUAL_GUIDE.md`
4. **Authentication**: Integrates with existing Supabase auth for pricing display (House vs Standard)

## Components and Interfaces

### ProductDiscoveryGrid Component

**Purpose**: Main container component that enforces density constraints and manages grid layout.

**Props**:
```typescript
interface ProductDiscoveryGridProps {
  products: UnifiedProduct[];
  route: 'shop' | 'uniform';
  maxItemsPerRow?: number; // default: 4
  minViewportItems?: number; // default: 5
  maxViewportItems?: number; // default: 7
}
```

**Responsibilities**:
- Calculate viewport height and determine product count to display
- Enforce maximum 4 items per row constraint
- Maintain 5-7 products per viewport density
- Apply responsive grid layout (4 → 3 → 2 → 1 columns)
- Integrate with AccentRevealProvider

**State Management**:
```typescript
interface GridState {
  viewportHeight: number;
  itemsToDisplay: number; // calculated: 5-7
  columnsPerRow: number; // responsive: 1-4
  isRecognized: boolean; // auth state
}
```

### DensityController Utility

**Purpose**: Calculates how many products should be displayed based on viewport dimensions.

**Interface**:
```typescript
interface DensityCalculation {
  viewportHeight: number;
  itemHeight: number; // estimated card height
  rowGap: number; // spacing between rows
  itemsPerRow: number; // current responsive column count
  recommendedCount: number; // 5-7 range
}

function calculateDensity(
  viewportHeight: number,
  itemsPerRow: number,
  spacing: SpacingConfig
): DensityCalculation;
```

**Algorithm**:
1. Measure viewport height
2. Calculate estimated card height (image aspect ratio 4:5 + metadata height)
3. Determine how many complete rows fit in viewport
4. Multiply rows × itemsPerRow
5. Clamp result to 5-7 range
6. Return recommended product count

### AccentRevealCard Component

**Purpose**: Enhanced ProductCard with accent reveal hover states.

**Props**:
```typescript
interface AccentRevealCardProps {
  product: UnifiedProduct;
  isRecognized: boolean;
  isFeatured: boolean; // determines accent color
  accentColor: 'deep-red' | 'deep-purple';
}
```

**Hover Behavior**:
- Default state: 1px border `#e8e8e3` (off-white-dim)
- Hover state (standard): 2px border `#8B0000` (deep red)
- Hover state (featured): 2px border `#4B0082` (deep purple)
- Transition: 200ms ease for border changes
- Image swap: hero.jpg → hover.jpg (if available)

### SpacingConfig Interface

**Purpose**: Centralized spacing configuration aligned with Visual System.

```typescript
interface SpacingConfig {
  gridGap: string; // gap between cards
  cardPadding: string; // internal card padding
  containerPadding: string; // grid container padding
  minWhitespace: string; // minimum space between elements
}

const DISCOVERY_SPACING: SpacingConfig = {
  gridGap: '2rem', // 32px - generous spacing
  cardPadding: '1rem', // 16px - internal card padding
  containerPadding: '3rem', // 48px - container edges
  minWhitespace: '1.5rem', // 24px - minimum between elements
};
```

## Data Models

### UnifiedProduct (Existing)

The feature consumes the existing `UnifiedProduct` interface from `lib/products.ts`:

```typescript
interface UnifiedProduct {
  id: string;
  handle: string;
  title: string;
  description: string;
  price: number;
  source: 'shopify' | 'supabase';
  category?: string;
  images: {
    hero: string;
    front?: string;
    hover?: string;
    all?: string[];
  };
  inStock: boolean;
}
```

### FeaturedProduct Extension

**Purpose**: Identify products that should receive deep purple accent treatment.

```typescript
interface FeaturedProductMetadata {
  productId: string;
  isFeatured: boolean;
  featuredUntil?: Date; // optional expiration
  featuredReason?: string; // e.g., "new-arrival", "seasonal"
}
```

**Storage**: Add `is_featured` boolean column to Supabase `products` table.

**Query Enhancement**:
```sql
SELECT 
  id, handle, title, description, price, 
  category, images, stock_quantity,
  is_featured, featured_until
FROM products
WHERE stock_quantity > 0
ORDER BY is_featured DESC, title ASC;
```

### ViewportDensityMetrics

**Purpose**: Track density calculations for responsive behavior.

```typescript
interface ViewportDensityMetrics {
  viewportWidth: number;
  viewportHeight: number;
  columnsPerRow: number; // 1-4
  estimatedRowCount: number;
  targetProductCount: number; // 5-7
  actualProductCount: number; // may be less if inventory limited
}
```

## Correctness Properties


*A property is a characteristic or behavior that should hold true across all valid executions of a system—essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

### Property 1: Maximum Row Density Constraint

*For any* viewport width and product inventory, when the Product_Grid renders, no row shall contain more than 4 product items.

**Validates: Requirements 1.3, 2.1**

### Property 2: Viewport Density Range

*For any* viewport dimensions and product inventory with at least 7 items, the Product_Grid shall display between 5 and 7 products (inclusive) within the visible viewport area.

**Validates: Requirements 1.4, 2.2, 2.3, 6.2**

### Property 3: Accent Reveal Color Mapping

*For any* product item, when a hover event occurs, the displayed accent color shall be deep red (#8B0000) if the product is not featured, and deep purple (#4B0082) if the product is featured.

**Validates: Requirements 3.1, 3.2**

### Property 4: Visual System Spacing Compliance

*For any* viewport size, all spacing values (grid gap, card padding, container padding) shall match the defined Visual_System constraints within a 1px tolerance.

**Validates: Requirements 4.1, 6.4**

### Property 5: Inventory Data Accuracy

*For any* product displayed in the grid, the displayed title, price, and featured status shall exactly match the corresponding values in the Inventory_System source data.

**Validates: Requirements 5.3, 5.4**

### Property 6: Responsive Column Reduction

*For any* sequence of decreasing viewport widths, the number of columns per row shall either decrease or remain constant, and shall never exceed 4.

**Validates: Requirements 6.1**

### Property 7: Touch Device Accent Reveal

*For any* touch-enabled device, when a touch event occurs on a product item, the accent reveal behavior (color change) shall be triggered identically to hover events on pointer devices.

**Validates: Requirements 6.5**

### Property 8: Primary Image Display

*For any* product item in the grid, a primary product image shall be displayed, either from the product's image data or as a fallback placeholder if image loading fails.

**Validates: Requirements 7.1, 7.4**

### Property 9: Image Aspect Ratio Consistency

*For any* set of product images displayed in the grid, all images shall maintain a 4:5 aspect ratio (width:height) as defined in the Visual_System specification.

**Validates: Requirements 7.3**

## Error Handling

### Image Loading Failures

**Scenario**: Product image fails to load from CDN or local storage.

**Handling Strategy**:
1. Detect image load error via `onError` event handler
2. Set component state to trigger fallback rendering
3. Display placeholder with product title and "No Image" indicator
4. Log error to console for debugging (non-blocking)
5. Maintain card layout and spacing (no layout shift)

**Implementation**:
```typescript
const [imageError, setImageError] = useState(false);

<Image
  src={displayImage}
  alt={product.title}
  onError={() => {
    console.error(`Image load failed: ${displayImage}`);
    setImageError(true);
  }}
/>

{imageError && <ImagePlaceholder title={product.title} />}
```

### Inventory Data Unavailable

**Scenario**: API call to Inventory_System fails or returns empty data.

**Handling Strategy**:
1. Catch fetch errors in server component
2. Return empty array as fallback
3. ProductDiscoveryGrid detects empty products array
4. Display error state with message: "Products unavailable. Please try again later."
5. Provide retry mechanism or link to refresh page
6. Log error details server-side for monitoring

**Implementation**:
```typescript
async function getProducts(): Promise<UnifiedProduct[]> {
  try {
    const supabase = getSupabaseServerClient();
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .order('is_featured DESC, title ASC');
    
    if (error) throw error;
    return data.map(transformSupabaseProduct);
  } catch (error) {
    console.error('[ProductDiscoveryGrid] Inventory fetch failed:', error);
    return [];
  }
}
```

### Viewport Calculation Edge Cases

**Scenario**: Viewport dimensions are too small to fit minimum density (5 products).

**Handling Strategy**:
1. Calculate available space for products
2. If space allows fewer than 5 products, relax constraint to show minimum 3
3. Maintain maximum 4 per row constraint regardless
4. Ensure at least 1 product is always visible
5. Log warning if density constraint cannot be met

**Rationale**: On very small mobile devices, strict 5-7 constraint may be impossible. Graceful degradation ensures usability while maintaining core layout principles.

### Featured Product Data Inconsistency

**Scenario**: Product marked as featured but `featured_until` date has passed.

**Handling Strategy**:
1. Query includes date validation: `WHERE is_featured = true AND (featured_until IS NULL OR featured_until > NOW())`
2. Server-side filtering ensures expired featured products are treated as standard
3. Accent color defaults to deep red if featured status is ambiguous
4. Background job periodically cleans up expired featured flags

### Authentication State Mismatch

**Scenario**: User authentication state changes during page view (e.g., session expires).

**Handling Strategy**:
1. Subscribe to `onAuthStateChange` events from Supabase
2. Update `isRecognized` state when auth changes
3. Re-render pricing display (House vs Standard)
4. No need to refetch products (pricing calculated client-side)
5. Smooth transition without page reload

**Implementation**:
```typescript
useEffect(() => {
  const supabase = getSupabaseClient();
  const { data: { subscription } } = supabase.auth.onAuthStateChange(
    (_event, session) => {
      setIsRecognized(!!session);
    }
  );
  return () => subscription.unsubscribe();
}, []);
```

### Responsive Breakpoint Transitions

**Scenario**: User resizes browser window, triggering column count changes.

**Handling Strategy**:
1. Use CSS Grid with `auto-fill` and `minmax()` for automatic responsiveness
2. No JavaScript resize listeners needed (CSS handles it)
3. Smooth transitions via CSS `transition` property
4. Recalculate density only on significant breakpoint changes (debounced)
5. Maintain scroll position during resize

## Testing Strategy

### Dual Testing Approach

This feature requires both unit tests and property-based tests to ensure comprehensive coverage:

- **Unit tests**: Verify specific examples, edge cases, and error conditions
- **Property tests**: Verify universal properties across all inputs

Both testing approaches are complementary and necessary. Unit tests catch concrete bugs in specific scenarios, while property tests verify general correctness across a wide range of inputs.

### Property-Based Testing

**Library**: `fast-check` (JavaScript/TypeScript property-based testing library)

**Configuration**: Each property test must run a minimum of 100 iterations to ensure adequate randomization coverage.

**Test Tagging**: Each property test must include a comment referencing its design document property:

```typescript
// Feature: product-discovery-threshold, Property 1: Maximum Row Density Constraint
test('no row exceeds 4 items across all viewport widths', () => {
  fc.assert(
    fc.property(
      fc.integer({ min: 320, max: 2560 }), // viewport width
      fc.array(fc.record({ /* product shape */ }), { minLength: 10 }), // products
      (viewportWidth, products) => {
        const grid = renderGrid({ viewportWidth, products });
        const rows = grid.getRows();
        return rows.every(row => row.length <= 4);
      }
    ),
    { numRuns: 100 }
  );
});
```

### Property Test Coverage

**Property 1: Maximum Row Density Constraint**
- Generate random viewport widths (320px - 2560px)
- Generate random product arrays (10-50 items)
- Verify no row exceeds 4 items
- Tag: `Feature: product-discovery-threshold, Property 1`

**Property 2: Viewport Density Range**
- Generate random viewport dimensions
- Generate product arrays with at least 7 items
- Verify displayed count is between 5-7
- Tag: `Feature: product-discovery-threshold, Property 2`

**Property 3: Accent Reveal Color Mapping**
- Generate random products with varying featured status
- Simulate hover events
- Verify accent color matches expected value (red or purple)
- Tag: `Feature: product-discovery-threshold, Property 3`

**Property 4: Visual System Spacing Compliance**
- Generate random viewport sizes
- Render grid and measure spacing values
- Verify all spacing matches Visual_System spec (±1px tolerance)
- Tag: `Feature: product-discovery-threshold, Property 4`

**Property 5: Inventory Data Accuracy**
- Generate random product data
- Render grid with that data
- Verify displayed values match source data exactly
- Tag: `Feature: product-discovery-threshold, Property 5`

**Property 6: Responsive Column Reduction**
- Generate sequence of decreasing viewport widths
- Render grid at each width
- Verify column count never increases, never exceeds 4
- Tag: `Feature: product-discovery-threshold, Property 6`

**Property 7: Touch Device Accent Reveal**
- Generate random products
- Simulate touch events on touch-enabled device
- Verify accent reveal behavior matches hover behavior
- Tag: `Feature: product-discovery-threshold, Property 7`

**Property 8: Primary Image Display**
- Generate random products (some with valid images, some with broken URLs)
- Render grid
- Verify every product shows either image or placeholder
- Tag: `Feature: product-discovery-threshold, Property 8`

**Property 9: Image Aspect Ratio Consistency**
- Generate random product sets
- Render grid and measure image dimensions
- Verify all images have 4:5 aspect ratio (±2% tolerance for rounding)
- Tag: `Feature: product-discovery-threshold, Property 9`

### Unit Testing

Unit tests focus on specific examples, edge cases, and integration points:

**Route Integration Tests**:
- `/shop` route renders ProductDiscoveryGrid component
- `/uniform` route renders ProductDiscoveryGrid component
- Grid receives correct product data from server component

**Absence of Features Tests**:
- Verify no infinite scroll implementation exists
- Verify no pagination controls are rendered
- Verify no countdown timers appear
- Verify no scarcity messaging appears
- Verify no cross-sell recommendations appear

**Error State Tests**:
- Empty product array displays error message
- Failed inventory fetch displays error state
- Image load failure displays placeholder
- Expired featured products treated as standard

**Authentication Integration Tests**:
- Authenticated users see House pricing only
- Unauthenticated users see both Standard and House pricing
- Auth state changes update pricing display without refetch

**Responsive Behavior Tests**:
- Mobile viewport (320px): 1 column layout
- Tablet viewport (768px): 2-3 column layout
- Desktop viewport (1024px+): 4 column layout
- Viewport resize maintains scroll position

### Test Data Generation

**Product Generators**:
```typescript
// Generate valid UnifiedProduct
const validProduct = fc.record({
  id: fc.uuid(),
  handle: fc.string({ minLength: 3, maxLength: 50 }),
  title: fc.string({ minLength: 5, maxLength: 100 }),
  description: fc.string({ maxLength: 500 }),
  price: fc.float({ min: 10, max: 500, noNaN: true }),
  source: fc.constantFrom('shopify', 'supabase'),
  category: fc.option(fc.string()),
  images: fc.record({
    hero: fc.webUrl(),
    hover: fc.option(fc.webUrl()),
  }),
  inStock: fc.boolean(),
});

// Generate featured product
const featuredProduct = validProduct.map(p => ({
  ...p,
  is_featured: true,
}));
```

**Viewport Generators**:
```typescript
const mobileViewport = fc.record({
  width: fc.integer({ min: 320, max: 639 }),
  height: fc.integer({ min: 568, max: 1024 }),
});

const tabletViewport = fc.record({
  width: fc.integer({ min: 640, max: 1023 }),
  height: fc.integer({ min: 768, max: 1366 }),
});

const desktopViewport = fc.record({
  width: fc.integer({ min: 1024, max: 2560 }),
  height: fc.integer({ min: 768, max: 1440 }),
});
```

### Integration Testing

**Inventory System Integration**:
- Test with real Supabase connection (test database)
- Verify product fetching with various query conditions
- Test featured product filtering with date constraints
- Verify error handling when database is unavailable

**Accent Reveal System Integration**:
- Test hover state transitions match existing ProductCard behavior
- Verify accent colors match Visual System specifications
- Test smooth transitions (200ms duration)
- Verify no conflicts with existing hover styles

**Authentication Integration**:
- Test pricing display with authenticated session
- Test pricing display without session
- Test session state changes during page view
- Verify no unnecessary re-renders on auth changes

### Performance Testing

**Rendering Performance**:
- Measure initial render time with 7 products
- Verify no layout shift during image loading
- Test smooth transitions during viewport resize
- Ensure no memory leaks on repeated renders

**Image Loading Performance**:
- Test lazy loading behavior for off-screen images
- Verify progressive image loading
- Test fallback placeholder performance
- Measure time to interactive (TTI)

### Accessibility Testing

**Keyboard Navigation**:
- Tab through all product cards
- Verify focus indicators are visible
- Test Enter key activates product links
- Verify focus order is logical (left-to-right, top-to-bottom)

**Screen Reader Testing**:
- Verify product titles are announced
- Test image alt text is descriptive
- Verify pricing information is announced correctly
- Test error states are announced

**Color Contrast**:
- Verify accent colors meet WCAG AA standards
- Test text on all background colors
- Verify focus indicators have sufficient contrast
- Test in high contrast mode

**Motion Preferences**:
- Respect `prefers-reduced-motion` for transitions
- Disable hover animations when motion is reduced
- Maintain functionality without animations

### Browser Compatibility Testing

**Target Browsers**:
- Chrome/Edge (latest 2 versions)
- Firefox (latest 2 versions)
- Safari (latest 2 versions)
- Mobile Safari (iOS 15+)
- Chrome Mobile (Android 10+)

**Test Coverage**:
- CSS Grid layout support
- CSS custom properties
- Hover and touch events
- Image loading and error handling
- Responsive breakpoints

---

## Implementation Notes

### Migration Path

The existing `/shop` and `/uniform` routes will be updated to use the new ProductDiscoveryGrid component:

1. Create new `ProductDiscoveryGrid` component alongside existing `ProductGrid`
2. Update `/shop/page.tsx` to use ProductDiscoveryGrid
3. Update `/uniform/page.tsx` to use ProductDiscoveryGrid
4. Deprecate old ProductGrid component (keep for reference during transition)
5. Remove old ProductGrid after successful deployment and monitoring

### Feature Flags

Consider implementing a feature flag for gradual rollout:

```typescript
const USE_DISCOVERY_GRID = process.env.NEXT_PUBLIC_ENABLE_DISCOVERY_GRID === 'true';

export default function ShopPage() {
  const products = await getProducts();
  
  return USE_DISCOVERY_GRID 
    ? <ProductDiscoveryGrid products={products} route="shop" />
    : <ProductGrid products={products} />;
}
```

### Performance Considerations

- Use Next.js Image component for automatic optimization
- Implement lazy loading for off-screen images
- Minimize JavaScript bundle size (tree-shake unused code)
- Use CSS Grid for layout (no JavaScript calculations needed)
- Debounce viewport resize calculations (if needed)

### Monitoring and Analytics

Track key metrics post-deployment:
- Average products viewed per session
- Click-through rate on product cards
- Bounce rate on `/shop` and `/uniform` routes
- Time spent on product discovery pages
- Error rates (image loading, data fetching)

### Future Enhancements

Potential improvements for future iterations:
- Seasonal featured product rotation
- Category-based filtering (maintain density constraints)
- Keyboard shortcuts for navigation
- Saved product collections
- Product comparison feature (max 3 items)

---

**End of Design Document**
