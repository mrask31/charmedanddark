import { supabaseAdmin } from '@/lib/supabase/admin';
import { getAllShopifyProducts } from '@/lib/shopify/queries';
import { generateProductLore } from '@/lib/ai/generate-lore';
import { NextResponse } from 'next/server';

// Simple auth check — replace with proper admin auth in Phase 2
function isAuthorized(request) {
  const authHeader = request.headers.get('authorization');
  return authHeader === `Bearer ${process.env.SYNC_API_SECRET}`;
}

function slugify(text) {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

function sanitizeHandle(handle) {
  return handle
    .toLowerCase()
    .replace(/[^a-z0-9-]/g, '-')
    .replace(/-+/g, '-')
    .replace(/(^-|-$)/g, '');
}

function transformShopifyProduct(shopifyProduct) {
  const variant = shopifyProduct.variants.edges[0]?.node;
  const images = shopifyProduct.images.edges.map(({ node }) => node.url);

  return {
    shopify_id: shopifyProduct.id,
    shopify_variant_id: variant?.id || null,
    name: shopifyProduct.title,
    slug: sanitizeHandle(shopifyProduct.handle),
    handle: sanitizeHandle(shopifyProduct.handle),
    title: shopifyProduct.title,
    category: shopifyProduct.productType || null,
    description: shopifyProduct.description || null,
    price: variant?.compareAtPrice?.amount
      ? parseFloat(variant.compareAtPrice.amount)
      : parseFloat(variant?.price?.amount || 0),
    sale_price: parseFloat(variant?.price?.amount || 0),
    sku: variant?.sku || null,
    qty: variant?.quantityAvailable || 0,
    stock_quantity: variant?.quantityAvailable || 0,
    hidden: false,
    image_urls: images,
    image_url: images[0] || null,
    tags: shopifyProduct.tags || [],
  };
}

export async function POST(request) {
  // Auth check
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    console.log('Starting Vault Sync...');

    // 1. Pull from Shopify
    const shopifyProducts = await getAllShopifyProducts();
    console.log(`Fetched ${shopifyProducts.length} products from Shopify`);

    // 2. Transform and upsert to Supabase
    let synced = 0;
    let loreGenerated = 0;
    let errors = [];

    for (const sp of shopifyProducts) {
      const record = transformShopifyProduct(sp);

      // Upsert product data
      const { error: upsertError } = await supabaseAdmin
        .from('products')
        .upsert(record, { onConflict: 'handle' });

      if (upsertError) {
        errors.push({ product: record.name, error: upsertError.message });
        console.error(`Sync error for ${record.name}:`, upsertError.message);
        continue;
      }
      synced++;

      // Check if product needs lore
      const { data: existing } = await supabaseAdmin
        .from('products')
        .select('lore')
        .eq('handle', record.handle)
        .single();

      if (!existing?.lore) {
        try {
          console.log(`Generating lore for: ${record.name}`);
          const lore = await generateProductLore(record);
          if (lore) {
            await supabaseAdmin
              .from('products')
              .update({ lore })
              .eq('handle', record.handle);
            loreGenerated++;
            console.log(`Lore generated for: ${record.name}`);
          }
        } catch (loreError) {
          console.error(`Lore generation failed for ${record.name}:`, loreError.message);
          // Don't add to errors array — lore failure shouldn't block the sync
        }
      }
    }

    // 3. Return summary
    const summary = {
      success: true,
      total_shopify: shopifyProducts.length,
      synced,
      lore_generated: loreGenerated,
      errors: errors.length,
      error_details: errors,
      synced_at: new Date().toISOString(),
    };

    console.log('Vault Sync complete:', summary);
    return NextResponse.json(summary);
  } catch (err) {
    console.error('Vault Sync failed:', err);
    return NextResponse.json(
      { error: 'Sync failed', message: err.message },
      { status: 500 }
    );
  }
}
