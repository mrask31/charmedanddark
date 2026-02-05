# Requirements Document: Inventory Expansion

## Introduction

This feature expands the product inventory by ingesting canonical CSV data files containing 56 House products and 32 Uniform variant SKUs, then generating complete TypeScript data modules to display all items and variants across the shop and uniform pages with proper variant selection functionality.

## Glossary

- **Canonical_Product**: A base product definition from canonical_products_pass1.csv containing core product information
- **Product_Variant**: A specific SKU variation (size, color, etc.) from product_variants_pass1.csv that references a canonical product
- **House_Item**: A product where realm='house', displayed on /shop page
- **Uniform_Item**: A product where realm='uniform', displayed on /uniform page
- **Mirror_Discipline**: Existing configuration for mirrorEligible and mirrorRole properties that must be preserved
- **Sanctuary_Price**: A discounted price calculated as 10% off the public price, rounded to 2 decimals
- **Variant_Selector**: UI component that allows users to choose between product variants
- **CSV_Ingestion_System**: The system component responsible for reading and parsing CSV files
- **Data_Generation_System**: The system component responsible for generating TypeScript modules from CSV data
- **Product_Display_System**: The system component responsible for rendering products on shop pages
- **Variant_Selection_System**: The system component responsible for handling variant selection interactions

## Requirements

### Requirement 1: CSV Data Ingestion

**User Story:** As a developer, I want to ingest canonical CSV files, so that I can populate the product catalog with complete inventory data.

#### Acceptance Criteria

1. WHEN canonical_products_pass1.csv is provided, THE CSV_Ingestion_System SHALL parse all 56 product records
2. WHEN product_variants_pass1.csv is provided, THE CSV_Ingestion_System SHALL parse all 32 variant SKU records
3. WHEN parsing CSV files, THE CSV_Ingestion_System SHALL validate that all required fields are present (canon_sku, base_sku, name_raw, slug_suggestion, price_usd, realm, variant_model, sku_count for products; variant_sku, option1, price_usd, qty for variants)
4. WHEN a variant record is parsed, THE CSV_Ingestion_System SHALL associate it with its canonical product via canon_sku
5. IF a CSV file is malformed or missing required fields, THEN THE CSV_Ingestion_System SHALL report a descriptive error

### Requirement 2: TypeScript Module Generation

**User Story:** As a developer, I want to generate TypeScript data modules from CSV data, so that the application can access structured product information.

#### Acceptance Criteria

1. WHEN CSV data is ingested, THE Data_Generation_System SHALL generate lib/products.ts containing all House items where realm='house'
2. WHEN CSV data is ingested, THE Data_Generation_System SHALL generate lib/apparel.ts containing all Uniform items where realm='uniform'
3. WHEN generating TypeScript modules, THE Data_Generation_System SHALL overwrite existing files completely
4. WHEN generating product data, THE Data_Generation_System SHALL map categories_raw to standardized categories (Candles & Scent, Ritual Drinkware, Wall Objects, Decor Objects, Table & Display, Objects of Use)
5. IF categories_raw is empty or cannot be confidently mapped, THEN THE Data_Generation_System SHALL assign a best-fit category based on product name and log the mapping decision
6. WHEN generating product data, THE Data_Generation_System SHALL preserve existing Mirror discipline properties (mirrorEligible, mirrorRole) for products that already exist
7. WHEN generating Uniform items, THE Data_Generation_System SHALL set mirrorEligible to false for all apparel products
8. WHEN generating TypeScript modules, THE Data_Generation_System SHALL preserve existing product descriptions without modification
9. IF status is not explicitly defined for a product, THEN THE Data_Generation_System SHALL default status to "core"
10. WHEN generation completes, THE Data_Generation_System SHALL log counts of total house products, total uniform products, and number of products with variants

### Requirement 3: Product Variant Structure

**User Story:** As a developer, I want product variants to have a consistent data structure, so that the UI can reliably display and interact with variant options.

#### Acceptance Criteria

1. WHEN creating a variant record, THE Data_Generation_System SHALL generate a stable id derived from variant options or variant_sku
2. WHEN creating a variant record, THE Data_Generation_System SHALL generate a human-friendly label from options (e.g., "8 oz", "Large / Black")
3. WHEN setting variant price, THE Data_Generation_System SHALL use sale_price_usd if present, otherwise use price_usd
4. WHEN calculating sanctuary price, THE Data_Generation_System SHALL apply 10% discount and round to 2 decimal places
5. WHEN setting variant availability, THE Data_Generation_System SHALL set "in_house" if qty > 0, otherwise "gone_quiet"
6. WHEN a variant has an image_url, THE Data_Generation_System SHALL include it in the variant record
7. WHEN generating variants for a product, THE Data_Generation_System SHALL mark exactly one variant as isDefault

### Requirement 4: House Items Display

**User Story:** As a customer, I want to see all available House items on the shop page, so that I can browse the complete House product catalog.

#### Acceptance Criteria

1. WHEN a user visits /shop, THE Product_Display_System SHALL display all products where realm='house' and status != 'archive'
2. WHEN displaying House items, THE Product_Display_System SHALL show product name, image, and pricing information
3. WHEN a House item has multiple variants, THE Product_Display_System SHALL indicate variant availability on the listing without exposing variant options or selectors

### Requirement 5: Uniform Items Display

**User Story:** As a customer, I want to see all available Uniform items on the uniform page, so that I can browse the complete Uniform product catalog.

#### Acceptance Criteria

1. WHEN a user visits /uniform, THE Product_Display_System SHALL display all products where realm='uniform' and status != 'archive'
2. WHEN displaying Uniform items, THE Product_Display_System SHALL show product name, image, and pricing information
3. WHEN a Uniform item has multiple variants, THE Product_Display_System SHALL indicate variant availability on the listing without exposing variant options or selectors

### Requirement 6: Product Detail Variant Selection

**User Story:** As a customer, I want to select product variants on detail pages, so that I can choose the specific size, color, or option I prefer.

#### Acceptance Criteria

1. WHEN a product has 2 or more variants, THE Product_Display_System SHALL display a variant selector on the product detail page
2. WHEN a product has fewer than 2 variants, THE Product_Display_System SHALL NOT display a variant selector
3. WHEN a user selects a variant, THE Variant_Selection_System SHALL update the displayed public price to the variant's price
4. WHEN a user selects a variant, THE Variant_Selection_System SHALL update the displayed sanctuary price to the variant's sanctuaryPrice
5. WHEN a user selects a variant with an image, THE Variant_Selection_System SHALL update the displayed product image to the variant's image
6. WHEN a product detail page loads, THE Product_Display_System SHALL display the default variant's information initially

### Requirement 7: Build and Test Validation

**User Story:** As a developer, I want the generated code to pass all build and test checks, so that I can ensure the implementation is correct and type-safe.

#### Acceptance Criteria

1. WHEN npm test is executed, THE system SHALL pass all existing tests without errors
2. WHEN npm run build is executed, THE system SHALL compile successfully with no TypeScript errors
3. WHEN TypeScript compilation occurs, THE system SHALL validate that all generated data structures match expected types
