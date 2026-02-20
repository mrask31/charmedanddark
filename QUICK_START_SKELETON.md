# Quick Start - Living Skeleton

Get the Charmed & Dark hybrid commerce engine running in 5 steps.

## 1. Install Dependencies

```bash
npm install
```

## 2. Configure Environment

Copy `.env.example` to `.env`:

```bash
copy .env.example .env
```

Fill in your credentials:

```env
# Shopify Storefront API
NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN=your-store.myshopify.com
NEXT_PUBLIC_SHOPIFY_STOREFRONT_ACCESS_TOKEN=your_storefront_token

# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_key
```

## 3. Run Database Migrations

Using Supabase CLI:

```bash
supabase db push
```

Or manually execute in Supabase SQL Editor:
- `supabase/migrations/001_orders.sql`
- `supabase/migrations/002_products.sql`

## 4. Verify Setup

```bash
npm run verify-setup
```

This checks:
- Environment variables are set
- Supabase connection works
- Shopify connection works

## 5. Seed Sample Products (Optional)

```bash
npm run seed-products
```

Creates 5 sample products. Replace with your actual 50 items later.

## 6. Run Development Server

```bash
npm run dev
```

Visit `http://localhost:3000`

## What You'll See

1. **Home Page** - Unified grid of Shopify apparel + Supabase objects
2. **Dual Pricing** - Standard vs House pricing (10% off, rounded)
3. **Enter the House** - Sign up/sign in page
4. **Product Details** - Individual product pages
5. **Auth Status** - Header shows "Recognized" when logged in

## Next Steps

1. **Add Your Products**
   - Add 50 physical objects to Supabase `products` table
   - Verify 15 apparel items exist in Shopify

2. **Organize Images**
   - Create `/public/products/[handle]/` folders
   - Add `hero.jpg`, `front.jpg`, `hover.jpg` for each product

3. **Test Authentication**
   - Sign up with email/password
   - Verify pricing changes when logged in
   - Test sign out

4. **Customize Design**
   - Adjust colors in `app/globals.css`
   - Modify spacing and typography as needed

## Troubleshooting

### "Missing Supabase environment variables"
- Check `.env` file exists
- Verify all Supabase variables are set
- Restart dev server after changing `.env`

### "Missing Shopify Storefront API credentials"
- Verify Shopify domain format: `your-store.myshopify.com`
- Check Storefront Access Token is valid
- Ensure token has `unauthenticated_read_product_listings` scope

### Products not loading
- Run `npm run verify-setup` to check connections
- Check browser console for errors
- Verify migrations ran successfully

### Images not showing
- Check image paths: `/public/products/[handle]/hero.jpg`
- Verify image files exist
- Check Next.js console for 404 errors

## Architecture Overview

```
┌─────────────────────────────────────────┐
│           Next.js Frontend              │
│  (Unified Product Grid + Auth UI)      │
└─────────────────────────────────────────┘
           │                    │
           │                    │
    ┌──────▼──────┐      ┌─────▼──────┐
    │   Shopify   │      │  Supabase  │
    │  Storefront │      │  Products  │
    │  (15 items) │      │ (50 items) │
    └─────────────┘      └────────────┘
```

## Key Files

- `app/page.tsx` - Home page with product grid
- `app/threshold/enter/page.tsx` - Authentication page
- `lib/pricing.ts` - House price calculation
- `lib/products.ts` - Unified product interface
- `components/ProductCard.tsx` - Product card with pricing
- `supabase/migrations/002_products.sql` - Products schema

## Support

See `README_SKELETON.md` for detailed documentation.
