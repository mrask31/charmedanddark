# Narrative Studio

Internal tool for generating Charmed & Dark product narrative bundles with editorial workflow and persistence.

## Access

Navigate to: `/studio/narrative`

## Features

### Navigation

- **Generate View** (default): Form and generation interface
- **Saved Narratives**: List of all locked narratives
- **View Saved**: Detail view of individual saved narrative

Header shows:
- "Saved Narratives (N)" button - Access saved narratives list
- "← Back to Generate" button - Return to generation view

### Form Input
- **Required Fields**:
  - Item Name (text)
  - Item Type (select: jewelry, apparel, home_object, altar_piece, wearable_symbol)
  - Primary Symbol (select: moon, rose, heart, blade, bone, mirror, candle)
  - Emotional Core (select: devotion, grief, protection, longing, transformation, memory, power)
  - Energy Tone (select: soft_whispered, balanced_reverent, dark_commanding)

- **Optional Fields**:
  - Drop Name (text)
  - Limited (select: yes, no, numbered)
  - Intended Use (select: worn_daily, worn_intentionally, displayed, gifted)
  - Avoid List (comma-separated words to exclude from generated content)

### Output Display

Generated narratives are displayed in six editable cards:

1. **Short Description** - 2-3 sentences for product cards
2. **Long Ritual Description** - Poetic narrative, 3-5 paragraphs
3. **Ritual Intention Prompt** - Reflective passage for the owner
4. **Care & Use Note** - Emotional care guidance
5. **Alt Text** - Accessible, descriptive text
6. **One-Line Drop Tagline** - Collection tagline (if drop_name provided)

Each card includes:
- **Edit** button - Opens inline editor for that section (when unlocked)
- **Copy** button - Copies that section to clipboard

### Editorial Workflow: Edit → Lock → Save

After generation, narratives can be edited, finalized, and saved:

1. **Edit Phase** (default):
   - Click "Edit" on any card to modify content inline
   - Save or Cancel changes per section
   - Generate button remains enabled for regeneration

2. **Lock Phase** (finalized):
   - Click "Lock Narrative" to finalize as canonical brand copy
   - **Automatically saves to browser localStorage**
   - Locked narratives become read-only
   - Generate button is disabled (shows "Locked")
   - Visual indicator shows locked state
   - **Locking is intentional and irreversible** (no unlock in MVP)

3. **Saved Narratives**:
   - All locked narratives are automatically saved
   - Persisted in browser localStorage (survives reloads)
   - Access via "Saved Narratives" button in header
   - Each saved record includes:
     - Product name
     - Complete narrative bundle (all six sections)
     - Locked timestamp
     - Version (v1)

### Saved Narratives List

Click "Saved Narratives (N)" to view all saved narratives:

**List View**:
- Shows all locked narratives
- Displays: Product name, Locked date/time, Version
- Click any item to view full narrative
- Empty state message if no saved narratives

**Detail View**:
- Shows complete narrative in read-only mode
- Locked banner with save date
- All six sections with Copy buttons
- Export JSON and Markdown buttons
- "← Back to Generate" to return

### Export Options

- **Copy JSON** - Copies the complete narrative bundle (including edits) as JSON
- **Copy Markdown** - Copies a formatted markdown document with all sections (including edits)

### Error Handling

The UI displays clear error messages for:

- **Validation Errors (400)** - Missing required fields or invalid enum values
- **Style Violations (422)** - Generated content contains forbidden language
- **Generation Errors (500)** - Internal server errors

## Usage Example

### Basic Generation and Save

1. Fill in the required fields:
   - Item Name: "Lunar Devotion Ring"
   - Item Type: jewelry
   - Primary Symbol: moon
   - Emotional Core: devotion
   - Energy Tone: balanced_reverent

2. Click **Generate**

3. Review the six generated narrative sections

### Editorial Workflow

4. Click **Edit** on "Short Description"

5. Modify the text as needed

6. Click **Save** to apply changes

7. Repeat for other sections as needed

8. When satisfied, click **Lock Narrative**

9. Narrative is automatically saved to localStorage

10. Use **Copy JSON** or **Copy Markdown** to export

### Viewing Saved Narratives

11. Click **Saved Narratives (1)** in header

12. See list of all locked narratives

13. Click a narrative to view full content

14. Export or copy sections as needed

15. Click **← Back to Generate** to create new narratives

## Technical Details

- **Route**: `/studio/narrative`
- **API Endpoint**: `POST /api/generate-narrative`
- **Persistence**: Browser localStorage (key: `saved_narratives`)
- **No Authentication Required** - Internal tool only
- **No Database** - localStorage only (survives reloads)
- **Client-Side Only** - All state managed in React

### Data Storage

Saved narratives are stored in browser localStorage:
- Survives page reloads and browser restarts
- Not shared across browsers or devices
- Clearing browser data deletes saved narratives
- No server-side storage or syncing

## Styling

The UI follows the Charmed & Dark aesthetic:
- Clean black and white color scheme
- Generous spacing (48px between sections, 24px between elements)
- Minimal, dignified design
- No emojis, no trendy language
- Calm, professional tone
- Locked state uses subtle gray background (#f9f9f9)
