# Implementation Plan: Sanctuary Page Redesign

## Overview

This implementation plan transforms the `/sanctuary` route into a member-gated content hub with real authentication. The implementation follows a strict dependency order: database tables first, then the authentication hook, then static components, then gated components, and finally integration tests.

The existing sanctuary page at `app/sanctuary/page.js` will be replaced with a new implementation that uses the `useSanctuaryAccess` hook to conditionally render content based on membership status.

## Tasks

- [x] 1. Create Supabase database tables and RLS policies
  - [x] 1.1 Create memberships table migration
    - Create SQL migration file at `scripts/create-memberships-table.sql`
    - Include table definition with id, user_id, status, created_at, expires_at columns
    - Add indexes for user_id and status
    - Enable RLS and create policy for users to read own membership
    - _Requirements: Design - Data Models section_

  - [x] 1.2 Create grimoire_entries table migration
    - Create SQL migration file at `scripts/create-grimoire-entries-table.sql`
    - Include table definition with id, user_id, title, subtitle, content, created_at columns
    - Add composite index for user_id and created_at DESC
    - Enable RLS and create policies for SELECT and INSERT
    - _Requirements: Design - Data Models section_

  - [x] 1.3 Create discount_codes table migration
    - Create SQL migration file at `scripts/create-discount-codes-table.sql`
    - Include table definition with id, user_id, code, percent_off, is_active, created_at columns
    - Add unique constraint on code and conditional unique constraint on user_id + is_active
    - Add index for user_id and is_active
    - Enable RLS and create policy for users to read own active discount code
    - _Requirements: Design - Data Models section_

- [x] 2. Implement useSanctuaryAccess hook
  - [x] 2.1 Create useSanctuaryAccess hook with full authentication logic
    - Create `hooks/useSanctuaryAccess.js` file
    - Implement hook that checks Supabase session on mount
    - Query memberships table for active membership
    - Fetch grimoire entries (last 3, ordered by created_at DESC)
    - Fetch active discount code
    - Return SanctuaryAccess object with isAuthenticated, isMember, discountCode, grimoire, loading
    - Handle all error cases gracefully (log to console, return safe defaults)
    - _Requirements: Design - Sanctuary Unlock section, Error Handling section_

  - [ ]* 2.2 Write property test for useSanctuaryAccess hook
    - **Property: Hook returns consistent state structure across all auth states**
    - **Validates: Design - Hook Interface**
    - Test that hook always returns object with required keys (isAuthenticated, isMember, discountCode, grimoire, loading)
    - Use fast-check to generate random auth states
    - Mock Supabase client responses
    - Verify loading transitions from true to false

- [x] 3. Implement static components (no auth dependency)
  - [x] 3.1 Create SanctuaryHero component
    - Create `components/sanctuary/SanctuaryHero.js` file
    - Implement hero section with background color #08080f
    - Add radial nebula gradient from top-right (deep indigo/violet, 10-20% opacity)
    - Add micro star field with randomly positioned dots (10-20% opacity, CSS-only)
    - Add crescent moon SVG at top-right (280px tall, 8% opacity, aria-hidden="true")
    - Add eyebrow text in gold (#c9a96e), 11px, tracked caps
    - Add H1 heading using Cormorant Garamond, ~80px responsive
    - Add subtext using Inter 300, color #e8e4dc
    - Add scroll chevron button in gold with pulse animation and aria-label
    - Accept onScrollClick prop for scroll navigation
    - _Requirements: 1.1-1.9_

  - [x] 3.2 Create ResonanceBar component
    - Create `components/sanctuary/ResonanceBar.js` file
    - Implement full-width dark band with 1px gold borders (top/bottom)
    - Display "RESONANCE" label with subtext on left
    - Display 4 resonance pills on right: Candle 12, Rose 7, Moon 4, Star 9
    - Use lucide-react icons (Flame, Rose, Moon, Star) with aria-hidden="true"
    - Style pills with dark background, gold border, tracked label
    - Implement responsive layout (horizontal desktop, vertical mobile <768px)
    - _Requirements: 6.1-6.7_

- [ ] 4. Checkpoint - Verify static components render correctly
  - Ensure static components (SanctuaryHero, ResonanceBar) render without errors
  - Verify responsive layouts work at 375px, 768px, 1440px viewports
  - Ask the user if questions arise

- [x] 5. Implement gated components (depend on useSanctuaryAccess hook)
  - [x] 5.1 Create FeatureCards component with locked/unlocked states
    - Create `components/sanctuary/FeatureCards.js` file
    - Accept access prop from useSanctuaryAccess hook
    - Implement 3-column grid (desktop), single column (mobile <768px)
    - Add id="features" for scroll navigation
    - Render Mirror card with PREVIEW badge (always unlocked)
    - Render Grimoire card with conditional LOCKED badge, blur, lock icon
    - Render Sanctuary Price card with conditional LOCKED badge, blur, lock icon, discount code
    - Apply background #0e0e1a and 1px border rgba(201,169,110,0.2) to all cards
    - Add hover glow effect: box-shadow 0 0 20px rgba(201,169,110,0.08)
    - Implement button logic: "Join to Unlock" → /join for visitors, feature-specific CTAs for members
    - _Requirements: 2.1-2.6, 3.1-3.6, 4.1-4.6, 5.1-5.6_

  - [ ]* 5.2 Write property test for FeatureCards locked state consistency
    - **Property 1: Locked Card State Consistency**
    - **Validates: Requirements 4.1-4.5, 5.1-5.5**
    - Test that locked cards always display LOCKED badge, blur effect, lock icon, unblurred heading, "Join to Unlock" button
    - Use fast-check to generate random access states with isMember: false
    - Verify all locked cards have consistent elements

  - [ ]* 5.3 Write property test for FeatureCards styling uniformity
    - **Property 2: Feature Card Styling Uniformity**
    - **Validates: Requirements 2.4, 2.5**
    - Test that all feature cards have background #0e0e1a and 1px border rgba(201,169,110,0.2)
    - Use fast-check to generate random access states
    - Verify computed styles match design tokens

  - [x] 5.4 Create GrimoireSection component with locked/unlocked states
    - Create `components/sanctuary/GrimoireSection.js` file
    - Accept access prop from useSanctuaryAccess hook
    - Implement visitor state: heading with LOCKED badge, 3 placeholder cards with blur and lock icons, "Join Free" CTA
    - Implement member state: heading without badge, 3 real grimoire entries from access.grimoire, chevron-right icons
    - Each member card links to `/sanctuary/grimoire/[id]`
    - Handle empty grimoire state: "Your Grimoire is empty. Readings you save will appear here."
    - Center section with max-width 680px
    - _Requirements: 7.1-7.7_

  - [ ]* 5.5 Write property test for GrimoireSection locked state
    - **Property 4: Grimoire Section Locked State**
    - **Validates: Requirements 7.3, 7.5, 7.6**
    - Test that non-member users always see LOCKED badge, blur effect on all cards, lock icons
    - Use fast-check to generate random access states with isMember: false
    - Verify all placeholder cards have consistent locked elements

  - [x] 5.6 Create StickyJoinBar component with conditional visibility
    - Create `components/sanctuary/StickyJoinBar.js` file
    - Accept access prop from useSanctuaryAccess hook
    - Hide entirely if access.isMember is true
    - Display "JOIN FREE" button for non-authenticated visitors
    - Display "Upgrade to Member" button for authenticated non-members
    - Position fixed at bottom, full width, z-index above content
    - Style with background rgba(8,8,15,0.92), 1px gold border top
    - Button: pill shape, gold border, transparent fill, gold text
    - Hover: gold fill at 10% opacity
    - Navigate to /join on click
    - _Requirements: 8.1-8.8_

- [ ] 6. Checkpoint - Verify gated components work with hook
  - Test FeatureCards, GrimoireSection, StickyJoinBar with mock access states
  - Verify locked states render correctly for visitors
  - Verify unlocked states render correctly for members
  - Ask the user if questions arise

- [x] 7. Replace existing sanctuary page with new implementation
  - [x] 7.1 Update app/sanctuary/page.js with new implementation
    - Replace entire file content with new SanctuaryPage component
    - Import and use useSanctuaryAccess hook
    - Import all child components (SanctuaryHero, FeatureCards, ResonanceBar, GrimoireSection, StickyJoinBar)
    - Implement scroll navigation handler for chevron click
    - Pass access state to all gated components
    - Conditionally render StickyJoinBar based on access.isMember
    - Keep "use client" directive at top
    - _Requirements: Design - SanctuaryPage Component section_

  - [x] 7.2 Verify all imports and component wiring
    - Ensure all component imports resolve correctly
    - Verify hook returns expected data structure
    - Test scroll navigation to #features element
    - Check that no console errors appear

- [ ] 8. Implement accessibility features
  - [ ] 8.1 Add ARIA attributes to decorative elements
    - Add aria-hidden="true" to crescent moon SVG
    - Add aria-hidden="true" to all lock icons
    - Add aria-hidden="true" to all celestial icons (Flame, Rose, Moon, Star)
    - Add aria-label="Scroll to features" to scroll chevron button
    - _Requirements: 12.1, 12.6_

  - [ ]* 8.2 Write property test for decorative SVG accessibility
    - **Property 5: Decorative SVG Accessibility**
    - **Validates: Requirements 12.1, 12.6**
    - Test that all decorative SVG elements have aria-hidden="true"
    - Use fast-check to generate random access states
    - Query all SVG elements marked as decorative
    - Verify aria-hidden attribute exists

  - [ ]* 8.3 Write property test for interactive element keyboard accessibility
    - **Property 7: Interactive Element Keyboard Accessibility**
    - **Validates: Requirements 12.3, 12.4**
    - Test that all buttons and links are keyboard accessible
    - Verify tabIndex >= 0 for all interactive elements
    - Verify visible focus indicators (outline or box-shadow)
    - Use fast-check to generate random access states

  - [ ] 8.4 Ensure semantic HTML for all interactive elements
    - Verify all navigation actions use <Link> or <a> elements
    - Verify all action buttons use <button> elements
    - Verify scroll chevron uses <button> not <div>
    - _Requirements: 12.5_

  - [ ]* 8.5 Write property test for semantic HTML
    - **Property 8: Semantic HTML for Interactive Elements**
    - **Validates: Requirements 12.5**
    - Test that all interactive elements use semantic HTML
    - Query all clickable elements and verify they are button or anchor tags
    - Use fast-check to generate random access states

- [ ] 9. Final checkpoint - Integration and testing
  - Ensure all components render without errors
  - Test full flow: visitor state → authenticated non-member → member state
  - Verify responsive layouts at 375px, 768px, 1440px viewports
  - Test keyboard navigation through all interactive elements
  - Verify scroll navigation works from hero to features
  - Check that all error handling works (mock Supabase errors)
  - Ask the user if questions arise

- [ ]* 10. Integration tests (optional)
  - [ ]* 10.1 Write integration test for full sanctuary page flow
    - Test visitor state: all locked content visible with blur
    - Test authenticated non-member state: same as visitor
    - Test member state: all unlocked content visible, discount code shown, grimoire entries displayed
    - Mock Supabase client for all query paths
    - Verify StickyJoinBar visibility logic
    - _Requirements: Design - Integration Testing section_

  - [ ]* 10.2 Write accessibility tests with jest-axe
    - Test that sanctuary page has no accessibility violations
    - Use jest-axe to check color contrast ratios
    - Verify ARIA attributes are correct
    - Test keyboard navigation flow
    - _Requirements: Design - Accessibility Testing section_

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP
- Each task references specific requirements for traceability
- Checkpoints ensure incremental validation
- Property tests validate universal correctness properties from the design document
- All components should be in `components/sanctuary/` directory
- Hook should be in `hooks/` directory
- SQL migrations should be in `scripts/` directory
- The implementation uses JavaScript (not TypeScript) to match existing codebase
- Database tables must be created before any component work to avoid blocking dependencies
- The useSanctuaryAccess hook must be implemented before gated components
- Static components (Hero, ResonanceBar) can be built independently without auth dependency
