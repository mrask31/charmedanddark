import { NextResponse } from 'next/server';
import { getSupabaseClient } from '@/lib/supabase/client';

/**
 * Admin API: Sync Products from Shopify to Supabase
 * 
 * Usage: GET /api/admin/sync-products
 * 
 * This is a one-time bootstrap sync to populate the database
 */

interface ShopifyProduct {
  id: string;
  handle: string;
  title: string;
  description: string;
  vendor: string;
  productType: string;
  status: string;
  tags: string[];
  priceRangeV2: {
    minVariantPrice: {
      amount: string;
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
        inventoryQuantity: number;
      };
    }>;
  };
}

async function fetchAllProducts(): Promise<ShopifyProduct[]> {
  const token = process.env.SHOPIFY_ADMIN_ACCESS_TOKEN;
  const domain = process.env.NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN;

  if (!token || !domain) {
    throw new Error('Missing Shopify credentials');
  }

  const products: ShopifyProduct[] = [];
  let hasNextPage = true;
  let cursor: string | null = null;

  while (hasNextPage) {
    const query = `
      query getProducts($first: Int!, $after: String) {
        products(first: $first, after: $after, query: "status:active") {
          pageInfo {
            hasNextPage
            endCursor
          }
          edges {
            node {
              id
              handle
              title
              description
              vendor
              productType
              status
              tags
              priceRangeV2 {
                minVariantPrice {
                  amount
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
              variants(first: 1) {
                edges {
                  node {
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
      `https://${domain}/admin/api/2024-01/graphql.json`,
      {
        method: 'POST',
        headers: {
          'X-Shopify-Access-Token': token,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query,
          variables: { first: 50, after: cursor },
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
  }

  return products;
}

export async function GET() {
  try {
    // Only allow in development or with auth token
    if (process.env.NODE_ENV === 'production') {
      return NextResponse.json(
        { error: 'This endpoint is disabled in production' },
        { status: 403 }
      );
    }

    const supabase = getSupabaseClient();

    // Fetch products from Shopify
    const products = await fetchAllProducts();

    if (products.length === 0) {
      return NextResponse.json({
        success: true,
        message: 'No products found in Shopify',
        inserted: 0,
        updated: 0,
      });
    }

    let insertCount = 0;
    let updateCount = 0;
    const errors: string[] = [];

    // Sync each product
    for (const product of products) {
      try {
        const shopifyId = product.id.split('/').pop() || product.id;
        const stockQuantity = product.variants.edges[0]?.node?.inventoryQuantity || 0;

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

        // Check if exists
        const { data: existing } = await supabase
          .from('products')
          .select('id')
          .eq('handle', product.handle)
          .single();

        if (existing) {
          const { error } = await supabase
            .from('products')
            .update(productData)
            .eq('handle', product.handle);

          if (error) {
            errors.push(`Update ${product.handle}: ${error.message}`);
          } else {
            updateCount++;
          }
        } else {
          const { error } = await supabase
            .from('products')
            .insert(productData);

          if (error) {
            errors.push(`Insert ${product.handle}: ${error.message}`);
          } else {
            insertCount++;
          }
        }
      } catch (error) {
        errors.push(`Process ${product.handle}: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    }

    return NextResponse.json({
      success: true,
      summary: {
        totalProducts: products.length,
        inserted: insertCount,
        updated: updateCount,
        errors: errors.length,
      },
      errors: errors.length > 0 ? errors.slice(0, 10) : undefined,
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
