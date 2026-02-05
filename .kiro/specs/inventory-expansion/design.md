# Design Document: Inventory Expansion

## Overview

This design describes a CSV ingestion and data generation system that expands the product inventory by ingesting canonical CSV data files containing 56 canonical products total (House + Uniform combined) and 32 variant SKUs. The system reads two CSV files (canonical_products_pass1.csv and product_variants_pass1.csv), transforms the data into TypeScript modules at their existing locations in the repository, and ensures all products display correctly on /shop and /uniform pages with functional variant selection.

The design preserves existing Mirror discipline (11 mirror-eligible products with assigned roles), maintains the established brand voice in product descriptions, and implements a robust variant system that updates pricing and images dynamically.

## Architecture

### System Components

```
┌─────────────────────────────────────────────────────────────┐
│                     CSV Ingestion Layer                      │
│  ┌────────────────────┐      ┌──────────────────────────┐  │
│  │ CSV Parser         │      │ Data Validator           │  │
│  │ - Read CSV files   │─────▶│ - Validate fields        │  │
│  │ - Parse rows       │      │ - Check required data    │  │
│  └────────────────────┘      └──────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                  Data Transformation Layer                   │
│  ┌────────────────────┐      ┌──────────────────────────┐  │
│  │ Product Builder    │      │ Variant Builder          │  │
│  │ - Map categories   │      │ - Generate IDs           │  │
│  │ - Preserve Mirror  │      │ - Create labels          │  │
│  │ - Calculate prices │      │ - Calculate prices       │  │
│  └────────────────────┘      └──────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                  TypeScript Generation Layer                 │
│  ┌────────────────────┐      ┌──────────────────────────┐  │
│  │ Module Writer      │      │ Logging System           │  │
│  │ - Write products.ts│      │ - Count products         │  │
│  │ - Write apparel.ts │      │ - Count variants         │  │
│  └────────────────────┘      └──────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                      Display Layer                           │
│  ┌────────────────────┐      ┌──────────────────────────┐  │
│  │ /shop Page         │      │ /uniform Page            │  │
│  │ - Filter House     │      │ - Filter Uniform         │  │
│  │ - Show products    │      │ - Show apparel           │  │
│  └────────────────────┘      └──────────────────────────┘  │
│                                                              │
│  ┌──────────────────────────────────────────────────────┐  │
│  │ Product Detail Page                                   │  │
│  │ - Show variant selector (if 2+ variants)             │  │
│  │ - Update price/image on selection                    │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

### Data Flow

1. **CSV Ingestion**: Read and parse canonical_products_pass1.csv and product_variants_pass1.csv
2. **Validation**: Verify all required fields are present and valid
3. **Transformation**: Convert CSV data to Product and ProductVariant objects
4. **Mirror Preservation**: Load existing products.ts to preserve mirrorEligible and mirrorRole
5. **Generation**: Write complete TypeScript modules with all products and variants
6. **Display**: Existing pages automatically pick up new data and render products

## Components and Interfaces

### CSV Parser Component

**Purpose**: Read and parse CSV files into structured data

**Interface**:
```typescript
interface CSVParser {
  parseProductsCSV(filePath: string): Promise<CanonicalProduct[]>;
  parseVariantsCSV(filePath: string): Promise<ProductVariantRow[]>;
}

interface CanonicalProduct {
  canon_sku: string;
  base_sku: string;
  name_raw: string;
  slug_suggestion: string;
  categories_raw: string;
  description_raw: string;
  price_usd: number;
  sale_price_usd?: number;
  currency: string;
  track_inventory: boolean;
  qty_base: number;
  backorder: boolean;
  realm: 'house' | 'uniform';
  variant_model: 'none' | 'one_dim' | 'two_dim';
  sku_count: number;
  image_url_base: string;
}

interface ProductVariantRow {
  canon_sku: string;
  variant_sku: string;
  option1: string;
  option2?: string;
  price_usd: number;
  sale_price_usd?: number;
  qty: number;
  image_url?: string;
  name_raw: string;
}
```

**Implementation Notes**:
- Use Node.js `fs` module to read files
- Use `csv-parse` library for parsing (or similar)
- Handle semicolon-separated image URLs in image_url_base
- Trim whitespace from all string fields
- Convert numeric strings to numbers
- Handle empty optional fields gracefully

### Data Validator Component

**Purpose**: Validate parsed CSV data before transformation

**Interface**:
```typescript
interface DataValidator {
  validateProduct(product: CanonicalProduct): ValidationResult;
  validateVariant(variant: ProductVariantRow): ValidationResult;
}

interface ValidationResult {
  valid: boolean;
  errors: string[];
}
```

**Validation Rules**:
- **Products**: canon_sku, base_sku, name_raw, slug_suggestion, price_usd, realm, variant_model, sku_count must be present
- **Variants**: canon_sku, variant_sku, option1, price_usd, qty must be present
- **Realm**: Must be 'house' or 'uniform'
- **Variant Model**: Must be 'none', 'one_dim', or 'two_dim'
- **Prices**: Must be positive numbers
- **Quantities**: Must be non-negative integers

### Product Builder Component

**Purpose**: Transform CSV data into Product objects

**Interface**:
```typescript
interface ProductBuilder {
  buildProduct(
    canonical: CanonicalProduct,
    variants: ProductVariantRow[],
    existingProduct?: Product
  ): Product;
}
```

**Transformation Logic**:

1. **Category Mapping**:
   - Parse categories_raw (may be empty or contain multiple categories)
   - Map to standardized categories:
     - "Candles & Scent"
     - "Ritual Drinkware"
     - "Wall Objects"
     - "Decor Objects"
     - "Table & Display"
     - "Objects of Use"
   - If categories_raw is empty or ambiguous, infer from name_raw:
     - "candle", "incense" → "Candles & Scent"
     - "mug", "cup", "glass", "teacup" → "Ritual Drinkware"
     - "wall", "art", "shelf" → "Wall Objects"
     - "vase", "frame", "bowl", "bookends" → "Decor Objects"
     - "board", "tray", "dish", "coaster" → "Table & Display"
     - "journal", "matches", "sage", "knives" → "Objects of Use"
   - Log the mapping decision for review

2. **Description Preservation**:
   - If existingProduct exists, use its description field exactly as-is
   - Otherwise, store description_raw as the canonical long description without transformation
   - Do not attempt to parse or restructure description_raw
   - The CSV should contain properly formatted descriptions, or they will be used verbatim

3. **Mirror Discipline Preservation**:
   - If existingProduct exists:
     - Preserve mirrorEligible value
     - Preserve mirrorRole value
   - If new product:
     - Default mirrorEligible to false
     - Do not set mirrorRole
   - If realm is 'uniform':
     - Force mirrorEligible to false
     - Do not set mirrorRole

4. **Pricing**:
   - pricePublic = sale_price_usd if present, else price_usd
   - priceSanctuary = Math.round(pricePublic * 0.9 * 100) / 100

5. **Images**:
   - Split image_url_base by semicolon
   - Trim whitespace from each URL
   - Filter out empty strings
   - Store as images array

6. **Stock Status**:
   - inStock = qty_base > 0

7. **Status**:
   - If existingProduct exists, preserve its status value
   - Otherwise, default to "core" if not specified in CSV

### Variant Builder Component

**Purpose**: Transform variant CSV rows into ProductVariant objects

**Interface**:
```typescript
interface VariantBuilder {
  buildVariants(
    variantRows: ProductVariantRow[],
    canonicalProduct: CanonicalProduct
  ): ProductVariant[];
}
```

**Transformation Logic**:

1. **Variant ID Generation**:
   - Create stable ID from canon_sku and options
   - Normalization rules:
     - Convert to lowercase
     - Replace spaces with hyphens
     - Remove special characters (/, &, etc.)
     - Collapse multiple hyphens to single hyphen
     - Trim leading/trailing hyphens
   - Format: `${normalized_canon_sku}-${normalized_option1}-${normalized_option2 || ''}`
   - If collision detected, append `-${variant_sku}` to ensure uniqueness
   - Example: "CRS-VLV-4-PC" + "Full/Queen" + "Black" → "crs-vlv-4-pc-full-queen-black"

2. **Label Generation**:
   - If option2 exists: `${option1} / ${option2}`
   - If only option1: `${option1}`
   - Examples:
     - "Full/Queen" + "Black" → "Full/Queen / Black"
     - "Edgar Allen Poe" + undefined → "Edgar Allen Poe"
     - "Queen" + undefined → "Queen"

3. **Pricing**:
   - pricePublic = sale_price_usd if present, else price_usd
   - priceSanctuary = Math.round(pricePublic * 0.9 * 100) / 100

4. **Availability**:
   - inStock = qty > 0

5. **Default Variant**:
   - Select default variant using this priority:
     1. Highest qty (most in stock)
     2. If tie, lowest price (most accessible)
     3. If still tied, first in array
   - Mark selected variant as isDefault: true
   - All others isDefault: false

6. **Images**:
   - If image_url is present and non-empty, include it
   - Otherwise, omit image field (will fall back to product images)

### Module Writer Component

**Purpose**: Generate TypeScript module files

**Interface**:
```typescript
interface ModuleWriter {
  writeProductsModule(products: Product[]): Promise<void>;
  writeApparelModule(apparel: Product[]): Promise<void>;
}
```

**Generation Strategy**:

1. **File Structure**:
   - Write to the existing module locations in this repository (preserve current paths)
   - Preserve existing type definitions
   - Preserve helper functions (createSlug, calculateSanctuaryPrice)
   - Replace product data array completely

2. **Products Module (lib/products.ts)**:
   - Filter products where realm === 'house'
   - Sort by category, then by name
   - Format as TypeScript object literals
   - Include all fields including optional variants array

3. **Apparel Module (lib/apparel.ts)**:
   - Filter products where realm === 'uniform'
   - Convert to ApparelItem interface (map Product fields to ApparelItem fields)
   - Sort by cadence (core first), then by name
   - Format as TypeScript object literals
   - Ensure mirrorEligible is always false or omitted

4. **Formatting**:
   - Use 2-space indentation
   - Include comments for each product category section
   - Format multi-line strings with proper escaping
   - Format arrays with proper line breaks for readability

### Logging System Component

**Purpose**: Track and report generation statistics

**Interface**:
```typescript
interface Logger {
  logProductCount(houseCount: number, uniformCount: number): void;
  logVariantCount(productsWithVariants: number, totalVariants: number): void;
  logCategoryMapping(product: string, category: string, inferred: boolean): void;
}
```

**Logging Output**:
```
=== Inventory Expansion Complete ===
Total Canonical Products: 56
House Products: [count]
Uniform Products: [count]
Products with Variants: [count]
Total Variants: 32
Category Mappings (inferred): [count]
  - "[Product Name]" → "[Category]" (inferred from name)
```

## Data Models

### Product Type (Existing)

```typescript
export interface Product {
  id: string;
  slug: string;
  name: string;
  realm: ProductRealm;
  category: ProductCategory;
  status: ProductStatus;
  pricePublic: number;
  priceSanctuary: number;
  shortDescription: string;
  description: ProductDescription;
  images: string[];
  inStock: boolean;
  mirrorEligible?: boolean;
  mirrorRole?: MirrorRole;
  variants?: ProductVariant[];
}
```

### ProductVariant Type (Existing)

```typescript
export interface ProductVariant {
  id: string;
  label: string;
  pricePublic: number;
  priceSanctuary: number;
  inStock: boolean;
  isDefault?: boolean;
  image?: string;
}
```

### ApparelItem Type (Existing)

```typescript
export interface ApparelItem {
  id: string;
  slug: string;
  name: string;
  category: ApparelCategory;
  cadence: ApparelCadence;
  dropTag?: DropTag;
  pricePublic: number;
  priceSanctuary: number;
  shortDescription: string;
  ritualIntro: string;
  details: string[];
  whoFor: string;
  images: string[];
  active: boolean;
  mirrorEligible?: false;
}
```

### Mapping Between Product and ApparelItem

When converting Product (realm='uniform') to ApparelItem:

```typescript
function productToApparelItem(product: Product): ApparelItem {
  return {
    id: product.id,
    slug: product.slug,
    name: product.name,
    category: inferApparelCategory(product.category),
    cadence: product.status === 'core' ? 'core' : 'drop',
    dropTag: inferDropTag(product.name),
    pricePublic: product.pricePublic,
    priceSanctuary: product.priceSanctuary,
    shortDescription: product.shortDescription,
    ritualIntro: product.description.ritualIntro,
    details: product.description.objectDetails,
    whoFor: product.description.whoFor,
    images: product.images,
    active: product.status !== 'archive',
    mirrorEligible: false
  };
}
```

**Category Inference**:
- "T-Shirts" if name contains "tee", "shirt", "top"
- "Hoodies" if name contains "hoodie", "pullover", "zip"
- "Accessories" if name contains "beanie", "hat", "bag"
- Default to "T-Shirts" if unclear

**Drop Tag Inference**:
- "valentines" if name contains "valentine"
- "halloween" if name contains "halloween"
- "winter" if name contains "winter"
- "anniversary" if name contains "anniversary"
- undefined for core items


## Correctness Properties

A property is a characteristic or behavior that should hold true across all valid executions of a system—essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.

### CSV Ingestion Properties

**Property 1: Required field validation**
*For any* CSV row (product or variant), if any required field is missing, then validation should fail and report a descriptive error
**Validates: Requirements 1.3, 1.5**

**Property 2: Variant-to-product association**
*For any* variant record with a canon_sku, there should exist a canonical product with that same canon_sku, and the variant should be associated with that product
**Validates: Requirements 1.4**

### Data Generation Properties

**Property 3: Realm-based file separation**
*For any* product in the generated lib/products.ts file, its realm should equal 'house', and for any product in lib/apparel.ts, its realm should equal 'uniform'
**Validates: Requirements 2.1, 2.2**

**Property 4: Category mapping completeness**
*For any* product, its category should be one of the six standardized categories, and if categories_raw was empty or ambiguous, the mapping decision should be logged
**Validates: Requirements 2.4, 2.5**

**Property 5: Mirror discipline preservation**
*For any* existing product that is regenerated, its mirrorEligible and mirrorRole values should remain unchanged from the original
**Validates: Requirements 2.6**

**Property 6: Apparel mirror exclusion**
*For any* product where realm='uniform', mirrorEligible should be false or undefined (never true)
**Validates: Requirements 2.7**

**Property 7: Description preservation**
*For any* existing product that is regenerated, its description field should remain unchanged from the original
**Validates: Requirements 2.8**

**Property 8: Status default assignment**
*For any* product where status is not explicitly defined in the CSV, the generated product should have status='core'
**Validates: Requirements 2.9**

### Variant Generation Properties

**Property 9: Variant ID stability**
*For any* two variants with identical option1 and option2 values, their generated IDs should be identical
**Validates: Requirements 3.1**

**Property 10: Label generation format**
*For any* variant, if option2 exists, the label should be "${option1} / ${option2}", otherwise it should be "${option1}"
**Validates: Requirements 3.2**

**Property 11: Price precedence**
*For any* variant, if sale_price_usd is present and non-zero, pricePublic should equal sale_price_usd, otherwise it should equal price_usd
**Validates: Requirements 3.3**

**Property 12: Sanctuary pricing calculation**
*For any* price value, the calculated sanctuary price should equal Math.round(price * 0.9 * 100) / 100
**Validates: Requirements 3.4**

**Property 13: Availability determination**
*For any* variant, if qty > 0, inStock should be true, otherwise inStock should be false
**Validates: Requirements 3.5**

**Property 14: Variant image inclusion**
*For any* variant with a non-empty image_url, the generated variant should include an image field with that URL
**Validates: Requirements 3.6**

**Property 15: Default variant selection**
*For any* product with variants, the variant marked as isDefault should be the one with highest qty, or if tied, lowest price, or if still tied, the first variant
**Validates: Requirements 3.7**

### Display Properties

**Property 16: Shop page filtering**
*For any* product displayed on /shop, it should have realm='house' and status != 'archive'
**Validates: Requirements 4.1**

**Property 17: Uniform page filtering**
*For any* product displayed on /uniform, it should have realm='uniform' and status != 'archive'
**Validates: Requirements 5.1**

**Property 18: Product display completeness**
*For any* product displayed on /shop or /uniform, the rendered HTML should contain the product name, at least one image, and pricing information
**Validates: Requirements 4.2, 5.2**

**Property 19: Variant indication without exposure**
*For any* product with 2 or more variants displayed on /shop or /uniform, the listing should indicate variant availability without displaying variant selectors or dropdowns
**Validates: Requirements 4.3, 5.3**

### Variant Selection Properties

**Property 20: Variant selector conditional display**
*For any* product detail page, a variant selector should be displayed if and only if the product has 2 or more variants
**Validates: Requirements 6.1, 6.2**

**Property 21: Price update on variant selection**
*For any* variant selection, the displayed public price and sanctuary price should update to match the selected variant's pricePublic and priceSanctuary
**Validates: Requirements 6.3, 6.4**

**Property 22: Image update on variant selection**
*For any* variant with an image field, when that variant is selected, the displayed product image should update to the variant's image
**Validates: Requirements 6.5**

**Property 23: Default variant initial display**
*For any* product detail page with variants, the initially displayed information (price, image, availability) should match the variant marked as isDefault
**Validates: Requirements 6.6**

### Type Safety Properties

**Property 24: Generated data type conformance**
*For any* generated product or variant object, it should conform to the TypeScript Product or ProductVariant interface without type errors
**Validates: Requirements 7.3**

## Error Handling

### CSV Parsing Errors

**Missing File**:
- Error: "CSV file not found: {filePath}"
- Action: Exit with error code 1
- User guidance: Verify file path and ensure CSV files are in the correct location

**Malformed CSV**:
- Error: "Failed to parse CSV: {error details}"
- Action: Log the problematic row number and content
- User guidance: Check CSV format, ensure proper escaping of quotes and commas

**Missing Required Fields**:
- Error: "Product {canon_sku} missing required field: {fieldName}"
- Action: Log all validation errors, continue parsing other rows
- User guidance: Review CSV file and add missing fields

**Invalid Data Types**:
- Error: "Product {canon_sku} has invalid {fieldName}: expected {type}, got {value}"
- Action: Log error, skip the problematic product
- User guidance: Correct data types in CSV (e.g., ensure prices are numbers)

### Data Transformation Errors

**Orphaned Variants**:
- Error: "Variant {variant_sku} references non-existent product {canon_sku}"
- Action: Log warning, skip the variant
- User guidance: Ensure all variants reference valid canonical products

**Category Mapping Failure**:
- Error: "Unable to map category for product {name}: categories_raw='{value}'"
- Action: Use fallback category inference from name, log the decision
- User guidance: Review inferred category, update CSV if incorrect

**Image URL Parsing**:
- Error: "Invalid image URL for product {canon_sku}: {url}"
- Action: Log warning, skip the invalid URL, continue with other images
- User guidance: Verify image URLs are properly formatted

### File Generation Errors

**Write Permission Denied**:
- Error: "Cannot write to {filePath}: Permission denied"
- Action: Exit with error code 1
- User guidance: Check file permissions, ensure directory is writable

**TypeScript Compilation Errors**:
- Error: "Generated TypeScript has compilation errors: {errors}"
- Action: Log errors, do not overwrite existing files
- User guidance: Review generated code, report issue if structure is incorrect

### Runtime Display Errors

**Missing Product Data**:
- Error: "Product {slug} not found in products array"
- Action: Display 404 page
- User guidance: Verify product exists in generated data files

**Invalid Variant Selection**:
- Error: "Variant {variantId} not found for product {productId}"
- Action: Fall back to default variant
- User guidance: This should not occur if data is properly generated

## Testing Strategy

### Dual Testing Approach

This feature requires both unit tests and property-based tests to ensure comprehensive coverage:

- **Unit tests**: Verify specific examples, edge cases, and error conditions
- **Property tests**: Verify universal properties across all inputs

Together, these approaches provide comprehensive coverage where unit tests catch concrete bugs and property tests verify general correctness.

### Unit Testing

Unit tests should focus on:

1. **Specific CSV Examples**:
   - Test parsing the actual canonical_products_pass1.csv (56 products)
   - Test parsing the actual product_variants_pass1.csv (32 variants)
   - Verify specific products are correctly transformed

2. **Edge Cases**:
   - Empty CSV files
   - CSV with only headers
   - Products with no variants
   - Products with maximum variants
   - Missing optional fields
   - Empty string values

3. **Error Conditions**:
   - Malformed CSV syntax
   - Missing required fields
   - Invalid data types
   - Orphaned variants
   - File write failures

4. **Integration Points**:
   - CSV parsing → Data transformation pipeline
   - Data transformation → TypeScript generation
   - Generated files → Page rendering

### Property-Based Testing

Property tests should be configured with:
- **Minimum 100 iterations** per test (due to randomization)
- **Tag format**: `Feature: inventory-expansion, Property {number}: {property_text}`

Property tests should focus on:

1. **CSV Ingestion Properties** (Properties 1-2):
   - Generate random CSV data with various field combinations
   - Test validation logic across all possible inputs
   - Test variant-to-product associations

2. **Data Generation Properties** (Properties 3-8):
   - Generate random product data with various realms, categories, and Mirror settings
   - Test realm-based file separation
   - Test category mapping with various inputs
   - Test Mirror discipline preservation
   - Test description preservation

3. **Variant Generation Properties** (Properties 9-15):
   - Generate random variant data with various option combinations
   - Test ID stability with duplicate options
   - Test label generation formats
   - Test pricing calculations
   - Test availability logic
   - Test default variant selection

4. **Display Properties** (Properties 16-19):
   - Generate random product sets with various realms and statuses
   - Test filtering logic for /shop and /uniform
   - Test display completeness
   - Test variant indication

5. **Variant Selection Properties** (Properties 20-23):
   - Generate random products with various variant counts
   - Test conditional selector display
   - Test price and image updates
   - Test default variant display

6. **Type Safety Properties** (Property 24):
   - Generate random product data
   - Verify TypeScript compilation succeeds
   - Verify no type errors in generated code

### Property-Based Testing Library

For TypeScript/JavaScript, use **fast-check** library:

```typescript
import fc from 'fast-check';

// Example property test
describe('Feature: inventory-expansion, Property 12: Sanctuary pricing calculation', () => {
  it('should calculate sanctuary price as 90% of public price, rounded to 2 decimals', () => {
    fc.assert(
      fc.property(
        fc.float({ min: 0.01, max: 10000, noNaN: true }),
        (price) => {
          const expected = Math.round(price * 0.9 * 100) / 100;
          const actual = calculateSanctuaryPrice(price);
          return Math.abs(actual - expected) < 0.001; // Allow for floating point precision
        }
      ),
      { numRuns: 100 }
    );
  });
});
```

### Test Coverage Goals

- **Unit test coverage**: 80%+ of code paths
- **Property test coverage**: All 24 correctness properties
- **Integration test coverage**: All major workflows (CSV → Generation → Display)
- **Build validation**: npm test and npm run build must pass

### Testing Workflow

**Priority for v1**: Focus on correct data generation and ensuring existing test suite passes. Property-based tests are optional for initial implementation.

1. **During Development**:
   - Write unit tests for CSV parser and data transformer
   - Write 1-2 integration tests for the full pipeline
   - Property tests are optional (can be added later for additional confidence)
   - Run tests frequently to catch regressions early

2. **Before Commit**:
   - Run full test suite: `npm test`
   - Run build: `npm run build`
   - Verify no TypeScript errors
   - Verify all tests pass

3. **After Generation**:
   - Manually verify /shop displays all House products
   - Manually verify /uniform displays all Uniform products
   - Manually test variant selection on detail pages
   - Verify variant price and image updates work correctly

4. **Validation Checklist**:
   - [ ] 56 products parsed from canonical_products_pass1.csv
   - [ ] 32 variants parsed from product_variants_pass1.csv
   - [ ] Products written to existing module locations (not new files)
   - [ ] House products filtered correctly (realm='house')
   - [ ] Uniform products filtered correctly (realm='uniform')
   - [ ] Mirror discipline preserved (existing mirror-eligible products unchanged)
   - [ ] All apparel has mirrorEligible=false
   - [ ] Products with 2+ variants show variant selector on detail pages
   - [ ] Variant selection updates price and image correctly
   - [ ] npm test passes
   - [ ] npm run build passes
   - [ ] No TypeScript compilation errors
