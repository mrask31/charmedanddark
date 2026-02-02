# Drops & Collections

Group products under shared narrative contexts with editorial descriptions and status tracking.

## Overview

Drops (also called Collections) are first-class internal entities that help organize products into cohesive groups. Each drop has a name, description, status, and a list of linked products. This system helps manage product launches, seasonal collections, and thematic groupings.

## Features

### Drop Management
- Create new drops
- Edit existing drops
- View all drops in list
- Track drop status (draft/ready/archived)

### Product Linking
- Multi-select products to include in drop
- Visual checkbox interface
- One product per drop constraint (enforced)
- Selected products summary

### Status Workflow
- **Draft**: Work in progress
- **Ready**: Finalized and ready for use
- **Archived**: No longer active

## Drop Fields

**Required:**
- **Name**: Drop/collection name
- **Status**: draft | ready | archived

**Optional:**
- **Description**: Short editorial description
- **Products**: Linked products (can be empty)

## Usage

### Creating a Drop

1. Navigate to `/studio/drops`
2. Click "Create Drop"
3. Enter drop name (required)
4. Add description (optional)
   - Short editorial context
   - Narrative theme
   - Launch details
5. Select status (defaults to draft)
6. Select products from list
   - Click checkboxes to select
   - Products show name, SKU, price
   - Selected products highlighted
7. Review selected products in summary
8. Click "Create Drop"

### Editing a Drop

1. Click "Edit" on any drop in list
2. Modify name, description, or status
3. Add or remove products
4. Click "Save Changes"

### Linking Products

**Selection Process:**
1. In create/edit form, scroll to "Linked Products"
2. Click checkboxes to select products
3. Selected products show bold border
4. Summary panel shows count and names

**Constraint:**
- Products can only belong to ONE drop
- System prevents selecting products already in other drops
- Alert shows which drop currently has the product

**Available Products:**
- Shows products not in any other drop
- Includes products in current editing drop (for removal)
- Filters out products assigned elsewhere

## One Drop Per Product

This constraint ensures clear organization:

**Allowed:**
- Product A in Drop 1
- Product B in Drop 2
- Product C in no drop

**Not Allowed:**
- Product A in Drop 1 AND Drop 2

**What Happens:**
- If you try to add a product that's already in another drop
- System shows alert: "This product is already in drop [Name]"
- Selection is prevented
- You must remove product from other drop first

## Status Meanings

### Draft (Orange)
- Work in progress
- Not finalized
- Can modify freely
- Not ready for launch

### Ready (Green)
- Finalized
- Ready for use
- Can be launched
- Products confirmed

### Archived (Gray)
- No longer active
- Historical record
- Past collection
- Reference only

## Drop List View

Each drop card shows:
- Drop name
- Description (if provided)
- Status badge (color-coded)
- Product count
- Created date
- Edit button

## Product Selection UI

**Product Cards Show:**
- Checkbox for selection
- Product name
- SKU (if available)
- Price
- Fulfillment type

**Visual Feedback:**
- Selected: Bold black border
- Unselected: Gray border
- Hover: Light gray background

**Summary Panel:**
- Shows count of selected products
- Lists product names
- Updates in real-time

## Data Persistence

- Saves to localStorage (`drops_catalog`)
- Auto-saves on changes
- Auto-loads on page mount
- Survives page reloads
- Browser-local only

## Example Drops

### Seasonal Collection
```
Name: "Winter Solstice 2026"
Description: "Pieces for the longest night, featuring moon and candle symbols"
Status: Ready
Products: 5 items
```

### Limited Release
```
Name: "Numbered Edition - Blade Series"
Description: "50 pieces only, hand-numbered. Power and protection themes."
Status: Ready
Products: 3 items
```

### Thematic Grouping
```
Name: "Grief & Memory Collection"
Description: "For holding loss with reverence. Rose and mirror symbols."
Status: Draft
Products: 7 items
```

## Tips

- **Use descriptive names**: "Lunar Devotion Collection" not "Collection 1"
- **Add context in description**: Helps team understand narrative theme
- **Start as draft**: Finalize products before marking ready
- **Archive old drops**: Keep active list clean
- **One theme per drop**: Clear narrative focus

## Constraints

- No authentication required
- No database (localStorage only)
- No publishing or external integration
- Products can only be in one drop
- Cannot delete drops (MVP constraint)

## Integration

**Product Catalog:**
- Reads product list for selection
- Does not modify products
- Enforces one-drop constraint

**Future Integration:**
- Display drop name on product cards
- Filter products by drop
- Drop-based narrative generation
- Launch Board drop view

## Workflow Example

1. **Plan Collection**
   - Decide on theme (e.g., "Lunar Devotion")
   - Identify products to include

2. **Create Drop**
   - Name: "Lunar Devotion Collection"
   - Description: "Moon-themed pieces for devotional practice"
   - Status: Draft

3. **Link Products**
   - Select 5 moon-themed products
   - Review selection
   - Save drop

4. **Finalize**
   - Review products
   - Update description if needed
   - Change status to Ready

5. **Launch**
   - Use drop for launch planning
   - Reference in marketing
   - Track as cohesive unit

6. **Archive**
   - After launch period ends
   - Change status to Archived
   - Keep for historical reference
