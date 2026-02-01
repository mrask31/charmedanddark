# Design Document: Product Discovery

## Overview

Product Discovery is the primary revenue-generating experience in the Threshold realm of Charmed & Dark. It transforms conventional ecommerce browsing into curated revelation—a gallery-like presentation where products are discovered as objects of meaning rather than SKUs in a grid.

This design explicitly conforms to the Visual System spec (.kiro/specs/visual-system/), implementing all sacred color palette rules, spacing principles, interaction behaviors, and explicit exclusions. Every design decision references the visual-system properties it upholds.

**Core Design Principles:**
- **Curated Revelation**: Limited products per view (5-7 per viewport), intentional placement, gallery aesthetic
- **Slowness Over Speed**: No infinite scroll, no dense grids, generous whitespace
- **Presence Over Volume**: Each product receives intentional space and attention
- **Ritual Interactions**: Hover states use deep red, transitions are subtle and elegant
- **Sanctuary Emphasis**: Featured products use deep purple to convey special significance
- **Cognitive Simplicity**: One primary decision per product (selection), no competing CTAs

## Architecture

### System Structure

Product Discovery is organized into four primary layers:

```
Product Discovery
├── Data Layer
│   ├── Shopify Integration (product data source)
│   ├── Product Model (title, price, images, metadata)
│   └── Featured Product Designation (sanctuary-level products)
├── Presentation Layer
│   ├── Discovery View (primary product revelation interface)
│   ├── Product Card (individual product presentation)
│   ├── Product Grid (curated layout system)
│   └── Featured Product Card (sanctuary-level variant)
├── Interaction Layer
│   ├── Hover States (deep red ritual moments)
│   ├── Active States (selection feedback)
│   ├── Navigation Controls (elegant page transitions)
│   └── Collection Portals (curated revelation paths)
└── Validation Layer
    ├── Visual System Validator (color, spacing, density checks)
    ├── Exclusion Validator (forbidden pattern detection)
    └── Conformance Reporter (visual-system compliance)
```

### Data Flow

```
Shopify Backend
    ↓
Product Data Fetch (title, price, images, metadata, featured flag)
    ↓
Product Model Transformation
    ↓
Featured Product Classification (sanctuary designation)
    ↓
Product Grid Layout (max 4 per row, 5-7 per viewport)
    ↓
Product Card Rendering (visual-system conformance)
    ↓
Interaction Layer (hover/active states)
    ↓
Product Detail Navigation (on selection)
```

## Components and Interfaces

### Data Layer

#### Product Model

```typescript
interface Product {
  id: string; // Shopify product ID
  title: string;
  price: number;
  currency: string;
  images: ProductImage[];
  description: string;
  metadata: ProductMetadata;
  isFeatured: boolean; // Sanctuary-level designation
  featuredReason?: FeaturedReason; // Why this product is featured
}

interface ProductImage {
  url: string;
  alt: string;
  width: number;
  height: number;
  isPrimary: boolean;
}

interface ProductMetadata {
  collection: string;
  tags: string[];
  availableForSale: boolean;
  createdAt: Date;
}

type FeaturedReason = 
  | 'limited-drop'
  | 'seasonal-ritual'
  | 'narrative-importance'
  | 'curated-emphasis';
```

#### Shopify Integration Interface

```typescript
interface ShopifyIntegration {
  // Product fetching
  fetchProducts(options: FetchOptions): Promise<Product[]>;
  fetchProductById(id: string): Promise<Product>;
  fetchFeaturedProducts(): Promise<Product[]>;
  
  // Collection filtering
  fetchProductsByCollection(collection: string): Promise<Product[]>;
  fetchProductsByTag(tag: string): Promise<Product[]>;
}

interface FetchOptions {
  limit: number; // Max products per fetch (respects density limits)
  offset: number; // For pagination
  collection?: string;
  tags?: string[];
  sortBy?: 'created' | 'price' | 'title';
  sortOrder?: 'asc' | 'desc';
}
```

### Presentation Layer

#### Discovery View

The Discovery View is the primary interface for product revelation. It enforces visual-system conformance at the layout level.

```typescript
interface DiscoveryView {
  products: Product[];
  layout: LayoutConfig;
  filters: FilterState;
  navigation: NavigationState;
  
  // Rendering
  render(): ViewElement;
  
  // Validation
  validateVisualSystem(): ValidationResult;
}

interface LayoutConfig {
  productsPerRow: number; // Max 4 per visual-system Property 13
  productsPerViewport: number; // 5-7 per visual-system Property 9
  spacing: {
    cardGap: number; // Min 24px per visual-system Property 8
    sectionGap: number; // Min 96px per visual-system Property 8
  };
  viewport: {
    width: number;
    height: number;
  };
}
```

#### Product Card

The Product Card is the fundamental unit of product presentation. It implements all visual-system interaction behaviors.

```typescript
interface ProductCard {
  product: Product;
  state: CardState;
  visualStyle: CardVisualStyle;
  
  // Rendering
  render(): CardElement;
  
  // Interaction handlers
  onHover(): void; // Applies deep red ritual moment
  onActive(): void; // Applies active state feedback
  onClick(): void; // Navigates to product detail
  
  // Validation
  validateInteraction(): InteractionValidation;
  validateSpacing(): SpacingValidation;
}

type CardState = 'default' | 'hover' | 'active' | 'disabled';

interface CardVisualStyle {
  backgroundColor: Color; // Black/near-black per visual-system
  borderColor: Color; // Muted gold for emphasis
  textColor: Color;
  hoverColor: Color; // Deep red per visual-system Property 10
  activeColor: Color; // Deep red per visual-system Property 1
  transform: TransformConfig;
  transition: TransitionConfig;
}

interface TransformConfig {
  scale: {
    default: number; // 1.0
    hover: number; // Max 1.05 per visual-system Property 12
    active: number; // Min 0.98 per visual-system Property 12
  };
}

interface TransitionConfig {
  duration: number; // 150-500ms per visual-system Property 11
  easing: 'ease-in-out' | 'ease-out';
  properties: string[]; // ['color', 'transform', 'border-color']
}
```

#### Featured Product Card

Featured Product Cards extend the base Product Card with sanctuary-level visual treatment.

```typescript
interface FeaturedProductCard extends ProductCard {
  featuredReason: FeaturedReason;
  sanctuaryStyle: SanctuaryVisualStyle;
  
  // Override rendering with deep purple treatment
  render(): CardElement;
}

interface SanctuaryVisualStyle extends CardVisualStyle {
  accentColor: Color; // Deep purple per visual-system Property 2
  borderColor: Color; // Deep purple instead of gold
  labelText: string; // "Featured" or "Beloved"
  labelColor: Color; // Deep purple
}
```

#### Product Grid

The Product Grid manages layout and enforces density limits.

```typescript
interface ProductGrid {
  products: Product[];
  layoutConfig: LayoutConfig;
  
  // Layout calculation
  calculateLayout(viewport: Viewport): GridLayout;
  
  // Rendering
  render(): GridElement;
  
  // Validation
  validateDensity(): DensityValidation;
  validateSpacing(): SpacingValidation;
}

interface GridLayout {
  rows: GridRow[];
  totalHeight: number;
  productsPerViewport: number;
}

interface GridRow {
  products: Product[];
  height: number;
  spacing: number;
}

interface DensityValidation {
  isValid: boolean;
  productsPerRow: number; // Must be ≤ 4
  productsPerViewport: number; // Must be 5-7
  violations: string[];
}
```

### Interaction Layer

#### Hover State Handler

```typescript
interface HoverStateHandler {
  // Apply ritual moment styling
  applyHoverState(card: ProductCard): void;
  removeHoverState(card: ProductCard): void;
  
  // Validation
  validateHoverColor(color: Color): boolean; // Must be deep red
  validateTransition(transition: TransitionConfig): boolean; // 150-500ms
  validateTransform(transform: TransformConfig): boolean; // Max 1.05x scale
}
```

#### Navigation Controls

Navigation controls allow elegant transitions between product sets without conventional pagination.

```typescript
interface NavigationControls {
  currentPage: number;
  totalPages: number;
  productsPerPage: number;
  
  // Navigation actions
  nextPage(): void;
  previousPage(): void;
  goToPage(page: number): void;
  
  // Rendering
  render(): NavigationElement;
  
  // Validation
  validateInteraction(): InteractionValidation; // Deep red hover states
}

interface NavigationElement {
  previousButton: ButtonElement;
  nextButton: ButtonElement;
  pageIndicator: IndicatorElement; // Subtle, not conventional "1 2 3"
  visualStyle: NavigationVisualStyle;
}

interface NavigationVisualStyle {
  buttonColor: Color; // Muted gold
  hoverColor: Color; // Deep red per visual-system Property 10
  disabledColor: Color; // Near-black with reduced opacity
  spacing: number; // Min 24px between elements
}
```

#### Collection Portals

Collection Portals provide curated revelation paths without conventional filter patterns. These are ritualized navigation elements that guide visitors through intentional product collections.

```typescript
interface CollectionPortals {
  availablePortals: Portal[];
  activePortal: Portal | null;
  
  // Portal actions
  enterPortal(portal: Portal): void;
  exitPortal(): void; // Return to all products
  
  // Rendering
  render(): PortalElement;
  
  // Validation
  validateTone(portalLabel: string): ToneValidation; // No promotional language
}

interface Portal {
  id: string;
  label: string; // Ritualized language: "Ritual Wear", "Sanctuary Objects", "Seasonal Offerings"
  collection: string; // Maps to Shopify collection
  description?: string; // Optional poetic description
}

interface PortalElement {
  portalButtons: ButtonElement[]; // 3-7 curated options max
  activeIndicator: IndicatorElement | null;
  visualStyle: PortalVisualStyle;
}

interface PortalVisualStyle {
  buttonColor: Color; // Near-black
  activeColor: Color; // Deep purple for active portal
  hoverColor: Color; // Deep red per visual-system Property 10
  spacing: number; // Min 24px between portal buttons
  layout: 'horizontal' | 'vertical'; // Not sidebar-style
}

// Constraints
interface PortalConstraints {
  minPortals: 3;
  maxPortals: 7;
  allowMultiSelect: false; // Single portal selection only
  allowSidebarLayout: false; // No sidebar-style filters
  forbiddenLabels: ['Filter', 'Category', 'Sort by']; // Use ritualized language
}
```
```

### Validation Layer

#### Visual System Validator

```typescript
interface VisualSystemValidator {
  // Color validation
  validateColorHierarchy(view: DiscoveryView): ColorValidation;
  validateGoldUsage(view: DiscoveryView): GoldValidation;
  validateHoverColors(cards: ProductCard[]): HoverValidation;
  
  // Spacing validation
  validateSpacing(grid: ProductGrid): SpacingValidation;
  validateDensity(view: DiscoveryView): DensityValidation;
  
  // Interaction validation
  validateTransitions(cards: ProductCard[]): TransitionValidation;
  validateTransforms(cards: ProductCard[]): TransformValidation;
  
  // Comprehensive validation
  validateFullConformance(view: DiscoveryView): ConformanceReport;
}

interface ColorValidation {
  isValid: boolean;
  blackPercentage: number; // Must be 60-80%
  goldPercentage: number; // Must be <5%
  violations: string[];
}

interface ConformanceReport {
  isValid: boolean;
  score: number; // 0-100
  propertyViolations: PropertyViolation[];
  recommendations: string[];
}

interface PropertyViolation {
  propertyNumber: number; // References visual-system property
  propertyName: string;
  severity: 'critical' | 'warning';
  description: string;
  fix: string;
}
```

#### Exclusion Validator

```typescript
interface ExclusionValidator {
  // Forbidden pattern detection
  detectPopups(view: DiscoveryView): boolean;
  detectDiscountBanners(view: DiscoveryView): boolean;
  detectCountdownTimers(view: DiscoveryView): boolean;
  detectScarcityMechanics(view: DiscoveryView): boolean;
  detectInfiniteScroll(view: DiscoveryView): boolean;
  detectDenseGrids(grid: ProductGrid): boolean;
  detectCompetingCTAs(card: ProductCard): boolean;
  
  // Forbidden language detection
  detectForbiddenPhrases(text: string): string[]; // Returns forbidden phrases found
  
  // Comprehensive validation
  validateExclusions(view: DiscoveryView): ExclusionReport;
}

interface ExclusionReport {
  isValid: boolean;
  violations: ExclusionViolation[];
  severity: 'critical' | 'warning';
}

interface ExclusionViolation {
  type: string; // e.g., "popup", "discount-banner", "scarcity-mechanic"
  location: string; // Where in the view
  description: string;
  fix: string;
}
```

## Data Models

### Product Data Model

```typescript
// Core product data from Shopify
interface Product {
  id: string;
  title: string;
  price: number;
  currency: string;
  images: ProductImage[];
  description: string;
  metadata: ProductMetadata;
  isFeatured: boolean;
  featuredReason?: FeaturedReason;
}

interface ProductImage {
  url: string;
  alt: string;
  width: number;
  height: number;
  isPrimary: boolean;
}

interface ProductMetadata {
  collection: string;
  tags: string[];
  availableForSale: boolean;
  createdAt: Date;
}

type FeaturedReason = 
  | 'limited-drop'
  | 'seasonal-ritual'
  | 'narrative-importance'
  | 'curated-emphasis';
```

### View State Model

```typescript
// Discovery view state
interface DiscoveryViewState {
  products: Product[];
  currentPage: number;
  totalPages: number;
  activePortal: Portal | null; // Single portal selection
  layout: LayoutConfig;
  viewport: Viewport;
}

interface LayoutConfig {
  productsPerRow: number; // 1-4 depending on viewport
  productsPerViewport: number; // 5-7
  spacing: SpacingConfig;
}

interface SpacingConfig {
  cardGap: number; // Min 24px
  sectionGap: number; // Min 96px
  padding: {
    top: number;
    right: number;
    bottom: number;
    left: number;
  };
}

interface Viewport {
  width: number;
  height: number;
  breakpoint: 'mobile' | 'tablet' | 'desktop';
}
```

### Interaction State Model

```typescript
// Product card interaction state
interface CardInteractionState {
  cardId: string;
  currentState: CardState;
  previousState: CardState;
  transitionStartTime: number;
  isTransitioning: boolean;
}

type CardState = 'default' | 'hover' | 'active' | 'disabled';

// Navigation state
interface NavigationState {
  currentPage: number;
  totalPages: number;
  canGoNext: boolean;
  canGoPrevious: boolean;
  isTransitioning: boolean;
}
```

### Visual Style Model

```typescript
// Visual styling configuration
interface VisualStyleConfig {
  colors: ColorPalette;
  typography: TypographyConfig;
  spacing: SpacingScale;
  interactions: InteractionConfig;
}

interface ColorPalette {
  foundation: {
    ink: string; // #000000
    charcoal: string; // #0A0A0A
    nearBlack: string; // #1A1A1A
  };
  ritual: {
    wine: string; // #4A0E0E
    blood: string; // #6B1515
    garnet: string; // #8B2020
  };
  sanctuary: {
    plum: string; // #2D1B3D
    aubergine: string; // #3D2550
    velvet: string; // #4D3060
  };
  emphasis: {
    antiqueGold: string; // #8B7355
    brushedGold: string; // #9D8366
    agedGold: string; // #7A6347
  };
}

interface TypographyConfig {
  productTitle: {
    fontSize: number; // 24px (H3)
    fontWeight: number;
    lineHeight: number;
    letterSpacing: number;
    color: string;
  };
  productPrice: {
    fontSize: number; // 20px (Body Large)
    fontWeight: number;
    color: string; // Muted gold
  };
  featuredLabel: {
    fontSize: number; // 14px (Body Small)
    fontWeight: number;
    color: string; // Deep purple
  };
}

interface SpacingScale {
  xs: number; // 4px
  sm: number; // 8px
  md: number; // 16px
  lg: number; // 24px
  xl: number; // 32px
  '2xl': number; // 48px
  '3xl': number; // 64px
  '4xl': number; // 96px
}

interface InteractionConfig {
  transitions: {
    hover: TransitionConfig;
    active: TransitionConfig;
  };
  transforms: {
    hoverScale: number; // 1.02-1.05
    activeScale: number; // 0.98
  };
}
```

## Responsive Layout Strategy

### Breakpoint Configuration

```typescript
interface ResponsiveConfig {
  breakpoints: {
    mobile: { maxWidth: 768, productsPerRow: 1 };
    tablet: { minWidth: 769, maxWidth: 1024, productsPerRow: 2 };
    desktop: { minWidth: 1025, productsPerRow: 3 };
    desktopLarge: { minWidth: 1440, productsPerRow: 4 };
  };
  
  // Spacing adjustments per breakpoint
  spacingMultipliers: {
    mobile: 1.0; // Full spacing
    tablet: 1.0; // Full spacing
    desktop: 1.0; // Full spacing
  };
  
  // Density limits per breakpoint
  densityLimits: {
    mobile: { maxPerViewport: 5 };
    tablet: { maxPerViewport: 6 };
    desktop: { maxPerViewport: 7 };
  };
}
```

### Layout Calculation

The layout system calculates optimal product placement based on viewport size while maintaining visual-system conformance:

1. **Determine breakpoint** from viewport width
2. **Calculate products per row** (1-4 based on breakpoint)
3. **Calculate card dimensions** maintaining aspect ratio and spacing
4. **Validate density** (5-7 products per viewport height)
5. **Apply spacing** (min 24px between cards, 96px between sections)
6. **Render grid** with visual-system conformance

## Navigation and Pagination Strategy

### Elegant Page Transitions

Instead of conventional pagination (1, 2, 3, 4...), Product Discovery uses elegant navigation:

**Navigation Pattern:**
- **Previous/Next controls**: Subtle arrows or text ("Previous" / "Next")
- **Page indicator**: Minimal dot indicators or "Page X of Y" in elegant typography
- **No numbered links**: Avoids transactional pagination feel
- **Smooth transitions**: Fade in/out with 300ms duration

**Implementation:**
```typescript
interface NavigationImplementation {
  // Calculate products for current page
  getProductsForPage(page: number, productsPerPage: number): Product[];
  
  // Transition handling
  transitionToPage(targetPage: number): Promise<void>;
  
  // Validation
  validatePageTransition(): boolean; // No loading spinners with urgency
}
```

## Filter and Curation Strategy

### Curated Filter Presentation

Filters are presented as curation mechanisms rather than conventional search:

**Filter Categories:**
- **Collections**: "Ritual Wear", "Sanctuary Objects", "Seasonal Offerings"
- **Themes**: "Gothic Romance", "Dark Elegance", "Mystical Adornment"
- **Price Ranges**: Presented elegantly, not as sliders

**Filter Interaction:**
- Hover states use deep red (visual-system Property 10)
- Active filters use deep purple accent (sanctuary emphasis)
- Filter application maintains curated revelation aesthetic
- No "Apply" button—filters apply immediately with elegant transition

**Implementation:**
```typescript
interface FilterImplementation {
  // Apply filter with transition
  applyFilter(filter: Filter): Promise<Product[]>;
  
  // Render filter controls
  renderFilters(availableFilters: Filter[]): FilterElement;
  
  // Validation
  validateFilterTone(label: string): boolean; // No promotional language
}
```


## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system—essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

### Property 1: Maximum Products Per Viewport

*For any* discovery view and viewport configuration, the number of products displayed per viewport height must be between 5 and 7, ensuring curated revelation rather than overwhelming volume.

**Validates: Requirements 1.1**

### Property 2: Maximum Products Per Row

*For any* product grid layout, no row may contain more than 4 products, maintaining gallery-like presentation and preventing dense grids.

**Validates: Requirements 1.2**

### Property 3: Minimum Spacing Requirements

*For any* product discovery layout, all adjacent product cards must have at least 24px spacing between them, product metadata elements (title, price, image) must have at least 24px spacing between them, and major product sections must have at least 96px vertical spacing.

**Validates: Requirements 1.3, 4.4**

### Property 4: No Infinite Scroll Patterns

*For any* product discovery interface, the view must not contain infinite scroll mechanisms (scroll event listeners that load more content, "load more" buttons, or automatic content loading on scroll).

**Validates: Requirements 1.4, 10.4**

### Property 5: Black Color Dominance

*For any* rendered discovery view, black and near-black tones (ink, charcoal, near-black) must occupy between 60% and 80% of the total visual space.

**Validates: Requirements 2.1**

### Property 6: Gold Scarcity

*For any* rendered discovery view, muted gold colors (antique-gold, brushed-gold, aged-gold) must occupy less than 5% of the total visual space.

**Validates: Requirements 2.2**

### Property 7: Featured Products Use Deep Purple

*For any* product marked as featured (isFeatured = true), the rendered product card must use colors from the deep purple family (plum, aubergine, velvet) for visual distinction elements (borders, accents, labels).

**Validates: Requirements 2.3, 6.1, 7.3**

### Property 8: Interactive Elements Use Deep Red on Hover

*For any* interactive element (product card, filter control, navigation control), when in hover state, the element's color must transition to a color from the deep red family (wine, blood, garnet).

**Validates: Requirements 2.4, 3.1, 5.2, 10.2**

### Property 9: Color Brightness and Saturation Limits

*For any* color used in product discovery interfaces, the HSL saturation must not exceed 40% and the lightness must not exceed 60%, preventing bright, saturated, or neon colors.

**Validates: Requirements 2.5**

### Property 10: Hover Transition Timing

*For any* product card hover interaction, the color transition must complete within 300ms using ease-in-out easing, creating a subtle ritual moment.

**Validates: Requirements 3.1**

### Property 11: Hover Scale Transform Limits

*For any* product card hover interaction, the scale transform must not exceed 1.05x, ensuring subtle visual feedback without excessive movement.

**Validates: Requirements 3.2**

### Property 12: Active State Behavior

*For any* product card click interaction, the active state must apply deep red color and scale reduction to 0.98x, providing tactile feedback for the ritual moment.

**Validates: Requirements 3.3**

### Property 13: Transition Duration Bounds

*For any* product card state transition (default ↔ hover ↔ active), the transition duration must be between 150ms and 500ms, maintaining subtle and elegant animations.

**Validates: Requirements 3.4**

### Property 14: Required Product Metadata Presence

*For any* rendered product card, the card must display at minimum the product title, price, and primary image, ensuring essential information is always present.

**Validates: Requirements 4.1**

### Property 15: Product Title Typography Conformance

*For any* rendered product title, the font size must be either 24px (H3) or 20px (Body Large) from the visual-system type scale.

**Validates: Requirements 4.2**

### Property 16: Product Price Color Assignment

*For any* rendered product price, the text color must be from the muted gold family (antique-gold, brushed-gold, aged-gold), providing elegant emphasis.

**Validates: Requirements 4.3**

### Property 17: Forbidden Phrase Detection

*For any* text content in product discovery interfaces (product titles, descriptions, labels, buttons, navigation), the text must not contain forbidden phrases including "Shop now", "Limited time", "Best seller", "Don't miss out", "Add to cart", "Only X left", or other promotional/urgent language.

**Validates: Requirements 4.5, 5.4, 8.4**

### Property 18: Collection Portals as Curated Revelation

*For any* collection portal interface, the portals must be presented as 3-7 curated options with ritualized labels (e.g., "Ritual Wear", "Sanctuary Objects", "Seasonal Offerings"), must not use conventional filter language ("Filter", "Category", "Sort by"), must allow only single portal selection (no multi-select), and must not use sidebar-style layouts.

**Validates: Requirements 5.1**

### Property 19: Portal Application Maintains Layout Rules

*For any* portal selection, the resulting product grid must maintain all density limits (max 4 per row, 5-7 per viewport), spacing requirements (min 24px between cards), and must not introduce infinite scroll patterns.

**Validates: Requirements 5.3**

### Property 20: Featured Product Spacing Conformance

*For any* featured product card, the card must maintain all minimum spacing requirements (24px between elements, 96px between sections) and density limits (5-7 per viewport) while providing visual emphasis through color.

**Validates: Requirements 6.2**

### Property 21: Featured Product Label Terminology

*For any* featured product label, the label text must use approved terms ("Featured", "Beloved", "Sanctuary", "Ritual") and must not use promotional terms ("Best seller", "Top rated", "Popular").

**Validates: Requirements 6.3**

### Property 22: Featured Product Reason Validation

*For any* product marked as featured (isFeatured = true), the product must have a valid featuredReason value from the approved set: "limited-drop", "seasonal-ritual", "narrative-importance", or "curated-emphasis".

**Validates: Requirements 6.4**

### Property 23: Featured Products Use Sanctuary Visual Treatment

*For any* featured product, the visual treatment must use deep purple colors (sanctuary elements) and must not include promotional language or urgency patterns, conveying significance rather than transaction.

**Validates: Requirements 6.5**

### Property 24: Shopify Product Data Completeness

*For any* product fetched from Shopify, the product data must include all required fields: id, title, price, images (at least one), description, and metadata (collection, tags, availableForSale).

**Validates: Requirements 7.1**

### Property 25: Product Image Quality Standards

*For any* product image displayed, the image must have minimum dimensions of 800x800 pixels and maintain an aspect ratio between 1:1 and 4:3, ensuring high-quality presentation.

**Validates: Requirements 7.2**

### Property 26: Product Selection Navigation

*For any* product card click interaction, the system must navigate to the product detail view with the correct Shopify product identifier in the URL or state.

**Validates: Requirements 7.4**

### Property 27: Comprehensive Forbidden Pattern Detection

*For any* product discovery interface, the view must not contain any of the following forbidden patterns: popups, discount banners, countdown timers, scarcity messaging, gamification elements (badges, points, achievements), notification-driven engagement patterns, urgent loading indicators, or pressure energy patterns (urgent language, aggressive animations with duration < 100ms, excessive color saturation > 40%).

**Validates: Requirements 8.1, 8.2, 8.3, 8.4, 8.5, 8.6**

### Property 28: Responsive Products Per Row

*For any* viewport size, the products per row must conform to responsive constraints: mobile (width ≤ 768px) displays 1-2 products per row, tablet (769px ≤ width ≤ 1024px) displays 2-3 products per row, desktop (width ≥ 1025px) displays 3-4 products per row.

**Validates: Requirements 9.1, 9.2, 9.3**

### Property 29: Responsive Visual System Conformance

*For any* viewport size adjustment, all visual-system requirements must remain satisfied: black dominance (60-80%), gold scarcity (<5%), minimum spacing (24px between elements), maximum density (5-7 per viewport), hover states use deep red, and transition timing (150-500ms).

**Validates: Requirements 9.4**

### Property 30: Navigation Controls Avoid Numbered Pagination

*For any* navigation interface, the controls must not include numbered pagination links (1, 2, 3, 4...) and must instead use elegant controls (Previous/Next buttons, dot indicators, or "Page X of Y" text).

**Validates: Requirements 10.1**

### Property 31: Navigation Transitions Avoid Urgency

*For any* page transition between product sets, the transition must not include urgent loading indicators (fast-spinning spinners, progress bars with countdown, "Loading..." text with urgency), and must use subtle transitions (fade in/out, elegant loading states).

**Validates: Requirements 10.3**

### Property 32: Singular Call-to-Action Per Card

*For any* product card, the card must contain exactly one primary call-to-action (product selection/navigation to detail), and must not include competing CTAs such as "Add to wishlist", "Quick view", "Compare", or "Share" buttons.

**Validates: Requirements 11.1, 11.2, 11.3**

### Property 33: Collection Portals Remain Secondary

*For any* discovery view, collection portal controls must use smaller typography (Body Small or Caption), less prominent colors (near-black or muted gold, not deep red or purple when inactive), and be positioned away from primary product content (typically header), ensuring they remain secondary to product revelation.

**Validates: Requirements 11.4**

### Property 34: Limited Decision Points Per Viewport

*For any* viewport, the interactive elements must be limited to three categories: product selection (primary), navigation controls (optional secondary), and collection portal selection (optional secondary), with no other decision points or interactive elements present.

**Validates: Requirements 11.5**

## Error Handling

### Shopify Integration Errors

**Product Fetch Failures:**
- **Scenario**: Shopify API is unavailable or returns errors
- **Handling**: Display elegant error message ("Products are currently unavailable. Please return shortly.") in gothic typography with muted gold accent
- **Fallback**: Show cached products if available, or empty state with invitation to return
- **No urgency**: Avoid "Try again" buttons or countdown timers

**Missing Product Data:**
- **Scenario**: Product missing required fields (title, price, images)
- **Handling**: Log error, exclude product from display rather than showing incomplete card
- **Validation**: Validate product data completeness before rendering (Property 24)

**Image Loading Failures:**
- **Scenario**: Product image fails to load
- **Handling**: Display elegant placeholder with product title and price, maintain card spacing and layout
- **Fallback**: Use secondary image if available, or abstract gothic pattern placeholder
- **No broken image icons**: Use intentional placeholder design

### Layout and Rendering Errors

**Viewport Calculation Errors:**
- **Scenario**: Unable to determine viewport dimensions
- **Handling**: Default to desktop layout (3 products per row, 6 per viewport)
- **Fallback**: Use conservative spacing (32px between cards, 128px between sections)
- **Validation**: Ensure layout still passes visual-system conformance

**Density Violations:**
- **Scenario**: Product count exceeds viewport density limits
- **Handling**: Paginate products to maintain 5-7 per viewport
- **Validation**: Run density validation before rendering (Property 1)
- **No overflow**: Never allow more than 7 products per viewport

**Spacing Violations:**
- **Scenario**: Calculated spacing falls below minimums
- **Handling**: Reduce products per row or per viewport to maintain minimum spacing
- **Validation**: Run spacing validation before rendering (Property 3)
- **Priority**: Spacing requirements take precedence over product count

### Interaction Errors

**Hover State Failures:**
- **Scenario**: Hover state doesn't apply or applies incorrect color
- **Handling**: Log error, fall back to default state
- **Validation**: Validate hover colors before applying (Property 8)
- **Graceful degradation**: Product remains selectable even if hover state fails

**Navigation Failures:**
- **Scenario**: Page transition fails or product detail navigation fails
- **Handling**: Display elegant error message, maintain current view
- **Fallback**: Retry navigation once, then show error
- **No aggressive retries**: Avoid rapid retry loops that convey urgency

**Filter Application Errors:**
- **Scenario**: Filter fails to apply or returns no products
- **Handling**: For no results, show elegant empty state ("No products match this curation. Explore other collections.")
- **Fallback**: Clear filter and return to full product set
- **No urgency**: Avoid "Try different filters" with aggressive prompting

### Visual System Validation Errors

**Color Hierarchy Violations:**
- **Scenario**: Rendered view fails black dominance or gold scarcity checks
- **Handling**: Log critical error, adjust colors to meet requirements
- **Fallback**: Increase black usage, reduce gold usage
- **Block rendering**: In development, block rendering until fixed

**Forbidden Pattern Detection:**
- **Scenario**: Forbidden pattern detected (popup, countdown timer, scarcity message)
- **Handling**: Log critical error, remove forbidden pattern
- **Block rendering**: In development, block rendering until fixed
- **Zero tolerance**: Forbidden patterns must never reach production

**Transition Timing Violations:**
- **Scenario**: Transition duration outside 150-500ms range
- **Handling**: Clamp duration to valid range (min 150ms, max 500ms)
- **Validation**: Validate all transitions before applying (Property 13)
- **Graceful correction**: Adjust timing rather than failing

### Graceful Degradation Strategy

When errors occur, the system prioritizes:

1. **Maintain atmosphere**: Errors should never introduce urgency or pressure
2. **Preserve visual-system conformance**: Even error states must honor color, spacing, and interaction rules
3. **Provide elegant feedback**: Error messages use gothic typography and muted gold accents
4. **Enable recovery**: Provide clear path forward without aggressive prompting
5. **Log for improvement**: All errors logged for analysis, but never exposed to user in technical detail

## Testing Strategy

### Focused Testing Approach for Initial Implementation

For the initial product-discovery implementation, testing will focus on critical guardrails that protect the core experience. Comprehensive property-based testing will be deferred until after core commerce specs (product-detail, cart, checkout) are complete.

**Critical Guardrails (Must Test):**

1. **Color Palette Hierarchy**
   - Black dominance (60-80% of visual space)
   - Gold scarcity (<5% of visual space)
   - Deep red hover states on interactive elements
   - Deep purple for featured products

2. **Maximum Density**
   - Max 4 products per row
   - 5-7 products per viewport height
   - No infinite scroll patterns

3. **Singular Call-to-Action**
   - Exactly one primary CTA per product card (product selection)
   - No competing CTAs (wishlist, quick view, compare, share)

4. **Forbidden Patterns**
   - No popups
   - No discount banners
   - No countdown timers
   - No scarcity messaging ("Only X left")
   - No "Filter" language (use ritualized portal labels)

**Testing Implementation:**

**Unit Tests** (focused on critical guardrails):
```typescript
// Color hierarchy validation
test('discovery view maintains black dominance', () => {
  const view = renderDiscoveryView(mockProducts);
  const colorDistribution = calculateColorDistribution(view);
  expect(colorDistribution.black).toBeGreaterThanOrEqual(60);
  expect(colorDistribution.black).toBeLessThanOrEqual(80);
});

// Density validation
test('product grid respects maximum density', () => {
  const grid = renderProductGrid(mockProducts, mockViewport);
  const productsPerRow = getMaxProductsPerRow(grid);
  const productsPerViewport = getProductsPerViewport(grid, mockViewport);
  expect(productsPerRow).toBeLessThanOrEqual(4);
  expect(productsPerViewport).toBeGreaterThanOrEqual(5);
  expect(productsPerViewport).toBeLessThanOrEqual(7);
});

// Singular CTA validation
test('product card has exactly one primary CTA', () => {
  const card = renderProductCard(mockProduct);
  const primaryCTAs = getPrimaryCTAs(card);
  expect(primaryCTAs).toHaveLength(1);
  expect(primaryCTAs[0].action).toBe('navigate-to-detail');
});

// Forbidden patterns validation
test('discovery view contains no forbidden patterns', () => {
  const view = renderDiscoveryView(mockProducts);
  expect(detectPopups(view)).toHaveLength(0);
  expect(detectDiscountBanners(view)).toHaveLength(0);
  expect(detectCountdownTimers(view)).toHaveLength(0);
  expect(detectScarcityMessaging(view)).toHaveLength(0);
  expect(detectFilterLanguage(view)).toHaveLength(0);
});
```

**Property-Based Tests** (lightweight, critical properties only):
```typescript
// Feature: product-discovery, Property 2: Maximum Products Per Row
test('no row exceeds 4 products', () => {
  fc.assert(
    fc.property(
      arbitraryProductSet(),
      arbitraryViewport(),
      (products, viewport) => {
        const grid = renderProductGrid(products, viewport);
        const maxPerRow = getMaxProductsPerRow(grid);
        return maxPerRow <= 4;
      }
    ),
    { numRuns: 50 } // Reduced from 100 for initial implementation
  );
});

// Feature: product-discovery, Property 8: Interactive Elements Use Deep Red on Hover
test('interactive elements use deep red on hover', () => {
  fc.assert(
    fc.property(
      arbitraryProduct(),
      (product) => {
        const card = renderProductCard(product);
        const hoverColor = getHoverStateColor(card);
        return isDeepRedColor(hoverColor);
      }
    ),
    { numRuns: 50 }
  );
});
```

**Deferred Testing** (post-core-commerce-specs):
- Full 34 correctness properties with 100 iterations each
- Comprehensive visual-system conformance validation
- Real Shopify integration tests
- Visual regression testing
- Performance testing
- Accessibility testing

**Validation in Development:**
- Simple runtime validator that checks critical guardrails
- Console warnings for violations (non-blocking in development)
- Build-time validation for forbidden patterns (blocking)

**Success Criteria for Initial Implementation:**
- All 4 critical guardrails pass unit tests
- 2 critical properties pass property-based tests (50 iterations)
- No forbidden patterns detected
- Visual review confirms gothic-romantic aesthetic

## Implementation Notes

### Next.js Implementation Strategy

**Component Structure:**
```
app/
├── threshold/
│   ├── page.tsx (Discovery View - main entry point)
│   ├── components/
│   │   ├── ProductCard.tsx
│   │   ├── FeaturedProductCard.tsx
│   │   ├── ProductGrid.tsx
│   │   ├── FilterControls.tsx
│   │   └── NavigationControls.tsx
│   └── lib/
│       ├── shopify.ts (Shopify integration)
│       ├── visual-system-validator.ts
│       └── layout-calculator.ts
```

**Server Components vs Client Components:**
- **Server Components**: Discovery View (page.tsx), initial product fetching, Shopify integration
- **Client Components**: ProductCard (hover interactions), FilterControls (filter state), NavigationControls (page state)

**Data Fetching Strategy:**
- Use Next.js Server Components for initial product fetch (SSR for SEO)
- Use React Server Actions for filter application and pagination
- Cache Shopify responses with appropriate revalidation (ISR)

### Shopify Integration

**Shopify Storefront API:**
```typescript
// Use Shopify Storefront API (GraphQL)
const SHOPIFY_STOREFRONT_API = 'https://{shop}.myshopify.com/api/2024-01/graphql.json';

// Query for products with featured metadata
const PRODUCTS_QUERY = `
  query GetProducts($first: Int!, $after: String) {
    products(first: $first, after: $after) {
      edges {
        node {
          id
          title
          priceRange {
            minVariantPrice {
              amount
              currencyCode
            }
          }
          images(first: 5) {
            edges {
              node {
                url
                altText
                width
                height
              }
            }
          }
          description
          collections(first: 5) {
            edges {
              node {
                title
              }
            }
          }
          tags
          metafield(namespace: "custom", key: "featured") {
            value
          }
          metafield(namespace: "custom", key: "featured_reason") {
            value
          }
        }
      }
      pageInfo {
        hasNextPage
        endCursor
      }
    }
  }
`;
```

**Featured Product Detection:**
- Use Shopify metafields to mark products as featured
- Metafield namespace: `custom`
- Metafield keys: `featured` (boolean), `featured_reason` (enum)
- Transform Shopify data to internal Product model

### Styling Implementation

**CSS-in-JS with Tailwind:**
- Use Tailwind CSS for base styling
- Extend Tailwind config with visual-system color palette
- Use CSS modules for component-specific styles
- Implement visual-system spacing scale as Tailwind spacing utilities

**Visual System Color Palette in Tailwind:**
```typescript
// tailwind.config.ts
export default {
  theme: {
    extend: {
      colors: {
        foundation: {
          ink: '#000000',
          charcoal: '#0A0A0A',
          'near-black': '#1A1A1A',
        },
        ritual: {
          wine: '#4A0E0E',
          blood: '#6B1515',
          garnet: '#8B2020',
        },
        sanctuary: {
          plum: '#2D1B3D',
          aubergine: '#3D2550',
          velvet: '#4D3060',
        },
        emphasis: {
          'antique-gold': '#8B7355',
          'brushed-gold': '#9D8366',
          'aged-gold': '#7A6347',
        },
      },
      spacing: {
        'xs': '4px',
        'sm': '8px',
        'md': '16px',
        'lg': '24px',
        'xl': '32px',
        '2xl': '48px',
        '3xl': '64px',
        '4xl': '96px',
        '5xl': '128px',
      },
    },
  },
};
```

### Performance Optimization

**Image Optimization:**
- Use Next.js Image component for automatic optimization
- Implement progressive loading with elegant placeholders
- Use Shopify CDN for image delivery
- Lazy load images below the fold

**Code Splitting:**
- Split filter and navigation components (loaded on demand)
- Split visual-system validator (development only)
- Use dynamic imports for non-critical components

**Caching Strategy:**
- Cache Shopify product data with ISR (revalidate every 60 seconds)
- Cache featured product queries separately (revalidate every 300 seconds)
- Use React Server Components for automatic request deduplication

### Deployment Considerations

**Environment Variables:**
```
SHOPIFY_STORE_DOMAIN=charmed-and-dark.myshopify.com
SHOPIFY_STOREFRONT_ACCESS_TOKEN=<token>
NEXT_PUBLIC_ENABLE_VISUAL_SYSTEM_VALIDATION=true (development only)
```

**Build-Time Validation:**
- Run visual-system validation on all components during build
- Fail build if critical violations detected
- Generate conformance report for review

**Monitoring:**
- Track visual-system validation errors in production (should be zero)
- Monitor Shopify API response times and error rates
- Track user interactions (hover rates, click-through rates, filter usage)
- Monitor Core Web Vitals (LCP, FID, CLS) while maintaining atmosphere

### Migration from Existing Ecommerce

If migrating from existing ecommerce platform:

1. **Phase 1**: Implement product discovery with visual-system conformance
2. **Phase 2**: Migrate product data to Shopify, set up featured product metafields
3. **Phase 3**: Implement filters and navigation
4. **Phase 4**: A/B test against existing experience (measure revenue, not just clicks)
5. **Phase 5**: Full cutover once revenue metrics are positive

**Success Metrics:**
- Revenue per visitor (primary metric)
- Average order value
- Time spent in discovery (longer is better - indicates presence)
- Product detail view rate
- Cart abandonment rate (should be low due to no pressure)

**Anti-Metrics** (do not optimize for):
- Click-through rate (speed is not the goal)
- Bounce rate (contemplation is not bouncing)
- Pages per session (depth over breadth)
