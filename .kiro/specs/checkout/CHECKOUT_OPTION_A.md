# Checkout Implementation: Option A (Shopify-Hosted)

## Overview

Charmed & Dark uses **Shopify-hosted checkout (Option A)** for all checkout functionality. We do NOT implement custom checkout forms. Instead:

1. **Redirect** visitors from Cart to Shopify's checkout using `cart.checkoutUrl`
2. **Customize** Shopify's checkout (where permitted) to align with visual-system
3. **Confirm** orders via webhook + signed token confirmation page

## Redirect Approach

### Using cart.checkoutUrl

**Source of Truth**: Shopify Storefront API Cart object includes `checkoutUrl` field.

**Implementation**:
```typescript
// Read checkoutUrl directly from cart object
const cart = await shopify.cart.get(cartId);
const checkoutUrl = cart.checkoutUrl;

if (!checkoutUrl) {
  // Show calm error, preserve cart
  showError("Unable to proceed at this moment. Please try again shortly.");
  return;
}

// Redirect to Shopify
window.location.href = checkoutUrl;
```

**No checkoutCreate mutation needed** - the cart already has the URL.

## Confirmation Route with Signed Token

### Token Approach

**Route**: `/threshold/confirmation?t={signed_token}`

**Token Payload**:
```json
{
  "order_id": "gid://shopify/Order/123456",
  "issued_at": 1700000000,
  "expires_at": 1700003600
}
```

**⚠️ ORDER ID FORMAT**: Token payload `order_id` MUST be the Admin API lookup key we use (REST numeric ID or GraphQL GID) — keep consistent. Shopify has multiple ID shapes:
- REST numeric order ID (e.g., `1234567890`)
- GraphQL GID (e.g., `gid://shopify/Order/123456`)
- Order "name" (e.g., `#1024`)

Choose one format and use it consistently in token generation, verification, and Admin API fallback fetch.

**Token Format**: `{base64url_payload}.{base64url_signature}`
- URL-safe encoding (base64url, not base64)
- HMAC-SHA256 signature using app secret
- 1 hour expiry

**Security Benefits**:
- Non-guessable (cryptographically secure)
- Self-contained authorization (no database session tracking)
- Prevents order ID enumeration attacks

### Token Generation

```typescript
function generateConfirmationToken(orderId: string, secret: string): string {
  const payload = {
    order_id: orderId,
    issued_at: Date.now(),
    expires_at: Date.now() + 3600000 // 1 hour
  };
  
  const payloadBase64 = Buffer.from(JSON.stringify(payload)).toString('base64url');
  const signature = crypto
    .createHmac('sha256', secret)
    .update(payloadBase64)
    .digest('base64url');
  
  return `${payloadBase64}.${signature}`;
}
```

### Token Verification

```typescript
function verifyConfirmationToken(token: string, secret: string): TokenPayload | null {
  const [payloadBase64, signature] = token.split('.');
  
  // Verify signature
  const expectedSignature = crypto
    .createHmac('sha256', secret)
    .update(payloadBase64)
    .digest('base64url');
  
  if (signature !== expectedSignature) {
    return null; // Invalid signature
  }
  
  // Parse and check expiry
  const payload = JSON.parse(Buffer.from(payloadBase64, 'base64url').toString());
  
  if (Date.now() > payload.expires_at) {
    return null; // Expired
  }
  
  return payload;
}
```

## Webhook Verification (CRITICAL)

### Raw Body Requirement

**⚠️ CRITICAL**: HMAC verification MUST use raw request body bytes before any JSON parsing.

**This is the #1 webhook implementation footgun.**

**⚠️ MIDDLEWARE WARNING**: Ensure no middleware or body parser reads/modifies the request body before HMAC verification. This includes logging middleware, JSON parsers, or any middleware that touches the request body. Even if your handler reads `req.arrayBuffer()`, some deployments can mutate bodies if middleware processes it first.

### Why Raw Body is Critical

- JSON parsing can change whitespace, key ordering, or encoding
- HMAC signature is computed on the exact bytes Shopify sent
- Any modification to the body before verification will cause signature mismatch

### Correct Implementation

```typescript
// Disable framework body parsing
export const config = {
  api: {
    bodyParser: false, // MUST disable
  },
};

export async function POST(request: Request) {
  // Step 1: Read raw body as Buffer (before any parsing)
  const rawBody = Buffer.from(await request.arrayBuffer());
  
  // Step 2: Get signature from header
  const signature = request.headers.get('X-Shopify-Hmac-SHA256');
  
  if (!signature) {
    return new Response('Missing signature', { status: 401 });
  }
  
  // Step 3: Compute HMAC on raw body
  const hmac = crypto
    .createHmac('sha256', SHOPIFY_WEBHOOK_SECRET)
    .update(rawBody) // Raw Buffer, NOT parsed JSON
    .digest('base64');
  
  // Step 4: Timing-safe comparison
  const isValid = crypto.timingSafeEqual(
    Buffer.from(hmac),
    Buffer.from(signature)
  );
  
  if (!isValid) {
    return new Response('Unauthorized', { status: 401 });
  }
  
  // Step 5: NOW parse JSON after verification
  const order = JSON.parse(rawBody.toString());
  
  // Step 6: Process webhook
  await handleOrderWebhook(order);
  
  return new Response('OK', { status: 200 });
}
```

### Common Mistakes to Avoid

```typescript
// ❌ WRONG: Parsing body before verification
const order = await request.json(); // Body is now parsed
const hmac = crypto.createHmac('sha256', secret).update(JSON.stringify(order)); // Will fail!

// ❌ WRONG: Using string instead of Buffer
const bodyString = await request.text();
const hmac = crypto.createHmac('sha256', secret).update(bodyString); // Encoding issues

// ✅ CORRECT: Raw Buffer before any parsing
const rawBody = Buffer.from(await request.arrayBuffer());
const hmac = crypto.createHmac('sha256', secret).update(rawBody);
```

## Idempotency Rules

### Database Schema

```sql
CREATE TABLE orders (
  id UUID PRIMARY KEY, -- Internal ID
  shopify_order_id VARCHAR(255) NOT NULL, -- Shopify order ID
  order_number VARCHAR(255) NOT NULL,
  line_items JSONB NOT NULL,
  shipping_address JSONB NOT NULL,
  total_price DECIMAL(10, 2) NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
  CONSTRAINT unique_shopify_order_id UNIQUE (shopify_order_id) -- Idempotency constraint
);
```

### Upsert Pattern

```typescript
async function handleOrderWebhook(webhook: ShopifyOrderWebhook): Promise<void> {
  const shopifyOrderId = webhook.id;
  
  try {
    await db.orders.upsert({
      where: { shopify_order_id: shopifyOrderId },
      update: { updated_at: new Date() },
      create: {
        shopify_order_id: webhook.id,
        order_number: webhook.order_number,
        line_items: webhook.line_items,
        shipping_address: webhook.shipping_address,
        total_price: webhook.total_price,
        created_at: new Date(),
        updated_at: new Date()
      }
    });
  } catch (error) {
    // Unique constraint violation = duplicate webhook
    if (isUniqueConstraintViolation(error)) {
      console.log(`Order ${shopifyOrderId} already processed (duplicate webhook)`);
      // Return 200 OK to prevent Shopify retries
      return;
    }
    throw error;
  }
}
```

### Database-Agnostic Error Detection

```typescript
function isUniqueConstraintViolation(error: any): boolean {
  return error.code === 'P2002' ||      // Prisma
         error.code === '23505' ||       // PostgreSQL
         error.code === 'ER_DUP_ENTRY' || // MySQL
         error.code === 'SQLITE_CONSTRAINT'; // SQLite
}
```

## Shopify Admin Settings Checklist

### Checkout Customization

**Navigate to**: Shopify Admin → Settings → Checkout

**Configure**:
- ✅ Upload logo (gothic-romantic aesthetic)
- ✅ Set primary color to muted gold (#8B7355) if Shopify permits
- ✅ Set background color to near-black (#1A1A1A) if Shopify permits
- ✅ Set typography to gothic font if Shopify permits
- ✅ Disable upsells if Shopify permits
- ✅ Disable countdown timers if Shopify permits
- ✅ Disable aggressive marketing opt-ins if Shopify permits

### Shipping Methods

**Navigate to**: Shopify Admin → Settings → Shipping

**Configure**:
- ✅ Create "Standard" shipping method (avoid "Fast shipping")
- ✅ Create "Express" shipping method (avoid "Rush delivery")
- ✅ Use calm descriptions (no urgency language)
- ✅ Disable delivery timeframes if Shopify permits
- ✅ Disable "Get it by [date]" messaging if Shopify permits

### Webhook Configuration

**Navigate to**: Shopify Admin → Settings → Notifications → Webhooks

**Configure**:
- ✅ Topic: `orders/create`
- ✅ URL: `https://yourdomain.com/api/webhooks/order-created`
- ✅ Format: JSON

### Thank-You Page Configuration

**Navigate to**: Shopify Admin → Settings → Checkout → Order status page

**Shopify Plus Plans** (thank-you page scripting available):
```javascript
<script>
  // Redirect to our confirmation page with order_id
  window.location.href = "{{ shop.url }}/threshold/confirmation?order_id={{ order.id }}";
</script>
```

**Non-Plus Plans** (limited or no scripting):
- Fallback to email-only confirmation
- Display generic success message
- Offer account-based order history access

## "Cannot Customize" Constraints

### Shopify Controls (Cannot Customize)

- ❌ Checkout UI layout and structure
- ❌ Form field rendering
- ❌ Validation error messages
- ❌ Payment field styling (PCI compliance)
- ❌ Address autocomplete behavior
- ❌ Shipping method selection UI
- ❌ Order summary presentation

### Accepted Shopify Defaults

We accept Shopify's defaults for:
- Checkout UI layout (Shopify-controlled)
- Form validation (Shopify-controlled)
- Payment processing (Shopify-controlled, PCI compliant)
- Address autocomplete (Shopify-controlled)

### Visual-System Conformance Constraints

**What We Can Apply**:
- Logo, colors (limited palette), typography (limited fonts)
- Shipping method names and descriptions
- Feature toggles (upsells, marketing opt-ins)

**What We Cannot Apply**:
- Spacing and density (Shopify-controlled)
- Typography hierarchy (limited customization)
- Interaction behaviors (Shopify-controlled)

## Shopify Plan Constraints

### Shopify Plus

**Thank-You Page Scripting**: ✅ Available
- Can pass order_id to our server
- Can generate signed token and redirect
- Full confirmation page experience

### Non-Plus Plans

**Thank-You Page Scripting**: ❌ Limited or unavailable
- Cannot reliably pass order identifier back
- Fallback strategies required

**Fallback Strategies**:
1. **Email-Only**: "Your order is confirmed. Check your email for order details."
2. **Webhook-Only**: Generic success page without order-specific details
3. **Account-Based**: "Sign in to Sanctuary to view your orders"

**Implementation**:
```typescript
// Confirmation page without token (Non-Plus fallback)
function ConfirmationPage() {
  return (
    <div>
      <p>Your acquisition is complete.</p>
      <p>Check your email for order details and confirmation.</p>
      <a href="/threshold">Return to Threshold</a>
    </div>
  );
}
```

## Data Flow Summary

```
Cart (Our App)
    ↓
Read cart.checkoutUrl
    ↓
Redirect to Shopify Checkout ⚠️ EXTERNAL
    ↓
[Shopify Handles Everything]
    ├── Address Collection
    ├── Shipping Method Selection
    ├── Payment Processing
    └── Order Creation
    ↓
Shopify Redirects Back (Order Complete)
    ↓
Generate Signed Token (Our Server)
    ↓
Confirmation Page: /threshold/confirmation?t={token}
    ↓
Verify Token → Try DB → Fallback to Admin API
    ↓
Display Confirmation (Visual-System Aesthetic)
```

## Error Handling

### Redirect Errors

**Missing checkoutUrl**:
- Display calm error: "Unable to proceed at this moment. Please try again shortly."
- Preserve cart state
- Log error for debugging

### Webhook Failures

**Webhook Not Received**:
- Confirmation page falls back to Shopify Admin API
- Fetches order using order_id from verified token
- Displays calm message: "We're preparing your confirmation. This can take a moment."
- Provides "Retry" button (manual action, no aggressive polling)

### Token Errors

**Invalid or Expired Token**:
- Display calm error: "Unable to display confirmation. Please check your email for order details."
- No technical details exposed
- Graceful degradation

## Implementation Checklist

- [ ] Implement redirect using cart.checkoutUrl (no checkoutCreate)
- [ ] Implement signed token generation (base64url, HMAC-SHA256, 1 hour expiry)
- [ ] Implement signed token verification (signature + expiry check)
- [ ] Implement webhook endpoint with raw body HMAC verification
- [ ] Implement idempotency with unique constraint on shopify_order_id
- [ ] Implement upsert pattern (insert or ignore on conflict)
- [ ] Return 200 OK for verified duplicates to prevent Shopify retries
- [ ] Implement confirmation page with token verification
- [ ] Implement fallback to Admin API (server-side, using order_id from token)
- [ ] Implement calm retry component (manual action, no aggressive polling)
- [ ] Configure Shopify checkout branding (logo, colors, typography)
- [ ] Configure Shopify shipping methods (calm names, no urgency)
- [ ] Configure Shopify webhook (orders/create topic)
- [ ] Configure Shopify thank-you page redirect (if Plus plan)
- [ ] Document plan constraints and fallback strategies
- [ ] Test complete checkout flow end-to-end
- [ ] Test webhook verification with raw body
- [ ] Test idempotency (duplicate webhooks)
- [ ] Test token verification (valid, invalid, expired)
- [ ] Test fallback to Admin API
- [ ] Test calm retry component

## Key Takeaways

1. **Use cart.checkoutUrl directly** - no checkoutCreate mutation needed
2. **Signed tokens are URL-safe** - base64url encoding, HMAC-SHA256 signature
3. **Raw body HMAC verification is critical** - #1 webhook implementation footgun
4. **No middleware can touch request body** - before HMAC verification
5. **Order ID format must be consistent** - REST numeric or GraphQL GID, use same format everywhere
6. **Idempotency uses unique constraint** - on shopify_order_id column, upsert pattern
7. **Return 200 OK for duplicates** - prevents Shopify retries
8. **Fallback is calm and manual** - no aggressive polling, user-initiated retry
9. **Plan constraints matter** - Plus vs Non-Plus affects thank-you page scripting
10. **Accept Shopify defaults** - focus customization on what Shopify permits

## Final Ship Checklist

Copy/paste this checklist before implementation:

- [ ] Cart redirect uses `cart.checkoutUrl` only (no checkoutCreate)
- [ ] Webhook route verifies HMAC on raw bytes before parsing
- [ ] Webhook route has no middleware that touches request body before verification
- [ ] Webhook stores minimal order summary + enforces `UNIQUE(shopify_order_id)`
- [ ] Webhook returns 200 OK on verified duplicates (unique constraint violation)
- [ ] Confirmation route requires signed token (base64url) + expiry check
- [ ] Token payload `order_id` format is consistent (REST numeric or GraphQL GID)
- [ ] Confirmation loads from DB first, then Admin API by `order_id` (server-side)
- [ ] Admin API fallback uses same `order_id` format as token payload
- [ ] If order data missing, render "preparing confirmation" + Retry button (no aggressive polling)
- [ ] CHECKOUT_OPTION_A.md documents Shopify constraints + how identifier is passed back
- [ ] Shopify Plus: Thank-you page redirect configured (if applicable)
- [ ] Non-Plus: Fallback strategy documented and implemented (if applicable)
- [ ] Visual-system conformance applied where Shopify permits
- [ ] Shipping methods use calm names (no urgency language)
- [ ] All tests pass (redirect, webhook, token, idempotency, fallback)
