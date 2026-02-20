# Google Sheets Template - Charmed & Dark Physical Inventory

## Quick Setup

1. Create a new Google Sheet
2. Name it: "Charmed & Dark - Physical Inventory"
3. Add these column headers in Row 1:

```
Handle | Title | Line 1 | Line 2 | Line 3 | Base Price | House Price | Stock | Category | Options | Metadata
```

4. Start adding products from Row 2

## Column Definitions

### A: Handle (Required)
- URL-safe identifier
- Lowercase, use hyphens
- Must be unique
- Example: `gothic-candle-holder`

### B: Title (Required)
- Product display name
- Proper capitalization
- Example: `Gothic Candle Holder`

### C: Line 1 (Required)
- First description line
- Keep concise and evocative
- Example: `Hand-forged iron with aged patina`

### D: Line 2 (Required)
- Second description line
- Functional or material details
- Example: `Holds standard taper candles`

### E: Line 3 (Required)
- Third description line
- Emotional or experiential
- Example: `Intentional weight and presence`

### F: Base Price (Required)
- Standard price in dollars
- Format: `68.00` (no $ symbol)
- Example: `68.00`

### G: House Price (Required)
- Member price in dollars
- Typically 10% off, rounded
- Format: `61.00` (no $ symbol)
- Example: `61.00`

### H: Stock (Required)
- Current inventory count
- Whole number
- Example: `12`

### I: Category (Required)
- Product category
- Options: Lighting, Textiles, Decor, Stationery, Ritual, Furniture
- Example: `Lighting`

### J: Options (Optional)
- JSON object for variants
- Common: colors, sizes, materials
- Example: `{"colors": ["Black", "Silver", "Gold"]}`
- Leave empty if no options

### K: Metadata (Optional)
- JSON object for Sanctuary AI
- Mood, era, energy, element, ritual use
- Example: `{"mood": "contemplative", "era": "victorian"}`
- Leave empty if not applicable

## Example Rows

### Example 1: Simple Product (No Options)

```
gothic-candle-holder | Gothic Candle Holder | Hand-forged iron with aged patina | Holds standard taper candles | Intentional weight and presence | 68.00 | 61.00 | 12 | Lighting | | {"mood": "contemplative", "element": "fire"}
```

### Example 2: Product with Color Options

```
velvet-throw-pillow | Velvet Throw Pillow | Crushed velvet in rich tones | Hidden zipper closure | Feather-down fill | 45.00 | 41.00 | 25 | Textiles | {"colors": ["Charcoal", "Burgundy", "Midnight"]} | {"mood": "comfort", "element": "earth"}
```

### Example 3: Minimal Product

```
leather-journal | Leather Journal | Genuine leather binding | Unlined pages for free expression | Compact and portable | 38.00 | 34.00 | 30 | Stationery | | 
```

## Full Template (Copy-Paste Ready)

```
Handle	Title	Line 1	Line 2	Line 3	Base Price	House Price	Stock	Category	Options	Metadata
gothic-candle-holder	Gothic Candle Holder	Hand-forged iron with aged patina	Holds standard taper candles	Intentional weight and presence	68.00	61.00	12	Lighting		{"mood": "contemplative"}
velvet-throw-pillow	Velvet Throw Pillow	Crushed velvet in charcoal	Hidden zipper closure	Feather-down fill	45.00	41.00	25	Textiles	{"colors": ["Charcoal", "Burgundy"]}	{"mood": "comfort"}
antique-mirror	Antique Mirror	Aged brass frame with patina	Beveled glass with character	Hangs or stands freely	120.00	108.00	8	Decor		{"mood": "reflection"}
ceramic-skull-vase	Ceramic Skull Vase	Matte white ceramic finish	Holds fresh or dried stems	Memento mori aesthetic	52.00	47.00	15	Decor		{"mood": "contemplative"}
leather-journal	Leather Journal	Genuine leather binding	Unlined pages for free expression	Compact and portable	38.00	34.00	30	Stationery		{"mood": "introspective"}
```

## Categories Reference

Use these standard categories:

- **Lighting** - Candles, candle holders, lanterns, lamps
- **Textiles** - Pillows, throws, curtains, linens
- **Decor** - Mirrors, vases, sculptures, wall art
- **Stationery** - Journals, pens, paper goods
- **Ritual** - Incense, crystals, altar items, tarot
- **Furniture** - Tables, chairs, shelves, storage

## Options Format

### Colors
```json
{"colors": ["Black", "Silver", "Gold"]}
```

### Sizes
```json
{"sizes": ["Small", "Medium", "Large"]}
```

### Materials
```json
{"materials": ["Brass", "Iron", "Copper"]}
```

### Multiple Options
```json
{"colors": ["Black", "Silver"], "sizes": ["Small", "Large"]}
```

## Metadata Format

### Mood
```json
{"mood": "contemplative"}
```
Options: contemplative, comfort, energizing, grounding, mysterious, peaceful

### Era
```json
{"era": "victorian"}
```
Options: victorian, art-deco, medieval, modern, timeless

### Element
```json
{"element": "fire"}
```
Options: fire, water, earth, air, spirit

### Energy
```json
{"energy": "grounding"}
```
Options: grounding, uplifting, calming, protective, transformative

### Ritual Use
```json
{"ritual_use": ["meditation", "altar", "divination"]}
```

### Combined
```json
{
  "mood": "contemplative",
  "era": "victorian",
  "element": "earth",
  "energy": "grounding",
  "ritual_use": ["meditation", "altar"]
}
```

## Tips

### Writing Description Lines

**Line 1**: Material, craftsmanship, visual appeal
- "Hand-forged iron with aged patina"
- "Crushed velvet in rich charcoal"
- "Genuine leather with natural grain"

**Line 2**: Function, features, practical details
- "Holds standard taper candles"
- "Hidden zipper closure"
- "Unlined pages for free expression"

**Line 3**: Feeling, experience, philosophy
- "Intentional weight and presence"
- "Feather-down fill for comfort"
- "Compact and portable companion"

### Calculating House Price

Formula: `Base Price × 0.9`, rounded to nearest dollar

Examples:
- $68.00 → $61.00 (68 × 0.9 = 61.2 → 61)
- $45.00 → $41.00 (45 × 0.9 = 40.5 → 41)
- $120.00 → $108.00 (120 × 0.9 = 108)

### Handle Naming

Good handles:
- `gothic-candle-holder` ✓
- `velvet-throw-pillow` ✓
- `antique-brass-mirror` ✓

Bad handles:
- `Gothic Candle Holder` ✗ (spaces, capitals)
- `candle_holder_1` ✗ (underscores, numbers)
- `candle-holder` ✗ (too generic)

## Validation

Before syncing, check:
- [ ] All required columns filled (A-I)
- [ ] Handles are unique (no duplicates)
- [ ] Handles are lowercase with hyphens
- [ ] Prices are numbers without $ symbol
- [ ] Stock is a whole number
- [ ] Options/Metadata are valid JSON (if used)
- [ ] Categories match standard list

## Sync Process

1. Fill out your sheet
2. Share with service account email
3. Run: `npm run sync-sheets`
4. Check results in terminal
5. Verify products in Supabase
6. View on frontend

---

**Template Version**: 1.0
**Last Updated**: Sprint 2
**Questions?** See `GOOGLE_SHEETS_SYNC.md` for detailed documentation
