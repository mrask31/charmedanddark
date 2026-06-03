/**
 * Shopify Customer Events — PostHog Purchase Pixel
 *
 * INSTALL LOCATION:
 * Shopify Admin → Settings → Customer events → Add custom pixel
 *
 * Name: "PostHog Purchase Tracking"
 *
 * This pixel is intentionally PostHog-only. Do not add Google Ads or GA4 calls here;
 * Google Ads and GA4 purchase events are already handled by the separate
 * "Google Ads + GA4 Purchase Tracking" customer event pixel.
 *
 * WHY THIS EXISTS:
 * Checkout completes on Shopify's domain, not the Next.js storefront. PostHog
 * cannot reliably observe a purchase from the headless storefront alone.
 * This listens for Shopify's checkout_completed event and sends a purchase
 * event to PostHog without duplicating Google/GA4 conversion tracking.
 */

const POSTHOG_API_KEY = 'phc_sEjELnQn7iD9tFx6z6CLLbLyV6CcJriEUheEHupjpRqs';
const POSTHOG_CAPTURE_URL = 'https://us.i.posthog.com/capture/';

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
    variant_title: compact(item.variant?.title),
    sku: compact(item.variant?.sku),
    variant_id: compact(item.variant?.id),
    product_id: compact(item.variant?.product?.id),
    quantity: item.quantity || 1,
    price: moneyAmount(item.variant?.price),
  }));
}

function getCheckoutAttributeMap(checkout) {
  const attrs = checkout?.attributes || checkout?.noteAttributes || [];
  return attrs.reduce((acc, attr) => {
    if (attr?.key && attr?.value) acc[attr.key] = attr.value;
    return acc;
  }, {});
}

analytics.subscribe('checkout_completed', (event) => {
  const checkout = event.data.checkout;
  if (!checkout) return;

  const attributes = getCheckoutAttributeMap(checkout);
  const items = buildItems(checkout.lineItems || []);
  const orderId = checkout.order?.id || checkout.order?.name || checkout.token || event.id;
  const checkoutToken = checkout.token || event.id;

  // Avoid raw email as a default identifier. Prefer Shopify/customer/order IDs
  // and fall back to the checkout token/event ID when no stable customer ID exists.
  const distinctId = checkout.customer?.id || checkout.order?.customer?.id || checkoutToken || orderId;

  const properties = {
    distinct_id: distinctId,
    source: 'shopify_customer_events',
    order_id: compact(orderId),
    order_name: compact(checkout.order?.name),
    checkout_token: compact(checkoutToken),
    value: moneyAmount(checkout.totalPrice),
    subtotal: moneyAmount(checkout.subtotalPrice),
    currency: checkout.totalPrice?.currencyCode || checkout.currencyCode || 'USD',
    item_count: items.reduce((sum, item) => sum + (item.quantity || 0), 0),
    product_titles: items.map((item) => item.product_title).filter(Boolean),
    skus: items.map((item) => item.sku).filter(Boolean),
    items,
    discount_codes: (checkout.discountApplications || [])
      .map((discount) => discount.title || discount.code)
      .filter(Boolean),
    has_first_touch_attribution: Object.keys(attributes).some((key) => key.startsWith('cd_ft_')),
    has_last_touch_attribution: Object.keys(attributes).some((key) => key.startsWith('cd_lt_')),
    cd_ft_gclid: compact(attributes.cd_ft_gclid),
    cd_ft_utm_source: compact(attributes.cd_ft_utm_source),
    cd_ft_utm_medium: compact(attributes.cd_ft_utm_medium),
    cd_ft_utm_campaign: compact(attributes.cd_ft_utm_campaign),
    cd_ft_landing_page: compact(attributes.cd_ft_landing_page),
    cd_lt_gclid: compact(attributes.cd_lt_gclid),
    cd_lt_utm_source: compact(attributes.cd_lt_utm_source),
    cd_lt_utm_medium: compact(attributes.cd_lt_utm_medium),
    cd_lt_utm_campaign: compact(attributes.cd_lt_utm_campaign),
    cd_lt_landing_page: compact(attributes.cd_lt_landing_page),
  };

  Object.keys(properties).forEach((key) => {
    if (properties[key] === undefined) delete properties[key];
  });

  fetch(POSTHOG_CAPTURE_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      api_key: POSTHOG_API_KEY,
      event: 'purchase',
      properties,
    }),
  }).catch(() => {
    // Avoid logging checkout/order data from the customer event sandbox.
  });
});
