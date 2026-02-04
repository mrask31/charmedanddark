# Design Document: Accent Reveal System

## Overview

The Accent Reveal System is a CSS-based interaction design system that reveals three coordinated accent colors (gold, deep red, deep purple) only when users engage with elements. This system creates a calm, intentional, and ceremonial user experience that reinforces the Charmed & Dark brand philosophy: "You don't have to be loud."

The system is built entirely with CSS custom properties and transitions, ensuring optimal performance and maintainability. It integrates seamlessly with the existing globals.css color system and scales across all pages without per-page customization.

## Architecture

### System Components

1. **CSS Custom Properties Layer**: Defines all accent color tokens and transition durations
2. **Base Interaction Styles**: Applies accent reveals to core UI elements (buttons, cards, inputs)
3. **Scroll Reveal Layer**: Handles section entry reveals using Intersection Observer
4. **Accessibility Layer**: Respects prefers-reduced-motion and ensures keyboard/touch support

### Design Principles

- **Earned Color**: Accent colors only appear through user engagement (hover, focus, press)
- **Layered Reveals**: Multiple accents can appear together but gold is always primary/dominant
- **Asymmetric Timing**: Fade-in is faster (300ms), fade-out is slower (500ms) to feel intentional
- **Performance First**: CSS-only solutions except for scroll reveals
- **Accessibility Always**: Keyboard navigation and reduced-motion support built-in

## Components and Interfaces

### 1. CSS Custom Properties System

The system extends the existing `:root` variables in `globals.css` with new accent reveal tokens:

```css
:root {
  /* Gold Accent Tokens - Recognition */
  --accent-gold-edge: rgba(180, 150, 100, 0.5);
  --accent-gold-edge-strong: rgba(180, 150, 100, 0.8);
  --accent-gold-glow: rgba(180, 150, 100, 0.3);
  
  /* Red Accent Tokens - Invitation */
  --accent-red-glow: rgba(139, 0, 0, 0.15);
  --accent-red-warmth: rgba(139, 0, 0, 0.08);
  --accent-red-deep: rgba(139, 0, 0, 0.25);
  
  /* Purple Accent Tokens - Depth */
  --accent-purple-shadow: rgba(75, 45, 75, 0.12);
  --accent-purple-depth: rgba(75, 45, 75, 0.08);
  
  /* Transition Duration Tokens */
  --transition-reveal-in: 300ms;
  --transition-reveal-out: 500ms;
  --transition-reveal-fast: 150ms;
  --transition-reveal-reduced: 120ms;
}
```

### 2. Button Accent Reveals

Buttons receive layered accent reveals: gold outline (primary) + red internal glow (subordinate).

**Default State**: Dark surface, no accents visible
**Hover State**: Gold outline fades in + red glow appears beneath
**Active State**: Gold brightens + red deepens briefly
**Focus State**: Same as hover (for keyboard navigation)

```css
.btn-primary,
.btn-secondary {
  position: relative;
  transition: 
    border-color var(--transition-reveal-in) ease,
    box-shadow var(--transition-reveal-in) ease,
    background var(--transition-reveal-in) ease;
}

/* Gold outline on hover/focus */
.btn-primary:hover,
.btn-primary:focus-visible {
  border-color: var(--accent-gold-edge);
  box-shadow: 
    0 0 0 1px var(--accent-gold-edge),
    0 0 12px var(--accent-red-glow);
}

/* Active state - brief intensification */
.btn-primary:active {
  border-color: var(--accent-gold-edge-strong);
  box-shadow: 
    0 0 0 1px var(--accent-gold-edge-strong),
    0 0 16px var(--accent-red-deep);
  transition-duration: var(--transition-reveal-fast);
}
```

### 3. Card Accent Reveals

Cards receive triple-layered reveals: gold bottom edge + red background undertone + purple shadow depth.

**Default State**: Matte dark surface, subtle border
**Hover State**: All three accents reveal simultaneously
**Coordination**: Gold is most visible, red is subtle, purple is almost imperceptible

```css
.house-card,
.value-card,
.drop-card {
  position: relative;
  transition: 
    border-color var(--transition-reveal-in) ease,
    box-shadow var(--transition-reveal-in) ease,
    background var(--transition-reveal-in) ease;
}

.house-card:hover,
.value-card:hover,
.drop-card:hover {
  /* Gold bottom edge glow */
  border-bottom-color: var(--accent-gold-edge);
  
  /* Red background undertone */
  background: linear-gradient(
    180deg,
    var(--black-surface) 0%,
    color-mix(in srgb, var(--black-surface) 95%, var(--accent-red-warmth)) 100%
  );
  
  /* Purple shadow depth */
  box-shadow: 
    0 8px 32px var(--accent-purple-shadow),
    0 0 0 1px var(--edge-hover);
}
```

### 4. Mirror Input Reveals

The Mirror input receives red glow (invitation) + gold focus ring (recognition).

**Idle State**: Dark surface, minimal border
**Focus State**: Red glow inside container + gold underline/ring

```css
.mirror-input {
  position: relative;
  transition: 
    border-color var(--transition-reveal-in) ease,
    box-shadow var(--transition-reveal-in) ease;
}

.mirror-input:focus {
  /* Gold focus ring */
  border-color: var(--accent-gold-edge);
  outline: 2px solid var(--accent-gold-edge);
  outline-offset: 2px;
  
  /* Red internal glow */
  box-shadow: 
    inset 0 0 20px var(--accent-red-glow),
    0 0 0 1px var(--accent-gold-edge);
}
```

### 5. Mirror Reading Card Reveals

When a reading card appears, it receives all three accents to signal importance.

**Appearance**: Gold border + purple shadow + red background warmth

```css
.reading-card {
  border: 1px solid var(--accent-gold-edge);
  box-shadow: 
    0 12px 48px var(--accent-purple-shadow),
    0 0 0 1px var(--accent-gold-edge);
  background: linear-gradient(
    180deg,
    color-mix(in srgb, var(--black-surface) 98%, var(--accent-red-warmth)) 0%,
    var(--black-surface) 100%
  );
}
```

### 6. Section Entry Reveals

Sections reveal their presence through opacity and contrast changes when entering viewport.

**Implementation**: Intersection Observer + CSS class toggle
**Effect**: Purple gradient blooms + gold dividers brighten
**Constraint**: No movement/translation, only presence changes

```javascript
// Intersection Observer for section reveals
const observerOptions = {
  threshold: 0.2,
  rootMargin: '0px 0px -100px 0px'
};

const sectionObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('section-revealed');
    }
  });
}, observerOptions);

// Observe all major sections
document.querySelectorAll('section').forEach(section => {
  sectionObserver.observe(section);
});
```

```css
section {
  position: relative;
  opacity: 0.85;
  transition: opacity var(--transition-reveal-in) ease;
}

section.section-revealed {
  opacity: 1;
}

/* Purple gradient bloom behind section */
section::before {
  content: '';
  position: absolute;
  inset: -20%;
  background: radial-gradient(
    ellipse at center,
    var(--accent-purple-depth) 0%,
    transparent 60%
  );
  opacity: 0;
  transition: opacity var(--transition-reveal-in) ease;
  pointer-events: none;
  z-index: -1;
}

section.section-revealed::before {
  opacity: 1;
}
```

### 7. Accessibility Layer

Respects `prefers-reduced-motion` and ensures keyboard/touch support.

```css
@media (prefers-reduced-motion: reduce) {
  :root {
    --transition-reveal-in: var(--transition-reveal-reduced);
    --transition-reveal-out: var(--transition-reveal-reduced);
    --transition-reveal-fast: var(--transition-reveal-reduced);
  }
  
  /* Disable section entry reveals */
  section::before {
    display: none;
  }
  
  /* Disable looping/flickering effects */
  @keyframes smokeDrift {
    0%, 100% { transform: none; }
  }
}
```

**Touch Device Support**: Focus and press states activate reveals

```css
/* Touch devices: activate on focus/press */
@media (hover: none) and (pointer: coarse) {
  .btn-primary:focus,
  .btn-primary:active,
  .house-card:focus-within,
  .house-card:active {
    /* Apply same styles as hover */
  }
}
```

## Data Models

No data models required - this is a pure CSS/interaction design system.

## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system—essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

### Property 1: Gold Accent Dominance
*For any* interactive element with multiple accent reveals, the gold accent should always be the most visible (highest opacity or strongest visual presence) compared to red and purple accents.
**Validates: Requirements 9.1**

### Property 2: Idle State Color Absence
*For any* interactive element (button, card, input) in its default/idle state, no accent colors (gold, red, or purple) should be visible above their base threshold opacity.
**Validates: Requirements 4.1, 5.1, 9.3**

### Property 3: Asymmetric Transition Timing
*For any* accent reveal transition on any element, the fade-out duration should be longer than or equal to the fade-in duration.
**Validates: Requirements 1.4, 4.5**

### Property 4: Gold Glow on Card Hover
*For any* card element, when hovered, a gold glow should appear on the bottom edge within 400ms.
**Validates: Requirements 1.2, 5.2**

### Property 5: Purple Shadow on Card Hover
*For any* card element, when hovered, the shadow should deepen with a purple tint.
**Validates: Requirements 3.1, 5.4**

### Property 6: Red Background Undertone on Card Hover
*For any* card element, when hovered, the background should lift with a slight red undertone.
**Validates: Requirements 2.3, 5.3**

### Property 7: Button Accent Coordination
*For any* button element, when hovered, both gold outline and red internal glow should fade in simultaneously.
**Validates: Requirements 4.2**

### Property 8: Button Active State Intensification
*For any* button element, when in active state, the gold outline should brighten and the red glow should deepen briefly.
**Validates: Requirements 4.3**

### Property 9: Button Text Color Neutrality
*For any* button element in any interaction state (idle, hover, focus, active), the text color should remain neutral (white/off-white).
**Validates: Requirements 4.6**

### Property 10: Card Accent Synchronization
*For any* card element, all three accent reveals (gold, red, purple) should appear and disappear together with similar transition start times.
**Validates: Requirements 5.6**

### Property 11: Reduced Motion Compliance
*For any* user with prefers-reduced-motion enabled, all transition durations should be 120ms or less.
**Validates: Requirements 8.1**

### Property 12: Reduced Motion Color Preservation
*For any* user with prefers-reduced-motion enabled, accent colors should still appear in their final states with minimal transitions.
**Validates: Requirements 8.3**

### Property 13: Keyboard Navigation Parity
*For any* interactive element, the accent reveals shown on keyboard focus should be equivalent to the accent reveals shown on hover.
**Validates: Requirements 8.7**

### Property 14: Touch Device Activation
*For any* touch device interaction, accent reveals should activate on focus or press states without requiring hover capability.
**Validates: Requirements 8.8**

### Property 15: Performance - No Scroll Jank
*For any* user interaction that triggers accent reveals, the frame rate should remain above 55fps with no visible scroll lag or jank.
**Validates: Requirements 8.6**

### Property 16: CSS Token Usage
*For any* accent color implementation, the color value should reference a CSS custom property token rather than a hardcoded RGBA value.
**Validates: Requirements 10.7**

### Property 17: Section Reveal Presence Only
*For any* section entry reveal effect, the visual changes should only affect opacity, contrast, shadow intensity, or border intensity, never position or transform properties.
**Validates: Requirements 7.4**

### Property 18: Section Reveal Completion
*For any* section that has fully entered the viewport, all accent reveals should settle to their resting state with no ongoing transitions.
**Validates: Requirements 7.3**

### Property 19: Gold Edge Constraint
*For any* gold accent reveal, the gold color should only appear in border, outline, or box-shadow CSS properties, never as background fills covering large areas.
**Validates: Requirements 1.5**

### Property 20: Purple Shadow Exclusivity
*For any* purple accent usage, the purple color should only appear in box-shadow or background-gradient CSS properties, never as border-color or color (text) properties.
**Validates: Requirements 3.4**

### Property 21: Red Accent Saturation Constraint
*For any* red accent implementation, the saturation value should remain low (muted) and never appear as aggressive or bright fills.
**Validates: Requirements 2.5**

### Property 22: Purple Accent Imperceptibility
*For any* purple accent implementation, the opacity should remain very low to ensure the accent is almost imperceptible.
**Validates: Requirements 3.3**

### Property 23: Accent Color Text Exclusion
*For any* element, accent colors (gold, red, purple) should not be used as text colors except for very specific cases like product names.
**Validates: Requirements 9.5**

### Property 24: Color Saturation Constraint
*For any* accent color implementation, the saturation value should be muted and low, never neon or highly saturated.
**Validates: Requirements 9.4**

## Error Handling

### Invalid CSS Custom Property Fallbacks

If a CSS custom property is not defined, the system should gracefully degrade:

```css
.btn-primary:hover {
  border-color: var(--accent-gold-edge, rgba(180, 150, 100, 0.5));
  box-shadow: 
    0 0 0 1px var(--accent-gold-edge, rgba(180, 150, 100, 0.5)),
    0 0 12px var(--accent-red-glow, rgba(139, 0, 0, 0.15));
}
```

### Browser Compatibility

- **CSS Custom Properties**: Supported in all modern browsers (IE11 not supported)
- **color-mix()**: Fallback to solid colors for older browsers
- **Intersection Observer**: Polyfill or graceful degradation for older browsers

```css
/* Fallback for browsers without color-mix support */
@supports not (background: color-mix(in srgb, black, red)) {
  .house-card:hover {
    background: var(--black-elevated);
  }
}
```

### Performance Safeguards

- **Transition Throttling**: Limit concurrent transitions to prevent jank
- **Will-Change Hints**: Use sparingly to avoid memory issues

```css
.house-card:hover {
  will-change: box-shadow, border-color;
}

.house-card {
  will-change: auto; /* Reset after transition */
}
```

## Testing Strategy

### Dual Testing Approach

The Accent Reveal System requires both **unit tests** and **property-based tests** for comprehensive coverage:

- **Unit tests**: Verify specific examples, edge cases, and error conditions
- **Property tests**: Verify universal properties across all inputs
- Both are complementary and necessary

### Unit Testing Focus

Unit tests should focus on:
- Specific CSS class applications and computed styles
- Interaction state transitions (idle → hover → active → idle)
- Reduced-motion media query behavior
- Touch device media query behavior
- Specific element examples (primary button, house card, mirror input)

**Example Unit Tests**:
```javascript
describe('Button Accent Reveals', () => {
  it('should have no gold border in idle state', () => {
    const button = document.querySelector('.btn-primary');
    const styles = getComputedStyle(button);
    expect(styles.borderColor).not.toContain('180, 150, 100');
  });
  
  it('should reveal gold border on hover', () => {
    const button = document.querySelector('.btn-primary');
    button.dispatchEvent(new MouseEvent('mouseenter'));
    const styles = getComputedStyle(button);
    expect(styles.borderColor).toContain('180, 150, 100');
  });
});
```

### Property-Based Testing Configuration

- **Library**: Use `fast-check` for JavaScript/TypeScript property-based testing
- **Minimum Iterations**: 100 runs per property test
- **Tag Format**: Each test must reference its design property

**Example Property Test**:
```javascript
import fc from 'fast-check';

// Feature: accent-reveal-system, Property 1: Gold Accent Dominance
describe('Property 1: Gold Accent Dominance', () => {
  it('gold accent should always be most visible in multi-accent reveals', () => {
    fc.assert(
      fc.property(
        fc.constantFrom('.house-card', '.value-card', '.drop-card'),
        (selector) => {
          const element = document.querySelector(selector);
          element.dispatchEvent(new MouseEvent('mouseenter'));
          
          const styles = getComputedStyle(element);
          const goldOpacity = extractOpacity(styles.borderBottomColor);
          const redOpacity = extractOpacity(styles.backgroundColor);
          const purpleOpacity = extractOpacity(styles.boxShadow);
          
          return goldOpacity >= redOpacity && goldOpacity >= purpleOpacity;
        }
      ),
      { numRuns: 100 }
    );
  });
});
```

### Visual Regression Testing

Use visual regression tools to catch unintended accent reveal changes:
- **Tool**: Percy, Chromatic, or BackstopJS
- **Coverage**: All interactive states (idle, hover, focus, active)
- **Viewports**: Desktop, tablet, mobile

### Manual Testing Checklist

- [ ] Test all button types (primary, secondary, tertiary)
- [ ] Test all card types (house, value, drop, reading)
- [ ] Test Mirror input focus states
- [ ] Test section entry reveals on scroll
- [ ] Test with keyboard navigation (Tab, Enter, Space)
- [ ] Test on touch devices (iOS Safari, Android Chrome)
- [ ] Test with prefers-reduced-motion enabled
- [ ] Test in different browsers (Chrome, Firefox, Safari, Edge)
- [ ] Verify no scroll jank or performance issues
- [ ] Verify color coordination (gold dominant, red/purple subordinate)

### Performance Testing

- **Metric**: Interaction to Next Paint (INP) should be < 200ms
- **Tool**: Chrome DevTools Performance panel
- **Test**: Rapid hover/focus state changes should not cause jank
- **Baseline**: Measure before and after implementation

## Implementation Notes

### Integration with Existing Styles

The accent reveal system extends the existing `globals.css` without breaking current styles:

1. **Add new CSS custom properties** to the `:root` block
2. **Enhance existing selectors** with accent reveal styles
3. **Preserve existing hover states** where they don't conflict
4. **Add new utility classes** for section reveals

### Migration Strategy

1. **Phase 1**: Add CSS custom properties and test in isolation
2. **Phase 2**: Apply button accent reveals (highest impact)
3. **Phase 3**: Apply card accent reveals
4. **Phase 4**: Apply Mirror input reveals
5. **Phase 5**: Implement section entry reveals
6. **Phase 6**: Add accessibility layer and polish

### Browser Support

- **Target**: Modern browsers (Chrome 90+, Firefox 88+, Safari 14+, Edge 90+)
- **Graceful Degradation**: Older browsers see base styles without accent reveals
- **No Polyfills Required**: System works without JavaScript (except section reveals)
