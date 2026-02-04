# Task 3.4: Card Accent Timing Coordination - Implementation Summary

## Overview
Successfully coordinated the timing for all three card accent reveals (gold, red, purple) across all card types to ensure they appear and disappear simultaneously with asymmetric timing.

## Changes Made

### 1. Coordinated Fade-Out Timing (Slower)
Updated all three card types to use `var(--transition-reveal-out)` (500ms) for fade-out:
- `.house-card`
- `.value-card`
- `.drop-card`

**Before:**
```css
transition: 
  border-color 400ms ease,
  border-bottom-color 400ms ease,
  background 400ms ease,
  box-shadow 400ms ease,
  transform 400ms ease;
```

**After:**
```css
/* Coordinated fade-out timing (slower) */
transition: 
  border-color var(--transition-reveal-out) ease,
  border-bottom-color var(--transition-reveal-out) ease,
  background var(--transition-reveal-out) ease,
  box-shadow var(--transition-reveal-out) ease,
  transform var(--transition-reveal-out) ease;
```

### 2. Coordinated Fade-In Timing (Faster)
Added explicit `transition-duration: 400ms` to all hover states to ensure all three accents appear simultaneously:

```css
.house-card:hover,
.value-card:hover,
.drop-card:hover {
  /* ... accent styles ... */
  /* Coordinated fade-in timing (faster) - all three accents appear simultaneously */
  transition-duration: 400ms;
}
```

### 3. Simultaneous Accent Reveals
All three accents are applied in the hover state with the same timing:
- **Gold**: `border-bottom-color: var(--accent-gold-edge)` (bottom edge glow)
- **Red**: `background: color-mix(...)` with `var(--accent-red-warmth)` (background undertone)
- **Purple**: `box-shadow: 0 8px 32px var(--accent-purple-shadow)` (shadow depth)

## Timing Specification

| State | Duration | Token | Value |
|-------|----------|-------|-------|
| Idle → Hover (Fade-in) | 400ms | Explicit | 400ms |
| Hover → Idle (Fade-out) | 500ms | `--transition-reveal-out` | 500ms |

## Requirements Validated

✅ **Requirement 5.5**: All three accents appear together as a unified effect
✅ **Requirement 5.6**: Coordinated timing ensures smooth, simultaneous appearance and disappearance
✅ **Asymmetric Timing**: Fade-in (400ms) is faster than fade-out (500ms) for intentional feel

## Visual Verification

The implementation can be verified by:
1. Running `npm run dev` and navigating to http://localhost:3000
2. Hovering over any card in:
   - The House section (`.house-card`)
   - Sanctuary Value section (`.value-card`)
   - Drops section (`.drop-card`)
3. Observing that:
   - Gold bottom edge, red background, and purple shadow all appear simultaneously
   - Fade-in takes 400ms
   - Fade-out takes 500ms (slower, more intentional)

## Technical Notes

- All transitions use `ease` timing function for smooth, natural motion
- The `transition-duration` override in hover state ensures consistent fade-in across all properties
- CSS custom property tokens ensure maintainability and consistency
- Fallback gradients provided for browsers without `color-mix()` support
