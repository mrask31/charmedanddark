# Implementation Plan: Product Detail Focus

## Overview

This implementation plan transforms the Product Detail Focus design into actionable coding tasks. The feature creates an intimate, image-dominant single-product viewing experience at `/product/[handle]` with dynamic narrative generation, darkroom state handling, and strict visual system compliance (Absolute Geometry, Dual Pricing Law, Accent Reveal System).

Implementation will proceed incrementally: core routing and data fetching first, then visual components, then API integration, and finally polish and testing.

## Tasks

- [-] 1. Set up product detail page routing and data fetching
  - [x] 1.1 Create Next.js dynamic route at `app/product/[handle]/page.tsx`
    - Implement server component that extracts handle from URL params
    - Fetch product data from Supabase using handle
    - Transform raw data to UnifiedProduct format
    - Return 404 for invalid handles using Next.js `notFound()`
    - _Requirements: 1.1, 1.2, 1.3, 9.1_
  
  - [ ] 1.2 Create product data fetching utility
    - Implement `getProductByHandle(handle: string)` function
    - Query Supabase products table with handle filter
    - Transform Supabase response to UnifiedProduct interface
    - Handle database errors gracefully
    - _Requirements: 9.1, 9.2, 9.3, 9.4_
  
  - [ ]* 1.3 Write property test for valid handle routing
    - **Property 1: Valid Handle Routing**
    - **Validates: Requirements 1.1, 1.3**
    - Generate random valid handles and verify correct product data renders
    - _Requirements: 1.1, 1.3_

- [x] 2. Implement core page structure and client component
  - [x] 2.1 Create ProductDetailClient component
    - Implement client component with product prop
    - Set up state management for narrative, auth, and image loading
    - Create component hierarchy: ImageGallery, ProductInfo, SingularCTA
    - Apply Absolute Geometry (0px border radius) to all containers
    - _Requirements: 2.2, 2.4, 4.4, 8.4_
  
  - [x] 2.2 Implement SEO metadata generation
    - Generate OpenGraph tags from product data
    - Create Twitter Card metadata
    - Generate JSON-LD structured data for product schema
    - Include product images, pricing, and availability
    - _Requirements: 1.1_
  
  - [ ]* 2.3 Write property test for Absolute Geometry enforcement
    - **Property 3: Absolute Geometry Enforcement**
    - **Validates: Requirements 2.2, 4.4**
    - Verify all UI elements have 0px border radius across random products
    - _Requirements: 2.2, 4.4, 8.4_

- [ ] 3. Build image-dominant layout and gallery component
  - [ ] 3.1 Create ImageGallery component
    - Implement image display with hero image prioritization
    - Apply aspect ratio preservation during loading
    - Implement smooth opacity transition on image load
    - Ensure 0px border radius on all image containers
    - _Requirements: 2.1, 2.2, 2.3, 10.1, 10.2, 10.3_
  
  - [ ] 3.2 Implement responsive image dominance
    - Create CSS layout that allocates majority viewport space to images
    - Implement mobile vertical stacking (image first)
    - Implement desktop side-by-side layout with image dominance
    - Minimize UI chrome and decorative elements
    - _Requirements: 2.1, 2.3, 8.1, 8.2, 8.3_
  
  - [ ]* 3.3 Write property test for image dominance
    - **Property 2: Image Dominance Across Viewports**
    - **Validates: Requirements 2.1, 2.3, 8.1, 8.3**
    - Verify image container occupies more space than other content across viewport sizes
    - _Requirements: 2.1, 2.3, 8.1, 8.3_
  
  - [ ]* 3.4 Write unit tests for image loading states
    - Test placeholder display during loading
    - Test smooth transition on load complete
    - Test fallback image on load failure
    - Test aspect ratio preservation
    - _Requirements: 10.1, 10.2, 10.3, 10.4_

- [ ] 4. Implement darkroom state handling
  - [ ] 4.1 Create DarkroomOverlay component
    - Implement grayscale filter for placeholder images
    - Display "PROCESSING // DARKROOM" overlay text
    - Apply conditional rendering based on darkroom_status
    - Style overlay with appropriate typography and positioning
    - _Requirements: 5.1, 5.2_
  
  - [ ] 4.2 Integrate darkroom state detection
    - Extract darkroom_status from UnifiedProduct metadata
    - Implement `isDarkroomProcessing()` utility function
    - Handle missing or invalid darkroom_status gracefully
    - Pass darkroom state to ImageGallery component
    - _Requirements: 5.4_
  
  - [ ]* 4.3 Write property test for darkroom visual treatment
    - **Property 9: Darkroom Visual Treatment**
    - **Validates: Requirements 5.1, 5.2, 5.4**
    - Verify grayscale placeholder and overlay text for processing products
    - _Requirements: 5.1, 5.2, 5.4_
  
  - [ ]* 4.4 Write unit test for darkroom state transition
    - Test transition from processing to complete status
    - Verify image display changes from placeholder to final image
    - _Requirements: 5.3_

- [ ] 5. Integrate Narrative Engine API
  - [ ] 5.1 Create narrative fetching utility
    - Implement `fetchNarrative(product: UnifiedProduct)` function
    - Build request payload with item_name, item_type, primary_symbol, emotional_core
    - Make POST request to `/api/generate-narrative`
    - Handle API errors gracefully and return null on failure
    - _Requirements: 3.1, 3.4_
  
  - [ ] 5.2 Create NarrativeDisplay component
    - Implement loading state with skeleton placeholder
    - Display short_description and long_ritual_description on success
    - Display fallback description from product.description on error
    - Apply appropriate typography and spacing
    - _Requirements: 3.2, 3.3_
  
  - [ ] 5.3 Integrate narrative loading in ProductDetailClient
    - Trigger narrative fetch in useEffect on component mount
    - Update narrative state on successful response
    - Handle loading and error states
    - Pass narrative data to NarrativeDisplay component
    - _Requirements: 3.1, 3.2, 3.3_
  
  - [ ]* 5.4 Write property test for Narrative Engine integration
    - **Property 4: Narrative Engine Integration**
    - **Validates: Requirements 3.1, 3.4**
    - Verify POST request sent to /api/generate-narrative with product handle
    - _Requirements: 3.1, 3.4_
  
  - [ ]* 5.5 Write property test for narrative display on success
    - **Property 5: Narrative Display on Success**
    - **Validates: Requirements 3.2**
    - Verify short_description and long_ritual_description render on success
    - _Requirements: 3.2_
  
  - [ ]* 5.6 Write unit test for narrative generation failure
    - Test fallback description display when API fails
    - Verify page continues to function without narrative
    - _Requirements: 3.3_

- [ ] 6. Implement pricing display with Dual Pricing Law
  - [ ] 6.1 Create PricingDisplay component
    - Calculate house pricing (10% off, rounded)
    - Format prices with currency symbol
    - Implement conditional rendering based on auth state
    - Show house pricing only when authenticated
    - Show both standard and house pricing when unauthenticated
    - _Requirements: 6.1, 6.2, 6.3, 6.4, 9.3_
  
  - [x] 6.2 Integrate authentication state checking
    - Check Supabase auth session server-side
    - Pass initial auth state to ProductDetailClient
    - Set up client-side auth state listener
    - Update pricing display on auth state changes
    - _Requirements: 6.1, 6.2, 6.3_
  
  - [ ]* 6.3 Write property test for conditional pricing display
    - **Property 11: Conditional Pricing Display**
    - **Validates: Requirements 6.1, 6.2**
    - Verify correct pricing shown for authenticated and unauthenticated states
    - _Requirements: 6.1, 6.2, 6.3_
  
  - [ ]* 6.4 Write unit tests for pricing calculations
    - Test house pricing calculation (10% off, rounded)
    - Test price formatting with currency symbols
    - Test edge cases (very low prices, very high prices)
    - _Requirements: 6.4, 9.3_

- [ ] 7. Create singular CTA with Accent Reveal styling
  - [ ] 7.1 Create SingularCTA component
    - Implement button with ritualized language ("Claim", "Acquire", "Add to House")
    - Apply Accent Reveal System colors (gold #d4af37, red #8b0000)
    - Apply 0px border radius (Absolute Geometry)
    - Implement disabled state when out of stock
    - Add onClick handler for cart addition
    - _Requirements: 4.1, 4.2, 4.3, 4.4_
  
  - [ ]* 7.2 Write property test for singular CTA presence
    - **Property 6: Singular CTA Presence**
    - **Validates: Requirements 4.1**
    - Verify exactly one primary CTA button exists in DOM
    - _Requirements: 4.1_
  
  - [ ]* 7.3 Write property test for Accent Reveal CTA styling
    - **Property 7: Accent Reveal CTA Styling**
    - **Validates: Requirements 4.2**
    - Verify CTA has gold or red color values in computed styles
    - _Requirements: 4.2_
  
  - [ ]* 7.4 Write property test for ritualized CTA language
    - **Property 8: Ritualized CTA Language**
    - **Validates: Requirements 4.3**
    - Verify CTA text matches approved ritualized phrases
    - _Requirements: 4.3_
  
  - [ ]* 7.5 Write unit tests for CTA states
    - Test enabled state when in stock
    - Test disabled state when out of stock
    - Test onClick handler invocation
    - _Requirements: 4.1_

- [ ] 8. Enforce distraction-free experience
  - [ ] 8.1 Audit and remove distraction elements
    - Verify no related products sections in component tree
    - Verify no cross-sell recommendations
    - Verify no countdown timers
    - Verify no urgency messaging patterns
    - Verify no promotional banners or modal pop-ups
    - _Requirements: 7.1, 7.2, 7.3, 7.4, 7.5_
  
  - [ ]* 8.2 Write property test for distraction-free experience
    - **Property 12: Distraction-Free Experience**
    - **Validates: Requirements 7.1, 7.2, 7.3, 7.4, 7.5**
    - Verify zero instances of forbidden distraction elements
    - _Requirements: 7.1, 7.2, 7.3, 7.4, 7.5_

- [ ] 9. Implement responsive layout and mobile optimization
  - [ ] 9.1 Create responsive CSS layout
    - Implement mobile vertical stacking (image first, info second)
    - Implement desktop side-by-side layout with image dominance
    - Use CSS Grid or Flexbox for flexible layout
    - Apply breakpoints at 768px for mobile/desktop transition
    - _Requirements: 8.1, 8.2, 8.3_
  
  - [ ]* 9.2 Write property test for mobile vertical stacking
    - **Property 13: Mobile Vertical Stacking**
    - **Validates: Requirements 8.2**
    - Verify vertical stacking with image first on mobile viewports
    - _Requirements: 8.2_
  
  - [ ]* 9.3 Write unit tests for responsive behavior
    - Test layout at various viewport widths
    - Test breakpoint transitions
    - Test touch interactions on mobile
    - _Requirements: 8.1, 8.2, 8.3_

- [ ] 10. Implement error handling and fallback states
  - [ ] 10.1 Create error boundary component
    - Implement React error boundary for ProductDetailClient
    - Display user-friendly error message on unexpected errors
    - Provide "Try again" and "Return to products" actions
    - Log errors for monitoring
    - _Requirements: 1.2, 3.3_
  
  - [ ] 10.2 Create 404 not-found page
    - Create `app/product/[handle]/not-found.tsx`
    - Display "Product Not Found" message
    - Provide link back to product grid
    - Apply consistent visual styling
    - _Requirements: 1.2_
  
  - [ ]* 10.3 Write unit tests for error scenarios
    - Test invalid handle displays 404
    - Test narrative failure shows fallback
    - Test image failure shows placeholder
    - Test auth error defaults to unauthenticated pricing
    - _Requirements: 1.2, 3.3, 10.4_

- [ ] 11. Add accessibility and SEO enhancements
  - [ ] 11.1 Implement image alt text
    - Use narrative alt_text when available
    - Fall back to product title for alt text
    - Ensure all images have descriptive alt attributes
    - _Requirements: 2.1, 10.1_
  
  - [ ] 11.2 Add ARIA labels and semantic HTML
    - Use semantic HTML5 elements (article, section, button)
    - Add ARIA labels to interactive elements
    - Ensure keyboard navigation works for all interactions
    - Test with screen reader
    - _Requirements: 4.1, 6.4_
  
  - [ ]* 11.3 Write unit tests for accessibility
    - Test all images have alt text
    - Test keyboard navigation
    - Test ARIA labels presence
    - Run axe-core accessibility checks
    - _Requirements: 2.1, 4.1, 6.4_

- [ ] 12. Final integration and polish
  - [ ] 12.1 Wire all components together in ProductDetailClient
    - Integrate ImageGallery with darkroom state
    - Integrate NarrativeDisplay with API data
    - Integrate PricingDisplay with auth state
    - Integrate SingularCTA with cart functionality
    - Ensure smooth data flow between components
    - _Requirements: 1.1, 2.1, 3.1, 4.1, 5.1, 6.1_
  
  - [ ]* 12.2 Write property test for UnifiedProduct data integration
    - **Property 14: UnifiedProduct Data Integration**
    - **Validates: Requirements 9.1, 9.2, 9.3**
    - Verify all displayed data sourced from UnifiedProduct model
    - _Requirements: 9.1, 9.2, 9.3, 9.4_
  
  - [ ]* 12.3 Write property test for image loading placeholder aspect ratio
    - **Property 15: Image Loading Placeholder Aspect Ratio**
    - **Validates: Requirements 10.1, 10.3**
    - Verify placeholder maintains same aspect ratio as final image
    - _Requirements: 10.1, 10.3_
  
  - [ ]* 12.4 Write property test for image load transition
    - **Property 16: Image Load Transition**
    - **Validates: Requirements 10.2**
    - Verify CSS transition applied on image load complete
    - _Requirements: 10.2_

- [ ] 13. Checkpoint - Ensure all tests pass
  - Run all unit tests and verify passing
  - Run all property tests and verify passing
  - Check test coverage meets goals (>80% line, >75% branch)
  - Ask the user if questions arise

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP
- Each task references specific requirements for traceability
- Property tests validate universal correctness properties from the design document
- Unit tests validate specific examples, edge cases, and error conditions
- Implementation uses TypeScript and Next.js App Router
- All visual elements must comply with Absolute Geometry (0px border radius)
- Pricing must enforce Dual Pricing Law (conditional display based on auth state)
- CTA must use Accent Reveal System colors (gold #d4af37, red #8b0000)
- Page must be completely distraction-free (no related products, timers, urgency messaging)
