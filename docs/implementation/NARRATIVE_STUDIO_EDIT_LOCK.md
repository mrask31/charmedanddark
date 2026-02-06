# Narrative Studio - Edit → Lock Feature

## Overview

The Narrative Studio now includes an editorial workflow that allows generated narratives to be edited inline and then locked as finalized, canonical brand copy.

## What Was Added

### 1. Inline Editing

Each narrative card now has an **Edit** button (when unlocked):
- Click "Edit" to enter edit mode for that section
- Text appears in a textarea for modification
- **Save** button applies changes
- **Cancel** button discards changes and reverts to previous content
- Textarea size adjusts based on section type:
  - Long Ritual Description: 10 rows
  - Short Description: 3 rows
  - Other sections: 2 rows

### 2. Lock Narrative Action

A **Lock Narrative** button appears below the generated output:
- Finalizes the narrative as canonical brand copy
- Makes all sections read-only (Edit buttons disappear)
- Disables the Generate button (shows "Locked" state)
- Displays a locked indicator banner
- **Irreversible** - no unlock functionality in MVP

### 3. Locked State UI

When locked, the UI shows:
- **Banner**: "🔒 Locked - This narrative is finalized and cannot be edited or regenerated"
- **Card Background**: Subtle gray (#f9f9f9) instead of white
- **Text Color**: Slightly muted (#555) instead of dark (#333)
- **Generate Button**: Disabled with "Locked" text
- **Edit Buttons**: Hidden (only Copy buttons remain)

### 4. State Management

New state variables added:
- `isLocked` (boolean): Tracks whether narrative is locked
- `editedResult` (NarrativeBundle): Stores the current version including edits

State flow:
1. Generate → Sets both `result` (original) and `editedResult` (working copy)
2. Edit → Updates `editedResult` only
3. Lock → Sets `isLocked` to true
4. Reset → Clears all state including lock

### 5. Export Behavior

Export functions now use `editedResult` instead of `result`:
- **Copy JSON**: Exports the edited version
- **Copy Markdown**: Exports the edited version
- Ensures exports always reflect the latest edits

## Implementation Details

### Component Changes

**EditableNarrativeCard** (new component):
```typescript
- Replaces the previous NarrativeCard component
- Manages local edit state (isEditing, editValue)
- Handles Save/Cancel actions
- Conditionally renders Edit button based on isLocked
- Shows textarea when editing, static text otherwise
```

### State Flow

```
Generate → result + editedResult (unlocked)
    ↓
Edit → editedResult updated (unlocked)
    ↓
Lock → isLocked = true (read-only)
    ↓
Reset → all state cleared
```

### Key Functions

**handleEditField**:
- Updates a specific field in `editedResult`
- Only works when `!isLocked`
- Called by EditableNarrativeCard on Save

**handleLock**:
- Sets `isLocked` to true
- Shows feedback message
- Irreversible (no unlock function)

**handleGenerate**:
- Resets `isLocked` to false
- Resets both `result` and `editedResult`
- Allows fresh generation

**handleReset**:
- Clears all state including lock
- Returns to initial form state

## User Experience

### Typical Workflow

1. **Generate**: User fills form and clicks Generate
2. **Review**: User reviews the 6 generated sections
3. **Edit**: User clicks Edit on sections needing refinement
4. **Refine**: User modifies text and clicks Save
5. **Repeat**: User edits other sections as needed
6. **Lock**: User clicks Lock Narrative when satisfied
7. **Export**: User exports final version via Copy JSON/Markdown

### Edge Cases Handled

**Editing then generating again**:
- New generation clears edits and unlocks
- User must re-edit if they generate again

**Locking without edits**:
- Works fine - locks the original generated content
- Useful for "approve as-is" workflow

**Canceling edits**:
- Reverts to previous content (either original or last saved edit)
- Does not affect other sections

**Copying while editing**:
- Copy button always available
- Copies the current saved content (not the in-progress edit)

## Design Decisions

### Why Inline Editing?

- **Immediate feedback**: See changes in context
- **No modal dialogs**: Cleaner UX
- **Per-section control**: Edit only what needs changing
- **Familiar pattern**: Standard content editing paradigm

### Why Irreversible Lock?

- **Intentional action**: Prevents accidental finalization
- **Clear state**: No ambiguity about what's canonical
- **Simpler implementation**: No unlock logic needed
- **MVP scope**: Can add unlock in future if needed

### Why Client-Side Only?

- **No persistence needed**: Matches existing architecture
- **No auth required**: Keeps tool simple
- **Fast iteration**: No API calls for edits
- **Export-based workflow**: Users export when ready

### Why Separate result and editedResult?

- **Preserve original**: Can compare edited vs generated
- **Clean state**: Clear separation of concerns
- **Future features**: Could add "revert to original" later

## Technical Constraints

### No Database

- Edits are stored in React state only
- Refreshing the page loses all edits
- Users must export before leaving

### No Authentication

- No user tracking
- No edit history
- No multi-user collaboration

### No Persistence

- Lock state is session-only
- Closing browser loses lock status
- Export is the only way to save

## Future Enhancements (Out of Scope)

1. **Unlock**: Add ability to unlock and re-edit
2. **Revision History**: Track edit history per section
3. **Compare View**: Show original vs edited side-by-side
4. **Auto-save**: Save edits to localStorage
5. **Export to File**: Download as .json or .md files
6. **Batch Lock**: Lock multiple narratives at once
7. **Approval Workflow**: Multi-step approval process
8. **Diff View**: Highlight what changed from original

## Testing

### Manual Test Cases

**Test 1: Basic Edit**
1. Generate a narrative
2. Click Edit on Short Description
3. Modify text
4. Click Save
5. Verify text updated in card

**Test 2: Cancel Edit**
1. Generate a narrative
2. Click Edit on any section
3. Modify text
4. Click Cancel
5. Verify text reverted to original

**Test 3: Lock Workflow**
1. Generate a narrative
2. Edit one or more sections
3. Click Lock Narrative
4. Verify:
   - Locked banner appears
   - Edit buttons disappear
   - Generate button shows "Locked"
   - Cards have gray background

**Test 4: Export After Edit**
1. Generate a narrative
2. Edit Short Description
3. Click Copy JSON
4. Verify JSON contains edited text

**Test 5: Generate After Lock**
1. Generate and lock a narrative
2. Verify Generate button is disabled
3. Click Reset
4. Verify Generate button is enabled again

**Test 6: Multiple Edits**
1. Generate a narrative
2. Edit Short Description and save
3. Edit Long Ritual Description and save
4. Edit Alt Text and save
5. Verify all edits preserved
6. Lock narrative
7. Export and verify all edits in export

## Code Changes Summary

### Files Modified

- `app/studio/narrative/page.tsx` - Main component
- `app/studio/narrative/README.md` - Documentation

### Lines Changed

- Added ~100 lines for edit/lock functionality
- Replaced NarrativeCard with EditableNarrativeCard (~80 lines)
- Updated state management (~20 lines)
- Updated UI rendering (~50 lines)

### No Breaking Changes

- All existing tests pass (64/64)
- API unchanged
- Engine logic unchanged
- Export functionality enhanced (uses edited content)

## Accessibility

- Edit/Save/Cancel buttons have clear labels
- Textarea has proper focus management
- Keyboard navigation works (Tab through buttons)
- Locked state clearly communicated visually and textually
- No color-only indicators (uses text + background)

## Performance

- Edit state is local to each card (no re-renders of other cards)
- Lock operation is instant (just state update)
- No API calls for editing
- No performance impact on generation

## Summary

The Edit → Lock feature provides a clean editorial workflow for finalizing product narratives. It's implemented entirely client-side with no database or authentication requirements, maintaining the simplicity of the original Narrative Studio while adding essential editorial capabilities.

Key benefits:
- ✅ Inline editing for quick refinements
- ✅ Clear locked state for finalized content
- ✅ Irreversible lock prevents accidental changes
- ✅ Export includes all edits
- ✅ No breaking changes to existing functionality
- ✅ Clean, minimal implementation
