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
    description: row.lore || row.description,  // Prefer AI lore if available, fall back to description
    price: row.sale_price || row.price,         // Current selling price
    originalPrice: row.price,                   // Original price for strikethrough display
    salePrice: row.sale_price,
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
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export async function getProducts() {
  try {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .or('hidden.is.null,hidden.eq.false')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return (data || []).map(transformProduct);
  } catch (err) {
    console.error('Supabase getProducts failed, falling back to CSV:', err.message);
    // Fallback to CSV
    const { getProducts: getCSV } = await import('./products-csv.js');
    return getCSV();
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
    return data ? transformProduct(data) : null;
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
