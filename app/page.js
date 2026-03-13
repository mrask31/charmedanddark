import { Hero } from "@/components/hero";
import { CategoryPortals } from "@/components/category-portals";
import { FeaturedProducts } from "@/components/featured-products";
import { EditorialBreak } from "@/components/editorial-break";
import { TheMirror } from "@/components/the-mirror";
import { MembershipPitch } from "@/components/membership-pitch";
import { JournalPreview } from "@/components/journal-preview";
import { Footer } from "@/components/footer";

export default function Home() {
  return (
    <main className="min-h-screen bg-black">
      <Hero />
      <CategoryPortals />
      <FeaturedProducts />
      <EditorialBreak />
      <TheMirror />
      <MembershipPitch />
      <JournalPreview />
      <Footer />
    </main>
  );
}
