/**
 * scripts/hide-stale-kisslock-duplicates.js
 *
 * Hides stale duplicate Kiss Lock Bag products from the storefront.
 *
 * These old product records were synced from Shopify before the products were
 * renamed/replaced. Shopify now only has the new active versions:
 *   - Cowgirl on Horseback Kiss Lock Bag – Western Gothic Linen Handbag
 *   - Marigold Memory Sugar Skull Kiss Lock Bag
 *
 * The old duplicates should be hidden (not deleted) so they don't appear on
 * the storefront but can be recovered if needed.
 *
 * Run with: node scripts/hide-stale-kisslock-duplicates.js
 */

import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';

dotenv.config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// Old duplicate handles/title patterns to hide
const STALE_HANDLES = [
  'cow-girl-kiss-lock-bag-in-cotton-linen-blended-material',
  'sugar-skull-kiss-lock-bag-in-linen-cotton-blend',
];

const STALE_TITLE_PATTERNS = [
  'Cow Girl Kiss Lock Bag in Cotton Linen Blended Material',
  'SUGAR SKULL KISS LOCK BAG IN LINEN + COTTON BLEND',
];

async function main() {
  console.log('Searching for stale Kiss Lock duplicate products...\n');

  // Search by handle (slug)
  const { data: byHandle, error: handleErr } = await supabase
    .from('products')
    .select('id, title, name, slug, handle, hidden, is_available, shopify_id')
    .or(STALE_HANDLES.map((h) => `handle.eq.${h},slug.eq.${h}`).join(','));

  if (handleErr) {
    console.error('Error searching by handle:', handleErr.message);
  } else {
    console.log(`Found ${byHandle?.length || 0} products by handle:`);
    byHandle?.forEach((p) => console.log(`  - [${p.id}] ${p.title || p.name} (slug: ${p.slug || p.handle}) hidden=${p.hidden} is_available=${p.is_available}`));
  }

  // Search by title (case-insensitive)
  const { data: byTitle, error: titleErr } = await supabase
    .from('products')
    .select('id, title, name, slug, handle, hidden, is_available, shopify_id')
    .or(STALE_TITLE_PATTERNS.map((t) => `title.ilike.%${t}%,name.ilike.%${t}%`).join(','));

  if (titleErr) {
    console.error('Error searching by title:', titleErr.message);
  } else {
    console.log(`\nFound ${byTitle?.length || 0} products by title:`);
    byTitle?.forEach((p) => console.log(`  - [${p.id}] ${p.title || p.name} (slug: ${p.slug || p.handle}) hidden=${p.hidden} is_available=${p.is_available}`));
  }

  // Combine unique IDs to hide
  const allFound = [...(byHandle || []), ...(byTitle || [])];
  const uniqueIds = [...new Set(allFound.map((p) => p.id))];
  const toHide = allFound.filter((p) => uniqueIds.includes(p.id) && (!p.hidden || p.is_available !== false));

  if (toHide.length === 0) {
    console.log('\nNo visible stale duplicates found. Nothing to hide.');
    return;
  }

  const idsToHide = [...new Set(toHide.map((p) => p.id))];
  console.log(`\nHiding ${idsToHide.length} stale product(s)...`);

  const { error: updateErr } = await supabase
    .from('products')
    .update({ hidden: true, is_available: false })
    .in('id', idsToHide);

  if (updateErr) {
    console.error('Failed to hide products:', updateErr.message);
    process.exit(1);
  }

  console.log('Done. Stale duplicates are now hidden from the storefront.');
  console.log('\nNote: These products were NOT deleted. They can be unhidden if needed.');
}

main().catch((err) => {
  console.error('Unexpected error:', err);
  process.exit(1);
});
