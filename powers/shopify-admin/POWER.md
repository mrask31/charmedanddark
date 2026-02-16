---
name: "shopify-admin"
displayName: "Shopify Admin API"
description: "Manage products, inventory, and orders through Shopify Admin GraphQL API for headless commerce. Sync catalog data to Supabase and handle order webhooks from Stripe checkout."
keywords: ["shopify", "admin", "graphql", "products", "inventory", "orders", "webhooks", "headless"]
author: "Charmed & Dark"
---

# Shopify Admin API

## Overview

This power provides comprehensive guidance for integrating Shopify Admin API into headless commerce applications. It covers product and inventory management via GraphQL, order creation through webhooks, and secure webhook verification.

**Key capabilities:**
- Query products and variants from Shopify Admin GraphQL API
- Sync catalog data from Shopify to Supabase database
- Handle Shopify order webhooks triggered by Stripe payments
- Verify webhook authenticity with HMAC signatures
- Manage environment variables for secure API access

**Use case:** Building custom storefronts on Vercel/Next.js while using Shopify as the backend for product management and order fulfillment.

## Onboarding

### Prerequisites

- Shopify store with Admin API access
- Shopify Admin API access token (custom app or private app)
- Node.js 18+ environment
- Next.js 13+ (App Router) for webhook handling
- Supabase database for catalog storage

### Installation

This power documents API integration patterns - no package installation required. You'll use native `fetch` for API calls.

**Required environment variables:**

```bash
# Shopify Admin API
SHOPIFY_ADMIN_ACCESS_TOKEN=shpat_xxxxxxxxxxxxx
NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN=your-store.myshopify.com

# Shopify Webhooks
SHOPIFY_WEBHOOK_SECRET=your_webhook_secret_from_shopify

# Supabase (for catalog sync)
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

### Getting Your Shopify Credentials

#### 1. Create a Custom App

1. Go to your Shopify Admin: `https://your-store.myshopify.com/admin`
2. Navigate to **Settings** → **Apps and sales channels**
3. Click **Develop apps** → **Create an app**
4. Name it (e.g., "Headless Storefront")
5. Click **Configure Admin API scopes**

#### 2. Configure API Scopes

Select these scopes for product and order management:

**Products & Inventory:**
- `read_products` - Read product data
- `write_products` - Update inventory (optional)
- `read_product_listings` - Read published products

**Orders:**
- `read_orders` - Read order data
- `write_orders` - Create orders via API

#### 3. Install App & Get Access Token

1. Click **Install app**
2. Reveal and copy the **Admin API access token** (starts with `shpat_`)
3. Save this as `SHOPIFY_ADMIN_ACCESS_TOKEN` in your `.env.local`

#### 4. Get Store Domain

Your store domain is: `your-store.myshopify.com` (not your custom domain)

Save as `NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN`

### Webhook Configuration

#### 1. Create Webhook in Shopify

1. Go to **Settings** → **Notifications**
2. Scroll to **Webhooks** section
3. Click **Create webhook**
4. Configure:
   - **Event:** `Order creation`
   - **Format:** `JSON`
   - **URL:** `https://your-domain.vercel.app/api/webhooks/orders-create`
   - **API version:** `2024-01` (or latest)

#### 2. Get Webhook Secret

After creating the webhook, Shopify generates a signing secret. Copy this value and save as `SHOPIFY_WEBHOOK_SECRET`.

**CRITICAL:** This secret is used for HMAC verification to ensure webhooks are authentic.

## Common Workflows

### Workflow 1: Query Products from Shopify

**Goal:** Fetch product catalog from Shopify Admin GraphQL API

**GraphQL Query:**

```graphql
query GetProducts($first: Int!, $after: String) {
  products(first: $first, after: $after) {
    edges {
      cursor
      node {
        id
        title
        handle
        description
        status
        totalInventory
        priceRangeV2 {
          minVariantPrice {
            amount
            currencyCode
          }
        }
        images(first: 10) {
          edges {
            node {
              url
              altText
            }
          }
        }
        variants(first: 100) {
          edges {
            node {
              id
              title
              price
              inventoryQuantity
              sku
              image {
                url
              }
            }
          }
        }
      }
    }
    pageInfo {
      hasNextPage
      endCursor
    }
  }
}
```

**Implementation:**

```typescript
// lib/shopify/admin-graphql.ts
interface ShopifyGraphQLResponse<T> {
  data?: T;
  errors?: Array<{ message: string }>;
}

export async function queryShopifyAdmin<T>(
  query: string,
  variables?: Record<string, any>
): Promise<T> {
  const adminToken = process.env.SHOPIFY_ADMIN_ACCESS_TOKEN;
  const storeDomain = process.env.NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN;

  if (!adminToken || !storeDomain) {
    throw new Error('Missing Shopify Admin API credentials');
  }

  const response = await fetch(
    `https://${storeDomain}/admin/api/2024-01/graphql.json`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Shopify-Access-Token': adminToken,
      },
      body: JSON.stringify({ query, variables }),
    }
  );

  if (!response.ok) {
    throw new Error(`Shopify API error: ${response.status}`);
  }

  const result: ShopifyGraphQLResponse<T> = await response.json();

  if (result.errors) {
    throw new Error(`GraphQL errors: ${JSON.stringify(result.errors)}`);
  }

  if (!result.data) {
    throw new Error('No data returned from Shopify');
  }

  return result.data;
}
```

**Usage:**

```typescript
const GET_PRODUCTS_QUERY = `
  query GetProducts($first: Int!, $after: String) {
    products(first: $first, after: $after) {
      edges {
        node {
          id
          title
          handle
          variants(first: 100) {
            edges {
              node {
                id
                price
                inventoryQuantity
              }
            }
          }
        }
      }
      pageInfo {
        hasNextPage
        endCursor
      }
    }
  }
`;

const data = await queryShopifyAdmin(GET_PRODUCTS_QUERY, {
  first: 50,
  after: null
});
```

### Workflow 2: Sync Products to Supabase

**Goal:** Fetch products from Shopify and store in Supabase for fast querying

**Steps:**

1. Query products from Shopify (paginated)
2. Transform Shopify data to your schema
3. Upsert into Supabase

**Implementation:**

```typescript
// scripts/sync-shopify-products.ts
import { createClient } from '@supabase/supabase-js';
import { queryShopifyAdmin } from '../lib/shopify/admin-graphql';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function syncProducts() {
  let hasNextPage = true;
  let cursor: string | null = null;
  let totalSynced = 0;

  while (hasNextPage) {
    const data = await queryShopifyAdmin<{
      products: {
        edges: Array<{ node: any; cursor: string }>;
        pageInfo: { hasNextPage: boolean; endCursor: string };
      };
    }>(GET_PRODUCTS_QUERY, {
      first: 50,
      after: cursor
    });

    const products = data.products.edges.map(edge => ({
      shopify_id: edge.node.id,
      title: edge.node.title,
      handle: edge.node.handle,
      description: edge.node.description,
      status: edge.node.status,
      total_inventory: edge.node.totalInventory,
      price: edge.node.priceRangeV2.minVariantPrice.amount,
      currency: edge.node.priceRangeV2.minVariantPrice.currencyCode,
      images: edge.node.images.edges.map((img: any) => img.node.url),
      variants: edge.node.variants.edges.map((v: any) => ({
        shopify_id: v.node.id,
        title: v.node.title,
        price: v.node.price,
        inventory_quantity: v.node.inventoryQuantity,
        sku: v.node.sku
      })),
      synced_at: new Date().toISOString()
    }));

    // Upsert to Supabase
    const { error } = await supabase
      .from('products')
      .upsert(products, { onConflict: 'shopify_id' });

    if (error) {
      console.error('Supabase upsert error:', error);
      throw error;
    }

    totalSynced += products.length;
    console.log(`Synced ${totalSynced} products...`);

    hasNextPage = data.products.pageInfo.hasNextPage;
    cursor = data.products.pageInfo.endCursor;
  }

  console.log(`✅ Sync complete: ${totalSynced} products`);
}

syncProducts().catch(console.error);
```

**Run sync:**

```bash
# One-time sync
npx ts-node scripts/sync-shopify-products.ts

# Schedule with cron (recommended)
# Add to vercel.json or use Vercel Cron Jobs
```

### Workflow 3: Handle Order Webhooks

**Goal:** Receive order creation webhooks from Shopify after Stripe payment

**Architecture:**

```
User completes Stripe checkout
  ↓
Stripe payment succeeds
  ↓
Your app creates Shopify order (via Admin API)
  ↓
Shopify sends orders/create webhook
  ↓
Your webhook handler verifies HMAC
  ↓
Store order in Supabase
```

**Implementation:**

```typescript
// app/api/webhooks/orders-create/route.ts
import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { getSupabaseServer } from '@/lib/supabase/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    // Step 1: Read raw body (BEFORE parsing)
    const rawBody = Buffer.from(await request.arrayBuffer());

    // Step 2: Get HMAC signature
    const signature = request.headers.get('X-Shopify-Hmac-SHA256');

    if (!signature) {
      return NextResponse.json(
        { error: 'Missing signature' },
        { status: 401 }
      );
    }

    // Step 3: Verify HMAC
    const isValid = verifyShopifyWebhook(rawBody, signature);

    if (!isValid) {
      console.error('Invalid webhook signature');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Step 4: Parse JSON after verification
    const order = JSON.parse(rawBody.toString());

    // Step 5: Store order in Supabase
    const supabase = getSupabaseServer();
    const { error } = await supabase.from('orders').insert({
      shopify_order_id: order.id.toString(),
      order_number: `#${order.order_number}`,
      line_items: order.line_items,
      shipping_address: order.shipping_address,
      total_price: parseFloat(order.total_price),
      currency: order.currency,
      created_at: order.created_at
    });

    if (error) {
      console.error('Database error:', error);
      return NextResponse.json(
        { error: 'Internal error' },
        { status: 500 }
      );
    }

    console.log(`Order ${order.id} processed successfully`);
    return NextResponse.json({ message: 'Order processed' });

  } catch (error) {
    console.error('Webhook error:', error);
    return NextResponse.json(
      { error: 'Internal error' },
      { status: 500 }
    );
  }
}

function verifyShopifyWebhook(rawBody: Buffer, signature: string): boolean {
  const secret = process.env.SHOPIFY_WEBHOOK_SECRET;

  if (!secret) {
    throw new Error('SHOPIFY_WEBHOOK_SECRET not configured');
  }

  const hmac = crypto
    .createHmac('sha256', secret)
    .update(rawBody)
    .digest('base64');

  return crypto.timingSafeEqual(
    Buffer.from(hmac),
    Buffer.from(signature)
  );
}
```

**CRITICAL: Webhook Security Rules**

1. **Always verify HMAC** before processing
2. **Use raw body bytes** for HMAC (not parsed JSON)
3. **Return 200 OK** for valid webhooks (even duplicates)
4. **Return 401** for invalid signatures
5. **Return 500** for processing errors (Shopify will retry)

### Workflow 4: Create Order in Shopify (After Stripe Payment)

**Goal:** Create order in Shopify after successful Stripe payment

**GraphQL Mutation:**

```graphql
mutation CreateDraftOrder($input: DraftOrderInput!) {
  draftOrderCreate(input: $input) {
    draftOrder {
      id
      name
      totalPrice
    }
    userErrors {
      field
      message
    }
  }
}
```

**Implementation:**

```typescript
// lib/shopify/create-order.ts
import { queryShopifyAdmin } from './admin-graphql';

interface LineItem {
  variantId: string;
  quantity: number;
}

interface ShippingAddress {
  firstName: string;
  lastName: string;
  address1: string;
  city: string;
  province: string;
  country: string;
  zip: string;
}

export async function createShopifyOrder(
  lineItems: LineItem[],
  shippingAddress: ShippingAddress,
  email: string
) {
  const mutation = `
    mutation CreateDraftOrder($input: DraftOrderInput!) {
      draftOrderCreate(input: $input) {
        draftOrder {
          id
          name
          totalPrice
        }
        userErrors {
          field
          message
        }
      }
    }
  `;

  const variables = {
    input: {
      lineItems: lineItems.map(item => ({
        variantId: item.variantId,
        quantity: item.quantity
      })),
      shippingAddress,
      email,
      useCustomerDefaultAddress: false
    }
  };

  const data = await queryShopifyAdmin<{
    draftOrderCreate: {
      draftOrder: { id: string; name: string };
      userErrors: Array<{ field: string; message: string }>;
    };
  }>(mutation, variables);

  if (data.draftOrderCreate.userErrors.length > 0) {
    throw new Error(
      `Shopify errors: ${JSON.stringify(data.draftOrderCreate.userErrors)}`
    );
  }

  return data.draftOrderCreate.draftOrder;
}
```

**Usage in Stripe webhook:**

```typescript
// app/api/webhooks/stripe/route.ts
import { createShopifyOrder } from '@/lib/shopify/create-order';

// After Stripe payment succeeds
const order = await createShopifyOrder(
  cartItems.map(item => ({
    variantId: item.shopifyVariantId,
    quantity: item.quantity
  })),
  shippingAddress,
  customerEmail
);

console.log(`Created Shopify order: ${order.name}`);
```

## Troubleshooting

### Error: "Missing Shopify Admin API credentials"

**Cause:** Environment variables not set

**Solution:**
1. Verify `.env.local` has both variables:
   ```bash
   SHOPIFY_ADMIN_ACCESS_TOKEN=shpat_xxxxx
   NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN=your-store.myshopify.com
   ```
2. Restart dev server: `npm run dev`
3. For production, set in Vercel dashboard

### Error: "Invalid webhook signature"

**Cause:** HMAC verification failed

**Solution:**
1. Verify `SHOPIFY_WEBHOOK_SECRET` matches Shopify dashboard
2. Ensure using raw body bytes (not parsed JSON) for HMAC
3. Check webhook URL is correct in Shopify settings
4. Test with Shopify's webhook testing tool

**Common mistake:**
```typescript
// ❌ WRONG - parsing before verification
const body = await request.json();
verifyHMAC(JSON.stringify(body), signature); // Will fail!

// ✅ CORRECT - use raw bytes
const rawBody = Buffer.from(await request.arrayBuffer());
verifyHMAC(rawBody, signature);
const body = JSON.parse(rawBody.toString());
```

### Error: "GraphQL errors: Access denied"

**Cause:** Missing API scopes

**Solution:**
1. Go to Shopify Admin → Apps → Your custom app
2. Click **Configuration**
3. Add required scopes (see Onboarding section)
4. Click **Save** and reinstall app
5. Get new access token

### Error: "Rate limit exceeded"

**Cause:** Too many API requests

**Solution:**
1. Implement exponential backoff:
   ```typescript
   async function retryWithBackoff(fn: () => Promise<any>, maxRetries = 3) {
     for (let i = 0; i < maxRetries; i++) {
       try {
         return await fn();
       } catch (error: any) {
         if (error.message.includes('429') && i < maxRetries - 1) {
           await new Promise(resolve => setTimeout(resolve, 1000 * Math.pow(2, i)));
           continue;
         }
         throw error;
       }
     }
   }
   ```
2. Use pagination with smaller page sizes
3. Cache product data in Supabase (don't query Shopify on every request)

### Webhook Not Receiving Events

**Cause:** Webhook configuration issue

**Solution:**
1. Verify webhook URL is publicly accessible (not localhost)
2. Check webhook status in Shopify Admin → Settings → Notifications
3. Look for failed delivery attempts
4. Test webhook with Shopify's "Send test notification" button
5. Check Vercel logs for incoming requests

## Best Practices

### 1. Cache Product Data

Don't query Shopify on every page load. Sync to Supabase and query from there:

```typescript
// ✅ GOOD - Query Supabase
const { data } = await supabase.from('products').select('*');

// ❌ BAD - Query Shopify on every request
const products = await queryShopifyAdmin(GET_PRODUCTS_QUERY);
```

### 2. Handle Webhook Idempotency

Shopify may send duplicate webhooks. Use database constraints:

```sql
-- Supabase migration
CREATE TABLE orders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  shopify_order_id TEXT UNIQUE NOT NULL,
  -- other fields
);
```

```typescript
// Upsert pattern
const { error } = await supabase
  .from('orders')
  .upsert({ shopify_order_id: order.id }, { onConflict: 'shopify_order_id' });
```

### 3. Use GraphQL for Efficiency

GraphQL lets you fetch exactly what you need:

```graphql
# ✅ GOOD - Only fetch needed fields
query {
  products(first: 50) {
    edges {
      node {
        id
        title
        handle
      }
    }
  }
}

# ❌ BAD - Fetching unnecessary data
# (REST API returns everything)
```

### 4. Secure Webhook Endpoints

Always verify HMAC signatures:

```typescript
// ✅ GOOD
const isValid = verifyShopifyWebhook(rawBody, signature);
if (!isValid) {
  return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
}

// ❌ BAD - Processing without verification
const order = await request.json();
await storeOrder(order); // Vulnerable to fake webhooks!
```

### 5. Log Webhook Events

Create audit trail for debugging:

```typescript
await supabase.from('webhook_logs').insert({
  event_type: 'orders/create',
  shopify_order_id: order.id,
  verification_status: 'success',
  processing_status: 'success',
  received_at: new Date().toISOString()
});
```

## Configuration

### Environment Variables Reference

| Variable | Required | Description | Example |
|----------|----------|-------------|---------|
| `SHOPIFY_ADMIN_ACCESS_TOKEN` | Yes | Admin API access token | `shpat_xxxxx` |
| `NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN` | Yes | Store domain | `your-store.myshopify.com` |
| `SHOPIFY_WEBHOOK_SECRET` | Yes | Webhook signing secret | `your_secret` |
| `NEXT_PUBLIC_SUPABASE_URL` | Yes | Supabase project URL | `https://xxx.supabase.co` |
| `SUPABASE_SERVICE_ROLE_KEY` | Yes | Supabase service key | `eyJxxx` |

### API Version

This power uses Shopify Admin API version `2024-01`. Update the version in API URLs as needed:

```typescript
`https://${storeDomain}/admin/api/2024-01/graphql.json`
```

Check [Shopify API versioning](https://shopify.dev/docs/api/usage/versioning) for latest versions.

---

**Package:** Native `fetch` (no installation required)
**API Documentation:** https://shopify.dev/docs/api/admin-graphql
**Webhook Guide:** https://shopify.dev/docs/apps/webhooks
