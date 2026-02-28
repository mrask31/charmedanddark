import { NextResponse } from 'next/server';
import { getSupabaseServerClient } from '@/lib/supabase/server';
import { slugify } from '@/lib/utils/slugify';

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
        id: string;
        title: string;
        sku: string;
        price: string;
        inventoryQuantity: number;
        availableForSale: boolean;
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
              variants(first: 100) {
                edges {
                  node {
                    id
                    title
                    sku
                    price
                    inventoryQuantity
                    availableForSale
                  }
                }
              }
            }
          }
        }
      }
    `;

    const response: Response = await fetch(
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

    const data: any = await response.json();

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
    // Temporarily allow in production for initial setup
    // TODO: Add authentication or disable after setup
    const allowInProduction = true; // TEMPORARY: Set to false after setup
    
    if (process.env.NODE_ENV === 'production' && !allowInProduction) {
      return NextResponse.json(
        { error: 'This endpoint is disabled in production' },
        { status: 403 }
      );
    }

    const supabase = getSupabaseServerClient();

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
    const debugLogs: string[] = []; // Collect debug logs for response

    // Sync each product
    for (const product of products) {
      try {
        const shopifyId = product.id.split('/').pop() || product.id;
        
        // CRITICAL: Sanitize handle to pass database check constraint
        // Strips emojis and special characters (e.g., ⚔️-the-charmed-dark-obsidian-zip-hoodie)
        const sanitizedHandle = slugify(product.handle);
        
        // Map variants to Supabase format
        const variants = product.variants.edges.map((edge, index) => {
          const variantId = edge.node.id.split('/').pop() || edge.node.id;
          const price = parseFloat(edge.node.price);
          
          return {
            id: variantId,
            name: edge.node.title,
            sku: edge.node.sku || `${shopifyId}-${index}`,
            price: price,
            house_price: Math.round(price * 0.9), // Dual Pricing Law
            stock_quantity: edge.node.inventoryQuantity,
            options: { size: edge.node.title }, // Map title to size option
          };
        });

        // CRITICAL: Log variant data for debugging
        if (product.handle === 'antique-mirror' || variants.length === 0) {
          const debugMsg = `[SYNC] ${product.handle}: edges=${product.variants.edges.length}, mapped=${variants.length}, data=${JSON.stringify(variants)}`;
          console.log(debugMsg);
          debugLogs.push(debugMsg);
        }

        // Calculate total stock from all variants
        const stockQuantity = variants.reduce((sum, v) => sum + v.stock_quantity, 0);

        const images = product.images.edges.map((edge, index) => ({
          url: edge.node.url,
          position: index,
          alt: edge.node.altText || product.title,
        }));

        const productData = {
          handle: sanitizedHandle, // Use sanitized handle
          title: product.title,
          description: product.description,
          category: product.productType || null,
          price: parseFloat(product.priceRangeV2.minVariantPrice.amount),
          base_price: parseFloat(product.priceRangeV2.minVariantPrice.amount),
          stock_quantity: stockQuantity,
          image_url: images[0]?.url || null,
          images: images.length > 0 ? images : null,
          variants: variants.length > 0 ? variants : null, // Store variants in JSONB (should always have at least 1)
          is_variant_parent: variants.length > 1, // Flag multi-variant products
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
          .eq('handle', sanitizedHandle) // Query with sanitized handle
          .single();

        if (existing) {
          const { error } = await supabase
            .from('products')
            .update(productData)
            .eq('handle', sanitizedHandle); // Update with sanitized handle

          if (error) {
            errors.push(`Update ${sanitizedHandle}: ${error.message}`);
          } else {
            updateCount++;
          }
        } else {
          const { error } = await supabase
            .from('products')
            .insert(productData);

          if (error) {
            errors.push(`Insert ${sanitizedHandle}: ${error.message}`);
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
      debugLogs: debugLogs.length > 0 ? debugLogs : undefined,
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
