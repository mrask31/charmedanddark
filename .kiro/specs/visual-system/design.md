# Design Document: Visual System

## Overview

The Visual System is the foundational design language for Charmed & Dark, establishing immutable rules that govern all visual aspects of the luxury gothic-romantic ecommerce experience. This system functions as a steering document—a sacred contract that all future features must honor.

Rather than being a traditional component library, this system defines:
- **Color semantics and usage rules** that create ritual atmosphere
- **Typography principles** that maintain gothic elegance
- **Spacing philosophy** that treats silence as a feature
- **Interaction behaviors** that transform clicks into ritual moments
- **Explicit exclusions** that protect against conventional ecommerce pressure patterns

The system is designed to be validated through property-based testing, ensuring that every interface element conforms to the sacred aesthetic principles.

## Architecture

### System Structure

The Visual System is organized into five core domains:

```
Visual System
├── Color Domain
│   ├── Sacred Palette (immutable color definitions)
│   ├── Color Semantics (usage rules by context)
│   └── Color Hierarchy (dominance and balance rules)
├── Typography Domain
│   ├── Type Scale (size and weight hierarchy)
│   ├── Tone Guidelines (voice and language rules)
│   └── Layout Rules (spacing and rhythm)
├── Spacing Domain
│   ├── Spacing Scale (base unit and multipliers)
│   ├── Silence Principles (whitespace as feature)
│   └── Layout Constraints (density limits)
├── Interaction Domain
│   ├── State Definitions (default, hover, active, disabled)
│   ├── Transition Rules (timing and easing)
│   └── Ritual Moments (intentional interaction patterns)
└── Exclusion Domain
    ├── Forbidden Patterns (manipulative UI)
    ├── Forbidden Layouts (dense/aggressive patterns)
    └── Forbidden Effects (flashy/trendy visuals)
```

### Validation Architecture

The system includes a validation layer that can be applied to any interface element:

```
Interface Element
    ↓
Validation Layer
    ├── Color Validator (checks palette compliance)
    ├── Typography Validator (checks tone and hierarchy)
    ├── Spacing Validator (checks density and rhythm)
    ├── Interaction Validator (checks state behaviors)
    └── Exclusion Validator (checks for forbidden patterns)
    ↓
Compliance Report (pass/fail with violations)
```

## Components and Interfaces

### Color Domain

#### Sacred Palette Definition

The Sacred Palette consists of four color families, each with specific semantic meaning:

**Foundation Colors (Black Family)**
- `ink`: Pure black (#000000) - primary text, borders, backgrounds
- `charcoal`: Near-black (#0A0A0A) - secondary backgrounds, subtle contrast
- `near-black`: Softest black (#1A1A1A) - tertiary backgrounds, layering

**Ritual Colors (Deep Red Family)**
- `wine`: Deep burgundy (#4A0E0E) - primary hover states
- `blood`: Rich crimson (#6B1515) - active states, confirmations
- `garnet`: Muted red (#8B2020) - secondary ritual moments

**Mystical Colors (Deep Purple Family)**
- `plum`: Deep purple (#2D1B3D) - featured sections
- `aubergine`: Rich eggplant (#3D2550) - sanctuary elements
- `velvet`: Soft purple (#4D3060) - mystical accents

**Emphasis Colors (Muted Gold Family)**
- `antique-gold`: Matte gold (#8B7355) - primary emphasis
- `brushed-gold`: Subtle gold (#9D8366) - borders, icons
- `aged-gold`: Weathered gold (#7A6347) - rare accents

#### Color Semantics Interface

```typescript
interface ColorSemantics {
  // Context-based color selection
  getBackgroundColor(context: 'primary' | 'secondary' | 'tertiary'): Color;
  getTextColor(emphasis: 'primary' | 'secondary' | 'accent'): Color;
  getInteractionColor(state: 'default' | 'hover' | 'active'): Color;
  getEmphasisColor(importance: 'subtle' | 'moderate' | 'rare'): Color;
  
  // Validation
  validateColorUsage(element: Element): ValidationResult;
  checkColorHierarchy(view: View): HierarchyReport;
}
```

#### Color Hierarchy Rules

1. **Dominance Rule**: Black family must occupy 60-80% of visual space in any view
2. **Accent Balance Rule**: Red, purple, and gold combined must not exceed 30% of visual space
3. **Gold Scarcity Rule**: Gold must appear in less than 5% of visual space
4. **Competition Rule**: No more than two accent colors may appear in the same visual region
5. **Commerce Gradient Rule**: Gold usage increases gradually from discovery (2%) to confirmation (8%)

### Typography Domain

#### Type Scale

The type scale follows a modular scale based on the golden ratio (1.618), starting from a base of 16px:

```
Display: 64px (4.000rem) - Hero moments only
H1: 40px (2.500rem) - Page titles
H2: 32px (2.000rem) - Section headers
H3: 24px (1.500rem) - Subsection headers
Body Large: 20px (1.250rem) - Featured text
Body: 16px (1.000rem) - Primary text
Body Small: 14px (0.875rem) - Secondary text
Caption: 12px (0.750rem) - Metadata, labels
```

#### Typography Interface

```typescript
interface TypographySystem {
  // Type selection
  getTypeStyle(level: TypeLevel): TypeStyle;
  
  // Tone validation
  validateTone(text: string): ToneValidation;
  checkForExclusions(text: string): string[]; // Returns forbidden phrases
  
  // Layout
  getLineHeight(fontSize: number): number;
  getLetterSpacing(fontSize: number): number;
  getParagraphSpacing(context: 'tight' | 'normal' | 'generous'): number;
}

interface TypeStyle {
  fontSize: number;
  fontWeight: number;
  lineHeight: number;
  letterSpacing: number;
  color: Color;
}

interface ToneValidation {
  isValid: boolean;
  violations: ToneViolation[];
}

type ToneViolation = 
  | 'too-playful'
  | 'too-urgent'
  | 'saas-cliche'
  | 'promotional'
  | 'trendy';
```

#### Tone Guidelines

**Approved Tone Characteristics:**
- Romantic but restrained
- Poetic but grounded
- Confident without arrogance
- Inviting without pressure
- Mysterious without obscurity

**Forbidden Phrases and Patterns:**
- "Shop now" → Use "Explore" or "Discover"
- "Limited time" → Never use scarcity language
- "Don't miss out" → Never use FOMO patterns
- "Best seller" → Use "Featured" or "Beloved"
- "Add to cart" → Use "Claim" or "Acquire"
- Exclamation marks → Use sparingly, only for genuine delight
- ALL CAPS → Never use for emphasis

### Spacing Domain

#### Spacing Scale

The spacing scale uses a base unit of 8px with a multiplier system:

```
xs: 4px (0.5 × base)
sm: 8px (1 × base)
md: 16px (2 × base)
lg: 24px (3 × base)
xl: 32px (4 × base)
2xl: 48px (6 × base)
3xl: 64px (8 × base)
4xl: 96px (12 × base)
5xl: 128px (16 × base)
```

#### Spacing Interface

```typescript
interface SpacingSystem {
  // Spacing selection
  getSpacing(size: SpacingSize): number;
  
  // Context-based spacing
  getComponentSpacing(component: ComponentType): SpacingConfig;
  getSectionSpacing(importance: 'primary' | 'secondary'): number;
  
  // Validation
  validateDensity(view: View): DensityReport;
  checkSilence(view: View): SilenceScore; // 0-100, higher is better
}

interface SpacingConfig {
  padding: {
    top: number;
    right: number;
    bottom: number;
    left: number;
  };
  margin: {
    top: number;
    bottom: number;
  };
  gap: number; // For flex/grid layouts
}

interface DensityReport {
  isValid: boolean;
  elementsPerViewport: number;
  maxAllowed: number;
  violations: DensityViolation[];
}
```

#### Silence Principles

1. **Breathing Room Rule**: Every element must have minimum 24px (lg) spacing from adjacent elements
2. **Section Separation Rule**: Major sections must have minimum 96px (4xl) vertical spacing
3. **Viewport Density Rule**: No more than 5-7 distinct visual elements per viewport height
4. **Text Block Rule**: Paragraphs must have minimum 32px (xl) spacing between them
5. **Commerce Clarity Rule**: Spacing may decrease by up to 25% in cart/checkout states while maintaining minimum breathing room

### Interaction Domain

#### State Definitions

Every interactive element has four states:

```typescript
interface InteractionStates {
  default: StateStyle;
  hover: StateStyle;
  active: StateStyle;
  disabled: StateStyle;
}

interface StateStyle {
  color: Color;
  backgroundColor: Color;
  borderColor: Color;
  transform?: string;
  transition: TransitionConfig;
}

interface TransitionConfig {
  property: string[];
  duration: number; // milliseconds
  easing: EasingFunction;
  delay?: number;
}

type EasingFunction = 
  | 'ease-in-out'
  | 'ease-out'
  | 'cubic-bezier(0.4, 0.0, 0.2, 1)'; // Material Design standard
```

#### Ritual Moment Patterns

**Hover State (Ritual Invitation)**
- Color transitions to deep red (wine/blood)
- Subtle scale transform (1.02x maximum)
- Transition duration: 300ms
- Easing: ease-in-out

**Active State (Ritual Commitment)**
- Color deepens to blood red
- Slight scale reduction (0.98x)
- Transition duration: 150ms
- Easing: ease-out

**Disabled State (Ritual Unavailable)**
- Opacity: 0.4
- Cursor: not-allowed
- No color change on hover
- Subtle visual indication without drawing attention

#### Interaction Interface

```typescript
interface InteractionSystem {
  // State management
  getStateStyle(element: Element, state: InteractionState): StateStyle;
  
  // Transition configuration
  getTransition(interactionType: InteractionType): TransitionConfig;
  
  // Validation
  validateInteraction(element: Element): InteractionValidation;
  checkRitualMoment(element: Element): boolean; // Is this a ritual moment?
}

interface InteractionValidation {
  isValid: boolean;
  usesDeepRed: boolean;
  transitionIsSubtle: boolean;
  noFlashyEffects: boolean;
  violations: string[];
}
```

### Exclusion Domain

#### Forbidden Pattern Detection

```typescript
interface ExclusionValidator {
  // Pattern detection
  detectPopups(view: View): Popup[];
  detectDiscountBanners(view: View): Banner[];
  detectCountdownTimers(view: View): Timer[];
  detectScarcityMechanics(view: View): ScarcityElement[];
  detectGamification(view: View): GamificationElement[];
  detectNotificationPatterns(view: View): NotificationElement[];
  
  // Layout detection
  detectDenseGrids(view: View): Grid[];
  detectInfiniteScroll(view: View): boolean;
  
  // Effect detection
  detectFlashyEffects(element: Element): Effect[];
  detectHighEnergyGradients(element: Element): Gradient[];
  detectBrightColors(element: Element): Color[];
  
  // Comprehensive validation
  validateExclusions(view: View): ExclusionReport;
}

interface ExclusionReport {
  isValid: boolean;
  violations: ExclusionViolation[];
  severity: 'critical' | 'warning';
}

interface ExclusionViolation {
  type: ExclusionType;
  element: Element;
  description: string;
  recommendation: string;
}
```

## Data Models

### Color Model

```typescript
interface Color {
  name: string;
  hex: string;
  rgb: { r: number; g: number; b: number };
  hsl: { h: number; s: number; l: number };
  family: 'black' | 'red' | 'purple' | 'gold';
  semanticUsage: ColorUsage[];
}

type ColorUsage = 
  | 'background'
  | 'text'
  | 'border'
  | 'hover'
  | 'active'
  | 'emphasis'
  | 'ritual-moment'
  | 'sanctuary-element';
```

### Typography Model

```typescript
interface TypeStyle {
  level: TypeLevel;
  fontSize: number;
  fontWeight: number;
  lineHeight: number;
  letterSpacing: number;
  color: Color;
  allowedContexts: Context[];
}

type TypeLevel = 
  | 'display'
  | 'h1'
  | 'h2'
  | 'h3'
  | 'body-large'
  | 'body'
  | 'body-small'
  | 'caption';

type Context = 
  | 'discovery'
  | 'product-detail'
  | 'cart'
  | 'checkout'
  | 'confirmation';
```

### Spacing Model

```typescript
interface SpacingConfig {
  scale: SpacingScale;
  contextMultipliers: Record<Context, number>;
  minimums: {
    elementSpacing: number;
    sectionSpacing: number;
    paragraphSpacing: number;
  };
}

interface SpacingScale {
  xs: number;
  sm: number;
  md: number;
  lg: number;
  xl: number;
  '2xl': number;
  '3xl': number;
  '4xl': number;
  '5xl': number;
}
```

### Interaction Model

```typescript
interface InteractionConfig {
  states: InteractionStates;
  transitions: Record<StateTransition, TransitionConfig>;
  ritualMoments: RitualMomentConfig[];
}

interface RitualMomentConfig {
  trigger: 'hover' | 'click' | 'focus';
  colorTransition: ColorTransition;
  transformEffect?: TransformEffect;
  timing: TransitionConfig;
}

interface ColorTransition {
  from: Color;
  to: Color;
  property: 'color' | 'backgroundColor' | 'borderColor';
}
```

### Validation Model

```typescript
interface ValidationResult {
  isValid: boolean;
  score: number; // 0-100
  violations: Violation[];
  recommendations: string[];
}

interface Violation {
  rule: string;
  severity: 'critical' | 'warning' | 'info';
  element: Element;
  description: string;
  fix: string;
}
```


## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system—essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

### Property Reflection

After analyzing all acceptance criteria, I identified the following redundancies:

- **Exclusion properties (6.1-6.6, 7.1-7.2, 8.1-8.2)** can be consolidated into a single comprehensive "Forbidden Patterns Detection" property
- **Color usage properties (1.2, 1.3, 1.4)** share the same pattern (semantic color assignment) and can be combined
- **Density properties (4.3, 7.3)** both test layout density and can be unified
- **Urgency pattern detection (6.x, 9.5, 10.5)** all test for pressure energy and can be consolidated

The following properties represent the unique, non-redundant validation rules:

### Property 1: Ritual Moments Use Deep Red

*For any* interactive element marked as a ritual moment (hover state, confirmation, intentional action), the element's color must be from the deep red family (wine, blood, or garnet).

**Validates: Requirements 1.2**

### Property 2: Sanctuary Elements Use Deep Purple

*For any* element marked as a sanctuary element or featured section, the element's color must be from the deep purple family (plum, aubergine, or velvet).

**Validates: Requirements 1.3**

### Property 3: Emphasis Elements Use Muted Gold

*For any* element marked for emphasis (borders, icons, key typography), the element's color must be from the muted gold family (antique-gold, brushed-gold, or aged-gold).

**Validates: Requirements 1.4**

### Property 4: Black Dominance in Visual Space

*For any* rendered interface view, black and near-black tones must occupy between 60% and 80% of the total visual space.

**Validates: Requirements 2.1**

### Property 5: Gold Scarcity

*For any* rendered interface view, muted gold colors must occupy less than 5% of the total visual space, with the exception of confirmation states where it may reach up to 8%.

**Validates: Requirements 2.2, 9.3**

### Property 6: Gold Excluded from Body Text

*For any* text element with type level "body", "body-large", or "body-small", the text color must not be from the gold family.

**Validates: Requirements 2.4**

### Property 7: Forbidden Phrase Detection

*For any* text content in the interface, the text must not contain forbidden phrases from the exclusion list (e.g., "Shop now", "Limited time", "Don't miss out", "Best seller").

**Validates: Requirements 3.4**

### Property 8: Minimum Spacing Requirements

*For any* layout, all adjacent elements must have at least 24px spacing between them, and major sections must have at least 96px vertical spacing.

**Validates: Requirements 4.1**

### Property 9: Maximum Layout Density

*For any* viewport, the layout must contain no more than 7 distinct visual elements per viewport height, ensuring generous whitespace.

**Validates: Requirements 4.3, 7.3**

### Property 10: Hover States Use Deep Red

*For any* interactive element, when in hover state, the element's color must transition to a color from the deep red family.

**Validates: Requirements 5.1**

### Property 11: Subtle Transition Timing

*For any* interactive element transition, the transition duration must be between 150ms and 500ms, and must use ease-in-out or ease-out easing functions.

**Validates: Requirements 5.2**

### Property 12: No Excessive Transform Effects

*For any* interactive element, scale transforms must not exceed 1.05x on hover or go below 0.95x on active state, ensuring subtle visual feedback.

**Validates: Requirements 5.3**

### Property 13: Forbidden Pattern Detection

*For any* rendered interface view, the view must not contain any of the following forbidden patterns: popups, discount banners, countdown timers, scarcity messaging (e.g., "Only X left"), gamification elements, notification-driven engagement patterns, dense product grids (more than 4 items per row), infinite scroll, high-energy gradients, or flashy visual effects.

**Validates: Requirements 6.1, 6.2, 6.3, 6.4, 6.5, 6.6, 7.1, 7.2, 8.1, 8.2**

### Property 14: Color Brightness and Saturation Limits

*For any* color used in the interface, the HSL saturation must not exceed 40% and the lightness must not exceed 60%, preventing bright, saturated, or neon colors.

**Validates: Requirements 1.6, 8.3**

### Property 15: Discovery State Maximum Atmosphere

*For any* interface in discovery or product-detail state, the layout must maintain maximum spacing (no reduction from base scale) and minimum density (5 or fewer elements per viewport).

**Validates: Requirements 9.1**

### Property 16: Transactional State Controlled Clarity

*For any* interface in cart or checkout state, spacing may be reduced by up to 25% from base scale, but must still maintain minimum spacing requirements (18px between elements, 72px between sections) and must not contain any urgency patterns.

**Validates: Requirements 9.2, 9.5**

### Property 17: Accent Color Balance

*For any* visual region (defined as a 300px × 300px area), no more than two accent colors (red, purple, or gold) may appear, and no single accent may occupy more than 40% of that region's space.

**Validates: Requirements 1.5**

### Property 18: No Pressure Energy Patterns

*For any* interface element, the element must not exhibit pressure energy characteristics: countdown timers, scarcity messaging, urgent language, aggressive animations (duration < 100ms), or excessive color saturation (> 40%).

**Validates: Requirements 10.5**

## Error Handling

### Validation Errors

The Visual System validation layer produces structured error reports when violations are detected:

```typescript
interface ValidationError {
  code: ErrorCode;
  severity: 'critical' | 'warning' | 'info';
  element: ElementIdentifier;
  rule: string;
  message: string;
  fix: string;
  propertyViolated: number; // References property number
}

type ErrorCode =
  | 'COLOR_HIERARCHY_VIOLATION'
  | 'FORBIDDEN_PATTERN_DETECTED'
  | 'SPACING_INSUFFICIENT'
  | 'DENSITY_EXCEEDED'
  | 'FORBIDDEN_PHRASE_DETECTED'
  | 'TRANSITION_TOO_FAST'
  | 'TRANSFORM_EXCESSIVE'
  | 'GOLD_OVERUSED'
  | 'ACCENT_COMPETITION'
  | 'PRESSURE_ENERGY_DETECTED';
```

**Error Handling Strategy:**

1. **Critical Violations**: Block rendering/deployment until fixed
   - Forbidden patterns detected (popups, countdown timers)
   - Color hierarchy violations (black not dominant)
   - Pressure energy patterns

2. **Warnings**: Allow rendering but log for review
   - Spacing slightly below minimum
   - Gold usage approaching limit
   - Transition timing outside ideal range

3. **Info**: Suggestions for improvement
   - Could use more whitespace
   - Consider reducing density
   - Alternative phrasing suggestions

### Graceful Degradation

If validation cannot be performed (e.g., in development environments without full context):

1. **Assume compliance** for non-critical properties
2. **Log warnings** for properties that should be checked
3. **Provide fallback values** that err on the side of more atmosphere (more spacing, less density, more conservative color usage)

## Testing Strategy

### Dual Testing Approach

The Visual System requires both unit tests and property-based tests for comprehensive validation:

**Unit Tests** focus on:
- Specific color palette definitions (exact hex values)
- Forbidden phrase list completeness
- Spacing scale calculations
- State transition configurations
- Edge cases (empty views, single elements, maximum density)

**Property-Based Tests** focus on:
- Universal color usage rules across all interfaces
- Spacing requirements across all layouts
- Density limits across all viewports
- Forbidden pattern detection across all views
- Transition timing across all interactions

### Property-Based Testing Configuration

**Library Selection:**
- **TypeScript/JavaScript**: Use `fast-check` library
- **Python**: Use `hypothesis` library
- **Other languages**: Select appropriate PBT library for target language

**Test Configuration:**
- Minimum 100 iterations per property test
- Each test must reference its design property number
- Tag format: `Feature: visual-system, Property {N}: {property title}`

**Example Test Structure:**

```typescript
// Feature: visual-system, Property 4: Black Dominance in Visual Space
test('black dominance in visual space', () => {
  fc.assert(
    fc.property(
      arbitraryInterfaceView(), // Generates random interface views
      (view) => {
        const colorDistribution = calculateColorDistribution(view);
        const blackPercentage = colorDistribution.black + colorDistribution.nearBlack;
        return blackPercentage >= 60 && blackPercentage <= 80;
      }
    ),
    { numRuns: 100 }
  );
});
```

### Test Data Generators

Property-based tests require generators for:

1. **Interface Views**: Random layouts with varying elements, colors, spacing
2. **Interactive Elements**: Random buttons, links, inputs with various states
3. **Text Content**: Random strings with varying lengths and contexts
4. **Color Applications**: Random color assignments to elements
5. **Spacing Configurations**: Random spacing values within and outside valid ranges
6. **Commerce States**: Random views in discovery, cart, checkout, confirmation states

### Integration Testing

Beyond property tests, integration tests should verify:

1. **Cross-domain consistency**: Color, typography, and spacing work together harmoniously
2. **State transitions**: Moving between commerce states maintains aesthetic integrity
3. **Responsive behavior**: Rules apply correctly across viewport sizes
4. **Theme composition**: Multiple visual system rules can be applied simultaneously without conflict

### Validation in Development

Developers should have access to:

1. **Real-time validation**: IDE plugins or dev tools that highlight violations as code is written
2. **Visual regression testing**: Screenshot comparisons to detect unintended visual changes
3. **Accessibility validation**: Ensure color contrast meets WCAG standards despite dark palette
4. **Performance validation**: Ensure validation layer doesn't impact runtime performance

## Implementation Notes

### Framework Agnostic Design

While the Visual System is designed for a Next.js frontend, the principles are framework-agnostic:

- **Color rules** apply regardless of CSS-in-JS, Tailwind, or vanilla CSS
- **Spacing rules** apply regardless of layout system (Flexbox, Grid, absolute positioning)
- **Validation logic** can be implemented in any language with appropriate PBT library

### Validation Layer Implementation

The validation layer should be implemented as:

1. **Build-time validation**: Run during CI/CD to catch violations before deployment
2. **Development-time validation**: Provide immediate feedback in dev environment
3. **Runtime validation** (optional): For dynamic content, validate on render

### Extensibility

The Visual System is designed to be extended:

- **New colors**: Can be added to families if they maintain aesthetic integrity
- **New spacing values**: Can be added to scale if they follow multiplier pattern
- **New interaction patterns**: Can be added if they follow ritual moment principles
- **New exclusions**: Can be added as new anti-patterns are identified

### Migration Strategy

For existing codebases adopting this system:

1. **Phase 1**: Implement validation layer, run in audit mode (log violations, don't block)
2. **Phase 2**: Fix critical violations (forbidden patterns, color hierarchy)
3. **Phase 3**: Fix warnings (spacing, density, transitions)
4. **Phase 4**: Enable blocking mode (prevent new violations)
5. **Phase 5**: Refine and optimize (improve aesthetic quality beyond minimum compliance)
