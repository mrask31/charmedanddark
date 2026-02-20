# Setup Status - Charmed & Dark

## ✅ Completed

### Database Setup
- ✅ Products table created in Supabase
- ✅ RLS policies configured (public read, authenticated write)
- ✅ Indexes created for performance
- ✅ 5 sample products inserted for testing

### Sample Products Added
1. Gothic Candle Holder - $68.00 (Lighting)
2. Velvet Throw Pillow - $45.00 (Textiles)
3. Antique Mirror - $120.00 (Decor)
4. Ceramic Skull Vase - $52.00 (Decor)
5. Leather Journal - $38.00 (Stationery)

### Environment Configuration
- ✅ `.env` file created with Supabase credentials
- ✅ Supabase URL: `https://ewsztwchfbjclbjsqhnd.supabase.co`
- ✅ Anon key configured

## ⚠️ Remaining Setup

### Shopify Configuration (Required)
You need to add your Shopify credentials to `.env`:

```env
NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN=your-store.myshopify.com
NEXT_PUBLIC_SHOPIFY_STOREFRONT_ACCESS_TOKEN=your_token
SHOPIFY_ADMIN_ACCESS_TOKEN=your_admin_token
```

### Service Role Key (Required)
Add your Supabase service role key to `.env`:
- Go to: https://supabase.com/dashboard/project/ewsztwchfbjclbjsqhnd/settings/api
- Copy the "service_role" key (secret)
- Add to `.env`: `SUPABASE_SERVICE_ROLE_KEY=your_key_here`

### App Secret (Required)
Generate a random 32+ character secret for token signing:

```bash
# On Windows PowerShell:
-join ((65..90) + (97..122) + (48..57) | Get-Random -Count 32 | % {[char]$_})

# Or use any random string generator
```

Add to `.env`: `APP_SECRET=your_random_secret_here`

## 🚀 Next Steps

### 1. Complete Environment Setup (5 minutes)
```bash
# Edit .env and add missing credentials
notepad .env
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Start Development Server
```bash
npm run dev
```

### 4. Test the Application
Visit `http://localhost:3000` and you should see:
- 5 sample products in the grid
- "Enter the House" link in header
- Dual pricing display (Standard vs House)

### 5. Test Authentication
1. Click "Enter the House"
2. Sign up with email/password
3. Return to home page
4. Verify pricing changes to House-only display
5. Header should show "Recognized"

### 6. Add Your Products
Once testing is complete, add your 50 physical objects:

**Option A: Supabase Dashboard**
1. Visit: https://supabase.com/dashboard/project/ewsztwchfbjclbjsqhnd/editor
2. Open `products` table
3. Insert rows manually

**Option B: SQL Script**
1. Create a SQL file with INSERT statements
2. Run in Supabase SQL Editor

**Option C: CSV Import**
1. Prepare CSV with columns: handle, title, description, price, stock_quantity, category
2. Use Supabase CSV import feature

### 7. Organize Product Images
Create folders for each product handle:

```
public/products/
  gothic-candle-holder/
    hero.jpg
    front.jpg
    hover.jpg
  velvet-throw-pillow/
    hero.jpg
    front.jpg
    hover.jpg
  ...
```

Check missing images:
```bash
npm run check-images
```

## Database Schema

### Products Table
```sql
CREATE TABLE products (
  id UUID PRIMARY KEY,
  handle VARCHAR(255) UNIQUE,
  title VARCHAR(255),
  description TEXT,
  price DECIMAL(10, 2),
  stock_quantity INTEGER,
  category VARCHAR(100),
  created_at TIMESTAMP,
  updated_at TIMESTAMP
);
```

### Current Data
- 5 sample products
- Categories: Lighting, Textiles, Decor, Stationery
- Price range: $38 - $120

## Pricing Examples

With the current sample products:

**Not Authenticated:**
- Gothic Candle Holder: $68.00 / $61.00 House
- Velvet Throw Pillow: $45.00 / $41.00 House
- Antique Mirror: $120.00 / $108.00 House

**Authenticated (Recognized):**
- Gothic Candle Holder: $61.00
- Velvet Throw Pillow: $41.00
- Antique Mirror: $108.00

## Troubleshooting

### "Missing Supabase environment variables"
- Check `.env` file exists
- Verify `SUPABASE_SERVICE_ROLE_KEY` is set
- Restart dev server

### Products not showing
- Check browser console for errors
- Verify Supabase connection: `npm run verify-setup`
- Check products exist: Visit Supabase dashboard

### Shopify products not loading
- Verify Shopify credentials in `.env`
- Check store domain format (no https://)
- Ensure Storefront API token has correct permissions

## Quick Links

- **Supabase Dashboard**: https://supabase.com/dashboard/project/ewsztwchfbjclbjsqhnd
- **Table Editor**: https://supabase.com/dashboard/project/ewsztwchfbjsqhnd/editor
- **API Settings**: https://supabase.com/dashboard/project/ewsztwchfbjclbjsqhnd/settings/api
- **SQL Editor**: https://supabase.com/dashboard/project/ewsztwchfbjsqhnd/sql

## Status Summary

✅ Database: Ready
✅ Sample Data: Loaded
✅ Code: Complete
⚠️ Environment: Needs Shopify credentials
⚠️ Images: Need to be organized

**You're 90% ready to test!** Just add the remaining environment variables and run `npm run dev`.
