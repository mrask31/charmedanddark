# Implementation Plan: Inventory Expansion

## Overview

This plan implements a CSV ingestion and data generation system that reads 56 canonical products and 32 variant SKUs from CSV files, transforms them into TypeScript data modules, and ensures proper display on /shop and /uniform pages with functional variant selection. The implementation preserves existing Mirror discipline and product descriptions while expanding the inventory.

## Tasks

- [x] 1. Set up CSV parsing infrastructure
  - Install csv-parse library (or similar CSV parsing library)
  - Create types for CSV row structures (CanonicalProduct, ProductVariantRow)
  - Create CSV parser functions for reading both files
  - _Requirements: 1.1, 1.2_

- [ ]* 1.1 Write unit tests for CSV parser
  - Test parsing canonical_products_pass1.csv (verify 56 records)
  - Test parsing product_variants_pass1.csv (verify 32 records)
  - Test handling of semicolon-separated image URLs
  - Test empty optional fields
  - _Requirements: 1.1, 1.2_

- [x] 2. Implement CSV data validation
  - Create validation functions for required fields
  - Implement error reporting for missing/invalid fields
  - Add validation for realm, variant_model, and data types
  - _Requirements: 1.3, 1.5_

- [ ]* 2.1 Write unit tests for validation
  - Test missing required fields detection
  - Test invalid data type detection
  - Test error message formatting
  - _Requirements: 1.3, 1.5_

- [ ]* 2.2 Write property test for required field validation
  - **Property 1: Required field validation**
  - **Validates: Requirements 1.3, 1.5**

- [x] 3. Implement variant-to-product association
  - Create function to group variants by canon_sku
  - Implement orphaned variant detection
  - Add warning logging for orphaned variants
  - _Requirements: 1.4_

- [ ]* 3.1 Write property test for variant association
  - **Property 2: Variant-to-product association**
  - **Validates: Requirements 1.4**

- [ ] 4. Checkpoint - Ensure CSV ingestion works
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 5. Implement category mapping logic
  - Create category mapping function with standardized categories
  - Implement fallback inference from product name
  - Add logging for inferred category mappings
  - _Requirements: 2.4, 2.5_

- [ ]* 5.1 Write unit tests for category mapping
  - Test direct category mappings
  - Test fallback inference from product names
  - Test logging of inferred mappings
  - _Requirements: 2.4, 2.5_

- [ ]* 5.2 Write property test for category mapping
  - **Property 4: Category mapping completeness**
  - **Validates: Requirements 2.4, 2.5**

- [ ] 6. Implement Mirror discipline preservation
  - Load existing products.ts and apparel.ts files
  - Create lookup map of existing products by ID or slug
  - Preserve mirrorEligible and mirrorRole for existing products
  - Force mirrorEligible=false for all Uniform items
  - _Requirements: 2.6, 2.7_

- [ ]* 6.1 Write unit tests for Mirror preservation
  - Test preservation of existing Mirror properties
  - Test forcing mirrorEligible=false for Uniform items
  - Test new products default to mirrorEligible=false
  - _Requirements: 2.6, 2.7_

- [ ]* 6.2 Write property tests for Mirror discipline
  - **Property 5: Mirror discipline preservation**
  - **Property 6: Apparel mirror exclusion**
  - **Validates: Requirements 2.6, 2.7**

- [ ] 7. Implement description and status preservation
  - Preserve existing product descriptions without modification
  - Use description_raw as-is for new products
  - Preserve existing status values
  - Default status to "core" for new products
  - _Requirements: 2.8, 2.9_

- [ ]* 7.1 Write unit tests for preservation logic
  - Test description preservation for existing products
  - Test status preservation for existing products
  - Test default status assignment for new products
  - _Requirements: 2.8, 2.9_

- [ ]* 7.2 Write property tests for preservation
  - **Property 7: Description preservation**
  - **Property 8: Status default assignment**
  - **Validates: Requirements 2.8, 2.9**

- [x] 8. Implement Product Builder component
  - Create buildProduct function with all transformation logic
  - Implement pricing calculations (public and sanctuary)
  - Implement image URL parsing (semicolon-separated)
  - Implement stock status determination
  - _Requirements: 2.1, 2.2, 2.3_

- [ ]* 8.1 Write unit tests for Product Builder
  - Test product transformation with various inputs
  - Test pricing calculations
  - Test image URL parsing
  - Test stock status logic
  - _Requirements: 2.1, 2.2, 2.3_

- [ ]* 8.2 Write property test for realm-based separation
  - **Property 3: Realm-based file separation**
  - **Validates: Requirements 2.1, 2.2**

- [ ] 9. Checkpoint - Ensure product transformation works
  - Ensure all tests pass, ask the user if questions arise.

- [x] 10. Implement Variant Builder component
  - Create buildVariants function with ID generation logic
  - Implement safe ID normalization (lowercase, remove special chars)
  - Implement label generation (option1 / option2 format)
  - Implement variant pricing calculations
  - Implement availability determination (qty > 0)
  - Implement default variant selection (highest qty, lowest price, first)
  - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5, 3.6, 3.7_

- [ ]* 10.1 Write unit tests for Variant Builder
  - Test ID generation and normalization
  - Test label generation with various option combinations
  - Test pricing precedence (sale_price_usd vs price_usd)
  - Test sanctuary price calculation
  - Test availability logic
  - Test default variant selection logic
  - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5, 3.6, 3.7_

- [ ]* 10.2 Write property tests for variant generation
  - **Property 9: Variant ID stability**
  - **Property 10: Label generation format**
  - **Property 11: Price precedence**
  - **Property 12: Sanctuary pricing calculation**
  - **Property 13: Availability determination**
  - **Property 14: Variant image inclusion**
  - **Property 15: Default variant selection**
  - **Validates: Requirements 3.1, 3.2, 3.3, 3.4, 3.5, 3.6, 3.7**

- [x] 11. Implement Module Writer component
  - Create function to write products.ts (House items only)
  - Create function to write apparel.ts (Uniform items only)
  - Preserve existing type definitions and helper functions
  - Format TypeScript code with proper indentation
  - Write to existing module locations (do not create new files)
  - _Requirements: 2.1, 2.2, 2.3_

- [ ]* 11.1 Write unit tests for Module Writer
  - Test file generation for House products
  - Test file generation for Uniform products
  - Test preservation of type definitions
  - Test TypeScript formatting
  - _Requirements: 2.1, 2.2, 2.3_

- [ ] 12. Implement logging system
  - Create logging functions for counts and statistics
  - Log total canonical products, House count, Uniform count
  - Log products with variants and total variant count
  - Log inferred category mappings
  - _Requirements: 2.10_

- [x] 13. Create main ingestion script
  - Wire together all components (parser → validator → builder → writer)
  - Add error handling for file operations
  - Add command-line interface or npm script
  - Run the script to generate updated data files
  - _Requirements: 1.1, 1.2, 2.1, 2.2_

- [ ]* 13.1 Write integration test for full pipeline
  - Test CSV → TypeScript generation end-to-end
  - Verify generated files are valid TypeScript
  - Verify counts match expectations
  - _Requirements: 1.1, 1.2, 2.1, 2.2_

- [ ] 14. Checkpoint - Ensure data generation completes successfully
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 15. Verify /shop page displays all House products
  - Check that /shop filters by realm='house' and status != 'archive'
  - Verify all House products are visible
  - Verify variant indication appears without selectors
  - _Requirements: 4.1, 4.2, 4.3_

- [ ]* 15.1 Write unit tests for shop page filtering
  - Test realm and status filtering logic
  - Test product display completeness
  - Test variant indication without selectors
  - _Requirements: 4.1, 4.2, 4.3_

- [ ]* 15.2 Write property tests for display filtering
  - **Property 16: Shop page filtering**
  - **Property 18: Product display completeness**
  - **Property 19: Variant indication without exposure**
  - **Validates: Requirements 4.1, 4.2, 4.3**

- [ ] 16. Verify /uniform page displays all Uniform products
  - Check that /uniform filters by realm='uniform' and status != 'archive'
  - Verify all Uniform products are visible
  - Verify variant indication appears without selectors
  - _Requirements: 5.1, 5.2, 5.3_

- [ ]* 16.1 Write unit tests for uniform page filtering
  - Test realm and status filtering logic
  - Test product display completeness
  - Test variant indication without selectors
  - _Requirements: 5.1, 5.2, 5.3_

- [ ]* 16.2 Write property test for uniform page filtering
  - **Property 17: Uniform page filtering**
  - **Validates: Requirements 5.1, 5.2, 5.3**

- [ ] 17. Verify product detail page variant selection
  - Check that variant selector appears for products with 2+ variants
  - Check that variant selector does NOT appear for products with <2 variants
  - Test variant selection updates public price
  - Test variant selection updates sanctuary price
  - Test variant selection updates image (when variant has image)
  - Verify default variant is displayed on page load
  - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5, 6.6_

- [ ]* 17.1 Write unit tests for variant selection
  - Test conditional selector display
  - Test price updates on selection
  - Test image updates on selection
  - Test default variant display
  - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5, 6.6_

- [ ]* 17.2 Write property tests for variant selection
  - **Property 20: Variant selector conditional display**
  - **Property 21: Price update on variant selection**
  - **Property 22: Image update on variant selection**
  - **Property 23: Default variant initial display**
  - **Validates: Requirements 6.1, 6.2, 6.3, 6.4, 6.5, 6.6**

- [x] 18. Run build and test validation
  - Run npm test and verify all tests pass
  - Run npm run build and verify no TypeScript errors
  - Verify generated data structures match TypeScript types
  - _Requirements: 7.1, 7.2, 7.3_

- [ ]* 18.1 Write property test for type conformance
  - **Property 24: Generated data type conformance**
  - **Validates: Requirements 7.3**

- [ ] 19. Final checkpoint - Complete validation
  - Verify all 56 products parsed correctly
  - Verify all 32 variants parsed correctly
  - Verify House products display on /shop
  - Verify Uniform products display on /uniform
  - Verify Mirror discipline preserved
  - Verify variant selection works correctly
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional and can be skipped for faster implementation
- Property-based tests are optional for v1; prioritize correct data generation
- Focus on ensuring existing test suite passes
- Each task references specific requirements for traceability
- Checkpoints ensure incremental validation
- The ingestion script should be idempotent (can be run multiple times safely)
- Preserve existing module locations - do not create new files
