# Implementation Plan: Drops Page

## Overview

This implementation plan transforms the `/drops` route into a fully functional marketing page for limited product releases. The page integrates with Sanity CMS for drop scheduling, Supabase for authentication and data storage, and optionally Mailchimp for email marketing. The implementation follows a strict dependency order: database migrations first, then CMS schema, then API routes, then static components, then auth-dependent components, then page integration, and finally responsive and accessibility passes.

The existing drops page at `app/drops/page.js` will be replaced with a new implementation that follows the Sanctuary design system and provides member-gated features through the existing `useSanctuaryAccess` hook.

## Tasks

- [x] 1. Create Supabase drop_alerts table migration
  - [x] 1.1 Create migration file for drop_alerts table
    - Create `supabase/migrations/YYYYMMDDHHMMSS_create_drop_alerts_table.sql` file
    - Define table with columns: id (UUID primary key), email (TEXT NOT NULL UNIQUE), created_at (TIMESTAMPTZ NOT NULL DEFAULT NOW())
    - Use gen_random_uuid() for automatic id generation
    - Add index on email column for faster lookups
    - Add index on created_at column for sorting
    - _Requirements: 8.1, 8.2, 8.4_

  - [ ]* 1.2 Write property test for drop_alerts table constraints
    - **Property 16: Supabase Insertion for Drop Alerts**
    - **Validates: Requirements 8.2**

- [x] 2. Create Sanity CMS currentDrop schema
  - [x] 2.1 Create currentDrop schema definition
    - Create `sanity/schemas/currentDrop.js` file
    - Define document type with fields: dropName (string), previewDate (datetime), releaseDate (datetime), sanctuaryAccessDate (datetime)
    - Add preview configuration showing dropName as title
    - Export schema from main schemas index
    - _Requirements: 4.1, 4.2_

  - [ ]* 2.2 Write property test for Sanity CMS integration
    - **Property 6: Drop Name Display Based on CMS Data**
    - **Property 8: Graceful Degradation on CMS Query Failure**
    - **Validates: Requirements 3.3, 3.4, 4.3**

- [x] 3. Create Mailchimp subscribe API route
  - [x] 3.1 Implement /api/mailchimp/subscribe route
    - Create `app/api/mailchimp/subscribe/route.js` file
    - Accept POST requests with email in JSON body
    - Validate email format before processing
    - Check for Mailchimp configuration (MAILCHIMP_API_KEY, MAILCHIMP_SERVER_PREFIX, MAILCHIMP_DROP_ALERTS_LIST_ID)
    - If Mailchimp configured: call Mailchimp Marketing API v3 to add subscriber with 'drop-alerts' tag
    - If Mailchimp not configured or fails: fall back to Supabase drop_alerts table insertion
    - Handle duplicate email errors gracefully (treat as success)
    - Return JSON response with success/error status
    - _Requirements: 7.6, 7.7, 8.2, 12.2, 12.3, 12.4, 12.5_

  - [ ]* 3.2 Write property test for email routing logic
    - **Property 12: Email Routing Based on Mailchimp Configuration**
    - **Property 17: Mailchimp Fallback on API Failure**
    - **Validates: Requirements 7.6, 7.7, 12.4, 12.5_

- [x] 4. Implement static components (no auth dependency)
  - [x] 4.1 Create DropsHero component
    - Create `components/drops/DropsHero.js` file
    - Implement client component with star field background (50 micro stars, random positions, 0.1-0.2 opacity)
    - Add nebula gradient overlay at 20% opacity
    - Add crescent moon SVG in bottom-left at 8% opacity with partial cropping
    - Display eyebrow label "DROPS" in gold (#c9a96e) with 11px font size and 0.3em letter spacing
    - Display heading "Limited releases. Quiet power." in Cormorant Garamond serif
    - Display subtext in Inter font weight 300 and color #e8e4dc
    - Render two pill-shaped buttons: "Join the Sanctuary" (gold border) and "Get drop alerts" (muted border)
    - Display member benefit line "MEMBERS UNLOCK SANCTUARY PRICING AND EARLY ACCESS." in tracked caps gold 11px
    - Accept onScrollToSignup and onScrollToAlerts props for button click handlers
    - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 2.6, 2.7, 2.8, 2.9, 2.10_

  - [ ]* 4.2 Write property test for DropsHero design system compliance
    - **Property 1: Design System Font Consistency for Headings**
    - **Property 2: Design System Font Consistency for Body Text**
    - **Property 3: Design System Gold Accent Color Consistency**
    - **Validates: Requirements 1.3, 1.4, 1.5**

  - [x] 4.3 Create NextDrop component with Sanity CMS integration
    - Create `components/drops/NextDrop.js` file
    - Implement client component with Sanity CMS client setup
    - Fetch currentDrop document on mount using GROQ query
    - Display eyebrow label "NEXT DROP" in tracked caps gold
    - Display drop name from CMS or "Coming Soon" fallback
    - Display static subtext "When the window opens, the Threshold shifts. Join to be notified first."
    - Render three-column status strip with columns for PREVIEW WINDOW, RELEASE WINDOW, and SANCTUARY EARLY ACCESS
    - Format dates from CMS as "MMM DD, YYYY" or display "TBA" for missing dates
    - Style each column with background #0e0e1a, 2px gold top border, tracked caps label, serif value
    - Render thin horizontal gold connecting line between columns with CSS pulse animation
    - Handle CMS query failures gracefully with fallback values
    - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5, 3.6, 3.7, 3.8, 3.9, 3.10, 3.11, 3.12, 3.13, 3.14, 3.15, 4.2, 4.3, 4.4_

  - [ ]* 4.4 Write property test for date formatting
    - **Property 7: Date Formatting Consistency**
    - **Validates: Requirements 3.7, 3.8, 3.9, 3.10, 3.11, 3.12, 4.4**

  - [x] 4.5 Create DropAlertBand component
    - Create `components/drops/DropAlertBand.js` file
    - Implement client component with full-width dark band and 1px gold top/bottom borders
    - Display "STAY IN THE WINDOW" label text on left side
    - Display descriptive subtext on left side
    - Render email input field on right side
    - Render "NOTIFY ME" pill button on right side
    - Implement email validation before submission
    - POST email to /api/mailchimp/subscribe route on form submit
    - Display success message on successful submission
    - Display error message on failed submission
    - Clear email input after successful submission
    - _Requirements: 7.1, 7.2, 7.3, 7.4, 7.5, 7.8, 7.9, 7.10_

  - [ ]* 4.6 Write property test for email validation
    - **Property 15: Email Format Validation**
    - **Property 13: Success Message Display on Alert Submission**
    - **Property 14: Error Message Display on Alert Submission Failure**
    - **Validates: Requirements 7.8, 7.9, 7.10**

- [x] 5. Checkpoint - Ensure static components render correctly
  - Ensure all tests pass, ask the user if questions arise.

- [x] 6. Implement auth-dependent components
  - [x] 6.1 Create MembershipBenefits component
    - Create `components/drops/MembershipBenefits.js` file
    - Implement client component with eyebrow label "MEMBERSHIP" in tracked caps gold
    - Display heading "The quieter way in." in serif font
    - Display subtext "Free to join. No feed. No noise. Just access."
    - Render three benefit cards with titles "Always First", "Always Less", "Always Yours"
    - Display descriptive copy for each benefit card
    - Render MembershipSignup component below benefit cards
    - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5_

  - [x] 6.2 Create MembershipSignup component
    - Create `components/drops/MembershipSignup.js` file
    - Implement client component with heading "Join free. Leave anytime."
    - Display subtext "No credit card. No performance. Just the quieter side of the drop."
    - Render email input field with appropriate placeholder
    - Render "Join the Sanctuary" pill button
    - Display "ALREADY A MEMBER? SIGN IN." in tracked caps muted text with clickable link
    - Implement Supabase auth.signUp on form submit
    - Redirect to /sanctuary on successful signup
    - Display error message on signup failure
    - Handle sign-in link click to navigate to sign-in page
    - Add id="membership-signup" for scroll navigation
    - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5, 6.6, 6.7, 6.8, 6.9_

  - [ ]* 6.3 Write property test for authentication flow
    - **Property 9: Supabase Auth User Creation**
    - **Property 10: Redirect on Successful Signup**
    - **Property 11: Error Message Display on Signup Failure**
    - **Validates: Requirements 6.6, 6.7, 6.8**

  - [x] 6.4 Create DropsArchive component with member gating
    - Create `components/drops/DropsArchive.js` file
    - Implement client component using useSanctuaryAccess hook
    - Display heading "Archive" in serif font
    - Display "LOCKED" badge in top-right corner when isMember is false
    - Display subtext "Past drops, preserved in the dark. Join to unlock the archive."
    - Render three archive cards with titles "OBSIDIAN ARCHIVE", "ECLIPSE VAULT", "NOCTURNE SHELF"
    - Style each card with tall aspect ratio (3/4), background #0e0e1a, gold border at 15% opacity
    - Display tracked caps label in top-left of each card
    - When isMember is false: display lock icons centered on cards with backdrop blur
    - When isMember is true: remove lock icons, remove "LOCKED" badge, reveal archive content
    - Apply faint gold glow effect on card hover
    - _Requirements: 9.1, 9.2, 9.3, 9.4, 9.5, 9.6, 9.7, 9.8, 9.9, 9.10_

  - [ ]* 6.5 Write property test for archive visibility
    - **Property 18: Archive Visibility Based on Membership Status**
    - **Validates: Requirements 9.2, 9.8, 9.9, 9.10**

  - [x] 6.6 Create DropsStickBar component with conditional visibility
    - Create `components/drops/DropsStickBar.js` file
    - Implement client component using useSanctuaryAccess hook
    - Render as fixed bottom bar with backdrop blur and gold top border
    - Display text "JOIN FREE TO UNLOCK EARLY ACCESS AND SANCTUARY PRICING." on left side
    - Render "JOIN FREE" button on right side
    - Accept onJoinClick prop for button click handler
    - When isMember is true: return null (hide completely)
    - When isMember is false: render the sticky bar
    - _Requirements: 10.1, 10.2, 10.3, 10.4, 10.5, 10.6, 10.7_

  - [ ]* 6.7 Write property test for stick bar visibility
    - **Property 19: Stick Bar Visibility Based on Membership Status**
    - **Validates: Requirements 10.6, 10.7**

- [x] 7. Checkpoint - Ensure auth-dependent components work correctly
  - Ensure all tests pass, ask the user if questions arise.

- [x] 8. Integrate all components into DropsPage
  - [x] 8.1 Update app/drops/page.js with new implementation
    - Replace entire file content with new DropsPage component
    - Mark as client component with "use client" directive
    - Apply page-level background color #08080f
    - Implement scroll handler for CTA buttons using smooth scroll behavior
    - Render DropsHero with scroll handlers
    - Render NextDrop component
    - Render MembershipBenefits component (includes MembershipSignup)
    - Render DropAlertBand component with id="drop-alerts" for scroll navigation
    - Render DropsArchive component
    - Render DropsStickBar component with scroll handler
    - Wrap content sections in max-w-7xl container with appropriate spacing
    - _Requirements: 1.1, 1.2, 2.9, 2.10, 11.1, 11.2, 11.4, 11.5, 11.6_

  - [ ]* 8.2 Write property test for public access
    - **Property 20: Public Access Without Authentication**
    - **Property 21: Visual Locking for Non-Members**
    - **Validates: Requirements 11.2, 11.3**

- [x] 9. Mobile responsive pass
  - [x] 9.1 Implement responsive layout for all components
    - Update DropsHero to stack buttons vertically on mobile
    - Update NextDrop status strip to stack columns vertically on mobile
    - Update MembershipBenefits cards to single column on mobile
    - Update DropAlertBand to stack label/input vertically on mobile
    - Update DropsArchive cards to single column on mobile, 2 columns on tablet
    - Update DropsStickBar to stack text/button vertically on mobile
    - Test all breakpoints (mobile <640px, tablet 640-1024px, desktop >1024px)
    - _Requirements: 1.8_

  - [ ]* 9.2 Write property test for responsive layout
    - **Property 5: Responsive Layout Without Overflow**
    - **Validates: Requirements 1.8**

- [x] 10. Accessibility pass
  - [x] 10.1 Add ARIA labels and semantic HTML
    - Add aria-label to all icon-only buttons
    - Use semantic HTML elements (nav, section, article, aside)
    - Add focus-visible styles to all interactive elements
    - Ensure all form inputs have associated labels
    - Add alt text to all images and SVGs
    - Ensure color contrast meets WCAG AA standards
    - Test keyboard navigation for all interactive elements
    - Add skip-to-content link for screen readers
    - _Requirements: 1.8, 11.1_

  - [ ]* 10.2 Write property test for design system consistency
    - **Property 1: Design System Font Consistency for Headings**
    - **Property 2: Design System Font Consistency for Body Text**
    - **Property 3: Design System Gold Accent Color Consistency**
    - **Property 4: Design System Primary Text Color Consistency**
    - **Validates: Requirements 1.3, 1.4, 1.5, 1.6**

- [-] 11. Final checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP
- Each task references specific requirements for traceability
- Checkpoints ensure incremental validation
- Property tests validate universal correctness properties
- Unit tests validate specific examples and edge cases
- The implementation uses JavaScript (not TypeScript) to match existing codebase
- Database migration must be created before API route work to avoid blocking dependencies
- Sanity CMS schema must be created before NextDrop component implementation
- API route must be created before DropAlertBand component implementation
- Static components (DropsHero, NextDrop, DropAlertBand) can be built independently without auth dependency
- Auth-dependent components (DropsArchive, DropsStickBar, MembershipSignup) require useSanctuaryAccess hook (already exists)
- The useSanctuaryAccess hook already exists at `hooks/useSanctuaryAccess.js` and does not need to be reimplemented
- All file extensions should be .js (not .ts or .tsx) per user requirement
