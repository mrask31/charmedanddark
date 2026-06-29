# Journal SEO + Landing Page Handoff for Kiro

## Context

Charmed & Dark just finished a post-convention merchandising review after Haunted America 2026 in Grafton, IL. The strongest commercial signal is Kiss Lock Bags:

- In-person: bags/purses were the biggest seller at the conference.
- Buying behavior: people tended to buy one purse at a time.
- PostHog: Moon Moth and Celestial earned attention; Ghost Cat and Dragon showed stronger recent cart intent.
- Strategy: make Kiss Lock Bags the hero merchandising category, keep Summerween visible but secondary, and use journals to add SEO depth and brand storytelling.

PR #27 already handles the low-risk code changes:

- Homepage hero points to `/collections/kiss-lock-bags`.
- Kiss Lock Bags are merchandised above Summerween.
- A dedicated `/collections/kiss-lock-bags` page exists.
- Social proof says `Official vendor — Grafton, IL`.
- Social proof now includes a Kiss Lock Bag Favorites card.
- Variant-selection guidance on product pages is clearer for mobile users.

Do not undo those changes.

---

## Work Kiro should handle next

### 1. Add real journal posts through the existing `blog_posts` flow

The Journal page reads published posts from Supabase table `blog_posts`. Use the existing schema, route conventions, and components. Do not hardcode fake journal entries into the homepage as a substitute for real posts.

Before inserting/updating content:

- Inspect the current `blog_posts` schema.
- Confirm required fields such as `title`, `slug`, `excerpt`, `content`, `cover_image_url`, `category`, `status`, and date fields.
- Use `status = 'published'` only when content is complete.
- Make sure each slug is unique.
- Use available image assets where possible. If no image exists, use the existing placeholder behavior rather than inventing broken paths.

### 2. Publish the first 5 journal posts

Create the following posts in this order.

#### Post 1: What Haunted America Taught Us About the Pieces People Reach For

Purpose: event proof, brand story, bag merchandising support.

SEO title:
`What Haunted America Taught Us About Gothic Bags and Statement Pieces`

Slug:
`what-haunted-america-taught-us-about-statement-pieces`

Category:
`Field Notes`

Excerpt:
`At Haunted America 2026 in Grafton, Illinois, one thing became clear: people were drawn to pieces that felt personal, useful, and just strange enough. The Kiss Lock Bags became the quiet favorite — one bag at a time.`

Core points:

- Mention Haunted America 2026 in Grafton, IL.
- Avoid overclaiming online sales volume.
- Explain that shoppers responded to useful statement pieces.
- Position Kiss Lock Bags as the clearest takeaway.
- Link naturally to `/collections/kiss-lock-bags`.
- Link to Ghost Cat and Dragon bag product pages if handles exist.

#### Post 2: Why One Bag Can Change the Whole Look

Purpose: direct support for Kiss Lock Bag conversion.

SEO title:
`Why One Gothic Bag Can Change an Entire Outfit`

Slug:
`why-one-gothic-bag-can-change-the-whole-look`

Category:
`Style Notes`

Excerpt:
`You do not need a full wardrobe shift to make a look feel darker. Sometimes one bag does the work — the shape, the clasp, the detail, and the mood.`

Core points:

- Make the buying logic simple: one bag, complete mood.
- Talk about clasp shape, silhouette, texture, and small statement details.
- Link to `/collections/kiss-lock-bags`.
- Use soft product callout language, not aggressive sales copy.

#### Post 3: Summerween Is Not a Season. It’s a Mood.

Purpose: keep Summerween alive but secondary.

SEO title:
`Summerween Style Ideas for a Haunted Summer Mood`

Slug:
`summerween-is-not-a-season-its-a-mood`

Category:
`Seasonal Notes`

Excerpt:
`Summerween is what happens when the sun is out but your heart still wants pumpkins, ghosts, roadside motels, and a little bit of mischief.`

Core points:

- Explain Summerween as a mood, not just a product drop.
- Link to `/drops`.
- Link to Summerween apparel where handles exist.
- Keep it playful but still on-brand.

#### Post 4: How to Build a Dark Home Without Making It Feel Like a Set

Purpose: support dark home decor and ritual-object shoppers.

SEO title:
`How to Build a Dark Home Without Making It Feel Like a Movie Set`

Slug:
`how-to-build-a-dark-home-without-making-it-feel-like-a-set`

Category:
`Home Rituals`

Excerpt:
`A dark home does not need to look like a movie set. The best rooms feel collected over time — candlelight, texture, useful objects, and pieces that make ordinary routines feel intentional.`

Core points:

- Explain dark home decor as lived-in, not staged.
- Mention candlelight, trays, drinkware, mirrors, textiles, and useful objects.
- Link to `/shop`.
- Avoid generic AI-style decor advice.

#### Post 5: Welcome to the Sanctuary: What Members Get

Purpose: clarify membership value.

SEO title:
`What Charmed & Dark Sanctuary Members Get`

Slug:
`welcome-to-the-sanctuary-what-members-get`

Category:
`Sanctuary Notes`

Excerpt:
`The Sanctuary is for people who want first access, quieter details, and a little more from the world of Charmed & Dark.`

Core points:

- Explain members save 10%.
- Explain early drops.
- Explain journal/grimoire value if applicable.
- Link to `/join`.
- Keep this simple and transparent.

---

## SEO requirements for every journal post

Each post should have:

- Clear title
- Unique slug
- Useful excerpt
- Search-friendly metadata
- 2 to 4 internal links
- One soft product/category callout near the end
- No fabricated reviews, numbers, or sales claims
- No fake customer quotes
- No unsupported claims like `best-selling online`

Recommended structured data improvement:

- Add BlogPosting or Article JSON-LD on individual journal post pages if it does not already exist.
- Include headline, description, image when available, datePublished, dateModified, author or publisher, and canonical URL.

---

## Landing page follow-ups after PR #27

### A. Confirm homepage order

Expected order:

1. Hero
2. Brand positioning
3. Kiss Lock Bags
4. Summerween Favorites
5. Category portals
6. Social proof
7. Editorial break / Mirror
8. Sanctuary
9. Journal
10. Footer

### B. Validate copy

Make sure the live homepage no longer leads with Summerween as the first product section after PR #27 merges.

### C. Validate the social proof cards

Expected cards:

- Featured at Haunted America 2026 — Official vendor — Grafton, IL
- Kiss Lock Bag Favorites — Small gothic statement bags, chosen one at a time.
- Seasonal Collections — Summerween, Haunted America, and year-round drops.
- Secure Shopify Checkout — All orders processed through Shopify’s trusted platform.

### D. Journal homepage preview

After real posts exist, consider replacing the hardcoded `JournalPreview` homepage content with the most recent published journal post from Supabase, or a 3-card recent-post preview.

Do not do this until at least 3 real published posts exist.

---

## Analytics after launch

Track for 7 to 14 days after merge:

- Homepage hero CTA click rate to `/collections/kiss-lock-bags`
- `/collections/kiss-lock-bags` product click-through rate
- Product viewed to add-to-cart rate for Ghost Cat, Dragon, Celestial, Moon Moth, Cowgirl
- Summerween product viewed to add-to-cart rate after being moved lower
- Missing variant events on apparel after the mobile clarity update

Primary success metric:

- Product view to add-to-cart rate improves for bags and mobile apparel.

Secondary success metric:

- Google Ads traffic has a clearer destination and lower product-page dead-end behavior.
