/**
 * Sync Shopify Products to Supabase
 * Fetches all active products from Shopify Admin API and inserts into Supabase
 */

import { getSupabaseClient } from '@/lib/supabase/client';

interface ShopifyProduct {
  id: string;
  handle: string;
  title: string;
  description: string;
  descriptionHtml: string;
  vendor: string;
  productType: string;
  status: string;
  tags: string[];
  priceRangeV2: {
    minVariantPrice: {
      amount: string;
      currencyCode: string;
    };
  };
  images: {
    edges: Array<{
      node: {
        url: string;
        altText: string | null;
      };
    }>;
  };
  variants: {
    edges: Array<{
      node: {
        id: string;
        title: string;
        price: string;
        inventoryQuantity: number;
      };
    }>;
  };
}

const SHOPIFY_ADMIN_TOKEN = process.env.SHOPIFY_ADMIN_ACCESS_TOKEN;
const SHOPIFY_STORE_DOMAIN = process.env.NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN;

async function fetchAllProducts(): Promise<ShopifyProduct[]> {
  if (!SHOPIFY_ADMIN_TOKEN || !SHOPIFY_STORE_DOMAIN) {
    throw new Error('Missing Shopify credentials');
  }

  const products: ShopifyProduct[] = [];
  let hasNextPage = true;
  let cursor: string | null = null;

  console.log('📦 Fetching products from Shopify...\n');

  while (hasNextPage) {
    const query = `
      query getProducts($first: Int!, $after: String) {
        products(first: $first, after: $after, query: "status:active") {
          pageInfo {
            hasNextPage
            endCursor
          }
          edges {
            cursor
            node {
              id
              handle
              title
              description
              descriptionHtml
              vendor
              productType
              status
              tags
              priceRangeV2 {
                minVariantPrice {
                  amount
                  currencyCode
                }
              }
              images(first: 10) {
                edges {
                  node {
                    url
                    altText
                  }
                }
              }
              variants(first: 10) {
                edges {
                  node {
                    id
                    title
                    price
                    inventoryQuantity
                  }
                }
              }
            }
          }
        }
      }
    `;

    const response = await fetch(
      `https://${SHOPIFY_STORE_DOMAIN}/admin/api/2024-01/graphql.json`,
      {
        method: 'POST',
        headers: {
          'X-Shopify-Access-Token': SHOPIFY_ADMIN_TOKEN,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query,
          variables: {
            first: 50,
            after: cursor,
          },
        }),
      }
    );

    if (!response.ok) {
      throw new Error(`Shopify API error: ${response.status}`);
    }

    const data = await response.json();

    if (data.errors) {
      throw new Error(`GraphQL errors: ${JSON.stringify(data.errors)}`);
    }

    const edges = data.data?.products?.edges || [];
    products.push(...edges.map((edge: any) => edge.node));

    hasNextPage = data.data?.products?.pageInfo?.hasNextPage || false;
    cursor = data.data?.products?.pageInfo?.endCursor || null;

    console.log(`  Fetched ${products.length} products...`);
  }

  console.log(`\n✅ Fetched ${products.length} total products\n`);
  return products;
}

async function syncToSupabase(products: ShopifyProduct[]) {
  const supabase = getSupabaseClient();
  
  console.log('💾 Syncing to Supabase...\n');

  let insertCount = 0;
  let updateCount = 0;
  let errorCount = 0;

  for (const product of products) {
    try {
      // Extract Shopify numeric ID from GraphQL ID
      const shopifyId = product.id.split('/').pop() || product.id;
      
      // Get first variant for stock quantity
      const firstVariant = product.variants.edges[0]?.node;
      const stockQuantity = firstVariant?.inventoryQuantity || 0;

      // Transform images
      const images = product.images.edges.map((edge, index) => ({
        url: edge.node.url,
        position: index,
        alt: edge.node.altText || product.title,
      }));

      const productData = {
        handle: product.handle,
        title: product.title,
        description: product.description,
        category: product.productType || null,
        price: parseFloat(product.priceRangeV2.minVariantPrice.amount),
        base_price: parseFloat(product.priceRangeV2.minVariantPrice.amount),
        stock_quantity: stockQuantity,
        image_url: images[0]?.url || null,
        images: images.length > 0 ? images : null,
        metadata: {
          shopify_id: shopifyId,
          vendor: product.vendor,
          status: product.status,
          tags: product.tags,
          product_type: product.productType,
        },
        sync_source: 'shopify_admin',
        last_synced_at: new Date().toISOString(),
      };

      // Check if product exists
      const { data: existing } = await supabase
        .from('products')
        .select('id')
        .eq('handle', product.handle)
        .single();

      if (existing) {
        // Update existing product
        const { error } = await supabase
          .from('products')
          .update(productData)
          .eq('handle', product.handle);

        if (error) {
          console.error(`  ❌ Error updating ${product.handle}:`, error.message);
          errorCount++;
        } else {
          updateCount++;
          console.log(`  ✏️  Updated: ${product.title}`);
        }
      } else {
        // Insert new product
        const { error } = await supabase
          .from('products')
          .insert(productData);

        if (error) {
          console.error(`  ❌ Error inserting ${product.handle}:`, error.message);
          errorCount++;
        } else {
          insertCount++;
          console.log(`  ✅ Inserted: ${product.title}`);
        }
      }
    } catch (error) {
      console.error(`  ❌ Error processing ${product.handle}:`, error);
      errorCount++;
    }
  }

  console.log('\n' + '='.repeat(60));
  console.log('SYNC SUMMARY');
  console.log('='.repeat(60));
  console.log(`Total Products: ${products.length}`);
  console.log(`✅ Inserted: ${insertCount}`);
  console.log(`✏️  Updated: ${updateCount}`);
  console.log(`❌ Errors: ${errorCount}`);
  console.log('='.repeat(60));
}

async function main() {
  try {
    console.log('🚀 Shopify → Supabase Product Sync\n');
    console.log('='.repeat(60));
    console.log('');

    // Fetch all products from Shopify
    const products = await fetchAllProducts();

    if (products.length === 0) {
      console.log('⚠️  No products found in Shopify');
      return;
    }

    // Sync to Supabase
    await syncToSupabase(products);

    console.log('\n✅ Sync complete!');
    console.log('\nVerify at: https://charmedanddark.vercel.app/shop');
  } catch (error) {
    console.error('\n❌ Sync failed:', error);
    process.exit(1);
  }
}

// Run sync
main();
