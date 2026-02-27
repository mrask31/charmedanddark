# Charmed & Dark - Project Status Report

**Generated:** February 26, 2026  
**Status Overview:** Active development with 9 feature specs in various stages

---

## Executive Summary

The project is building a gothic-romantic luxury ecommerce experience with a strong focus on atmosphere, ritual, and visual elegance. The foundation (visual system, accent reveals, inventory) is largely complete, while commerce features (cart, checkout) and AI-powered systems (narrative engine, darkroom) are in progress.

---

## Completed Features ✓

### 1. Visual System (Foundation)
**Status:** Requirements & Design Complete | No Tasks File  
**Purpose:** Core design language defining colors, typography, spacing, and interaction patterns

- Sacred color palette established (blacks, deep red, deep purple, muted gold)
- Typography and spacing rules defined
- Explicit exclusions documented (no popups, countdown timers, scarcity tactics)
- Philosophy: Slowness over speed, presence over volume, elegance over efficiency

### 2. Accent Reveal System
**Status:** 75% Complete (18/24 tasks done)  
**Purpose:** Subtle color reveals on hover/focus for buttons, cards, and inputs

**Completed:**
- CSS custom properties for accent colors
- Button accent reveals (gold outline, red glow, active states)
- Card accent reveals (gold edge, red undertone, purple shadow)
- Mirror input focus states
- Section entry reveals with Intersection Observer
- Accessibility layer (reduced motion, keyboard focus, touch support)
- Performance optimizations

**Remaining:**
- Optional property-based tests (11 tests)
- Unit tests for various components

### 3. Inventory Expansion
**Status:** 85% Complete (13/19 tasks done)  
**Purpose:** CSV ingestion system for 56 products and 32 variants

**Completed:**
- CSV parsing infrastructure
- Data validation
- Variant-to-product association
- Product and variant builders
- Module writer for products.ts and apparel.ts
- Main ingestion script
- Build validation

**Remaining:**
- Optional property-based tests
- Display verification on /shop and /uniform pages
- Variant selection testing on product detail pages

### 4. Product Narrative Engine
**Status:** 90% Complete (18/20 tasks done)  
**Purpose:** AI-powered narrative generation for product descriptions

**Completed:**
- Input validator with schema validation
- Style validator with forbidden pattern detection
- Narrative templates for 7 emotional cores (devotion, grief, protection, longing, transformation, memory, power)
- Tone controller (soft whispered, balanced reverent, dark commanding)
- Narrative generator for all 6 sections
- API route at /api/generate-narrative
- Unit tests for validation and API

**Remaining:**
- Golden test fixtures (3 fixtures)
- Optional property-based tests (18 tests)

---

## In Progress Features ⚙️

### 5. Product Discovery
**Status:** 0% Complete (0/13 tasks done)  
**Purpose:** Curated product browsing with collection portals

**Scope:**
- Product card and grid components
- Collection portals with ritualized language
- Navigation controls (no numbered pagination)
- Visual system conformance validation
- Responsive layouts (mobile, tablet, desktop)
- Density limits (5-7 products per viewport, max 4 per row)

**Key Principles:**
- Curated revelation, not browsing
- Generous whitespace and intentional placement
- No infinite scroll, no dense grids
- Deep red hover states, deep purple for featured items

### 6. Product Detail
**Status:** 0% Complete (0/12 tasks done)  
**Purpose:** Intimate single-object focus for product pages

**Scope:**
- Image gallery with elegant presentation
- Product narrative display
- Variant selection with elegant controls
- Claiming action (add to cart) with ritualized language
- Post-claiming navigation
- Visual system conformance

**Key Principles:**
- Image-dominant layout
- No aggressive upsells or cross-sells
- Singular primary CTA
- Elegant error handling

### 7. Cart
**Status:** 0% Complete (0/14 tasks done)  
**Purpose:** Curated collection space before checkout

**Scope:**
- Cart data layer with Shopify integration
- Cart item cards with modification actions
- Cart summary with subtotal
- Proceed action (primary CTA)
- Empty cart state
- Responsive behavior

**Key Principles:**
- Transactional state spacing (18px between elements, 72px between sections)
- No shipping estimates or delivery timeframes
- No aggressive upsells
- Subtle confirmation on removal (no "Are you sure?" popups)

### 8. Checkout (Shopify-Hosted)
**Status:** 0% Complete (0/13 tasks done)  
**Purpose:** Integration with Shopify's hosted checkout

**Scope:**
- Checkout redirect using cart.checkoutUrl
- Shopify checkout customization (branding, colors, language)
- Order confirmation webhook handler with HMAC verification
- Signed token confirmation system
- Order confirmation page with calm fallback
- Abandoned checkout handling

**Key Principles:**
- No custom checkout forms (Shopify handles all UI)
- Calm retry logic (no aggressive polling)
- Webhook verification with raw request body (critical security requirement)
- Idempotency with unique constraints

---

## Planned Features 📋

### 9. Darkroom Phase 1 (AI Image Generation)
**Status:** Requirements & Design Complete | No Tasks File  
**Purpose:** Batch AI-powered product image generation with brutalist aesthetic

**Scope:**
- Batch processing for first 10 products (Candle Holders)
- Style seed prompt template (brutalist, monochromatic, dramatic lighting)
- img2img transformation preserving product shape
- Supabase Storage integration
- Frontend smart fallback (darkroom_url → shopify_image → placeholder)
- Quality validation (2K resolution, file size checks)

**Key Technical Details:**
- Storage bucket: "darkroom-renders"
- Naming format: {product_id}_{timestamp}.png
- Processing status logging with timestamps
- Execution time monitoring

---

## Architecture Overview

### Tech Stack
- **Frontend:** Next.js, React, TypeScript, Tailwind CSS
- **Backend:** Next.js API routes, Supabase (database + storage)
- **Commerce:** Shopify Storefront API + Admin API
- **AI:** Product Narrative Engine (local), Darkroom (img2img generation)

### Key Integrations
- **Shopify Storefront API:** Product fetching, cart management, checkout redirect
- **Shopify Admin API:** Order retrieval, webhook verification
- **Supabase:** Product database, order storage, image storage
- **Intersection Observer:** Section reveal animations

### Data Flow
1. Products ingested from CSV → TypeScript modules (products.ts, apparel.ts)
2. Shopify integration fetches live product data
3. Narrative engine generates descriptions on-demand
4. Darkroom generates brutalist renders → Supabase Storage
5. Frontend displays with smart fallback logic

---

## Testing Strategy

### Implemented
- Unit tests for validation logic
- API smoke tests (200 success, 422 style violation)
- Integration tests for Shopify cart

### Planned (Optional)
- Property-based tests using fast-check (100+ iterations)
- Golden test fixtures for narrative engine
- Visual regression testing
- End-to-end commerce flow tests

---

## Critical Guardrails

All features must conform to these immutable rules:

1. **Color Hierarchy:** Black dominance (60-80%), gold scarcity (<5%)
2. **Spacing & Density:** Min 24px between elements, 96px between sections, max 5-7 items per viewport
3. **Singular CTA:** Exactly one primary action per context
4. **Forbidden Patterns:** No popups, discount banners, countdown timers, scarcity messaging, shipping urgency

---

## Next Steps (Recommended Priority)

### Immediate (Week 1-2)
1. Complete Product Discovery implementation (13 tasks)
2. Complete Product Detail implementation (12 tasks)
3. Verify inventory expansion display on /shop and /uniform

### Short-term (Week 3-4)
4. Complete Cart implementation (14 tasks)
5. Complete Checkout integration (13 tasks)
6. End-to-end commerce flow testing

### Medium-term (Week 5-6)
7. Generate Darkroom Phase 1 tasks file
8. Implement Darkroom batch processing
9. Complete remaining Accent Reveal tests

### Long-term (Week 7+)
10. Property-based testing for all features
11. Golden fixtures for narrative engine
12. Performance optimization and monitoring

---

## Risk & Blockers

### Technical Risks
- **Shopify webhook verification:** Raw body requirement is critical (common footgun)
- **Darkroom image quality:** AI generation may require prompt tuning
- **Performance:** Section reveals and image loading need optimization

### Design Risks
- **Shopify checkout customization:** Limited control on non-Plus plans
- **Visual system conformance:** Requires vigilant validation across all features

### Dependencies
- Shopify Storefront API access
- Supabase project configuration
- AI image generation service for Darkroom

---

## Metrics & Success Criteria

### User Experience
- Page load time < 2s
- Interaction to Next Paint (INP) < 200ms
- No scroll jank during reveals
- Accessibility compliance (WCAG AA minimum)

### Business
- All 56 products displayable on /shop and /uniform
- Functional cart → checkout → confirmation flow
- Order webhook processing with 100% idempotency
- Darkroom renders for first 10 products

### Code Quality
- TypeScript strict mode enabled
- All critical guardrail tests passing
- No console errors in production
- Comprehensive error handling

---

## Documentation Status

### Complete
- Visual System requirements & design
- Accent Reveal System requirements, design & tasks
- Inventory Expansion requirements, design & tasks
- Product Narrative Engine requirements, design & tasks
- Darkroom Phase 1 requirements & design
- Product Discovery requirements, design & tasks
- Product Detail requirements, design & tasks
- Cart requirements, design & tasks
- Checkout requirements, design & tasks

### Missing
- Darkroom Phase 1 tasks file (needs generation)
- Visual System tasks file (foundational, may not need tasks)

---

## Team Notes

- **Philosophy:** This is not a conventional ecommerce site. Every decision prioritizes atmosphere, ritual, and presence over conversion optimization.
- **Visual Language:** Gothic-romantic luxury. Think ritual chamber, not shopping mall.
- **Forbidden Patterns:** Aggressively exclude urgency, pressure, and manipulation tactics.
- **Testing:** Property-based tests are optional for MVP but valuable for long-term correctness.

---

**Last Updated:** February 26, 2026  
**Next Review:** After Product Discovery & Product Detail completion
