# Implementation Plan: Product Discovery Threshold

## Overview

This implementation plan transforms the `/shop` and `/uniform` routes into curated, gallery-like product browsing experiences with strict density controls (5-7 products per viewport, maximum 4 per row). The implementation integrates with the existing Accent Reveal System and follows the Visual System specifications. Tasks are organized to build incrementally, with early validation through property-based tests.

## Tasks

- [x] 1. Set up core data models and database schema
  - [x] 1.1 Add featured product support to database schema
    - Add `is_featured` boolean column to Supabase `products` table
    - Add `featured_until` timestamp column for expiration support
    - Add `featured_reason` text column for tracking feature context
    - Create database migration script
    - _Requirements: 3.2, 5.4_
  
  - [x] 1.2 Extend UnifiedProduct type with featured metadata
    - Update TypeScript interfaces in `lib/products.ts` to include featured fields
    - Create `FeaturedProductMetadata` interface as specified in design
    - Update product transformation functions to handle featured data
    - _Requirements: 3.2, 5.4_
  
  - [x] 1.3 Update product query to include featured status
    - Modify Supabase query to select featured fields
    - Add date validation for `featured_until` in WHERE clause
    - Implement ordering by featured status (featured first)
    - _Requirements: 5.1, 5.3, 5.4_

- [x] 2. Implement spacing configuration and Visual System compliance
  - [x] 2.1 Create SpacingConfig interface and constants
    - Define `SpacingConfig` TypeScript interface
    - Create `DISCOVERY_SPACING` constant with values from design (gridGap: 2rem, cardPadding: 1rem, containerPadding: 3rem, minWhitespace: 1.5rem)
    - Export from shared constants file
    - _Requirements: 1.5, 4.1, 6.3_
  
  - [ ]* 2.2 Write property test for Visual System spacing compliance
    - **Property 4: Visual System Spacing Compliance**
    - **Validates: Requirements 4.1, 6.4**
    - Generate random viewport sizes
    - Render grid and measure computed spacing values
    - Verify all spacing matches DISCOVERY_SPACING spec within ±1px tolerance
    - Tag: `Feature: product-discovery-threshold, Property 4`
    - Minimum 100 iterations using fast-check

- [x] 3. Implement DensityController utility
  - [x] 3.1 Create DensityCalculation interface and calculateDensity function
    - Define `DensityCalculation` TypeScript interface
    - Implement `calculateDensity` function with algorithm from design
    - Calculate viewport capacity based on card height and spacing
    - Clamp result to 5-7 range
    - Handle edge cases for very small viewports (minimum 3 products)
    - _Requirements: 1.4, 2.2, 2.3, 6.2_
  
  - [ ]* 3.2 Write property test for viewport density range
    - **Property 2: Viewport Density Range**
    - **Validates: Requirements 1.4, 2.2, 2.3, 6.2**
    - Generate random viewport dimensions
    - Generate product arrays with at least 7 items
    - Verify displayed count is between 5-7 (or 3-7 for very small viewports)
    - Tag: `Feature: product-discovery-threshold, Property 2`
    - Minimum 100 iterations using fast-check
  
  - [ ]* 3.3 Write unit tests for DensityController edge cases
    - Test viewport too small for 5 products (should show minimum 3)
    - Test viewport with exact capacity for 5, 6, 7 products
    - Test very large viewport (should cap at 7)
    - Test with insufficient inventory (fewer than 7 products available)
    - _Requirements: 2.2, 2.3_

- [ ] 4. Checkpoint - Verify core utilities and data models
  - Ensure all tests pass, ask the user if questions arise.

- [x] 5. Implement AccentRevealCard component
  - [x] 5.1 Create AccentRevealCard component with hover states
    - Define `AccentRevealCardProps` TypeScript interface
    - Implement component with default, hover, and featured states
    - Apply border transitions: 1px #e8e8e3 default, 2px #8B0000 hover (standard), 2px #4B0082 hover (featured)
    - Implement 200ms ease transition for border changes
    - Add image swap logic (hero.jpg → hover.jpg on hover if available)
    - _Requirements: 3.1, 3.2, 3.3, 7.1_
  
  - [x] 5.2 Implement touch device support for accent reveal
    - Add touch event handlers (onTouchStart, onTouchEnd)
    - Ensure touch events trigger same accent reveal as hover
    - Handle touch-specific edge cases (touch and hold, swipe)
    - _Requirements: 6.5_
  
  - [ ]* 5.3 Write property test for accent reveal color mapping
    - **Property 3: Accent Reveal Color Mapping**
    - **Validates: Requirements 3.1, 3.2**
    - Generate random products with varying featured status
    - Simulate hover events
    - Verify accent color is #8B0000 for standard, #4B0082 for featured
    - Tag: `Feature: product-discovery-threshold, Property 3`
    - Minimum 100 iterations using fast-check
  
  - [ ]* 5.4 Write property test for touch device accent reveal
    - **Property 7: Touch Device Accent Reveal**
    - **Validates: Requirements 6.5**
    - Generate random products
    - Simulate touch events on touch-enabled device mock
    - Verify accent reveal behavior matches hover behavior
    - Tag: `Feature: product-discovery-threshold, Property 7`
    - Minimum 100 iterations using fast-check
  
  - [x] 5.3 Implement image error handling and fallback placeholder
    - Add onError handler to Image component
    - Create ImagePlaceholder component with product title and "No Image" indicator
    - Maintain card layout and spacing on image failure (no layout shift)
    - Log errors to console for debugging
    - _Requirements: 7.4_
  
  - [ ]* 5.6 Write property test for primary image display
    - **Property 8: Primary Image Display**
    - **Validates: Requirements 7.1, 7.4**
    - Generate random products (mix of valid and broken image URLs)
    - Render cards
    - Verify every product shows either image or placeholder
    - Tag: `Feature: product-discovery-threshold, Property 8`
    - Minimum 100 iterations using fast-check
  
  - [x] 5.7 Implement consistent image aspect ratio (4:5)
    - Configure Next.js Image component with 4:5 aspect ratio
    - Use object-fit: cover for consistent display
    - Apply aspect ratio to both product images and placeholders
    - _Requirements: 7.3_
  
  - [ ]* 5.8 Write property test for image aspect ratio consistency
    - **Property 9: Image Aspect Ratio Consistency**
    - **Validates: Requirements 7.3**
    - Generate random product sets
    - Render cards and measure image dimensions
    - Verify all images have 4:5 aspect ratio (±2% tolerance for rounding)
    - Tag: `Feature: product-discovery-threshold, Property 9`
    - Minimum 100 iterations using fast-check
  
  - [x] 5.9 Add minimal product metadata display
    - Display product title
    - Display pricing (House vs Standard based on auth state)
    - Keep text minimal and secondary to imagery
    - _Requirements: 7.2, 7.5_

- [x] 6. Implement ProductDiscoveryGrid component
  - [x] 6.1 Create ProductDiscoveryGrid component with responsive grid layout
    - Define `ProductDiscoveryGridProps` and `GridState` TypeScript interfaces
    - Implement CSS Grid layout with responsive columns (4 → 3 → 2 → 1)
    - Use CSS Grid auto-fill and minmax for automatic responsiveness
    - Apply DISCOVERY_SPACING configuration
    - Integrate with AccentRevealProvider from existing system
    - _Requirements: 1.1, 1.2, 1.3, 1.6, 6.1, 6.4_
  
  - [x] 6.2 Implement viewport measurement and density calculation
    - Add useEffect hook to measure viewport height on mount and resize
    - Call calculateDensity utility to determine product count
    - Update GridState with calculated values
    - Debounce resize calculations for performance
    - _Requirements: 1.4, 2.1, 2.2, 2.3_
  
  - [x] 6.3 Implement product slicing based on density calculation
    - Slice products array to display only calculated count (5-7 items)
    - Handle case where inventory has fewer than calculated count
    - Maintain product order from Inventory_System (featured first)
    - _Requirements: 2.2, 2.3, 5.3_
  
  - [ ]* 6.4 Write property test for maximum row density constraint
    - **Property 1: Maximum Row Density Constraint**
    - **Validates: Requirements 1.3, 2.1**
    - Generate random viewport widths (320px - 2560px)
    - Generate random product arrays (10-50 items)
    - Render grid and analyze row structure
    - Verify no row exceeds 4 items
    - Tag: `Feature: product-discovery-threshold, Property 1`
    - Minimum 100 iterations using fast-check
  
  - [ ]* 6.5 Write property test for responsive column reduction
    - **Property 6: Responsive Column Reduction**
    - **Validates: Requirements 6.1**
    - Generate sequence of decreasing viewport widths
    - Render grid at each width
    - Verify column count never increases, never exceeds 4
    - Tag: `Feature: product-discovery-threshold, Property 6`
    - Minimum 100 iterations using fast-check
  
  - [x] 6.6 Implement authentication integration for pricing display
    - Subscribe to Supabase onAuthStateChange events
    - Update isRecognized state when auth changes
    - Pass auth state to AccentRevealCard components
    - Handle session expiration gracefully (no page reload)
    - _Requirements: 5.3_
  
  - [x] 6.7 Implement error state for empty or unavailable products
    - Detect empty products array
    - Display error message: "Products unavailable. Please try again later."
    - Provide retry mechanism or refresh link
    - Maintain layout structure in error state
    - _Requirements: 5.2_
  
  - [ ]* 6.8 Write unit tests for ProductDiscoveryGrid
    - Test empty product array displays error state
    - Test authentication state changes update pricing
    - Test viewport resize maintains scroll position
    - Test responsive breakpoints (mobile: 1 column, tablet: 2-3 columns, desktop: 4 columns)
    - _Requirements: 5.2, 6.1, 6.4_

- [ ] 7. Checkpoint - Verify component integration
  - Ensure all tests pass, ask the user if questions arise.

- [x] 8. Update route pages to use ProductDiscoveryGrid
  - [x] 8.1 Update /shop route page
    - Modify `app/shop/page.tsx` to use ProductDiscoveryGrid component
    - Fetch products using enhanced query with featured status
    - Pass products and route prop ('shop') to ProductDiscoveryGrid
    - Handle server-side errors gracefully (return empty array)
    - _Requirements: 1.1, 5.1_
  
  - [x] 8.2 Update /uniform route page
    - Modify `app/uniform/page.tsx` to use ProductDiscoveryGrid component
    - Fetch products using enhanced query with featured status
    - Pass products and route prop ('uniform') to ProductDiscoveryGrid
    - Handle server-side errors gracefully (return empty array)
    - _Requirements: 1.2, 5.1_
  
  - [ ]* 8.3 Write integration tests for route pages
    - Test /shop route renders ProductDiscoveryGrid
    - Test /uniform route renders ProductDiscoveryGrid
    - Test routes receive correct product data from server component
    - Test server-side error handling returns empty array
    - _Requirements: 1.1, 1.2, 5.1, 5.2_

- [x] 9. Implement Visual System compliance checks
  - [x] 9.1 Verify absence of prohibited UI elements
    - Ensure no infinite scroll implementation exists
    - Ensure no pagination controls are rendered
    - Ensure no countdown timers appear
    - Ensure no scarcity messaging appears
    - Ensure no cross-sell recommendations appear
    - Ensure no aggressive upsell prompts appear
    - _Requirements: 2.4, 2.5, 4.3, 4.4, 4.5, 4.6_
  
  - [ ]* 9.2 Write unit tests for absence of prohibited features
    - Test no infinite scroll implementation exists in codebase
    - Test no pagination controls rendered in ProductDiscoveryGrid
    - Test no countdown timers rendered
    - Test no scarcity messaging rendered
    - Test no cross-sell recommendations rendered
    - _Requirements: 2.4, 2.5, 4.3, 4.4, 4.5, 4.6_
  
  - [x] 9.3 Verify image-dominant layout and minimal UI
    - Ensure product images are largest visual element
    - Ensure text content is minimal and secondary
    - Verify generous whitespace maintained
    - Check Visual_System compliance across all viewport sizes
    - _Requirements: 1.6, 4.2, 4.7, 6.3_

- [ ] 10. Implement inventory data accuracy validation
  - [ ]* 10.1 Write property test for inventory data accuracy
    - **Property 5: Inventory Data Accuracy**
    - **Validates: Requirements 5.3, 5.4**
    - Generate random product data
    - Render grid with that data
    - Verify displayed title, price, and featured status match source exactly
    - Tag: `Feature: product-discovery-threshold, Property 5`
    - Minimum 100 iterations using fast-check
  
  - [ ]* 10.2 Write integration tests for Inventory System
    - Test product fetching with real Supabase connection (test database)
    - Test featured product filtering with date constraints
    - Test query ordering (featured first, then by title)
    - Test error handling when database is unavailable
    - _Requirements: 5.1, 5.2, 5.3, 5.4_

- [ ] 11. Implement accessibility features
  - [ ] 11.1 Add keyboard navigation support
    - Ensure all product cards are keyboard accessible
    - Verify focus indicators are visible and meet contrast requirements
    - Test Enter key activates product links
    - Verify focus order is logical (left-to-right, top-to-bottom)
    - _Requirements: 3.3, 6.5_
  
  - [ ] 11.2 Add screen reader support
    - Ensure product titles are properly announced
    - Add descriptive alt text for all images
    - Ensure pricing information is announced correctly
    - Ensure error states are announced
    - _Requirements: 7.1, 7.2_
  
  - [ ] 11.3 Implement reduced motion support
    - Respect prefers-reduced-motion media query
    - Disable hover animations when motion is reduced
    - Maintain functionality without animations
    - _Requirements: 3.3_
  
  - [ ]* 11.4 Write accessibility tests
    - Test keyboard navigation through all product cards
    - Test focus indicators visibility
    - Test screen reader announcements (using testing-library)
    - Test reduced motion behavior
    - _Requirements: 3.3, 6.5, 7.1, 7.2_

- [ ] 12. Performance optimization and monitoring
  - [ ] 12.1 Implement image optimization
    - Configure Next.js Image component for automatic optimization
    - Implement lazy loading for off-screen images
    - Add progressive image loading
    - Optimize image formats (WebP with fallbacks)
    - _Requirements: 7.1_
  
  - [ ] 12.2 Optimize bundle size and rendering performance
    - Tree-shake unused code
    - Minimize JavaScript bundle size
    - Ensure no layout shift during image loading
    - Verify smooth transitions during viewport resize
    - _Requirements: 3.3, 6.1_
  
  - [ ]* 12.3 Write performance tests
    - Measure initial render time with 7 products
    - Test no layout shift during image loading
    - Test smooth transitions during viewport resize
    - Ensure no memory leaks on repeated renders
    - _Requirements: 3.3, 7.1_

- [ ] 13. Final checkpoint and validation
  - Ensure all tests pass, ask the user if questions arise.
  - Verify all requirements are met
  - Verify all correctness properties are validated
  - Confirm Visual System compliance
  - Validate accessibility standards

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP
- Each task references specific requirements for traceability
- Property tests use fast-check library with minimum 100 iterations
- All property tests include feature and property number tags
- Checkpoints ensure incremental validation throughout implementation
- Implementation uses TypeScript as specified in design document
- Integration with existing Accent Reveal System and Inventory System
- No infinite scroll, pagination, or prohibited UI elements per requirements
