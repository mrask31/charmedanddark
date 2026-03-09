# Implementation Plan: Phase 2 Revenue Mechanics

## Overview

This implementation plan covers the complete e-commerce transaction pipeline for Charmed & Dark, integrating AI-powered product lore generation, client-side cart management with localStorage persistence, Shopify checkout with automatic HOUSE10 discount application, and secure webhook-based order verification.

The implementation builds on existing systems (AI Narrative Engine, Slide-Out Cart, Shopify Checkout API, and Webhook Handler) and focuses on:
1. Database schema updates for variant ID caching
2. Security improvements to webhook HMAC verification
3. Integration of cart functionality into product pages
4. Environment configuration and deployment readiness

## Tasks

- [x] 1. Database schema updates
  - [x] 1.1 Add shopify_variant_id column to products table
    - Add TEXT column to products table
    - Create index on shopify_variant_id for fast lookups
    - _Requirements: 9.1_
  
  - [x] 1.2 Verify schema migration
    - Query products table to confirm column exists
    - Test index performance with sample queries
    - _Requirements: 9.1_

- [x] 2. Update webhook handler security
  - [x] 2.1 Replace HMAC comparison with crypto.timingSafeEqual
    - Modify app/api/webhooks/shopify/orders/route.js
    - Convert hash and hmacHeader to Buffer before comparison
    - Use crypto.timingSafeEqual(Buffer.from(hash), Buffer.from(hmacHeader))
    - _Requirements: 6.12, 6.13_
  
  - [ ]* 2.2 Write unit tests for HMAC verification
    - Test valid signature acceptance
    - Test invalid signature rejection (401 response)
    - Test missing header handling
    - Test malformed header handling
    - _Requirements: 6.1, 6.2_

- [x] 3. Update sync pipeline for variant ID storage
  - [x] 3.1 Enhance transformShopifyProduct to extract variant ID
    - Modify the transform function to extract shopifyProduct.variants.edges[0]?.node?.id
    - Store variant ID in shopify_variant_id field during product upsert
    - _Requirements: 9.2, 9.3_
  
  - [x] 3.2 Update lib/products.js transformProduct function
    - Ensure shopifyVariantId is included in returned product object
    - Verify field is passed through from database row
    - _Requirements: 9.4_
  
  - [ ]* 3.3 Write unit tests for variant ID extraction
    - Test extraction from valid Shopify product data
    - Test handling of missing variant data (null/undefined)
    - Test transformProduct includes shopifyVariantId field
    - _Requirements: 9.2, 9.4_

- [x] 4. Update checkout API for variant ID usage
  - [x] 4.1 Modify checkout API to use shopifyVariantId directly
    - Update /app/api/checkout/route.js to check for shopifyVariantId in cart items
    - If present, use directly in Shopify cart creation mutation
    - If missing, fall back to existing lookup by product handle
    - _Requirements: 9.5, 9.6, 4.3_
  
  - [ ]* 4.2 Write unit tests for variant ID fallback logic
    - Test direct usage when shopifyVariantId is provided
    - Test fallback lookup when shopifyVariantId is missing
    - Test error handling when both methods fail
    - _Requirements: 9.5, 9.6, 4.18_

- [x] 5. Integrate AddToCartButton into ProductDetailContent
  - [x] 5.1 Import AddToCartButton and CartContext into ProductDetailContent
    - Add imports for AddToCartButton component and useCart hook
    - _Requirements: 3.1_
  
  - [x] 5.2 Replace placeholder buttons with AddToCartButton
    - Replace "Join the Sanctuary" button with AddToCartButton
    - Pass product data including slug, name, price, imageUrls[0], and shopifyVariantId
    - Ensure brutalist styling (0px border radius, gold hover)
    - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5, 3.6_
  
  - [ ]* 5.3 Add "Save for Later" functionality (optional)
    - Keep as placeholder button or implement wishlist feature
    - _Requirements: None (out of scope)_

- [x] 6. Environment variable configuration
  - [x] 6.1 Document all required environment variables
    - Create or update .env.example with all required variables
    - Include ANTHROPIC_API_KEY, SHOPIFY_WEBHOOK_SECRET, NEXT_PUBLIC_SHOPIFY_CHECKOUT_DOMAIN, SHOPIFY_STORE_DOMAIN, SHOPIFY_STOREFRONT_ACCESS_TOKEN, SUPABASE_SERVICE_ROLE_KEY
    - _Requirements: 10.1, 10.2, 10.3, 10.4, 10.5, 10.6_
  
  - [x] 6.2 Verify environment variables in .env.local
    - Check that all development environment variables are set
    - Test each API route to ensure variables are accessible
    - _Requirements: 10.8_
  
  - [x] 6.3 Add environment variable validation
    - Add startup checks for critical environment variables
    - Log clear error messages when variables are missing
    - _Requirements: 10.7_

- [x] 7. Checkpoint - Verify core functionality
  - Run build process to check for errors
  - Test cart operations (add, remove, update quantity)
  - Test checkout flow with mock Shopify responses
  - Ensure all tests pass, ask the user if questions arise

- [ ]* 8. Property-based testing implementation
  - [ ]* 8.1 Install fast-check testing library
    - Add fast-check as dev dependency
    - Configure test runner for property tests
    - _Requirements: Testing Strategy_
  
  - [ ]* 8.2 Write property test for cart pricing calculations
    - **Property 16: Pricing Calculations**
    - **Validates: Requirements 2.11, 2.12**
    - Test that subtotal equals sum of (price × quantity) for all items
    - Test that sanctuarySubtotal equals subtotal × 0.9
    - Use 100+ iterations with random cart states
  
  - [ ]* 8.3 Write property test for cart operations
    - **Property 8: Add to Cart Operation**
    - **Validates: Requirements 2.1, 3.2**
    - Test that adding product creates cart item with quantity 1
    - Test that adding existing product increments quantity
  
  - [ ]* 8.4 Write property test for lore generation constraints
    - **Property 2: Lore Word Count Constraint**
    - **Property 3: No Exclamation Marks in Lore**
    - **Property 4: Forbidden Words Exclusion**
    - **Validates: Requirements 1.3, 1.4, 1.5**
    - Test word count is between 80-150 words
    - Test no exclamation marks present
    - Test forbidden words are excluded
  
  - [ ]* 8.5 Write property test for HMAC verification
    - **Property 20: HMAC Signature Verification**
    - **Validates: Requirements 6.1, 6.12**
    - Test HMAC computation with random payloads
    - Test timingSafeEqual usage prevents timing attacks
  
  - [ ]* 8.6 Write property test for order data preservation
    - **Property 27: End-to-End Data Preservation**
    - **Validates: Requirements 8.4**
    - Test product data preserved through cart → checkout → webhook pipeline
    - Use random product data and verify consistency

- [x] 9. Shopify admin configuration
  - [x] 9.1 Create HOUSE10 discount code in Shopify
    - Navigate to Shopify Admin → Discounts
    - Create discount code "HOUSE10" with 10% off entire order
    - Set no usage limits, no expiration date
    - Apply to all products
    - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5, 5.6_
  
  - [x] 9.2 Configure order creation webhook
    - Navigate to Shopify Admin → Settings → Notifications → Webhooks
    - Create webhook for "Order creation" event
    - Set URL to https://charmedanddark.com/api/webhooks/shopify/orders
    - Enable HMAC signature verification
    - Set format to JSON
    - _Requirements: 7.1, 7.2, 7.3, 7.4, 7.5_
  
  - [x] 9.3 Test webhook delivery
    - Create test order in Shopify
    - Verify webhook received and order stored in database
    - Check HMAC verification passes
    - _Requirements: 6.1, 6.7, 6.8_

- [-] 10. Build verification and deployment
  - [x] 10.1 Run production build
    - Execute npm run build
    - Verify no build errors or warnings
    - Check all API routes compile correctly
    - _Requirements: 11.1, 11.2, 11.3, 11.4_
  
  - [x] 10.2 Configure Vercel environment variables
    - Add all production environment variables to Vercel project
    - Verify SHOPIFY_WEBHOOK_SECRET matches Shopify webhook configuration
    - Test environment variable access in deployed functions
    - _Requirements: 10.9_
  
  - [-] 10.3 Deploy to production
    - Deploy to Vercel
    - Verify all routes are accessible
    - Test cart, checkout, and webhook endpoints
    - _Requirements: 11.5, 11.6_
  
  - [ ] 10.4 End-to-end production test
    - Add product to cart on production site
    - Proceed to Shopify checkout
    - Complete test purchase
    - Verify webhook received and order stored
    - Confirm HOUSE10 discount applied correctly
    - _Requirements: 8.1, 8.2, 8.3, 8.4, 8.5, 8.6_

- [ ] 11. Final checkpoint - Production verification
  - Verify all systems operational in production
  - Confirm cart persistence works across page reloads
  - Test complete purchase flow with real Shopify checkout
  - Ensure all tests pass, ask the user if questions arise

## Notes

- Tasks marked with `*` are optional testing tasks and can be skipped for faster MVP deployment
- Each task references specific requirements for traceability
- Checkpoints ensure incremental validation at key milestones
- Property tests validate universal correctness properties across randomized inputs
- Unit tests validate specific examples and edge cases
- Systems 1-4 are already implemented; this plan focuses on integration, security improvements, and deployment
- The webhook handler code exists but needs the timingSafeEqual security fix before production use
- Database schema changes should be applied before running the sync pipeline
