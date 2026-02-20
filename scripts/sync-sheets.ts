/**
 * CLI Script: Sync Google Sheets to Supabase
 * Usage: npm run sync-sheets
 */

import { syncGoogleSheets } from '../lib/google-sheets/sync';
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '.env' });

async function main() {
  console.log('🔄 Charmed & Dark - Google Sheets Sync\n');

  // Validate environment variables
  const required = [
    'GOOGLE_SHEETS_SPREADSHEET_ID',
    'GOOGLE_SHEETS_CLIENT_EMAIL',
    'GOOGLE_SHEETS_PRIVATE_KEY',
    'NEXT_PUBLIC_SUPABASE_URL',
    'SUPABASE_SERVICE_ROLE_KEY',
  ];

  const missing = required.filter((key) => !process.env[key]);
  
  if (missing.length > 0) {
    console.error('❌ Missing required environment variables:');
    missing.forEach((key) => console.error(`   - ${key}`));
    process.exit(1);
  }

  try {
    const results = await syncGoogleSheets();
    
    console.log('\n✅ Sync completed successfully!');
    console.log(`   Created: ${results.created}`);
    console.log(`   Updated: ${results.updated}`);
    console.log(`   Errors: ${results.errors}`);
    
    if (results.errors > 0) {
      process.exit(1);
    }
  } catch (error) {
    console.error('\n❌ Sync failed:', error);
    process.exit(1);
  }
}

main();
