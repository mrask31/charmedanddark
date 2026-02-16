# Quick Start - Charmed & Dark Headless Shopify

## 1. Environment Setup

Copy `.env.example` to `.env.local` and add your Shopify credentials:

```bash
cp .env.example .env.local
```

Edit `.env.local`:

```env
NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN=your-store.myshopify.com
NEXT_PUBLIC_SHOPIFY_STOREFRONT_ACCESS_TOKEN=your_token_here
```

### Getting Shopify Credentials

1. Go to your Shopify Admin
2. Navigate to **Settings > Apps and sales channels**
3. Click **Develop apps**
4. Create a new app or select existing
5. Configure **Storefront API** scopes:
   - `unauthenticated_read_product_listings`
   - `unauthenticated_read_product_inventory`
   - `unauthenticated_write_checkouts`
   - `unauthenticated_read_checkouts`
6. Install the app and copy the **Storefront API access token**

## 2. Create Collections in Shopify

Create these collections (or update handles in `lib/storefront/config.ts`):

### Required Collections
- `apparel` - All apparel products
- `apparel-featured` - Featured apparel for homepage (12 items)
- `new` - New arrivals
- `home-decor` - Home decor products
- `decor-featured` - Featured decor for homepage (6 items)

### Capsule Collections (Optional)
- `stillness` - Stillness capsule
- `after-hours` - After Hours capsule
- `solace` - Solace capsule

### Alternative: Use Tags

If you prefer tags over collections, products can be tagged:
- `apparel-featured`
- `decor-featured`
- `new`

The system will fallback to tag-based queries if collections don't exist.

## 3. Add Products to Collections

1. In Shopify Admin, go to **Products**
2. Select products
3. Add to appropriate collections
4. Tag products with `new` if they're new arrivals

## 4. Test Locally

```bash
npm install
npm run dev
```

Visit:
- `http://localhost:3000` - Homepage (apparel-first)
- `http://localhost:3000/collections/apparel` - Apparel collection
- `http://localhost:3000/collections/new` - New arrivals
- `http://localhost:3000/product/[handle]` - Product page (use actual product handle)

## 5. Verify Data Loading

Check browser console for any Shopify API errors. If you see:
- "Missing Shopify Storefront API credentials" → Check `.env.local`
- "Shopify API error: 401" → Check access token
- "Shopify GraphQL errors" → Check collection handles exist

## 6. Customize

### Change Featured Products

Edit `lib/storefront/config.ts`:

```typescript
collections: {
  apparelFeatured: 'your-collection-handle',
  decorFeatured: 'your-decor-collection',
}
```

### Change Product Limits

Edit `lib/storefront/config.ts`:

```typescript
limits: {
  homepageApparelFeatured: 12, // Change this
  homepageDecorPreview: 6,     // Or this
}
```

### Update Capsule Collections

Edit `app/page.tsx`:

```typescript
const CAPSULES = [
  { 
    name: 'Your Collection', 
    handle: 'your-handle',
    description: 'Your description'
  },
];
```

## 7. Deploy to Vercel

```bash
git add .
git commit -m "feat: implement apparel-first headless Shopify storefront"
git push
```

In Vercel:
1. Add environment variables (same as `.env.local`)
2. Deploy
3. Verify all pages load correctly

## 8. Configure Shopify Checkout

To maintain brand consistency in checkout:

1. Go to Shopify Admin > **Settings > Checkout**
2. Upload your logo
3. Customize colors to match your brand
4. Add custom CSS if needed

## Troubleshooting

### Products Not Showing
- Verify collections exist in Shopify
- Check collection handles match config
- Ensure products are added to collections
- Check products are set to "Active" in Shopify

### API Errors
- Verify Storefront API token is correct
- Check token has required scopes
- Ensure store domain is correct (include `.myshopify.com`)

### Build Errors
- Run `npm run build` locally first
- Check for TypeScript errors: `npx tsc --noEmit`
- Verify all environment variables are set

### Styling Issues
- Check `app/globals.css` loaded correctly
- Verify CSS custom properties are defined
- Test in different browsers

## Key Routes

- `/` - Homepage (apparel-first)
- `/collections/[handle]` - Collection pages
- `/product/[handle]` - Product pages (Shopify)
- `/product/[slug]` - Product pages (legacy lib/products.ts)
- `/cart` - Shopping cart
- `/about` - About page
- `/shop` - All products (legacy)
- `/mirror` - Sanctuary (preserved)
- `/grimoire` - Sanctuary (preserved)

## Documentation

- **Full Implementation Guide**: `docs/implementation/APPAREL_FIRST_HEADLESS_STORE.md`
- **Summary**: `IMPLEMENTATION_SUMMARY.md`
- **This Guide**: `QUICK_START.md`

## Support

For Shopify API questions:
- https://shopify.dev/docs/api/storefront

For Next.js questions:
- https://nextjs.org/docs

For implementation questions:
- See `docs/implementation/APPAREL_FIRST_HEADLESS_STORE.md`
