# 🖤 Charmed & Dark - Start Here

Welcome to your Living Skeleton with Google Sheets Sync. Everything is ready for you to begin.

## What You Have

A fully functional hybrid commerce engine that merges:
- **15 Shopify apparel items** (Printify fulfillment)
- **50 Supabase physical objects** (direct fulfillment via Google Sheets sync)

Into one seamless "everyday gothic" experience with:
- Real-time Google Sheets inventory sync
- Dual pricing (Standard vs House)
- Authentication ("Enter the House")
- Modern minimalist gothic design
- Unified product grid
- Three-line "Restrained" descriptions

## Quick Start

### Option A: Google Sheets Sync (Recommended - 15 min)

**Best for**: Managing 50 products in Google Sheets

1. Follow `QUICK_START_SPRINT_2.md`
2. Set up Google Service Account
3. Create and format Google Sheet
4. Run `npm run sync-sheets`
5. Products automatically sync to Supabase

### Option B: Manual Setup (5 min)

**Best for**: Testing without Google Sheets

1. Install dependencies: `npm install`
2. Configure `.env` (Supabase already set ✓)
3. Run `npm run seed-products` (adds 5 test products)
4. Run `npm run dev`
5. Visit `http://localhost:3000`

## What You'll See

1. **Home Page** - Unified product grid (currently empty until you add products)
2. **Header** - "Enter the House" link (changes to "Recognized" when logged in)
3. **Pricing** - Dual pricing display (Standard vs House)
4. **Auth Page** - Sign up / Sign in at `/threshold/enter`

## Next Steps

### Add Sample Products (Optional)
```bash
npm run seed-products
```

This creates 5 sample products to test the system.

### Add Your 50 Products

You have two options:

**Option A: Manual Entry**
1. Open Supabase dashboard
2. Navigate to Table Editor → products
3. Add rows with: handle, title, description, price, stock_quantity, category

**Option B: Bulk Import**
1. Create a CSV with your products
2. Use Supabase CSV import feature
3. Or modify `scripts/seed-products.ts` with your data

### Organize Product Images

1. Create folders for each product:
```
public/products/
  your-product-handle/
    hero.jpg      (required)
    front.jpg     (optional)
    hover.jpg     (optional)
```

2. Check which images are missing:
```bash
npm run check-images
```

### Verify Shopify Connection

Your 15 apparel items should automatically appear once:
- Shopify credentials are configured
- Products exist in your Shopify store
- Storefront API has access

## Available Scripts

```bash
npm run dev              # Start development server
npm run build            # Build for production
npm run start            # Start production server
npm run sync-sheets      # Sync Google Sheets to Supabase
npm run verify-setup     # Check environment and connections
npm run seed-products    # Add 5 sample products
npm run check-images     # Check which products need images
```

## File Structure

```
app/
  page.tsx                    # Home page
  threshold/enter/page.tsx    # Auth page
  product/[handle]/page.tsx   # Product details

components/
  Header.tsx                  # Navigation
  ProductCard.tsx             # Product card
  ProductGrid.tsx             # Grid layout
  PricingDisplay.tsx          # Dual pricing

lib/
  pricing.ts                  # House price calculation
  products.ts                 # Unified interface
  supabase/                   # Supabase clients
  shopify/                    # Shopify API

supabase/migrations/
  001_orders.sql              # Orders table
  002_products.sql            # Products table
```

## Testing Checklist

- [ ] Run `npm run verify-setup` successfully
- [ ] See home page load without errors
- [ ] Sign up for new account
- [ ] Sign in with existing account
- [ ] See pricing change when authenticated
- [ ] View product detail page
- [ ] Sign out successfully

## Design System

**Colors:**
- Charcoal Deep: `#1a1a1a`
- Off White: `#f5f5f0`
- Charcoal Light: `#404040`

**Typography:**
- Headings: Crimson Pro (serif)
- Body: Inter (sans-serif)

**Style:**
- 0px border-radius (sharp corners)
- Matte palette
- Intentional and quiet

## Documentation

- `QUICK_START_SPRINT_2.md` - Google Sheets sync setup (15 min)
- `GOOGLE_SHEETS_SYNC.md` - Complete sync documentation
- `GOOGLE_SHEETS_TEMPLATE.md` - Sheet format and examples
- `SPRINT_2_COMPLETE.md` - Sprint 2 features
- `SKELETON_BUILD_COMPLETE.md` - What's been built
- `ARCHITECTURE.md` - System design
- `public/products/README.md` - Image guidelines

## Troubleshooting

### "Missing Supabase environment variables"
- Check `.env` file exists in root directory
- Verify all variables are set (no empty values)
- Restart dev server after changing `.env`

### "Missing Shopify Storefront API credentials"
- Verify domain format: `your-store.myshopify.com` (no https://)
- Check token has correct permissions
- Test token in Shopify GraphiQL

### Products not loading
- Run `npm run verify-setup` to diagnose
- Check browser console for errors
- Verify migrations ran successfully

### Images not showing
- Run `npm run check-images` to see what's missing
- Check folder structure: `public/products/[handle]/hero.jpg`
- Verify image files are named correctly (lowercase)

## Support

If you encounter issues:
1. Check the troubleshooting section above
2. Review the documentation files
3. Run `npm run verify-setup` for diagnostics
4. Check browser console for errors

## What's Next?

**Phase 2: Product Data**
- Add your 50 physical objects to Supabase
- Organize product images
- Verify Shopify apparel items

**Phase 3: Cart & Checkout**
- Unified cart system
- Checkout bridge
- Order confirmation

**Phase 4: Enhancement**
- Search and filtering
- Performance optimization
- Analytics

---

**Status**: Living Skeleton Complete ✨
**Ready For**: Product data ingestion and testing

Built with trust in the vision. The Threshold awaits.
