# Design Document: Cart

## Overview

The Cart is the curated collection experience in the Threshold realm of Charmed & Dark. When visitors have claimed objects from discovery and detail views, they enter a contemplative space to review their selections before proceeding to checkout. This is NOT a conventional shopping cart—it's a moment of reflection and confirmation where claimed objects are presented with intentional space and elegance.

This design explicitly conforms to the Visual System spec (.kiro/specs/visual-system/) and builds naturally from the Product Discovery and Product Detail specs. Every design decision references the visual-system properties it upholds and maintains continuity with discovery and detail patterns.

**Core Design Principles:**
- **Curated Collection Space**: Cart items as objects of meaning, not line items
- **Contemplative Review**: Slowness and presence, not urgency or pressure
- **Transactional Clarity**: Visual-system allows up to 25% spacing reduction while maintaining minimums (18px between elements, 72px between sections)
- **Singular Proceed Action**: One primary decision (proceed to checkout)
- **Fulfillment Invisibility**: No shipping costs, no delivery timeframes, no operational details by default
- **Ritual Interactions**: Hover states use deep red, transitions are subtle and elegant
- **Cognitive Simplicity**: Cart modifications (optional) and proceed action (primary)

## Architecture

### System Structure

The Cart is organized into five primary layers:

```
Cart
├── Data Layer
│   ├── Shopify Integration (cart data source)
│   ├── Cart Model (cart ID, line items, subtotal)
│   ├── Cart Item Model (product, variant, quantity, price)
│   └── Cart State Management (modifications, persistence)
├── Presentation Layer
│   ├── Cart View (primary collection review interface)
│   ├── Cart Item Card (individual item presentation)
│   ├── Cart Summary (subtotal and essential information)
│   ├── Empty Cart State (elegant invitation to explore)
│   └── Proceed Action (primary CTA)
├── Interaction Layer
│   ├── Hover States (deep red ritual moments)
│   ├── Cart Modifications (remove item, update quantity)
│   ├── Proceed Action Handler (navigate to checkout)
│   └── Modification Feedback (subtle confirmations)
├── Navigation Layer
│   ├── Return to Discovery (elegant back navigation)
│   ├── Proceed to Checkout (Shopify checkout integration)
│   └── Empty Cart Navigation (invitation to explore)
└── Validation Layer
    ├── Visual System Validator (color, spacing, density checks)
    ├── Exclusion Validator (forbidden pattern detection)
    └── Conformance Reporter (visual-system compliance)
```

### Data Flow

```
Shopify Backend
    ↓
Cart Data Fetch (cart ID, line items, quantities, prices, variants)
    ↓
Cart Model Transformation
    ↓
Cart View Rendering (visual-system conformance, transactional state spacing)
    ↓
Interaction Layer (hover/active states, modifications)
    ↓
Cart Modifications → Shopify Cart Sync
    ↓
Proceed Action → Shopify Checkout Navigation
```

## Components and Interfaces

### Data Layer

#### Cart Model

```typescript
interface Cart {
  id: string; // Shopify cart ID
  lineItems: CartLineItem[];
  subtotal: number;
  currency: string;
  itemCount: number;
  createdAt: Date;
  updatedAt: Date;
}

interface CartLineItem {
  id: string; // Line item ID
  productId: string; // Shopify product ID
  variantId: string; // Shopify variant ID
  quantity: number;
  title: string;
  variantTitle?: string; // e.g., "Medium / Black"
  price: number;
  image: CartItemImage;
  metadata?: CartItemMetadata; // Optional enrichment data
}

interface CartItemImage {
  url: string;
  alt: string;
  width: number;
  height: number;
}

interface CartItemMetadata {
  collection: string;
  tags: string[];
  isFeatured: boolean;
}
```

#### Shopify Integration Interface

```typescript
interface ShopifyCartIntegration {
  // Cart fetching
  fetchCart(cartId: string): Promise<Cart>;
  createCart(): Promise<Cart>;
  
  // Cart modifications
  addLineItem(cartId: string, variantId: string, quantity: number): Promise<Cart>;
  updateLineItem(cartId: string, lineItemId: string, quantity: number): Promise<Cart>;
  removeLineItem(cartId: string, lineItemId: string): Promise<Cart>;
  
  // Checkout
  getCheckoutUrl(cartId: string): string;
}
```


### Presentation Layer

#### Cart View

The Cart View is the primary interface for reviewing claimed objects. It enforces visual-system conformance with transactional state spacing rules.

```typescript
interface CartView {
  cart: Cart;
  layout: CartLayoutConfig;
  state: CartViewState;
  
  // Rendering
  render(): ViewElement;
  
  // Validation
  validateVisualSystem(): ValidationResult;
}

interface CartLayoutConfig {
  itemsPerViewport: number; // 5-7 per visual-system Property 9
  spacing: {
    itemGap: number; // Min 18px (transactional state reduction)
    sectionGap: number; // Min 72px (transactional state reduction)
    padding: {
      top: number;
      right: number;
      bottom: number;
      left: number;
    };
  };
  viewport: {
    width: number;
    height: number;
    breakpoint: 'mobile' | 'tablet' | 'desktop';
  };
  layout: 'single-column' | 'two-column'; // Single on mobile, two-column on desktop
}

interface CartViewState {
  isModifying: boolean;
  modificationFeedback: ModificationFeedback | null;
  isProceedingToCheckout: boolean;
}

interface ModificationFeedback {
  type: 'item-removed' | 'quantity-updated' | 'error';
  message: string; // Subtle, elegant messaging
  duration: number; // Brief display duration
}
```

#### Cart Item Card

The Cart Item Card presents a single claimed object with imagery, details, and modification actions.

```typescript
interface CartItemCard {
  lineItem: CartLineItem;
  state: CardState;
  visualStyle: CartItemVisualStyle;
  
  // Rendering
  render(): CardElement;
  
  // Interaction handlers
  onRemove(): void; // Remove item from cart
  onQuantityChange(newQuantity: number): void; // Update quantity
  
  // Validation
  validateSpacing(): SpacingValidation;
  validateInteraction(): InteractionValidation;
}

type CardState = 'default' | 'modifying' | 'removing';

interface CartItemVisualStyle {
  backgroundColor: Color; // Black/near-black per visual-system
  borderColor: Color; // Muted gold for subtle emphasis
  textColor: Color;
  imageSize: {
    width: number;
    height: number;
  };
  spacing: {
    elementGap: number; // Min 18px between image, title, price, quantity
  };
}

interface CardElement {
  imageElement: Element;
  titleElement: Element;
  variantElement?: Element; // If variant exists
  priceElement: Element;
  quantityElement: Element;
  removeAction: Element;
}
```

#### Cart Summary

The Cart Summary presents subtotal and essential cart information without aggressive upsells or shipping estimates.

```typescript
interface CartSummary {
  cart: Cart;
  visualStyle: SummaryVisualStyle;
  
  // Rendering
  render(): SummaryElement;
  
  // Validation
  validateExclusions(): ExclusionValidation; // No shipping estimates, no upsells
}

interface SummaryVisualStyle {
  backgroundColor: Color; // Near-black
  borderColor: Color; // Muted gold
  subtotalColor: Color; // Muted gold for emphasis
  textColor: Color; // Near-black or charcoal
  spacing: {
    elementGap: number; // Min 18px
    padding: number;
  };
}

interface SummaryElement {
  subtotalElement: Element; // "Subtotal: $XXX.XX"
  itemCountElement: Element; // "X objects claimed"
  // NO shipping estimate
  // NO delivery timeframe
  // NO upsells or cross-sells
}
```

#### Empty Cart State

The Empty Cart State provides elegant messaging and invitation to explore when the cart is empty.

```typescript
interface EmptyCartState {
  visualStyle: EmptyStateVisualStyle;
  
  // Rendering
  render(): EmptyStateElement;
  
  // Validation
  validateTone(): ToneValidation; // No aggressive language
}

interface EmptyStateVisualStyle {
  messageColor: Color; // Near-black or charcoal
  linkColor: Color; // Muted gold
  hoverColor: Color; // Deep red per visual-system Property 10
  spacing: {
    messageSpacing: number; // Generous whitespace
  };
}

interface EmptyStateElement {
  messageElement: Element; // "Your collection awaits" or "No objects claimed yet"
  discoveryLink: Element; // "Explore threshold" or "Discover objects"
}
```

#### Proceed Action

The Proceed Action is the primary CTA for continuing to checkout.

```typescript
interface ProceedAction {
  cart: Cart;
  state: ProceedState;
  visualStyle: ProceedVisualStyle;
  
  // Proceed to checkout
  proceed(): Promise<void>;
  
  // Rendering
  render(): ButtonElement;
  
  // Validation
  validateSingularity(): boolean; // Exactly one primary CTA
  validateLanguage(): LanguageValidation; // Ritualized language
  validateInteraction(): InteractionValidation; // Deep red hover
}

type ProceedState = 'default' | 'hover' | 'active' | 'proceeding';

interface ProceedVisualStyle {
  defaultColor: Color; // Near-black fill
  defaultBorderColor: Color; // Muted gold hairline border
  defaultTextColor: Color; // Muted gold text
  hoverColor: Color; // Deep red fill (replaces all default colors)
  activeColor: Color; // Blood red fill
  transition: TransitionConfig; // 300ms ease-in-out
  buttonText: string; // "Proceed", "Continue", "Complete"
  position: 'bottom-right' | 'below-summary'; // Intentional, not aggressive
}
```


### Interaction Layer

#### Cart Modification Handler

```typescript
interface CartModificationHandler {
  // Remove item
  removeItem(lineItemId: string): Promise<ModificationResult>;
  
  // Update quantity
  updateQuantity(lineItemId: string, newQuantity: number): Promise<ModificationResult>;
  
  // Sync with Shopify
  syncWithShopify(cart: Cart): Promise<Cart>;
  
  // Validation
  validateTransitions(): TransitionValidation; // 150-500ms
}

interface ModificationResult {
  success: boolean;
  updatedCart: Cart;
  feedback: ModificationFeedback;
  error?: string;
}
```

#### Remove Action Handler

```typescript
interface RemoveActionHandler {
  // Handle remove interaction
  onRemove(lineItemId: string): Promise<void>;
  
  // Provide subtle confirmation
  showRemoveFeedback(lineItem: CartLineItem): void;
  
  // Validation
  validateSubtlety(): boolean; // No aggressive "Are you sure?" popups
  validateHoverState(): boolean; // Deep red hover
}
```

#### Quantity Adjustment Handler

```typescript
interface QuantityAdjustmentHandler {
  // Handle quantity change
  onQuantityChange(lineItemId: string, newQuantity: number): Promise<void>;
  
  // Render quantity controls
  renderQuantityControls(currentQuantity: number): QuantityControlsElement;
  
  // Validation
  validateControls(): ControlsValidation; // Elegant controls, not aggressive +/-
  validateHoverStates(): boolean; // Deep red hover on controls
}

interface QuantityControlsElement {
  decrementButton: Element; // Minimal typographic stepper: "−" character
  quantityDisplay: Element; // Current quantity
  incrementButton: Element; // Minimal typographic stepper: "+" character
  visualStyle: QuantityControlsVisualStyle;
}

interface QuantityControlsVisualStyle {
  buttonColor: Color; // Near-black or muted gold text
  hoverColor: Color; // Deep red
  disabledColor: Color; // Reduced opacity
  spacing: number; // Min 18px between controls
  buttonStyle: 'typographic'; // No filled buttons, no aggressive styling
}
```

### Navigation Layer

#### Return Navigation

```typescript
interface ReturnNavigation {
  // Navigate back to discovery
  returnToDiscovery(): void;
  
  // Rendering
  render(): NavigationElement;
  
  // Validation
  validateLanguage(): LanguageValidation; // No "Continue shopping"
  validateInteraction(): InteractionValidation; // Deep red hover
}

interface NavigationElement {
  backLink: Element; // "Return to threshold" or "← Discovery"
  visualStyle: NavigationVisualStyle;
}

interface NavigationVisualStyle {
  linkColor: Color; // Muted gold or near-black
  hoverColor: Color; // Deep red per visual-system Property 10
  fontSize: number; // 14px (Body Small)
  position: 'top-left' | 'top-center'; // Subtle, not aggressive
}
```

#### Checkout Navigation

```typescript
interface CheckoutNavigation {
  // Navigate to Shopify checkout
  proceedToCheckout(cartId: string): void;
  
  // Get checkout URL
  getCheckoutUrl(cartId: string): string;
  
  // Validation
  validateProceedAction(): boolean; // Singular primary CTA
}
```

### Validation Layer

#### Visual System Validator

```typescript
interface VisualSystemValidator {
  // Color validation
  validateColorHierarchy(view: CartView): ColorValidation;
  validateGoldUsage(view: CartView): GoldValidation;
  validateHoverColors(elements: InteractiveElement[]): HoverValidation;
  
  // Spacing validation (transactional state)
  validateSpacing(view: CartView): SpacingValidation;
  validateDensity(view: CartView): DensityValidation;
  
  // Interaction validation
  validateTransitions(elements: InteractiveElement[]): TransitionValidation;
  
  // Comprehensive validation
  validateFullConformance(view: CartView): ConformanceReport;
}

interface SpacingValidation {
  isValid: boolean;
  elementSpacing: number; // Must be ≥ 18px (transactional state)
  sectionSpacing: number; // Must be ≥ 72px (transactional state)
  violations: string[];
}
```

#### Exclusion Validator

```typescript
interface ExclusionValidator {
  // Forbidden pattern detection
  detectPopups(view: CartView): boolean;
  detectDiscountCodeFields(view: CartView): boolean;
  detectCountdownTimers(view: CartView): boolean;
  detectUpsells(view: CartView): boolean;
  detectShippingEstimates(view: CartView): boolean;
  detectDeliveryTimeframes(view: CartView): boolean;
  detectInventoryCountdown(view: CartView): boolean;
  detectCompetingCTAs(view: CartView): boolean;
  
  // Forbidden language detection
  detectForbiddenPhrases(text: string): string[];
  
  // Comprehensive validation
  validateExclusions(view: CartView): ExclusionReport;
}
```

## Data Models

### Cart Data Model

```typescript
// Core cart data from Shopify
interface Cart {
  id: string;
  lineItems: CartLineItem[];
  subtotal: number;
  currency: string;
  itemCount: number;
  createdAt: Date;
  updatedAt: Date;
}

interface CartLineItem {
  id: string;
  productId: string;
  variantId: string;
  quantity: number;
  title: string;
  variantTitle?: string;
  price: number;
  image: CartItemImage;
  metadata: CartItemMetadata;
}

interface CartItemImage {
  url: string;
  alt: string;
  width: number;
  height: number;
}

interface CartItemMetadata {
  collection: string;
  tags: string[];
  isFeatured: boolean;
}
```

### View State Model

```typescript
// Cart view state
interface CartViewState {
  cartId: string;
  isModifying: boolean;
  modificationFeedback: ModificationFeedback | null;
  isProceedingToCheckout: boolean;
  viewport: Viewport;
}

interface ModificationFeedback {
  type: 'item-removed' | 'quantity-updated' | 'error';
  message: string;
  duration: number;
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
  elementType: 'proceed-action' | 'remove-action' | 'quantity-control' | 'navigation';
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
  emphasis: {
    antiqueGold: string; // #8B7355
    brushedGold: string; // #9D8366
    agedGold: string; // #7A6347
  };
}

interface TypographyConfig {
  cartItemTitle: {
    fontSize: number; // 24px (H3) or 20px (Body Large)
    fontWeight: number;
    lineHeight: number;
    letterSpacing: number;
    color: string;
  };
  cartItemPrice: {
    fontSize: number; // 20px (Body Large)
    fontWeight: number;
    color: string; // Muted gold
  };
  cartItemVariant: {
    fontSize: number; // 14px (Body Small)
    fontWeight: number;
    color: string; // Charcoal
  };
  subtotal: {
    fontSize: number; // 20px (Body Large)
    fontWeight: number;
    color: string; // Muted gold
  };
  proceedAction: {
    fontSize: number; // 16px (Body)
    fontWeight: number;
    color: string;
  };
}

interface SpacingScale {
  // Transactional state spacing (25% reduction from base)
  xs: number; // 4px
  sm: number; // 8px
  md: number; // 16px
  lg: number; // 18px (reduced from 24px)
  xl: number; // 24px (reduced from 32px)
  '2xl': number; // 36px (reduced from 48px)
  '3xl': number; // 48px (reduced from 64px)
  '4xl': number; // 72px (reduced from 96px)
}

interface InteractionConfig {
  transitions: {
    hover: TransitionConfig;
    active: TransitionConfig;
    modification: TransitionConfig;
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
      layout: 'single-column'; // Cart items stacked, summary below
      itemsPerViewport: 5;
    };
    tablet: {
      minWidth: 769;
      maxWidth: 1024;
      layout: 'single-column' | 'two-column';
      itemsPerViewport: 6;
    };
    desktop: {
      minWidth: 1025;
      layout: 'two-column'; // Cart items left, summary right
      itemsPerViewport: 7;
    };
  };
  
  // Spacing remains consistent (transactional state)
  spacingMultipliers: {
    mobile: 1.0;
    tablet: 1.0;
    desktop: 1.0;
  };
}
```

### Layout Calculation

The layout system calculates optimal cart presentation based on viewport size while maintaining visual-system conformance:

1. **Determine breakpoint** from viewport width
2. **Calculate layout** (single-column on mobile, two-column on desktop)
3. **Position cart items** (left column or full width)
4. **Position cart summary** (right column or below items)
5. **Validate density** (5-7 items per viewport height)
6. **Apply spacing** (min 18px between elements, 72px between sections)
7. **Render view** with visual-system conformance

## Cart Item Presentation Strategy

### Cart Item Layout

**Desktop Layout (Two-Column):**
```
┌─────────────────────────────────────────────────────────────┐
│  [Image]  Title                                    $XX.XX   │
│           Variant: Medium / Black                           │
│           Quantity: [- 1 +]                      [Remove]   │
└─────────────────────────────────────────────────────────────┘
```

**Mobile Layout (Stacked):**
```
┌─────────────────────┐
│      [Image]        │
│                     │
│  Title              │
│  Variant: M / Black │
│  $XX.XX             │
│  Qty: [- 1 +]       │
│  [Remove]           │
└─────────────────────┘
```

### Cart Item Elements

**Image:**
- Size: 120x120px on desktop, 100x100px on mobile
- Aspect ratio: 1:1 or 4:3
- Position: Left on desktop, top on mobile
- Spacing: 18px from adjacent elements

**Title:**
- Typography: 24px (H3) or 20px (Body Large)
- Color: Near-black or ink
- Position: Right of image on desktop, below image on mobile

**Variant:**
- Typography: 14px (Body Small)
- Color: Charcoal
- Format: "Size / Color" or "Material"
- Position: Below title

**Price:**
- Typography: 20px (Body Large)
- Color: Muted gold (emphasis)
- Position: Right-aligned on desktop, below variant on mobile

**Quantity:**
- Controls: Subtle increment/decrement buttons or minimal input
- Typography: 16px (Body)
- Color: Near-black, deep red on hover
- Position: Below variant on desktop, below price on mobile

**Remove Action:**
- Format: Text link ("Remove") or minimal icon
- Typography: 14px (Body Small)
- Color: Charcoal, deep red on hover
- Position: Right-aligned on desktop, below quantity on mobile

## Cart Summary Presentation Strategy

### Cart Summary Layout

**Desktop (Right Column):**
```
┌─────────────────────────┐
│  Cart Summary           │
│                         │
│  X objects claimed      │
│  Subtotal: $XXX.XX      │
│                         │
│  [Proceed]              │
└─────────────────────────┘
```

**Mobile (Below Items):**
```
┌─────────────────────────┐
│  X objects claimed      │
│  Subtotal: $XXX.XX      │
│                         │
│  [Proceed]              │
└─────────────────────────┘
```

### Cart Summary Elements

**Item Count:**
- Text: "X objects claimed" or "X items"
- Typography: 16px (Body)
- Color: Near-black

**Subtotal:**
- Text: "Subtotal: $XXX.XX"
- Typography: 20px (Body Large)
- Color: Muted gold (emphasis)
- Position: Below item count

**Proceed Action:**
- Button text: "Proceed", "Continue", or "Complete"
- Typography: 16px (Body)
- Color: Near-black background, deep red on hover
- Position: Below subtotal with 72px spacing

**Exclusions:**
- NO shipping estimate
- NO delivery timeframe
- NO "Free shipping threshold" progress bar
- NO discount code field (unless explicitly required)
- NO upsells or cross-sells

## Cart Modification Strategy

### Remove Item Behavior

**Interaction Flow:**
1. Visitor hovers over "Remove" link → color transitions to deep red (300ms)
2. Visitor clicks "Remove" → item fades out (300ms)
3. Cart updates → Shopify sync
4. Subtle feedback: "Item removed" (brief, 2-3 seconds)
5. Cart summary updates with new subtotal

**No Aggressive Confirmation:**
- No "Are you sure?" popup
- No modal dialog
- Subtle transition only

### Quantity Adjustment Behavior

**Interaction Flow:**
1. Visitor hovers over increment/decrement → color transitions to deep red (300ms)
2. Visitor clicks control → quantity updates
3. Cart updates → Shopify sync
4. Price updates with subtle transition (300ms)
5. Cart summary updates with new subtotal

**Quantity Controls:**
- Minimal typographic steppers: "−" and "+" characters (not filled buttons)
- Deep red hover states
- Disabled state when quantity = 1 (for decrement)
- No aggressive styling, no filled button backgrounds

## Proceed Action Strategy

### Proceed Button Behavior

**Default State:**
- Text: "Proceed", "Continue", or "Complete"
- Fill: Near-black (ink or charcoal)
- Border: Muted gold hairline (1px)
- Text Color: Muted gold
- Typography: 16px (Body), medium weight

**Hover State:**
- Fill transitions to deep red (wine/blood)
- Border and text color also become deep red (unified hover state)
- Transition: 300ms ease-in-out
- Subtle scale: 1.02x (optional)

**Active State:**
- Color: Blood red
- Scale: 0.98x
- Transition: 150ms ease-out

**Proceeding State:**
- Text: "Proceeding..." or subtle loading indicator
- Disabled state (no hover)
- No aggressive spinners

**Navigation:**
- On click → navigate to Shopify checkout URL
- Pass cart ID to Shopify
- Maintain cart state

## Empty Cart State Strategy

### Empty Cart Presentation

**Layout:**
```
┌─────────────────────────────────────┐
│                                     │
│     Your collection awaits          │
│                                     │
│     [Explore threshold]             │
│                                     │
└─────────────────────────────────────┘
```

**Elements:**
- **Message**: "Your collection awaits" or "No objects claimed yet"
- **Typography**: 24px (H3), near-black
- **Link**: "Explore threshold" or "Discover objects"
- **Link Color**: Muted gold, deep red on hover
- **Spacing**: Generous whitespace, centered layout

**Exclusions:**
- NO aggressive language ("Your cart is empty! Start shopping now!")
- NO urgency patterns
- NO promotional messaging

## Fulfillment Invisibility Strategy

### Operational Details Hidden

**What Remains Invisible:**
- Shipping cost estimates
- Delivery timeframes ("Get it by [date]")
- "Ships from" or warehouse location
- Inventory countdown ("Only X left")
- Shipping urgency ("Ships today", "Order within X hours")
- "Free shipping threshold" progress bars

**What May Be Visible (Rare Cases):**
- If shipping information must be shown, it must be:
  - Generic and calm
  - Non-specific (no dates, no timeframes)
  - No operational details
  - No urgency language

**Inventory Handling:**
- Available: No messaging needed
- Out of stock: Handle gracefully at claiming stage (product detail)
- Cart should not display inventory status

## Error Handling

### Cart Modification Errors

**Remove Item Error:**
- Display elegant error message: "Unable to remove item. Please try again."
- No technical details
- No aggressive retry prompts
- Subtle display (2-3 seconds)

**Quantity Update Error:**
- Display elegant error message: "Unable to update quantity. Please try again."
- Revert to previous quantity
- No aggressive error styling

**Shopify Sync Error:**
- Display elegant error message: "Unable to sync cart. Please refresh."
- No technical details
- No aggressive error modals

**Checkout Navigation Error:**
- Display elegant error message: "Unable to proceed. Please try again shortly."
- No technical details
- No aggressive retry prompts

## Testing Strategy

### Dual Testing Approach

The Cart requires both unit tests and property-based tests for comprehensive validation:

**Unit Tests** focus on:
- Specific cart modification scenarios (remove item, update quantity)
- Empty cart state rendering
- Shopify integration (cart fetch, sync, checkout URL)
- Edge cases (single item, many items, zero quantity)
- Error handling (sync failures, checkout navigation failures)

**Property-Based Tests** focus on:
- Universal visual-system conformance across all cart states
- Spacing requirements across all layouts
- Density limits across all viewports
- Forbidden pattern detection across all cart views
- Transition timing across all interactions

### Property-Based Testing Configuration

**Library Selection:**
- **TypeScript/JavaScript**: Use `fast-check` library
- **Python**: Use `hypothesis` library
- **Other languages**: Select appropriate PBT library for target language

**Test Configuration:**
- Minimum 100 iterations per property test
- Each test must reference its design property number
- Tag format: `Feature: cart, Property {N}: {property title}`

## Implementation Notes

### Framework Integration

The Cart is designed for Next.js frontend with Shopify backend:

- **Route**: `/cart` or `/threshold/cart`
- **Data Fetching**: Server-side or client-side cart fetch from Shopify
- **State Management**: React state or global state management (Redux, Zustand)
- **Shopify Integration**: Shopify Storefront API or Shopify Buy SDK

### Cart Persistence

- **Shopify Cart ID**: Stored in browser localStorage or cookies
- **Session Persistence**: Cart persists across sessions via Shopify
- **Cart Expiry**: Shopify handles cart expiration (typically 10 days)

### Performance Considerations

- **Image Optimization**: Use Next.js Image component for cart item images
- **Lazy Loading**: Load cart items progressively if many items
- **Optimistic Updates**: Update UI immediately, sync with Shopify in background
- **Error Recovery**: Graceful fallback if Shopify sync fails


## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system—essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

### Property Reflection

After analyzing all acceptance criteria, I identified the following redundancies:

- **Spacing properties (1.2, 1.5, 3.5, 7.4, 11.1, 12.2)** all test the same minimum spacing requirements - consolidate into one comprehensive property
- **Density properties (1.1, 11.2)** test the same maximum density limits - consolidate
- **Hover state colors (2.3, 2.4, 4.2, 6.3)** all test deep red hover states - consolidate into one property
- **Fulfillment invisibility (5.2, 5.3, 8.1, 8.2, 8.3, 8.4, 8.5)** all test operational details exclusion - consolidate
- **Forbidden patterns (5.4, 5.5, 9.1, 9.2, 9.3, 9.4, 9.5, 9.6)** all test exclusion of pressure patterns - consolidate
- **Singular CTA (6.1, 6.5, 12.1, 12.3)** all test exactly one primary action - consolidate
- **Transition timing (4.5, 10.4)** test the same timing constraints - consolidate

The following properties represent the unique, non-redundant validation rules:

### Property 1: Maximum Cart Density

*For any* cart view and viewport configuration, the number of cart items displayed per viewport height must be between 5 and 7, ensuring curated collection presentation rather than overwhelming volume.

**Validates: Requirements 1.1, 11.2**

### Property 2: Transactional State Minimum Spacing

*For any* cart layout, all adjacent cart items must have at least 18px spacing between them, cart item internal elements (image, title, price, quantity) must have at least 18px spacing between them, and major cart sections (items area, summary area) must have at least 72px vertical spacing, applying the transactional state spacing reduction while maintaining minimums.

**Validates: Requirements 1.2, 1.5, 3.5, 7.4, 11.1, 12.2**

### Property 3: Required Cart Item Information

*For any* rendered cart item, the item must display at minimum: product image, title, price, and quantity. If the product has variants, the variant selection must also be displayed.

**Validates: Requirements 1.3, 3.1**

### Property 4: No Dense List Layouts

*For any* cart layout, the presentation must not use table-style layouts with minimal spacing, must maintain minimum spacing requirements (18px between elements), and must present each item with visual distinctness.

**Validates: Requirements 1.4**

### Property 5: Black Color Dominance via Token Enforcement

*For any* rendered cart view, all background colors must use foundation tokens (ink, charcoal, nearBlack) from the visual-system palette, and all accent colors must be limited by visual-system token rules (deep red for ritual moments, muted gold for emphasis <8%, deep purple for sanctuary elements).

**Validates: Requirements 2.1**

### Property 6: Gold Scarcity in Cart State

*For any* rendered cart view, muted gold colors (antique-gold, brushed-gold, aged-gold) must occupy less than 8% of the total visual space, applying the transactional state allowance for increased clarity in cart/checkout states.

**Validates: Requirements 2.2**

### Property 7: Interactive Elements Use Deep Red on Hover

*For any* interactive element (proceed action, remove action, quantity controls, navigation links), when in hover state, the element's color must transition to a color from the deep red family (wine, blood, garnet).

**Validates: Requirements 2.3, 2.4, 4.2, 6.3**

### Property 8: Palette Token Enforcement

*For any* color used in cart interfaces, the color must be from the visual-system palette tokens (foundation: ink/charcoal/nearBlack, ritual: wine/blood/garnet, emphasis: antiqueGold/brushedGold/agedGold), preventing arbitrary colors outside the sacred palette.

**Validates: Requirements 2.5**

### Property 9: Cart Item Title Typography Conformance

*For any* rendered cart item title, the font size must be either 24px (H3) or 20px (Body Large) from the visual-system type scale.

**Validates: Requirements 3.3**

### Property 10: Cart Item Price Color Assignment

*For any* rendered cart item price, the text color must be from the muted gold family (antique-gold, brushed-gold, aged-gold), providing elegant emphasis.

**Validates: Requirements 3.4**

### Property 11: No Aggressive Confirmation Popups

*For any* cart modification action (remove item, update quantity), the confirmation feedback must not create popup/modal elements, and must use subtle transitions (fade, brief text confirmation) only.

**Validates: Requirements 4.3**

### Property 12: Modification Transition Timing

*For any* cart modification (remove item, update quantity, cart data change), the transition duration must be between 150ms and 500ms, maintaining subtle and elegant animations.

**Validates: Requirements 4.5, 10.4**

### Property 13: Cart Summary Subtotal Color

*For any* rendered cart summary, the subtotal element must use a color from the muted gold family (antique-gold, brushed-gold, aged-gold) for emphasis.

**Validates: Requirements 5.1**

### Property 14: Comprehensive Fulfillment Invisibility

*For any* cart view, the view must not contain any of the following fulfillment-related elements: shipping cost estimates, delivery timeframes ("Get it by [date]"), "Ships from" or warehouse location messaging, inventory countdown ("Only X left"), shipping urgency language ("Ships today", "Order within X hours"), or "Free shipping threshold" progress bars.

**Validates: Requirements 5.2, 5.3, 8.1, 8.2, 8.3, 8.4, 8.5**

### Property 15: Comprehensive Forbidden Pattern Detection

*For any* cart view, the view must not contain any of the following forbidden patterns: popups/modals, countdown timers, aggressive upsells or "You might also like" sections, "Customers also bought" sections, discount code entry fields (unless explicitly required), or aggressive "Complete your order" prompts.

**Validates: Requirements 5.4, 5.5, 9.1, 9.2, 9.3, 9.4, 9.5, 9.6**

### Property 16: Singular Primary Call-to-Action

*For any* cart view, the view must contain exactly one primary call-to-action (proceed action), and must not contain competing CTAs such as "Save for later", "Email cart", "Share cart", or "Continue shopping" buttons.

**Validates: Requirements 6.1, 6.5, 12.1, 12.3**

### Property 17: Proceed Action Ritualized Language

*For any* proceed action button, the button text must use approved ritualized language ("Proceed", "Continue", "Complete") and must not contain forbidden phrases ("Checkout now", "Buy now", "Shop now").

**Validates: Requirements 6.2**

### Property 18: Empty Cart State Language Validation

*For any* empty cart state, the messaging must use elegant language (e.g., "Your collection awaits", "No objects claimed yet") and must not contain aggressive phrases ("Your cart is empty! Start shopping now!", "Don't miss out").

**Validates: Requirements 7.1, 7.3**

### Property 19: Shopify Cart Data Completeness

*For any* cart fetched from Shopify, the cart data must include all required fields: id, lineItems array, subtotal, currency, itemCount. Each line item must include: id, productId, variantId, quantity, title, price, and image. Metadata is optional enrichment data.

**Validates: Requirements 10.1**

### Property 20: Responsive Visual System Conformance

*For any* viewport size adjustment (mobile, tablet, desktop), all visual-system requirements must remain satisfied: black dominance (60-80%), gold scarcity (<5%), minimum spacing (18px between elements, 72px between sections), maximum density (5-7 per viewport), hover states use deep red, and transition timing (150-500ms).

**Validates: Requirements 11.4**

