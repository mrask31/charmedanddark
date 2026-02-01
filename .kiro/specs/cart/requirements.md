# Requirements Document: Cart

## Introduction

The Cart defines the curated collection experience where visitors review claimed objects before proceeding to checkout in the Threshold of Charmed & Dark. This is NOT a conventional shopping cart with urgency patterns—it's a contemplative space for reviewing selections, making adjustments, and proceeding when ready. The Cart is a moment of reflection and confirmation, not urgency or pressure.

This feature explicitly conforms to the Visual System spec (.kiro/specs/visual-system/) and builds naturally from the Product Discovery and Product Detail specs. Every requirement references the visual-system properties it must uphold and maintains continuity with discovery and detail patterns.

## Glossary

- **Cart**: The curated collection space where visitors review claimed objects before proceeding to checkout
- **Curated_Collection**: The presentation of cart items as objects of meaning rather than transactional line items
- **Cart_Item**: A claimed product with selected variant, quantity, and imagery presented with intentional space
- **Proceed_Action**: The primary ritual moment where a visitor continues to checkout (NOT "Buy now" or "Checkout now")
- **Cart_Summary**: The elegant presentation of subtotal and essential cart information without aggressive upsells
- **Visual_System**: The foundational design language defined in .kiro/specs/visual-system/ that governs all visual aspects
- **Shopify_Cart**: Cart data sourced from Shopify including cart ID, line items, quantities, and prices
- **Fulfillment_Invisibility**: The principle that operational fulfillment details (shipping costs, delivery timeframes, warehouse locations) remain hidden unless explicitly necessary
- **Transactional_State**: The cart/checkout commerce state where visual-system allows up to 25% spacing reduction while maintaining minimums (18px between elements, 72px between sections)

## Requirements

### Requirement 1: Curated Collection Presentation

**User Story:** As a visitor, I want to review my claimed objects in a curated collection space, so that each item feels like an object of meaning rather than a line item.

#### Acceptance Criteria

1. WHEN rendering the Cart view, THE Cart SHALL display a maximum of 5-7 cart items per viewport height
   - _Conforms to: visual-system Property 9 (Maximum Layout Density)_

2. WHEN spacing Cart_Items, THE Cart SHALL maintain minimum 18px spacing between items and 72px spacing between cart sections, applying transactional state spacing reduction
   - _Conforms to: visual-system Property 16 (Transactional State Controlled Clarity)_
   - Base spacing (24px/96px) may be reduced by up to 25% in cart state

3. WHEN rendering Cart_Items, THE Cart SHALL present each item with generous whitespace, product imagery, title, variant selection, price, and quantity
   - Each item receives intentional space and visual breathing room

4. THE Cart SHALL exclude dense list views, cramped spacing, and conventional shopping cart layouts
   - No table-style layouts with minimal spacing
   - No aggressive "line item" presentation

5. WHEN rendering Cart_Items, THE Cart SHALL ensure each item feels distinct and intentionally placed
   - _Conforms to: visual-system Property 16 (Transactional State Controlled Clarity)_

### Requirement 2: Visual System Color Conformance

**User Story:** As a designer, I want the cart to honor the sacred color palette, so that the curated collection maintains gothic-romantic luxury aesthetic.

#### Acceptance Criteria

1. WHEN rendering the Cart view, THE Cart SHALL ensure black and near-black tones occupy 60-80% of visual space
   - _Conforms to: visual-system Property 4 (Black Dominance in Visual Space)_

2. WHEN rendering Cart_Summary and emphasis elements, THE Cart SHALL use muted gold for subtotal, borders, and icons in less than 5% of visual space
   - _Conforms to: visual-system Property 5 (Gold Scarcity)_

3. WHEN rendering the Proceed_Action, THE Cart SHALL use deep red colors (wine, blood, garnet) for hover states
   - _Conforms to: visual-system Property 10 (Hover States Use Deep Red), Property 1 (Ritual Moments Use Deep Red)_

4. WHEN rendering interactive elements (remove action, quantity adjustment, proceed button), THE Cart SHALL use deep red for hover states
   - _Conforms to: visual-system Property 10 (Hover States Use Deep Red)_

5. THE Cart SHALL exclude bright colors, saturated colors, and neon colors from all cart presentation
   - _Conforms to: visual-system Property 14 (Color Brightness and Saturation Limits)_

### Requirement 3: Cart Item Presentation

**User Story:** As a visitor, I want to see each cart item with clear imagery and details, so that I can review my selections with confidence.

#### Acceptance Criteria

1. WHEN rendering a Cart_Item, THE Cart SHALL display product image, title, variant selection (if applicable), price, and quantity as minimum required information

2. WHEN rendering Cart_Item imagery, THE Cart SHALL display product images prominently but not overwhelmingly, maintaining balance with text information

3. WHEN rendering Cart_Item titles, THE Cart SHALL use typography from the visual-system type scale (H3 or Body Large)
   - _Conforms to: visual-system typography hierarchy_

4. WHEN rendering Cart_Item prices, THE Cart SHALL use muted gold color for emphasis
   - _Conforms to: visual-system Property 3 (Emphasis Elements Use Muted Gold)_

5. WHEN spacing Cart_Item elements (image, title, variant, price, quantity), THE Cart SHALL maintain minimum 18px spacing between elements
   - _Conforms to: visual-system Property 16 (Transactional State Controlled Clarity)_

### Requirement 4: Cart Modification Actions

**User Story:** As a visitor, I want to modify cart items elegantly, so that adjustments feel intentional rather than transactional.

#### Acceptance Criteria

1. WHEN providing remove item functionality, THE Cart SHALL display a subtle remove action (text link or minimal icon) rather than aggressive delete buttons

2. WHEN a visitor hovers over the remove action, THE Cart SHALL transition the element color to deep red within 300ms using ease-in-out easing
   - _Conforms to: visual-system Property 10 (Hover States Use Deep Red), Property 11 (Subtle Transition Timing)_

3. WHEN a visitor removes an item, THE Cart SHALL provide subtle confirmation without aggressive "Are you sure?" popups
   - Brief transition or subtle text confirmation
   - _Conforms to: visual-system Property 13 (Forbidden Pattern Detection - no popups)_

4. WHEN providing quantity adjustment functionality, THE Cart SHALL use elegant controls rather than aggressive +/- buttons
   - Subtle increment/decrement controls or minimal input field
   - Deep red hover states on controls

5. WHEN a cart modification occurs, THE Cart SHALL use subtle transitions (150-500ms) to update the view
   - _Conforms to: visual-system Property 11 (Subtle Transition Timing)_

### Requirement 5: Cart Summary Presentation

**User Story:** As a visitor, I want to see a clear cart summary, so that I understand the total before proceeding.

#### Acceptance Criteria

1. WHEN rendering the Cart_Summary, THE Cart SHALL display subtotal with muted gold emphasis
   - _Conforms to: visual-system Property 3 (Emphasis Elements Use Muted Gold)_

2. THE Cart_Summary SHALL exclude shipping cost estimates by default
   - _Conforms to: Fulfillment_Invisibility principle_

3. THE Cart_Summary SHALL exclude delivery timeframes and "Get it by [date]" messaging
   - _Conforms to: visual-system Property 13 (Forbidden Pattern Detection), Fulfillment_Invisibility_

4. THE Cart_Summary SHALL exclude countdown timers and urgency messaging
   - _Conforms to: visual-system Property 13 (Forbidden Pattern Detection)_

5. THE Cart_Summary SHALL exclude aggressive upsells, cross-sells, and "You might also like" sections
   - Focus remains on reviewing claimed objects only

### Requirement 6: Proceed Action (Primary CTA)

**User Story:** As a visitor, I want a single, clear action to proceed to checkout, so that the decision feels intentional rather than pressured.

#### Acceptance Criteria

1. WHEN rendering the Proceed_Action, THE Cart SHALL display exactly one primary call-to-action for proceeding to checkout

2. WHEN rendering the Proceed_Action button, THE Cart SHALL use ritualized language including "Proceed", "Continue", "Complete" rather than "Checkout now" or "Buy now"
   - _Conforms to: visual-system Property 7 (Forbidden Phrase Detection)_

3. WHEN a visitor hovers over the Proceed_Action, THE Cart SHALL transition the button color to deep red within 300ms using ease-in-out easing
   - _Conforms to: visual-system Property 10 (Hover States Use Deep Red), Property 11 (Subtle Transition Timing)_

4. WHEN positioning the Proceed_Action, THE Cart SHALL place it intentionally without aggressive prominence or urgency patterns
   - No flashing buttons, no excessive size, no aggressive positioning

5. THE Cart SHALL exclude competing calls-to-action beyond the primary Proceed_Action
   - No "Save for later", "Email cart", "Share cart" buttons

### Requirement 7: Empty Cart State

**User Story:** As a visitor with an empty cart, I want elegant messaging and invitation to explore, so that the experience feels inviting rather than transactional.

#### Acceptance Criteria

1. WHEN the cart is empty, THE Cart SHALL display elegant empty state messaging without aggressive language
   - Use language like "Your collection awaits" or "No objects claimed yet"
   - _Conforms to: visual-system tone guidelines_

2. WHEN rendering empty cart state, THE Cart SHALL provide invitation to return to discovery without urgency
   - Subtle link: "Explore threshold" or "Discover objects"
   - Deep red hover state on link

3. THE Cart SHALL exclude aggressive empty cart messaging such as "Your cart is empty! Start shopping now!"
   - _Conforms to: visual-system Property 7 (Forbidden Phrase Detection)_

4. WHEN rendering empty cart state, THE Cart SHALL maintain gothic aesthetic with generous whitespace
   - _Conforms to: visual-system Property 8 (Minimum Spacing Requirements)_

### Requirement 8: Fulfillment Invisibility

**User Story:** As a visitor, I want the cart experience to remain calm and contemplative, so that operational fulfillment details do not introduce pressure or urgency.

#### Acceptance Criteria

1. THE Cart SHALL exclude shipping cost estimates by default
   - No "Free shipping threshold" progress bars
   - No "Add $X more for free shipping" messaging
   - _Conforms to: Fulfillment_Invisibility principle_

2. THE Cart SHALL exclude delivery timeframes and "Get it by [date]" messaging
   - No "Order within X hours to get it by [date]"
   - _Conforms to: visual-system Property 13 (Forbidden Pattern Detection), Property 18 (No Pressure Energy Patterns)_

3. THE Cart SHALL exclude "Ships from" or fulfillment location details
   - Operational details remain hidden
   - _Conforms to: Fulfillment_Invisibility principle_

4. THE Cart SHALL exclude inventory countdown messaging such as "Only X left" or "Low stock"
   - _Conforms to: visual-system Property 13 (Forbidden Pattern Detection)_

5. THE Cart SHALL exclude shipping urgency language such as "Ships today", "Fast shipping", "Order now"
   - _Conforms to: visual-system Property 18 (No Pressure Energy Patterns)_

### Requirement 9: Explicit Exclusion of Pressure Patterns

**User Story:** As a visitor, I want the cart experience to feel inviting rather than pressured, so that I can review my selections without manipulation.

#### Acceptance Criteria

1. THE Cart SHALL exclude popups from all cart interfaces
   - _Conforms to: visual-system Property 13 (Forbidden Pattern Detection)_

2. THE Cart SHALL exclude discount code entry fields unless explicitly required
   - No prominent "Have a promo code?" sections
   - If discount codes must be supported, present elegantly and subtly

3. THE Cart SHALL exclude countdown timers from all cart interfaces
   - _Conforms to: visual-system Property 13 (Forbidden Pattern Detection)_

4. THE Cart SHALL exclude "You might also like" or upsell sections from all cart presentation
   - _Conforms to: visual-system Property 13 (Forbidden Pattern Detection)_

5. THE Cart SHALL exclude "Customers also bought" sections from all cart presentation
   - Focus remains on reviewing claimed objects only

6. THE Cart SHALL exclude aggressive "Complete your order" prompts and urgency messaging
   - _Conforms to: visual-system Property 18 (No Pressure Energy Patterns)_

### Requirement 10: Shopify Cart Integration

**User Story:** As a system, I want to integrate with Shopify cart functionality, so that cart data remains synchronized with the commerce backend.

#### Acceptance Criteria

1. WHEN retrieving cart data, THE Cart SHALL fetch Shopify_Cart data including cart ID, line items, quantities, prices, and variant information

2. WHEN a visitor modifies cart items (remove, update quantity), THE Cart SHALL sync modifications with Shopify cart state

3. WHEN a visitor proceeds to checkout, THE Cart SHALL navigate to Shopify checkout with the current cart ID

4. WHEN cart data changes, THE Cart SHALL update the view with subtle transitions (150-500ms)
   - _Conforms to: visual-system Property 11 (Subtle Transition Timing)_

5. THE Cart SHALL maintain cart persistence across sessions using Shopify cart functionality

### Requirement 11: Responsive Behavior

**User Story:** As a visitor on any device, I want the cart to maintain curated collection aesthetic, so that the experience feels intentional regardless of viewport size.

#### Acceptance Criteria

1. WHEN rendering on mobile viewports, THE Cart SHALL maintain curated collection aesthetic with minimum spacing requirements (18px between elements)
   - _Conforms to: visual-system Property 16 (Transactional State Controlled Clarity)_

2. WHEN rendering on tablet viewports, THE Cart SHALL maintain maximum density limits (5-7 items per viewport)
   - _Conforms to: visual-system Property 9 (Maximum Layout Density)_

3. WHEN rendering on desktop viewports, THE Cart SHALL balance cart items and summary elegantly while maintaining curated aesthetic

4. WHEN adjusting layout for viewport size, THE Cart SHALL maintain all visual-system color hierarchy, spacing, and interaction requirements
   - _Conforms to: visual-system Properties 4, 5, 8, 10, 11, 16_

### Requirement 12: Cognitive Load Control and Singular Focus

**User Story:** As a visitor, I want the cart to guide my attention toward a single primary decision, so that I can experience slowness and presence without competing demands.

#### Acceptance Criteria

1. WHEN rendering the Cart view, THE Cart SHALL surface exactly one primary call-to-action (Proceed_Action)

2. WHEN presenting cart items, THE Cart SHALL ensure each item receives intentional space and attention without competing elements

3. THE Cart SHALL exclude competing calls-to-action such as "Save for later", "Email cart", "Share cart", "Continue shopping" buttons
   - Primary action is proceeding to checkout only

4. WHEN rendering cart modifications (remove, quantity adjustment), THE Cart SHALL ensure these actions remain secondary to the primary proceed decision

5. THE Cart SHALL maintain cognitive simplicity by limiting decision points to cart modifications (optional) and proceed action (primary)
   - _Conforms to: visual-system principles of slowness and presence over volume_
