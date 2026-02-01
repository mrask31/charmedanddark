# Design Document: Product Narrative Engine

## Overview

The Product Narrative Engine is a content generation system that transforms structured product inputs into complete narrative bundles in the Charmed & Dark voice. The system enforces strict style rules through validation and tone control, ensuring all output maintains gothic-elegant, restrained, timeless, and ritual-focused characteristics.

The engine operates deterministically with no external dependencies, making it suitable for local development and testing. It exposes a single API endpoint for integration with existing Next.js applications.

## Architecture

The system follows a pipeline architecture with three core modules:

1. **Input Validator**: Validates and normalizes incoming requests
2. **Narrative Generator**: Produces raw narrative content based on inputs
3. **Style Validator**: Enforces forbidden language rules and tone consistency
4. **Tone Controller**: Adjusts narrative intensity based on energy_tone parameter

```
Input → Validator → Generator → Tone Controller → Style Validator → Output
                         ↓                              ↓
                    [Templates]                  [Forbidden Rules]
```

The pipeline is fail-fast: validation errors halt execution immediately, and style violations either trigger regeneration or return descriptive errors.

## Components and Interfaces

### 1. Input Validator

**Responsibility**: Validate and normalize all incoming product inputs before generation.

**Interface**:
```typescript
interface ProductInput {
  // Required fields
  item_name: string;
  item_type: ItemType;
  primary_symbol: PrimarySymbol;
  emotional_core: EmotionalCore;
  energy_tone: EnergyTone;
  
  // Optional fields
  drop_name?: string;
  limited?: LimitedType;
  intended_use?: IntendedUse;
  avoid_list?: string[];
}

type ItemType = 
  | "jewelry" 
  | "apparel" 
  | "home_object" 
  | "altar_piece" 
  | "wearable_symbol";

type PrimarySymbol = 
  | "moon" 
  | "rose" 
  | "heart" 
  | "blade" 
  | "bone" 
  | "mirror" 
  | "candle";

type EmotionalCore = 
  | "devotion" 
  | "grief" 
  | "protection" 
  | "longing" 
  | "transformation" 
  | "memory" 
  | "power";

type EnergyTone = 
  | "soft_whispered" 
  | "balanced_reverent" 
  | "dark_commanding";

type LimitedType = "yes" | "no" | "numbered";

type IntendedUse = 
  | "worn_daily" 
  | "worn_intentionally" 
  | "displayed" 
  | "gifted";

interface ValidationResult {
  valid: boolean;
  errors?: ValidationError[];
  normalized?: ProductInput;
}

interface ValidationError {
  field: string;
  message: string;
  expected?: string[];
}

function validateInput(input: unknown): ValidationResult
```

**Validation Rules**:
- All required fields must be present
- All enum values must match defined types exactly
- `item_name` must be non-empty string
- `drop_name` (if provided) must be non-empty string
- `avoid_list` (if provided) must be array of strings

### 2. Narrative Generator

**Responsibility**: Generate raw narrative content for all six sections based on validated inputs.

**Interface**:
```typescript
interface NarrativeBundle {
  short_description: string;
  long_ritual_description: string;
  ritual_intention_prompt: string;
  care_use_note: string;
  alt_text: string;
  one_line_drop_tagline: string;
}

interface GenerationContext {
  input: ProductInput;
  tone_modifiers: ToneModifiers;
}

interface ToneModifiers {
  intensity: "gentle" | "moderate" | "strong";
  sentence_length: "short" | "medium" | "varied";
  mysticism_level: "grounded" | "balanced" | "elevated";
}

function generateNarrative(context: GenerationContext): NarrativeBundle
```

**Generation Strategy**:

The generator uses template-based composition with contextual variation:

1. **Short Description** (2-3 sentences):
   - Sentence 1: Item type + primary symbol + emotional core
   - Sentence 2: Ritual context or intended use
   - Sentence 3 (optional): Drop context or limitation

2. **Long Ritual Description** (3-5 paragraphs):
   - Opening: Establish the object's presence and symbolism
   - Middle: Explore emotional core and ritual meaning
   - Closing: Suggest relationship between object and owner

3. **Ritual Intention Prompt** (1-2 sentences):
   - Reflective question or gentle instruction
   - Connects emotional core to personal practice

4. **Care & Use Note** (2-3 sentences):
   - Emotional care language (not practical instructions)
   - Emphasize relationship and respect for the object

5. **Alt Text** (1 sentence):
   - Accessible, descriptive, poetic but grounded
   - Format: "[Item type] featuring [symbol], [key visual detail]"

6. **One-Line Drop Tagline** (1 short sentence):
   - Sharp, memorable, evocative
   - Only generated if drop_name is provided

**Template Structure**:

Templates are organized by:
- `emotional_core` (primary driver)
- `primary_symbol` (secondary context)
- `item_type` (structural context)

Each template contains:
- Phrase banks for each section
- Contextual connectors
- Symbol-specific imagery
- Emotional core vocabulary

### 3. Tone Controller

**Responsibility**: Adjust narrative intensity based on energy_tone parameter.

**Interface**:
```typescript
interface ToneAdjustment {
  original: NarrativeBundle;
  tone: EnergyTone;
}

function applyToneControl(adjustment: ToneAdjustment): NarrativeBundle
```

**Tone Characteristics**:

**soft_whispered**:
- Gentle verbs (rest, hold, whisper, settle)
- Shorter sentences
- More pauses (periods, not commas)
- Understated adjectives
- Grounded mysticism

**balanced_reverent**:
- Moderate intensity verbs (carry, honor, keep, mark)
- Mixed sentence lengths
- Balanced mysticism
- Intentional but not heavy

**dark_commanding**:
- Strong verbs (claim, bind, command, forge)
- Longer, more declarative sentences
- Elevated mysticism
- Authoritative tone

**Tone Application Strategy**:
- Replace verbs with tone-appropriate alternatives
- Adjust sentence structure (split or combine)
- Modify adjective intensity
- Maintain style rules across all tones

### 4. Style Validator

**Responsibility**: Enforce forbidden language rules and detect tone drift.

**Interface**:
```typescript
interface StyleViolation {
  section: keyof NarrativeBundle;
  violation_type: ViolationType;
  matched_pattern: string;
  position: number;
}

type ViolationType =
  | "emoji"
  | "hashtag"
  | "slang"
  | "internet_language"
  | "trend_label"
  | "hype_phrase"
  | "exclamation"
  | "seasonal_mention"
  | "avoid_list_violation";

interface ValidationResult {
  valid: boolean;
  violations: StyleViolation[];
}

function validateStyle(
  bundle: NarrativeBundle, 
  avoid_list?: string[]
): ValidationResult
```

**Forbidden Patterns**:

```typescript
const FORBIDDEN_PATTERNS = {
  emoji: /[\u{1F300}-\u{1F9FF}]/u,
  hashtag: /#\w+/,
  exclamation: /!/,
  
  slang: [
    "gonna", "wanna", "gotta", "kinda", "sorta",
    "yeah", "nope", "yep", "nah"
  ],
  
  internet_language: [
    "lol", "omg", "tbh", "imo", "fyi", "btw",
    "af", "lowkey", "highkey", "literally"
  ],
  
  trend_labels: [
    "witchcore", "spooky", "goth girl", "dark academia",
    "cottagecore", "aesthetic", "vibe", "vibes"
  ],
  
  hype_phrases: [
    "perfect for", "must-have", "statement piece",
    "you'll love", "amazing", "stunning", "gorgeous",
    "obsessed", "iconic", "slay", "serve"
  ],
  
  seasonal_mentions: [
    "spring", "summer", "fall", "autumn", "winter",
    "halloween", "christmas", "valentine", "holiday"
  ]
};
```

**Validation Strategy**:
1. Check each section against all forbidden patterns
2. Check against custom avoid_list if provided
3. Collect all violations with position information
4. Return validation result with detailed violations

**Error Handling**:
- If violations found: Return 422 status with violation details
- Allow caller to decide: fail hard or attempt regeneration

### 5. API Route Handler

**Responsibility**: Expose HTTP endpoint for narrative generation.

**Interface**:
```typescript
// POST /api/generate-narrative
interface APIRequest {
  body: ProductInput;
}

interface APIResponse {
  success: boolean;
  data?: NarrativeBundle;
  error?: {
    type: "validation" | "style_violation" | "generation";
    message: string;
    details?: ValidationError[] | StyleViolation[];
  };
}
```

**Request Flow**:
1. Parse request body
2. Validate input structure
3. Generate narrative bundle
4. Apply tone control
5. Validate style rules
6. Return response

**Status Codes**:
- 200: Success with narrative bundle
- 400: Invalid input (validation errors)
- 422: Style violations detected
- 500: Internal generation error

## Data Models

### Input Schema

```typescript
{
  "type": "object",
  "required": [
    "item_name",
    "item_type",
    "primary_symbol",
    "emotional_core",
    "energy_tone"
  ],
  "properties": {
    "item_name": {
      "type": "string",
      "minLength": 1
    },
    "item_type": {
      "type": "string",
      "enum": [
        "jewelry",
        "apparel",
        "home_object",
        "altar_piece",
        "wearable_symbol"
      ]
    },
    "primary_symbol": {
      "type": "string",
      "enum": [
        "moon",
        "rose",
        "heart",
        "blade",
        "bone",
        "mirror",
        "candle"
      ]
    },
    "emotional_core": {
      "type": "string",
      "enum": [
        "devotion",
        "grief",
        "protection",
        "longing",
        "transformation",
        "memory",
        "power"
      ]
    },
    "energy_tone": {
      "type": "string",
      "enum": [
        "soft_whispered",
        "balanced_reverent",
        "dark_commanding"
      ]
    },
    "drop_name": {
      "type": "string",
      "minLength": 1
    },
    "limited": {
      "type": "string",
      "enum": ["yes", "no", "numbered"]
    },
    "intended_use": {
      "type": "string",
      "enum": [
        "worn_daily",
        "worn_intentionally",
        "displayed",
        "gifted"
      ]
    },
    "avoid_list": {
      "type": "array",
      "items": {
        "type": "string"
      }
    }
  }
}
```

### Output Schema

```typescript
{
  "type": "object",
  "required": [
    "short_description",
    "long_ritual_description",
    "ritual_intention_prompt",
    "care_use_note",
    "alt_text",
    "one_line_drop_tagline"
  ],
  "properties": {
    "short_description": {
      "type": "string",
      "description": "2-3 sentences for product cards and previews"
    },
    "long_ritual_description": {
      "type": "string",
      "description": "Poetic but grounded narrative, 3-5 paragraphs"
    },
    "ritual_intention_prompt": {
      "type": "string",
      "description": "Short reflective passage for the owner"
    },
    "care_use_note": {
      "type": "string",
      "description": "Emotional care tone, 2-3 sentences"
    },
    "alt_text": {
      "type": "string",
      "description": "Accessible, poetic but descriptive"
    },
    "one_line_drop_tagline": {
      "type": "string",
      "description": "Short, sharp, memorable collection tagline"
    }
  }
}
```

## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system—essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*


### Property 1: Valid Input Acceptance
*For any* valid ProductInput with all required fields and valid enum values, the Input Validator should accept the input and return valid=true
**Validates: Requirements 1.1, 1.2, 1.3, 1.4, 1.5**

### Property 2: Optional Field Acceptance
*For any* valid ProductInput with optional fields (drop_name, limited, intended_use, avoid_list), the Input Validator should accept the input and preserve all optional field values
**Validates: Requirements 1.6, 1.7, 1.8, 1.9**

### Property 3: Complete Bundle Generation
*For any* valid ProductInput, the Narrative Generator should produce a NarrativeBundle containing all six required sections (short_description, long_ritual_description, ritual_intention_prompt, care_use_note, alt_text, one_line_drop_tagline)
**Validates: Requirements 2.1, 2.2, 2.3, 2.4, 2.5, 2.6, 2.7**

### Property 4: Short Description Length
*For any* generated short_description, the text should contain between 2 and 3 sentences
**Validates: Requirements 2.1**

### Property 5: Emoji Detection
*For any* text containing emoji characters, the Style Validator should detect and report an emoji violation
**Validates: Requirements 3.1**

### Property 6: Hashtag Detection
*For any* text containing hashtag patterns (#word), the Style Validator should detect and report a hashtag violation
**Validates: Requirements 3.2**

### Property 7: Slang Detection
*For any* text containing slang terms from the forbidden list, the Style Validator should detect and report a slang violation
**Validates: Requirements 3.3**

### Property 8: Internet Language Detection
*For any* text containing internet language patterns from the forbidden list, the Style Validator should detect and report an internet_language violation
**Validates: Requirements 3.4**

### Property 9: Trend Label Detection
*For any* text containing trend labels from the forbidden list, the Style Validator should detect and report a trend_label violation
**Validates: Requirements 3.5**

### Property 10: Hype Phrase Detection
*For any* text containing hype phrases from the forbidden list, the Style Validator should detect and report a hype_phrase violation
**Validates: Requirements 3.6**

### Property 11: Exclamation Detection
*For any* text containing exclamation points, the Style Validator should detect and report an exclamation violation
**Validates: Requirements 3.7**

### Property 12: Seasonal Mention Detection
*For any* text containing seasonal mentions from the forbidden list, the Style Validator should detect and report a seasonal_mention violation
**Validates: Requirements 3.8**

### Property 13: Style Violation Handling
*For any* NarrativeBundle with style violations, the system should either return an error response with violation details or produce a corrected bundle with no violations
**Validates: Requirements 3.9**

### Property 14: Soft Whispered Tone Characteristics
*For any* ProductInput with energy_tone set to soft_whispered, the generated narrative should use gentle verbs and shorter sentences compared to other tone modes
**Validates: Requirements 4.1**

### Property 15: Balanced Reverent Tone Characteristics
*For any* ProductInput with energy_tone set to balanced_reverent, the generated narrative should use moderate intensity language
**Validates: Requirements 4.2**

### Property 16: Dark Commanding Tone Characteristics
*For any* ProductInput with energy_tone set to dark_commanding, the generated narrative should use strong, authoritative verbs
**Validates: Requirements 4.3**

### Property 17: Style Rules Across Tones
*For any* energy_tone setting, the generated narrative should pass all style validation rules
**Validates: Requirements 4.4**

### Property 18: Avoid List Exclusion
*For any* ProductInput with an avoid_list, none of the words in the avoid_list should appear in the generated NarrativeBundle
**Validates: Requirements 5.1**

### Property 19: Avoid List Violation Handling
*For any* generated content that violates the avoid_list, the system should either regenerate or return an error with violation details
**Validates: Requirements 5.3**

### Property 20: Missing Required Field Validation
*For any* input missing required fields, the Input Validator should return valid=false with errors identifying the missing fields
**Validates: Requirements 6.1**

### Property 21: Invalid Enum Validation
*For any* input with invalid enum values, the Input Validator should return valid=false with errors listing valid options
**Validates: Requirements 6.2**

### Property 22: Type Mismatch Validation
*For any* input with incorrect field types, the Input Validator should return valid=false with errors describing expected types
**Validates: Requirements 6.3**

### Property 23: Validation Before Generation
*For any* invalid input, the system should return validation errors without attempting narrative generation
**Validates: Requirements 6.4**

### Property 24: Deterministic Output
*For any* valid ProductInput, generating narratives multiple times with identical inputs should produce equivalent NarrativeBundle content
**Validates: Requirements 7.1**

### Property 25: Valid Request Success Response
*For any* valid ProductInput sent to POST /api/generate-narrative, the response should have status 200 and contain a complete NarrativeBundle
**Validates: Requirements 8.2**

### Property 26: Invalid Request Error Response
*For any* invalid input sent to POST /api/generate-narrative, the response should have status 400 and contain validation errors
**Validates: Requirements 8.3**

### Property 27: Style Violation Error Response
*For any* input that produces style violations, the response should have status 422 and contain violation details
**Validates: Requirements 8.4**

## Error Handling

### Validation Errors (400)

**Trigger**: Invalid input structure, missing required fields, invalid enum values, type mismatches

**Response Format**:
```typescript
{
  "success": false,
  "error": {
    "type": "validation",
    "message": "Input validation failed",
    "details": [
      {
        "field": "item_type",
        "message": "Invalid enum value",
        "expected": ["jewelry", "apparel", "home_object", "altar_piece", "wearable_symbol"]
      }
    ]
  }
}
```

### Style Violations (422)

**Trigger**: Generated content contains forbidden language or violates avoid_list

**Response Format**:
```typescript
{
  "success": false,
  "error": {
    "type": "style_violation",
    "message": "Generated content violates style rules",
    "details": [
      {
        "section": "short_description",
        "violation_type": "hype_phrase",
        "matched_pattern": "perfect for",
        "position": 45
      }
    ]
  }
}
```

### Generation Errors (500)

**Trigger**: Unexpected errors during generation process

**Response Format**:
```typescript
{
  "success": false,
  "error": {
    "type": "generation",
    "message": "Internal generation error",
    "details": []
  }
}
```

### Error Recovery Strategy

1. **Validation Errors**: Return immediately with detailed field-level errors
2. **Style Violations**: Optionally attempt regeneration with stricter constraints (implementation choice)
3. **Generation Errors**: Log error details and return generic error message

## Testing Strategy

### Dual Testing Approach

The system requires both unit tests and property-based tests for comprehensive coverage:

**Unit Tests**: Focus on specific examples, edge cases, and error conditions
- Example inputs for each item_type and emotional_core combination
- Edge cases: empty strings, boundary values, special characters
- Error conditions: missing fields, invalid enums, malformed JSON
- Integration points: API route handling, response formatting

**Property-Based Tests**: Verify universal properties across all inputs
- Input validation correctness across all valid/invalid combinations
- Style rule enforcement across all forbidden patterns
- Tone consistency across all energy_tone settings
- Deterministic output for identical inputs
- Complete bundle generation for all valid inputs

### Property-Based Testing Configuration

**Library**: Use `fast-check` for TypeScript/JavaScript property-based testing

**Test Configuration**:
- Minimum 100 iterations per property test
- Each test must reference its design document property
- Tag format: `// Feature: product-narrative-engine, Property N: [property text]`

**Example Property Test Structure**:
```typescript
// Feature: product-narrative-engine, Property 1: Valid Input Acceptance
test('accepts all valid ProductInput combinations', () => {
  fc.assert(
    fc.property(
      validProductInputArbitrary(),
      (input) => {
        const result = validateInput(input);
        expect(result.valid).toBe(true);
      }
    ),
    { numRuns: 100 }
  );
});
```

### Test Fixtures

Three golden fixtures are required to validate end-to-end generation:

**Fixture 1: Jewelry with Moon Symbol**
```typescript
{
  item_name: "Lunar Devotion Ring",
  item_type: "jewelry",
  primary_symbol: "moon",
  emotional_core: "devotion",
  energy_tone: "balanced_reverent",
  intended_use: "worn_intentionally"
}
```

**Fixture 2: Apparel with Rose Symbol**
```typescript
{
  item_name: "Rose Longing Veil",
  item_type: "apparel",
  primary_symbol: "rose",
  emotional_core: "longing",
  energy_tone: "soft_whispered",
  drop_name: "Thorn & Petal",
  limited: "numbered"
}
```

**Fixture 3: Altar Piece with Candle Symbol**
```typescript
{
  item_name: "Guardian Flame Holder",
  item_type: "altar_piece",
  primary_symbol: "candle",
  emotional_core: "protection",
  energy_tone: "dark_commanding",
  intended_use: "displayed"
}
```

Each fixture should:
- Generate all six narrative sections
- Pass all style validation rules
- Demonstrate appropriate tone characteristics
- Serve as regression test for future changes

### Test Coverage Requirements

**Input Validation**: 100% coverage of all validation rules
**Style Validation**: 100% coverage of all forbidden patterns
**Tone Control**: Coverage of all three energy_tone modes
**API Routes**: Coverage of all status codes (200, 400, 422, 500)
**Error Handling**: Coverage of all error types and recovery paths

### Integration Testing

**API Integration Tests**:
- Test complete request/response cycle
- Verify correct status codes for all scenarios
- Validate response structure matches schema
- Test error response formatting

**End-to-End Tests**:
- Use golden fixtures to validate complete generation pipeline
- Verify all six sections are generated correctly
- Confirm style rules are enforced
- Validate tone characteristics match energy_tone setting

## Implementation Notes

### Template Organization

Templates should be organized in a hierarchical structure:

```
templates/
  emotional_core/
    devotion/
      short_description.ts
      long_ritual_description.ts
      ritual_intention_prompt.ts
      care_use_note.ts
    grief/
      ...
    protection/
      ...
  symbols/
    moon.ts
    rose.ts
    heart.ts
    ...
  tone_modifiers/
    soft_whispered.ts
    balanced_reverent.ts
    dark_commanding.ts
```

### Determinism Strategy

To ensure deterministic output:
1. Use template-based generation (no random selection)
2. Use consistent ordering for phrase selection
3. Avoid timestamp-based or random seed-based variation
4. Use deterministic string manipulation only

### Performance Considerations

- Input validation should complete in <10ms
- Full narrative generation should complete in <100ms
- Style validation should complete in <50ms
- Total API response time should be <200ms for typical inputs

### Extensibility

The system is designed for future extension:
- New item_type values can be added to enum
- New primary_symbol values can be added to enum
- New emotional_core values can be added with corresponding templates
- New forbidden patterns can be added to style validator
- New tone modes can be added with corresponding modifiers
