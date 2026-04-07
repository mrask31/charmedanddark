import { supabaseAdmin } from '@/lib/supabase/admin';
import { NextResponse } from 'next/server';

const NEEDS_REGENERATION = [
  // Printify boilerplate
  'Place your custom',
  'Add your own design',
  '.: Materials',
  '.: Comes in',
  '.: Please note',
  'Printify',
  // Gildan/generic apparel boilerplate
  'Gildan Softstyle',
  'ring-spun cotton',
  'Comfort Colors introduces',
  'garment-dyed t-shirt',
  'fully customizable',
  // Faire vendor boilerplate (generic, non-brand copy)
  'kitch piece',
  'kitsh accessory',
  'Embrace whimsical charm',
  'Embrace celestial beauty',
  'Show off your love for',
  'Take your Halloween',
  'redefines casual comfort',
  // Generic marketing language
  'Pop them in and you',
  "you won't want to take them off",
  'does all the layering',
];

function needsDescription(desc) {
  if (!desc || desc.trim().length === 0) return true;
  const plain = desc.replace(/<[^>]*>/g, '').trim();
  if (plain.length < 80) return true;
  // Check both raw HTML and stripped text for trigger phrases
  return NEEDS_REGENERATION.some((phrase) => desc.includes(phrase) || plain.includes(phrase));
}

function isAuthorized(request) {
  return request.headers.get('authorization') === `Bearer ${process.env.SYNC_SECRET_KEY}`;
}

function sanitizeDescription(text) {
  if (!text) return text;
  // Remove markdown code fences
  text = text.replace(/^```json\s*/i, '');
  text = text.replace(/^```\s*/i, '');
  text = text.replace(/```\s*$/i, '');
  // If it looks like a JSON object, try to extract the description field
  if (text.trim().startsWith('{')) {
    try {
      const parsed = JSON.parse(text);
      text = parsed.lore || parsed.description || parsed.text || parsed.content || Object.values(parsed)[0];
    } catch {
      text = text.replace(/^\{[^"]*"[^"]*"\s*:\s*"/, '');
      text = text.replace(/"\s*\}$/, '');
    }
  }
  // Remove leading field labels
  text = text.replace(/^"?lore"?\s*:\s*"?/i, '');
  text = text.replace(/^"?description"?\s*:\s*"?/i, '');
  // Remove trailing quote+brace
  text = text.replace(/"?\s*\}?\s*`*$/, '');
  return text.trim();
}

async function generateDescription(product) {
  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': process.env.ANTHROPIC_API_KEY,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 300,
      messages: [{
        role: 'user',
        content: `You are a copywriter for Charmed & Dark, a gothic lifestyle brand. Voice: dark luxury, romantic, sophisticated, atmospheric. Never campy or cheap. Think dark romance novels, candlelit rituals, alternative fashion worn by real people.

Write a product description for: "${product.name}"
Category: ${product.category || 'Home Decor'}
Price: $${product.price || 0}

Rules:
- 2-3 sentences max
- No bullet points
- No ".: " prefixes
- No mention of "60 different sizes" or generic specs
- Evocative, atmospheric language
- End with one sentence about who it's for
- Never use the words: "perfect", "stunning", "beautiful", "amazing", "great"
- Return ONLY the description text, no quotes, no preamble

IMPORTANT: Return ONLY the plain description text. No JSON. No markdown. No backticks. No field names like 'lore' or 'name'. No curly braces. Just the raw paragraph text of the description itself, nothing else.`,
      }],
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Anthropic API ${res.status}: ${err}`);
  }

  const data = await res.json();
  return sanitizeDescription(data.content?.[0]?.text?.trim()) || null;
}

async function updateShopifyDescription(handle, descriptionHtml) {
  const domain = process.env.SHOPIFY_STORE_DOMAIN;
  const token = process.env.SHOPIFY_ADMIN_ACCESS_TOKEN;
  if (!domain || !token || !handle) return { error: 'Missing domain, token, or handle' };

  try {
    // First find the product by handle
    const searchRes = await fetch(`https://${domain}/admin/api/2024-01/graphql.json`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Shopify-Access-Token': token,
      },
      body: JSON.stringify({
        query: `query { products(first: 1, query: "handle:${handle}") { edges { node { id } } } }`,
      }),
    });

    const searchData = await searchRes.json();
    const shopifyGid = searchData?.data?.products?.edges?.[0]?.node?.id;

    if (!shopifyGid) {
      console.warn(`[SHOPIFY DESC] No product found for handle: ${handle}`);
      return { error: `No Shopify product found for handle: ${handle}` };
    }

    // Verify GID format
    if (!shopifyGid.startsWith('gid://shopify/Product/')) {
      console.error(`[SHOPIFY DESC] Unexpected GID format: ${shopifyGid}`);
      return { error: `Unexpected GID format: ${shopifyGid}` };
    }

    console.log(`[SHOPIFY DESC] Updating ${handle} (${shopifyGid})`);

    // Update the product description
    const updateRes = await fetch(`https://${domain}/admin/api/2024-01/graphql.json`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Shopify-Access-Token': token,
      },
      body: JSON.stringify({
        query: `mutation productUpdate($input: ProductInput!) {
          productUpdate(input: $input) {
            product { id }
            userErrors { field message }
          }
        }`,
        variables: {
          input: {
            id: shopifyGid,
            descriptionHtml: `<p>${descriptionHtml}</p>`,
          },
        },
      }),
    });

    const updateData = await updateRes.json();
    const userErrors = updateData?.data?.productUpdate?.userErrors;

    if (userErrors?.length > 0) {
      console.error(`[SHOPIFY DESC] Update errors for ${handle}:`, userErrors);
      return { error: userErrors.map((e) => e.message).join(', ') };
    }

    if (updateData.errors) {
      console.error(`[SHOPIFY DESC] GraphQL errors for ${handle}:`, updateData.errors);
      return { error: updateData.errors[0]?.message || 'GraphQL error' };
    }

    return { success: true };
  } catch (err) {
    console.error(`[SHOPIFY DESC] Exception for ${handle}:`, err.message);
    return { error: err.message };
  }
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function POST(request) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const url = new URL(request.url);
  const forceAll = url.searchParams.get('force') === 'true';

  const startTime = Date.now();
  let generated = 0;
  let skipped = 0;
  const errors = [];

  try {
    // Fetch all products
    const { data: products, error: fetchErr } = await supabaseAdmin
      .from('products')
      .select('id, name, category, price, description, handle, shopify_handle')
      .or('hidden.is.null,hidden.eq.false')
      .order('created_at', { ascending: false });

    if (fetchErr) throw new Error(`Supabase fetch: ${fetchErr.message}`);

    const toProcess = forceAll ? products : products.filter((p) => needsDescription(p.description));
    skipped = products.length - toProcess.length;

    console.log(`[DESCRIPTIONS] ${products.length} total, ${toProcess.length} to generate${forceAll ? ' (FORCE ALL)' : ''}, ${skipped} skipped`);

    // Process in batches of 5
    const BATCH_SIZE = 5;
    for (let i = 0; i < toProcess.length; i += BATCH_SIZE) {
      const batch = toProcess.slice(i, i + BATCH_SIZE);

      const results = await Promise.allSettled(
        batch.map(async (product) => {
          const description = await generateDescription(product);
          if (!description) throw new Error('Empty response from Anthropic');

          // Update Supabase
          const { error: updateErr } = await supabaseAdmin
            .from('products')
            .update({ description })
            .eq('id', product.id);

          if (updateErr) throw new Error(`Supabase update: ${updateErr.message}`);

          // Update Shopify (best-effort)
          const handle = product.shopify_handle || product.handle;
          if (handle) {
            try {
              const shopifyResult = await updateShopifyDescription(handle, description);
              if (shopifyResult?.error) {
                console.error(`[SHOPIFY DESC] Failed for ${product.name}: ${shopifyResult.error}`);
              }
            } catch (shopifyErr) {
              console.error(`Shopify update exception for ${product.name}:`, shopifyErr.message);
            }
          }

          return product.name;
        })
      );

      for (const r of results) {
        if (r.status === 'fulfilled') {
          generated++;
          console.log(`  ✓ ${r.value}`);
        } else {
          errors.push({ error: r.reason?.message || 'Unknown error' });
          console.error(`  ✗ ${r.reason?.message}`);
        }
      }

      // Rate limit delay between batches
      if (i + BATCH_SIZE < toProcess.length) {
        await sleep(1000);
      }
    }

    const summary = {
      success: true,
      generated,
      skipped,
      errors,
      duration_ms: Date.now() - startTime,
    };

    console.log('[DESCRIPTIONS] Complete:', summary);
    return NextResponse.json(summary);
  } catch (err) {
    console.error('[DESCRIPTIONS] Failed:', err);
    return NextResponse.json(
      { success: false, error: err.message, generated, skipped, errors },
      { status: 500 }
    );
  }
}
