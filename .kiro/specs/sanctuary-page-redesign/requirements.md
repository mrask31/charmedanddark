# Requirements Document

## Introduction

The Sanctuary Page Redesign implements a redesigned /sanctuary route for Charmed & Dark, a gothic DTC e-commerce brand. The page serves as a member-gated content hub that showcases premium features (The Mirror, Grimoire, Sanctuary Price) while maintaining public accessibility. The design follows a dark, celestial aesthetic with locked content visually indicated through blur effects and lock icons, without requiring authentication to view the page structure.

## Glossary

- **Sanctuary_Page**: The Next.js 14 page component at /sanctuary route
- **SanctuaryHero**: The hero section with nebula gradient background and crescent moon
- **FeatureCards**: Three-column grid showcasing The Mirror, Grimoire, and Sanctuary Price
- **ResonanceBar**: Full-width band displaying resonance metrics with celestial icons
- **GrimoireSection**: Section displaying recent grimoire entries with locked state
- **StickyJoinBar**: Fixed bottom bar with "JOIN FREE" call-to-action
- **Locked_Content**: Content that is visually obscured (blurred) with lock icon overlay
- **Preview_Content**: Content accessible without membership (The Mirror)
- **Design_Tokens**: Tailwind CSS color configuration for sanctuary theme
- **Celestial_Icons**: Lucide-react icons (Candle, Rose, Moon, Star) used in resonance pills

## Requirements

### Requirement 1: Sanctuary Hero Section

**User Story:** As a visitor, I want to see an immersive hero section with celestial aesthetics, so that I understand the sanctuary's purpose and feel drawn into the experience.

#### Acceptance Criteria

1. THE SanctuaryHero SHALL render with background color #08080f
2. THE SanctuaryHero SHALL display a radial nebula gradient from top-right with deep indigo/violet colors at 10-20% opacity
3. THE SanctuaryHero SHALL render a static micro star field with randomly positioned dots at 10-20% opacity
4. THE SanctuaryHero SHALL display a crescent moon SVG at top-right position absolute, approximately 280px tall, at 8% opacity
5. THE SanctuaryHero SHALL render an eyebrow text in tracked caps, gold color #c9a96e, 11px font size
6. THE SanctuaryHero SHALL display an H1 heading using Cormorant Garamond or Playfair Display font at approximately 80px
7. THE SanctuaryHero SHALL render subtext using Inter 300 font weight in color #e8e4dc
8. THE SanctuaryHero SHALL display a scroll chevron in gold color with slow pulse animation
9. WHEN the scroll chevron is clicked, THE Sanctuary_Page SHALL scroll to the element with id "features"

### Requirement 2: Feature Cards Grid

**User Story:** As a visitor, I want to see the three main sanctuary features in a clear grid layout, so that I can understand what benefits are available.

#### Acceptance Criteria

1. THE FeatureCards SHALL render as a 3-column grid on desktop viewports
2. WHEN viewport width is below 768px, THE FeatureCards SHALL collapse to a single column layout
3. THE FeatureCards SHALL have id attribute "features" for scroll navigation
4. THE FeatureCards SHALL render each card with background color #0e0e1a
5. THE FeatureCards SHALL render each card with 1px border using rgba(201,169,110,0.2)
6. WHEN a card is hovered, THE FeatureCards SHALL display a glow box-shadow: 0 0 20px rgba(201,169,110,0.08)

### Requirement 3: The Mirror Card (Preview Status)

**User Story:** As a visitor, I want to preview The Mirror feature without membership, so that I can experience the core functionality before joining.

#### Acceptance Criteria

1. THE FeatureCards SHALL render The Mirror card with status badge "PREVIEW"
2. THE FeatureCards SHALL display The Mirror card content without blur effects
3. THE FeatureCards SHALL render The Mirror card with heading "The Mirror"
4. THE FeatureCards SHALL render The Mirror card with descriptive body text fully visible
5. THE FeatureCards SHALL render a button labeled "Reveal a Reading (Preview)" on The Mirror card
6. WHEN the button is clicked, THE Sanctuary_Page SHALL navigate to /#mirror

### Requirement 4: Grimoire Card (Locked Status)

**User Story:** As a visitor, I want to see that the Grimoire feature exists but is locked, so that I understand it requires membership.

#### Acceptance Criteria

1. THE FeatureCards SHALL render the Grimoire card with status badge "LOCKED"
2. THE FeatureCards SHALL apply blur effect to Grimoire card body text
3. THE FeatureCards SHALL display a centered lock icon in gold stroke, 24px size, on the Grimoire card
4. THE FeatureCards SHALL render the Grimoire card heading "Grimoire" without blur
5. THE FeatureCards SHALL render a button labeled "Join to Unlock" on the Grimoire card
6. WHEN the button is clicked, THE Sanctuary_Page SHALL navigate to /join

### Requirement 5: Sanctuary Price Card (Locked Status)

**User Story:** As a visitor, I want to see that Sanctuary Price exists but is locked, so that I understand membership provides shopping benefits.

#### Acceptance Criteria

1. THE FeatureCards SHALL render the Sanctuary Price card with status badge "LOCKED"
2. THE FeatureCards SHALL apply blur effect to Sanctuary Price card body text
3. THE FeatureCards SHALL display a centered lock icon in gold stroke, 24px size, on the Sanctuary Price card
4. THE FeatureCards SHALL render the Sanctuary Price card heading "Sanctuary Price" without blur
5. THE FeatureCards SHALL render a button labeled "Join to Unlock" on the Sanctuary Price card
6. WHEN the button is clicked, THE Sanctuary_Page SHALL navigate to /join

### Requirement 6: Resonance Bar

**User Story:** As a visitor, I want to see community resonance metrics, so that I feel connected to other members without compromising privacy.

#### Acceptance Criteria

1. THE ResonanceBar SHALL render as a full-width dark band
2. THE ResonanceBar SHALL display 1px gold borders on top and bottom edges
3. THE ResonanceBar SHALL render "RESONANCE" label with subtext on the left side
4. THE ResonanceBar SHALL display 4 resonance pills on the right side: Candle 12, Rose 7, Moon 4, Star 9
5. THE ResonanceBar SHALL render each pill with dark background, gold border, and tracked label
6. THE ResonanceBar SHALL display celestial icons (Flame, Rose, Moon, Star) from lucide-react in each pill
7. WHEN viewport width is below 768px, THE ResonanceBar SHALL stack label and pills vertically

### Requirement 7: Grimoire Section

**User Story:** As a visitor, I want to see a preview of the Grimoire section, so that I understand what saved readings look like.

#### Acceptance Criteria

1. THE GrimoireSection SHALL render centered with max-width 680px
2. THE GrimoireSection SHALL display heading "Recent in your Grimoire" using serif font
3. THE GrimoireSection SHALL render a "LOCKED" badge at top-right of the heading
4. THE GrimoireSection SHALL display 3 reading card rows labeled 001, 002, 003
5. THE GrimoireSection SHALL apply blur effect to reading card text content
6. THE GrimoireSection SHALL display a lock icon right-aligned on each reading card
7. THE GrimoireSection SHALL contain all reading cards within a single bordered card container

### Requirement 8: Sticky Join Bar

**User Story:** As a visitor, I want to see a persistent join call-to-action, so that I can easily sign up while browsing the page.

#### Acceptance Criteria

1. THE StickyJoinBar SHALL render with position fixed at bottom of viewport
2. THE StickyJoinBar SHALL span full width of the viewport
3. THE StickyJoinBar SHALL display background rgba(8,8,15,0.92)
4. THE StickyJoinBar SHALL render 1px gold border on top edge
5. THE StickyJoinBar SHALL display a "JOIN FREE" button with gold border, transparent fill, and gold text
6. THE StickyJoinBar SHALL render the button in pill shape (fully rounded)
7. WHEN the button is hovered, THE StickyJoinBar SHALL apply gold fill at 10% opacity
8. WHEN the button is clicked, THE Sanctuary_Page SHALL navigate to /join

### Requirement 9: Design Tokens Configuration

**User Story:** As a developer, I want sanctuary-specific design tokens in Tailwind configuration, so that I can maintain consistent styling across components.

#### Acceptance Criteria

1. THE Sanctuary_Page SHALL define sanctuary.bg color token as #08080f in Tailwind config
2. THE Sanctuary_Page SHALL define sanctuary.card color token as #0e0e1a in Tailwind config
3. THE Sanctuary_Page SHALL define sanctuary.gold color token as #c9a96e in Tailwind config
4. THE Sanctuary_Page SHALL define sanctuary.text color token as #e8e4dc in Tailwind config
5. WHERE Tailwind config does not exist, THE Sanctuary_Page SHALL create tailwind.config.ts with sanctuary color tokens

### Requirement 10: Typography Configuration

**User Story:** As a developer, I want serif fonts (Cormorant Garamond or Playfair Display) and Inter configured, so that the page matches the design system.

#### Acceptance Criteria

1. THE Sanctuary_Page SHALL load Cormorant Garamond or Playfair Display font using next/font/google
2. THE Sanctuary_Page SHALL load Inter font using next/font/google
3. THE Sanctuary_Page SHALL apply serif font to H1 heading in SanctuaryHero
4. THE Sanctuary_Page SHALL apply Inter font to body text throughout the page
5. WHERE fonts are not configured in layout.tsx, THE Sanctuary_Page SHALL add font imports to layout.tsx

### Requirement 11: Responsive Layout

**User Story:** As a mobile visitor, I want the sanctuary page to adapt to my screen size, so that I can access all content comfortably.

#### Acceptance Criteria

1. WHEN viewport width is below 768px, THE Sanctuary_Page SHALL apply mobile-specific layouts
2. WHEN viewport width is below 768px, THE FeatureCards SHALL render in single column
3. WHEN viewport width is below 768px, THE ResonanceBar SHALL stack label and pills vertically
4. WHEN viewport width is below 768px, THE SanctuaryHero H1 SHALL reduce font size appropriately
5. THE Sanctuary_Page SHALL maintain readability and touch target sizes on mobile devices

### Requirement 12: Accessibility Compliance

**User Story:** As a visitor using assistive technology, I want the sanctuary page to be accessible, so that I can navigate and understand all content.

#### Acceptance Criteria

1. THE Sanctuary_Page SHALL provide alt text or aria-labels for all decorative SVG elements
2. THE Sanctuary_Page SHALL maintain color contrast ratios meeting WCAG AA standards
3. THE Sanctuary_Page SHALL ensure all interactive elements are keyboard accessible
4. THE Sanctuary_Page SHALL provide focus indicators for all interactive elements
5. THE Sanctuary_Page SHALL use semantic HTML elements (section, nav, button) appropriately
6. THE Sanctuary_Page SHALL ensure lock icons have aria-hidden="true" since they are decorative

### Requirement 13: Performance Optimization

**User Story:** As a visitor, I want the sanctuary page to load quickly, so that I have a smooth browsing experience.

#### Acceptance Criteria

1. THE Sanctuary_Page SHALL use Next.js Image component for crescent moon SVG where applicable
2. THE Sanctuary_Page SHALL minimize CSS-in-JS runtime overhead by using Tailwind classes
3. THE Sanctuary_Page SHALL avoid layout shifts during font loading using next/font
4. THE Sanctuary_Page SHALL lazy-load non-critical decorative elements where appropriate
5. THE Sanctuary_Page SHALL render as a client component only if interactivity requires it
