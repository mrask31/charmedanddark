# Narrative Studio - Manual Testing Guide

## Setup

1. Start the development server:
```bash
npm run dev
```

2. Navigate to: `http://localhost:3000/studio/narrative`

## Test Cases

### Test 1: Basic Generation (Happy Path)

**Input:**
- Item Name: `Lunar Devotion Ring`
- Item Type: `jewelry`
- Primary Symbol: `moon`
- Emotional Core: `devotion`
- Energy Tone: `balanced_reverent`

**Expected Result:**
- ✅ All 6 narrative sections generated
- ✅ No style violations
- ✅ Copy buttons work for each section
- ✅ Export JSON and Markdown buttons work

### Test 2: With Optional Fields

**Input:**
- Item Name: `Rose Longing Veil`
- Item Type: `apparel`
- Primary Symbol: `rose`
- Emotional Core: `longing`
- Energy Tone: `soft_whispered`
- Drop Name: `Thorn & Petal`
- Limited: `numbered`
- Intended Use: `worn_intentionally`

**Expected Result:**
- ✅ All 6 sections generated
- ✅ One-Line Drop Tagline includes drop name
- ✅ Short description mentions limited/intended use context

### Test 3: Validation Error (Missing Required Field)

**Input:**
- Item Name: `Test Ring`
- Item Type: (leave empty)
- Primary Symbol: `moon`
- Emotional Core: `devotion`
- Energy Tone: `balanced_reverent`

**Expected Result:**
- ❌ Red error panel appears
- ❌ Error message: "Validation error"
- ❌ Details show: "item_type: Required field missing" or similar

### Test 4: Style Violation (Avoid List)

**Input:**
- Item Name: `Silver Moon Ring`
- Item Type: `jewelry`
- Primary Symbol: `moon`
- Emotional Core: `devotion`
- Energy Tone: `balanced_reverent`
- Avoid List: `silver, moon, devotion, jewelry, ring`

**Expected Result:**
- Either:
  - ✅ Generation succeeds (avoided all words), OR
  - ❌ Red error panel with "Style violation" and violation details

### Test 5: Different Energy Tones

**Test 5a: Soft Whispered**
- Energy Tone: `soft_whispered`
- Expected: Gentle, understated language

**Test 5b: Dark Commanding**
- Energy Tone: `dark_commanding`
- Expected: Strong, authoritative language

### Test 6: All Emotional Cores

Test each emotional core:
- `devotion`
- `grief`
- `protection`
- `longing`
- `transformation`
- `memory`
- `power`

**Expected Result:**
- ✅ Each generates successfully with appropriate thematic language

### Test 7: Reset Button

**Steps:**
1. Fill in all fields
2. Click "Generate"
3. Click "Reset"

**Expected Result:**
- ✅ All form fields cleared
- ✅ Generated results cleared
- ✅ Error messages cleared

### Test 8: Copy Functionality

**Steps:**
1. Generate a narrative
2. Click "Copy" on Short Description
3. Paste into a text editor

**Expected Result:**
- ✅ Feedback message appears: "Copied: Short Description"
- ✅ Clipboard contains the short description text

### Test 9: Export JSON

**Steps:**
1. Generate a narrative
2. Click "Copy JSON"
3. Paste into a text editor

**Expected Result:**
- ✅ Feedback message appears: "Copied: JSON"
- ✅ Clipboard contains valid JSON with all 6 sections

### Test 10: Export Markdown

**Steps:**
1. Generate a narrative
2. Click "Copy Markdown"
3. Paste into a text editor

**Expected Result:**
- ✅ Feedback message appears: "Copied: Markdown"
- ✅ Clipboard contains formatted markdown with headers and all sections

### Test 11: Loading State

**Steps:**
1. Fill in required fields
2. Click "Generate"
3. Observe UI during generation

**Expected Result:**
- ✅ Button text changes to "Generating..."
- ✅ All inputs disabled during generation
- ✅ Button disabled during generation

### Test 12: Avoid List Parsing

**Input:**
- Avoid List: `eternal, forever, timeless, always`

**Expected Result:**
- ✅ Comma-separated values parsed correctly
- ✅ Whitespace trimmed
- ✅ Empty entries ignored

## Visual Checks

- ✅ Clean black and white aesthetic
- ✅ Generous spacing (48px between major sections)
- ✅ Form fields properly aligned in 2-column grid
- ✅ Cards display with clear borders and padding
- ✅ Copy buttons aligned to the right of card headers
- ✅ Error panels clearly visible in red
- ✅ No console errors in browser DevTools

## Browser Compatibility

Test in:
- ✅ Chrome/Edge (Chromium)
- ✅ Firefox
- ✅ Safari (if available)

## Performance

- ✅ Form is responsive
- ✅ Generation completes in < 1 second
- ✅ Copy operations are instant
- ✅ No UI lag or freezing

## Accessibility

- ✅ All form fields have labels
- ✅ Required fields marked with asterisk
- ✅ Error messages are readable
- ✅ Keyboard navigation works
- ✅ Tab order is logical

## Edge Cases

### Empty Drop Name
- Leave drop_name blank
- Expected: One-Line Drop Tagline shows "(none)" or is empty

### Very Long Item Name
- Item Name: `The Extremely Long and Elaborate Name of This Particular Piece of Jewelry That Goes On and On`
- Expected: UI handles gracefully, no overflow issues

### Special Characters in Avoid List
- Avoid List: `test, test-word, test's, test/word`
- Expected: Parses correctly, no errors
