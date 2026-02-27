# Design Document: Product Detail Focus

## Overview

The Product Detail Focus feature transforms the product viewing experience into an intimate, ritualized encounter at `/product/[handle]`. This is the second chamber of "The Threshold Sprint" - where the curated grid's promise resolves into focused contemplation of a single object.

The design emphasizes:
- **Image dominance**: Visual primacy over textual information
- **Dynamic narrative**: AI-generated lore that deepens product meaning
- **Singular focus**: One clear action, no distractions or manipulations
- **Visual system integrity**: Strict adherence to Absolute Geometry, Dual Pricing Law, and Accent Reveal System

This page exists in the commerce realm and must maintain separation from Sanctuary. It provides information and invitation, never persuasion or urgency.

## Architecture

### System Context

```
┌─────────────────────────────────────────────────────────────┐
│                  Product Detail Page                        │
│                  /product/[handle]                          │
│                                                             │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐    │
│  │ Image        │  │ Narrative    │  │ Pricing      │    │
│  │ Gallery      │  │ Display      │  │ Display      │    │
│  │ (Dominant)   │  │ (Dynamic)    │  │ (Dual Law)   │    │
│  └──────────────┘  └──────────────┘  └──────────────┘    │
│                                                             │
│  ┌──────────────┐  ┌──────────────┐                       │
│  │ Darkroom     │  │ Singular CTA │                       │
│  │ State        │  │ (Accent)     │                       │
│  └──────────────┘  └──────────────┘                       │
└─────────────────────────────────────────────────────────────┘
           │                    │                │
           │                    │                │
    ┌──────▼──────┐      ┌─────▼─────┐   ┌─────▼─────┐
    │ UnifiedProduct│      │ Narrative │   │ Auth      │
    │ Data Model   │      │ Engine    │   │ System    │
    │              │      │ API       │   │           │
    │ - Images     │      │           │   │ - Session │
    │ - Pricing    │      │ /api/     │   │ - Pricing │
    │ - Darkroom   │      │ generate- │   │   State   │
    │   Status     │      │ narrative │   │           │
    └──────────────┘      └───────────┘   └───────────┘
```

### Data Flow

#### Page Load Sequence

```
1. User navigates to /product/[handle]
   │
   ├─► Next.js extracts handle from URL params
   │
   ├─► Server component fetches product from Supabase
   │   └─► Transform to UnifiedProduct format
   │
   ├─► Check authentication state (server-side)
   │   └─► Determine pricing display mode
   │
   ├─► Generate SEO metadata and JSON-LD
   │
   └─► Render ProductDetailPage component
       │
       ├─► Client hydration begins
       │
       ├─► Request narrative from /api/generate-narrative
       │   └─► Pass product handle and metadata
       │
       ├─► Check Darkroom status
       │   └─► Render appropriate image state
       │
       └─► Initialize image loading with placeholders
```

#### Narrative Generation Flow

```
ProductDetailPage loads
   │
   └─► useEffect hook triggers
       │
       └─► POST /api/generate-narrative
           │
           ├─► Request body: {
           │     item_name: product.title,
           │     item_type: inferredType,
           │     primary_symbol: inferredSymbol,
           │     emotional_core: inferredCore,
           │     energy_tone: "balanced_reverent"
           │   }
           │
           ├─► Narrative Engine processes
           │   ├─► Validate input
           │   ├─► Generate narrative bundle
           │   ├─► Apply tone control
           │   └─► Validate style rules
           │
           └─► Response: {
                 success: true,
                 data: {
                   short_description: string,
                   long_ritual_description: string,
                   ritual_intention_prompt: string,
                   care_use_note: string,
                   alt_text: string,
                   one_line_drop_tagline: string
                 }
               }
               │
               └─► Update component state
                   └─► Render narrative content
```

### Component Hierarchy

```
ProductDetailPage (Server Component)
│
├─► Metadata Generation
│   ├─► OpenGraph tags
│   ├─► Twitter Card
│   └─► JSON-LD Schema
│
└─► ProductDetailClient (Client Component)
    │
    ├─► ImageGallery
    │   ├─► DarkroomOverlay (conditional)
    │   ├─► ImagePlaceholder (loading state)
    │   └─► ProductImage (loaded state)
    │
    ├─► ProductInfo
    │   ├─► ProductTitle
    │   ├─► CategoryLabel
    │   ├─► NarrativeDisplay
    │   │   ├─► ShortDescription
    │   │   └─► LongRitualDescription
    │   ├─► PricingDisplay
    │   │   ├─► AuthenticatedPrice (conditional)
    │   │   └─► UnauthenticatedPrice (conditional)
    │   └─► SingularCTA
    │       └─► AccentRevealButton
    │
    └─► ErrorBoundary
        └─► FallbackUI
```

## Components and Interfaces

### Core Components

#### ProductDetailPage (Server Component)

**Responsibility**: Server-side data fetching, SEO, and initial render

```typescript
// app/product/[handle]/page.tsx
interface ProductDetailPageProps {
  params: {
    handle: string;
  };
}

async function ProductDetailPage({ params }: ProductDetailPageProps): Promise<JSX.Element>
```

**Key Operations**:
- Extract handle from URL parameters
- Fetch product data from Supabase
- Transform to UnifiedProduct format
- Generate metadata for SEO
- Check authentication state
- Render ProductDetailClient with data

#### ProductDetailClient (Client Component)

**Responsibility**: Client-side interactivity, narrative loading, auth state

```typescript
// app/product/[handle]/ProductDetailClient.tsx
interface ProductDetailClientProps {
  product: UnifiedProduct;
  initialAuthState: boolean;
}

function ProductDetailClient({ product, initialAuthState }: ProductDetailClientProps): JSX.Element
```

**State Management**:
```typescript
const [narrative, setNarrative] = useState<NarrativeBundle | null>(null);
const [narrativeLoading, setNarrativeLoading] = useState(true);
const [narrativeError, setNarrativeError] = useState<string | null>(null);
const [isAuthenticated, setIsAuthenticated] = useState(initialAuthState);
const [imageLoaded, setImageLoaded] = useState(false);
```

#### ImageGallery Component

**Responsibility**: Image display with darkroom state handling

```typescript
interface ImageGalleryProps {
  images: string[];
  productTitle: string;
  isDarkroom: boolean;
  darkroomUrl?: string;
}

function ImageGallery({ images, productTitle, isDarkroom, darkroomUrl }: ImageGalleryProps): JSX.Element
```

**Rendering Logic**:
- If `isDarkroom === true`: Display grayscale placeholder with "PROCESSING // DARKROOM" overlay
- If `isDarkroom === false`: Display product images with smooth loading transitions
- Apply 0px border radius to all image containers
- Maintain aspect ratio during loading to prevent layout shift

#### NarrativeDisplay Component

**Responsibility**: Display AI-generated product narrative

```typescript
interface NarrativeDisplayProps {
  narrative: NarrativeBundle | null;
  loading: boolean;
  error: string | null;
  fallbackDescription: string;
}

function NarrativeDisplay({ narrative, loading, error, fallbackDescription }: NarrativeDisplayProps): JSX.Element
```

**Display States**:
- Loading: Show skeleton placeholder
- Error: Display fallback description from product data
- Success: Render `short_description` and `long_ritual_description`

#### SingularCTA Component

**Responsibility**: Single call-to-action with Accent Reveal styling

```typescript
interface SingularCTAProps {
  productId: string;
  productHandle: string;
  productTitle: string;
  price: number;
  inStock: boolean;
  onAddToCart: () => void;
}

function SingularCTA({ productId, productHandle, productTitle, price, inStock, onAddToCart }: SingularCTAProps): JSX.Element
```

**Styling Requirements**:
- Accent Reveal System colors (gold: `#d4af37`, red: `#8b0000`)
- 0px border radius (Absolute Geometry)
- Ritualized language: "Claim", "Acquire", "Add to House"
- Disabled state when `inStock === false`

### API Interfaces

#### Narrative Engine API

**Endpoint**: `POST /api/generate-narrative`

**Request**:
```typescript
interface NarrativeRequest {
  item_name: string;
  item_type: ItemType;
  primary_symbol: PrimarySymbol;
  emotional_core: EmotionalCore;
  energy_tone: EnergyTone;
  drop_name?: string;
  limited?: LimitedType;
  intended_use?: IntendedUse;
  avoid_list?: string[];
}
```

**Response**:
```typescript
interface NarrativeResponse {
  success: boolean;
  data?: NarrativeBundle;
  error?: {
    type: 'validation' | 'style_violation' | 'generation';
    message: string;
    details: any[];
  };
}
```

**Integration Pattern**:
```typescript
async function fetchNarrative(product: UnifiedProduct): Promise<NarrativeBundle | null> {
  try {
    const response = await fetch('/api/generate-narrative', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        item_name: product.title,
        item_type: inferItemType(product.category),
        primary_symbol: inferSymbol(product.title, product.description),
        emotional_core: 'devotion',
        energy_tone: 'balanced_reverent',
      }),
    });
    
    const result = await response.json();
    return result.success ? result.data : null;
  } catch (error) {
    console.error('Narrative generation failed:', error);
    return null;
  }
}
```

## Data Models

### UnifiedProduct (Extended)

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
  metadata?: {
    darkroom_url?: string;
    darkroom_status?: 'processing' | 'complete' | 'failed';
    is_featured?: boolean;
    featured_until?: Date;
    featured_reason?: string;
  };
}
```

**Darkroom State Detection**:
```typescript
function isDarkroomProcessing(product: UnifiedProduct): boolean {
  return product.metadata?.darkroom_status === 'processing';
}
```

### NarrativeBundle

```typescript
interface NarrativeBundle {
  short_description: string;        // 1-2 sentences, product essence
  long_ritual_description: string;  // 3-4 sentences, deeper context
  ritual_intention_prompt: string;  // Suggested use or intention
  care_use_note: string;            // Practical care instructions
  alt_text: string;                 // Accessibility description
  one_line_drop_tagline: string;    // Marketing tagline (not used on detail page)
}
```

### PricingDisplay

```typescript
interface PricingDisplay {
  standard: number;  // Base price
  house: number;     // Discounted price (10% off, rounded)
  formatted: {
    standard: string;  // "$45"
    house: string;     // "$41"
  };
}
```

## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system-essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

### Property Reflection

After analyzing all acceptance criteria, I've identified the following redundancies to eliminate:

- **Redundancy 1**: Properties 2.2 (image containers have 0px border radius) and 4.4 (CTA has 0px border radius) can be combined into a single comprehensive property about Absolute Geometry enforcement across all UI elements.

- **Redundancy 2**: Properties 5.4 (check UnifiedProduct for darkroom status) and 9.4 (extract darkroom status from UnifiedProduct) are identical and should be consolidated.

- **Redundancy 3**: Properties 6.1 (authenticated pricing) and 6.2 (unauthenticated pricing) can be combined into a single property about conditional pricing display based on auth state.

- **Redundancy 4**: Properties 7.1-7.5 (absence of various distraction features) can be combined into a single comprehensive property about distraction-free experience.

- **Redundancy 5**: Properties 9.2 (extract images from UnifiedProduct) and 9.3 (extract pricing from UnifiedProduct) can be combined with 9.1 into a single property about data model integration.

After reflection, the following properties provide unique validation value:

### Property 1: Valid Handle Routing

*For any* valid product handle, navigating to `/product/[handle]` should render the Product Detail Page with product data matching that handle.

**Validates: Requirements 1.1, 1.3**

### Property 2: Image Dominance Across Viewports

*For any* viewport size (mobile or desktop), the image gallery container should occupy more screen space than all other content containers combined.

**Validates: Requirements 2.1, 2.3, 8.1, 8.3**

### Property 3: Absolute Geometry Enforcement

*For any* UI element on the Product Detail Page (images, buttons, containers), the computed border-radius CSS property should equal 0px.

**Validates: Requirements 2.2, 4.4**

### Property 4: Narrative Engine Integration

*For any* product, when the Product Detail Page loads, a POST request should be sent to `/api/generate-narrative` with the product handle included in the request body.

**Validates: Requirements 3.1, 3.4**

### Property 5: Narrative Display on Success

*For any* successful narrative generation response, the returned `short_description` and `long_ritual_description` should be rendered in the narrative display section.

**Validates: Requirements 3.2**

### Property 6: Singular CTA Presence

*For any* rendered Product Detail Page, exactly one primary CTA button should be present in the DOM.

**Validates: Requirements 4.1**

### Property 7: Accent Reveal CTA Styling

*For any* CTA button on the Product Detail Page, the button should have either gold (`#d4af37`) or red (`#8b0000`) color values in its computed styles.

**Validates: Requirements 4.2**

### Property 8: Ritualized CTA Language

*For any* CTA button text, the text content should match one of the approved ritualized phrases: "Claim", "Acquire", "Add to House", "Enter", or "Join".

**Validates: Requirements 4.3**

### Property 9: Darkroom Visual Treatment

*For any* product with `darkroom_status === 'processing'`, the image display should render a grayscale placeholder with the overlay text "PROCESSING // DARKROOM" visible.

**Validates: Requirements 5.1, 5.2, 5.4**

### Property 10: Darkroom State Transition

*For any* product that transitions from `darkroom_status === 'processing'` to `darkroom_status === 'complete'`, the image display should change from grayscale placeholder to the final product image.

**Validates: Requirements 5.3**

### Property 11: Conditional Pricing Display

*For any* authentication state (authenticated or unauthenticated), the pricing display should show house pricing only when authenticated, and both standard and house pricing when unauthenticated.

**Validates: Requirements 6.1, 6.2**

### Property 12: Distraction-Free Experience

*For any* rendered Product Detail Page, the page should contain zero instances of: related products sections, cross-sell recommendations, countdown timers, urgency messaging patterns ("only X left", "hurry", "limited time"), promotional banners, or modal pop-ups.

**Validates: Requirements 7.1, 7.2, 7.3, 7.4, 7.5**

### Property 13: Mobile Vertical Stacking

*For any* mobile viewport (width < 768px), the layout should stack image gallery and product info vertically with image gallery appearing first in the DOM order.

**Validates: Requirements 8.2**

### Property 14: UnifiedProduct Data Integration

*For any* product displayed on the Product Detail Page, all displayed data (images, pricing, darkroom status, title, description) should be sourced from the UnifiedProduct data model structure.

**Validates: Requirements 9.1, 9.2, 9.3**

### Property 15: Image Loading Placeholder Aspect Ratio

*For any* product image during loading state, the placeholder container should maintain the same aspect ratio as the final image to prevent layout shift.

**Validates: Requirements 10.1, 10.3**

### Property 16: Image Load Transition

*For any* product image that completes loading, a CSS transition should be applied to the opacity or transform property with duration > 0ms.

**Validates: Requirements 10.2**

## Error Handling

### Error Categories

#### 1. Product Not Found

**Trigger**: Invalid handle or product doesn't exist in database

**Response**:
- Return 404 status
- Render Next.js `notFound()` page
- Display message: "This product could not be found"
- Provide link back to product grid

**Implementation**:
```typescript
async function getProduct(handle: string): Promise<UnifiedProduct | null> {
  const supabase = getSupabaseServerClient();
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .eq('handle', handle)
    .single();
  
  if (error || !data) {
    return null;
  }
  
  return transformSupabaseProduct(data);
}

// In page component
const product = await getProduct(params.handle);
if (!product) {
  notFound();
}
```

#### 2. Narrative Generation Failure

**Trigger**: API request fails, validation error, or generation error

**Response**:
- Do not block page render
- Display fallback description from `product.description`
- Log error for monitoring
- Show subtle indicator that narrative is unavailable

**Implementation**:
```typescript
async function fetchNarrative(product: UnifiedProduct): Promise<NarrativeBundle | null> {
  try {
    const response = await fetch('/api/generate-narrative', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(buildNarrativeRequest(product)),
    });
    
    if (!response.ok) {
      throw new Error(`Narrative API returned ${response.status}`);
    }
    
    const result = await response.json();
    return result.success ? result.data : null;
  } catch (error) {
    console.error('Narrative generation failed:', error);
    return null;
  }
}

// In component
{narrative ? (
  <NarrativeDisplay narrative={narrative} />
) : (
  <FallbackDescription description={product.description} />
)}
```

#### 3. Image Loading Failure

**Trigger**: Image URL returns 404 or network error

**Response**:
- Display fallback placeholder image
- Maintain aspect ratio to prevent layout shift
- Show subtle "Image unavailable" indicator
- Do not block page functionality

**Implementation**:
```typescript
<Image
  src={product.images.hero}
  alt={product.title}
  fill
  style={{ objectFit: 'cover' }}
  onError={(e) => {
    e.currentTarget.src = '/images/placeholder.jpg';
  }}
/>
```

#### 4. Authentication State Error

**Trigger**: Supabase auth check fails or session is invalid

**Response**:
- Default to unauthenticated pricing display
- Log error for monitoring
- Do not block page render
- Allow user to continue browsing

**Implementation**:
```typescript
useEffect(() => {
  const checkAuth = async () => {
    try {
      const { data: { session }, error } = await supabase.auth.getSession();
      if (error) throw error;
      setIsAuthenticated(!!session);
    } catch (error) {
      console.error('Auth check failed:', error);
      setIsAuthenticated(false); // Default to unauthenticated
    }
  };
  checkAuth();
}, []);
```

#### 5. Darkroom Status Ambiguity

**Trigger**: `darkroom_status` field is missing or has unexpected value

**Response**:
- Default to showing available images
- Do not show darkroom overlay
- Log warning for data quality monitoring

**Implementation**:
```typescript
function isDarkroomProcessing(product: UnifiedProduct): boolean {
  const status = product.metadata?.darkroom_status;
  return status === 'processing'; // Only true for explicit 'processing' value
}
```

### Error Boundary

Wrap the entire ProductDetailClient in an error boundary to catch unexpected React errors:

```typescript
// app/product/[handle]/error.tsx
'use client';

export default function ProductError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div style={styles.errorContainer}>
      <h2>Something went wrong</h2>
      <p>We encountered an error loading this product.</p>
      <button onClick={reset} style={styles.retryButton}>
        Try again
      </button>
      <Link href="/" style={styles.homeLink}>
        Return to products
      </Link>
    </div>
  );
}
```

## Testing Strategy

### Dual Testing Approach

This feature requires both unit tests and property-based tests to ensure comprehensive coverage:

- **Unit tests**: Verify specific examples, edge cases, and error conditions
- **Property tests**: Verify universal properties across all inputs

Both approaches are complementary and necessary. Unit tests catch concrete bugs in specific scenarios, while property tests verify general correctness across a wide range of inputs.

### Property-Based Testing

**Library**: `fast-check` (JavaScript/TypeScript property-based testing library)

**Configuration**: Minimum 100 iterations per property test (due to randomization)

**Tagging Convention**: Each property test must reference its design document property

Tag format: `// Feature: product-detail-focus, Property {number}: {property_text}`

#### Property Test Examples

**Property 1: Valid Handle Routing**
```typescript
// Feature: product-detail-focus, Property 1: Valid handle routing
import fc from 'fast-check';

test('valid handles render correct product data', () => {
  fc.assert(
    fc.property(
      fc.record({
        handle: fc.stringOf(fc.constantFrom(...'abcdefghijklmnopqrstuvwxyz0123456789-'), { minLength: 3, maxLength: 50 }),
        title: fc.string({ minLength: 1, maxLength: 100 }),
        price: fc.float({ min: 1, max: 10000 }),
      }),
      async (product) => {
        // Seed database with product
        await seedProduct(product);
        
        // Navigate to product page
        const page = await renderProductPage(product.handle);
        
        // Verify product data matches
        expect(page.getProductTitle()).toBe(product.title);
        expect(page.getProductHandle()).toBe(product.handle);
      }
    ),
    { numRuns: 100 }
  );
});
```

**Property 3: Absolute Geometry Enforcement**
```typescript
// Feature: product-detail-focus, Property 3: Absolute Geometry enforcement
test('all UI elements have 0px border radius', () => {
  fc.assert(
    fc.property(
      fc.record({
        handle: fc.string(),
        images: fc.array(fc.webUrl(), { minLength: 1, maxLength: 5 }),
      }),
      async (product) => {
        const page = await renderProductPage(product.handle);
        const allElements = page.getAllUIElements();
        
        allElements.forEach(element => {
          const borderRadius = window.getComputedStyle(element).borderRadius;
          expect(borderRadius).toBe('0px');
        });
      }
    ),
    { numRuns: 100 }
  );
});
```

**Property 12: Distraction-Free Experience**
```typescript
// Feature: product-detail-focus, Property 12: Distraction-free experience
test('page contains no distraction elements', () => {
  fc.assert(
    fc.property(
      fc.string(), // Random product handle
      async (handle) => {
        const page = await renderProductPage(handle);
        const pageHTML = page.getHTML();
        
        // Check for forbidden elements
        expect(pageHTML).not.toContain('related products');
        expect(pageHTML).not.toContain('you may also like');
        expect(pageHTML).not.toContain('countdown');
        expect(pageHTML).not.toMatch(/only \d+ left/i);
        expect(pageHTML).not.toMatch(/hurry/i);
        expect(pageHTML).not.toMatch(/limited time/i);
        
        // Check for forbidden DOM elements
        expect(page.querySelector('[data-testid="related-products"]')).toBeNull();
        expect(page.querySelector('[data-testid="cross-sell"]')).toBeNull();
        expect(page.querySelector('[data-testid="countdown-timer"]')).toBeNull();
        expect(page.querySelector('[role="dialog"]')).toBeNull(); // No modals
      }
    ),
    { numRuns: 100 }
  );
});
```

### Unit Testing

**Framework**: Jest + React Testing Library

**Focus Areas**:
- Specific edge cases identified in prework
- Component integration points
- Error handling scenarios
- Accessibility compliance

#### Unit Test Examples

**Edge Case: Invalid Handle**
```typescript
test('invalid handle displays 404 page', async () => {
  const invalidHandle = 'nonexistent-product-xyz';
  
  const response = await fetch(`/product/${invalidHandle}`);
  
  expect(response.status).toBe(404);
  expect(await response.text()).toContain('Product Not Found');
});
```

**Edge Case: Narrative Generation Failure**
```typescript
test('narrative failure shows fallback description', async () => {
  // Mock API to return error
  mockNarrativeAPI.mockRejectedValue(new Error('Generation failed'));
  
  const { getByText } = render(
    <ProductDetailClient 
      product={mockProduct} 
      initialAuthState={false} 
    />
  );
  
  // Wait for fallback to appear
  await waitFor(() => {
    expect(getByText(mockProduct.description)).toBeInTheDocument();
  });
});
```

**Edge Case: Image Loading Failure**
```typescript
test('failed image shows fallback placeholder', async () => {
  const { container } = render(
    <ImageGallery 
      images={['https://invalid-url.com/image.jpg']}
      productTitle="Test Product"
      isDarkroom={false}
    />
  );
  
  const img = container.querySelector('img');
  
  // Trigger error event
  fireEvent.error(img!);
  
  // Verify fallback is shown
  expect(img?.src).toContain('placeholder.jpg');
});
```

**Integration: Darkroom State Display**
```typescript
test('darkroom processing shows overlay', () => {
  const darkroomProduct = {
    ...mockProduct,
    metadata: {
      darkroom_status: 'processing',
    },
  };
  
  const { getByText, container } = render(
    <ImageGallery 
      images={darkroomProduct.images.all}
      productTitle={darkroomProduct.title}
      isDarkroom={true}
    />
  );
  
  expect(getByText('PROCESSING // DARKROOM')).toBeInTheDocument();
  
  // Verify grayscale filter
  const imageContainer = container.querySelector('[data-testid="image-container"]');
  expect(imageContainer).toHaveStyle({ filter: 'grayscale(100%)' });
});
```

**Accessibility: Image Alt Text**
```typescript
test('all images have descriptive alt text', () => {
  const { container } = render(
    <ProductDetailClient 
      product={mockProduct} 
      initialAuthState={false} 
    />
  );
  
  const images = container.querySelectorAll('img');
  
  images.forEach(img => {
    expect(img.alt).toBeTruthy();
    expect(img.alt.length).toBeGreaterThan(0);
  });
});
```

### Test Coverage Goals

- **Line coverage**: > 80%
- **Branch coverage**: > 75%
- **Property test iterations**: 100 per property
- **Edge case coverage**: All identified edge cases must have unit tests

### Continuous Integration

All tests must pass before deployment:

```yaml
# .github/workflows/test.yml
name: Test Product Detail Focus

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
      - run: npm install
      - run: npm run test:unit
      - run: npm run test:property
      - run: npm run test:e2e -- --grep "product-detail-focus"
```
