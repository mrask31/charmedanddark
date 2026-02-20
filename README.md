# Charmed & Dark - Hybrid Commerce Engine

A Next.js 14 headless commerce platform merging Shopify apparel with Supabase physical inventory, featuring Google Sheets sync, dual pricing, and modern minimalist gothic design.

## Overview

Charmed & Dark is a hybrid commerce engine that seamlessly combines:
- **15 Shopify apparel items** (Printify fulfillment)
- **50 physical home objects** (direct fulfillment via Google Sheets sync)

Into one unified "everyday gothic" shopping experience with authentication-based pricing and real-time inventory management.

## Features

### Core Commerce
- ✅ Unified product grid (Shopify + Supabase)
- ✅ Dual pricing system (Standard vs House)
- ✅ Authentication ("Enter the House")
- ✅ Product detail pages
- ✅ Real-time inventory sync from Google Sheets

### Design System
- ✅ Modern Minimalist Gothic aesthetic
- ✅ Matte charcoal/off-white palette
- ✅ Crimson Pro (serif) + Inter (sans) typography
- ✅ 0px border-radius (sharp corners)
- ✅ Intentional, quiet atmosphere

### Technical
- ✅ Next.js 14 App Router
- ✅ TypeScript
- ✅ Supabase (Auth + Database)
- ✅ Shopify Storefront API
- ✅ Google Sheets API sync
- ✅ Server-side rendering
- ✅ Image optimization

## Quick Start

### Prerequisites
- Node.js 18+
- npm or yarn
- Supabase account
- Google account (for inventory sync)
- Shopify store (optional, for apparel)

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Environment

Copy `.env.example` to `.env` and fill in:

```env
# Supabase (Required)
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_key

# Google Sheets Sync (Required for inventory)
GOOGLE_SHEETS_SPREADSHEET_ID=your_spreadsheet_id
GOOGLE_SHEETS_SHEET_NAME=Physical Inventory
GOOGLE_SHEETS_CLIENT_EMAIL=service-account@project.iam.gserviceaccount.com
GOOGLE_SHEETS_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"

# Shopify (Optional, for apparel)
NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN=your-store.myshopify.com
NEXT_PUBLIC_SHOPIFY_STOREFRONT_ACCESS_TOKEN=your_token
```

### 3. Set Up Google Sheets Sync

Follow the 15-minute guide in `QUICK_START_SPRINT_2.md`:
1. Create Google Service Account
2. Format Google Sheet with your inventory
3. Share sheet with service account
4. Run first sync

```bash
npm run sync-sheets
```

### 4. Start Development Server

```bash
npm run dev
```

Visit `http://localhost:3000`

## Documentation

### Getting Started
- **START_HERE.md** - Main entry point
- **QUICK_START_SPRINT_2.md** - Google Sheets setup (15 min)
- **CURRENT_STATUS.md** - Project status overview

### Google Sheets Sync
- **GOOGLE_SHEETS_SYNC.md** - Complete sync documentation
- **GOOGLE_SHEETS_TEMPLATE.md** - Sheet format and examples
- **SPRINT_2_COMPLETE.md** - Sprint 2 features

### Architecture
- **ARCHITECTURE.md** - System design and data flow
- **IMPLEMENTATION_SUMMARY.md** - Technical decisions
- **SKELETON_BUILD_COMPLETE.md** - Phase 1 features

### Images
- **public/products/README.md** - Image guidelines

## Project Structure

```
charmed-and-dark/
├── app/
│   ├── page.tsx                    # Home page with unified grid
│   ├── threshold/enter/            # Authentication page
│   ├── product/[handle]/           # Product detail pages
│   └── api/
│       ├── sync-sheets/            # Google Sheets sync endpoint
│       ├── cart/                   # Cart operations
│       └── webhooks/               # Shopify webhooks
│
├── components/
│   ├── Header.tsx                  # Navigation with auth status
│   ├── ProductCard.tsx             # Product card with hover
│   ├── ProductGrid.tsx             # Unified grid
│   ├── ProductDescription.tsx      # Three-line descriptions
│   └── PricingDisplay.tsx          # Dual pricing component
│
├── lib/
│   ├── products.ts                 # Unified product interface
│   ├── pricing.ts                  # House price calculation
│   ├── google-sheets/
│   │   └── sync.ts                 # Google Sheets sync logic
│   ├── supabase/
│   │   ├── client.ts               # Client-side Supabase
│   │   └── server.ts               # Server-side Supabase
│   └── shopify/
│       ├── products.ts             # Product fetching
│       └── storefront.ts           # Cart operations
│
├── supabase/migrations/
│   ├── 001_orders.sql              # Orders table
│   ├── 002_products.sql            # Products table
│   └── 003_add_google_sheets_fields.sql  # Google Sheets fields
│
├── scripts/
│   ├── sync-sheets.ts              # CLI sync script
│   ├── seed-products.ts            # Sample data
│   └── verify-setup.ts             # Setup verification
│
└── public/products/                # Product images
    └── [handle]/
        ├── hero.jpg
        ├── front.jpg
        └── hover.jpg
```

## Available Scripts

```bash
# Development
npm run dev              # Start dev server
npm run build            # Build for production
npm run start            # Start production server

# Google Sheets Sync
npm run sync-sheets      # Sync inventory from Google Sheets

# Utilities
npm run verify-setup     # Check environment and connections
npm run seed-products    # Add 5 sample products
npm run check-images     # Check which products need images

# Testing
npm run test             # Run tests
npm run test:watch       # Run tests in watch mode
```

## Database Schema

### Products Table

```sql
CREATE TABLE products (
  id UUID PRIMARY KEY,
  handle VARCHAR(255) UNIQUE,
  title VARCHAR(255),
  description TEXT,
  description_lines JSONB,           -- ["Line1", "Line2", "Line3"]
  base_price DECIMAL(10, 2),         -- Standard price
  house_price DECIMAL(10, 2),        -- Member price (10% off)
  price DECIMAL(10, 2),              -- Backward compatibility
  stock_quantity INTEGER,
  category VARCHAR(100),
  options JSONB,                      -- {"colors": ["Black", "Silver"]}
  metadata JSONB,                     -- For Sanctuary AI
  sync_source VARCHAR(50),            -- 'google_sheets', 'manual', 'shopify'
  last_synced_at TIMESTAMP,
  created_at TIMESTAMP,
  updated_at TIMESTAMP
);
```

### Orders Table

```sql
CREATE TABLE orders (
  id UUID PRIMARY KEY,
  shopify_order_id VARCHAR(255) UNIQUE,
  order_number VARCHAR(255),
  line_items JSONB,
  shipping_address JSONB,
  total_price DECIMAL(10, 2),
  currency VARCHAR(10),
  created_at TIMESTAMP,
  updated_at TIMESTAMP
);
```

## Google Sheets Format

Your inventory sheet should have these columns:

| Column | Field | Example |
|--------|-------|---------|
| A | Handle | `gothic-candle-holder` |
| B | Title | `Gothic Candle Holder` |
| C | Line 1 | `Hand-forged iron with aged patina` |
| D | Line 2 | `Holds standard taper candles` |
| E | Line 3 | `Intentional weight and presence` |
| F | Base Price | `68.00` |
| G | House Price | `61.00` |
| H | Stock | `12` |
| I | Category | `Lighting` |
| J | Options | `{"colors": ["Black", "Silver"]}` |
| K | Metadata | `{"mood": "contemplative"}` |

See `GOOGLE_SHEETS_TEMPLATE.md` for detailed format and examples.

## Deployment

### Vercel (Recommended)

1. Push to GitHub
2. Import project in Vercel
3. Add environment variables
4. Deploy

The Vercel cron job will automatically sync Google Sheets every 6 hours.

### Environment Variables in Vercel

Add all variables from `.env` to Vercel dashboard:
- Supabase credentials
- Google Sheets credentials
- Shopify credentials (if using)
- `SYNC_API_TOKEN` (optional, for securing sync endpoint)

## Pricing Logic

### House Price Calculation

```typescript
housePrice = Math.round(basePrice * 0.9)
```

Examples:
- $68.00 → $61.00
- $45.00 → $41.00
- $120.00 → $108.00

### Display Logic

**Not Authenticated**: Show both prices
```
Standard: $68.00
House: $61.00
```

**Authenticated**: Show House price only
```
$61.00
```

## Image Guidelines

### Standard Products

```
public/products/[handle]/
  hero.jpg      # Required - Main product image
  front.jpg     # Optional - Front view
  hover.jpg     # Optional - Hover state
```

### Products with Color Options

```
public/products/[handle]/
  [handle]-black.jpg
  [handle]-silver.jpg
  [handle]-gold.jpg
```

The system automatically uses the first color from `options.colors` as the hero image.

## Testing

### Run Tests

```bash
npm run test
```

### Manual Testing Checklist

- [ ] Products display in unified grid
- [ ] Sign up creates new account
- [ ] Sign in authenticates user
- [ ] Pricing changes when authenticated
- [ ] Product detail pages load
- [ ] Images display or fallback gracefully
- [ ] Google Sheets sync works
- [ ] Shopify products load (if configured)

## Troubleshooting

### Google Sheets Sync Issues

**"Missing required environment variables"**
- Check all 4 Google Sheets variables in `.env`
- Restart dev server after changes

**"Permission denied"**
- Verify service account has access to sheet
- Check you shared with correct email

**"Invalid private key"**
- Ensure private key includes `\n` characters
- Copy exactly from JSON file

### Supabase Connection Issues

**"Missing Supabase environment variables"**
- Verify URL and keys in `.env`
- Check Supabase project is active

### Image Issues

**Images not loading**
- Run `npm run check-images` to see what's missing
- Verify folder structure: `public/products/[handle]/hero.jpg`
- Check file names are lowercase

## Roadmap

### Phase 1: Living Skeleton ✅
- Unified product interface
- Dual pricing system
- Authentication
- Modern minimalist gothic design

### Phase 2: Google Sheets Sync ✅
- Real-time inventory sync
- Three-line descriptions
- Product options (colors)
- Metadata for AI

### Phase 3: Cart & Checkout (Next)
- Unified cart system
- Checkout bridge
- Order confirmation
- Inventory updates

### Phase 4: Sanctuary AI (Future)
- Mood-based recommendations
- "Mirror" feature (personal reflection)
- "Grimoire" feature (knowledge base)
- AI-powered product discovery

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Database**: Supabase (PostgreSQL)
- **Auth**: Supabase Auth
- **Commerce**: Shopify Storefront API
- **Sync**: Google Sheets API
- **Styling**: Inline styles (Modern Minimalist Gothic)
- **Deployment**: Vercel
- **Cron**: Vercel Cron Jobs

## Contributing

This is a private project for Charmed & Dark. Internal contributions follow the "Operational Trust" principle - implement the cleanest, most performant solution while staying true to the vision.

## License

Private and proprietary.

## Support

For setup help, see:
- `START_HERE.md` - Main guide
- `QUICK_START_SPRINT_2.md` - Google Sheets setup
- `GOOGLE_SHEETS_SYNC.md` - Sync troubleshooting

---

**Status**: Sprint 2 Complete - Google Sheets Sync Ready
**Next**: Configure Google Service Account and sync inventory
**Built with**: Trust in the vision 🖤
