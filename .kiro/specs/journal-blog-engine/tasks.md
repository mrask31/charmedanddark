# Implementation Plan: Journal Blog Engine

## Overview

This plan implements the Journal blog engine for Charmed & Dark, transforming the existing Supabase blog_posts table into a fully functional content marketing system. The implementation uses Next.js 16 App Router with Server Components, ISR, and integrates with existing infrastructure (Supabase clients, /api/subscribe endpoint). All code will be written in JavaScript/TypeScript following the established design system.

## Tasks

- [x] 1. Set up dependencies and core utilities
  - Install react-markdown and remark-gfm packages
  - Create slug generation utility function (URL-safe: lowercase, hyphens, alphanumeric only)
  - Create markdown product reference parser utility ([product:slug] → /shop/[slug])
  - _Requirements: 5.5, 8.1, 9.1_

- [x] 2. Implement Post Index page (/journal)
  - [x] 2.1 Create /app/journal/page.js Server Component
    - Implement getPublishedPosts() query function (status='published', publish_date <= NOW(), ordered by publish_date DESC)
    - Add pagination logic (12 posts per page, calculate offset from searchParams)
    - Render post grid (responsive: 1 col mobile, 2 col tablet, 3 col desktop)
    - Display post cards with featured_image_url, title, excerpt (truncated to 150 chars), author, publish_date
    - Add pagination controls (show only if total > 12)
    - Generate static metadata for SEO
    - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 1.6_
  
  - [ ]* 2.2 Write property test for Post Index
    - **Property 1: Published Posts Query Correctness**
    - **Property 2: Pagination Limit Enforcement**
    - **Property 3: Pagination Controls Conditional Rendering**
    - **Property 4: Post Card Field Completeness**
    - **Validates: Requirements 1.1, 1.3, 1.4, 1.5**

- [x] 3. Implement MarkdownRenderer component
  - [x] 3.1 Create MarkdownRenderer Server Component
    - Import react-markdown and remark-gfm
    - Implement product reference replacement ([product:slug] → markdown links)
    - Configure custom component renderers for headings (Georgia, uppercase tracking), paragraphs (text-zinc-400), links (gold #B89C6D), lists, blockquotes, code blocks
    - Apply XSS sanitization (react-markdown default sanitization)
    - _Requirements: 2.2, 8.1, 8.2, 8.3, 8.4, 9.1, 9.2, 9.3, 9.4, 9.5_
  
  - [ ]* 3.2 Write property tests for MarkdownRenderer
    - **Property 6: Markdown to HTML Conversion**
    - **Property 25: Product Reference Link Conversion**
    - **Property 26: Invalid Product Reference Fallback**
    - **Property 27: XSS Prevention in Markdown**
    - **Validates: Requirements 2.2, 8.1, 8.4, 9.1, 9.5**

- [x] 4. Implement ProductCallout component
  - [x] 4.1 Create ProductCallout Server Component
    - Accept product prop (slug, name, lore, image_url, price, sale_price)
    - Render product card with image, "FEATURED PRODUCT" label (uppercase tracking-widest), product name (Georgia), lore excerpt, price (gold color)
    - Add link to /shop/[slug]
    - Style with bg-zinc-950, border border-white/10, 0px border radius, gold accent #B89C6D
    - _Requirements: 6.2, 6.3, 6.4_
  
  - [ ]* 4.2 Write property tests for ProductCallout
    - **Property 21: Product Callout Field Completeness**
    - **Property 22: Product Callout Link Correctness**
    - **Validates: Requirements 6.2, 6.3**

- [x] 5. Implement EmailSignupCTA component
  - [x] 5.1 Create EmailSignupCTA Client Component
    - Add form state (email, status: idle/loading/success/error, message)
    - Implement email input with validation (require @ symbol)
    - On submit, POST to /api/subscribe with { email, source: 'journal' }
    - Display success message: "You're in. Check your inbox."
    - Display error message for duplicates: "Already subscribed"
    - Display generic error: "Something went wrong. Please try again."
    - Disable input during loading state
    - Style with bg-black, border border-white/10, Georgia heading, uppercase tracking, bg-zinc-950 input, gold button #B89C6D
    - _Requirements: 7.1, 7.2, 7.3, 7.4, 7.5, 7.6_
  
  - [ ]* 5.2 Write unit tests for EmailSignupCTA
    - Test email validation (valid/invalid formats)
    - Test success/error state handling
    - Test duplicate email handling
    - _Requirements: 7.3, 7.5_

- [x] 6. Checkpoint - Verify component implementations
  - Ensure all components render without errors, ask the user if questions arise.

- [x] 7. Implement Post Detail page (/journal/[slug])
  - [x] 7.1 Create /app/journal/[slug]/page.js Server Component
    - Set revalidate = 3600 (1 hour ISR)
    - Implement getPostBySlug() query function (slug match, status='published')
    - Return notFound() if post doesn't exist
    - Query featured products using featured_product_ids
    - Render hero section (featured_image_url, title, author, publish_date)
    - Render MarkdownRenderer with body_markdown and product slugs
    - Render ProductCallout components for each featured product
    - Render EmailSignupCTA at bottom
    - _Requirements: 2.1, 2.3, 2.4, 2.6, 6.1_
  
  - [x] 7.2 Implement generateStaticParams for static generation
    - Query all published posts (status='published')
    - Return array of { slug } objects
    - _Requirements: 10.1, 10.2, 10.3_
  
  - [x] 7.3 Implement generateMetadata for SEO
    - Set title to post.title
    - Set description to post.meta_description
    - Set keywords to [primary_keyword, ...secondary_keywords]
    - Add Open Graph tags (title, description, images with featured_image_url, type: 'article', publishedTime, authors)
    - Add Article JSON-LD schema (headline, datePublished, author, image)
    - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5, 3.6_
  
  - [ ]* 7.4 Write property tests for Post Detail page
    - **Property 5: Post Detail Slug Matching**
    - **Property 7: Post Detail Field Completeness**
    - **Property 8: Product Callout Rendering Count**
    - **Property 9: Metadata Title Mapping**
    - **Property 10: Metadata Description Mapping**
    - **Property 11: Open Graph Tags Completeness**
    - **Property 12: JSON-LD Schema Completeness**
    - **Property 13: Metadata Keywords Inclusion**
    - **Property 20: Featured Products Query Matching**
    - **Property 28: Static Params Published Posts Only**
    - **Property 29: Static Params Array Format**
    - **Validates: Requirements 2.1, 2.3, 2.4, 2.6, 3.2, 3.3, 3.4, 3.5, 3.6, 6.1, 10.2, 10.3**

- [x] 8. Implement Draft Generator API
  - [x] 8.1 Create /app/api/admin/generate-blog-draft/route.js
    - Validate request body (require topic, primary_keyword; optional featured_product_ids)
    - If featured_product_ids provided, query products for context
    - Construct Claude prompt (gothic brand voice, SEO-optimized, 800-1200 words, JSON response format)
    - Call Claude API (claude-3-5-sonnet-20241022) using ANTHROPIC_API_KEY
    - Parse JSON response (title, meta_description, excerpt, body_markdown)
    - Generate URL-safe slug from title using utility function
    - Insert into blog_posts with status='draft', author='AI', created_at=NOW()
    - Return 201 with created post (id, slug, title, excerpt, status)
    - Handle errors: return 500 if Claude API fails
    - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5, 5.6, 5.7_
  
  - [ ]* 8.2 Write property tests for Draft Generator
    - **Property 16: Draft Request Validation**
    - **Property 17: Draft Creation with Correct Status**
    - **Property 18: URL-Safe Slug Generation**
    - **Property 19: Draft Creation Success Response**
    - **Validates: Requirements 5.2, 5.4, 5.5, 5.7**

- [x] 9. Implement Auto Publisher Cron Job
  - [x] 9.1 Create /app/api/cron/publish-scheduled/route.js
    - Verify Vercel Cron Secret via Authorization header
    - Query scheduled posts (status='scheduled', publish_date <= NOW())
    - Update status to 'published' for all matching posts
    - Call revalidatePath('/journal')
    - Call revalidatePath('/journal/[slug]') for each published post
    - Log count of published posts and slugs
    - Return JSON response with success, published count, and slugs
    - Handle errors: return 500 if database update fails
    - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5, 4.6_
  
  - [x] 9.2 Create vercel.json cron configuration
    - Add cron job: path="/api/cron/publish-scheduled", schedule="0 14 * * 3" (Wed 9AM EST / 2PM UTC)
    - _Requirements: 4.1_
  
  - [ ]* 9.3 Write property tests for Auto Publisher
    - **Property 14: Scheduled Posts Query Correctness**
    - **Property 15: Auto-Publisher Status Update**
    - **Validates: Requirements 4.2, 4.3**

- [x] 10. Checkpoint - Verify all features work end-to-end
  - Test Post Index pagination with test data
  - Test Post Detail page with welcome-to-the-sanctuary slug
  - Test email signup with /api/subscribe integration
  - Test markdown rendering with product references
  - Ensure all tests pass, ask the user if questions arise.

- [x] 11. Handle edge cases and error states
  - [x] 11.1 Add 404 handling for invalid slugs
    - Import and call notFound() in Post Detail page when post not found
    - _Requirements: 2.6_
  
  - [x] 11.2 Add error boundaries and fallbacks
    - Handle empty post list in Post Index (display "No posts available")
    - Handle missing featured products gracefully (skip rendering callout)
    - Handle network errors in EmailSignupCTA (display retry button)
    - Add console logging for database query failures
    - _Requirements: Error Handling section_
  
  - [ ]* 11.3 Write unit tests for error handling
    - Test 404 response for invalid slug
    - Test empty post list rendering
    - Test missing product handling
    - Test email submission network errors

- [x] 12. Final integration and polish
  - [x] 12.1 Verify design system consistency
    - Check all components use bg-black/bg-zinc-950, text-white/text-zinc-400
    - Check gold accent #B89C6D is used consistently
    - Check 0px border radius everywhere
    - Check Georgia font for headings, uppercase tracking-widest for labels
    - _Requirements: Design system context_
  
  - [x] 12.2 Test with existing infrastructure
    - Verify Supabase client imports work (lib/supabase/client.js, lib/supabase/admin.js)
    - Verify /api/subscribe endpoint integration with source: 'journal'
    - Verify ANTHROPIC_API_KEY from .env.local works
    - Test with existing blog post (slug: welcome-to-the-sanctuary, status: published)
    - _Requirements: Critical context_

- [x] 13. Final checkpoint - Complete implementation verification
  - Run all tests (unit and property tests)
  - Verify all 10 requirements are satisfied
  - Verify all 29 correctness properties are validated
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP
- Each task references specific requirements for traceability
- Checkpoints ensure incremental validation at reasonable breaks
- Property tests validate universal correctness properties from the design document
- Unit tests validate specific examples, edge cases, and error conditions
- All code uses JavaScript/TypeScript with Next.js 16 App Router patterns
- Reuse existing infrastructure: Supabase clients, /api/subscribe endpoint, ANTHROPIC_API_KEY
- Design system: bg-black/bg-zinc-950, text-white/text-zinc-400, gold #B89C6D, 0px border radius, Georgia headings, uppercase tracking-widest labels
