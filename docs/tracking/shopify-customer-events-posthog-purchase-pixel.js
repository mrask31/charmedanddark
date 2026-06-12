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
 * DEBUGGING:
 * Open Shopify Admin → Settings → Customer events → select this pixel →
 * click "Logs" to view console output from this script.
 *
 * VALIDATION STEPS:
 * 1. Install this pixel in Shopify Admin → Settings → Customer events
 * 2. Place a test order (Shopify Bogus Gateway or real small order)
 * 3. After checkout completes, check:
 *    - Shopify pixel logs for "[CD PostHog] ..." messages
 *    - PostHog → Activity → Live Events → filter by event "purchase"
 * 4. Confirm purchase event appears with correct properties
 */

// ============================================================================
// CONFIGURATION — Replace with your real PostHog project API key
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

function buildItems(lineItems = []) {
  return lineItems.map((item, index) => ({
    index,
    product_title: compact(item.title),
    product_handle: compact(item.variant?.product?.handle),
    variant_title: compact(item.variant?.title),
    sku: compact(item.variant?.sku),
    variant_id: compact(item.variant?.id),
    product_id: compact(item.variant?.product?.id),
    quantity: item.quantity || 1,
    price: moneyAmount(item.variant?.price),
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

  const checkout = event.data?.checkout;
  if (!checkout) {
    console.warn('[CD PostHog] No checkout data in event — skipping');
    return;
  }

  const attributes = getCheckoutAttributeMap(checkout);
  const items = buildItems(checkout.lineItems || []);
  const orderId = checkout.order?.id || checkout.token || event.id || '';
  const orderName = checkout.order?.name || '';
  const checkoutToken = checkout.token || event.id || '';

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
    value: moneyAmount(checkout.totalPrice),
    currency: checkout.totalPrice?.currencyCode || checkout.currencyCode || 'USD',

    // Line items summary
    item_count: items.reduce((sum, item) => sum + (item.quantity || 0), 0),
    product_titles: items.map((item) => item.product_title).filter(Boolean),
    product_handles: items.map((item) => item.product_handle).filter(Boolean),
    skus: items.map((item) => item.sku).filter(Boolean),
    line_items: items,

    // Attribution from cart attributes (passed from Next.js storefront during cartCreate)
    cd_ft_gclid: compact(attributes.cd_ft_gclid),
    cd_ft_utm_source: compact(attributes.cd_ft_utm_source),
    cd_ft_utm_medium: compact(attributes.cd_ft_utm_medium),
    cd_ft_utm_campaign: compact(attributes.cd_ft_utm_campaign),
    cd_lt_gclid: compact(attributes.cd_lt_gclid),
    cd_lt_utm_source: compact(attributes.cd_lt_utm_source),
    cd_lt_utm_medium: compact(attributes.cd_lt_utm_medium),
    cd_lt_utm_campaign: compact(attributes.cd_lt_utm_campaign),
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
    value: properties.value,
    currency: properties.currency,
    item_count: properties.item_count,
    has_ft_attribution: !!properties.cd_ft_utm_source,
    has_lt_attribution: !!properties.cd_lt_utm_source,
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
