/**
 * Attribution Capture & Persistence
 *
 * Headless checkout loses URL params unless passed into Shopify cart attributes.
 * This utility captures ad/traffic attribution on the Next.js storefront and
 * stores it for passthrough during cartCreate.
 */

const ATTRIBUTION_PARAMS = [
  'gclid', 'gbraid', 'wbraid',
  'utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term',
  'campaignid', 'adgroupid', 'keyword', 'matchtype', 'device', 'creative', 'placement',
];

const FIRST_TOUCH_KEY = 'cd_attribution_first_touch';
const LAST_TOUCH_KEY = 'cd_attribution_last_touch';
const MAX_URL_LENGTH = 500;

function safeString(val) {
  if (!val) return null;
  const s = String(val).trim();
  return s.length > 0 ? s.substring(0, MAX_URL_LENGTH) : null;
}

export function captureAttribution() {
  if (typeof window === 'undefined') return null;

  const params = new URLSearchParams(window.location.search);
  const attribution = {};
  let hasAny = false;

  for (const key of ATTRIBUTION_PARAMS) {
    const val = safeString(params.get(key));
    if (val) {
      attribution[key] = val;
      hasAny = true;
    }
  }

  if (!hasAny) return null;

  attribution.landing_page = safeString(window.location.pathname + window.location.search);
  attribution.referrer = safeString(document.referrer);
  attribution.captured_at = new Date().toISOString();

  return attribution;
}

export function storeAttribution(attribution) {
  if (!attribution) return;
  try {
    const json = JSON.stringify(attribution);
    if (!localStorage.getItem(FIRST_TOUCH_KEY)) {
      localStorage.setItem(FIRST_TOUCH_KEY, json);
      sessionStorage.setItem(FIRST_TOUCH_KEY, json);
    }
    localStorage.setItem(LAST_TOUCH_KEY, json);
    sessionStorage.setItem(LAST_TOUCH_KEY, json);
  } catch { /* storage unavailable */ }
}

export function getStoredAttribution() {
  try {
    const ft = localStorage.getItem(FIRST_TOUCH_KEY);
    const lt = localStorage.getItem(LAST_TOUCH_KEY);
    return {
      firstTouch: ft ? JSON.parse(ft) : null,
      lastTouch: lt ? JSON.parse(lt) : null,
    };
  } catch {
    return { firstTouch: null, lastTouch: null };
  }
}

/**
 * Returns a flat object of attribution properties suitable for PostHog events.
 * Keys are prefixed cd_ft_* and cd_lt_* matching first/last touch storage.
 * Returns an empty object if no attribution is stored.
 */
export function getAttributionProps() {
  const { firstTouch, lastTouch } = getStoredAttribution();
  const props = {};

  if (firstTouch) {
    for (const [key, val] of Object.entries(firstTouch)) {
      if (val) props[`cd_ft_${key}`] = String(val).substring(0, 255);
    }
  }
  if (lastTouch) {
    for (const [key, val] of Object.entries(lastTouch)) {
      if (val) props[`cd_lt_${key}`] = String(val).substring(0, 255);
    }
  }

  return props;
}

export function buildCartAttributes() {
  const { firstTouch, lastTouch } = getStoredAttribution();
  const attrs = [];

  if (firstTouch) {
    for (const [key, val] of Object.entries(firstTouch)) {
      if (val) attrs.push({ key: `cd_ft_${key}`, value: String(val).substring(0, 255) });
    }
  }
  if (lastTouch) {
    for (const [key, val] of Object.entries(lastTouch)) {
      if (val) attrs.push({ key: `cd_lt_${key}`, value: String(val).substring(0, 255) });
    }
  }

  return attrs.length > 0 ? attrs : null;
}
