# Darkroom Phase 1 - Implementation Tasks

## 1. Storage Infrastructure
- [ ] 1.1 Provision `darkroom-renders` storage bucket in Supabase
  - Create new storage bucket named `darkroom-renders`
  - Configure bucket for public read access
  - Configure bucket for service-role write access
  - Verify bucket policies are correctly set

- [ ] 1.2 Configure bucket security policies
  - Set up RLS policies for public read access
  - Set up RLS policies for service-role write access
  - Test policy enforcement with sample uploads

## 2. Frontend Smart Fallback
- [ ] 2.1 Update UnifiedProduct interface
  - Add `metadata.darkroom_url` field to TypeScript interface
  - Update type definitions in `lib/products.ts`
  - Ensure backward compatibility with existing products

- [ ] 2.2 Implement conditional rendering in Product Cards
  - Add image source priority logic: `darkroom_url` → `shopify_image` → placeholder
  - Update ProductCard component to use new priority logic
  - Test fallback chain with various product states

- [ ] 2.3 Implement pending state logic for unrendered items
  - Apply grayscale/high-contrast CSS filter to raw images when `darkroom_url` is null
  - Add "PROCESSING // DARKROOM" text overlay with tracking-widest styling
  - Ensure pending state is visually distinct but not disruptive
  - Test pending state across different viewport sizes

## 3. The AI Batch Processor Engine (Backend)
- [ ] 3.1 Create secure batch processing routine
  - Implement query to select first 10 products where `category = 'Candle Holder'` AND `metadata.darkroom_url` is null
  - Add authentication and authorization checks for batch processor
  - Implement rate limiting to prevent API abuse

- [ ] 3.2 Wire the Gemini Vision API integration
  - Set up Gemini Vision API client with credentials
  - Implement img2img pipeline with Brutalist Architecture style seed prompt
  - Configure prompt: chiaroscuro lighting, monochromatic, exact geometry preservation
  - Handle API errors and retries gracefully

- [ ] 3.3 Implement execution monitoring and logging
  - Add execution time tracking for each product render
  - Log processing status with timestamps
  - Create structured logs for debugging and monitoring
  - Implement error logging with context

## 4. Synchronization & Validation
- [ ] 4.1 Validate AI output quality
  - Check output resolution meets 2K requirement
  - Validate file size is within acceptable limits
  - Verify image format is correct (PNG)
  - Reject and log invalid outputs

- [ ] 4.2 Upload to darkroom-renders bucket
  - Implement upload using strict naming format: `{product_id}_{timestamp}.png`
  - Handle upload errors with retry logic
  - Verify successful upload before database update
  - Clean up temporary files after upload

- [ ] 4.3 Update database with darkroom URLs
  - Inject public URL into product's `metadata` JSONB column under `darkroom_url`
  - Use atomic updates to prevent race conditions
  - Verify zero schema changes (JSONB only)
  - Log successful database updates

- [ ] 4.4 Implement idempotency and error recovery
  - Ensure batch processor can safely restart after failures
  - Skip products that already have `darkroom_url` set
  - Implement transaction rollback on partial failures
  - Add manual retry mechanism for failed products
