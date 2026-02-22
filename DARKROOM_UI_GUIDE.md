# Darkroom UI Guide - Automated Mode

## Current UI Layout

```
┌────────────────────────────────────────────────────────────────┐
│                        The Darkroom                            │
│              Automated Image Processing Pipeline               │
└────────────────────────────────────────────────────────────────┘

┌─────────────────────┬─────────────────────┐
│  Automated (Shopify) │  Manual (CSV)      │  ← Mode Toggle
└─────────────────────┴─────────────────────┘

┌────────────────────────────────────────────────────────────────┐
│ Shopify Integration                                            │
│                                                                │
│ Automatically processes products tagged with:                  │
│ img:needs-brand + source:faire + dept:objects                 │
│                                                                │
│ ┌────────────────────────────────────────────────────────────┐ │
│ │ GraphQL Search Query:                                      │ │
│ │ ┌────────────────────────────────────────────────────────┐ │ │
│ │ │ tag:img:needs-brand AND tag:source:faire AND ...      │ │ │
│ │ └────────────────────────────────────────────────────────┘ │ │
│ │ Endpoint: /admin/api/2024-01/graphql.json                 │ │
│ └────────────────────────────────────────────────────────────┘ │
│                                                                │
│ Batch Limit: [  1  ]                                          │
│ ┌──────────┬──────────────┬──────────┐                        │
│ │ Test (1) │ Normal (20)  │ Max (50) │  ← Preset Buttons     │
│ └──────────┴──────────────┴──────────┘                        │
│ Start with 1 to test, then increase. Maximum: 50 products.    │
│                                                                │
│ ┌────────────────────────────────────────────────────────────┐ │
│ │         Run Darkroom (1 product)                           │ │
│ └────────────────────────────────────────────────────────────┘ │
└────────────────────────────────────────────────────────────────┘

┌────────────────────────────────────────────────────────────────┐
│ Progress: 0 / 1    ✓ 0    ✗ 0                                 │
│ Processing: Arcane Kisslock Bag - Moth                        │
└────────────────────────────────────────────────────────────────┘

┌────────────────────────────────────────────────────────────────┐
│ Results                                                        │
│ ┌────────────────────────────────────────────────────────────┐ │
│ │ Arcane Kisslock Bag - Moth                      success    │ │
│ │ arcane-kisslock-bag-moth                                   │ │
│ │ Background: stone • Images: 3                              │ │
│ └────────────────────────────────────────────────────────────┘ │
└────────────────────────────────────────────────────────────────┘

┌────────────────────────────────────────────────────────────────┐
│ How It Works                                                   │
│ 1. Fetch: Queries Shopify for products with required tags     │
│ 2. AI Selection: Gemini chooses best background               │
│ 3. Processing: Remove background, composite, optimize         │
│ 4. Upload: Branded images uploaded back to Shopify            │
│ 5. Tagging: Adds img:branded + bg:type, removes needs-brand   │
└────────────────────────────────────────────────────────────────┘

┌────────────────────────────────────────────────────────────────┐
│ Admin Debug Info                                               │
│ Logged in as:        admin@example.com                         │
│ Admin status:        ✓ Admin                                   │
│ Env var used:        NEXT_PUBLIC_ADMIN_EMAILS                  │
│ Admin whitelist:     admin@example.com                         │
└────────────────────────────────────────────────────────────────┘
```

## Component Breakdown

### 1. Header
- Title: "The Darkroom"
- Subtitle: "Automated Image Processing Pipeline"
- Font: Crimson Pro (serif) for title, Inter (sans-serif) for subtitle

### 2. Mode Toggle
- Two buttons: "Automated (Shopify)" and "Manual (CSV)"
- Active mode: Dark background (#1a1a1a)
- Inactive mode: Light background with border

### 3. GraphQL Query Box
**Purpose**: Shows exact query being used
**Style**:
- Light gray container (#f9f9f9)
- Dark terminal-style code block (#2d2d2d)
- Green text (#4ade80) for query
- Monospace font (Courier New)

**Content**:
```
GraphQL Search Query:
tag:img:needs-brand AND tag:source:faire AND tag:dept:objects

Endpoint: /admin/api/2024-01/graphql.json
```

### 4. Limit Controls
**Number Input**:
- Label: "Batch Limit:"
- Input: Number field (1-50)
- Width: 80px
- Validation: Client-side clamps to 1-50

**Preset Buttons**:
- Test (1): For single product testing
- Normal (20): Default batch size
- Max (50): Maximum allowed
- Active state: Dark background
- Disabled state: 40% opacity

**Hint Text**:
"Start with 1 to test, then increase. Maximum: 50 products per run."

### 5. Run Button
**Text**: Dynamic based on limit
- Limit = 1: "Run Darkroom (1 product)"
- Limit > 1: "Run Darkroom (X products)"

**States**:
- Normal: Dark background, clickable
- Running: "Processing...", disabled
- Disabled: 40% opacity

### 6. Progress Box
**Appears during processing**:
- Progress counter: "Progress: X / Y"
- Success count: "✓ X" (green)
- Failure count: "✗ X" (red)
- Current product: "Processing: [Product Name]"

### 7. Results Section
**Appears after completion**:
- List of processed products
- Each card shows:
  - Product title
  - Product handle
  - Status (success/error)
  - Background type (if success)
  - Images processed count (if success)
  - Error message (if error)

### 8. How It Works
**Static info section**:
- Numbered list of pipeline steps
- Dark background (#2d2d2d)
- Light text (#f5f5f0)

### 9. Admin Debug Info
**Only visible in dev or to admins**:
- Shows auth status
- Shows admin whitelist
- Shows env var used
- Dark background (#1a1a1a)
- Monospace font for technical details

## Color Palette

### Backgrounds
- Page: #f5f5f0 (light beige)
- Sections: #fff (white)
- Query box: #f9f9f9 (light gray)
- Code blocks: #2d2d2d (dark gray)
- Info sections: #2d2d2d (dark gray)
- Debug section: #1a1a1a (black)

### Text
- Primary: #1a1a1a (black)
- Secondary: #404040 (dark gray)
- Tertiary: #666 (medium gray)
- Code: #4ade80 (green)
- Success: #2d7a2d (green)
- Error: #d32f2f (red)
- Light text: #f5f5f0 (beige)

### Borders
- Default: #e8e8e3 (light gray)
- Active: #1a1a1a (black)
- Error: #d32f2f (red)

## Typography

### Fonts
- **Headings**: Crimson Pro (serif)
- **Body**: Inter (sans-serif)
- **Code**: Courier New (monospace)

### Sizes
- Page title: 2.5rem
- Section titles: 0.875rem (uppercase)
- Body text: 0.875rem
- Small text: 0.75rem
- Code: 0.875rem

### Weights
- Headings: 400 (normal)
- Labels: 500 (medium)
- Body: 400 (normal)
- Small: 300 (light)

## Responsive Behavior

### Desktop (>1000px)
- Container: 1000px max-width, centered
- Full layout as shown

### Tablet (600-1000px)
- Container: Full width with padding
- Preset buttons: Stack if needed

### Mobile (<600px)
- Container: Full width
- Preset buttons: Stack vertically
- Query box: Horizontal scroll for code

## Interaction States

### Buttons
- **Normal**: Solid background, pointer cursor
- **Hover**: Slight opacity change (0.9)
- **Active**: Darker background
- **Disabled**: 40% opacity, not-allowed cursor

### Inputs
- **Normal**: Light border
- **Focus**: Darker border
- **Disabled**: 40% opacity

### Preset Buttons
- **Normal**: White background, gray border
- **Active**: Dark background, white text
- **Disabled**: 40% opacity

## Accessibility

### Keyboard Navigation
- All buttons: Tab-accessible
- Number input: Arrow keys work
- Presets: Space/Enter to activate

### Screen Readers
- Labels: Properly associated with inputs
- Buttons: Descriptive text
- Status: ARIA live regions for progress

### Color Contrast
- Text on light: 4.5:1 minimum
- Text on dark: 4.5:1 minimum
- Success/error: Distinguishable without color

## Animation

### Transitions
- Button states: 0.2s ease
- Mode toggle: 0.2s ease
- Preset buttons: 0.2s ease

### Loading States
- Progress updates: Instant
- Results appear: Fade in

## Error States

### Missing Env Var
- Red border on section
- Error icon
- Clear message with instructions
- Code examples for fix

### Processing Error
- Error card in results
- Red status indicator
- Error message displayed
- Other products continue

### Network Error
- Alert message
- Retry suggestion
- Check logs instruction

---

**Design System**: Brutalist minimalism
**Inspiration**: Terminal aesthetics, clean data display
**Focus**: Clarity, transparency, functionality
