/**
 * scripts/hide-draft-products.js
 *
 * One-time fix: Hides products that leaked onto the storefront because the sync
 * incorrectly treated Printify/made-to-order DRAFT products as available.
 *
 * Fixed in this commit: the sync now uses `sp.status === 'ACTIVE'` exclusively,
 * so future syncs will correctly hide DRAFT products.
 *
 * Run with: node scripts/hide-draft-products.js
 */
import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';

dotenv.config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// Known DRAFT products that leaked (identified during investigation)
const DRAFT_PRODUCT_IDS = [
  '0a7eb136-974a-4793-b0f9-b8b1b1fbab75', // The Moon Maiden Crop Top
];

async function main() {
  console.log('Hiding known DRAFT products that leaked onto storefront...\n');

  for (const id of DRAFT_PRODUCT_IDS) {
    const { data: before } = await supabase
      .from('products')
      .select('id, name, hidden, is_available')
      .eq('id', id)
      .single();

    if (!before) {
      console.log(`  [SKIP] ID ${id} not found`);
      continue;
    }

    if (before.hidden && !before.is_available) {
      console.log(`  [ALREADY HIDDEN] ${before.name}`);
      continue;
    }

    const { error } = await supabase
      .from('products')
      .update({ hidden: true, is_available: false })
      .eq('id', id);

    if (error) {
      console.error(`  [ERROR] ${before.name}: ${error.message}`);
    } else {
      console.log(`  [HIDDEN] ${before.name}`);
    }
  }

  console.log('\nDone. Next sync will correctly handle DRAFT status.');
}

main().catch((err) => { console.error(err); process.exit(1); });
