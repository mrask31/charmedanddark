# Design Document: Cart

## Overview

The Cart is the curated collection experience in the Threshold realm of Charmed & Dark. When a visitor has claimed objects from discovery and detail, they enter a contemplative space where they review their selections before proceeding to completion. This is NOT a conventional shopping cart—it's a moment of reflection and confirmation, where the visitor can adjust their collection and prepare for the checkout ritual.

This design explicitly conforms to the Visual System spec (.kiro/specs/visual-system/) and builds naturally from the Product Discovery spec (.kiro/specs/product-discovery/) and Product Detail spec (.kiro/specs/product-detail/). Every design decision references the visual-system properties it upholds and maintains continuity with established patterns.

**Core Design Principles:**
- **Curated Collection**: Items presented as objects of meaning, not line items in a list
- **Reflection and Confirmation**: Space for contemplation, not urgency or pressure
- **Controlled Clarity**: Spacing may reduce up to 25% from discovery (per visual-system Property 16) while maintaining minimums
- **Ritual Interactions**: Hover states use deep red, transitions are subtle and elegant
- **Fulfillment Invisibility**: No shipping info, delivery dates, or operational details by default
- **Cognitive Simplicity**: Two primary decisions (collection management, proceed to completion)
- **Singular Focus**: No upsells, no related products, no competing CTAs

## Architecture

### System Structure

The Cart is organized into five primary layers:

```
Cart
├── Data Layer
│   ├── Shopify Integration (cart data source)
│   ├── Cart Model (line items, quantities, prices, subtotal)
│   ├── Line Item Model (product, variant, quantity, price)
│   └── Cart State Management (updates, persistence)
├── Presentation Layer
│   ├── Cart View (primary collection review interface)
│   ├── Collection Item (individual item presentation)
│   ├── Collection Summary (subtotal, proceed action)
│   ├── Empty Collection State (elegant empty state)
│   └── Quantity Controls (elegant adjustment interface)
├── Interaction Layer
│   ├── Hover States (deep red ritual moments)
│   ├── Quantity Adjustment (update line items)
│   ├── Item Removal (release from collection)
│   └── Proceed Action (navigate to checkout)
├── Navigation Layer
│   ├── Return to Discovery (elegant back navigation)
│   ├── Cart Access (subtle cart indicator)
│   └── Checkout Navigation (proceed to Shopify checkout)
└── Validation Layer
    ├── Visual System Validator (color, spacing, density checks)
    ├── Exclusion Validator (forbidden pattern detection)
    └── Conformance Reporter (visual-system compliance)
```

### Data Flow

```
Shopify Backend
    ↓
Cart Data Fetch (line items, quantities, prices, product details)
    ↓
Cart Model Transformation
    ↓
Line Item Model Construction
    ↓
Cart View Rendering (visual-system conformance with controlled clarity)
    ↓
Interaction Layer (hover/active states, quantity adjustment, removal)
    ↓
Cart Update → Shopify Cart API
    ↓
Proceed Action → Shopify Checkout
```


## Components and Interfaces

### Data Layer

#### Cart Model

```typescript
interface Cart {
  id: string; // Shopify cart ID
  lineItems: LineItem[];
  subtotal: number;
  currency: string;
  itemCount: number; // Total quantity across all line items
  createdAt: Date;
  updatedAt: Date;
}

interface LineItem {
  id: string; // Shopify line item ID
  productId: string;
  variantId: string;
  title: string;
  variantTitle?: string; // e.g., "Medium / Black"
  price: number;
  quantity: number;
  image: ProductImage;
  productHandle: string; // For linking back to product detail
}

interface ProductImage {
  url: string;
  alt: string;
  width: number;
  height: number;
}
```

#### Shopify Integration Interface

```typescript
interface ShopifyCartIntegration {
  // Cart fetching
  fetchCart(cartId: string): Promise<Cart>;
  createCart(): Promise<Cart>;
  
  // Cart updates
  updateLineItemQuantity(cartId: string, lineItemId: string, quantity: number): Promise<Cart>;
  removeLineItem(cartId: string, lineItemId: string): Promise<Cart>;
  
  // Checkout
  getCheckoutUrl(cartId: string): Promise<string>;
}
```

### Presentation Layer

#### Cart View

The Cart View is the primary interface for collection review. It enforces visual-system conformance with controlled clarity (spacing reduction up to 25%).

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
  itemLayout: 'single-column' | 'two-column'; // Single on mobile/tablet, optional 2-col on large desktop
  spacing: {
    itemGap: number; // Min 18px (reduced from 24px per visual-system Property 16)
    sectionGap: number; // Min 72px (reduced from 96px per visual-system Property 16)
  };
  viewport: {
    width: number;
    height: number;
    breakpoint: 'mobile' | 'tablet' | 'desktop';
  };
}

interface CartViewState {
  isUpdating: boolean; // True when quantity update or removal in progress
  updateFeedback: UpdateFeedback | null;
  navigationContext: NavigationContext | null;
}

interface UpdateFeedback {
  type: 'quantity-updated' | 'item-removed' | 'error';
  message: string; // Subtle, elegant messaging
  duration: number; // Brief display duration
}

interface NavigationContext {
  previousRoute: string;
  returnLabel: string; // "Return to threshold" or "Continue exploring"
}
```


#### Collection Item

The Collection Item presents a single cart line item with dignity and intentional space.

```typescript
interface CollectionItem {
  lineItem: LineItem;
  state: ItemState;
  visualStyle: ItemVisualStyle;
  
  // Rendering
  render(): ItemElement;
  
  // Actions
  updateQuantity(newQuantity: number): Promise<void>;
  remove(): Promise<void>;
  
  // Validation
  validateSpacing(): SpacingValidation;
  validateInteraction(): InteractionValidation;
}

type ItemState = 'default' | 'updating' | 'removing';

interface ItemVisualStyle {
  backgroundColor: Color; // Black/near-black per visual-system
  borderColor: Color; // Muted gold for subtle emphasis
  imageSize: {
    width: number;
    height: number;
    aspectRatio: number; // 1:1 to 4:3
  };
  spacing: {
    internal: number; // Min 18px between image, title, price, quantity
    external: number; // Min 18px from adjacent items
  };
}

interface ItemElement {
  imageElement: Element;
  titleElement: Element;
  variantElement?: Element; // If variant exists
  priceElement: Element;
  quantityElement: Element;
  removeElement: Element;
}
```

#### Quantity Controls

The Quantity Controls provide elegant quantity adjustment without conventional spinners.

```typescript
interface QuantityControls {
  currentQuantity: number;
  minQuantity: number; // 1
  maxQuantity: number; // 99 or inventory limit
  visualStyle: QuantityVisualStyle;
  
  // Actions
  increment(): void;
  decrement(): void;
  setQuantity(quantity: number): void;
  
  // Rendering
  render(): QuantityElement;
  
  // Validation
  validateInteraction(): InteractionValidation; // Deep red hover states
}

interface QuantityVisualStyle {
  buttonColor: Color; // Near-black or charcoal
  hoverColor: Color; // Deep red per visual-system Property 10
  textColor: Color; // Near-black
  disabledColor: Color; // Near-black with reduced opacity
  transition: TransitionConfig; // 150-500ms
}

interface QuantityElement {
  decrementButton: ButtonElement;
  quantityDisplay: Element; // Current quantity
  incrementButton: ButtonElement;
  layout: 'horizontal' | 'compact'; // Horizontal on desktop, compact on mobile
}
```


#### Collection Summary

The Collection Summary presents subtotal and proceed action with elegant restraint.

```typescript
interface CollectionSummary {
  cart: Cart;
  visualStyle: SummaryVisualStyle;
  
  // Rendering
  render(): SummaryElement;
  
  // Validation
  validateProminence(): ProminenceValidation; // Not aggressive
  validateExclusions(): ExclusionValidation; // No shipping estimates, no discount fields
}

interface SummaryVisualStyle {
  subtotalColor: Color; // Muted gold per visual-system Property 3
  labelColor: Color; // Near-black or charcoal
  typography: {
    subtotalSize: number; // 20px (Body Large)
    labelSize: number; // 16px (Body)
  };
  spacing: {
    internal: number; // Min 18px between elements
    fromItems: number; // Min 72px from collection items
  };
}

interface SummaryElement {
  subtotalLabel: Element; // "Subtotal" or "Collection total"
  subtotalValue: Element; // Price in muted gold
  proceedAction: ButtonElement;
  returnNavigation?: LinkElement; // Optional return to discovery
}
```

#### Proceed Action

The Proceed Action is the primary CTA for navigating to checkout.

```typescript
interface ProceedAction {
  cart: Cart;
  state: ProceedState;
  visualStyle: ProceedVisualStyle;
  
  // Action
  proceed(): Promise<void>; // Navigate to Shopify checkout
  
  // Rendering
  render(): ButtonElement;
  
  // Validation
  validateSingularity(): boolean; // Exactly one primary CTA
  validateLanguage(): LanguageValidation; // Ritualized language
  validateInteraction(): InteractionValidation; // Deep red hover
}

type ProceedState = 'default' | 'hover' | 'active' | 'proceeding';

interface ProceedVisualStyle {
  defaultColor: Color; // Near-black or charcoal
  hoverColor: Color; // Deep red per visual-system Property 10
  activeColor: Color; // Blood red
  transition: TransitionConfig; // 300ms ease-in-out
  buttonText: string; // "Proceed", "Continue", "Complete"
}
```

#### Empty Collection State

The Empty Collection State provides elegant invitation to explore when cart is empty.

```typescript
interface EmptyCollectionState {
  visualStyle: EmptyStateVisualStyle;
  
  // Rendering
  render(): EmptyStateElement;
  
  // Validation
  validateTone(): ToneValidation; // No aggressive language
  validateExclusions(): ExclusionValidation; // No urgency, no promotions
}

interface EmptyStateVisualStyle {
  messageColor: Color; // Near-black or charcoal
  accentColor: Color; // Muted gold for subtle emphasis
  typography: {
    messageSize: number; // 20px (Body Large)
    labelSize: number; // 16px (Body)
  };
  spacing: {
    vertical: number; // Generous vertical spacing
  };
}

interface EmptyStateElement {
  messageElement: Element; // "Your collection awaits" or "Begin your curation"
  navigationElement: LinkElement; // "Explore threshold" or "Discover objects"
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
  | ProceedAction
  | QuantityControls
  | RemoveAction
  | NavigationControl;
```

#### Quantity Update Handler

```typescript
interface QuantityUpdateHandler {
  // Handle quantity changes
  onQuantityChange(lineItemId: string, newQuantity: number): Promise<void>;
  updateCartDisplay(updatedCart: Cart): void;
  
  // Validation
  validateTransition(): TransitionValidation; // Subtle transitions
  validateFeedback(): FeedbackValidation; // No aggressive confirmations
}
```

#### Item Removal Handler

```typescript
interface ItemRemovalHandler {
  // Handle item removal
  onRemove(lineItemId: string): Promise<void>;
  animateRemoval(itemElement: Element): void; // Fade out 300ms
  updateCartDisplay(updatedCart: Cart): void;
  
  // Validation
  validateTransition(): TransitionValidation; // Subtle fade-out
  validateConfirmation(): ConfirmationValidation; // No "Are you sure?" dialogs
}
```

### Navigation Layer

#### Return Navigation

```typescript
interface ReturnNavigation {
  navigationContext: NavigationContext | null;
  
  // Navigate back to discovery
  returnToDiscovery(): void;
  
  // Rendering
  render(): NavigationElement;
  
  // Validation
  validateLanguage(): LanguageValidation; // No "Continue shopping"
  validateInteraction(): InteractionValidation; // Deep red hover
}

interface NavigationElement {
  backLink: LinkElement;
  visualStyle: NavigationVisualStyle;
}

interface NavigationVisualStyle {
  defaultColor: Color; // Muted gold or near-black
  hoverColor: Color; // Deep red per visual-system Property 10
  fontSize: number; // 14px (Body Small)
  spacing: number; // Min 18px from other elements
}
```

#### Cart Access Indicator

```typescript
interface CartAccessIndicator {
  itemCount: number;
  visualStyle: IndicatorVisualStyle;
  
  // Rendering
  render(): IndicatorElement;
  
  // Validation
  validateSubtlety(): boolean; // No aggressive badges
  validateInteraction(): InteractionValidation; // Deep red hover
}

interface IndicatorVisualStyle {
  iconColor: Color; // Muted gold
  hoverColor: Color; // Deep red
  countColor: Color; // Muted gold
  countDisplay: 'subtle' | 'none'; // Subtle number, no red badge
}

interface IndicatorElement {
  iconElement: Element; // Cart icon
  countElement?: Element; // Optional item count
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
  
  // Spacing validation (adjusted for controlled clarity)
  validateSpacing(view: CartView): SpacingValidation;
  validateDensity(view: CartView): DensityValidation;
  
  // Interaction validation
  validateTransitions(elements: InteractiveElement[]): TransitionValidation;
  
  // Comprehensive validation
  validateFullConformance(view: CartView): ConformanceReport;
}

interface SpacingValidation {
  isValid: boolean;
  minimumElementSpacing: number; // 18px (reduced from 24px)
  minimumSectionSpacing: number; // 72px (reduced from 96px)
  violations: string[];
}
```

#### Exclusion Validator

```typescript
interface ExclusionValidator {
  // Forbidden pattern detection
  detectPopups(view: CartView): boolean;
  detectDiscountBanners(view: CartView): boolean;
  detectCountdownTimers(view: CartView): boolean;
  detectScarcityMechanics(view: CartView): boolean;
  detectShippingThresholds(view: CartView): boolean; // "Free shipping over $X"
  detectAbandonedCartMessaging(view: CartView): boolean;
  detectUpsells(view: CartView): boolean; // "You might also like"
  detectCompetingCTAs(view: CartView): boolean; // "Save for later", "Share cart"
  detectFulfillmentMessaging(view: CartView): boolean;
  detectShippingUrgency(view: CartView): boolean;
  detectDeliveryTimeframes(view: CartView): boolean;
  
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
  lineItems: LineItem[];
  subtotal: number;
  currency: string;
  itemCount: number;
  createdAt: Date;
  updatedAt: Date;
}

interface LineItem {
  id: string;
  productId: string;
  variantId: string;
  title: string;
  variantTitle?: string;
  price: number;
  quantity: number;
  image: ProductImage;
  productHandle: string;
}

interface ProductImage {
  url: string;
  alt: string;
  width: number;
  height: number;
}
```

### View State Model

```typescript
// Cart view state
interface CartViewState {
  cartId: string;
  isUpdating: boolean;
  updateFeedback: UpdateFeedback | null;
  navigationContext: NavigationContext | null;
  viewport: Viewport;
}

interface UpdateFeedback {
  type: 'quantity-updated' | 'item-removed' | 'error';
  message: string;
  duration: number;
}

interface NavigationContext {
  previousRoute: string;
  returnLabel: string;
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
  elementType: 'proceed-action' | 'quantity-control' | 'remove-action' | 'navigation';
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
  itemTitle: {
    fontSize: number; // 24px (H3) or 20px (Body Large)
    fontWeight: number;
    lineHeight: number;
    color: string;
  };
  itemPrice: {
    fontSize: number; // 20px (Body Large)
    fontWeight: number;
    color: string; // Muted gold
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
  xs: number; // 4px
  sm: number; // 8px
  md: number; // 16px
  lg: number; // 18px (reduced from 24px per visual-system Property 16)
  xl: number; // 32px
  '2xl': number; // 48px
  '3xl': number; // 64px
  '4xl': number; // 72px (reduced from 96px per visual-system Property 16)
}

interface InteractionConfig {
  transitions: {
    hover: TransitionConfig;
    active: TransitionConfig;
    removal: TransitionConfig;
    quantityUpdate: TransitionConfig;
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
      layout: 'single-column';
      itemsPerViewport: 5;
      summaryPosition: 'below-items';
    };
    tablet: {
      minWidth: 769;
      maxWidth: 1024;
      layout: 'single-column';
      itemsPerViewport: 6;
      summaryPosition: 'below-items';
    };
    desktop: {
      minWidth: 1025;
      layout: 'single-column' | 'two-column'; // Optional 2-col on large desktop
      itemsPerViewport: 7;
      summaryPosition: 'sidebar' | 'below-items';
    };
  };
  
  // Spacing adjusted for controlled clarity (visual-system Property 16)
  spacingMultipliers: {
    mobile: 0.75; // 25% reduction from discovery
    tablet: 0.75;
    desktop: 0.75;
  };
  
  // Minimum spacing maintained
  minimumSpacing: {
    elementGap: 18; // px
    sectionGap: 72; // px
  };
}
```


### Layout Calculation

The layout system calculates optimal element placement based on viewport size while maintaining visual-system conformance with controlled clarity:

1. **Determine breakpoint** from viewport width
2. **Calculate item layout** (single-column on mobile/tablet, optional 2-col on large desktop)
3. **Calculate item dimensions** maintaining aspect ratio and spacing
4. **Validate density** (5-7 items per viewport height)
5. **Apply spacing** (min 18px between elements, 72px between sections)
6. **Position summary** (below items on mobile/tablet, sidebar or below on desktop)
7. **Render view** with visual-system conformance

## Collection Item Presentation Strategy

### Item Layout Patterns

**Single Item Structure:**
- Product image (left or top depending on viewport)
- Product title and variant details (right or below image)
- Price (below title)
- Quantity controls (below price)
- Remove action (subtle, positioned elegantly)

**Image Sizing:**
- Mobile: 80-100px square
- Tablet: 100-120px square
- Desktop: 120-150px square
- Maintain aspect ratio (1:1 to 4:3)

**Spacing:**
- Minimum 18px between image and text
- Minimum 18px between title, price, quantity
- Minimum 18px between items
- Minimum 72px between collection items and summary

### Quantity Control Patterns

**Increment/Decrement Buttons:**
- Elegant button design (not conventional spinners)
- Deep red hover states
- Subtle transitions (300ms)
- Disabled state when at min (1) or max (99)

**Quantity Display:**
- Current quantity displayed between buttons
- Typography: 16px (Body)
- Color: Near-black

**Layout:**
- Horizontal on desktop: [−] [3] [+]
- Compact on mobile: [−] [3] [+] (smaller buttons)

### Remove Action Patterns

**Remove Button:**
- Text: "Release" or "Remove" (not "Delete" or "X")
- Position: Below quantity or to the right
- Color: Near-black or charcoal
- Hover: Deep red
- Transition: 300ms ease-in-out

**Removal Animation:**
- Fade out: 300ms
- Slide up remaining items: 300ms
- Update subtotal: Smooth transition
- No confirmation dialog

## Collection Summary Strategy

### Summary Presentation

**Subtotal Display:**
- Label: "Subtotal" or "Collection total"
- Value: Price in muted gold
- Typography: 20px (Body Large)
- Not aggressive prominence

**Proceed Action:**
- Button text: "Proceed", "Continue", "Complete"
- Position: Below subtotal
- Deep red hover state
- 300ms transition

**Exclusions:**
- No shipping estimates
- No tax calculations
- No discount code fields
- No "Free shipping over $X" messaging
- No delivery timeframes

### Summary Positioning

**Mobile/Tablet:**
- Below collection items
- Minimum 72px spacing from last item
- Full width

**Desktop:**
- Option 1: Below collection items (same as mobile)
- Option 2: Sidebar (right side, sticky)
- Minimum 72px spacing from items


## Empty Collection State Strategy

### Empty State Presentation

**Message:**
- Text: "Your collection awaits" or "Begin your curation"
- Typography: 20px (Body Large)
- Color: Near-black or charcoal
- Centered in viewport

**Navigation:**
- Link text: "Explore threshold" or "Discover objects"
- Color: Muted gold
- Hover: Deep red
- Position: Below message

**Exclusions:**
- No aggressive "Your cart is empty!" messaging
- No featured product suggestions
- No discount offers
- No urgency patterns

### Empty State Layout

**Vertical Centering:**
- Message and navigation centered vertically in viewport
- Generous whitespace around elements
- Minimum 72px spacing between message and navigation

**Visual Treatment:**
- Maintain black dominance (60-80%)
- Muted gold for navigation link
- Deep red hover states
- Elegant, inviting atmosphere

## Navigation and Flow Strategy

### Return to Discovery

**Navigation Pattern:**
- Link text: "Return to threshold" or "Continue exploring"
- Position: Top of cart view or near summary
- Color: Muted gold
- Hover: Deep red

**State Preservation:**
- Maintain cart state when navigating away
- Cart persists across sessions (Shopify cart persistence)
- Seamless return to cart from any page

### Cart Access from Other Pages

**Cart Indicator:**
- Subtle cart icon (not aggressive)
- Optional item count (muted gold, not red badge)
- Position: Header or navigation area
- Hover: Deep red

**Cart Route:**
- Route: `/threshold/collection` or `/cart`
- Accessible from discovery, product detail, and other pages
- Maintains Threshold aesthetic

### Proceed to Checkout

**Checkout Navigation:**
- Button: "Proceed", "Continue", "Complete"
- Action: Navigate to Shopify checkout URL
- Transition: Elegant, no aggressive messaging
- No auto-navigation or forced progression

## Fulfillment Invisibility Strategy

### Operational Details Hidden

**What Remains Invisible:**
- Fulfillment method (dropshipping vs in-house)
- Warehouse location
- "Ships from" messaging
- Delivery timeframes ("Estimated delivery: X days")
- Shipping urgency ("Ships today", "Order within X hours")
- Shipping cost estimates (unless explicitly necessary at checkout)

**What May Be Visible (If Necessary):**
- Generic delivery information at checkout only
- No specific dates, no timeframe ranges
- Calm, non-urgent language

**Inventory Status:**
- No "Only X left" messaging in cart
- No inventory countdown
- If item becomes unavailable, handle gracefully with elegant messaging

