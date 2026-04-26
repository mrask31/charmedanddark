import { supabase } from './supabase/client';

// Transform Supabase row to match the prop shape components expect
function transformProduct(row) {
  return {
    id: row.id,
    sku: row.sku,
    name: row.name || row.title,
    slug: row.slug || row.handle,
    category: row.category,
    subcategory: row.subcategory,
    description: row.description || row.lore,  // Prefer clean description, fall back to legacy lore
    price: row.price,                           // Retail price from Supabase
    originalPrice: row.price,                   // Same as price (no strikethrough unless real sale)
    salePrice: null,                            // Only set when there's a genuine sale
    qty: row.qty || row.stock_quantity || 0,
    hidden: row.hidden,
    imageUrls: row.image_urls || (row.image_url ? [row.image_url] : []),
    tags: row.tags || [],
    featured: row.featured || row.is_featured,
    bestSeller: row.best_seller,
    collection: row.collection,
    metaTitle: row.meta_title,
    metaDescription: row.meta_description,
    lore: row.lore,
    shopifyVariantId: row.shopify_variant_id,
    shopify_id: row.shopify_id,
    isVariantParent: row.is_variant_parent || false,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export async function getProducts() {
  console.log('[getProducts] Starting query...');
  console.log('[getProducts] Supabase URL:', process.env.NEXT_PUBLIC_SUPABASE_URL);
  console.log('[getProducts] Has anon key:', !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
  
  try {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .or('hidden.is.null,hidden.eq.false')
      .order('created_at', { ascending: false });

    console.log('[getProducts] Query completed');
    console.log('[getProducts] Error:', error);
    console.log('[getProducts] Data count:', data?.length || 0);
    console.log('[getProducts] First product:', data?.[0]);

    if (error) throw error;
    
    const transformed = (data || []).map(transformProduct);
    console.log('[getProducts] Transformed count:', transformed.length);

    // Batch-fetch variant summaries for products that are variant parents
    const variantParentIds = transformed
      .filter((p) => p.isVariantParent)
      .map((p) => p.id);

    if (variantParentIds.length > 0) {
      const { data: variantRows } = await supabase
        .from('product_variants')
        .select('product_id, variant_type, variant_value')
        .in('product_id', variantParentIds)
        .eq('is_available', true);

      if (variantRows?.length) {
        // Group by product_id → { type: Set(values) }
        const summaryMap = {};
        for (const row of variantRows) {
          if (!summaryMap[row.product_id]) summaryMap[row.product_id] = {};
          if (!summaryMap[row.product_id][row.variant_type]) {
            summaryMap[row.product_id][row.variant_type] = new Set();
          }
          summaryMap[row.product_id][row.variant_type].add(row.variant_value);
        }

        for (const product of transformed) {
          const summary = summaryMap[product.id];
          if (summary) {
            // Only include variant types with 2+ distinct values
            product.variantSummary = Object.entries(summary)
              .filter(([, values]) => values.size >= 2)
              .map(([type, values]) => ({ type, count: values.size }));
            // Clear empty arrays so the card doesn't render anything
            if (product.variantSummary.length === 0) {
              product.variantSummary = null;
            }
          }
        }
      }
    }

    // For Shopify-only products, batch-check if they have real variant options
    const shopifyProducts = transformed.filter(
      (p) => p.shopifyVariantId && !p.variantSummary && !p.isVariantParent
    );

    if (shopifyProducts.length > 0) {
      try {
        const { shopifyFetch } = await import('./shopify/client.js');
        // Fetch variants for each Shopify product (limited concurrency)
        const results = await Promise.allSettled(
          shopifyProducts.map(async (p) => {
            // Use shopify_id (full product GID) if available, otherwise skip
            const productGid = p.shopify_id;
            if (!productGid || !productGid.startsWith('gid://')) return { id: p.id, variants: [] };

            const data = await shopifyFetch({
              query: `query($id: ID!) {
                product(id: $id) {
                  variants(first: 5) { edges { node { title } } }
                }
              }`,
              variables: { id: productGid },
            });
            return { id: p.id, variants: data?.product?.variants?.edges || [] };
          })
        );

        for (const result of results) {
          if (result.status !== 'fulfilled') continue;
          const { id, variants } = result.value;
          // Shopify creates a single "Default Title" variant for products with no real options
          const hasRealOptions =
            variants.length > 1 ||
            (variants.length === 1 && variants[0].node.title !== 'Default Title');
          if (hasRealOptions) {
            const product = transformed.find((p) => p.id === id);
            if (product) product.hasShopifyOptions = true;
          }
        }
      } catch (err) {
        console.error('[getProducts] Shopify variant check failed:', err.message);
      }
    }

    return transformed;
  } catch (err) {
    console.error('[getProducts] Supabase query failed:', err.message);
    console.error('[getProducts] Full error:', err);
    console.log('[getProducts] Falling back to CSV...');
    
    // Fallback to CSV
    const { getProducts: getCSV } = await import('./products-csv.js');
    const csvProducts = getCSV();
    console.log('[getProducts] CSV fallback returned:', csvProducts.length, 'products');
    return csvProducts;
  }
}

export async function getProductBySlug(slug) {
  try {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .or(`slug.eq.${slug},handle.eq.${slug}`)
      .or('hidden.is.null,hidden.eq.false')
      .single();

    if (error) throw error;
    if (!data) return null;

    const product = transformProduct(data);

    // Always fetch variants from product_variants table for this product
    const { data: variants } = await supabase
      .from('product_variants')
      .select('id, variant_type, variant_value, price_override, stock_quantity, image_url, sku, sort_order, is_available')
      .eq('product_id', data.id)
      .eq('is_available', true)
      .order('sort_order');

    product.productVariants = variants || [];

    return product;
  } catch (err) {
    console.error(`Supabase getProductBySlug(${slug}) failed, falling back to CSV:`, err.message);
    const { getProductBySlug: getCSV } = await import('./products-csv.js');
    return getCSV(slug);
  }
}

// Additional query functions for the shop page
export async function getProductsByCategory(category) {
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .eq('category', category)
    .or('hidden.is.null,hidden.eq.false')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('getProductsByCategory error:', error.message);
    return [];
  }
  return (data || []).map(transformProduct);
}

export async function getProductsByCollection(collection) {
  const { data, error} = await supabase
    .from('products')
    .select('*')
    .eq('collection', collection)
    .or('hidden.is.null,hidden.eq.false')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('getProductsByCollection error:', error.message);
    return [];
  }
  return (data || []).map(transformProduct);
}

export async function getBestSellers() {
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .eq('best_seller', true)
    .or('hidden.is.null,hidden.eq.false')
    .order('created_at', { ascending: false })
    .limit(8);

  if (error) {
    console.error('getBestSellers error:', error.message);
    return [];
  }
  return (data || []).map(transformProduct);
}

export async function getFeaturedProducts() {
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .or('featured.eq.true,is_featured.eq.true')
    .or('hidden.is.null,hidden.eq.false')
    .order('created_at', { ascending: false })
    .limit(4);

  if (error) {
    console.error('getFeaturedProducts error:', error.message);
    return [];
  }
  return (data || []).map(transformProduct);
}
