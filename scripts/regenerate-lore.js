// scripts/regenerate-lore.js
// Regenerate all product lore with updated AI prompt
// Run with: node scripts/regenerate-lore.js

import dotenv from 'dotenv';

// Load .env.local explicitly
dotenv.config({ path: '.env.local' });

const SYNC_API_SECRET = process.env.SYNC_API_SECRET;
const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';

if (!SYNC_API_SECRET) {
  console.error('Error: Missing SYNC_API_SECRET in .env.local');
  process.exit(1);
}

async function regenerateLore() {
  console.log('Starting lore regeneration...');
  console.log('This will regenerate ALL product lore with the updated AI prompt.');
  console.log('');
  
  try {
    const response = await fetch(`${BASE_URL}/api/admin/sync-products?force=true`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${SYNC_API_SECRET}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Sync failed (${response.status}): ${errorText}`);
    }

    const result = await response.json();
    
    console.log('Lore regeneration complete!');
    console.log('');
    console.log('Summary:');
    console.log(`  Total products synced: ${result.synced}`);
    console.log(`  Lore generated: ${result.lore_generated}`);
    console.log(`  Force regenerate: ${result.force_regenerate}`);
    console.log(`  Errors: ${result.errors}`);
    
    if (result.errors > 0) {
      console.log('');
      console.log('Error details:');
      result.error_details.forEach((err, index) => {
        console.log(`  ${index + 1}. ${err.product}: ${err.error}`);
      });
    }
  } catch (error) {
    console.error('Regeneration failed:', error.message);
    process.exit(1);
  }
}

regenerateLore();
