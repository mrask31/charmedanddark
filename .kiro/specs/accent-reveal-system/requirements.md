# Requirements Document: Accent Reveal System

## Introduction

The Accent Reveal System is a CSS-based interaction design system for Charmed & Dark that reveals accent colors (gold, deep red, deep purple) only when users engage with elements through hover, focus, or other intentional interactions. This system reinforces the brand philosophy "You don't have to be loud" by making color feel earned rather than always-on, creating a calm, intentional, and ceremonial user experience.

## Glossary

- **Accent_Reveal_System**: The CSS-based system that controls when and how accent colors appear in response to user interactions
- **Gold_Accent**: Recognition color used for important or chosen elements, appears as edge glow, underline, or halo. Design guidance: rgba(180, 150, 100, 0.4) to rgba(180, 150, 100, 0.8)
- **Red_Accent**: Invitation/ritual color (deep red, low saturation) used for emotional actions, appears as soft internal glow. Design guidance: rgba(139, 0, 0, 0.1) to rgba(139, 0, 0, 0.3)
- **Purple_Accent**: Mystery/depth color (deep purple) used for atmospheric reinforcement, appears in shadows and gradients. Design guidance: rgba(75, 45, 75, 0.05) to rgba(75, 45, 75, 0.15)
- **Accent_Trinity**: The three accent colors (gold, red, purple) working together in a coordinated reveal system
- **User_Engagement**: Intentional user actions including hover, focus, active state, scroll into viewport, touch/press on mobile devices
- **Ceremonial_Interaction**: The feeling that clicking or interacting with an element is meaningful and intentional, not transactional
- **Reduced_Motion**: Browser preference (prefers-reduced-motion) that indicates user wants minimal animation
- **Presence_Change**: Visual changes that affect opacity, contrast, shadow intensity, or border intensity without movement or translation

## Requirements

### Requirement 1: Gold Accent Reveals for Recognition

**User Story:** As a user, I want to see gold accents appear when I hover over or focus on important elements, so that I feel my attention is being acknowledged and the element feels chosen.

#### Acceptance Criteria

1. WHEN a user hovers over a primary button, THE Accent_Reveal_System SHALL fade in a thin gold outline over 300ms
2. WHEN a user hovers over a card element, THE Accent_Reveal_System SHALL reveal a gold glow on the bottom edge (1-2px) over 400ms
3. WHEN a user focuses on an interactive element, THE Accent_Reveal_System SHALL display a gold indicator (outline, underline, or halo)
4. WHEN a user stops hovering or removes focus, THE Accent_Reveal_System SHALL fade out the gold accent over 500ms (slower than fade-in)
5. THE Accent_Reveal_System SHALL ensure gold accents never fill large areas, only edges, outlines, or small highlights

### Requirement 2: Red Accent Reveals for Invitation

**User Story:** As a user, I want to see deep red warmth appear when I interact with emotionally significant elements, so that I feel welcomed and invited into the experience.

#### Acceptance Criteria

1. WHEN a user hovers over a primary button, THE Accent_Reveal_System SHALL reveal a faint red internal glow that appears beneath the gold outline
2. WHEN a user focuses on The Mirror input field, THE Accent_Reveal_System SHALL display a subtle red glow inside the input container
3. WHEN a user hovers over a card in The House section, THE Accent_Reveal_System SHALL add a slight red undertone to the background
4. WHEN a user clicks a button (active state), THE Accent_Reveal_System SHALL briefly deepen the red glow for 150ms before retreating
5. THE Accent_Reveal_System SHALL ensure red accents appear as soft glows with low saturation, never as aggressive or bright fills

### Requirement 3: Purple Accent Reveals for Atmospheric Depth

**User Story:** As a user, I want to perceive subtle purple tones in shadows and backgrounds when elements are engaged, so that I sense depth and mystery beneath the surface.

#### Acceptance Criteria

1. WHEN a user hovers over a card element, THE Accent_Reveal_System SHALL deepen the shadow with a purple tint
2. WHEN a Mirror reading card is displayed, THE Accent_Reveal_System SHALL add a purple shadow behind the card
3. THE Accent_Reveal_System SHALL ensure purple accents are almost imperceptible with very low opacity
4. THE Accent_Reveal_System SHALL ensure purple accents never appear as text color, only in shadows and gradients

### Requirement 4: Button Interaction Reveals

**User Story:** As a user, I want buttons to reveal layered accent colors when I interact with them, so that clicking feels ceremonial and intentional rather than transactional.

#### Acceptance Criteria

1. WHEN a button is in default state, THE Accent_Reveal_System SHALL display no accent colors, only dark surfaces
2. WHEN a user hovers over a button, THE Accent_Reveal_System SHALL fade in a thin gold outline AND a faint red internal warmth simultaneously
3. WHEN a user clicks a button (active state), THE Accent_Reveal_System SHALL brighten the gold outline slightly AND deepen the red glow briefly
4. WHEN a user releases the button click, THE Accent_Reveal_System SHALL return both gold and red accents to their hover state
5. WHEN a user moves away from a button, THE Accent_Reveal_System SHALL fade out both accents with gold fading slower than red
6. THE Accent_Reveal_System SHALL keep button text color neutral (white/off-white) during all interaction states

### Requirement 5: Card Interaction Reveals

**User Story:** As a user, I want cards to feel alive when I notice them, so that the interface responds to my attention without being overwhelming.

#### Acceptance Criteria

1. WHEN a card is in default state, THE Accent_Reveal_System SHALL display matte, dark, quiet surfaces with no accent colors
2. WHEN a user hovers over a card, THE Accent_Reveal_System SHALL reveal a gold glow on the bottom edge (1-2px)
3. WHEN a user hovers over a card, THE Accent_Reveal_System SHALL lift the background with a slight red undertone
4. WHEN a user hovers over a card, THE Accent_Reveal_System SHALL deepen the shadow with a purple tint
5. WHEN a user stops hovering, THE Accent_Reveal_System SHALL remove all three accent reveals smoothly over 400-500ms
6. THE Accent_Reveal_System SHALL coordinate all three accent reveals to appear and disappear together as a unified effect

### Requirement 6: Mirror Input Interaction Reveals

**User Story:** As a user, I want The Mirror input to feel alive and responsive when I interact with it, so that the experience feels intimate and controlled.

#### Acceptance Criteria

1. WHEN The Mirror input is idle (not focused), THE Accent_Reveal_System SHALL display almost no color
2. WHEN a user focuses on The Mirror input, THE Accent_Reveal_System SHALL reveal a subtle red glow inside the input container
3. WHEN a user focuses on The Mirror input, THE Accent_Reveal_System SHALL display a gold underline or gold focus ring
4. WHEN a Mirror reading card is shown, THE Accent_Reveal_System SHALL add a gold border around the reading card
5. WHEN a Mirror reading card is shown, THE Accent_Reveal_System SHALL add a purple shadow behind the reading card
6. WHEN a Mirror reading card is shown, THE Accent_Reveal_System SHALL add red warmth to the background

### Requirement 7: Section Entry Reveals

**User Story:** As a user, I want sections to subtly announce their presence when they enter my viewport, so that I feel the page is responding to my scroll without aggressive animation.

#### Acceptance Criteria

1. WHEN a section enters the viewport, THE Accent_Reveal_System SHALL bloom a very faint purple-black gradient behind it through opacity changes
2. WHEN a section enters the viewport, THE Accent_Reveal_System SHALL make gold dividers slightly brighter through contrast or shadow intensity changes
3. WHEN a section has fully entered the viewport, THE Accent_Reveal_System SHALL settle all accent reveals to their resting state
4. THE Accent_Reveal_System SHALL ensure section entry reveals use only presence changes (opacity, contrast, shadow intensity, border intensity) with no movement or translation
5. THE Accent_Reveal_System SHALL ensure section entry reveals are subtle enough to not distract from content

### Requirement 8: Accessibility and Performance

**User Story:** As a user with motion sensitivity or using assistive technology, I want the accent reveal system to respect my preferences and not cause performance issues, so that I can use the site comfortably.

#### Acceptance Criteria

1. WHEN a user has prefers-reduced-motion enabled, THE Accent_Reveal_System SHALL reduce all transition durations to 120ms or less
2. WHEN a user has prefers-reduced-motion enabled, THE Accent_Reveal_System SHALL disable any looping, flickering, or scroll-dependent effects
3. WHEN a user has prefers-reduced-motion enabled, THE Accent_Reveal_System SHALL still show accent colors in their final states with minimal transitions
4. THE Accent_Reveal_System SHALL use CSS-based solutions for all accent reveals to ensure optimal performance
5. THE Accent_Reveal_System SHALL avoid JavaScript-based animations except for scroll-based section entry reveals
6. THE Accent_Reveal_System SHALL ensure no scroll lag or jank when revealing accents during user interactions
7. WHEN a user focuses on an element using keyboard navigation, THE Accent_Reveal_System SHALL display the same accent reveals as hover states
8. WHEN a user interacts on a touch device, THE Accent_Reveal_System SHALL activate reveal states on focus or press states without depending on hover

### Requirement 9: Color Coordination and Restraint

**User Story:** As a user, I want accent colors to feel coordinated and intentional, so that the interface never feels chaotic or overwhelming.

#### Acceptance Criteria

1. THE Accent_Reveal_System SHALL ensure gold is the primary visible accent in any interaction, with red and purple remaining subordinate at lower opacity
2. THE Accent_Reveal_System SHALL ensure multiple accents in one interaction work together harmoniously (gold + red + purple on cards)
3. THE Accent_Reveal_System SHALL prevent accent colors from being always-on or visible in idle states
4. THE Accent_Reveal_System SHALL prevent neon or saturated tones (all accent colors must be muted and low-saturation)
5. THE Accent_Reveal_System SHALL prevent accent colors from being used as text colors except for very specific cases (like product names)
6. THE Accent_Reveal_System SHALL ensure accent reveals scale across all pages without requiring per-page customization

### Requirement 10: CSS Variable System Integration

**User Story:** As a developer, I want the accent reveal system to integrate with the existing CSS variable system, so that accent colors are maintainable and consistent across the site.

#### Acceptance Criteria

1. THE Accent_Reveal_System SHALL define new CSS custom properties for gold accent tokens (e.g., --accent-gold-edge, --accent-gold-edge-strong, --accent-gold-glow)
2. THE Accent_Reveal_System SHALL define new CSS custom properties for red accent tokens (e.g., --accent-red-glow, --accent-red-warmth)
3. THE Accent_Reveal_System SHALL define new CSS custom properties for purple accent tokens (e.g., --accent-purple-shadow, --accent-purple-depth)
4. THE Accent_Reveal_System SHALL define CSS custom properties for transition durations (e.g., --transition-reveal-in, --transition-reveal-out, --transition-reveal-reduced)
5. THE Accent_Reveal_System SHALL use existing CSS variables from globals.css where appropriate (e.g., --black-surface, --text-primary)
6. THE Accent_Reveal_System SHALL ensure all accent reveal styles are defined in globals.css for global consistency
7. THE Accent_Reveal_System SHALL use CSS custom property tokens in all acceptance criteria implementations rather than hardcoded RGBA values
