# Charmed & Dark - Architecture

## System Overview

Charmed & Dark is a hybrid commerce engine that merges two distinct inventory streams into a unified "everyday gothic" shopping experience.

```
┌─────────────────────────────────────────────────────────────┐
│                    Next.js Frontend                         │
│                  (The Threshold)                            │
│                                                             │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐    │
│  │ Product Grid │  │ Auth System  │  │ Pricing      │    │
│  │ (Unified)    │  │ (The House)  │  │ (Dual)       │    │
│  └──────────────┘  └──────────────┘  └──────────────┘    │
└─────────────────────────────────────────────────────────────┘
           │                              │
           │                              │
    ┌──────▼──────────┐          ┌───────▼────────┐
    │  Commerce A     │          │  Commerce B    │
    │  (Shopify)      │          │  (Supabase)    │
    │                 │          │                │
    │  15 Apparel     │          │  50 Objects    │
    │  Items          │          │  (Physical)    │
    │                 │          │                │
    │  Printify       │          │  Direct        │
    │  Fulfillment    │          │  Fulfillment   │
    └─────────────────┘          └────────────────┘
```

## Core Concepts

### 1. The Threshold
The public-facing storefront where all products are displayed in a unified grid. No distinction is made between Shopify and Supabase products from the user's perspective.

### 2. The House
The authenticated state. When users "Enter the House" (sign in), they become "Recognized" and automatically see House pricing (10% off, rounded).

### 3. Dual Pricing Logic
- **Standard Price**: Base price from Shopify or Supabase
- **House Price**: `Math.round(standardPrice * 0.9)`
- **Display Rules**:
  - Not logged in: Show both prices side-by-side
  - Logged in: Show only House price
  - No red text, strikethroughs, or "Sale" badges

### 4. Unified Product Interface
Both Shopify and Supabase products are transformed into a common `UnifiedProduct` interface:

```typescript
interface UnifiedProduct {
  id: string;
  handle: string;
  title: string;
  description: string;
  price: number;
  source: 'shopify' | 'supabase';
  category?: string;
  images: {
    hero: string;
    front?: string;
    hover?: string;
  };
  inStock: boolean;
}
```

## Data Flow

### Product Fetching (Server-Side)

```
app/page.tsx
    │
    ├─► getSupabaseServer()
    │   └─► SELECT * FROM products
    │       └─► transformSupabaseProduct()
    │
    └─► getShopifyProducts()
        └─► Storefront API query
            └─► transformShopifyProduct()
                │
                └─► Merge into UnifiedProduct[]
                    └─► Pass to ProductGrid
```

### Authentication Flow (Client-Side)

```
User clicks "Enter the House"
    │
    └─► /threshold/enter
        │
        ├─► Sign Up: supabase.auth.signUp()
        │   └─► Redirect to home
        │
        └─► Sign In: supabase.auth.signInWithPassword()
            └─► Redirect to home
                │
                └─► Components listen to onAuthStateChange
                    └─► Update pricing display
```

### Pricing Calculation

```
Product loaded with standardPrice
    │
    └─► getPricingDisplay(standardPrice)
        │
        └─► calculateHousePrice()
            │
            └─► standardPrice * 0.9
                └─► Math.round()
                    │
                    └─► Return { standard, house, formatted }
                        │
                        └─► PricingDisplay component
                            │
                            ├─► If authenticated: Show house only
                            └─► If not: Show both
```

## Component Architecture

### Server Components (Data Fetching)
- `app/page.tsx` - Fetches all products
- `app/product/[handle]/page.tsx` - Fetches single product

### Client Components (Interactivity)
- `components/Header.tsx` - Auth status display
- `components/ProductGrid.tsx` - Grid layout with auth detection
- `components/ProductCard.tsx` - Individual product card
- `components/PricingDisplay.tsx` - Dual pricing logic
- `app/threshold/enter/page.tsx` - Auth form

## Database Schema

### Supabase Tables

#### products
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

#### orders (existing)
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

## API Integration

### Shopify Storefront API
- **Purpose**: Fetch apparel products and their variants
- **Endpoint**: `https://{domain}/api/2024-01/graphql.json`
- **Authentication**: `X-Shopify-Storefront-Access-Token`
- **Query**: Products with images, pricing, variants

### Supabase Client API
- **Purpose**: Authentication and product queries
- **Client-side**: `getSupabaseClient()` - Auth operations
- **Server-side**: `getSupabaseServer()` - Data operations
- **RLS**: Public read access, authenticated write access

## Image Handling

### Supabase Products
- Stored in `/public/products/[handle]/`
- Files: `hero.jpg`, `front.jpg`, `hover.jpg`
- Fallback to placeholder if missing

### Shopify Products
- Served from Shopify CDN
- URLs from Storefront API response
- Configured in `next.config.js` remote patterns

## Security Considerations

### Authentication
- Email/password via Supabase Auth
- Session stored in browser
- No sensitive data in localStorage

### Row Level Security (RLS)
- Products table: Public read, authenticated write
- Orders table: Authenticated access only

### Environment Variables
- All secrets in `.env` (not committed)
- Public variables prefixed with `NEXT_PUBLIC_`
- Service role key server-side only

## Performance Optimizations

### Server-Side Rendering
- Product fetching happens on server
- Reduces client-side API calls
- Better SEO and initial load

### Image Optimization
- Next.js Image component
- Automatic WebP conversion
- Lazy loading for off-screen images

### Caching Strategy
- Static generation where possible
- Dynamic routes for product pages
- Revalidation on data changes

## Design System

### Typography
- **Serif**: Crimson Pro (headings, prices)
- **Sans**: Inter (body, UI elements)

### Colors
- **Primary**: `#1a1a1a` (charcoal-deep)
- **Background**: `#f5f5f0` (off-white)
- **Borders**: `#e8e8e3` (off-white-dim)
- **Secondary**: `#404040` (charcoal-light)

### Spacing Scale
- xs: 0.5rem (8px)
- sm: 1rem (16px)
- md: 1.5rem (24px)
- lg: 2rem (32px)
- xl: 3rem (48px)

### Border Radius
- **All elements**: 0px (sharp corners)
- No rounded corners anywhere

## Future Considerations

### Unified Checkout
- Bridge Shopify checkout with Supabase products
- Custom cart merging both sources
- Webhook handling for both fulfillment paths

### Inventory Management
- Real-time stock updates
- Low stock warnings
- Automatic restock notifications

### Search & Filtering
- Category filters
- Price range filters
- Full-text search across both sources

### Performance
- Redis caching layer
- CDN for static assets
- Database query optimization
