# Implementation Plan: Accent Reveal System

## Overview

This implementation plan breaks down the Accent Reveal System into discrete, incremental coding tasks. Each task builds on previous work, starting with CSS custom properties, then applying accent reveals to UI elements, and finally adding scroll-based reveals and accessibility features. The approach ensures that core functionality is validated early through code and testing.

## Tasks

- [x] 1. Set up CSS custom properties for accent reveal system
  - Add new CSS custom property tokens to `:root` in `app/globals.css`
  - Define gold accent tokens (--accent-gold-edge, --accent-gold-edge-strong, --accent-gold-glow)
  - Define red accent tokens (--accent-red-glow, --accent-red-warmth, --accent-red-deep)
  - Define purple accent tokens (--accent-purple-shadow, --accent-purple-depth)
  - Define transition duration tokens (--transition-reveal-in, --transition-reveal-out, --transition-reveal-fast, --transition-reveal-reduced)
  - _Requirements: 10.1, 10.2, 10.3, 10.4_

- [ ]* 1.1 Write unit tests for CSS custom property definitions
  - Test that all required CSS custom properties are defined in `:root`
  - Test that color values are within acceptable ranges (opacity, saturation)
  - Test that transition duration values are reasonable (300ms, 500ms, 150ms, 120ms)
  - _Requirements: 10.1, 10.2, 10.3, 10.4_

- [ ] 2. Implement button accent reveals
  - [x] 2.1 Add gold outline reveal on button hover/focus
    - Update `.btn-primary`, `.btn-secondary`, `.btn-tertiary` selectors in `app/globals.css`
    - Add `border-color` transition using `--accent-gold-edge` token
    - Add `box-shadow` with gold outline effect
    - Set transition duration to `--transition-reveal-in` (300ms)
    - _Requirements: 1.1, 1.3, 4.2_
  
  - [x] 2.2 Add red internal glow on button hover/focus
    - Add red glow to `box-shadow` using `--accent-red-glow` token
    - Layer red glow beneath gold outline in box-shadow stack
    - Ensure red glow is subordinate to gold (lower opacity)
    - _Requirements: 2.1, 4.2_
  
  - [x] 2.3 Add button active state intensification
    - Add `:active` pseudo-class styles for buttons
    - Brighten gold outline using `--accent-gold-edge-strong` token
    - Deepen red glow using `--accent-red-deep` token
    - Set transition duration to `--transition-reveal-fast` (150ms)
    - _Requirements: 2.4, 4.3_
  
  - [x] 2.4 Add asymmetric fade-out timing for buttons
    - Set fade-out transition duration to `--transition-reveal-out` (500ms)
    - Ensure fade-out is slower than fade-in
    - _Requirements: 1.4, 4.5_
  
  - [ ]* 2.5 Write property test for button accent reveals
    - **Property 7: Button Accent Coordination**
    - **Validates: Requirements 4.2**
  
  - [ ]* 2.6 Write property test for button active state
    - **Property 8: Button Active State Intensification**
    - **Validates: Requirements 4.3**
  
  - [ ]* 2.7 Write property test for button text color neutrality
    - **Property 9: Button Text Color Neutrality**
    - **Validates: Requirements 4.6**

- [ ] 3. Implement card accent reveals
  - [x] 3.1 Add gold bottom edge glow on card hover
    - Update `.house-card`, `.value-card`, `.drop-card` selectors in `app/globals.css`
    - Add `border-bottom-color` transition using `--accent-gold-edge` token
    - Set transition duration to 400ms (slightly slower than buttons)
    - _Requirements: 1.2, 5.2_
  
  - [x] 3.2 Add red background undertone on card hover
    - Add `background` transition with `color-mix()` or gradient
    - Use `--accent-red-warmth` token for subtle red tint
    - Ensure red undertone is subordinate to gold edge
    - _Requirements: 2.3, 5.3_
  
  - [x] 3.3 Add purple shadow depth on card hover
    - Add `box-shadow` transition with purple tint
    - Use `--accent-purple-shadow` token
    - Layer purple shadow beneath other effects
    - Ensure purple is almost imperceptible
    - _Requirements: 3.1, 5.4_
  
  - [x] 3.4 Coordinate card accent timing
    - Ensure all three accents (gold, red, purple) appear simultaneously
    - Set consistent transition durations across all three effects
    - Add fade-out timing (400-500ms)
    - _Requirements: 5.5, 5.6_
  
  - [ ]* 3.5 Write property test for gold glow on card hover
    - **Property 4: Gold Glow on Card Hover**
    - **Validates: Requirements 1.2, 5.2**
  
  - [ ]* 3.6 Write property test for purple shadow on card hover
    - **Property 5: Purple Shadow on Card Hover**
    - **Validates: Requirements 3.1, 5.4**
  
  - [ ]* 3.7 Write property test for red undertone on card hover
    - **Property 6: Red Background Undertone on Card Hover**
    - **Validates: Requirements 2.3, 5.3**
  
  - [ ]* 3.8 Write property test for card accent synchronization
    - **Property 10: Card Accent Synchronization**
    - **Validates: Requirements 5.6**

- [x] 4. Checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 5. Implement Mirror input accent reveals
  - [x] 5.1 Add red glow on Mirror input focus
    - Update `.mirror-input` selector in `app/globals.css`
    - Add `box-shadow` with inset red glow using `--accent-red-glow` token
    - Set transition duration to `--transition-reveal-in` (300ms)
    - _Requirements: 2.2, 6.2_
  
  - [x] 5.2 Add gold focus ring on Mirror input focus
    - Add `outline` or `border-color` with gold using `--accent-gold-edge` token
    - Add `outline-offset` for visual separation
    - Ensure gold is more visible than red glow
    - _Requirements: 6.3_
  
  - [ ]* 5.3 Write unit tests for Mirror input reveals
    - Test idle state has no accent colors
    - Test focus state reveals red glow and gold ring
    - Test focus ring is visible and accessible
    - _Requirements: 6.1, 6.2, 6.3_

- [ ] 6. Implement Mirror reading card accent reveals
  - [x] 6.1 Add gold border to reading card
    - Update `.reading-card` selector in `app/globals.css`
    - Set `border` to use `--accent-gold-edge` token
    - _Requirements: 6.4_
  
  - [x] 6.2 Add purple shadow to reading card
    - Add `box-shadow` with purple tint using `--accent-purple-shadow` token
    - Layer shadow beneath gold border
    - _Requirements: 3.2, 6.5_
  
  - [x] 6.3 Add red warmth to reading card background
    - Add `background` gradient with red undertone using `--accent-red-warmth` token
    - Ensure red is subtle and subordinate to gold
    - _Requirements: 6.6_
  
  - [ ]* 6.4 Write unit tests for reading card reveals
    - Test gold border is present
    - Test purple shadow is present
    - Test red background warmth is present
    - Test gold is most visible accent
    - _Requirements: 6.4, 6.5, 6.6_

- [ ] 7. Implement section entry reveals with Intersection Observer
  - [x] 7.1 Create Intersection Observer for section reveals
    - Create new file `app/utils/sectionReveal.ts` (or add to existing utils)
    - Implement Intersection Observer with threshold 0.2 and rootMargin
    - Add class toggle logic to add `section-revealed` class when section enters viewport
    - Export initialization function
    - _Requirements: 7.1, 7.2_
  
  - [x] 7.2 Add CSS for section reveal effects
    - Add `section` base styles with opacity transition in `app/globals.css`
    - Add `section.section-revealed` styles with full opacity
    - Add `section::before` pseudo-element for purple gradient bloom
    - Use `--accent-purple-depth` token for gradient
    - Ensure only opacity/contrast changes, no movement
    - _Requirements: 7.1, 7.4_
  
  - [x] 7.3 Initialize section reveal observer in page component
    - Import section reveal utility in `app/page.tsx`
    - Call initialization function in `useEffect` hook
    - Observe all `<section>` elements on the page
    - _Requirements: 7.1, 7.2_
  
  - [ ]* 7.4 Write property test for section reveal presence only
    - **Property 17: Section Reveal Presence Only**
    - **Validates: Requirements 7.4**
  
  - [ ]* 7.5 Write property test for section reveal completion
    - **Property 18: Section Reveal Completion**
    - **Validates: Requirements 7.3**

- [x] 8. Checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 9. Implement accessibility layer
  - [x] 9.1 Add prefers-reduced-motion media query
    - Add `@media (prefers-reduced-motion: reduce)` block in `app/globals.css`
    - Override transition duration tokens to use `--transition-reveal-reduced` (120ms)
    - Disable section entry reveal animations (hide `section::before` pseudo-element)
    - Disable looping animations (set `@keyframes smokeDrift` to static)
    - _Requirements: 8.1, 8.2_
  
  - [x] 9.2 Add keyboard focus styles
    - Ensure all `:focus-visible` pseudo-class styles match `:hover` styles
    - Test with Tab key navigation
    - _Requirements: 8.7_
  
  - [x] 9.3 Add touch device support
    - Add `@media (hover: none) and (pointer: coarse)` block in `app/globals.css`
    - Apply hover styles to `:focus` and `:active` pseudo-classes for touch devices
    - _Requirements: 8.8_
  
  - [ ]* 9.4 Write property test for reduced motion compliance
    - **Property 11: Reduced Motion Compliance**
    - **Validates: Requirements 8.1**
  
  - [ ]* 9.5 Write property test for reduced motion color preservation
    - **Property 12: Reduced Motion Color Preservation**
    - **Validates: Requirements 8.3**
  
  - [ ]* 9.6 Write property test for keyboard navigation parity
    - **Property 13: Keyboard Navigation Parity**
    - **Validates: Requirements 8.7**
  
  - [ ]* 9.7 Write property test for touch device activation
    - **Property 14: Touch Device Activation**
    - **Validates: Requirements 8.8**

- [ ] 10. Implement comprehensive property tests
  - [ ]* 10.1 Write property test for gold accent dominance
    - **Property 1: Gold Accent Dominance**
    - **Validates: Requirements 9.1**
  
  - [ ]* 10.2 Write property test for idle state color absence
    - **Property 2: Idle State Color Absence**
    - **Validates: Requirements 4.1, 5.1, 9.3**
  
  - [ ]* 10.3 Write property test for asymmetric transition timing
    - **Property 3: Asymmetric Transition Timing**
    - **Validates: Requirements 1.4, 4.5**
  
  - [ ]* 10.4 Write property test for CSS token usage
    - **Property 16: CSS Token Usage**
    - **Validates: Requirements 10.7**
  
  - [ ]* 10.5 Write property test for gold edge constraint
    - **Property 19: Gold Edge Constraint**
    - **Validates: Requirements 1.5**
  
  - [ ]* 10.6 Write property test for purple shadow exclusivity
    - **Property 20: Purple Shadow Exclusivity**
    - **Validates: Requirements 3.4**
  
  - [ ]* 10.7 Write property test for red accent saturation constraint
    - **Property 21: Red Accent Saturation Constraint**
    - **Validates: Requirements 2.5**
  
  - [ ]* 10.8 Write property test for purple accent imperceptibility
    - **Property 22: Purple Accent Imperceptibility**
    - **Validates: Requirements 3.3**
  
  - [ ]* 10.9 Write property test for accent color text exclusion
    - **Property 23: Accent Color Text Exclusion**
    - **Validates: Requirements 9.5**
  
  - [ ]* 10.10 Write property test for color saturation constraint
    - **Property 24: Color Saturation Constraint**
    - **Validates: Requirements 9.4**

- [ ] 11. Performance testing and optimization
  - [ ]* 11.1 Test interaction performance (INP < 200ms)
    - Use Chrome DevTools Performance panel
    - Measure Interaction to Next Paint for hover/focus state changes
    - Ensure no frame drops during rapid interactions
    - _Requirements: 8.6_
  
  - [ ]* 11.2 Write property test for no scroll jank
    - **Property 15: Performance - No Scroll Jank**
    - **Validates: Requirements 8.6**
  
  - [x] 11.3 Add will-change hints for performance
    - Add `will-change: box-shadow, border-color` to hover states
    - Reset `will-change: auto` after transitions complete
    - Test performance impact
    - _Requirements: 8.6_

- [x] 12. Final checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP
- Each task references specific requirements for traceability
- Checkpoints ensure incremental validation
- Property tests validate universal correctness properties
- Unit tests validate specific examples and edge cases
- The implementation is CSS-first with minimal JavaScript (only for scroll reveals)
- All accent reveals use CSS custom property tokens for maintainability
