# Sanctuary, Navigation & Uniform Routing - Implementation Complete

## Overview
Successfully implemented three critical fixes in one pass:
1. Global header/navigation on all pages
2. "The Uniform" routing (renamed from "Apparel")
3. Sanctuary email capture with Supabase integration

## Part A: Global Header/Navigation

### Files Created/Modified
- **Created:** `components/Header.tsx` - Global header component
- **Modified:** `app/layout.tsx` - Added Header to root layout
- **Modified:** `app/page.tsx` - Removed duplicate nav, updated apparel link

### Features
**Desktop Navigation:**
- The House → /shop
- The Uniform → /uniform
- Join → /join

**Mobile Navigation:**
- Hamburger menu with accessible keyboard navigation
- Gold focus rings on focus-visible
- Smooth transitions respecting prefers-reduced-motion

**Sanctuary Status Indicator:**
- Shows "Sanctuary presence active" when user has joined
- "Leave" button to clear sanctuary state and refresh
- Positioned below header, subtle styling

### Behavior
- Header appears on ALL routes (shop, uniform, product pages, join, etc.)
- Sticky positioning at top of viewport
- No route is trapped without navigation
- Mobile-first responsive design

## Part B: Uniform Routing

### Changes Made
- Homepage: "Apparel" card renamed to "The Uniform", links to /uniform
- Header: Navigation link labeled "The Uniform" routes to /uniform
- All internal references updated to use /uniform

### Verification
- /uniform page exists and is reachable
- No redirects to /shop
- Apparel completely separate from house objects

## Part C: Sanctuary Email Capture with Supabase

### Files Created
- **Created:** `lib/supabase/client.ts` - Client-side Supabase utility
- **Created:** `app/join/page.tsx` - Email capture page
- **Created:** `app/join/layout.tsx` - SEO metadata for join page

### Database Schema
Expected table: `sanctuary_signups`

```sql
CREATE TABLE sanctuary_signups (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  source TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_sanctuary_signups_email ON sanctuary_signups(email);
```

### Join Page UX

**Copy (exact as specified):**
- H1: "Enter the Sanctuary"
- Intro: "The Sanctuary is a quiet inner space. Those who enter are recognized — not rewarded."
- Benefits:
  - Always 10% recognition pricing
  - Early access to seasonal Drops
  - Private reflections with The Mirror (coming soon)
- Email field label: "Email"
- Button: "Enter the Sanctuary"
- Helper: "We'll only write when something returns."

**Behavior:**
1. Client-side email validation
2. Upsert to Supabase (handles duplicates gracefully)
3. On success:
   - Set `localStorage.sanctuary_preview = true`
   - Redirect to previous page or /shop
4. On error:
   - Show calm inline message: "Something went quiet. Please try again."
   - No toast notifications, no red alarms

### Sanctuary State Management

**localStorage Key:** `sanctuary_preview`
- Set to `'true'` when user enters sanctuary
- Checked on component mount (client-side only)
- Cleared when user clicks "Leave" in header

**Pricing Display Changes:**

**When sanctuary_preview = false (default):**
- Public price shown first
- Sanctuary price shown second (highlighted)
- CTA: "Enter the Sanctuary to unlock recognition pricing"

**When sanctuary_preview = true:**
- Sanctuary price shown first (larger, primary)
- Public price shown second (smaller, muted)
- Message: "Sanctuary recognition applied."

### Pages Updated for Sanctuary Pricing

**Modified:**
- `app/shop/page.tsx` - Converted to client component, sanctuary-aware pricing
- `app/product/[slug]/page.tsx` - Converted to client component, sanctuary-aware pricing
- `app/uniform/page.tsx` - Already client component, added sanctuary-aware pricing
- `app/uniform/[slug]/page.tsx` - Converted to client component, sanctuary-aware pricing

**Pattern:**
All pages check `localStorage.sanctuary_preview` on mount and conditionally render pricing blocks with primary/secondary styling.

## Styling

### CSS Added (~500 lines)
All styles added to `app/globals.css`:

**Header & Navigation:**
- `.global-header` - Sticky header with subtle border
- `.header-nav` - Desktop navigation (hidden on mobile)
- `.mobile-menu-button` - Hamburger menu (hidden on desktop)
- `.mobile-menu` - Mobile navigation drawer
- `.sanctuary-status` - Sanctuary presence indicator

**Join Page:**
- `.join-page` - Full-height centered layout
- `.join-container` - Max-width container
- `.join-content` - Card with benefits and form
- `.join-form` - Email input and submit button
- `.join-error` - Calm error message styling

**Sanctuary Recognition:**
- `.sanctuary-recognition` - Message shown when sanctuary active
- `.price-row.primary` - Primary pricing (larger, emphasized)
- `.price-row.secondary` - Secondary pricing (smaller, muted)

**Accessibility:**
- Gold focus rings on all interactive elements
- Keyboard navigation support
- Reduced motion support
- Semantic HTML structure

## Quality Gates

✅ `npm run build` passes  
✅ All 112 tests pass  
✅ TypeScript clean  
✅ No ESLint errors  
✅ Mobile-first responsive  
✅ Accent reveals only on interaction  
✅ Reduced motion support  
✅ Accessible keyboard navigation  
✅ No hydration errors (localStorage guarded)  

## Technical Details

**Supabase Integration:**
- Uses `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- Client-side only (no server secrets exposed)
- Upsert behavior prevents duplicate email errors
- Graceful error handling with calm messaging

**Client Component Pattern:**
- All pages checking sanctuary state are client components
- `useEffect` guards `window` access to prevent hydration errors
- State updates trigger re-renders with correct pricing display

**Navigation:**
- Header component is client component (for sanctuary state)
- Included in root layout for global presence
- Route-level layouts preserved for SEO metadata only

## Brand Voice Compliance

✅ Calm, restrained tone throughout  
✅ No popups, modals, or urgency  
✅ No "save X%" language  
✅ Accent colors only on interaction  
✅ "Recognition" not "rewards"  
✅ Quiet error messages  
✅ Minimal, intentional copy  

## User Flow

1. **User visits site** → Sees header with "The House", "The Uniform", "Join"
2. **User browses** → Sees public + sanctuary pricing on all products
3. **User clicks "Join"** → Lands on calm email capture page
4. **User enters email** → Saved to Supabase, sanctuary_preview set
5. **User redirected** → Returns to previous page or shop
6. **Pricing updates** → Sanctuary price now primary, "recognition applied" message
7. **User can leave** → "Leave" button in header clears state

## Future Enhancements

The system is ready for:
- Full authentication (replace localStorage with real auth)
- Email campaigns (sanctuary_signups table ready)
- Member-only features (check sanctuary_preview flag)
- Analytics on sanctuary conversion
- A/B testing different join page copy

## Notes

- No authentication yet - localStorage is temporary preview state
- Supabase table must be created manually (schema documented in code)
- Email validation is client-side only (add server-side validation later)
- Sanctuary state persists across sessions (localStorage)
- "Leave" button refreshes page to clear all cached pricing displays
