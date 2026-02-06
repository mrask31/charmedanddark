# Narrative Studio - Persistence Feature

## Overview

The Narrative Studio now persists locked narratives as canonical records using browser localStorage. Saved narratives can be viewed in a dedicated list view.

## What Was Added

### 1. Persistence Layer

**Storage Mechanism**: Browser localStorage
- Key: `saved_narratives`
- Format: JSON array of SavedNarrative objects
- Survives page reloads and browser restarts
- No server-side storage required

**SavedNarrative Structure**:
```typescript
interface SavedNarrative {
  id: string;              // Unique identifier (timestamp-based)
  product_name: string;    // Item name from form
  narrative_bundle: {      // All six sections
    short_description: string;
    long_ritual_description: string;
    ritual_intention_prompt: string;
    care_use_note: string;
    alt_text: string;
    one_line_drop_tagline: string;
  };
  locked_at: string;       // ISO timestamp
  version: string;         // Always "v1" for MVP
}
```

### 2. Save on Lock

When "Lock Narrative" is clicked:
1. Creates a SavedNarrative record with current data
2. Generates unique ID using timestamp
3. Captures current item_name as product_name
4. Stores complete edited narrative_bundle
5. Records locked_at timestamp (ISO format)
6. Sets version to "v1"
7. Adds to savedNarratives array
8. Persists to localStorage
9. Shows "Narrative locked and saved" feedback

### 3. Saved Narratives List View

**Access**: Click "Saved Narratives (N)" button in header

**Display**:
- Shows all saved narratives in reverse chronological order (newest first)
- Each item shows:
  - Product name (heading)
  - Locked date and time
  - Version number
  - "View →" indicator
- Hover effect for better UX
- Click to view full narrative

**Empty State**:
- Shows message: "No saved narratives yet. Lock a narrative to save it as canonical brand copy."

### 4. View Saved Narrative

**Access**: Click any item in Saved Narratives list

**Display**:
- Locked banner with save date
- Product name as heading
- All six sections in read-only cards
- Gray background (#f9f9f9) to indicate read-only
- Copy button per section
- Export JSON and Markdown buttons

**Navigation**:
- "← Back to Generate" button in header
- Returns to list view

### 5. Navigation Flow

```
Generate View
    ↓ (click "Saved Narratives")
List View
    ↓ (click narrative)
View Saved Narrative
    ↓ (click "← Back to Generate")
Generate View
```

## Implementation Details

### State Management

**New State Variables**:
```typescript
const [savedNarratives, setSavedNarratives] = useState<SavedNarrative[]>([]);
const [viewMode, setViewMode] = useState<'generate' | 'list' | 'view'>('generate');
const [selectedNarrative, setSelectedNarrative] = useState<SavedNarrative | null>(null);
```

**View Modes**:
- `generate`: Default view with form and generation
- `list`: Saved narratives list
- `view`: Single saved narrative detail view

### localStorage Integration

**Load on Mount**:
```typescript
useEffect(() => {
  const saved = localStorage.getItem('saved_narratives');
  if (saved) {
    setSavedNarratives(JSON.parse(saved));
  }
}, []);
```

**Save on Change**:
```typescript
useEffect(() => {
  if (savedNarratives.length > 0) {
    localStorage.setItem('saved_narratives', JSON.stringify(savedNarratives));
  }
}, [savedNarratives]);
```

### Components

**ReadOnlyNarrativeCard** (new):
- Similar to EditableNarrativeCard but without edit functionality
- Gray background to indicate read-only state
- Only Copy button (no Edit/Save/Cancel)
- Used in View Saved Narrative mode

**Header Navigation**:
- Conditional rendering based on viewMode
- Shows "Saved Narratives (N)" in generate mode
- Shows "← Back to Generate" in list/view modes
- Counter badge shows number of saved narratives

## User Experience

### Typical Workflow

1. **Generate**: User creates a narrative
2. **Edit**: User refines sections as needed
3. **Lock**: User clicks "Lock Narrative"
4. **Save**: System automatically saves to localStorage
5. **View List**: User clicks "Saved Narratives" to see all saved items
6. **View Detail**: User clicks a saved narrative to view full content
7. **Export**: User exports saved narrative as JSON or Markdown

### Key Features

**Automatic Persistence**:
- No manual save button needed
- Locking automatically saves
- Survives browser restarts

**Easy Navigation**:
- Clear button labels
- Breadcrumb-style navigation
- Counter badge shows saved count

**Read-Only Protection**:
- Saved narratives cannot be edited
- Visual distinction (gray background)
- Prevents accidental changes to canonical copy

## Data Management

### Storage Limits

localStorage has browser-specific limits (typically 5-10MB):
- Each SavedNarrative is ~2-5KB
- Can store hundreds of narratives
- No automatic cleanup in MVP

### Data Format

**Example localStorage entry**:
```json
[
  {
    "id": "narrative_1706789123456",
    "product_name": "Lunar Devotion Ring",
    "narrative_bundle": {
      "short_description": "...",
      "long_ritual_description": "...",
      "ritual_intention_prompt": "...",
      "care_use_note": "...",
      "alt_text": "...",
      "one_line_drop_tagline": "..."
    },
    "locked_at": "2024-02-01T15:30:45.123Z",
    "version": "v1"
  }
]
```

### Version Management

**Current**: All narratives saved as "v1"

**Future**: Could increment version for:
- Re-locking edited narratives
- Template changes
- Style rule updates

## Constraints & Limitations

### No Database
- All data stored in browser localStorage
- Not shared across browsers or devices
- Clearing browser data deletes all saved narratives

### No Authentication
- No user tracking
- No access control
- Anyone with browser access can view saved narratives

### No Syncing
- Data is local to browser only
- No cloud backup
- No cross-device sync

### No Deletion (MVP)
- Cannot delete saved narratives from UI
- Must manually clear localStorage to remove
- Future enhancement: Add delete functionality

### No Editing Saved Narratives
- Saved narratives are read-only
- Cannot unlock or re-edit
- Must generate new narrative to make changes

## Technical Details

### Browser Compatibility

localStorage is supported in all modern browsers:
- Chrome/Edge: ✅
- Firefox: ✅
- Safari: ✅
- Opera: ✅

### Error Handling

**Load Errors**:
- Catches JSON parse errors
- Logs to console
- Continues with empty array

**Save Errors**:
- localStorage quota exceeded: Silent fail
- Invalid JSON: Prevented by TypeScript types

### Performance

**Load Time**:
- Instant (localStorage is synchronous)
- No network requests

**Save Time**:
- Instant (localStorage is synchronous)
- Triggered only when savedNarratives changes

**List Rendering**:
- Efficient (no pagination needed for MVP)
- Hover effects use CSS transitions

## Future Enhancements (Out of Scope)

1. **Export All**: Download all saved narratives as single JSON file
2. **Import**: Upload previously exported narratives
3. **Delete**: Remove individual saved narratives
4. **Search**: Filter saved narratives by product name
5. **Sort**: Sort by date, name, or version
6. **Edit Saved**: Unlock and re-edit saved narratives
7. **Version History**: Track multiple versions per product
8. **Duplicate Detection**: Warn when saving duplicate product names
9. **Bulk Operations**: Select multiple narratives for export/delete
10. **Cloud Sync**: Optional cloud backup and sync

## Testing

### Manual Test Cases

**Test 1: Save on Lock**
1. Generate a narrative
2. Edit sections as desired
3. Click "Lock Narrative"
4. Verify feedback: "Narrative locked and saved"
5. Refresh page
6. Click "Saved Narratives"
7. Verify narrative appears in list

**Test 2: View Saved Narrative**
1. Click "Saved Narratives"
2. Click a saved narrative
3. Verify all six sections display correctly
4. Verify locked banner shows correct date
5. Verify Copy buttons work
6. Verify Export buttons work

**Test 3: Multiple Saves**
1. Generate and lock narrative A
2. Reset form
3. Generate and lock narrative B
4. Click "Saved Narratives"
5. Verify both narratives appear
6. Verify counter shows (2)

**Test 4: Navigation**
1. Start in Generate view
2. Click "Saved Narratives"
3. Verify list view appears
4. Click a narrative
5. Verify detail view appears
6. Click "← Back to Generate"
7. Verify returns to Generate view

**Test 5: Persistence**
1. Generate and lock a narrative
2. Close browser completely
3. Reopen browser
4. Navigate to /studio/narrative
5. Click "Saved Narratives"
6. Verify narrative still exists

**Test 6: Empty State**
1. Clear localStorage (browser dev tools)
2. Refresh page
3. Click "Saved Narratives"
4. Verify empty state message appears

## Data Migration

### Clearing Old Data

To clear all saved narratives:
```javascript
localStorage.removeItem('saved_narratives');
```

### Exporting Data

To export all saved narratives:
```javascript
const data = localStorage.getItem('saved_narratives');
console.log(data);
// Copy and save to file
```

### Importing Data

To import saved narratives:
```javascript
const data = '[...]'; // Paste exported JSON
localStorage.setItem('saved_narratives', data);
// Refresh page
```

## Summary

The persistence feature provides a simple, effective way to save and view locked narratives as canonical brand copy. Using localStorage ensures:

- ✅ No server-side infrastructure needed
- ✅ Instant save and load
- ✅ Survives browser restarts
- ✅ Simple implementation
- ✅ No authentication required
- ✅ No database setup

Key benefits:
- Locked narratives are automatically saved
- Easy access via Saved Narratives list
- Read-only view protects canonical copy
- Export functionality for external use
- Clean navigation between views
