# Implementation Plan: Cart

## Overview

This implementation plan converts the cart design into discrete coding tasks for a Next.js frontend with Shopify backend integration. The cart is a curated collection space where visitors review claimed objects before proceeding to checkout, conforming to the visual-system spec with transactional state spacing rules (18px between elements, 72px between sections).

## Tasks

- [x] 1. Set up cart data layer and Shopify integration
  - [x] 1.1 Create TypeScript interfaces for Cart, CartLineItem, CartItemImage models
    - Define Cart interface with id, lineItems, subtotal, currency, itemCount
    - Define CartLineItem interface with id, productId, variantId, quantity, title, price, image
    - Define CartItemMetadata as optional enrichment data
    - _Requirements: 10.1_
  
  - [x] 1.2 Implement Shopify cart integration functions
    - Create fetchCart(cartId) function using Shopify Storefront API
    - Create updateLineItem(cartId, lineItemId, quantity) function
    - Create removeLineItem(cartId, lineItemId) function
    - Create getCheckoutUrl(cartId) function
    - _Requirements: 10.1, 10.2, 10.3_
  
  - [ ]* 1.3 Write property test for Shopify cart data completeness
    - **Property 19: Shopify Cart Data Completeness**
    - **Validates: Requirements 10.1**

- [x] 2. Implement cart view layout and responsive behavior
  - [x] 2.1 Create CartView component with responsive layout configuration
    - Implement single-column layout for mobile (≤768px)
    - Implement two-column layout for desktop (≥1025px)
    - Apply transactional state spacing (18px between elements, 72px between sections)
    - _Requirements: 1.2, 11.1, 11.2, 11.3_
  
  - [x] 2.2 Implement cart density limits (5-7 items per viewport)
    - Calculate items per viewport based on viewport height
    - Ensure maximum 7 items visible per viewport
    - _Requirements: 1.1_
  
  - [ ]* 2.3 Write property test for maximum cart density
    - **Property 1: Maximum Cart Density**
    - **Validates: Requirements 1.1, 11.2**
  
  - [ ]* 2.4 Write property test for transactional state minimum spacing
    - **Property 2: Transactional State Minimum Spacing**
    - **Validates: Requirements 1.2, 1.5, 3.5, 7.4, 11.1, 12.2**

- [ ] 3. Implement cart item card presentation
  - [ ] 3.1 Create CartItemCard component with required information display
    - Display product image (120x120px desktop, 100x100px mobile)
    - Display title using H3 (24px) or Body Large (20px) typography
    - Display variant selection if applicable (14px Body Small)
    - Display price with muted gold color (20px Body Large)
    - Display quantity controls
    - Display remove action
    - _Requirements: 1.3, 3.1, 3.3, 3.4_
  
  - [ ] 3.2 Implement cart item internal spacing (18px minimum)
    - Apply 18px spacing between image, title, variant, price, quantity elements
    - _Requirements: 3.5_
  
  - [ ]* 3.3 Write property test for required cart item information
    - **Property 3: Required Cart Item Information**
    - **Validates: Requirements 1.3, 3.1**
  
  - [ ]* 3.4 Write property test for cart item title typography conformance
    - **Property 9: Cart Item Title Typography Conformance**
    - **Validates: Requirements 3.3**
  
  - [ ]* 3.5 Write property test for cart item price color assignment
    - **Property 10: Cart Item Price Color Assignment**
    - **Validates: Requirements 3.4**

- [ ] 4. Checkpoint - Ensure cart item rendering works correctly
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 5. Implement cart modification actions
  - [ ] 5.1 Create remove item functionality with subtle confirmation
    - Implement onRemove handler that calls removeLineItem API
    - Apply fade-out transition (300ms) when removing
    - Display subtle "Item removed" feedback (2-3 seconds)
    - No "Are you sure?" popups
    - _Requirements: 4.1, 4.3_
  
  - [ ] 5.2 Create quantity adjustment controls with minimal typographic steppers
    - Implement "−" and "+" character buttons (not filled buttons)
    - Apply deep red hover states (300ms transition)
    - Disable decrement when quantity = 1
    - Update cart via updateLineItem API on change
    - _Requirements: 4.4_
  
  - [ ] 5.3 Implement cart modification transitions (150-500ms)
    - Apply subtle transitions for all cart updates
    - Update subtotal with fade transition
    - _Requirements: 4.5, 10.4_
  
  - [ ]* 5.4 Write property test for no aggressive confirmation popups
    - **Property 11: No Aggressive Confirmation Popups**
    - **Validates: Requirements 4.3**
  
  - [ ]* 5.5 Write property test for modification transition timing
    - **Property 12: Modification Transition Timing**
    - **Validates: Requirements 4.5, 10.4**

- [ ] 6. Implement cart summary presentation
  - [ ] 6.1 Create CartSummary component with subtotal display
    - Display item count: "X objects claimed"
    - Display subtotal with muted gold emphasis: "Subtotal: $XXX.XX"
    - Position summary in right column (desktop) or below items (mobile)
    - _Requirements: 5.1_
  
  - [ ] 6.2 Ensure fulfillment invisibility (no shipping estimates, no delivery timeframes)
    - Exclude shipping cost estimates
    - Exclude delivery timeframes
    - Exclude "Free shipping threshold" progress bars
    - Exclude "Ships from" messaging
    - Exclude inventory countdown
    - _Requirements: 5.2, 5.3, 8.1, 8.2, 8.3, 8.4, 8.5_
  
  - [ ] 6.3 Exclude aggressive upsells and cross-sells
    - No "You might also like" sections
    - No "Customers also bought" sections
    - No discount code fields (unless explicitly required)
    - _Requirements: 5.5, 9.2, 9.4, 9.5_
  
  - [ ]* 6.4 Write property test for cart summary subtotal color
    - **Property 13: Cart Summary Subtotal Color**
    - **Validates: Requirements 5.1**
  
  - [ ]* 6.5 Write property test for comprehensive fulfillment invisibility
    - **Property 14: Comprehensive Fulfillment Invisibility**
    - **Validates: Requirements 5.2, 5.3, 8.1, 8.2, 8.3, 8.4, 8.5**
  
  - [ ]* 6.6 Write property test for comprehensive forbidden pattern detection
    - **Property 15: Comprehensive Forbidden Pattern Detection**
    - **Validates: Requirements 5.4, 5.5, 9.1, 9.2, 9.3, 9.4, 9.5, 9.6**

- [ ] 7. Implement proceed action (primary CTA)
  - [ ] 7.1 Create ProceedAction button with ritualized language
    - Button text: "Proceed", "Continue", or "Complete"
    - Default style: near-black fill + muted gold hairline border + muted gold text
    - Hover state: deep red fill (300ms transition)
    - Active state: blood red fill with 0.98x scale
    - Position intentionally (below summary or bottom-right)
    - _Requirements: 6.1, 6.2, 6.3_
  
  - [ ] 7.2 Implement proceed to checkout navigation
    - On click, navigate to Shopify checkout URL
    - Pass cart ID to Shopify
    - Display "Proceeding..." state during navigation
    - _Requirements: 10.3_
  
  - [ ] 7.3 Ensure singular primary CTA (no competing actions)
    - Exclude "Save for later", "Email cart", "Share cart" buttons
    - Exclude "Continue shopping" buttons
    - _Requirements: 6.5, 12.1, 12.3_
  
  - [ ]* 7.4 Write property test for singular primary call-to-action
    - **Property 16: Singular Primary Call-to-Action**
    - **Validates: Requirements 6.1, 6.5, 12.1, 12.3**
  
  - [ ]* 7.5 Write property test for proceed action ritualized language
    - **Property 17: Proceed Action Ritualized Language**
    - **Validates: Requirements 6.2**

- [ ] 8. Checkpoint - Ensure cart summary and proceed action work correctly
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 9. Implement empty cart state
  - [ ] 9.1 Create EmptyCartState component with elegant messaging
    - Display message: "Your collection awaits" or "No objects claimed yet"
    - Display discovery link: "Explore threshold" or "Discover objects"
    - Apply muted gold color to link, deep red on hover
    - Maintain generous whitespace and gothic aesthetic
    - _Requirements: 7.1, 7.2, 7.4_
  
  - [ ] 9.2 Exclude aggressive empty cart messaging
    - No "Your cart is empty! Start shopping now!" language
    - No urgency patterns
    - _Requirements: 7.3_
  
  - [ ]* 9.3 Write property test for empty cart state language validation
    - **Property 18: Empty Cart State Language Validation**
    - **Validates: Requirements 7.1, 7.3**

- [ ] 10. Implement visual system conformance
  - [ ] 10.1 Apply visual-system color palette tokens
    - Use foundation tokens (ink, charcoal, nearBlack) for backgrounds
    - Use ritual tokens (wine, blood, garnet) for hover states
    - Use emphasis tokens (antiqueGold, brushedGold, agedGold) for prices, borders
    - Limit gold usage to <8% (transactional state allowance)
    - _Requirements: 2.1, 2.2, 2.5_
  
  - [ ] 10.2 Implement deep red hover states for all interactive elements
    - Apply deep red hover to proceed action (300ms transition)
    - Apply deep red hover to remove action (300ms transition)
    - Apply deep red hover to quantity controls (300ms transition)
    - Apply deep red hover to navigation links (300ms transition)
    - _Requirements: 2.3, 2.4, 4.2, 6.3_
  
  - [ ]* 10.3 Write property test for black color dominance via token enforcement
    - **Property 5: Black Color Dominance via Token Enforcement**
    - **Validates: Requirements 2.1**
  
  - [ ]* 10.4 Write property test for gold scarcity in cart state
    - **Property 6: Gold Scarcity in Cart State**
    - **Validates: Requirements 2.2**
  
  - [ ]* 10.5 Write property test for interactive elements use deep red on hover
    - **Property 7: Interactive Elements Use Deep Red on Hover**
    - **Validates: Requirements 2.3, 2.4, 4.2, 6.3**
  
  - [ ]* 10.6 Write property test for palette token enforcement
    - **Property 8: Palette Token Enforcement**
    - **Validates: Requirements 2.5**

- [ ] 11. Implement cart persistence and state management
  - [ ] 11.1 Implement cart ID persistence in localStorage
    - Store cart ID in localStorage on cart creation
    - Retrieve cart ID on page load
    - Handle cart expiry gracefully
    - _Requirements: 10.5_
  
  - [ ] 11.2 Implement optimistic UI updates with Shopify sync
    - Update UI immediately on modifications
    - Sync with Shopify in background
    - Handle sync errors gracefully with elegant error messages
    - _Requirements: 10.2_

- [ ] 12. Implement return navigation
  - [ ] 12.1 Create return to discovery navigation link
    - Display "Return to threshold" or "← Discovery" link
    - Position at top-left or top-center (subtle)
    - Apply muted gold color, deep red on hover
    - _Requirements: 7.2_
  
  - [ ] 12.2 Exclude aggressive "Continue shopping" language
    - No "Continue shopping" buttons
    - No urgency patterns in navigation
    - _Requirements: 6.5_

- [ ] 13. Implement responsive behavior across all viewports
  - [ ] 13.1 Test and validate mobile layout (≤768px)
    - Single-column layout (items stacked, summary below)
    - 1 item per row
    - Maintain 18px minimum spacing
    - Maximum 5 items per viewport
    - _Requirements: 11.1, 11.2_
  
  - [ ] 13.2 Test and validate tablet layout (769px-1024px)
    - Single-column or two-column layout
    - Maintain 18px minimum spacing
    - Maximum 6 items per viewport
    - _Requirements: 11.2_
  
  - [ ] 13.3 Test and validate desktop layout (≥1025px)
    - Two-column layout (items left, summary right)
    - Maintain 18px minimum spacing
    - Maximum 7 items per viewport
    - _Requirements: 11.3_
  
  - [ ]* 13.4 Write property test for responsive visual system conformance
    - **Property 20: Responsive Visual System Conformance**
    - **Validates: Requirements 11.4**

- [ ] 14. Final checkpoint - Comprehensive testing and validation
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP
- Each task references specific requirements for traceability
- Checkpoints ensure incremental validation
- Property tests validate universal correctness properties
- Unit tests validate specific examples and edge cases
- All visual-system conformance must be maintained (color hierarchy, spacing, density, interaction behaviors)
- Transactional state spacing rules apply: 18px between elements (reduced from 24px), 72px between sections (reduced from 96px)
- Gold usage may reach up to 8% in cart state (increased from 5% for transactional clarity)
