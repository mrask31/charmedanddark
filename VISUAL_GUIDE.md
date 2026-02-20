# Visual Guide - Charmed & Dark

## Page Layouts

### Home Page (`/`)
```
┌─────────────────────────────────────────────────────────┐
│  Charmed & Dark              Enter the House / Recognized│
├─────────────────────────────────────────────────────────┤
│                                                           │
│                  Apparel & Objects                        │
│                   Everyday Gothic                         │
│                                                           │
├─────────────────────────────────────────────────────────┤
│  ┌──────┐  ┌──────┐  ┌──────┐  ┌──────┐               │
│  │      │  │      │  │      │  │      │               │
│  │ IMG  │  │ IMG  │  │ IMG  │  │ IMG  │               │
│  │      │  │      │  │      │  │      │               │
│  └──────┘  └──────┘  └──────┘  └──────┘               │
│  Title      Title      Title      Title                  │
│  $68.00     $45.00     $120.00    $52.00                │
│  $61 House  $41 House  $108 House $47 House             │
│                                                           │
│  ┌──────┐  ┌──────┐  ┌──────┐  ┌──────┐               │
│  │      │  │      │  │      │  │      │               │
│  │ IMG  │  │ IMG  │  │ IMG  │  │ IMG  │               │
│  │      │  │      │  │      │  │      │               │
│  └──────┘  └──────┘  └──────┘  └──────┘               │
│  ...more products...                                     │
└─────────────────────────────────────────────────────────┘
```

### Product Detail Page (`/product/[handle]`)
```
┌─────────────────────────────────────────────────────────┐
│  Charmed & Dark              Enter the House / Recognized│
├─────────────────────────────────────────────────────────┤
│  ← All Products                                          │
│                                                           │
│  ┌──────────────┐    Gothic Candle Holder               │
│  │              │    LIGHTING                            │
│  │              │                                         │
│  │    HERO      │    ─────────────────────────           │
│  │    IMAGE     │    Standard    House                   │
│  │              │    $68.00      $61.00                  │
│  │              │    ─────────────────────────           │
│  └──────────────┘                                        │
│  [thumb][thumb]     Hand-forged iron candle holder      │
│                     with intricate gothic detailing.     │
│                     Holds standard taper candles.        │
│                                                           │
│                     ┌─────────────────────┐             │
│                     │    ADD TO CART      │             │
│                     └─────────────────────┘             │
│                                                           │
│                     Home Object                          │
└─────────────────────────────────────────────────────────┘
```

### Enter the House (`/threshold/enter`)
```
┌─────────────────────────────────────────────────────────┐
│                                                           │
│                                                           │
│              ┌─────────────────────┐                    │
│              │  ← Return           │                    │
│              │                     │                    │
│              │  Enter the House    │                    │
│              │                     │                    │
│              │  Recognized members │                    │
│              │  receive House      │                    │
│              │  pricing            │                    │
│              │                     │                    │
│              │  EMAIL              │                    │
│              │  [____________]     │                    │
│              │                     │                    │
│              │  PASSWORD           │                    │
│              │  [____________]     │                    │
│              │                     │                    │
│              │  ┌───────────────┐ │                    │
│              │  │     ENTER     │ │                    │
│              │  └───────────────┘ │                    │
│              │                     │                    │
│              │  Need an account?  │                    │
│              │  Sign up           │                    │
│              └─────────────────────┘                    │
│                                                           │
└─────────────────────────────────────────────────────────┘
```

## Component Hierarchy

```
app/layout.tsx
└── app/page.tsx
    ├── Header
    │   ├── Logo (Link to /)
    │   └── Auth Status
    │       ├── "Enter the House" (not logged in)
    │       └── "Recognized" + "Leave" (logged in)
    │
    └── ProductGrid
        └── ProductCard (multiple)
            ├── Image (with hover state)
            ├── Title
            ├── PricingDisplay
            │   ├── Standard Price (not logged in)
            │   ├── House Price (always)
            │   └── House Price only (logged in)
            └── Category
```

## Pricing Display States

### Not Authenticated
```
┌─────────────────────┐
│ Gothic Candle Holder│
│                     │
│ $68.00  $61.00 House│
│                     │
│ LIGHTING            │
└─────────────────────┘
```

### Authenticated (Recognized)
```
┌─────────────────────┐
│ Gothic Candle Holder│
│                     │
│ $61.00              │
│                     │
│ LIGHTING            │
└─────────────────────┘
```

## Color Palette

```
Background:     #f5f5f0  ░░░░░░░░░░  Off White
Text Primary:   #1a1a1a  ██████████  Charcoal Deep
Text Secondary: #404040  ████████░░  Charcoal Light
Borders:        #e8e8e3  ░░░░░░░░░░  Off White Dim
Buttons:        #1a1a1a  ██████████  Charcoal Deep
Button Text:    #f5f5f0  ░░░░░░░░░░  Off White
```

## Typography Scale

```
Page Title:     2.5rem  Crimson Pro  Apparel & Objects
Section Title:  2rem    Crimson Pro  Gothic Candle Holder
Product Title:  1.1rem  Crimson Pro  Velvet Throw Pillow
Price:          1rem    Crimson Pro  $68.00
Body Text:      1rem    Inter        Description text
Small Text:     0.85rem Inter        Category labels
Tiny Text:      0.75rem Inter        LIGHTING
```

## Spacing System

```
xs:  0.5rem  (8px)   ▌
sm:  1rem    (16px)  ▌▌
md:  1.5rem  (24px)  ▌▌▌
lg:  2rem    (32px)  ▌▌▌▌
xl:  3rem    (48px)  ▌▌▌▌▌▌
```

## Border Radius

```
All elements:  0px  ▭  Sharp corners everywhere
```

## Image Aspect Ratios

```
Product Card:   4:5   (400x500)
Hero Image:     4:5   (800x1000)
Thumbnails:     4:5   (150x187)
```

## Hover States

### Product Card
```
Default:        Show hero.jpg
Hover:          Show hover.jpg (if available)
                Border color changes
```

### Buttons
```
Default:        #1a1a1a background
Hover:          Slightly lighter
Active:         Pressed state
```

## Responsive Breakpoints

```
Mobile:     < 640px    1 column grid
Tablet:     640-1024px 2-3 column grid
Desktop:    > 1024px   4 column grid
```

## Data Flow Visualization

```
User visits /
    │
    ├─► Server fetches products
    │   ├─► Supabase: SELECT * FROM products
    │   └─► Shopify: GraphQL products query
    │
    ├─► Transform to UnifiedProduct[]
    │
    └─► Render ProductGrid
        │
        └─► Each ProductCard
            ├─► Check auth state (client-side)
            ├─► Calculate House price
            └─► Display appropriate pricing
```

## Authentication Flow

```
User clicks "Enter the House"
    │
    └─► /threshold/enter
        │
        ├─► Sign Up
        │   ├─► supabase.auth.signUp()
        │   └─► Redirect to /
        │
        └─► Sign In
            ├─► supabase.auth.signInWithPassword()
            └─► Redirect to /
                │
                └─► onAuthStateChange fires
                    └─► Components update pricing
```

## File Organization

```
charmed-and-dark/
├── 📁 app/                    # Next.js pages
│   ├── 📄 page.tsx            # Home
│   ├── 📄 layout.tsx          # Root layout
│   ├── 📄 globals.css         # Styles
│   ├── 📁 threshold/
│   │   └── 📁 enter/
│   │       └── 📄 page.tsx    # Auth
│   └── 📁 product/
│       └── 📁 [handle]/
│           └── 📄 page.tsx    # Details
│
├── 📁 components/             # React components
│   ├── 📄 Header.tsx
│   ├── 📄 ProductCard.tsx
│   ├── 📄 ProductGrid.tsx
│   └── 📄 PricingDisplay.tsx
│
├── 📁 lib/                    # Business logic
│   ├── 📄 pricing.ts
│   ├── 📄 products.ts
│   ├── 📁 supabase/
│   └── 📁 shopify/
│
├── 📁 public/                 # Static assets
│   ├── 📁 products/           # Product images
│   └── 📁 images/             # Other images
│
├── 📁 supabase/               # Database
│   └── 📁 migrations/
│
└── 📁 scripts/                # Utilities
    ├── 📄 seed-products.ts
    ├── 📄 verify-setup.ts
    └── 📄 check-images.ts
```

## Quick Reference

### Key URLs
- Home: `/`
- Auth: `/threshold/enter`
- Product: `/product/[handle]`

### Key Components
- `Header` - Navigation + auth status
- `ProductCard` - Individual product
- `ProductGrid` - Grid layout
- `PricingDisplay` - Dual pricing

### Key Functions
- `getPricingDisplay()` - Calculate prices
- `calculateHousePrice()` - 10% off, rounded
- `transformSupabaseProduct()` - Supabase → Unified
- `transformShopifyProduct()` - Shopify → Unified

### Key Scripts
- `npm run dev` - Start server
- `npm run verify-setup` - Check config
- `npm run seed-products` - Add samples
- `npm run check-images` - Check images
