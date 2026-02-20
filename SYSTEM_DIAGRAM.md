# System Diagram - Charmed & Dark

## Data Flow Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                     CHARMED & DARK                              │
│                  Hybrid Commerce Engine                         │
└─────────────────────────────────────────────────────────────────┘

┌──────────────────┐         ┌──────────────────┐
│  Google Sheets   │         │     Shopify      │
│  (50 Products)   │         │  (15 Products)   │
│                  │         │                  │
│  • Handle        │         │  • Apparel       │
│  • Title         │         │  • Printify      │
│  • 3 Lines       │         │  • Storefront    │
│  • Prices        │         │    API           │
│  • Stock         │         │                  │
│  • Metadata      │         │                  │
└────────┬─────────┘         └────────┬─────────┘
         │                            │
         │ Sync Every 6hrs            │ Fetch on Request
         │ (Vercel Cron)              │
         ▼                            ▼
┌─────────────────────────────────────────────┐
│            SUPABASE DATABASE                │
│                                             │
│  ┌──────────────────────────────────────┐  │
│  │  products                            │  │
│  │  • id, handle, title                 │  │
│  │  • description, description_lines    │  │
│  │  • base_price, house_price           │  │
│  │  • stock_quantity, category          │  │
│  │  • options, metadata                 │  │
│  │  • sync_source, last_synced_at       │  │
│  └──────────────────────────────────────┘  │
│                                             │
│  ┌──────────────────────────────────────┐  │
│  │  orders                              │  │
│  │  • shopify_order_id                  │  │
│  │  • line_items, shipping_address      │  │
│  │  • total_price                       │  │
│  └──────────────────────────────────────┘  │
│                                             │
│  ┌──────────────────────────────────────┐  │
│  │  auth.users                          │  │
│  │  • email, password                   │  │
│  │  • "House" members                   │  │
│  └──────────────────────────────────────┘  │
└─────────────┬───────────────────────────────┘
              │
              │ Server-Side Fetch
              │
              ▼
┌─────────────────────────────────────────────┐
│         NEXT.JS 14 APP ROUTER               │
│                                             │
│  ┌──────────────────────────────────────┐  │
│  │  lib/products.ts                     │  │
│  │  Unified Product Interface           │  │
│  │  • transformSupabaseProduct()        │  │
│  │  • transformShopifyProduct()         │  │
│  │  • Merge both sources                │  │
│  └──────────────────────────────────────┘  │
│                                             │
│  ┌──────────────────────────────────────┐  │
│  │  lib/pricing.ts                      │  │
│  │  Dual Pricing Logic                  │  │
│  │  • calculateHousePrice()             │  │
│  │  • 10% off, rounded                  │  │
│  └──────────────────────────────────────┘  │
│                                             │
│  ┌──────────────────────────────────────┐  │
│  │  Pages                               │  │
│  │  • / (Home - Unified Grid)           │  │
│  │  • /product/[handle] (Details)       │  │
│  │  • /threshold/enter (Auth)           │  │
│  └──────────────────────────────────────┘  │
│                                             │
│  ┌──────────────────────────────────────┐  │
│  │  Components                          │  │
│  │  • ProductGrid                       │  │
│  │  • ProductCard                       │  │
│  │  • PricingDisplay (Auth-aware)       │  │
│  │  • ProductDescription (3 lines)      │  │
│  └──────────────────────────────────────┘  │
└─────────────┬───────────────────────────────┘
              │
              │ Render
              │
              ▼
┌─────────────────────────────────────────────┐
│              FRONTEND                       │
│                                             │
│  ┌──────────────────────────────────────┐  │
│  │  Unified Product Grid                │  │
│  │  ┌────────┐ ┌────────┐ ┌────────┐   │  │
│  │  │Supabase│ │Supabase│ │Shopify │   │  │
│  │  │Product │ │Product │ │Product │   │  │
│  │  └────────┘ └────────┘ └────────┘   │  │
│  │                                      │  │
│  │  All products look identical         │  │
│  │  Source is transparent to user       │  │
│  └──────────────────────────────────────┘  │
│                                             │
│  ┌──────────────────────────────────────┐  │
│  │  Pricing Display                     │  │
│  │                                      │  │
│  │  Not Logged In:                      │  │
│  │  Standard: $68.00                    │  │
│  │  House: $61.00                       │  │
│  │                                      │  │
│  │  Logged In:                          │  │
│  │  $61.00                              │  │
│  └──────────────────────────────────────┘  │
└─────────────────────────────────────────────┘
```

## Sync Flow Detail

```
┌─────────────────────────────────────────────────────────────┐
│                    GOOGLE SHEETS SYNC                       │
└─────────────────────────────────────────────────────────────┘

Manual Trigger:
  npm run sync-sheets
       │
       ▼
  scripts/sync-sheets.ts
       │
       ▼
  lib/google-sheets/sync.ts
       │
       ├─► fetchSheetData()
       │   • Authenticate with service account
       │   • Read rows from sheet
       │   • Parse 11 columns
       │   • Return SheetRow[]
       │
       └─► syncProductsToSupabase()
           • For each product:
           │  ├─► Build description_lines array
           │  ├─► Parse options JSON
           │  ├─► Parse metadata JSON
           │  └─► Upsert to Supabase
           │
           └─► Return results
               • created: X
               • updated: Y
               • errors: Z

Automated Trigger (Every 6 hours):
  Vercel Cron Job
       │
       ▼
  POST /api/sync-sheets
       │
       ▼
  app/api/sync-sheets/route.ts
       │
       ├─► Verify auth token (optional)
       │
       └─► syncGoogleSheets()
           │
           └─► Same flow as manual
```

## Authentication Flow

```
┌─────────────────────────────────────────────────────────────┐
│                   AUTHENTICATION FLOW                       │
└─────────────────────────────────────────────────────────────┘

User visits site
       │
       ▼
  Not Authenticated
       │
       ├─► Header shows "Enter the House"
       ├─► Pricing shows both Standard & House
       └─► Click "Enter the House"
              │
              ▼
         /threshold/enter
              │
              ├─► Sign Up
              │   • Email + Password
              │   • Supabase Auth
              │   • Create account
              │
              └─► Sign In
                  • Email + Password
                  • Supabase Auth
                  • Authenticate
                     │
                     ▼
                Authenticated
                     │
                     ├─► Header shows "Recognized"
                     ├─► Pricing shows House price only
                     └─► Session persists
```

## Image Resolution Flow

```
┌─────────────────────────────────────────────────────────────┐
│                    IMAGE RESOLUTION                         │
└─────────────────────────────────────────────────────────────┘

Product: gothic-candle-holder
Options: {"colors": ["Black", "Silver"]}

transformSupabaseProduct()
       │
       ├─► Check if options.colors exists
       │   │
       │   ├─► YES: Use color-specific path
       │   │   /products/gothic-candle-holder/
       │   │     gothic-candle-holder-black.jpg
       │   │
       │   └─► NO: Use standard path
       │       /products/gothic-candle-holder/
       │         hero.jpg
       │         front.jpg
       │         hover.jpg
       │
       └─► Return image paths

Next.js Image Component
       │
       ├─► Try to load image
       │   │
       │   ├─► SUCCESS: Display image
       │   │
       │   └─► FAIL: Display fallback
       │       /images/placeholder.jpg
       │
       └─► Optimize and cache
```

## Pricing Calculation

```
┌─────────────────────────────────────────────────────────────┐
│                  PRICING CALCULATION                        │
└─────────────────────────────────────────────────────────────┘

Google Sheets:
  Base Price: 68.00
  House Price: 61.00
       │
       ▼
  Stored in Supabase
       │
       ▼
  transformSupabaseProduct()
       │
       ├─► price = base_price (68.00)
       │
       └─► Return UnifiedProduct
              │
              ▼
         getPricingDisplay(68.00)
              │
              ├─► standard = 68.00
              ├─► house = calculateHousePrice(68.00)
              │   • 68.00 × 0.9 = 61.2
              │   • Math.round(61.2) = 61
              │   • house = 61.00
              │
              └─► Return PricingDisplay
                     │
                     ▼
                PricingDisplay Component
                     │
                     ├─► Check auth state
                     │   │
                     │   ├─► Authenticated
                     │   │   Display: $61.00
                     │   │
                     │   └─► Not Authenticated
                     │       Display: Standard $68.00
                     │                House $61.00
                     │
                     └─► Listen for auth changes
                         Update display in real-time
```

## Component Hierarchy

```
┌─────────────────────────────────────────────────────────────┐
│                  COMPONENT HIERARCHY                        │
└─────────────────────────────────────────────────────────────┘

app/layout.tsx (Root)
  │
  ├─► Header
  │   ├─► Logo / Title
  │   └─► Auth Status
  │       ├─► "Enter the House" (not logged in)
  │       └─► "Recognized" (logged in)
  │
  └─► Page Content
      │
      ├─► app/page.tsx (Home)
      │   └─► ProductGrid
      │       ├─► Fetch Supabase products
      │       ├─► Fetch Shopify products
      │       ├─► Merge into unified array
      │       └─► Map to ProductCard[]
      │           └─► ProductCard
      │               ├─► Image (with hover)
      │               ├─► Title
      │               ├─► Category
      │               └─► PricingDisplay
      │                   ├─► Check auth
      │                   └─► Show prices
      │
      ├─► app/product/[handle]/page.tsx
      │   ├─► Fetch product by handle
      │   ├─► Image gallery
      │   ├─► Title & Category
      │   ├─► PricingDisplay
      │   ├─► ProductDescription
      │   │   └─► Three-line format
      │   └─► Add to Cart button
      │
      └─► app/threshold/enter/page.tsx
          ├─► Sign Up form
          └─► Sign In form
```

## Technology Stack

```
┌─────────────────────────────────────────────────────────────┐
│                   TECHNOLOGY STACK                          │
└─────────────────────────────────────────────────────────────┘

Frontend:
  ├─► Next.js 14 (App Router)
  ├─► React 18
  ├─► TypeScript
  └─► Inline Styles (Modern Minimalist Gothic)

Backend:
  ├─► Next.js API Routes
  ├─► Supabase (PostgreSQL)
  ├─► Supabase Auth
  └─► Server-Side Rendering

External APIs:
  ├─► Google Sheets API (Inventory sync)
  ├─► Shopify Storefront API (Apparel)
  └─► Shopify Admin API (Webhooks)

Deployment:
  ├─► Vercel (Hosting)
  ├─► Vercel Cron (Automated sync)
  └─► Supabase (Database hosting)

Development:
  ├─► TypeScript
  ├─► Jest (Testing)
  ├─► ts-node (Scripts)
  └─► dotenv (Environment)
```

---

**Diagram Version**: Sprint 2 Complete
**Last Updated**: Google Sheets Sync Implementation
**Purpose**: Visual reference for system architecture
