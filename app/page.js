import { Hero } from "@/components/hero";
import { BrandPositioning } from "@/components/brand-positioning";
import { CategoryPortals } from "@/components/category-portals";
import { HomepageProductSection } from "@/components/homepage-product-section";
import { SocialProof } from "@/components/social-proof";
import { EditorialBreak } from "@/components/editorial-break";
import TheMirror from "@/components/the-mirror";
import { MembershipPitch } from "@/components/membership-pitch";
import { JournalPreview } from "@/components/journal-preview";
import { Footer } from "@/components/footer";
import { supabase } from "@/lib/supabase/client";

// ─── Best Sellers: Kiss Lock Bags (conference-validated #1 seller) ───
const BEST_SELLER_HANDLES = [
  'celestial-kisslock-bag-in-linen-blended-fabric',
  'cherry-kiss-lock-bag-in-linen-blend-fabric',
  'ghost-in-strawberry-field-in-linen-blend',
  'ghost-cat-pumpkin-kiss-lock-bag',
  'desert-moon-cowgirl-kiss-lock-bag',
  'celestial-dragon-kiss-lock-bag-in-linen-cotton-blend',
];

// ─── Light the Darkness: Candles (conference-validated #2 seller) ───
const CANDLE_HANDLES = [
  'bird-branch-candle-holder',
  'set-of-3-starry-night-celestial-taper-candles',
  '2pcs-halloween-3d-snake-shaped-smokeless-taper-candle-cm071',
  'bat-candle-holder',
];

// ─── Dark Home: Decor pieces ───
const DARK_HOME_HANDLES = [
  'victorian-tray',
  'gothic-striped-bat-wing-halloween-teacup',
  'gothic-halloween-black-spider-teacup',
  'black-gothic-coffin-shaped-gothic-trinket-tray',
];

// ─── Smutty Good Girl: New bookish capsule collection ───
const SGG_HANDLES = [
  'smutty-good-girl-society-tote',
  'smutty-good-girl-reading-fuel-accent-coffee-mug-15oz',
  's-g-g-enchanted-reads-water-bottle-20oz',
  's-g-g-secret-society-water-bottle-20oz',
];

// ─── Summerween: Seasonal (lower priority after conference data) ───
const SUMMERWEEN_HANDLES = [
  'summerween-trucker-snapback-hat',
  'summerween-fourth-of-july-halloween-shirt',
  'hexes-heat-unisex-summer-tee-1',
  'summerween-womens-flowy-scoop-muscle-tank-1',
];

// ─── Apparel: Moved lowest (almost no shirt sales at conference) ───
const APPAREL_HANDLES = [
  'camp-charmed-and-dark-unisex-ringer-tee',
  'salty-spells-sunset-sins-womens-boxy-tee-1',
  'charmed-by-night-womens-ringer-tee',
  'hexes-heat-unisex-summer-tee-1',
];

async function fetchProductsByHandles(handles) {
  try {
    const { data } = await supabase
      .from('products')
      .select('name, title, handle, slug, price, sale_price, image_url, image_urls, images, qty')
      .in('handle', handles)
      .eq('hidden', false);

    // Sort to match the handles order
    const sorted = handles
      .map((h) => (data || []).find((p) => p.handle === h || p.slug === h))
      .filter(Boolean);

    return sorted;
  } catch (err) {
    console.error('Failed to fetch products:', err);
    return [];
  }
}

export default async function Home() {
  const [bestSellers, candles, darkHome, smuttyGoodGirl, summerween, apparel] = await Promise.all([
    fetchProductsByHandles(BEST_SELLER_HANDLES),
    fetchProductsByHandles(CANDLE_HANDLES),
    fetchProductsByHandles(DARK_HOME_HANDLES),
    fetchProductsByHandles(SGG_HANDLES),
    fetchProductsByHandles(SUMMERWEEN_HANDLES),
    fetchProductsByHandles(APPAREL_HANDLES),
  ]);

  return (
    <main className="min-h-screen bg-black">
      {/* 1. Hero */}
      <Hero />

      {/* 2. Best Sellers — Kiss Lock Bags first (conference #1) */}
      <HomepageProductSection
        title="Best Sellers"
        products={bestSellers}
        badge="Best Seller"
        viewAllHref="/collections/kiss-lock-bags"
        ctaLabel="Shop All Bags"
        intro="The pieces customers reached for first at Haunted America 2026. One bag at a time."
      />

      {/* 3. The Kiss Lock Collection — featured merchandising block */}
      <section className="bg-black px-8 py-20 lg:px-16">
        <div className="mx-auto max-w-4xl text-center">
          <span className="text-[11px] uppercase tracking-[0.3em] text-[#B89C6D]" style={{ fontFamily: 'Inter, sans-serif' }}>
            The Kiss Lock Collection
          </span>
          <h2
            className="mt-5 font-serif text-3xl italic text-white md:text-5xl"
            style={{ fontFamily: 'Cormorant Garamond, Georgia, serif', lineHeight: 1.3 }}
          >
            One bag. The whole mood changes.
          </h2>
          <p
            className="mx-auto mt-6 max-w-2xl text-sm font-light leading-relaxed md:text-base"
            style={{ color: 'rgba(232, 228, 220, 0.6)', fontFamily: 'Inter, sans-serif' }}
          >
            Vintage-inspired gothic bags with kiss lock clasps, linen blends, and motifs that make people stop and ask.
            Chosen one at a time. Carried every day.
          </p>
          <a
            href="/collections/kiss-lock-bags"
            className="mt-8 inline-block border border-[#B89C6D] px-8 py-4 text-xs uppercase tracking-widest text-[#B89C6D] transition-colors duration-160 hover:bg-[#B89C6D] hover:text-black"
          >
            Explore the Collection
          </a>
        </div>
      </section>

      {/* 4. Light the Darkness — Candles (conference #2 seller) */}
      <HomepageProductSection
        title="Light the Darkness"
        products={candles}
        badge="Ritual Favorite"
        viewAllHref="/shop"
        ctaLabel="Shop Candles & Ritual"
        intro="The second thing customers stopped for: candles, holders, and objects that make a room feel like a ceremony."
      />

      {/* 5. Dark Home — Decor */}
      <HomepageProductSection
        title="Dark Home"
        products={darkHome}
        badge="Home Favorite"
        viewAllHref="/shop"
        ctaLabel="Shop Home"
        intro="Trays, teacups, and objects designed to make ordinary routines feel intentional."
      />

      {/* 6. Smutty Good Girl — new bookish collection */}
      <HomepageProductSection
        title="New Collection: Smutty Good Girl"
        products={smuttyGoodGirl}
        badge="Just Dropped"
        viewAllHref="/collections/smutty-good-girl"
        ctaLabel="Shop the Collection"
        intro="For the good girls who read bad books: dark-romance drinkware, totes, and everyday essentials with a wicked little bookish edge."
      />

      {/* 7. Summerween */}
      <HomepageProductSection
        title="Summerween"
        products={summerween}
        badge="Seasonal"
        viewAllHref="/drops"
        ctaLabel="Explore Summerween"
        intro="The sun is out. The ghosts are still here."
      />

      {/* 8. Apparel — moved lower based on conference sales data */}
      <HomepageProductSection
        title="Apparel"
        products={apparel}
        viewAllHref="/shop"
        ctaLabel="Shop Apparel"
        intro="Wearable darkness for those who dress the mood year-round."
      />

      {/* 9. Social Proof */}
      <SocialProof />

      {/* 10. Editorial/Mirror */}
      <EditorialBreak />
      <TheMirror />

      {/* 11. Membership */}
      <MembershipPitch />

      {/* 12. Journal */}
      <JournalPreview />

      {/* 13. Footer */}
      <Footer />
    </main>
  );
}
