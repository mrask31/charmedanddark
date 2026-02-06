# Sanctuary Ambience Specification

**Version**: 1.0  
**Status**: Locked  
**Last Updated**: February 5, 2026

---

## 1. Purpose

Sanctuary ambience exists to provide temporal context through environmental variation. It responds to time of day, date, and session duration only.

Ambience must never:
- Interpret user input or behavior
- Respond to user actions or presence
- Infer emotion, mood, or intent
- Personalize based on history or data
- Simulate awareness or intelligence
- React to Mirror usage or Grimoire content

The Sanctuary may respond to time, not to people.

---

## 2. Ambient State Model

Ambience operates in four deterministic states based on local time of day. States transition gradually over 30-minute windows.

### Dawn (5:00 AM - 8:00 AM)

**Time Window**: 05:00:00 - 07:59:59 local time

**Visual Adjustments**:
- Background: `#0A0A0A` (black-gloss)
- Accent opacity: 0.6 (reduced from baseline)
- Shadow depth: 0.7 (lighter than night)
- Glow intensity: 0.5 (subdued)

**Motion Constraints**:
- Animation speed: 0.8x baseline
- Frequency: Every 180 seconds
- Intensity: Minimal (translate range ±2%)

### Day (8:00 AM - 5:00 PM)

**Time Window**: 08:00:00 - 16:59:59 local time

**Visual Adjustments**:
- Background: `#0F0F0F` (black-surface)
- Accent opacity: 0.5 (minimal)
- Shadow depth: 0.6 (lightest state)
- Glow intensity: 0.4 (most subdued)

**Motion Constraints**:
- Animation speed: 0.7x baseline
- Frequency: Every 240 seconds
- Intensity: Minimal (translate range ±1.5%)

### Dusk (5:00 PM - 9:00 PM)

**Time Window**: 17:00:00 - 20:59:59 local time

**Visual Adjustments**:
- Background: `#0A0A0A` (black-gloss)
- Accent opacity: 0.8 (elevated)
- Shadow depth: 0.85 (deepening)
- Glow intensity: 0.7 (warming)

**Motion Constraints**:
- Animation speed: 0.9x baseline
- Frequency: Every 150 seconds
- Intensity: Moderate (translate range ±2.5%)

### Night (9:00 PM - 5:00 AM)

**Time Window**: 21:00:00 - 04:59:59 local time

**Visual Adjustments**:
- Background: `#000000` (black-void)
- Accent opacity: 1.0 (full intensity)
- Shadow depth: 1.0 (deepest)
- Glow intensity: 0.9 (warmest)

**Motion Constraints**:
- Animation speed: 1.0x baseline
- Frequency: Every 120 seconds
- Intensity: Full (translate range ±3%)

### State Transitions

Transitions between states occur linearly over 30 minutes at state boundaries:
- Dawn → Day: 07:30 - 08:00
- Day → Dusk: 16:30 - 17:00
- Dusk → Night: 20:30 - 21:00
- Night → Dawn: 04:30 - 05:00

During transitions, all values interpolate linearly between states.

---

## 3. Light & Presence Rules

### Allowed Light Sources

Light effects are limited to:
- Background gradients (radial, elliptical)
- Border glows (gold, red accents)
- Shadow depth (inset, drop)
- Opacity adjustments

### Light Behavior Rules

1. **Slow Change Only**
   - Minimum transition duration: 300ms
   - Maximum transition duration: 500ms
   - No instant changes except on page load

2. **No Reaction to User**
   - Light may not respond to mouse position
   - Light may not respond to scroll position
   - Light may not respond to focus or hover
   - Light may not respond to input or interaction

3. **No Attention Behaviors**
   - No pulsing or breathing effects
   - No flickering or strobing
   - No directional changes based on user location
   - No intensity changes based on user activity

4. **Time-Based Only**
   - Light adjustments tied exclusively to ambient state
   - Changes occur on state transitions only
   - No dynamic or reactive light sources

### Prohibited Light Behaviors

- Pulsing in response to user presence
- Brightening on hover or focus
- Dimming based on inactivity
- Following cursor or gaze
- Reacting to audio or input
- Simulating "awareness" or "attention"

---

## 4. Motion & Stillness Constraints

### Allowed Motion

Motion is limited to ambient background layers only:
- Slow drift animations (smoke, gradient layers)
- Rotation or scale adjustments (≤2% range)
- Translation (≤3% range)

### Motion Parameters

**Maximum Animation Frequency**:
- Dawn: 1 cycle per 180 seconds
- Day: 1 cycle per 240 seconds
- Dusk: 1 cycle per 150 seconds
- Night: 1 cycle per 120 seconds

**Speed Constraints**:
- Minimum duration: 120 seconds per cycle
- Maximum duration: 240 seconds per cycle
- Easing: `ease-in-out` only

**Intensity Constraints**:
- Maximum translate: ±3%
- Maximum scale: 0.98 - 1.02
- Maximum rotation: ±2 degrees

### Prohibited Motion

1. **Interaction-Based Motion**
   - No parallax effects tied to scroll
   - No motion triggered by mouse movement
   - No motion triggered by hover or focus
   - No motion triggered by input or clicks

2. **Wake-Up Effects**
   - No "coming alive" on page load
   - No acceleration based on user activity
   - No deceleration based on inactivity
   - No motion that implies awareness

3. **Reactive Behaviors**
   - No motion responding to user presence
   - No motion responding to time spent on page beyond session duration
   - No motion responding to content or data
   - No motion responding to external events

### Stillness Requirements

- Motion must be optional (respects `prefers-reduced-motion`)
- Motion must be subtle (never demands attention)
- Motion must be continuous (no start/stop based on user)
- Motion must be deterministic (same time = same state)

---

## 5. Implementation Constraints

### Server-Safe Defaults

All ambience must render correctly on server:
- Initial state determined by server time
- No client-side hydration required for base state
- Graceful degradation if JavaScript disabled

### Deterministic Behavior

Given the same inputs, ambience must produce identical output:
- Same local time → same ambient state
- Same date → same seasonal adjustments (if implemented)
- Same session duration → same motion phase

No randomness, no variation, no personalization.

### State Calculation

```typescript
function getAmbientState(localTime: Date): AmbientState {
  const hour = localTime.getHours();
  
  if (hour >= 5 && hour < 8) return 'dawn';
  if (hour >= 8 && hour < 17) return 'day';
  if (hour >= 17 && hour < 21) return 'dusk';
  return 'night';
}
```

### Accessibility Considerations

1. **Reduced Motion**
   - Respect `prefers-reduced-motion: reduce`
   - Disable all animations when set
   - Maintain visual state without motion

2. **Color Contrast**
   - All text must meet WCAG AA standards in all states
   - Minimum contrast ratio: 4.5:1 for body text
   - Minimum contrast ratio: 3:1 for large text

3. **Focus Indicators**
   - Focus indicators must remain visible in all states
   - Focus indicators must not be obscured by ambience
   - Focus indicators must meet contrast requirements

### Performance Constraints

- Maximum 2 background layers with animation
- CSS transforms only (no layout thrashing)
- `will-change` used sparingly and removed after transition
- No JavaScript-driven animations for ambience

---

## 6. Never-Change Rules

The following rules must never be violated by future contributors:

1. **No User Interpretation**
   - Ambience must never respond to user input, behavior, or data
   - Ambience must never infer emotion, mood, or intent
   - Ambience must never personalize based on history

2. **Time-Based Only**
   - Ambience may only respond to local time, date, or session duration
   - No other inputs are permitted
   - No external data sources

3. **No Reactive Behavior**
   - Ambience must not react to user presence or interaction
   - Ambience must not simulate awareness or intelligence
   - Ambience must not change based on user activity

4. **Deterministic Output**
   - Same inputs must always produce same output
   - No randomness, no variation, no A/B testing
   - Behavior must be predictable and reproducible

5. **Accessibility First**
   - Motion must be optional
   - Contrast must be maintained
   - Focus must remain visible

6. **Performance Boundaries**
   - Maximum 2 animated layers
   - CSS transforms only
   - No JavaScript-driven ambience animations

7. **No Expansion**
   - Do not add new inputs
   - Do not add reactive behaviors
   - Do not add personalization
   - Do not add intelligence

---

## Enforcement

This specification is locked. Any proposed change that violates these rules must be rejected.

If ambience behavior is unclear, default to stillness.

If a feature requires user interpretation, it does not belong in ambience.

The Sanctuary may respond to time, not to people.

---

**End of Specification**
