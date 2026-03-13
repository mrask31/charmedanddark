# Design Document: Journal Blog Engine

## Overview

The Journal is an automated blog engine for Charmed & Dark that transforms the existing Supabase `blog_posts` table into a fully functional content marketing system. The design leverages Next.js 16 App Router capabilities including Server Components, Incremental Static Regeneration (ISR), and dynamic metadata generation to deliver SEO-optimized blog posts with minimal client-side JavaScript.

The system consists of three primary surfaces:

1. **Post Index** (`/journal`) - Paginated listing of published posts with featured images, excerpts, and metadata
2. **Post Detail** (`/journal/[slug]`) - Individual post pages with markdown rendering, product callouts, and email capture
3. **Admin APIs** - Draft generation via Claude API and automated publishing via Vercel Cron

The architecture prioritizes static generation with on-demand revalidation, ensuring fast page loads while maintaining content freshness. All blog posts are stored as markdown in the database, parsed server-side using `react-markdown` with `remark-gfm` for GitHub Flavored Markdown support.

### Key Design Decisions

**Server-First Rendering**: All blog content is rendered server-side using React Server Components, eliminating hydration overhead and improving Core Web Vitals.

**ISR with 1-Hour Revalidation**: Post detail pages use ISR with a 3600-second revalidation period, balancing content freshness with build performance. The auto-publisher triggers on-demand revalidation when posts are published.

**Markdown as Source of Truth**: Blog posts are stored as markdown in the database rather than rich text or HTML, enabling version control, portability, and simple AI generation workflows.

**Product Integration via Array References**: The `featured_product_ids` column stores UUID arrays that reference the existing `products` table, enabling product callouts without denormalization.

**Existing Infrastructure Reuse**: The design reuses existing Supabase clients (`lib/supabase/client.js`, `lib/supabase/admin.js`) and the `/api/subscribe` endpoint, minimizing new infrastructure.

## Architecture

### System Components

```mermaid
graph TD
    A[Visitor] -->|GET /journal| B[Post Index Page]
    A -->|GET /journal/slug| C[Post Detail Page]
    D[Content Manager] -->|POST /api/admin/generate-blog-draft| E[Draft Generator API]
    F[Vercel Cron] -->|Wed 9AM EST| G[Auto Publisher API]
    
    B -->|Query published posts| H[(Supabase blog_posts)]
    C -->|Query post by slug| H
    C -->|Query products| I[(Supabase products)]
    C -->|POST email| J[/api/subscribe]
    E -->|Generate content| K[Claude API]
    E -->|Insert draft| H
    G -->|Update status| H
    G -->|Revalidate paths| L[Next.js Revalidation]
    
    C -->|Render markdown| M[react-markdown]
    C -->|Parse product refs| N[Product Link Parser]
    C -->|Embed products| O[Product Callout Component]
    
    J -->|Insert email| P[(Supabase email_subscribers)]
```

### Data Flow

**Post Index Rendering**:
1. Server Component queries `blog_posts` WHERE `status='published'` AND `publish_date <= NOW()` ORDER BY `publish_date DESC`
2. Apply pagination (12 posts per page)
3. Render post cards with featured image, title, excerpt, author, publish date
4. Generate pagination controls if total posts > 12

**Post Detail Rendering**:
1. Server Component queries `blog_posts` WHERE `slug=$slug` AND `status='published'`
2. If not found, return 404
3. Query `products` WHERE `id IN featured_product_ids`
4. Parse `body_markdown` with `react-markdown` and `remark-gfm`
5. Replace `[product:slug]` references with links to `/shop/[slug]`
6. Render Product Callout components for featured products
7. Render email signup CTA at bottom
8. Generate SEO metadata and JSON-LD schema

**Draft Generation**:
1. API receives `{ topic, primary_keyword, featured_product_ids? }`
2. Construct Claude prompt with topic, keyword, and product context
3. Call Claude API to generate `{ title, meta_description, excerpt, body_markdown }`
4. Generate URL-safe slug from title
5. Insert into `blog_posts` with `status='draft'`
6. Return created post with 201 status

**Auto Publishing**:
1. Cron job executes every Wednesday at 9:00 AM EST (14:00 UTC)
2. Query `blog_posts` WHERE `status='scheduled'` AND `publish_date <= NOW()`
3. For each post, UPDATE `status='published'`
4. Call `revalidatePath('/journal')` and `revalidatePath('/journal/[slug]')`
5. Log count of published posts

### Technology Stack

- **Framework**: Next.js 16 App Router
- **Database**: Supabase PostgreSQL
- **Markdown Parsing**: `react-markdown` + `remark-gfm`
- **AI Generation**: Anthropic Claude API (via `ANTHROPIC_API_KEY`)
- **Styling**: Tailwind CSS 4 with design system tokens
- **Deployment**: Vercel with Cron Jobs

## Components and Interfaces

### Page Components

#### `/app/journal/page.js` - Post Index

**Type**: Server Component

**Responsibilities**:
- Query published posts from Supabase
- Implement pagination (12 posts per page)
- Render post cards with metadata
- Generate static metadata for SEO

**Props**: None (uses `searchParams` for pagination)

**Key Functions**:
```javascript
async function getPublishedPosts(page = 1, limit = 12) {
  const offset = (page - 1) * limit;
  const { data, error, count } = await supabase
    .from('blog_posts')
    .select('*', { count: 'exact' })
    .eq('status', 'published')
    .lte('publish_date', new Date().toISOString())
    .order('publish_date', { ascending: false })
    .range(offset, offset + limit - 1);
  
  return { posts: data, total: count, error };
}
```

**Rendering**:
- Display grid of post cards (responsive: 1 col mobile, 2 col tablet, 3 col desktop)
- Each card shows: featured image, title, excerpt (truncated to 150 chars), author, publish date
- Pagination controls at bottom if `total > limit`

#### `/app/journal/[slug]/page.js` - Post Detail

**Type**: Server Component

**Responsibilities**:
- Query post by slug
- Query featured products
- Render markdown content
- Parse and replace product references
- Generate dynamic metadata
- Implement ISR with 1-hour revalidation

**Dynamic Functions**:
```javascript
export const revalidate = 3600; // 1 hour

export async function generateStaticParams() {
  const { data } = await supabase
    .from('blog_posts')
    .select('slug')
    .eq('status', 'published');
  
  return data.map(post => ({ slug: post.slug }));
}

export async function generateMetadata({ params }) {
  const post = await getPostBySlug(params.slug);
  
  return {
    title: post.title,
    description: post.meta_description,
    keywords: [post.primary_keyword, ...post.secondary_keywords],
    openGraph: {
      title: post.title,
      description: post.meta_description,
      images: [{ url: post.featured_image_url }],
      type: 'article',
      publishedTime: post.publish_date,
      authors: [post.author],
    },
  };
}
```

**Rendering**:
- Hero section: featured image, title, author, publish date
- Article body: parsed markdown with custom styling
- Product callouts: embedded cards for featured products
- Email signup CTA: form at bottom with gold accent
- JSON-LD schema: Article structured data

### UI Components

#### `<ProductCallout>` Component

**Type**: Server Component

**Props**:
```typescript
interface ProductCalloutProps {
  product: {
    slug: string;
    name: string;
    lore: string;
    image_url: string;
    price: number;
    sale_price?: number;
  };
}
```

**Styling**:
- Background: `bg-zinc-950`
- Border: `border border-white/10`
- Border radius: `0px` (sharp corners per design system)
- Accent color: `#B89C6D` (gold)
- Typography: Georgia for product name, uppercase tracking for labels

**Layout**:
```
┌─────────────────────────────────────┐
│  [Product Image]                    │
│                                     │
│  FEATURED PRODUCT                   │ ← uppercase, tracking-widest
│  Product Name                       │ ← Georgia font
│  AI-generated lore excerpt...      │
│  $XX.XX                            │ ← gold color
│  [View Product →]                  │ ← link to /shop/[slug]
└─────────────────────────────────────┘
```

#### `<EmailSignupCTA>` Component

**Type**: Client Component (requires form state)

**Props**: None

**State**:
- `email: string`
- `status: 'idle' | 'loading' | 'success' | 'error'`
- `message: string`

**Behavior**:
- On submit, POST to `/api/subscribe` with `{ email, source: 'journal' }`
- Display success message: "You're in. Check your inbox."
- Display error message: "Already subscribed" or "Something went wrong"
- Disable input during loading state

**Styling**:
- Background: `bg-black` with `border border-white/10`
- Heading: Georgia font, uppercase tracking
- Input: `bg-zinc-950` with gold focus ring
- Button: Gold background `#B89C6D` with black text

#### `<MarkdownRenderer>` Component

**Type**: Server Component

**Props**:
```typescript
interface MarkdownRendererProps {
  content: string;
  productSlugs?: string[]; // for product link parsing
}
```

**Implementation**:
```javascript
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

function MarkdownRenderer({ content, productSlugs = [] }) {
  // Replace [product:slug] with actual links
  const processedContent = content.replace(
    /\[product:([^\]]+)\]/g,
    (match, slug) => {
      if (productSlugs.includes(slug)) {
        return `[${slug}](/shop/${slug})`;
      }
      return slug; // fallback if product doesn't exist
    }
  );
  
  return (
    <ReactMarkdown
      remarkPlugins={[remarkGfm]}
      components={{
        h1: ({ node, ...props }) => <h1 className="font-serif text-4xl mb-6 uppercase tracking-widest" {...props} />,
        h2: ({ node, ...props }) => <h2 className="font-serif text-3xl mb-4 uppercase tracking-widest" {...props} />,
        h3: ({ node, ...props }) => <h3 className="font-serif text-2xl mb-3 uppercase tracking-wide" {...props} />,
        p: ({ node, ...props }) => <p className="mb-4 leading-7 text-zinc-400" {...props} />,
        a: ({ node, ...props }) => <a className="text-[#B89C6D] hover:underline" {...props} />,
        ul: ({ node, ...props }) => <ul className="list-disc list-inside mb-4 text-zinc-400" {...props} />,
        ol: ({ node, ...props }) => <ol className="list-decimal list-inside mb-4 text-zinc-400" {...props} />,
        blockquote: ({ node, ...props }) => (
          <blockquote className="border-l-2 border-[#B89C6D] pl-4 italic text-zinc-500 mb-4" {...props} />
        ),
        code: ({ node, inline, ...props }) => 
          inline 
            ? <code className="bg-zinc-900 px-1 py-0.5 text-sm" {...props} />
            : <code className="block bg-zinc-900 p-4 overflow-x-auto text-sm mb-4" {...props} />,
      }}
    >
      {processedContent}
    </ReactMarkdown>
  );
}
```

### API Routes

#### `POST /api/admin/generate-blog-draft`

**Authentication**: None (should be protected in production)

**Request Body**:
```typescript
interface GenerateDraftRequest {
  topic: string;
  primary_keyword: string;
  featured_product_ids?: string[]; // UUIDs
}
```

**Response**:
```typescript
interface GenerateDraftResponse {
  success: boolean;
  post?: {
    id: string;
    slug: string;
    title: string;
    excerpt: string;
    status: 'draft';
  };
  error?: string;
}
```

**Implementation**:
1. Validate request body
2. If `featured_product_ids` provided, query products for context
3. Construct Claude prompt:
```
You are a content writer for Charmed & Dark, a gothic lifestyle brand. Write a blog post about {topic}.

Primary keyword: {primary_keyword}
Featured products: {product names and descriptions}

Generate a JSON response with:
- title: SEO-optimized title (60 chars max)
- meta_description: SEO meta description (155 chars max)
- excerpt: Brief summary (150 chars max)
- body_markdown: Full blog post in markdown format (800-1200 words)

Style: Sophisticated, atmospheric, gothic aesthetic. Use evocative language.
```
4. Call Claude API with `claude-3-5-sonnet-20241022` model
5. Parse JSON response
6. Generate slug from title (lowercase, replace spaces with hyphens, remove special chars)
7. Insert into `blog_posts` with `status='draft'`, `author='AI'`, `created_at=NOW()`
8. Return created post

#### `POST /api/cron/publish-scheduled`

**Authentication**: Vercel Cron Secret (via `Authorization` header)

**Cron Schedule**: `0 14 * * 3` (Every Wednesday at 14:00 UTC / 9:00 AM EST)

**Implementation**:
```javascript
import { supabaseAdmin } from '@/lib/supabase/admin';
import { revalidatePath } from 'next/cache';
import { NextResponse } from 'next/server';

export async function POST(request) {
  // Verify cron secret
  const authHeader = request.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  
  try {
    // Query scheduled posts ready to publish
    const { data: posts, error } = await supabaseAdmin
      .from('blog_posts')
      .select('id, slug')
      .eq('status', 'scheduled')
      .lte('publish_date', new Date().toISOString());
    
    if (error) throw error;
    
    // Update status to published
    const { error: updateError } = await supabaseAdmin
      .from('blog_posts')
      .update({ status: 'published' })
      .in('id', posts.map(p => p.id));
    
    if (updateError) throw updateError;
    
    // Revalidate paths
    revalidatePath('/journal');
    posts.forEach(post => {
      revalidatePath(`/journal/${post.slug}`);
    });
    
    console.log(`Published ${posts.length} posts:`, posts.map(p => p.slug));
    
    return NextResponse.json({ 
      success: true, 
      published: posts.length,
      slugs: posts.map(p => p.slug)
    });
  } catch (err) {
    console.error('Auto-publish error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
```

**Vercel Configuration** (`vercel.json`):
```json
{
  "crons": [{
    "path": "/api/cron/publish-scheduled",
    "schedule": "0 14 * * 3"
  }]
}
```

## Data Models

### blog_posts Table Schema

```sql
CREATE TABLE blog_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  body_markdown TEXT NOT NULL,
  excerpt TEXT,
  meta_description TEXT,
  primary_keyword TEXT,
  secondary_keywords TEXT[],
  featured_image_url TEXT,
  author TEXT DEFAULT 'Charmed & Dark',
  status TEXT CHECK (status IN ('draft', 'scheduled', 'published')) DEFAULT 'draft',
  publish_date TIMESTAMPTZ,
  featured_product_ids UUID[],
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_blog_posts_status ON blog_posts(status);
CREATE INDEX idx_blog_posts_publish_date ON blog_posts(publish_date);
CREATE INDEX idx_blog_posts_slug ON blog_posts(slug);
```

**Field Descriptions**:

- `id`: Primary key, auto-generated UUID
- `slug`: URL-safe identifier, unique, used in `/journal/[slug]` routes
- `title`: Post title, displayed in hero and metadata
- `body_markdown`: Full post content in markdown format
- `excerpt`: Brief summary (150 chars), displayed on index page
- `meta_description`: SEO meta description (155 chars)
- `primary_keyword`: Main SEO keyword
- `secondary_keywords`: Array of additional SEO keywords
- `featured_image_url`: Hero image URL (Supabase Storage or external CDN)
- `author`: Post author name, defaults to 'Charmed & Dark'
- `status`: Workflow state - 'draft', 'scheduled', or 'published'
- `publish_date`: Scheduled or actual publish timestamp
- `featured_product_ids`: Array of product UUIDs for callouts
- `created_at`: Record creation timestamp
- `updated_at`: Last modification timestamp

**RLS Policies**:
```sql
-- Public read access for published posts only
CREATE POLICY "Public can read published posts"
  ON blog_posts FOR SELECT
  USING (status = 'published' AND publish_date <= NOW());

-- Admin full access (requires service role key)
CREATE POLICY "Admin full access"
  ON blog_posts FOR ALL
  USING (auth.role() = 'service_role');
```

### products Table (Existing)

Referenced by `featured_product_ids` in blog posts. Relevant fields:

- `id`: UUID primary key
- `slug`: URL identifier for `/shop/[slug]`
- `name`: Product name
- `lore`: AI-generated product description
- `image_url`: Product image URL
- `price`: Base price in cents
- `sale_price`: Sale price in cents (nullable)
- `hidden`: Boolean, excludes from public queries

### email_subscribers Table (Existing)

Used by email signup CTA via `/api/subscribe`. Relevant fields:

- `id`: UUID primary key
- `email`: Subscriber email (unique)
- `source`: Signup source (e.g., 'journal')
- `utm_campaign`, `utm_source`, `utm_medium`: Attribution fields
- `subscribed`: Boolean, defaults to true
- `created_at`: Subscription timestamp

## Correctness Properties


*A property is a characteristic or behavior that should hold true across all valid executions of a system—essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

### Property 1: Published Posts Query Correctness

*For any* set of blog posts with various statuses and publish dates, querying published posts should return only posts where `status='published'` AND `publish_date <= NOW()`, ordered by `publish_date` descending.

**Validates: Requirements 1.1**

### Property 2: Pagination Limit Enforcement

*For any* number N of published posts, the first page should contain exactly `min(N, 12)` posts.

**Validates: Requirements 1.3**

### Property 3: Pagination Controls Conditional Rendering

*For any* set of published posts, pagination controls should be present if and only if the total count exceeds 12.

**Validates: Requirements 1.4**

### Property 4: Post Card Field Completeness

*For any* post displayed in the index, the rendered output should contain the post's `featured_image_url`, `title`, `excerpt`, `author`, and `publish_date`.

**Validates: Requirements 1.5**

### Property 5: Post Detail Slug Matching

*For any* valid slug, the post detail page should render the blog post with that exact slug, and for any invalid slug, it should return a 404 response.

**Validates: Requirements 2.1, 2.6**

### Property 6: Markdown to HTML Conversion

*For any* valid markdown content, parsing should convert markdown syntax (headings, lists, bold, italic, links) to corresponding HTML elements.

**Validates: Requirements 2.2, 9.1, 9.2**

### Property 7: Post Detail Field Completeness

*For any* post displayed on the detail page, the rendered output should contain the post's `featured_image_url`, `title`, `author`, `publish_date`, and rendered `body_markdown`.

**Validates: Requirements 2.3**

### Property 8: Product Callout Rendering Count

*For any* blog post with N `featured_product_ids`, the detail page should render exactly N Product Callout components.

**Validates: Requirements 2.4**

### Property 9: Metadata Title Mapping

*For any* blog post, the generated page metadata title should equal the post's `title` field.

**Validates: Requirements 3.2**

### Property 10: Metadata Description Mapping

*For any* blog post, the generated page metadata description should equal the post's `meta_description` field.

**Validates: Requirements 3.3**

### Property 11: Open Graph Tags Completeness

*For any* blog post, the generated metadata should include Open Graph tags for `title`, `description`, and `image` (from `featured_image_url`).

**Validates: Requirements 3.4**

### Property 12: JSON-LD Schema Completeness

*For any* blog post, the rendered page should include Article JSON-LD schema with `headline`, `datePublished`, `author`, and `image` properties.

**Validates: Requirements 3.5**

### Property 13: Metadata Keywords Inclusion

*For any* blog post, the generated metadata keywords should include the post's `primary_keyword` and all `secondary_keywords`.

**Validates: Requirements 3.6**

### Property 14: Scheduled Posts Query Correctness

*For any* set of blog posts with various statuses and publish dates, the auto-publisher query should return only posts where `status='scheduled'` AND `publish_date <= NOW()`.

**Validates: Requirements 4.2**

### Property 15: Auto-Publisher Status Update

*For any* set of scheduled posts with `publish_date <= NOW()`, after running the auto-publisher, all those posts should have `status='published'`.

**Validates: Requirements 4.3**

### Property 16: Draft Request Validation

*For any* POST request to `/api/admin/generate-blog-draft` containing `topic` and `primary_keyword` fields, the request should be accepted and processed.

**Validates: Requirements 5.2**

### Property 17: Draft Creation with Correct Status

*For any* successful draft generation request, a new blog post record should exist in the database with `status='draft'`.

**Validates: Requirements 5.4**

### Property 18: URL-Safe Slug Generation

*For any* generated title, the slug should be URL-safe: lowercase, spaces replaced with hyphens, special characters removed, and contain only alphanumeric characters and hyphens.

**Validates: Requirements 5.5**

### Property 19: Draft Creation Success Response

*For any* successful draft creation, the API should return status code 201 with the created post data including `id`, `slug`, `title`, `excerpt`, and `status`.

**Validates: Requirements 5.7**

### Property 20: Featured Products Query Matching

*For any* blog post with `featured_product_ids`, the queried products should have IDs that exactly match the post's `featured_product_ids` array.

**Validates: Requirements 6.1**

### Property 21: Product Callout Field Completeness

*For any* featured product, the rendered Product Callout should contain the product's `name`, `lore`, `image_url`, and `price`.

**Validates: Requirements 6.2**

### Property 22: Product Callout Link Correctness

*For any* featured product with slug S, the Product Callout should contain a link to `/shop/S`.

**Validates: Requirements 6.3**

### Property 23: Email Subscription Persistence

*For any* email submitted through the signup CTA, the email should exist in the `email_subscribers` table with `source='journal'`.

**Validates: Requirements 7.3**

### Property 24: Duplicate Email Handling

*For any* email that already exists in `email_subscribers`, submitting it again should result in a message indicating the email is already subscribed (not an error).

**Validates: Requirements 7.5**

### Property 25: Product Reference Link Conversion

*For any* markdown content containing `[product:slug]` where slug exists in the products table, the rendered HTML should contain a link to `/shop/slug`.

**Validates: Requirements 8.1, 8.2**

### Property 26: Invalid Product Reference Fallback

*For any* markdown content containing `[product:slug]` where slug does NOT exist in the products table, the rendered HTML should contain the slug as plain text without a link.

**Validates: Requirements 8.4**

### Property 27: XSS Prevention in Markdown

*For any* markdown content containing potentially malicious HTML or JavaScript (e.g., `<script>` tags, `onclick` attributes), the rendered HTML should sanitize these elements to prevent XSS attacks.

**Validates: Requirements 9.5**

### Property 28: Static Params Published Posts Only

*For any* execution of `generateStaticParams`, the returned array should contain slug objects only for posts where `status='published'`.

**Validates: Requirements 10.2**

### Property 29: Static Params Array Format

*For any* set of published posts, `generateStaticParams` should return an array where each element is an object with a `slug` property matching a published post's slug.

**Validates: Requirements 10.3**

## Error Handling

### Client-Side Errors

**404 Not Found**:
- Trigger: Navigating to `/journal/[slug]` where slug doesn't match any published post
- Response: Next.js `notFound()` function, renders custom 404 page
- User Experience: "This post doesn't exist or has been removed" message with link back to journal index

**Invalid Email Format**:
- Trigger: Submitting email without `@` symbol
- Response: Client-side validation prevents submission
- User Experience: Inline error message "Please enter a valid email address"

**Network Errors**:
- Trigger: Email submission fails due to network issues
- Response: Catch fetch error, display error state
- User Experience: "Something went wrong. Please try again." with retry button

### Server-Side Errors

**Database Query Failures**:
- Trigger: Supabase connection timeout or query error
- Response: Log error, return empty array or null
- Fallback: Display "No posts available" message on index, 404 on detail page
- Monitoring: Log to console with error details for debugging

**Claude API Failures**:
- Trigger: API timeout, rate limit, or invalid response
- Response: Return 500 status with error message
- User Experience: Admin sees "Draft generation failed: [error message]"
- Retry Strategy: No automatic retry, admin must manually retry request

**Auto-Publisher Failures**:
- Trigger: Database update fails during scheduled publishing
- Response: Log error, return 500 status to Vercel Cron
- Monitoring: Vercel Cron logs show failure, admin receives notification
- Recovery: Next cron execution will retry (idempotent operation)

**Missing Environment Variables**:
- Trigger: `ANTHROPIC_API_KEY` or Supabase credentials not set
- Response: Throw error at build time or runtime
- Prevention: Validate environment variables in API routes before processing

### Data Validation

**Slug Uniqueness**:
- Constraint: Database UNIQUE constraint on `slug` column
- Conflict Resolution: If slug exists, append `-2`, `-3`, etc. until unique
- Implementation: Check for existing slug before insert, increment suffix if needed

**Markdown Sanitization**:
- Library: `react-markdown` with default sanitization enabled
- Blocked Elements: `<script>`, `<iframe>`, `<object>`, `<embed>`
- Allowed Elements: Standard markdown elements (headings, paragraphs, lists, links, images, code)
- XSS Prevention: All HTML attributes are sanitized, `javascript:` URLs blocked

**Product ID Validation**:
- Validation: Query products table to verify all `featured_product_ids` exist
- Fallback: If product doesn't exist, skip rendering that callout (no error)
- User Experience: Graceful degradation, post still renders without missing products

## Testing Strategy

### Unit Testing

Unit tests will focus on specific examples, edge cases, and integration points:

**Markdown Parsing Examples**:
- Test that `# Heading` renders as `<h1>`
- Test that `**bold**` renders as `<strong>`
- Test that `[link](url)` renders as `<a href="url">`
- Test that `[product:gothic-ring]` converts to `/shop/gothic-ring` link
- Test that `<script>alert('xss')</script>` is sanitized

**Slug Generation Examples**:
- Test that "Gothic Fashion Guide" becomes "gothic-fashion-guide"
- Test that "The Raven's Call: A Dark Tale" becomes "the-ravens-call-a-dark-tale"
- Test that "Product #1 (New!)" becomes "product-1-new"

**Email Validation Examples**:
- Test that "user@example.com" is accepted
- Test that "invalid-email" is rejected
- Test that "user@domain" is rejected

**Edge Cases**:
- Empty markdown content renders without errors
- Post with no featured products renders without callouts
- Post with 0 featured_product_ids renders empty array
- Pagination with exactly 12 posts shows no pagination controls
- Pagination with 13 posts shows pagination controls

**Error Conditions**:
- Invalid slug returns 404
- Missing required fields in draft generation returns 400
- Claude API failure returns 500
- Database connection failure logs error and returns empty state

### Property-Based Testing

Property tests will verify universal properties across randomized inputs using a property-based testing library (e.g., `fast-check` for JavaScript/TypeScript). Each test will run a minimum of 100 iterations.

**Test Configuration**:
```javascript
import fc from 'fast-check';

// Example property test structure
describe('Property Tests', () => {
  it('Property 1: Published Posts Query Correctness', () => {
    fc.assert(
      fc.property(
        fc.array(blogPostArbitrary()),
        async (posts) => {
          // Test implementation
        }
      ),
      { numRuns: 100 }
    );
  });
});
```

**Generators (Arbitraries)**:

```javascript
// Blog post generator
const blogPostArbitrary = () => fc.record({
  id: fc.uuid(),
  slug: fc.stringMatching(/^[a-z0-9-]+$/),
  title: fc.string({ minLength: 10, maxLength: 100 }),
  body_markdown: fc.string({ minLength: 100, maxLength: 2000 }),
  excerpt: fc.string({ maxLength: 150 }),
  status: fc.constantFrom('draft', 'scheduled', 'published'),
  publish_date: fc.date(),
  featured_product_ids: fc.array(fc.uuid(), { maxLength: 5 }),
});

// Product generator
const productArbitrary = () => fc.record({
  id: fc.uuid(),
  slug: fc.stringMatching(/^[a-z0-9-]+$/),
  name: fc.string({ minLength: 5, maxLength: 50 }),
  lore: fc.string({ minLength: 50, maxLength: 200 }),
  image_url: fc.webUrl(),
  price: fc.integer({ min: 100, max: 50000 }),
});

// Markdown generator
const markdownArbitrary = () => fc.string().map(s => {
  // Generate markdown with headings, lists, bold, italic, links
  return `# ${s}\n\n**Bold** and *italic* text.\n\n- List item 1\n- List item 2`;
});
```

**Property Test Tags**:

Each property test must include a comment tag referencing the design document property:

```javascript
/**
 * Feature: journal-blog-engine, Property 1: Published Posts Query Correctness
 * For any set of blog posts with various statuses and publish dates,
 * querying published posts should return only posts where status='published'
 * AND publish_date <= NOW(), ordered by publish_date descending.
 */
it('Property 1: Published Posts Query Correctness', () => {
  // Test implementation
});
```

**Key Property Tests**:

1. **Published Posts Query** (Property 1): Generate random posts, verify query filters correctly
2. **Pagination Limit** (Property 2): Generate N posts, verify first page has min(N, 12)
3. **Markdown Parsing** (Property 6): Generate random markdown, verify HTML output
4. **Slug Generation** (Property 18): Generate random titles, verify slugs are URL-safe
5. **Product Reference Conversion** (Property 25): Generate markdown with product refs, verify links
6. **XSS Prevention** (Property 27): Generate markdown with malicious content, verify sanitization

**Test Coverage Goals**:
- Unit tests: 80%+ code coverage
- Property tests: All 29 correctness properties implemented
- Integration tests: Critical user flows (view index, view post, submit email)
- E2E tests: Full page rendering with real database (optional, using Playwright)

**Testing Tools**:
- Test Runner: Jest or Vitest
- Property Testing: `fast-check`
- React Testing: `@testing-library/react`
- API Testing: `supertest` or `msw` (Mock Service Worker)
- Database Testing: In-memory Supabase mock or test database

