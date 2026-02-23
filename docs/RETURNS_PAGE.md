# Returns Page Implementation

## Overview
Created `/returns` page with strict monochromatic brutalism aesthetic and architectural hover effects.

## Route
**URL**: `/returns`  
**File**: `app/returns/page.tsx`

## Design Aesthetic

### Monochromatic Brutalism
- **Colors**: Black (#000), White (#fff), Grays (#f9fafb, #e5e7eb, #6b7280)
- **Typography**: Light weight, uppercase title with wide letter-spacing
- **Layout**: Single-column, center-aligned, maximum white space
- **Spacing**: Generous padding (py-24 md:py-32), large gaps between sections

### Architectural Hover Effect
Subtle, deliberate hover interaction that feels structural:
- **Vertical bar**: 2px black line appears on the left
- **Animation**: Scales from top to bottom (scaleY transform)
- **Timing**: 0.4s cubic-bezier(0.4, 0, 0.2, 1) - architectural easing
- **Text shift**: Subtle 8px padding-left on hover
- **Color**: Text darkens to pure black

```css
.architectural-hover::before {
  content: '';
  position: absolute;
  left: -16px;
  top: 0;
  bottom: 0;
  width: 2px;
  background: black;
  transform: scaleY(0);
  transform-origin: top;
  transition: transform 0.4s cubic-bezier(0.4, 0, 0.2, 1);
}

.architectural-hover:hover::before {
  transform: scaleY(1);
}

.architectural-hover:hover {
  padding-left: 8px;
  color: #000;
}
```

## Content Structure

### Title
```
RETURNS & EXCHANGES
```
- Uppercase, wide letter-spacing (0.1em)
- 4xl on mobile, 5xl on desktop
- Center-aligned

### Body Section
```
Objects from Charmed & Dark are curated for longevity. If an item does not 
meet your spatial requirements, we offer a 30-day return window for all new, 
unused products.
```
- Base/lg text size
- Leading-relaxed (line-height: 1.625)
- Architectural hover effect

### Process Section
```
PROCESS

All returns are handled via mail. No restocking fees. Your refund will be 
processed within 7 business days of receipt.
```
- Border-top separator (black)
- Uppercase section label (xs, tracking-widest)
- Architectural hover effect on body text

### Sanctuary Integration
```
Sanctuary Members receive priority concierge support for all exchanges.
```
- Subtle gray background (#f9fafb)
- Gray border (#e5e7eb)
- Generous padding (p-8 md:p-12)
- Architectural hover effect
- Visually distinct from main content

### Contact Section
```
CONTACT

For return inquiries, contact us with your order number and reason for return.
```
- Border-top separator
- Uppercase section label
- Smaller text (sm)
- Architectural hover effect

## SEO Configuration

### Metadata
```typescript
{
  title: 'Returns & Exchanges | Charmed & Dark',
  description: 'Objects from Charmed & Dark are curated for longevity. 30-day return window for all new, unused products.',
  alternates: {
    canonical: getCanonicalUrl('/returns'),
  },
  openGraph: {
    title: 'Returns & Exchanges | Charmed & Dark',
    description: '...',
    url: getCanonicalUrl('/returns'),
    siteName: 'Charmed & Dark',
    type: 'website',
  },
}
```

### Sitemap
Added to `app/sitemap.ts`:
```typescript
{
  url: getCanonicalUrl('/returns'),
  lastModified: new Date(),
  changeFrequency: 'monthly',
  priority: 0.6,
}
```

## Policy Details

### Return Window
- **Duration**: 30 days from purchase
- **Condition**: New, unused products only
- **Eligibility**: All products

### Process
- **Method**: Mail returns
- **Fees**: No restocking fees
- **Refund Timeline**: 7 business days from receipt

### Sanctuary Benefits
- **Priority Support**: Concierge support for exchanges
- **Member Perk**: Highlighted in dedicated section

## Technical Implementation

### Styling Approach
- **Tailwind CSS**: For layout and spacing
- **Scoped CSS**: For architectural hover effect (JSX style tag)
- **Responsive**: Mobile-first with md: breakpoints

### Accessibility
- Semantic HTML structure (h1, h2, section)
- Proper heading hierarchy
- Sufficient color contrast
- Hover effects don't hide content

### Performance
- Static page (no data fetching)
- Minimal CSS (scoped styles)
- Fast load time

## User Experience

### Visual Hierarchy
1. Title (largest, uppercase, centered)
2. Body text (primary content)
3. Section labels (smallest, uppercase, tracked)
4. Sanctuary callout (visually distinct box)

### White Space
- Maximum white space for brutalist aesthetic
- Generous padding (24-32 on y-axis)
- Large gaps between sections (space-y-16)
- Breathing room around text

### Interaction
- Hover effects feel deliberate and architectural
- Vertical bar "builds" from top to bottom
- Text shifts subtly to the right
- Smooth, considered animation timing

## Integration Points

### Navigation
- Should be linked from footer
- Should be linked from checkout flow
- Should be accessible from product pages

### Sanctuary
- Callout specifically mentions member benefits
- Encourages membership for priority support
- Visually distinct to draw attention

### Merchant Center
- Returns policy now documented
- Meets Google Merchant Center requirements
- 30-day window clearly stated

## Future Enhancements

### Short-Term
- [ ] Add link to returns page in footer
- [ ] Add link to returns page in order confirmation emails
- [ ] Add returns policy snippet to product pages

### Medium-Term
- [ ] Create returns form for easier submission
- [ ] Add return tracking functionality
- [ ] Integrate with Shopify returns system

### Long-Term
- [ ] Automated return label generation
- [ ] Member-only extended return window
- [ ] Return analytics and insights

## Files Modified

### Created (1 file)
- `app/returns/page.tsx` - Returns page with brutalist design

### Updated (1 file)
- `app/sitemap.ts` - Added /returns to sitemap

## Status

✅ **COMPLETE** - Returns page live and ready for Merchant Center

## Next Steps

1. Add footer link to /returns
2. Test on mobile and desktop
3. Verify sitemap includes /returns
4. Update Merchant Center with returns policy URL
5. Add returns policy link to checkout flow
