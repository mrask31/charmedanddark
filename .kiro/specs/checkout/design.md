# Design Document: Checkout (Shopify-Hosted)

## Overview

The Checkout is the completion ritual experience in the Threshold realm of Charmed & Dark, implemented as a **Shopify-hosted checkout (Option A)**. When visitors have reviewed their curated collection in the cart, they are redirected to Shopify's secure checkout infrastructure to provide operationally required information (address, shipping method, payment) and finalize their acquisition.

**Implementation Decision: Shopify-Hosted Checkout**

Charmed & Dark does NOT implement custom checkout forms. Instead:
- **Shopify controls all checkout UI**: Address collection, shipping method selection, payment processing, order creation
- **Our application handles**: Cart → Shopify redirect (using cart.checkoutUrl), Shopify customization (where permitted), post-checkout confirmation with signed tokens
- **PCI compliance**: Handled entirely by Shopify
- **Payment processing**: Handled entirely by Shopify
- **Order creation**: Handled entirely by Shopify

This design explicitly conforms to the Visual System spec (.kiro/specs/visual-system/) within the constraints of Shopify's checkout customization capabilities. We apply visual-system principles where Shopify permits customization and accept Shopify's defaults where customization is not available.

**Core Design Principles:**
- **External Completion Ritual**: Checkout handled by Shopify's trusted infrastructure
- **Customization Where Permitted**: Apply visual-system styling within Shopify's constraints
- **Fulfillment Invisibility**: Configure Shopify settings to minimize urgency
- **Seamless Redirect**: Use cart.checkoutUrl directly (no checkoutCreate mutation)
- **Signed Token Security**: Short-lived HMAC tokens for confirmation (no correlation ID tracking)
- **Calm Fallback**: Gentle retry with manual action (no aggressive polling)

## Architecture

### System Structure

The Checkout integration is organized into three primary layers:

```
Checkout (Shopify-Hosted)
├── Redirect Layer (Our Application)
│   ├── Checkout URL Generation (Shopify Storefront API)
│   ├── Redirect Handler (Cart → Shopify)
│   └── Error Handling (Redirect failures)
├── Checkout Layer (Shopify-Controlled) ⚠️ EXTERNAL
│   ├── Address Collection (Shopify UI)
│   ├── Shipping Method Selection (Shopify UI)
│   ├── Payment Processing (Shopify UI)
│   └── Order Creation (Shopify backend)
├── Customization Layer (Our Configuration)
│   ├── Shopify Checkout Settings (branding, colors, typography)
│   ├── Shipping Method Configuration (calm names, no urgency)
│   └── Feature Toggles (disable upsells, urgency patterns)
└── Confirmation Layer (Our Application)
    ├── Order Confirmation Page (visual-system aesthetic)
    ├── Webhook Handler (Shopify order completion)
    └── Order Details Display (elegant presentation)
```

**Key Architectural Note:**
The Checkout Layer is **external and Shopify-controlled**. Our application does NOT render checkout forms, validate addresses, process payments, or create orders. All checkout UI and logic is delegated to Shopify.

### Data Flow

```
Cart (Our Application)
    ↓
Generate Shopify Checkout URL (Storefront API)
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
Order Confirmation Webhook (Shopify → Our App)
    ↓
Order Confirmation Page (Our Application)
```

## Components and Interfaces

### Redirect Layer (Our Application)

#### Checkout Redirect Handler

```typescript
interface CheckoutRedirectHandler {
  // Read checkoutUrl directly from cart object
  getCheckoutUrlFromCart(cart: Cart): string | null;
  
  // Redirect to Shopify checkout
  redirectToCheckout(checkoutUrl: string): void;
  
  // Handle redirect errors
  handleRedirectError(error: Error): void;
}

interface Cart {
  id: string;
  checkoutUrl: string; // Shopify provides this field directly
  lines: CartLine[];
  // ... other cart fields
}
```

**Implementation:**
```typescript
// Example: Redirect using cart's existing checkoutUrl
async function proceedToCheckout(cart: Cart): void {
  try {
    // Read checkoutUrl directly from cart object
    const checkoutUrl = cart.checkoutUrl;
    
    if (!checkoutUrl) {
      throw new Error('Checkout URL not available');
    }
    
    // Redirect to Shopify (external)
    window.location.href = checkoutUrl;
  } catch (error) {
    // Handle error gracefully, preserve cart
    showElegantError("Unable to proceed at this moment. Please try again shortly.");
  }
}
```

### Customization Layer (Our Configuration)

#### Shopify Checkout Customization

```typescript
interface ShopifyCheckoutCustomization {
  // Branding customization
  branding: {
    logo: string; // URL to logo
    primaryColor: string; // Muted gold (#8B7355) if Shopify permits
    backgroundColor: string; // Near-black (#1A1A1A) if Shopify permits
    typography: {
      fontFamily: string; // Gothic font if Shopify permits
    };
  };
  
  // Language customization
  language: {
    checkoutButtonText: string; // "Complete" instead of "Place order" (if customizable)
    shippingMethodLabels: Record<string, string>; // Calm method names
  };
  
  // Feature toggles
  features: {
    disableUpsells: boolean; // Disable if Shopify permits
    disableCountdownTimers: boolean; // Disable if Shopify permits
    disableShippingUrgency: boolean; // Disable if Shopify permits
    disableInventoryPressure: boolean; // Disable if Shopify permits
  };
  
  // Shipping method configuration
  shippingMethods: ShippingMethodConfig[];
}

interface ShippingMethodConfig {
  id: string;
  name: string; // "Standard" or "Express" (calm names)
  description?: string; // Optional calm description
  // NO delivery timeframes
  // NO urgency language
}
```

**Customization Constraints:**
- Shopify limits what can be customized in hosted checkout
- We apply visual-system principles where Shopify permits
- We accept Shopify's defaults where customization is not available
- We document what can and cannot be customized

### Confirmation Layer (Our Application)

#### Signed Token Security

```typescript
interface SignedTokenGenerator {
  // Generate signed token for confirmation page
  generateToken(orderId: string): string;
  
  // Verify token signature and expiry
  verifyToken(token: string): TokenPayload | null;
}

interface TokenPayload {
  order_id: string;
  issued_at: number; // Unix timestamp
  expires_at: number; // Unix timestamp
}

// Token generation
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

// Token verification
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
  
  // Parse payload
  const payload = JSON.parse(Buffer.from(payloadBase64, 'base64url').toString());
  
  // Check expiry
  if (Date.now() > payload.expires_at) {
    return null; // Expired
  }
  
  return payload;
}
```

#### Order Confirmation Page

```typescript
interface OrderConfirmationPage {
  order: Order;
  visualStyle: ConfirmationVisualStyle;
  
  // Rendering
  render(): ConfirmationElement;
  
  // Validation
  validateVisualSystem(): ValidationResult;
}

interface Order {
  id: string; // Shopify order ID
  orderNumber: string; // Human-readable order number
  lineItems: OrderLineItem[];
  shippingAddress: ShippingAddress;
  shippingMethod: string;
  subtotal: number;
  shippingCost: number;
  total: number;
  currency: string;
  createdAt: Date;
}

interface OrderLineItem {
  productId: string;
  variantId: string;
  title: string;
  variantTitle?: string;
  quantity: number;
  price: number;
  image: {
    url: string;
    alt: string;
  };
}

interface ConfirmationVisualStyle {
  backgroundColor: Color; // Black/near-black per visual-system
  messageColor: Color; // Near-black or charcoal
  orderNumberColor: Color; // Muted gold for emphasis
  linkColor: Color; // Muted gold
  hoverColor: Color; // Deep red
  spacing: {
    sectionGap: number; // Min 72px
    elementGap: number; // Min 18px
  };
  typography: {
    messageSize: number; // 24px (H3) or 20px (Body Large)
    orderNumberSize: number; // 20px (Body Large)
    detailSize: number; // 16px (Body)
  };
}

interface ConfirmationElement {
  messageElement: Element; // "Your acquisition is complete"
  orderNumberElement: Element; // "Order #XXXX" with muted gold
  summaryElement: Element; // Order summary (items, total)
  returnLink?: Element; // Subtle "Return to threshold" link
  retryButton?: Element; // "Retry" button if data not available
  // NO aggressive "Continue shopping" prompts
  // NO email signup prompts
  // NO marketing messaging
}
```

#### Webhook Handler

```typescript
interface OrderWebhookHandler {
  // Handle Shopify order creation webhook
  handleOrderCreated(webhookPayload: ShopifyOrderWebhook): Promise<void>;
  
  // **CRITICAL**: Verify webhook using raw request body
  verifyWebhook(rawBody: Buffer, signature: string): boolean;
  
  // Store order data
  storeOrder(order: Order): Promise<void>;
}

interface ShopifyOrderWebhook {
  id: string;
  order_number: string;
  line_items: ShopifyLineItem[];
  shipping_address: ShopifyAddress;
  total_price: string;
  // ... other Shopify order fields
}

// **CRITICAL**: HMAC verification with raw body
function verifyShopifyWebhook(rawBody: Buffer, signature: string, secret: string): boolean {
  // MUST use raw body bytes before any JSON parsing
  const hmac = crypto
    .createHmac('sha256', secret)
    .update(rawBody) // Raw Buffer, not parsed JSON
    .digest('base64');
  
  // Timing-safe comparison
  return crypto.timingSafeEqual(
    Buffer.from(hmac),
    Buffer.from(signature)
  );
}
```

## Data Models

### Checkout Redirect Model

```typescript
// No checkout redirect data needed - use cart.checkoutUrl directly
// No correlation ID tracking needed - use signed tokens
```

### Signed Token Model

```typescript
interface TokenPayload {
  order_id: string; // Shopify order ID
  issued_at: number; // Unix timestamp
  expires_at: number; // Unix timestamp (1 hour from issuance)
}

// Token format: {base64url_payload}.{base64url_signature}
// Example: eyJvcmRlcl9pZCI6IjEyMzQ1IiwiaXNzdWVkX2F0IjoxNzAwMDAwMDAwLCJleHBpcmVzX2F0IjoxNzAwMDAzNjAwfQ.a3b2c1d4e5f6g7h8i9j0
```

### Order Confirmation Model

```typescript
// Order confirmation data (from Shopify)
interface Order {
  id: string;
  orderNumber: string;
  lineItems: OrderLineItem[];
  shippingAddress: ShippingAddress;
  shippingMethod: string;
  subtotal: number;
  shippingCost: number;
  total: number;
  currency: string;
  createdAt: Date;
}

interface OrderLineItem {
  productId: string;
  variantId: string;
  title: string;
  variantTitle?: string;
  quantity: number;
  price: number;
  image: {
    url: string;
    alt: string;
  };
}

interface ShippingAddress {
  firstName: string;
  lastName: string;
  address1: string;
  address2?: string;
  city: string;
  province: string;
  country: string;
  postalCode: string;
}
```

## Shopify Checkout Customization Strategy

### What We Can Customize

**Branding (Shopify Checkout Settings):**
- Logo
- Primary color (attempt muted gold)
- Background color (attempt near-black)
- Typography (attempt gothic font)

**Language (Shopify Checkout Settings):**
- Button text (attempt "Complete" instead of "Place order")
- Field labels (limited customization)

**Shipping Methods (Shopify Shipping Settings):**
- Method names ("Standard", "Express" - calm names)
- Method descriptions (calm, no urgency)

**Feature Toggles (Shopify Settings):**
- Disable upsells (if available)
- Disable marketing opt-ins (if available)

### What We Cannot Customize

**Shopify Controls:**
- Checkout UI layout and structure
- Form field rendering
- Validation error messages
- Payment field styling
- Address autocomplete behavior
- Shipping method selection UI
- Order summary presentation

**Our Approach:**
- Accept Shopify's defaults where customization is not available
- Focus customization efforts on what Shopify permits
- Document customization constraints
- Treat Shopify checkout as authoritative

### Customization Implementation

**Step 1: Configure Shopify Checkout Settings**
- Navigate to Shopify Admin → Settings → Checkout
- Apply branding (logo, colors, typography)
- Configure language (button text, labels)
- Disable aggressive features (upsells, marketing)

**Step 2: Configure Shipping Methods**
- Navigate to Shopify Admin → Settings → Shipping
- Create shipping methods with calm names
- Avoid urgency language in method titles and descriptions

**Step 3: Test Checkout Experience**
- Complete test orders
- Verify visual-system alignment (where customizable)
- Document what could and could not be customized

**Step 4: Accept Constraints**
- Accept Shopify's checkout UI where customization is limited
- Focus on what we control: redirect experience and confirmation page

## Order Confirmation Page Strategy

### Confirmation Page Layout

**Desktop Layout:**
```
┌─────────────────────────────────────────────────────────────┐
│                                                             │
│              Your acquisition is complete                   │
│                                                             │
│              Order #12345                                   │
│                                                             │
│  ┌───────────────────────────────────────────────────────┐ │
│  │  Order Summary                                        │ │
│  │                                                       │ │
│  │  [Image] Product Title × 2          $XX.XX          │ │
│  │  [Image] Product Title × 1          $XX.XX          │ │
│  │                                                       │ │
│  │  Subtotal                            $XXX.XX         │ │
│  │  Shipping                            $XX.XX          │ │
│  │  Total                               $XXX.XX         │ │
│  └───────────────────────────────────────────────────────┘ │
│                                                             │
│              [Return to threshold]                          │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### Confirmation Page Elements

**Confirmation Message:**
- Text: "Your acquisition is complete" or "Order confirmed"
- Typography: 24px (H3) or 20px (Body Large)
- Color: Near-black or ink
- Spacing: 72px from top

**Order Number:**
- Text: "Order #XXXX"
- Typography: 20px (Body Large)
- Color: Muted gold (emphasis)
- Spacing: 24px below message

**Order Summary:**
- Line items with imagery, titles, quantities, prices
- Subtotal, shipping, total
- Total emphasized with muted gold
- Spacing: 72px below order number

**Return Link:**
- Text: "Return to threshold" or "← Discovery"
- Typography: 16px (Body)
- Color: Muted gold, deep red on hover
- Spacing: 72px below summary

**Exclusions:**
- NO aggressive "Continue shopping" buttons
- NO email signup prompts
- NO marketing messaging
- NO upsells or cross-sells

## Error Handling

### Redirect Errors

**Checkout URL Generation Failure:**
```typescript
try {
  const checkoutUrl = await generateCheckoutUrl(cartId);
  window.location.href = checkoutUrl;
} catch (error) {
  // Display elegant error
  showElegantError("Unable to proceed at this moment. Please try again shortly.");
  // Log error for debugging
  console.error("Checkout redirect failed:", error);
}
```

**Error Message Styling:**
- Calm language, no technical details
- Subtle color indication (muted red or charcoal)
- Invitation to try again or return to cart

### Abandoned Checkout Handling

**Visitor Returns Without Completing:**
- Preserve cart state
- No aggressive "Complete your order!" messaging
- Subtle invitation to proceed when ready

### Webhook Failures

**Order Confirmation Webhook Fails:**
- Implement fallback: poll Shopify for order status
- Display confirmation once order is confirmed
- Log webhook failures for debugging

## Responsive Behavior

### Confirmation Page Responsive Layout

**Mobile (≤768px):**
- Single-column layout
- Stacked elements
- Maintain 18px minimum spacing
- Maintain visual-system aesthetic

**Tablet (769px-1024px):**
- Single-column layout
- Generous spacing
- Maintain visual-system aesthetic

**Desktop (≥1025px):**
- Centered layout
- Maximum width for readability
- Generous spacing (72px between sections)
- Maintain visual-system aesthetic

## Implementation Notes

### Shopify Checkout URL from Cart

**Using cart.checkoutUrl directly:**
```typescript
// Query cart from Storefront API
const cart = await shopify.cart.get(cartId);

// Read checkoutUrl field directly
const checkoutUrl = cart.checkoutUrl;

if (!checkoutUrl) {
  // Handle missing URL gracefully
  showElegantError("Unable to proceed at this moment. Please try again shortly.");
  return;
}

// Redirect
window.location.href = checkoutUrl;
```

**No checkoutCreate mutation needed** - Shopify provides checkoutUrl in the cart object.

### Webhook Configuration

**Shopify Webhook Setup:**
- Topic: `orders/create`
- URL: `https://yourdomain.com/api/webhooks/order-created`
- Format: JSON

**Webhook Verification (CRITICAL - Raw Body):**
```typescript
// **CRITICAL**: Use raw request body before any JSON parsing
// This is the #1 webhook implementation footgun

// Example with Next.js App Router
export const config = {
  api: {
    bodyParser: false, // MUST disable body parsing
  },
};

export async function POST(request: Request) {
  // Read raw body as Buffer
  const rawBody = Buffer.from(await request.arrayBuffer());
  const signature = request.headers.get('X-Shopify-Hmac-SHA256');
  
  if (!signature) {
    return new Response('Missing signature', { status: 401 });
  }
  
  // Verify HMAC with raw body
  const hmac = crypto
    .createHmac('sha256', SHOPIFY_WEBHOOK_SECRET)
    .update(rawBody) // Raw Buffer, NOT parsed JSON
    .digest('base64');
  
  // Timing-safe comparison
  const isValid = crypto.timingSafeEqual(
    Buffer.from(hmac),
    Buffer.from(signature)
  );
  
  if (!isValid) {
    return new Response('Invalid signature', { status: 401 });
  }
  
  // NOW parse JSON after verification
  const order = JSON.parse(rawBody.toString());
  
  // Process webhook
  await handleOrderWebhook(order);
  
  return new Response('OK', { status: 200 });
}
```

### Order Confirmation Retrieval

**Confirmation Page with Signed Token:**
```typescript
// Route: /threshold/confirmation?t={signed_token}

async function ConfirmationPage({ searchParams }: { searchParams: { t: string } }) {
  const token = searchParams.t;
  
  // Verify token
  const payload = verifyConfirmationToken(token, APP_SECRET);
  
  if (!payload) {
    return <CalmError message="Unable to display confirmation. Please check your email for order details." />;
  }
  
  // Try database first (webhook data)
  let order = await db.orders.findUnique({
    where: { id: payload.order_id }
  });
  
  // Fallback to Shopify Admin API if not in database
  if (!order) {
    order = await shopify.order.get(payload.order_id);
    
    if (!order) {
      return <CalmRetry message="We're preparing your confirmation. This can take a moment." />;
    }
    
    // Optionally store in database
    await db.orders.create({ data: order });
  }
  
  return <FullConfirmation order={order} />;
}
```

**Calm Retry Component:**
```typescript
function CalmRetry({ message }: { message: string }) {
  return (
    <div>
      <p>{message}</p>
      <button onClick={() => window.location.reload()}>Retry</button>
      <a href="/threshold">Back to Threshold</a>
      {/* Optional: single gentle auto-refresh after 5-8 seconds */}
    </div>
  );
}
```

## Testing Strategy

### Redirect Testing

**Test Cases:**
- Successful redirect to Shopify checkout
- Redirect error handling (invalid cart ID, network failure)
- Redirect from different devices (mobile, tablet, desktop)

### Customization Testing

**Test Cases:**
- Verify Shopify checkout branding applied
- Verify shipping method names are calm
- Verify aggressive features disabled (where possible)
- Document customization constraints

### Confirmation Page Testing

**Test Cases:**
- Order confirmation page renders correctly
- Order details display accurately
- Visual-system conformance maintained
- Responsive behavior across viewports

### Webhook Testing

**Test Cases:**
- Webhook receives order creation events
- Webhook verification succeeds
- Order data stored correctly
- Fallback retrieval works if webhook fails

## Signed Token Confirmation Strategy

### Token Generation and Verification

**Purpose:**
Provide secure, self-contained authorization for order confirmation pages without complex database tracking.

**Token Structure:**
```
{base64url_payload}.{base64url_signature}
```

**Payload:**
```json
{
  "order_id": "gid://shopify/Order/123456",
  "issued_at": 1700000000,
  "expires_at": 1700003600
}
```

**Token Generation:**
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

**Token Verification:**
```typescript
function verifyConfirmationToken(token: string, secret: string): TokenPayload | null {
  try {
    const [payloadBase64, signature] = token.split('.');
    
    if (!payloadBase64 || !signature) {
      return null;
    }
    
    // Verify signature
    const expectedSignature = crypto
      .createHmac('sha256', secret)
      .update(payloadBase64)
      .digest('base64url');
    
    if (signature !== expectedSignature) {
      return null; // Invalid signature
    }
    
    // Parse payload
    const payload = JSON.parse(Buffer.from(payloadBase64, 'base64url').toString());
    
    // Check expiry
    if (Date.now() > payload.expires_at) {
      return null; // Expired
    }
    
    return payload;
  } catch (error) {
    return null; // Invalid token format
  }
}
```

### Shopify Thank-You Page Configuration

**Configure Shopify to redirect to confirmation page:**

**Option 1: Shopify Plus (Thank-You Page Scripting Available)**
1. Navigate to Shopify Admin → Settings → Checkout
2. Find "Order status page" → "Additional scripts"
3. Add redirect script:

```javascript
<script>
  // Redirect to our confirmation page with order_id
  // Our server will generate signed token and redirect
  window.location.href = "{{ shop.url }}/threshold/confirmation?order_id={{ order.id }}";
</script>
```

**Server-side token generation endpoint:**
```typescript
// Route: /threshold/confirmation (with order_id query param)
export async function GET(request: Request) {
  const url = new URL(request.url);
  const orderId = url.searchParams.get('order_id');
  
  if (!orderId) {
    return Response.redirect('/threshold');
  }
  
  // Generate signed token
  const token = generateConfirmationToken(orderId, APP_SECRET);
  
  // Redirect to confirmation page with token
  return Response.redirect(`/threshold/confirmation?t=${token}`);
}
```

**Option 2: Non-Plus Plans (Thank-You Page Scripting NOT Available)**

If you cannot reliably pass an order identifier back from Shopify (plan limitations), the confirmation page strategy changes:

**Fallback Strategies:**
1. **Email-Only Confirmation**: Display message: "Your order is confirmed. Check your email for order details."
2. **Webhook-Only Display**: After webhook arrives, show generic success page without order-specific details
3. **Account-Based Access**: "Sign in to Sanctuary to view your orders" (if you have customer accounts and can associate orders)

**Implementation for Non-Plus Plans:**
```typescript
// Confirmation page without token (webhook-only)
async function ConfirmationPage() {
  return (
    <div>
      <p>Your acquisition is complete.</p>
      <p>Check your email for order details and confirmation.</p>
      <a href="/threshold">Return to Threshold</a>
    </div>
  );
}
```

**Document Plan Constraints:**
- Shopify Plus: Full thank-you page scripting available (can pass order_id)
- Non-Plus: Limited or no thank-you page scripting (fallback to email/account-based confirmation)
- Webhook still processes and stores order data regardless of plan
- Confirmation page experience degrades gracefully based on plan capabilities

## Webhook Security and Idempotency

### HMAC Verification with Raw Body (CRITICAL)

**The #1 Webhook Implementation Footgun:**

HMAC verification MUST use the raw request body bytes before any JSON parsing. This is the most common mistake in webhook implementations.

**Why Raw Body is Critical:**
- JSON parsing can change whitespace, key ordering, or encoding
- HMAC signature is computed on the exact bytes Shopify sent
- Any modification to the body before verification will cause signature mismatch

**Correct Implementation:**
```typescript
// Next.js App Router example
export const config = {
  api: {
    bodyParser: false, // MUST disable automatic body parsing
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
    console.error('Invalid webhook signature');
    return new Response('Unauthorized', { status: 401 });
  }
  
  // Step 5: NOW parse JSON after verification
  const order = JSON.parse(rawBody.toString());
  
  // Step 6: Process webhook
  await handleOrderWebhook(order);
  
  return new Response('OK', { status: 200 });
}
```

**Common Mistakes to Avoid:**
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

### Idempotency Implementation

**Database Schema with Unique Constraint:**
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
  CONSTRAINT unique_shopify_order_id UNIQUE (shopify_order_id) -- Enforce idempotency at DB level
);
```

**Prevent Duplicate Processing with Upsert:**
```typescript
async function handleOrderWebhook(webhook: ShopifyOrderWebhook): Promise<void> {
  const shopifyOrderId = webhook.id;
  
  // Use upsert (insert or ignore on conflict) for idempotency
  // Database unique constraint on shopify_order_id prevents duplicates
  try {
    await db.orders.upsert({
      where: { shopify_order_id: shopifyOrderId },
      update: {
        // Update if exists (webhook retry with same data)
        updated_at: new Date()
      },
      create: {
        // Create if doesn't exist
        shopify_order_id: webhook.id,
        order_number: webhook.order_number,
        line_items: webhook.line_items,
        shipping_address: webhook.shipping_address,
        total_price: webhook.total_price,
        created_at: new Date(),
        updated_at: new Date()
      }
    });
    
    console.log(`Order ${shopifyOrderId} processed successfully`);
  } catch (error) {
    // Unique constraint violation means duplicate - this is OK
    // Check for unique constraint error (database-specific error code)
    if (isUniqueConstraintViolation(error)) {
      console.log(`Order ${shopifyOrderId} already processed (duplicate webhook), skipping`);
      // Return success (200 OK) to prevent Shopify retries
      return; // Idempotent - return success (200 OK)
    }
    
    // Other errors should be thrown
    throw error;
  }
}

// Helper function to detect unique constraint violations (database-agnostic)
function isUniqueConstraintViolation(error: any): boolean {
  // Prisma: error.code === 'P2002'
  // PostgreSQL: error.code === '23505'
  // MySQL: error.code === 'ER_DUP_ENTRY'
  // SQLite: error.code === 'SQLITE_CONSTRAINT'
  return error.code === 'P2002' || 
         error.code === '23505' || 
         error.code === 'ER_DUP_ENTRY' ||
         error.code === 'SQLITE_CONSTRAINT';
}
```

### Webhook Logging

**Log All Webhook Events:**
```typescript
interface WebhookLog {
  id: string;
  event_type: string; // 'orders/create'
  order_id: string;
  verification_status: 'success' | 'failed';
  processing_status: 'success' | 'failed';
  error_message?: string;
  created_at: Date;
}

async function logWebhookEvent(log: WebhookLog): Promise<void> {
  await db.webhookLogs.create({ data: log });
}

// Usage
await logWebhookEvent({
  id: crypto.randomUUID(),
  event_type: 'orders/create',
  order_id: webhook.id,
  verification_status: 'success',
  processing_status: 'success',
  created_at: new Date()
});
```

### Webhook Retry Handling

**Return Appropriate Status Codes:**
```typescript
export async function POST(request: Request) {
  try {
    // Verify webhook
    const payload = await request.text();
    const signature = request.headers.get('X-Shopify-Hmac-SHA256');
    
    if (!signature || !verifyShopifyWebhook(payload, signature, SHOPIFY_WEBHOOK_SECRET)) {
      return new Response('Unauthorized', { status: 401 });
    }
    
    // Process webhook
    const order = JSON.parse(payload);
    await handleOrderWebhook(order);
    
    // Return 200 OK only after successful processing
    return new Response('OK', { status: 200 });
  } catch (error) {
    console.error('Webhook processing failed:', error);
    
    // Return 500 error - Shopify will retry
    return new Response('Internal Server Error', { status: 500 });
  }
}
```

## Confirmation Page Data Strategy

### Server-Side Data Retrieval with Calm Fallback

**Confirmation Page Data Flow:**
```
Visitor → /threshold/confirmation?t={signed_token}
    ↓
Server-side: Verify token signature and expiry
    ↓
Server-side: Query database for order (webhook data)
    ↓
If found: Display full confirmation
If not found: Fall back to Shopify Admin API
    ↓
If API fails: Display calm message + retry button
```

**Server-Side Data Fetching:**
```typescript
// Server component (Next.js App Router)
async function ConfirmationPage({ searchParams }: { searchParams: { t: string } }) {
  const token = searchParams.t;
  
  // Verify token
  const payload = verifyConfirmationToken(token, APP_SECRET);
  
  if (!payload) {
    return <CalmError message="Unable to display confirmation. Please check your email for order details." />;
  }
  
  // Try database first (webhook data)
  let order = await db.orders.findUnique({
    where: { id: payload.order_id },
    include: { lineItems: true }
  });
  
  // Fallback to Shopify Admin API if not in database
  if (!order) {
    try {
      order = await shopify.order.get(payload.order_id);
      
      // Optionally store in database for future requests
      await db.orders.create({ data: transformShopifyOrder(order) });
    } catch (error) {
      // API failed - show calm retry
      return <CalmRetry />;
    }
  }
  
  return <FullConfirmation order={order} />;
}
```

**Calm Retry Component (No Aggressive Polling):**
```typescript
'use client';

function CalmRetry() {
  const [autoRefreshed, setAutoRefreshed] = useState(false);
  
  // Optional: single gentle auto-refresh after 5-8 seconds
  useEffect(() => {
    if (!autoRefreshed) {
      const timer = setTimeout(() => {
        setAutoRefreshed(true);
        window.location.reload();
      }, 6000); // 6 seconds
      
      return () => clearTimeout(timer);
    }
  }, [autoRefreshed]);
  
  return (
    <div>
      <p>We're preparing your confirmation. This can take a moment.</p>
      <button onClick={() => window.location.reload()}>Retry</button>
      <a href="/threshold">Back to Threshold</a>
      {/* No aggressive 10-attempt polling loop */}
      {/* No automatic retries without user action (except optional single refresh) */}
    </div>
  );
}
```atus
  });
}
```

### Fallback Order Retrieval

**If Webhook Fails:**
```typescript
async function fallbackOrderRetrieval(correlationId: string): Promise<void> {
  const session = await getCheckoutSession(correlationId);
  
  if (!session || session.order_id) {
    return; // Already processed or not found
  }
  
  // Query Shopify for order using checkout_id
  const order = await shopify.order.list({
    checkout_id: session.checkout_id,
    limit: 1
  });
  
  if (order.length > 0) {
    // Store order data
    await db.checkoutSessions.update({
      where: { correlation_id: correlationId },
      data: {
        order_id: order[0].id,
        order_number: order[0].order_number,
        status: 'completed',
        updated_at: new Date()
      }
    });
  }
}
```

## Shopify Customization Limits Documentation

### Customization Capabilities Matrix

**What Can Be Customized:**

| Element | Customization Available | Implementation |
|---------|------------------------|----------------|
| Logo | Yes | Shopify Admin → Settings → Checkout → Logo |
| Primary Color | Yes (limited palette) | Shopify Admin → Settings → Checkout → Colors |
| Background Color | Yes (limited palette) | Shopify Admin → Settings → Checkout → Colors |
| Typography | Yes (limited fonts) | Shopify Admin → Settings → Checkout → Typography |
| Button Text | Partial (some buttons) | Shopify Admin → Settings → Checkout → Language |
| Shipping Method Names | Yes | Shopify Admin → Settings → Shipping → Method names |
| Upsell Toggles | Yes | Shopify Admin → Settings → Checkout → Features |
| Marketing Opt-ins | Yes | Shopify Admin → Settings → Checkout → Features |

**What Cannot Be Customized:**

| Element | Shopify Controls | Our Approach |
|---------|-----------------|--------------|
| Checkout UI Layout | Shopify-controlled | Accept default |
| Form Field Rendering | Shopify-controlled | Accept default |
| Validation Error Messages | Shopify-controlled | Accept default |
| Payment Field Styling | Shopify-controlled (PCI) | Accept default |
| Address Autocomplete | Shopify-controlled | Accept default |
| Shipping Method Selection UI | Shopify-controlled | Accept default |
| Order Summary Presentation | Shopify-controlled | Accept default |
| Delivery Timeframes | Shopify-controlled | Accept default |

### Implementation Documentation

**Customization Steps:**
1. Navigate to Shopify Admin → Settings → Checkout
2. Upload logo (gothic-romantic aesthetic)
3. Set primary color to muted gold (#8B7355) if palette permits
4. Set background color to near-black (#1A1A1A) if palette permits
5. Select gothic font if available in typography options
6. Customize button text where permitted (e.g., "Complete" instead of "Place order")
7. Disable upsells and aggressive marketing opt-ins
8. Configure shipping method names (Settings → Shipping)

**Testing Customization:**
1. Complete test order in Shopify checkout
2. Verify branding applied (logo, colors, typography)
3. Verify shipping method names are calm
4. Document what could and could not be customized
5. Accept Shopify defaults where customization unavailable

**Accepted Shopify Defaults:**
- Checkout UI layout and structure
- Form field rendering and validation
- Payment field styling (PCI compliance)
- Address autocomplete behavior
- Shipping method selection UI
- Order summary presentation
- Delivery timeframes (if cannot be disabled)

## Confirmation Page Security

### Signed Token Authorization

**Cryptographically Secure Token Generation:**
```typescript
import crypto from 'crypto';

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

// Example token: eyJvcmRlcl9pZCI6IjEyMzQ1IiwiaXNzdWVkX2F0IjoxNzAwMDAwMDAwLCJleHBpcmVzX2F0IjoxNzAwMDAzNjAwfQ.a3b2c1d4e5f6g7h8i9j0
```

**Why Signed Tokens:**
- Self-contained authorization (no database lookup needed for auth)
- Non-guessable (HMAC signature prevents tampering)
- Short-lived (1 hour expiry limits exposure)
- Minimal server-side state (no correlation ID tracking)

### Confirmation Page Access Control

**Route Handler with Token Verification:**
```typescript
// Route: /threshold/confirmation?t={signed_token}
async function ConfirmationPage({ searchParams }: { searchParams: { t: string } }) {
  const token = searchParams.t;
  
  // Verify token signature and expiry
  const payload = verifyConfirmationToken(token, APP_SECRET);
  
  if (!payload) {
    return <CalmError message="Unable to display confirmation. Please check your email for order details." />;
  }
  
  // Token is valid - proceed with order retrieval
  // ...
}
```

**Rate Limiting:**
```typescript
import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';

const ratelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(10, '1 m'), // 10 requests per minute
});

export async function GET(request: Request) {
  const ip = request.headers.get('x-forwarded-for') || 'unknown';
  const { success } = await ratelimit.limit(ip);
  
  if (!success) {
    return new Response('Too many requests', { status: 429 });
  }
  
  // Continue with confirmation page logic
}
```

### PII Protection

**No PII in URLs:**
```typescript
// GOOD: Signed token (no PII)
/threshold/confirmation?t=eyJvcmRlcl9pZCI6IjEyMzQ1IiwiaXNzdWVkX2F0IjoxNzAwMDAwMDAwLCJleHBpcmVzX2F0IjoxNzAwMDAzNjAwfQ.a3b2c1d4e5f6g7h8i9j0

// BAD: Exposes customer info
/confirmation/john-doe-12345
/confirmation/order-12345?email=john@example.com
```

**No PII in Client-Side Code:**
```typescript
// Server component (safe)
async function ConfirmationPage({ searchParams }: { searchParams: { t: string } }) {
  const payload = verifyConfirmationToken(searchParams.t, APP_SECRET);
  const order = await getOrderDetails(payload.order_id);
  
  // Render order details server-side
  return (
    <div>
      <p>Order #{order.order_number}</p>
      <p>Shipping to: {order.shipping_address.city}, {order.shipping_address.province}</p>
      {/* Full address rendered server-side, not exposed to client */}
    </div>
  );
}
```

**Server-Side Data Retrieval Only:**
```typescript
// All PII retrieved server-side
async function getOrderDetails(orderId: string): Promise<OrderDetails> {
  return await db.orders.findUnique({
    where: { id: orderId },
    include: {
      lineItems: true,
      shippingAddress: true // PII retrieved server-side only
    }
  });
}

// NO client-side API calls that expose PII
// NO Shopify API credentials in client code
```

### Associate Order with Customer Account

**Link Orders to Authenticated Customers:**
```typescript
// If visitor is authenticated, link order to account
async function handleOrderWebhook(webhook: ShopifyOrderWebhook): Promise<void> {
  const customerId = webhook.customer?.id;
  
  await db.orders.create({
    data: {
      id: webhook.id,
      order_number: webhook.order_number,
      customer_id: customerId, // Link to customer account
      line_items: webhook.line_items,
      // ... other fields
    }
  });
  
  // Customer can access order via account order history
  // Guest checkout orders accessible via signed token only
}
```

## Documentation Requirements

### CHECKOUT_OPTION_A.md Deliverable

**Create comprehensive documentation file including:**
- Redirect approach (using cart.checkoutUrl directly)
- Confirmation route with signed token approach
- Webhook verification with raw body emphasis
- Idempotency rules
- Shopify Admin settings checklist
- "Cannot customize" constraints

### Customization Documentation

**Document:**
- What Shopify checkout settings were configured
- What could be customized (branding, colors, language)
- What could not be customized (UI layout, form fields, validation)
- Rationale for each customization decision

### Integration Documentation

**Document:**
- How checkout redirect works (cart.checkoutUrl)
- How signed token confirmation works
- How webhook integration works (raw body HMAC)
- How order confirmation retrieval works (DB first, API fallback)
- Error handling strategies (calm retry)

### Constraints Documentation

**Document:**
- Shopify checkout limitations
- Visual-system conformance constraints
- Fulfillment invisibility constraints
- Accepted Shopify defaults

### Security Documentation

**Document:**
- Signed token generation strategy
- Webhook HMAC verification implementation (raw body emphasis)
- Rate limiting configuration
- PII protection measures
- Confirmation page access control
