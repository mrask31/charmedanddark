# Landing Page Implementation

## Overview
The landing page serves as the first encounter with Charmed & Dark - introducing the brand, The Mirror experience, and pathways to both The Threshold (public shop) and The Sanctuary (members-only).

## Design Philosophy

**Mirror-First Approach**
The Mirror is integrated directly on the home page to create immediate emotional connection before commerce. This drives the conversion funnel: curiosity → reflection → emotional resonance → membership desire.

**Visual Aesthetic**
- Black dominance (#0A0A0A background, 80%+ of visual space)
- Muted gold accents (#8B7355, <5% of space)
- Deep red hover states (#4A0E0E for interaction)
- Deep purple accents (#2D1B3D for The Mirror)
- Generous spacing (96px between sections, 24px-48px between elements)
- Restrained, adult, intentional

## Page Structure

### 1. Navigation
Minimal top navigation with links to:
- Threshold (shop)
- Drops (limited releases)
- About (brand story)
- Join (Sanctuary membership)

**Interaction**: Muted gold default, deep red on hover

### 2. Hero Section
- Brand name: "Charmed & Dark" (56px, light weight)
- Tagline: "The Sanctuary for the Modern Shadow" (20px, italic, muted gold)
- Positioning statement: One-line description of the target audience
- Centered, generous spacing

### 3. The Mirror Section
**Purpose**: Immediate interactive experience that hooks visitors emotionally

**Components**:
- Title: "The Mirror"
- Description: "A quiet place to reflect. Enter what you're feeling."
- Input field: "I am feeling..."
- Submit button: "Reflect"

**Interaction Flow**:
1. User enters a feeling/mood
2. Submit triggers reading card (placeholder for now)
3. Reading card shows:
   - Acknowledgment message
   - Invitation to join Sanctuary to save readings
   - Link to /join page

**Visual Treatment**:
- Deep purple border (#2D1B3D)
- Dark background (#0F0F0F)
- Contained, intimate feel
- Input focus state: muted gold border
- Button hover: deep red background

**TODO**: Integrate actual Mirror AI experience (OpenAI API, reading generation logic)

### 4. Invitation Section
Two side-by-side cards:

**Card 1: Enter the Threshold**
- Description of the shop experience
- Primary CTA: "Discover" (deep red background)
- Links to /threshold

**Card 2: Join the Sanctuary**
- Description of membership benefits
- Secondary CTA: "Learn More" (muted gold border)
- Links to /join

**Responsive**: Stacks vertically on mobile

### 5. Footer
- Brand statement: "Not loud. Not viral. Enduring."
- Subtle, centered, muted color

## Color Palette

### Foundation (Blacks)
- `#0A0A0A` - Primary background (near-black)
- `#0F0F0F` - Card backgrounds (slightly lighter)
- `#1A1A1A` - Borders, input backgrounds
- `#E5E5E5` - Primary text (off-white)
- `#999` - Secondary text (gray)
- `#666` - Tertiary text (darker gray)

### Emphasis (Gold)
- `#8B7355` - Muted gold (links, accents, tagline)

### Ritual (Red)
- `#4A0E0E` - Deep red (hover states, primary CTA)
- `#6B1515` - Lighter red (hover variation)

### Sanctuary (Purple)
- `#2D1B3D` - Deep purple (Mirror border, featured elements)

## Typography Scale
- Brand name: 56px, weight 300
- Section titles: 32px, weight 300
- Card titles: 24px, weight 300
- Body text: 16px
- Small text: 14px
- Tagline: 20px, italic

## Spacing Scale
- Section padding: 96px vertical
- Card padding: 48px
- Element spacing: 24px
- Navigation gap: 48px
- Grid gap: 48px

## Interaction Behaviors

### Hover States
- Navigation links: muted gold → deep red
- Mirror button: muted gold border → deep red fill
- Primary CTA: deep red → lighter red
- Secondary CTA: muted gold border → muted gold fill (inverted)
- All transitions: 300ms ease-in-out

### Active States
- Buttons: scale(0.98)
- Links: scale(1.02) on hover

### Focus States
- Input fields: muted gold border

## Responsive Behavior

### Desktop (≥1025px)
- Two-column invitation cards
- Centered content, max-width 1000px
- Full navigation visible

### Tablet (769px-1024px)
- Two-column invitation cards (narrower)
- Centered content, max-width 800px

### Mobile (≤768px)
- Single-column invitation cards (stacked)
- Navigation may collapse (future enhancement)
- Reduced font sizes (future enhancement)

## Next Steps

### Immediate
1. Create placeholder pages for:
   - /threshold (shop)
   - /drops (limited releases)
   - /about (brand story)
   - /join (membership conversion)

### Phase 2: Mirror AI Integration
1. Set up OpenAI API integration
2. Create reading generation logic:
   - Validation (acknowledge feeling)
   - Prescription (recommend product + ritual)
   - Resonance line (poetic, not fake metrics)
3. Create reading card component with proper styling
4. Add email capture for non-members
5. Add "save reading" functionality for members

### Phase 3: Polish
1. Add subtle animations (fade-in on load)
2. Add loading states for Mirror submission
3. Optimize for mobile (font scaling, spacing adjustments)
4. Add meta tags for SEO
5. Add Open Graph tags for social sharing

## Files Modified
- `app/page.tsx` - Landing page component
- `app/globals.css` - Global styles and hover states

## Design Principles Honored
✅ Black dominance (80%+ of visual space)
✅ Gold scarcity (<5% of visual space)
✅ Deep red hover states (300ms transitions)
✅ Generous spacing (96px sections, 24px-48px elements)
✅ Restrained, adult, intentional aesthetic
✅ No urgency patterns, no aggressive CTAs
✅ Calm, quiet, introspective tone
✅ Mirror-first emotional connection
✅ Clear pathways to Threshold and Sanctuary

## Brand Alignment
✅ "The Sanctuary for the Modern Shadow" positioning
✅ Target audience: Corporate Goth (28-50, professionals)
✅ Emotional connection before commerce
✅ Membership conversion pathway
✅ Restrained, elegant gothic aesthetic
✅ Not loud, not viral, enduring
