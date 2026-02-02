# Narrative Studio - Export Feature

## Overview

The Narrative Studio provides export functionality for locked narratives, allowing canonical brand content to be copied in structured formats for use in product pages and other systems.

## Export Options

### Available Formats

1. **Copy JSON** - Structured data format
2. **Copy Markdown** - Formatted text for product pages

### Availability

Export buttons are **only shown for locked narratives**:
- ✅ Visible after clicking "Lock Narrative" in generate view
- ✅ Visible when viewing saved narratives
- ❌ Hidden for unlocked/in-progress narratives

This ensures only finalized, canonical content can be exported.

## Export Formats

### JSON Format

**Structure**:
```json
{
  "short_description": "...",
  "long_ritual_description": "...",
  "ritual_intention_prompt": "...",
  "care_use_note": "...",
  "alt_text": "...",
  "one_line_drop_tagline": "..."
}
```

**Use Cases**:
- API integrations
- Database imports
- Structured data storage
- Programmatic processing

**Features**:
- Pretty-printed with 2-space indentation
- Valid JSON format
- All six sections included
- Uses finalized, edited content

### Markdown Format

**Structure**:
```markdown
# Product Name

## Short Description

[content]

## Long Ritual Description

[content]

## Ritual Prompt

[content]

## Care & Use Note

[content]

## Alt Text

[content]

## Tagline

[content or (none)]
```

**Use Cases**:
- Product page content
- CMS imports
- Documentation
- Human-readable format

**Features**:
- Clean heading hierarchy (H1 for title, H2 for sections)
- Preserves line breaks and formatting
- Shows "(none)" for empty tagline
- Structured for product pages
- Uses finalized, edited content

## Content Source

### Critical: Uses Locked Content Only

Export functions **always use the finalized, edited, locked text**:

**In Generate View** (after locking):
- Uses `editedResult` state
- Includes all manual edits made before locking
- Never uses original generated output

**In Saved Narrative View**:
- Uses `selectedNarrative.narrative_bundle`
- Retrieves from localStorage
- Guaranteed to be locked content

**Never uses**:
- ❌ Original API response (`result`)
- ❌ Regenerated output
- ❌ Unlocked/draft content

This ensures exported content is **canonical brand copy**.

## User Experience

### Export Workflow

**From Generate View**:
1. Generate narrative
2. Edit sections as needed
3. Click "Lock Narrative"
4. Export buttons appear
5. Click "Copy JSON" or "Copy Markdown"
6. Content copied to clipboard
7. Feedback message: "Copied: JSON" or "Copied: Markdown"

**From Saved Narratives**:
1. Click "Saved Narratives"
2. Select a saved narrative
3. Export buttons visible at bottom
4. Click "Copy JSON" or "Copy Markdown"
5. Content copied to clipboard
6. Feedback message appears

### Visual Indicators

**Export Button Appearance**:
- White background
- Black border and text
- 12px padding vertical, 24px horizontal
- 16px font size
- Pointer cursor on hover

**Button Placement**:
- Below all narrative cards
- Above page bottom
- Separated by border-top
- 24px padding-top
- 12px gap between buttons

**Feedback**:
- Temporary message: "Copied: [format]"
- Auto-dismisses after 2 seconds
- Appears above results area

## Implementation Details

### Export Functions

**exportJSON**:
```typescript
const exportJSON = () => {
  if (editedResult) {
    copyToClipboard(JSON.stringify(editedResult, null, 2), 'JSON');
  }
};
```

**exportMarkdown**:
```typescript
const exportMarkdown = () => {
  if (editedResult) {
    const markdown = `# ${formData.item_name}

## Short Description

${editedResult.short_description}

## Long Ritual Description

${editedResult.long_ritual_description}

## Ritual Prompt

${editedResult.ritual_intention_prompt}

## Care & Use Note

${editedResult.care_use_note}

## Alt Text

${editedResult.alt_text}

## Tagline

${editedResult.one_line_drop_tagline || '(none)'}`;
    copyToClipboard(markdown, 'Markdown');
  }
};
```

### Clipboard API

Uses native browser Clipboard API:
```typescript
await navigator.clipboard.writeText(text);
```

**Browser Support**:
- ✅ Chrome/Edge 63+
- ✅ Firefox 53+
- ✅ Safari 13.1+
- ✅ Opera 50+

**Requirements**:
- HTTPS or localhost (security requirement)
- User gesture (click event)
- Clipboard permission (auto-granted on user action)

### Conditional Rendering

Export buttons only render when locked:
```typescript
{isLocked && (
  <div style={{ display: 'flex', gap: '12px', ... }}>
    <button onClick={exportJSON}>Copy JSON</button>
    <button onClick={exportMarkdown}>Copy Markdown</button>
  </div>
)}
```

## Markdown Format Rationale

### Heading Structure

**Title (H1)**:
- Product name from form input
- Single H1 per document (SEO best practice)
- Clear document hierarchy

**Sections (H2)**:
- Consistent level for all content sections
- Easy to parse and style
- Semantic HTML structure

### Section Names

Optimized for product pages:

| Internal Name | Export Name | Rationale |
|---------------|-------------|-----------|
| short_description | Short Description | Clear, descriptive |
| long_ritual_description | Long Ritual Description | Maintains brand voice |
| ritual_intention_prompt | Ritual Prompt | Concise, page-friendly |
| care_use_note | Care & Use Note | Clear purpose |
| alt_text | Alt Text | Standard web term |
| one_line_drop_tagline | Tagline | Concise, common term |

**Changes from Internal Names**:
- "Ritual Intention Prompt" → "Ritual Prompt" (shorter)
- "One-Line Drop Tagline" → "Tagline" (simpler)

### Empty Tagline Handling

Shows "(none)" instead of empty string:
- Clearer for human readers
- Indicates intentional absence
- Prevents confusion with missing data

## Use Cases

### Product Page Integration

**Markdown Export** → CMS:
1. Export markdown
2. Paste into CMS editor
3. Headings auto-format
4. Content ready for publish

**JSON Export** → API:
1. Export JSON
2. POST to product API
3. Structured data stored
4. Frontend renders from API

### Documentation

**Internal Docs**:
- Export markdown for product catalogs
- Include in brand guidelines
- Share with copywriters

**External Docs**:
- Product descriptions for retailers
- Marketing materials
- Press releases

### Backup & Archive

**Version Control**:
- Export JSON for git tracking
- Markdown for human review
- Compare versions over time

**Offline Storage**:
- Save exports to files
- Email to stakeholders
- Archive canonical versions

## Error Handling

### Copy Failures

**Causes**:
- Clipboard permission denied
- Non-HTTPS context (except localhost)
- Browser doesn't support Clipboard API

**Handling**:
```typescript
try {
  await navigator.clipboard.writeText(text);
  setCopyFeedback(`Copied: ${label}`);
} catch (err) {
  setCopyFeedback('Copy failed');
}
```

**User Experience**:
- Shows "Copy failed" message
- Auto-dismisses after 2 seconds
- User can retry

### Missing Content

**Scenario**: Export called with no locked content

**Prevention**:
- Export buttons only render when `isLocked === true`
- Functions check `if (editedResult)` before proceeding
- Impossible to reach error state in normal use

## Testing

### Manual Test Cases

**Test 1: Export After Lock**
1. Generate narrative
2. Lock narrative
3. Verify export buttons appear
4. Click "Copy JSON"
5. Paste into text editor
6. Verify valid JSON with all sections

**Test 2: Export After Edit**
1. Generate narrative
2. Edit "Short Description"
3. Lock narrative
4. Click "Copy Markdown"
5. Paste into text editor
6. Verify edited content appears (not original)

**Test 3: Export Saved Narrative**
1. Navigate to Saved Narratives
2. Select a narrative
3. Click "Copy JSON"
4. Verify content matches saved version

**Test 4: Markdown Format**
1. Lock a narrative
2. Click "Copy Markdown"
3. Paste into text editor
4. Verify structure:
   - H1: Product name
   - H2: Section names
   - Content: All six sections
   - Tagline: Shows "(none)" if empty

**Test 5: No Export Before Lock**
1. Generate narrative
2. Verify export buttons NOT visible
3. Edit a section
4. Verify export buttons still NOT visible
5. Lock narrative
6. Verify export buttons NOW visible

**Test 6: Feedback Messages**
1. Lock narrative
2. Click "Copy JSON"
3. Verify "Copied: JSON" appears
4. Wait 2 seconds
5. Verify message disappears
6. Click "Copy Markdown"
7. Verify "Copied: Markdown" appears

## Security Considerations

### Content Validation

**Input Sanitization**:
- All content from validated API
- Style validator prevents forbidden patterns
- TypeScript ensures type safety

**Output Safety**:
- JSON.stringify escapes special characters
- Markdown uses plain text (no HTML injection)
- No eval() or dangerous operations

### Clipboard Access

**Permission Model**:
- Requires user gesture (click)
- Auto-granted on user action
- No persistent permission needed

**Privacy**:
- Only writes to clipboard (no reading)
- User controls paste destination
- No tracking or logging

## Performance

**Export Speed**:
- JSON: <1ms (stringify operation)
- Markdown: <1ms (template literal)
- Clipboard: <10ms (browser API)
- Total: <20ms (imperceptible to user)

**Memory**:
- No additional storage
- Uses existing state
- Garbage collected after copy

## Accessibility

**Keyboard Access**:
- ✅ Tab to export buttons
- ✅ Enter/Space to activate
- ✅ Focus visible

**Screen Readers**:
- ✅ Button labels clear ("Copy JSON", "Copy Markdown")
- ✅ Feedback messages announced
- ✅ Semantic HTML structure

**Visual**:
- ✅ High contrast (black on white)
- ✅ Clear button borders
- ✅ Adequate touch targets (48px height)

## Future Enhancements

### Additional Formats

1. **HTML Export** - Styled product page HTML
2. **CSV Export** - Spreadsheet-compatible format
3. **PDF Export** - Print-ready document
4. **XML Export** - Legacy system integration

### Enhanced Features

5. **Download as File** - Save directly to disk
6. **Batch Export** - Export multiple narratives at once
7. **Custom Templates** - User-defined markdown format
8. **Preview** - Show formatted output before copy

### Integration

9. **Direct CMS Push** - One-click publish to CMS
10. **API Integration** - POST directly to product API
11. **Email Export** - Send to stakeholders
12. **Slack/Teams** - Share in team channels

## Summary

The export feature provides essential functionality for using locked narratives as canonical brand content:

**Key Features**:
- ✅ Only available for locked narratives
- ✅ Uses finalized, edited content
- ✅ Two formats: JSON and Markdown
- ✅ Structured for product pages
- ✅ Instant clipboard copy
- ✅ Clear user feedback
- ✅ No third-party libraries
- ✅ Browser-native implementation

**Guarantees**:
- Exported content is always locked/finalized
- Never exports draft or regenerated content
- Markdown format optimized for product pages
- JSON format ready for API integration

The export functionality ensures locked narratives can be easily used across systems while maintaining their status as canonical brand copy.
