# Requirements Document

## Introduction

Phase 2 Revenue Mechanics implements the complete e-commerce transaction flow for Charmed & Dark, enabling customers to purchase gothic lifestyle products through a brutalist-designed cart interface with dual pricing (public vs House member pricing), AI-generated product lore, and verified order tracking via Shopify webhooks.

This feature integrates four major systems: AI Narrative Engine for gothic product descriptions, Slide-Out Cart with localStorage persistence, Shopify Checkout with automatic discount application, and HMAC Webhook Handler for secure order verification and storage.

## Glossary

- **Cart_System**: The client-side shopping cart with localStorage persistence and dual pricing display
- **AI_Narrative_Engine**: Claude API integration that generates gothic lore for product descriptions
- **Checkout_API**: Server-side API route that creates Shopify carts with HOUSE10 discount pre-applied
- **Webhook_Handler**: Server-side API route that verifies and stores completed Shopify orders using HMAC signatures
- **House_Member**: A customer who is part of The Sanctuary membership program (receives 10% discount)
- **Public_Price**: The standard retail price displayed to all customers
- **House_Price**: The discounted price (10% off) displayed to House members and applied at checkout
- **HOUSE10**: Shopify discount code that provides 10% off all products with no usage limits
- **Brutalist_Design**: Design aesthetic with 0px border radius, sharp borders, and minimal gold accent (#B89C6D)
- **Product_Lore**: AI-generated gothic narrative description for products (80-150 words)
- **Shopify_Variant_ID**: The global ID for a product variant in Shopify's GraphQL API
- **HMAC_Signature**: Hash-based message authentication code used to verify webhook authenticity
- **Sync_Pipeline**: The /api/admin/sync-products route that pulls products from Shopify and generates lore

## Requirements

### Requirement 1: AI-Generated Product Lore

**User Story:** As a site administrator, I want AI-generated gothic lore for all products, so that each item has atmospheric narrative descriptions that match the brand voice.

#### Acceptance Criteria

1. WHEN the Sync_Pipeline executes, THE AI_Narrative_Engine SHALL generate Product_Lore for each product using Claude API
2. THE AI_Narrative_Engine SHALL use the claude-sonnet-4-20250514 model with max_tokens set to 1024
3. THE AI_Narrative_Engine SHALL generate Product_Lore between 80 and 150 words in length
4. THE AI_Narrative_Engine SHALL write in second person voice without exclamation marks
5. THE AI_Narrative_Engine SHALL avoid the words "unique", "stunning", "amazing", "perfect", and "beautiful"
6. THE AI_Narrative_Engine SHALL structure Product_Lore as 2-3 short paragraphs with gothic, intimate tone
7. WHEN Product_Lore generation succeeds, THE Sync_Pipeline SHALL store the lore in the products table lore column
8. WHEN Product_Lore generation fails, THE Sync_Pipeline SHALL log the error and continue processing remaining products
9. THE AI_Narrative_Engine SHALL require ANTHROPIC_API_KEY environment variable to be configured

### Requirement 2: Slide-Out Cart Interface

**User Story:** As a customer, I want to add products to a shopping cart and review my selection before checkout, so that I can manage my purchase decisions.

#### Acceptance Criteria

1. WHEN a customer clicks "Add to Selection", THE Cart_System SHALL add the product to the cart with quantity 1
2. WHEN a product is added to cart, THE Cart_System SHALL open the slide-out cart panel automatically
3. THE Cart_System SHALL persist cart contents to localStorage under the key "charmed-dark-cart"
4. WHEN the page loads, THE Cart_System SHALL restore cart contents from localStorage
5. THE Cart_System SHALL display each cart item with image, name, price, and quantity controls
6. WHEN a customer clicks the minus button, THE Cart_System SHALL decrease quantity by 1
7. WHEN a customer clicks the plus button, THE Cart_System SHALL increase quantity by 1
8. WHEN quantity reaches 0, THE Cart_System SHALL remove the item from cart
9. WHEN a customer clicks "Remove", THE Cart_System SHALL remove the item from cart immediately
10. WHEN a customer clicks "Clear Selection", THE Cart_System SHALL remove all items from cart
11. THE Cart_System SHALL calculate and display Public_Price as the sum of all item prices times quantities
12. THE Cart_System SHALL calculate and display House_Price as Public_Price multiplied by 0.9
13. THE Cart_System SHALL display House_Price with gold accent color #B89C6D
14. THE Cart_System SHALL use Brutalist_Design with 0px border radius on all buttons and panels
15. WHEN the cart is empty, THE Cart_System SHALL display "The cart is empty" message

### Requirement 3: Product Detail Page Integration

**User Story:** As a customer, I want to add products to my cart from the product detail page, so that I can purchase items I'm interested in.

#### Acceptance Criteria

1. THE Product_Detail_Page SHALL display an AddToCartButton component for each product
2. WHEN a customer clicks AddToCartButton, THE Cart_System SHALL add the product with quantity 1
3. THE AddToCartButton SHALL use Brutalist_Design with 0px border radius
4. THE AddToCartButton SHALL display the text "Add to Selection"
5. THE AddToCartButton SHALL show hover state with gold border color #B89C6D
6. THE AddToCartButton SHALL pass product data including slug, name, price, imageUrl, and shopifyVariantId

### Requirement 4: Shopify Checkout Creation

**User Story:** As a customer, I want to proceed to checkout with my cart items, so that I can complete my purchase with automatic House member discount applied.

#### Acceptance Criteria

1. WHEN a customer clicks "Proceed to Checkout", THE Cart_System SHALL send cart items to the Checkout_API
2. THE Checkout_API SHALL create a Shopify cart using the Cart Create GraphQL mutation
3. FOR EACH cart item, THE Checkout_API SHALL look up the Shopify_Variant_ID by product handle if not provided
4. THE Checkout_API SHALL include the discount code "HOUSE10" in the cart creation request
5. WHEN cart creation succeeds, THE Checkout_API SHALL return the checkoutUrl to the client
6. WHEN the client receives checkoutUrl, THE Cart_System SHALL redirect the browser to the Shopify checkout page
7. WHEN cart creation fails, THE Checkout_API SHALL return an error response with status 500
8. WHEN the cart is empty, THE Checkout_API SHALL return an error response with status 400
9. WHEN no valid products are found, THE Checkout_API SHALL return an error response with status 400
10. THE Checkout_API SHALL require SHOPIFY_STORE_DOMAIN environment variable to be configured
11. THE Checkout_API SHALL require SHOPIFY_STOREFRONT_ACCESS_TOKEN environment variable to be configured
12. WHILE checkout is in progress, THE Cart_System SHALL display "Opening Checkout..." button text
13. WHILE checkout is in progress, THE Cart_System SHALL disable the checkout button

### Requirement 5: Shopify Discount Code Configuration

**User Story:** As a site administrator, I want a HOUSE10 discount code configured in Shopify, so that House members automatically receive 10% off at checkout.

#### Acceptance Criteria

1. THE Shopify_Admin SHALL create a discount code named "HOUSE10"
2. THE HOUSE10 discount SHALL provide 10% off the entire order
3. THE HOUSE10 discount SHALL have no usage limits per customer
4. THE HOUSE10 discount SHALL have no total usage limits
5. THE HOUSE10 discount SHALL have no expiration date
6. THE HOUSE10 discount SHALL apply to all products in the store
7. THE HOUSE10 discount SHALL be automatically applied when included in cart creation

### Requirement 6: Shopify Order Webhook Handler

**User Story:** As a site administrator, I want completed orders from Shopify to be verified and stored in the database, so that I can track sales and customer purchases.

#### Acceptance Criteria

1. WHEN Shopify sends an order webhook, THE Webhook_Handler SHALL verify the HMAC_Signature using SHOPIFY_WEBHOOK_SECRET
2. IF the HMAC_Signature is invalid, THEN THE Webhook_Handler SHALL return status 401 and reject the request
3. WHEN the HMAC_Signature is valid, THE Webhook_Handler SHALL parse the order data from the request body
4. THE Webhook_Handler SHALL extract shopify_order_id, order_number, email, total_price, currency, and financial_status
5. THE Webhook_Handler SHALL extract line_items as JSONB from the order data
6. THE Webhook_Handler SHALL extract shipping_address as JSONB from the order data
7. THE Webhook_Handler SHALL store the order in the orders table using upsert on shopify_order_id
8. WHEN order storage succeeds, THE Webhook_Handler SHALL return status 200 with success message
9. WHEN order storage fails, THE Webhook_Handler SHALL return status 500 with error message
10. THE Webhook_Handler SHALL require SHOPIFY_WEBHOOK_SECRET environment variable to be configured
11. THE Webhook_Handler SHALL use crypto.createHmac with sha256 algorithm for signature verification
12. THE Webhook_Handler SHALL compare HMAC signatures using crypto.timingSafeEqual to prevent timing attacks
13. THE Webhook_Handler SHALL convert both hash and hmacHeader to Buffer before comparison to ensure timingSafeEqual works correctly

### Requirement 7: Shopify Webhook Configuration

**User Story:** As a site administrator, I want Shopify configured to send order webhooks to the production server, so that completed orders are automatically tracked.

#### Acceptance Criteria

1. THE Shopify_Admin SHALL create an order creation webhook in Shopify admin
2. THE webhook SHALL point to the production URL https://charmedanddark.com/api/webhooks/shopify/orders
3. THE webhook SHALL use HMAC signature verification
4. THE webhook SHALL send order data in JSON format
5. THE webhook SHALL trigger when an order is created in Shopify

### Requirement 8: Complete Transaction Flow Testing

**User Story:** As a developer, I want to verify the complete purchase flow works end-to-end, so that customers can successfully complete purchases.

#### Acceptance Criteria

1. WHEN a customer adds a product to cart, THE Cart_System SHALL display the item with correct pricing
2. WHEN a customer proceeds to checkout, THE Checkout_API SHALL create a Shopify cart with HOUSE10 applied
3. WHEN a customer completes checkout in Shopify, THE Webhook_Handler SHALL receive and store the order
4. THE complete flow SHALL preserve product data from cart through checkout to order storage
5. THE complete flow SHALL apply the 10% discount correctly at checkout
6. THE complete flow SHALL verify HMAC signatures on all webhook requests

### Requirement 9: Shopify Variant ID Storage

**User Story:** As a developer, I want Shopify variant IDs stored in the products table, so that checkout can create carts without additional API lookups for each product.

#### Acceptance Criteria

1. THE products table SHALL have a shopify_variant_id column of type TEXT
2. WHEN the Sync_Pipeline executes, THE transformShopifyProduct function SHALL extract the variant ID from shopifyProduct.variants.edges[0]?.node?.id
3. THE Sync_Pipeline SHALL store the shopify_variant_id in the products table for each product
4. WHEN lib/products.js transforms a product row, IT SHALL include shopifyVariantId in the returned product object
5. WHEN the Checkout_API receives a cart item with shopifyVariantId, IT SHALL use that ID directly without additional Shopify API lookups
6. WHEN the Checkout_API receives a cart item without shopifyVariantId, IT SHALL fall back to looking up the variant by product handle

### Requirement 10: Environment Configuration

**User Story:** As a developer, I want all required environment variables documented and configured, so that the revenue systems function correctly in production.

#### Acceptance Criteria

1. THE application SHALL require ANTHROPIC_API_KEY for AI lore generation
2. THE application SHALL require SHOPIFY_WEBHOOK_SECRET for webhook verification
3. THE application SHALL require NEXT_PUBLIC_SHOPIFY_CHECKOUT_DOMAIN for checkout redirects
4. THE application SHALL require SHOPIFY_STORE_DOMAIN for Shopify API calls
5. THE application SHALL require SHOPIFY_STOREFRONT_ACCESS_TOKEN for Shopify API authentication
6. THE application SHALL require SUPABASE_SERVICE_ROLE_KEY for order storage
7. WHEN any required environment variable is missing, THE application SHALL log a clear error message
8. THE .env.local file SHALL contain all development environment variables
9. THE Vercel project SHALL contain all production environment variables

### Requirement 11: Build Verification and Deployment

**User Story:** As a developer, I want the application to build successfully with all revenue systems integrated, so that it can be deployed to production.

#### Acceptance Criteria

1. WHEN running npm run build, THE build process SHALL complete without errors
2. THE build process SHALL verify all API routes are valid
3. THE build process SHALL verify all components import correctly
4. THE build process SHALL verify all environment variables are typed correctly
5. WHEN the build succeeds, THE application SHALL be ready for deployment to Vercel
6. THE deployed application SHALL serve all cart, checkout, and webhook routes correctly
