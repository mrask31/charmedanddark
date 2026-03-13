# Shop Redesign Setup Guide

## Overview
The shop page has been redesigned according to Directive 004 specifications with:
- Atmospheric hero section with "The Atelier" branding
- Sticky filter bar with category tabs (ALL, HOME, APPAREL, ACCESSORIES, RITUAL)
- Section-based product display (The Ritual, The Wardrobe, The Sanctuary)
- 3:4 aspect ratio product cards with Sanctuary pricing
- Inline "Notify Me" form for sold-out products

## Database Setup Required

### Step 1: Create notify_requests Table

Run the following SQL in your Supabase SQL Editor:

```sql
-- Create notify_requests table for sold-out product notifications
CREATE TABLE IF NOT EXISTS notify_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL,
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  notified_at TIMESTAMPTZ,
  UNIQUE(email, product_id)
);

-- Create indexes for faster lookups
CREATE INDEX IF NOT EXISTS idx_notify_requests_product_id ON notify_requests(product_id);
CREATE INDEX IF NOT EXISTS idx_notify_requests_email ON notify_requests(email);
CREATE INDEX IF NOT EXISTS idx_notify_requests_created_at ON notify_requests(created_at DESC);

-- Enable RLS
ALTER TABLE notify_requests ENABLE ROW LEVEL SECURITY;

-- Policy: Allow anyone to insert their email for notifications
CREATE POLICY "Allow public inserts" ON notify_requests
  FOR INSERT
  WITH CHECK (true);

-- Policy: Only service role can read notify requests
CREATE POLICY "Allow service role to read" ON notify_requests
  FOR SELECT
  USING (auth.role() = 'service_role');

-- Add comment
COMMENT ON TABLE notify_requests IS 'Stores email addresses for sold-out product restock notifications';
```

### Step 2: Verify Table Creation

Run this query to verify the table was created:

```sql
SELECT * FROM notify_requests LIMIT 1;
```

## New Components

### 1. ShopHero (`components/shop/ShopHero.js`)
- Full-width atmospheric hero with "The Atelier" headline
- Gold subhead: "CURATED DARKNESS FOR THE MODERN MYSTIC" (#C9A84C)
- Uses `/images/shop/hero.jpg` (currently using editorial-break.jpg)

### 2. StickyFilterBar (`components/shop/StickyFilterBar.js`)
- Sticky navigation with category tabs
- Sort dropdown (Featured, Price: Low to High, Price: High to Low, Newest)
- Positioned below main nav with `top-[72px]` and `z-40`

### 3. SectionHeader (`components/shop/SectionHeader.js`)
- Italic serif section titles
- Editorial subtitles for each section

### 4. ProductCard (`components/shop/ProductCard.js`)
- Fixed 3:4 aspect ratio with `aspect-[3/4]`
- Serif font for product names
- Public price in white, Sanctuary price in gold (#C9A84C)
- Grayscale filter for sold-out products
- Inline "Notify Me" email capture form

## API Routes

### `/api/notify` (POST)
Handles sold-out product notification requests.

**Request Body:**
```json
{
  "email": "user@example.com",
  "product_id": "uuid-here"
}
```

**Response:**
```json
{
  "success": true,
  "data": { ... }
}
```

## Design System

### Colors
- Background: `bg-black`
- Primary text: `#F5F0E8` (off-white)
- Gold accent: `#C9A84C`
- Muted text: `text-zinc-400`, `text-zinc-500`

### Typography
- Headings: `font-serif` with `italic` for section titles
- Body: Default sans-serif
- Uppercase labels: `uppercase tracking-[0.2em]` or `tracking-[0.3em]`

### Layout
- Max width: `max-w-7xl`
- Grid: `grid-cols-2 md:grid-cols-3 lg:grid-cols-4`
- Product cards: `aspect-[3/4]` for consistent portrait ratio

## Category Mapping

### Filter Bar Categories
- **ALL**: Shows all products
- **HOME**: Drinkware, Dining & Serveware, Candles & Scent, Wall Art, Decor Objects, Textiles, Home Decor (Other)
- **APPAREL**: Apparel category
- **ACCESSORIES**: Accessories category
- **RITUAL**: Ritual, Candles & Scent

### Section Display
- **The Ritual**: Ritual tools and candles
- **The Wardrobe**: Apparel and accessories
- **The Sanctuary**: Home decor items

## Testing Checklist

- [ ] Database table created successfully
- [ ] Shop page loads without errors
- [ ] Hero section displays correctly
- [ ] Filter tabs work and filter products by category
- [ ] Sort dropdown changes product order
- [ ] Product cards display with correct 3:4 aspect ratio
- [ ] Sanctuary pricing shows for members (when membership is enabled)
- [ ] Sold-out products show grayscale filter
- [ ] "Notify Me" form appears for sold-out products
- [ ] Email submissions write to notify_requests table
- [ ] Page is responsive at mobile breakpoints (sm, md, lg)

## Next Steps

1. Run the SQL migration in Supabase SQL Editor
2. Test the shop page at `http://localhost:3000/shop`
3. Test "Notify Me" functionality with a sold-out product
4. Verify Sanctuary pricing display (requires membership implementation)
5. Add actual hero image if needed (replace `/images/shop/hero.jpg`)

## Files Modified

- `app/shop/page.js` - Updated to use new client component
- `app/shop/page-new.js` - New client component with filter/sort logic

## Files Created

- `components/shop/ShopHero.js`
- `components/shop/StickyFilterBar.js`
- `components/shop/SectionHeader.js`
- `components/shop/ProductCard.js`
- `app/api/notify/route.js`
- `scripts/create-notify-table.sql`
- `public/images/shop/hero.jpg` (copied from editorial-break.jpg)

## Notes

- The old `ShopContent.js` component is preserved for reference
- Membership check currently uses `isMember` from `lib/membership.js` (hardcoded to `false`)
- When membership is implemented, Sanctuary pricing will automatically show for members
- Product images from Shopify are used with `object-cover` to maintain aspect ratio
