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

// Kiss Lock Bags — convention validated and strongest online bag intent
const KISS_LOCK_BAG_HANDLES = [
  'ghost-cat-pumpkin-kiss-lock-bag',
  'celestial-dragon-kiss-lock-bag-in-linen-cotton-blend',
  'celestial-kisslock-bag-in-linen-blended-fabric',
  'moon-moth-vintage-kiss-lock-bag-in-linen-blended-material',
  'desert-moon-cowgirl-kiss-lock-bag',
];

// Summerween — still relevant, now merchandised below bags
const SUMMERWEEN_HANDLES = [
  'camp-charmed-and-dark-unisex-ringer-tee',
  'salty-spells-sunset-sins-womens-boxy-tee-1',
  'summerween-trucker-snapback-hat',
  'hexes-heat-unisex-summer-tee-1',
  'summerween-fourth-of-july-halloween-shirt',
  'summerween-womens-flowy-scoop-muscle-tank-1',
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
  const [bagProducts, summerweenProducts] = await Promise.all([
    fetchProductsByHandles(KISS_LOCK_BAG_HANDLES),
    fetchProductsByHandles(SUMMERWEEN_HANDLES),
  ]);

  return (
    <main className="min-h-screen bg-black">
      <Hero />
      <BrandPositioning />
      <HomepageProductSection
        title="Kiss Lock Bags"
        products={bagProducts}
        badge="Bag Favorite"
        viewAllHref="/collections/kiss-lock-bags"
        ctaLabel="Shop Bags"
        intro="One bag. Full look. These are the pieces shoppers kept choosing one at a time."
        footerNote="Start with the bag. Let everything else orbit around it."
      />
      <HomepageProductSection
        title="Summerween Favorites"
        products={summerweenProducts}
        badge="Summerween Favorite"
        viewAllHref="/drops"
        ctaLabel="Explore Summerween"
        intro="Seasonal pieces stay in the mix, now merchandised below the bags."
      />
      <CategoryPortals />
      <SocialProof />
      <EditorialBreak />
      <TheMirror />
      <MembershipPitch />
      <JournalPreview />
      <Footer />
    </main>
  );
}