import { Suspense } from 'react';
import { getFeaturedProducts } from '@/lib/storefront';
import { STOREFRONT_CONFIG } from '@/lib/storefront/config';
import Hero from '@/components/home/Hero';
import CategoryPortals from '@/components/home/CategoryPortals';
import FeaturedProducts, { FeaturedProductsStatic } from '@/components/home/FeaturedProducts';
import EditorialBreak from '@/components/home/EditorialBreak';
import TheMirror from '@/components/home/TheMirror';
import MembershipPitch from '@/components/home/MembershipPitch';
import JournalPreview from '@/components/home/JournalPreview';
import Footer from '@/components/home/Footer';

async function CuratedProducts() {
  const products = await getFeaturedProducts(
    STOREFRONT_CONFIG.collections.apparelFeatured,
    'apparel-featured',
    4
  );

  if (!products.length) {
    return <FeaturedProductsStatic />;
  }

  return <FeaturedProducts products={products} />;
}

export default function HomePage() {
  return (
    <main className="bg-black">
      {/* 1. Hero - Full viewport height */}
      <Hero />

      {/* 2. Category Portals - Two large image blocks */}
      <CategoryPortals />

      {/* 3. Featured Products - Curated Selections */}
      <Suspense fallback={<FeaturedProductsStatic />}>
        <CuratedProducts />
      </Suspense>

      {/* 4. Editorial Image Break */}
      <EditorialBreak />

      {/* 5. The Mirror - Interactive mood module */}
      <TheMirror />

      {/* 6. Membership Pitch - Split layout */}
      <MembershipPitch />

      {/* 7. Journal Preview */}
      <JournalPreview />

      {/* 8. Footer */}
      <Footer />
    </main>
  );
}

export const metadata = {
  title: 'Charmed & Dark - The Sanctuary',
  description: 'Elegant gothic goods for the life you actually live. Premium gothic apparel and home decor for those who live comfortably in darker tones.',
  keywords: 'gothic apparel, gothic home decor, dark aesthetic, luxury gothic, everyday gothic clothing, gothic lifestyle',
  openGraph: {
    title: 'Charmed & Dark - The Sanctuary',
    description: 'Elegant gothic goods for the life you actually live.',
    type: 'website',
  },
};
