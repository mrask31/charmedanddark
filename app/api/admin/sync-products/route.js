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
    // Check for force regeneration flag
    const url = new URL(request.url);
    const forceRegenerate = url.searchParams.get('force') === 'true';
    
    console.log('Starting Vault Sync...');
    if (forceRegenerate) {
      console.log('Force regeneration enabled - will regenerate all lore');
    }

    // 1. Pull from Shopify
    const shopifyProducts = await getAllShopifyProducts();
    console.log(`Fetched ${shopifyProducts.length} products from Shopify`);

    // 2. Transform and upsert to Supabase
    let synced = 0;
    let loreGenerated = 0;
    let preserved = 0;
    let errors = [];

    for (const sp of shopifyProducts) {
      const shopifyData = transformShopifyProduct(sp);

      // Check if product already exists
      const { data: existing } = await supabaseAdmin
        .from('products')
        .select('id, name, title, lore')
        .eq('handle', shopifyData.handle)
        .single();

      let record;
      
      if (existing) {
        // Product exists - preserve custom name and lore (unless force regenerate)
        record = {
          ...shopifyData,
          // Preserve custom name if it differs from Shopify title
          name: (existing.name && existing.name !== shopifyData.title) 
            ? existing.name 
            : shopifyData.name,
          // Preserve existing lore (unless force regenerate)
          lore: forceRegenerate ? undefined : (existing.lore || undefined),
        };
        
        if (!forceRegenerate && (existing.name !== shopifyData.title || existing.lore)) {
          preserved++;
          console.log(`Preserving custom content for: ${existing.name || shopifyData.name}`);
        }
      } else {
        // New product - use all Shopify data
        record = shopifyData;
      }

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

      // Generate lore for products without it OR if force regenerate is enabled
      if (!existing?.lore || forceRegenerate) {
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
      preserved_custom_content: preserved,
      lore_generated: loreGenerated,
      force_regenerate: forceRegenerate,
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
