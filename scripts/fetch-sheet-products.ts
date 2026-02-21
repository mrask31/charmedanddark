/**
 * Fetch all products from Google Sheets to see handles and titles
 */

import { google } from 'googleapis';
import * as dotenv from 'dotenv';

dotenv.config();

const SPREADSHEET_ID = process.env.GOOGLE_SHEETS_SPREADSHEET_ID!;
const SHEET_NAME = process.env.GOOGLE_SHEETS_SHEET_NAME || 'Physical Inventory';
const RANGE = `${SHEET_NAME}!A2:J`;

async function fetchProducts() {
  try {
    // Authenticate with Google Sheets
    const auth = new google.auth.GoogleAuth({
      credentials: {
        client_email: process.env.GOOGLE_SHEETS_CLIENT_EMAIL,
        private_key: process.env.GOOGLE_SHEETS_PRIVATE_KEY?.replace(/\\n/g, '\n'),
      },
      scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly'],
    });

    const sheets = google.sheets({ version: 'v4', auth });

    // Fetch data
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID,
      range: RANGE,
    });

    const rows = response.data.values || [];
    
    console.log(`\nFound ${rows.length} products in Google Sheets\n`);
    console.log('Handle | Title | Category');
    console.log('---'.repeat(30));

    for (const row of rows) {
      const handle = row[0]?.trim() || '';
      const title = row[1]?.trim() || '';
      const category = row[8]?.trim() || '';
      
      if (handle && title) {
        console.log(`${handle} | ${title} | ${category}`);
      }
    }
  } catch (error) {
    console.error('Error fetching Google Sheets:', error);
  }
}

fetchProducts();
