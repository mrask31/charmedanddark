/**
 * Update the 5 published journal posts with real image URLs.
 *
 * Run with:
 *   node scripts/update-journal-images.js
 *
 * Sets both cover_image_url (used by PostCard listing) and featured_image_url (used by post detail hero).
 * Safe to re-run — overwrites image fields idempotently.
 */

import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';

dotenv.config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

const imageAssignments = [
  {
    slug: 'what-haunted-america-taught-us-about-statement-pieces',
    // Ghost Cat & Pumpkin Kiss Lock Bag — the event favorite referenced in the post
    image_url: 'https://cdn.shopify.com/s/files/1/0861/2079/2098/files/CatGhost1.png?v=1781128612',
  },
  {
    slug: 'why-one-gothic-bag-can-change-the-whole-look',
    // Celestial Kisslock Bag — elegant, styling-focused
    image_url: 'https://cdn.shopify.com/s/files/1/0861/2079/2098/files/processed-image_fd64c460-8eed-4bfd-aae0-62661a51590d.png?v=1774041309',
  },
  {
    slug: 'summerween-is-not-a-season-its-a-mood',
    // Summerween Trucker Snapback Hat — iconic Summerween piece
    image_url: 'https://cdn.shopify.com/s/files/1/0861/2079/2098/files/20260508122159-1f14ad88-2c8c-6c2c-8bc9-cafecbf14569.png?v=1778243048',
  },
  {
    slug: 'how-to-build-a-dark-home-without-making-it-feel-like-a-set',
    // Ravenwood Branch Candelabra — candlelit, ritual-object aesthetic
    image_url: 'https://cdn.shopify.com/s/files/1/0861/2079/2098/files/processed-image_ca48a535-6300-4382-9ada-4551c92cceaf.png?v=1774039023',
  },
  {
    slug: 'welcome-to-the-sanctuary-what-members-get',
    // Sanctuary membership image — existing local asset served from /images/homepage/
    image_url: '/images/homepage/sanctuary-membership.jpg',
  },
];

async function updateImages() {
  console.log('🖼️  Updating journal post images...\n');

  let updated = 0;
  let failed = 0;

  for (const { slug, image_url } of imageAssignments) {
    const { error } = await supabase
      .from('blog_posts')
      .update({
        cover_image_url: image_url,
        featured_image_url: image_url,
        updated_at: new Date().toISOString(),
      })
      .eq('slug', slug);

    if (error) {
      console.error(`  ✗ ${slug}: ${error.message}`);
      failed++;
    } else {
      console.log(`  ✓ ${slug}`);
      updated++;
    }
  }

  console.log(`\n✨ Done. Updated: ${updated}, Failed: ${failed}`);
}

updateImages().catch((err) => {
  console.error('Update failed:', err);
  process.exit(1);
});
