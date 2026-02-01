# Implementation Plan: Checkout (Shopify-Hosted)

## Overview

This implementation plan focuses on integrating Shopify's hosted checkout into Charmed & Dark. We do NOT implement custom checkout forms. Instead, we:
1. Redirect visitors from Cart to Shopify's checkout URL
2. Customize Shopify's checkout (where permitted) to align with visual-system principles
3. Handle post-checkout order confirmation in our application

**Implementation Scope:**
- Cart → Shopify checkout redirect
- Shopify checkout customization (branding, colors, language, settings)
- Order confirmation webhook handling
- Order confirmation page (visual-system aesthetic)

**Out of Scope:**
- Custom checkout forms (Shopify handles all UI)
- Address/payment field components (Shopify handles)
- Form validation logic (Shopify handles)
- Payment processing (Shopify handles)
- Order creation (Shopify handles)

## Tasks

- [ ] 1. Set up Shopify checkout redirect infrastructure
  - [ ] 1.1 Implement checkout redirect using cart.checkoutUrl
    - Read cart.checkoutUrl field directly from Storefront API cart object
    - No checkoutCreate mutation needed
    - Use window.location.href for redirect
    - Implement subtle transition (no aggressive loading indicators)
    - _Requirements: 1.1, 1.2_

  - [ ] 1.2 Implement redirect error handling
    - Display elegant error message if checkoutUrl missing or invalid
    - Use calm language: "Unable to proceed at this moment. Please try again shortly."
    - Preserve cart state on error
    - Log errors for debugging without exposing technical details
    - _Requirements: 1.3_

  - [ ]* 1.3 Write unit tests for checkout redirect
    - Test successful redirect using cart.checkoutUrl
    - Test redirect error handling (missing checkoutUrl)
    - Test error message display
    - _Requirements: 1.1, 1.3_

- [ ] 2. Configure Shopify checkout customization
  - [ ] 2.1 Configure Shopify checkout branding
    - Navigate to Shopify Admin → Settings → Checkout
    - Upload logo
    - Set primary color to muted gold (#8B7355) if Shopify permits
    - Set background color to near-black (#1A1A1A) if Shopify permits
    - Set typography to gothic font if Shopify permits
    - _Requirements: 2.1, 2.2_

  - [ ] 2.2 Configure Shopify checkout language
    - Attempt to change button text to "Complete" instead of "Place order" (if customizable)
    - Configure field labels with calm language (if customizable)
    - _Requirements: 2.3_

  - [ ] 2.3 Configure Shopify checkout feature toggles
    - Disable upsells if Shopify permits
    - Disable countdown timers if Shopify permits
    - Disable aggressive marketing opt-ins if Shopify permits
    - _Requirements: 2.4_

  - [ ] 2.4 Document Shopify checkout customization constraints
    - Document what was successfully customized
    - Document what could not be customized (Shopify limitations)
    - Document accepted Shopify defaults
    - _Requirements: 2.5_

- [ ] 3. Configure Shopify shipping methods
  - [ ] 3.1 Create shipping methods with calm names
    - Navigate to Shopify Admin → Settings → Shipping
    - Create "Standard" shipping method (avoid "Fast shipping")
    - Create "Express" shipping method (avoid "Rush delivery")
    - Use calm descriptions (no urgency language)
    - _Requirements: 3.5_

  - [ ] 3.2 Configure shipping method settings to minimize urgency
    - Disable delivery timeframes if Shopify permits
    - Disable "Get it by [date]" messaging if Shopify permits
    - Disable shipping urgency language if Shopify permits
    - _Requirements: 3.1, 3.2, 3.3_

  - [ ] 3.3 Document shipping configuration constraints
    - Document what shipping settings were configured
    - Document what could not be customized
    - _Requirements: 3.4_

- [ ] 4. Checkpoint - Test Shopify checkout redirect and customization
  - Test cart → Shopify checkout redirect flow
  - Verify Shopify checkout branding applied
  - Verify shipping methods use calm names
  - Document customization constraints
  - Ask the user if questions arise

- [ ] 5. Implement order confirmation webhook handler
  - [ ] 5.1 Create webhook endpoint for Shopify order creation
    - Create API route: POST /api/webhooks/order-created
    - **CRITICAL**: Disable framework body parsing to access raw request body
    - Parse Shopify order webhook payload AFTER verification
    - _Requirements: 4.1_

  - [ ] 5.2 Implement webhook verification with raw body (CRITICAL)
    - **MUST use raw request body bytes before any JSON parsing**
    - Read raw body as Buffer from request.arrayBuffer()
    - Compute HMAC-SHA256 on raw Buffer (not parsed JSON)
    - Compare with X-Shopify-Hmac-SHA256 header using crypto.timingSafeEqual
    - Reject webhook if signature verification fails
    - **This is the #1 webhook implementation footgun - raw body is critical**
    - _Requirements: 10.1_

  - [ ] 5.3 Transform Shopify order data to internal Order model
    - Extract order ID, order number, line items, shipping address, totals
    - Transform Shopify line items to internal OrderLineItem model
    - Store order data in database
    - _Requirements: 4.1, 11.1_

  - [ ] 5.4 Implement webhook idempotency with unique constraint
    - Create orders table with UNIQUE constraint on shopify_order_id column (separate from PK)
    - Use upsert (insert or ignore on conflict) pattern
    - On unique constraint violation, return 200 OK and treat as duplicate
    - **Return 200 OK for verified duplicates to prevent Shopify retries**
    - Log duplicate webhook attempts for monitoring
    - _Requirements: 10.2_

  - [ ] 5.5 Implement webhook error handling
    - Handle webhook parsing errors gracefully
    - Log webhook failures for debugging
    - Return 200 OK only after successful processing
    - Return 500 error if processing fails (Shopify will retry)
    - _Requirements: 10.5_

  - [ ]* 5.6 Write unit tests for webhook handler
    - Test webhook verification with raw body (valid and invalid signatures)
    - Test order data transformation
    - Test idempotency (duplicate webhook handling)
    - Test error handling
    - _Requirements: 10.1, 10.2, 10.5_

- [ ] 6. Implement signed token confirmation system
  - [ ] 6.1 Implement signed token generation
    - Create generateConfirmationToken(orderId, secret) function
    - Token payload: { order_id, issued_at, expires_at }
    - Use HMAC-SHA256 for signature
    - Token format: {base64url_payload}.{base64url_signature}
    - Expiry: 1 hour from issuance
    - _Requirements: 8.1_

  - [ ] 6.2 Implement signed token verification
    - Create verifyConfirmationToken(token, secret) function
    - Verify HMAC signature matches
    - Check token has not expired
    - Return null for invalid or expired tokens
    - _Requirements: 8.3_

  - [ ] 6.3 Configure Shopify thank-you page redirect
    - Navigate to Shopify Admin → Settings → Checkout → Order status page
    - Add redirect script to pass order_id to our server
    - Create server endpoint to generate signed token and redirect
    - _Requirements: 8.2_

  - [ ]* 6.4 Write unit tests for signed token system
    - Test token generation
    - Test token verification (valid, invalid, expired)
    - Test signature tampering detection
    - _Requirements: 8.1, 8.3_
- [ ] 7. Implement order confirmation page with calm fallback
  - [ ] 7.1 Create OrderConfirmationPage component with token verification
    - Create route: /threshold/confirmation?t={signed_token}
    - Verify token signature and expiry
    - Return calm error if token invalid/expired
    - _Requirements: 8.3, 9.1_

  - [ ] 7.2 Implement order data retrieval with fallback
    - Try database first (webhook-stored order data)
    - If not found, fall back to Shopify Admin API
    - If API fails, display calm retry message
    - _Requirements: 9.1, 9.2, 11.1, 11.2_

  - [ ] 7.3 Implement calm retry component (no aggressive polling)
    - Display message: "We're preparing your confirmation. This can take a moment."
    - Provide "Retry" button (re-request page)
    - Provide "Back to Threshold" link
    - Optional: single gentle auto-refresh after 5-8 seconds (not 10 polling attempts)
    - _Requirements: 9.3_

  - [ ] 7.4 Render confirmation message and order number
    - Display confirmation message: "Your acquisition is complete"
    - Display order number with muted gold emphasis
    - _Requirements: 4.2, 4.4_

  - [ ] 7.5 Implement order summary display
    - Display line items with imagery, titles, quantities, prices
    - Display subtotal, shipping cost, total
    - Apply muted gold color to total
    - Maintain 18px spacing between line items
    - _Requirements: 4.3_

  - [ ] 7.6 Implement return to threshold link
    - Display subtle link: "Return to threshold" or "← Discovery"
    - Apply muted gold color, deep red on hover
    - Position with 72px spacing from summary
    - _Requirements: 4.5_

  - [ ] 7.7 Apply visual-system styling to confirmation page
    - Use black/near-black backgrounds
    - Use muted gold for order number and total
    - Use deep red for hover states
    - Maintain generous spacing (72px between sections, 18px between elements)
    - _Requirements: 4.3, 4.4_

  - [ ] 7.8 Validate confirmation page for forbidden patterns
    - Ensure no aggressive "Continue shopping" buttons
    - Ensure no email signup prompts
    - Ensure no marketing messaging
    - Ensure no upsells or cross-sells
    - _Requirements: 4.5_

  - [ ]* 7.9 Write unit tests for confirmation page
    - Test token verification
    - Test order data display
    - Test fallback to API
    - Test calm retry component
    - Test visual-system conformance (colors, spacing)
    - Test forbidden pattern exclusion
    - _Requirements: 8.3, 9.1, 9.2, 9.3, 4.2, 4.3, 4.4, 4.5_

- [ ] 8. Implement abandoned checkout handling
  - [ ] 8.1 Handle visitor return without completing checkout
    - Detect when visitor returns to cart without completing
    - Preserve cart state
    - Display no aggressive messaging
    - _Requirements: 6.2, 7.3_

  - [ ] 8.2 Configure Shopify abandoned checkout settings
    - Minimize aggressive abandoned checkout emails (Shopify settings)
    - Disable aggressive cart recovery popups (if Shopify permits)
    - _Requirements: 7.3_

- [ ] 9. Checkpoint - Test complete checkout flow
  - Test cart → Shopify checkout redirect using cart.checkoutUrl
  - Complete test order in Shopify checkout
  - Verify webhook received and processed with raw body verification
  - Verify signed token generated and confirmation page displays correctly
  - Test calm fallback if order data not immediately available
  - Test abandoned checkout handling
  - Ask the user if questions arise

- [ ] 10. Create CHECKOUT_OPTION_A.md documentation
  - [ ] 10.1 Document redirect approach
    - Explain cart.checkoutUrl usage (no checkoutCreate mutation)
    - Document error handling for missing/invalid checkoutUrl
    - _Requirements: 12.1_

  - [ ] 10.2 Document signed token confirmation approach
    - Explain token generation (payload, signature, expiry)
    - Explain token verification process
    - Document Shopify thank-you page configuration
    - _Requirements: 12.1_

  - [ ] 10.3 Document webhook verification with raw body emphasis
    - **CRITICAL**: Emphasize raw request body requirement
    - Explain why raw body is critical (JSON parsing changes bytes)
    - Provide code examples showing correct implementation
    - Document common mistakes to avoid
    - _Requirements: 12.1_

  - [ ] 10.4 Document idempotency rules
    - Explain duplicate webhook handling
    - Document database transaction usage
    - _Requirements: 12.1_

  - [ ] 10.5 Create Shopify Admin settings checklist
    - Checkout customization settings
    - Webhook configuration
    - Thank-you page redirect configuration
    - Shipping method configuration
    - _Requirements: 12.1_

  - [ ] 10.6 Document "Cannot customize" constraints and plan limitations
    - List Shopify-controlled elements
    - Document accepted defaults
    - Explain visual-system conformance constraints
    - **Document Shopify plan constraints for thank-you page scripting**
    - Shopify Plus: Full scripting available (can pass order_id)
    - Non-Plus: Limited scripting (fallback to email/account confirmation)
    - Document fallback strategies when order identifier cannot be passed
    - _Requirements: 12.3, 12.4, 12.6_

- [ ] 11. Implement responsive behavior for confirmation page
  - [ ] 11.1 Test confirmation page on mobile viewport (≤768px)
    - Verify single-column layout
    - Verify 18px minimum spacing maintained
    - Verify visual-system aesthetic maintained
    - _Requirements: 4.3_

  - [ ] 11.2 Test confirmation page on tablet viewport (769px-1024px)
    - Verify layout adaptation
    - Verify generous spacing maintained
    - Verify visual-system aesthetic maintained
    - _Requirements: 4.3_

  - [ ] 11.3 Test confirmation page on desktop viewport (≥1025px)
    - Verify centered layout
    - Verify 72px spacing between sections
    - Verify visual-system aesthetic maintained
    - _Requirements: 4.3_

- [ ] 12. Final integration testing and validation
  - [ ] 12.1 Test complete checkout flow end-to-end
    - Add products to cart
    - Proceed to Shopify checkout using cart.checkoutUrl
    - Complete address, shipping, payment in Shopify
    - Verify order creation
    - Verify webhook received with raw body verification
    - Verify signed token generated
    - Verify confirmation page displays
    - _Requirements: 7.5_

  - [ ] 12.2 Test error scenarios
    - Test missing/invalid checkoutUrl
    - Test webhook failure (fallback to API retrieval)
    - Test calm retry component
    - Test abandoned checkout handling
    - _Requirements: 6.1, 6.2, 9.3_

  - [ ] 12.3 Validate visual-system conformance
    - Verify Shopify checkout branding applied (where possible)
    - Verify confirmation page maintains visual-system aesthetic
    - Verify no forbidden patterns in confirmation page
    - _Requirements: 2.1, 2.2, 2.3, 2.4, 4.3, 4.4, 4.5_

  - [ ] 12.4 Validate fulfillment invisibility
    - Verify shipping methods use calm names
    - Verify no delivery timeframes (where Shopify permits)
    - Verify no shipping urgency (where Shopify permits)
    - _Requirements: 3.1, 3.2, 3.3_

- [ ] 13. Final checkpoint - Ensure all tests pass and checkout integration is complete
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP
- Each task references specific requirements for traceability
- Checkpoints ensure incremental validation
- **Critical**: We do NOT implement custom checkout forms - Shopify handles all checkout UI
- **Critical**: We do NOT handle payment processing - Shopify handles PCI compliance
- **Critical**: We do NOT create orders - Shopify handles order creation
- **Critical**: Redirect uses cart.checkoutUrl directly (no checkoutCreate mutation)
- **Critical**: Confirmation uses signed tokens (no correlation ID tracking)
- **Critical**: Webhook verification MUST use raw request body (not parsed JSON)
- **Critical**: Fallback is calm retry with manual action (no aggressive polling)
- Focus is on: redirect (cart.checkoutUrl), customization (where permitted), signed token confirmation, and calm fallback
- Accept Shopify's defaults where customization is not available
- Document all customization constraints and accepted defaults in CHECKOUT_OPTION_A.md

