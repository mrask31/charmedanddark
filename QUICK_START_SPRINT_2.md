# Quick Start - Sprint 2: Google Sheets Sync

Get your Google Sheets inventory syncing to Supabase in 15 minutes.

## Prerequisites

- Google account
- Supabase project configured (already done ✓)
- Node.js and npm installed

## Step 1: Create Google Service Account (5 min)

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create new project: "Charmed and Dark"
3. Enable API:
   - Search "Google Sheets API"
   - Click "Enable"
4. Create Service Account:
   - IAM & Admin → Service Accounts
   - "Create Service Account"
   - Name: "sheets-sync"
   - Role: "Viewer"
   - Click "Done"
5. Create Key:
   - Click on the service account
   - Keys tab → Add Key → Create New Key
   - Choose JSON
   - Download file

## Step 2: Set Up Google Sheet (3 min)

1. Create new Google Sheet
2. Name it: "Charmed & Dark - Physical Inventory"
3. Add column headers in Row 1:
   ```
   Handle | Title | Line 1 | Line 2 | Line 3 | Base Price | House Price | Stock | Category | Options | Metadata
   ```
4. Add a test product in Row 2:
   ```
   test-candle | Test Candle | Hand-forged iron | Holds taper candles | Intentional presence | 68.00 | 61.00 | 12 | Lighting | | 
   ```
5. Share sheet:
   - Click "Share"
   - Add the service account email (from JSON: `client_email`)
   - Give "Viewer" permission
6. Copy Spreadsheet ID from URL:
   ```
   https://docs.google.com/spreadsheets/d/[THIS_IS_THE_ID]/edit
   ```

## Step 3: Configure Environment (2 min)

Open `.env` and add:

```env
# Google Sheets Sync
GOOGLE_SHEETS_SPREADSHEET_ID=paste_your_spreadsheet_id_here
GOOGLE_SHEETS_SHEET_NAME=Physical Inventory
GOOGLE_SHEETS_CLIENT_EMAIL=paste_client_email_from_json
GOOGLE_SHEETS_PRIVATE_KEY="paste_private_key_from_json_with_\n_characters"
```

**Important**: Copy the private key exactly as it appears in the JSON file, including the `\n` characters.

## Step 4: Install Dependencies (2 min)

```bash
npm install googleapis dotenv
```

## Step 5: Run First Sync (1 min)

```bash
npm run sync-sheets
```

Expected output:
```
🔄 Charmed & Dark - Google Sheets Sync

Fetched 1 products from Google Sheets
✅ Sync completed successfully!
   Created: 1
   Updated: 0
   Errors: 0
```

## Step 6: Verify (2 min)

Check Supabase:
```sql
SELECT handle, title, base_price, house_price, stock_quantity
FROM products
WHERE sync_source = 'google_sheets';
```

You should see your test product!

## Next Steps

### Add Your 50 Products

Use the template in `GOOGLE_SHEETS_TEMPLATE.md` to add all your products.

### Set Up Automated Sync

The system is already configured to sync every 6 hours via Vercel Cron.

### Organize Images

For each product, create:
```
public/products/[handle]/
  hero.jpg
  front.jpg
  hover.jpg
```

### Test the Frontend

```bash
npm run dev
```

Visit `http://localhost:3000` to see your products!

## Troubleshooting

### "Missing required environment variables"
- Check all 4 Google Sheets variables are in `.env`
- Restart terminal after editing `.env`

### "Permission denied"
- Verify service account email has access to sheet
- Check you shared with the correct email

### "Invalid private key"
- Ensure private key includes `\n` characters
- Copy exactly from JSON file
- Wrap in double quotes

### "404 Not Found"
- Verify Spreadsheet ID is correct
- Check sheet name matches exactly

## Full Documentation

- `GOOGLE_SHEETS_SYNC.md` - Complete sync documentation
- `GOOGLE_SHEETS_TEMPLATE.md` - Sheet format and examples
- `SPRINT_2_COMPLETE.md` - What was built in Sprint 2

## Support

If you get stuck:
1. Check the error message carefully
2. Review `GOOGLE_SHEETS_SYNC.md` troubleshooting section
3. Verify all environment variables are set correctly
4. Try the test product first before adding all 50

---

**Time to Complete**: ~15 minutes
**Difficulty**: Easy
**Result**: Real-time inventory sync from Google Sheets to Supabase
