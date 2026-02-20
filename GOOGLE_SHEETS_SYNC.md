# Google Sheets Sync - Charmed & Dark

Real-time (near real-time) sync between Google Sheets and Supabase for the 50 physical inventory items.

## Overview

The Google Sheets sync system allows you to manage your physical inventory in a Google Sheet and automatically sync it to Supabase. This provides:

- **Single Source of Truth**: Manage inventory in Google Sheets
- **Real-time Updates**: Sync on-demand or via scheduled cron jobs
- **Structured Data**: Three-line descriptions, metadata for AI, and product options
- **Dual Pricing**: Base Price and House Price stored directly

## Google Sheets Format

Your sheet should have these columns (in order):

| Column | Field | Description | Example |
|--------|-------|-------------|---------|
| A | Handle | URL-safe identifier | `gothic-candle-holder` |
| B | Title | Product name | `Gothic Candle Holder` |
| C | Line 1 | First description line | `Hand-forged iron with aged patina` |
| D | Line 2 | Second description line | `Holds standard taper candles` |
| E | Line 3 | Third description line | `Intentional weight and presence` |
| F | Base Price | Standard price (dollars) | `68.00` |
| G | House Price | Member price (dollars) | `61.00` |
| H | Stock | Inventory count | `12` |
| I | Category | Product category | `Lighting` |
| J | Options | JSON of options (optional) | `{"colors": ["Black", "Silver"]}` |
| K | Metadata | JSON for AI (optional) | `{"mood": "contemplative", "era": "victorian"}` |

### Example Sheet Structure

```
Handle                  | Title                | Line 1                          | Line 2                    | Line 3                        | Base Price | House Price | Stock | Category  | Options                        | Metadata
gothic-candle-holder    | Gothic Candle Holder | Hand-forged iron with aged...   | Holds standard taper...   | Intentional weight and...     | 68.00      | 61.00       | 12    | Lighting  | {"colors": ["Black"]}          | {"mood": "contemplative"}
velvet-throw-pillow     | Velvet Throw Pillow  | Crushed velvet in charcoal      | Hidden zipper closure     | Feather-down fill             | 45.00      | 41.00       | 25    | Textiles  |                                | {"mood": "comfort"}
```

## Setup Instructions

### 1. Create Google Service Account

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing
3. Enable Google Sheets API
4. Create Service Account:
   - Go to IAM & Admin → Service Accounts
   - Click "Create Service Account"
   - Name it (e.g., "charmed-dark-sheets-sync")
   - Grant role: "Editor" or "Viewer" (viewer is sufficient)
5. Create Key:
   - Click on the service account
   - Go to "Keys" tab
   - Add Key → Create New Key → JSON
   - Download the JSON file

### 2. Share Google Sheet

1. Open your Google Sheet
2. Click "Share"
3. Add the service account email (from JSON file: `client_email`)
4. Give "Viewer" permission
5. Copy the Spreadsheet ID from the URL:
   ```
   https://docs.google.com/spreadsheets/d/[SPREADSHEET_ID]/edit
   ```

### 3. Configure Environment Variables

Add to your `.env` file:

```env
# Google Sheets Sync
GOOGLE_SHEETS_SPREADSHEET_ID=your_spreadsheet_id_here
GOOGLE_SHEETS_SHEET_NAME=Physical Inventory
GOOGLE_SHEETS_CLIENT_EMAIL=your-service-account@project.iam.gserviceaccount.com
GOOGLE_SHEETS_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYour private key here\n-----END PRIVATE KEY-----\n"

# Optional: Secure the sync endpoint
SYNC_API_TOKEN=your_random_sync_token_here
```

**Important**: The private key must include the `\n` characters. Copy it exactly from the JSON file.

### 4. Install Dependencies

```bash
npm install googleapis @supabase/supabase-js dotenv
```

## Usage

### Manual Sync (CLI)

Run the sync script manually:

```bash
npm run sync-sheets
```

This will:
1. Fetch all rows from Google Sheets
2. Upsert products to Supabase (create or update)
3. Show results (created, updated, errors)

### API Endpoint Sync

Trigger sync via HTTP request:

```bash
# Development (no auth required)
curl http://localhost:3000/api/sync-sheets

# Production (with auth token)
curl -X POST https://your-domain.com/api/sync-sheets \
  -H "Authorization: Bearer your_sync_api_token"
```

### Automated Sync (Cron Job)

#### Option A: Vercel Cron Jobs

Add to `vercel.json`:

```json
{
  "crons": [
    {
      "path": "/api/sync-sheets",
      "schedule": "0 */6 * * *"
    }
  ]
}
```

This runs every 6 hours.

#### Option B: External Cron Service

Use services like:
- [cron-job.org](https://cron-job.org)
- [EasyCron](https://www.easycron.com)
- GitHub Actions

Example GitHub Action (`.github/workflows/sync-sheets.yml`):

```yaml
name: Sync Google Sheets
on:
  schedule:
    - cron: '0 */6 * * *'  # Every 6 hours
  workflow_dispatch:  # Manual trigger

jobs:
  sync:
    runs-on: ubuntu-latest
    steps:
      - name: Trigger Sync
        run: |
          curl -X POST ${{ secrets.SYNC_ENDPOINT }} \
            -H "Authorization: Bearer ${{ secrets.SYNC_API_TOKEN }}"
```

## Database Schema

The sync updates these fields in the `products` table:

```sql
CREATE TABLE products (
  id UUID PRIMARY KEY,
  handle VARCHAR(255) UNIQUE,
  title VARCHAR(255),
  description TEXT,                    -- Combined from lines
  description_lines JSONB,             -- ["Line1", "Line2", "Line3"]
  base_price DECIMAL(10, 2),          -- Standard price
  house_price DECIMAL(10, 2),         -- Member price
  price DECIMAL(10, 2),               -- Backward compatibility
  stock_quantity INTEGER,
  category VARCHAR(100),
  options JSONB,                       -- Product variants
  metadata JSONB,                      -- For Sanctuary AI
  sync_source VARCHAR(50),             -- 'google_sheets'
  last_synced_at TIMESTAMP,
  created_at TIMESTAMP,
  updated_at TIMESTAMP
);
```

## Image Mapping

The sync system follows the Section 15 Contract for images:

### Standard Products

Images stored in `/public/products/[handle]/`:
- `hero.jpg` - Main product image (required)
- `front.jpg` - Front view (optional)
- `hover.jpg` - Hover state image (optional)

### Products with Options (e.g., Colors)

If a product has options in the `options` column:

```json
{"colors": ["Black", "Silver", "Gold"]}
```

Images should be named:
- `/public/products/[handle]/[handle]-black.jpg`
- `/public/products/[handle]/[handle]-silver.jpg`
- `/public/products/[handle]/[handle]-gold.jpg`

The system will automatically use the first color as the default hero image.

## Metadata for Sanctuary AI

The `metadata` column stores JSON data that will be used by the "Sanctuary" AI to understand the "mood" of objects.

Example metadata:

```json
{
  "mood": "contemplative",
  "era": "victorian",
  "energy": "grounding",
  "element": "earth",
  "ritual_use": ["meditation", "altar"]
}
```

This data is stored but not yet used in the frontend. It will be activated in Phase 3 (Sanctuary).

## Sync Behavior

### Upsert Logic

The sync uses `handle` as the unique identifier:
- If a product with the handle exists → **Update** all fields
- If no product exists → **Create** new product

### Conflict Resolution

- Google Sheets is the source of truth
- Local Supabase changes will be overwritten on next sync
- To preserve manual changes, set `sync_source` to `manual` in Supabase

### Error Handling

The sync continues even if individual products fail:
- Errors are logged to console
- Results show: `created`, `updated`, `errors`
- Failed products don't block successful ones

## Monitoring

### Check Last Sync Time

```sql
SELECT 
  handle, 
  title, 
  last_synced_at,
  sync_source
FROM products
WHERE sync_source = 'google_sheets'
ORDER BY last_synced_at DESC;
```

### Find Products Not Synced Recently

```sql
SELECT handle, title, last_synced_at
FROM products
WHERE sync_source = 'google_sheets'
  AND last_synced_at < NOW() - INTERVAL '24 hours';
```

## Troubleshooting

### "Missing required environment variables"

Ensure all Google Sheets variables are set in `.env`:
- `GOOGLE_SHEETS_SPREADSHEET_ID`
- `GOOGLE_SHEETS_CLIENT_EMAIL`
- `GOOGLE_SHEETS_PRIVATE_KEY`

### "Permission denied" or "404 Not Found"

1. Verify the service account email has access to the sheet
2. Check the Spreadsheet ID is correct
3. Ensure Google Sheets API is enabled in Google Cloud Console

### "Invalid JSON in options/metadata"

The `options` and `metadata` columns must contain valid JSON:
- Use double quotes: `{"key": "value"}`
- Not single quotes: `{'key': 'value'}` ❌

### Private Key Format Issues

The private key must include literal `\n` characters:

```env
# Correct
GOOGLE_SHEETS_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nMIIE...\n-----END PRIVATE KEY-----\n"

# Incorrect (actual newlines)
GOOGLE_SHEETS_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----
MIIE...
-----END PRIVATE KEY-----"
```

## Performance

- **Sync Time**: ~2-5 seconds for 50 products
- **Rate Limits**: Google Sheets API allows 100 requests/100 seconds
- **Recommended Frequency**: Every 6 hours (or on-demand)

## Security

1. **Service Account**: Use read-only permissions on the sheet
2. **API Token**: Set `SYNC_API_TOKEN` to secure the endpoint
3. **Environment Variables**: Never commit `.env` to git
4. **Vercel**: Add environment variables in dashboard

## Next Steps

1. **Set up Google Service Account** (see Setup Instructions)
2. **Format your Google Sheet** (see Google Sheets Format)
3. **Configure environment variables**
4. **Run first sync**: `npm run sync-sheets`
5. **Set up automated sync** (Vercel Cron or external service)
6. **Add product images** to `/public/products/[handle]/`

---

**Status**: Ready for configuration
**Dependencies**: googleapis, @supabase/supabase-js
**Sync Endpoint**: `/api/sync-sheets`
