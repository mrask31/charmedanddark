# Requirements Document: Cart

## Introduction

The Cart defines the curated collection experience where visitors review claimed objects before proceeding to checkout in the Threshold of Charmed & Dark. This is NOT a conventional shopping cart with aggressive upsells and urgency—it's a contemplative space where the visitor confirms their selections and prepares for the completion ritual. The cart is a moment of reflection and confirmation, not pressure or transaction.

This feature explicitly conforms to the Visual System spec (.kiro/specs/visual-system/) and builds naturally from the Product Discovery spec (.kiro/specs/product-discovery/) and Product Detail spec (.kiro/specs/product-detail/). Every requirement references the visual-system properties it must uphold and maintains continuity with established patterns.

## Glossary

- **Cart**: The curated collection experience where visitors review claimed objects before proceeding to checkout
- **Curated_Collection**: The presentation of cart items as objects of meaning rather than transactional line items
- **Collection_Item**: A single product in the cart, presented with intentional space and dignity
- **Collection_Summary**: The elegant presentation of subtotal and collection information without aggressive prominence
- **Claiming_Confirmation**: The moment when a visitor confirms their collection and proceeds to checkout
- **Visual_System**: The foundational design language defined in .kiro/specs/visual-system/ that governs all visual aspects
- **Shopify_Cart**: Cart data sourced from Shopify including line items, quantities, prices, and cart management
- **Fulfillment_Invisibility**: The principle that operational fulfillment details (shipping methods, delivery timeframes, warehouse locations) remain hidden unless explicitly necessary
- **Threshold**: The public storefront where discovery, detail, and cart experiences occur
- **Empty_Collection_State**: The elegant state when no items are in the cart, inviting exploration without pressure

## Requirements

### Requirement 1: Curated Collection Presentation

**User Story:** As a visitor, I want to review my claimed objects in a curated collection space, so that I can contemplate my selections before proceeding to completion.

#### Acceptance Criteria

1. WHEN rendering the Cart view, THE Cart SHALL display a maximum of 5-7 collection items per viewport height
   - _Conforms to: visual-system Property 9 (Maximum Layout Density), Property 15 (Discovery State Maximum Atmosphere)_

2. WHEN laying out Collection_Items, THE Cart SHALL maintain minimum 24px spacing between items and 96px spacing between major sections
   - _Conforms to: visual-system Property 8 (Minimum Spacing Requirements)_

3. WHEN rendering Collection_Items, THE Cart SHALL present each item with generous whitespace and intentional placement rather than dense list formatting
   - _Conforms to: visual-system Property 15 (Discovery State Maximum Atmosphere)_

4. WHEN rendering the Cart view, THE Cart SHALL display collection items in a single-column layout on mobile and tablet viewports, and may use a maximum of 2 columns on large desktop viewports
   - Maintains curated aesthetic, prevents dense grids

5. THE Cart SHALL exclude aggressive cart total prominence, promotional upsells, and competing product suggestions from all cart presentation
   - No "You might also like" sections
   - No "Frequently bought together" suggestions
   - No "Add more to save" prompts

### Requirement 2: Visual System Color Conformance

**User Story:** As a designer, I want the cart to honor the sacred color palette, so that the collection review maintains gothic-romantic luxury aesthetic.

#### Acceptance Criteria

1. WHEN rendering the Cart view, THE Cart SHALL ensure black and near-black tones occupy 60-80% of visual space
   - _Conforms to: visual-system Property 4 (Black Dominance in Visual Space)_

2. WHEN rendering Collection_Summary elements, THE Cart SHALL use muted gold for emphasis (subtotal, borders) in less than 5% of visual space
   - _Conforms to: visual-system Property 5 (Gold Scarcity)_

3. WHEN rendering interactive elements, THE Cart SHALL use deep red colors (wine, blood, garnet) for hover states
   - _Conforms to: visual-system Property 10 (Hover States Use Deep Red), Property 1 (Ritual Moments Use Deep Red)_

4. THE Cart SHALL exclude bright colors, saturated colors, and neon colors from all cart presentation
   - _Conforms to: visual-system Property 14 (Color Brightness and Saturation Limits)_

5. WHEN rendering the Cart view, THE Cart SHALL allow spacing reduction up to 25% from discovery state while maintaining minimum spacing requirements (18px between elements, 72px between sections)
   - _Conforms to: visual-system Property 16 (Transactional State Controlled Clarity)_

### Requirement 3: Collection Item Presentation

**User Story:** As a visitor, I want to see each collection item presented with dignity, so that I can review product details and make intentional decisions.

#### Acceptance Criteria

1. WHEN rendering a Collection_Item, THE Cart SHALL display product image, title, price, variant details (if applicable), and quantity as minimum required information

2. WHEN rendering Collection_Item images, THE Cart SHALL display high-quality product imagery with appropriate aspect ratios (1:1 to 4:3)

3. WHEN rendering Collection_Item titles, THE Cart SHALL use typography from the visual-system type scale (H3 or Body Large)
   - _Conforms to: visual-system typography hierarchy_

4. WHEN rendering Collection_Item prices, THE Cart SHALL use muted gold color for emphasis
   - _Conforms to: visual-system Property 3 (Emphasis Elements Use Muted Gold)_

5. WHEN rendering Collection_Item metadata, THE Cart SHALL maintain minimum spacing between image, title, price, variant details, and quantity elements
   - Minimum 18px spacing (reduced from 24px per visual-system Property 16)
   - _Conforms to: visual-system Property 16 (Transactional State Controlled Clarity)_

### Requirement 4: Collection Management Actions

**User Story:** As a visitor, I want to manage my collection elegantly, so that I can adjust quantities or remove items without aggressive interactions.

#### Acceptance Criteria

1. WHEN providing quantity adjustment, THE Cart SHALL present elegant quantity controls rather than conventional spinners or aggressive increment buttons

2. WHEN rendering quantity controls, THE Cart SHALL use deep red for hover states and maintain visual-system interaction behaviors
   - _Conforms to: visual-system Property 10 (Hover States Use Deep Red), Property 11 (Subtle Transition Timing)_

3. WHEN providing item removal, THE Cart SHALL present elegant removal action using ritualized language ("Release", "Remove") rather than aggressive "Delete" or "X" icons

4. WHEN a visitor removes an item, THE Cart SHALL provide subtle confirmation without popups or aggressive messaging
   - Brief fade-out transition (300ms)
   - No "Are you sure?" confirmation dialogs
   - _Conforms to: visual-system Property 13 (Forbidden Pattern Detection - no popups)_

5. WHEN updating quantities or removing items, THE Cart SHALL use transition durations between 150ms and 500ms with subtle easing
   - _Conforms to: visual-system Property 11 (Subtle Transition Timing)_

### Requirement 5: Collection Summary Presentation

**User Story:** As a visitor, I want to see my collection summary presented elegantly, so that I understand the total without aggressive prominence or pressure.

#### Acceptance Criteria

1. WHEN rendering the Collection_Summary, THE Cart SHALL display subtotal with muted gold emphasis without aggressive "TOTAL" or "CART TOTAL" prominence

2. WHEN rendering the Collection_Summary, THE Cart SHALL exclude shipping cost estimates, tax calculations, and delivery timeframes by default
   - _Conforms to: visual-system Property 13 (Forbidden Pattern Detection), Fulfillment_Invisibility principle_

3. WHEN rendering the Collection_Summary, THE Cart SHALL use typography from the visual-system type scale (Body Large for subtotal)
   - _Conforms to: visual-system typography hierarchy_

4. WHEN positioning the Collection_Summary, THE Cart SHALL place it intentionally without aggressive prominence or urgency patterns
   - Summary feels like confirmation, not transaction pressure

5. THE Cart SHALL exclude discount code entry fields, promotional messaging, and "Free shipping over $X" banners from the Collection_Summary
   - _Conforms to: visual-system Property 13 (Forbidden Pattern Detection)_

### Requirement 6: Proceed to Completion Action

**User Story:** As a visitor, I want a single, clear action to proceed to checkout, so that the decision feels intentional rather than pressured.

#### Acceptance Criteria

1. WHEN rendering the proceed action, THE Cart SHALL display exactly one primary call-to-action for proceeding to checkout

2. WHEN rendering the proceed button, THE Cart SHALL use ritualized language including "Proceed", "Continue", "Complete" rather than "Checkout now" or "Buy now"
   - _Conforms to: visual-system Property 7 (Forbidden Phrase Detection)_

3. WHEN a visitor hovers over the proceed action, THE Cart SHALL transition the button color to deep red within 300ms using ease-in-out easing
   - _Conforms to: visual-system Property 10 (Hover States Use Deep Red), Property 11 (Subtle Transition Timing)_

4. WHEN positioning the proceed action, THE Cart SHALL place it intentionally without aggressive prominence or urgency patterns
   - No flashing buttons, no countdown timers, no "Complete your order now" messaging

5. THE Cart SHALL exclude competing calls-to-action beyond the primary proceed action and optional return to discovery
   - No "Save for later" buttons
   - No "Email me this cart" prompts
   - No "Share cart" functionality

### Requirement 7: Empty Collection State

**User Story:** As a visitor with an empty cart, I want an elegant empty state, so that I feel invited to explore rather than pressured to purchase.

#### Acceptance Criteria

1. WHEN the cart is empty, THE Cart SHALL display an elegant empty state message using gothic typography and ritualized language

2. WHEN rendering the empty state, THE Cart SHALL use language such as "Your collection awaits" or "Begin your curation" rather than aggressive "Your cart is empty!"
   - _Conforms to: visual-system Property 7 (Forbidden Phrase Detection)_

3. WHEN providing navigation from empty state, THE Cart SHALL offer elegant return to discovery without aggressive "Start shopping" buttons

4. WHEN rendering the empty state, THE Cart SHALL maintain all visual-system color hierarchy, spacing, and interaction requirements
   - _Conforms to: visual-system Properties 4, 5, 8, 9, 10_

5. THE Cart SHALL exclude urgency patterns, promotional messaging, and aggressive calls-to-action from the empty state
   - No "Don't miss out" messaging
   - No featured product suggestions
   - No discount offers

### Requirement 8: Explicit Exclusion of Pressure Patterns

**User Story:** As a visitor, I want the cart experience to feel inviting rather than pressured, so that I can review my collection without manipulation or urgency.

#### Acceptance Criteria

1. THE Cart SHALL exclude popups from all cart interfaces
   - _Conforms to: visual-system Property 13 (Forbidden Pattern Detection)_

2. THE Cart SHALL exclude discount banners and promotional messaging from all cart presentation
   - _Conforms to: visual-system Property 13 (Forbidden Pattern Detection)_

3. THE Cart SHALL exclude countdown timers from all cart interfaces
   - _Conforms to: visual-system Property 13 (Forbidden Pattern Detection)_

4. THE Cart SHALL exclude scarcity mechanics such as "Only X left" messaging from all cart presentation
   - _Conforms to: visual-system Property 13 (Forbidden Pattern Detection)_

5. THE Cart SHALL exclude "Free shipping over $X" progress bars and shipping threshold messaging from all cart interfaces
   - _Conforms to: visual-system Property 13 (Forbidden Pattern Detection)_

6. THE Cart SHALL exclude abandoned cart recovery messaging and aggressive "Complete your order" prompts from all cart presentation
   - _Conforms to: visual-system Property 18 (No Pressure Energy Patterns)_

7. THE Cart SHALL ensure no interface element conveys pressure energy through urgent language, aggressive animations, or excessive color saturation
   - _Conforms to: visual-system Property 18 (No Pressure Energy Patterns)_

### Requirement 9: Shopify Cart Integration

**User Story:** As a system, I want to source cart data from Shopify, so that cart information remains synchronized with the commerce backend.

#### Acceptance Criteria

1. WHEN retrieving cart data, THE Cart SHALL fetch Shopify_Cart data including line items, quantities, prices, variant details, and product images

2. WHEN a visitor updates quantities, THE Cart SHALL integrate with Shopify cart functionality to update line item quantities

3. WHEN a visitor removes an item, THE Cart SHALL integrate with Shopify cart functionality to remove the line item

4. WHEN cart data changes, THE Cart SHALL update the Collection_Summary subtotal to reflect current cart state

5. WHEN a visitor proceeds to checkout, THE Cart SHALL integrate with Shopify checkout functionality to initiate the checkout flow

6. THE Cart SHALL ensure cart data persists across sessions using Shopify cart persistence mechanisms

### Requirement 10: Fulfillment Invisibility

**User Story:** As a visitor, I want the cart experience to remain calm and ritualistic, so that operational fulfillment details do not introduce pressure or urgency.

#### Acceptance Criteria

1. THE Cart SHALL ensure fulfillment method (dropshipping partners or in-house fulfillment) remains invisible to visitors in all cart presentation
   - _Conforms to: Fulfillment_Invisibility principle_

2. THE Cart SHALL exclude shipping urgency language such as "Ships today", "Order within X hours", "Fast shipping" from all cart interfaces
   - _Conforms to: visual-system Property 13 (Forbidden Pattern Detection), Property 18 (No Pressure Energy Patterns)_

3. THE Cart SHALL exclude delivery timeframes and "Estimated delivery" dates from all cart presentation by default
   - _Conforms to: Fulfillment_Invisibility principle_

4. THE Cart SHALL exclude "Ships from" or fulfillment location messaging from all cart interfaces
   - _Conforms to: Fulfillment_Invisibility principle_

5. WHEN providing delivery information (if explicitly necessary), THE Cart SHALL use elegant, calm language without urgency patterns
   - Use language like "Delivery information available at completion" rather than specific timeframes
   - No countdown timers or urgency indicators

### Requirement 11: Navigation and Flow

**User Story:** As a visitor, I want to navigate between cart and discovery elegantly, so that I can continue exploring or proceed to completion without aggressive prompts.

#### Acceptance Criteria

1. WHEN providing navigation back to discovery, THE Cart SHALL display elegant return navigation without aggressive "Continue shopping" prompts

2. WHEN rendering navigation controls, THE Cart SHALL use deep red for hover states and maintain visual-system interaction behaviors
   - _Conforms to: visual-system Property 10 (Hover States Use Deep Red), Property 11 (Subtle Transition Timing)_

3. WHEN a visitor navigates back to discovery, THE Cart SHALL maintain cart state and allow seamless return to cart

4. WHEN a visitor proceeds to checkout, THE Cart SHALL navigate to Shopify checkout with elegant transition
   - No aggressive "Checkout now" messaging
   - No auto-navigation or forced progression

5. THE Cart SHALL exclude "Save for later" functionality and wishlist prompts from all cart interfaces
   - Primary actions are: review collection, adjust quantities, remove items, proceed to checkout, return to discovery

### Requirement 12: Responsive Behavior

**User Story:** As a visitor on any device, I want the cart to maintain collection aesthetic, so that the experience feels intentional regardless of viewport size.

#### Acceptance Criteria

1. WHEN rendering on mobile viewports, THE Cart SHALL display collection items in single-column layout while maintaining minimum spacing requirements
   - Minimum 18px spacing (reduced from 24px per visual-system Property 16)
   - _Conforms to: visual-system Property 16 (Transactional State Controlled Clarity)_

2. WHEN rendering on tablet viewports, THE Cart SHALL display collection items in single-column layout while maintaining maximum density limits (5-7 items per viewport)
   - _Conforms to: visual-system Property 9 (Maximum Layout Density)_

3. WHEN rendering on desktop viewports, THE Cart SHALL display collection items elegantly with optional 2-column layout for large viewports while maintaining curated aesthetic

4. WHEN adjusting layout for viewport size, THE Cart SHALL maintain all visual-system color hierarchy, spacing, and interaction requirements
   - _Conforms to: visual-system Properties 4, 5, 8 (adjusted per Property 16), 9, 10, 11_

5. WHEN rendering the Collection_Summary, THE Cart SHALL position it appropriately for each viewport (below items on mobile, sidebar or below on desktop)

### Requirement 13: Cognitive Load Control and Singular Focus

**User Story:** As a visitor, I want the cart to guide my attention toward collection review and completion decision, so that I can experience clarity without competing demands.

#### Acceptance Criteria

1. WHEN rendering the Cart view, THE Cart SHALL surface no more than two primary decision points: collection management (adjust quantities, remove items) and proceed to completion

2. WHEN presenting collection items, THE Cart SHALL ensure each item receives intentional space and attention without competing for prominence

3. THE Cart SHALL exclude competing calls-to-action such as "Add to wishlist", "Save for later", "Email cart", "Share cart" from the cart view

4. WHEN rendering navigation and collection management controls, THE Cart SHALL ensure these elements remain secondary to the primary completion decision

5. THE Cart SHALL maintain cognitive simplicity by limiting decision points to collection management and proceed action
   - _Conforms to: visual-system principles of slowness and presence over volume_

### Requirement 14: Cart Route and Access

**User Story:** As a visitor, I want to access my cart from any page, so that I can review my collection when ready.

#### Acceptance Criteria

1. WHEN defining the cart route, THE Cart SHALL use an elegant route path such as "/threshold/collection" or "/cart" that maintains the Threshold aesthetic

2. WHEN providing cart access from other pages, THE Cart SHALL offer subtle cart access (link or icon) without aggressive cart badges or item count overlays

3. WHEN rendering cart access indicators, THE Cart SHALL use deep red for hover states and maintain visual-system interaction behaviors
   - _Conforms to: visual-system Property 10 (Hover States Use Deep Red)_

4. WHEN a visitor has items in cart, THE Cart SHALL optionally display a subtle item count indicator without aggressive prominence
   - Use muted gold for count indicator
   - No red notification badges
   - No pulsing or animated indicators

5. THE Cart SHALL ensure cart access remains available from discovery, product detail, and other Threshold pages without aggressive prominence

