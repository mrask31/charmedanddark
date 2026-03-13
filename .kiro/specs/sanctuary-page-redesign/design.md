# Design Document: Sanctuary Page Redesign

## Overview

The Sanctuary Page Redesign transforms the `/sanctuary` route into a member-gated content hub with a dark celestial aesthetic. The page showcases three premium features (The Mirror, Grimoire, Sanctuary Price) while maintaining public accessibility through visual locked states (blur effects, lock icons) rather than authentication walls.

The design implements a dual-state system: visitors see locked content with visual obscuration, while authenticated members with active memberships see unlocked content with full functionality. The member authentication system uses a custom React hook (`useSanctuaryAccess`) that queries Supabase on mount to determine membership status and conditionally renders content.

The page is built with Next.js 14 App Router, React Server Components where possible, and Tailwind CSS v4 for styling. The architecture prioritizes performance through minimal client-side JavaScript, accessibility through semantic HTML and ARIA attributes, and maintainability through component composition.

## Architecture

### High-Level Structure

```
/sanctuary route
├── SanctuaryPage (Client Component)
│   ├── useSanctuaryAccess hook (auth state)
│   ├── SanctuaryHero
│   ├── FeatureCards
│   │   ├── MirrorCard (preview)
│   │   ├── GrimoireCard (locked/unlocked)
│   │   └── SanctuaryPriceCard (locked/unlocked)
│   ├── ResonanceBar
│   ├── GrimoireSection (locked/unlocked)
│   └── StickyJoinBar (conditional)
```

### Technology Stack

- **Framework**: Next.js 14 (App Router)
- **UI Library**: React 19
- **Styling**: Tailwind CSS v4 (inline theme configuration via `@theme`)
- **Icons**: lucide-react
- **Authentication**: Supabase Auth
- **Database**: Supabase (PostgreSQL)
- **Fonts**: next/font/google (Cormorant Garamond, Inter)

### Rendering Strategy

- **Page Component**: Client Component (`"use client"`) due to authentication state and interactivity
- **Child Components**: Presentational components can be pure functions (no separate client directive needed)
- **Data Fetching**: Client-side via Supabase client on mount (auth-dependent)
- **Static Assets**: Crescent moon SVG inlined or imported as React component

### State Management

The page uses a single custom hook `useSanctuaryAccess` that encapsulates all authentication and membership logic. No global state management library is required. State flows unidirectionally from the hook to child components via props.

```typescript
// State flow
useSanctuaryAccess() → SanctuaryAccess object → Component props → Conditional rendering
```

## Components and Interfaces

### 1. useSanctuaryAccess Hook

**Location**: `hooks/useSanctuaryAccess.ts`

**Purpose**: Centralized authentication and membership state management for sanctuary features.

**Interface**:

```typescript
type GrimoireEntry = {
  id: string
  user_id: string
  title: string
  subtitle: string
  content: string
  created_at: string
}

type SanctuaryAccess = {
  isAuthenticated: boolean
  isMember: boolean
  discountCode: string | null
  grimoire: GrimoireEntry[] | null
  loading: boolean
}

function useSanctuaryAccess(): SanctuaryAccess
```

**Behavior**:

1. On mount, call `supabase.auth.getSession()`
2. If no session → return `{ isAuthenticated: false, isMember: false, discountCode: null, grimoire: null, loading: false }`
3. If session exists:
   - Query `memberships` table for active record matching `user_id`
   - If active membership found:
     - Set `isMember: true`
     - Fetch last 3 `grimoire_entries` ordered by `created_at DESC`
     - Fetch active `discount_code` for user
   - Return complete `SanctuaryAccess` object
4. Handle loading state during async operations
5. Handle errors gracefully (log to console, return safe defaults)

**Dependencies**:
- `@supabase/supabase-js` (client)
- `lib/supabase/client.js` (existing Supabase client)

**Implementation Notes**:
- Use `useEffect` with empty dependency array for mount-only execution
- Use `useState` for `SanctuaryAccess` state
- Consider `onAuthStateChange` listener for real-time auth updates (optional enhancement)
- Memoize returned object to prevent unnecessary re-renders

### 2. SanctuaryPage Component

**Location**: `app/sanctuary/page.js`

**Type**: Client Component

**Props**: None (route component)

**State**: Consumes `useSanctuaryAccess` hook

**Responsibilities**:
- Orchestrate all child components
- Pass `SanctuaryAccess` state to children
- Handle scroll navigation (chevron click → scroll to #features)

**Structure**:

```jsx
export default function SanctuaryPage() {
  const access = useSanctuaryAccess()
  
  return (
    <section className="space-y-10">
      <SanctuaryHero onScrollClick={handleScrollToFeatures} />
      <FeatureCards access={access} />
      <ResonanceBar />
      <GrimoireSection access={access} />
      {!access.isMember && <StickyJoinBar access={access} />}
    </section>
  )
}
```

### 3. SanctuaryHero Component

**Props**:
```typescript
type SanctuaryHeroProps = {
  onScrollClick: () => void
}
```

**Visual Elements**:
- Background: `#08080f` (sanctuary.bg)
- Radial gradient: Deep indigo/violet from top-right, 10-20% opacity
- Micro star field: Randomly positioned dots (10-20% opacity)
- Crescent moon SVG: Top-right absolute, 280px tall, 8% opacity
- Eyebrow text: Gold (#c9a96e), 11px, tracked caps
- H1: Cormorant Garamond, ~80px (responsive)
- Subtext: Inter 300, #e8e4dc
- Scroll chevron: Gold, pulse animation

**Accessibility**:
- Crescent moon: `aria-hidden="true"` (decorative)
- Scroll chevron: `<button>` with `aria-label="Scroll to features"`
- Star field: CSS-only (no ARIA needed)

### 4. FeatureCards Component

**Props**:
```typescript
type FeatureCardsProps = {
  access: SanctuaryAccess
}
```

**Layout**: 3-column grid (desktop), single column (mobile <768px)

**Card Structure**:

Each card contains:
- Status badge (PREVIEW, LOCKED, or hidden if member)
- Heading (always visible)
- Body text (blurred if locked and not member)
- Lock icon (if locked and not member)
- CTA button (label changes based on state)

**Card States**:

| Card | Visitor State | Member State |
|------|---------------|--------------|
| Mirror | PREVIEW badge, no blur, "Reveal a Reading (Preview)" → /#mirror | No badge, no blur, "Enter The Mirror" → /#mirror |
| Grimoire | LOCKED badge, blur, lock icon, "Join to Unlock" → /join | No badge, no blur, "Open Grimoire" → /sanctuary/grimoire |
| Sanctuary Price | LOCKED badge, blur, lock icon, "Join to Unlock" → /join | No badge, no blur, discount code visible, "Copy Code" |

**Hover Effect**: Glow box-shadow `0 0 20px rgba(201,169,110,0.08)`

### 5. ResonanceBar Component

**Props**: None (static data)

**Data**:
```javascript
const resonanceItems = [
  { label: "Candle", count: 12, Icon: Flame },
  { label: "Rose", count: 7, Icon: Rose },
  { label: "Moon", count: 4, Icon: Moon },
  { label: "Star", count: 9, Icon: Star },
]
```

**Layout**:
- Desktop: Horizontal flex, label left, pills right
- Mobile (<768px): Vertical stack

**Styling**:
- Full-width dark band
- 1px gold borders (top/bottom)
- Pills: Dark bg, gold border, tracked label, icon + count

**Accessibility**:
- Icons: `aria-hidden="true"` (decorative, label provides context)
- Semantic `<section>` wrapper

### 6. GrimoireSection Component

**Props**:
```typescript
type GrimoireSectionProps = {
  access: SanctuaryAccess
}
```

**Visitor State** (`!access.isMember`):
- Heading: "Recent in your Grimoire" + LOCKED badge
- Subtext: "Your Grimoire appears when you join."
- 3 placeholder reading cards (blurred text, lock icons)
- CTA: "Join Free" → /join

**Member State** (`access.isMember`):
- Heading: "Recent in your Grimoire" (no badge)
- 3 real `GrimoireEntry` cards from `access.grimoire`
- Each card: title, subtitle, timestamp, chevron-right icon
- Each card links to `/sanctuary/grimoire/[id]`

**Card Structure**:
```jsx
<div className="reading-card">
  <div>
    <p className="title">{entry.title}</p>
    <p className="subtitle">{entry.subtitle}</p>
  </div>
  <span className="timestamp">{formatDate(entry.created_at)}</span>
</div>
```

### 7. StickyJoinBar Component

**Props**:
```typescript
type StickyJoinBarProps = {
  access: SanctuaryAccess
}
```

**Visibility**: Hidden if `access.isMember === true`

**Position**: Fixed bottom, full width, z-index above content

**States**:

| Auth State | Member State | Button Text | Action |
|------------|--------------|-------------|--------|
| Not authenticated | N/A | "JOIN FREE" | → /join |
| Authenticated | Not member | "Upgrade to Member" | → /join |
| Authenticated | Member | (hidden) | N/A |

**Styling**:
- Background: `rgba(8,8,15,0.92)` (semi-transparent)
- Border top: 1px gold
- Button: Pill shape, gold border, transparent fill, gold text
- Hover: Gold fill at 10% opacity

## Data Models

### Supabase Tables

#### memberships

```sql
CREATE TABLE memberships (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  status TEXT NOT NULL CHECK (status IN ('active', 'inactive')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  expires_at TIMESTAMPTZ,
  UNIQUE(user_id)
);

CREATE INDEX idx_memberships_user_id ON memberships(user_id);
CREATE INDEX idx_memberships_status ON memberships(status);
```

**Row Level Security (RLS)**:
```sql
ALTER TABLE memberships ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own membership"
  ON memberships FOR SELECT
  USING (auth.uid() = user_id);
```

#### grimoire_entries

```sql
CREATE TABLE grimoire_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  subtitle TEXT,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_grimoire_user_created ON grimoire_entries(user_id, created_at DESC);
```

**Row Level Security (RLS)**:
```sql
ALTER TABLE grimoire_entries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own grimoire entries"
  ON grimoire_entries FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own grimoire entries"
  ON grimoire_entries FOR INSERT
  WITH CHECK (auth.uid() = user_id);
```

#### discount_codes

```sql
CREATE TABLE discount_codes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  code TEXT NOT NULL UNIQUE,
  percent_off INTEGER NOT NULL CHECK (percent_off > 0 AND percent_off <= 100),
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, is_active) WHERE is_active = TRUE
);

CREATE INDEX idx_discount_codes_user_active ON discount_codes(user_id, is_active);
```

**Row Level Security (RLS)**:
```sql
ALTER TABLE discount_codes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own active discount code"
  ON discount_codes FOR SELECT
  USING (auth.uid() = user_id AND is_active = TRUE);
```

### TypeScript Types

```typescript
// hooks/useSanctuaryAccess.ts
export type GrimoireEntry = {
  id: string
  user_id: string
  title: string
  subtitle: string
  content: string
  created_at: string
}

export type Membership = {
  id: string
  user_id: string
  status: 'active' | 'inactive'
  created_at: string
  expires_at: string | null
}

export type DiscountCode = {
  id: string
  user_id: string
  code: string
  percent_off: number
  is_active: boolean
  created_at: string
}

export type SanctuaryAccess = {
  isAuthenticated: boolean
  isMember: boolean
  discountCode: string | null
  grimoire: GrimoireEntry[] | null
  loading: boolean
}
```

### API Queries

**Check Membership**:
```typescript
const { data: membership } = await supabase
  .from('memberships')
  .select('*')
  .eq('user_id', userId)
  .eq('status', 'active')
  .single()
```

**Fetch Grimoire Entries**:
```typescript
const { data: entries } = await supabase
  .from('grimoire_entries')
  .select('*')
  .eq('user_id', userId)
  .order('created_at', { ascending: false })
  .limit(3)
```

**Fetch Discount Code**:
```typescript
const { data: discount } = await supabase
  .from('discount_codes')
  .select('code')
  .eq('user_id', userId)
  .eq('is_active', true)
  .single()
```


## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system—essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

### Property Reflection

After analyzing all acceptance criteria, I identified the following redundancies:
- Criteria 11.2 and 2.2 both test FeatureCards mobile layout (consolidated)
- Criteria 11.3 and 6.7 both test ResonanceBar mobile layout (consolidated)
- Criteria 4.1-4.5 and 5.1-5.5 test the same locked state pattern for different cards (combined into single property about locked cards)
- Multiple criteria test styling for "all cards" or "all pills" which are naturally properties

The following properties represent the unique, testable behaviors after consolidation:

### Property 1: Locked Card State Consistency

*For any* feature card in locked state (Grimoire or Sanctuary Price) when user is not a member, the card SHALL display a "LOCKED" badge, apply blur effect to body text, display a lock icon, keep the heading unblurred, and render a "Join to Unlock" button.

**Validates: Requirements 4.1, 4.2, 4.3, 4.4, 4.5, 5.1, 5.2, 5.3, 5.4, 5.5**

### Property 2: Feature Card Styling Uniformity

*For any* feature card rendered in the FeatureCards grid, the card SHALL have background color #0e0e1a and 1px border using rgba(201,169,110,0.2).

**Validates: Requirements 2.4, 2.5**

### Property 3: Resonance Pill Styling Uniformity

*For any* resonance pill in the ResonanceBar, the pill SHALL render with dark background, gold border, tracked label, and a celestial icon from lucide-react.

**Validates: Requirements 6.5, 6.6**

### Property 4: Grimoire Section Locked State

*For any* non-member user viewing the GrimoireSection, the section SHALL display a "LOCKED" badge, apply blur effect to all reading card text content, and display a lock icon on each reading card.

**Validates: Requirements 7.3, 7.5, 7.6**

### Property 5: Decorative SVG Accessibility

*For any* decorative SVG element on the Sanctuary page (crescent moon, lock icons, celestial icons), the element SHALL have aria-hidden="true" attribute.

**Validates: Requirements 12.1, 12.6**

### Property 6: Color Contrast Compliance

*For any* text element on the Sanctuary page, the color contrast ratio between text and background SHALL meet WCAG AA standards (minimum 4.5:1 for normal text, 3:1 for large text).

**Validates: Requirements 12.2**

### Property 7: Interactive Element Keyboard Accessibility

*For any* interactive element (button, link) on the Sanctuary page, the element SHALL be keyboard accessible (focusable via Tab key and activatable via Enter/Space) and display a visible focus indicator.

**Validates: Requirements 12.3, 12.4**

### Property 8: Semantic HTML for Interactive Elements

*For any* interactive element on the Sanctuary page, the element SHALL use semantic HTML (button for actions, anchor for navigation) rather than non-semantic elements like div or span.

**Validates: Requirements 12.5**

## Error Handling

### Authentication Errors

**Scenario**: Supabase auth session check fails

**Handling**:
- Log error to console with context: `console.error('Sanctuary auth check failed:', error)`
- Return safe default state: `{ isAuthenticated: false, isMember: false, discountCode: null, grimoire: null, loading: false }`
- Display page in visitor (locked) state
- Do not show error UI to user (graceful degradation)

**Rationale**: Authentication failures should not break the page experience. Visitors can still see the sanctuary structure and understand what membership offers.

### Membership Query Errors

**Scenario**: Database query to `memberships` table fails

**Handling**:
- Log error to console: `console.error('Membership query failed:', error)`
- Set `isMember: false` (fail closed)
- Continue with visitor state rendering
- Do not retry automatically (avoid infinite loops)

**Rationale**: If we cannot verify membership, we should not grant access to member-only content. Failing closed is the secure default.

### Grimoire Fetch Errors

**Scenario**: Database query to `grimoire_entries` table fails

**Handling**:
- Log error to console: `console.error('Grimoire fetch failed:', error)`
- Set `grimoire: null`
- Display empty state in GrimoireSection: "Your Grimoire is empty. Readings you save will appear here."
- Do not block other member features (discount code, unlocked cards)

**Rationale**: Grimoire fetch failure should not degrade the entire member experience. Other features should remain functional.

### Discount Code Fetch Errors

**Scenario**: Database query to `discount_codes` table fails

**Handling**:
- Log error to console: `console.error('Discount code fetch failed:', error)`
- Set `discountCode: null`
- Display fallback message in Sanctuary Price card: "Your discount code is temporarily unavailable. Contact support."
- Provide support link or email

**Rationale**: Discount code is a key member benefit. If unavailable, we should acknowledge the issue and provide a path to resolution.

### Network Errors

**Scenario**: Network request times out or fails

**Handling**:
- Implement timeout for all Supabase queries (10 seconds)
- On timeout, log error and return safe defaults
- Consider retry with exponential backoff for critical queries (membership check)
- Display loading state during retries

**Rationale**: Network issues are transient. A single retry can often resolve the issue without degrading UX.

### Invalid Data Errors

**Scenario**: Database returns malformed data (missing required fields)

**Handling**:
- Validate data shape using TypeScript type guards
- Log validation errors: `console.error('Invalid data shape:', data)`
- Filter out invalid entries (e.g., grimoire entries missing title)
- Continue with valid data only

**Example**:
```typescript
function isValidGrimoireEntry(entry: any): entry is GrimoireEntry {
  return (
    typeof entry.id === 'string' &&
    typeof entry.title === 'string' &&
    typeof entry.content === 'string' &&
    typeof entry.created_at === 'string'
  )
}

const validEntries = entries.filter(isValidGrimoireEntry)
```

**Rationale**: Partial data is better than no data. We should be resilient to individual record corruption.

## Testing Strategy

### Dual Testing Approach

The Sanctuary Page Redesign requires both unit tests and property-based tests for comprehensive coverage:

- **Unit tests**: Verify specific examples, edge cases, component rendering, and user interactions
- **Property tests**: Verify universal properties hold across all input variations (auth states, viewport sizes, data combinations)

Both approaches are complementary and necessary. Unit tests catch concrete bugs in specific scenarios, while property tests verify general correctness across the input space.

### Unit Testing

**Framework**: Jest + React Testing Library

**Focus Areas**:
1. Component rendering in specific states (visitor, authenticated non-member, member)
2. User interactions (button clicks, scroll navigation)
3. Responsive layout at specific breakpoints (768px, 1024px)
4. Integration with `useSanctuaryAccess` hook
5. Edge cases (empty grimoire, missing discount code)

**Example Unit Tests**:

```javascript
// Visitor state
test('displays locked badges on Grimoire and Sanctuary Price cards for visitors', () => {
  const access = { isAuthenticated: false, isMember: false, discountCode: null, grimoire: null, loading: false }
  render(<FeatureCards access={access} />)
  expect(screen.getAllByText('LOCKED')).toHaveLength(2)
})

// Member state
test('hides locked badges and displays discount code for members', () => {
  const access = { isAuthenticated: true, isMember: true, discountCode: 'SANCTUARY10', grimoire: [], loading: false }
  render(<FeatureCards access={access} />)
  expect(screen.queryByText('LOCKED')).not.toBeInTheDocument()
  expect(screen.getByText('SANCTUARY10')).toBeInTheDocument()
})

// Navigation
test('scroll chevron navigates to features section', () => {
  const scrollIntoView = jest.fn()
  Element.prototype.scrollIntoView = scrollIntoView
  render(<SanctuaryPage />)
  fireEvent.click(screen.getByLabelText('Scroll to features'))
  expect(scrollIntoView).toHaveBeenCalled()
})

// Responsive
test('FeatureCards renders single column on mobile', () => {
  global.innerWidth = 500
  render(<FeatureCards access={mockAccess} />)
  const grid = screen.getByTestId('feature-cards-grid')
  expect(grid).toHaveClass('md:grid-cols-3') // Tailwind responsive class
})
```

### Property-Based Testing

**Framework**: fast-check (JavaScript property-based testing library)

**Configuration**: Minimum 100 iterations per property test

**Tag Format**: Each test must include a comment referencing the design property:
```javascript
// Feature: sanctuary-page-redesign, Property 1: Locked Card State Consistency
```

**Focus Areas**:
1. Locked card state consistency across different auth states
2. Styling uniformity across collections (cards, pills)
3. Accessibility properties across all elements
4. Data validation across random input variations

**Example Property Tests**:

```javascript
import fc from 'fast-check'

// Feature: sanctuary-page-redesign, Property 1: Locked Card State Consistency
test('locked cards always display consistent locked state elements', () => {
  fc.assert(
    fc.property(
      fc.record({
        isAuthenticated: fc.boolean(),
        isMember: fc.constant(false), // Force non-member state
        discountCode: fc.constantFrom(null, 'CODE123'),
        grimoire: fc.constantFrom(null, []),
        loading: fc.boolean()
      }),
      (access) => {
        const { container } = render(<FeatureCards access={access} />)
        
        // Find locked cards (Grimoire and Sanctuary Price)
        const lockedCards = container.querySelectorAll('[data-card-status="locked"]')
        
        lockedCards.forEach(card => {
          // Each locked card must have these elements
          expect(card.querySelector('[data-badge="LOCKED"]')).toBeInTheDocument()
          expect(card.querySelector('[data-lock-icon]')).toBeInTheDocument()
          expect(card.querySelector('[data-blur="true"]')).toBeInTheDocument()
          expect(card.querySelector('button')).toHaveTextContent('Join to Unlock')
          
          // Heading should NOT be blurred
          const heading = card.querySelector('h2')
          expect(heading).not.toHaveClass('blur')
        })
      }
    ),
    { numRuns: 100 }
  )
})

// Feature: sanctuary-page-redesign, Property 2: Feature Card Styling Uniformity
test('all feature cards have consistent background and border styling', () => {
  fc.assert(
    fc.property(
      fc.record({
        isAuthenticated: fc.boolean(),
        isMember: fc.boolean(),
        discountCode: fc.option(fc.string()),
        grimoire: fc.option(fc.array(fc.record({
          id: fc.uuid(),
          title: fc.string(),
          subtitle: fc.string(),
          content: fc.string(),
          created_at: fc.date().map(d => d.toISOString())
        }))),
        loading: fc.boolean()
      }),
      (access) => {
        const { container } = render(<FeatureCards access={access} />)
        const cards = container.querySelectorAll('[data-feature-card]')
        
        cards.forEach(card => {
          const styles = window.getComputedStyle(card)
          expect(styles.backgroundColor).toBe('rgb(14, 14, 26)') // #0e0e1a
          expect(styles.border).toContain('1px')
          expect(styles.borderColor).toContain('rgba(201, 169, 110, 0.2)')
        })
      }
    ),
    { numRuns: 100 }
  )
})

// Feature: sanctuary-page-redesign, Property 5: Decorative SVG Accessibility
test('all decorative SVG elements have aria-hidden attribute', () => {
  fc.assert(
    fc.property(
      fc.record({
        isAuthenticated: fc.boolean(),
        isMember: fc.boolean(),
        discountCode: fc.option(fc.string()),
        grimoire: fc.option(fc.array(fc.anything())),
        loading: fc.boolean()
      }),
      (access) => {
        const { container } = render(<SanctuaryPage access={access} />)
        
        // Find all SVG elements that are decorative (icons, moon, stars)
        const decorativeSvgs = container.querySelectorAll('svg[data-decorative="true"]')
        
        decorativeSvgs.forEach(svg => {
          expect(svg).toHaveAttribute('aria-hidden', 'true')
        })
      }
    ),
    { numRuns: 100 }
  )
})

// Feature: sanctuary-page-redesign, Property 7: Interactive Element Keyboard Accessibility
test('all interactive elements are keyboard accessible with focus indicators', () => {
  fc.assert(
    fc.property(
      fc.record({
        isAuthenticated: fc.boolean(),
        isMember: fc.boolean(),
        discountCode: fc.option(fc.string()),
        grimoire: fc.option(fc.array(fc.anything())),
        loading: fc.boolean()
      }),
      (access) => {
        const { container } = render(<SanctuaryPage access={access} />)
        
        // Find all interactive elements
        const interactiveElements = container.querySelectorAll('button, a[href]')
        
        interactiveElements.forEach(element => {
          // Should be focusable
          expect(element.tabIndex).toBeGreaterThanOrEqual(0)
          
          // Simulate focus
          element.focus()
          const styles = window.getComputedStyle(element)
          
          // Should have visible focus indicator (outline or box-shadow)
          const hasFocusIndicator = 
            styles.outline !== 'none' || 
            styles.boxShadow !== 'none'
          expect(hasFocusIndicator).toBe(true)
        })
      }
    ),
    { numRuns: 100 }
  )
})
```

### Integration Testing

**Scope**: Test `useSanctuaryAccess` hook with mocked Supabase client

**Focus**:
1. Auth session detection
2. Membership query logic
3. Grimoire and discount code fetching
4. Error handling and fallback states
5. Loading state transitions

**Example**:
```javascript
test('useSanctuaryAccess returns member state when active membership exists', async () => {
  const mockSupabase = {
    auth: {
      getSession: jest.fn().mockResolvedValue({
        data: { session: { user: { id: 'user-123' } } }
      })
    },
    from: jest.fn().mockReturnValue({
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      single: jest.fn().mockResolvedValue({
        data: { id: 'mem-1', user_id: 'user-123', status: 'active' }
      }),
      order: jest.fn().mockReturnThis(),
      limit: jest.fn().mockResolvedValue({
        data: [{ id: 'g-1', title: 'Entry 1', content: 'Content' }]
      })
    })
  }
  
  const { result, waitForNextUpdate } = renderHook(() => useSanctuaryAccess())
  
  await waitForNextUpdate()
  
  expect(result.current.isAuthenticated).toBe(true)
  expect(result.current.isMember).toBe(true)
  expect(result.current.grimoire).toHaveLength(1)
})
```

### Accessibility Testing

**Tools**:
- jest-axe (automated accessibility testing)
- Manual keyboard navigation testing
- Screen reader testing (NVDA/JAWS)

**Focus**:
1. Color contrast ratios (automated via jest-axe)
2. Keyboard navigation flow
3. Focus management
4. ARIA attributes
5. Screen reader announcements

**Example**:
```javascript
import { axe, toHaveNoViolations } from 'jest-axe'

expect.extend(toHaveNoViolations)

test('Sanctuary page has no accessibility violations', async () => {
  const { container } = render(<SanctuaryPage />)
  const results = await axe(container)
  expect(results).toHaveNoViolations()
})
```

### Visual Regression Testing

**Tool**: Percy or Chromatic

**Scope**: Capture screenshots of key states for visual comparison

**States to Test**:
1. Visitor state (all locked)
2. Authenticated non-member state
3. Member state (all unlocked)
4. Mobile viewport (375px)
5. Tablet viewport (768px)
6. Desktop viewport (1440px)
7. Hover states (cards, buttons)
8. Focus states (keyboard navigation)

**Rationale**: Visual regression testing catches unintended styling changes that unit tests might miss (gradient positioning, opacity values, spacing).

### Performance Testing

**Metrics**:
- First Contentful Paint (FCP) < 1.5s
- Largest Contentful Paint (LCP) < 2.5s
- Cumulative Layout Shift (CLS) < 0.1
- Time to Interactive (TTI) < 3.5s

**Tools**: Lighthouse CI, WebPageTest

**Focus**:
1. Font loading strategy (next/font prevents FOUT)
2. Image optimization (crescent moon SVG)
3. JavaScript bundle size
4. Render-blocking resources

### Test Coverage Goals

- **Unit test coverage**: >80% of component logic
- **Property test coverage**: All identified properties (8 properties)
- **Integration test coverage**: All `useSanctuaryAccess` code paths
- **Accessibility test coverage**: 100% of interactive elements
- **Visual regression coverage**: All key states (8 states)

### Continuous Integration

**CI Pipeline**:
1. Run unit tests (Jest)
2. Run property tests (fast-check)
3. Run integration tests
4. Run accessibility tests (jest-axe)
5. Run visual regression tests (Percy)
6. Generate coverage report
7. Fail build if coverage < 80% or accessibility violations found

**Pre-commit Hooks**:
- Run unit tests for changed files
- Run ESLint
- Run Prettier


## Sanctuary Unlock — Member Auth Hook

**Status**: Pending auth implementation (depends on Sanctuary Page spec completion)

### Overview

The Sanctuary Unlock system provides member authentication and content gating through a custom React hook that detects user sessions and queries membership status. The hook fires on `/sanctuary` route load and exposes authentication state, membership status, discount codes, and grimoire entries to the page components.

### Hook Specification

**Location**: `hooks/useSanctuaryAccess.ts`

**Trigger**: Page mount (useEffect with empty dependency array)

**Auth Detection**: Supabase `onAuthStateChange` listener or `getSession` on mount

### Hook Interface

```typescript
type GrimoireEntry = {
  id: string
  user_id: string
  title: string
  subtitle: string
  content: string
  created_at: string
}

type SanctuaryAccess = {
  isAuthenticated: boolean      // User has valid Supabase session
  isMember: boolean              // User has active membership record
  discountCode: string | null    // Active discount code (e.g., "SANCTUARY10")
  grimoire: GrimoireEntry[] | null  // Last 3 grimoire entries
  loading: boolean               // Async operations in progress
}

function useSanctuaryAccess(): SanctuaryAccess
```

### Hook Logic Flow

```
1. Component mounts
   ↓
2. useSanctuaryAccess() initializes with loading: true
   ↓
3. Call supabase.auth.getSession()
   ↓
4. Session exists?
   ├─ No → Return { isAuthenticated: false, isMember: false, discountCode: null, grimoire: null, loading: false }
   └─ Yes → Continue to step 5
   ↓
5. Query memberships table for active record matching user_id
   ↓
6. Active membership found?
   ├─ No → Return { isAuthenticated: true, isMember: false, discountCode: null, grimoire: null, loading: false }
   └─ Yes → Continue to step 7
   ↓
7. Parallel queries:
   - Fetch last 3 grimoire_entries (ORDER BY created_at DESC LIMIT 3)
   - Fetch active discount_code (WHERE is_active = true)
   ↓
8. Return { isAuthenticated: true, isMember: true, discountCode: <code>, grimoire: <entries>, loading: false }
```

### Implementation

```typescript
// hooks/useSanctuaryAccess.ts
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase/client'

export type GrimoireEntry = {
  id: string
  user_id: string
  title: string
  subtitle: string
  content: string
  created_at: string
}

export type SanctuaryAccess = {
  isAuthenticated: boolean
  isMember: boolean
  discountCode: string | null
  grimoire: GrimoireEntry[] | null
  loading: boolean
}

const DEFAULT_STATE: SanctuaryAccess = {
  isAuthenticated: false,
  isMember: false,
  discountCode: null,
  grimoire: null,
  loading: true,
}

export function useSanctuaryAccess(): SanctuaryAccess {
  const [access, setAccess] = useState<SanctuaryAccess>(DEFAULT_STATE)

  useEffect(() => {
    async function checkAccess() {
      try {
        // Step 1: Check for active session
        const { data: { session }, error: sessionError } = await supabase.auth.getSession()
        
        if (sessionError) {
          console.error('Sanctuary auth check failed:', sessionError)
          setAccess({ ...DEFAULT_STATE, loading: false })
          return
        }

        if (!session) {
          setAccess({ ...DEFAULT_STATE, loading: false })
          return
        }

        const userId = session.user.id

        // Step 2: Check for active membership
        const { data: membership, error: membershipError } = await supabase
          .from('memberships')
          .select('*')
          .eq('user_id', userId)
          .eq('status', 'active')
          .single()

        if (membershipError || !membership) {
          if (membershipError && membershipError.code !== 'PGRST116') {
            // PGRST116 = no rows returned (expected for non-members)
            console.error('Membership query failed:', membershipError)
          }
          setAccess({
            isAuthenticated: true,
            isMember: false,
            discountCode: null,
            grimoire: null,
            loading: false,
          })
          return
        }

        // Step 3: Fetch member-only data in parallel
        const [grimoireResult, discountResult] = await Promise.all([
          supabase
            .from('grimoire_entries')
            .select('*')
            .eq('user_id', userId)
            .order('created_at', { ascending: false })
            .limit(3),
          supabase
            .from('discount_codes')
            .select('code')
            .eq('user_id', userId)
            .eq('is_active', true)
            .single(),
        ])

        // Handle grimoire fetch errors gracefully
        const grimoire = grimoireResult.error 
          ? null 
          : grimoireResult.data

        if (grimoireResult.error) {
          console.error('Grimoire fetch failed:', grimoireResult.error)
        }

        // Handle discount code fetch errors gracefully
        const discountCode = discountResult.error 
          ? null 
          : discountResult.data?.code || null

        if (discountResult.error && discountResult.error.code !== 'PGRST116') {
          console.error('Discount code fetch failed:', discountResult.error)
        }

        setAccess({
          isAuthenticated: true,
          isMember: true,
          discountCode,
          grimoire,
          loading: false,
        })
      } catch (error) {
        console.error('Unexpected error in useSanctuaryAccess:', error)
        setAccess({ ...DEFAULT_STATE, loading: false })
      }
    }

    checkAccess()
  }, [])

  return access
}
```

### Component Behavior on Unlock

#### 1. FeatureCards Component

**Grimoire Card**:

| State | Badge | Body Text | Icon | Button Label | Button Action |
|-------|-------|-----------|------|--------------|---------------|
| Visitor | LOCKED | Blurred | Lock icon | Join to Unlock | → /join |
| Member | None | Clear | None | Open Grimoire | → /sanctuary/grimoire |

**Sanctuary Price Card**:

| State | Badge | Body Text | Discount Code | Button Label | Button Action |
|-------|-------|-----------|---------------|--------------|---------------|
| Visitor | LOCKED | Blurred | Hidden | Join to Unlock | → /join |
| Member | None | Clear | Visible inline | Copy Code | Copy to clipboard |

**Implementation**:

```jsx
// components/FeatureCards.jsx
export function FeatureCards({ access }) {
  const { isMember, discountCode } = access

  return (
    <div id="features" className="grid gap-4 md:grid-cols-3">
      {/* Mirror Card - Always Preview */}
      <FeatureCard
        title="The Mirror"
        badge="PREVIEW"
        description="A private reflection and recommendation—quiet, personal, on-brand."
        buttonLabel="Reveal a Reading (Preview)"
        buttonHref="/#mirror"
        isLocked={false}
      />

      {/* Grimoire Card - Locked for visitors */}
      <FeatureCard
        title="Grimoire"
        badge={isMember ? null : "LOCKED"}
        description="Your saved readings—private, timestamped, and always yours."
        buttonLabel={isMember ? "Open Grimoire" : "Join to Unlock"}
        buttonHref={isMember ? "/sanctuary/grimoire" : "/join"}
        isLocked={!isMember}
      />

      {/* Sanctuary Price Card - Locked for visitors */}
      <FeatureCard
        title="Sanctuary Price"
        badge={isMember ? null : "LOCKED"}
        description={isMember 
          ? `10% off always—shown on every item. Your code: ${discountCode || 'Loading...'}`
          : "10% off always—shown on every item."
        }
        buttonLabel={isMember ? "Copy Code" : "Join to Unlock"}
        buttonHref={isMember ? null : "/join"}
        buttonAction={isMember ? () => copyToClipboard(discountCode) : null}
        isLocked={!isMember}
      />
    </div>
  )
}
```

#### 2. GrimoireSection Component

**Visitor State**:
- Heading: "Recent in your Grimoire" + LOCKED badge
- 3 placeholder cards with blurred text and lock icons
- CTA: "Join Free" → /join

**Member State**:
- Heading: "Recent in your Grimoire" (no badge)
- 3 real grimoire entries from `access.grimoire`
- Each card links to `/sanctuary/grimoire/[id]`
- Lock icons replaced with chevron-right for navigation

**Implementation**:

```jsx
// components/GrimoireSection.jsx
export function GrimoireSection({ access }) {
  const { isMember, grimoire, loading } = access

  if (loading) {
    return <GrimoireSkeleton />
  }

  return (
    <section className="rounded-2xl border border-white/10 bg-white/5 p-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium text-white">
          Recent in your Grimoire
        </h3>
        {!isMember && <Badge variant="locked">LOCKED</Badge>}
      </div>

      {isMember ? (
        <div className="mt-4 space-y-3">
          {grimoire && grimoire.length > 0 ? (
            grimoire.map((entry) => (
              <Link
                key={entry.id}
                href={`/sanctuary/grimoire/${entry.id}`}
                className="flex items-center justify-between rounded-2xl border border-white/10 bg-black/40 px-4 py-3 transition-colors hover:bg-black/60"
              >
                <div>
                  <p className="text-sm font-medium text-white">{entry.title}</p>
                  <p className="text-xs text-white/70">{entry.subtitle}</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-xs uppercase tracking-wider text-white/50">
                    {formatDate(entry.created_at)}
                  </span>
                  <ChevronRight className="h-4 w-4 text-white/40" />
                </div>
              </Link>
            ))
          ) : (
            <p className="text-sm text-white/70">
              Your Grimoire is empty. Readings you save will appear here.
            </p>
          )}
        </div>
      ) : (
        <div className="mt-4 space-y-4">
          <p className="text-sm text-white/70">
            Your Grimoire appears when you join.
          </p>
          <div className="space-y-3">
            {PLACEHOLDER_READINGS.map((reading) => (
              <div
                key={reading.id}
                className="flex items-center justify-between rounded-2xl border border-white/10 bg-black/40 px-4 py-3"
              >
                <div className="space-y-1 blur-[2px] opacity-60">
                  <p className="text-sm font-medium">{reading.title}</p>
                  <p className="text-xs">{reading.subtitle}</p>
                </div>
                <Lock className="h-4 w-4 text-white/40" aria-hidden="true" />
              </div>
            ))}
          </div>
          <Link
            href="/join"
            className="btn-primary inline-flex w-full items-center justify-center rounded-full px-6 py-3 text-sm font-medium sm:w-auto"
          >
            Join Free
          </Link>
        </div>
      )}
    </section>
  )
}

const PLACEHOLDER_READINGS = [
  { id: '001', title: 'Reading Card #001', subtitle: 'Silence is rising tonight.' },
  { id: '002', title: 'Reading Card #002', subtitle: 'Softness is not surrender.' },
  { id: '003', title: 'Reading Card #003', subtitle: 'You don't need to be bright to be seen.' },
]
```

#### 3. StickyJoinBar Component

**Visibility Logic**:

```jsx
// components/StickyJoinBar.jsx
export function StickyJoinBar({ access }) {
  const { isAuthenticated, isMember } = access

  // Hide bar entirely if user is a member
  if (isMember) {
    return null
  }

  const buttonText = isAuthenticated ? "Upgrade to Member" : "JOIN FREE"

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 border-t border-[#c9a96e] bg-[rgba(8,8,15,0.92)] backdrop-blur">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4">
        <p className="text-sm text-white/70">
          {isAuthenticated 
            ? "Unlock all sanctuary features with membership"
            : "Join free to unlock The Grimoire and Sanctuary Price"
          }
        </p>
        <Link
          href="/join"
          className="rounded-full border border-[#c9a96e] bg-transparent px-6 py-2 text-sm font-medium text-[#c9a96e] transition-colors hover:bg-[rgba(201,169,110,0.1)]"
        >
          {buttonText}
        </Link>
      </div>
    </div>
  )
}
```

### Supabase Tables Required

#### memberships

```sql
CREATE TABLE memberships (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  status TEXT NOT NULL CHECK (status IN ('active', 'inactive')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  expires_at TIMESTAMPTZ,
  UNIQUE(user_id)
);

CREATE INDEX idx_memberships_user_id ON memberships(user_id);
CREATE INDEX idx_memberships_status ON memberships(status);

ALTER TABLE memberships ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own membership"
  ON memberships FOR SELECT
  USING (auth.uid() = user_id);
```

#### grimoire_entries

```sql
CREATE TABLE grimoire_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  subtitle TEXT,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_grimoire_user_created ON grimoire_entries(user_id, created_at DESC);

ALTER TABLE grimoire_entries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own grimoire entries"
  ON grimoire_entries FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own grimoire entries"
  ON grimoire_entries FOR INSERT
  WITH CHECK (auth.uid() = user_id);
```

#### discount_codes

```sql
CREATE TABLE discount_codes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  code TEXT NOT NULL UNIQUE,
  percent_off INTEGER NOT NULL CHECK (percent_off > 0 AND percent_off <= 100),
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, is_active) WHERE is_active = TRUE
);

CREATE INDEX idx_discount_codes_user_active ON discount_codes(user_id, is_active);

ALTER TABLE discount_codes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own active discount code"
  ON discount_codes FOR SELECT
  USING (auth.uid() = user_id AND is_active = TRUE);
```

### Out of Scope

The following features are explicitly out of scope for this specification:

1. **Grimoire Entry Creation**: Logic for creating new grimoire entries (separate feature)
2. **Discount Code Generation**: Logic for generating and assigning discount codes (separate feature)
3. **Membership Purchase Flow**: Stripe integration for membership purchases (separate spec)
4. **Grimoire Detail Page**: `/sanctuary/grimoire/[id]` route implementation (separate feature)
5. **Copy to Clipboard Functionality**: Utility function for copying discount code (can use existing library)

### Suggested Agent Hook in Kiro

```yaml
trigger:
  on_file_save:
    pattern: "components/sanctuary/**"
    
action:
  remind: |
    Reminder: Any new sanctuary component that renders locked content should:
    1. Accept `access` prop from useSanctuaryAccess hook
    2. Conditionally render based on `access.isMember`
    3. Apply blur effects and lock icons for non-members
    4. Ensure lock icons have aria-hidden="true"
    5. Test both member and visitor states
```

### Testing Considerations

**Hook Testing**:
- Mock Supabase client responses for all query paths
- Test loading state transitions
- Test error handling (network failures, invalid data)
- Test auth state changes (login/logout during session)

**Component Testing**:
- Test all three states: visitor, authenticated non-member, member
- Test conditional rendering (badges, blur, icons)
- Test button actions (navigation, copy to clipboard)
- Test accessibility (ARIA attributes, keyboard navigation)

**Integration Testing**:
- Test full flow: mount → auth check → membership query → data fetch → render
- Test race conditions (component unmounts during async operations)
- Test real-time auth updates (onAuthStateChange)

