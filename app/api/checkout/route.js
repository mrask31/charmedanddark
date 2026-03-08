import { NextResponse } from 'next/server';

const domain = process.env.SHOPIFY_STORE_DOMAIN;
const storefrontToken = process.env.SHOPIFY_STOREFRONT_ACCESS_TOKEN;

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
    const { items } = await request.json();

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

    // Step 2: Create the cart with discount code
    const cartInput = {
      lines: lineItems,
      discountCodes: ['HOUSE10'],
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
