import { Hero } from "@/components/hero";
import { CategoryPortals } from "@/components/category-portals";
import { FeaturedProducts } from "@/components/featured-products";
import { EditorialBreak } from "@/components/editorial-break";
import { TheMirror } from "@/components/the-mirror";
import { MembershipPitch } from "@/components/membership-pitch";
import { JournalPreview } from "@/components/journal-preview";
import { Footer } from "@/components/footer";
import { supabase } from "@/lib/supabase/client";

const FEATURED_HANDLES = [
  'graveyard-ballerina-crop-tee',
  'till-death-unisex-tee',
  'the-charmed-dark-signature-hoodie',
  'the-charmed-dark-cuffed-beanie-embroidered-gothic-streetwear-essential',
];

export default async function Home() {
  let featuredProducts = [];

  try {
    const { data } = await supabase
      .from('products')
      .select('name, title, handle, slug, price, sale_price, image_url, image_urls, images')
      .in('handle', FEATURED_HANDLES)
      .eq('hidden', false);

    featuredProducts = data || [];
  } catch (err) {
    console.error('Failed to fetch featured products:', err);
  }

  return (
    <main className="min-h-screen bg-black">
      <Hero />
      <CategoryPortals />
      <FeaturedProducts products={featuredProducts} />
      <EditorialBreak />
      <TheMirror />
      <MembershipPitch />
      <JournalPreview />
      <Footer />
    </main>
  );
}
