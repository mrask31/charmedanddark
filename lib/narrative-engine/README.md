# Product Narrative Engine

A content generation system that transforms structured product inputs into complete narrative bundles in the Charmed & Dark voice.

## Features

- **Deterministic Generation**: Consistent outputs for identical inputs
- **Style Enforcement**: Strict validation against forbidden language patterns
- **Tone Control**: Three energy modes (soft_whispered, balanced_reverent, dark_commanding)
- **Complete Bundles**: Generates all six narrative sections
- **Local Operation**: No external dependencies or API keys required

## API Endpoint

### POST /api/generate-narrative

Generate a complete narrative bundle from structured product input.

**Request Body:**

```json
{
  "item_name": "Lunar Devotion Ring",
  "item_type": "jewelry",
  "primary_symbol": "moon",
  "emotional_core": "devotion",
  "energy_tone": "balanced_reverent",
  "drop_name": "Celestial Collection",
  "limited": "numbered",
  "intended_use": "worn_intentionally",
  "avoid_list": ["eternal", "forever"]
}
```

**Required Fields:**
- `item_name` (string): Name of the product
- `item_type` (enum): jewelry | apparel | home_object | altar_piece | wearable_symbol
- `primary_symbol` (enum): moon | rose | heart | blade | bone | mirror | candle
- `emotional_core` (enum): devotion | grief | protection | longing | transformation | memory | power
- `energy_tone` (enum): soft_whispered | balanced_reverent | dark_commanding

**Optional Fields:**
- `drop_name` (string): Collection name
- `limited` (enum): yes | no | numbered
- `intended_use` (enum): worn_daily | worn_intentionally | displayed | gifted
- `avoid_list` (string[]): Words to exclude from generated content

**Success Response (200):**

```json
{
  "success": true,
  "data": {
    "short_description": "...",
    "long_ritual_description": "...",
    "ritual_intention_prompt": "...",
    "care_use_note": "...",
    "alt_text": "...",
    "one_line_drop_tagline": "..."
  }
}
```

**Error Responses:**

- **400 Validation Error**: Invalid input structure or enum values
- **422 Style Violation**: Generated content violates style rules
- **500 Generation Error**: Internal error during generation

## Testing

Run the test suite:

```bash
npm test
```

Run tests in watch mode:

```bash
npm test:watch
```

## Architecture

The system follows a pipeline architecture:

```
Input → Validator → Generator → Tone Controller → Style Validator → Output
```

### Components

1. **Input Validator** (`validator.ts`): Validates and normalizes incoming requests
2. **Narrative Generator** (`generator.ts`): Produces raw narrative content
3. **Tone Controller** (`tone-controller.ts`): Adjusts narrative intensity
4. **Style Validator** (`style-validator.ts`): Enforces forbidden language rules

### Templates

Templates are organized by emotional core, primary symbol, and item type:

- **Symbol Phrases**: Imagery and descriptors for each symbol
- **Emotional Core Themes**: Verbs, nouns, and qualities for each emotional state
- **Item Type Context**: Contextual phrases for different product types

## Development

The narrative engine is designed for local development without external dependencies:

- No API keys required
- No database connections
- No authentication
- No payment processing

All generation happens locally using template-based composition.
