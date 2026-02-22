# Darkroom Preflight Visual Guide

## Complete UI Flow

### Step 1: Initial State
```
┌────────────────────────────────────────────────────────────────┐
│ Shopify Integration                                            │
│                                                                │
│ Automatically processes products tagged with:                  │
│ img:needs-brand + source:faire + dept:objects                 │
│                                                                │
│ ┌────────────────────────────────────────────────────────────┐ │
│ │ GraphQL Search Query:                                      │ │
│ │ tag:img:needs-brand AND tag:source:faire AND dept:objects │ │
│ │ Endpoint: /admin/api/2024-01/graphql.json                 │ │
│ └────────────────────────────────────────────────────────────┘ │
│                                                                │
│ Batch Limit: [1]  [Test (1)] [Normal (20)] [Max (50)]        │
│                                                                │
│ ┌────────────────────────────────────────────────────────────┐ │
│ │              Check Products (1)                            │ │
│ └────────────────────────────────────────────────────────────┘ │
└────────────────────────────────────────────────────────────────┘
```

### Step 2: Loading State
```
┌────────────────────────────────────────────────────────────────┐
│ Batch Limit: [1]  [Test (1)] [Normal (20)] [Max (50)]        │
│                                                                │
│ ┌────────────────────────────────────────────────────────────┐ │
│ │           Checking products...                             │ │
│ └────────────────────────────────────────────────────────────┘ │
└────────────────────────────────────────────────────────────────┘
```

### Step 3: Preflight Results (All Valid)
```
┌────────────────────────────────────────────────────────────────┐
│ Preflight Check: 1 product found                              │
│                                    ✓ 1 will process  ✗ 0 skip │
├────────────────────────────────────────────────────────────────┤
│ Product          │ Handle    │ ID    │ Img │ Tags    │ Status │
├────────────────────────────────────────────────────────────────┤
│ Arcane Kisslock  │ arcane-   │ 12345 │ 3   │ [img:  │ ✓ Will │
│ Bag - Moth       │ kisslock  │       │     │ needs- │ process│
│                  │ -bag-moth │       │     │ brand] │        │
│                  │           │       │     │ [source│        │
│                  │           │       │     │ :faire]│        │
│                  │           │       │     │ [dept: │        │
│                  │           │       │     │ objects│        │
│                  │           │       │     │ ]      │        │
└────────────────────────────────────────────────────────────────┘

                [Cancel]  [Confirm & Start Processing (1 product)]
```

### Step 4: Preflight Results (Mixed)
```
┌────────────────────────────────────────────────────────────────┐
│ Preflight Check: 3 products found                             │
│                                    ✓ 2 will process  ✗ 1 skip │
├────────────────────────────────────────────────────────────────┤
│ Product          │ Handle    │ ID    │ Img │ Tags    │ Status │
├────────────────────────────────────────────────────────────────┤
│ Candle Holder    │ candle-1  │ 12345 │ 3   │ [green] │ ✓ Will │
│                  │           │       │     │         │ process│
├────────────────────────────────────────────────────────────────┤
│ T-Shirt (RED)    │ tshirt-1  │ 12346 │ 2   │ [green] │ ✗ Skip:│
│                  │           │       │     │ [RED:   │ Wardr. │
│                  │           │       │     │ wardr.] │ product│
├────────────────────────────────────────────────────────────────┤
│ Glass Vase       │ vase-1    │ 12347 │ 2   │ [green] │ ✓ Will │
│                  │           │       │     │         │ process│
└────────────────────────────────────────────────────────────────┘

                [Cancel]  [Confirm & Start Processing (2 products)]
```

### Step 5: After Confirmation
```
┌────────────────────────────────────────────────────────────────┐
│ Progress: 1 / 2    ✓ 0    ✗ 0                                 │
│ Processing: Candle Holder                                      │
└────────────────────────────────────────────────────────────────┘
```

## Tag Color Coding

### Required Tags (Green Background)
```
┌──────────────────┐
│ img:needs-brand  │  ← Green background (#e8f5e9)
└──────────────────┘  ← Green text (#2d7a2d)

┌──────────────────┐
│ source:faire     │  ← Green background
└──────────────────┘

┌──────────────────┐
│ dept:objects     │  ← Green background
└──────────────────┘
```

### Danger Tags (Red Background)
```
┌──────────────────┐
│ source:printify  │  ← Red background (#ffebee)
└──────────────────┘  ← Red text (#d32f2f)

┌──────────────────┐
│ dept:wardrobe    │  ← Red background
└──────────────────┘
```

### Other Tags (Gray Background)
```
┌──────────────────┐
│ category:home    │  ← Gray background (#f0f0f0)
└──────────────────┘  ← Gray text (#666)

┌──────────────────┐
│ material:glass   │  ← Gray background
└──────────────────┘
```

## Row Highlighting

### Valid Product (White Background)
```
┌────────────────────────────────────────────────────────────────┐
│ Candle Holder    │ candle-1  │ 12345 │ 3   │ [tags]  │ ✓ Will │
│                  │           │       │     │         │ process│
└────────────────────────────────────────────────────────────────┘
← White background (#fff)
```

### Skipped Product (Light Red Background)
```
┌────────────────────────────────────────────────────────────────┐
│ T-Shirt          │ tshirt-1  │ 12346 │ 2   │ [tags]  │ ✗ Skip:│
│                  │           │       │     │         │ Wardr. │
└────────────────────────────────────────────────────────────────┘
← Light red background (#fff5f5)
```

## Status Indicators

### Will Process (Green)
```
✓ Will process
← Green text (#2d7a2d)
← Bold font weight
```

### Will Skip (Red)
```
✗ Skip: Printify product
← Red text (#d32f2f)
← Smaller font (0.75rem)
```

## Button States

### Check Products Button
```
Normal:
┌────────────────────────────────────────────────────────────────┐
│              Check Products (1)                                │
└────────────────────────────────────────────────────────────────┘
← Dark background (#1a1a1a)
← White text (#f5f5f0)
← Clickable

Loading:
┌────────────────────────────────────────────────────────────────┐
│           Checking products...                                 │
└────────────────────────────────────────────────────────────────┘
← Dark background
← 40% opacity
← Not clickable
```

### Cancel Button
```
┌──────────────┐
│   Cancel     │
└──────────────┘
← White background (#fff)
← Gray text (#404040)
← Gray border (#e8e8e3)
```

### Confirm Button (Enabled)
```
┌────────────────────────────────────────────────────────────────┐
│         Confirm & Start Processing (2 products)                │
└────────────────────────────────────────────────────────────────┘
← Dark background (#1a1a1a)
← White text (#f5f5f0)
← Clickable
```

### Confirm Button (Disabled)
```
┌────────────────────────────────────────────────────────────────┐
│         Confirm & Start Processing (0 products)                │
└────────────────────────────────────────────────────────────────┘
← Dark background
← 40% opacity
← Not clickable
← Cursor: not-allowed
```

## Responsive Layout

### Desktop (>1000px)
```
┌────────────────────────────────────────────────────────────────┐
│ Product (2fr) │ Handle (1.5fr) │ ID (1fr) │ Img │ Tags │ Stat │
│               │                │          │(0.5)│ (2fr)│(1.5) │
└────────────────────────────────────────────────────────────────┘
```

### Tablet (600-1000px)
```
┌────────────────────────────────────────────────────────────────┐
│ Product       │ Handle         │ ID       │ Img │ Tags │ Stat │
│ (smaller)     │ (smaller)      │ (smaller)│     │      │      │
└────────────────────────────────────────────────────────────────┘
← Horizontal scroll if needed
```

### Mobile (<600px)
```
┌────────────────────────────────────────────────────────────────┐
│ Product                                                        │
│ Handle: candle-1                                               │
│ ID: 12345                                                      │
│ Images: 3                                                      │
│ Tags: [img:needs-brand] [source:faire] [dept:objects]         │
│ Status: ✓ Will process                                         │
└────────────────────────────────────────────────────────────────┘
← Stacked layout (future enhancement)
```

## Example: Real Product Data

### Product 1: Valid Faire Object
```
┌────────────────────────────────────────────────────────────────┐
│ Arcane Kisslock Bag - Moth                                     │
│ arcane-kisslock-bag-moth                                       │
│ 8234567890123                                                  │
│ 3 images                                                       │
│ [img:needs-brand] [source:faire] [dept:objects]               │
│ [category:bags] [material:fabric]                             │
│ ✓ Will process                                                 │
└────────────────────────────────────────────────────────────────┘
```

### Product 2: Printify Product (Skipped)
```
┌────────────────────────────────────────────────────────────────┐
│ Custom T-Shirt                                                 │
│ custom-tshirt-1                                                │
│ 8234567890124                                                  │
│ 2 images                                                       │
│ [img:needs-brand] [source:printify] [dept:wardrobe]           │
│ ✗ Skip: Printify product                                      │
└────────────────────────────────────────────────────────────────┘
← Light red background
```

### Product 3: No Images (Skipped)
```
┌────────────────────────────────────────────────────────────────┐
│ Empty Product                                                  │
│ empty-product-1                                                │
│ 8234567890125                                                  │
│ 0 images                                                       │
│ [img:needs-brand] [source:faire] [dept:objects]               │
│ ✗ Skip: No images                                             │
└────────────────────────────────────────────────────────────────┘
← Light red background
```

## Animation & Transitions

### Table Appearance
```
Fade in: 0.2s ease
Slide down: 0.2s ease
```

### Button States
```
Hover: opacity 0.9
Transition: 0.2s ease
```

### Row Hover
```
Background: Slightly darker
Transition: 0.1s ease
```

## Accessibility

### Keyboard Navigation
- Tab through table rows
- Enter/Space on buttons
- Escape to cancel

### Screen Reader
- Table headers announced
- Row status announced
- Button states announced

### Color Contrast
- Green tags: 4.5:1 contrast
- Red tags: 4.5:1 contrast
- Status text: 4.5:1 contrast

---

**Design System**: Brutalist minimalism with data tables
**Inspiration**: Terminal output, spreadsheet clarity
**Focus**: Information density, clear status indicators
