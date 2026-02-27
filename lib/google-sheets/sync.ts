/**
 * Google Sheets Sync for Charmed & Dark Physical Inventory
 * Syncs product data from Google Sheets to Supabase
 */

import { google } from 'googleapis';
import { createClient } from '@supabase/supabase-js';
import { slugify } from '../utils/slugify';

// Google Sheets configuration
const SPREADSHEET_ID = process.env.GOOGLE_SHEETS_SPREADSHEET_ID!;
const SHEET_NAME = process.env.GOOGLE_SHEETS_SHEET_NAME || 'Physical Inventory';
const RANGE = `${SHEET_NAME}!A2:K`; // 11 columns: Handle through Image URL

// Supabase configuration
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

interface SheetRow {
  handle: string;
  title: string;
  line1: string;
  line2: string;
  line3: string;
  basePrice: number;
  housePrice: number;
  stock: number;
  category: string;
  options?: string; // JSON string of options (column J)
  imageUrl?: string; // Direct image URL (column K)
}

/**
 * Parse a row from Google Sheets
 */
function parseSheetRow(row: string[]): SheetRow | null {
  // Skip empty rows
  if (!row[0] || !row[1]) return null;

  // Sanitize handle: strip emojis and special characters
  const rawHandle = row[0]?.trim() || '';
  const cleanHandle = slugify(rawHandle);

  return {
    handle: cleanHandle,
    title: row[1]?.trim() || '',
    line1: row[2]?.trim() || '',
    line2: row[3]?.trim() || '',
    line3: row[4]?.trim() || '',
    basePrice: parseFloat(row[5]) || 0,
    housePrice: parseFloat(row[6]) || 0,
    stock: parseInt(row[7]) || 0,
    category: row[8]?.trim() || '',
    options: row[9]?.trim() || undefined,
    imageUrl: row[10]?.trim() || undefined,
  };
}

/**
 * Get Google Sheets client
 */
async function getGoogleSheetsClient() {
  const auth = new google.auth.GoogleAuth({
    credentials: {
      client_email: process.env.GOOGLE_SHEETS_CLIENT_EMAIL,
      private_key: process.env.GOOGLE_SHEETS_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    },
    scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly'],
  });

  const sheets = google.sheets({ version: 'v4', auth });
  return sheets;
}

/**
 * Fetch data from Google Sheets
 */
export async function fetchSheetData(): Promise<SheetRow[]> {
  try {
    const sheets = await getGoogleSheetsClient();
    
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID,
      range: RANGE,
    });

    const rows = response.data.values || [];
    const products: SheetRow[] = [];

    for (const row of rows) {
      const product = parseSheetRow(row);
      if (product) {
        products.push(product);
      }
    }

    return products;
  } catch (error) {
    console.error('Error fetching Google Sheets data:', error);
    throw error;
  }
}

/**
 * Sync products to Supabase
 */
export async function syncProductsToSupabase(products: SheetRow[]) {
  const supabase = createClient(supabaseUrl, supabaseServiceKey);

  const results = {
    created: 0,
    updated: 0,
    errors: 0,
  };

  for (const product of products) {
    try {
      // Build description lines array
      const descriptionLines = [
        product.line1,
        product.line2,
        product.line3,
      ].filter(Boolean);

      // Parse options if provided
      let options = null;
      if (product.options) {
        try {
          options = JSON.parse(product.options);
        } catch (e) {
          console.warn(`Invalid options JSON for ${product.handle}:`, product.options);
        }
      }

      // Build full description from lines
      const description = descriptionLines.join('\n');

      // Upsert product
      const { error } = await supabase
        .from('products')
        .upsert(
          {
            handle: product.handle,
            title: product.title,
            description,
            description_lines: descriptionLines,
            base_price: product.basePrice,
            house_price: product.housePrice,
            price: product.basePrice, // Keep for backward compatibility
            stock_quantity: product.stock,
            category: product.category,
            options,
            image_url: product.imageUrl || null,
            sync_source: 'google_sheets',
            last_synced_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          },
          {
            onConflict: 'handle',
          }
        );

      if (error) {
        console.error(`Error syncing ${product.handle}:`, error);
        results.errors++;
      } else {
        // Check if it was an insert or update
        const { data: existing } = await supabase
          .from('products')
          .select('id')
          .eq('handle', product.handle)
          .single();

        if (existing) {
          results.updated++;
        } else {
          results.created++;
        }
      }
    } catch (error) {
      console.error(`Error processing ${product.handle}:`, error);
      results.errors++;
    }
  }

  return results;
}

/**
 * Main sync function
 */
export async function syncGoogleSheets() {
  console.log('Starting Google Sheets sync...');
  
  const products = await fetchSheetData();
  console.log(`Fetched ${products.length} products from Google Sheets`);
  
  const results = await syncProductsToSupabase(products);
  console.log('Sync complete:', results);
  
  return results;
}
