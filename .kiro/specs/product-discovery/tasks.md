# Implementation Plan: Product Discovery

## Overview

This implementation plan breaks down the product-discovery feature into discrete, incremental coding tasks. Each task builds on previous work, with checkpoints to ensure quality and visual-system conformance. The focus is on creating a curated revelation experience that honors the gothic-romantic aesthetic while maintaining strict adherence to visual-system properties.

**Implementation Approach:**
- Start with core data models and Shopify integration
- Build presentation layer (Product Card, Product Grid)
- Implement interaction behaviors (hover states, navigation)
- Add collection portals for curated revelation
- Integrate visual-system validation for critical guardrails
- Wire everything together in the Discovery View

## Tasks

- [ ] 1. Set up project structure and visual-system foundation
  - Create directory structure: `app/threshold/` for discovery view
  - Create `lib/` directory for Shopify integration and validators
  - Create `components/` directory for Product Card, Grid, Portals, Navigation
  - Set up Tailwind config with visual-system color palette (foundation, ritual, sanctuary, emphasis)
  - Set up visual-system spacing scale in Tailwind config
  - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5_

- [ ] 2. Implement core data models and TypeScript interfaces
  - [ ] 2.1 Create Product data model
    - Define Product interface with id, title, price, images, metadata, isFeatured, featuredReason
    - Define ProductImage interface with url, alt, dimensions, isPrimary
    - Define ProductMetadata interface with collection, tags, availableForSale
    - Define FeaturedReason type ('limited-drop', 'seasonal-ritual', 'narrative-importance', 'curated-emphasis')
    - _Requirements: 6.4, 7.1_

  - [ ] 2.2 Create view state models
    - Define DiscoveryViewState interface with products, currentPage, activePortal, layout, viewport
    - Define LayoutConfig interface with productsPerRow, productsPerViewport, spacing
    - Define Viewport interface with width, height, breakpoint
    - Define Portal interface with id, label, collection, description
    - _Requirements: 1.1, 1.2, 5.1_

  - [ ] 2.3 Create visual style configuration models
    - Define ColorPalette interface with foundation, ritual, sanctuary, emphasis color families
    - Define TypographyConfig interface for product titles, prices, featured labels
    - Define InteractionConfig interface with transitions and transforms
    - _Requirements: 2.1, 2.2, 2.3, 3.1, 3.2, 3.3, 3.4_

- [ ] 3. Implement Shopify integration layer
  - [ ] 3.1 Create Shopify API client
    - Set up Shopify Storefront API GraphQL client
    - Configure environment variables (SHOPIFY_STORE_DOMAIN, SHOPIFY_STOREFRONT_ACCESS_TOKEN)
    - Implement fetchProducts function with pagination support
    - Implement fetchProductsByCollection function for portal filtering
    - _Requirements: 7.1_

  - [ ] 3.2 Implement product data transformation
    - Transform Shopify GraphQL response to internal Product model
    - Extract featured flag from Shopify metafields (namespace: 'custom', key: 'featured')
    - Extract featuredReason from Shopify metafields (namespace: 'custom', key: 'featured_reason')
    - Validate product data completeness (title, price, images, metadata)
    - _Requirements: 7.1, 7.3_

  - [ ]* 3.3 Write unit tests for Shopify integration
    - Test product data transformation with mocked Shopify responses
    - Test featured product detection from metafields
    - Test error handling for missing product data
    - _Requirements: 7.1, 7.3_

- [ ] 4. Checkpoint - Ensure data layer is complete
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 5. Implement Product Card component
  - [ ] 5.1 Create base ProductCard component
    - Implement ProductCard React component with product prop
    - Render product image (primary image from images array)
    - Render product title using H3 typography (24px)
    - Render product price using Body Large typography (20px) with muted gold color
    - Apply minimum 24px spacing between title, price, and image elements
    - _Requirements: 4.1, 4.2, 4.3, 4.4_

  - [ ] 5.2 Implement ProductCard interaction states
    - Add hover state with deep red color transition (wine: #4A0E0E)
    - Add hover scale transform (1.02x, max 1.05x)
    - Configure transition timing (300ms, ease-in-out)
    - Add active state with deep red color and scale reduction (0.98x)
    - Add onClick handler to navigate to product detail view
    - _Requirements: 3.1, 3.2, 3.3, 3.4_

  - [ ] 5.3 Implement FeaturedProductCard variant
    - Extend ProductCard with featured visual treatment
    - Apply deep purple accent color (plum: #2D1B3D) for borders and labels
    - Add featured label ("Featured" or "Beloved") with deep purple color
    - Ensure featured cards maintain all spacing and density requirements
    - _Requirements: 6.1, 6.2, 6.3, 6.5_

  - [ ]* 5.4 Write unit tests for Product Card
    - Test required metadata presence (title, price, image)
    - Test typography conformance (H3 for title, Body Large for price)
    - Test price color is muted gold
    - Test spacing between metadata elements (min 24px)
    - Test featured product uses deep purple
    - Test featured label uses approved terminology
    - _Requirements: 4.1, 4.2, 4.3, 4.4, 6.1, 6.3_

  - [ ]* 5.5 Write property test for hover state colors
    - **Property 8: Interactive Elements Use Deep Red on Hover**
    - Generate random products, render cards, simulate hover, verify deep red color
    - **Validates: Requirements 2.4, 3.1**

  - [ ]* 5.6 Write property test for singular CTA
    - **Property 32: Singular Call-to-Action Per Card**
    - Generate random products, render cards, count primary CTAs, verify exactly one
    - **Validates: Requirements 11.1, 11.2, 11.3**

- [ ] 6. Implement Product Grid layout system
  - [ ] 6.1 Create ProductGrid component
    - Implement ProductGrid React component with products and viewport props
    - Calculate responsive products per row (mobile: 1-2, tablet: 2-3, desktop: 3-4)
    - Apply minimum 24px spacing between product cards
    - Apply minimum 96px spacing between product sections
    - Ensure maximum 5-7 products per viewport height
    - _Requirements: 1.1, 1.2, 1.3, 9.1, 9.2, 9.3_

  - [ ] 6.2 Implement responsive layout calculation
    - Detect viewport breakpoint (mobile ≤768px, tablet 769-1024px, desktop ≥1025px)
    - Calculate optimal products per row based on breakpoint
    - Calculate card dimensions maintaining aspect ratio and spacing
    - Validate density limits (max 4 per row, 5-7 per viewport)
    - _Requirements: 9.1, 9.2, 9.3, 9.4_

  - [ ]* 6.3 Write unit tests for Product Grid
    - Test responsive products per row (1-2 mobile, 2-3 tablet, 3-4 desktop)
    - Test minimum spacing requirements (24px between cards, 96px between sections)
    - Test density limits (5-7 per viewport)
    - _Requirements: 1.1, 1.2, 1.3, 9.1, 9.2, 9.3_

  - [ ]* 6.4 Write property test for maximum density
    - **Property 2: Maximum Products Per Row**
    - Generate random product sets and viewports, render grid, verify max 4 per row
    - **Validates: Requirements 1.2**

- [ ] 7. Implement Navigation Controls
  - [ ] 7.1 Create NavigationControls component
    - Implement NavigationControls with currentPage, totalPages props
    - Render Previous/Next buttons (not numbered pagination)
    - Render page indicator ("Page X of Y" in elegant typography)
    - Apply deep red hover states to navigation buttons
    - Apply minimum 24px spacing between navigation elements
    - _Requirements: 10.1, 10.2_

  - [ ] 7.2 Implement page transition logic
    - Add nextPage and previousPage handlers
    - Implement elegant page transition (fade in/out, 300ms)
    - Ensure no urgent loading indicators (no fast spinners, no countdown progress bars)
    - Disable Previous button on first page, Next button on last page
    - _Requirements: 10.3_

  - [ ]* 7.3 Write unit tests for Navigation Controls
    - Test navigation uses elegant controls (not numbered pagination)
    - Test hover states use deep red
    - Test transitions avoid urgency patterns
    - _Requirements: 10.1, 10.2, 10.3_

- [ ] 8. Implement Collection Portals
  - [ ] 8.1 Create CollectionPortals component
    - Implement CollectionPortals with availablePortals and activePortal props
    - Render 3-7 curated portal buttons with ritualized labels
    - Examples: "Ritual Wear", "Sanctuary Objects", "Seasonal Offerings", "Dark Elegance", "Mystical Adornment"
    - Apply deep red hover states to portal buttons
    - Apply deep purple active state to selected portal
    - Ensure single portal selection only (no multi-select)
    - _Requirements: 5.1, 5.2_

  - [ ] 8.2 Implement portal selection logic
    - Add enterPortal handler to filter products by collection
    - Add exitPortal handler to return to all products
    - Ensure portal application maintains density and spacing requirements
    - Ensure no sidebar-style layout (use horizontal or vertical button layout)
    - _Requirements: 5.3, 5.5_

  - [ ] 8.3 Validate portal language and styling
    - Ensure portal labels use ritualized language (no "Filter", "Category", "Sort by")
    - Ensure portal controls use smaller typography (Body Small or Caption)
    - Ensure portal controls remain secondary to product revelation
    - Position portals away from primary product content (typically header)
    - _Requirements: 5.4, 11.4_

  - [ ]* 8.4 Write unit tests for Collection Portals
    - Test portals use ritualized labels (not "Filter", "Category", "Sort by")
    - Test single portal selection (no multi-select)
    - Test no sidebar-style layout
    - Test portal hover states use deep red
    - Test active portal uses deep purple
    - _Requirements: 5.1, 5.2, 5.4, 5.5_

- [ ] 9. Checkpoint - Ensure all components are complete
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 10. Implement critical guardrail validators
  - [ ] 10.1 Create color hierarchy validator
    - Implement calculateColorDistribution function to analyze rendered view
    - Validate black dominance (60-80% of visual space)
    - Validate gold scarcity (<5% of visual space)
    - Return validation result with violations
    - _Requirements: 2.1, 2.2_

  - [ ] 10.2 Create density validator
    - Implement getMaxProductsPerRow function to analyze grid layout
    - Implement getProductsPerViewport function to count products in viewport
    - Validate max 4 products per row
    - Validate 5-7 products per viewport height
    - Return validation result with violations
    - _Requirements: 1.1, 1.2_

  - [ ] 10.3 Create forbidden pattern detector
    - Implement detectPopups function to scan for popup elements
    - Implement detectDiscountBanners function to scan for banner elements
    - Implement detectCountdownTimers function to scan for timer elements
    - Implement detectScarcityMessaging function to scan for "Only X left" patterns
    - Implement detectFilterLanguage function to scan for "Filter", "Category", "Sort by"
    - Return list of detected forbidden patterns
    - _Requirements: 8.1, 8.2, 8.3, 8.4, 5.4_

  - [ ] 10.4 Create singular CTA validator
    - Implement getPrimaryCTAs function to identify primary CTAs in product card
    - Validate exactly one primary CTA per card
    - Validate no competing CTAs (wishlist, quick view, compare, share)
    - Return validation result with violations
    - _Requirements: 11.1, 11.2, 11.3_

  - [ ]* 10.5 Write unit tests for validators
    - Test color hierarchy validator with mock views
    - Test density validator with mock grids
    - Test forbidden pattern detector with mock views
    - Test singular CTA validator with mock cards
    - _Requirements: 2.1, 2.2, 1.1, 1.2, 8.1-8.4, 11.1-11.3_

- [ ] 11. Implement Discovery View (main page)
  - [ ] 11.1 Create Discovery View page component
    - Create `app/threshold/page.tsx` as Next.js Server Component
    - Fetch initial products from Shopify (use Server Component data fetching)
    - Fetch featured products from Shopify metafields
    - Pass products to client components (ProductGrid, NavigationControls, CollectionPortals)
    - _Requirements: 7.1, 7.3_

  - [ ] 11.2 Implement view state management
    - Create client component for interactive state (current page, active portal)
    - Implement pagination logic (products per page based on viewport)
    - Implement portal filtering logic (filter products by collection)
    - Ensure state changes maintain curated revelation aesthetic
    - _Requirements: 5.3, 10.3_

  - [ ] 11.3 Apply visual-system styling
    - Ensure black dominance (60-80% of visual space) in overall layout
    - Ensure gold scarcity (<5% of visual space) in overall layout
    - Apply generous whitespace and intentional placement
    - Ensure discovery state maintains maximum atmosphere (no spacing reduction)
    - _Requirements: 1.5, 2.1, 2.2, 9.4_

  - [ ] 11.4 Implement error handling
    - Handle Shopify API failures with elegant error message
    - Handle missing product data by excluding incomplete products
    - Handle image loading failures with elegant placeholders
    - Ensure all error states maintain gothic aesthetic (no urgency)
    - _Requirements: 7.1_

- [ ] 12. Integrate validation and run critical guardrail tests
  - [ ] 12.1 Add runtime validation in development
    - Call color hierarchy validator on Discovery View render
    - Call density validator on ProductGrid render
    - Call forbidden pattern detector on Discovery View render
    - Call singular CTA validator on ProductCard render
    - Log warnings to console (non-blocking in development)
    - _Requirements: 2.1, 2.2, 1.1, 1.2, 8.1-8.4, 11.1-11.3_

  - [ ]* 12.2 Write critical guardrail unit tests
    - Test discovery view maintains black dominance (60-80%)
    - Test product grid respects maximum density (max 4 per row, 5-7 per viewport)
    - Test product card has exactly one primary CTA
    - Test discovery view contains no forbidden patterns
    - _Requirements: 2.1, 2.2, 1.1, 1.2, 8.1-8.4, 11.1-11.3_

  - [ ]* 12.3 Run property-based tests for critical properties
    - Run Property 2 test (Maximum Products Per Row) with 50 iterations
    - Run Property 8 test (Interactive Elements Use Deep Red on Hover) with 50 iterations
    - Verify all tests pass
    - _Requirements: 1.2, 2.4, 3.1_

- [ ] 13. Final checkpoint and visual review
  - Ensure all critical guardrail tests pass
  - Ensure no forbidden patterns detected
  - Visual review: confirm gothic-romantic aesthetic
  - Visual review: confirm curated revelation (not browsing)
  - Visual review: confirm generous whitespace and intentional placement
  - Ask the user if questions arise or if ready for deployment.

## Notes

- Tasks marked with `*` are optional testing tasks that can be skipped for faster MVP
- Each task references specific requirements for traceability
- Checkpoints ensure incremental validation and quality
- Focus is on critical guardrails: color hierarchy, density, singular CTA, forbidden patterns
- Comprehensive testing (full 34 properties) deferred until after core commerce specs
- All code should honor visual-system properties and maintain gothic-romantic aesthetic
- Collection portals use ritualized language, not conventional filter terminology
- No infinite scroll, no dense grids, no pressure patterns allowed
