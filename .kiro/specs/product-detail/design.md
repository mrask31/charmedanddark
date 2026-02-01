# Design Document: Product Detail

## Overview

Product Detail is the intimate encounter experience in the Threshold realm of Charmed & Dark. When a visitor selects a product from discovery, they enter a focused, contemplative space where a single object receives their full attention. This is NOT a conventional product page—it's a moment of connection with an object of meaning, where the visitor can appreciate imagery, understand narrative, and ultimately claim the object.

This design explicitly conforms to the Visual System spec (.kiro/specs/visual-system/) and builds naturally from the Product Discovery spec (.kiro/specs/product-discovery/). Every design decision references the visual-system properties it upholds and maintains continuity with discovery patterns.

**Core Design Principles:**
- **Intimate Single-Object Focus**: One product, full attention, no distractions
- **Image-Dominant Layout**: High-quality photography as the primary visual element
- **Poetic Narrative**: Description as story, not bullet points
- **Singular Claiming Action**: One primary decision (claim the object)
- **Ritual Interactions**: Hover states use deep red, transitions are subtle and elegant
- **Sanctuary Emphasis**: Featured products use deep purple to convey special significance
- **Fulfillment Invisibility**: Operational details remain hidden unless explicitly necessary
- **Cognitive Simplicity**: Variant selection (if applicable) and claiming action only

## Architecture

### System Structure

Product Detail is organized into five primary layers:

```
Product Detail
├── Data Layer
│   ├── Shopify Integration (product data source)
│   ├── Product Model (title, price, images, description, variants, metadata)
│   ├── Variant Model (size, color, material options)
│   └── Featured Product Designation (sanctuary-level products)
├── Presentation Layer
│   ├── Detail View (primary product encounter interface)
│   ├── Image Gallery (large-format photography presentation)
│   ├── Product Narrative (title, description, metadata)
│   ├── Variant Selector (elegant option selection)
│   └── Claiming Action (primary CTA)
├── Interaction Layer
│   ├── Hover States (deep red ritual moments)
│   ├── Image Transitions (subtle, elegant)
│   ├── Variant Selection (updates image, price, availability)
│   └── Claiming Feedback (subtle confirmation)
├── Navigation Layer
│   ├── Return to Discovery (elegant back navigation)
│   ├── State Preservation (maintain discovery context)
│   └── Post-Claiming Options (subtle next steps)
└── Validation Layer
    ├── Visual System Validator (color, spacing, density checks)
    ├── Exclusion Validator (forbidden pattern detection)
    └── Conformance Reporter (visual-system compliance)
```

### Data Flow

```
Shopify Backend
    ↓
Product Data Fetch (title, price, images, description, variants, metadata, featured flag)
    ↓
Product Model Transformation
    ↓
Featured Product Classification (sanctuary designation)
    ↓
Variant Model Construction (if variants exist)
    ↓
Detail View Rendering (visual-system conformance)
    ↓
Interaction Layer (hover/active states, variant selection)
    ↓
Claiming Action → Shopify Cart Integration
    ↓
Subtle Confirmation Feedback
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
  description: string; // Poetic narrative
  metadata: ProductMetadata;
  variants: ProductVariant[];
  isFeatured: boolean; // Sanctuary-level designation
  featuredReason?: FeaturedReason;
  availableForSale: boolean;
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
  materials?: string; // e.g., "Sterling silver, onyx"
  dimensions?: string; // e.g., "2.5cm × 1.8cm"
  care?: string; // e.g., "Polish gently with soft cloth"
}

interface ProductVariant {
  id: string;
  title: string; // e.g., "Small", "Medium", "Black", "Silver"
  price: number;
  availableForSale: boolean;
  selectedOptions: VariantOption[];
  image?: ProductImage; // Variant-specific image if available
}

interface VariantOption {
  name: string; // e.g., "Size", "Color", "Material"
  value: string; // e.g., "Medium", "Black", "Sterling Silver"
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
  fetchProductById(id: string): Promise<Product>;
  fetchProductByHandle(handle: string): Promise<Product>;
  
  // Cart integration
  addToCart(variantId: string, quantity: number): Promise<CartResponse>;
  
  // Variant availability
  checkVariantAvailability(variantId: string): Promise<boolean>;
}

interface CartResponse {
  success: boolean;
  cartId: string;
  lineItems: CartLineItem[];
  error?: string;
}

interface CartLineItem {
  id: string;
  variantId: string;
  quantity: number;
  title: string;
  price: number;
}
```

### Presentation Layer

#### Detail View

The Detail View is the primary interface for product encounter. It enforces visual-system conformance at the layout level.

```typescript
interface DetailView {
  product: Product;
  selectedVariant: ProductVariant | null;
  layout: DetailLayoutConfig;
  state: DetailViewState;
  
  // Rendering
  render(): ViewElement;
  
  // Validation
  validateVisualSystem(): ValidationResult;
}

interface DetailLayoutConfig {
  imagePosition: 'left' | 'top'; // Responsive: left on desktop, top on mobile
  imageSize: {
    width: number;
    height: number;
    aspectRatio: number; // Maintain 1:1 to 4:3
  };
  contentSpacing: {
    elementGap: number; // Min 24px per visual-system Property 8
    sectionGap: number; // Min 96px per visual-system Property 8
  };
  viewport: {
    width: number;
    height: number;
    breakpoint: 'mobile' | 'tablet' | 'desktop';
  };
  maxElementsPerViewport: number; // 5-7 per visual-system Property 9
}

interface DetailViewState {
  currentImageIndex: number;
  selectedVariantId: string | null;
  isClaimingInProgress: boolean;
  claimingFeedback: ClaimingFeedback | null;
  navigationContext: NavigationContext | null; // Preserve discovery state
}

interface ClaimingFeedback {
  type: 'success' | 'error';
  message: string; // Subtle, elegant messaging
  duration: number; // Brief display duration
}

interface NavigationContext {
  previousRoute: string;
  discoveryState: {
    activePortal: string | null;
    currentPage: number;
    scrollPosition: number;
  };
}
```

#### Image Gallery

The Image Gallery presents product photography as the dominant visual element with elegant transitions.

```typescript
interface ImageGallery {
  images: ProductImage[];
  currentIndex: number;
  layout: ImageGalleryLayout;
  
  // Image navigation
  nextImage(): void;
  previousImage(): void;
  selectImage(index: number): void;
  
  // Rendering
  render(): GalleryElement;
  
  // Validation
  validateImageDominance(): boolean; // Image must be largest element
  validateTransitions(): TransitionValidation;
}

interface ImageGalleryLayout {
  primaryImageSize: {
    width: number;
    height: number;
  };
  thumbnailDisplay: 'dots' | 'minimal-strip' | 'none'; // No conventional thumbnail carousel
  transitionConfig: TransitionConfig;
  spacing: {
    imagePadding: number; // Min 24px
    thumbnailGap: number; // If thumbnails present
  };
}

interface TransitionConfig {
  duration: number; // 150-500ms per visual-system Property 11
  easing: 'ease-in-out' | 'ease-out';
  effect: 'fade' | 'slide'; // Subtle effects only
}
```

#### Product Narrative

The Product Narrative presents title, description, price, and metadata with elegant typography and spacing.

```typescript
interface ProductNarrative {
  product: Product;
  selectedVariant: ProductVariant | null;
  typography: NarrativeTypography;
  
  // Rendering
  render(): NarrativeElement;
  
  // Validation
  validateTypography(): TypographyValidation;
  validateTone(): ToneValidation; // No promotional language
}

interface NarrativeTypography {
  title: {
    fontSize: number; // 40px (H1) or 32px (H2)
    fontWeight: number;
    lineHeight: number;
    letterSpacing: number;
    color: Color; // Near-black or ink
  };
  description: {
    fontSize: number; // 16px (Body) or 20px (Body Large)
    fontWeight: number;
    lineHeight: number;
    color: Color; // Near-black
    format: 'paragraph'; // Not bullet points
  };
  price: {
    fontSize: number; // 20px (Body Large)
    fontWeight: number;
    color: Color; // Muted gold per visual-system Property 3
  };
  metadata: {
    fontSize: number; // 14px (Body Small)
    fontWeight: number;
    color: Color; // Charcoal
    spacing: number; // Min 24px between metadata items
  };
}

interface NarrativeElement {
  titleElement: Element;
  descriptionElement: Element;
  priceElement: Element;
  metadataElements: Element[]; // Materials, dimensions, care
  featuredLabel?: Element; // If featured product
}
```

#### Variant Selector

The Variant Selector presents product options elegantly without conventional dropdowns.

```typescript
interface VariantSelector {
  product: Product;
  selectedVariant: ProductVariant | null;
  variantOptions: VariantOptionGroup[];
  
  // Variant selection
  selectVariant(variantId: string): void;
  updateSelection(optionName: string, optionValue: string): void;
  
  // Rendering
  render(): SelectorElement;
  
  // Validation
  validateInteraction(): InteractionValidation; // Deep red hover states
  validateAvailabilityDisplay(): AvailabilityValidation; // Elegant unavailability
}

interface VariantOptionGroup {
  name: string; // e.g., "Size", "Shade", "Material"
  options: VariantOptionItem[];
  selectedValue: string | null;
}

interface VariantOptionItem {
  value: string; // e.g., "Medium", "Black", "Sterling Silver"
  availableForSale: boolean;
  visualStyle: OptionVisualStyle;
}

interface OptionVisualStyle {
  defaultColor: Color; // Near-black
  hoverColor: Color; // Deep red per visual-system Property 10
  selectedColor: Color; // Deep red or deep purple for featured
  unavailableOpacity: number; // 0.4 for unavailable options
  transition: TransitionConfig; // 150-500ms
}

interface SelectorElement {
  optionGroups: OptionGroupElement[];
  layout: 'horizontal' | 'vertical'; // Elegant button groups, not dropdowns
  spacing: number; // Min 24px between option groups
}
```

#### Claiming Action

The Claiming Action is the primary CTA for acquiring the product.

```typescript
interface ClaimingAction {
  product: Product;
  selectedVariant: ProductVariant | null;
  state: ClaimingState;
  visualStyle: ClaimingVisualStyle;
  
  // Claiming
  claim(): Promise<ClaimingResult>;
  
  // Rendering
  render(): ButtonElement;
  
  // Validation
  validateSingularity(): boolean; // Exactly one primary CTA
  validateLanguage(): LanguageValidation; // Ritualized language
  validateInteraction(): InteractionValidation; // Deep red hover
}

type ClaimingState = 'default' | 'hover' | 'active' | 'claiming' | 'success' | 'error';

interface ClaimingVisualStyle {
  defaultColor: Color; // Near-black or charcoal
  hoverColor: Color; // Deep red per visual-system Property 10
  activeColor: Color; // Blood red
  disabledColor: Color; // Near-black with reduced opacity
  transition: TransitionConfig; // 300ms ease-in-out
  buttonText: string; // "Claim", "Acquire", "Make Yours"
  successText: string; // "Claimed", "Yours"
  errorText: string; // "Unable to claim"
}

interface ClaimingResult {
  success: boolean;
  cartId?: string;
  error?: string;
  feedback: ClaimingFeedback;
}
```

### Interaction Layer

#### Hover State Handler

```typescript
interface HoverStateHandler {
  // Apply ritual moment styling
  applyHoverState(element: InteractiveElement): void;
  removeHoverState(element: InteractiveElement): void;
  
  // Validation
  validateHoverColor(color: Color): boolean; // Must be deep red
  validateTransition(transition: TransitionConfig): boolean; // 150-500ms
}

type InteractiveElement = 
  | ClaimingAction
  | VariantOptionItem
  | NavigationControl
  | ImageNavigationControl;
```

#### Variant Selection Handler

```typescript
interface VariantSelectionHandler {
  // Handle variant changes
  onVariantChange(variantId: string): void;
  updateProductDisplay(variant: ProductVariant): void;
  
  // Update image, price, availability
  updateImage(variant: ProductVariant): void;
  updatePrice(variant: ProductVariant): void;
  updateAvailability(variant: ProductVariant): void;
  
  // Validation
  validateTransition(): TransitionValidation; // Subtle transitions
}
```

#### Claiming Feedback Handler

```typescript
interface ClaimingFeedbackHandler {
  // Provide subtle confirmation
  showSuccessFeedback(result: ClaimingResult): void;
  showErrorFeedback(error: string): void;
  clearFeedback(): void;
  
  // Validation
  validateFeedbackSubtlety(): boolean; // No popups, no aggressive messages
}
```

### Navigation Layer

#### Return Navigation

```typescript
interface ReturnNavigation {
  navigationContext: NavigationContext | null;
  
  // Navigate back to discovery
  returnToDiscovery(): void;
  preserveDiscoveryState(): void;
  
  // Rendering
  render(): NavigationElement;
  
  // Validation
  validateLanguage(): LanguageValidation; // No "Continue shopping"
  validateInteraction(): InteractionValidation; // Deep red hover
}

interface NavigationElement {
  backButton: ButtonElement;
  breadcrumb?: BreadcrumbElement;
  visualStyle: NavigationVisualStyle;
}

interface NavigationVisualStyle {
  defaultColor: Color; // Muted gold or near-black
  hoverColor: Color; // Deep red per visual-system Property 10
  fontSize: number; // 14px (Body Small)
  spacing: number; // Min 24px from other elements
}
```

#### Post-Claiming Navigation

```typescript
interface PostClaimingNavigation {
  // Provide elegant next steps
  showPostClaimingOptions(): void;
  
  // Navigation options
  viewCart(): void; // "Continue to sanctuary"
  continueExploring(): void; // "View collection"
  
  // Rendering
  render(): PostClaimingElement;
  
  // Validation
  validateSubtlety(): boolean; // No aggressive prompts, no urgency
}

interface PostClaimingElement {
  cartLink?: LinkElement; // Optional, subtle - "Proceed"
  collectionLink?: LinkElement; // Optional, subtle - "View collection"
  visualStyle: PostClaimingVisualStyle;
}

interface PostClaimingVisualStyle {
  linkColor: Color; // Muted gold
  hoverColor: Color; // Deep red
  fontSize: number; // 14px (Body Small)
  display: 'subtle'; // Not prominent buttons
}
```

### Validation Layer

#### Visual System Validator

```typescript
interface VisualSystemValidator {
  // Color validation
  validateColorHierarchy(view: DetailView): ColorValidation;
  validateGoldUsage(view: DetailView): GoldValidation;
  validateHoverColors(elements: InteractiveElement[]): HoverValidation;
  
  // Spacing validation
  validateSpacing(view: DetailView): SpacingValidation;
  validateDensity(view: DetailView): DensityValidation;
  
  // Interaction validation
  validateTransitions(elements: InteractiveElement[]): TransitionValidation;
  
  // Image validation
  validateImageDominance(view: DetailView): ImageDominanceValidation;
  
  // Comprehensive validation
  validateFullConformance(view: DetailView): ConformanceReport;
}

interface ImageDominanceValidation {
  isValid: boolean;
  imagePercentage: number; // Image should be largest element
  violations: string[];
}
```

#### Exclusion Validator

```typescript
interface ExclusionValidator {
  // Forbidden pattern detection
  detectPopups(view: DetailView): boolean;
  detectDiscountBadges(view: DetailView): boolean;
  detectCountdownTimers(view: DetailView): boolean;
  detectScarcityMechanics(view: DetailView): boolean;
  detectCompetingCTAs(view: DetailView): boolean;
  detectRelatedProducts(view: DetailView): boolean;
  detectAggressiveImageViewers(gallery: ImageGallery): boolean;
  detectFulfillmentMessaging(view: DetailView): boolean;
  detectShippingUrgency(view: DetailView): boolean;
  
  // Forbidden language detection
  detectForbiddenPhrases(text: string): string[];
  
  // Comprehensive validation
  validateExclusions(view: DetailView): ExclusionReport;
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
  variants: ProductVariant[];
  isFeatured: boolean;
  featuredReason?: FeaturedReason;
  availableForSale: boolean;
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
  materials?: string;
  dimensions?: string;
  care?: string;
}

interface ProductVariant {
  id: string;
  title: string;
  price: number;
  availableForSale: boolean;
  selectedOptions: VariantOption[];
  image?: ProductImage;
}

interface VariantOption {
  name: string;
  value: string;
}

type FeaturedReason = 
  | 'limited-drop'
  | 'seasonal-ritual'
  | 'narrative-importance'
  | 'curated-emphasis';
```

### View State Model

```typescript
// Detail view state
interface DetailViewState {
  productId: string;
  currentImageIndex: number;
  selectedVariantId: string | null;
  isClaimingInProgress: boolean;
  claimingFeedback: ClaimingFeedback | null;
  navigationContext: NavigationContext | null;
  viewport: Viewport;
}

interface ClaimingFeedback {
  type: 'success' | 'error';
  message: string;
  duration: number;
}

interface NavigationContext {
  previousRoute: string;
  discoveryState: {
    activePortal: string | null;
    currentPage: number;
    scrollPosition: number;
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
// Interactive element state
interface InteractionState {
  elementId: string;
  elementType: 'claiming-action' | 'variant-option' | 'navigation' | 'image-nav';
  currentState: ElementState;
  previousState: ElementState;
  transitionStartTime: number;
  isTransitioning: boolean;
}

type ElementState = 'default' | 'hover' | 'active' | 'disabled';
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
    fontSize: number; // 40px (H1) or 32px (H2)
    fontWeight: number;
    lineHeight: number;
    letterSpacing: number;
    color: string;
  };
  productDescription: {
    fontSize: number; // 16px (Body) or 20px (Body Large)
    fontWeight: number;
    lineHeight: number;
    color: string;
  };
  productPrice: {
    fontSize: number; // 20px (Body Large)
    fontWeight: number;
    color: string; // Muted gold
  };
  metadata: {
    fontSize: number; // 14px (Body Small)
    fontWeight: number;
    color: string;
  };
  claimingAction: {
    fontSize: number; // 16px (Body)
    fontWeight: number;
    color: string;
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
    imageChange: TransitionConfig;
    variantChange: TransitionConfig;
  };
  transforms: {
    hoverScale: number; // 1.02 (subtle)
    activeScale: number; // 0.98
  };
}
```

## Responsive Layout Strategy

### Breakpoint Configuration

```typescript
interface ResponsiveConfig {
  breakpoints: {
    mobile: {
      maxWidth: 768;
      layout: 'stacked'; // Image top, content below
      imageSize: 'full-width';
      maxElementsPerViewport: 5;
    };
    tablet: {
      minWidth: 769;
      maxWidth: 1024;
      layout: 'stacked' | 'side-by-side';
      imageSize: '60%';
      maxElementsPerViewport: 6;
    };
    desktop: {
      minWidth: 1025;
      layout: 'side-by-side'; // Image left, content right
      imageSize: '50-60%';
      maxElementsPerViewport: 7;
    };
  };
  
  // Spacing remains constant across breakpoints
  spacingMultipliers: {
    mobile: 1.0;
    tablet: 1.0;
    desktop: 1.0;
  };
}
```

### Layout Calculation

The layout system calculates optimal element placement based on viewport size while maintaining visual-system conformance:

1. **Determine breakpoint** from viewport width
2. **Calculate image size** (dominant element, 50-60% of viewport on desktop)
3. **Position content** (right of image on desktop, below image on mobile)
4. **Validate density** (5-7 elements per viewport height)
5. **Apply spacing** (min 24px between elements, 96px between sections)
6. **Render view** with visual-system conformance

## Image Presentation Strategy

### Image Gallery Patterns

**Single Image:**
- Display as large-format, dominant visual element
- Minimum 800x800 pixels
- Maintain aspect ratio (1:1 to 4:3)
- Center in image area with generous padding

**Multiple Images:**
- Primary image displayed large
- Secondary images accessible via subtle navigation
- No thumbnail carousel (use minimal dots or subtle strip)
- Transition between images with fade (300ms, ease-in-out)
- No zoom overlays or aggressive viewers

**Image Navigation:**
- Subtle arrow controls or dot indicators
- Deep red hover states on navigation controls
- Keyboard navigation support (arrow keys)
- Swipe gestures on touch devices

### Image Transitions

```typescript
interface ImageTransitionConfig {
  duration: 300; // milliseconds
  easing: 'ease-in-out';
  effect: 'fade'; // Subtle fade, not slide
  preload: true; // Preload next/previous images
}
```

## Variant Selection Strategy

### Variant Presentation Patterns

**No Variants:**
- Display single claiming action
- No variant selector needed

**Single Variant Type (e.g., Size only):**
- Display elegant button group for sizes
- Horizontal layout on desktop, vertical on mobile
- Deep red hover states
- Selected option uses deep red or deep purple (if featured)

**Multiple Variant Types (e.g., Size and Color):**
- Display separate button groups for each type
- Vertical stacking with 96px spacing between groups
- Each group labeled with ritualized language ("Size", "Shade", "Material")
- Maintain visual-system interaction behaviors

**Unavailable Variants:**
- Reduce opacity to 0.4
- Add subtle "Unavailable" label
- No aggressive X marks or red strikethrough
- Still display option (don't hide completely)

### Variant Selection Behavior

```typescript
interface VariantSelectionBehavior {
  // When variant selected
  onVariantSelect(variantId: string): void {
    // 1. Update selected variant state
    // 2. Update product image (if variant has specific image)
    // 3. Update price (if variant has different price)
    // 4. Update availability status
    // 5. All updates use subtle transitions (300ms fade)
  }
  
  // Validation
  validateTransitions(): boolean; // All transitions 150-500ms
  validateHoverStates(): boolean; // All hover states use deep red
}
```

## Claiming Action Strategy

### Claiming Button Behavior

**Default State:**
- Text: "Claim", "Acquire", or "Make Yours"
- Color: Near-black or charcoal background
- Border: Muted gold (subtle)
- Typography: 16px (Body), medium weight

**Hover State:**
- Color transitions to deep red (wine/blood)
- Transition: 300ms ease-in-out
- Subtle scale: 1.02x (optional)

**Active State:**
- Color: Blood red
- Scale: 0.98x
- Transition: 150ms ease-out

**Claiming In Progress:**
- Text: "Claiming..." or subtle loading indicator
- Disabled state (no hover)
- No aggressive spinners

**Success State:**
- Text: "Claimed" or "Yours"
- Brief color confirmation (deep red or muted gold)
- Duration: 2-3 seconds
- No popup, no aggressive success message

**Error State:**
- Text: "Unable to claim"
- Elegant error message below button
- No technical details
- No aggressive retry prompts

### Post-Claiming Experience

```typescript
interface PostClaimingExperience {
  // After successful claiming
  onClaimSuccess(result: ClaimingResult): void {
    // 1. Show subtle success feedback (2-3 seconds)
    // 2. Update button text to "Claimed" or "Yours"
    // 3. Optionally show subtle post-claiming links:
    //    - "Proceed" (cart/checkout)
    //    - "View collection" (return to discovery)
    // 4. Do NOT auto-navigate
    // 5. Do NOT show aggressive "View cart" popup
    // 6. Do NOT refer to cart as "Sanctuary" (Sanctuary is members-only)
  }
  
  // Validation
  validateSubtlety(): boolean; // No popups, no aggressive prompts
  validateLanguage(): boolean; // No urgency language, no "Sanctuary" for cart
}
```

## Navigation and Context Preservation

### Return to Discovery

**Navigation Pattern:**
- Elegant back button or breadcrumb
- Text: "Return to threshold" or "← Discovery"
- Position: Top of view, subtle
- Deep red hover state

**State Preservation:**
- Preserve discovery filter/portal selection
- Preserve page number
- Preserve scroll position (if possible)
- Smooth transition back to discovery

### Breadcrumb Pattern

```
Threshold > [Collection Name] > [Product Title]
```

- Subtle typography (14px Body Small)
- Muted gold color
- Deep red hover on clickable segments
- Separator: ">" or "·"

## Fulfillment Model Invisibility

### Operational Details Hidden

**What Remains Invisible:**
- Fulfillment method (dropshipping vs in-house)
- Warehouse location
- "Ships from" messaging
- Inventory countdown tied to fulfillment
- "Ships today" or shipping urgency language

**What May Be Visible (If Necessary):**
- Availability status only (elegant language: "Currently unavailable" or "Awaiting return")
- No delivery timeframes, no shipping information by default

**Inventory Status Handling:**
- Available: No messaging needed (claiming action enabled)
- Low stock: No "Only X left" messaging
- Out of stock: "Currently unavailable" or "Awaiting return"
- No backordered status or lead-time messaging

**Delivery Information:**
- Delivery information is invisible by default
- If shipping info must be shown (rare cases), it must be generic, calm, and non-specific
- No dates, no timeframe ranges, no operational details
- No "Delivery within X days" or "Arrives by [date]" messaging


## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system—essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

### Property Reflection

After analyzing all acceptance criteria, I identified the following redundancies:

- **Single product display (1.1) and no competing CTAs (1.4, 8.5, 14.1, 14.3)** can be consolidated into a comprehensive "Singular Focus" property
- **Featured product colors (2.3, 6.1)** are duplicates - consolidate into one property
- **Hover state colors (2.4, 7.2, 9.3, 10.3)** all test the same pattern - consolidate
- **Spacing requirements (1.3, 3.4, 4.4)** share the same validation pattern - consolidate
- **Forbidden pattern detection (8.1-8.4, 13.2-13.4)** can be consolidated into comprehensive exclusion properties
- **Claiming confirmation (5.4, 12.1)** are duplicates - consolidate
- **Fulfillment invisibility (9.6, 13.1)** are duplicates - consolidate
- **Variant selector patterns (9.2, 10.1)** are duplicates - consolidate

The following properties represent the unique, non-redundant validation rules:

### Property 1: Singular Product Focus

*For any* product detail view, the view must display exactly one product, exactly one primary call-to-action (claiming action), and zero competing product suggestions, related products sections, or competing CTAs (wishlist, compare, share).

**Validates: Requirements 1.1, 1.4, 5.1, 8.5, 14.1, 14.3**

### Property 2: Maximum Layout Density

*For any* product detail view and viewport configuration, the number of distinct visual elements per viewport height must be between 5 and 7, ensuring intimate atmosphere.

**Validates: Requirements 1.2, 11.2**

### Property 3: Minimum Spacing Requirements

*For any* product detail layout, all adjacent elements must have at least 24px spacing between them, major sections must have at least 96px vertical spacing, and product images must have at least 24px spacing from surrounding elements.

**Validates: Requirements 1.3, 3.4, 4.4**

### Property 4: Black Color Dominance

*For any* rendered product detail view, black and near-black tones (ink, charcoal, near-black) must occupy between 60% and 80% of the total visual space.

**Validates: Requirements 2.1**

### Property 5: Gold Scarcity

*For any* rendered product detail view, muted gold colors (antique-gold, brushed-gold, aged-gold) must occupy less than 5% of the total visual space.

**Validates: Requirements 2.2**

### Property 6: Featured Products Use Deep Purple

*For any* product marked as featured (isFeatured = true), the rendered product detail view must use colors from the deep purple family (plum, aubergine, velvet) for visual distinction elements (borders, accents, labels).

**Validates: Requirements 2.3, 6.1**

### Property 7: Interactive Elements Use Deep Red on Hover

*For any* interactive element (claiming action, variant option, navigation control, image navigation), when in hover state, the element's color must transition to a color from the deep red family (wine, blood, garnet).

**Validates: Requirements 2.4, 5.3, 7.2, 9.3, 10.3**

### Property 8: Color Brightness and Saturation Limits

*For any* color used in product detail interfaces, the HSL saturation must not exceed 40% and the lightness must not exceed 60%, preventing bright, saturated, or neon colors.

**Validates: Requirements 2.5**

### Property 9: Image Dominance

*For any* product detail view, the product image must be the largest visual element, occupying more space than any other single element (title, description, price, claiming action).

**Validates: Requirements 3.1**

### Property 10: No Aggressive Image Viewers

*For any* product detail view with multiple images, the image presentation must not contain thumbnail carousels, zoom overlays, 360-degree viewers, or rapid image cycling mechanisms.

**Validates: Requirements 3.2, 3.5**

### Property 11: Image Transition Timing

*For any* image transition (switching between product images), the transition duration must be between 150ms and 500ms with ease-in-out or ease-out easing.

**Validates: Requirements 3.3**

### Property 12: Product Title Typography Conformance

*For any* rendered product title, the font size must be either 40px (H1) or 32px (H2) from the visual-system type scale.

**Validates: Requirements 4.1**

### Property 13: Description Format Validation

*For any* product description, the description must be presented in paragraph form (not bullet points), and must not contain HTML list elements (ul, ol, li).

**Validates: Requirements 4.2**

### Property 14: Product Price Color Assignment

*For any* rendered product price, the text color must be from the muted gold family (antique-gold, brushed-gold, aged-gold), providing elegant emphasis.

**Validates: Requirements 4.3**

### Property 15: Forbidden Phrase Detection

*For any* text content in product detail interfaces (product title, description, button labels, navigation text), the text must not contain forbidden phrases including "Buy now", "Add to cart", "Limited time", "Best seller", "Don't miss out", "Only X left", "Ships today", "Order within X hours", "Continue shopping", or other promotional/urgent language.

**Validates: Requirements 4.5, 5.2, 7.1, 7.3, 13.2**

### Property 16: Claiming Action Ritualized Language

*For any* claiming action button, the button text must use approved ritualized terms ("Claim", "Acquire", "Make Yours") and must not use transactional terms ("Add to cart", "Buy now", "Purchase").

**Validates: Requirements 5.2**

### Property 17: Claiming Hover Transition Timing

*For any* claiming action hover interaction, the color transition must complete within 300ms using ease-in-out easing, creating a ritual moment.

**Validates: Requirements 5.3**

### Property 18: Subtle Claiming Confirmation

*For any* successful claiming action, the confirmation feedback must not include popups, modal dialogs, or aggressive success messages, and must use subtle text confirmation or brief color transitions lasting 2-3 seconds.

**Validates: Requirements 5.4, 12.1**

### Property 19: Featured Product Label Terminology

*For any* featured product label, the label text must use approved terms ("Featured", "Beloved", "Sanctuary") and must not use promotional terms ("Best seller", "Top rated", "Popular").

**Validates: Requirements 6.2**

### Property 20: Featured Product Spacing Conformance

*For any* featured product detail view, the view must maintain all minimum spacing requirements (24px between elements, 96px between sections) and density limits (5-7 elements per viewport) while providing visual emphasis through color.

**Validates: Requirements 6.3**

### Property 21: Discovery State Preservation

*For any* navigation from product detail back to discovery, the system must preserve the previous discovery state including active portal selection, current page number, and scroll position (when technically feasible).

**Validates: Requirements 7.4**

### Property 22: Comprehensive Forbidden Pattern Detection

*For any* product detail interface, the view must not contain any of the following forbidden patterns: popups, discount badges, promotional banners, countdown timers, scarcity messaging (e.g., "Only X left"), competing CTAs (wishlist, compare, share), aggressive image zoom overlays, aggressive success messages, or pressure energy patterns (urgent language, aggressive animations with duration < 100ms, excessive color saturation > 40%).

**Validates: Requirements 8.1, 8.2, 8.3, 8.4, 8.5, 8.6**

### Property 23: Shopify Product Data Completeness

*For any* product fetched from Shopify, the product data must include all required fields: id, title, price, images (at least one), description, variants (array, may be empty), and metadata (collection, tags).

**Validates: Requirements 9.1**

### Property 24: Variant Selector Without Dropdowns

*For any* product with variants, the variant selection interface must not use conventional dropdown menus (select elements), and must instead use elegant button groups or custom selection controls.

**Validates: Requirements 9.2, 10.1**

### Property 25: Graceful Inventory Status Handling

*For any* product that is out of stock or unavailable, the inventory status messaging must use elegant language ("Currently unavailable", "Awaiting return") and must not include aggressive messaging, countdown timers, or "Notify me" aggressive prompts.

**Validates: Requirements 9.4**

### Property 26: Shopify Cart Integration

*For any* claiming action on an available product, the action must successfully add the selected variant to the Shopify cart and return a valid cart response.

**Validates: Requirements 9.5**

### Property 27: Fulfillment Method Invisibility

*For any* product detail view, the view must not contain fulfillment method messaging including "Ships from", warehouse location, fulfillment partner names, or operational fulfillment details unless explicitly necessary for delivery expectations.

**Validates: Requirements 9.6, 13.1, 13.4**

### Property 28: Variant Option Ritualized Labels

*For any* variant option group, the group label must use ritualized language (e.g., "Size", "Shade", "Material") and maintain gothic typography, avoiding generic labels like "Options" or "Select".

**Validates: Requirements 10.2**

### Property 29: Unavailable Variant Elegant Display

*For any* unavailable product variant, the variant option must be displayed with reduced opacity (0.4), an elegant "Unavailable" label, and must not use aggressive unavailability indicators (red X marks, strikethrough).

**Validates: Requirements 10.4**

### Property 30: Variant Selection Updates Display

*For any* variant selection change, the product detail view must update the product image (if variant has specific image), price (if variant has different price), and availability status, all with subtle transitions (150-500ms fade).

**Validates: Requirements 10.5**

### Property 31: Responsive Spacing Conformance

*For any* viewport size (mobile, tablet, desktop), the product detail view must maintain all minimum spacing requirements (24px between elements, 96px between sections) regardless of layout adjustments.

**Validates: Requirements 11.1**

### Property 32: Responsive Visual System Conformance

*For any* viewport size adjustment, all visual-system requirements must remain satisfied: black dominance (60-80%), gold scarcity (<5%), minimum spacing (24px between elements), maximum density (5-7 per viewport), hover states use deep red, and transition timing (150-500ms).

**Validates: Requirements 11.4**

### Property 33: No Auto-Navigation After Claiming

*For any* successful claiming action, the system must not automatically navigate away from the product detail view, and must not show aggressive "View cart" prompts or modal dialogs.

**Validates: Requirements 12.2**

### Property 34: Post-Claiming Options Without Urgency

*For any* post-claiming state, if navigation options are provided (view cart, continue exploring), the options must be presented as subtle links (not prominent buttons), must use elegant language without urgency, and must not include countdown timers or "Complete your order now" messaging.

**Validates: Requirements 12.3**

### Property 35: Elegant Error Messaging

*For any* claiming action failure, the error message must use elegant language without technical details, must not include aggressive retry prompts, and must follow visual-system tone guidelines.

**Validates: Requirements 12.4**

### Property 36: Shipping Urgency Exclusion

*For any* product detail view, the view must not contain shipping urgency language including "Ships today", "Order within X hours", "Fast shipping", "Get it by [date]", or countdown timers related to shipping.

**Validates: Requirements 13.2**

### Property 37: Inventory Countdown Exclusion

*For any* product detail view, the view must not contain inventory countdown messaging including "Only X left in stock", "Low inventory", "Almost gone", or scarcity mechanics tied to fulfillment method.

**Validates: Requirements 13.3**

### Property 38: No Default Delivery Information

*For any* product detail view, delivery information must be invisible by default, and if shipping info must be shown (rare cases), it must be generic, calm, and non-specific with no dates, no timeframe ranges, and no operational details.

**Validates: Requirements 13.5**

### Property 39: Limited Decision Points

*For any* product detail view, the interactive decision points must be limited to exactly two categories: variant selection (if variants exist) and claiming action, with no other decision points or interactive elements beyond navigation.

**Validates: Requirements 14.5**

## Error Handling

### Shopify Integration Errors

**Product Fetch Failures:**
- **Scenario**: Shopify API is unavailable or returns errors
- **Handling**: Display elegant error message ("This object is currently unavailable. Please return shortly.") in gothic typography with muted gold accent
- **Fallback**: Redirect to discovery with elegant error state
- **No urgency**: Avoid "Try again" buttons or countdown timers

**Missing Product Data:**
- **Scenario**: Product missing required fields (title, price, images)
- **Handling**: Log error, redirect to discovery with elegant error message
- **Validation**: Validate product data completeness before rendering (Property 23)

**Image Loading Failures:**
- **Scenario**: Product image fails to load
- **Handling**: Display elegant placeholder with product title and price, maintain layout spacing
- **Fallback**: Use secondary image if available, or abstract gothic pattern placeholder
- **No broken image icons**: Use intentional placeholder design

**Variant Data Errors:**
- **Scenario**: Variant data is malformed or incomplete
- **Handling**: Hide variant selector, display product with default variant
- **Fallback**: Allow claiming with default variant if available

### Claiming Action Errors

**Cart Integration Failures:**
- **Scenario**: Shopify cart API fails or returns error
- **Handling**: Display elegant error message below claiming action
- **Message**: "Unable to claim at this moment. Please try again shortly."
- **No aggressive retries**: Single retry attempt, then show error
- **No technical details**: Hide API error codes from visitor

**Variant Not Selected:**
- **Scenario**: Visitor attempts to claim without selecting required variant
- **Handling**: Highlight variant selector with subtle animation
- **Message**: "Please select [variant type] before claiming"
- **No aggressive alerts**: Subtle inline message, no popup

**Product Unavailable:**
- **Scenario**: Product becomes unavailable between page load and claiming attempt
- **Handling**: Update claiming action to disabled state
- **Message**: "Currently unavailable"
- **Graceful**: No aggressive "Out of stock" messaging

### Navigation Errors

**State Preservation Failures:**
- **Scenario**: Unable to preserve discovery state on return navigation
- **Handling**: Return to discovery default state (all products, page 1)
- **Graceful**: No error message, seamless transition
- **Log**: Log state preservation failure for debugging

**Invalid Product ID:**
- **Scenario**: Product ID in URL is invalid or product doesn't exist
- **Handling**: Redirect to discovery with elegant error message
- **Message**: "This object could not be found. Explore our collection."
- **No 404 page**: Use elegant error state within Threshold aesthetic

### Image Gallery Errors

**Image Transition Failures:**
- **Scenario**: Image transition animation fails or stutters
- **Handling**: Fall back to instant image swap (no transition)
- **Graceful**: Maintain functionality even if animation fails
- **Log**: Log transition failure for debugging

**Image Preload Failures:**
- **Scenario**: Next/previous images fail to preload
- **Handling**: Load images on demand when selected
- **Graceful**: May have brief loading delay, but maintain elegant experience
- **No loading spinners**: Use subtle fade-in when image loads

### Variant Selection Errors

**Variant Availability Check Failures:**
- **Scenario**: Unable to check variant availability in real-time
- **Handling**: Allow selection, validate availability on claiming attempt
- **Fallback**: Use cached availability data if available
- **Graceful**: No error message unless claiming fails

**Variant Image Update Failures:**
- **Scenario**: Variant-specific image fails to load
- **Handling**: Keep displaying current image (don't show broken image)
- **Fallback**: Use primary product image
- **Graceful**: Maintain visual continuity

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

**Spacing Violations:**
- **Scenario**: Calculated spacing falls below minimums
- **Handling**: Adjust layout to maintain minimum spacing
- **Priority**: Spacing requirements take precedence over element size
- **Fallback**: Reduce element sizes or adjust layout to meet spacing rules

### Graceful Degradation Strategy

When errors occur, the system prioritizes:

1. **Maintain atmosphere**: Errors should never introduce urgency or pressure
2. **Preserve visual-system conformance**: Even error states must honor color, spacing, and interaction rules
3. **Provide elegant feedback**: Error messages use gothic typography and muted gold accents
4. **Enable recovery**: Provide clear path forward without aggressive prompting
5. **Log for improvement**: All errors logged for analysis, but never exposed to visitor in technical detail

## Testing Strategy

### Focused Testing Approach for Initial Implementation

For the initial product-detail implementation, testing will focus on critical guardrails that protect the core experience. Comprehensive property-based testing will be deferred until after core commerce specs (cart, checkout) are complete.

**Critical Guardrails (Must Test):**

1. **Color Palette Hierarchy**
   - Black dominance (60-80% of visual space)
   - Gold scarcity (<5% of visual space)
   - Deep red hover states on interactive elements
   - Deep purple for featured products

2. **Spacing and Density Minimums**
   - Minimum 24px spacing between elements
   - Minimum 96px spacing between major sections
   - Maximum 5-7 elements per viewport height

3. **Singular Call-to-Action**
   - Exactly one primary CTA (claiming action)
   - No competing CTAs (wishlist, compare, share, related products)

4. **Forbidden Patterns**
   - No popups
   - No discount badges or promotional banners
   - No countdown timers
   - No scarcity messaging ("Only X left")
   - No shipping urgency ("Ships today", "Order within X hours")
   - No fulfillment messaging ("Ships from", warehouse location)
   - No delivery timeframes by default

**Testing Implementation:**

**Unit Tests** (focused on critical guardrails):
```typescript
// Color hierarchy validation
test('product detail view maintains black dominance', () => {
  const view = renderProductDetailView(mockProduct);
  const colorDistribution = calculateColorDistribution(view);
  expect(colorDistribution.black).toBeGreaterThanOrEqual(60);
  expect(colorDistribution.black).toBeLessThanOrEqual(80);
});

// Spacing and density validation
test('product detail view respects spacing minimums', () => {
  const view = renderProductDetailView(mockProduct);
  const spacingViolations = checkSpacingViolations(view);
  expect(spacingViolations).toHaveLength(0);
});

test('product detail view respects density limits', () => {
  const view = renderProductDetailView(mockProduct, mockViewport);
  const elementsPerViewport = getElementsPerViewport(view, mockViewport);
  expect(elementsPerViewport).toBeGreaterThanOrEqual(5);
  expect(elementsPerViewport).toBeLessThanOrEqual(7);
});

// Singular CTA validation
test('product detail view has exactly one primary CTA', () => {
  const view = renderProductDetailView(mockProduct);
  const primaryCTAs = getPrimaryCTAs(view);
  expect(primaryCTAs).toHaveLength(1);
  expect(primaryCTAs[0].action).toBe('claim-product');
});

// Forbidden patterns validation
test('product detail view contains no forbidden patterns', () => {
  const view = renderProductDetailView(mockProduct);
  expect(detectPopups(view)).toHaveLength(0);
  expect(detectDiscountBadges(view)).toHaveLength(0);
  expect(detectCountdownTimers(view)).toHaveLength(0);
  expect(detectScarcityMessaging(view)).toHaveLength(0);
  expect(detectShippingUrgency(view)).toHaveLength(0);
  expect(detectFulfillmentMessaging(view)).toHaveLength(0);
  expect(detectDefaultDeliveryInfo(view)).toBe(false);
});
```

**Property-Based Tests** (lightweight, critical properties only):
```typescript
// Feature: product-detail, Property 4: Black Dominance
test('black dominance across all products', () => {
  fc.assert(
    fc.property(
      arbitraryProduct(),
      arbitraryViewport(),
      (product, viewport) => {
        const view = renderProductDetailView(product, viewport);
        const colorDistribution = calculateColorDistribution(view);
        const blackPercentage = colorDistribution.black + colorDistribution.nearBlack;
        return blackPercentage >= 60 && blackPercentage <= 80;
      }
    ),
    { numRuns: 50 } // Reduced from 100 for initial implementation
  );
});

// Feature: product-detail, Property 7: Deep Red Hover States
test('interactive elements use deep red on hover', () => {
  fc.assert(
    fc.property(
      arbitraryProduct(),
      (product) => {
        const view = renderProductDetailView(product);
        const interactiveElements = getInteractiveElements(view);
        return interactiveElements.every(element => {
          const hoverColor = getHoverStateColor(element);
          return isDeepRedColor(hoverColor);
        });
      }
    ),
    { numRuns: 50 }
  );
});
```

**Deferred Testing** (post-core-commerce-specs):
- Full 39 correctness properties with 100 iterations each
- Comprehensive visual-system conformance validation
- Real Shopify integration tests
- Build-time validation (fail build on violations)
- Visual regression testing
- Performance testing
- Accessibility testing
- Development tooling (IDE plugins, real-time validation)

**Validation in Development:**
- Simple runtime validator that checks critical guardrails
- Console warnings for violations (non-blocking in development)
- Build-time validation for forbidden patterns (blocking) - deferred

**Success Criteria for Initial Implementation:**
- All 4 critical guardrails pass unit tests
- 2 critical properties pass property-based tests (50 iterations)
- No forbidden patterns detected
- Visual review confirms gothic-romantic aesthetic
- Claiming action successfully integrates with Shopify cart (basic integration test)

## Implementation Notes

### Next.js Implementation Strategy

**Component Structure:**
```
app/
├── threshold/
│   ├── [productId]/
│   │   ├── page.tsx (Product Detail View - main entry point)
│   │   └── components/
│   │       ├── ImageGallery.tsx
│   │       ├── ProductNarrative.tsx
│   │       ├── VariantSelector.tsx
│   │       ├── ClaimingAction.tsx
│   │       └── ReturnNavigation.tsx
│   └── lib/
│       ├── shopify.ts (Shopify integration)
│       ├── visual-system-validator.ts
│       └── layout-calculator.ts
```

**Server Components vs Client Components:**
- **Server Components**: Product Detail View (page.tsx), initial product fetching, Shopify integration
- **Client Components**: ImageGallery (image navigation), VariantSelector (variant state), ClaimingAction (claiming state)

**Data Fetching Strategy:**
- Use Next.js Server Components for initial product fetch (SSR for SEO)
- Use React Server Actions for claiming action (cart integration)
- Cache Shopify responses with appropriate revalidation (ISR)
- Preload variant images for smooth transitions

### Shopify Integration

**Shopify Storefront API:**
```typescript
// Use Shopify Storefront API (GraphQL)
const SHOPIFY_STOREFRONT_API = 'https://{shop}.myshopify.com/api/2024-01/graphql.json';

// Query for single product with variants
const PRODUCT_QUERY = `
  query GetProduct($id: ID!) {
    product(id: $id) {
      id
      title
      description
      priceRange {
        minVariantPrice {
          amount
          currencyCode
        }
      }
      images(first: 10) {
        edges {
          node {
            url
            altText
            width
            height
          }
        }
      }
      variants(first: 50) {
        edges {
          node {
            id
            title
            priceV2 {
              amount
              currencyCode
            }
            availableForSale
            selectedOptions {
              name
              value
            }
            image {
              url
              altText
            }
          }
        }
      }
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
      metafield(namespace: "custom", key: "materials") {
        value
      }
      metafield(namespace: "custom", key: "dimensions") {
        value
      }
      metafield(namespace: "custom", key: "care") {
        value
      }
    }
  }
`;
```

**Cart Integration:**
```typescript
// Add to cart mutation
const ADD_TO_CART_MUTATION = `
  mutation AddToCart($cartId: ID!, $lines: [CartLineInput!]!) {
    cartLinesAdd(cartId: $cartId, lines: $lines) {
      cart {
        id
        lines(first: 50) {
          edges {
            node {
              id
              quantity
              merchandise {
                ... on ProductVariant {
                  id
                  title
                  priceV2 {
                    amount
                    currencyCode
                  }
                }
              }
            }
          }
        }
      }
      userErrors {
        field
        message
      }
    }
  }
`;
```

### Styling Implementation

**CSS-in-JS with Tailwind:**
- Use Tailwind CSS for base styling
- Extend Tailwind config with visual-system color palette (same as product-discovery)
- Use CSS modules for component-specific styles
- Implement visual-system spacing scale as Tailwind spacing utilities

### Performance Optimization

**Image Optimization:**
- Use Next.js Image component for automatic optimization
- Implement progressive loading with elegant placeholders
- Use Shopify CDN for image delivery
- Preload next/previous images in gallery
- Lazy load variant images

**Code Splitting:**
- Split variant selector (loaded on demand if variants exist)
- Split visual-system validator (development only)
- Use dynamic imports for non-critical components

**Caching Strategy:**
- Cache Shopify product data with ISR (revalidate every 60 seconds)
- Cache variant availability checks (revalidate every 30 seconds)
- Use React Server Components for automatic request deduplication

### Deployment Considerations

**Environment Variables:**
```
SHOPIFY_STORE_DOMAIN=charmed-and-dark.myshopify.com
SHOPIFY_STOREFRONT_ACCESS_TOKEN=<token>
NEXT_PUBLIC_ENABLE_VISUAL_SYSTEM_VALIDATION=true (development only)
```

**Build-Time Validation:**
- Deferred until after cart + checkout specs are complete
- Will run visual-system validation on all components during build
- Will fail build if critical violations detected
- Will generate conformance report for review

**Monitoring:**
- Track visual-system validation errors in production (should be zero)
- Monitor Shopify API response times and error rates
- Track claiming action success/failure rates
- Monitor variant selection interactions
- Monitor Core Web Vitals (LCP, FID, CLS) while maintaining atmosphere

### SEO Considerations

**Product Detail SEO:**
- Server-side render product data for search engines
- Include structured data (JSON-LD) for product information
- Use semantic HTML for product narrative
- Optimize product images with alt text
- Include meta descriptions from product description

**Structured Data Example:**
```json
{
  "@context": "https://schema.org/",
  "@type": "Product",
  "name": "[Product Title]",
  "image": "[Product Image URL]",
  "description": "[Product Description]",
  "offers": {
    "@type": "Offer",
    "price": "[Price]",
    "priceCurrency": "[Currency]",
    "availability": "https://schema.org/InStock"
  }
}
```

### Accessibility Considerations

**Keyboard Navigation:**
- Image gallery navigable with arrow keys
- Variant selector navigable with tab and arrow keys
- Claiming action accessible via keyboard
- Return navigation accessible via keyboard

**Screen Reader Support:**
- Proper ARIA labels for interactive elements
- Image alt text for all product images
- Variant selection announced to screen readers
- Claiming action state changes announced

**Color Contrast:**
- Ensure text meets WCAG AA standards despite dark palette
- Test muted gold text on black backgrounds
- Provide sufficient contrast for all interactive elements

### Migration from Product Discovery

**Continuity Patterns:**
- Use same color palette and spacing scale
- Use same interaction patterns (deep red hover states)
- Use same typography scale
- Maintain same visual-system conformance
- Preserve discovery state on navigation

**Shared Components:**
- Visual system validator (shared with discovery)
- Color palette configuration (shared with discovery)
- Spacing scale configuration (shared with discovery)
- Shopify integration utilities (shared with discovery)

