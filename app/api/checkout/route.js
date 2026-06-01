import { NextResponse } from 'next/server';

const domain = process.env.SHOPIFY_STORE_DOMAIN;
const storefrontToken = process.env.SHOPIFY_STOREFRONT_ACCESS_TOKEN;

const ALLOWED_ATTRIBUTION_KEYS = new Set([
  'cd_ft_gclid', 'cd_ft_gbraid', 'cd_ft_wbraid',
  'cd_ft_utm_source', 'cd_ft_utm_medium', 'cd_ft_utm_campaign', 'cd_ft_utm_content', 'cd_ft_utm_term',
  'cd_ft_campaignid', 'cd_ft_adgroupid', 'cd_ft_keyword', 'cd_ft_matchtype', 'cd_ft_device', 'cd_ft_creative', 'cd_ft_placement',
  'cd_ft_landing_page', 'cd_ft_referrer', 'cd_ft_captured_at',
  'cd_lt_gclid', 'cd_lt_gbraid', 'cd_lt_wbraid',
  'cd_lt_utm_source', 'cd_lt_utm_medium', 'cd_lt_utm_campaign', 'cd_lt_utm_content', 'cd_lt_utm_term',
  'cd_lt_campaignid', 'cd_lt_adgroupid', 'cd_lt_keyword', 'cd_lt_matchtype', 'cd_lt_device', 'cd_lt_creative', 'cd_lt_placement',
  'cd_lt_landing_page', 'cd_lt_referrer', 'cd_lt_captured_at',
]);

function sanitizeAttributionAttributes(attribution) {
  if (!Array.isArray(attribution)) return [];
  const sanitized = [];
  for (const attr of attribution) {
    if (!attr || typeof attr.key !== 'string' || typeof attr.value !== 'string') continue;
    const key = attr.key.trim();
    if (!ALLOWED_ATTRIBUTION_KEYS.has(key)) continue;
    const value = attr.value.trim().substring(0, 255);
    if (!value) continue;
    sanitized.push({ key, value });
  }
  return sanitized;
}

// Validate required environment variables
if (!domain || !storefrontToken) {
  console.error('Missing required environment variables:', {
    SHOPIFY_STORE_DOMAIN: !!domain,
    SHOPIFY_STOREFRONT_ACCESS_TOKEN: !!storefrontToken,
  });
}

async function shopifyStorefront(query, variables = {}) {
  const res = await fetch(`https://${domain}/api/2024-01/graphql.json`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Shopify-Storefront-Access-Token': storefrontToken,
    },
    body: JSON.stringify({ query, variables }),
  });
  return res.json();
}

export async function POST(request) {
  try {
    const { items, isMember, attribution } = await request.json();

    if (!items || items.length === 0) {
      return NextResponse.json({ error: 'No items in cart' }, { status: 400 });
    }

    // Step 1: Create a cart with line items
    const createCartMutation = `
      mutation cartCreate($input: CartInput!) {
        cartCreate(input: $input) {
          cart {
            id
            checkoutUrl
          }
          userErrors {
            field
            message
          }
        }
      }
    `;

    // Build line items — needs Shopify variant IDs
    // If we don't have variant IDs, we need to look them up by handle
    const lineItems = [];

    for (const item of items) {
      if (item.shopifyVariantId) {
        lineItems.push({
          merchandiseId: item.shopifyVariantId,
          quantity: item.quantity,
        });
      } else {
        // Look up variant ID by product handle
        const lookupQuery = `
          query getProduct($handle: String!) {
            productByHandle(handle: $handle) {
              variants(first: 1) {
                edges {
                  node {
                    id
                  }
                }
              }
            }
          }
        `;
        const lookupResult = await shopifyStorefront(lookupQuery, { handle: item.slug });
        const variantId = lookupResult.data?.productByHandle?.variants?.edges?.[0]?.node?.id;

        if (variantId) {
          lineItems.push({
            merchandiseId: variantId,
            quantity: item.quantity,
          });
        } else {
          console.error(`Could not find variant for product: ${item.slug}`);
        }
      }
    }

    if (lineItems.length === 0) {
      return NextResponse.json({ error: 'No valid products found' }, { status: 400 });
    }

    // Step 2: Create the cart — only apply HOUSE10 for active Sanctuary members
    // Include attribution as cart attributes so order-level tracking survives headless checkout
    const sanitizedAttribution = sanitizeAttributionAttributes(attribution);
    const cartInput = {
      lines: lineItems,
      ...(isMember ? { discountCodes: ['HOUSE10'] } : {}),
      ...(sanitizedAttribution.length > 0 ? { attributes: sanitizedAttribution } : {}),
    };

    const result = await shopifyStorefront(createCartMutation, { input: cartInput });

    if (result.data?.cartCreate?.userErrors?.length > 0) {
      console.error('Cart creation errors:', result.data.cartCreate.userErrors);
      return NextResponse.json(
        { error: 'Failed to create checkout', details: result.data.cartCreate.userErrors },
        { status: 500 }
      );
    }

    const checkoutUrl = result.data?.cartCreate?.cart?.checkoutUrl;

    if (!checkoutUrl) {
      return NextResponse.json({ error: 'No checkout URL returned' }, { status: 500 });
    }

    return NextResponse.json({ checkoutUrl });

  } catch (err) {
    console.error('Checkout error:', err);
    return NextResponse.json({ error: 'Checkout failed', message: err.message }, { status: 500 });
  }
}
