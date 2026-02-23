# Repository Audit and Cleanup Plan
## Charmed & Dark - Phase 1 Discovery

**Date**: February 23, 2026  
**Status**: Discovery Only - No Files Modified  
**Purpose**: Identify cruft, duplicates, and establish cleanup strategy

---

## Executive Summary

### Repository Health
- **Total Documentation Files (root)**: 40+ markdown files
- **Duplicate Shopify Clients**: 3 implementations identified
- **Duplicate Google/Gemini Clients**: 2 implementations identified  
- **Darkroom Pipelines**: 2 separate implementations (legacy + current)
- **Suspected Cruft**: ~25 files (high confidence)
- **Test Coverage**: Minimal (2 test files, coverage reports present)

### Top Issues
1. **Documentation Explosion**: 40+ markdown docs in root directory
2. **Shopify Client Fragmentation**: 3 separate client implementations
3. **Darkroom Duplication**: Two pipeline implementations (old CSV + new Shopify)
4. **Unused Scripts**: Multiple one-off migration/sync scripts
5. **Orphaned Files**: temp files, old experiments, duplicate images

---

## A) Complete File Tree Snapshot

### Root Level Files (Excluding node_modules, .next, .vercel, .git)

```
├── app/
│   ├── (sanctuary)/          # Sanctuary member UI
│   ├── __tests__/            # App-level tests
│   ├── about/
│   ├── admin/
│   │   ├── darkroom/         # Darkroom admin UI
│   │   └── inventory/
│   ├── api/
│   │   ├── admin/darkroom/
│   │   ├── cart/
│   │   ├── darkroom/         # Darkroom API endpoints
│   │   ├── debug/
│   │   ├── generate-narrative/
│   │   ├── generate-token/
│   │   ├── sanctuary/
│   │   ├── sync-sheets/
│   │   └── webhooks/
│   ├── archive/
│   ├── cart/
│   ├── client-services/
│   ├── collections/
│   ├── ethos/
│   ├── join/
│   ├── not-authorized/
│   ├── product/
│   ├── sanctuary/
│   ├── shop/
│   ├── studio/              # Studio tools (narrative, products, etc.)
│   ├── threshold/           # Commerce/checkout UI
│   ├── uniform/
│   ├── utils/
│   ├── globals.css
│   ├── layout.tsx
│   ├── not-found.tsx
│   └── page.tsx
├── components/
│   ├── home/
│   └── [shared components]
├── coverage/                # Test coverage reports
├── data/                    # CSV data files
├── docs/
│   └── implementation/      # Implementation docs
├── lib/
│   ├── __tests__/
│   ├── auth/
│   ├── cart/
│   ├── darkroom/           # Darkroom core logic
│   ├── google-sheets/
│   ├── narrative-engine/
│   ├── sanctuary/
│   ├── shopify/            # Shopify integrations
│   ├── storefront/         # Storefront client (duplicate?)
│   ├── supabase/
│   └── [utility files]
├── powers/
│   └── shopify-admin/
├── public/
│   ├── images/             # General images
│   ├── product-images/     # Product images (flat)
│   └── products/           # Product images (nested by handle)
├── scripts/                # Utility scripts
├── supabase/
│   └── migrations/
├── .kiro/
│   ├── settings/
│   └── specs/
├── middleware.ts
├── [40+ markdown documentation files]
└── [config files]
```


---

## B) Categorized File Inventory

### 1) Active Production (Required for current site)
**Core Application**
- `app/layout.tsx` - Root layout
- `app/page.tsx` - Homepage
- `app/globals.css` - Global styles
- `app/not-found.tsx` - 404 page
- `middleware.ts` - Route middleware
- `next.config.js` - Next.js config
- `tsconfig.json` - TypeScript config
- `package.json` - Dependencies

**Shared Components**
- `components/Header.tsx`
- `components/Navigation.tsx`
- `components/ProductCard.tsx`
- `components/ProductGrid.tsx`
- `components/ProductImageGallery.tsx`
- `components/VariantSelector.tsx`
- `components/PricingDisplay.tsx`
- `components/CategoryFilter.tsx`
- `components/ImagePlaceholder.tsx`
- `components/ProductDescription.tsx`

**Core Libraries**
- `lib/products.ts` - Product utilities
- `lib/pricing.ts` - Pricing logic
- `lib/confirmToken.ts` - Token generation/verification
- `lib/tracking.ts` - Analytics tracking

### 2) Threshold (Commerce UI)
**Pages**
- `app/threshold/enter/page.tsx` - Login/entry
- `app/threshold/cart/page.tsx` - Cart page
- `app/threshold/confirmation/page.tsx` - Order confirmation
- `app/threshold/confirmation/ConfirmationView.tsx`
- `app/threshold/confirmation/CalmError.tsx`
- `app/threshold/confirmation/CalmRetry.tsx`

**API Routes**
- `app/api/cart/route.ts` - Cart operations
- `app/api/generate-token/route.ts` - Token generation
- `app/api/webhooks/orders-create/route.ts` - Order webhooks

**Libraries**
- `lib/cart/context.tsx` - Cart context

### 3) Sanctuary (Member UI)
**Pages**
- `app/(sanctuary)/layout.tsx` - Sanctuary layout
- `app/(sanctuary)/grimoire/layout.tsx`
- `app/(sanctuary)/grimoire/page.tsx`
- `app/(sanctuary)/mirror/layout.tsx`
- `app/(sanctuary)/mirror/page.tsx`
- `app/sanctuary/page.tsx` - Sanctuary landing

**API Routes**
- `app/api/sanctuary/chat/route.ts` - Curator chat
- `app/api/sanctuary/debug/route.ts` - Sanctuary diagnostics

**Libraries**
- `lib/sanctuary/ambience.ts` - Ambience system
- `lib/mirrorReadings.ts` - Mirror oracle readings
- `lib/gemini.ts` - Gemini AI client (Curator)

**Components**
- `components/home/MirrorPortal.tsx`

### 4) Admin (Including Darkroom UI)
**Pages**
- `app/admin/darkroom/page.tsx` - Darkroom admin UI
- `app/admin/darkroom/middleware.ts` - Darkroom middleware (DUPLICATE of root middleware?)
- `app/admin/inventory/page.tsx` - Inventory management
- `app/not-authorized/page.tsx` - Access denied

**Libraries**
- `lib/auth/admin.ts` - Admin access control


### 5) Darkroom Core Logic (Image Pipeline)
**API Routes**
- `app/api/darkroom/run/route.ts` - Run pipeline
- `app/api/darkroom/preflight/route.ts` - Preflight check
- `app/api/admin/darkroom/process/route.ts` - Legacy CSV processing (DEPRECATED?)

**Libraries - Current Implementation**
- `lib/darkroom/shopify-pipeline.ts` - Shopify-driven pipeline (CURRENT)
- `lib/darkroom/background-selector.ts` - AI background selection
- `lib/darkroom/background-generation.ts` - Replicate background gen
- `lib/darkroom/background-removal.ts` - Replicate background removal
- `lib/darkroom/compositor.ts` - Sharp image compositing
- `lib/darkroom/storage.ts` - Supabase storage upload

**Libraries - Legacy Implementation**
- `lib/darkroom/pipeline.ts` - CSV-driven pipeline (LEGACY - DEPRECATED)
- `lib/darkroom/database.ts` - Database operations (LEGACY?)

### 6) Shopify Integration
**DUPLICATE IMPLEMENTATIONS IDENTIFIED**

**Implementation 1: lib/shopify/** (Admin + Products)
- `lib/shopify/admin.ts` - Admin REST API (orders)
- `lib/shopify/darkroom.ts` - Admin GraphQL (Darkroom)
- `lib/shopify/products.ts` - Storefront API (products)
- `lib/shopify/storefront.ts` - Storefront API (cart)

**Implementation 2: lib/storefront/** (Duplicate Storefront Client)
- `lib/storefront/client.ts` - Storefront GraphQL client
- `lib/storefront/config.ts` - Configuration
- `lib/storefront/index.ts` - Exports
- `lib/storefront/types.ts` - Type definitions

**Recommendation**: Consolidate into single `lib/shopify/` with:
- `admin.ts` - Admin API (REST + GraphQL)
- `storefront.ts` - Storefront API
- `types.ts` - Shared types

### 7) Google Integration
**DUPLICATE IMPLEMENTATIONS IDENTIFIED**

**Implementation 1: lib/gemini.ts** (Sanctuary Curator)
- Uses `@google/generative-ai`
- Curator chat functionality
- Model: `gemini-2.5-flash`

**Implementation 2: lib/darkroom/background-selector.ts** (Darkroom)
- Uses `@google/generative-ai`
- Background selection
- Model: `gemini-1.5-flash`

**Recommendation**: Create singleton `lib/google/gemini.ts` with:
- Shared client initialization
- Curator prompts
- Background selection prompts
- Consistent model versioning

**Other Google Services**
- `lib/google-sheets/sync.ts` - Google Sheets sync
- Uses `googleapis` package
- Service account authentication

### 8) Supabase/Auth
**Libraries**
- `lib/supabase/client.ts` - Client-side Supabase
- `lib/supabase/server.ts` - Server-side Supabase
- `lib/auth/admin.ts` - Admin access control

**Migrations**
- `supabase/migrations/001_orders.sql`
- `supabase/migrations/002_products.sql`
- `supabase/migrations/003_add_google_sheets_fields.sql`
- `supabase/migrations/004_sanctuary_tables.sql`
- `supabase/migrations/005_fix_products_rls.sql`
- `supabase/migrations/006_add_image_url.sql`
- `supabase/migrations/007_add_images_array.sql`
- `supabase/migrations/008_add_variants.sql`

### 9) SEO/Schema
**Status**: Not explicitly implemented
**Recommendation**: Add `lib/seo/` for metadata, JSON-LD, OG tags

### 10) Styles/UI Shared Components
**Global Styles**
- `app/globals.css`

**Home Components**
- `components/home/BeliefStatement.tsx`
- `components/home/CategoryForms.tsx`
- `components/home/HeroIdentity.tsx`
- `components/home/HomeRituals.tsx`
- `components/home/MirrorPortal.tsx`
- `components/home/SectionDivider.tsx`
- `components/home/UniformGrid.tsx`

### 11) Docs (Intended to Keep)
**Root Directory Documentation (40+ files)**

**Core Documentation**
- `README.md` - Main project readme
- `DARKROOM_CURRENT_SYSTEM.md` - Darkroom system documentation
- `REPO_AUDIT_AND_CLEANUP_PLAN.md` - This document

**Feature Documentation**
- `SANCTUARY.md` - Sanctuary feature overview
- `THRESHOLD.md` - Threshold commerce system
- `NARRATIVE_ENGINE.md` - Narrative generation system
- `STUDIO.md` - Studio tools overview

**Implementation Docs (docs/implementation/)**
- `docs/implementation/darkroom-pipeline.md`
- `docs/implementation/sanctuary-curator.md`
- `docs/implementation/threshold-commerce.md`

**Studio Feature Docs**
- `app/studio/narrative/README.md`
- `app/studio/products/README.md`
- `app/studio/products/USAGE.md`
- `app/studio/drops/README.md`
- `app/studio/launch/README.md`

**Recommendation**: Consolidate root markdown files into `docs/` directory with clear structure:
```
docs/
├── README.md (project overview)
├── features/
│   ├── sanctuary.md
│   ├── threshold.md
│   ├── darkroom.md
│   ├── narrative-engine.md
│   └── studio.md
├── implementation/
│   └── [technical implementation docs]
└── archive/
    └── [deprecated docs]
```

### 12) Suspected Cruft (Likely Safe to Remove)

**High Confidence - Safe to Delete**

**Duplicate/Temp Files**
- `middleware copy.ts` - Duplicate middleware file
- `temp-test-shopify.js` - Temporary test script
- `test-shopify-connection.js` - One-off connection test
- `test-replicate.js` - One-off Replicate test

**Old Migration Scripts**
- `scripts/migrate-products.js` - One-time migration (completed)
- `scripts/sync-google-sheets.js` - Replaced by API route
- `scripts/update-product-images.js` - One-time update (completed)
- `scripts/fix-image-urls.js` - One-time fix (completed)

**Legacy Darkroom (CSV-based)**
- `lib/darkroom/pipeline.ts` - Old CSV pipeline (replaced by shopify-pipeline.ts)
- `lib/darkroom/database.ts` - Old database operations (if not used elsewhere)
- `app/api/admin/darkroom/process/route.ts` - Old CSV upload endpoint
- `data/*.csv` - Old CSV data files (if no longer needed)

**Duplicate Product Images**
- `public/product-images/` - Flat structure (if `public/products/` is canonical)
- OR `public/products/` - Nested structure (if `public/product-images/` is canonical)
- **Action Required**: Determine which is canonical, remove the other

**Test/Debug Files**
- `scripts/test-shopify-products.js` - One-off test (keep if useful for debugging)
- `app/api/debug/products/route.ts` - Debug endpoint (keep in dev, remove in prod?)
- `app/api/debug/list-handles/route.ts` - Debug endpoint

**Unused Components (Need Verification)**
- `components/ProductDescription.tsx` - Check if imported anywhere
- `components/ImagePlaceholder.tsx` - Check if imported anywhere

**Coverage Reports (Generated)**
- `coverage/` - Generated by tests, can be gitignored and regenerated

### 13) Unknown / Needs Review

**Requires Investigation**

**Middleware Duplication**
- `middleware.ts` (root)
- `app/admin/darkroom/middleware.ts`
- **Question**: Why two middleware files? Is darkroom middleware used?

**Storefront Client Duplication**
- `lib/shopify/storefront.ts`
- `lib/storefront/client.ts`
- **Question**: Which is actively used? Can we consolidate?

**Database Operations**
- `lib/darkroom/database.ts`
- **Question**: Is this used by current Shopify pipeline or only legacy CSV pipeline?

**Google Sheets Sync**
- `lib/google-sheets/sync.ts`
- `app/api/sync-sheets/route.ts`
- **Question**: Still actively used or replaced by Shopify integration?

**Product Image Directories**
- `public/product-images/` (flat)
- `public/products/` (nested by handle)
- **Question**: Which is canonical? Are both needed?

**Archive Directory**
- `app/archive/`
- **Question**: What's in here? Can it be deleted or moved to root-level archive?

**About Directory**
- `app/about/`
- **Question**: Is this page live? What's the content?

**Client Services**
- `app/client-services/`
- **Question**: What is this feature? Is it active?

**Uniform**
- `app/uniform/`
- **Question**: What is this feature? Is it active?

**Powers**
- `powers/shopify-admin/`
- **Question**: What is this? Kiro power? Still needed?

**Environment Variables**
- **Action Required**: Cross-reference all env vars in code with `.env.example`
- Check for unused vars in `.env.example`
- Check for undocumented vars in code

---

## C) Duplicates and Unused Code

### Duplicate Implementations

**1. Shopify Clients (3 implementations)**
- `lib/shopify/admin.ts` - Admin REST API
- `lib/shopify/darkroom.ts` - Admin GraphQL API
- `lib/shopify/storefront.ts` - Storefront API
- `lib/storefront/client.ts` - Duplicate Storefront API
- `lib/storefront/config.ts`
- `lib/storefront/types.ts`

**Consolidation Plan**: 
- Keep `lib/shopify/` as single source
- Merge `lib/storefront/*` into `lib/shopify/storefront.ts`
- Create `lib/shopify/types.ts` for shared types
- Delete `lib/storefront/` directory

**2. Google/Gemini Clients (2 implementations)**
- `lib/gemini.ts` - Sanctuary Curator (gemini-2.5-flash)
- `lib/darkroom/background-selector.ts` - Darkroom (gemini-1.5-flash)

**Consolidation Plan**:
- Create `lib/google/gemini.ts` singleton
- Export `getCuratorClient()` and `getBackgroundSelectorClient()`
- Centralize model version management
- Update imports in sanctuary and darkroom code

**3. Darkroom Pipelines (2 implementations)**
- `lib/darkroom/pipeline.ts` - Legacy CSV-based pipeline
- `lib/darkroom/shopify-pipeline.ts` - Current Shopify-based pipeline
- `app/api/admin/darkroom/process/route.ts` - Legacy CSV upload endpoint
- `app/api/darkroom/run/route.ts` - Current Shopify endpoint

**Consolidation Plan**:
- Archive or delete legacy CSV pipeline
- Keep only `shopify-pipeline.ts`
- Remove CSV upload endpoint
- Update documentation

**4. Middleware Files (2 files)**
- `middleware.ts` (root)
- `app/admin/darkroom/middleware.ts`

**Investigation Required**: Determine if darkroom middleware is used

**5. Product Image Directories (2 directories)**
- `public/product-images/` - Flat structure
- `public/products/` - Nested by handle

**Investigation Required**: Determine canonical location, remove duplicate

### Unused API Routes (Candidates)

**Debug Routes** (Remove in production)
- `app/api/debug/products/route.ts`
- `app/api/debug/list-handles/route.ts`
- `app/api/sanctuary/debug/route.ts`

**Legacy Routes** (If CSV pipeline is deprecated)
- `app/api/admin/darkroom/process/route.ts`

**Sync Routes** (If replaced by Shopify integration)
- `app/api/sync-sheets/route.ts`

### Dead Components/Utilities (Need Verification)

**Method**: Search codebase for imports of these files

**Candidates**:
- `components/ProductDescription.tsx`
- `components/ImagePlaceholder.tsx`
- `lib/darkroom/database.ts`
- `lib/google-sheets/sync.ts`

**Action Required**: Run import analysis to confirm

### Old Experiments and Test Scripts

**One-off Scripts** (Safe to delete after verification)
- `scripts/migrate-products.js`
- `scripts/sync-google-sheets.js`
- `scripts/update-product-images.js`
- `scripts/fix-image-urls.js`
- `scripts/test-shopify-products.js`
- `scripts/test-shopify-connection.js`
- `scripts/test-replicate.js`
- `temp-test-shopify.js`

**Keep**:
- `scripts/generate-shopify-token.js` - Useful for token generation

### Environment Variables Audit

**Action Required**: Cross-reference code with `.env.example`

**Known Variables** (from context):
- `SHOPIFY_ADMIN_ACCESS_TOKEN`
- `NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN`
- `GEMINI_API_KEY`
- `NEXT_PUBLIC_ADMIN_EMAILS`
- `SUPABASE_URL`
- `SUPABASE_ANON_KEY`
- `REPLICATE_API_TOKEN`
- `GOOGLE_SHEETS_CLIENT_EMAIL`
- `GOOGLE_SHEETS_PRIVATE_KEY`

**Need to Verify**:
- Are all variables in `.env.example`?
- Are all variables in `.env.example` actually used in code?
- Any hardcoded secrets that should be env vars?

---

## D) Cleanup Plan

### Phase 1: Safe to Delete (High Confidence)

**Duplicate Files**
- [ ] `middleware copy.ts`

**Temp/Test Files**
- [ ] `temp-test-shopify.js`
- [ ] `test-shopify-connection.js`
- [ ] `test-replicate.js`

**One-off Migration Scripts** (after verification they're complete)
- [ ] `scripts/migrate-products.js`
- [ ] `scripts/sync-google-sheets.js`
- [ ] `scripts/update-product-images.js`
- [ ] `scripts/fix-image-urls.js`

**Generated Coverage Reports** (add to .gitignore)
- [ ] `coverage/` (keep directory, gitignore contents)

### Phase 2: Review Before Delete (Medium Confidence)

**Legacy Darkroom** (verify not used)
- [ ] `lib/darkroom/pipeline.ts`
- [ ] `lib/darkroom/database.ts`
- [ ] `app/api/admin/darkroom/process/route.ts`
- [ ] `data/*.csv` files

**Debug Endpoints** (keep in dev, remove in prod)
- [ ] `app/api/debug/products/route.ts`
- [ ] `app/api/debug/list-handles/route.ts`
- [ ] `app/api/sanctuary/debug/route.ts`

**Duplicate Storefront Client** (after consolidation)
- [ ] `lib/storefront/client.ts`
- [ ] `lib/storefront/config.ts`
- [ ] `lib/storefront/index.ts`
- [ ] `lib/storefront/types.ts`

**Duplicate Product Images** (after determining canonical location)
- [ ] `public/product-images/` OR `public/products/` (one of these)

**Unused Components** (after import analysis)
- [ ] `components/ProductDescription.tsx` (if not imported)
- [ ] `components/ImagePlaceholder.tsx` (if not imported)

**Google Sheets Sync** (if replaced by Shopify)
- [ ] `lib/google-sheets/sync.ts`
- [ ] `app/api/sync-sheets/route.ts`

### Phase 3: Keep (High Confidence)

**Core Application**
- All files in Category 1 (Active Production)
- All files in Category 2 (Threshold)
- All files in Category 3 (Sanctuary)
- All files in Category 4 (Admin)

**Current Darkroom**
- `lib/darkroom/shopify-pipeline.ts`
- `lib/darkroom/background-selector.ts`
- `lib/darkroom/background-generation.ts`
- `lib/darkroom/background-removal.ts`
- `lib/darkroom/compositor.ts`
- `lib/darkroom/storage.ts`
- `app/api/darkroom/run/route.ts`
- `app/api/darkroom/preflight/route.ts`

**Shopify Integration** (after consolidation)
- `lib/shopify/admin.ts`
- `lib/shopify/darkroom.ts`
- `lib/shopify/products.ts`
- `lib/shopify/storefront.ts` (consolidated)
- `lib/shopify/types.ts` (new)

**Google Integration** (after consolidation)
- `lib/google/gemini.ts` (new singleton)

**Useful Scripts**
- `scripts/generate-shopify-token.js`

**Documentation** (after reorganization)
- All markdown files (moved to `docs/` structure)

### Phase 4: Investigation Required

**Before any action, investigate**:
1. `app/admin/darkroom/middleware.ts` - Is this used?
2. `lib/darkroom/database.ts` - Used by current pipeline?
3. Product image directories - Which is canonical?
4. `app/archive/` - What's in here?
5. `app/about/` - Is this page live?
6. `app/client-services/` - Active feature?
7. `app/uniform/` - Active feature?
8. `powers/shopify-admin/` - Still needed?
9. Environment variables - Cross-reference with code

---

## E) Proposed Target Folder Structure

### Reorganized Structure

```
charmedanddark/
├── app/
│   ├── (sanctuary)/              # Sanctuary member area
│   │   ├── grimoire/
│   │   ├── mirror/
│   │   └── layout.tsx
│   ├── threshold/                # Commerce/checkout
│   │   ├── cart/
│   │   ├── confirmation/
│   │   └── enter/
│   ├── admin/                    # Admin tools
│   │   ├── darkroom/
│   │   └── inventory/
│   ├── studio/                   # Studio tools
│   │   ├── narrative/
│   │   ├── products/
│   │   ├── drops/
│   │   ├── launch/
│   │   └── voice/
│   ├── api/
│   │   ├── cart/
│   │   ├── darkroom/            # Darkroom API
│   │   ├── generate-narrative/
│   │   ├── generate-token/
│   │   ├── sanctuary/
│   │   └── webhooks/
│   ├── product/
│   ├── collections/
│   ├── shop/
│   ├── globals.css
│   ├── layout.tsx
│   ├── page.tsx
│   └── not-found.tsx
├── components/
│   ├── commerce/                # Threshold components
│   │   ├── ProductCard.tsx
│   │   ├── ProductGrid.tsx
│   │   ├── VariantSelector.tsx
│   │   └── PricingDisplay.tsx
│   ├── sanctuary/               # Sanctuary components
│   │   └── MirrorPortal.tsx
│   ├── layout/                  # Shared layout
│   │   ├── Header.tsx
│   │   └── Navigation.tsx
│   └── home/                    # Homepage components
│       ├── BeliefStatement.tsx
│       ├── HeroIdentity.tsx
│       └── [other home components]
├── lib/
│   ├── shopify/                 # CONSOLIDATED Shopify
│   │   ├── admin.ts            # Admin API (REST + GraphQL)
│   │   ├── storefront.ts       # Storefront API (consolidated)
│   │   ├── darkroom.ts         # Darkroom-specific operations
│   │   └── types.ts            # Shared types
│   ├── google/                  # CONSOLIDATED Google
│   │   ├── gemini.ts           # Singleton Gemini client
│   │   └── sheets.ts           # Google Sheets (if kept)
│   ├── darkroom/                # Darkroom core
│   │   ├── shopify-pipeline.ts # Main pipeline
│   │   ├── background-selector.ts
│   │   ├── background-generation.ts
│   │   ├── background-removal.ts
│   │   ├── compositor.ts
│   │   └── storage.ts
│   ├── sanctuary/               # Sanctuary logic
│   │   └── ambience.ts
│   ├── auth/                    # Authentication
│   │   └── admin.ts
│   ├── supabase/                # Supabase clients
│   │   ├── client.ts
│   │   └── server.ts
│   ├── cart/                    # Cart logic
│   │   └── context.tsx
│   ├── narrative-engine/        # Narrative generation
│   │   ├── generator.ts
│   │   ├── validator.ts
│   │   └── templates/
│   ├── products.ts              # Product utilities
│   ├── pricing.ts               # Pricing logic
│   ├── confirmToken.ts          # Token utilities
│   ├── tracking.ts              # Analytics
│   └── mirrorReadings.ts        # Mirror oracle
├── docs/                        # CONSOLIDATED documentation
│   ├── README.md               # Project overview
│   ├── features/               # Feature documentation
│   │   ├── sanctuary.md
│   │   ├── threshold.md
│   │   ├── darkroom.md
│   │   ├── narrative-engine.md
│   │   └── studio.md
│   ├── implementation/         # Technical docs
│   │   ├── darkroom-pipeline.md
│   │   ├── sanctuary-curator.md
│   │   └── threshold-commerce.md
│   └── archive/                # Deprecated docs
├── scripts/                     # Utility scripts
│   └── generate-shopify-token.js
├── supabase/
│   └── migrations/
├── public/
│   ├── images/                 # General images
│   └── products/               # Product images (CANONICAL)
├── .kiro/
├── middleware.ts
├── next.config.js
├── package.json
├── tsconfig.json
└── .env.example
```

### Key Changes

**Consolidations**:
1. `lib/storefront/` → merged into `lib/shopify/storefront.ts`
2. `lib/gemini.ts` + `lib/darkroom/background-selector.ts` → `lib/google/gemini.ts`
3. All root markdown files → `docs/` directory
4. Components organized by domain (commerce, sanctuary, layout, home)

**Deletions**:
1. Legacy Darkroom CSV pipeline
2. Duplicate middleware files
3. Temp/test scripts
4. One-off migration scripts
5. Duplicate product image directory

**Singletons Created**:
1. ONE Shopify client (`lib/shopify/`)
2. ONE Google/Gemini client (`lib/google/gemini.ts`)
3. ONE product image directory (`public/products/`)

---

## Summary: Top 10 Cruft Candidates

### High Priority Deletions

1. **`lib/darkroom/pipeline.ts`** - Legacy CSV pipeline (replaced by shopify-pipeline.ts)
2. **`lib/storefront/` directory** - Duplicate Shopify storefront client (4 files)
3. **`middleware copy.ts`** - Duplicate middleware file
4. **`app/api/admin/darkroom/process/route.ts`** - Legacy CSV upload endpoint
5. **Migration scripts** - 4 one-off scripts (migrate-products, sync-google-sheets, update-product-images, fix-image-urls)
6. **Temp test files** - 3 files (temp-test-shopify.js, test-shopify-connection.js, test-replicate.js)
7. **`public/product-images/` OR `public/products/`** - One of these duplicate directories
8. **`data/*.csv` files** - Old CSV data (if no longer needed)
9. **Debug API routes** - 3 endpoints (debug/products, debug/list-handles, sanctuary/debug)
10. **40+ root markdown files** - Move to `docs/` directory (not delete, but relocate)

**Estimated Cleanup Impact**: ~50-60 files removed or relocated

---

## Summary: Top 5 Duplicates to Consolidate

### Critical Consolidations

1. **Shopify Clients** (3 implementations → 1)
   - `lib/shopify/admin.ts`
   - `lib/shopify/darkroom.ts`
   - `lib/shopify/storefront.ts`
   - `lib/storefront/*` (4 files)
   - **Action**: Merge into single `lib/shopify/` module

2. **Google/Gemini Clients** (2 implementations → 1)
   - `lib/gemini.ts` (Sanctuary)
   - `lib/darkroom/background-selector.ts` (Darkroom)
   - **Action**: Create singleton `lib/google/gemini.ts`

3. **Darkroom Pipelines** (2 implementations → 1)
   - `lib/darkroom/pipeline.ts` (legacy CSV)
   - `lib/darkroom/shopify-pipeline.ts` (current)
   - **Action**: Delete legacy, keep Shopify pipeline

4. **Product Image Directories** (2 directories → 1)
   - `public/product-images/` (flat)
   - `public/products/` (nested)
   - **Action**: Determine canonical, delete duplicate

5. **Middleware Files** (2 files → 1?)
   - `middleware.ts` (root)
   - `app/admin/darkroom/middleware.ts`
   - **Action**: Investigate if darkroom middleware is used, consolidate if possible

**Estimated Consolidation Impact**: ~15-20 files merged or removed

---

## Next Steps

### Phase 2: Execution (Not Started)

**After user approval**:
1. Create backup branch
2. Execute Phase 1 deletions (safe files)
3. Consolidate Shopify clients
4. Consolidate Google/Gemini clients
5. Remove legacy Darkroom pipeline
6. Reorganize documentation into `docs/`
7. Update all imports
8. Run tests
9. Update `.gitignore` for coverage reports
10. Create PR with detailed changelog

**Estimated Effort**: 4-6 hours of careful refactoring

---

**End of Phase 1 Discovery Report**
