# Narrative Studio - Editorial Safeguards

## Overview

The Narrative Studio includes light editorial safeguards to protect brand integrity by ensuring all required narrative sections are complete before locking.

## Purpose

These safeguards exist to:
- ✅ Prevent incomplete narratives from being locked as canonical
- ✅ Ensure brand content meets minimum completeness standards
- ✅ Catch accidental omissions before finalization
- ❌ NOT to police writing style or content quality
- ❌ NOT to re-validate against style rules

## Validation Rules

### Required Sections

Before locking, the following sections **must be non-empty**:

1. **Short Description** - Must contain text
2. **Long Ritual Description** - Must contain text
3. **Ritual Intention Prompt** - Must contain text
4. **Care & Use Note** - Must contain text
5. **Alt Text** - Must contain text

### Optional Sections

The following section is **optional** and not validated:

- **One-Line Drop Tagline** - Can be empty (only generated if drop_name provided)

### Validation Logic

**Empty Check**:
```typescript
if (!section?.trim()) {
  // Section is considered empty
}
```

**Criteria**:
- Section must exist (not null/undefined)
- Section must contain at least one non-whitespace character
- Whitespace-only content is considered empty

## User Experience

### Warning Display

**When Shown**:
- User clicks "Lock Narrative"
- One or more required sections are empty
- Warning appears immediately (no page reload)

**Visual Design**:
- Soft yellow background (#fff8e1)
- Amber border (#f9a825)
- Brown text (#5d4037)
- 12px vertical padding, 18px horizontal
- 14px font size
- 1.5 line height
- Appears above Lock button

**Message Format**:
```
Please complete the following sections before locking: [Section 1], [Section 2]
```

**Example**:
```
Please complete the following sections before locking: Short Description, Alt Text
```

### Behavior

**Lock Prevented**:
- Lock button remains clickable
- Clicking shows/updates warning
- Narrative does NOT lock
- No save to localStorage
- User must complete sections first

**Warning Cleared**:
- Automatically when user edits any field
- Automatically when user clicks Reset
- User can immediately retry locking after fixing

**No Modal Dialogs**:
- Warning appears inline
- No popup or overlay
- No "OK" button to dismiss
- Calm, minimal presentation

### Workflow

**Typical Flow**:
1. User generates narrative
2. User edits sections as needed
3. User clicks "Lock Narrative"
4. System validates all required sections
5. If empty sections found:
   - Warning appears
   - Lock prevented
   - User completes missing sections
   - User clicks "Lock Narrative" again
6. If all sections complete:
   - Narrative locks
   - Saves to localStorage
   - Export buttons appear

**Recovery Flow**:
1. Warning appears
2. User clicks "Edit" on empty section
3. User adds content
4. User clicks "Save"
5. Warning automatically clears
6. User clicks "Lock Narrative"
7. Validation passes
8. Narrative locks successfully

## Implementation Details

### State Management

**New State Variable**:
```typescript
const [lockWarning, setLockWarning] = useState<string | null>(null);
```

**State Updates**:
- Set when validation fails
- Cleared when user edits any field
- Cleared when user resets form
- Cleared when lock succeeds

### Validation Function

**Location**: Inside `handleLock()` function

**Logic**:
```typescript
const emptySections: string[] = [];

if (!editedResult.short_description?.trim()) {
  emptySections.push('Short Description');
}
if (!editedResult.long_ritual_description?.trim()) {
  emptySections.push('Long Ritual Description');
}
if (!editedResult.ritual_intention_prompt?.trim()) {
  emptySections.push('Ritual Intention Prompt');
}
if (!editedResult.care_use_note?.trim()) {
  emptySections.push('Care & Use Note');
}
if (!editedResult.alt_text?.trim()) {
  emptySections.push('Alt Text');
}
// Note: one_line_drop_tagline is optional

if (emptySections.length > 0) {
  const sectionList = emptySections.join(', ');
  setLockWarning(`Please complete the following sections before locking: ${sectionList}`);
  return; // Prevent lock
}

// Clear warning and proceed with lock
setLockWarning(null);
// ... rest of lock logic
```

### Auto-Clear Logic

**On Edit**:
```typescript
const handleEditField = (field: keyof NarrativeBundle, value: string) => {
  if (!isLocked && editedResult) {
    setEditedResult({ ...editedResult, [field]: value });
    setLockWarning(null); // Clear warning
  }
};
```

**On Reset**:
```typescript
const handleReset = () => {
  // ... reset other state
  setLockWarning(null); // Clear warning
};
```

### Warning Component

**Rendering**:
```typescript
{lockWarning && (
  <div style={{
    padding: '12px 18px',
    backgroundColor: '#fff8e1',
    border: '1px solid #f9a825',
    marginBottom: '18px',
    fontSize: '14px',
    color: '#5d4037',
    lineHeight: '1.5',
  }}>
    {lockWarning}
  </div>
)}
```

**Placement**:
- Inside Lock Button section
- Above the Lock button
- Below narrative cards
- Only visible when `!isLocked`

## Design Decisions

### Why Not Re-Run Style Validation?

**Rationale**:
- Human edits are intentional
- Editor may have valid reasons for style choices
- Style validator is for generated content
- Trust the editor's judgment
- Avoid being overly prescriptive

**Example Scenarios**:
- Editor adds exclamation for emphasis (forbidden in generation)
- Editor uses seasonal reference for limited drop
- Editor includes trend term if contextually appropriate
- Editor's discretion overrides automated rules

### Why Only Check Non-Empty?

**Rationale**:
- Completeness is objective (empty vs. not empty)
- Quality is subjective (good vs. bad writing)
- Minimum viable safeguard
- Respects editorial autonomy
- Prevents obvious mistakes only

**Not Checked**:
- ❌ Content length
- ❌ Writing quality
- ❌ Style consistency
- ❌ Grammar/spelling
- ❌ Brand voice adherence

### Why Soft Yellow Warning?

**Color Psychology**:
- Yellow = caution, not error
- Softer than red (not an error state)
- Amber border adds definition
- Brown text is readable and calm

**Alternatives Rejected**:
- ❌ Red: Too aggressive, implies error
- ❌ Blue: Suggests information, not warning
- ❌ Gray: Too subtle, might be missed
- ✅ Yellow: Perfect balance of visible and calm

### Why Inline Warning?

**UX Principles**:
- No interruption to workflow
- Context preserved (user sees what's missing)
- No extra click to dismiss
- Automatically clears when fixed
- Minimal cognitive load

**Alternatives Rejected**:
- ❌ Modal dialog: Interrupts workflow
- ❌ Toast notification: Might be missed
- ❌ Browser alert: Too aggressive
- ✅ Inline warning: Calm and contextual

## Edge Cases

### All Sections Empty

**Scenario**: User tries to lock immediately after generation without any content

**Behavior**:
- Warning lists all 5 required sections
- Message: "Please complete the following sections before locking: Short Description, Long Ritual Description, Ritual Intention Prompt, Care & Use Note, Alt Text"
- Lock prevented

**Note**: This shouldn't happen in normal use since generation always produces content

### Whitespace-Only Content

**Scenario**: User deletes content and leaves only spaces/newlines

**Behavior**:
- `.trim()` removes whitespace
- Section considered empty
- Warning appears
- Lock prevented

**Example**:
```typescript
"   \n  \n   " // Considered empty
```

### Optional Tagline Empty

**Scenario**: User generates without drop_name, tagline is empty

**Behavior**:
- Tagline not validated
- No warning shown
- Lock proceeds normally
- Export shows "(none)" for tagline

**Rationale**: Tagline is only relevant when drop_name provided

### Partial Edit

**Scenario**: User edits one section, leaves others as generated

**Behavior**:
- All sections have content (from generation)
- Validation passes
- Lock succeeds
- Mix of edited and generated content is fine

## Testing

### Manual Test Cases

**Test 1: Lock with Complete Content**
1. Generate narrative
2. All sections have content
3. Click "Lock Narrative"
4. Verify: No warning, lock succeeds

**Test 2: Lock with Empty Section**
1. Generate narrative
2. Edit "Short Description" and delete all content
3. Click "Lock Narrative"
4. Verify: Warning appears listing "Short Description"
5. Verify: Lock prevented

**Test 3: Lock with Multiple Empty Sections**
1. Generate narrative
2. Delete content from "Short Description" and "Alt Text"
3. Click "Lock Narrative"
4. Verify: Warning lists both sections
5. Verify: Lock prevented

**Test 4: Fix and Retry**
1. Generate narrative
2. Delete "Short Description"
3. Click "Lock Narrative"
4. Verify: Warning appears
5. Edit "Short Description" and add content
6. Verify: Warning disappears
7. Click "Lock Narrative"
8. Verify: Lock succeeds

**Test 5: Whitespace Only**
1. Generate narrative
2. Edit "Alt Text" to contain only spaces
3. Click "Lock Narrative"
4. Verify: Warning appears listing "Alt Text"
5. Verify: Lock prevented

**Test 6: Empty Tagline OK**
1. Generate narrative without drop_name
2. Tagline is empty
3. Click "Lock Narrative"
4. Verify: No warning about tagline
5. Verify: Lock succeeds

**Test 7: Warning Auto-Clear**
1. Generate narrative
2. Delete "Short Description"
3. Click "Lock Narrative"
4. Verify: Warning appears
5. Edit any section (not necessarily Short Description)
6. Verify: Warning disappears immediately

**Test 8: Reset Clears Warning**
1. Generate narrative
2. Delete "Short Description"
3. Click "Lock Narrative"
4. Verify: Warning appears
5. Click "Reset"
6. Verify: Warning cleared
7. Verify: Form reset

## Accessibility

**Screen Readers**:
- Warning text is readable
- No ARIA live region (not critical alert)
- User can navigate to warning with Tab

**Keyboard Navigation**:
- Warning is not focusable (informational only)
- Lock button remains accessible
- Tab order unchanged

**Visual**:
- High contrast (brown on yellow)
- Clear border definition
- Adequate text size (14px)
- Good line height (1.5)

## Performance

**Validation Speed**:
- 5 string checks: <1ms
- Array join: <1ms
- State update: <1ms
- Total: <5ms (imperceptible)

**No Performance Impact**:
- Only runs on Lock click
- Not run on every edit
- No debouncing needed
- No network requests

## Future Enhancements

### Potential Additions

1. **Length Warnings** - Suggest if sections are too short/long
2. **Quality Hints** - Gentle suggestions for improvement
3. **Consistency Checks** - Flag tone mismatches between sections
4. **Grammar Check** - Optional spell/grammar validation
5. **Brand Voice Score** - Measure adherence to brand guidelines

### Explicitly NOT Adding

- ❌ **Style Re-Validation** - Trust human edits
- ❌ **Mandatory Fixes** - Keep warnings advisory
- ❌ **Content Approval** - No multi-step approval workflow
- ❌ **Version Comparison** - No diff against original

## Summary

The editorial safeguards provide a light, calm validation layer that:

**Protects**:
- ✅ Brand integrity (no incomplete content)
- ✅ User from accidental omissions
- ✅ Downstream systems from empty fields

**Respects**:
- ✅ Editorial autonomy
- ✅ Human judgment
- ✅ Intentional style choices
- ✅ Workflow continuity

**Design Principles**:
- Calm and minimal
- No modal dialogs
- Inline contextual warnings
- Auto-clear when fixed
- Trust the editor

The safeguards strike a balance between protection and autonomy, ensuring completeness without being prescriptive about quality or style.
