# Requirements Document

## Introduction

The Product Narrative Engine transforms structured product inputs into complete narrative bundles that embody the Charmed & Dark voice: gothic-elegant, restrained, timeless, and ritual-focused. The system enforces strict style rules to maintain tonal consistency and prevent salesy language, trend-chasing, or tone drift.

## Glossary

- **Narrative_Engine**: The system that generates product narratives from structured inputs
- **Narrative_Bundle**: A complete set of six content sections for a single product
- **Style_Validator**: The component that enforces forbidden language rules
- **Tone_Controller**: The component that adjusts narrative intensity based on energy_tone
- **Forbidden_Language**: Words, phrases, or patterns that violate the Charmed & Dark voice
- **Energy_Tone**: The emotional intensity level (soft/whispered, balanced/reverent, dark/commanding)
- **Emotional_Core**: The primary feeling or intention the product embodies
- **Primary_Symbol**: The central visual or conceptual element of the product

## Requirements

### Requirement 1: Accept Structured Product Inputs

**User Story:** As a content creator, I want to provide structured product information, so that the system can generate consistent narratives.

#### Acceptance Criteria

1. THE Narrative_Engine SHALL accept item_name as a string input
2. THE Narrative_Engine SHALL accept item_type from the enumeration: jewelry, apparel, home_object, altar_piece, wearable_symbol
3. THE Narrative_Engine SHALL accept primary_symbol from the enumeration: moon, rose, heart, blade, bone, mirror, candle
4. THE Narrative_Engine SHALL accept emotional_core from the enumeration: devotion, grief, protection, longing, transformation, memory, power
5. THE Narrative_Engine SHALL accept energy_tone from the enumeration: soft_whispered, balanced_reverent, dark_commanding
6. WHERE drop_name is provided, THE Narrative_Engine SHALL accept it as an optional string input
7. WHERE limited is provided, THE Narrative_Engine SHALL accept it from the enumeration: yes, no, numbered
8. WHERE intended_use is provided, THE Narrative_Engine SHALL accept it from the enumeration: worn_daily, worn_intentionally, displayed, gifted
9. WHERE avoid_list is provided, THE Narrative_Engine SHALL accept it as an array of strings

### Requirement 2: Generate Complete Narrative Bundles

**User Story:** As a content creator, I want to receive all six narrative sections in every output, so that I have complete product content.

#### Acceptance Criteria

1. WHEN valid inputs are provided, THE Narrative_Engine SHALL generate a short_description section of 2-3 sentences
2. WHEN valid inputs are provided, THE Narrative_Engine SHALL generate a long_ritual_description section with poetic but grounded narrative
3. WHEN valid inputs are provided, THE Narrative_Engine SHALL generate a ritual_intention_prompt section with a short reflective passage
4. WHEN valid inputs are provided, THE Narrative_Engine SHALL generate a care_use_note section with emotional care tone
5. WHEN valid inputs are provided, THE Narrative_Engine SHALL generate an alt_text section that is accessible, poetic, and descriptive
6. WHEN valid inputs are provided, THE Narrative_Engine SHALL generate a one_line_drop_tagline section that is short, sharp, and memorable
7. THE Narrative_Engine SHALL produce all six sections in every execution

### Requirement 3: Enforce Style Rules

**User Story:** As a brand guardian, I want the system to prevent forbidden language, so that all content maintains the Charmed & Dark voice.

#### Acceptance Criteria

1. WHEN generated content contains emojis, THE Style_Validator SHALL reject the content
2. WHEN generated content contains hashtags, THE Style_Validator SHALL reject the content
3. WHEN generated content contains slang terms, THE Style_Validator SHALL reject the content
4. WHEN generated content contains internet language patterns, THE Style_Validator SHALL reject the content
5. WHEN generated content contains trend labels (witchcore, spooky, goth girl), THE Style_Validator SHALL reject the content
6. WHEN generated content contains hype phrases (perfect for, must-have, statement piece), THE Style_Validator SHALL reject the content
7. WHEN generated content contains exclamation points, THE Style_Validator SHALL reject the content
8. WHEN generated content contains seasonal or trend mentions, THE Style_Validator SHALL reject the content
9. WHEN forbidden language is detected, THE Narrative_Engine SHALL either fail with a descriptive error or auto-correct the violation

### Requirement 4: Apply Tone Control

**User Story:** As a content creator, I want to control narrative intensity, so that products have appropriate emotional weight.

#### Acceptance Criteria

1. WHEN energy_tone is soft_whispered, THE Tone_Controller SHALL generate content with gentle, understated language
2. WHEN energy_tone is balanced_reverent, THE Tone_Controller SHALL generate content with moderate emotional intensity
3. WHEN energy_tone is dark_commanding, THE Tone_Controller SHALL generate content with strong, authoritative language
4. THE Tone_Controller SHALL maintain style rules across all energy_tone settings

### Requirement 5: Respect Avoidance Lists

**User Story:** As a content creator, I want to specify words or themes to avoid, so that narratives don't conflict with specific product contexts.

#### Acceptance Criteria

1. WHERE avoid_list is provided, THE Narrative_Engine SHALL exclude all listed words from generated content
2. WHERE avoid_list is provided, THE Narrative_Engine SHALL exclude thematic variations of listed words from generated content
3. WHEN generated content violates the avoid_list, THE Narrative_Engine SHALL regenerate or fail with a descriptive error

### Requirement 6: Validate Input Structure

**User Story:** As a developer, I want clear validation errors, so that I can correct malformed inputs quickly.

#### Acceptance Criteria

1. WHEN required inputs are missing, THE Narrative_Engine SHALL return a validation error identifying the missing fields
2. WHEN enum values are invalid, THE Narrative_Engine SHALL return a validation error listing valid options
3. WHEN input types are incorrect, THE Narrative_Engine SHALL return a validation error describing the expected type
4. THE Narrative_Engine SHALL validate all inputs before attempting generation

### Requirement 7: Provide Deterministic Output

**User Story:** As a content creator, I want consistent outputs for identical inputs, so that I can reproduce and refine narratives.

#### Acceptance Criteria

1. WHEN identical inputs are provided multiple times, THE Narrative_Engine SHALL produce equivalent narrative content
2. THE Narrative_Engine SHALL not introduce random variation that changes core narrative meaning
3. THE Narrative_Engine SHALL maintain consistent tone and style across repeated executions

### Requirement 8: Expose Simple Interface

**User Story:** As a developer, I want a simple API interface, so that I can integrate narrative generation into existing systems.

#### Acceptance Criteria

1. THE Narrative_Engine SHALL expose a POST endpoint at /api/generate-narrative
2. WHEN a POST request is received with valid JSON input, THE Narrative_Engine SHALL return a JSON response with the narrative bundle
3. WHEN a POST request is received with invalid input, THE Narrative_Engine SHALL return a 400 status code with validation errors
4. WHEN generation fails due to style violations, THE Narrative_Engine SHALL return a 422 status code with violation details
5. THE Narrative_Engine SHALL return a 200 status code with the complete narrative bundle when generation succeeds

### Requirement 9: Support Local Development

**User Story:** As a developer, I want to run the system locally without external dependencies, so that I can develop and test independently.

#### Acceptance Criteria

1. THE Narrative_Engine SHALL operate without external API integrations
2. THE Narrative_Engine SHALL not require authentication or API keys
3. THE Narrative_Engine SHALL not require database connections
4. THE Narrative_Engine SHALL not require payment processing integrations
5. THE Narrative_Engine SHALL function with only local file system access
