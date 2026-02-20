# Charmed & Dark - Living Skeleton

## What's Built

The foundational "Threshold" and "The House" architecture for Charmed & Dark's hybrid commerce engine.

### Core Features

1. **Dual Inventory System**
   - Shopify Storefront API integration for 15 apparel items
   - Supabase products table for 50 physical home objects
   - Unified product interface merging both sources

2. **The House (Authentication & Pricing)**
   - Supabase Auth with email/password
   - Dual pricing logic: Standard vs House (10% off, rounded)
   - Automatic price display based on authentication status
   - "Enter the House" dedicated login page

3. **Modern Minimalist Gothic Design**
   - Matte charcoal/off-white palette
   - Serif (Crimson Pro) + Sans (Inter) typography
   - 0px border-radius (sharp corners everywhere)
   - Intentional, quiet aesthetic

4. **Image System**
   - `/public/products/[handle]/` structure
   - Supports hero.jpg, front.jpg, hover.jpg per product
   - Hover state transitions on product cards

## Setup Instructions

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Environment Variables

Copy `.env.example` to `.env` and fill in:

```bash
# Shopify Storefront API
NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN=your-store.myshopify.com
NEXT_PUBLIC_SHOPIFY_STOREFRONT_ACCESS_TOKEN=your_token

# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_key
```

### 3. Run Database Migrations

```bash
# Using Supabase CLI
supabase db push

# Or manually run:
# - supabase/migrations/001_orders.sql
# - supabase/migrations/002_products.sql
```

### 4. Seed Sample Products (Optional)

```bash
npm run seed-products
```

This creates 5 sample products. Replace with your actual 50 items.

### 5. Organize Product Images

Create folders for each product handle:

```
public/
  products/
    gothic-candle-holder/
      hero.jpg
      front.jpg
      hover.jpg
    velvet-throw-pillow/
      hero.jpg
      front.jpg
      hover.jpg
```

### 6. Run Development Server

```bash
npm run dev
```

Visit `http://localhost:3000`

## Architecture

### File Structure

```
app/
├── page.tsx                    # Home page with unified product grid
├── layout.tsx                  # Root layout
├── globals.css                 # Gothic design system
├── threshold/
│   └── enter/
│       └── page.tsx            # "Enter the House" auth page
└── product/
    └── [handle]/
        └── page.tsx            # Product detail page

components/
├── Header.tsx                  # Navigation with auth status
├── ProductCard.tsx             # Product card with hover + pricing
├── ProductGrid.tsx             # Grid layout with auth detection
└── PricingDisplay.tsx          # Dual pricing component

lib/
├── pricing.ts                  # House price calculation (10% off)
├── products.ts                 # Unified product interface
├── supabase/
│   ├── client.ts               # Client-side Supabase (auth)
│   └── server.ts               # Server-side Supabase (data)
└── shopify/
    ├── products.ts             # Storefront API product fetching
    ├── storefront.ts           # Cart operations
    └── admin.ts                # Admin API fallback

supabase/
└── migrations/
    ├── 001_orders.sql          # Orders table (existing)
    └── 002_products.sql        # Products table (new)
```

### Data Flow

1. **Product Fetching** (Server-side)
   - `app/page.tsx` fetches from both Supabase and Shopify
   - Transforms to unified `UnifiedProduct` interface
   - Passes to client components

2. **Authentication** (Client-side)
   - Components use `getSupabaseClient()` to check session
   - Listen to `onAuthStateChange` for real-time updates
   - Update pricing display automatically

3. **Pricing Logic**
   - Standard price stored in database/Shopify
   - House price calculated: `Math.round(standard * 0.9)`
   - Display logic in `PricingDisplay` component

## Testing Checklist

- [ ] Verify Shopify connection (15 apparel items load)
- [ ] Verify Supabase connection (products table accessible)
- [ ] Test "Enter the House" sign up
- [ ] Test "Enter the House" sign in
- [ ] Verify pricing changes when authenticated
- [ ] Test product card hover states
- [ ] Test product detail pages
- [ ] Verify image loading from `/public/products/[handle]/`
- [ ] Test sign out functionality

## Next Steps

1. **Complete Product Data**
   - Add all 50 physical objects to Supabase
   - Organize all product images in `/public/products/`

2. **Cart & Checkout**
   - Implement unified cart for both sources
   - Bridge Shopify checkout with Supabase products

3. **Product Filtering**
   - Category filters
   - Search functionality

4. **Performance**
   - Image optimization
   - Caching strategy

## Design System

### Colors
- `--charcoal-deep: #1a1a1a` - Primary text, buttons
- `--charcoal-mid: #2d2d2d` - Borders, secondary elements
- `--charcoal-light: #404040` - Tertiary text
- `--off-white: #f5f5f0` - Background
- `--off-white-dim: #e8e8e3` - Borders, subtle backgrounds
- `--accent-gold: #c9b896` - Reserved for accents

### Typography
- Headings: Crimson Pro (serif)
- Body: Inter (sans-serif)
- All elements: 0px border-radius

### Spacing
- xs: 0.5rem
- sm: 1rem
- md: 1.5rem
- lg: 2rem
- xl: 3rem

## Notes

- Authentication state is managed client-side for real-time updates
- Product fetching is server-side for performance
- Images fallback gracefully if not found
- Pricing rounds to nearest whole dollar
- All UI elements maintain sharp corners (0px border-radius)
