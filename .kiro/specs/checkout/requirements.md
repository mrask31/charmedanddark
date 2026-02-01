# Requirements Document: Checkout (Shopify-Hosted)

## Introduction

The Checkout defines the completion ritual experience where visitors are redirected to Shopify's hosted checkout to provide operationally required information (address, shipping method, payment) and finalize their acquisition. This is NOT a conventional checkout form with urgency patterns—it's a dignified, calm completion moment handled by Shopify's secure checkout infrastructure.

**Implementation Decision: Shopify-Hosted Checkout (Option A)**

Charmed & Dark uses Shopify's hosted checkout for all address collection, shipping method selection, payment processing, and order creation. Our application does NOT implement custom checkout forms. Instead, we:
1. Redirect visitors from Cart to Shopify's checkout URL
2. Customize Shopify's checkout (where permitted) to align with visual-system principles
3. Handle post-checkout confirmation

This feature explicitly conforms to the Visual System spec (.kiro/specs/visual-system/) within the constraints of Shopify's checkout customization capabilities. Every requirement references the visual-system properties it should uphold where Shopify customization permits.

## Glossary

- **Shopify_Hosted_Checkout**: Shopify's external checkout infrastructure that handles address collection, shipping method selection, payment processing, and order creation
- **Checkout_Redirect**: The action of redirecting visitors from Cart to Shopify's checkout URL using the cart ID
- **Checkout_Customization**: The limited styling and language customization Shopify permits within their hosted checkout
- **Completion_Ritual**: The presentation of checkout as a final, dignified moment rather than a transactional form (applied through Shopify customization where possible)
- **Order_Confirmation**: The post-checkout confirmation page displayed after Shopify completes the order
- **Visual_System**: The foundational design language defined in .kiro/specs/visual-system/ that governs all visual aspects (applied to Shopify checkout where customization permits)
- **Fulfillment_Invisibility**: The principle that operational fulfillment details remain hidden unless explicitly necessary (applied through Shopify settings and customization)
- **Checkout_URL**: The Shopify-generated URL for the hosted checkout experience, created from the cart ID

## Requirements

### Requirement 1: Shopify Checkout Redirect from Cart

**User Story:** As a visitor, I want to proceed from cart to checkout seamlessly, so that I can complete my acquisition without friction.

#### Acceptance Criteria

1. WHEN a visitor clicks the Proceed action in Cart, THE application SHALL redirect to Shopify's hosted checkout using the cart's existing checkoutUrl field
   - Read cart.checkoutUrl directly from Storefront API cart object
   - No checkoutCreate mutation needed

2. THE redirect SHALL occur smoothly without aggressive loading indicators or urgency messaging
   - Subtle transition or immediate redirect
   - No "Redirecting to secure checkout..." with countdown timers

3. WHEN the checkoutUrl is missing or invalid, THE application SHALL display elegant error messaging
   - Calm language: "Unable to proceed at this moment. Please try again shortly."
   - No technical error details exposed to visitor
   - Preserve cart state

4. THE application SHALL NOT implement custom checkout forms, address collection, payment fields, or order creation logic
   - All checkout functionality delegated to Shopify

### Requirement 2: Shopify Checkout Customization (Visual System Alignment)

**User Story:** As a designer, I want Shopify's checkout to align with our visual-system principles where customization permits, so that the completion ritual maintains gothic-romantic aesthetic.

#### Acceptance Criteria

1. WHEN customizing Shopify checkout, THE application SHALL apply visual-system color palette where Shopify permits
   - Black and near-black backgrounds (if customizable)
   - Muted gold accents (if customizable)
   - Deep red for interactive elements (if customizable)
   - _Conforms to: visual-system Properties 4, 5, 10 (where Shopify permits)_

2. WHEN customizing Shopify checkout typography, THE application SHALL use elegant gothic fonts where Shopify permits
   - Avoid default Shopify fonts if customization available
   - _Conforms to: visual-system typography hierarchy (where Shopify permits)_

3. WHEN customizing Shopify checkout language, THE application SHALL use ritualized, calm language where Shopify permits
   - Button text: "Complete" or "Finalize" instead of "Place order" (if customizable)
   - Field labels: Calm, dignified language (if customizable)
   - _Conforms to: visual-system Property 7 (Forbidden Phrase Detection) where Shopify permits_

4. THE application SHALL configure Shopify checkout settings to minimize urgency patterns where possible
   - Disable aggressive upsells if Shopify allows
   - Disable countdown timers if Shopify allows
   - Disable shipping urgency messaging if Shopify allows
   - _Conforms to: visual-system Property 13, 18 (where Shopify permits)_

5. THE application SHALL document Shopify checkout customization constraints
   - Clearly identify what can and cannot be customized
   - Accept Shopify's default behavior where customization is not permitted

### Requirement 3: Fulfillment Invisibility (Within Shopify Constraints)

**User Story:** As a visitor, I want the checkout experience to remain calm and dignified, so that operational fulfillment details do not introduce pressure or urgency.

#### Acceptance Criteria

1. WHEN configuring Shopify checkout, THE application SHALL disable delivery promises and "Get it by [date]" messaging if Shopify permits
   - _Conforms to: Fulfillment_Invisibility principle (where Shopify permits)_

2. WHEN configuring Shopify checkout, THE application SHALL disable shipping urgency language if Shopify permits
   - No "Order within X hours" messaging
   - _Conforms to: visual-system Property 18 (where Shopify permits)_

3. WHEN configuring Shopify checkout, THE application SHALL disable inventory pressure messaging if Shopify permits
   - No "Only X left" or "Low stock" warnings
   - _Conforms to: visual-system Property 13 (where Shopify permits)_

4. THE application SHALL accept Shopify's default fulfillment messaging where customization is not permitted
   - Document what cannot be changed
   - Focus customization efforts on what Shopify allows

5. WHEN configuring shipping methods in Shopify, THE application SHALL use calm method names
   - "Standard" instead of "Fast shipping"
   - "Express" instead of "Rush delivery"

### Requirement 4: Post-Checkout Order Confirmation

**User Story:** As a visitor who has completed an acquisition, I want subtle confirmation and order details, so that the completion feels final and dignified.

#### Acceptance Criteria

1. WHEN Shopify completes an order, THE application SHALL receive order confirmation via webhook or redirect

2. WHEN rendering order confirmation in our application, THE application SHALL display subtle confirmation without aggressive success messaging
   - Calm confirmation: "Your acquisition is complete" or "Order confirmed"
   - No "Order placed successfully!" with bright colors
   - _Conforms to: visual-system tone guidelines_

3. WHEN rendering order confirmation details, THE application SHALL present order number, summary, and next steps elegantly
   - Maintain visual-system aesthetic
   - Generous whitespace and calm presentation
   - _Conforms to: visual-system Properties 4, 5, 8_

4. WHEN rendering confirmation, THE application SHALL use muted gold emphasis for order number or total
   - _Conforms to: visual-system Property 3 (Emphasis Elements Use Muted Gold)_

5. THE application SHALL exclude aggressive "Continue shopping" prompts from confirmation view
   - Subtle invitation to return to threshold if needed
   - Deep red hover state on link
   - _Conforms to: visual-system Property 10_

### Requirement 5: Shopify Checkout Configuration

**User Story:** As a system administrator, I want to configure Shopify checkout settings to align with our brand principles, so that the checkout experience maintains dignity and calm.

#### Acceptance Criteria

1. THE application SHALL configure Shopify checkout settings to disable aggressive features where possible
   - Disable upsells and cross-sells if Shopify allows
   - Disable discount code prominence if Shopify allows
   - Disable aggressive marketing opt-ins if Shopify allows

2. THE application SHALL configure Shopify shipping method names to use calm language
   - Avoid urgency language in method titles
   - Use descriptive, calm names

3. THE application SHALL configure Shopify checkout branding to align with visual-system where possible
   - Logo, colors, typography (within Shopify's customization limits)

4. THE application SHALL document all Shopify checkout configuration decisions
   - What was customized
   - What could not be customized
   - Rationale for each decision

5. THE application SHALL accept Shopify's checkout infrastructure as the source of truth for:
   - Address validation
   - Shipping method calculation
   - Payment processing
   - Order creation
   - PCI compliance

### Requirement 6: Error Handling and Edge Cases

**User Story:** As a visitor, I want checkout errors to be handled gracefully, so that issues feel like gentle guidance rather than aggressive failures.

#### Acceptance Criteria

1. WHEN Shopify checkout URL generation fails, THE application SHALL display elegant error messaging
   - Calm language without technical details
   - Invitation to try again or return to cart

2. WHEN a visitor returns from Shopify checkout without completing, THE application SHALL handle the return gracefully
   - Preserve cart state
   - No aggressive "Complete your order!" messaging

3. WHEN Shopify checkout encounters payment errors, THE application SHALL rely on Shopify's error handling
   - Accept Shopify's default error presentation
   - Do not attempt to override or customize payment error flows

4. WHEN order confirmation webhook fails, THE application SHALL have fallback confirmation retrieval
   - Poll Shopify for order status if webhook fails
   - Display confirmation once order is confirmed

5. THE application SHALL log checkout errors for debugging without exposing technical details to visitors

### Requirement 7: Checkout Flow Continuity

**User Story:** As a visitor, I want the transition from cart to checkout to feel intentional and continuous, so that the completion ritual maintains presence.

#### Acceptance Criteria

1. WHEN redirecting to Shopify checkout, THE application SHALL maintain visual continuity where possible
   - Shopify checkout branding aligned with visual-system (where customizable)

2. WHEN returning from Shopify checkout, THE application SHALL provide clear next steps
   - Order confirmation page (if order completed)
   - Cart page (if checkout abandoned)

3. THE application SHALL NOT implement aggressive cart abandonment recovery
   - No popups when visitor leaves checkout
   - No aggressive email reminders (configure Shopify settings to minimize)

4. WHEN a visitor completes checkout, THE application SHALL provide elegant post-purchase experience
   - Order confirmation page with visual-system aesthetic
   - Subtle invitation to return to threshold

5. THE application SHALL treat Shopify checkout as an external "completion ritual" handled by trusted infrastructure
   - Accept Shopify's checkout flow as authoritative
   - Focus customization on what enhances ritual tone within Shopify's constraints


### Requirement 8: Signed Token Confirmation Security

**User Story:** As a system, I want secure order confirmation without complex state tracking, so that visitors can view their order details safely.

#### Acceptance Criteria

1. WHEN Shopify redirects to the thank-you page, THE application SHALL generate a short-lived signed token
   - Token payload: { order_id, issued_at, expires_at }
   - Signature: HMAC-SHA256 using app secret
   - Expiry: 1 hour from issuance

2. WHEN redirecting to confirmation page, THE application SHALL use format: /threshold/confirmation?t=<signed_token>
   - Token is non-guessable and cryptographically secure
   - No correlation IDs or database tracking needed

3. WHEN accessing confirmation page, THE application SHALL verify token signature and expiry
   - Verify HMAC signature using app secret
   - Check token has not expired
   - Reject invalid or expired tokens with calm error message

4. THE application SHALL NOT use correlation IDs, database session tracking, or complex state management
   - Token is self-contained authorization
   - Minimal server-side state required

### Requirement 9: Confirmation Page Data Retrieval

**User Story:** As a visitor, I want to see my order confirmation quickly and reliably, so that I know my acquisition is complete.

#### Acceptance Criteria

1. WHEN accessing confirmation page with valid token, THE application SHALL attempt to retrieve order data from database first
   - Query database for webhook-stored order data using order_id from token
   - If found, display full confirmation immediately

2. WHEN order data is not yet in database (webhook pending), THE application SHALL fall back to Shopify Admin API
   - Fetch order details from Shopify using order_id from token
   - Display full confirmation with fetched data
   - Optionally store in database for future requests

3. WHEN order data cannot be retrieved, THE application SHALL display calm message with manual retry
   - Message: "We're preparing your confirmation. This can take a moment."
   - Provide "Retry" button (re-request page)
   - Provide "Back to Threshold" link
   - Optional: single gentle auto-refresh after 5-8 seconds (not aggressive polling)

4. THE application SHALL NOT implement aggressive client-side polling
   - No 10-attempt polling loops
   - No automatic retries without user action (except optional single refresh)
   - Calm, dignified fallback experience

### Requirement 10: Webhook Security and Idempotency

**User Story:** As a system, I want secure and reliable webhook processing, so that orders are confirmed accurately without duplication.

#### Acceptance Criteria

1. **CRITICAL**: WHEN receiving a Shopify order webhook, THE application SHALL verify HMAC signature using raw request body bytes
   - **MUST use raw request body before any JSON parsing**
   - **MUST disable framework body parsing or bypass it**
   - Use Shopify webhook secret to compute HMAC-SHA256
   - Compare computed HMAC with X-Shopify-Hmac-SHA256 header using timing-safe comparison (crypto.timingSafeEqual)
   - Reject webhook if signature verification fails
   - **This is the #1 webhook implementation footgun - raw body is critical**

2. WHEN processing a webhook, THE application SHALL implement idempotency to prevent duplicate processing
   - Use database unique constraint on shopify_order_id column (separate from primary key)
   - Use upsert/insert-ignore-on-conflict pattern
   - On unique constraint violation, return 200 OK and treat as duplicate (idempotent)
   - **Return 200 OK for verified duplicates (unique violation) to prevent Shopify retries**
   - Log duplicate webhook attempts for monitoring

3. WHEN storing webhook data, THE application SHALL use database transactions
   - Atomic update of order data
   - Rollback on failure to maintain data consistency

4. THE application SHALL log all webhook events for debugging and monitoring
   - Log webhook receipt (timestamp, order_id)
   - Log verification success/failure
   - Log processing success/failure
   - Do not log sensitive payment information

5. THE application SHALL implement webhook retry handling
   - Return 200 OK only after successful processing
   - Return 500 error if processing fails (Shopify will retry)
   - Implement exponential backoff for retries if needed

### Requirement 11: Order Data Storage Strategy

**User Story:** As a system, I want order data stored from webhooks for fast confirmation page display, so that visitors see their order details quickly.

#### Acceptance Criteria

1. WHEN receiving order webhook, THE application SHALL store order data in database
   - Store order_id, order_number, line_items, shipping_address, totals
   - Use as primary data source for confirmation page

2. WHEN rendering confirmation page, THE application SHALL retrieve order data from database first
   - Query database using order_id from signed token
   - Display confirmation if data found

3. WHEN database query returns no data, THE application SHALL fall back to Shopify Admin API
   - Fetch order from Shopify using order_id
   - Display confirmation with fetched data
   - Optionally store in database

4. THE application SHALL NOT expose Shopify API credentials or order lookup logic to client
   - All order retrieval happens server-side
   - No client-side Shopify API calls

### Requirement 12: Shopify Customization Limits Documentation

**User Story:** As a developer, I want clear documentation of Shopify customization limits and implementation approach, so that I understand what can and cannot be customized.

#### Acceptance Criteria

1. THE application SHALL provide CHECKOUT_OPTION_A.md documentation file including:
   - Redirect approach (using cart.checkoutUrl directly)
   - Confirmation route with signed token approach
   - Webhook verification with raw body emphasis
   - Idempotency rules
   - Shopify Admin settings checklist
   - "Cannot customize" constraints

2. THE application SHALL document what Shopify checkout customization is possible:
   - Branding: Logo, primary color, background color (limited palette)
   - Typography: Font family selection (limited options)
   - Language: Button text, field labels (limited customization)
   - Feature toggles: Upsells, marketing opt-ins (limited control)

3. THE application SHALL document what Shopify checkout customization is NOT possible:
   - UI layout and structure (Shopify-controlled)
   - Form field rendering (Shopify-controlled)
   - Validation error messages (Shopify-controlled)
   - Payment field styling (Shopify-controlled)
   - Shipping method selection UI (Shopify-controlled)
   - Order summary presentation (Shopify-controlled)

4. THE application SHALL document accepted Shopify defaults:
   - What visual-system principles cannot be applied
   - What fulfillment invisibility constraints exist
   - What urgency patterns cannot be disabled

5. THE application SHALL maintain customization documentation as living document
   - Update when Shopify adds new customization options
   - Update when customization constraints change
   - Include screenshots of customization settings

6. THE application SHALL document Shopify plan constraints for thank-you page scripting
   - Shopify Plus: Full thank-you page scripting available (can pass order_id for signed token)
   - Non-Plus: Limited or no thank-you page scripting (fallback to email/account-based confirmation)
   - Document fallback strategies when order identifier cannot be passed
   - Webhook processing works regardless of plan

### Requirement 13: Confirmation Page Security

**User Story:** As a visitor, I want my order confirmation to be secure and private, so that my order details are not exposed to unauthorized parties.

#### Acceptance Criteria

1. WHEN generating confirmation page URL, THE application SHALL use signed token with HMAC signature
   - Token payload: { order_id, issued_at, expires_at }
   - Signature: HMAC-SHA256 using app secret
   - Short-lived: 1 hour expiry
   - Non-guessable and cryptographically secure

2. WHEN accessing confirmation page, THE application SHALL verify token signature and expiry
   - Verify HMAC signature matches
   - Check token has not expired
   - Return 404 or calm error if token invalid/expired

3. THE application SHALL implement rate limiting on confirmation page access
   - Limit requests per IP address (e.g., 10 requests per minute)
   - Prevent brute-force attempts
   - Log suspicious access patterns

4. THE application SHALL NOT expose PII in confirmation page URLs or client-side code
   - No customer names, addresses, or payment info in URLs
   - No sensitive data in client-side JavaScript
   - All PII retrieved server-side and rendered securely

5. WHEN visitor is authenticated, THE application SHALL associate order with customer account
   - Link order to customer account for order history
   - Allow authenticated access to order details beyond confirmation page
   - Maintain security for guest checkout orders (signed token only)
