// scripts/sync-images.js
// Run with: node scripts/sync-images.js
// Syncs product images from Shopify Storefront API → Supabase products table
// Matches by shopify_id column

import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';

dotenv.config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

const domain = process.env.NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN || process.env.SHOPIFY_STORE_DOMAIN;
const storefrontToken = process.env.SHOPIFY_STOREFRONT_ACCESS_TOKEN;

const PRODUCTS_WITH_IMAGES_QUERY = `
  query AllProducts($first: Int!, $after: String) {
    products(first: $first, after: $after) {
      pageInfo { hasNextPage endCursor }
      edges {
        node {
          id
          title
          images(first: 20) {
            edges {
              node { url altText }
            }
          }
        }
      }
    }
  }
`;

async function shopifyFetch(query, variables = {}) {
  const url = `https://${domain}/api/2024-01/graphql.json`;
  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Shopify-Storefront-Access-Token': storefrontToken,
    },
    body: JSON.stringify({ query, variables }),
  });
  const json = await res.json();
  if (json.errors) throw new Error(json.errors[0]?.message || 'Shopify API error');
  return json.data;
}

async function fetchAllShopifyProducts() {
  const all = [];
  let hasNextPage = true;
  let after = null;

  while (hasNextPage) {
    const data = await shopifyFetch(PRODUCTS_WITH_IMAGES_QUERY, { first: 50, after });
    const products = data.products.edges.map(({ node }) => node);
    all.push(...products);
    hasNextPage = data.products.pageInfo.hasNextPage;
    after = data.products.pageInfo.endCursor;
  }

  return all;
}

// Extract numeric ID from Shopify GID (e.g. "gid://shopify/Product/123" → "123")
function extractId(gid) {
  return gid.split('/').pop();
}

async function sync() {
  console.log('Fetching products from Shopify...');
  const shopifyProducts = await fetchAllShopifyProducts();
  console.log(`Found ${shopifyProducts.length} products in Shopify`);

  let updated = 0;
  let failed = 0;
  const unmatched = [];

  for (const sp of shopifyProducts) {
    const shopifyId = extractId(sp.id);
    const imageNodes = sp.images.edges.map(({ node }, i) => ({
      url: node.url,
      alt: node.altText || '',
      position: i,
    }));

    const imageUrls = imageNodes.map((img) => img.url);
    const firstImage = imageUrls[0] || null;

    // Update Supabase product matching by shopify_id
    const { data, error } = await supabase
      .from('products')
      .update({
        image_url: firstImage,
        image_urls: imageUrls,
        images: imageNodes,
      })
      .eq('shopify_id', shopifyId)
      .select('id, name');

    if (error) {
      console.error(`  ✗ Error updating shopify_id ${shopifyId} (${sp.title}): ${error.message}`);
      failed++;
    } else if (!data || data.length === 0) {
      unmatched.push({ shopifyId, title: sp.title });
    } else {
      console.log(`  ✓ ${data[0].name} — ${imageUrls.length} image(s)`);
      updated++;
    }
  }

  console.log('\n--- Summary ---');
  console.log(`Updated: ${updated}`);
  console.log(`Failed:  ${failed}`);
  console.log(`No match: ${unmatched.length}`);
  if (unmatched.length > 0) {
    console.log('\nUnmatched Shopify products (no shopify_id match in Supabase):');
    for (const u of unmatched) {
      console.log(`  - ${u.title} (shopify_id: ${u.shopifyId})`);
    }
  }
}

sync().catch((err) => {
  console.error('Sync failed:', err);
  process.exit(1);
});
