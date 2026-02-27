# Requirements Document

## Introduction

The Darkroom Initiative Phase 1 is an AI-powered product image generation system that transforms supplier-provided product images into architectural renders matching the "Charmed & Dark" aesthetic. The system uses a brutalist, monochromatic style with dramatic lighting to create high-fidelity 2K renders. This phase focuses on batch processing the first 10 products (starting with Candle Holders) and integrating the generated images into the existing product display system with smart fallback logic.

## Glossary

- **Darkroom_Engine**: The backend batch processing system that generates AI-powered product renders
- **Style_Seed_Prompt**: The master prompt template defining the brutalist aesthetic for image generation
- **Product_Database**: The Supabase database containing product records
- **Darkroom_Storage**: The Supabase Storage bucket named "darkroom-renders" for storing generated images
- **Product_Card**: The frontend component that displays product information and images
- **Shopify_Image**: The original product image URL from Shopify integration
- **Darkroom_URL**: The database field storing the public URL of the AI-generated render
- **Image_Generator**: The AI service that performs img2img transformation using the Style_Seed_Prompt

## Requirements

### Requirement 1: Batch Product Selection

**User Story:** As a system administrator, I want to isolate the first 10 products from the database, so that I can process them in the initial batch.

#### Acceptance Criteria

1. THE Darkroom_Engine SHALL retrieve exactly 10 product records from the Product_Database
2. THE Darkroom_Engine SHALL start selection with products in the Candle Holders category
3. THE Darkroom_Engine SHALL order products by their database ID in ascending order
4. WHEN no products exist in the Product_Database, THE Darkroom_Engine SHALL log an error and terminate gracefully

### Requirement 2: Style Seed Prompt Template

**User Story:** As a content creator, I want a consistent prompt template for all renders, so that all generated images maintain the brutalist aesthetic.

#### Acceptance Criteria

1. THE Style_Seed_Prompt SHALL follow the format: "Architectural product photography of [PRODUCT_NAME]. Brutalist aesthetic, monochromatic palette of charcoal, slate, and raw concrete. Sharp, dramatic chiaroscuro lighting casting deep, long shadows. The object is isolated on a rough stone plinth. High-fidelity 2K resolution. No props, minimalist environment. The object is the monument."
2. THE Darkroom_Engine SHALL inject the product name into the [PRODUCT_NAME] placeholder
3. THE Style_Seed_Prompt SHALL remain constant across all product generations
4. THE Darkroom_Engine SHALL preserve the exact wording and punctuation of the Style_Seed_Prompt

### Requirement 3: Image Generation with Shape Preservation

**User Story:** As a product manager, I want AI-generated images to respect the original product shape, so that customers can recognize the actual product form.

#### Acceptance Criteria

1. WHEN generating an image, THE Image_Generator SHALL use the Shopify_Image URL as the img2img reference
2. THE Image_Generator SHALL preserve the original product shape and form from the Shopify_Image
3. THE Image_Generator SHALL output images at 2K resolution
4. WHEN the Shopify_Image URL is invalid or inaccessible, THE Darkroom_Engine SHALL log the error and skip to the next product

### Requirement 4: Batch Processing Loop

**User Story:** As a system administrator, I want the system to automatically process all selected products, so that I don't need to manually trigger each generation.

#### Acceptance Criteria

1. THE Darkroom_Engine SHALL iterate through all 10 selected products sequentially
2. FOR EACH product, THE Darkroom_Engine SHALL inject the product name into the Style_Seed_Prompt
3. FOR EACH product, THE Darkroom_Engine SHALL invoke the Image_Generator with the Style_Seed_Prompt and Shopify_Image
4. WHEN a generation fails, THE Darkroom_Engine SHALL log the error and continue processing the remaining products
5. WHEN all products are processed, THE Darkroom_Engine SHALL log a completion summary with success and failure counts

### Requirement 5: Storage Pipeline

**User Story:** As a system administrator, I want generated images stored in Supabase Storage, so that they are accessible via public URLs.

#### Acceptance Criteria

1. THE Darkroom_Engine SHALL save each generated image to the Darkroom_Storage bucket
2. THE Darkroom_Engine SHALL name each stored image using the format: "{product_id}_{timestamp}.png"
3. THE Darkroom_Engine SHALL retrieve the public URL for each stored image
4. WHEN the Darkroom_Storage bucket does not exist, THE Darkroom_Engine SHALL create it with public read access
5. WHEN storage fails, THE Darkroom_Engine SHALL log the error and continue processing the remaining products

### Requirement 6: Database Update

**User Story:** As a system administrator, I want product records updated with the new image URLs, so that the frontend can display the generated renders.

#### Acceptance Criteria

1. WHEN an image is successfully stored, THE Darkroom_Engine SHALL update the corresponding product record in the Product_Database
2. THE Darkroom_Engine SHALL set the Darkroom_URL field to the public URL of the stored image
3. THE Darkroom_Engine SHALL preserve all other fields in the product record during the update
4. WHEN a database update fails, THE Darkroom_Engine SHALL log the error and continue processing the remaining products

### Requirement 7: Frontend Smart Fallback Display

**User Story:** As a customer, I want to see the new brutalist renders when available, so that I experience the enhanced visual aesthetic.

#### Acceptance Criteria

1. WHEN the Darkroom_URL field contains a valid URL, THE Product_Card SHALL display the image from Darkroom_URL
2. WHEN the Darkroom_URL field is null or empty, THE Product_Card SHALL display the image from Shopify_Image
3. THE Product_Card SHALL maintain the same image dimensions and aspect ratio regardless of the source
4. WHEN both Darkroom_URL and Shopify_Image fail to load, THE Product_Card SHALL display a placeholder image

### Requirement 8: Processing Status Logging

**User Story:** As a system administrator, I want detailed logs of the generation process, so that I can monitor progress and troubleshoot issues.

#### Acceptance Criteria

1. WHEN processing starts, THE Darkroom_Engine SHALL log the total number of products to process
2. FOR EACH product, THE Darkroom_Engine SHALL log the product name and processing status
3. WHEN an error occurs, THE Darkroom_Engine SHALL log the error message with the product ID and error type
4. WHEN processing completes, THE Darkroom_Engine SHALL log the total processing time and success rate
5. THE Darkroom_Engine SHALL log timestamps in ISO 8601 format for all log entries

### Requirement 9: Image Quality Validation

**User Story:** As a quality assurance specialist, I want to ensure generated images meet quality standards, so that only acceptable renders are stored.

#### Acceptance Criteria

1. THE Darkroom_Engine SHALL verify each generated image is exactly 2K resolution before storage
2. THE Darkroom_Engine SHALL verify each generated image file size is between 100KB and 5MB
3. WHEN an image fails quality validation, THE Darkroom_Engine SHALL log the validation failure and retry generation once
4. WHEN retry fails, THE Darkroom_Engine SHALL skip the product and continue processing

### Requirement 10: Execution Time Monitoring

**User Story:** As a system administrator, I want to track processing time per product, so that I can estimate completion time for larger batches.

#### Acceptance Criteria

1. FOR EACH product, THE Darkroom_Engine SHALL record the start time before generation
2. FOR EACH product, THE Darkroom_Engine SHALL record the end time after database update
3. FOR EACH product, THE Darkroom_Engine SHALL calculate and log the total processing time in seconds
4. WHEN processing completes, THE Darkroom_Engine SHALL log the average processing time per product
