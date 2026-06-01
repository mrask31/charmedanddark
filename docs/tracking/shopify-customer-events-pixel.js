/**
 * Shopify Customer Events — Custom Pixel
 * 
 * INSTALL LOCATION:
 * Shopify Admin → Settings → Customer events → Add custom pixel
 * 
 * Name: "Google Ads + GA4 Purchase Tracking"
 * 
 * This pixel fires on checkout_completed (Thank You page) and sends:
 * 1. Google Ads purchase conversion (AW-18117162540/OLy1CO-c_aEcEKzs975D)
 * 2. GA4 purchase event (G-53EPW0NDPZ)
 *
 * WHY THIS EXISTS:
 * Checkout completes on Shopify's domain, not the Next.js storefront.
 * The Google Ads base tag on the frontend cannot fire purchase conversions.
 * Only Shopify Customer Events can fire at checkout completion.
 *
 * TESTING:
 * 1. Install this pixel in Shopify Admin
 * 2. Place a test order (use Shopify Bogus Gateway or a $0 test product)
 * 3. Check Google Ads → Conversions → Purchase for the conversion
 * 4. Check GA4 → Realtime → Conversions for the purchase event
 * 5. Check Shopify Admin → Settings → Customer events → pixel logs
 *
 * INSTALL TIMING:
 * Install only after this branch is merged and production smoke test passes.
 *
 * ATTRIBUTION:
 * Cart attributes (cd_ft_gclid, cd_lt_utm_source, etc.) are passed from
 * the Next.js storefront into the Shopify cart during cartCreate.
 * These appear on the order as note attributes and can be read here
 * if Shopify exposes them in the checkout event payload.
 */

// Load Google tag
const GOOGLE_ADS_ID = 'AW-18117162540';
const GOOGLE_ADS_CONVERSION_LABEL = 'OLy1CO-c_aEcEKzs975D';
const GA4_MEASUREMENT_ID = 'G-53EPW0NDPZ';

// Initialize gtag
(function() {
  const script = document.createElement('script');
  script.src = `https://www.googletagmanager.com/gtag/js?id=${GOOGLE_ADS_ID}`;
  script.async = true;
  document.head.appendChild(script);

  window.dataLayer = window.dataLayer || [];
  function gtag() { dataLayer.push(arguments); }
  window.gtag = gtag;

  gtag('js', new Date());
  gtag('config', GOOGLE_ADS_ID, { send_page_view: false });
  gtag('config', GA4_MEASUREMENT_ID, { send_page_view: false });
})();

// Subscribe to checkout_completed
analytics.subscribe('checkout_completed', (event) => {
  const checkout = event.data.checkout;

  if (!checkout) {
    console.warn('[CD Pixel] No checkout data in event');
    return;
  }

  const transactionId = checkout.order?.id || checkout.token || '';
  const value = parseFloat(checkout.totalPrice?.amount || 0);
  const currency = checkout.totalPrice?.currencyCode || 'USD';

  // Build items array for GA4
  const items = (checkout.lineItems || []).map((item, index) => ({
    item_id: item.variant?.sku || item.variant?.id || '',
    item_name: item.title || '',
    price: parseFloat(item.variant?.price?.amount || 0),
    quantity: item.quantity || 1,
    index: index,
  }));

  // 1. Google Ads Purchase Conversion
  window.gtag('event', 'conversion', {
    send_to: `${GOOGLE_ADS_ID}/${GOOGLE_ADS_CONVERSION_LABEL}`,
    value: value,
    currency: currency,
    transaction_id: transactionId,
  });

  // 2. GA4 Purchase Event
  window.gtag('event', 'purchase', {
    send_to: GA4_MEASUREMENT_ID,
    transaction_id: transactionId,
    value: value,
    currency: currency,
    items: items,
  });
});
