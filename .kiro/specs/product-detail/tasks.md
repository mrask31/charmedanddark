# Implementation Plan: Product Detail

## Overview

This implementation plan converts the product-detail design into discrete coding tasks for a Next.js/TypeScript frontend with Shopify integration. The approach prioritizes intimate single-object focus, visual-system conformance, and the 4 critical guardrails (color hierarchy, spacing/density, singular CTA, forbidden patterns).

The implementation builds naturally from product-discovery patterns, maintaining continuity in color palette, spacing scale, interaction behaviors, and Shopify integration.

## Tasks

- [ ] 1. Set up product detail route and core data models
  - Create Next.js dynamic route at `app/threshold/[productId]/page.tsx`
  - Define TypeScript interfaces for Product, ProductVariant, ProductImage, ProductMetadata models
  - Set up Shopify integration for single product fetching (GraphQL query)
  - Implement product data transformation from Shopify to internal Product model
  - Handle featured product detection from Shopify metafields
  - _Requirements: 9.1, 7.3_

- [ ]* 1.1 Write unit tests for product data transformation
  - Test Shopify response transformation to Product model
  - Test featured product detection logic
  - Test variant data parsing
  - _Requirements: 9.1_

- [ ] 2. Implement product detail view layout and visual-system conformance
  - [ ] 2.1 Create DetailView component with responsive layout calculation
    - Implement breakpoint detection (mobile, tablet, desktop)
    - Calculate image-dominant layout (image left on desktop, top on mobile)
    - Implement density validation (5-7 elements per viewport)
    - Implement spacing validation (min 24px between elements, 96px between sections)
    - _Requirements: 1.2, 1.3, 11.1, 11.2, 11.4_
  
  - [ ]* 2.2 Write unit tests for critical guardrails
    - **Guardrail 1: Color Palette Hierarchy** - Test black dominance (60-80%), gold scarcity (<5%)
    - **Guardrail 2: Spacing and Density** - Test minimum spacing (24px, 96px), maximum density (5-7 per viewport)
    - **Guardrail 3: Singular CTA** - Test exactly one primary CTA exists
    - **Guardrail 4: Forbidden Patterns** - Test no popups, discount badges, countdown timers, scarcity messaging, shipping urgency, fulfillment messaging
    - _Requirements: 1.1, 1.2, 1.3, 1.4, 2.1, 2.2, 8.1, 8.2, 8.3, 8.4, 13.2, 13.3, 13.4_
  
  - [ ]* 2.3 Write property-based tests for critical properties
    - **Property 4: Black Dominance** - For any product and viewport, black occupies 60-80% of visual space
    - **Property 7: Deep Red Hover States** - For any interactive element, hover state uses deep red
    - Run 50 iterations per property (reduced scope for initial implementation)
    - _Requirements: 2.1, 2.4_

- [ ] 3. Implement image gallery with elegant presentation
  - [ ] 3.1 Create ImageGallery component
    - Display primary image as dominant visual element (largest element in view)
    - Implement multiple image support with subtle navigation (dots or minimal strip, no thumbnail carousel)
    - Implement image transitions (fade effect, 300ms, ease-in-out)
    - Preload next/previous images for smooth transitions
    - Maintain minimum 24px spacing around images
    - _Requirements: 3.1, 3.2, 3.3, 3.4_
  
  - [ ] 3.2 Implement image navigation controls
    - Create subtle arrow controls or dot indicators
    - Apply deep red hover states (300ms transition)
    - Support keyboard navigation (arrow keys)
    - Support touch gestures on mobile (swipe)
    - _Requirements: 3.2, 3.3_
  
  - [ ]* 3.3 Write unit tests for image gallery
    - Test image dominance (image is largest element)
    - Test no aggressive image viewers (no zoom overlays, no 360 viewers)
    - Test transition timing (150-500ms range)
    - _Requirements: 3.1, 3.2, 3.5_

- [ ] 4. Checkpoint - Ensure critical guardrails pass
  - Run unit tests for 4 critical guardrails
  - Run property-based tests (50 iterations)
  - Verify visual-system conformance
  - Ask the user if questions arise

- [ ] 5. Implement product narrative presentation
  - [ ] 5.1 Create ProductNarrative component
    - Display product title using H1 or H2 typography (40px or 32px)
    - Display product description in paragraph form (not bullet points)
    - Display product price with muted gold color emphasis
    - Display metadata (materials, dimensions, care) with 24px spacing between items
    - Implement featured product label ("Featured", "Beloved", "Sanctuary") with deep purple color
    - _Requirements: 4.1, 4.2, 4.3, 4.4, 6.1, 6.2_
  
  - [ ]* 5.2 Write unit tests for narrative presentation
    - Test title typography conformance (H1 or H2)
    - Test description format (paragraph, no bullet points)
    - Test price color (muted gold)
    - Test forbidden phrase detection (no "Buy now", "Limited time", "Best seller")
    - Test featured product label terminology
    - _Requirements: 4.1, 4.2, 4.3, 4.5, 6.2_

- [ ] 6. Implement variant selection with elegant controls
  - [ ] 6.1 Create VariantSelector component
    - Display variant options as elegant button groups (not dropdowns)
    - Implement variant option groups (Size, Shade, Material) with ritualized labels
    - Apply deep red hover states (150-500ms transitions)
    - Display unavailable variants with reduced opacity (0.4) and elegant "Unavailable" label
    - Update product image, price, and availability when variant selected (subtle 300ms fade)
    - _Requirements: 9.2, 10.1, 10.2, 10.3, 10.4, 10.5_
  
  - [ ]* 6.2 Write unit tests for variant selection
    - Test no conventional dropdowns (no select elements)
    - Test variant option hover colors (deep red)
    - Test unavailable variant display (no aggressive indicators)
    - Test variant selection updates (image, price, availability)
    - _Requirements: 9.2, 10.2, 10.4, 10.5_

- [ ] 7. Implement claiming action with Shopify cart integration
  - [ ] 7.1 Create ClaimingAction component
    - Display single primary CTA with ritualized language ("Claim", "Acquire", "Make Yours")
    - Implement hover state (deep red, 300ms transition, subtle 1.02x scale)
    - Implement active state (blood red, 0.98x scale, 150ms transition)
    - Implement claiming in progress state (disabled, subtle loading indicator)
    - Implement success state (text changes to "Claimed" or "Yours", 2-3 second display)
    - Implement error state (elegant error message, no technical details)
    - _Requirements: 5.1, 5.2, 5.3, 5.4, 12.1_
  
  - [ ] 7.2 Integrate with Shopify cart API
    - Implement addToCart mutation using Shopify Storefront API
    - Handle variant selection validation (ensure variant selected if required)
    - Handle product unavailability gracefully
    - Return cart response with success/error feedback
    - _Requirements: 9.5_
  
  - [ ]* 7.3 Write unit tests for claiming action
    - Test exactly one primary CTA exists
    - Test button text uses ritualized language (no "Add to cart", "Buy now")
    - Test hover state color (deep red)
    - Test no aggressive success messages or popups
    - _Requirements: 5.1, 5.2, 5.3, 5.4_
  
  - [ ]* 7.4 Write integration test for cart integration
    - Test claiming action successfully adds product to Shopify cart
    - Test variant selection is included in cart line item
    - _Requirements: 9.5_

- [ ] 8. Implement post-claiming experience and navigation
  - [ ] 8.1 Create PostClaimingNavigation component
    - Display subtle post-claiming links ("Proceed" for cart, "View collection" for discovery)
    - Use subtle link styling (not prominent buttons)
    - Apply deep red hover states
    - Do NOT auto-navigate after claiming
    - Do NOT show aggressive "View cart" popups
    - _Requirements: 12.2, 12.3_
  
  - [ ] 8.2 Create ReturnNavigation component
    - Display elegant back button or breadcrumb ("Return to threshold" or "← Discovery")
    - Apply deep red hover state
    - Preserve discovery state (active portal, page number, scroll position)
    - _Requirements: 7.1, 7.2, 7.4_
  
  - [ ]* 8.3 Write unit tests for navigation
    - Test no "Continue shopping" aggressive prompts
    - Test no auto-navigation after claiming
    - Test post-claiming options are subtle (no urgency)
    - _Requirements: 7.1, 7.3, 12.2, 12.3_

- [ ] 9. Implement error handling and graceful degradation
  - [ ] 9.1 Handle Shopify integration errors
    - Product fetch failures: Display elegant error message, redirect to discovery
    - Missing product data: Validate completeness, redirect if incomplete
    - Image loading failures: Display elegant placeholder, maintain layout
    - Variant data errors: Hide variant selector, use default variant
    - _Requirements: 9.1_
  
  - [ ] 9.2 Handle claiming action errors
    - Cart integration failures: Display elegant error message below claiming action
    - Variant not selected: Highlight variant selector with subtle animation
    - Product unavailable: Update claiming action to disabled state with "Currently unavailable"
    - _Requirements: 9.4, 12.4_
  
  - [ ]* 9.3 Write unit tests for error handling
    - Test elegant error messaging (no technical details)
    - Test graceful inventory status handling (no aggressive "Out of stock")
    - Test no aggressive retry prompts
    - _Requirements: 9.4, 12.4_

- [ ] 10. Implement visual-system validation and exclusion detection
  - [ ] 10.1 Create runtime validator for critical guardrails
    - Validate color hierarchy (black dominance, gold scarcity)
    - Validate spacing and density (minimums and maximums)
    - Validate singular CTA (exactly one primary action)
    - Validate forbidden patterns (popups, discount badges, countdown timers, scarcity messaging, shipping urgency, fulfillment messaging, default delivery info)
    - Log violations to console (non-blocking in development)
    - _Requirements: 1.1, 1.2, 1.3, 1.4, 2.1, 2.2, 8.1, 8.2, 8.3, 8.4, 8.6, 13.1, 13.2, 13.3, 13.4_
  
  - [ ]* 10.2 Write unit tests for validator
    - Test validator detects color hierarchy violations
    - Test validator detects spacing violations
    - Test validator detects forbidden patterns
    - _Requirements: 2.1, 2.2, 8.1, 8.2, 8.3, 8.4_

- [ ] 11. Implement responsive behavior and accessibility
  - [ ] 11.1 Implement responsive layout adjustments
    - Mobile: Stacked layout (image top, content below), 1 column, 5 elements per viewport
    - Tablet: Stacked or side-by-side layout, image 60%, 6 elements per viewport
    - Desktop: Side-by-side layout (image left, content right), image 50-60%, 7 elements per viewport
    - Maintain all spacing and density requirements across breakpoints
    - _Requirements: 11.1, 11.2, 11.4_
  
  - [ ] 11.2 Implement keyboard navigation and screen reader support
    - Image gallery navigable with arrow keys
    - Variant selector navigable with tab and arrow keys
    - Claiming action accessible via keyboard
    - Return navigation accessible via keyboard
    - Proper ARIA labels for interactive elements
    - Image alt text for all product images
    - _Requirements: Accessibility best practices_
  
  - [ ]* 11.3 Write unit tests for responsive behavior
    - Test layout adapts correctly for mobile, tablet, desktop
    - Test spacing and density maintained across breakpoints
    - Test visual-system conformance maintained across viewports
    - _Requirements: 11.1, 11.2, 11.4_

- [ ] 12. Final checkpoint and integration verification
  - Run all unit tests (critical guardrails, component tests, error handling)
  - Run property-based tests (50 iterations for 2 critical properties)
  - Verify no forbidden patterns detected
  - Test full flow: Discovery → Product Detail → Variant Selection → Claiming → Cart
  - Test navigation: Product Detail → Return to Discovery (state preserved)
  - Visual review: Confirm gothic-romantic aesthetic, intimate atmosphere
  - Ensure all tests pass, ask the user if questions arise

## Notes

- Tasks marked with `*` are optional test tasks and can be skipped for faster MVP
- Each task references specific requirements for traceability
- Testing focuses on 4 critical guardrails for initial implementation
- Comprehensive property-based testing (39 properties, 100 iterations) deferred until after cart + checkout specs
- Build-time validation and dev tooling deferred until after cart + checkout specs
- Real Shopify integration tests deferred (using mock data for initial implementation)
- Visual regression testing deferred until after cart + checkout specs
