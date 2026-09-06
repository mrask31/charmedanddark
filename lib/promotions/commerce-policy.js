import { isShopifyCatalogEnabled } from '../commerce-config.js';

export const SHOPIFY_CAMPAIGN_REQUIREMENT =
  'Campaign publishing requires a verified Shopify discount connection. Configure the discount in Shopify, then verify its products, dates, eligibility and checkout totals before publishing campaign claims here. Drafts remain editable.';

/** An editable Shopify discount ID alone is not proof of enforcement. */
export function getCampaignCommercePolicy() {
  const requiresShopifyVerification = isShopifyCatalogEnabled();
  return {
    publishingEnabled: !requiresShopifyVerification,
    requiresShopifyVerification,
    message: requiresShopifyVerification ? SHOPIFY_CAMPAIGN_REQUIREMENT : null,
  };
}

export function requestsCampaignActivation(update) {
  return update?.enabled === true || ['active', 'live', 'scheduled'].includes(update?.status);
}
