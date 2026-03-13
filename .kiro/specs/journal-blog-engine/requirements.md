# Requirements Document

## Introduction

The Journal is an automated blog engine for Charmed & Dark, a gothic DTC e-commerce brand. The system enables content marketing through SEO-optimized blog posts that integrate with the existing product catalog, support automated publishing workflows, and drive email list growth. The blog leverages the existing Supabase blog_posts table and integrates with the Next.js 16 App Router architecture.

## Glossary

- **Journal_System**: The complete blog engine including index pages, post pages, and admin functionality
- **Blog_Post**: A content article stored in the blog_posts table with markdown body, metadata, and publishing information
- **Post_Index**: The paginated listing page at /journal showing published blog posts
- **Post_Detail_Page**: Individual blog post page at /journal/[slug]
- **Auto_Publisher**: Vercel Cron job that publishes scheduled posts
- **Draft_Generator**: API endpoint that generates blog post drafts using Claude API
- **Product_Callout**: Embedded card component within blog posts that references products from the Supabase products table
- **ISR**: Incremental Static Regeneration - Next.js feature for updating static pages
- **Published_Post**: A blog post with status='published' and publish_date <= current time
- **Scheduled_Post**: A blog post with status='scheduled' and publish_date > current time

## Requirements

### Requirement 1: Display Published Blog Posts

**User Story:** As a site visitor, I want to browse published blog posts, so that I can discover content about gothic fashion and culture.

#### Acceptance Criteria

1. THE Post_Index SHALL display all Published_Posts ordered by publish_date descending
2. WHEN a visitor navigates to /journal, THE Post_Index SHALL render the first page of Published_Posts
3. THE Post_Index SHALL display 12 posts per page
4. WHEN more than 12 Published_Posts exist, THE Post_Index SHALL provide pagination controls
5. FOR EACH post in the list, THE Post_Index SHALL display the featured_image_url, title, excerpt, author, and publish_date
6. WHEN a visitor clicks a post, THE Journal_System SHALL navigate to /journal/[slug]

### Requirement 2: Render Individual Blog Posts

**User Story:** As a site visitor, I want to read full blog posts with rich formatting, so that I can engage with detailed content.

#### Acceptance Criteria

1. WHEN a visitor navigates to /journal/[slug], THE Post_Detail_Page SHALL render the Blog_Post with matching slug
2. THE Post_Detail_Page SHALL convert body_markdown to HTML
3. THE Post_Detail_Page SHALL display the featured_image_url, title, author, publish_date, and rendered body content
4. WHEN a Blog_Post contains featured_product_ids, THE Post_Detail_Page SHALL render Product_Callout components for each referenced product
5. THE Post_Detail_Page SHALL use ISR with a revalidation period of 3600 seconds
6. IF a slug does not match any Published_Post, THEN THE Journal_System SHALL return a 404 response

### Requirement 3: Generate SEO Metadata

**User Story:** As a marketing manager, I want each blog post to have optimized SEO metadata, so that posts rank well in search engines.

#### Acceptance Criteria

1. THE Post_Detail_Page SHALL generate dynamic metadata using Next.js generateMetadata
2. THE Post_Detail_Page SHALL set the page title to the Blog_Post title
3. THE Post_Detail_Page SHALL set the meta description to the Blog_Post meta_description
4. THE Post_Detail_Page SHALL include Open Graph tags for title, description, and featured_image_url
5. THE Post_Detail_Page SHALL render Article JSON-LD schema with headline, datePublished, author, and image properties
6. THE Post_Detail_Page SHALL include the primary_keyword and secondary_keywords in the metadata

### Requirement 4: Automatically Publish Scheduled Posts

**User Story:** As a content manager, I want scheduled posts to publish automatically, so that I can plan content releases without manual intervention.

#### Acceptance Criteria

1. THE Auto_Publisher SHALL execute every Wednesday at 9:00 AM EST
2. WHEN the Auto_Publisher executes, THE Auto_Publisher SHALL query all Scheduled_Posts where publish_date <= current time
3. FOR EACH matching Scheduled_Post, THE Auto_Publisher SHALL update status to 'published'
4. WHEN a post status changes to 'published', THE Auto_Publisher SHALL revalidate the /journal path
5. WHEN a post status changes to 'published', THE Auto_Publisher SHALL revalidate the /journal/[slug] path for that post
6. THE Auto_Publisher SHALL log the number of posts published in each execution

### Requirement 5: Generate Blog Post Drafts

**User Story:** As a content manager, I want to generate blog post drafts using AI, so that I can accelerate content creation.

#### Acceptance Criteria

1. THE Draft_Generator SHALL accept POST requests at /api/admin/generate-blog-draft
2. THE Draft_Generator SHALL accept topic, primary_keyword, and optional featured_product_ids in the request body
3. WHEN a valid request is received, THE Draft_Generator SHALL call the Claude API to generate title, meta_description, excerpt, and body_markdown
4. THE Draft_Generator SHALL create a new Blog_Post record with status='draft'
5. THE Draft_Generator SHALL generate a URL-safe slug from the generated title
6. IF the Claude API call fails, THEN THE Draft_Generator SHALL return an error response with status code 500
7. WHEN a draft is successfully created, THE Draft_Generator SHALL return the created Blog_Post with status code 201

### Requirement 6: Display Product Callouts

**User Story:** As a site visitor, I want to see relevant products within blog posts, so that I can discover items related to the content.

#### Acceptance Criteria

1. WHEN a Blog_Post contains featured_product_ids, THE Post_Detail_Page SHALL query the products table for matching products
2. FOR EACH featured product, THE Product_Callout SHALL display the product name, AI-generated lore, featured image, and price
3. THE Product_Callout SHALL link to /shop/[slug] for the product
4. THE Product_Callout SHALL match the design system with bg-zinc-950, gold accent #B89C6D, and 0px border radius
5. THE Product_Callout SHALL be embedded within the markdown content at designated positions

### Requirement 7: Capture Email Signups

**User Story:** As a marketing manager, I want to capture email signups from blog readers, so that I can grow the email list.

#### Acceptance Criteria

1. THE Post_Detail_Page SHALL display an email signup CTA at the bottom of every post
2. THE email signup CTA SHALL include a text input for email address and a submit button
3. WHEN a visitor submits an email, THE Journal_System SHALL insert the email into the email_subscribers table
4. WHEN an email is successfully saved, THE Journal_System SHALL display a success message
5. IF the email already exists in email_subscribers, THEN THE Journal_System SHALL display a message indicating the email is already subscribed
6. THE email signup CTA SHALL match the design system with uppercase tracking, Georgia font for heading, and gold accent

### Requirement 8: Link to Product Pages

**User Story:** As a site visitor, I want to click product mentions in blog posts, so that I can view product details.

#### Acceptance Criteria

1. WHEN body_markdown contains product references in the format [product:slug], THE Post_Detail_Page SHALL convert them to links
2. THE Post_Detail_Page SHALL render product links as /shop/[slug]
3. THE product links SHALL be styled with the gold accent color #B89C6D
4. WHEN a product slug does not exist in the products table, THE Post_Detail_Page SHALL render the text without a link

### Requirement 9: Parse and Render Markdown

**User Story:** As a content manager, I want to write posts in markdown, so that I can format content with headings, lists, and emphasis.

#### Acceptance Criteria

1. THE Post_Detail_Page SHALL parse body_markdown into HTML
2. THE Post_Detail_Page SHALL support standard markdown syntax including headings, paragraphs, lists, bold, italic, and links
3. THE Post_Detail_Page SHALL apply typography styles consistent with the design system
4. THE Post_Detail_Page SHALL render headings in Georgia font with uppercase tracking
5. THE Post_Detail_Page SHALL sanitize HTML output to prevent XSS attacks

### Requirement 10: Generate Static Paths

**User Story:** As a developer, I want blog post pages to be statically generated at build time, so that pages load quickly.

#### Acceptance Criteria

1. THE Post_Detail_Page SHALL implement generateStaticParams to pre-render Published_Posts at build time
2. WHEN generateStaticParams executes, THE Journal_System SHALL query all Published_Posts
3. THE Post_Detail_Page SHALL return an array of slug parameters for static generation
4. WHEN a new post is published, THE Post_Detail_Page SHALL regenerate via ISR within 3600 seconds
