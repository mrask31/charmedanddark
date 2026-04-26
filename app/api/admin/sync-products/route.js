import { supabaseAdmin } from '@/lib/supabase/admin';
import { NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';

function isAuthorized(request) {
  const authHeader = request.headers.get('authorization');
  return authHeader === `Bearer ${process.env.SYNC_SECRET_KEY}`;
}

// Sanitize Shopify handles — remove emoji and non-ASCII characters
function sanitizeHandle(handle) {
  if (!handle) return handle;
  return handle
    .replace(/[^\x00-\x7F]/g, '')
    .replace(/[^a-z0-9-]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

// Category mapping from Shopify productType
function mapCategory(productType) {
  if (!productType) return 'Home Decor';
  const t = productType.trim();
  if (['Hoodie', 'T-Shirt', 'Tank Top', 'Hats', 'Apparel'].includes(t)) return 'Apparel';
  if (['Candle', 'Ritual'].includes(t)) return 'Ritual';
  if (t === 'Home Decor') return 'Home Decor';
  if (t === 'Wall Art') return 'Wall Art';
  if (t === 'Accessories') return 'Accessories';
  return 'Home Decor';
}

// Vendor-based category fallback
const VENDOR_CATEGORY_MAP = {
  'COMECO INC': 'Accessories',
  'The Gilded Witch': 'Accessories',
  'Candles Meta': 'Ritual',
  'Something Different Wholesale': 'Ritual',
  'Picki Nicki': 'Ritual',
  'Primitives by Kathy': 'Ritual',
  'Black Market Art': 'Wall Art',
  'Charmed & Dark': 'Apparel',
};

// Tag-based category fallback when productType mapping returns default
function refineCategoryByTags(category, tags) {
  if (category !== 'Home Decor' || !tags?.length) return category;
  const tagSet = tags.map((t) => t.toLowerCase());
  if (tagSet.some((t) => ['candle', 'ritual', 'sage', 'smudge'].includes(t))) return 'Ritual';
  if (tagSet.some((t) => ['jewelry', 'earring', 'necklace', 'bag', 'bracelet'].includes(t))) return 'Accessories';
  if (tagSet.some((t) => ['wall art', 'art print', 'canvas'].includes(t))) return 'Wall Art';
  return category;
}

// Parse a Shopify price value safely as dollars — NO multiplication.
// Shopify Admin API returns amount as a string like "18.81" (dollars).
function parseDollars(value) {
  if (!value) return 0;
  const parsed = parseFloat(String(value).replace(/[^0-9.]/g, ''));
  return isNaN(parsed) ? 0 : parsed;
}

const ADMIN_PRODUCTS_QUERY = `
  query Products($first: Int!, $after: String) {
    products(first: $first, after: $after) {
      pageInfo { hasNextPage endCursor }
      edges {
        node {
          id
          title
          handle
          descriptionHtml
          productType
          vendor
          status
          tags
          totalInventory
          images(first: 10) {
            edges { node { url altText } }
          }
          variants(first: 50) {
            edges {
              node {
                id
                title
                sku
                price
                availableForSale
                selectedOptions { name value }
                image { url altText }
              }
            }
          }
          priceRange {
            minVariantPrice { amount currencyCode }
          }
        }
      }
    }
  }
`;

async function adminFetch(query, variables = {}) {
  const domain = process.env.SHOPIFY_STORE_DOMAIN;
  const token = process.env.SHOPIFY_ADMIN_ACCESS_TOKEN;
  const url = `https://${domain}/admin/api/2024-01/graphql.json`;

  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Shopify-Access-Token': token,
    },
    body: JSON.stringify({ query, variables }),
  });

  const json = await res.json();
  if (json.errors) throw new Error(json.errors[0]?.message || 'Shopify Admin API error');
  return json.data;
}

async function fetchAllProducts() {
  const all = [];
  let hasNextPage = true;
  let after = null;

  while (hasNextPage) {
    const data = await adminFetch(ADMIN_PRODUCTS_QUERY, { first: 250, after });
    const products = data.products.edges.map(({ node }) => node);
    all.push(...products);
    hasNextPage = data.products.pageInfo.hasNextPage;
    after = data.products.pageInfo.endCursor;
  }

  return all;
}

export async function POST(request) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const startTime = Date.now();
  let productsSynced = 0;
  let variantsSynced = 0;
  let productsSkipped = 0;
  const errors = [];

  try {
    console.log('Starting Shopify Admin sync...');
    const shopifyProducts = await fetchAllProducts();
    console.log(`Fetched ${shopifyProducts.length} products from Shopify Admin`);

    for (const sp of shopifyProducts) {
      try {

        // Skip stickers
        if (sp.productType === 'Paper products') {
          productsSkipped++;
          continue;
        }

        // Skip drafts entirely
        if (sp.status === 'DRAFT') {
          productsSkipped++;
          continue;
        }

        const isPrintify = sp.vendor === 'Printify' || (sp.tags && sp.tags.includes('Printify'));
        const isMadeToOrder = isPrintify || sp.vendor === 'Charmed & Dark';
        const isActive = sp.status === 'ACTIVE' || isMadeToOrder;
        let category = mapCategory(sp.productType);
        // Vendor-based fallback
        if (category === 'Home Decor' && VENDOR_CATEGORY_MAP[sp.vendor]) {
          category = VENDOR_CATEGORY_MAP[sp.vendor];
        }
        // Tag-based fallback
        category = refineCategoryByTags(category, sp.tags);
        const imageObjects = sp.images.edges.map(({ node }, i) => ({
          url: node.url,
          alt: node.altText || '',
          position: i,
        }));
        const imageUrls = imageObjects.map((img) => img.url);

        // Price parsing with debug logging
        const rawMinPrice = sp.priceRange?.minVariantPrice?.amount;
        const minPrice = parseDollars(rawMinPrice);

        // Safety: warn if price looks like cents (> $500 for non-bedding/furniture)
        const highPriceCategories = ['Bedding', 'Furniture', 'Home Decor'];
        if (minPrice > 500 && !highPriceCategories.includes(category)) {
          console.warn(`[PRICE WARNING] Suspicious price for ${sp.title}: $${minPrice} — may be in cents`);
        }

        // Stock: made-to-order products (Printify, Charmed & Dark) use deny inventory policy
        const variants = sp.variants.edges.map(({ node }) => node);
        const stockQty = isMadeToOrder
          ? 999
          : (sp.totalInventory ?? variants.reduce((sum, v) => sum + (v.inventoryQuantity || 0), 0));

        // Select → Update or Insert (avoids upsert conflict issues)
        const cleanHandle = sanitizeHandle(sp.handle);
        const productData = {
          shopify_id: sp.id,
          shopify_handle: cleanHandle,
          handle: cleanHandle,
          slug: cleanHandle,
          name: sp.title,
          title: sp.title,
          description: sp.descriptionHtml,
          category,
          price: minPrice,
          stock_quantity: stockQty,
          qty: stockQty,
          is_available: isActive,
          hidden: !isActive,
          image_url: imageUrls[0] ?? null,
          image_urls: imageUrls,
          images: imageObjects,
          tags: sp.tags || [],
          vendor: sp.vendor || null,
        };

        // Check if product already exists by shopify_handle
        const { data: existing } = await supabaseAdmin
          .from('products')
          .select('id, description')
          .eq('shopify_handle', cleanHandle)
          .maybeSingle();

        let productId;

        if (existing) {
          // Check if existing description is clean — if so, preserve it
          const existingDesc = existing.description || '';
          const isClean = existingDesc.length > 80
            && !existingDesc.includes('```')
            && !existingDesc.includes('"lore"')
            && !existingDesc.includes('"name":')
            && !existingDesc.includes('Gildan')
            && !existingDesc.includes('ring-spun')
            && !existingDesc.includes('Place your custom')
            && !existingDesc.includes('Printify')
            && !existingDesc.includes('.: Materials');

          const updateData = {
            ...productData,
            description: isClean ? existingDesc : productData.description,
          };

          // Update existing product
          const { error: updateErr } = await supabaseAdmin
            .from('products')
            .update(updateData)
            .eq('id', existing.id);

          if (updateErr) {
            errors.push({ product: sp.title, error: `Update: ${updateErr.message}` });
            continue;
          }
          productId = existing.id;
        } else {
          // Insert new product
          const { data: inserted, error: insertErr } = await supabaseAdmin
            .from('products')
            .insert(productData)
            .select('id')
            .single();

          if (insertErr) {
            errors.push({ product: sp.title, error: `Insert: ${insertErr.message}` });
            continue;
          }
          productId = inserted.id;
        }

        if (!productId) {
          errors.push({ product: sp.title, error: 'No product ID after select→update/insert' });
          continue;
        }

        productsSynced++;

        // Delete existing variants for this product
        await supabaseAdmin
          .from('product_variants')
          .delete()
          .eq('product_id', productId);

        // Re-insert variants
        // Skip single "Default Title" variant (not a real option)
        const hasRealOptions = variants.length > 1 ||
          (variants.length === 1 && variants[0].title !== 'Default Title');

        if (hasRealOptions) {
          const variantRows = [];
          for (let i = 0; i < variants.length; i++) {
            const v = variants[i];
            for (const opt of v.selectedOptions) {
              if (opt.name === 'Title' && opt.value === 'Default Title') continue;
              variantRows.push({
                product_id: productId,
                variant_type: opt.name.toLowerCase(),
                variant_value: opt.value,
                price_override: parseDollars(v.price),
                is_available: isMadeToOrder ? true : v.availableForSale,
                sku: v.sku || null,
                image_url: v.image?.url || null,
                sort_order: i,
              });
            }
          }

          // Deduplicate by variant_type + variant_value
          const seen = new Set();
          const uniqueRows = variantRows.filter((row) => {
            const key = `${row.variant_type}:${row.variant_value}`;
            if (seen.has(key)) return false;
            seen.add(key);
            return true;
          });

          if (uniqueRows.length > 0) {
            const { error: variantErr } = await supabaseAdmin
              .from('product_variants')
              .insert(uniqueRows);

            if (variantErr) {
              errors.push({ product: sp.title, error: `Variants: ${variantErr.message}` });
            } else {
              variantsSynced += uniqueRows.length;
            }
          }
        }
      } catch (productErr) {
        errors.push({ product: sp.title, error: productErr.message });
      }
    }

    const durationMs = Date.now() - startTime;

    // Log to sync_log table (best-effort)
    try {
      await supabaseAdmin.from('sync_log').insert({
        products_synced: productsSynced,
        variants_synced: variantsSynced,
        products_skipped: productsSkipped,
        errors,
        duration_ms: durationMs,
      });
    } catch (logErr) {
      console.error('Failed to write sync_log:', logErr.message);
    }

    const summary = {
      success: true,
      products_synced: productsSynced,
      variants_synced: variantsSynced,
      products_skipped: productsSkipped,
      errors,
      duration_ms: durationMs,
    };

    console.log('Sync complete:', summary);

    // Revalidate shop and product pages so fresh data appears immediately
    revalidatePath('/shop');
    revalidatePath('/shop/[slug]', 'page');

    return NextResponse.json(summary);
  } catch (err) {
    console.error('Sync failed:', err);
    return NextResponse.json(
      { success: false, error: err.message, products_synced: productsSynced, errors },
      { status: 500 }
    );
  }
}
