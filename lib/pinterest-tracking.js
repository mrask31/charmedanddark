export const PINTEREST_TAG_ID = '2612491816640';

export function canTrackPinterest({ hostname, pathname, production, globalPrivacyControl, doNotTrack }) {
  return production && hostname === 'www.charmedanddark.com'
    && globalPrivacyControl !== true && doNotTrack !== '1' && doNotTrack !== 'yes'
    && !/^\/(admin|auth|reset-password|recover-cart|sanctuary|mirror|commerce-preview-check)(\/|$)/.test(pathname);
}

/** Basic page visits only. No customer identifiers or enhanced-match payload. */
export function trackPinterestPage(win, doc, pathname) {
  if (!canTrackPinterest({
    hostname: win.location.hostname, pathname,
    production: process.env.NODE_ENV === 'production',
    globalPrivacyControl: win.navigator.globalPrivacyControl,
    doNotTrack: win.navigator.doNotTrack,
  })) return;

  if (!win.pintrk) {
    const pintrk = function (...args) { pintrk.queue.push(args); };
    pintrk.queue = [];
    pintrk.version = '3.0';
    win.pintrk = pintrk;
    const script = doc.createElement('script');
    script.async = true;
    script.src = 'https://s.pinimg.com/ct/core.js';
    doc.head.appendChild(script);
    pintrk('load', PINTEREST_TAG_ID);
    pintrk('page');
  }

  // Prevent duplicate events from effect reruns; allow visits after navigation back.
  if (win.__cdPinterestPath === pathname) return;
  win.__cdPinterestPath = pathname;
  win.pintrk('track', 'pagevisit');
}

/** Product data only; analytics failure must never interrupt a successful cart update. */
export function trackPinterestAddToCart(win, doc, item, quantity) {
  try {
    const pathname = win.location.pathname;
    if (!canTrackPinterest({ hostname: win.location.hostname, pathname,
      production: process.env.NODE_ENV === 'production',
      globalPrivacyControl: win.navigator.globalPrivacyControl,
      doNotTrack: win.navigator.doNotTrack })) return;
    if (!item?.catalogId || !Number.isInteger(quantity) || quantity < 1
      || quantity > item.quantity || !Number.isFinite(item.price) || item.price < 0
      || !/^[A-Z]{3}$/.test(item.currency || '')) return;
    trackPinterestPage(win, doc, pathname);
    win.pintrk('track', 'addtocart', {
      value: Math.round(item.price * quantity * 100) / 100,
      currency: item.currency,
      order_quantity: quantity,
      line_items: [{ product_id: item.catalogId, product_price: item.price, product_quantity: quantity }],
    });
  } catch { /* Advertising blockers and vendor errors must not affect shopping. */ }
}
