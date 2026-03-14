# Requirements Document

## Introduction

The Journal page is a public-facing page at the /journal route that displays blog posts for the Charmed & Dark brand. The page follows the established Design System (Cormorant Garamond serif headings, Inter body text, #08080f background, #c9a96e gold accents, star field backgrounds) identical to the Sanctuary and Drops pages. The page features a hero section with the most recent post prominently displayed, a grid of remaining posts with client-side "load more" pagination, and fetches all data from the existing blog_posts table in Supabase. The page replaces the current journal page implementation and fixes a left-edge content clipping bug.

## Glossary

- **Journal_Page**: The public page at /journal route displaying blog posts
- **JournalHero**: The hero section containing star field, title, and featured post block
- **PostGrid**: The grid section displaying all posts except the featured post
- **PostCard**: An individual card component representing a single blog post in the grid
- **LoadMore**: A button component that loads additional posts into the grid
- **Featured_Post**: The most recent published blog post, displayed prominently in the hero
- **Blog_Post**: A record in the Supabase blog_posts table
- **Supabase**: The database service storing blog post data
- **Design_System**: The visual design language (fonts, colors, spacing, components) shared with Sanctuary and Drops pages

## Requirements

### Requirement 1: Journal Page Route and Layout

**User Story:** As a visitor, I want to access the Journal page at /journal, so that I can read blog posts from Charmed & Dark.

#### Acceptance Criteria

1. THE Journal_Page SHALL be accessible at the /journal route as a Next.js 14 page component
2. THE Journal_Page SHALL be fully accessible to unauthenticated visitors without any auth gating
3. THE Journal_Page SHALL use the Design_System background color #08080f
4. THE Journal_Page SHALL use Cormorant Garamond font for all serif headings
5. THE Journal_Page SHALL use Inter font with weight 300 for all body text
6. THE Journal_Page SHALL use #c9a96e for all gold accent colors
7. THE Journal_Page SHALL use #e8e4dc for all primary text colors
8. THE Journal_Page SHALL use 0px border radius for cards and section containers
9. THE Journal_Page SHALL be fully responsive on mobile, tablet, and desktop viewports
10. THE Journal_Page SHALL apply proper container padding to all content sections to prevent left-edge clipping
11. THE Journal_Page SHALL use JavaScript file extensions (.js) for all source files

### Requirement 2: Supabase blog_posts Table

**User Story:** As a developer, I want the blog_posts table to exist with the required columns, so that the Journal page can query post data.

#### Acceptance Criteria

1. THE Supabase SHALL define a blog_posts table with columns: id (UUID primary key with gen_random_uuid() default), title (TEXT NOT NULL), slug (TEXT NOT NULL UNIQUE), excerpt (TEXT), content (TEXT), cover_image_url (TEXT), category (TEXT), author (TEXT DEFAULT 'Charmed & Dark'), created_at (TIMESTAMPTZ NOT NULL DEFAULT NOW()), published (BOOLEAN DEFAULT TRUE)
2. THE Journal_Page SHALL query only published posts from the blog_posts table by filtering where published equals true
3. THE Journal_Page SHALL order posts by created_at in descending order

### Requirement 3: JournalHero Section

**User Story:** As a visitor, I want to see an immersive hero section with the latest post featured, so that I am drawn into the journal content.

#### Acceptance Criteria

1. THE JournalHero SHALL render a star field background with micro stars at random positions matching the Sanctuary and Drops star field pattern
2. THE JournalHero SHALL render a radial nebula gradient overlay matching the Sanctuary and Drops gradient
3. THE JournalHero SHALL render a crescent moon SVG in the top-right corner, partially visible, at 8% opacity
4. THE JournalHero SHALL mark all decorative elements (star field, nebula gradient, crescent moon) with pointer-events: none and aria-hidden="true"
5. THE JournalHero SHALL display an eyebrow label "THE JOURNAL" in gold (#c9a96e) with 11px font size and tracked uppercase caps
6. THE JournalHero SHALL display the heading "Quiet Reflections" in Cormorant Garamond font at approximately 72px centered
7. THE JournalHero SHALL display the subtext "Gothic musings, ritual notes, and tales from the sanctuary." in Inter font with weight 300, centered, in muted color
8. THE JournalHero SHALL display a thin gold divider line, centered, 120px wide, 1px height
9. THE JournalHero SHALL apply 80px top padding and 60px bottom padding

### Requirement 4: Featured Post Block

**User Story:** As a visitor, I want to see the most recent post prominently featured in the hero, so that I can quickly find the latest content.

#### Acceptance Criteria

1. THE JournalHero SHALL fetch the most recent published post from the blog_posts table ordered by created_at descending with a limit of 1
2. THE JournalHero SHALL display the Featured_Post category as a gold tracked uppercase caps label at 11px
3. THE JournalHero SHALL display the Featured_Post title in Cormorant Garamond font at approximately 48px centered
4. THE JournalHero SHALL display the Featured_Post excerpt in Inter font with weight 300, muted color, centered, limited to 2 lines maximum
5. THE JournalHero SHALL display the Featured_Post meta line as "CHARMED & DARK · [DATE]" in tracked uppercase caps at 10px in muted color
6. THE JournalHero SHALL display a "READ MORE ›" gold text link that navigates to /journal/[slug] for the Featured_Post
7. WHEN no published posts exist in the blog_posts table, THE JournalHero SHALL not render the featured post block

### Requirement 5: PostGrid Section

**User Story:** As a visitor, I want to browse all journal entries in a grid layout, so that I can find posts that interest me.

#### Acceptance Criteria

1. THE PostGrid SHALL display an eyebrow label "ALL ENTRIES" in gold tracked uppercase caps at 11px, left-aligned
2. THE PostGrid SHALL fetch all published posts from the blog_posts table excluding the Featured_Post
3. THE PostGrid SHALL display posts in a 3-column grid on desktop viewports
4. THE PostGrid SHALL display posts in a 2-column grid on tablet viewports
5. THE PostGrid SHALL display posts in a 1-column grid on mobile viewports
6. THE PostGrid SHALL apply 40px top padding and 60px bottom padding
7. THE PostGrid SHALL initially display a maximum of 6 posts
8. WHEN no published posts exist in the blog_posts table, THE Journal_Page SHALL display "Nothing here yet. The sanctuary is quiet." in muted centered text instead of the PostGrid and Featured_Post

### Requirement 6: PostCard Component

**User Story:** As a visitor, I want each post card to show a preview of the post, so that I can decide which posts to read.

#### Acceptance Criteria

1. THE PostCard SHALL display the cover image with aspect-ratio 16/9 and object-fit cover
2. WHEN a Blog_Post has no cover_image_url, THE PostCard SHALL display a dark placeholder with background color #0e0e1a containing a centered gold star icon and "C&D" text
3. THE PostCard SHALL use background color #0e0e1a with a 1px border at rgba(201,169,110,0.2)
4. WHEN a user hovers over a PostCard, THE PostCard SHALL brighten the border to rgba(201,169,110,0.5) and apply a glow box-shadow of 0 0 20px rgba(201,169,110,0.08)
5. THE PostCard SHALL display the Blog_Post category as a gold tracked uppercase caps label at 10px
6. THE PostCard SHALL display the Blog_Post title in Cormorant Garamond font at approximately 22px, limited to 2 lines with ellipsis overflow
7. THE PostCard SHALL display the Blog_Post excerpt in Inter font with weight 300 at 13px, muted color, limited to 2 lines with ellipsis overflow
8. THE PostCard SHALL display the meta line as "CHARMED & DARK · [DATE]" in tracked uppercase caps at 10px in muted color
9. THE PostCard SHALL be fully clickable, navigating to /journal/[slug] for the corresponding Blog_Post

### Requirement 7: LoadMore Component

**User Story:** As a visitor, I want to load more posts without a full page reload, so that I can browse additional content seamlessly.

#### Acceptance Criteria

1. THE LoadMore SHALL display a centered pill-shaped button with the text "LOAD MORE ENTRIES"
2. THE LoadMore SHALL style the button with a gold border, transparent fill, and gold text
3. WHEN a user clicks the LoadMore button, THE PostGrid SHALL fetch and display 6 additional posts
4. WHEN all published posts have been loaded, THE LoadMore SHALL be hidden from view
5. THE LoadMore SHALL be positioned below the PostGrid

### Requirement 8: Empty State

**User Story:** As a visitor, I want to see a meaningful message when no posts exist, so that I understand the page is intentionally empty.

#### Acceptance Criteria

1. WHEN the blog_posts table contains zero published posts, THE Journal_Page SHALL display "Nothing here yet. The sanctuary is quiet." as centered muted text
2. WHEN the blog_posts table contains zero published posts, THE Journal_Page SHALL not render the PostGrid section
3. WHEN the blog_posts table contains zero published posts, THE Journal_Page SHALL not render the Featured_Post block
4. WHEN the blog_posts table contains zero published posts, THE Journal_Page SHALL not render the LoadMore button

### Requirement 9: Left-Edge Clipping Bug Fix

**User Story:** As a visitor, I want all content to be properly visible without clipping, so that I can read the full page content.

#### Acceptance Criteria

1. THE Journal_Page SHALL apply consistent container padding (px-4 sm:px-6 or equivalent) to all content sections
2. THE Journal_Page SHALL prevent horizontal overflow clipping on the left edge of any content element
3. THE Journal_Page SHALL wrap content sections in a max-width container with centered alignment

### Requirement 10: Date Formatting

**User Story:** As a visitor, I want dates displayed in a readable format, so that I know when posts were published.

#### Acceptance Criteria

1. THE Journal_Page SHALL format the created_at timestamp from blog_posts into a human-readable date string
2. THE Journal_Page SHALL display dates in uppercase format consistent with the tracked caps meta style
