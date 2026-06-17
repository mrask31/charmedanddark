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

// Summerween Favorites — products showing seasonal buying intent
const SUMMERWEEN_HANDLES = [
  'summerween-trucker-snapback-hat',
  'summerween-fourth-of-july-halloween-shirt',
  'hexes-heat-unisex-summer-tee-1',
  'summerween-womens-flowy-scoop-muscle-tank-1',
];

// Best Sellers — highest conversion products from PostHog data
const BESTSELLER_HANDLES = [
  'summerween-trucker-snapback-hat',
  'celestial-kisslock-bag-in-linen-blended-fabric',
  'hexes-heat-unisex-summer-tee-1',
  'victorian-tray',
  'gothic-striped-bat-wing-halloween-teacup',
];

async function fetchProductsByHandles(handles) {
  try {
    const { data } = await supabase
      .from('products')
      .select('name, title, handle, slug, price, sale_price, image_url, image_urls, images')
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
  const [summerweenProducts, bestsellerProducts] = await Promise.all([
    fetchProductsByHandles(SUMMERWEEN_HANDLES),
    fetchProductsByHandles(BESTSELLER_HANDLES),
  ]);

  return (
    <main className="min-h-screen bg-black">
      <Hero />
      <BrandPositioning />
      <HomepageProductSection
        title="Summerween Favorites"
        products={summerweenProducts}
        badge="Summerween Favorite"
      />
      <HomepageProductSection
        title="Best Sellers"
        products={bestsellerProducts}
        badge="Best Seller"
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
