import { Suspense } from 'react';
import { getFeaturedProducts } from '@/lib/storefront';
import { STOREFRONT_CONFIG } from '@/lib/storefront/config';
import HeroIdentity from '@/components/home/HeroIdentity';
import SectionDivider from '@/components/home/SectionDivider';
import UniformGrid from '@/components/home/UniformGrid';
import BeliefStatement from '@/components/home/BeliefStatement';
import CategoryForms from '@/components/home/CategoryForms';
import HomeRituals from '@/components/home/HomeRituals';
import MirrorPortal from '@/components/home/MirrorPortal';

async function FeaturedUniform() {
  const products = await getFeaturedProducts(
    STOREFRONT_CONFIG.collections.apparelFeatured,
    'apparel-featured',
    STOREFRONT_CONFIG.limits.homepageApparelFeatured
  );

  if (!products.length) {
    return (
      <div className="empty-state">
        <p>Featured apparel coming soon.</p>
      </div>
    );
  }

  return <UniformGrid products={products} />;
}

async function RitualObjects() {
  const products = await getFeaturedProducts(
    STOREFRONT_CONFIG.collections.decorFeatured,
    'decor-featured',
    STOREFRONT_CONFIG.limits.homepageDecorPreview
  );

  if (!products.length) {
    return null;
  }

  return <HomeRituals products={products} />;
}

export default function HomePage() {
  return (
    <main className="homepage-identity">
      {/* HERO — Identity First */}
      <HeroIdentity />

      {/* TRANSITION LINE */}
      <SectionDivider 
        text="You don't put this on to become someone else. You put it on because you already are."
        spacing="large"
      />

      {/* THE UNIFORM — Featured Apparel */}
      <Suspense fallback={<div className="loading">Loading...</div>}>
        <FeaturedUniform />
      </Suspense>

      {/* BELIEF BLOCK */}
      <BeliefStatement />

      {/* CATEGORY SECTION */}
      <CategoryForms />

      {/* BRAND POSITIONING STRIP */}
      <SectionDivider 
        text="Charmed & Dark creates everyday pieces with a gothic edge. Designed to be worn, not performed."
        spacing="normal"
      />

      {/* HOME OBJECTS SECTION */}
      <Suspense fallback={<div className="loading">Loading...</div>}>
        <RitualObjects />
      </Suspense>

      {/* THE MIRROR — Discovery Portal */}
      <MirrorPortal />

      {/* Footer */}
      <footer className="footer-identity">
        <p className="footer-tagline">Keep what feels like you.</p>
      </footer>
    </main>
  );
}

export const metadata = {
  title: 'Charmed & Dark - Everyday Gothic Clothing',
  description: 'Not costume. Not aesthetic. Everyday pieces for people who live comfortably in darker tones. Minimal gothic apparel designed to be worn daily.',
  keywords: 'everyday gothic clothing, minimal gothic apparel, dark aesthetic clothing daily wear, gothic clothing everyday, dark clothing comfortable',
  openGraph: {
    title: 'Charmed & Dark - Made to be worn',
    description: 'Everyday pieces for people who live comfortably in darker tones',
    type: 'website',
  },
};
