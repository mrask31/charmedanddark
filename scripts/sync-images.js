// scripts/sync-images.js
// Run with: node scripts/sync-images.js
// Syncs product images from Shopify Storefront API → Supabase products table

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

function extractNumericId(gid) {
  return gid.split('/').pop();
}

async function sync() {
  console.log('=== Shopify → Supabase Image Sync ===\n');
  console.log(`Shopify domain: ${domain}`);
  console.log(`Supabase URL: ${process.env.NEXT_PUBLIC_SUPABASE_URL}`);
  console.log(`Has service role key: ${!!process.env.SUPABASE_SERVICE_ROLE_KEY}\n`);

  // Step 1: Fetch Shopify products
  console.log('Fetching products from Shopify...');
  const shopifyProducts = await fetchAllShopifyProducts();
  console.log(`Found ${shopifyProducts.length} products in Shopify\n`);

  // Debug: show first product from Shopify
  if (shopifyProducts.length > 0) {
    const first = shopifyProducts[0];
    console.log('--- First Shopify product ---');
    console.log(`  Title: ${first.title}`);
    console.log(`  Full GID: ${first.id}`);
    console.log(`  Numeric ID: ${extractNumericId(first.id)}`);
    console.log(`  Images: ${first.images.edges.length}`);
    console.log();
  }

  // Step 2: Check what format shopify_id is stored as in Supabase
  console.log('Checking shopify_id format in Supabase...');
  const { data: sampleRows, error: sampleError } = await supabase
    .from('products')
    .select('id, name, shopify_id')
    .not('shopify_id', 'is', null)
    .limit(3);

  if (sampleError) {
    console.error('Failed to query Supabase:', sampleError.message);
    process.exit(1);
  }

  if (!sampleRows?.length) {
    console.log('WARNING: No products in Supabase have a shopify_id set.');
    process.exit(1);
  }

  console.log('Sample shopify_id values in Supabase:');
  for (const row of sampleRows) {
    console.log(`  ${row.name}: "${row.shopify_id}"`);
  }
  console.log();

  // Determine format: full GID or numeric
  const isGidFormat = sampleRows[0].shopify_id?.startsWith('gid://');
  console.log(`Supabase stores shopify_id as: ${isGidFormat ? 'FULL GID' : 'NUMERIC ID'}\n`);

  // Step 3: Test update on first product
  const testProduct = shopifyProducts[0];
  const testMatchId = isGidFormat ? testProduct.id : extractNumericId(testProduct.id);
  const testImages = testProduct.images.edges.map(({ node }) => node.url);

  console.log('--- Test update (first product) ---');
  console.log(`  Shopify: "${testProduct.title}"`);
  console.log(`  Matching with shopify_id = "${testMatchId}"`);
  console.log(`  Images to write: ${testImages.length}`);

  const { data: testResult, error: testError } = await supabase
    .from('products')
    .update({
      image_url: testImages[0] || null,
      image_urls: testImages,
      images: testProduct.images.edges.map(({ node }, i) => ({
        url: node.url,
        alt: node.altText || '',
        position: i,
      })),
    })
    .eq('shopify_id', testMatchId)
    .select('id, name, shopify_id');

  if (testError) {
    console.error(`  ✗ Test update FAILED: ${testError.message}`);
    process.exit(1);
  }

  if (!testResult?.length) {
    console.log(`  ✗ No matching row found for shopify_id = "${testMatchId}"`);
    console.log('  Trying the other format...');

    // Try the opposite format
    const altMatchId = isGidFormat ? extractNumericId(testProduct.id) : testProduct.id;
    console.log(`  Retrying with shopify_id = "${altMatchId}"`);

    const { data: altResult } = await supabase
      .from('products')
      .update({
        image_url: testImages[0] || null,
        image_urls: testImages,
        images: testProduct.images.edges.map(({ node }, i) => ({
          url: node.url,
          alt: node.altText || '',
          position: i,
        })),
      })
      .eq('shopify_id', altMatchId)
      .select('id, name, shopify_id');

    if (altResult?.length) {
      console.log(`  ✓ Match found with alternate format! Switching to ${isGidFormat ? 'NUMERIC' : 'GID'} matching.\n`);
      // Flip the format flag
      await processAll(shopifyProducts, !isGidFormat);
      return;
    }

    console.log('  ✗ Neither format matched. Check your Supabase data.');
    process.exit(1);
  } else {
    console.log(`  ✓ Test update SUCCESS: ${testResult[0].name} (${testImages.length} images)\n`);
  }

  // Step 4: Process all remaining products
  await processAll(shopifyProducts.slice(1), isGidFormat, 1, 0);
}

async function processAll(products, useGidFormat, startUpdated = 0, startFailed = 0) {
  let updated = startUpdated;
  let failed = startFailed;
  const unmatched = [];

  console.log(`Processing ${products.length} remaining products...\n`);

  for (const sp of products) {
    const matchId = useGidFormat ? sp.id : extractNumericId(sp.id);
    const imageNodes = sp.images.edges.map(({ node }, i) => ({
      url: node.url,
      alt: node.altText || '',
      position: i,
    }));
    const imageUrls = imageNodes.map((img) => img.url);
    const firstImage = imageUrls[0] || null;

    const { data, error } = await supabase
      .from('products')
      .update({
        image_url: firstImage,
        image_urls: imageUrls,
        images: imageNodes,
      })
      .eq('shopify_id', matchId)
      .select('id, name');

    if (error) {
      console.error(`  ✗ ${sp.title}: ${error.message}`);
      failed++;
    } else if (!data?.length) {
      unmatched.push({ matchId, title: sp.title });
    } else {
      console.log(`  ✓ ${data[0].name} — ${imageUrls.length} image(s)`);
      updated++;
    }
  }

  console.log('\n=== Summary ===');
  console.log(`Updated:    ${updated}`);
  console.log(`Failed:     ${failed}`);
  console.log(`No match:   ${unmatched.length}`);
  if (unmatched.length > 0) {
    console.log('\nUnmatched (no shopify_id match in Supabase):');
    for (const u of unmatched) {
      console.log(`  - ${u.title} (shopify_id: ${u.matchId})`);
    }
  }
}

sync().catch((err) => {
  console.error('Sync failed:', err);
  process.exit(1);
});
