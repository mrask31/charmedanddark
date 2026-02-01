# Charmed & Dark

Luxury gothic-romantic ecommerce built with Next.js, Supabase, and Shopify.

## Checkout Implementation (Option A: Shopify-Hosted)

This project implements **Shopify-hosted checkout** following the spec in `.kiro/specs/checkout/`.

### Key Features

1. **Cart Redirect via cart.checkoutUrl** - No checkoutCreate mutation
2. **Webhook with Raw Body HMAC Verification** - Critical security requirement
3. **Signed Token Confirmation** - Base64url encoded, 1-hour expiry
4. **Idempotent Order Storage** - UNIQUE constraint on shopify_order_id
5. **Server-Side Fallback** - Admin API fetch if webhook delayed
6. **Calm Retry** - Manual retry, no aggressive polling

### Setup

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Configure environment variables**:
   ```bash
   cp .env.example .env
   ```
   
   Fill in all required values:
   - Shopify Storefront API credentials
   - Shopify Admin API credentials
   - Shopify Webhook Secret
   - App Secret (min 32 characters)
   - Supabase credentials

3. **Run database migrations**:
   ```bash
   # Using Supabase CLI
   supabase db push
   
   # Or manually run: supabase/migrations/001_orders.sql
   ```

4. **Configure Shopify webhook**:
   - Navigate to Shopify Admin → Settings → Notifications → Webhooks
   - Create webhook:
     - Topic: `orders/create`
     - URL: `https://yourdomain.com/api/webhooks/orders-create`
     - Format: JSON

5. **Configure Shopify thank-you page** (Shopify Plus only):
   - Navigate to Shopify Admin → Settings → Checkout → Order status page
   - Add redirect script (see CHECKOUT_OPTION_A.md)

6. **Run development server**:
   ```bash
   npm run dev
   ```

### Project Structure

```
app/
├── threshold/
│   ├── cart/page.tsx              # Cart with checkout redirect
│   └── confirmation/
│       ├── page.tsx                # Confirmation page (server component)
│       ├── ConfirmationView.tsx    # Full order display
│       ├── CalmRetry.tsx           # Retry component
│       └── CalmError.tsx           # Error component
├── api/
│   ├── cart/route.ts               # Cart API (returns checkoutUrl)
│   └── webhooks/
│       └── orders-create/route.ts  # Webhook handler (raw body HMAC)
lib/
├── confirmToken.ts                 # Signed token generation/verification
├── supabase/server.ts              # Supabase client + types
└── shopify/
    ├── storefront.ts               # Storefront API (cart.checkoutUrl)
    └── admin.ts                    # Admin API (fallback order fetch)
supabase/
└── migrations/
    └── 001_orders.sql              # Database schema
```

### Critical Implementation Notes

1. **Webhook Raw Body**: HMAC verification MUST use raw request body bytes before any JSON parsing. No middleware can touch the body before verification.

2. **Order ID Format**: Uses REST numeric order IDs consistently (token payload + Admin API fetch). Keep format consistent everywhere.

3. **Idempotency**: UNIQUE constraint on `shopify_order_id` enforces idempotency at database level. Returns 200 OK for duplicates to prevent Shopify retries.

4. **Token Security**: Base64url encoding (URL-safe), HMAC-SHA256 signature, 1-hour expiry. Token serves as authorization for confirmation page.

5. **No Polling**: Calm retry with manual "Retry" button only. No aggressive client-side polling loops.

### Documentation

See `.kiro/specs/checkout/CHECKOUT_OPTION_A.md` for complete implementation guide and ship checklist.

### Testing

1. **Test cart redirect**:
   - Visit `/threshold/cart`
   - Click "Proceed" button
   - Should redirect to Shopify checkout

2. **Test webhook** (use Shopify webhook testing tool or ngrok):
   - Send test `orders/create` webhook
   - Verify HMAC signature validation
   - Verify order stored in database
   - Verify duplicate webhooks return 200 OK

3. **Test confirmation page**:
   - Generate signed token with valid order ID
   - Visit `/threshold/confirmation?t={token}`
   - Should display order confirmation
   - Test with invalid/expired token (should show error)
   - Test with order not in DB (should show retry)

### Ship Checklist

- [x] Cart redirect uses cart.checkoutUrl only
- [x] Webhook route verifies HMAC on raw bytes before parsing
- [x] Webhook route has no middleware that touches request body
- [x] Webhook stores minimal order summary + enforces UNIQUE(shopify_order_id)
- [x] Webhook returns 200 OK on verified duplicates
- [x] Confirmation route requires signed token (base64url) + expiry check
- [x] Token payload order_id format is consistent (REST numeric)
- [x] Confirmation loads from DB first, then Admin API fallback
- [x] Admin API fallback uses same order_id format as token
- [x] If order data missing, render "preparing confirmation" + Retry button
- [x] CHECKOUT_OPTION_A.md documents Shopify constraints
- [ ] Shopify Plus: Thank-you page redirect configured (if applicable)
- [ ] Non-Plus: Fallback strategy implemented (if applicable)
- [ ] Visual-system conformance applied where Shopify permits
- [ ] Shipping methods use calm names
- [ ] All tests pass

### License

Private - Charmed & Dark
