# Apparel-First Headless Shopify Store Implementation

## Overview

This implementation transforms Charmed & Dark into an apparel-first ecommerce experience using headless Shopify. The site clearly prioritizes:

1. **Apparel** (primary)
2. **Home Decor** (secondary)
3. **Sanctuary** (tertiary, optional)

## Page Map

### Public Commerce Pages

- **`/`** - Homepage (apparel-first with featured products, categories, capsules)
- **`/collections/[handle]`** - Collection listing pages (apparel, new, home-decor, capsules)
- **`/product/[handle]`** - Product detail pages (Shopify products)
- **`/shop`** - Existing shop page (preserved, shows all products by category)
- **`/cart`** - Shopping cart with Shopify checkout redirect
- **`/about`** - About page

### Sanctuary Pages (Preserved)

- **`/mirror`** - Mirror experience (existing)
- **`/grimoire`** - Grimoire experience (existing)
- **`/(sanctuary)/*`** - All sanctuary routes preserved in route group

## Data Sources

### Shopify Storefront API

All product and collection data comes from Shopify via the Storefront API (`lib/storefront/client.ts`).

**Required Environment Variables:**
```
NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN=your-store.myshopify.com
NEXT_PUBLIC_SHOPIFY_STOREFRONT_ACCESS_TOKEN=your_storefront_token
```

### Collection Handles (Configurable)

Defined in `lib/storefront/config.ts`:

```typescript
collections: {
  apparel: 'apparel',
  apparelFeatured: 'apparel-featured',
  new: 'new',
  homeDecor: 'home-decor',
  decorFeatured: 'decor-featured',
}

capsules: {
  stillness: 'stillness',
  afterHours: 'after-hours',
  solace: 'solace',
}
```

### Fallback Strategy

If a collection handle doesn't exist in Shopify:
1. Try fetching by collection handle
2. Fallback to tag-based query (e.g., `tag:apparel-featured`)
3. Show empty state with graceful message

## How to Change Featured Collections

### Homepage Featured Apparel

Edit `lib/storefront/config.ts`:

```typescript
collections: {
  apparelFeatured: 'your-collection-handle', // Change this
}
```

Or use a tag instead by modifying the `getFeaturedProducts` call in `app/page.tsx`:

```typescript
await getFeaturedProducts(
  undefined, // No collection handle
  'your-tag-name', // Use this tag
  12
);
```

### Homepage Decor Preview

Same approach - edit `decorFeatured` in config or change the tag.

### Capsule Collections

Edit the `CAPSULES` array in `app/page.tsx`:

```typescript
const CAPSULES = [
  { 
    name: 'Your Collection', 
    handle: 'your-handle',
    description: 'Your description'
  },
];
```

## Navigation Hierarchy (Enforced)

The navigation order is fixed and reflects brand priorities:

1. **Apparel** - Primary category
2. **New** - New arrivals
3. **Collections** - Links to /shop (all collections)
4. **Home & Decor** - Secondary category
5. **Sanctuary** - Tertiary, quiet link
6. **About** - Brand information

This order is enforced in `components/Navigation.tsx` and cannot be changed without intentional code modification.

## Cart & Checkout

### Cart Implementation

- Cart state managed via Shopify Storefront API
- Cart ID stored in `localStorage` as `shopify_cart_id`
- Cart operations: `createCart`, `addToCart`, `getCart` in `lib/storefront/client.ts`

### Checkout Flow

1. User adds items to cart
2. Cart page shows items and subtotal
3. "Proceed to Checkout" redirects to `cart.checkoutUrl` (Shopify-hosted checkout)
4. Checkout happens on Shopify (secure, PCI compliant)
5. Customer sees Charmed & Dark branding in Shopify checkout settings

**No custom billing logic** - Shopify owns the entire checkout process.

## SEO Implementation

### Metadata

- Homepage: Apparel-first title and description
- Collections: Dynamic metadata from Shopify collection data
- Products: Dynamic metadata with product title, description, and images

### Structured Data

Product pages should include JSON-LD structured data (to be added):

```typescript
{
  "@context": "https://schema.org",
  "@type": "Product",
  "name": product.title,
  "description": product.description,
  "image": product.images,
  "offers": {
    "@type": "Offer",
    "price": product.price,
    "priceCurrency": product.currencyCode,
    "availability": product.availableForSale ? "InStock" : "OutOfStock"
  }
}
```

### Canonical URLs

All pages use Next.js automatic canonical URL generation.

## Visual Design Principles

### Typography
- Strong hierarchy with generous spacing
- High contrast without harshness
- No default blue links in primary UI

### Layout
- Mobile-first responsive design
- Generous whitespace and consistent grid
- Avoid centered stacks (template-y feel)

### Buttons
- Primary: Solid gothic-modern style
- Secondary: Ghost/outline style
- No neon glows or harsh effects

### Colors
- Elegant gothic palette
- Subtle borders and lines
- Restrained use of color accents

## Sanctuary Boundary Enforcement

**Critical Rule:** Sanctuary ambience and Mirror logic NEVER leak into commerce pages.

- Sanctuary lives in `app/(sanctuary)/` route group
- Commerce pages have NO reactive mood changes
- NO "Gone Dark/Gone Quiet" language on commerce pages
- NO urgency/scarcity tactics (no countdowns, no "only X left")
- Sanctuary is linked from homepage but clearly separate

## Error Handling

All Shopify API calls are resilient:

- Network errors return `null` instead of throwing
- Pages render with empty states if data fails to load
- No unhandled promise rejections
- Graceful degradation throughout

## Testing Checklist

- [ ] Build passes (`npm run build`)
- [ ] Existing tests pass (`npm test`)
- [ ] Homepage shows apparel first
- [ ] Navigation order is correct (Apparel > New > Collections > Home & Decor > Sanctuary > About)
- [ ] Collections pages load with Shopify data
- [ ] Product pages load with Shopify data
- [ ] Cart functionality works
- [ ] Checkout redirects to Shopify
- [ ] Sanctuary pages still accessible
- [ ] No route breaks
- [ ] Lighthouse: No CLS issues, images sized correctly, metadata present

## Future Enhancements

1. Add JSON-LD structured data to product pages
2. Implement cart item count badge in navigation
3. Add product variant selection on product pages
4. Implement search functionality
5. Add filtering/sorting to collection pages
6. Implement newsletter signup (if desired)
7. Add shipping/returns/contact pages

## Maintenance

### Updating Collection Handles

Edit `lib/storefront/config.ts` and update the relevant handle.

### Adding New Capsule Collections

1. Create collection in Shopify
2. Add to `CAPSULES` array in `app/page.tsx`
3. Collection page will automatically work at `/collections/[handle]`

### Changing Featured Product Limits

Edit `limits` in `lib/storefront/config.ts`:

```typescript
limits: {
  homepageApparelFeatured: 12, // Change this
  homepageDecorPreview: 6,     // Or this
  relatedProducts: 4,
}
```

## Support

For questions about this implementation, refer to:
- Shopify Storefront API docs: https://shopify.dev/docs/api/storefront
- Next.js App Router docs: https://nextjs.org/docs/app
- This document
