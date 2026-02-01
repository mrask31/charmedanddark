# Implementation Plan: Product Narrative Engine

## Overview

This implementation plan breaks down the Product Narrative Engine into discrete coding tasks. The system will be built in TypeScript with a focus on deterministic generation, strict style enforcement, and clear module separation. All components will operate locally without external dependencies.

## Tasks

- [ ] 1. Set up project structure and type definitions
  - Create directory structure: `lib/narrative-engine/`
  - Define TypeScript types and interfaces for ProductInput, NarrativeBundle, validation results
  - Define enum types for all input categories
  - Set up fast-check for property-based testing
  - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 1.6, 1.7, 1.8, 1.9_

- [ ] 2. Implement Input Validator
  - [ ] 2.1 Create input validation module
    - Write validateInput function with schema validation
    - Implement required field checking
    - Implement enum value validation
    - Implement type checking for all fields
    - _Requirements: 6.1, 6.2, 6.3, 6.4_
  
  - [ ] 2.2 Write unit tests for input validation (REQUIRED)
    - Test missing required fields
    - Test invalid enum values
    - Test type mismatches
    - _Requirements: 6.1, 6.2, 6.3_
  
  - [ ]* 2.3 Write property test for valid input acceptance
    - **Property 1: Valid Input Acceptance**
    - **Validates: Requirements 1.1, 1.2, 1.3, 1.4, 1.5**
  
  - [ ]* 2.4 Write property test for optional field acceptance
    - **Property 2: Optional Field Acceptance**
    - **Validates: Requirements 1.6, 1.7, 1.8, 1.9**

- [ ] 3. Implement Style Validator
  - [ ] 3.1 Create forbidden patterns configuration
    - Define FORBIDDEN_PATTERNS constant with all pattern types
    - Include regex patterns for emoji, hashtag, exclamation
    - Include string arrays for slang, internet language, trend labels, hype phrases, seasonal mentions
    - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5, 3.6, 3.7, 3.8_
  
  - [ ] 3.2 Create style validation module
    - Write validateStyle function
    - Implement pattern matching for each violation type
    - Implement avoid_list checking
    - Return detailed StyleViolation objects with position information
    - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5, 3.6, 3.7, 3.8, 5.1_
  
  - [ ] 3.3 Write unit tests for style validation (REQUIRED)
    - Test emoji detection
    - Test hashtag detection
    - Test exclamation detection
    - Test hype phrase detection
    - Test seasonal mention detection
    - _Requirements: 3.1, 3.2, 3.6, 3.7, 3.8_
  
  - [ ]* 3.4 Write property test for slang detection
    - **Property 7: Slang Detection**
    - **Validates: Requirements 3.3**
  
  - [ ]* 3.5 Write property test for internet language detection
    - **Property 8: Internet Language Detection**
    - **Validates: Requirements 3.4**
  
  - [ ]* 3.6 Write property test for trend label detection
    - **Property 9: Trend Label Detection**
    - **Validates: Requirements 3.5**
  
  - [ ]* 3.7 Write property test for avoid list exclusion
    - **Property 18: Avoid List Exclusion**
    - **Validates: Requirements 5.1**

- [ ] 4. Checkpoint - Ensure validation tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 5. Create narrative templates
  - [ ] 5.1 Create template structure and organization
    - Create templates directory with emotional_core subdirectories
    - Create symbol-specific phrase banks
    - Create tone modifier configurations
    - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 2.6_
  
  - [ ] 5.2 Implement devotion emotional core templates
    - Write short_description templates
    - Write long_ritual_description templates
    - Write ritual_intention_prompt templates
    - Write care_use_note templates
    - _Requirements: 2.1, 2.2, 2.3, 2.4_
  
  - [ ] 5.3 Implement grief emotional core templates
    - Write all section templates for grief
    - _Requirements: 2.1, 2.2, 2.3, 2.4_
  
  - [ ] 5.4 Implement protection emotional core templates
    - Write all section templates for protection
    - _Requirements: 2.1, 2.2, 2.3, 2.4_
  
  - [ ] 5.5 Implement longing emotional core templates
    - Write all section templates for longing
    - _Requirements: 2.1, 2.2, 2.3, 2.4_
  
  - [ ] 5.6 Implement transformation emotional core templates
    - Write all section templates for transformation
    - _Requirements: 2.1, 2.2, 2.3, 2.4_
  
  - [ ] 5.7 Implement memory emotional core templates
    - Write all section templates for memory
    - _Requirements: 2.1, 2.2, 2.3, 2.4_
  
  - [ ] 5.8 Implement power emotional core templates
    - Write all section templates for power
    - _Requirements: 2.1, 2.2, 2.3, 2.4_
  
  - [ ] 5.9 Create symbol-specific phrase banks
    - Create phrase banks for moon, rose, heart, blade, bone, mirror, candle
    - Include imagery and descriptive language for each symbol
    - _Requirements: 2.1, 2.2_

- [ ] 6. Implement Tone Controller
  - [ ] 6.1 Create tone modifier module
    - Define ToneModifiers interface
    - Create tone characteristic mappings for each energy_tone
    - Implement verb replacement logic
    - Implement sentence structure adjustment logic
    - _Requirements: 4.1, 4.2, 4.3_
  
  - [ ] 6.2 Implement applyToneControl function
    - Write function to apply tone modifiers to generated narratives
    - Implement soft_whispered tone adjustments
    - Implement balanced_reverent tone adjustments
    - Implement dark_commanding tone adjustments
    - _Requirements: 4.1, 4.2, 4.3_
  
  - [ ]* 6.3 Write property test for soft whispered tone
    - **Property 14: Soft Whispered Tone Characteristics**
    - **Validates: Requirements 4.1**
  
  - [ ]* 6.4 Write property test for balanced reverent tone
    - **Property 15: Balanced Reverent Tone Characteristics**
    - **Validates: Requirements 4.2**
  
  - [ ]* 6.5 Write property test for dark commanding tone
    - **Property 16: Dark Commanding Tone Characteristics**
    - **Validates: Requirements 4.3**
  
  - [ ]* 6.6 Write property test for style rules across tones
    - **Property 17: Style Rules Across Tones**
    - **Validates: Requirements 4.4**
  
  - [ ]* 6.7 Write unit tests for tone control edge cases
    - Test tone transitions
    - Test verb replacement accuracy
    - _Requirements: 4.1, 4.2, 4.3_

- [ ] 7. Implement Narrative Generator
  - [ ] 7.1 Create narrative generation module
    - Write generateNarrative function
    - Implement template selection logic based on emotional_core and primary_symbol
    - Implement context building from ProductInput
    - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 2.6, 2.7_
  
  - [ ] 7.2 Implement short_description generation
    - Generate 2-3 sentence descriptions
    - Combine item_type, primary_symbol, and emotional_core
    - Include drop context if provided
    - _Requirements: 2.1_
  
  - [ ] 7.3 Implement long_ritual_description generation
    - Generate 3-5 paragraph narratives
    - Follow opening-middle-closing structure
    - Maintain poetic but grounded tone
    - _Requirements: 2.2_
  
  - [ ] 7.4 Implement ritual_intention_prompt generation
    - Generate 1-2 sentence reflective passages
    - Connect emotional_core to personal practice
    - _Requirements: 2.3_
  
  - [ ] 7.5 Implement care_use_note generation
    - Generate 2-3 sentence emotional care notes
    - Avoid practical instructions, focus on relationship
    - _Requirements: 2.4_
  
  - [ ] 7.6 Implement alt_text generation
    - Generate accessible, descriptive text
    - Follow format: "[Item type] featuring [symbol], [key visual detail]"
    - _Requirements: 2.5_
  
  - [ ] 7.7 Implement one_line_drop_tagline generation
    - Generate short, sharp, memorable taglines
    - Only generate if drop_name is provided
    - _Requirements: 2.6_
  
  - [ ]* 7.8 Write property test for complete bundle generation
    - **Property 3: Complete Bundle Generation**
    - **Validates: Requirements 2.1, 2.2, 2.3, 2.4, 2.5, 2.6, 2.7**
  
  - [ ]* 7.9 Write property test for short description length
    - **Property 4: Short Description Length**
    - **Validates: Requirements 2.1**
  
  - [ ]* 7.10 Write property test for deterministic output
    - **Property 24: Deterministic Output**
    - **Validates: Requirements 7.1**
  
  - [ ]* 7.11 Write unit tests for generation edge cases
    - Test all emotional_core combinations
    - Test all primary_symbol combinations
    - Test optional field handling
    - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 2.6_

- [ ] 8. Checkpoint - Ensure generation tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 9. Implement API route handler
  - [ ] 9.1 Create API route at /api/generate-narrative
    - Set up Next.js API route file
    - Implement POST request handling
    - Parse and validate request body
    - _Requirements: 8.1, 8.2_
  
  - [ ] 9.2 Implement request processing pipeline
    - Call validateInput on request body
    - Call generateNarrative on valid input
    - Call applyToneControl on generated narrative
    - Call validateStyle on tone-adjusted narrative
    - _Requirements: 6.4, 8.2_
  
  - [ ] 9.3 Implement response formatting
    - Return 200 with NarrativeBundle on success
    - Return 400 with validation errors on invalid input
    - Return 422 with style violations on style failure
    - Return 500 on unexpected errors
    - _Requirements: 8.2, 8.3, 8.4_
  
  - [ ] 9.4 Write API smoke tests (REQUIRED)
    - Test 200 success response with valid input
    - Test 422 style violation response
    - _Requirements: 8.2, 8.4_
  
  - [ ]* 9.5 Write property test for invalid request error
    - **Property 26: Invalid Request Error Response**
    - **Validates: Requirements 8.3**
  
  - [ ]* 9.6 Write integration tests for API route
    - Test complete request/response cycle
    - Test all status codes
    - Test response structure
    - _Requirements: 8.1, 8.2, 8.3, 8.4_

- [ ] 10. Create golden test fixtures
  - [ ] 10.1 Create Fixture 1: Jewelry with moon symbol
    - Define input JSON for Lunar Devotion Ring
    - Generate expected output for all six sections
    - Validate no forbidden language appears
    - Create regression test
    - _Requirements: 2.7, 3.9, 4.2_
  
  - [ ] 10.2 Create Fixture 2: Apparel with rose symbol
    - Define input JSON for Rose Longing Veil
    - Generate expected output for all six sections
    - Validate no forbidden language appears
    - Create regression test
    - _Requirements: 2.7, 3.9, 4.1_
  
  - [ ] 10.3 Create Fixture 3: Altar piece with candle symbol
    - Define input JSON for Guardian Flame Holder
    - Generate expected output for all six sections
    - Validate no forbidden language appears
    - Create regression test
    - _Requirements: 2.7, 3.9, 4.3_
  
  - [ ]* 10.4 Write end-to-end tests using golden fixtures
    - Test complete generation pipeline for all three fixtures
    - Verify all six sections generated correctly
    - Confirm style rules enforced
    - Validate tone characteristics
    - _Requirements: 2.7, 3.9, 4.1, 4.2, 4.3_

- [ ] 11. Implement error handling and recovery
  - [ ] 11.1 Add error handling to validation module
    - Handle malformed JSON gracefully
    - Provide clear error messages
    - _Requirements: 6.1, 6.2, 6.3_
  
  - [ ] 11.2 Add error handling to generation module
    - Handle missing templates gracefully
    - Provide fallback generation strategies
    - _Requirements: 2.7_
  
  - [ ] 11.3 Add error handling to style validation
    - Handle style violations with detailed reporting
    - Implement optional auto-correction (if desired)
    - _Requirements: 3.9, 5.3_
  
  - [ ]* 11.4 Write unit tests for error handling
    - Test all error scenarios
    - Test error message clarity
    - Test error recovery paths
    - _Requirements: 3.9, 5.3, 6.1, 6.2, 6.3_

- [ ] 12. Final checkpoint - Ensure all tests pass
  - Run complete test suite
  - Verify all property tests pass with 100 iterations
  - Verify all unit tests pass
  - Verify all integration tests pass
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP
- **Minimal required test floor**: Unit tests for input validation, unit tests for style validation, and API smoke tests (200 success + 422 style violation)
- **Deferred until after MVP**: fast-check property tests and golden fixtures (for output tuning phase)
- Each task references specific requirements for traceability
- Checkpoints ensure incremental validation
- Property tests (when implemented) validate universal correctness properties with minimum 100 iterations
- Unit tests validate specific examples and edge cases
- All code should be written in TypeScript with strict type checking
- No external API dependencies or integrations required
