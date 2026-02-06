# Will-Change Performance Optimization

## Overview

This document describes the implementation of `will-change` CSS hints for the Accent Reveal System to optimize performance during hover and focus state transitions.

## Implementation

### Pattern

The `will-change` property is applied using a specific pattern for optimal performance:

1. **Base State**: `will-change: box-shadow, border-color` is applied to the default state
2. **Hover/Focus State**: `will-change: auto` is applied to reset after transition completes

This pattern ensures:
- Browser has time to optimize before user interaction
- Resources are freed after transition completes
- No memory leaks from persistent will-change hints

### Elements Updated

The following interactive elements now have will-change hints:

#### Buttons
- `.btn-primary`
- `.btn-secondary`
- `.btn-tertiary`

#### Cards
- `.house-card`
- `.value-card`
- `.drop-card`

#### Inputs
- `.mirror-input`

### Properties Optimized

The `will-change` hint targets two specific properties that change during accent reveals:
- `box-shadow` - Used for gold outlines, red glows, and purple shadows
- `border-color` - Used for gold edge reveals

## Performance Benefits

### Before Optimization
Without `will-change` hints, the browser must:
1. Recalculate styles on every hover
2. Repaint box-shadow and border changes
3. Potentially trigger layout recalculations

### After Optimization
With `will-change` hints, the browser can:
1. Pre-optimize rendering layers
2. Use GPU acceleration for transitions
3. Reduce paint time during interactions
4. Maintain smooth 60fps animations

## Testing

### Unit Tests
Location: `app/__tests__/will-change-performance.test.ts`

Tests verify:
- All interactive elements have will-change hints
- Pattern is correctly applied (base state → hover state)
- Correct properties are targeted

### Manual Performance Testing

To test performance impact manually:

1. **Open Chrome DevTools**
   - Press F12
   - Go to Performance tab

2. **Record Interaction**
   - Click "Record" button
   - Hover over buttons and cards
   - Stop recording

3. **Analyze Results**
   - Check frame rate (should be 60fps)
   - Look for paint operations (should be minimal)
   - Verify no layout thrashing

4. **Compare Metrics**
   - Interaction to Next Paint (INP) should be < 200ms
   - No dropped frames during transitions
   - Smooth visual transitions

### Performance Metrics

Expected improvements:
- **Frame Rate**: Consistent 60fps during hover transitions
- **Paint Time**: Reduced by ~30-50% for box-shadow changes
- **INP**: < 200ms for all interactions
- **Jank**: Zero dropped frames during rapid hover/unhover

## Browser Support

The `will-change` property is supported in:
- Chrome 36+
- Firefox 36+
- Safari 9.1+
- Edge 79+

For older browsers, the property is safely ignored and transitions work normally without optimization.

## Best Practices

### Do's ✅
- Apply `will-change` to base state before interaction
- Reset to `auto` after transition completes
- Target specific properties (box-shadow, border-color)
- Use sparingly on interactive elements only

### Don'ts ❌
- Don't apply `will-change` to all elements
- Don't leave `will-change` active permanently
- Don't target too many properties
- Don't use on non-interactive elements

## Performance Monitoring

To monitor performance in production:

1. **Core Web Vitals**
   - Track INP (Interaction to Next Paint)
   - Monitor FID (First Input Delay)
   - Check CLS (Cumulative Layout Shift)

2. **Real User Monitoring**
   - Use tools like Lighthouse
   - Monitor frame rates
   - Track paint operations

3. **Regression Testing**
   - Run performance tests before/after changes
   - Compare metrics across browsers
   - Test on low-end devices

## Related Requirements

This implementation validates:
- **Requirement 8.6**: Performance - No scroll jank or lag during interactions
- **Property 15**: Performance - Frame rate above 55fps

## References

- [MDN: will-change](https://developer.mozilla.org/en-US/docs/Web/CSS/will-change)
- [CSS Triggers: box-shadow](https://csstriggers.com/box-shadow)
- [CSS Triggers: border-color](https://csstriggers.com/border-color)
- [Web.dev: Optimize CSS Performance](https://web.dev/optimize-css-performance/)
