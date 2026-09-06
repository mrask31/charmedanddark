import 'server-only';
import { cache } from 'react';
import { createClient } from '@supabase/supabase-js';

// This is an identity archive, not a commerce catalog. Existing UUIDs are still
// referenced by Journal, campaigns and customer history; never collapse or delete
// rows just because more than one UUID refers to the same Shopify product.
export const getCatalogIdentities = cache(async function getCatalogIdentities() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) throw new Error('Catalog identity lookup is not configured');

  const client = createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  const identities = [];
  const pageSize = 500;

  for (let offset = 0; ; offset += pageSize) {
    const { data, error } = await client
      .from('products')
      .select('id, shopify_id, slug, handle, shopify_handle')
      .order('id', { ascending: true })
      .range(offset, offset + pageSize - 1);

    if (error) throw new Error('Catalog identity lookup failed', { cause: error });
    identities.push(...(data || []));
    if (!data || data.length < pageSize) break;
  }

  return identities;
});
