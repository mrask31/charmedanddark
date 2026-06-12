/**
 * Shopify Customer Events — PostHog Purchase Pixel
 *
 * INSTALL LOCATION:
 * Shopify Admin → Settings → Customer events → Add custom pixel
 *
 * Name: "PostHog Purchase Tracking"
 *
 * IMPORTANT: Copy the ENTIRE contents of this file into the custom pixel code
 * editor in Shopify Admin. This runs in the Shopify Customer Events sandbox,
 * NOT on the Next.js storefront.
 *
 * This pixel fires on checkout_completed and sends a "purchase" event to
 * PostHog via the HTTP Capture API. It does NOT use the PostHog JS SDK
 * (unavailable in the Customer Events sandbox).
 *
 * Google Ads and GA4 purchase events are handled by the separate
 * "Google Ads + GA4 Purchase Tracking" pixel — do not duplicate them here.
 *
 * SHOPIFY CUSTOMER EVENTS checkout_completed PAYLOAD SHAPE:
 * event.data.checkout contains:
 *   .token                    — checkout token string
 *   .order.id                 — numeric order ID (e.g. 6464889782306)
 *   .order.name               — may be empty in sandbox; try event.name
 *   .order.customer.id        — numeric customer ID if logged in
 *   .email                    — customer email on the checkout
 *   .phone                    — customer phone if provided
 *   .totalPrice.amount        — string like "35.40"
 *   .totalPrice.currencyCode  — "USD"
 *   .subtotalPrice.amount     — string
 *   .lineItems[]              — array of line items:
 *     .title                  — product title
 *     .quantity               — number
 *     .variant.id             — variant GID (gid://shopify/ProductVariant/...)
 *     .variant.sku            — SKU string
 *     .variant.title          — variant option string (e.g. "S / Black")
 *     .variant.price.amount   — string
 *     .variant.product.id     — product GID
 *     .variant.product.title  — product title
 *     .variant.product.vendor — vendor name
 *     .variant.product.type   — product type
 *     .variant.product.url    — full URL like /products/handle
 *   .customAttributes[]       — cart attributes [{key, value}]
 *   .discountApplications[]   — applied discounts
 *
 * DEBUGGING:
 * Open Shopify Admin → Settings → Customer events → select this pixel →
 * click "Logs" to view console output from this script.
 */

// ============================================================================
// CONFIGURATION
// ============================================================================
const POSTHOG_API_KEY = 'phc_sEjELnQn7iD9tFx6z6CLLbLyV6CcJriEUheEHupjpRqs';
const POSTHOG_CAPTURE_URL = 'https://us.i.posthog.com/capture/';

// ============================================================================
// HELPERS
// ============================================================================

function moneyAmount(value) {
  const amount = parseFloat(value?.amount ?? value ?? 0);
  return Number.isFinite(amount) ? amount : 0;
}

function compact(value) {
  if (value === undefined || value === null || value === '') return undefined;
  return value;
}

/**
 * Extract product handle from variant.product.url or variant.product.handle.
 * Shopify Customer Events often provides the URL like "/products/my-handle"
 * but not a standalone handle field.
 */
function extractHandle(item) {
  // Try direct handle field
  if (item.variant?.product?.handle) return item.variant.product.handle;
  // Try extracting from URL: "/products/some-handle" or full URL
  const url = item.variant?.product?.url || '';
  const match = url.match(/\/products\/([^?#/]+)/);
  if (match) return match[1];
  // Fallback: slugify the title
  if (item.title) {
    return item.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
  }
  return undefined;
}

function buildItems(lineItems = []) {
  return lineItems.map((item, index) => ({
    index,
    product_title: compact(item.title),
    product_handle: compact(extractHandle(item)),
    variant_title: compact(item.variant?.title),
    sku: compact(item.variant?.sku),
    variant_id: compact(item.variant?.id),
    product_id: compact(item.variant?.product?.id),
    quantity: item.quantity || 1,
    price: moneyAmount(item.variant?.price),
    vendor: compact(item.variant?.product?.vendor),
    product_type: compact(item.variant?.product?.type),
  }));
}

function getCheckoutAttributeMap(checkout) {
  // Shopify exposes cart attributes as customAttributes on the checkout object
  const attrs = checkout?.customAttributes || checkout?.attributes || checkout?.noteAttributes || [];
  if (!Array.isArray(attrs)) return {};
  return attrs.reduce((acc, attr) => {
    if (attr?.key && attr?.value) acc[attr.key] = attr.value;
    return acc;
  }, {});
}

// ============================================================================
// MAIN — Subscribe to checkout_completed
// ============================================================================

analytics.subscribe('checkout_completed', async (event) => {
  console.log('[CD PostHog] checkout_completed event received');
  console.log('[CD PostHog] Event keys:', Object.keys(event.data || {}).join(', '));

  const checkout = event.data?.checkout;
  if (!checkout) {
    console.warn('[CD PostHog] No checkout data in event — skipping');
    return;
  }

  // Log available checkout fields for debugging
  console.log('[CD PostHog] Checkout keys:', Object.keys(checkout).join(', '));
  console.log('[CD PostHog] Order keys:', checkout.order ? Object.keys(checkout.order).join(', ') : 'no order');
  if (checkout.lineItems?.[0]) {
    console.log('[CD PostHog] First lineItem keys:', Object.keys(checkout.lineItems[0]).join(', '));
    if (checkout.lineItems[0].variant) {
      console.log('[CD PostHog] First variant keys:', Object.keys(checkout.lineItems[0].variant).join(', '));
      if (checkout.lineItems[0].variant.product) {
        console.log('[CD PostHog] First variant.product keys:', Object.keys(checkout.lineItems[0].variant.product).join(', '));
      }
    }
  }

  const attributes = getCheckoutAttributeMap(checkout);
  const items = buildItems(checkout.lineItems || []);

  // Order ID: try multiple paths
  const orderId = checkout.order?.id
    || checkout.orderId
    || event.data?.orderId
    || checkout.token
    || event.id
    || '';

  // Order name: try multiple paths (e.g. "#1042")
  const orderName = checkout.order?.name
    || checkout.orderName
    || event.data?.orderName
    || (checkout.order?.id ? `#${checkout.order.id}` : '')
    || '';

  const checkoutToken = checkout.token || event.id || '';

  // Customer email: checkout-level email field
  const customerEmail = checkout.email
    || checkout.order?.email
    || checkout.order?.customer?.email
    || undefined;

  // Use customer ID if available, otherwise fall back to checkout token
  const distinctId = checkout.order?.customer?.id
    || checkout.customer?.id
    || checkoutToken
    || orderId
    || 'anonymous_checkout';

  const properties = {
    // Required identification
    distinct_id: String(distinctId),

    // Event metadata
    source: 'shopify_customer_events',

    // Order details
    order_id: compact(orderId),
    order_name: compact(orderName),
    checkout_token: compact(checkoutToken),
    customer_email: compact(customerEmail),
    value: moneyAmount(checkout.totalPrice),
    subtotal: moneyAmount(checkout.subtotalPrice),
    currency: checkout.totalPrice?.currencyCode || checkout.currencyCode || 'USD',

    // Line items summary arrays
    item_count: items.reduce((sum, item) => sum + (item.quantity || 0), 0),
    product_titles: items.map((item) => item.product_title).filter(Boolean),
    product_handles: items.map((item) => item.product_handle).filter(Boolean),
    product_ids: items.map((item) => item.product_id).filter(Boolean),
    variant_ids: items.map((item) => item.variant_id).filter(Boolean),
    skus: items.map((item) => item.sku).filter(Boolean),

    // Full line items detail
    line_items: items,

    // Discount info
    discount_codes: (checkout.discountApplications || [])
      .map((d) => d.title || d.code)
      .filter(Boolean),

    // Attribution from cart attributes (passed from Next.js storefront during cartCreate)
    cd_ft_gclid: compact(attributes.cd_ft_gclid),
    cd_ft_utm_source: compact(attributes.cd_ft_utm_source),
    cd_ft_utm_medium: compact(attributes.cd_ft_utm_medium),
    cd_ft_utm_campaign: compact(attributes.cd_ft_utm_campaign),
    cd_lt_gclid: compact(attributes.cd_lt_gclid),
    cd_lt_utm_source: compact(attributes.cd_lt_utm_source),
    cd_lt_utm_medium: compact(attributes.cd_lt_utm_medium),
    cd_lt_utm_campaign: compact(attributes.cd_lt_utm_campaign),

    // Debug: log if attribution attributes were present at all
    has_cart_attributes: Object.keys(attributes).length > 0,
    cart_attribute_keys: Object.keys(attributes).length > 0
      ? Object.keys(attributes).join(',')
      : undefined,
  };

  // Remove undefined values
  Object.keys(properties).forEach((key) => {
    if (properties[key] === undefined) delete properties[key];
  });

  const payload = {
    api_key: POSTHOG_API_KEY,
    event: 'purchase',
    properties: properties,
    timestamp: new Date().toISOString(),
  };

  console.log('[CD PostHog] Payload built:', JSON.stringify({
    event: payload.event,
    distinct_id: properties.distinct_id,
    order_id: properties.order_id,
    order_name: properties.order_name,
    customer_email: properties.customer_email ? '***' : 'missing',
    value: properties.value,
    currency: properties.currency,
    item_count: properties.item_count,
    product_handles: properties.product_handles,
    product_ids: properties.product_ids,
    variant_ids: properties.variant_ids,
    has_ft_attribution: !!properties.cd_ft_utm_source,
    has_lt_attribution: !!properties.cd_lt_utm_source,
    has_cart_attributes: properties.has_cart_attributes,
  }));

  try {
    const response = await fetch(POSTHOG_CAPTURE_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
      keepalive: true,
    });

    console.log('[CD PostHog] Request sent. Status:', response.status);

    if (!response.ok) {
      const text = await response.text().catch(() => 'no body');
      console.error('[CD PostHog] Request failed:', response.status, text);
    } else {
      console.log('[CD PostHog] Purchase event sent successfully');
    }
  } catch (err) {
    console.error('[CD PostHog] Fetch error:', err.message || err);
  }
});
