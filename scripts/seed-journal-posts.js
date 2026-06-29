/**
 * Seed the first 5 Charmed & Dark journal posts into the blog_posts table.
 *
 * Run with:
 *   node scripts/seed-journal-posts.js
 *
 * Requires NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env.local
 *
 * Behavior:
 *   - Upserts by slug (safe to re-run without duplicates)
 *   - Sets status = 'published' and publish_date = now
 *   - Skips any post whose slug already exists with status = 'published'
 */

import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';

dotenv.config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

const posts = [
  // ─────────────────────────────────────────────────────────────────────────────
  // POST 1: Haunted America Field Notes
  // ─────────────────────────────────────────────────────────────────────────────
  {
    slug: 'what-haunted-america-taught-us-about-statement-pieces',
    title: 'What Haunted America Taught Us About the Pieces People Reach For',
    meta_description:
      'At Haunted America 2026 in Grafton, Illinois, we learned that people reach for gothic bags and accessories that feel personal and useful — not just dark.',
    excerpt:
      'At Haunted America 2026 in Grafton, Illinois, one thing became clear: people were drawn to pieces that felt personal, useful, and just strange enough. The Kiss Lock Bags became the quiet favorite — one bag at a time.',
    primary_keyword: 'gothic bags Haunted America',
    secondary_keywords: ['kiss lock bags', 'gothic statement pieces', 'Haunted America 2026', 'Grafton IL'],
    category: 'Field Notes',
    author: 'Charmed & Dark',
    body_markdown: `## What We Noticed at Haunted America 2026

Haunted America takes place in Grafton, Illinois — a small river town where the paranormal community gathers each year to share stories, investigate, and shop. We set up in the vendor hall expecting people to browse the way they always do: quickly, casually, moving from table to table.

That is not what happened.

---

## People Stopped for the Bags

The Kiss Lock Bags drew people in before anything else. Not because they were the loudest thing on the table — they were not. But the clasp, the shape, the size — something about them made people pause, pick one up, and turn it over in their hands.

Most people chose one bag. Not two. Not a matching set. One bag that felt right. The [Ghost Cat](/collections/kiss-lock-bags) was the most picked-up piece across both days. The [Dragon](/collections/kiss-lock-bags) came second, usually chosen by people who wanted something a little bolder.

---

## What People Said

We did not ask for reviews or testimonials. But a few things kept coming up in conversation:

- "This is the kind of thing I would actually carry."
- "It is small enough to not take over, but strange enough to make me happy."
- "I do not want a costume piece. I want something that works with what I already wear."

That last one stuck with us. People were not shopping for a Halloween accessory. They were shopping for a bag they could carry to dinner, to work, or to a weekend market.

---

## The Takeaway

Haunted America taught us that the pieces people reach for are the ones that feel useful and personal — not just dark. A gothic bag does not have to look like it belongs in a haunted house. It just has to feel like it belongs to you.

If you missed us in Grafton, the full [Kiss Lock Bag collection](/collections/kiss-lock-bags) is available online. Same pieces. Same clasp. Same quiet statement.

---

*Charmed & Dark was an official vendor at Haunted America 2026 in Grafton, Illinois.*`,
  },

  // ─────────────────────────────────────────────────────────────────────────────
  // POST 2: Why One Bag Changes Everything
  // ─────────────────────────────────────────────────────────────────────────────
  {
    slug: 'why-one-gothic-bag-can-change-the-whole-look',
    title: 'Why One Bag Can Change the Whole Look',
    meta_description:
      'You do not need a full wardrobe overhaul to shift your style darker. One gothic bag — the right clasp, the right shape — can do the work for you.',
    excerpt:
      'You do not need a full wardrobe shift to make a look feel darker. Sometimes one bag does the work — the shape, the clasp, the detail, and the mood.',
    primary_keyword: 'gothic bag outfit',
    secondary_keywords: ['kiss lock bag styling', 'one bag outfit change', 'dark accessories', 'gothic fashion'],
    category: 'Style Notes',
    author: 'Charmed & Dark',
    body_markdown: `## You Do Not Need a Full Wardrobe Shift

There is a version of gothic style that requires a complete overhaul — new wardrobe, new aesthetic, new identity. That version is exhausting and, honestly, not how most people dress in real life.

The version we believe in is simpler: one piece, chosen well, changes the mood of everything around it.

---

## What Makes a Bag Do the Work

Not every bag shifts a look. The ones that do tend to share a few qualities:

- **A distinctive clasp.** The kiss lock is one of the oldest bag closures, but it still reads as intentional. It says you chose this bag on purpose.
- **A compact silhouette.** A small structured bag anchors a look without overwhelming it. It becomes the focal point instead of competing with your clothes.
- **Texture and detail.** Embossed patterns, metallic frames, or unexpected motifs — these are what make people notice.
- **A mood, not a costume.** The goal is not "halloween every day." The goal is quiet strangeness that feels like you.

---

## How It Works in Practice

Pair a [Kiss Lock Bag](/collections/kiss-lock-bags) with jeans and a plain black tee. The bag does the talking. Pair it with a dress you already own. The clasp catches light. The shape creates contrast. The rest of your outfit stays easy.

This is not about buying more things. It is about one piece that makes what you already have feel more intentional.

---

## The Pieces That Work Hardest

The Celestial and Moon Moth bags tend to work across the widest range of outfits — their motifs are detailed enough to anchor a look but not so loud that they fight with patterned clothing.

The Ghost Cat and Dragon lean a bit bolder and pair best with simpler outfits where you want the bag to be the statement.

Browse the full [Kiss Lock Bag collection](/collections/kiss-lock-bags) and see which one fits the mood you are already building.

---

*One bag. That is the whole strategy.*`,
  },

  // ─────────────────────────────────────────────────────────────────────────────
  // POST 3: Summerween
  // ─────────────────────────────────────────────────────────────────────────────
  {
    slug: 'summerween-is-not-a-season-its-a-mood',
    title: 'Summerween Is Not a Season. It Is a Mood.',
    meta_description:
      'Summerween is what happens when the sun is out but your heart wants pumpkins, ghosts, and roadside motels. Style ideas for a haunted summer mood.',
    excerpt:
      'Summerween is what happens when the sun is out but your heart still wants pumpkins, ghosts, roadside motels, and a little bit of mischief.',
    primary_keyword: 'Summerween style',
    secondary_keywords: ['haunted summer', 'summer gothic', 'Summerween outfits', 'year-round halloween'],
    category: 'Seasonal Notes',
    author: 'Charmed & Dark',
    body_markdown: `## What Even Is Summerween

Summerween is not on any calendar. It is not a sale, a holiday, or a limited-time event. It is the feeling you get when it is July, the sun is relentless, and your heart still wants:

- Jack-o-lanterns
- Ghost stories
- Roadside motels with flickering signs
- Iced coffee in a skeleton mug
- A reason to wear black when everyone else is in pastels

Summerween is the refusal to wait until October to feel like yourself.

---

## How Summerween Shows Up

It is not about decorating your house like a Spirit Halloween in June (though we respect the commitment). It is smaller than that:

- A tee with a motif that nods to the macabre without screaming it
- Drinkware that makes your morning coffee feel like a ritual
- A bag with a clasp shaped like something that should not be on a bag
- A candle that smells like rain and old wood, not pumpkin spice

Summerween is about letting the mood breathe through small objects. It is summer, but haunted. Casually, comfortably haunted.

---

## The Charmed & Dark Take

Our [seasonal drops](/drops) lean into this energy. Pieces designed for heat — lighter fabrics, brighter darks (yes, that is a thing), and motifs that feel summer-adjacent without losing the edge.

We release Summerween pieces throughout the warm months. No single drop date, no countdown timer. Just new things appearing when the mood is right.

---

## Who Summerween Is For

Summerween is for people who:

- Put up Halloween decorations early and take them down late (or never)
- Feel more alive at dusk than at noon
- Want their home and wardrobe to reflect a mood, not a season
- Think "spooky" and "cozy" are the same word

If that sounds like you, keep an eye on [the latest drops](/drops). Summerween does not end. It just gets quieter until next summer.

---

*The sun is out. The ghosts are still here. That is Summerween.*`,
  },

  // ─────────────────────────────────────────────────────────────────────────────
  // POST 4: Dark Home Decor
  // ─────────────────────────────────────────────────────────────────────────────
  {
    slug: 'how-to-build-a-dark-home-without-making-it-feel-like-a-set',
    title: 'How to Build a Dark Home Without Making It Feel Like a Set',
    meta_description:
      'A dark home does not need to look like a movie set. Build one that feels collected over time — candlelight, texture, and objects that make routine feel intentional.',
    excerpt:
      'A dark home does not need to look like a movie set. The best rooms feel collected over time — candlelight, texture, useful objects, and pieces that make ordinary routines feel intentional.',
    primary_keyword: 'dark home decor',
    secondary_keywords: ['gothic home styling', 'dark interior design', 'ritual objects', 'gothic living room'],
    category: 'Home Rituals',
    author: 'Charmed & Dark',
    body_markdown: `## The Problem With "Gothic Home" Searches

Search for dark home decor and you will find two things: expensive minimalism that looks like a gallery, or over-the-top maximalism that looks like a movie set. Neither one feels like a place where someone actually lives, makes coffee, reads a book, or forgets to do the dishes.

A dark home should feel lived in. Collected. Like every object ended up there for a reason — even if the reason was just "I liked it and it stayed."

---

## Start With Light, Not Color

The fastest way to change a room's mood is not paint. It is light.

- **Candles over overhead lighting.** A single candle on a tray changes a bathroom into a ritual space. Three candles on a mantel make a living room feel intentional after dark.
- **Warm, low sources.** Table lamps with warm bulbs. A salt lamp in the corner. Anything that creates shadow instead of eliminating it.
- **Let dark corners stay dark.** Not every space needs to be lit. A dim hallway, an unlit bookshelf — these create depth.

---

## Texture Over Theme

Gothic home decor does not need a theme. It needs texture.

- Velvet (a throw, a cushion, a curtain)
- Matte black ceramics (a mug, a tray, a planter)
- Aged wood or dark-stained surfaces
- Glass (apothecary jars, decanters, terrariums)
- Metals that tarnish (brass, copper, iron)

Mix these and the room starts to feel dark without needing a single skull or raven. (Though if you want skulls and ravens, that is fine too.)

---

## Useful Objects That Pull Double Duty

The best dark decor is not decorative — it is functional:

- A cast iron candle holder that also works as a bookend
- A vintage tray that corrals keys, rings, and daily carry
- Drinkware with weight and detail that makes coffee feel ceremonial
- A mirror with a frame that gives a wall presence without hanging art

Browse the [full shop](/shop) for objects designed to do both: look good and get used daily.

---

## The Collected-Over-Time Rule

The difference between a dark home that feels real and one that feels staged: time. Or at least the appearance of time.

Do not buy everything at once. Add one object per month. Move things around. Let a candle burn down before replacing it. The goal is a room that looks like it grew — not like it was installed.

---

*A dark home is not a project. It is a slow accumulation of things that make ordinary moments feel a little more intentional.*`,
  },

  // ─────────────────────────────────────────────────────────────────────────────
  // POST 5: Sanctuary Membership
  // ─────────────────────────────────────────────────────────────────────────────
  {
    slug: 'welcome-to-the-sanctuary-what-members-get',
    title: 'Welcome to the Sanctuary: What Members Get',
    meta_description:
      'The Sanctuary is for people who want first access, 10% off, and quieter details from the world of Charmed & Dark. Here is what membership includes.',
    excerpt:
      'The Sanctuary is for people who want first access, quieter details, and a little more from the world of Charmed & Dark.',
    primary_keyword: 'Charmed and Dark membership',
    secondary_keywords: ['Sanctuary membership', 'Charmed Dark rewards', 'gothic brand membership'],
    category: 'Sanctuary Notes',
    author: 'Charmed & Dark',
    body_markdown: `## What the Sanctuary Is

The Sanctuary is not a loyalty program with points, tiers, and gamified nonsense. It is a membership for people who want to be closer to what we are building — and who want a few quiet perks in return.

If you have ever wanted to know about a drop before it goes live, or wished you could save a little on every order without hunting for codes, this is what the Sanctuary is for.

---

## What Members Get

### 10% Off Every Order

No code needed. No minimum purchase. The discount applies automatically when you are signed in. It works on full-price items, seasonal drops, and new releases.

### Early Access to Drops

Sanctuary members see new collections and limited pieces before they go public. Most drops get a 24–48 hour early window. Some smaller releases are Sanctuary-only until stock allows a wider release.

### The Journal, Unfiltered

Members occasionally receive extended journal entries, behind-the-scenes notes, and early looks at what we are working on. Think of it as the version of the journal that does not need to perform for search engines.

### Quieter Communication

We do not spam. Sanctuary emails go out when something actually matters — a new drop, a restock, a journal entry worth reading. That is it. No "just checking in" emails. No countdowns.

---

## What It Costs

Joining the Sanctuary is free during the founding period. We may introduce a paid tier later for deeper access, but the core membership — discount, early access, journal — stays free for founding members.

---

## How to Join

Visit [the Sanctuary page](/join) and enter your email. That is it. No quiz, no profile to fill out, no social login required.

You will get a welcome email confirming your membership and your next-order discount. From there, drops and journal entries arrive when they arrive.

---

## Who It Is For

The Sanctuary is for people who:

- Want first access without refreshing a page
- Appreciate saving 10% without searching for coupon codes
- Like knowing what is coming before it is announced publicly
- Prefer fewer, better emails over constant marketing noise

If that sounds right, [join here](/join). The door is open.

---

*The Sanctuary is quiet by design. Come in when you are ready.*`,
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// Seed Logic
// ─────────────────────────────────────────────────────────────────────────────

async function seed() {
  console.log('🌙 Seeding 5 journal posts into blog_posts...\n');

  const now = new Date().toISOString();
  let inserted = 0;
  let skipped = 0;

  for (const post of posts) {
    // Check if slug already exists as published
    const { data: existing } = await supabase
      .from('blog_posts')
      .select('id, status')
      .eq('slug', post.slug)
      .single();

    if (existing && existing.status === 'published') {
      console.log(`  ⏭  Skipped (already published): ${post.slug}`);
      skipped++;
      continue;
    }

    const payload = {
      ...post,
      status: 'published',
      publish_date: now,
      created_at: now,
      updated_at: now,
    };

    if (existing) {
      // Update existing draft/scheduled post to published
      const { error } = await supabase
        .from('blog_posts')
        .update(payload)
        .eq('id', existing.id);

      if (error) {
        console.error(`  ✗ Failed to update ${post.slug}:`, error.message);
      } else {
        console.log(`  ✓ Updated & published: ${post.slug}`);
        inserted++;
      }
    } else {
      // Insert new post
      const { error } = await supabase
        .from('blog_posts')
        .insert(payload);

      if (error) {
        console.error(`  ✗ Failed to insert ${post.slug}:`, error.message);
      } else {
        console.log(`  ✓ Inserted & published: ${post.slug}`);
        inserted++;
      }
    }
  }

  console.log(`\n✨ Done. Inserted/updated: ${inserted}, Skipped: ${skipped}`);
  console.log('   Posts will appear on /journal after ISR revalidation (up to 1 hour).');
  console.log('   Or redeploy / clear cache for immediate visibility.');
}

seed().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});
